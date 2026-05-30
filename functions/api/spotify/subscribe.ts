import { getSpotifyCoordinator } from "../../../src/backend/spotify/coordinator";

const encoder = new TextEncoder();

function formatSse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function onRequestGet({ request, env }: { request: Request; env: Record<string, string | undefined> }) {
  const coordinator = getSpotifyCoordinator();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(formatSse(event, data)));
      };

      const heartbeat = setInterval(() => {
        if (!closed) {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        }
      }, 15000);

      const unsubscribe = coordinator.subscribe(env, (event) => {
        send(event.event, event.data);
      });

      const cleanup = () => {
        if (closed) {
          return;
        }

        closed = true;
        clearInterval(heartbeat);
        unsubscribe();

        try {
          controller.close();
        } catch {
          // The stream may already be closed.
        }
      };

      request.signal.addEventListener("abort", cleanup, { once: true });
    },
    cancel() {
      // The abort listener handles cleanup.
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
