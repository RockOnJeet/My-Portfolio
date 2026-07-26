import {
  Blocks,
  FileText,
  Gauge,
  Plug,
  Settings,
  X,
} from "lucide-react";
import { Link } from "wouter";

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navigation = [
  { label: "Dashboard", href: "/admin", icon: Gauge },
  { label: "Integrations", href: "/admin/integrations", icon: Plug },
  { label: "MCP", href: "/admin/mcp", icon: Blocks },
  { label: "Site", href: "/admin/site", icon: Settings },
  { label: "Logs", href: "/admin/logs", icon: FileText },
] as const;

export default function AdminSidebar({
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const currentPath = window.location.pathname;

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col",
          "border-r border-white/[0.07] bg-[#0d1117]",
          "transition-transform duration-200 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <header className="relative px-7 pb-7 pt-7">
          <Link href="/admin" onClick={onMobileClose}>
            <span className="block text-[17px] font-semibold tracking-[0.04em] text-white">
              ROCKONJEET
            </span>
            <span className="mt-0.5 block text-[10px] font-medium tracking-[0.14em] text-white/40">
              CONTROL PLANE
            </span>
          </Link>

          <button
            type="button"
            aria-label="Close navigation"
            onClick={onMobileClose}
            className="absolute right-4 top-6 rounded-md p-2 text-white/50 transition hover:bg-white/[0.06] hover:text-white md:hidden"
          >
            <X className="size-4" />
          </button>
        </header>

        <nav className="px-4">
          <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.12em] text-white/30">
            OVERVIEW
          </p>

          <ul className="space-y-1">
            {navigation.map(({ label, href, icon: Icon }) => {
              const active =
                href === "/admin"
                  ? currentPath === href
                  : currentPath.startsWith(href);

              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onMobileClose}
                    className={[
                      "flex h-10 items-center gap-3 rounded-md px-3",
                      "text-[13px] font-medium transition-colors",
                      active
                        ? "bg-[#1f6feb]/15 text-[#58a6ff]"
                        : "text-white/55 hover:bg-white/[0.05] hover:text-white/85",
                    ].join(" ")}
                  >
                    <Icon className="size-4 shrink-0" strokeWidth={1.8} />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mx-7 mt-9 border-t border-white/[0.06] pt-6">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-white/30">
            MANAGEMENT PAGES
          </p>

          <div className="mt-4 space-y-2 text-[10px] leading-relaxed text-white/30">
            <p>Integrations → enable, connect, configure</p>
            <p>MCP → endpoint, tools, access policy</p>
            <p>Site → runtime properties</p>
            <p>Logs → diagnostics &amp; testing</p>
          </div>
        </div>

        <footer className="mt-auto flex items-center justify-between px-7 py-7">
          <span className="text-[11px] text-white/40">Production</span>
          <span
            className="size-[7px] rounded-full bg-emerald-400"
            aria-label="Production environment online"
          />
        </footer>
      </aside>
    </>
  );
}