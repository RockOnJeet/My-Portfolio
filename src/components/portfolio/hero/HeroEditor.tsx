import type { CSSProperties, KeyboardEvent, MutableRefObject, RefObject } from "react";
import type { ThemedToken } from "shiki";
import type { EditorTab } from "@/types/portfolio";

interface HeroEditorProps {
  editorExpanded: boolean;
  activeEditorTab: string;
  editorTabs: EditorTab[];
  underlineStyle: { left: number; width: number };
  panelHeight: string;
  isCollapsing: boolean;
  highlightError: string | null;
  renderedLines: ThemedToken[][];
  tabRefs: MutableRefObject<Array<HTMLButtonElement | null>>;
  panelRef: RefObject<HTMLDivElement | null>;
  collapseEditor: () => void;
  expandEditor: () => void;
  toggleEditor: () => void;
  switchEditorTab: (tabId: string) => void;
  handleTabListKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  finishCollapse: () => void;
}

export function HeroEditor({
  editorExpanded,
  activeEditorTab,
  editorTabs,
  underlineStyle,
  panelHeight,
  isCollapsing,
  highlightError,
  renderedLines,
  tabRefs,
  panelRef,
  collapseEditor,
  expandEditor,
  toggleEditor,
  switchEditorTab,
  handleTabListKeyDown,
  finishCollapse,
}: HeroEditorProps) {
  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4 mt-8 pb-0">
      <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
        <div
          className={
            "px-4 py-2.5 flex items-center gap-2 border-b border-white/10 select-none " +
            (editorExpanded ? "bg-dark-700" : "bg-dark-700 cursor-pointer")
          }
          onClick={(event) => {
            if (!editorExpanded && !(event.target as HTMLElement).closest("button")) expandEditor();
          }}
          onDoubleClick={(event) => {
            event.preventDefault();
            if (editorExpanded) collapseEditor();
          }}
        >
          <div className="flex gap-1.5">
            <button type="button" onClick={collapseEditor} aria-label="Collapse editor" className="w-3 h-3 rounded-full bg-danger-500 focus:outline-none focus:ring-2 focus:ring-white/50" />
            <button type="button" aria-label={editorExpanded ? "Collapse editor" : "Expand editor"} onClick={toggleEditor} className="w-3 h-3 rounded-full bg-warning-500 focus:outline-none focus:ring-2 focus:ring-white/50" />
            <button type="button" aria-label="Green control (no-op)" className="w-3 h-3 rounded-full bg-success-500 focus:outline-none focus:ring-2 focus:ring-white/50" />
          </div>

          {!editorExpanded ? (
            <div className="flex-1 text-left text-xs text-white/80">For AI bots... or competent humans.</div>
          ) : (
            <div className="relative flex flex-1 items-center gap-1 ml-2 text-xs rounded-t-md px-2 py-1 bg-dark-700" role="tablist" aria-label="Editor tabs" onKeyDown={handleTabListKeyDown}>
              <div
                className="absolute left-0 bottom-0 h-0.5 transition-all duration-200 ease-out"
                style={{ width: `${underlineStyle.width}px`, transform: `translateX(${underlineStyle.left}px)`, background: "var(--accent-blue)" }}
              />
              {editorTabs.map((tab, idx) => (
                <button
                  key={tab.id}
                  ref={(el) => { tabRefs.current[idx] = el; }}
                  id={`editor-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={tab.id === activeEditorTab}
                  aria-controls={`editor-panel-${tab.id}`}
                  className={"relative px-3 py-1 rounded-t-md focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors duration-150 cursor-pointer " + (tab.id === activeEditorTab ? "text-white" : "text-white/60 hover:text-white/80")}
                  onClick={() => switchEditorTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className="transition-[height,opacity] duration-300 ease-out overflow-hidden max-h-[420px]"
          style={{ height: editorExpanded ? panelHeight : "0px", opacity: editorExpanded ? 1 : 0 } as CSSProperties}
          onTransitionEnd={() => { if (isCollapsing) finishCollapse(); }}
        >
          <div ref={panelRef} id={`editor-panel-${activeEditorTab}`} role="tabpanel" aria-labelledby={`editor-tab-${activeEditorTab}`} className="px-6 py-5 font-mono text-sm text-left overflow-x-auto overflow-y-auto max-h-full bg-dark-700">
            {highlightError && <div className="mb-3 text-xs text-amber-400/90">Syntax highlighting unavailable: {highlightError}</div>}
            <div className="flex text-muted-100">
              <div className="flex-shrink-0 w-12 pr-3 text-right text-white/20 select-none">
                {renderedLines.map((_, i) => <div key={`line-${i}`} className="leading-5">{i + 1}</div>)}
              </div>
              <div className="min-w-0 flex-1 overflow-x-auto">
                <pre className="whitespace-pre text-muted-100">
                  {renderedLines.map((lineTokens, i) => (
                    <div key={`code-line-${i}`} className="leading-5">
                      {lineTokens.length > 0 ? lineTokens.map((token, tokenIndex) => {
                        const fontStyle = token.fontStyle ?? 0;
                        return (
                          <span
                            key={`${i}-${tokenIndex}`}
                            style={{
                              color: token.color ?? "var(--muted-100)",
                              fontStyle: (fontStyle & 1) !== 0 ? "italic" : "normal",
                              fontWeight: (fontStyle & 2) !== 0 ? 700 : 400,
                              textDecoration: (fontStyle & 4) !== 0 ? "underline" : "none",
                            }}
                          >
                            {token.content}
                          </span>
                        );
                      }) : <span />}
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
