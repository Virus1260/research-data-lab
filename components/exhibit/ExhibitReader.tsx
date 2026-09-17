"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { ChapterMeta, AudioManifest } from "@/lib/types";
import { KatexEquation } from "./KatexEquation";
import { ExportModal } from "./ExportModal";
import {
  Volume2,
  VolumeX,
  List,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sigma,
  Calculator,
  Sliders,
  Headphones,
  Download,
  ExternalLink,
} from "lucide-react";
import { useNarrator } from "@/components/narrator/NarratorContext";

interface ExhibitReaderProps {
  chapter: ChapterMeta;
  projectSlug: string;
  prevChapter?: ChapterMeta | null;
  nextChapter?: ChapterMeta | null;
  audioUrl?: string | null;
  manifest?: AudioManifest | null;
  allChapters?: ChapterMeta[];
}

/**
 * Interactive link component that dynamically represents any reference or URL
 * as readable text accompanied by a clickable "Open in new tab" interactive button badge.
 */
function InteractiveUrlLink({
  url,
  label,
  className = "",
}: {
  url: string;
  label?: string;
  className?: string;
}) {
  let displayLabel = label;
  if (!displayLabel) {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      const host = parsed.hostname.replace(/^www\./, "");
      const path =
        parsed.pathname.length > 32
          ? parsed.pathname.slice(0, 30) + "…"
          : parsed.pathname === "/"
          ? ""
          : parsed.pathname;
      displayLabel = `${host}${path}`;
    } catch {
      displayLabel = url.length > 42 ? url.slice(0, 40) + "…" : url;
    }
  }

  const targetHref = url.startsWith("http") ? url : `https://${url}`;

  return (
    <a
      href={targetHref}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 my-0.5 mx-1 rounded-lg text-xs font-mono font-medium transition-all duration-200 group border shadow-xs align-middle hover:shadow-md hover:-translate-y-0.5 ${className}`}
      style={{
        background: "color-mix(in srgb, var(--amber-subtle) 70%, var(--bg-surface))",
        borderColor: "color-mix(in srgb, var(--amber) 40%, var(--border))",
        color: "var(--ink-primary)",
      }}
      title={`Open external reference: ${targetHref}`}
    >
      <span className="truncate max-w-[220px] sm:max-w-md group-hover:text-amber underline decoration-amber/30 group-hover:decoration-amber transition-colors">
        {displayLabel}
      </span>
      <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all duration-150 shrink-0"
        style={{
          background: "var(--amber)",
          color: "var(--on-amber)",
        }}
      >
        <span>Open ↗</span>
        <ExternalLink className="w-2.5 h-2.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </span>
    </a>
  );
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
  allChapters = [],
}: ExhibitReaderProps) {
  const [mounted, setMounted] = useState(false);
  const {
    loadTrack,
    currentTrack,
    isPlaying,
    selectedPersona,
    voiceStudioOpen,
    setVoiceStudioOpen,
    activeSpokenPhrase,
    activeCue,
    syncScroll,
  } = useNarrator();
  const [tocOpen, setTocOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("");
  const [exportOpen, setExportOpen] = useState(false);

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

  const isCurrentTrack = currentTrack?.slug === chapter.slug;
  const isThisPlaying = isCurrentTrack && isPlaying;

  // In-page speech highlighting & smooth auto-scroll for active narration
  useEffect(() => {
    if (!mounted) return;

    // Clean up previous highlights
    const prevHighlights = document.querySelectorAll(".narrator-active-highlight");
    prevHighlights.forEach((el) => el.classList.remove("narrator-active-highlight"));

    if (!isThisPlaying) return;

    // Target cue or phrase
    const targetText = (activeCue?.text || activeSpokenPhrase || "").trim().toLowerCase();
    if (!targetText || targetText.length < 4) return;

    const mainContainer = document.getElementById("monograph-reader-main");
    if (!mainContainer) return;

    // Find the paragraph, list item, or heading containing words from the spoken phrase
    const candidates = mainContainer.querySelectorAll("p, li, h1, h2, h3, blockquote");
    const searchWords = targetText
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);
    if (searchWords.length === 0) return;

    let bestMatch: Element | null = null;
    let highestScore = 0;

    for (const el of Array.from(candidates)) {
      const elText = (el.textContent || "").toLowerCase();
      let score = 0;
      for (const word of searchWords) {
        if (elText.includes(word)) score++;
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = el;
      }
    }

    if (bestMatch && highestScore >= Math.min(2, searchWords.length)) {
      bestMatch.classList.add("narrator-active-highlight");
      if (syncScroll) {
        bestMatch.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeSpokenPhrase, activeCue, isThisPlaying, syncScroll, mounted]);

  if (!mounted) {
    return null;
  }

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
            {listItems.map((item, j) => {
              const hasUrl =
                item.includes("http://") || item.includes("https://") || item.includes("www.");
              return (
                <li
                  key={j}
                  className={`text-sm sm:text-base leading-relaxed pl-1 rounded-xl transition-all ${
                    hasUrl
                      ? "p-2 bg-bg-surface/30 hover:bg-bg-hover/70 border border-hairline/40 my-1.5"
                      : ""
                  }`}
                >
                  {renderInline(item)}
                </li>
              );
            })}
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
          <ol key={key++} className="my-4 space-y-2.5 ml-5 list-decimal text-ink-secondary marker:text-amber marker:font-bold">
            {listItems.map((item, j) => {
              const hasUrl =
                item.includes("http://") || item.includes("https://") || item.includes("www.");
              return (
                <li
                  key={j}
                  className={`text-sm sm:text-base leading-relaxed pl-1 rounded-xl transition-all ${
                    hasUrl
                      ? "p-2.5 bg-bg-surface/35 hover:bg-bg-hover/80 border border-hairline/50 my-2 shadow-xs hover:border-amber/30"
                      : ""
                  }`}
                >
                  {renderInline(item)}
                </li>
              );
            })}
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

  // Inline formatting: bold, italic, code, inline math, markdown links, raw URLs
  function renderInline(text: string): React.ReactNode {
    if (!text) return null;

    // Matches: KaTeX $...$, Markdown links [text](url), Raw URLs (https?:// or www.), **bold**, *italic*, `code`
    const TOKEN_REGEX =
      /(\$[^$]+\$|\[[^\]]+\]\([^\s)]+\)|(?:https?:\/\/|www\.)[^\s<>)"]+|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    const tokens = text.split(TOKEN_REGEX);

    return (
      <>
        {tokens.map((token, idx) => {
          if (!token) return null;

          // Inline KaTeX Math: $...$
          if (token.startsWith("$") && token.endsWith("$") && token.length > 2) {
            return <KatexEquation key={idx} expression={token.slice(1, -1)} />;
          }

          // Markdown Link: [label](url)
          if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
            const match = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if (match) {
              const [, label, linkUrl] = match;
              if (
                linkUrl.startsWith("http://") ||
                linkUrl.startsWith("https://") ||
                linkUrl.startsWith("www.")
              ) {
                return <InteractiveUrlLink key={idx} url={linkUrl} label={label} />;
              }
              // Internal application link
              return (
                <Link
                  key={idx}
                  href={linkUrl}
                  className="inline-flex items-center gap-1 text-cryo hover:text-amber font-semibold underline underline-offset-2 transition-colors"
                >
                  <span>{label}</span>
                </Link>
              );
            }
          }

          // Raw URL: https://... or http://... or www....
          if (
            token.startsWith("http://") ||
            token.startsWith("https://") ||
            token.startsWith("www.")
          ) {
            let cleanUrl = token;
            let trailingPunct = "";
            while (cleanUrl.match(/[.,;:)\]]$/)) {
              trailingPunct = cleanUrl.slice(-1) + trailingPunct;
              cleanUrl = cleanUrl.slice(0, -1);
            }
            return (
              <React.Fragment key={idx}>
                <InteractiveUrlLink url={cleanUrl} />
                {trailingPunct}
              </React.Fragment>
            );
          }

          // Bold: **...**
          if (token.startsWith("**") && token.endsWith("**")) {
            return (
              <strong key={idx} className="font-bold text-ink-primary">
                {token.slice(2, -2)}
              </strong>
            );
          }

          // Italic: *...*
          if (token.startsWith("*") && token.endsWith("*") && !token.startsWith("**")) {
            return (
              <em key={idx} className="italic text-ink-primary">
                {token.slice(1, -1)}
              </em>
            );
          }

          // Code: `...`
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
      </aside>

      {/* Main Chapter Content */}
      <main id="monograph-reader-main" className="flex-1 min-w-0 px-4 sm:px-10 py-10 max-w-4xl">
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

            {/* Single canonical action group: Export & Listen */}
            <div className="flex items-center gap-2">
              {/* Export / Print Button */}
              <button
                onClick={() => setExportOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono bg-bg-panel hover:bg-bg-hover text-ink-primary border border-hairline transition shadow-sm hover:border-amber/40"
                title="Export or Print this chapter (PDF, Word, Markdown)"
              >
                <Download className="w-3.5 h-3.5 text-amber" />
                <span className="font-semibold">Export / Print</span>
              </button>

              {/* Listen Button */}
              <button
                onClick={handlePlayNarration}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isThisPlaying
                    ? "bg-amber text-on-amber shadow-amber-glow animate-pulse"
                    : "bg-amber/10 hover:bg-amber/20 text-amber border border-amber/30"
                }`}
              >
                {isThisPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber" />}
                <span>{isThisPlaying ? "Narration Playing" : audioUrl ? "Listen (Studio Audio)" : "Listen (AI Voice)"}</span>
              </button>
            </div>
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

        {/* Export & Print Monograph Modal */}
        <ExportModal
          isOpen={exportOpen}
          onClose={() => setExportOpen(false)}
          chapter={chapter}
          allChapters={allChapters}
          projectSlug={projectSlug}
        />
      </main>
    </div>
  );
}
