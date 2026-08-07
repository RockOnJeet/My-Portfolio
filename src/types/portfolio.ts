export interface NavigationLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface NavigationConfig {
  name: string;
  links: NavigationLink[];
  others: NavigationLink[];
  cta: NavigationLink;
}

export interface HeadlineVariant {
  text: string;
  weight: number;
}

export interface EditorTab {
  id: string;
  label: string;
  content: string;
}

export interface HeroConfig {
  headline: string;
  headlineVariants: HeadlineVariant[];
  subline: string;
  primaryCta: NavigationLink;
  secondaryCta: NavigationLink;
  editorTabs: EditorTab[];
}

export interface PortfolioStat {
  value: string;
  label: string;
}

export interface SocialLinks {
  github?: string;
  instagram?: string;
  linkedin?: string;
}

export interface AboutConfig {
  bio: string;
  stats: PortfolioStat[];
  location: string;
  email: string;
  socials: SocialLinks;
}

export interface Project {
  name: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  url: string;
  liveUrl: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface FeedbackFormConfig {
  formId: string;
  entryIds: {
    displayName: string;
    message: string;
  };
}
