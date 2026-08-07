import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hero } from "@/data/config";

export function useHeroHeadline() {
  const headlineVariants = useMemo(
    () =>
      (hero.headlineVariants ?? []).map((variant) =>
        typeof variant === "string"
          ? { text: variant, weight: 1 }
          : { text: variant.text, weight: variant.weight ?? 1 },
      ),
    [],
  );

  const getRandomHeadline = useCallback(() => {
    if (headlineVariants.length === 0) return hero.headline;

    const totalWeight = headlineVariants.reduce((sum, variant) => sum + variant.weight, 0);
    let randomWeight = Math.random() * totalWeight;

    for (const variant of headlineVariants) {
      randomWeight -= variant.weight;
      if (randomWeight <= 0) return variant.text;
    }

    return headlineVariants[headlineVariants.length - 1].text;
  }, [headlineVariants]);

  const [selectedHeadline, setSelectedHeadline] = useState(getRandomHeadline);
  const [typedHeadline, setTypedHeadline] = useState("");
  const [showNote, setShowNote] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const headingHadFocusRef = useRef(false);
  const headingIsVisibleRef = useRef(false);
  const hasRandomizedSinceVisibleRef = useRef(true);

  const randomizeHeadline = useCallback(() => {
    setSelectedHeadline(getRandomHeadline());
    hasRandomizedSinceVisibleRef.current = true;
  }, [getRandomHeadline]);

  const handleHeadingFocus = useCallback(() => {
    if (
      !headingHadFocusRef.current &&
      headingIsVisibleRef.current &&
      !hasRandomizedSinceVisibleRef.current
    ) {
      randomizeHeadline();
      headingHadFocusRef.current = true;
    }
  }, [randomizeHeadline]);

  const handleHeadingBlur = useCallback(() => {
    headingHadFocusRef.current = false;
  }, []);

  useEffect(() => {
    const node = headingRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isVisible = entry.isIntersecting;
          if (headingIsVisibleRef.current && !isVisible) {
            hasRandomizedSinceVisibleRef.current = false;
            headingHadFocusRef.current = false;
          }
          headingIsVisibleRef.current = isVisible;
          if (isVisible && !hasRandomizedSinceVisibleRef.current) randomizeHeadline();
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [randomizeHeadline]);

  useEffect(() => {
    setTypedHeadline("");
    setShowNote(false);

    let index = 0;
    let timer: number;
    let noteTimer: number;
    const typeNext = () => {
      index += 1;
      setTypedHeadline(selectedHeadline.slice(0, index));
      if (index < selectedHeadline.length) timer = window.setTimeout(typeNext, 40);
      else noteTimer = window.setTimeout(() => setShowNote(true), 250);
    };

    timer = window.setTimeout(typeNext, 400);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(noteTimer);
    };
  }, [selectedHeadline]);

  return { typedHeadline, showNote, headingRef, handleHeadingFocus, handleHeadingBlur };
}
