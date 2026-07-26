import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  containerClassName?: string;
}

export function Section({ children, className, containerClassName, ...props }: SectionProps) {
  return (
    <section
      className={cn("border-t border-white/10 py-24 px-4", className)}
      {...props}
    >
      <div className={cn("max-w-[1280px] mx-auto", containerClassName)}>
        {children}
      </div>
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeadingProps) {
  return (
    <header className={className}>
      <p className="text-success-500 font-mono text-sm mb-3">{eyebrow}</p>
      <h2 className={cn("text-3xl md:text-4xl font-bold text-white", titleClassName)}>
        {title}
      </h2>
      {description && (
        <p className={cn("text-white/50 text-lg max-w-2xl", descriptionClassName)}>
          {description}
        </p>
      )}
    </header>
  );
}
