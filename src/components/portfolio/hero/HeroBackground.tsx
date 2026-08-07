export function HeroBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full blur-[120px]" style={{ background: "var(--accent-purple)", opacity: 0.2 }} />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: "var(--accent-blue)", opacity: 0.15 }} />
      <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] rounded-full blur-[100px]" style={{ background: "var(--accent-blue)", opacity: 0.1 }} />
      <div className="absolute top-[28%] left-[20%] w-14 h-14 rounded-full bg-white/80 blur-sm animate-float-1" />
      <div className="absolute top-[40%] right-[22%] w-20 h-20 rounded-full bg-white/70 blur-sm animate-float-2" />
      <div className="absolute top-[55%] left-[38%] w-10 h-10 rounded-full bg-white/60 blur-sm animate-float-3" />
      <div className="absolute top-[22%] right-[35%] w-8 h-8 rounded-full bg-white/50 blur-sm animate-float-2" />
      {[...Array(30)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-[2px] h-[2px] rounded-full bg-white/40"
          style={{
            top: `${10 + Math.sin(i * 137.5) * 40 + 40}%`,
            left: `${10 + Math.cos(i * 137.5) * 42 + 42}%`,
          }}
        />
      ))}
    </div>
  );
}
