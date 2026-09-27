"use client";

import React, { useState, useRef, useEffect } from "react";
import { useNarrator } from "./NarratorContext";
import {
  Volume2,
  Play,
  Pause,
  Check,
  Table as TableIcon,
  FileText,
  Activity,
  X,
  Lock,
  Unlock,
  ArrowDown,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ReaderTeleprompterPanelProps {
  chapterTitle?: string;
  chapterSlug?: string;
}

export function ReaderTeleprompterPanel({
  chapterTitle,
  chapterSlug,
}: ReaderTeleprompterPanelProps) {
  const {
    isPlaying,
    speechChunks,
    currentChunkIndex,
    currentChunk,
    readerPanelOpen,
    setReaderPanelOpen,
    seekToChunk,
    togglePlay,
    audioLevel,
    selectedPersona,
    speechEngine,
  } = useNarrator();

  const [autoScroll, setAutoScroll] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "table" | "heading" | "text">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rawViewIndex, setRawViewIndex] = useState<number | null>(null);
  const [heroCollapsed, setHeroCollapsed] = useState(false);

  const activeItemRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll active chunk into view
  useEffect(() => {
    if (!autoScroll || !activeItemRef.current || !readerPanelOpen) return;
    activeItemRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentChunkIndex, autoScroll, readerPanelOpen]);

  // Don't render anything when closed — zero footprint
  if (!readerPanelOpen) return null;

  // Filter chunks
  const filteredChunks = speechChunks
    .map((chunk, originalIndex) => ({ chunk, originalIndex }))
    .filter(({ chunk }) => {
      if (filterType === "table" && chunk.type !== "table") return false;
      if (filterType === "heading" && chunk.type !== "heading") return false;
      if (filterType === "text" && (chunk.type === "table" || chunk.type === "heading")) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textMatch = chunk.text.toLowerCase().includes(q);
        const rawMatch = chunk.rawText.toLowerCase().includes(q);
        const paramMatch = chunk.tableData?.parameter.toLowerCase().includes(q);
        const valMatch = chunk.tableData?.values.some(
          (v) => v.column.toLowerCase().includes(q) || v.value.toLowerCase().includes(q)
        );
        return textMatch || rawMatch || paramMatch || valMatch;
      }
      return true;
    });

  const activeChunkData = currentChunk || speechChunks[currentChunkIndex] || null;
  const isTableActive = activeChunkData?.type === "table";

  return (
    <div
      role="region"
      aria-label="Reader Monitor Panel"
      className="w-full flex flex-col max-h-[50vh] sm:max-h-[420px] bg-bg-panel/98 backdrop-blur-xl border border-hairline rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-hairline bg-bg-surface/80 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Live indicator */}
          <div className="relative flex items-center justify-center shrink-0">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying ? "bg-emerald-400 animate-ping" : "bg-amber"
              } absolute opacity-75`}
            />
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying ? "bg-emerald-400" : "bg-amber"
              } relative`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-primary">
                Reader Monitor
              </span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber/15 text-amber border border-amber/30 uppercase font-semibold">
                Live Audit
              </span>
            </div>
            <div className="text-[9px] text-ink-dim font-mono truncate">
              {selectedPersona.name} · {speechEngine === "neural" ? "Edge Neural" : "WebSpeech"}
            </div>
          </div>

          <span className="text-[9px] font-mono text-ink-dim tabular-nums ml-1 shrink-0">
            {speechChunks.length > 0 ? `${currentChunkIndex + 1}/${speechChunks.length}` : "0/0"}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Auto-scroll lock */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-lg text-xs transition border ${
              autoScroll
                ? "bg-amber/15 text-amber border-amber/40"
                : "bg-bg-surface text-ink-dim border-hairline hover:text-ink-primary"
            }`}
            title={autoScroll ? "Auto-scroll ON" : "Auto-scroll OFF"}
          >
            {autoScroll ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>

          {/* Jump to active */}
          <button
            onClick={() => {
              if (activeItemRef.current) {
                activeItemRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }
            }}
            className="p-1.5 rounded-lg bg-bg-surface hover:bg-bg-hover text-ink-secondary border border-hairline hover:text-ink-primary transition"
            title="Jump to active chunk"
          >
            <ArrowDown className="w-3 h-3" />
          </button>

          {/* Close */}
          <button
            onClick={() => setReaderPanelOpen(false)}
            className="p-1.5 rounded-lg bg-bg-surface hover:bg-bg-hover text-ink-dim hover:text-red-400 border border-hairline transition"
            title="Close Reader Monitor"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ── Active Segment Hero (collapsible) ── */}
      <div className="border-b border-hairline shrink-0">
        <button
          onClick={() => setHeroCollapsed(!heroCollapsed)}
          className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-bg-hover/50 transition"
        >
          <div className="flex items-center gap-2">
            <span
              className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1 ${
                isTableActive
                  ? "bg-cryo/15 text-cryo border-cryo/40"
                  : activeChunkData?.type === "heading"
                  ? "bg-amber/15 text-amber border-amber/40"
                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              }`}
            >
              {isTableActive ? (
                <><TableIcon className="w-2.5 h-2.5" /> Table Data</>
              ) : activeChunkData?.type === "heading" ? (
                <><FileText className="w-2.5 h-2.5" /> Section</>
              ) : (
                <><Activity className="w-2.5 h-2.5" /> Paragraph</>
              )}
            </span>
            {/* Mini equaliser */}
            <div className="flex items-end gap-0.5 h-3">
              {[0.4, 0.9, 0.6, 1.0, 0.7].map((scale, i) => {
                const h = isPlaying
                  ? Math.min(100, Math.max(20, Math.round(audioLevel * scale + Math.random() * 20)))
                  : 20;
                return (
                  <div
                    key={i}
                    className={`w-0.5 rounded-sm transition-all duration-100 ${
                      isPlaying ? "bg-amber" : "bg-ink-dim/40"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>
          </div>
          {heroCollapsed ? (
            <ChevronDown className="w-3.5 h-3.5 text-ink-dim" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-ink-dim" />
          )}
        </button>

        {!heroCollapsed && activeChunkData && (
          <div className="px-3.5 pb-2.5">
            <div className="rounded-xl border border-amber/30 bg-bg-surface/95 p-2.5 shadow-md shadow-amber/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber via-amber-bright to-transparent" />

              {isTableActive && activeChunkData.tableData ? (
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[8px] font-mono uppercase tracking-wider text-ink-dim">Active Parameter</span>
                      <h4 className="text-xs font-bold text-amber font-mono leading-snug">
                        {activeChunkData.tableData.parameter}
                      </h4>
                    </div>
                    <button
                      onClick={() => setRawViewIndex(rawViewIndex === currentChunkIndex ? null : currentChunkIndex)}
                      className="text-[8px] font-mono text-ink-dim hover:text-ink-primary px-1.5 py-0.5 rounded bg-bg-hover border border-hairline shrink-0"
                    >
                      {rawViewIndex === currentChunkIndex ? "Hide" : "Raw"}
                    </button>
                  </div>

                  <div className="space-y-1 max-h-24 overflow-y-auto pr-0.5">
                    {activeChunkData.tableData.values.map((v, i) => (
                      <div key={i} className="px-2 py-1 rounded-lg bg-bg-panel border border-hairline/70 flex items-center justify-between text-[10px] gap-2">
                        <span className="font-mono text-cryo uppercase truncate shrink-0 max-w-[45%]">{v.column}</span>
                        <span className="font-semibold text-ink-primary text-right break-words select-text">
                          {v.value || "(empty)"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1.5 border-t border-hairline/60">
                    <p className="text-[10px] leading-relaxed text-ink-secondary italic select-text line-clamp-2">
                      "{activeChunkData.text}"
                    </p>
                  </div>

                  {rawViewIndex === currentChunkIndex && activeChunkData.tableData.fullRow && (
                    <div className="p-1.5 rounded bg-bg-hover text-[9px] font-mono text-ink-muted border border-hairline break-all">
                      {activeChunkData.tableData.fullRow.join(" | ")}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-[11px] leading-relaxed text-ink-primary font-medium select-text line-clamp-3">
                    {activeChunkData.rawText || activeChunkData.text}
                  </p>
                  <div className="flex items-center justify-between text-[9px] font-mono text-ink-dim pt-1 border-t border-hairline/60">
                    <span>{activeChunkData.pauseAfterMs}ms pause</span>
                    <span>{activeChunkData.type}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!heroCollapsed && !activeChunkData && (
          <div className="px-3.5 pb-3 text-center text-[10px] font-mono text-ink-dim">
            Narrator idle — click play to start.
          </div>
        )}
      </div>

      {/* ── Search + Filter ── */}
      <div className="px-3 py-2 border-b border-hairline bg-bg-surface/50 shrink-0 space-y-1.5">
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2.5 top-2 text-ink-dim" />
          <input
            type="text"
            placeholder="Search segments or table parameters…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-7 py-1.5 rounded-lg bg-bg-panel border border-hairline text-[11px] font-mono text-ink-primary placeholder:text-ink-dim focus:outline-none focus:border-amber/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1.5 text-ink-dim hover:text-ink-primary text-[10px]"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {(["all", "table", "heading", "text"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider transition border ${
                filterType === t
                  ? "bg-amber/20 text-amber border-amber/40 font-bold"
                  : "bg-bg-panel text-ink-dim border-hairline hover:text-ink-primary"
              }`}
            >
              {t === "all" ? "All" : t === "table" ? "Tables" : t === "heading" ? "Headings" : "Text"}
            </button>
          ))}
          <span className="ml-auto text-[9px] font-mono text-ink-dim tabular-nums">
            {filteredChunks.length} shown
          </span>
        </div>
      </div>

      {/* ── Teleprompter Stream (scrollable) ── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-2.5 space-y-1.5 overscroll-contain"
      >
        {filteredChunks.length === 0 ? (
          <div className="text-center py-6 text-[11px] font-mono text-ink-dim">
            {speechChunks.length === 0
              ? "Preparing speech segments…"
              : "No segments match filter."}
          </div>
        ) : (
          filteredChunks.map(({ chunk, originalIndex }) => {
            const isActive = originalIndex === currentChunkIndex;
            const isCompleted = originalIndex < currentChunkIndex;
            const isTable = chunk.type === "table";

            return (
              <div
                key={originalIndex}
                ref={isActive ? activeItemRef : null}
                onClick={() => seekToChunk(originalIndex)}
                className={`group relative rounded-xl p-2 border transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber/10 border-amber shadow-md shadow-amber/10 ring-1 ring-amber/50"
                    : isCompleted
                    ? "bg-bg-surface/40 border-hairline opacity-60 hover:opacity-90 hover:bg-bg-hover"
                    : "bg-bg-surface hover:bg-bg-hover border-hairline"
                }`}
                title={`Jump to segment #${originalIndex + 1}`}
              >
                {/* Top row: index + type + status */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-mono text-ink-dim font-bold tabular-nums">
                      #{originalIndex + 1}
                    </span>
                    <span
                      className={`px-1 py-0.5 rounded text-[7px] font-mono font-bold uppercase tracking-wider border ${
                        isTable
                          ? "bg-cryo/10 text-cryo border-cryo/30"
                          : chunk.type === "heading"
                          ? "bg-amber/10 text-amber border-amber/30"
                          : "bg-bg-panel text-ink-dim border-hairline"
                      }`}
                    >
                      {isTable ? "Table" : chunk.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {isActive ? (
                      <span className="flex items-center gap-0.5 text-[8px] font-mono font-bold text-amber">
                        <Volume2 className="w-2.5 h-2.5 animate-pulse" />
                        Active
                      </span>
                    ) : isCompleted ? (
                      <span className="flex items-center gap-0.5 text-[8px] font-mono text-emerald-400">
                        <Check className="w-2.5 h-2.5" />
                        Done
                      </span>
                    ) : (
                      <Play className="w-2 h-2 text-ink-dim opacity-0 group-hover:opacity-60 transition-opacity" />
                    )}
                  </div>
                </div>

                {/* Content */}
                {isTable && chunk.tableData ? (
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-ink-primary font-mono flex items-center gap-1">
                      <TableIcon className="w-2.5 h-2.5 text-cryo shrink-0" />
                      <span className="truncate">{chunk.tableData.parameter}</span>
                    </div>
                    <div className="space-y-0.5">
                      {chunk.tableData.values.map((v, i) => (
                        <div
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-bg-panel/70 border border-hairline/50 flex items-center justify-between text-[9px] gap-1"
                        >
                          <span className="font-mono text-ink-dim uppercase truncate shrink-0 max-w-[45%]">
                            {v.column}
                          </span>
                          <span className="font-semibold text-ink-primary text-right truncate">
                            {v.value || "–"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] leading-snug text-ink-secondary group-hover:text-ink-primary transition line-clamp-2">
                    {chunk.rawText || chunk.text}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-3 py-2 border-t border-hairline bg-bg-surface/80 flex items-center justify-between shrink-0 text-[9px] font-mono text-ink-dim">
        <div className="flex items-center gap-1.5">
          <span>{speechChunks.length} segments</span>
          <span>·</span>
          <span>{speechChunks.filter((c) => c.type === "table").length} tables</span>
        </div>
        <button
          onClick={togglePlay}
          className="px-2.5 py-1 rounded-lg bg-amber text-on-amber font-bold hover:scale-105 active:scale-95 transition flex items-center gap-1 shadow-sm text-[10px]"
        >
          {isPlaying ? <Pause className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current" />}
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  );
}
