type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

function isSystemDark() {
  return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function getStoredTheme(): Theme | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch { }
  return null;
}

export function applyTheme(theme: Theme) {
  const html = document.documentElement;

  let resolved: "dark" | "light" = "light";

  if (theme === "system") {
    resolved = isSystemDark() ? "dark" : "light";
  } else {
    resolved = theme === "dark" ? "dark" : "light";
  }

  html.classList.toggle("dark", resolved === "dark");
  html.setAttribute("data-theme", resolved);
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch { }
  applyTheme(theme);
  notifyListeners();
}

export function getEffectiveTheme(): "dark" | "light" {
  const stored = getStoredTheme();
  if (!stored || stored === "system") return isSystemDark() ? "dark" : "light";
  return stored === "dark" ? "dark" : "light";
}

let listeners: Array<(t: "dark" | "light") => void> = [];

function notifyListeners() {
  const t = getEffectiveTheme();
  listeners.forEach((l) => l(t));
}

export function onThemeChange(cb: (t: "dark" | "light") => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((x) => x !== cb);
  };
}

export function initTheme() {
  try {
    const stored = getStoredTheme();
    applyTheme(stored || "system");

    // Watch for system changes
    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener?.("change", () => {
        const storedNow = getStoredTheme();
        if (!storedNow || storedNow === "system") {
          applyTheme("system");
          notifyListeners();
        }
      });
    }

    // Expose a simple API for extensions to query/control theme
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__portfolioTheme = {
      get: getEffectiveTheme,
      set: setTheme,
      onChange: onThemeChange,
    };
  } catch { }
}

export default {
  initTheme,
  setTheme,
  getEffectiveTheme,
  onThemeChange,
};
