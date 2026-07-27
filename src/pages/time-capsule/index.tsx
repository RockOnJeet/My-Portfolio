import { useEffect, useRef, useState } from "react";
import { FullscreenNotification } from "@/components/ui/fullscreen-notification";
import { STYLES } from "./styles";
import { FadeIn, Section, TickerItem, Zone, ZONE_LEADER_STACKS } from "./ui";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type StackPhoto = {
  id: string;
  src: string;
  fullSrc: string;
  zone: string;
  label: string;
};

type PhotoStack = {
  id: string;
  leader: StackPhoto;
  members: StackPhoto[];
};

// small helper to derive a stable-ish short hash for strings
function hashCode(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

const VIDEO_MODULES = import.meta.glob("./videos/*.{mp4,webm,ogg}") as Record<
  string,
  () => Promise<{ default: string }>
>;

export default function TimeCapsule() {
  const [booted, setBooted] = useState(false);
  const [activeTickerTime, setActiveTickerTime] = useState("23:47");
  const [selectedStack, setSelectedStack] = useState<PhotoStack | null>(null);
  const [collectedStacks, setCollectedStacks] = useState<PhotoStack[]>([]);
  const [stackCarouselApi, setStackCarouselApi] = useState<CarouselApi | null>(null);
  const [activeStackPhotoIndex, setActiveStackPhotoIndex] = useState(0);
  type VideoSource = { src: string; title: string; caption: string };
  const [videos, setVideos] = useState<VideoSource[]>([]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const [videoCarouselApi, setVideoCarouselApi] = useState<CarouselApi | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  const tickerItems = [
    { time: "23:47", text: "sensor drift again, filtering isn't working" },
    { time: "00:15", text: "refactored PID loop" },
    { time: "01:22", text: "fixed drift, new issue: quaternions" },
    { time: "02:10", text: "maths not mathing" },
    { time: "02:58", text: "a spare minus sign creeped in the code... why" },
    { time: "03:40", text: "why does right move when left is pressed?!" },
    { time: "04:15", text: "floating ground. it was a floating ground." },
    { time: "04:50", text: "commit: 'final fix v3 real' & go to sleep" },
  ];

  const handlePhotoClick = (photo: StackPhoto) => {
    const members = ZONE_LEADER_STACKS[photo.zone]?.[photo.id] ?? [];
    const stack: PhotoStack = {
      id: photo.id,
      leader: photo,
      members,
    };

    setSelectedStack(stack);
    setCollectedStacks((prev) =>
      prev.some((item) => item.id === stack.id) ? prev : [...prev, stack]
    );
  };

  useEffect(() => {
    const offset = 3;
    const intervalMs = 40000 / tickerItems.length;
    let index = 0;

    setActiveTickerTime(tickerItems[offset].time);

    const interval = setInterval(() => {
      index = (index + 1) % tickerItems.length;
      const displayIndex = (index + offset) % tickerItems.length;
      setActiveTickerTime(tickerItems[displayIndex].time);
    }, intervalMs);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setActiveStackPhotoIndex(0);
  }, [selectedStack]);

  useEffect(() => {
    if (!stackCarouselApi) {
      return;
    }

    const handleSelect = () => {
      setActiveStackPhotoIndex(stackCarouselApi.selectedScrollSnap());
    };

    handleSelect();
    stackCarouselApi.on("select", handleSelect);
    stackCarouselApi.on("reInit", handleSelect);

    return () => {
      stackCarouselApi.off("select", handleSelect);
      stackCarouselApi.off("reInit", handleSelect);
    };
  }, [stackCarouselApi]);

  useEffect(() => {
    if (!videoCarouselApi) {
      return;
    }

    const handleSelect = () => {
      setActiveVideoIndex(videoCarouselApi.selectedScrollSnap());
    };

    handleSelect();
    videoCarouselApi.on("select", handleSelect);
    videoCarouselApi.on("reInit", handleSelect);

    return () => {
      videoCarouselApi.off("select", handleSelect);
      videoCarouselApi.off("reInit", handleSelect);
    };
  }, [videoCarouselApi]);

  // Lazy-load video modules when the video container enters the viewport
  useEffect(() => {
    if (videos.length > 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            void (async () => {
              try {
                const results = await Promise.all(
                  Object.entries(VIDEO_MODULES).map(async ([path, loader]) => {
                    const module = await loader();
                    const fileName = path.split("/").pop()?.replace(/\.(mp4|webm|ogg)$/i, "") ?? "video";
                    const label = fileName.replace(/[-_]/g, " ");
                    return { src: module.default, title: label, caption: `Archive clip — ${label}` };
                  })
                );
                setVideos(results);
              } catch (e) {
                // ignore load errors
              }
            })();

            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );

    if (videoContainerRef.current) observer.observe(videoContainerRef.current);

    return () => observer.disconnect();
  }, [videos.length]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video || index === activeVideoIndex) {
        return;
      }

      if (!video.paused) {
        video.pause();
      }
    });
  }, [activeVideoIndex, videos.length]);

  return (
    <div className="bg-void text-zinc-300 font-inter min-h-[100dvh] w-full overflow-x-hidden selection:bg-lime-900 selection:text-lime-100">
      <style>{STYLES}</style>
      <div className="grid-bg" />
      <div className="scanlines" />

      <main className="max-w-4xl mx-auto px-6 sm:px-12 relative min-w-0 overflow-visible">
        <Zone name="INIT_SEQUENCE" className="rounded-[28px] p-8 hero-zone" onPhotoClick={handlePhotoClick}>
          <Section className="items-start">
            <div className="mt-[-10vh]">
              <div className="hero-command relative font-jb text-glow text-sm sm:text-base md:text-lg mb-8 inline-flex items-center overflow-hidden">
                <span className="animate-typing">
                  $ init career.sh --student=soumyajit --years=4
                </span>
                <span className="animate-cursor inline-block ml-1 h-5 w-1.5 bg-lime-400 align-middle" />
              </div>

              <div className={`transition-opacity duration-1000 delay-500 ${booted ? 'opacity-100' : 'opacity-0'}`}>
                <div className="rounded-[32px] bg-zinc-950/80 p-6 border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
                  <h1 className="font-fraunces text-4xl sm:text-5xl md:text-6xl font-light text-zinc-100 leading-tight mb-4 max-w-full break-words">
                    Four years of quiet obsession,<br />
                    <span className="text-zinc-400">compiled and executed.</span>
                  </h1>
                  <p className="text-zinc-400 text-lg max-w-full md:max-w-2xl font-light leading-relaxed mb-6">
                    A personal time capsule for the late nights, the burnt circuits, and the code that ran when it mattered. What remains is memory, logged to output.
                  </p>
                  <div className="inline-flex items-center gap-2 rounded-full border border-lime-500/20 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.3em] text-lime-300 shadow-sm">
                    <span className="inline-flex h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
                    <span>Interact with the page — collect hidden memories</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={`absolute bottom-12 left-4 sm:left-6 transition-opacity duration-1000 delay-1000 ${booted ? 'opacity-50' : 'opacity-0'}`}>
              <div className="flex flex-col items-center gap-2">
                <span className="font-jb text-xs tracking-widest uppercase rotate-90 origin-left translate-x-4 mb-16">
                  Scroll to run
                </span>
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-lime-500 to-transparent animate-[pulse-slow_2s_infinite]" />
              </div>
            </div>
          </Section>
        </Zone>

        <Zone name="STARTUP" className="rounded-[28px] p-8" onPhotoClick={handlePhotoClick}>
          <Section>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
              <FadeIn className="md:col-span-4 md:sticky md:top-24">
                <span className="font-jb text-zinc-600 text-sm mb-4 block">// init_sequence</span>
                <h2 className="font-fraunces text-3xl text-zinc-100 mb-2">Year One</h2>
                <p className="font-jb text-xs text-glow opacity-80 uppercase tracking-widest">The Curiosity Install</p>
              </FadeIn>

              <div className="md:col-span-8 space-y-8 text-lg text-zinc-400 font-light leading-relaxed">
                <FadeIn index={1}>
                  <p>
                    It all started with a blink. Not an epiphany, just an LED on some popular IC I'd never heard of. I arrived with wide eyes, carrying textbooks that felt heavy and a borrowed laptop from parents that felt empty. I didn't know the difference between a microcontroller and a microprocessor.
                  </p>
                </FadeIn>
                <FadeIn index={2}>
                  <p>
                    I remember staring at lines of arduino C, feeling like I was trying to read a now extinct language. The compiler errors were everywhere I touched.
                  </p>
                </FadeIn>
                <FadeIn index={3} className="pl-6 border-l border-zinc-800 my-8">
                  <code className="font-jb text-sm text-zinc-500 block">
                    while (learning) {'{'}<br />
                    &nbsp;&nbsp;// copy-paste from websites<br />
                    &nbsp;&nbsp;while (!compile()) {'{'}<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;// try new code from another website<br />
                    &nbsp;&nbsp;{'}'}<br />
                    &nbsp;&nbsp;if (compile()) {'{'}<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;// check what changed<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;// understand a little<br />
                    &nbsp;&nbsp;{'}'}<br />
                    &nbsp;&nbsp;try_again();<br />
                    {'}'}
                  </code>
                </FadeIn>
                <FadeIn index={4}>
                  <p>
                    But then, something compiled. The logic held. The LED blinked exactly when I told it to. The motor ran at the speed I wanted. I quickly realized that the machine could be made to do anything, as long as I could figure out the right incantation. It was a drug. I chased that high for four years.
                  </p>
                </FadeIn>
              </div>
            </div>
          </Section>
        </Zone>

        <Section>
          <div className="ambient-glow w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
            <div className="space-y-6">
              <Zone name="ENVIRONMENT" className="rounded-[28px] p-8" onPhotoClick={handlePhotoClick}>
                <FadeIn>
                  <span className="font-jb text-zinc-600 text-sm mb-4 block">// execution_environment</span>
                  <h2 className="font-fraunces text-3xl text-zinc-100 mb-6">The Robotics Club</h2>
                  <p className="text-zinc-400 font-light leading-relaxed text-lg mb-4">
                    The classrooms taught theory; the club taught jugaad (reality). It was chaos when we arrived, and I got to a fight with a senior explaining why I can't re-design the remote.
                  </p>
                  <p className="text-zinc-400 font-light leading-relaxed text-lg">
                    We argued over architecture. We blamed the hardware when the software failed, and the software when the hardware smoked. It was a crucible of iteration. This is where I actually learned how to build - not just code, but systems that interacted the physical world and understood its nuances.
                  </p>
                </FadeIn>
              </Zone>
            </div>

            <FadeIn index={2} className="relative mt-8 md:mt-0">
              <div className="glass-card rounded-lg p-6 font-jb text-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] ring-1 ring-black/10" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840] ring-1 ring-black/10" />
                  <span className="ml-2 text-zinc-400">terminal - bash</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Component:</span>
                    <span className="text-zinc-300">Autonomous Nav</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Status:</span>
                    <span className="text-amber-glow">47 compile errors</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Voltage:</span>
                    <span className="text-glow">3.3V (Stable)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Last commit:</span>
                    <span className="text-zinc-300">03:12 AM</span>
                  </div>
                  <div className="pt-4 mt-4 border-t border-zinc-800">
                    <span className="text-glow">$ make run</span><br />
                    <span className="text-red-400 opacity-80 mt-1 block">Segmentation fault (core dumped)</span>
                    <span className="text-zinc-500 mt-1 inline-block align-middle animate-cursor">_</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </Section>

        <Section className="!py-0 justify-center min-h-[80vh]">
          <div className="absolute inset-0 bg-zinc-950/50 flex flex-col justify-center">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="font-jb text-glow text-xl tracking-widest uppercase mb-6" aria-live="polite">{activeTickerTime}</h2>
                <p className="font-fraunces text-2xl md:text-3xl text-zinc-300 max-w-2xl mx-auto leading-relaxed font-light">
                  The hours nobody clocks. Debugging in silence, re-seating every jumper, restarting embedded firmware for the fortieth time. The world asleep, the logic awake.
                </p>
              </div>
            </FadeIn>

            <div className="ticker-wrap w-full py-8 bg-black/40 border-y border-zinc-900/50">
              <div className="ticker">
                {tickerItems.concat(tickerItems).map((item, index) => (
                  <TickerItem key={`${item.time}-${hashCode(item.text)}-${index}`} time={item.time} text={item.text} />
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <FadeIn className="mb-14">
            <span className="font-jb text-zinc-600 text-sm mb-3 block">// memory_allocation</span>
            <h2 className="font-fraunces text-3xl text-zinc-100 mb-4">Projects That Stayed</h2>
            <span className="hand-drawn-line w-20 inline-block" />
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
            {[
              {
                title: "IMU Unified",
                desc: "Rewrote the I2C drivers from scratch because the vendor library was blocking.",
                hash: "a8f92bd",
                status: "Shipped",
                statusClass: "shipped",
                learned: "Timing is everything in embedded.",
                rotate: "rotate-1"
              },
              {
                title: "Packet Protocol",
                desc: "Arduino pushing real-time packet data. Optimized till binary control was achieved.",
                hash: "c33a1e4",
                status: "Buried",
                statusClass: "buried",
                learned: "Documentation is as important as code.",
                rotate: "-rotate-2"
              },
              {
                title: "Line-Following Robot",
                desc: "The rite of passage. Over-engineered the chassis, ignored the PID.",
                hash: "f77d201",
                status: "Archived",
                statusClass: "archived",
                learned: "Hardware defines how hard software has to compensate.",
                rotate: "rotate-2"
              },
              {
                title: "Real-Time Preemptive Scheduler",
                desc: "Wrote a scheduler from scratch in assembly for Arduino boards.",
                hash: "e902bca",
                status: "Revived",
                statusClass: "revived",
                learned: "Buffers save lives.",
                rotate: "-rotate-1"
              }
            ].map((proj, i) => (
              <FadeIn key={proj.hash} index={i} className={`index-card p-7 ${proj.rotate} transition-transform hover:scale-[1.015] hover:rotate-0 duration-500 cursor-default`}>
                <div className="flex justify-between items-start mb-5">
                  <h3 className="font-inter font-medium text-zinc-200 text-lg leading-snug pr-4">{proj.title}</h3>
                  <span className="font-jb text-xs text-zinc-600 shrink-0">#{proj.hash}</span>
                </div>

                <div className="hand-drawn-line w-full mb-5" />

                <p className="text-zinc-500 text-sm mb-8 leading-relaxed font-light">
                  {proj.desc}
                </p>

                <div className="flex items-end justify-between mt-auto">
                  <span className={`stamp ${proj.statusClass}`}>{proj.status}</span>
                  <span className="font-fraunces italic text-sm text-zinc-500">
                    "{proj.learned}"
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>
        </Section>

        <Zone name="COLLAB" className="max-w-2xl mx-auto space-y-12 rounded-[28px] p-8" onPhotoClick={handlePhotoClick}>
          <Section className="!min-h-0 !py-16">
            <FadeIn>
              <div className="inline-block p-4 rounded-full bg-amber-900/10 mb-6">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="font-fraunces text-3xl text-zinc-100 mb-6">The People Between Sessions</h2>
              <p className="text-zinc-400 font-light leading-relaxed text-lg">
                Engineering wasn't a solo act. It was forged in the quiet solidarity of shared exhaustion.
              </p>
            </FadeIn>

            <FadeIn index={1}>
              <p className="text-zinc-400 font-light leading-relaxed text-lg">
                I remember who always found chai at Sudaam when all canteens were closed. The ones who kept calling me to fix the code, even when they didn't have a clue or ever tried to know what the problem was.
              </p>
            </FadeIn>

            <FadeIn index={2}>
              <p className="text-zinc-400 font-light leading-relaxed text-lg">
                We shared notes, shared our stories, shared the dread of placement season. Some of us made it to the dream companies, some of us found entirely different paths. But in that lab, tapping an ammeter supplying 3-phase AC and getting scolded, we were equals.
              </p>
            </FadeIn>
          </Section>
        </Zone>

        <Section>
          <FadeIn className="mb-12">
            <span className="font-jb text-zinc-600 text-sm mb-3 block">// snapshot_archive</span>
            <h2 className="font-fraunces text-3xl text-zinc-100 mb-4">Memory Reels</h2>
            <span className="hand-drawn-line w-20 inline-block" />
          </FadeIn>

          <FadeIn index={2}>
            <div className="glass-card rounded-sm overflow-hidden bg-transparent border border-transparent shadow-none">
              <div className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-900 font-jb text-xs">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-red-500"
                  style={{ boxShadow: '0 0 6px rgba(239,68,68,0.8)', animation: 'cursor-blink 1.5s ease-in-out infinite' }}
                />
                <span className="text-zinc-600 tracking-widest">REC</span>
                <span className="mx-2 text-zinc-800">|</span>
                <span className="text-zinc-700">48 months logged</span>
                <span className="ml-auto text-zinc-700 tracking-widest">MUTED ◼</span>
              </div>
              <div ref={videoContainerRef} className="relative bg-black" style={{ aspectRatio: '16/9' }}>
                {videos.length > 0 ? (
                  <>
                    <Carousel
                      className="relative overflow-hidden"
                      opts={{ align: "start", containScroll: "trimSnaps", loop: true }}
                      setApi={setVideoCarouselApi}
                      aria-label="Memory reels carousel"
                    >
                      <CarouselContent className="h-full">
                        {videos.map((video, index) => (
                          <CarouselItem key={video.src ?? index} className="min-w-full">
                            <div className="rounded-none overflow-hidden border border-transparent bg-transparent shadow-none">
                              <div className="relative aspect-video w-full bg-black overflow-hidden rounded-none">
                                <video
                                  ref={(element) => {
                                    videoRefs.current[index] = element;
                                  }}
                                  className="absolute inset-0 h-full w-full object-contain object-center"
                                  controls
                                  preload={index === activeVideoIndex ? "metadata" : "none"}
                                  muted
                                  loop
                                  playsInline
                                  onVolumeChange={(event) => {
                                    const video = event.currentTarget;
                                    if (!video.muted) {
                                      video.muted = true;
                                      video.volume = 0;
                                    }
                                  }}
                                  onPlay={(event) => {
                                    const video = event.currentTarget;
                                    if (!video.muted) {
                                      video.muted = true;
                                      video.volume = 0;
                                    }
                                  }}
                                >
                                  {(() => {
                                    const ext = (video.src.split('.').pop() || '').toLowerCase();
                                    const mime = ext === 'webm' ? 'video/webm' : ext === 'ogg' ? 'video/ogg' : 'video/mp4';
                                    return <source src={video.src} type={mime} />;
                                  })()}
                                </video>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious variant="outline" className="text-zinc-100/90" />
                      <CarouselNext variant="outline" className="text-zinc-100/90" />
                    </Carousel>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                    <svg className="w-8 h-8 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="font-jb text-xs text-zinc-700">// videos will be available soon </span>
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.25) 2px, rgba(0,0,0,0.25) 4px)'
                }} />
              </div>
              <div className="py-4 flex justify-center bg-transparent border border-transparent">
                <p className="max-w-2xl text-center text-xs leading-6 text-zinc-400" aria-live="polite">
                  {videos[activeVideoIndex]?.caption}
                </p>
              </div>
            </div>
          </FadeIn>
        </Section>

        <Zone name="LAST_LOOP" className="space-y-8 rounded-[28px] p-8" onPhotoClick={handlePhotoClick}>
          <Section className="!min-h-0 !py-8">
            <FadeIn className="mb-14">
              <span className="font-jb text-zinc-600 text-sm mb-3 block">// program_termination_approaching</span>
              <h2 className="font-fraunces text-3xl text-zinc-100 mb-4">The Last Loop</h2>
              <span className="hand-drawn-line w-20 inline-block" />
            </FadeIn>

            <div className="relative border-l border-lime-900/40 ml-4 md:ml-8 space-y-16 pb-8">
              {[
                { num: "i", date: "Month 40", log: "Started the final project. Repaired 3D printers, one last try at an inverted pendulum.", ref: "init_final.c" },
                { num: "ii", date: "Month 44", log: "Placement anxiety peaking amongst peers. Talking it through where each one wants to go.", ref: "merge_conflict_life.sh" },
                { num: "iii", date: "Month 46", log: "Running the last firmware updates. Realizing I won't see those projects again.", ref: "teardown_setup.o" },
                { num: "iv", date: "Month 48", log: "Handing over the mantle. The campus feels borrowed now. It belongs to the next batch.", ref: "return 0;" }
              ].map((item, i) => (
                <FadeIn key={i} index={i} className="relative pl-10 md:pl-16">
                  <div className="absolute w-8 h-8 bg-zinc-950 border border-lime-900 text-glow font-fraunces italic text-xs flex items-center justify-center rounded-full left-[-16px] top-0"
                    style={{ boxShadow: '0 0 12px rgba(163,230,53,0.15)' }}>
                    {item.num}
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="font-jb text-sm text-amber-glow opacity-80">{item.date}</span>
                    <span className="hand-drawn-line flex-1 opacity-60" />
                    <span className="font-jb text-xs text-zinc-600">{item.ref}</span>
                  </div>
                  <p className="text-zinc-300 text-xl font-light font-fraunces leading-relaxed">{item.log}</p>
                </FadeIn>
              ))}
            </div>
          </Section>
        </Zone>

        <Zone name="TERMINATION" className="max-w-2xl rounded-[28px] p-12 mx-auto" onPhotoClick={handlePhotoClick}>
          <Section className="min-h-[70vh] justify-center">
            <FadeIn className="max-w-2xl text-center mx-auto">
              <div className="font-jb text-sm text-zinc-500 mb-12">
                <span className="block mb-2">$ systemctl poweroff</span>
                <span className="block text-zinc-600">Stopping all services...</span>
                <span className="block text-zinc-600">Unmounting file systems...</span>
              </div>

              <p className="font-fraunces text-2xl md:text-3xl text-zinc-300 leading-relaxed font-light mb-16">
                It wasn't about being brilliant. Engineering turned out to be a lesson in pure, stubborn persistence. Never giving up, and never being satisfied with "it works".
              </p>

              <div className="font-jb text-glow text-lg md:text-xl inline-block">
                {`// four years. closed. thank you.`}<span className="animate-cursor ml-2 inline-block w-3 h-5 bg-lime-400 align-middle"></span>
              </div>
            </FadeIn>
          </Section>
        </Zone>

        <div className="mx-auto w-full max-w-4xl border-t border-white/20 opacity-80 my-6" />

        <Section className="!py-8">
          <FadeIn className="mb-10 text-center">
            <span className="font-jb text-zinc-600 text-sm mb-3 block">// photo_archive</span>
            <h2 className="font-fraunces text-3xl text-zinc-100 mb-4">Your Collected Photos</h2>
            <span className="hand-drawn-line w-20 inline-block mx-auto" />
          </FadeIn>

          {collectedStacks.length === 0 ? (
            <div className="glass-card rounded-[28px] border border-white/10 p-10 text-zinc-400 text-center">
              No photo stacks have been collected yet. Select a lead photo to unlock a whole stack.
            </div>
          ) : (
            <div className="relative">
              <Carousel className="relative" opts={{ align: "start", containScroll: "trimSnaps", loop: true }} aria-label="Collected photos carousel">
                <CarouselContent className="h-full">
                  {collectedStacks.map((stack) => (
                    <CarouselItem key={stack.id} className="min-w-full px-2 overflow-visible">
                      <FadeIn className="glass-card rounded-[28px] overflow-visible border border-white/10 bg-zinc-950">
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => setSelectedStack(stack)}
                        >
                          <div className="relative h-80">
                            {stack.members.slice(0, 3).reverse().map((member, index) => (
                              <div
                                key={member.id}
                                className="filmreel-card"
                                style={{
                                  transform: `translateX(calc(-50% + ${(index + 1) * 12}px)) translateY(${(index + 1) * 7}px) rotate(${-2 + index * -1}deg)`,
                                  zIndex: index,
                                }}
                              >
                                <div className="filmreel-strip">
                                  <span className="filmreel-hole" />
                                  <span className="filmreel-hole" />
                                </div>
                                {member.src ? (
                                  <img
                                    src={member.src}
                                    alt={member.label}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-zinc-900 px-6 text-center text-sm text-zinc-500">
                                    Representative photo from {stack.leader.zone.replace(/_/g, " ")}.
                                  </div>
                                )}
                              </div>
                            ))}
                            <div
                              className="filmreel-card"
                              style={{
                                transform: "translateX(-50%) translateY(0px)",
                                zIndex: 10,
                              }}
                            >
                              <div className="filmreel-strip">
                                <span className="filmreel-hole" />
                                <span className="filmreel-hole" />
                              </div>
                              {stack.leader.src ? (
                                <img
                                  src={stack.leader.src}
                                  alt={stack.leader.label}
                                  loading="eager"
                                  decoding="async"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-zinc-900 px-6 text-center text-sm text-zinc-500">
                                  Representative photo from {stack.leader.zone.replace(/_/g, " ")}.
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="p-6">
                            <p className="text-sm text-slate-200">{stack.leader.label}</p>
                            <p className="mt-3 text-xs uppercase tracking-[0.24em] text-zinc-500">
                              {stack.leader.zone.replace(/_/g, " ")} stack
                            </p>
                          </div>
                        </button>
                      </FadeIn>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious variant="outline" className="text-zinc-100/90" />
                <CarouselNext variant="outline" className="text-zinc-100/90" />
              </Carousel>
            </div>
          )}
        </Section>

      </main>

      <FullscreenNotification
        open={selectedStack !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedStack(null);
          }
        }}
        dismissible
        closeLabel="Close stack"
        className="px-0"
        contentClassName="max-w-5xl p-6 sm:p-8"
        contentStyle={{
          backgroundColor: "transparent",
          border: "none",
          boxShadow: "none",
          backdropFilter: "blur(0)",
        }}
      >
        {selectedStack ? (
          <div className="space-y-6 text-center">
            <Carousel
              className="relative"
              opts={{ align: "start", containScroll: "trimSnaps", loop: true }}
              setApi={setStackCarouselApi}
            >
              <CarouselContent className="h-full">
                {[selectedStack.leader, ...selectedStack.members].map((photo, index) => (
                  <CarouselItem key={photo.id} className="min-w-full flex-column content-center">
                    <div className="fullscreen-photo-card z-0 mx-auto w-full max-w-[900px] animate-pickup">
                      <div className="fullscreen-photo-frame">
                        {photo.fullSrc || photo.src ? (
                          <img
                            src={index === activeStackPhotoIndex ? photo.fullSrc : photo.src}
                            alt={photo.label}
                            loading={index === activeStackPhotoIndex ? "eager" : "lazy"}
                            decoding="async"
                            className="fullscreen-photo-img"
                          />
                        ) : (
                          <div className="fullscreen-photo-placeholder flex h-[60vh] w-full items-center justify-center rounded-[28px] bg-zinc-950 px-8 text-center text-sm text-zinc-400">
                            No photo available yet. This is a placeholder for {photo.label}.
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="px-2">
                      <p className="text-sm leading-7 text-slate-200">
                        {photo.label}
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious variant="outline" className="text-zinc-100/90" />
              <CarouselNext variant="outline" className="text-zinc-100/90" />
            </Carousel>
          </div>
        ) : null}
      </FullscreenNotification>
    </div>
  );
}
