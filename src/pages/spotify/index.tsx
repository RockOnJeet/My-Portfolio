import { useEffect, useRef, useState, type ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  List,
  Music,
  Play,
  Pause,
  Palette,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Smartphone,
  X,
} from "lucide-react";
import { FaSpotify } from "react-icons/fa";

const QUEUE_SONGS = [
  { title: "Saadi Galli Aaja", artist: "Ayushmann Khurrana, Neeti Mohan", duration: "4:13", current: true },
  { title: "Paani Da Rang", artist: "Ayushmann Khurrana", duration: "4:01", current: false },
  { title: "Pani Da Rang (Reprise)", artist: "Ayushmann Khurrana", duration: "3:42", current: false },
  { title: "Mitti Di Khushboo", artist: "Ayushmann Khurrana", duration: "3:58", current: false },
  { title: "O Heeriye", artist: "Ayushmann Khurrana, Jasleen Royal", duration: "4:22", current: false },
  { title: "Yahin Hoon Main", artist: "Ayushmann Khurrana", duration: "4:45", current: false },
  { title: "Nazm Nazm", artist: "Ayushmann Khurrana", duration: "4:10", current: false },
  { title: "Teri Aankhon Mein", artist: "Ayushmann Khurrana, Taapsee Pannu", duration: "3:55", current: false },
  { title: "Bewajah", artist: "Ayushmann Khurrana", duration: "4:07", current: false },
  { title: "Dil Ko Karaar Aaya", artist: "Ayushmann Khurrana, Nikhita Gandhi", duration: "4:18", current: false },
];

const EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
const DURATION = "340ms";
const TRANSITION = `${DURATION} ${EASING}`;
const QUEUE_PANEL_ID = "spotify-queue-panel";
const QUEUE_HEADING_ID = "spotify-queue-heading";
const SPOTIFY_BACKEND_ORIGIN = "https://rockonjeet.pages.dev";
const SPOTIFY_CONSOLE_URL = `${SPOTIFY_BACKEND_ORIGIN}/api/spotify/console/`;
const SPOTIFY_SUBSCRIBE_URL = `${SPOTIFY_BACKEND_ORIGIN}/api/spotify/subscribe/`;

type Song = (typeof QUEUE_SONGS)[number];
type QueueItem = Song & { imageUrl: string | null; trackUrl?: string | null };

interface SpotifyConsolePayload {
  playbackData: unknown;
  queueData: unknown;
}

interface SpotifyConsoleErrorResult {
  success: false;
  error: string;
}

interface SpotifyConsoleSuccessResult {
  success: true;
  payload: SpotifyConsolePayload;
}

type SpotifyConsoleResult = SpotifyConsoleErrorResult | SpotifyConsoleSuccessResult;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSpotifyConsolePayload(value: unknown): value is SpotifyConsolePayload {
  return (
    isRecord(value) &&
    "playbackData" in value &&
    "queueData" in value
  );
}

function isSpotifyConsoleSuccessResult(value: unknown): value is SpotifyConsoleSuccessResult {
  return (
    isRecord(value) &&
    value.success === true &&
    isSpotifyConsolePayload(value.payload)
  );
}

function isSpotifyConsoleErrorResult(value: unknown): value is SpotifyConsoleErrorResult {
  return (
    isRecord(value) &&
    value.success === false &&
    typeof value.error === "string"
  );
}

function isSpotifyConsoleResult(value: unknown): value is SpotifyConsoleResult {
  return isSpotifyConsoleSuccessResult(value) || isSpotifyConsoleErrorResult(value);
}

function isSpotifyErrorPayload(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.error === "string"
  );
}

function hasSpotifyPlaybackItem(value: unknown): boolean {
  return (
    isRecord(value) &&
    "item" in value &&
    isRecord(value.item)
  );
}

function getSpotifyTrackTitle(track: unknown): string {
  if (isRecord(track) && typeof track.name === "string") return track.name;
  return "Unknown track";
}

function getSpotifyTrackUrl(track: unknown): string | null {
  if (!isRecord(track)) return null;

  if (isRecord(track.external_urls) && typeof track.external_urls.spotify === "string") {
    return track.external_urls.spotify;
  }

  if (typeof track.uri === "string" && track.uri.startsWith("spotify:")) {
    const parts = track.uri.split(":");
    if (parts.length >= 3 && parts[1] === "track") {
      return `https://open.spotify.com/track/${parts[2]}`;
    }
  }

  return null;
}

