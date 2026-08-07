import { ExternalLink, Star } from "lucide-react";
import { Card } from "@/components/layout/Card";
import { safeExternalUrl } from "@/lib/security";
import type { Project } from "@/types/portfolio";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const projectUrl = safeExternalUrl(project.url);
  const liveUrl = safeExternalUrl(project.liveUrl);

  return (
    <Card variant="interactive" className="group flex flex-col">
      <div className="flex items-start justify-between mb-3">
        {projectUrl ? (
          <a
            href={projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="font-semibold text-accent-blue hover:underline"
          >
            {project.name}
          </a>
        ) : (
          <span className="font-semibold text-white/50">{project.name}</span>
        )}
        <span className="text-xs text-white/30 border border-white/10 rounded-full px-2 py-0.5 ml-2 shrink-0">
          Public
        </span>
      </div>
      <p className="text-sm text-white/50 leading-5 flex-1 mb-4">
        {project.description}
      </p>
      <div className="flex items-center gap-4 text-xs text-white/40">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.languageColor }} />
          {project.language}
        </span>
        <span className="flex items-center gap-1"><Star size={12} />{project.stars}</span>
        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="ml-auto flex items-center gap-1 hover:text-white transition-colors"
          >
            <ExternalLink size={12} /> Live
          </a>
        )}
      </div>
    </Card>
  );
}
