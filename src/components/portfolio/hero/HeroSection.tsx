import { HeroBackground } from "./HeroBackground";
import { HeroEditor } from "./HeroEditor";
import { HeroHeadline } from "./HeroHeadline";
import { useHeroEditor } from "@/hooks/portfolio/useHeroEditor";
import { useHeroHeadline } from "@/hooks/portfolio/useHeroHeadline";

interface HeroSectionProps {
  onNavigate: (href: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const headline = useHeroHeadline();
  const editor = useHeroEditor();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-dark-800 pt-16">
      <HeroBackground />
      <HeroHeadline
        typedHeadline={headline.typedHeadline}
        showNote={headline.showNote}
        headingRef={headline.headingRef}
        onHeadingFocus={headline.handleHeadingFocus}
        onHeadingBlur={headline.handleHeadingBlur}
        onNavigate={onNavigate}
      />
      <HeroEditor {...editor} />
    </section>
  );
}
