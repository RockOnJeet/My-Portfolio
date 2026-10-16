import {
  selectHeadline,
  defaultHeadline,
  headlineVariants,
} from "./data/headlines";
import {
  loadDiscoveredHeadlineIds,
  recordDiscoveredHeadlines,
} from "./data/headline-collection";

const heading = document.querySelector<HTMLHeadingElement>("#hero-heading");
const raritySticker = document.querySelector<HTMLDivElement>(
  ".hero__rarity-sticker",
);
const progressText = document.querySelector<HTMLSpanElement>(
  ".hero__rarity-sticker__progress",
);
const selectedHeadline = selectHeadline();  // Select a new headline variant based on rarity probabilities

if (progressText) {
  const savedIds = loadDiscoveredHeadlineIds(); // Load previous values from localStorage
  progressText.textContent = `${savedIds.length}/${1 + headlineVariants.length}`;
}

if (heading && selectedHeadline) {
  // Update the heading with the selected headline
  const segments = document.createDocumentFragment();

  for (const segment of selectedHeadline.segments) {
    const span = document.createElement("span");
    span.classList.add("hero__segment");

    if (segment.emphasis) {
      span.classList.add(`hero__segment--${segment.emphasis}`);
    }

    span.textContent = segment.text;
    segments.append(span);
  }

  heading.replaceChildren(segments);

  // Update the rarity sticker with the selected headline's rarity
  if (raritySticker) {
    raritySticker.dataset.rarity = selectedHeadline.rarity;
    raritySticker.setAttribute(
      "aria-label",
      `Rarity: ${selectedHeadline.rarity}`,
    );
  }

  // Record the newly discovered headline ID in localStorage
  const discoveredIds = recordDiscoveredHeadlines([
    defaultHeadline.id,
    selectedHeadline.id,
  ]);

  // Update the progress text to reflect the number of discovered headlines
  if (progressText) {
    progressText.textContent = `${discoveredIds.length}/${1 + headlineVariants.length}`;
  }
}
