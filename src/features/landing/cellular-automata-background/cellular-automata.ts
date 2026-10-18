export function createGridCells(
  columns: number,
  rows: number,
  previousCells: Uint8Array,
  previousColumns: number,
  previousRows: number,
  initialSeedDensity: number,
  random: () => number = Math.random,
): Uint8Array {
  const cells = new Uint8Array(columns * rows);
  const copyColumns = Math.min(columns, previousColumns);
  const copyRows = Math.min(rows, previousRows);

  for (let row = 0; row < copyRows; row++) {
    cells.set(
      previousCells.subarray(
        row * previousColumns,
        row * previousColumns + copyColumns,
      ),
      row * columns,
    );
  }

  if (previousCells.length === 0) {
    for (let index = 0; index < cells.length; index++) {
      cells[index] = random() < initialSeedDensity ? 1 : 0;
    }
  }

  return cells;
}

export function calculateNeighborCounts(
  cells: Uint8Array,
  columns: number,
  rows: number,
): Uint8Array {
  const neighborCounts = new Uint8Array(cells.length);

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      if (!cells[row * columns + column]) continue;

      for (let dy = -1; dy <= 1; dy++) {
        const neighborRow = (row + dy + rows) % rows;

        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const neighborColumn = (column + dx + columns) % columns;
          neighborCounts[neighborRow * columns + neighborColumn]++;
        }
      }
    }
  }

  return neighborCounts;
}

export function updateGameOfLife(
  cells: Uint8Array,
  nextCells: Uint8Array,
  neighborCounts: Uint8Array,
): boolean {
  let changed = false;

  for (let index = 0; index < cells.length; index++) {
    const alive = cells[index] === 1;
    const neighbors = neighborCounts[index];
    const nextAlive = alive
      ? neighbors === 2 || neighbors === 3
      : neighbors === 3;

    nextCells[index] = nextAlive ? 1 : 0;
    if (nextCells[index] !== cells[index]) changed = true;
  }

  return changed;
}

export function activateWaveBand(
  cells: Uint8Array,
  columns: number,
  rows: number,
  cellSize: number,
  waveX: number,
  waveY: number,
  previousRadius: number,
  radius: number,
  maxRadius: number,
  ringThickness: number,
): boolean {
  const outerRadius = Math.min(radius, maxRadius);
  const innerRadius = Math.max(0, previousRadius - ringThickness);
  const minColumn = Math.max(0, Math.floor((waveX - outerRadius) / cellSize));
  const maxColumn = Math.min(columns - 1, Math.floor((waveX + outerRadius) / cellSize));
  const minRow = Math.max(0, Math.floor((waveY - outerRadius) / cellSize));
  const maxRow = Math.min(rows - 1, Math.floor((waveY + outerRadius) / cellSize));
  const outerSquared = outerRadius * outerRadius;
  const innerSquared = innerRadius * innerRadius;
  let changed = false;

  for (let row = minRow; row <= maxRow; row++) {
    for (let column = minColumn; column <= maxColumn; column++) {
      const x = (column + 0.5) * cellSize - waveX;
      const y = (row + 0.5) * cellSize - waveY;
      const distanceSquared = x * x + y * y;

      if (distanceSquared <= outerSquared && distanceSquared >= innerSquared) {
        const index = row * columns + column;
        if (!cells[index]) {
          cells[index] = 1;
          changed = true;
        }
      }
    }
  }

  return changed;
}
