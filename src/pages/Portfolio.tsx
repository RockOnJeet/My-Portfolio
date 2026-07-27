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
import { Section, SectionHeading } from "@/components/layout/Section";
import { ProjectCard } from "@/components/portfolio/projects/ProjectCard";
import { SkillCard } from "@/components/portfolio/skills/SkillCard";
import { StatCard } from "@/components/portfolio/about/StatCard";
import { HeroSection } from "@/components/portfolio/hero/HeroSection";

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

/* ── About Section ───────────────────────────────────────── */
function About() {
  const decodedEmail = decodeBase64(about.email)
  const emailHref = safeMailtoHref(decodedEmail)

  return (
    <Section id="about" className="bg-dark-800">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <SectionHeading
            eyebrow="// about me"
            title="Engineering intelligent embedded systems and robotics"
            titleClassName="mb-6"
          />
          <p className="text-white/60 text-lg leading-relaxed mb-8">{about.bio}</p>

          <div className="flex flex-wrap gap-4 mb-8 text-sm">
            {about.email && emailHref && (
              <a href={emailHref} className="text-accent-blue hover:underline">
                {decodedEmail}
              </a>
            )}
            {about.location && (
              <span className="text-white/40">{about.location}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {about.stats.map((stat) => (
            <StatCard key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </Section>
  );
}
/* -- Projects Section -------------------------------------- */
function Projects() {
  return (
    <Section id="projects" className="bg-dark-800">
      <SectionHeading
        eyebrow="// projects"
        title="Things I've built"
        description="My selected projects - the ones I've spent my time on. Presenting..."
        titleClassName="mb-4"
        descriptionClassName="mb-8"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
      <div className="mt-4 text-right">
        <span className="text-white/40 text-sm">... and some more.</span>
      </div>
    </Section>
  );
}

/* -- Skills Section ---------------------------------------- */
function Skills() {
  return (
    <Section id="skills" className="bg-dark-700">
      <SectionHeading
        eyebrow="// skills"
        title="My actual stack"
        titleClassName="mb-12"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {skills.map((group) => (
          <SkillCard key={group.category} group={group} />
        ))}
      </div>
    </Section>
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
    <Section id="contact" className="bg-dark-800" containerClassName="text-center">
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
      <div className="mt-16 px-4">
        {/* Hidden anchor for deep-linking to the feedback box (used by scroll spy) */}
        <div id="feedback" className="h-0" aria-hidden="true" />
        <AnonymousMessageBox />
      </div>
    </Section>
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
      <HeroSection onNavigate={scrollTo} />
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
