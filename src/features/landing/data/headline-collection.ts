/**
 * This module provides functions to manage a collection of discovered headline IDs in browser storage.
 * The collection is versioned to allow for future changes in the storage format.
 * It includes functions to load and record discovered headline IDs, ensuring that only known headline IDs are stored.
 * The storage mechanism can be injected for testing purposes, defaulting to the browser's localStorage if available.
 */

import { defaultHeadline, headlineVariants } from "./headlines.ts";

const STORAGE_KEY = "portfolio:headline-collection";
const STORAGE_VERSION = 1;

interface CollectionRecord {
  version: typeof STORAGE_VERSION;
  discoveredIds: string[];
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const knownHeadlineIds = new Set(
  [defaultHeadline, ...headlineVariants].map((headline) => headline.id),
);

/** Returns the browser's localStorage if available, otherwise undefined. */
function getBrowserStorage(): StorageLike | undefined {
  try {
    if (typeof window === "undefined") return undefined;
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/** Reads the list of discovered headline IDs from storage. */
function readIds(storage: StorageLike): string[] {
  try {
    const rawRecord = storage.getItem(STORAGE_KEY);
    if (!rawRecord) return [];

    const parsed: unknown = JSON.parse(rawRecord);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("version" in parsed) ||
      parsed.version !== STORAGE_VERSION ||
      !("discoveredIds" in parsed) ||
      !Array.isArray(parsed.discoveredIds)
    ) {
      return [];
    }

    return [...new Set(
      parsed.discoveredIds.filter(
        (id): id is string => typeof id === "string" && knownHeadlineIds.has(id),
      ),
    )];
  } catch {
    return [];
  }
}

/**
 * Loads the list of discovered headline IDs from storage.
 * @param storage - The storage mechanism to use. Defaults to browser localStorage if available.
 * @returns An array of discovered headline IDs.
 */
export function loadDiscoveredHeadlineIds(
  storage: StorageLike | undefined = getBrowserStorage(),
): string[] {
  return storage ? readIds(storage) : [];
}

/**
 * Records known headline IDs once. Persistence failures are intentionally
 * swallowed so collection tracking cannot interrupt headline rendering.
 * @param ids - An array of headline IDs to record as discovered.
 * @param storage - The storage mechanism to use. Defaults to browser localStorage if available.
 * @returns An array of all discovered headline IDs after recording.
 */
export function recordDiscoveredHeadlines(
  ids: readonly string[],
  storage: StorageLike | undefined = getBrowserStorage(),
): string[] {
  if (!storage) return [];

  const discovered = new Set(readIds(storage));
  for (const id of ids) {
    if (knownHeadlineIds.has(id)) discovered.add(id);
  }

  try {
    const record: CollectionRecord = {
      version: STORAGE_VERSION,
      discoveredIds: [...discovered],
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage can be disabled, full, or blocked by the browser.
  }

  return [...discovered];
}
