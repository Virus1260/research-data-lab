"use client";

import React from "react";
import { useNarrator } from "./NarratorContext";
import { Play, Pause, RotateCcw, RotateCw, Volume2, Sparkles, FileText, ChevronUp, ChevronDown } from "lucide-react";

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function NarratorDeck() {
  const {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    playbackRate,
    syncScroll,
    activeCue,
    manifest,
    transcriptOpen,
    togglePlay,
    seek,
    skip,
    setRate,
    setSyncScroll,
    setTranscriptOpen,
  } = useNarrator();

  if (!currentTrack) {
    return null;
  }

  const rates = [0.75, 1, 1.25, 1.5, 2];
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <aside aria-label="Audio narration controls" className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        {/* Mini Transcript Popover */}
        {transcriptOpen && manifest && (
          <div className="mb-2 bg-[#0D0F12]/95 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-signal" />
                <span className="text-xs font-mono uppercase tracking-wider text-ink-primary">
                  Interactive Transcript ({manifest.cuesCount} segments)
                </span>
              </div>
              <button
                onClick={() => setTranscriptOpen(false)}
                className="text-xs text-ink-muted hover:text-ink-primary px-2 py-1"
              >
                Close
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {manifest.cues.map((cue) => {
                const isActive = activeCue?.id === cue.id;
                return (
                  <button
                    key={cue.id}
                    onClick={() => seek(cue.start)}
                    className={`w-full text-left p-2 rounded transition-colors flex items-start gap-2 ${
                      isActive
                        ? "bg-amber-signal/15 border-l-2 border-amber-signal text-amber-bright font-medium"
                        : "hover:bg-white/5 text-ink-secondary"
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-60 shrink-0 pt-0.5">
                      {formatTime(cue.start)}
                    </span>
                    <span>{cue.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Deck Bar */}
        <div className="bg-[#0D0F12]/95 backdrop-blur-lg border border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col gap-2">
          {/* Top Row: Track info & Live Cue preview */}
          <div className="flex items-center justify-between px-2 gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-amber-signal animate-pulse" />
              <div className="truncate">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-signal mr-2">
                  Lab Assistant Audio
                </span>
                <span className="text-xs text-ink-primary font-medium truncate">
                  {currentTrack.title}
                </span>
              </div>
            </div>

            {/* Active Spoken Sentence snippet */}
            {activeCue && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-ink-secondary max-w-sm truncate italic">
                <Sparkles className="w-3.5 h-3.5 text-amber-signal shrink-0" />
                <span className="truncate">"{activeCue.text}"</span>
              </div>
            )}

            {/* Transcript & Sync Scroll Toggles */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSyncScroll(!syncScroll)}
                title="When active, keeps reading view aligned with audio"
                className={`text-[11px] font-mono px-2 py-1 rounded transition flex items-center gap-1 border ${
                  syncScroll
                    ? "bg-amber-signal/20 border-amber-signal text-amber-signal"
                    : "bg-white/5 border-white/10 text-ink-muted hover:text-ink-secondary"
                }`}
              >
                <span>Auto-follow</span>
                <span className={`w-1.5 h-1.5 rounded-full ${syncScroll ? "bg-amber-signal" : "bg-ink-dim"}`} />
              </button>

              <button
                onClick={() => setTranscriptOpen(!transcriptOpen)}
                className="text-[11px] font-mono px-2 py-1 rounded bg-white/5 border border-white/10 text-ink-secondary hover:text-ink-primary flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                <span>Transcript</span>
                {transcriptOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Scrubber Line */}
          <div className="flex items-center gap-3 px-2">
            <span className="text-[10px] font-mono text-ink-muted w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div
              className="flex-1 relative h-1.5 bg-white/10 rounded-full cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                seek(pos * duration);
              }}
            >
              <div
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-amber-signal to-amber-bright rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                style={{ left: `calc(${progressPercent}% - 6px)` }}
              />
            </div>
            <span className="text-[10px] font-mono text-ink-muted w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls Bottom Row */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2">
              {/* Skip Back 15s */}
              <button
                onClick={() => skip(-15)}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-white/5 transition"
                title="Rewind 15s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Play / Pause Primary Button */}
              <button
                onClick={togglePlay}
                className="p-2 rounded-full bg-amber-signal text-obsidian hover:bg-amber-bright transition shadow-lg shadow-amber-signal/20 hover:scale-105 active:scale-95"
                title={isPlaying ? "Pause Narration" : "Play Narration"}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-obsidian" /> : <Play className="w-4 h-4 fill-obsidian ml-0.5" />}
              </button>

              {/* Skip Forward 15s */}
              <button
                onClick={() => skip(15)}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-white/5 transition"
                title="Forward 15s"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Playback Speed selector */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-lg p-0.5">
              {rates.map((r) => (
                <button
                  key={r}
                  onClick={() => setRate(r)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded transition ${
                    playbackRate === r
                      ? "bg-amber-signal/20 text-amber-signal font-semibold"
                      : "text-ink-muted hover:text-ink-secondary"
                  }`}
                >
                  {r}×
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
