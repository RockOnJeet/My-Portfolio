import { getSpotifyConsolePayload } from "./index";
import type { SpotifyConsolePayload } from "./types";

type EnvVars = Record<string, string | undefined>;

export interface SpotifyConsoleSuccessResult {
  success: true;
  payload: SpotifyConsolePayload;
}

export interface SpotifyConsoleErrorResult {
  success: false;
  error: string;
}

export type SpotifyConsoleResult = SpotifyConsoleSuccessResult | SpotifyConsoleErrorResult;

export interface SpotifyLoadingEventData {
  success: false;
  kind: "loading";
  error: string;
}

export interface SpotifyErrorEventData {
  success: false;
  kind: "error";
  error: string;
}

export type SpotifyStreamData = SpotifyConsoleResult | SpotifyLoadingEventData | SpotifyErrorEventData;

type SpotifyEventName = "snapshot" | "update" | "status";

export interface SpotifyStreamEvent {
  event: SpotifyEventName;
  data: SpotifyStreamData;
}

type Subscriber = (event: SpotifyStreamEvent) => void;

const POLL_INTERVAL_MS = 2500;
const ERROR_RETRY_MS = 5000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSpotifyConsolePayload(value: unknown): value is SpotifyConsolePayload {
  return isRecord(value) && "playbackData" in value && "queueData" in value;
}

function getPlaybackFingerprint(playbackData: unknown): Record<string, unknown> {
  if (!isRecord(playbackData)) {
    return {};
  }

  const item = isRecord(playbackData.item) ? playbackData.item : null;
  const device = isRecord(playbackData.device) ? playbackData.device : null;
  const context = isRecord(playbackData.context) ? playbackData.context : null;

  return {
    itemId: item && typeof item.id === "string" ? item.id : null,
    progressMs: typeof playbackData.progress_ms === "number" ? playbackData.progress_ms : null,
    isPlaying: playbackData.is_playing === true,
    timestamp: typeof playbackData.timestamp === "number" ? playbackData.timestamp : null,
    deviceId: device && typeof device.id === "string" ? device.id : null,
    shuffleState: playbackData.shuffle_state === true,
    repeatState: typeof playbackData.repeat_state === "string" ? playbackData.repeat_state : null,
    contextUri: context && typeof context.uri === "string" ? context.uri : null,
  };
}

function getQueueFingerprint(queueData: unknown): Record<string, unknown> {
  if (!isRecord(queueData)) {
    return {};
  }

  const queue = Array.isArray(queueData.queue) ? queueData.queue : [];
  const currentlyPlaying = isRecord(queueData.currently_playing) ? queueData.currently_playing : null;

  return {
    currentlyPlayingId: currentlyPlaying && typeof currentlyPlaying.id === "string" ? currentlyPlaying.id : null,
    queueIds: queue.map((entry) => (isRecord(entry) && typeof entry.id === "string" ? entry.id : null)),
  };
}

function buildFingerprint(payload: SpotifyConsolePayload) {
  return JSON.stringify({
    playback: getPlaybackFingerprint(payload.playbackData),
    queue: getQueueFingerprint(payload.queueData),
  });
}

class SpotifyCoordinator {
  private latestResult: SpotifyConsoleSuccessResult | null = null;
  private latestFingerprint: string | null = null;
  private latestError: string | null = null;
  private env: EnvVars | null = null;
  private subscribers = new Set<Subscriber>();
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private refreshing: Promise<void> | null = null;

  private setEnv(env?: EnvVars) {
    if (env) {
      this.env = env;
    }
  }

  private emit(event: SpotifyStreamEvent) {
    for (const subscriber of this.subscribers) {
      try {
        subscriber(event);
      } catch {
        // One bad subscriber must not break the rest.
      }
    }
  }

  private clearTimer() {
    if (this.pollTimer !== null) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private schedulePoll(delayMs: number) {
    this.clearTimer();

    if (this.subscribers.size === 0) {
      return;
    }

    this.pollTimer = setTimeout(() => {
      void this.runPollingCycle();
    }, delayMs);
  }

  private async refreshOnce(): Promise<void> {
    const env = this.env;
    if (!env) {
      throw new Error("Spotify environment is not configured.");
    }

    const payload = await getSpotifyConsolePayload(env);
    if (!isSpotifyConsolePayload(payload)) {
      throw new Error("Spotify snapshot returned an unexpected payload.");
    }

    const nextResult: SpotifyConsoleSuccessResult = {
      success: true,
      payload,
    };

    const nextFingerprint = buildFingerprint(payload);
    const eventName = this.latestFingerprint === null ? "snapshot" : "update";

    this.latestResult = nextResult;
    this.latestFingerprint = nextFingerprint;
    this.latestError = null;

    if (this.subscribers.size > 0) {
      this.emit({
        event: eventName,
        data: nextResult,
      });
    }
  }

  private async runPollingCycle(): Promise<void> {
    if (this.refreshing) {
      return this.refreshing;
    }

    if (this.subscribers.size === 0) {
      return;
    }

    this.refreshing = (async () => {
      try {
        await this.refreshOnce();
        if (this.subscribers.size > 0) {
          this.schedulePoll(POLL_INTERVAL_MS);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown Spotify error";
        this.latestError = message;

        if (!this.latestResult && this.subscribers.size > 0) {
          this.emit({
            event: "status",
            data: {
              success: false,
              kind: "error",
              error: message,
            },
          });
        }

        if (this.subscribers.size > 0) {
          this.schedulePoll(ERROR_RETRY_MS);
        }
      } finally {
        this.refreshing = null;
      }
    })();

    return this.refreshing;
  }

  public async getSnapshot(env?: EnvVars): Promise<SpotifyConsoleResult> {
    this.setEnv(env);

    if (this.latestResult) {
      return this.latestResult;
    }

    try {
      await this.refreshOnce();
    } catch (error) {
      const message = error instanceof Error ? error.message : this.latestError ?? "Unable to fetch Spotify snapshot.";
      return {
        success: false,
        error: message,
      };
    }

    return this.latestResult ?? {
      success: false,
      error: this.latestError ?? "Unable to fetch Spotify snapshot.",
    };
  }

  public subscribe(env: EnvVars | undefined, subscriber: Subscriber) {
    this.setEnv(env);
    this.subscribers.add(subscriber);

    if (this.latestResult) {
      subscriber({
        event: "snapshot",
        data: this.latestResult,
      });
    } else {
      subscriber({
        event: "status",
        data: {
          success: false,
          kind: "loading",
          error: "Spotify snapshot is loading.",
        },
      });
    }

    if (!this.pollTimer && !this.refreshing) {
      this.schedulePoll(0);
    }

    return () => {
      this.subscribers.delete(subscriber);
      if (this.subscribers.size === 0) {
        this.clearTimer();
      }
    };
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __spotifyCoordinator: SpotifyCoordinator | undefined;
}

export function getSpotifyCoordinator() {
  if (!globalThis.__spotifyCoordinator) {
    globalThis.__spotifyCoordinator = new SpotifyCoordinator();
  }

  return globalThis.__spotifyCoordinator;
}
