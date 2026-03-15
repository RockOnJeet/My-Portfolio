import { getSingletonHighlighter, type BundledLanguage, type ThemedToken } from "shiki";

const THEME = "dark-plus";

const languageMap: Record<string, BundledLanguage> = {
  py: "python",
  python: "python",
  c: "c",
  cpp: "cpp",
  h: "cpp",
  hpp: "cpp",
  xml: "xml",
  json: "typescript",
  ts: "typescript",
  tsx: "typescript",
  typescript: "typescript",
};

const supportedLanguages = [...new Set(Object.values(languageMap))];

let highlighterPromise: ReturnType<typeof getSingletonHighlighter> | null = null;

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = getSingletonHighlighter({
      themes: [THEME],
      langs: supportedLanguages,
    });
  }

  return highlighterPromise;
}

export function isSupportedEditorLanguage(language: string): boolean {
  return Boolean(languageMap[language.toLowerCase()]);
}

export async function tokenizeForEditor(
  code: string,
  language: string
): Promise<ThemedToken[][] | null> {
  const resolvedLang = languageMap[language.toLowerCase()];
  if (!resolvedLang) {
    return null;
  }

  const highlighter = await getHighlighter();
  const result = await highlighter.codeToTokens(code, {
    lang: resolvedLang,
    theme: THEME,
  });

  return result.tokens;
}
