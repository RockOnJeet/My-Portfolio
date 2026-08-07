import { Card } from "@/components/layout/Card";
import type { SkillGroup } from "@/types/portfolio";

interface SkillCardProps {
  group: SkillGroup;
}

export function SkillCard({ group }: SkillCardProps) {
  return (
    <Card className="space-y-3">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
        {group.category}
      </h3>
      <ul className="space-y-2">
        {group.items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-white/80">
            <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}
