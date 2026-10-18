import {
  activateWaveBand as activateGridWaveBand,
  calculateNeighborCounts,
  createGridCells,
  updateGameOfLife as updateGridState,
} from "./cellular-automata";

const canvas = document.querySelector<HTMLCanvasElement>(".cellular-automata-background");
if (!canvas) {
  throw new Error("Cellular automata background canvas was not found.");
}

const context = canvas.getContext("2d", { alpha: false });
if (!context) {
  throw new Error("Canvas 2D context is unavailable.");
}

const CONFIG = {
  grid: {
    cellSize: 12,
    initialSeedDensity: 0.1,
  },
  brushstroke: {
    radius: 120,
    ringThickness: 24,
    duration: 300,
    spawnInterval: 65,
  },
  simulation: {
    updateInterval: 100,
  },
  rendering: {
    markScale: 0.8,
  },
  visuals: {
    levelsByNeighborCount: [1, 1, 2, 3, 2, 1, 1, 1, 1],
    brightnessValues: [0.33, 0.66, 1.0],
  },
} as const;

let width = 0;
let height = 0;
let columns = 0;
let rows = 0;
let cells: Uint8Array<ArrayBufferLike> = new Uint8Array(0);
let nextCells: Uint8Array<ArrayBufferLike> = new Uint8Array(0);
let neighborCounts: Uint8Array<ArrayBufferLike> = new Uint8Array(0);
let waves: Array<{ x: number; y: number; startTime: number; radius: number }> = [];
let lastFrameTime = 0;
let simulationAccumulator = 0;
let lastSpawnTime = -Infinity;
let dirty = true;
let animationFrame = 0;

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

function getThemeColor(name: "--color-background" | "--color-accent"): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

let backgroundColor = "";
let accentColor = "";

function refreshThemeColors(): void {
  backgroundColor = getThemeColor("--color-background");
  accentColor = getThemeColor("--color-accent");
}

function resizeCanvas(): void {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;

  canvas!.width = Math.round(width * pixelRatio);
  canvas!.height = Math.round(height * pixelRatio);
  context!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const previousCells = cells;
  const previousColumns = columns;
  const previousRows = rows;
  columns = Math.ceil(width / CONFIG.grid.cellSize);
  rows = Math.ceil(height / CONFIG.grid.cellSize);

  cells = createGridCells(
    columns,
    rows,
    previousCells,
    previousColumns,
    previousRows,
    CONFIG.grid.initialSeedDensity,
  );
  nextCells = new Uint8Array(columns * rows);
  neighborCounts = calculateNeighborCounts(cells, columns, rows);
  dirty = true;
  draw();
}

function spawnWave(x: number, y: number): void {
  waves.push({ x, y, startTime: performance.now(), radius: 0 });
  lastSpawnTime = performance.now();
}

function activateWaveBand(
  wave: (typeof waves)[number],
  previousRadius: number,
  radius: number,
): void {
  const changed = activateGridWaveBand(
    cells,
    columns,
    rows,
    CONFIG.grid.cellSize,
    wave.x,
    wave.y,
    previousRadius,
    radius,
    CONFIG.brushstroke.radius,
    CONFIG.brushstroke.ringThickness,
  );

  if (changed) {
    neighborCounts = calculateNeighborCounts(cells, columns, rows);
    dirty = true;
  }
}

