import { D1SessionStore, type D1Database } from "./d1-session-store";
import { getSessionToken, hashSessionToken } from "./session";
import type { StoredSession } from "./session-store";

export async function resolveApplicationSession(request: Request, db: D1Database): Promise<StoredSession | null> {
  const token = getSessionToken(request);
  if (!token) return null;
  return new D1SessionStore(db).findValid(
    await hashSessionToken(token),
    Math.floor(Date.now() / 1000),
  );
}
