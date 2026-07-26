import { useState, useEffect, useMemo, useLayoutEffect, useRef, useCallback, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { FaCloudflare, FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { nav, hero, about, projects, skills } from "@/data/config";
import { decodeBase64 } from "@/lib/utils";
import { safeExternalUrl, safeMailtoHref } from "@/lib/security";
import { isSupportedEditorLanguage, tokenizeForEditor } from "@/lib/syntaxHighlight";
import { AnonymousMessageBox } from "@/components/ui/AnonymousMessageBox";
import { FullscreenNotification } from "@/components/ui/fullscreen-notification";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { SkillCard } from "@/components/portfolio/SkillCard";
import type { ThemedToken } from "shiki";

const SECTION_IDS = ["about", "projects", "skills", "contact", "feedback"];

/* ── Utility ─────────────────────────────────────────────── */
function scrollTo(href: string) {
  if (href.startsWith("#")) {
    // Scroll to the anchor (for in-page navigation)
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

    // Keep the URL in sync so sharing/copying the link preserves the target.
    // We use replaceState to avoid polluting the history stack with each click.
    if (typeof window !== "undefined" && window.history?.replaceState) {
      window.history.replaceState(null, "", href);
    } else if (typeof window !== "undefined") {
      window.location.hash = href;
    }
    return;
  }

  if (href.startsWith("/")) {
    window.location.href = href;
  }
}

function SectionDivider() {
  return (
    <div className="flex justify-center py-2">
      <svg
        aria-hidden="true"
        width="40"
        height="50"
        viewBox="0 0 40 50"
        fill="none"
        className="text-white/30"
      >
        <path
          d="M8 8l8 8 8-8"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 23l8 8 8-8"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 38l8 8 8-8"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* ── Top Navigation ──────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [othersOpen, setOthersOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties | null>(null);
  const othersTriggerRef = useRef<HTMLButtonElement | null>(null);
  const othersPortalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useLayoutEffect(() => {
    if (!othersOpen || !othersTriggerRef.current) {
      setDropdownStyle(null);
      return;
    }

    const updateStyle = () => {
      const triggerRect = othersTriggerRef.current?.getBoundingClientRect();
      if (!triggerRect) return;

      const minWidth = 160;
      const left = Math.min(
        Math.max(16, triggerRect.left),
        window.innerWidth - minWidth - 16
      );

      setDropdownStyle({
        position: "fixed",
        top: triggerRect.bottom + 8,
        left,
        minWidth,
        zIndex: 100000,
      });
    };

    updateStyle();
    window.addEventListener("resize", updateStyle);
    window.addEventListener("scroll", updateStyle, true);
    return () => {
      window.removeEventListener("resize", updateStyle);
      window.removeEventListener("scroll", updateStyle, true);
    };
  }, [othersOpen]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        !othersTriggerRef.current?.contains(event.target as Node) &&
        !othersPortalRef.current?.contains(event.target as Node)
      ) {
        setOthersOpen(false);
      }
    };

    if (othersOpen) {
      document.addEventListener("mousedown", onClick);
      return () => document.removeEventListener("mousedown", onClick);
    }
  }, [othersOpen]);

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        scrolled
          ? "bg-dark-900 backdrop-blur border-b border-white/10"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-16 flex items-center gap-6">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 text-white shrink-0 cursor-pointer active:scale-95 active:brightness-90 transition-transform"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width={28}
            height={28}
            className="stroke-current"
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="7 7 3 12 7 17" />
            <polyline points="17 7 21 12 17 17" />
            <line x1="10" y1="16" x2="14" y2="8" />
          </svg>
          <span className="font-semibold text-sm">{nav.name}</span>
        </button>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {nav.links.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              className="px-3 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-md hover:bg-white/5 cursor-pointer active:scale-95 active:brightness-90 active:shadow-inner"
            >
              {link.label}
            </button>
          ))}

          {nav.others?.length ? (
            <div>
              <button
                type="button"
                ref={othersTriggerRef}
                onClick={() => setOthersOpen((open) => !open)}
                className="px-3 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-md hover:bg-white/5 cursor-pointer active:scale-95 active:brightness-90 inline-flex items-center gap-2 leading-none"
              >
                Others
                <ChevronDown size={14} className={othersOpen ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>

              {othersOpen && dropdownStyle
                ? createPortal(
                  <div
                    ref={othersPortalRef}
                    style={dropdownStyle}
                    className="overflow-hidden rounded-xl border border-white/20 bg-white/10 p-1 shadow-lg shadow-white/5 backdrop-blur-xl backdrop-saturate-150"
                  >
                    {nav.others.map((item) =>
                      item.external ? (
                        <a
                          key={item.label}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            scrollTo(item.href);
                            setOthersOpen(false);
                          }}
                          className="w-full text-left rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          {item.label}
                        </button>
                      )
                    )}
                  </div>,
                  document.body
                )
                : null}
            </div>
          ) : null}
        </nav>

        <div className="flex-1 md:flex-none" />

        {/* CTA button */}
        <button
          onClick={() => scrollTo(nav.cta.href)}
          className="hidden md:inline-flex items-center px-4 py-1.5 rounded-md text-sm font-medium bg-card text-muted-500 cursor-pointer shadow-sm transition-all hover:shadow-[0_0_15px_0_rgba(255,255,255,0.35)] active:scale-95 active:shadow-[0_0_12px_0_rgba(255,255,255,0.25)]"
        >
          {nav.cta.label}
        </button>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white p-1 cursor-pointer active:scale-95 active:brightness-90 transition-transform"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-white/10 px-4 pb-4 space-y-1">
          {nav.links.map((link) => (
            <button
              key={link.label}
              onClick={() => { scrollTo(link.href); setMenuOpen(false); }}
              className="block w-full text-left py-2 px-3 text-sm text-white/70 hover:text-white rounded-md hover:bg-white/5 cursor-pointer active:scale-95 active:brightness-90 active:shadow-inner"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => { scrollTo(nav.cta.href); setMenuOpen(false); }}
            className="block w-full text-left py-2 px-3 text-sm font-medium text-white cursor-pointer"
          >
            {nav.cta.label}
          </button>
          {nav.others?.length ? (
            <div className="mt-2 border-t border-white/10 pt-2">
              <div className="px-3 text-xs uppercase tracking-[0.15em] text-white/40 pb-2">
                Others
              </div>
              {nav.others.map((item) => (
                item.external ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-left py-2 px-3 text-sm text-white/70 hover:text-white rounded-md hover:bg-white/5 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    key={item.label}
                    onClick={() => { scrollTo(item.href); setMenuOpen(false); }}
                    className="block w-full text-left py-2 px-3 text-sm text-white/70 hover:text-white rounded-md hover:bg-white/5 transition-colors"
                  >
                    {item.label}
                  </button>
                )
              ))}
            </div>
          ) : null}
        </div>
      )}
    </header>
  );
}

