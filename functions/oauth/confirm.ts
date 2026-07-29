import type { AuthDatabaseEnv } from "../../src/backend/auth/d1-session-store";
import { resolveApplicationSession } from "../../src/backend/auth/session-lookup";
import { OAuthAuthorizationStore } from "../../src/backend/mcp/auth/authorization";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

export async function onRequestGet({ request, env }: { request: Request; env: AuthDatabaseEnv }): Promise<Response> {
  const url = new URL(request.url);
  const transactionId = url.searchParams.get("transaction");
  if (!transactionId) return new Response("Missing authorization transaction.", { status: 400 });

  const session = await resolveApplicationSession(request, env.AUTH_DB);
  if (!session) return Response.redirect(new URL("/oauth/github/login", url.origin), 302);

  const transaction = await new OAuthAuthorizationStore(env.AUTH_DB).findTransaction(transactionId);
  if (!transaction) return new Response("Authorization transaction is invalid or expired.", { status: 400 });

  const client = escapeHtml(transaction.clientName ?? transaction.clientId);
  const scopes = escapeHtml(transaction.scope || "Current MCP capabilities");
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Authorize MCP client</title></head><body><main><h1>Authorize MCP client</h1><p><strong>${client}</strong> is requesting access to RockOnJeet MCP.</p><p>Access: ${scopes}</p><form method="post"><input type="hidden" name="transaction" value="${escapeHtml(transactionId)}"><button type="submit" name="decision" value="allow">Allow</button><button type="submit" name="decision" value="deny">Deny</button></form></main></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function onRequestPost({ request, env }: { request: Request; env: AuthDatabaseEnv }): Promise<Response> {
  const session = await resolveApplicationSession(request, env.AUTH_DB);
  if (!session) return new Response("Authentication required.", { status: 401 });
  const form = await request.formData();
  const transactionId = form.get("transaction");
  const decision = form.get("decision");
  if (typeof transactionId !== "string" || (decision !== "allow" && decision !== "deny")) {
    return new Response("Invalid authorization decision.", { status: 400 });
  }

  const store = new OAuthAuthorizationStore(env.AUTH_DB);
  const transaction = await store.consumeTransaction(transactionId);
  if (!transaction) return new Response("Authorization transaction is invalid or expired.", { status: 400 });
  const redirect = new URL(transaction.redirectUri);
  if (transaction.state) redirect.searchParams.set("state", transaction.state);
  redirect.searchParams.set("iss", new URL(request.url).origin);

  if (decision === "deny") {
    redirect.searchParams.set("error", "access_denied");
    return Response.redirect(redirect, 302);
  }

  const code = await store.createAuthorizationCode(transaction, session.identity.subject);
  redirect.searchParams.set("code", code);
  return Response.redirect(redirect, 302);
}
