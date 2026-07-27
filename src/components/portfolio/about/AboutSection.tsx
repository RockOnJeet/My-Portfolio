import { Section, SectionHeading } from "@/components/layout/Section";
import { about } from "@/data/config";
import { safeMailtoHref } from "@/lib/security";
import { decodeBase64 } from "@/lib/utils";
import { StatCard } from "./StatCard";

export function AboutSection() {
  const decodedEmail = decodeBase64(about.email);
  const emailHref = safeMailtoHref(decodedEmail);

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
            {about.location && <span className="text-white/40">{about.location}</span>}
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
