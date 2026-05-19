#!/usr/bin/env python3
"""
Resize and strip audio from videos under src/pages/time-capsule/videos

Requirements:
- ffmpeg (and ffprobe) available on PATH

Usage:
  python scripts/resize-videos.py

Behavior:
- Searches for .mp4, .webm, .ogv files under src/pages/time-capsule/videos
- For each file: backs up the original to <name>.orig, removes audio and re-encodes
  with a calculated target bitrate so the output is <= 25 MiB when possible.
- If the file is already small, it will still be stripped of audio (to reduce size).
"""
import shutil
import subprocess
import sys
from pathlib import Path

MAX_BYTES = 25 * 1024 * 1024  # 25 MiB
VIDEO_DIR = Path("src/pages/time-capsule/videos")
ALLOWED_EXTS = {".mp4", ".webm", ".ogg", ".ogv"}


def check_ffmpeg():
    if shutil.which("ffmpeg") is None or shutil.which("ffprobe") is None:
        print("ffmpeg and/or ffprobe not found in PATH. Please install ffmpeg.")
        sys.exit(2)


def probe_duration(path: Path) -> float:
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of",
           "default=noprint_wrappers=1:nokey=1", str(path)]
    out = subprocess.run(cmd, capture_output=True, text=True)
    if out.returncode != 0:
        raise RuntimeError(f"ffprobe failed: {out.stderr}")
    try:
        return float(out.stdout.strip())
    except Exception:
        raise RuntimeError(f"invalid duration from ffprobe: {out.stdout!r}")


def transcode_remove_audio(src: Path, dst: Path, bitrate_kbps: int) -> None:
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(src),
        "-c:v",
        "libx264",
        "-b:v",
        f"{bitrate_kbps}k",
        "-preset",
        "veryfast",
        "-pix_fmt",
        "yuv420p",
        "-an",
        "-movflags",
        "+faststart",
        "-map_metadata",
        "-1",
        str(dst),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {proc.stderr}")


def process_file(path: Path):
    print(f"Processing: {path}")
    dur = probe_duration(path)
    if dur <= 0:
        print("  Could not determine duration, skipping")
        return

    # Calculate initial target bitrate (kbits/s), leave small headroom
    target_bitrate_kbps = int((MAX_BYTES * 8) / dur / 1000 * 0.95)
    target_bitrate_kbps = max(target_bitrate_kbps, 300)  # floor

    backup = path.with_suffix(path.suffix + ".orig")
    if not backup.exists():
        path.replace(backup)
        src = backup
    else:
        src = path

    out_tmp = path.with_suffix(path.suffix + ".tmp.mp4")

    # iterative try to meet size
    bitrate = target_bitrate_kbps
    while bitrate >= 150:
        try:
            transcode_remove_audio(src, out_tmp, bitrate)
        except Exception as e:
            print(f"  transcode failed at {bitrate}k: {e}")
            bitrate = int(bitrate * 0.7)
            continue

        size = out_tmp.stat().st_size
        print(f"  encoded @ {bitrate}k -> {size/1024/1024:.2f} MiB")
        if size <= MAX_BYTES:
            out_tmp.replace(path)
            print(f"  success: {path} (from {src.name})")
            return
        # reduce bitrate and retry
        bitrate = int(bitrate * 0.75)

    # if loop finished without success, keep best-effort (smallest produced)
    # attempt one final best-effort encode with low bitrate
    try:
        transcode_remove_audio(src, out_tmp, 150)
        out_tmp.replace(path)
        print(f"  best-effort produced {path}")
    except Exception as e:
        print(f"  final transcode failed: {e}")
        if out_tmp.exists():
            out_tmp.unlink()


def main():
    check_ffmpeg()
    if not VIDEO_DIR.exists():
        print(f"Video directory not found: {VIDEO_DIR}")
        sys.exit(1)

    files = sorted([p for p in VIDEO_DIR.iterdir() if p.suffix.lower() in ALLOWED_EXTS])
    if not files:
        print("No video files found to process.")
        return

    for f in files:
        try:
            process_file(f)
        except Exception as e:
            print(f"Error processing {f}: {e}")


if __name__ == "__main__":
    main()
