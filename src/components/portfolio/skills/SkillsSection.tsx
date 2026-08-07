import { Section, SectionHeading } from "@/components/layout/Section";
import { skills } from "@/data/config";
import { SkillCard } from "./SkillCard";

export function SkillsSection() {
  return (
    <Section id="skills" className="bg-dark-700">
      <SectionHeading eyebrow="// skills" title="My actual stack" titleClassName="mb-12" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {skills.map((group) => (
          <SkillCard key={group.category} group={group} />
        ))}
      </div>
    </Section>
  );
}
