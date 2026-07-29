import type { AuthDatabaseEnv } from "../../src/backend/auth/d1-session-store";
import { resolveApplicationSession } from "../../src/backend/auth/session-lookup";
import { OAuthAuthorizationStore } from "../../src/backend/mcp/auth/authorization";

const NO_STORE = { "Cache-Control": "no-store" };

export async function onRequestGet({ request, env }: { request: Request; env: AuthDatabaseEnv }): Promise<Response> {
  const session = await resolveApplicationSession(request, env.AUTH_DB);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401, headers: NO_STORE });

  const grants = await new OAuthAuthorizationStore(env.AUTH_DB).listClientGrants(session.identity.subject);
  return Response.json({
    grants: grants.map((grant) => ({
      grant_id: grant.grantId,
      client_id: grant.clientId,
      client_name: grant.clientName,
      resource: grant.resource,
      created_at: grant.createdAt,
      updated_at: grant.updatedAt,
      revoked_at: grant.revokedAt,
      status: grant.revokedAt === null ? "active" : "revoked",
    })),
  }, { headers: NO_STORE });
}

export async function onRequestPost({ request, env }: { request: Request; env: AuthDatabaseEnv }): Promise<Response> {
  const session = await resolveApplicationSession(request, env.AUTH_DB);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401, headers: NO_STORE });

  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "invalid_origin" }, { status: 403, headers: NO_STORE });
  }

  if (!(request.headers.get("Content-Type") ?? "").toLowerCase().startsWith("application/json")) {
    return Response.json({ error: "invalid_request", error_description: "Expected application/json." }, {
      status: 400,
      headers: NO_STORE,
    });
  }

  const body = await request.json().catch(() => null) as { grant_id?: unknown } | null;
  if (!body || typeof body.grant_id !== "string" || !body.grant_id) {
    return Response.json({ error: "invalid_request", error_description: "grant_id is required." }, {
      status: 400,
      headers: NO_STORE,
    });
  }

  const revoked = await new OAuthAuthorizationStore(env.AUTH_DB).revokeClientGrant(
    session.identity.subject,
    body.grant_id,
  );
  if (!revoked) {
    return Response.json({ error: "not_found", error_description: "Active client grant was not found." }, {
      status: 404,
      headers: NO_STORE,
    });
  }
  return new Response(null, { status: 204, headers: NO_STORE });
}