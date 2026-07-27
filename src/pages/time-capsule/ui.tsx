import { useEffect, useMemo, useState, type ReactNode } from "react";

const hashString = (value: string) => {
  return [...value].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 0);
};

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const PAGE_SEED = Math.floor(Math.random() * 1000000);

const getPhotoSpawn = (name: string) => {
  const seed = hashString(`${name}-${PAGE_SEED}`);
  return {
    top: `${Math.round(5 + seededRandom(seed + 1) * 45)}%`,
    left: `${Math.round(5 + seededRandom(seed + 2) * 45)}%`,
    rotate: `${Math.round(-14 + seededRandom(seed + 3) * 28)}deg`,
    width: `${Math.round(30 + seededRandom(seed + 4) * 30)}%`,
    scale: 0.88 + seededRandom(seed + 5) * 0.24,
    opacity: 0.9 + seededRandom(seed + 6) * 0.09,
    zIndex: 8 + Math.round(seededRandom(seed + 7) * 16),
  };
};

type ZonePhotoEntry = {
  id: string;
  src: string;
  fullSrc: string;
  zone: string;
  label: string;
};

type ZoneLeaderStackMap = Record<string, Record<string, ZonePhotoEntry[]>>;

type ZonePhotoView = ZonePhotoEntry & ReturnType<typeof getPhotoSpawn> & {
  zIndex: number;
};

const ZONE_IMAGE_MODULES = import.meta.glob("./zone-photos/**/*.{png,jpg,jpeg,webp,heic,HEIC}", {
  eager: true,
}) as Record<string, { default: string }>;

const ZONE_PREVIEW_MODULES = import.meta.glob("./zone-photos-previews/**/*.{png,jpg,jpeg,webp}", {
  eager: true,
}) as Record<string, { default: string }>;

const ZONE_LEADER_STACKS: ZoneLeaderStackMap = {};

const getPreviewPath = (path: string) =>
  path
    .replace("./zone-photos/", "./zone-photos-previews/")
    .replace(/\.(png|jpe?g|webp|heic)$/i, ".webp");

const ZONE_PHOTOS = Object.entries(ZONE_IMAGE_MODULES).reduce<Record<string, ZonePhotoEntry[]>>((acc, [path, module]) => {
  const match = path.match(/\.\/zone-photos\/([^/]+)\/([^/]+?)(?:\/(.+))?$/);
  if (!match) {
    return acc;
  }

  const zone = match[1];
  const firstPart = match[2];
  const nested = match[3];
  const leaderLabel = firstPart.replace(/\.[^/.]+$/, "");
  const leaderId = `${zone}:${leaderLabel}`;
  const previewModule = ZONE_PREVIEW_MODULES[getPreviewPath(path)];

  if (!nested) {
    acc[zone] = [
      ...(acc[zone] ?? []),
      {
        id: leaderId,
        src: previewModule?.default ?? module.default,
        fullSrc: module.default,
        zone,
        label: leaderLabel,
      },
    ];
  } else {
    const label = nested.split("/").pop()?.replace(/\.[^/.]+$/, "") ?? nested;
    ZONE_LEADER_STACKS[zone] = {
      ...(ZONE_LEADER_STACKS[zone] ?? {}),
      [leaderId]: [
        ...(ZONE_LEADER_STACKS[zone]?.[leaderId] ?? []),
        {
          id: `${leaderId}:${nested}`,
          src: previewModule?.default ?? module.default,
          fullSrc: module.default,
          zone,
          label,
        },
      ],
    };
  }

  return acc;
}, {});

export { ZONE_LEADER_STACKS };

export const useIntersectionObserver = (options = {}) => {
  const [elements, setElements] = useState<Element[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          const index = entry.target.getAttribute("data-index");
          if (index) {
            (entry.target as HTMLElement).style.transitionDelay = `${parseInt(index) * 0.15}s`;
          }
        }
      });
    }, { threshold: 0.1, ...options });

    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [elements, options]);

  const ref = (el: Element | null) => {
    if (el && !elements.includes(el)) {
      setElements(prev => [...prev, el]);
    }
  };

  return ref;
};

type SectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export const Section = ({ children, className = "", id = "" }: SectionProps) => {
  return (
    <section id={id} className={`min-h-screen py-24 flex flex-col justify-center relative z-10 ${className}`}>
      {children}
    </section>
  );
};

