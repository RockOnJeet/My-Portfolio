import {
  D1SessionStore,
  type AuthDatabaseEnv,
} from "../../src/backend/auth/d1-session-store";
import { getSessionToken, hashSessionToken } from "../../src/backend/auth/session";

// TODO(auth-cleanup): Remove this diagnostic endpoint once /admin consumes application sessions.
export async function onRequestGet({
  request,
  env,
}: {
  request: Request;
  env: AuthDatabaseEnv;
}): Promise<Response> {
  const token = getSessionToken(request);
  if (!token) {
    return Response.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
  }

  const now = Math.floor(Date.now() / 1000);
  const session = await new D1SessionStore(env.AUTH_DB).findValid(await hashSessionToken(token), now);
  if (!session) {
    return Response.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
  }

  return Response.json(
    { authenticated: true, identity: session.identity },
    { headers: { "Cache-Control": "no-store" } },
  );
}