function getSpotifyTrackArtists(track: unknown): string {
  if (!isRecord(track) || !Array.isArray(track.artists)) return "Unknown artist";
  return track.artists
    .map((artist) => (isRecord(artist) && typeof artist.name === "string" ? artist.name : ""))
    .filter(Boolean)
    .join(", ") || "Unknown artist";
}

function getSpotifyTrackDurationMs(track: unknown): number | null {
  return isRecord(track) && typeof track.duration_ms === "number" ? track.duration_ms : null;
}

function getSpotifyQueueItems(value: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  if (!isRecord(value) || !Array.isArray(value.queue)) return [];
  return value.queue.filter(isRecord);
}

function getSpotifyQueueNowPlaying(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value) || !isRecord(value.currently_playing)) return null;
  return value.currently_playing;
}

function getSpotifyActionDisallows(playbackData: unknown): Record<string, boolean> {
  if (!isRecord(playbackData) || !isRecord(playbackData.actions) || !isRecord(playbackData.actions.disallows)) {
    return {};
  }

  return Object.entries(playbackData.actions.disallows).reduce<Record<string, boolean>>((accumulator, [key, value]) => {
    if (typeof value === "boolean") {
      accumulator[key] = value;
    }
    return accumulator;
  }, {});
}

function getSpotifyTrackImage(track: unknown, preferredWidth = 320): string | null {
  if (!isRecord(track)) return null;
  const album = (track as Record<string, unknown>).album;
  if (!isRecord(album) || !Array.isArray(album.images)) return null;

  const images = album.images.filter(isRecord);
  if (!images.length) return null;

  let bestImage = images[0];
  let bestDiff = Math.abs((typeof bestImage.width === "number" ? bestImage.width : preferredWidth) - preferredWidth);

  for (const image of images) {
    const width = typeof image.width === "number" ? image.width : preferredWidth;
    const diff = Math.abs(width - preferredWidth);
    if (diff < bestDiff) {
      bestImage = image;
      bestDiff = diff;
    }
  }

  return typeof bestImage.url === "string" ? bestImage.url : null;
}

function getSpotifySmallestTrackImage(track: unknown): string | null {
  if (!isRecord(track)) return null;
  const album = (track as Record<string, unknown>).album;
  if (!isRecord(album) || !Array.isArray(album.images)) return null;

  const images = album.images.filter(isRecord);
  if (!images.length) return null;

  let smallestImage = images[0];
  let smallestWidth = typeof smallestImage.width === "number" ? smallestImage.width : Number.POSITIVE_INFINITY;

  for (const image of images) {
    const width = typeof image.width === "number" ? image.width : Number.POSITIVE_INFINITY;
    if (width < smallestWidth) {
      smallestImage = image;
      smallestWidth = width;
    }
  }

  return typeof smallestImage.url === "string" ? smallestImage.url : null;
}

function getSpotifyAlbumName(track: unknown): string {
  if (!isRecord(track)) return "Unknown album";
  const album = (track as Record<string, unknown>).album;
  if (!isRecord(album) || typeof album.name !== "string") return "Unknown album";
  return album.name;
}

function getSpotifyContextName(playbackData: unknown): string {
  if (!isRecord(playbackData)) return "What he plays";
  const context = playbackData.context;
  if (isRecord(context)) {
    if (typeof context.name === "string" && context.name.trim()) {
      return context.name;
    }
    const metadata = isRecord(context.metadata) ? context.metadata : undefined;
    if (metadata && typeof metadata.name === "string" && metadata.name.trim()) {
      return metadata.name;
    }
    if (metadata && typeof metadata.title === "string" && metadata.title.trim()) {
      return metadata.title;
    }
    if (typeof context.uri === "string") {
      const parts = context.uri.split(":");
      if (parts.length > 1) {
        let value = parts.slice(-1)[0];
        try {
          if (/%/.test(value)) {
            value = decodeURIComponent(value);
          }
        } catch {
          // ignore decode errors
        }
        // If this looks like a spotify id (22 alnum chars), skip and try external url below
        if (!/^[A-Za-z0-9]{22}$/.test(value)) {
          return value.replace(/-/g, " ") || "What he plays";
        }
      }
    }

    if (isRecord(context.external_urls) && typeof context.external_urls.spotify === "string") {
      try {
        const u = new URL(context.external_urls.spotify);
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts.length) {
          let last = parts.slice(-1)[0];
          try {
            if (/%/.test(last)) last = decodeURIComponent(last);
          } catch { }
          if (!/^[A-Za-z0-9]{22}$/.test(last)) {
            return last.replace(/-/g, " ") || "What he plays";
          }
        }
      } catch {
        // ignore
      }
    }
  }

  const item = isRecord(playbackData.item) ? playbackData.item : null;
  if (item && isRecord(item.album) && typeof item.album.name === "string") {
    return item.album.name;
  }

  return "What he plays";
}

