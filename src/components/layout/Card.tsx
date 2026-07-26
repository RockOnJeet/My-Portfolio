import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "interactive";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 p-6",
        variant === "interactive"
          ? "bg-dark-700 transition-all duration-200 hover:border-white/20 hover:bg-dark-700"
          : "bg-dark-800",
        className,
      )}
      {...props}
    />
  );
}
