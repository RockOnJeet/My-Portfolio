export const STYLES = `
  .font-jb { font-family: 'JetBrains Mono', monospace; }
  .font-inter { font-family: 'Inter', sans-serif; }
  .font-fraunces { font-family: 'Fraunces', serif; }

  .bg-void { background-color: #0a0c0f; }
  .text-glow { color: #a3e635; text-shadow: 0 0 10px rgba(163, 230, 53, 0.3); }
  .border-glow { border-color: #a3e635; box-shadow: 0 0 10px rgba(163, 230, 53, 0.1); }
  .text-amber-glow { color: #d97706; text-shadow: 0 0 10px rgba(217, 119, 6, 0.3); }
  .text-blue-glow { color: #3b82f6; text-shadow: 0 0 10px rgba(59, 130, 246, 0.3); }

  .scanlines {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1));
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 50;
    opacity: 0.3;
  }

  .grid-bg {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background-image: 
      linear-gradient(to right, rgba(163, 230, 53, 0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(163, 230, 53, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes cursor-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  .animate-cursor { animation: cursor-blink 1s step-end infinite; }

  @keyframes typing {
    from { clip-path: inset(0 100% 0 0); }
    to { clip-path: inset(0 0 0 0); }
  }
  .animate-typing {
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    clip-path: inset(0 100% 0 0);
    animation: typing 2.5s steps(40, end) forwards;
  }

  @media (max-width: 640px) {
    .animate-typing {
      white-space: nowrap;
      overflow: hidden;
      clip-path: inset(0 100% 0 0);
      animation: typing 2.5s steps(40, end) forwards;
    }
  }

  .fade-in-up {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .fade-in-up.visible {
    opacity: 1;
    transform: translateY(0);
  }

  @keyframes pulse-slow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.05); }
  }
  .ambient-glow {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(163,230,53,0.05) 0%, rgba(10,12,15,0) 70%);
    animation: pulse-slow 8s ease-in-out infinite;
    pointer-events: none;
  }

  .ticker-wrap {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    position: relative;
    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  }
  .ticker {
    display: inline-block;
    white-space: nowrap;
    animation: ticker 40s linear infinite;
  }
  @keyframes ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  
  .glass-card {
    background: rgba(20, 24, 28, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
  }

  .text-zone {
    position: relative;
    z-index: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .text-zone > * {
    position: relative;
    z-index: auto;
  }
  .text-zone.hero-zone {
    pointer-events: none;
  }
  .text-zone.hero-zone > * {
    z-index: 40;
  }
  .text-zone h1,
  .text-zone h2,
  .text-zone h3,
  .text-zone h4,
  .text-zone h5,
  .text-zone h6 {
    position: relative;
    z-index: 30;
  }
  .text-zone p,
  .text-zone ul,
  .text-zone ol,
  .text-zone blockquote,
  .text-zone pre,
  .text-zone code,
  .text-zone .glass-card,
  .text-zone .hand-drawn-line {
    position: relative;
    z-index: 20;
  }
  .text-zone span,
  .text-zone small,
  .text-zone em,
  .text-zone strong,
  .text-zone .text-zinc-600,
  .text-zone .text-zinc-500 {
    position: relative;
    z-index: 10;
  }
  .text-zone::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 1.5rem;
    background: transparent;
    opacity: 0;
    pointer-events: none;
  }
  .text-zone::after {
    content: none;
    position: absolute;
    top: 0;
    right: 0;
    pointer-events: none;
    opacity: 0;
  }

  .zone-spawn {
    position: absolute;
    z-index: 0;
    pointer-events: auto;
    transform-origin: top left;
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
    cursor: pointer;
    transition: opacity 220ms ease, transform 220ms ease;
  }
  .zone-spawn.removing {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }
  .zone-spawn:focus-visible {
    outline: 2px solid rgba(163, 230, 53, 0.8);
    outline-offset: 4px;
  }

  .zone-photo {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    background: linear-gradient(180deg, #161f13 0%, #0b1208 45%, #050a05 100%);
    box-shadow: 0 28px 72px rgba(0, 0, 0, 0.38);
    overflow: hidden;
  }

  .zone-photo-frame {
    position: absolute;
    inset: 0;
    padding: 12px;
    background: rgba(5, 10, 5, 0.92);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  }

  .zone-photo-frame::before,
  .zone-photo-frame::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 24px;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0 8px,
      rgba(255,255,255,0.12) 8px 12px,
      transparent 12px 20px
    );
    pointer-events: none;
  }

  .zone-photo-frame::before {
    left: 0;
  }
  .zone-photo-frame::after {
    right: 0;
  }

  .zone-photo-frame::after {
    box-shadow: inset 0 0 0 2px rgba(255,255,255,0.02);
  }

  .fullscreen-photo-card {
    position: relative;
    overflow: visible;
    border-radius: 2rem;
    box-shadow: 0 24px 40px rgba(0, 0, 0, 0.36);
    transform-style: preserve-3d;
    pointer-events: none;
  }

  .fullscreen-photo-frame {
    position: relative;
    overflow: hidden;
    border-radius: 2rem;
    padding: 18px;
    background: rgba(10, 14, 12, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
    pointer-events: auto;
  }

  .fullscreen-photo-frame::before,
  .fullscreen-photo-frame::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 28px;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0 6px,
      rgba(255,255,255,0.06) 6px 10px,
      transparent 10px 16px
    );
    pointer-events: none;
  }

  .fullscreen-photo-frame::before {
    left: 0;
  }

  .fullscreen-photo-frame::after {
    right: 0;
  }

  .fullscreen-photo-img {
    display: block;
    width: 100%;
    height: auto;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 1.75rem;
  }

  .filmreel-card {
    position: absolute;
    left: 50%;
    top: 0;
    width: calc(100% - 3rem);
    height: 18rem;
    border-radius: 2rem;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(15, 18, 20, 0.88);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
    transform-origin: center top;
  }

  .filmreel-strip {
    position: absolute;
    top: 1rem;
    left: 1rem;
    right: 1rem;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .filmreel-hole {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.18);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
  }

  .filmreel-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .animate-pickup {
    animation: pickup 0.85s ease-out forwards;
  }

  @keyframes pickup {
    0% {
      opacity: 0;
      transform: translateY(24px) rotate(-1.5deg) scale(0.96);
    }
    60% {
      opacity: 1;
      transform: translateY(-8px) rotate(0.5deg) scale(1.02);
    }
    100% {
      transform: translateY(0) rotate(0) scale(1);
    }
  }

  .zone-photo::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.12), transparent 14%),
      radial-gradient(circle at 84% 26%, rgba(255, 255, 255, 0.08), transparent 12%),
      radial-gradient(circle at 22% 78%, rgba(255, 255, 255, 0.06), transparent 12%),
      radial-gradient(circle at 76% 84%, rgba(255, 255, 255, 0.05), transparent 14%);
    opacity: 0.32;
    pointer-events: none;
  }

  .zone-photo::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.12) 55%, transparent 100%);
    opacity: 0.18;
    pointer-events: none;
  }

  .zone-photo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .zone-photo-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, #2f3d29 0%, #111509 100%);
  }

  .glass-card:hover {
    border-color: rgba(163, 230, 53, 0.3);
    background: rgba(20, 24, 28, 0.8);
    transform: translateY(-2px);
  }

  .index-card {
    background: #0d1a0d;
    border: 1px solid rgba(163, 230, 53, 0.18);
    border-top: 5px solid rgba(163, 230, 53, 0.55);
    box-shadow:
      0 2px 0 rgba(163,230,53,0.04),
      0 8px 24px rgba(0,0,0,0.55),
      0 20px 48px rgba(0,0,0,0.35),
      inset 0 1px 0 rgba(163,230,53,0.06);
    transition: transform 0.45s cubic-bezier(0.16,1,0.3,1),
                box-shadow 0.45s ease,
                border-top-color 0.3s ease;
  }
  .index-card:hover {
    box-shadow:
      0 2px 0 rgba(163,230,53,0.08),
      0 12px 40px rgba(0,0,0,0.65),
      0 28px 60px rgba(0,0,0,0.4),
      0 0 30px rgba(163,230,53,0.05),
      inset 0 1px 0 rgba(163,230,53,0.1);
    border-top-color: rgba(163, 230, 53, 0.85);
  }

  .stamp {
    display: inline-block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-width: 2px;
    border-style: solid;
    border-radius: 2px;
    font-weight: 500;
    opacity: 0.9;
  }
  .stamp.shipped  { color: #a3e635; border-color: rgba(163,230,53,0.4);  background: rgba(163,230,53,0.06); }
  .stamp.buried   { color: #f87171; border-color: rgba(248,113,113,0.4); background: rgba(248,113,113,0.06); }
  .stamp.archived { color: #71717a; border-color: rgba(113,113,122,0.4); background: rgba(113,113,122,0.06); }
  .stamp.revived  { color: #60a5fa; border-color: rgba(96,165,250,0.4);  background: rgba(96,165,250,0.06); }

  .hand-drawn-line {
    display: block;
    height: 1px;
    border: none;
    border-top: 1px dashed rgba(163, 230, 53, 0.25);
  }

`;
