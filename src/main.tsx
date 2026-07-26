import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initTheme } from "./lib/theme";

// Initialize theme early to avoid FOUC and expose a simple API for extensions
initTheme();

createRoot(document.getElementById("root")!).render(<App />);