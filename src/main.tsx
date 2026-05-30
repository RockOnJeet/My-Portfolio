import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initTheme } from "./lib/theme";

// GitHub Pages SPA fallback support: if a 404 redirected here with a `redirect=` query, navigate there.
// Only allow internal redirects (same origin + relative path).
const KNOWN_APP_PATHS = new Set(["/", "/spotify", "/time-capsule"]);

function isSafeRedirect(uri: string) {
  try {
    if (typeof uri !== "string") return false;

    const trimmed = uri.trim();
    // Basic length and control-char checks
    if (!trimmed || trimmed.length > 2048) return false;
    if (/[\u0000-\u001F\u007F]/.test(trimmed)) return false;

    // Block harmful schemes early
    if (/^\s*(javascript|data|vbscript):/i.test(trimmed)) return false;

    const target = new URL(trimmed, window.location.origin);

    // Must remain same-origin and a site-relative path
    if (target.origin !== window.location.origin) return false;
    if (!target.pathname.startsWith("/")) return false;

    // Reject obvious canonicalization/traversal tricks
    if (target.pathname.includes("//")) return false;
    if (target.pathname.includes("/..")) return false;

    // Reject encoded newlines or javascript: after normalization
    const href = target.href.toLowerCase();
    if (href.startsWith("javascript:") || href.includes("%0a") || href.includes("%0d")) return false;

    return true;
  } catch {
    return false;
  }
}

const redirect = new URL(window.location.href).searchParams.get("redirect");
// Initialize theme early to avoid FOUC and expose a simple API for extensions
initTheme();
if (redirect && isSafeRedirect(redirect)) {
  const target = new URL(redirect, window.location.origin);

  if (KNOWN_APP_PATHS.has(target.pathname)) {
    // Replace the address bar with the intended SPA path, then render the app
    // without forcing a second network navigation back to the missing route.
    window.history.replaceState({}, "", `${target.pathname}${target.search}${target.hash}`);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
