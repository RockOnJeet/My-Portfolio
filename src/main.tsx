import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

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

const url = new URL(window.location.href);
const redirect = url.searchParams.get("redirect");
if (redirect && isSafeRedirect(redirect)) {
  url.searchParams.delete("redirect");
  window.history.replaceState({}, "", url.toString());
  window.location.replace(redirect);
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
