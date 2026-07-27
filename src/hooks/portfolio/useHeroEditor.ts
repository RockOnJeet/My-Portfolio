import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { ThemedToken } from "shiki";
import { hero } from "@/data/config";
import { isSupportedEditorLanguage, tokenizeForEditor } from "@/lib/syntaxHighlight";

const MAX_EDITOR_PANEL_HEIGHT = 420;
const getPanelHeight = (height: number) => `${Math.min(height, MAX_EDITOR_PANEL_HEIGHT)}px`;

export function useHeroEditor() {
  const editorTabs = useMemo(
    () =>
      hero.editorTabs ?? [
        { id: "placeholder", label: "readme.txt", content: "Add hero.editorTabs in src/data/config.ts to enable editor tabs." },
        { id: "about", label: "about.md", content: "# About\n\nThis is a mock markdown file representing a typical about page.\n\n- Throw in some bullet points\n- Add a few highlights\n- Show that this is an interactive tab" },
        { id: "projects", label: "projects.json", content: JSON.stringify({ projects: [] }, null, 2) },
      ],
    [],
  );
  const [editorExpanded, setEditorExpanded] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState(editorTabs[0].id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const [panelHeight, setPanelHeight] = useState("0px");
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [tokenizedLines, setTokenizedLines] = useState<ThemedToken[][] | null>(null);
  const [highlightError, setHighlightError] = useState<string | null>(null);

  const activeTab = useMemo(() => editorTabs.find((tab) => tab.id === activeEditorTab), [activeEditorTab, editorTabs]);
  const activeLanguage = activeTab?.label.split(".").pop()?.toLowerCase() ?? "ts";
  const activeCode = activeTab?.content ?? "";
  const editorTabIndex = useMemo(() => editorTabs.findIndex((tab) => tab.id === activeEditorTab), [editorTabs, activeEditorTab]);
  const renderedLines = useMemo(
    () => tokenizedLines ?? activeCode.split("\n").map((line) => [{ content: line } as ThemedToken]),
    [tokenizedLines, activeCode],
  );

  const setPanelHeightToContent = () => {
    if (panelRef.current) setPanelHeight(getPanelHeight(panelRef.current.scrollHeight));
  };

  const collapseEditor = () => {
    if (panelRef.current) {
      setPanelHeight(getPanelHeight(panelRef.current.scrollHeight));
      setIsCollapsing(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setPanelHeight("0px")));
      return;
    }
    setPanelHeight("0px");
    setEditorExpanded(false);
  };

  const expandEditor = () => {
    setIsCollapsing(false);
    setEditorExpanded(true);
    requestAnimationFrame(setPanelHeightToContent);
  };

  const toggleEditor = () => (editorExpanded ? collapseEditor() : expandEditor());

  const switchEditorTab = (tabId: string) => {
    if (tabId === activeEditorTab) return;
    if (editorExpanded && panelRef.current) {
      setPanelHeight(`${panelRef.current.scrollHeight}px`);
      requestAnimationFrame(() => setActiveEditorTab(tabId));
      return;
    }
    setActiveEditorTab(tabId);
  };

  const handleTabListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (editorTabIndex + direction + editorTabs.length) % editorTabs.length;
    switchEditorTab(editorTabs[nextIndex].id);
  };

  const finishCollapse = () => {
    setIsCollapsing(false);
    setEditorExpanded(false);
    setPanelHeight("0px");
  };

  useEffect(() => {
    let canceled = false;
    if (!editorExpanded || !isSupportedEditorLanguage(activeLanguage)) {
      setTokenizedLines(null);
      setHighlightError(null);
      return () => { canceled = true; };
    }
    setHighlightError(null);
    tokenizeForEditor(activeCode, activeLanguage)
      .then((tokens) => { if (!canceled) setTokenizedLines(tokens); })
      .catch((error) => {
        if (!canceled) {
          setTokenizedLines(null);
          setHighlightError(error instanceof Error ? error.message : "Syntax highlighting failed to load");
        }
      });
    return () => { canceled = true; };
  }, [activeCode, activeLanguage, editorExpanded]);

  useEffect(() => {
    if (editorExpanded) document.getElementById(`editor-tab-${activeEditorTab}`)?.focus();
  }, [activeEditorTab, editorExpanded]);

  useLayoutEffect(() => {
    if (!editorExpanded) return;
    const button = tabRefs.current[editorTabIndex];
    const parentRect = button?.parentElement?.getBoundingClientRect();
    if (!button || !parentRect) return;
    const rect = button.getBoundingClientRect();
    setUnderlineStyle({ left: rect.left - parentRect.left, width: rect.width });
  }, [activeEditorTab, editorTabIndex, editorExpanded]);

  useEffect(() => {
    if (editorExpanded) setPanelHeightToContent();
  }, [activeEditorTab, activeCode, editorExpanded]);

  return {
    editorExpanded, activeEditorTab, editorTabs, underlineStyle, panelHeight, isCollapsing,
    highlightError, renderedLines, tabRefs, panelRef, collapseEditor, expandEditor, toggleEditor,
    switchEditorTab, handleTabListKeyDown, finishCollapse,
  };
}
