import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { nav } from "@/data/config";

interface NavbarProps {
  onNavigate: (href: string) => void;
}

export function Navbar({ onNavigate }: NavbarProps) {
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
      const left = Math.min(Math.max(16, triggerRect.left), window.innerWidth - minWidth - 16);
      setDropdownStyle({ position: "fixed", top: triggerRect.bottom + 8, left, minWidth, zIndex: 100000 });
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
      if (!othersTriggerRef.current?.contains(event.target as Node) && !othersPortalRef.current?.contains(event.target as Node)) {
        setOthersOpen(false);
      }
    };
    if (!othersOpen) return;
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [othersOpen]);

  const navigateAndCloseMobile = (href: string) => {
    onNavigate(href);
    setMenuOpen(false);
  };

  return (
    <header className={["fixed top-0 left-0 right-0 z-50 transition-all duration-200", scrolled ? "bg-dark-900 backdrop-blur border-b border-white/10" : "bg-transparent"].join(" ")}>
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-16 flex items-center gap-6">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 text-white shrink-0 cursor-pointer active:scale-95 active:brightness-90 transition-transform">
          <svg aria-hidden="true" viewBox="0 0 24 24" width={28} height={28} className="stroke-current" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="7 7 3 12 7 17" />
            <polyline points="17 7 21 12 17 17" />
            <line x1="10" y1="16" x2="14" y2="8" />
          </svg>
          <span className="font-semibold text-sm">{nav.name}</span>
        </button>

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {nav.links.map((link) => (
            <button key={link.label} onClick={() => onNavigate(link.href)} className="px-3 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-md hover:bg-white/5 cursor-pointer active:scale-95 active:brightness-90 active:shadow-inner">
              {link.label}
            </button>
          ))}

          {nav.others?.length ? (
            <div>
              <button type="button" ref={othersTriggerRef} onClick={() => setOthersOpen((open) => !open)} className="px-3 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-md hover:bg-white/5 cursor-pointer active:scale-95 active:brightness-90 inline-flex items-center gap-2 leading-none">
                Others
                <ChevronDown size={14} className={othersOpen ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>
              {othersOpen && dropdownStyle ? createPortal(
                <div ref={othersPortalRef} style={dropdownStyle} className="overflow-hidden rounded-xl border border-white/20 bg-white/10 p-1 shadow-lg shadow-white/5 backdrop-blur-xl backdrop-saturate-150">
                  {nav.others.map((item) => item.external ? (
                    <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="block rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors">{item.label}</a>
                  ) : (
                    <button key={item.label} type="button" onClick={() => { onNavigate(item.href); setOthersOpen(false); }} className="w-full text-left rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors">{item.label}</button>
                  ))}
                </div>, document.body) : null}
            </div>
          ) : null}
        </nav>

        <div className="flex-1 md:flex-none" />
        <button onClick={() => onNavigate(nav.cta.href)} className="hidden md:inline-flex items-center px-4 py-1.5 rounded-md text-sm font-medium bg-card text-muted-500 cursor-pointer shadow-sm transition-all hover:shadow-[0_0_15px_0_rgba(255,255,255,0.35)] active:scale-95 active:shadow-[0_0_12px_0_rgba(255,255,255,0.25)]">{nav.cta.label}</button>
        <button className="md:hidden text-white p-1 cursor-pointer active:scale-95 active:brightness-90 transition-transform" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-white/10 px-4 pb-4 space-y-1">
          {nav.links.map((link) => (
            <button key={link.label} onClick={() => navigateAndCloseMobile(link.href)} className="block w-full text-left py-2 px-3 text-sm text-white/70 hover:text-white rounded-md hover:bg-white/5 cursor-pointer active:scale-95 active:brightness-90 active:shadow-inner">{link.label}</button>
          ))}
          <button onClick={() => navigateAndCloseMobile(nav.cta.href)} className="block w-full text-left py-2 px-3 text-sm font-medium text-white cursor-pointer">{nav.cta.label}</button>
          {nav.others?.length ? (
            <div className="mt-2 border-t border-white/10 pt-2">
              <div className="px-3 text-xs uppercase tracking-[0.15em] text-white/40 pb-2">Others</div>
              {nav.others.map((item) => item.external ? (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="block w-full text-left py-2 px-3 text-sm text-white/70 hover:text-white rounded-md hover:bg-white/5 transition-colors" onClick={() => setMenuOpen(false)}>{item.label}</a>
              ) : (
                <button key={item.label} onClick={() => navigateAndCloseMobile(item.href)} className="block w-full text-left py-2 px-3 text-sm text-white/70 hover:text-white rounded-md hover:bg-white/5 transition-colors">{item.label}</button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </header>
  );
}
