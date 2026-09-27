"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Clock,
  Compass,
  FileText,
  Presentation,
  CheckCircle2,
} from "lucide-react";

export interface SlideItem {
  slide_number: number;
  title: string;
  section: string;
  timestamp: string;
  src: string;
  description: string;
  revisited_count: number;
}

interface Props {
  slides: SlideItem[];
  deckTitle?: string;
  deckSubtitle?: string;
  pptxUrl?: string;
  pdfUrl?: string;
  youtubeUrl?: string;
  sections?: { label: string; startIdx: number }[];
}

export function WebinarSlideDeckViewer({
  slides,
  deckTitle = "Hosokawa Nauta® Mixing & Drying Technology",
  deckSubtitle = "33 CANONICAL SLIDES • ZERO DUPLICATES",
  pptxUrl = "/nauta_webinar/Nauta_Mixing_and_Drying_Technology_Webinar.pptx",
  pdfUrl = "/nauta_webinar/Nauta_Mixing_and_Drying_Technology_Webinar.pdf",
  youtubeUrl = "https://www.youtube.com/watch?v=91mCewt5t38&t=39s",
  sections,
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[currentIdx] || slides[0];

  // Section Color coding
  const getSectionBadge = (section: string) => {
    switch (section) {
      case "Mixing Dynamics":
        return "bg-amber/15 text-amber border-amber/30";
      case "Component Engineering":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "Vacuum Drying & AFD":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "CAD Drawings":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "Case Studies":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      default:
        return "bg-zinc-500/15 text-zinc-300 border-zinc-500/30";
    }
  };

  const handlePrev = useCallback(() => {
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  }, [slides.length]);

  const handleNext = useCallback(() => {
    setCurrentIdx((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  }, [slides.length]);

  // Keyboard navigation (Arrow keys & F for fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  // Auto-play slideshow timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying, handleNext]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!thumbnailsRef.current) return;
    const activeThumb = thumbnailsRef.current.children[currentIdx] as HTMLElement;
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentIdx]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Compute YouTube timestamp jump URL
  const getYoutubeJumpUrl = (ts: string) => {
    const parts = ts.split(":");
    if (parts.length === 2) {
      const sec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      const cleanBase = youtubeUrl.split("&t=")[0].split("?t=")[0];
      const sep = cleanBase.includes("?") ? "&" : "?";
      return `${cleanBase}${sep}t=${sec}s`;
    }
    return youtubeUrl;
  };

  const resolvedSections = sections || (() => {
    const map = new Map<string, number>();
    slides.forEach((s, idx) => {
      if (s.section && !map.has(s.section)) {
        map.set(s.section, idx);
      }
    });
    return Array.from(map.entries()).map(([label, startIdx]) => ({ label, startIdx }));
  })();

  return (
    <div
      ref={containerRef}
      className={`rounded-3xl border border-hairline bg-bg-panel shadow-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? "p-4 flex flex-col justify-between h-screen w-screen bg-[#090b10]" : "p-4 sm:p-7 my-8"
      }`}
    >
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-subtle border border-amber/30 flex items-center justify-center text-amber shadow-sm shrink-0">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber">
                WEBINAR MASTER DECK
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bg-surface border border-hairline text-ink-dim">
                {deckSubtitle}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-ink-primary font-serif tracking-tight">
              {deckTitle}
            </h2>
          </div>
        </div>

        {/* Action Controls & Downloads */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={pptxUrl}
            download="Nauta_Mixing_and_Drying_Technology_Webinar.pptx"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-surface hover:bg-bg-hover border border-hairline text-xs font-mono text-ink-secondary hover:text-ink-primary transition shadow-sm"
            title="Download Full PowerPoint Deck (.pptx)"
          >
            <Download className="w-3.5 h-3.5 text-amber" />
            <span>Download .PPTX</span>
          </a>

          <a
            href={pdfUrl}
            download="Nauta_Mixing_and_Drying_Technology_Webinar.pdf"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-surface hover:bg-bg-hover border border-hairline text-xs font-mono text-ink-secondary hover:text-ink-primary transition shadow-sm"
            title="Download PDF Slide Deck (.pdf)"
          >
            <FileText className="w-3.5 h-3.5 text-cryo" />
            <span>Download .PDF</span>
          </a>

          <button
            onClick={() => setIsPlaying((p) => !p)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition shadow-sm ${
              isPlaying
                ? "bg-amber text-[#0e0a02] font-bold border-amber"
                : "bg-bg-surface hover:bg-bg-hover text-ink-secondary hover:text-ink-primary border-hairline"
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-bg-surface hover:bg-bg-hover border border-hairline text-ink-secondary hover:text-ink-primary transition"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Section Jump Anchors */}
      <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar border-b border-hairline text-xs font-mono">
        <span className="text-ink-dim pr-1 hidden sm:inline-block">JUMP TO:</span>
        {resolvedSections.map((sec, sIdx) => {
          const nextSec = resolvedSections[sIdx + 1];
          const isActive = currentIdx >= sec.startIdx && (!nextSec || currentIdx < nextSec.startIdx);
          return (
            <button
              key={sec.label}
              onClick={() => setCurrentIdx(sec.startIdx)}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition ${
                isActive
                  ? "bg-amber/15 text-amber font-bold border border-amber/30"
                  : "bg-bg-surface/60 hover:bg-bg-hover text-ink-dim hover:text-ink-secondary border border-hairline/50"
              }`}
            >
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* Main 16:9 Presentation Canvas */}
      <div className="relative mt-4 aspect-video w-full rounded-2xl bg-black overflow-hidden border border-hairline shadow-2xl flex items-center justify-center group">
        <Image
          src={currentSlide.src}
          alt={currentSlide.title}
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-contain"
        />

        {/* Floating Navigation Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-amber text-white hover:text-black border border-white/10 backdrop-blur-md flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-xl"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-amber text-white hover:text-black border border-white/10 backdrop-blur-md flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-xl"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Top Floating Badge Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold border backdrop-blur-md ${getSectionBadge(
                currentSlide.section
              )}`}
            >
              {currentSlide.section}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-black/70 text-white/90 border border-white/10 backdrop-blur-md">
              Slide {currentSlide.slide_number} of {slides.length}
            </span>
          </div>

          <a
            href={getYoutubeJumpUrl(currentSlide.timestamp)}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-black/70 hover:bg-red-600/90 text-white border border-white/15 backdrop-blur-md transition shadow-lg group/yt"
            title="Watch this exact moment in the YouTube webinar video"
          >
            <Clock className="w-3.5 h-3.5 text-amber group-hover/yt:text-white" />
            <span>Webinar @ {currentSlide.timestamp}</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>

      {/* Slide Scrubbing Timeline Bar */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-xs font-mono text-ink-dim shrink-0">
          {String(currentSlide.slide_number).padStart(2, "0")} / {slides.length}
        </span>
        <div className="relative flex-1 h-2 bg-bg-surface rounded-full overflow-hidden border border-hairline cursor-pointer">
          <div
            className="h-full bg-gradient-to-r from-amber to-amber-bright transition-all duration-150 rounded-full"
            style={{ width: `${((currentIdx + 1) / slides.length) * 100}%` }}
          />
          <input
            type="range"
            min={0}
            max={slides.length - 1}
            value={currentIdx}
            onChange={(e) => setCurrentIdx(parseInt(e.target.value, 10))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Slide timeline slider"
          />
        </div>
        <span className="text-xs font-mono text-amber shrink-0 font-bold">
          {Math.round(((currentIdx + 1) / slides.length) * 100)}%
        </span>
      </div>

      {/* Slide Technical Analysis & Engineering Findings Card */}
      <div className="mt-4 p-4 rounded-2xl bg-bg-surface/80 border border-hairline flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber">
              SLIDE {currentSlide.slide_number}
            </span>
            <span className="text-xs font-mono text-ink-dim">•</span>
            <h3 className="text-sm sm:text-base font-bold text-ink-primary font-sans">
              {currentSlide.title}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed font-sans">
            {currentSlide.description}
          </p>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 text-xs font-mono text-ink-dim">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-panel border border-hairline">
            <Clock className="w-3 h-3 text-amber" />
            <span>Video Time: {currentSlide.timestamp}</span>
          </div>
          {currentSlide.revisited_count > 1 && (
            <span className="text-[10px] text-amber-bright/80 font-mono px-2 py-0.5 rounded bg-amber/10 border border-amber/20">
              Revisited {currentSlide.revisited_count}× during Q&A
            </span>
          )}
        </div>
      </div>

      {/* Thumbnail Carousel Rail */}
      <div className="mt-4 pt-3 border-t border-hairline">
        <div className="flex items-center justify-between text-xs font-mono text-ink-dim pb-2">
          <span>THUMBNAIL GALLERY ({slides.length} CANONICAL SLIDES)</span>
          <span className="hidden sm:inline">USE ← → ARROWS OR CLICK SLIDE</span>
        </div>
        <div
          ref={thumbnailsRef}
          className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth"
        >
          {slides.map((s, idx) => (
            <button
              key={s.slide_number}
              onClick={() => setCurrentIdx(idx)}
              className={`relative aspect-video w-24 sm:w-28 rounded-xl overflow-hidden shrink-0 transition-all duration-200 border-2 ${
                currentIdx === idx
                  ? "border-amber scale-105 shadow-md shadow-amber/20 ring-2 ring-amber/30"
                  : "border-hairline/80 hover:border-ink-muted opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={s.src}
                alt={s.title}
                fill
                sizes="112px"
                className="object-cover"
              />
              <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[9px] font-mono bg-black/80 text-white/90">
                {s.slide_number}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
