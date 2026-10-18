import assert from "node:assert/strict";
import test from "node:test";

import { defaultHeadline, headlineVariants } from "../../../src/features/landing/hero/data/headlines.ts";
import {
  loadDiscoveredHeadlineIds,
  recordDiscoveredHeadlines,
} from "../../../src/features/landing/hero/data/headline-collection.ts";

const STORAGE_KEY = "portfolio:headline-collection";
const firstId = defaultHeadline.id;
const secondId = headlineVariants[0].id;

function createStorage(initialValue = null) {
  let value = initialValue;
  return {
    getItem(key) {
      assert.equal(key, STORAGE_KEY);
      return value;
    },
    setItem(key, nextValue) {
      assert.equal(key, STORAGE_KEY);
      value = nextValue;
    },
    readRaw() {
      return value;
    },
  };
}

test("collection: discovered IDs persist and can be loaded", () => {
  const storage = createStorage();

  const recorded = recordDiscoveredHeadlines([firstId, secondId], storage);

  assert.deepEqual(recorded, [firstId, secondId]);
  assert.deepEqual(loadDiscoveredHeadlineIds(storage), [firstId, secondId]);
  assert.deepEqual(JSON.parse(storage.readRaw()), {
    version: 1,
    discoveredIds: [firstId, secondId],
  });
});

test("collection: repeated discoveries do not increase the unique count", () => {
  const storage = createStorage();

  const first = recordDiscoveredHeadlines([firstId, secondId], storage);
  const repeated = recordDiscoveredHeadlines([secondId, firstId, secondId], storage);

  assert.equal(first.length, 2);
  assert.equal(repeated.length, 2);
  assert.deepEqual(new Set(repeated), new Set([firstId, secondId]));
});

test("collection: malformed or unsupported records load as empty", () => {
  assert.deepEqual(loadDiscoveredHeadlineIds(createStorage("{not json")), []);
  assert.deepEqual(
    loadDiscoveredHeadlineIds(
      createStorage(JSON.stringify({ version: 99, discoveredIds: [firstId] })),
    ),
    [],
  );
  assert.deepEqual(
    loadDiscoveredHeadlineIds(
      createStorage(JSON.stringify({ version: 1, discoveredIds: "not-an-array" })),
    ),
    [],
  );
});

test("collection: unknown IDs and invalid entries are ignored", () => {
  const storage = createStorage(JSON.stringify({
    version: 1,
    discoveredIds: [firstId, firstId, "unknown-id", 42, null],
  }));

  assert.deepEqual(loadDiscoveredHeadlineIds(storage), [firstId]);
  assert.deepEqual(
    recordDiscoveredHeadlines(["unknown-id", secondId], storage),
    [firstId, secondId],
  );
});

test("collection: unavailable storage never throws", () => {
  assert.deepEqual(loadDiscoveredHeadlineIds(undefined), []);
  assert.deepEqual(recordDiscoveredHeadlines([firstId], undefined), []);

  const throwingStorage = {
    getItem() {
      throw new Error("storage read blocked");
    },
    setItem() {
      throw new Error("storage write blocked");
    },
  };

  assert.doesNotThrow(() => loadDiscoveredHeadlineIds(throwingStorage));
  assert.deepEqual(loadDiscoveredHeadlineIds(throwingStorage), []);
  assert.doesNotThrow(() => recordDiscoveredHeadlines([firstId], throwingStorage));
  assert.deepEqual(recordDiscoveredHeadlines([firstId], throwingStorage), [firstId]);
});
