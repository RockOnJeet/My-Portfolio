import { getSpotifyConsolePayload } from "../../../src/backend/spotify/index";

export async function onRequestGet({ env }: { env: Record<string, string | undefined> }) {
  try {
    const payload = await getSpotifyConsolePayload(env);

    return new Response(JSON.stringify({ success: true, payload }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
