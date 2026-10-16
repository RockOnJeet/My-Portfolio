export const rarityTiers = ["normal", "epic", "legendary", "mythic"] as const;
export type Rarity = (typeof rarityTiers)[number];

export interface Headline {
  id: string;
  segments: { text: string; emphasis?: "muted" | "accent" }[];
  rarity: Rarity;
}

export type HeadlineContent = Omit<Headline, "id">;

//! WARNING: Changing this namespace changes every generated headline UUID and
//! invalidates saved collection identities. Keep it stable after release.
export const HEADLINE_UUID_NAMESPACE = "8c0e4d7a-2e6b-4f9c-9a1d-5b7f3c2e1a60";

export const defaultHeadlineContent: HeadlineContent = {
  segments: [
    { text: "Welcome", emphasis: "accent" },
    { text: " to my Portfolio!" },
  ],
  rarity: "normal",
};

//! WARNING: Changing any text updates the generated UUID
export const headlineVariantContent: HeadlineContent[] = [
  {
    segments: [
      { text: "I'm " },
      { text: "not", emphasis: "muted" },
      { text: " a WebDev." },
    ],
    rarity: "normal",
  },
  {
    segments: [
      { text: "Try " },
      { text: "refreshing", emphasis: "muted" },
      { text: " the page." },
    ],
    rarity: "normal",
  },
  {
    segments: [
      { text: "I " },
      { text: "love", emphasis: "muted" },
      { text: " Programming." },
    ],
    rarity: "normal",
  },
  {
    segments: [
      { text: "I " },
      { text: "can", emphasis: "muted" },
      { text: " write poetry too." },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "I " },
      { text: "read", emphasis: "muted" },
      { text: " them docs." },
    ],
    rarity: "normal",
  },
  {
    segments: [
      { text: "GeeksForGeeks", emphasis: "muted" },
      { text: " is my Teacher." },
    ],
    rarity: "normal",
  },
  {
    segments: [
      { text: "Was it " },
      { text: "really", emphasis: "muted" },
      { text: " worth it?" },
    ],
    rarity: "mythic",
  },
  {
    segments: [
      { text: "I " },
      { text: "don't", emphasis: "muted" },
      { text: " do Full-Stack." },
    ],
    rarity: "normal",
  },
  {
    segments: [
      { text: "You " },
      { text: "really", emphasis: "muted" },
      { text: " like code, huh?" },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "I " },
      { text: "build", emphasis: "muted" },
      { text: " cool stuff." },
    ],
    rarity: "normal",
  },
  {
    segments: [
      { text: "I " },
      { text: "code", emphasis: "muted" },
      { text: " in my sleep." },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "How many F5's did you do?" },
    ],
    rarity: "mythic",
  },
  {
    segments: [
      { text: "None", emphasis: "muted" },
      { text: " of this was made by me." },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "This is " },
      { text: "not", emphasis: "muted" },
      { text: " a 404 page." },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "Top coder in " },
      { text: "hiding", emphasis: "muted" },
      { text: "." },
    ],
    rarity: "legendary",
  },
  {
    segments: [
      { text: "I " },
      { text: "don't", emphasis: "muted" },
      { text: " know what I'm doing." },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "You just " },
      { text: "keep", emphasis: "muted" },
      { text: " refreshing don't you?" },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "I " },
      { text: "write", emphasis: "muted" },
      { text: " code like this." },
    ],
    rarity: "normal",
  },
  {
    segments: [
      { text: "I " },
      { text: "really", emphasis: "muted" },
      { text: " should get a job." },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "Yes, I " },
      { text: "use", emphasis: "muted" },
      { text: " GitHub Copilot." },
    ],
    rarity: "legendary",
  },
  {
    segments: [
      { text: "You " },
      { text: "found", emphasis: "muted" },
      { text: " the Easter Egg!" },
    ],
    rarity: "mythic",
  },
  {
    segments: [
      { text: "You " },
      { text: "shouldn't", emphasis: "muted" },
      { text: " be reading this." },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "Don't " },
      { text: "ask", emphasis: "muted" },
      { text: " about LeetCode." },
    ],
    rarity: "normal",
  },

  {
    segments: [
      { text: "I " },
      { text: "promise", emphasis: "muted" },
      { text: " I'm not a bot." },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "No one's gonna believe you." },
    ],
    rarity: "mythic",
  },
  {
    segments: [
      { text: "I " },
      { text: "swear", emphasis: "muted" },
      { text: " I'm a human." },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "My prompts, " },
      { text: "AI", emphasis: "muted" },
      { text: "'s code." },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "I " },
      { text: "hope", emphasis: "muted" },
      { text: " you like robots." },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "Tell me " },
      { text: "about", emphasis: "muted" },
      { text: " this." },
    ],
    rarity: "mythic",
  },
  {
    segments: [
      { text: "Not " },
      { text: "your", emphasis: "muted" },
      { text: " typical portfolio." },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "I " },
      { text: "bet", emphasis: "muted" },
      { text: " you can't read all these." },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "You just " },
      { text: "lost", emphasis: "muted" },
      { text: " the game." },
    ],
    rarity: "mythic",
  },
  {
    segments: [
      { text: "Hey, I'm " },
      { text: "looking", emphasis: "muted" },
      { text: " for a job!" },
    ],
    rarity: "normal",
  },
  {
    segments: [
      { text: "Hey,", emphasis: "muted" },
      { text: " you're awake. (I hope so)" },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "Wait, you " },
      { text: "can", emphasis: "muted" },
      { text: " read this?" },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "I " },
      { text: "play", emphasis: "muted" },
      { text: " Minecraft too." },
    ],
    rarity: "legendary",
  },
  {
    segments: [
      { text: "Never gonna " },
      { text: "give", emphasis: "muted" },
      { text: " you up, never gonna let you down." },
    ],
    rarity: "mythic",
  },
  {
    segments: [
      { text: "I'm a " },
      { text: "CEO", emphasis: "muted" },
      { text: " of bad jokes." },
    ],
    rarity: "epic",
  },
  {
    segments: [
      { text: "I'm on " },
      { text: "GitHub", emphasis: "muted" },
      { text: "." },
    ],
    rarity: "normal",
  },
  {
    segments: [
      { text: "I " },
      { text: "love", emphasis: "muted" },
      { text: " open-source software." },
    ],
    rarity: "normal",
  },
  {
    segments: [
      { text: "I " },
      { text: "have", emphasis: "muted" },
      { text: " a LinkedIn too." },
    ],
    rarity: "normal",
  },
  {
    segments: [
      { text: "Say that " },
      { text: "five", emphasis: "muted" },
      { text: " times fast." },
    ],
    rarity: "legendary",
  },
  {
    segments: [
      { text: "Endless " },
      { text: "variants", emphasis: "muted" },
      { text: " of headlines." },
    ],
    rarity: "normal",
  },
  {
    segments: [
      { text: "Ending the headline list soon..." },
    ],
    rarity: "epic",
  },
];
