"use client";

import React, { useEffect, useState } from "react";
import type { ChapterMeta, AudioManifest } from "@/lib/types";
import { KatexEquation } from "./KatexEquation";
import { Volume2, VolumeX, List, ChevronLeft, ChevronRight, Sparkles, Sigma, Calculator } from "lucide-react";
import { useNarrator } from "@/components/narrator/NarratorContext";

interface ExhibitReaderProps {
  chapter: ChapterMeta;
  projectSlug: string;
  prevChapter?: ChapterMeta | null;
  nextChapter?: ChapterMeta | null;
  audioUrl?: string | null;
  manifest?: AudioManifest | null;
}

// Convert known textual engineering formulas to LaTeX
function formulaToLatex(formula: string): string | null {
  const t = formula.trim();
  if (t.includes("dP/dT = L / (T·Δv)") || t.includes("dP/dT = L / (T.Δv)") || t.includes("dP/dT")) {
    return "\\frac{dP}{dT} = \\frac{L}{T \\cdot \\Delta v}";
  }
  if (t.includes("Q = Kv · Av · (Ts − Tb)") || t.includes("Q = Kv . Av . (Ts - Tb)")) {
    return "Q = K_v \\cdot A_v \\cdot (T_s - T_b)";
  }
  if (t.includes("dm/dt = Q / ΔHs") || t.includes("dm/dt = Q / dHs")) {
    return "\\frac{dm}{dt} = \\frac{Q}{\\Delta H_s}";
  }
  if (t.includes("dm/dt = (Ap / Rp) · (Pice − Pch)") || t.includes("(Ap / Rp)")) {
    return "\\frac{dm}{dt} = \\frac{A_p}{R_p} \\cdot (P_{ice} - P_{ch})";
  }
  if (t.includes("Q = (dm/dt) × ΔHs") || t.includes("Q = (dm/dt) x dHs")) {
    return "Q = \\dot{m} \\cdot \\Delta H_s";
  }
  if (t.includes("Q = U × A × ΔT") || t.includes("A = Q / (U × ΔT)")) {
    return "Q = U \\cdot A \\cdot \\Delta T \\implies A = \\frac{Q}{U \\cdot \\Delta T}";
  }
  if (t.includes("Kn = λ / Lc") || t.includes("Kn = lambda / Lc")) {
    return "Kn = \\frac{\\lambda}{L_c}";
  }
  if (t.includes("P(t) =") && t.includes("exp")) {
    return "P(t) = P_{ult} + (P_0 - P_{ult}) \\cdot \\exp\\left(-\\frac{S \\cdot t}{V}\\right)";
  }
  if (t.includes("Q_cond = ṁ · ΔH_sub") || t.includes("Q_cond")) {
    return "Q_{cond} = \\dot{m} \\cdot \\Delta H_{sub}";
  }
  if (t.includes("R_p = (P_sub") || t.includes("R_p = (Pice")) {
    return "R_p = \\frac{P_{sub} - P_{ch}}{\\dot{m} / A_p}";
  }
  return null;
}

