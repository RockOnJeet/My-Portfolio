import { FaCloudflare } from "react-icons/fa";
import { nav } from "@/data/config";

interface FooterProps {
  onNavigate: (href: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-dark-900 border-t border-white/10 py-10 px-4">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
        <div className="flex items-center gap-2">
          <FaCloudflare size={16} />
          <span>Built with Replit · On Cloudfare Pages</span>
        </div>
        <div className="flex gap-4">
          {nav.links.map((link) => (
            <button key={link.label} onClick={() => onNavigate(link.href)} className="hover:text-white/60 transition-colors">
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
