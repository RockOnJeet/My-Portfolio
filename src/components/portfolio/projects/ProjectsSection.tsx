import { Section, SectionHeading } from "@/components/layout/Section";
import { projects } from "@/data/config";
import { ProjectCard } from "./ProjectCard";

export function ProjectsSection() {
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
