export async function onRequestGet({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const target = url.searchParams.get("url");

    if (!target) {
      return new Response(JSON.stringify({ success: false, error: "Missing url parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let parsed: URL;
    try {
      parsed = new URL(target);
    } catch {
      return new Response(JSON.stringify({ success: false, error: "Invalid url" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Restrict proxy to trusted Spotify CDN hosts to avoid open proxy abuse
    const allowedHosts = ["i.scdn.co", "images.scdn.co"];
    if (!allowedHosts.includes(parsed.hostname)) {
      return new Response(JSON.stringify({ success: false, error: "Host not allowed" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    const res = await fetch(parsed.toString());

    // Confirm fetch succeeded
    if (!res.ok) {
      return new Response(JSON.stringify({ success: false, error: `Fetch failed: ${res.status}` }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify the final resolved host (prevent redirect-based SSRF)
    try {
      const finalUrl = new URL(res.url);
      if (!allowedHosts.includes(finalUrl.hostname)) {
        return new Response(JSON.stringify({ success: false, error: "Final host not allowed after redirects" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch {
      // If we can't parse final URL, fail safe
      return new Response(JSON.stringify({ success: false, error: "Unable to validate final URL" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const contentType = (res.headers.get("Content-Type") || "image/jpeg").toLowerCase();

    // Disallow SVGs (can contain script) and only allow common raster images
    const allowedContentTypes = new Set([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ]);

    if (!allowedContentTypes.has(contentType.split(";")[0])) {
      return new Response(JSON.stringify({ success: false, error: "Content type not allowed" }), {
        status: 415,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Enforce a sensible size limit to mitigate OOM/DoS
    const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
    const contentLengthHeader = res.headers.get("Content-Length");
    if (contentLengthHeader) {
      const len = Number(contentLengthHeader);
      if (!Number.isNaN(len) && len > MAX_BYTES) {
        return new Response(JSON.stringify({ success: false, error: "Image too large" }), {
          status: 413,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) {
      return new Response(JSON.stringify({ success: false, error: "Image too large" }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert to base64 efficiently. Prefer Buffer when available (node), otherwise chunked btoa.
    let base64: string;
    if (typeof Buffer !== "undefined" && typeof Buffer.from === "function") {
      base64 = Buffer.from(buffer).toString("base64");
    } else {
      const bytes = new Uint8Array(buffer);
      const CHUNK = 0x8000; // chunk size for apply
      let binary = "";
      for (let i = 0; i < bytes.length; i += CHUNK) {
        const chunk = bytes.subarray(i, i + CHUNK);
        binary += String.fromCharCode.apply(null, Array.prototype.slice.call(chunk));
      }
      base64 = btoa(binary);
    }

    const dataUrl = `data:${contentType};base64,${base64}`;

    return new Response(JSON.stringify({ success: true, dataUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
