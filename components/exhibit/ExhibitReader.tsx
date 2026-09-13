"use client";

import React, { useEffect, useState, useRef } from "react";
import type { ChapterMeta } from "@/lib/types";
import { KatexEquation } from "./KatexEquation";
import { Volume2, VolumeX, List, ChevronLeft, ChevronRight, Hash } from "lucide-react";
import { useNarrator } from "@/components/narrator/NarratorContext";

interface ExhibitReaderProps {
  chapter: ChapterMeta;
  projectSlug: string;
  prevChapter?: ChapterMeta | null;
  nextChapter?: ChapterMeta | null;
  audioUrl?: string | null;
}

// Enhanced markdown renderer with KaTeX, tables, and code blocks
function renderMarkdown(content: string): React.ReactNode[] {
  const lines = content.split("\n");
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
    if (line.trim() === "$$" || line.trim().startsWith("$$") && !line.trim().endsWith("$$")) {
      const eqLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("$$")) {
        eqLines.push(lines[i]);
        i++;
      }
      i++; // skip closing $$
      const expr = eqLines.join("\n").trim();
      elements.push(
        <div key={key++} className="equation-block">
          <KatexEquation expression={expr} displayMode />
        </div>
      );
      continue;
    }

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push(
        <pre key={key++} style={{ background: 'var(--code-bg)', border: '1px solid var(--border)' }} className="rounded-xl p-4 overflow-x-auto mb-4">
          <code style={{ color: 'var(--ink-secondary)', fontFamily: 'var(--font-geist-mono), monospace', fontSize: '0.875rem' }}>
            {codeLines.join("\n")}
          </code>
        </pre>
      );
      continue;
    }

    // Table
    if (line.includes("|") && lines[i + 1]?.includes("---")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines.filter((l) => !l.includes("---")).map((l) =>
        l.split("|").map((c) => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1)
      );
      const [header, ...body] = rows;
      elements.push(
        <div key={key++} className="overflow-x-auto my-6">
          <table className="data-table">
            <thead>
              <tr>
                {header.map((h, j) => (
                  <th key={j}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Headings
    const h1Match = line.match(/^# (.+)$/);
    const h2Match = line.match(/^## (.+)$/);
    const h3Match = line.match(/^### (.+)$/);
    const h4Match = line.match(/^#### (.+)$/);

    if (h1Match) {
      const id = h1Match[1].toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      elements.push(
        <h1 key={key++} id={id} className="scroll-mt-20 text-3xl font-extrabold tracking-tight mt-10 mb-4"
          style={{ color: 'var(--ink-primary)' }}>
          {renderInline(h1Match[1])}
        </h1>
      );
      i++;
      continue;
    }
    if (h2Match) {
      const id = h2Match[1].toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      elements.push(
        <h2 key={key++} id={id} className="scroll-mt-20 text-xl font-bold tracking-tight mt-8 mb-3 pb-2"
          style={{ color: 'var(--ink-primary)', borderBottom: '1px solid var(--border)' }}>
          {renderInline(h2Match[1])}
        </h2>
      );
      i++;
      continue;
    }
    if (h3Match) {
      const id = h3Match[1].toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      elements.push(
        <h3 key={key++} id={id} className="scroll-mt-20 text-base font-semibold mt-6 mb-2"
          style={{ color: 'var(--cryo)' }}>
          {renderInline(h3Match[1])}
        </h3>
      );
      i++;
      continue;
    }
    if (h4Match) {
      elements.push(
        <h4 key={key++} className="text-xs font-bold uppercase tracking-widest mt-5 mb-1.5"
          style={{ color: 'var(--ink-muted)' }}>
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
        <blockquote key={key++} className="my-4 pl-4 italic text-sm"
          style={{ borderLeft: '3px solid var(--cryo)', color: 'var(--ink-muted)', background: 'var(--bg-surface)', padding: '0.75em 1em', borderRadius: '0 8px 8px 0' }}>
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
        <ul key={key++} className="my-3 space-y-1.5 ml-4" style={{ listStyleType: 'disc', color: 'var(--ink-secondary)' }}>
          {listItems.map((item, j) => (
            <li key={j} className="text-sm leading-relaxed pl-1">{renderInline(item)}</li>
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
        <ol key={key++} className="my-3 space-y-1.5 ml-4" style={{ listStyleType: 'decimal', color: 'var(--ink-secondary)' }}>
          {listItems.map((item, j) => (
            <li key={j} className="text-sm leading-relaxed pl-1">{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
      elements.push(<hr key={key++} className="my-8" style={{ borderColor: 'var(--border)' }} />);
      i++;
      continue;
    }

    // Paragraph
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() && !lines[i].match(/^(#{1,6} |[-*+] |\d+\. |```|> |---|\*\*\*|\|)/)) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      elements.push(
        <p key={key++} className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: 'var(--ink-secondary)' }}>
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

  // Process inline patterns
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  // Simple inline renderer using regex splits
  const inlineMathRegex = /\$([^$]+)\$/g;
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const italicRegex = /\*([^*]+)\*/g;
  const codeRegex = /`([^`]+)`/g;

  // Combined pattern processing
  const tokens = remaining.split(/(\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {tokens.map((token, i) => {
        if (token.startsWith("$") && token.endsWith("$") && token.length > 2) {
          return <KatexEquation key={i} expression={token.slice(1, -1)} />;
        }
        if (token.startsWith("**") && token.endsWith("**")) {
          return <strong key={i} style={{ color: 'var(--ink-primary)', fontWeight: '700' }}>{token.slice(2, -2)}</strong>;
        }
        if (token.startsWith("*") && token.endsWith("*") && !token.startsWith("**")) {
          return <em key={i}>{token.slice(1, -1)}</em>;
        }
        if (token.startsWith("`") && token.endsWith("`")) {
          return (
            <code key={i} style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', color: 'var(--cryo)', padding: '0.15em 0.4em', borderRadius: '4px', fontSize: '0.875em', fontFamily: 'var(--font-geist-mono), monospace' }}>
              {token.slice(1, -1)}
            </code>
          );
        }
        return <React.Fragment key={i}>{token}</React.Fragment>;
      })}
    </>
  );
}

export function ExhibitReader({ chapter, projectSlug, prevChapter, nextChapter, audioUrl }: ExhibitReaderProps) {
  const { loadTrack, currentTrack, isPlaying } = useNarrator();
  const [tocOpen, setTocOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("");

  // Intersection observer for TOC highlighting
  useEffect(() => {
    const headingElements = document.querySelectorAll('h1[id], h2[id], h3[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-10% 0% -80% 0%' }
    );
    headingElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [chapter.content]);

  const handlePlayNarration = () => {
    if (!audioUrl) return;
    loadTrack(chapter.slug, chapter.title, audioUrl);
  };

  const isCurrentTrack = currentTrack?.slug === chapter.slug;

  return (
    <div className="flex gap-0 relative">
      {/* Left TOC */}
      <aside
        className="hidden xl:flex flex-col sticky top-16 h-[calc(100vh-4rem)] w-56 shrink-0 pt-8 pr-4 overflow-y-auto"
        style={{ borderRight: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>
            Contents
          </span>
          <button onClick={() => setTocOpen(!tocOpen)} style={{ color: 'var(--ink-dim)' }}>
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
        {tocOpen && (
          <nav className="space-y-0.5">
            {chapter.headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className="block text-[11px] leading-snug py-1 rounded transition-all"
                style={{
                  paddingLeft: h.level === 1 ? '8px' : h.level === 2 ? '12px' : '20px',
                  color: activeSection === h.id ? 'var(--cryo)' : 'var(--ink-muted)',
                  fontWeight: activeSection === h.id ? '600' : '400',
                  borderLeft: activeSection === h.id ? '2px solid var(--cryo)' : '2px solid transparent',
                }}
              >
                {h.text}
              </a>
            ))}
          </nav>
        )}

        {/* Narration Button in TOC */}
        {audioUrl && (
          <div className="mt-auto pb-4">
            <div className="h-px mb-4" style={{ background: 'var(--border)' }} />
            <button
              onClick={handlePlayNarration}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: isCurrentTrack && isPlaying ? 'var(--amber-subtle)' : 'var(--bg-surface)',
                border: `1px solid ${isCurrentTrack && isPlaying ? 'color-mix(in srgb, var(--amber) 40%, transparent)' : 'var(--border)'}`,
                color: isCurrentTrack && isPlaying ? 'var(--amber)' : 'var(--ink-muted)',
              }}
            >
              {isCurrentTrack && isPlaying ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
              <span>{isCurrentTrack && isPlaying ? 'Playing narration' : 'Listen to chapter'}</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 px-4 sm:px-8 py-10 max-w-3xl">
        {/* Chapter Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full"
              style={{ background: 'var(--amber-subtle)', color: 'var(--amber)', border: '1px solid color-mix(in srgb, var(--amber) 30%, transparent)' }}>
              {chapter.act}
            </span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--ink-dim)' }}>
              Ch {chapter.chapterNumber} · {chapter.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" style={{ color: 'var(--ink-primary)' }}>
            {chapter.title}
          </h1>

          {/* Mobile narration button */}
          {audioUrl && (
            <button
              onClick={handlePlayNarration}
              className="xl:hidden inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium mb-6 transition-all"
              style={{
                background: isCurrentTrack && isPlaying ? 'var(--amber-subtle)' : 'var(--bg-panel)',
                border: `1px solid ${isCurrentTrack ? 'color-mix(in srgb, var(--amber) 40%, transparent)' : 'var(--border)'}`,
                color: isCurrentTrack && isPlaying ? 'var(--amber)' : 'var(--ink-muted)',
              }}
            >
              <Volume2 className="w-4 h-4" />
              {isCurrentTrack && isPlaying ? 'Narration playing' : 'Listen to this chapter'}
            </button>
          )}

          <div className="h-px" style={{ background: `linear-gradient(to right, var(--cryo), var(--amber), transparent)`, opacity: 0.4 }} />
        </div>

        {/* Chapter Body */}
        <article className="chapter-body">
          {renderMarkdown(chapter.content)}
        </article>

        {/* Chapter Navigation */}
        <div className="flex items-center justify-between mt-16 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
          {prevChapter ? (
            <a
              href={`/${projectSlug}/${prevChapter.slug}`}
              className="flex items-center gap-3 group"
            >
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" style={{ color: 'var(--ink-muted)' }} />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: 'var(--ink-dim)' }}>
                  Previous
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
                  {prevChapter.title}
                </div>
              </div>
            </a>
          ) : <div />}

          {nextChapter && (
            <a
              href={`/${projectSlug}/${nextChapter.slug}`}
              className="flex items-center gap-3 group text-right"
            >
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: 'var(--ink-dim)' }}>
                  Next
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
                  {nextChapter.title}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" style={{ color: 'var(--ink-muted)' }} />
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
