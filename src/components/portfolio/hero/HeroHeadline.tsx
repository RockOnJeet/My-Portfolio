import type { FocusEventHandler, RefObject } from "react";
import { ChevronDown } from "lucide-react";
import { hero } from "@/data/config";

interface HeroHeadlineProps {
  typedHeadline: string;
  showNote: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onHeadingFocus: FocusEventHandler<HTMLHeadingElement>;
  onHeadingBlur: FocusEventHandler<HTMLHeadingElement>;
  onNavigate: (href: string) => void;
}

function renderMutedSegments(text: string, lineIndex: number) {
  return text.split(/(\{[^}]+\})/g).map((part, index) =>
    part.startsWith("{") && part.endsWith("}") ? (
      <span key={`muted-${lineIndex}-${index}`} className="text-white/40">
        {part.slice(1, -1)}
      </span>
    ) : (
      <span key={`muted-${lineIndex}-${index}`}>{part}</span>
    ),
  );
}

export function HeroHeadline({
  typedHeadline,
  showNote,
  headingRef,
  onHeadingFocus,
  onHeadingBlur,
  onNavigate,
}: HeroHeadlineProps) {
  const typedLines = typedHeadline.split("\n");
  const [noteLine, ...sublineLines] = hero.subline.split("\n");

  return (
    <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
      <div className="relative inline-block pb-10">
        <h1
          ref={headingRef}
          tabIndex={0}
          onFocus={onHeadingFocus}
          onBlur={onHeadingBlur}
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6"
        >
          <code className="text-inherit block terminal-font">
            {typedLines.map((line, index) => {
              const isLastLine = index === typedLines.length - 1;
              return (
                <span key={`typed-${index}`} className={isLastLine ? "block text-center" : "block"}>
                  {isLastLine ? (
                    <>
                      <span>{renderMutedSegments(line, index)}</span>
                      {typedHeadline.length > 0 && (
                        <span className="inline-block ml-1 opacity-0 animate-blink-cursor">_</span>
                      )}
                    </>
                  ) : (
                    <span className="inline-block">{renderMutedSegments(line, index)}</span>
                  )}
                </span>
              );
            })}
          </code>
        </h1>
        <span
          className={`mt-2 text-xs text-white/40 text-left opacity-0 transition-opacity duration-500 ease-out sm:absolute sm:-right-8 sm:bottom-8 sm:translate-x-4 sm:text-right sm:whitespace-nowrap ${showNote ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: showNote ? "250ms" : "0ms" }}
        >
          {noteLine}
        </span>
      </div>

      <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
        {sublineLines.map((line, index) => {
          const highlightStart = line.indexOf("[");
          const highlightEnd = line.indexOf("]", highlightStart + 1);
          if (highlightStart !== -1 && highlightEnd !== -1) {
            return (
              <span key={`subline-${index}`} className="block">
                {line.slice(0, highlightStart)}
                <span className="text-accent-blue font-semibold">
                  {line.slice(highlightStart + 1, highlightEnd)}
                </span>
                {line.slice(highlightEnd + 1)}
              </span>
            );
          }
          return <span key={`subline-${index}`} className="block">{line}</span>;
        })}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button onClick={() => onNavigate(hero.primaryCta.href)} className="w-full sm:w-auto px-6 py-3 rounded-md text-base font-semibold text-white transition-colors cursor-pointer" style={{ background: "var(--success-500)" }}>
          {hero.primaryCta.label}
        </button>
        <button onClick={() => onNavigate(hero.secondaryCta.href)} className="w-full sm:w-auto px-6 py-3 rounded-md text-base font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors cursor-pointer">
          {hero.secondaryCta.label}
        </button>
      </div>

      <button onClick={() => onNavigate("#about")} className="mt-16 inline-flex flex-col items-center gap-1 text-white/30 hover:text-white/60 transition-colors text-xs cursor-pointer">
        <span>Scroll down</span>
        <ChevronDown size={16} className="animate-bounce" />
      </button>
    </div>
  );
}