function advanceWaves(timestamp: number): void {
  for (const wave of waves) {
    const progress = Math.min((timestamp - wave.startTime) / CONFIG.brushstroke.duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const newRadius = CONFIG.brushstroke.radius * easedProgress;
    activateWaveBand(wave, wave.radius, newRadius);
    wave.radius = newRadius;
  }

  waves = waves.filter((wave) => timestamp - wave.startTime < CONFIG.brushstroke.duration);
}

function updateGameOfLife(): void {
  const changed = updateGridState(cells, nextCells, neighborCounts);
  [cells, nextCells] = [nextCells, cells];

  if (changed) {
    neighborCounts = calculateNeighborCounts(cells, columns, rows);
    dirty = true;
  }
}

function drawMark(x: number, y: number, brightness: number, visualLevel: number): void {
  const size = CONFIG.grid.cellSize * CONFIG.rendering.markScale * (0.2 + 0.8 * brightness);
  context!.globalAlpha = brightness;
  context!.fillStyle = accentColor;
  context!.strokeStyle = accentColor;
  context!.lineWidth = Math.max(0.8, CONFIG.grid.cellSize * 0.09);

  if (visualLevel === 1) {
    context!.beginPath();
    context!.arc(x, y, size * 0.5, 0, Math.PI * 2);
    context!.fill();
  } else if (visualLevel === 2) {
    const squareSize = size * 0.75;
    context!.fillRect(x - squareSize / 2, y - squareSize / 2, squareSize, squareSize);
  } else {
    const crossSize = size * 0.65;
    context!.beginPath();
    context!.moveTo(x - crossSize, y);
    context!.lineTo(x + crossSize, y);
    context!.moveTo(x, y - crossSize);
    context!.lineTo(x, y + crossSize);
    context!.stroke();
  }

  context!.globalAlpha = 1;
}

function draw(): void {
  if (!dirty) return;

  context!.fillStyle = backgroundColor;
  context!.fillRect(0, 0, width, height);

  for (let index = 0; index < cells.length; index++) {
    if (!cells[index]) continue;

    const visualLevel = CONFIG.visuals.levelsByNeighborCount[neighborCounts[index]];
    const brightness = CONFIG.visuals.brightnessValues[visualLevel - 1];
    const row = Math.floor(index / columns);
    const column = index - row * columns;
    drawMark((column + 0.5) * CONFIG.grid.cellSize, (row + 0.5) * CONFIG.grid.cellSize, brightness, visualLevel);
  }

  dirty = false;
}

function animate(timestamp: number): void {
  if (document.hidden || motionPreference.matches) {
    animationFrame = 0;
    return;
  }

  if (lastFrameTime === 0) lastFrameTime = timestamp;
  const deltaTime = Math.min(timestamp - lastFrameTime, 50);
  lastFrameTime = timestamp;

  advanceWaves(timestamp);
  simulationAccumulator += deltaTime;

  while (simulationAccumulator >= CONFIG.simulation.updateInterval) {
    updateGameOfLife();
    simulationAccumulator -= CONFIG.simulation.updateInterval;
  }

  draw();
  animationFrame = window.requestAnimationFrame(animate);
}

function startAnimation(): void {
  if (document.hidden || motionPreference.matches || animationFrame) return;
  lastFrameTime = 0;
  animationFrame = window.requestAnimationFrame(animate);
}

function stopAnimation(): void {
  if (animationFrame) window.cancelAnimationFrame(animationFrame);
  animationFrame = 0;
}

function handlePointerMove(event: PointerEvent): void {
  if (motionPreference.matches || document.hidden) return;
  const now = performance.now();
  if (now - lastSpawnTime < CONFIG.brushstroke.spawnInterval) return;
  spawnWave(event.clientX, event.clientY);
}

function handlePointerDown(event: PointerEvent): void {
  if (motionPreference.matches || document.hidden) return;
  spawnWave(event.clientX, event.clientY);
}

function handleVisibilityChange(): void {
  if (document.hidden) {
    stopAnimation();
  } else {
    startAnimation();
  }
}

function handleMotionPreferenceChange(): void {
  if (motionPreference.matches) {
    stopAnimation();
    waves = [];
    dirty = true;
    draw();
  } else {
    startAnimation();
  }
}

function handleThemeChange(): void {
  refreshThemeColors();
  dirty = true;
  draw();
}

refreshThemeColors();
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointermove", handlePointerMove, { passive: true });
window.addEventListener("pointerdown", handlePointerDown, { passive: true });
document.addEventListener("visibilitychange", handleVisibilityChange);
motionPreference.addEventListener("change", handleMotionPreferenceChange);
window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", handleThemeChange);

const themeObserver = new MutationObserver(handleThemeChange);
themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme", "class", "style"],
});

startAnimation();
