import { useEffect, useRef, useState, type ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  List,
  Music,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Smartphone,
  X,
} from "lucide-react";

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

type Song = (typeof QUEUE_SONGS)[number];

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
  if (!isRecord(value) || !Array.isArray(value.queue)) return [];
  return value.queue.filter((item) => isRecord(item) && isRecord(item.track));
}

function formatTime(ms: number | null): string {
  if (ms === null || ms < 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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

function QueueRow({ song }: { song: Song }) {
  return (
    <div
      role="listitem"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 12px",
        borderRadius: 8,
        margin: "0 8px",
        background: song.current ? "rgba(255,255,255,0.04)" : "transparent",
        cursor: "default",
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
        {song.current ? (
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
          {song.title}
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
  const [liked, setLiked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [spotifyPayload, setSpotifyPayload] = useState<SpotifyConsolePayload | null>(null);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [spotifyLoading, setSpotifyLoading] = useState(true);

  const { toast } = useToast();
  const spotifyErrorToastId = useRef<string | null>(null);

  const playbackData = spotifyPayload?.playbackData;
  const playbackTrack = hasSpotifyPlaybackItem(playbackData)
    ? (playbackData as Record<string, unknown>).item
    : null;
  const playbackTitle = getSpotifyTrackTitle(playbackTrack);
  const playbackArtist = getSpotifyTrackArtists(playbackTrack);
  const playbackDurationMs = getSpotifyTrackDurationMs(playbackTrack);
  const playbackProgressMs =
    isRecord(playbackData) && typeof playbackData.progress_ms === "number"
      ? playbackData.progress_ms
      : 0;
  const playbackProgressPercent = playbackDurationMs
    ? Math.min(100, Math.max(0, Math.round((playbackProgressMs / playbackDurationMs) * 100)))
    : 0;

  const queueItems = getSpotifyQueueItems(spotifyPayload?.queueData).map((entry) => {
    const track = (entry as Record<string, unknown>).track;
    return {
      title: getSpotifyTrackTitle(track),
      artist: getSpotifyTrackArtists(track),
      duration: formatTime(getSpotifyTrackDurationMs(track)),
      current: false,
    };
  });

  const noSongPlaying =
    !spotifyLoading &&
    (!!spotifyError ||
      !spotifyPayload ||
      !playbackTrack);

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

    async function fetchSpotifyConsole() {
      try {
        const response = await fetch("/api/spotify/console");
        const rawResult = await response.json();

        if (canceled) return;

        if (!response.ok) {
          setSpotifyError(`Spotify snapshot request failed with ${response.status}`);
          setSpotifyPayload(null);
          return;
        }

        if (!isSpotifyConsoleResult(rawResult)) {
          setSpotifyError("Spotify snapshot endpoint returned an unexpected payload format.");
          setSpotifyPayload(null);
          return;
        }

        if (!rawResult.success) {
          setSpotifyError(rawResult.error);
          setSpotifyPayload(null);
          return;
        }

        setSpotifyPayload(rawResult.payload);
        setSpotifyError(null);
      } catch (error) {
        if (canceled) return;
        setSpotifyPayload(null);
        setSpotifyError(error instanceof Error ? error.message : "Unable to load Spotify data");
      } finally {
        if (!canceled) {
          setSpotifyLoading(false);
        }
      }
    }

    fetchSpotifyConsole();

    return () => {
      canceled = true;
    };
  }, []);

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

  const queueW = 360;
  const queueH = 420;

  return (
    <div
      style={{
        background:
          "radial-gradient(circle at top left, rgba(29,185,84,0.16), transparent 30%), radial-gradient(circle at 85% 15%, rgba(255,255,255,0.06), transparent 18%), linear-gradient(135deg, var(--bg-dark-900) 0%, var(--bg-dark-800) 45%, var(--bg-dark-700) 100%)",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        minHeight: "100vh",
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
              minHeight: "100vh",
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
                }}
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
              queueItems.map((song, index) => <QueueRow key={index} song={song} />)
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
          minHeight: "100vh",
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
            <p style={{ fontSize: 11, color: "var(--muted-500)", fontWeight: 700, margin: 0 }}>
              What he plays
            </p>
          </div>
        </div>

        <p
          role="status"
          aria-live="polite"
          style={{
            fontSize: 12,
            margin: "0 0 24px",
            color: spotifyError ? "var(--danger-500)" : "var(--muted-500)",
            minHeight: 20,
          }}
        >
          {spotifyLoading
            ? "Loading Spotify data..."
            : spotifyError
              ? `Unable to load Spotify data: ${spotifyError}`
              : "Spotify data loaded from backend."}
        </p>

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
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              padding: 16,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.10)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexDirection: "column",
                padding: "24px 18px",
                color: "var(--muted-100)",
              }}
            >
              <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.85 }}>
                    Spotify
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6, opacity: 0.92 }}>
                    What he plays
                  </div>
                </div>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.10)",
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                  }}
                >
                  <Music size={16} />
                </div>
              </div>

              <div style={{ textAlign: "center", width: "100%" }}>
                <div
                  style={{
                    width: "100%",
                    maxWidth: 180,
                    margin: "0 auto 10px",
                    height: 2,
                    background: "rgba(255,255,255,0.16)",
                    borderRadius: 99,
                  }}
                />
                <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: "0.03em", lineHeight: 1 }}>
                  SP
                </div>
                <div style={{ fontSize: 12, opacity: 0.84, marginTop: 8, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Queue never sleeps
                </div>
              </div>

              <div style={{ width: "100%", display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.85 }}>
                  <span>Now playing</span>
                  <span>Travelling Vibes</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
                  <div style={{ width: "55%", height: "100%", borderRadius: 99, background: "linear-gradient(90deg, var(--muted-100), rgba(255,255,255,0.72))" }} />
                </div>
              </div>
            </div>
          </div>
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
            {noSongPlaying ? "No song playing XoX" : playbackTitle}
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
                title="Like (disabled)"
                aria-label="Like"
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
                <Heart
                  size={20}
                  fill="none"
                  color="var(--muted-400)"
                  style={{ transition: `fill ${DURATION} ${EASING}, color ${DURATION} ${EASING}` }}
                />
              </button>
              <DisabledBtn title="Shuffle">
                <Shuffle size={16} color="var(--muted-500)" />
              </DisabledBtn>
              <DisabledBtn title="Previous">
                <SkipBack size={20} color="var(--muted-500)" />
              </DisabledBtn>
            </div>

            <button
              disabled
              title="Play (disabled)"
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
              <Play size={20} fill="var(--muted-100)" color="var(--muted-100)" style={{ marginLeft: 2 }} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <DisabledBtn title="Next">
                <SkipForward size={20} color="var(--muted-500)" />
              </DisabledBtn>
              <DisabledBtn title="Repeat">
                <Repeat size={16} color="var(--muted-500)" />
              </DisabledBtn>
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
              {formatTime(playbackProgressMs)}
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
            <span style={{ fontSize: 11, color: "var(--muted-100)", fontWeight: 700 }}>Desktop</span>
          </div>
        </div>
      </main>
    </div>
  );
}