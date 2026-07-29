import {
  D1SessionStore,
  type AuthDatabaseEnv,
} from "../../src/backend/auth/d1-session-store";
import {
  clearSessionCookie,
  getSessionToken,
  hashSessionToken,
} from "../../src/backend/auth/session";

export async function onRequestPost({
  request,
  env,
}: {
  request: Request;
  env: AuthDatabaseEnv;
}): Promise<Response> {
  const token = getSessionToken(request);
  if (token) {
    await new D1SessionStore(env.AUTH_DB).delete(await hashSessionToken(token));
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
      "Set-Cookie": clearSessionCookie(),
    },
  });
}