type ZoneProps = {
  children: ReactNode;
  name: string;
  className?: string;
  prioritizePhotos?: boolean;
  onPhotoClick?: (photo: { id: string; src: string; fullSrc: string; zone: string; label: string }) => void;
};

export const Zone = ({ children, name, className = "", prioritizePhotos = false, onPhotoClick }: ZoneProps) => {
  const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([]);
  const [removingPhotoIds, setRemovingPhotoIds] = useState<string[]>([]);
  const photoSources = ZONE_PHOTOS[name] ?? [];

  const photoEntries = useMemo<ZonePhotoView[]>(() => {
    if (photoSources.length > 0) {
      return photoSources.map((photo, index) => ({
        id: photo.id,
        src: photo.src,
        fullSrc: photo.fullSrc,
        zone: photo.zone,
        label: photo.label,
        ...getPhotoSpawn(`${name}-${index}`),
        zIndex: 10 + index,
      }));
    }

    return Array.from({ length: 2 }, (_, index) => ({
      id: `${name}-placeholder-${index}`,
      src: "",
      fullSrc: "",
      zone: name,
      label: "",
      ...getPhotoSpawn(`${name}-placeholder-${index}`),
      zIndex: 1 + index,
    }));
  }, [name, photoSources]);

  const photos = useMemo(
    () => photoEntries.filter((photo) => !removedPhotoIds.includes(photo.id)),
    [photoEntries, removedPhotoIds]
  );

  const handlePhotoRemoval = (photoId: string) => {
    if (removingPhotoIds.includes(photoId) || removedPhotoIds.includes(photoId)) {
      return;
    }

    setRemovingPhotoIds((prev) => [...prev, photoId]);
    window.setTimeout(() => {
      setRemovedPhotoIds((prev) => [...prev, photoId]);
      setRemovingPhotoIds((prev) => prev.filter((id) => id !== photoId));
    }, 240);
  };

  return (
    <div className={`relative text-zone overflow-visible ${className}`} data-zone={name}>
      {photos.map((photo) => {
        const isRemoving = removingPhotoIds.includes(photo.id);
        const label = photo.src
          ? `Memory from ${name.replace(/_/g, " ")}`
          : `Placeholder in ${name.replace(/_/g, " ")}`;

        return (
          <button
            key={photo.id}
            type="button"
            className={`zone-spawn ${isRemoving ? "removing" : ""}`}
            style={{
              top: photo.top,
              left: photo.left,
              width: photo.width,
              opacity: photo.opacity,
              zIndex: photo.zIndex,
            }}
            onClick={() => {
              if (onPhotoClick) {
                onPhotoClick({ id: photo.id, src: photo.src, fullSrc: photo.fullSrc, zone: name, label });
                handlePhotoRemoval(photo.id);
                return;
              }

              if (photo.fullSrc) {
                window.open(photo.fullSrc, "_blank", "noopener,noreferrer");
                handlePhotoRemoval(photo.id);
              }
            }}
            aria-label={photo.src ? `Open photo in ${name}` : `Zone placeholder in ${name}`}
          >
            <div
              className="zone-photo"
              style={{
                transform: `rotate(${photo.rotate}) scale(${photo.scale})`,
                transition: "opacity 220ms ease, transform 220ms ease",
              }}
            >
              <div className="zone-photo-frame">
                {photo.src ? (
                  <img
                    src={photo.src}
                    alt={label}
                    loading={prioritizePhotos ? "eager" : "lazy"}
                    fetchPriority={prioritizePhotos ? "high" : "auto"}
                    decoding="async"
                    className="zone-photo-img"
                  />
                ) : (
                  <div className="zone-photo-placeholder" />
                )}
              </div>
            </div>
          </button>
        );
      })}
      {children}
    </div>
  );
};

type FadeInProps = {
  children: ReactNode;
  className?: string;
  index?: number;
};

export const FadeIn = ({ children, className = "", index = 0 }: FadeInProps) => {
  const ref = useIntersectionObserver();
  return (
    <div ref={ref} className={`fade-in-up ${className}`} data-index={index}>
      {children}
    </div>
  );
};

export const TickerItem = ({ time, text }: { time: string; text: string }) => (
  <span className="inline-flex items-center mx-8 text-zinc-500 font-jb text-sm">
    <span className="text-glow mr-3 opacity-70">{time}</span>
    <span className="opacity-60">— {text}</span>
  </span>
);
