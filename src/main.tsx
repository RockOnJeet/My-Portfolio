import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initTheme } from "./lib/theme";

// GitHub Pages SPA fallback support: if a 404 redirected here with a `redirect=` query, navigate there.
// Only allow internal redirects (same origin + relative path).
function isSafeRedirect(uri: string) {
  try {
    const target = new URL(uri, window.location.origin);
    return (
      target.origin === window.location.origin &&
      target.pathname.startsWith("/") &&
      !target.pathname.includes("//") &&
      !target.href.startsWith("javascript:")
    );
  } catch {
    return false;
  }
}

const redirect = new URL(window.location.href).searchParams.get("redirect");
// Initialize theme early to avoid FOUC and expose a simple API for extensions
initTheme();
if (redirect && isSafeRedirect(redirect)) {
  const target = new URL(redirect, window.location.origin);

  // Replace the address bar with the intended SPA path, then render the app
  // without forcing a second network navigation back to the missing route.
  window.history.replaceState({}, "", `${target.pathname}${target.search}${target.hash}`);
}

createRoot(document.getElementById("root")!).render(<App />);
