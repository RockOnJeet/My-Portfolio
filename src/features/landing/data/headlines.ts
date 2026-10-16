/**
 * This module provides functionality for managing and selecting headlines based on their rarity. It includes:
 * - A default headline and a set of variant headlines, each with a unique ID and rarity.
 * - A function to assert that all headline IDs are unique, throwing an error if duplicates are found.
 * - A function to calculate the probability distribution of rarities based on the available variants.
 * - A function to select a headline randomly, weighted by rarity probabilities, with an injectable random source for deterministic testing.
 *
 * The module exports the default headline, variant headlines, rarity tiers, and types for Headline and Rarity.
 */

import {
  defaultHeadlineContent,
  headlineVariantContent,
  rarityTiers,
  type Headline,
  type Rarity,
} from "../content/headline-content.ts";
import { generatedHeadlineIds } from "../content/headline-ids.generated.ts";

export { rarityTiers };
export type { Headline, Rarity };

export const defaultHeadline: Headline = { ...defaultHeadlineContent, id: generatedHeadlineIds[0] };
export const headlineVariants: Headline[] = headlineVariantContent.map((headline, index) => ({
  ...headline,
  id: generatedHeadlineIds[index + 1],
}));

/**
 * Asserts that all headline IDs in the provided array are unique.
 * @param headlines - An array of headline objects.
 * @throws {Error} If any duplicate IDs are found.
 */
export function assertUniqueHeadlineIds(headlines: readonly Headline[]): void {
  const knownHeadlineIds = new Set<string>();
  for (const headline of headlines) {
    if (knownHeadlineIds.has(headline.id)) {
      throw new Error(`Duplicate headline text produces UUID ${headline.id}`);
    }
    knownHeadlineIds.add(headline.id);
  }
}
assertUniqueHeadlineIds([defaultHeadline, ...headlineVariants]);

/**
 * Returns the probability assigned to each rarity that currently has variants.
 * Each tier receives two-thirds of the remaining probability; the final
 * available tier receives the remainder. Empty tiers are skipped.
 * @param variants - An array of headline objects to calculate probabilities for. Defaults to the global headlineVariants.
 * @returns A map of rarity to its assigned probability.
 */
export function getRarityProbabilities(
  variants: readonly Headline[] = headlineVariants,
): ReadonlyMap<Rarity, number> {
  const availableRarities = rarityTiers.filter((rarity) =>
    variants.some((headline) => headline.rarity === rarity),
  );
  const probabilities = new Map<Rarity, number>();
  let remaining = 1;

  availableRarities.forEach((rarity, index) => {
    const isLastTier = index === availableRarities.length - 1;
    const probability = isLastTier ? remaining : remaining * (2 / 3);

    probabilities.set(rarity, probability);
    remaining -= probability;
  });

  return probabilities;
}

/**
 * Selects a rarity by its remaining-probability weight, then selects a
 * headline uniformly from that rarity. Returns undefined if no variants exist.
 * The random source is injectable to make selection deterministic in tests.
 * @param random - A function that returns a random number in [0, 1). Defaults to Math.random.
 * @param variants - An array of headline objects to select from. Defaults to the global headlineVariants.
 * @returns A randomly selected headline or undefined if no variants exist.
 */
export function selectHeadline(
  random: () => number = Math.random,
  variants: readonly Headline[] = headlineVariants,
): Headline | undefined {
  if (variants.length === 0) return undefined;

  const probabilities = getRarityProbabilities(variants);
  const roll = random();
  let cumulativeProbability = 0;
  let selectedRarity: Rarity | undefined;

  for (const [rarity, probability] of probabilities) {
    cumulativeProbability += probability;

    if (roll < cumulativeProbability) {
      selectedRarity = rarity;
      break;
    }
  }

  // Protect against floating-point boundary rounding at the upper endpoint.
  selectedRarity ??= [...probabilities.keys()].at(-1);

  if (!selectedRarity) return undefined;

  const candidates = variants.filter(
    (headline) => headline.rarity === selectedRarity,
  );
  const index = Math.min(
    Math.floor(random() * candidates.length),
    candidates.length - 1,
  );

  return candidates[index];
}
