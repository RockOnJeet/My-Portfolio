import assert from "node:assert/strict";
import test from "node:test";

import {
  activateWaveBand,
  calculateNeighborCounts,
  createGridCells,
  updateGameOfLife,
} from "../../../src/features/landing/cellular-automata-background/cellular-automata.ts";

function indexOf(column, row, columns) {
  return row * columns + column;
}

test("simulation: births cells with three neighbors and preserves cells with two", () => {
  const columns = 5;
  const rows = 5;
  const cells = new Uint8Array(columns * rows);

  cells[indexOf(2, 2, columns)] = 1;
  cells[indexOf(1, 2, columns)] = 1;
  cells[indexOf(2, 1, columns)] = 1;
  cells[indexOf(1, 3, columns)] = 1;
  cells[indexOf(4, 4, columns)] = 1;

  const neighborCounts = calculateNeighborCounts(cells, columns, rows);
  const nextCells = new Uint8Array(cells.length);

  const changed = updateGameOfLife(cells, nextCells, neighborCounts);

  assert.equal(changed, true);
  assert.equal(nextCells[indexOf(2, 2, columns)], 1, "a live cell with two neighbors survives");
  assert.equal(nextCells[indexOf(2, 3, columns)], 1, "a dead cell with three neighbors is born");
  assert.equal(nextCells[indexOf(4, 4, columns)], 0, "an isolated live cell dies");
});

test("simulation: live cells with more than three neighbors die", () => {
  const columns = 5;
  const rows = 5;
  const cells = new Uint8Array(columns * rows);

  cells[indexOf(2, 2, columns)] = 1;
  cells[indexOf(1, 2, columns)] = 1;
  cells[indexOf(3, 2, columns)] = 1;
  cells[indexOf(2, 1, columns)] = 1;
  cells[indexOf(2, 3, columns)] = 1;

  const neighborCounts = calculateNeighborCounts(cells, columns, rows);
  const nextCells = new Uint8Array(cells.length);

  updateGameOfLife(cells, nextCells, neighborCounts);

  assert.equal(nextCells[indexOf(2, 2, columns)], 0);
});

test("grid: neighbor counts wrap across edges and corners", () => {
  const columns = 3;
  const rows = 3;
  const cells = new Uint8Array(columns * rows);
  cells[indexOf(0, 0, columns)] = 1;

  const neighborCounts = calculateNeighborCounts(cells, columns, rows);

  assert.equal(neighborCounts[indexOf(2, 2, columns)], 1);
  assert.equal(neighborCounts[indexOf(0, 2, columns)], 1);
  assert.equal(neighborCounts[indexOf(2, 0, columns)], 1);
  assert.equal(neighborCounts[indexOf(1, 1, columns)], 1);
});

test("initialization: seed density uses the supplied random source", () => {
  const values = [0.1, 0.9, 0.4, 0.8];
  let randomIndex = 0;

  const cells = createGridCells(
    2,
    2,
    new Uint8Array(0),
    0,
    0,
    0.5,
    () => values[randomIndex++],
  );

  assert.deepEqual([...cells], [1, 0, 1, 0]);
});

test("resize: preserves overlapping cells and does not seed new cells again", () => {
  const initial = createGridCells(2, 2, new Uint8Array(0), 0, 0, 0.5, () => 0);
  assert.deepEqual([...initial], [1, 1, 1, 1]);

  const resized = createGridCells(3, 2, initial, 2, 2, 0.5, () => 0);

  assert.deepEqual([...resized], [1, 1, 0, 1, 1, 0]);
});

test("wave interaction: activates only cells within the current ring band", () => {
  const columns = 7;
  const rows = 7;
  const cells = new Uint8Array(columns * rows);

  const changed = activateWaveBand(
    cells,
    columns,
    rows,
    10,
    35,
    35,
    0,
    14,
    14,
    24,
  );

  assert.equal(changed, true);
  assert.equal(cells.reduce((sum, cell) => sum + cell, 0), 5);
  assert.equal(cells[indexOf(3, 3, columns)], 1, "the center cell is activated");
  assert.equal(cells[indexOf(4, 3, columns)], 1, "a cell within the radius is activated");
  assert.equal(cells[indexOf(4, 4, columns)], 0, "a diagonal cell outside the radius stays inactive");
  assert.equal(
    activateWaveBand(cells, columns, rows, 10, 35, 35, 0, 14, 14, 24),
    false,
    "already-live cells do not count as a grid change",
  );
});
