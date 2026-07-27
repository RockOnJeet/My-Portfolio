import { useState } from "react";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { nav, hero, about, projects, skills } from "@/data/config";
import { decodeBase64 } from "@/lib/utils";
import { safeExternalUrl, safeMailtoHref } from "@/lib/security";
import { isSupportedEditorLanguage, tokenizeForEditor } from "@/lib/syntaxHighlight";
import { AnonymousMessageBox } from "@/components/ui/AnonymousMessageBox";
import { FullscreenNotification } from "@/components/ui/fullscreen-notification";
import { Section, SectionHeading } from "@/components/layout/Section";
import { SectionDivider } from "@/components/layout/SectionDivider";
import { ProjectCard } from "@/components/portfolio/projects/ProjectCard";
import { SkillCard } from "@/components/portfolio/skills/SkillCard";
import { StatCard } from "@/components/portfolio/about/StatCard";
import { HeroSection } from "@/components/portfolio/hero/HeroSection";
import { Navbar } from "@/components/portfolio/navigation/Navbar";
import { Footer } from "@/components/portfolio/navigation/Footer";
import { usePortfolioNavigation } from "@/hooks/portfolio/usePortfolioNavigation";

/* -- About Section ----------------------------------------- */
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

/* ── Root ────────────────────────────────────────────────── */
export default function Portfolio() {
  const [showTempNotification, setShowTempNotification] = useState(true);
  const { navigate } = usePortfolioNavigation();


  return (
    <div className="min-h-screen" style={{ background: "var(--bg-dark-800)" }}>
      <Navbar onNavigate={navigate} />
      <HeroSection onNavigate={navigate} />
      <About />
      <SectionDivider />
      <Projects />
      <SectionDivider />
      <Skills />
      <Contact />
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
            style={{ background: 'var(--spotify-green)' }}
          >
            Open TARDIS - A time capsule
          </a>
        </div>
      </FullscreenNotification>
    </div>
  );
}
