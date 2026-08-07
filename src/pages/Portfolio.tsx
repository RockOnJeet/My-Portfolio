import { useState } from "react";
import { FullscreenNotification } from "@/components/ui/fullscreen-notification";
import { SectionDivider } from "@/components/layout/SectionDivider";
import { AboutSection } from "@/components/portfolio/about/AboutSection";
import { ContactSection } from "@/components/portfolio/contact/ContactSection";
import { HeroSection } from "@/components/portfolio/hero/HeroSection";
import { Footer } from "@/components/portfolio/navigation/Footer";
import { Navbar } from "@/components/portfolio/navigation/Navbar";
import { ProjectsSection } from "@/components/portfolio/projects/ProjectsSection";
import { SkillsSection } from "@/components/portfolio/skills/SkillsSection";
import { usePortfolioNavigation } from "@/hooks/portfolio/usePortfolioNavigation";

export default function Portfolio() {
  const [showTempNotification, setShowTempNotification] = useState(true);
  const { navigate } = usePortfolioNavigation();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-dark-800)" }}>
      <Navbar onNavigate={navigate} />
      <HeroSection onNavigate={navigate} />
      <AboutSection />
      <SectionDivider />
      <ProjectsSection />
      <SectionDivider />
      <SkillsSection />
      <ContactSection />
      <Footer onNavigate={navigate} />

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
            style={{ background: "var(--spotify-green)" }}
          >
            Open TARDIS - A time capsule
          </a>
        </div>
      </FullscreenNotification>
    </div>
  );
}
