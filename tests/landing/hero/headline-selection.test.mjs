import assert from "node:assert/strict";
import test from "node:test";

import {
  defaultHeadline,
  getRarityProbabilities,
  headlineVariants,
  rarityTiers,
  selectHeadline,
} from "../../../src/features/landing/hero/data/headlines.ts";
import { generateHeadlineId } from "../../../scripts/generate-headline-ids.mjs";

function sequenceRandom(...values) {
  let index = 0;
  return () => {
    assert.ok(index < values.length, "selection requested more random values than expected");
    return values[index++];
  };
}

/**
 * Independent test oracle for the documented two-thirds-of-remainder rule.
 * It derives its tier set from the source contract but does not call the
 * production probability function.
 */
function expectedRarityProbabilities(variants = headlineVariants) {
  const availableTiers = rarityTiers.filter((rarity) =>
    variants.some((headline) => headline.rarity === rarity),
  );
  const probabilities = new Map();
  let remaining = 1;

  availableTiers.forEach((rarity, index) => {
    const isLastTier = index === availableTiers.length - 1;
    const probability = isLastTier ? remaining : remaining * (2 / 3);

    probabilities.set(rarity, probability);
    remaining -= probability;
  });

  return probabilities;
}

function midpointOfProbabilityBand(probabilities, targetRarity) {
  let cumulativeProbability = 0;

  for (const [rarity, probability] of probabilities) {
    if (rarity === targetRarity) return cumulativeProbability + probability / 2;
    cumulativeProbability += probability;
  }

  assert.fail(`No probability band found for rarity: ${targetRarity}`);
}

test("logical behavior: probabilities follow the two-thirds-of-remainder rule", () => {
  const actual = getRarityProbabilities();
  const expected = expectedRarityProbabilities();

  assert.deepEqual([...actual.keys()], [...expected.keys()]);
  for (const [rarity, expectedProbability] of expected) {
    assert.ok(
      Math.abs(actual.get(rarity) - expectedProbability) < Number.EPSILON * 4,
      `${rarity}: expected ${expectedProbability}, received ${actual.get(rarity)}`,
    );
  }

  assert.ok(
    Math.abs([...actual.values()].reduce((sum, value) => sum + value, 0) - 1) <
      Number.EPSILON * 4,
  );
});

test("logical behavior: rarity selection respects dynamically derived probability bands", () => {
  const expected = expectedRarityProbabilities();

  for (const rarity of expected.keys()) {
    const rarityRoll = midpointOfProbabilityBand(expected, rarity);
    const selected = selectHeadline(sequenceRandom(rarityRoll, 0));
    assert.equal(selected?.rarity, rarity);
  }
});

test("statistical behavior: a deterministic large sample approximates the intended distribution", () => {
  let seed = 1;
  const random = () => {
    seed = (seed * 48271) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const expected = expectedRarityProbabilities();
  const counts = new Map([...expected.keys()].map((rarity) => [rarity, 0]));
  const sampleSize = 50_000;

  for (let index = 0; index < sampleSize; index++) {
    const selected = selectHeadline(random);
    assert.ok(selected, "selection should return a headline when variants exist");
    counts.set(selected.rarity, counts.get(selected.rarity) + 1);
  }

  for (const [rarity, expectedProbability] of expected) {
    const observed = counts.get(rarity) / sampleSize;
    assert.ok(
      Math.abs(observed - expectedProbability) < 0.01,
      `${rarity}: expected approximately ${expectedProbability}, observed ${observed}`,
    );
  }
});

test("logical behavior: headlines within the first rarity tier are selected by index", () => {
  const firstTier = rarityTiers[0];
  const firstTierVariants = headlineVariants.filter(
    (headline) => headline.rarity === firstTier,
  );
  assert.ok(firstTierVariants.length > 1);

  const first = selectHeadline(sequenceRandom(0, 0), headlineVariants);
  const last = selectHeadline(sequenceRandom(0, 0.999999), headlineVariants);

  assert.equal(first?.id, firstTierVariants[0].id);
  assert.equal(last?.id, firstTierVariants.at(-1)?.id);
});

test("logical behavior: empty rarity tiers are skipped and remaining probabilities are redistributed", () => {
  assert.ok(rarityTiers.length > 1, "this test requires at least two declared rarity tiers");
  const firstTier = rarityTiers[0];
  const lastTier = rarityTiers.at(-1);
  const variants = [
    { id: "first-tier-one", rarity: firstTier, segments: [{ text: "First tier" }] },
    { id: "last-tier-one", rarity: lastTier, segments: [{ text: "Last tier" }] },
  ];

  const actual = getRarityProbabilities(variants);
  const expected = expectedRarityProbabilities(variants);

  assert.deepEqual([...actual.keys()], [firstTier, lastTier]);
  assert.deepEqual([...actual.keys()], [...expected.keys()]);
  for (const [rarity, expectedProbability] of expected) {
    assert.ok(Math.abs(actual.get(rarity) - expectedProbability) < Number.EPSILON * 4);
  }

  assert.equal(selectHeadline(sequenceRandom(0.8, 0), variants)?.rarity, lastTier);
});

test("logical behavior: selection safely returns undefined when no variants exist", () => {
  assert.equal(selectHeadline(() => 0, []), undefined);
  assert.deepEqual([...getRarityProbabilities([])], []);
});

test("contract alignment: probability tiers follow the source rarity contract", () => {
  const expectedAvailableTiers = rarityTiers.filter((rarity) =>
    headlineVariants.some((headline) => headline.rarity === rarity),
  );

  assert.deepEqual(
    [...getRarityProbabilities().keys()],
    expectedAvailableTiers,
  );
});

test("identity: generated IDs are deterministic valid UUIDv5 values", () => {
  const segments = [{ text: "Hello" }, { text: " world" }];
  const first = generateHeadlineId(segments);
  const second = generateHeadlineId(segments);
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  assert.equal(first, second);
  assert.match(first, uuidPattern);
});

test("identity: emphasis and rarity do not affect generated IDs", () => {
  const mutedNormal = {
    segments: [{ text: "Hello", emphasis: "muted" }],
    rarity: "normal",
  };
  const accentEpic = {
    segments: [{ text: "Hello", emphasis: "accent" }],
    rarity: "epic",
  };

  assert.equal(
    generateHeadlineId(mutedNormal.segments),
    generateHeadlineId(accentEpic.segments),
  );
});

test("identity: changing headline text changes its generated ID", () => {
  assert.notEqual(
    generateHeadlineId([{ text: "Hello" }]),
    generateHeadlineId([{ text: "Hello!" }]),
  );
});

test("data integrity: generated headline IDs are unique across the dataset", () => {
  assert.ok(headlineVariants.length > 0, "headline dataset should not be empty");
  const ids = [defaultHeadline, ...headlineVariants].map((headline) => headline.id);
  assert.equal(new Set(ids).size, ids.length, "headline UUIDs must be unique across the entire dataset");
});

test("data integrity: duplicate canonical content is rejected", async () => {
  const { assertUniqueHeadlineIds } = await import("../../../src/features/landing/hero/data/headlines.ts");
  const duplicateId = generateHeadlineId([{ text: "Same text" }]);
  const duplicateHeadlines = [
    { id: duplicateId, segments: [{ text: "Same text", emphasis: "muted" }], rarity: "normal" },
    { id: duplicateId, segments: [{ text: "Same text", emphasis: "accent" }], rarity: "epic" },
  ];

  assert.throws(() => assertUniqueHeadlineIds(duplicateHeadlines), /Duplicate headline text/);
});