export function ExhibitReader({
  chapter,
  projectSlug,
  prevChapter,
  nextChapter,
  audioUrl,
  manifest,
}: ExhibitReaderProps) {
  const [mounted, setMounted] = useState(false);
  const { loadTrack, currentTrack, isPlaying } = useNarrator();
  const [tocOpen, setTocOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Intersection observer for TOC highlighting
  useEffect(() => {
    if (!mounted) return;
    const headingElements = document.querySelectorAll("h1[id], h2[id], h3[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-10% 0% -80% 0%" }
    );
    headingElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [chapter.content, mounted]);

  if (!mounted) {
    return null;
  }

  const isCurrentTrack = currentTrack?.slug === chapter.slug;
  const isThisPlaying = isCurrentTrack && isPlaying;

  const handlePlayNarration = () => {
    loadTrack(chapter.slug, chapter.title, audioUrl || "", manifest, chapter.content);
  };

  // Enhanced markdown renderer with KaTeX, tables, and code blocks
  function renderMarkdown(content: string): React.ReactNode[] {
    const rawLines = content.split("\n");
    const lines = rawLines.map((l) => l.replace(/\r$/, ""));
    const elements: React.ReactNode[] = [];
    let i = 0;
    let key = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Blank line
      if (!line.trim()) {
        i++;
        continue;
      }

      // Display equation block: $$ ... $$
      if (line.trim() === "$$" || (line.trim().startsWith("$$") && !line.trim().endsWith("$$"))) {
        const eqLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith("$$")) {
          eqLines.push(lines[i]);
          i++;
        }
        i++; // skip closing $$
        const expr = eqLines.join("\n").trim();
        elements.push(
          <div
            key={key++}
            className="my-6 p-6 rounded-2xl bg-bg-panel border border-hairline shadow-lg text-center overflow-x-auto"
          >
            <KatexEquation expression={expr} displayMode />
          </div>
        );
        continue;
      }

      // Fenced code block or formula block
      if (line.startsWith("```")) {
        const lang = line.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```

        const fullBlock = codeLines.join("\n").trim();
        const latexFormula = formulaToLatex(fullBlock);

        // If it's a recognized physical law / equation
        if (latexFormula) {
          elements.push(
            <div
              key={key++}
              className="my-6 rounded-2xl p-5 border border-hairline bg-bg-panel shadow-lg overflow-hidden relative"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-hairline">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber shadow-sm animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-amber font-bold flex items-center gap-1.5">
                    <Sigma className="w-3.5 h-3.5" />
                    <span>Governing Physics Law</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono text-ink-dim">Mathematical Formulation</span>
              </div>
              <div className="py-4 text-center overflow-x-auto">
                <KatexEquation expression={latexFormula} displayMode />
              </div>
              <div className="mt-2 text-center text-xs font-mono text-ink-dim bg-bg-inset/50 py-1.5 px-3 rounded-lg border border-hairline/60">
                {fullBlock}
              </div>
            </div>
          );
          continue;
        }

        // Check if it's a multi-step engineering calculation (e.g. Q1, Q2, dm/dt steps)
        const isCalc =
          fullBlock.includes("Q1") ||
          fullBlock.includes("Q2") ||
          fullBlock.includes("Total ≈") ||
          (fullBlock.includes("=") && fullBlock.includes("kg"));

        if (isCalc) {
          elements.push(
            <div
              key={key++}
              className="my-6 rounded-2xl p-5 border border-hairline bg-bg-panel shadow-lg overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-hairline">
                <div className="flex items-center gap-2">
                  <Calculator className="w-3.5 h-3.5 text-cryo" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-cryo font-bold">
                    Engineering Sizing Calculation
                  </span>
                </div>
                <span className="text-[10px] font-mono text-ink-dim">Worked Batch Balance</span>
              </div>
              <pre className="text-xs sm:text-sm font-mono leading-relaxed text-ink-primary overflow-x-auto whitespace-pre p-3 rounded-xl bg-bg-surface border border-hairline">
                {fullBlock}
              </pre>
            </div>
          );
          continue;
        }

        // Standard code block
        elements.push(
          <div key={key++} className="my-5 rounded-xl border border-hairline bg-bg-panel shadow-sm overflow-hidden">
            {lang && (
              <div className="px-4 py-1.5 bg-bg-surface border-b border-hairline text-[10px] font-mono uppercase text-ink-muted">
                {lang}
              </div>
            )}
            <pre className="p-4 overflow-x-auto">
              <code className="text-xs sm:text-sm font-mono text-ink-secondary leading-relaxed">
                {codeLines.join("\n")}
              </code>
            </pre>
          </div>
        );
        continue;
      }

      // Markdown Table Parser
      const isTableLine = line.includes("|");
      const nextIsSeparator = lines[i + 1]?.includes("---") && lines[i + 1]?.includes("|");

      if (isTableLine && (nextIsSeparator || line.includes("---"))) {
        const tableLines: string[] = [];
        while (i < lines.length && (lines[i].includes("|") || lines[i].trim().match(/^[-| :]+$/))) {
          tableLines.push(lines[i].trim());
          i++;
        }

        // Filter separator line (|---|---|)
        const contentRows = tableLines.filter((l) => !l.match(/^\|?\s*[-:]+[-| :]*$/));
        const parsedRows = contentRows.map((rowStr) => {
          const rawCells = rowStr.split("|").map((c) => c.trim());
          if (rawCells[0] === "") rawCells.shift();
          if (rawCells[rawCells.length - 1] === "") rawCells.pop();
          return rawCells;
        });

        if (parsedRows.length > 0) {
          const [headerRow, ...bodyRows] = parsedRows;
          elements.push(
            <div
              key={key++}
              className="overflow-x-auto my-6 rounded-2xl border border-hairline shadow-md bg-bg-panel"
            >
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-bg-surface border-b border-hairline">
                    {headerRow.map((cell, colIdx) => (
                      <th
                        key={colIdx}
                        className="px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider text-ink-primary whitespace-nowrap"
                      >
                        {renderInline(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {bodyRows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="hover:bg-bg-hover transition-colors even:bg-bg-surface/30"
                    >
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="px-4 py-3 text-xs sm:text-sm text-ink-secondary font-mono-data leading-relaxed"
                        >
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Headings
      const h1Match = line.match(/^# (.+)$/);
      const h2Match = line.match(/^## (.+)$/);
      const h3Match = line.match(/^### (.+)$/);
      const h4Match = line.match(/^#### (.+)$/);

      if (h1Match) {
        const id = h1Match[1].toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        elements.push(
          <h1
            key={key++}
            id={id}
            className="scroll-mt-24 text-2xl sm:text-4xl font-extrabold tracking-tight mt-10 mb-5 text-ink-primary"
          >
            {renderInline(h1Match[1])}
          </h1>
        );
        i++;
        continue;
      }
      if (h2Match) {
        const id = h2Match[1].toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        elements.push(
          <h2
            key={key++}
            id={id}
            className="scroll-mt-24 text-xl sm:text-2xl font-bold tracking-tight mt-10 mb-4 pb-2 text-ink-primary border-b border-hairline flex items-center gap-2"
          >
            <span className="text-amber text-sm font-mono">§</span>
            <span>{renderInline(h2Match[1])}</span>
          </h2>
        );
        i++;
        continue;
      }
      if (h3Match) {
        const id = h3Match[1].toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        elements.push(
          <h3
            key={key++}
            id={id}
            className="scroll-mt-24 text-base sm:text-lg font-bold mt-7 mb-2 text-cryo"
          >
            {renderInline(h3Match[1])}
          </h3>
        );
        i++;
        continue;
      }
      if (h4Match) {
        elements.push(
          <h4
            key={key++}
            className="text-xs font-bold uppercase tracking-widest mt-5 mb-2 text-ink-muted"
          >
            {renderInline(h4Match[1])}
          </h4>
        );
        i++;
        continue;
      }

      // Blockquote
      if (line.startsWith("> ")) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].startsWith("> ")) {
          quoteLines.push(lines[i].slice(2));
          i++;
        }
        elements.push(
          <blockquote
            key={key++}
            className="my-5 pl-4 py-3 pr-4 rounded-r-xl bg-bg-surface border-l-4 border-amber text-sm sm:text-base italic text-ink-secondary"
          >
            {quoteLines.join(" ")}
          </blockquote>
        );
        continue;
      }

      // Unordered list
      if (line.match(/^[-*+] /)) {
        const listItems: string[] = [];
        while (i < lines.length && lines[i].match(/^[-*+] /)) {
          listItems.push(lines[i].slice(2));
          i++;
        }
        elements.push(
          <ul key={key++} className="my-4 space-y-2 ml-5 list-disc text-ink-secondary marker:text-amber">
            {listItems.map((item, j) => (
              <li key={j} className="text-sm sm:text-base leading-relaxed pl-1">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered list
      if (line.match(/^\d+\. /)) {
        const listItems: string[] = [];
        while (i < lines.length && lines[i].match(/^\d+\. /)) {
          listItems.push(lines[i].replace(/^\d+\. /, ""));
          i++;
        }
        elements.push(
          <ol key={key++} className="my-4 space-y-2 ml-5 list-decimal text-ink-secondary marker:text-cryo marker:font-bold">
            {listItems.map((item, j) => (
              <li key={j} className="text-sm sm:text-base leading-relaxed pl-1">
                {renderInline(item)}
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Horizontal rule
      if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
        elements.push(<hr key={key++} className="my-10 border-hairline" />);
        i++;
        continue;
      }

      // Paragraph
      const paraLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].match(/^(#{1,6} |[-*+] |\d+\. |```|> |---|\*\*\*|\|)/)
      ) {
        paraLines.push(lines[i]);
        i++;
      }
      if (paraLines.length > 0) {
        elements.push(
          <p key={key++} className="text-sm sm:text-base leading-relaxed mb-4 text-ink-secondary">
            {renderInline(paraLines.join(" "))}
          </p>
        );
      } else {
        i++;
      }
    }

    return elements;
  }

  // Inline formatting: bold, italic, code, inline math
  function renderInline(text: string): React.ReactNode {
    if (!text) return null;

    const tokens = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return (
      <>
        {tokens.map((token, idx) => {
          if (token.startsWith("$") && token.endsWith("$") && token.length > 2) {
            return <KatexEquation key={idx} expression={token.slice(1, -1)} />;
          }
          if (token.startsWith("**") && token.endsWith("**")) {
            return (
              <strong key={idx} className="font-bold text-ink-primary">
                {token.slice(2, -2)}
              </strong>
            );
          }
          if (token.startsWith("*") && token.endsWith("*") && !token.startsWith("**")) {
            return (
              <em key={idx} className="italic text-ink-primary">
                {token.slice(1, -1)}
              </em>
            );
          }
          if (token.startsWith("`") && token.endsWith("`")) {
            return (
              <code
                key={idx}
                className="bg-bg-surface border border-hairline text-cryo px-1.5 py-0.5 rounded text-xs font-mono font-semibold"
              >
                {token.slice(1, -1)}
              </code>
            );
          }
          return <React.Fragment key={idx}>{token}</React.Fragment>;
        })}
      </>
    );
  }

  return (
    <div className="flex gap-0 relative">
      {/* Left TOC */}
      <aside className="hidden xl:flex flex-col sticky top-16 h-[calc(100vh-4rem)] w-60 shrink-0 pt-8 pr-4 overflow-y-auto border-r border-hairline">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink-dim font-semibold">
            Contents
          </span>
          <button
            onClick={() => setTocOpen(!tocOpen)}
            className="text-ink-dim hover:text-ink-primary transition"
            title="Toggle TOC"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {tocOpen && (
          <nav className="space-y-1">
            {chapter.headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className={`block text-xs leading-snug py-1.5 px-2 rounded-lg transition-all ${
                  activeSection === h.id
                    ? "bg-amber-subtle text-amber font-bold border-l-2 border-amber"
                    : "text-ink-muted hover:text-ink-primary hover:bg-bg-hover"
                }`}
                style={{
                  paddingLeft: h.level === 1 ? "8px" : h.level === 2 ? "14px" : "22px",
                }}
              >
                {h.text}
              </a>
            ))}
          </nav>
        )}

        {/* Narration Button in TOC */}
        <div className="mt-auto pb-6">
          <div className="h-px mb-4 bg-hairline" />
          <button
            onClick={handlePlayNarration}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              isThisPlaying
                ? "bg-amber text-on-amber shadow-amber-glow animate-pulse"
                : "bg-bg-surface hover:bg-bg-hover text-ink-primary border border-hairline"
            }`}
          >
            {isThisPlaying ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Pause Narration</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-amber" />
                <span>{audioUrl ? "Listen to Audio" : "Listen (AI Voice)"}</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Chapter Content */}
      <main className="flex-1 min-w-0 px-4 sm:px-10 py-10 max-w-4xl">
        {/* Chapter Header */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-subtle text-amber border border-amber/30 font-bold">
                {chapter.act}
              </span>
              <span className="text-xs font-mono text-ink-dim">
                Ch {chapter.chapterNumber} • {chapter.readTime}
              </span>
            </div>

            {/* Top Listen Button */}
            <button
              onClick={handlePlayNarration}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                isThisPlaying
                  ? "bg-amber text-on-amber shadow-amber-glow animate-pulse"
                  : "bg-bg-panel hover:bg-bg-hover text-ink-primary border border-hairline"
              }`}
            >
              {isThisPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber" />}
              <span>{isThisPlaying ? "Narration Playing" : audioUrl ? "Listen (Studio Narration)" : "Listen (AI Audio)"}</span>
            </button>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-ink-primary leading-tight">
            {chapter.title}
          </h1>

          <div className="h-0.5 w-full bg-gradient-to-r from-amber via-cryo to-transparent opacity-50 rounded-full" />
        </div>

        {/* Chapter Markdown Content */}
        <article className="chapter-body space-y-2">
          {renderMarkdown(chapter.content)}
        </article>

        {/* Chapter Navigation Footer */}
        <div className="flex items-center justify-between mt-16 pt-8 border-t border-hairline">
          {prevChapter ? (
            <a
              href={`/${projectSlug}/${prevChapter.slug}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-hover border border-hairline transition group"
            >
              <ChevronLeft className="w-5 h-5 text-ink-dim group-hover:text-amber group-hover:-translate-x-1 transition" />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-ink-dim">
                  Previous Chapter
                </div>
                <div className="text-xs sm:text-sm font-bold text-ink-primary">
                  {prevChapter.title}
                </div>
              </div>
            </a>
          ) : (
            <div />
          )}

          {nextChapter && (
            <a
              href={`/${projectSlug}/${nextChapter.slug}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-hover border border-hairline transition group text-right ml-auto"
            >
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-ink-dim">
                  Next Chapter
                </div>
                <div className="text-xs sm:text-sm font-bold text-ink-primary">
                  {nextChapter.title}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-ink-dim group-hover:text-amber group-hover:translate-x-1 transition" />
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
