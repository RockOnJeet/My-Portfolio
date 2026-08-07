import { createHighlighterCore, type ThemedToken } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import darkPlus from "@shikijs/themes/dark-plus";
import c from "@shikijs/langs/c";
import cpp from "@shikijs/langs/cpp";
import python from "@shikijs/langs/python";
import typescript from "@shikijs/langs/typescript";
import xml from "@shikijs/langs/xml";

const THEME = "dark-plus";

type EditorLanguage = "python" | "c" | "cpp" | "xml" | "typescript";

const languageMap: Record<string, EditorLanguage> = {
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

let highlighterPromise: ReturnType<typeof createHighlighterCore> | null = null;

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [darkPlus],
      langs: [python, c, cpp, xml, typescript],
      engine: createJavaScriptRegexEngine(),
    });
  }

  return highlighterPromise;
}

export function isSupportedEditorLanguage(language: string): boolean {
  return Boolean(languageMap[language.toLowerCase()]);
}

export async function tokenizeForEditor(
  code: string,
  language: string,
): Promise<ThemedToken[][] | null> {
  const resolvedLang = languageMap[language.toLowerCase()];
  if (!resolvedLang) {
    return null;
  }

  const highlighter = await getHighlighter();
  const result = highlighter.codeToTokens(code, {
    lang: resolvedLang,
    theme: THEME,
  });

  return result.tokens;
}
