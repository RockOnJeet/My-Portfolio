import { useCallback, useEffect } from "react";

const SECTION_IDS = ["about", "projects", "skills", "contact", "feedback"];

export function usePortfolioNavigation() {
  const navigate = useCallback((href: string) => {
    if (href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      if (window.history?.replaceState) window.history.replaceState(null, "", href);
      else window.location.hash = href;
      return;
    }
    if (href.startsWith("/")) window.location.href = href;
  }, []);

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash) navigate(hash);
    };
    const setHash = (id: string) => {
      const newHash = `#${id}`;
      if (window.location.hash !== newHash) window.history.replaceState(null, "", newHash);
    };
    const clearHash = () => {
      if (window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    };
    const getCurrentSection = () => {
      const scrollPos = window.scrollY + 100;
      const aboutEl = document.getElementById("about");
      if (aboutEl && scrollPos < aboutEl.offsetTop - 120) return undefined;
      const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
      return sections.filter((section) => section.offsetTop <= scrollPos).pop()?.id;
    };
    const onScroll = () => {
      const id = getCurrentSection();
      if (id) setHash(id);
      else clearHash();
    };

    scrollToHash();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [navigate]);

  return { navigate };
}