function getSpotifyDeviceName(playbackData: unknown): string {
  if (!isRecord(playbackData)) return "Unknown device";
  const device = playbackData.device;
  if (isRecord(device)) {
    if (typeof device.name === "string" && device.name.trim()) {
      return device.name;
    }
    if (typeof device.type === "string" && device.type.trim()) {
      return device.type;
    }
  }
  return "Unknown device";
}

function formatTime(ms: number | null): string {
  if (ms === null || ms < 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function LoadingScreen({ error }: { error?: string }) {
  const title = error ? "Error" : "Spotify";
  const message = error
    ? "An error has occurred. Please try again later."
    : "Loading your music moment...";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#05060a",
        color: "#f8fafc",
        padding: 24,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 320, width: "100%" }}>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }`}</style>
        <FaSpotify
          size={64}
          color="#1DB954"
          style={{ display: "block", margin: "0 auto 18px" }}
        />
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            marginTop: 10,
            fontSize: 14,
            color: "#94a3b8",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>
        {!error && (
          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#1DB954",
                  opacity: 0.35,
                  animation: "pulse 1.2s ease-in-out infinite",
                  animationDelay: `${index * 120}ms`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DisabledBtn({ children, title }: { children: ReactNode; title: string }) {
  return (
    <button
      disabled
      title={`${title} (disabled)`}
      style={{
        background: "none",
        border: "none",
        cursor: "not-allowed",
        padding: 4,
        opacity: 0.28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}

function QueueRow({ song, imageDataUrl }: { song: QueueItem; imageDataUrl: string | null }) {
  return (
    <div
      role="listitem"
      tabIndex={song.trackUrl ? 0 : undefined}
      onClick={() => {
        if (song.trackUrl) {
          window.open(song.trackUrl, "_blank", "noopener,noreferrer");
        }
      }}
      onKeyDown={(event) => {
        if (!song.trackUrl) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          window.open(song.trackUrl, "_blank", "noopener,noreferrer");
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 12px",
        borderRadius: 8,
        margin: "0 8px",
        background: song.current ? "rgba(255,255,255,0.04)" : "transparent",
        cursor: song.trackUrl ? "pointer" : "default",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: 6,
          overflow: "hidden",
          background: "linear-gradient(135deg, var(--spotify-green) 0%, #0b7f3d 50%, var(--bg-dark-900) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        {imageDataUrl ? (
          <img
            src={imageDataUrl}
            alt="Queue artwork"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : song.current ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              color: "var(--muted-100)",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.16em",
            }}
          >
            SP
          </div>
        ) : (
          <Music size={15} color="var(--muted-300)" />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: song.current ? 700 : 500,
            color: song.current ? "var(--spotify-green)" : "var(--muted-500)",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {song.trackUrl ? (
            <a
              href={song.trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: song.current ? "var(--spotify-green)" : "var(--muted-500)",
                textDecoration: "none",
              }}
            >
              {song.title}
            </a>
          ) : (
            song.title
          )}
        </p>
        <p
          style={{
            fontSize: 11,
            color: "var(--muted-400)",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {song.artist}
        </p>
      </div>
      <span style={{ fontSize: 11, color: "var(--muted-300)", flexShrink: 0 }}>{song.duration}</span>
    </div>
  );
}

export default function Spotify() {
  const [queueOpen, setQueueOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [spotifyPayload, setSpotifyPayload] = useState<SpotifyConsolePayload | null>(null);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [spotifyLoading, setSpotifyLoading] = useState(true);
  const [playbackTick, setPlaybackTick] = useState<{ progressMs: number; timestamp: number } | null>(null);
  const [lastKnownPlaybackTrack, setLastKnownPlaybackTrack] = useState<Record<string, unknown> | null>(null);
  const [lastKnownPlaybackTick, setLastKnownPlaybackTick] = useState<{ progressMs: number; timestamp: number } | null>(null);
  const [renderTick, setRenderTick] = useState(0);
  const [trackImageDataUrl, setTrackImageDataUrl] = useState<string | null>(null);
  const artworkCacheRef = useRef<Map<string, string | null>>(new Map());
  const artworkPendingRef = useRef<Set<string>>(new Set());

  const { toast } = useToast();
  const spotifyErrorToastId = useRef<string | null>(null);

  const playbackData = spotifyPayload?.playbackData;
  const queueData = spotifyPayload?.queueData;
  const playbackTrack = hasSpotifyPlaybackItem(playbackData)
    ? (playbackData as Record<string, unknown>).item
    : getSpotifyQueueNowPlaying(queueData);
  const displayPlaybackTrack = playbackTrack ?? lastKnownPlaybackTrack;
  const playbackTitle = getSpotifyTrackTitle(displayPlaybackTrack);
  const playbackTrackUrl = getSpotifyTrackUrl(displayPlaybackTrack);
  const playbackArtist = getSpotifyTrackArtists(displayPlaybackTrack);
  const playbackDurationMs = getSpotifyTrackDurationMs(displayPlaybackTrack);
  const playbackProgressMs =
    isRecord(playbackData) && typeof playbackData.progress_ms === "number"
      ? playbackData.progress_ms
      : 0;
  const activePlaybackTick = playbackTick ?? lastKnownPlaybackTick;

  const isPlaying = isRecord(playbackData) && playbackData.is_playing === true;
  const currentProgressMs = playbackDurationMs
    ? Math.min(
      playbackDurationMs,
      (activePlaybackTick?.progressMs ?? playbackProgressMs) + (isPlaying ? Date.now() - (activePlaybackTick?.timestamp ?? Date.now()) : 0)
    )
    : 0;
  const playbackProgressPercent = playbackDurationMs
    ? Math.min(100, Math.max(0, Math.round((currentProgressMs / playbackDurationMs) * 100)))
    : 0;

  const playbackDisallows = getSpotifyActionDisallows(playbackData);
  const shuffleDisabled = playbackDisallows.shuffling === true;
  const previousDisabled = playbackDisallows.skipping_prev === true;
  const playDisabled = isPlaying || playbackDisallows.resuming === true;
  const nextDisabled = playbackDisallows.skipping_next === true;
  const repeatDisabled = playbackDisallows.toggling_repeat_context === true || playbackDisallows.toggling_repeat_track === true;

  const shuffleActive = isRecord(playbackData) && (playbackData as Record<string, unknown>).shuffle_state === true;
  const repeatState = isRecord(playbackData) && typeof (playbackData as Record<string, unknown>).repeat_state === "string" ? (playbackData as Record<string, unknown>).repeat_state as string : "off";
  const repeatActive = repeatState !== "off";

  const queueItems = getSpotifyQueueItems(queueData).map((entry): QueueItem => {
    const track = isRecord(entry.track) ? entry.track : entry;
    return {
      imageUrl: getSpotifySmallestTrackImage(track),
      title: getSpotifyTrackTitle(track),
      artist: getSpotifyTrackArtists(track),
      duration: formatTime(getSpotifyTrackDurationMs(track)),
      current: false,
      trackUrl: getSpotifyTrackUrl(track),
    };
  });

  const albumImageUrl = getSpotifyTrackImage(displayPlaybackTrack, 320);
  const albumName = getSpotifyAlbumName(displayPlaybackTrack);
  const playlistName = getSpotifyContextName(playbackData);
  const deviceName = getSpotifyDeviceName(playbackData);

  const noSongPlaying =
    !spotifyLoading &&
    !displayPlaybackTrack;

  const queuePanelRef = useRef<HTMLDivElement>(null);
  const queueBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.title = "Spotify - What he plays";
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    let canceled = false;
    let eventSource: EventSource | null = null;

    const applyResult = (result: SpotifyConsoleResult) => {
      if (canceled) return;

      if (!result.success) {
        setSpotifyError(result.error);
        setSpotifyPayload(null);
        setPlaybackTick(null);
        setSpotifyLoading(false);
        return;
      }

      setSpotifyPayload(result.payload);
      setSpotifyError(null);
      setSpotifyLoading(false);

      const playback = result.payload.playbackData;
      if (hasSpotifyPlaybackItem(playback) && isRecord(playback) && typeof playback.progress_ms === "number") {
        const nextTick = { progressMs: playback.progress_ms, timestamp: Date.now() };
        setPlaybackTick(nextTick);
        setLastKnownPlaybackTick(nextTick);
      } else {
        setPlaybackTick(null);
      }

      if (hasSpotifyPlaybackItem(playback) && isRecord((playback as Record<string, unknown>).item)) {
        setLastKnownPlaybackTrack((playback as Record<string, unknown>).item as Record<string, unknown>);
      }
    };

    const fetchSnapshotFallback = async () => {
      try {
        const response = await fetch(SPOTIFY_CONSOLE_URL);
        const rawResult = await response.json();

        if (canceled) return;

        if (!response.ok) {
          setSpotifyError(`Spotify snapshot request failed with ${response.status}`);
          setSpotifyPayload(null);
          setSpotifyLoading(false);
          return;
        }

        if (!isSpotifyConsoleResult(rawResult)) {
          setSpotifyError("Spotify snapshot endpoint returned an unexpected payload format.");
          setSpotifyPayload(null);
          setSpotifyLoading(false);
          return;
        }

        applyResult(rawResult);
      } catch (error) {
        if (canceled) return;
        setSpotifyPayload(null);
        setSpotifyError(error instanceof Error ? error.message : "Unable to load Spotify data");
        setPlaybackTick(null);
        setSpotifyLoading(false);
      }
    };

    fetchSnapshotFallback();

    try {
      eventSource = new EventSource(SPOTIFY_SUBSCRIBE_URL);

      const handleStreamEvent = (event: Event) => {
        if (!(event instanceof MessageEvent)) return;

        try {
          const parsed = JSON.parse(String(event.data)) as unknown;
          if (isSpotifyConsoleResult(parsed)) {
            applyResult(parsed);
            return;
          }

          if (
            isRecord(parsed) &&
            parsed.success === false &&
            parsed.kind === "error" &&
            typeof parsed.error === "string"
          ) {
            setSpotifyError(parsed.error);
            setSpotifyLoading(false);
          }
        } catch {
          // Ignore malformed SSE payloads and rely on the snapshot fallback.
        }
      };

      eventSource.addEventListener("snapshot", handleStreamEvent);
      eventSource.addEventListener("update", handleStreamEvent);
      eventSource.addEventListener("status", handleStreamEvent);
    } catch {
      // If EventSource is unavailable, the snapshot fallback still works.
    }

    return () => {
      canceled = true;
      eventSource?.close();
    };
  }, []);

  useEffect(() => {
    if (isRecord(playbackTrack)) {
      setLastKnownPlaybackTrack(playbackTrack);
    }
  }, [playbackTrack]);

  useEffect(() => {
    if (playbackTick) {
      setLastKnownPlaybackTick(playbackTick);
    }
  }, [playbackTick]);

  useEffect(() => {
    const timer = window.setInterval(() => setRenderTick((tick) => tick + 1), 250);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let canceled = false;
    const controller = new AbortController();

    async function loadTrackImage() {
      if (!albumImageUrl) {
        setTrackImageDataUrl(null);
        return;
      }

      const cached = artworkCacheRef.current.get(albumImageUrl);
      if (cached !== undefined) {
        setTrackImageDataUrl(cached);
        return;
      }

      if (artworkPendingRef.current.has(albumImageUrl)) {
        return;
      }

      artworkPendingRef.current.add(albumImageUrl);

      try {
        // Use backend proxy to avoid CSP connect-src blocking on Spotify CDN
        const proxyUrl = `/api/spotify/artwork?url=${encodeURIComponent(albumImageUrl)}`;
        const response = await fetch(proxyUrl, { signal: controller.signal });
        if (!response.ok) {
          artworkCacheRef.current.set(albumImageUrl, null);
          setTrackImageDataUrl(null);
          return;
        }

        const json = await response.json();
        if (canceled) return;
        if (json && json.success === true && typeof json.dataUrl === "string") {
          artworkCacheRef.current.set(albumImageUrl, json.dataUrl);
          setTrackImageDataUrl(json.dataUrl);
        } else {
          artworkCacheRef.current.set(albumImageUrl, null);
          setTrackImageDataUrl(null);
        }
      } catch {
        if (canceled) return;
        artworkCacheRef.current.set(albumImageUrl, null);
        setTrackImageDataUrl(null);
      } finally {
        artworkPendingRef.current.delete(albumImageUrl);
      }
    }

    loadTrackImage();

    return () => {
      canceled = true;
      controller.abort();
    };
  }, [albumImageUrl]);

  useEffect(() => {
    const urlsToPrefetch = [albumImageUrl, ...queueItems.map((item) => item.imageUrl)].filter(
      (url): url is string => Boolean(url)
    );

    if (!urlsToPrefetch.length) return;

    let canceled = false;

    async function prefetchArtwork(url: string) {
      if (artworkCacheRef.current.has(url)) return;
      if (artworkPendingRef.current.has(url)) return;

      artworkPendingRef.current.add(url);

      try {
        const response = await fetch(`/api/spotify/artwork?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
          artworkCacheRef.current.set(url, null);
          return;
        }

        const json = await response.json();
        if (canceled) return;
        if (json && json.success === true && typeof json.dataUrl === "string") {
          artworkCacheRef.current.set(url, json.dataUrl);
        } else {
          artworkCacheRef.current.set(url, null);
        }
      } catch {
        if (canceled) return;
        artworkCacheRef.current.set(url, null);
      } finally {
        artworkPendingRef.current.delete(url);
      }
    }

    void Promise.all(urlsToPrefetch.map((url) => prefetchArtwork(url)));

    return () => {
      canceled = true;
    };
  }, [albumImageUrl, queueItems]);

  useEffect(() => {
    if (!spotifyError || spotifyErrorToastId.current) return;

    const toastInstance = toast({
      title: "Spotify error",
      description: spotifyError,
      variant: "destructive",
      duration: 5000,
    });

    spotifyErrorToastId.current = toastInstance.id;

    return () => {
      if (toastInstance.id === spotifyErrorToastId.current) {
        spotifyErrorToastId.current = null;
      }
    };
  }, [spotifyError, toast]);

  useEffect(() => {
    if (!queueOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        queuePanelRef.current?.contains(event.target as Node) ||
        queueBtnRef.current?.contains(event.target as Node)
      ) {
        return;
      }

      setQueueOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Esc") {
        setQueueOpen(false);
        queueBtnRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [queueOpen]);

  const showInitialLoading = spotifyLoading && spotifyPayload === null;
  const showErrorScreen = !spotifyLoading && spotifyError && spotifyPayload === null;

  if (showInitialLoading) {
    return <LoadingScreen />;
  }

  if (showErrorScreen) {
    return <LoadingScreen error={spotifyError} />;
  }

  const queueW = 360;
  const queueH = 420;

  return (
    <div
      style={{
        background:
          "radial-gradient(circle at top left, rgba(29,185,84,0.16), transparent 30%), radial-gradient(circle at 85% 15%, rgba(255,255,255,0.06), transparent 18%), linear-gradient(135deg, var(--bg-dark-900) 0%, var(--bg-dark-800) 45%, var(--bg-dark-700) 100%)",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        overflow: "hidden",
      }}
    >
      <aside
        ref={queuePanelRef}
        id={QUEUE_PANEL_ID}
        aria-labelledby={QUEUE_HEADING_ID}
        aria-hidden={!queueOpen}
        role="complementary"
        style={{
          order: isMobile ? 1 : 2,
          flexShrink: 0,
          overflow: "hidden",
          background: "rgba(255,255,255,0.03)",
          display: "flex",
          flexDirection: "column",
          ...(isMobile
            ? {
              maxHeight: queueOpen ? `${queueH}px` : "0px",
              width: "100%",
              transition: `max-height ${TRANSITION}`,
            }
            : {
              width: queueOpen ? `${queueW}px` : "0px",
              height: "100vh",
              transition: `width ${TRANSITION}`,
              borderLeft: queueOpen ? "1px solid rgba(255,255,255,0.08)" : "none",
            }),
        }}
      >
        <div
          style={{
            width: isMobile ? "100%" : `${queueW}px`,
            height: isMobile ? `${queueH}px` : "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px 8px",
            }}
          >
            <h2 id={QUEUE_HEADING_ID} style={{ fontSize: 15, fontWeight: 700, color: "var(--muted-100)", margin: 0 }}>
              Queue
            </h2>
            <button
              onClick={() => setQueueOpen(false)}
              aria-label="Close queue"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                borderRadius: 4,
                opacity: 0.6,
                transition: `opacity ${TRANSITION}`,
              }}
              onMouseEnter={(event) => (event.currentTarget.style.opacity = "1")}
              onMouseLeave={(event) => (event.currentTarget.style.opacity = "0.6")}
            >
              <X size={16} color="var(--muted-500)" />
            </button>
          </div>

          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--muted-400)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "4px 20px 8px",
              margin: 0,
            }}
          >
            Now playing
          </p>

          <div style={{ overflowY: "auto", flex: 1, paddingBottom: 12 }}>
            {playbackTrack ? (
              <QueueRow
                key="current"
                song={{
                  title: playbackTitle,
                  artist: playbackArtist,
                  duration: playbackDurationMs ? formatTime(playbackDurationMs) : "--:--",
                  current: true,
                  imageUrl: null,
                  trackUrl: getSpotifyTrackUrl(displayPlaybackTrack),
                }}
                imageDataUrl={trackImageDataUrl}
              />
            ) : (
              <div
                style={{
                  color: "var(--muted-300)",
                  fontSize: 12,
                  padding: "8px 12px",
                }}
              >
                No song currently playing.
              </div>
            )}

            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--muted-400)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                margin: "12px 20px 6px",
              }}
            >
              Next in queue
            </p>

            {queueItems.length > 0 ? (
              queueItems.map((song, index) => (
                <QueueRow
                  key={index}
                  song={song}
                  imageDataUrl={song.imageUrl ? artworkCacheRef.current.get(song.imageUrl) ?? null : null}
                />
              ))
            ) : (
              <div
                style={{
                  color: "var(--muted-300)",
                  fontSize: 12,
                  padding: "8px 12px",
                }}
              >
                No upcoming songs in queue.
              </div>
            )}
          </div>
        </div>
      </aside>

      <main
        style={{
          order: isMobile ? 2 : 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          overflow: "hidden",
          padding: "32px 24px",
          transition: `flex ${TRANSITION}`,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 340,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
            {[14, 10, 14].map((width, index) => (
              <span
                key={index}
                style={{ display: "block", width, height: 2, background: "var(--muted-400)", borderRadius: 99 }}
              />
            ))}
          </div>
          <div>
            <p
              style={{
                fontSize: 10,
                color: "var(--muted-400)",
                letterSpacing: "0.06em",
                fontWeight: 700,
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Playing from playlist
            </p>
            <p style={{ fontSize: 11, color: "var(--muted-500)", fontWeight: 700, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {playlistName}
            </p>
          </div>
        </div>

        <div
          style={{
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            margin: "0 auto 24px",
            flexShrink: 0,
            width: "min(320px, calc(100% - 0px))",
            aspectRatio: "1 / 1",
            transition: `width ${TRANSITION}`,
            position: "relative",
            background:
              "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.14), transparent 22%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.24), transparent 24%), linear-gradient(135deg, var(--spotify-green) 0%, #0f8f43 42%, var(--bg-dark-900) 100%)",
          }}
        >
          {trackImageDataUrl ? (
            <img
              src={trackImageDataUrl}
              alt={playbackTitle ? `${playbackTitle} album art` : "Spotify album art"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                color: "var(--muted-100)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              No artwork
            </div>
          )}
        </div>

        <div style={{ width: "100%", maxWidth: 340, marginBottom: 16, textAlign: "center" }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--muted-100)",
              margin: "0 0 3px",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {noSongPlaying ? (
              "No song playing XoX"
            ) : playbackTrackUrl ? (
              <a
                href={playbackTrackUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--muted-100)",
                  textDecoration: "none",
                }}
              >
                {playbackTitle}
              </a>
            ) : (
              playbackTitle
            )}
          </h1>
          {!noSongPlaying && (
            <p
              style={{
                fontSize: 13,
                color: "var(--muted-400)",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {playbackArtist}
            </p>
          )}
        </div>

        <div style={{ width: "100%", maxWidth: 340 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                disabled
                title="Theme (coming soon)"
                aria-label="Theme"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "not-allowed",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.35,
                }}
              >
                <Palette size={20} color="var(--muted-400)" />
              </button>
              <button disabled title={shuffleDisabled ? "Shuffle (disabled)" : "Shuffle"} style={{
                background: "none",
                border: "none",
                cursor: "not-allowed",
                padding: 4,
                opacity: 0.28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Shuffle size={16} color={shuffleActive ? "var(--spotify-green)" : "var(--muted-500)"} />
              </button>
              <button disabled title={previousDisabled ? "Previous (disabled)" : "Previous"} style={{
                background: "none",
                border: "none",
                cursor: "not-allowed",
                padding: 4,
                opacity: 0.28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <SkipBack size={20} color="var(--muted-500)" />
              </button>
            </div>

            <button
              disabled
              title={playDisabled ? "Play (disabled)" : isPlaying ? "Pause" : "Play"}
              style={{
                background: "rgba(255,255,255,0.10)",
                border: "none",
                cursor: "not-allowed",
                width: 44,
                height: 44,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.35,
                flexShrink: 0,
              }}
            >
              {isPlaying ? (
                <Pause size={20} color="var(--muted-100)" />
              ) : (
                <Play size={20} fill="var(--muted-100)" color="var(--muted-100)" style={{ marginLeft: 2 }} />
              )}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button disabled title={nextDisabled ? "Next (disabled)" : "Next"} style={{
                background: "none",
                border: "none",
                cursor: "not-allowed",
                padding: 4,
                opacity: 0.28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <SkipForward size={20} color="var(--muted-500)" />
              </button>
              <button disabled title={repeatDisabled ? "Repeat (disabled)" : "Repeat"} style={{
                background: "none",
                border: "none",
                cursor: "not-allowed",
                padding: 4,
                opacity: 0.28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Repeat size={16} color={repeatActive ? "var(--spotify-green)" : "var(--muted-500)"} />
              </button>
              <button
                ref={queueBtnRef}
                onClick={() => setQueueOpen((open) => !open)}
                aria-controls={QUEUE_PANEL_ID}
                aria-expanded={queueOpen}
                aria-label={queueOpen ? "Close queue" : "Open queue"}
                title="Queue"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  transition: `transform 150ms ${EASING}`,
                }}
                onMouseEnter={(event) => (event.currentTarget.style.transform = "scale(1.1)")}
                onMouseLeave={(event) => (event.currentTarget.style.transform = "scale(1)")}
              >
                <List
                  size={20}
                  color={queueOpen ? "var(--spotify-green)" : "var(--muted-500)"}
                  style={{ transition: `color ${DURATION} ${EASING}` }}
                />
                <span
                  style={{
                    display: "block",
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "var(--spotify-green)",
                    opacity: queueOpen ? 1 : 0,
                    transition: `opacity ${DURATION} ${EASING}`,
                  }}
                />
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 11, color: "var(--muted-400)", minWidth: 28, textAlign: "right" }}>
              {formatTime(currentProgressMs)}
            </span>
            <div
              role="progressbar"
              aria-label="Playback position"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={playbackProgressPercent}
              style={{
                flex: 1,
                position: "relative",
                height: 4,
                borderRadius: 99,
                background: "var(--muted-100)",
                cursor: "not-allowed",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${playbackProgressPercent}%`,
                  borderRadius: 99,
                  background: "var(--muted-500)",
                  transition: `width ${TRANSITION}`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `calc(${playbackProgressPercent}% - 6px)`,
                  transform: "translateY(-50%)",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "var(--muted-100)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.45)",
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: "var(--muted-400)", minWidth: 28 }}>
              {formatTime(playbackDurationMs)}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              padding: "8px 14px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.06)",
              width: "fit-content",
              margin: "0 auto",
            }}
          >
            <Smartphone size={13} color="var(--muted-500)" />
            <span style={{ fontSize: 11, color: "var(--muted-500)", fontWeight: 600 }}>Listening on&nbsp;</span>
            <span style={{ fontSize: 11, color: "var(--muted-100)", fontWeight: 700 }}>{deviceName}</span>
          </div>
        </div>
      </main>
    </div>
  );
}