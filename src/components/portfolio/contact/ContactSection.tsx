import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Section } from "@/components/layout/Section";
import { AnonymousMessageBox } from "@/components/ui/AnonymousMessageBox";
import { about } from "@/data/config";
import { safeExternalUrl, safeMailtoHref } from "@/lib/security";
import { decodeBase64 } from "@/lib/utils";

export function ContactSection() {
  const decodedEmail = decodeBase64(about.email);
  const emailHref = safeMailtoHref(decodedEmail);
  const githubUrl = safeExternalUrl(decodeBase64(about.socials.github ?? ""));
  const instagramUrl = safeExternalUrl(decodeBase64(about.socials.instagram ?? ""));
  const linkedinUrl = safeExternalUrl(decodeBase64(about.socials.linkedin ?? ""));

  return (
    <Section id="contact" className="bg-dark-800" containerClassName="text-center">
      <div className="relative inline-block">
        <div
          className="absolute inset-0 -m-8 rounded-full blur-[80px]"
          style={{ background: "var(--accent-purple)", opacity: 0.2 }}
        />
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
        <div id="feedback" className="h-0" aria-hidden="true" />
        <AnonymousMessageBox />
      </div>
    </Section>
  );
}
