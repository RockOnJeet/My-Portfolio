import { Menu } from "lucide-react";
import { type ReactNode, useState } from "react";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090d12] text-white">
      <AdminSidebar
        mobileOpen={mobileNavigationOpen}
        onMobileClose={() => setMobileNavigationOpen(false)}
      />

      <div className="min-h-screen md:pl-[248px]">
        <header className="flex h-14 items-center border-b border-white/[0.07] px-4 md:hidden">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileNavigationOpen(true)}
            className="rounded-md p-2 text-white/60 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Menu className="size-5" />
          </button>

          <div className="ml-3">
            <p className="text-xs font-semibold tracking-[0.04em]">
              ROCKONJEET
            </p>
            <p className="text-[9px] tracking-[0.12em] text-white/35">
              CONTROL PLANE
            </p>
          </div>
        </header>

        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}