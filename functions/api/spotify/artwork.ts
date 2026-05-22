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
    if (!res.ok) {
      return new Response(JSON.stringify({ success: false, error: `Fetch failed: ${res.status}` }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const contentType = res.headers.get("Content-Type") || "image/jpeg";
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    const base64 = typeof btoa === "function" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64");

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