/* ── Hero Section ────────────────────────────────────────── */
function Hero() {
  const headlineVariants = (hero.headlineVariants ?? []).map((variant) => {
    if (typeof variant === "string") {
      return { text: variant, weight: 1 };
    }
    return { text: variant.text, weight: variant.weight ?? 1 };
  });

  const getRandomHeadline = useCallback(() => {
    if (headlineVariants.length === 0) {
      return hero.headline;
    }

    const totalWeight = headlineVariants.reduce(
      (sum, v) => sum + v.weight,
      0
    );
    let rand = Math.random() * totalWeight;

    for (const variant of headlineVariants) {
      rand -= variant.weight;
      if (rand <= 0) {
        return variant.text;
      }
    }

    return headlineVariants[headlineVariants.length - 1].text;
  }, [headlineVariants]);

  const [selectedHeadline, setSelectedHeadline] = useState(getRandomHeadline);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const headingHadFocusRef = useRef(false);
  const headingIsVisibleRef = useRef(false);
  // Start true so initial render/randomization counts as the "first" randomization.
  const hasRandomizedSinceVisibleRef = useRef(true);

  const randomizeHeadline = useCallback(() => {
    setSelectedHeadline(getRandomHeadline());
    hasRandomizedSinceVisibleRef.current = true;
  }, [getRandomHeadline]);

  const handleHeadingFocus = useCallback(() => {
    // Only randomize when focusing the heading from outside (e.g. via anchor/tab)
    // and only if we haven't already randomized since the heading became visible.
    if (!headingHadFocusRef.current && headingIsVisibleRef.current && !hasRandomizedSinceVisibleRef.current) {
      randomizeHeadline();
      headingHadFocusRef.current = true;
    }
  }, [randomizeHeadline]);

  const handleHeadingBlur = useCallback(() => {
    headingHadFocusRef.current = false;
  }, []);

  useEffect(() => {
    const node = headingRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isVisible = entry.isIntersecting;

          // Reset whenever the heading leaves view so it can randomize again on re-entry.
          if (headingIsVisibleRef.current && !isVisible) {
            hasRandomizedSinceVisibleRef.current = false;
            headingHadFocusRef.current = false;
          }

          headingIsVisibleRef.current = isVisible;

          if (isVisible && !hasRandomizedSinceVisibleRef.current) {
            randomizeHeadline();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [randomizeHeadline]);

  const [typedHeadline, setTypedHeadline] = useState("");
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    setTypedHeadline("");
    setShowNote(false);

    const fullText = selectedHeadline;
    let index = 0;
    let timer: number;
    let noteTimer: number;

    const typeNext = () => {
      index += 1;
      setTypedHeadline(fullText.slice(0, index));

      if (index < fullText.length) {
        timer = window.setTimeout(typeNext, 40);
      } else {
        noteTimer = window.setTimeout(() => setShowNote(true), 250);
      }
    };

    timer = window.setTimeout(typeNext, 400);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(noteTimer);
    };
  }, [selectedHeadline]);

  const typedLines = typedHeadline.split("\n");
  const [noteLine, ...sublineLines] = hero.subline.split("\n");

  const editorTabs = useMemo(() => {
    return (
      hero.editorTabs ?? [
        {
          id: "placeholder",
          label: "readme.txt",
          content: "Add hero.editorTabs in src/data/config.ts to enable editor tabs.",
        },
        {
          id: "about",
          label: "about.md",
          content: `# About\n\nThis is a mock markdown file representing a typical about page.\n\n- Throw in some bullet points\n- Add a few highlights\n- Show that this is an interactive tab`,
        },
        {
          id: "projects",
          label: "projects.json",
          content: JSON.stringify({ projects: [] }, null, 2),
        },
      ]
    );
  }, [hero.editorTabs]);

  const [editorExpanded, setEditorExpanded] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState(editorTabs[0].id);

  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const [panelHeight, setPanelHeight] = useState<string>("0px");
  const [isCollapsing, setIsCollapsing] = useState(false);

  const MAX_EDITOR_PANEL_HEIGHT = 420; // px
  const getPanelHeight = (scrollHeight: number) =>
    `${Math.min(scrollHeight, MAX_EDITOR_PANEL_HEIGHT)}px`;

  const activeTab = useMemo(
    () => editorTabs.find((t) => t.id === activeEditorTab),
    [activeEditorTab, editorTabs]
  );

  const activeLanguage = activeTab?.label.split(".").pop()?.toLowerCase() ?? "ts";

  const activeCode = useMemo(
    () => activeTab?.content ?? "",
    [activeTab]
  );

  const [tokenizedLines, setTokenizedLines] = useState<ThemedToken[][] | null>(null);
  const [highlightError, setHighlightError] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;

    if (!editorExpanded) {
      setTokenizedLines(null);
      setHighlightError(null);
      return () => {
        canceled = true;
      };
    }

    if (!isSupportedEditorLanguage(activeLanguage)) {
      setTokenizedLines(null);
      setHighlightError(null);
      return () => {
        canceled = true;
      };
    }

    setHighlightError(null);

    tokenizeForEditor(activeCode, activeLanguage)
      .then((tokens) => {
        if (!canceled) {
          setTokenizedLines(tokens);
        }
      })
      .catch((error) => {
        if (!canceled) {
          setTokenizedLines(null);
          setHighlightError(error instanceof Error ? error.message : "Syntax highlighting failed to load");
        }
      });

    return () => {
      canceled = true;
    };
  }, [activeCode, activeLanguage, editorExpanded]);

  const editorTabIndex = useMemo(
    () => editorTabs.findIndex((t) => t.id === activeEditorTab),
    [editorTabs, activeEditorTab]
  );

  const renderedLines = useMemo(
    () =>
      tokenizedLines ??
      activeCode.split("\n").map((line) => [{ content: line } as ThemedToken]),
    [tokenizedLines, activeCode]
  );

  const setPanelHeightToContent = () => {
    const panelEl = panelRef.current;
    if (!panelEl) return;
    setPanelHeight(getPanelHeight(panelEl.scrollHeight));
  };

  const collapseEditor = () => {
    const panelEl = panelRef.current;
    if (panelEl) {
      const height = panelEl.scrollHeight;
      setPanelHeight(getPanelHeight(height));
      setIsCollapsing(true);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPanelHeight("0px");
        });
      });

      return;
    }

    setPanelHeight("0px");
    setEditorExpanded(false);
  };

  const expandEditor = () => {
    setIsCollapsing(false);
    setEditorExpanded(true);
    requestAnimationFrame(() => setPanelHeightToContent());
  };

  const toggleEditor = () => {
    if (editorExpanded) {
      collapseEditor();
      return;
    }

    expandEditor();
  };

  const switchEditorTab = (tabId: string) => {
    if (tabId === activeEditorTab) return;

    if (editorExpanded && panelRef.current) {
      setPanelHeight(`${panelRef.current.scrollHeight}px`);
      requestAnimationFrame(() => setActiveEditorTab(tabId));
      return;
    }

    setActiveEditorTab(tabId);
  };

  const handleTabListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();

    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (editorTabIndex + direction + editorTabs.length) % editorTabs.length;

    switchEditorTab(editorTabs[nextIndex].id);
  };

  useEffect(() => {
    if (!editorExpanded) return;

    const activeTabButton = document.getElementById(
      `editor-tab-${activeEditorTab}`
    );
    activeTabButton?.focus();
  }, [activeEditorTab, editorExpanded]);

  useLayoutEffect(() => {
    if (!editorExpanded) return;

    const activeTabButton = tabRefs.current[editorTabIndex];
    if (!activeTabButton) return;

    const rect = activeTabButton.getBoundingClientRect();
    const parentRect = activeTabButton.parentElement?.getBoundingClientRect();
    if (!parentRect) return;

    setUnderlineStyle({
      left: rect.left - parentRect.left,
      width: rect.width,
    });
  }, [activeEditorTab, editorTabIndex, editorExpanded]);

  useEffect(() => {
    if (!editorExpanded) return;

    setPanelHeightToContent();
  }, [activeEditorTab, activeCode, editorExpanded]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-dark-800 pt-16">
      {/* Glow background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central purple glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full blur-[120px]" style={{ background: "var(--accent-purple)", opacity: 0.2 }} />
        {/* Left blue glow */}
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: "var(--accent-blue)", opacity: 0.15 }} />
        {/* Right glow */}
        <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] rounded-full blur-[100px]" style={{ background: "var(--accent-blue)", opacity: 0.1 }} />
        {/* Floating blobs — white teardrop shapes like GitHub's homepage */}
        <div className="absolute top-[28%] left-[20%] w-14 h-14 rounded-full bg-white/80 blur-sm animate-float-1" />
        <div className="absolute top-[40%] right-[22%] w-20 h-20 rounded-full bg-white/70 blur-sm animate-float-2" />
        <div className="absolute top-[55%] left-[38%] w-10 h-10 rounded-full bg-white/60 blur-sm animate-float-3" />
        <div className="absolute top-[22%] right-[35%] w-8 h-8 rounded-full bg-white/50 blur-sm animate-float-2" />
        {/* Star dots scattered around */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-[2px] h-[2px] rounded-full bg-white/40"
            style={{
              top: `${10 + Math.sin(i * 137.5) * 40 + 40}%`,
              left: `${10 + Math.cos(i * 137.5) * 42 + 42}%`,
            }}
          />
        ))}
      </div>

      {/* Hero text */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="relative inline-block pb-10">
          <h1
            ref={headingRef}
            tabIndex={0}
            onFocus={handleHeadingFocus}
            onBlur={handleHeadingBlur}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6"
          >
            <code className="text-inherit block terminal-font">
              {typedLines.map((line, i) => {
                const isLastLine = i === typedLines.length - 1;

                const renderWithMuted = (text: string) => {
                  const parts = text.split(/(\{[^}]+\})/g);
                  return parts.map((part, idx) => {
                    if (part.startsWith("{") && part.endsWith("}")) {
                      return (
                        <span key={`muted-${i}-${idx}`} className="text-white/40">
                          {part.slice(1, -1)}
                        </span>
                      );
                    }
                    return <span key={`muted-${i}-${idx}`}>{part}</span>;
                  });
                };

                return (
                  <span
                    key={`typed-${i}`}
                    className={isLastLine ? "block text-center" : "block"}
                  >
                    {isLastLine ? (
                      <>
                        <span>{renderWithMuted(line)}</span>
                        {typedHeadline.length > 0 ? (
                          <span className="inline-block ml-1 opacity-0 animate-blink-cursor">
                            _
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span className="inline-block">
                        {renderWithMuted(line)}
                      </span>
                    )}
                  </span>
                );
              })}
            </code>
          </h1>
          <span
            className={`mt-2 text-xs text-white/40 text-left opacity-0 transition-opacity duration-500 ease-out sm:absolute sm:-right-8 sm:bottom-8 sm:translate-x-4 sm:text-right sm:whitespace-nowrap ${showNote ? "opacity-100" : "opacity-0"
              }`}
            style={{ transitionDelay: showNote ? "250ms" : "0ms" }}
          >
            {noteLine}
          </span>
        </div>
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          {sublineLines.map((line, i) => {
            const highlightStart = line.indexOf("[");
            const highlightEnd = line.indexOf("]", highlightStart + 1);
            if (highlightStart !== -1 && highlightEnd !== -1) {
              const before = line.slice(0, highlightStart);
              const highlight = line.slice(highlightStart + 1, highlightEnd);
              const after = line.slice(highlightEnd + 1);

              return (
                <span key={`subline-${i}`} className="block">
                  {before}
                  <span className="text-accent-blue font-semibold">
                    {highlight}
                  </span>
                  {after}
                </span>
              );
            }

            return (
              <span key={`subline-${i}`} className="block">
                {line}
              </span>
            );
          })}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => scrollTo(hero.primaryCta.href)}
            className="w-full sm:w-auto px-6 py-3 rounded-md text-base font-semibold text-white transition-colors cursor-pointer"
            style={{ background: "var(--success-500)" }}
          >
            {hero.primaryCta.label}
          </button>
          <button
            onClick={() => scrollTo(hero.secondaryCta.href)}
            className="w-full sm:w-auto px-6 py-3 rounded-md text-base font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {hero.secondaryCta.label}
          </button>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => scrollTo("#about")}
          className="mt-16 inline-flex flex-col items-center gap-1 text-white/30 hover:text-white/60 transition-colors text-xs cursor-pointer"
        >
          <span>Scroll down</span>
          <ChevronDown size={16} className="animate-bounce" />
        </button>
      </div>

      {/* AI / Human editor toggle */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 mt-8 pb-0">
        <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          {/* VS Code–style chrome (window controls + tabs) */}
          <div
            className={
              "px-4 py-2.5 flex items-center gap-2 border-b border-white/10 select-none " +
              (editorExpanded ? "bg-dark-700" : "bg-dark-700 cursor-pointer")
            }
            onClick={(event) => {
              if (!editorExpanded && !(event.target as HTMLElement).closest("button")) {
                expandEditor();
              }
            }}
            onDoubleClick={(event) => {
              event.preventDefault();
              if (editorExpanded) collapseEditor();
            }}
          >
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={collapseEditor}
                aria-label="Collapse editor"
                className="w-3 h-3 rounded-full bg-danger-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="button"
                aria-label={editorExpanded ? "Collapse editor" : "Expand editor"}
                onClick={toggleEditor}
                className="w-3 h-3 rounded-full bg-warning-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="button"
                aria-label="Green control (no-op)"
                className="w-3 h-3 rounded-full bg-success-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            {!editorExpanded ? (
              <div className="flex-1 text-left text-xs text-white/80">
                For AI bots... or competent humans.
              </div>
            ) : (
              <div
                className="relative flex flex-1 items-center gap-1 ml-2 text-xs rounded-t-md px-2 py-1 bg-dark-700"
                role="tablist"
                aria-label="Editor tabs"
                onKeyDown={handleTabListKeyDown}
              >
                <div
                  className="absolute left-0 bottom-0 h-0.5 transition-all duration-200 ease-out"
                  style={{
                    width: `${underlineStyle.width}px`,
                    transform: `translateX(${underlineStyle.left}px)`,
                    background: 'var(--accent-blue)'
                  }}
                />
                {editorTabs.map((tab, idx) => (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      tabRefs.current[idx] = el
                    }}
                    id={`editor-tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={tab.id === activeEditorTab}
                    aria-controls={`editor-panel-${tab.id}`}
                    className={
                      "relative px-3 py-1 rounded-t-md focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors duration-150 cursor-pointer " +
                      (tab.id === activeEditorTab
                        ? "text-white"
                        : "text-white/60 hover:text-white/80")
                    }
                    onClick={() => switchEditorTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            className="transition-[height,opacity] duration-300 ease-out overflow-hidden max-h-[420px]"
            style={{
              height: editorExpanded ? panelHeight : "0px",
              opacity: editorExpanded ? 1 : 0,
            }}
            onTransitionEnd={() => {
              if (isCollapsing) {
                setIsCollapsing(false);
                setEditorExpanded(false);
                setPanelHeight("0px");
              }
            }}
          >
            <div
              ref={panelRef}
              id={`editor-panel-${activeEditorTab}`}
              role="tabpanel"
              aria-labelledby={`editor-tab-${activeEditorTab}`}
              className="px-6 py-5 font-mono text-sm text-left overflow-x-auto overflow-y-auto max-h-full bg-dark-700"
            >
              {highlightError && (
                <div className="mb-3 text-xs text-amber-400/90">
                  Syntax highlighting unavailable: {highlightError}
                </div>
              )}
              <div className="flex text-muted-100">
                {/* Gutter (line numbers) */}
                <div className="flex-shrink-0 w-12 pr-3 text-right text-white/20 select-none">
                  {renderedLines.map((_, i) => (
                    <div key={`line-${i}`} className="leading-5">
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Code (horizontal scroll only) */}
                <div className="min-w-0 flex-1 overflow-x-auto">
                  <pre className="whitespace-pre text-muted-100">
                    {renderedLines.map((lineTokens, i) => (
                      <div key={`code-line-${i}`} className="leading-5">
                        {lineTokens.length > 0 ? lineTokens.map((token, tokenIndex) => {
                          const fontStyle = token.fontStyle ?? 0;
                          const isItalic = (fontStyle & 1) !== 0;
                          const isBold = (fontStyle & 2) !== 0;
                          const isUnderline = (fontStyle & 4) !== 0;

                          return (
                            <span
                              key={`${i}-${tokenIndex}`}
                              style={{
                                color: token.color ?? "var(--muted-100)",
                                fontStyle: isItalic ? "italic" : "normal",
                                fontWeight: isBold ? 700 : 400,
                                textDecoration: isUnderline ? "underline" : "none",
                              }}
                            >
                              {token.content}
                            </span>
                          );
                        }) : <span />}
                      </div>
                    ))}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── About Section ───────────────────────────────────────── */
function About() {
  const decodedEmail = decodeBase64(about.email)
  const emailHref = safeMailtoHref(decodedEmail)

  return (
    <section id="about" className="bg-dark-800 border-t border-white/10 py-24 px-4">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-success-500 font-mono text-sm mb-3">// about me</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Engineering intelligent embedded systems and robotics
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">{about.bio}</p>

            <div className="flex flex-wrap gap-4 mb-8 text-sm">
              {about.email && emailHref && (
                <a
                  href={emailHref}
                  className="text-accent-blue hover:underline"
                >
                  {decodedEmail}
                </a>
              )}
              {about.location && (
                <span className="text-white/40">{about.location}</span>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {about.stats.map((stat) => (
              <div key={stat.label}
                className="rounded-xl border border-white/10 bg-dark-700 p-6 text-center">
                <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Projects Section ────────────────────────────────────── */
function Projects() {
  return (
    <section id="projects" className="bg-dark-800 border-t border-white/10 py-24 px-4">
      <div className="max-w-[1280px] mx-auto">
        <p className="text-success-500 font-mono text-sm mb-3">// projects</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Things I've built
        </h2>
        <p className="text-white/50 text-lg mb-8 max-w-2xl">
          My selected projects - the ones I've spent my time on. Presenting...
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
        <div className="mt-4 text-right">
          <span className="text-white/40 text-sm">... and some more.</span>
        </div>
      </div>
    </section>
  );
}

/* ── Skills Section ──────────────────────────────────────── */
function Skills() {
  return (
    <section id="skills" className="bg-dark-700 border-t border-white/10 py-24 px-4">
      <div className="max-w-[1280px] mx-auto">
        <p className="text-success-500 font-mono text-sm mb-3">// skills</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
          My actual stack
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((group) => (
            <SkillCard key={group.category} group={group} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Contact Section ─────────────────────────────────────── */
function Contact() {
  const decodedEmail = decodeBase64(about.email)
  const emailHref = safeMailtoHref(decodedEmail)
  const githubUrl = safeExternalUrl(decodeBase64(about.socials.github ?? ""))
  const instagramUrl = safeExternalUrl(decodeBase64(about.socials.instagram ?? ""))
  const linkedinUrl = safeExternalUrl(decodeBase64(about.socials.linkedin ?? ""))

  return (
    <section id="contact" className="bg-dark-800 border-t border-white/10 py-24 px-4">
      <div className="max-w-[1280px] mx-auto text-center">
        {/* Glow behind the contact section */}
        <div className="relative inline-block">
          <div className="absolute inset-0 -m-8 rounded-full blur-[80px]" style={{ background: "var(--accent-purple)", opacity: 0.2 }} />
          <div className="relative">
            <p className="text-success-500 font-mono text-sm mb-3">// contact</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Let's build something together.
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
              Open to full-time roles, freelance projects, and interesting collaborations.
              Reach out and let's chat.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {emailHref && (
                <a
                  href={emailHref}
                  className="w-full sm:w-auto px-8 py-3 rounded-md text-base font-semibold text-white transition-colors"
                  style={{ background: "var(--success-500)" }}
                >
                  Email me
                </a>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-md text-base font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  <FaGithub size={16} /> GitHub
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-md text-base font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  <FaInstagram size={16} /> Instagram
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-md text-base font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  <FaLinkedin size={16} /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto mt-16 px-4">
        {/* Hidden anchor for deep-linking to the feedback box (used by scroll spy) */}
        <div id="feedback" className="h-0" aria-hidden="true" />
        <AnonymousMessageBox />
      </div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-white/10 py-10 px-4">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
        <div className="flex items-center gap-2">
          <FaCloudflare size={16} />
          <span>Built with Replit · On Cloudfare Pages</span>
        </div>
        <div className="flex gap-4">
          {nav.links.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              className="hover:text-white/60 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>
        <p>
          Made with <span className="text-danger-500">♥</span> by RockOnJeet! (GitHub Copilot actually)
        </p>
      </div>
    </footer>
  );
}

/* ── Root ────────────────────────────────────────────────── */
export default function Portfolio() {
  const [showTempNotification, setShowTempNotification] = useState(true);

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash) scrollTo(hash);
    };

    const setHash = (id: string) => {
      const newHash = `#${id}`;
      if (window.location.hash === newHash) return;
      window.history.replaceState(null, "", newHash);
    };

    const clearHash = () => {
      if (!window.location.hash) return;
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    };

    const getCurrentSection = () => {
      const scrollPos = window.scrollY + 100; // offset to avoid header overlap

      // If we're scrolled above the first real section, clear the hash.
      const aboutEl = document.getElementById("about");
      if (aboutEl && scrollPos < aboutEl.offsetTop - 120) {
        return undefined;
      }

      const sections = SECTION_IDS
        .map((id) => document.getElementById(id))
        .filter(Boolean) as HTMLElement[];

      // Find the last section whose top is <= scrollPos
      const current = sections
        .filter((section) => section.offsetTop <= scrollPos)
        .pop();

      return current?.id;
    };

    const onScroll = () => {
      const id = getCurrentSection();
      if (id) {
        setHash(id);
      } else {
        clearHash();
      }
    };

    // Initial load hash handling
    scrollToHash();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", scrollToHash);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-dark-800)" }}>
      <Navbar />
      <Hero />
      <About />
      <SectionDivider />
      <Projects />
      <SectionDivider />
      <Skills />
      <Contact />
      <Footer />

      <FullscreenNotification
        open={showTempNotification}
        onOpenChange={setShowTempNotification}
        title={
          <>
            Reminiscing the
            <br />
            4 years of my College life!
          </>
        }
        description="There's a new page added to the portfolio - click the button below to check it out :)"
      >
        <div className="flex justify-center">
          <a
            href={`${import.meta.env.BASE_URL}time-capsule`}
            className="inline-flex w-full max-w-[260px] items-center justify-center rounded-full bg-spotify px-8 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-black shadow-[0_15px_40px_rgba(29,185,84,0.24)] transition-colors"
            style={{ background: 'var(--spotify-green)' }}
          >
            Open TARDIS - A time capsule
          </a>
        </div>
      </FullscreenNotification>
    </div>
  );
}
