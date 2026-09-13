"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SimulatorComponent } from "@/components/simulators/SimulatorRegistry";
import { useNarrator } from "@/components/narrator/NarratorContext";
import type { ChapterMeta, AudioManifest } from "@/lib/types";
import {
  Volume2,
  Pause,
  Play,
  ArrowLeft,
  ArrowRight,
  List,
  Sparkles,
  BookOpen,
  Cpu,
  Clock,
} from "lucide-react";

interface ChapterReaderProps {
  projectSlug: string;
  chapter: ChapterMeta;
  prevChapter: ChapterMeta | null;
  nextChapter: ChapterMeta | null;
  manifest: AudioManifest | null;
}

export function ChapterReader({
  projectSlug,
  chapter,
  prevChapter,
  nextChapter,
  manifest,
}: ChapterReaderProps) {
  const { isPlaying, currentTrack, activeCue, loadTrack, togglePlay } = useNarrator();
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");

  const isCurrentChapterPlaying = currentTrack?.slug === chapter.slug && isPlaying;

  const handleStartNarration = () => {
    if (!manifest) return;
    if (currentTrack?.slug === chapter.slug) {
      togglePlay();
    } else {
      loadTrack(chapter.slug, chapter.title, manifest.audioUrl, manifest);
    }
  };

  // Scrollspy for table of contents
  useEffect(() => {
    const handleScroll = () => {
      const headings = chapter.headings;
      const scrollPos = window.scrollY + 120;
      for (let i = headings.length - 1; i >= 0; i--) {
        const el = document.getElementById(headings[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveHeadingId(headings[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapter.headings]);

  // Parse markdown into sections & render
  const renderFormattedParagraph = (text: string, pIndex: number) => {
    // If active cue text matches or is contained in this paragraph, apply narrator highlight
    const isSpoken = activeCue && currentTrack?.slug === chapter.slug && text.includes(activeCue.text.slice(0, 30));

    // Handle **bold** spans -> amber gold emphasis
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <p
        key={pIndex}
        id={`p-${pIndex}`}
        className={`text-sm sm:text-base leading-relaxed text-ink-secondary mb-4 transition-all duration-300 ${
          isSpoken ? "narrator-active-sentence" : ""
        }`}
      >
        {parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={i} className="text-amber-signal font-semibold">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </p>
    );
  };

  const renderContentLines = () => {
    const lines = chapter.content.split("\n");
    const elements: React.ReactNode[] = [];
    let currentParagraphLines: string[] = [];

    const flushParagraph = (idx: number) => {
      if (currentParagraphLines.length > 0) {
        const text = currentParagraphLines.join(" ").trim();
        if (text) {
          elements.push(renderFormattedParagraph(text, idx));
        }
        currentParagraphLines = [];
      }
    };

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();

      // Heading 1
      if (trimmed.startsWith("# ")) {
        flushParagraph(lineIdx);
        // H1 is rendered in header, skip repeating
      }
      // Heading 2
      else if (trimmed.startsWith("## ")) {
        flushParagraph(lineIdx);
        const headingText = trimmed.replace("## ", "").trim();
        const id = headingText.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        elements.push(
          <div key={`h2-${lineIdx}`} id={id} className="pt-8 pb-3 border-b border-hairline mb-4 scroll-mt-20">
            <h2 className="text-xl sm:text-2xl font-bold text-ink-primary flex items-center gap-2">
              <span className="text-amber-signal font-mono text-sm">§</span>
              <span>{headingText}</span>
            </h2>
          </div>
        );
      }
      // Heading 3
      else if (trimmed.startsWith("### ")) {
        flushParagraph(lineIdx);
        const headingText = trimmed.replace("### ", "").trim();
        const id = headingText.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        elements.push(
          <div key={`h3-${lineIdx}`} id={id} className="pt-4 pb-1 mb-2 scroll-mt-20">
            <h3 className="text-base sm:text-lg font-bold text-ink-primary">
              {headingText}
            </h3>
          </div>
        );
      }
      // Bullet items
      else if (trimmed.startsWith("- ")) {
        flushParagraph(lineIdx);
        const bulletContent = trimmed.slice(2).trim();
        const parts = bulletContent.split(/(\*\*.*?\*\*)/g);
        elements.push(
          <li key={`bullet-${lineIdx}`} className="text-xs sm:text-sm text-ink-secondary leading-relaxed ml-4 list-disc mb-2 pl-1 marker:text-amber-signal">
            {parts.map((part, i) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={i} className="text-amber-signal font-semibold">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </li>
        );
      }
      // Blockquotes
      else if (trimmed.startsWith("> ")) {
        flushParagraph(lineIdx);
        const quoteText = trimmed.slice(2).trim();
        elements.push(
          <blockquote key={`quote-${lineIdx}`} className="p-4 my-4 rounded-xl bg-amber-signal/[0.05] border-l-4 border-amber-signal text-ink-primary text-sm italic">
            "{quoteText}"
          </blockquote>
        );
      }
      // Empty line -> paragraph separator
      else if (trimmed === "") {
        flushParagraph(lineIdx);
      } else {
        currentParagraphLines.push(trimmed);
      }
    });

    flushParagraph(lines.length);
    return elements;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Chapter Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-ink-dim mb-4">
        <Link href="/" className="hover:text-ink-primary transition">
          ARCHIVE
        </Link>
        <span>/</span>
        <Link href={`/${projectSlug}`} className="hover:text-amber-signal transition uppercase">
          {projectSlug}
        </Link>
        <span>/</span>
        <span className="text-amber-signal">CH {chapter.chapterNumber}</span>
      </div>

      {/* Chapter Hero Banner */}
      <div className="rounded-3xl bg-bg-panel border border-hairline p-6 sm:p-8 mb-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-amber-signal/15 text-amber-signal font-bold uppercase">
                {chapter.act} Act
              </span>
              <span className="text-[11px] font-mono text-ink-dim flex items-center gap-1">
                <Clock className="w-3 h-3" /> {chapter.readTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-ink-primary tracking-tight">
              {chapter.title}
            </h1>
          </div>

          {/* Audio Assistant Trigger Button if manifest exists */}
          {manifest && (
            <button
              onClick={handleStartNarration}
              className="self-start md:self-center px-4 py-2.5 rounded-xl bg-amber-signal text-on-amber font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-amber-bright transition shadow-lg shadow-amber-signal/20 hover:scale-105 active:scale-95 shrink-0"
            >
              {isCurrentChapterPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-on-amber" />
                  <span>Pause Lab Assistant</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-on-amber ml-0.5" />
                  <span>Listen to Chapter Narration</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Layout Grid: Left Mini-Map (3 cols) + Center Exhibit Reading (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Collapsible TOC Mini-Map */}
        <aside className="lg:col-span-3 hidden lg:block">
          <div className="sticky top-20 rounded-2xl bg-bg-panel border border-hairline p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-hairline">
              <List className="w-3.5 h-3.5 text-amber-signal" />
              <span className="text-xs font-mono uppercase tracking-wider text-ink-primary font-bold">
                Chapter Mini-Map
              </span>
            </div>

            <nav className="space-y-1 text-xs">
              {chapter.headings.map((h) => {
                const isActive = activeHeadingId === h.id;
                return (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={`block py-1 px-2 rounded transition truncate ${
                      isActive
                        ? "text-amber-bright bg-amber-signal/15 font-semibold border-l-2 border-amber-signal"
                        : "text-ink-muted hover:text-ink-primary hover:bg-bg-hover"
                    } ${h.level === 3 ? "pl-4 text-[11px]" : ""}`}
                  >
                    {h.text}
                  </a>
                );
              })}
            </nav>

            {/* Simulators in this chapter */}
            {chapter.simulators.length > 0 && (
              <div className="pt-3 border-t border-hairline">
                <div className="text-[10px] font-mono text-cryo uppercase mb-2 flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> Active Simulators ({chapter.simulators.length})
                </div>
                <div className="space-y-1">
                  {chapter.simulators.map((simName) => (
                    <div
                      key={simName}
                      className="text-[11px] font-mono text-ink-secondary bg-bg-inset p-1.5 rounded border border-hairline truncate"
                    >
                      {simName}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center Exhibit Reading View */}
        <div className="lg:col-span-9 space-y-6">
          {/* Embedded Interactive Simulators for this chapter */}
          {chapter.simulators.length > 0 && (
            <div className="space-y-6">
              {chapter.simulators.map((simName) => (
                <SimulatorComponent key={simName} name={simName} />
              ))}
            </div>
          )}

          {/* Chapter Content Body */}
          <article className="rounded-2xl bg-bg-panel border border-hairline p-6 sm:p-10 shadow-lg leading-relaxed">
            {renderContentLines()}
          </article>

          {/* Next / Previous Chapter Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-hairline">
            {prevChapter ? (
              <Link
                href={`/${projectSlug}/${prevChapter.slug}`}
                className="p-4 rounded-xl bg-bg-panel border border-hairline hover:border-amber-signal/30 transition flex items-center gap-3 group"
              >
                <ArrowLeft className="w-4 h-4 text-ink-dim group-hover:text-amber-signal group-hover:-translate-x-1 transition" />
                <div className="truncate">
                  <div className="text-[10px] font-mono text-ink-dim uppercase">Previous Chapter</div>
                  <div className="text-xs font-semibold text-ink-primary truncate">
                    {prevChapter.title}
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextChapter && (
              <Link
                href={`/${projectSlug}/${nextChapter.slug}`}
                className="p-4 rounded-xl bg-bg-panel border border-hairline hover:border-amber-signal/30 transition flex items-center justify-end text-right gap-3 group"
              >
                <div className="truncate">
                  <div className="text-[10px] font-mono text-ink-dim uppercase">Next Chapter</div>
                  <div className="text-xs font-semibold text-ink-primary truncate">
                    {nextChapter.title}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-dim group-hover:text-amber-signal group-hover:translate-x-1 transition" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
