"use client";

import React, { useState } from "react";
import { useNarrator, type PacingMode } from "./NarratorContext";
import { VOICE_PERSONAS, type VoicePersona } from "@/lib/voice-engine";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Sparkles,
  FileText,
  ChevronUp,
  ChevronDown,
  UserCheck,
  Headphones,
  Sliders,
  Check,
  Activity,
  Gauge,
  Minimize2,
  Maximize2,
} from "lucide-react";

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
    isMinimized,
    activeCue,
    manifest,
    transcriptOpen,
    voiceStudioOpen,
    selectedPersona,
    pacingMode,
    audioLevel,
    activeSpokenPhrase,
    togglePlay,
    seek,
    skip,
    setRate,
    setSyncScroll,
    setIsMinimized,
    setTranscriptOpen,
    setVoiceStudioOpen,
    setSelectedPersona,
    setPacingMode,
    previewPersona,
  } = useNarrator();

  if (!currentTrack && !voiceStudioOpen) {
    return null;
  }

  const rates = [0.8, 0.9, 1.0, 1.15, 1.25];
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <aside
      aria-label="Audio narration controls"
      className="fixed bottom-0 left-0 right-0 z-50 px-3 sm:px-6 pb-4 pointer-events-none"
    >
      <div className="max-w-5xl mx-auto pointer-events-auto">
        {/* Voice Persona & Pacing Studio Popover */}
        {voiceStudioOpen && (
          <div className="mb-3 bg-bg-panel border border-hairline rounded-2xl p-5 shadow-2xl backdrop-blur-xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-hairline">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-subtle flex items-center justify-center border border-amber/30 text-amber">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink-primary">Voice & Acoustic Studio</h3>
                  <p className="text-[11px] text-ink-dim font-mono">
                    Select your research narrator & human pacing profile
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVoiceStudioOpen(false)}
                className="text-xs px-3 py-1.5 rounded-lg bg-bg-hover text-ink-secondary hover:text-ink-primary font-mono transition"
              >
                Close ✕
              </button>
            </div>

            {/* Persona Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {VOICE_PERSONAS.map((persona) => {
                const isSelected = selectedPersona.id === persona.id;
                return (
                  <div
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona)}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-amber-subtle border-amber shadow-md shadow-amber/10 ring-1 ring-amber"
                        : "bg-bg-surface hover:bg-bg-hover border-hairline"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{persona.avatar}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-bg-panel border border-hairline text-ink-muted">
                            {persona.accent}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber" />}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-ink-primary">{persona.name}</div>
                        <div className="text-[10px] text-ink-muted font-mono">{persona.role}</div>
                      </div>
                      <p className="text-[11px] text-ink-secondary leading-snug line-clamp-2">
                        {persona.description}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        previewPersona(persona);
                      }}
                      className="mt-3 w-full py-1 text-[10px] font-mono rounded bg-bg-panel hover:bg-amber hover:text-on-amber text-ink-primary border border-hairline transition flex items-center justify-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Test Voice</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Pacing Rule & Breath Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-hairline text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-ink-muted uppercase text-[10px] font-semibold">
                  Human Pacing Rule:
                </span>
                {(["academic", "conversational", "brisk"] as PacingMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPacingMode(mode)}
                    className={`px-2.5 py-1 rounded-lg text-xs capitalize transition ${
                      pacingMode === mode
                        ? "bg-amber text-on-amber font-bold shadow-sm"
                        : "bg-bg-surface text-ink-muted hover:text-ink-primary border border-hairline"
                    }`}
                  >
                    {mode === "academic" ? "Academic (1.5s Pauses)" : mode}
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-ink-dim font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber" />
                <span>Structural breaths & phonetic unit expansion active</span>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Transcript Popover */}
        {transcriptOpen && manifest && (
          <div className="mb-3 bg-bg-panel backdrop-blur-xl border border-hairline rounded-2xl p-4 shadow-2xl max-h-64 overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-hairline">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber" />
                <span className="text-xs font-mono uppercase tracking-wider text-ink-primary font-bold">
                  Interactive Transcript ({manifest.cuesCount} segments)
                </span>
              </div>
              <button
                onClick={() => setTranscriptOpen(false)}
                className="text-xs text-ink-muted hover:text-ink-primary px-2 py-1 font-mono"
              >
                Close ✕
              </button>
            </div>
            <div className="space-y-1.5 text-xs">
              {manifest.cues.map((cue) => {
                const isActive = activeCue?.id === cue.id;
                return (
                  <button
                    key={cue.id}
                    onClick={() => seek(cue.start)}
                    className={`w-full text-left p-2 rounded-lg transition-colors flex items-start gap-2.5 ${
                      isActive
                        ? "bg-amber-subtle border-l-2 border-amber text-ink-primary font-medium"
                        : "hover:bg-bg-hover text-ink-secondary"
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-60 shrink-0 pt-0.5">
                      {formatTime(cue.start)}
                    </span>
                    <span className="leading-relaxed">{cue.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Minimized Floating Corner Pill */}
        {currentTrack && isMinimized && (
          <div className="flex justify-end animate-fade-in pointer-events-auto">
            <div
              className="flex items-center gap-2 p-2 px-3.5 rounded-full shadow-2xl backdrop-blur-xl border transition-all hover:scale-105"
              style={{
                background: "color-mix(in srgb, var(--bg-panel) 92%, transparent)",
                borderColor: "var(--border-strong)",
              }}
            >
              <button
                onClick={() => setIsMinimized(false)}
                className="flex items-center gap-1.5 text-xs font-mono font-bold text-ink-primary hover:text-amber transition"
                title="Expand Narrator Console"
              >
                <span className="text-base">{selectedPersona.avatar}</span>
                <span>{selectedPersona.name.split(" ")[0]}</span>
                {isPlaying && <span className="w-1.5 h-1.5 rounded-full bg-amber animate-ping" />}
              </button>

              <div className="w-px h-3.5 bg-hairline" />

              <button
                onClick={togglePlay}
                className="p-1.5 rounded-full bg-amber text-on-amber hover:scale-110 transition shadow-sm"
                title={isPlaying ? "Pause Narration" : "Resume Narration"}
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3 fill-current" />
                ) : (
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={() => setIsMinimized(false)}
                className="p-1 text-ink-dim hover:text-ink-primary transition"
                title="Maximize Player"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Deck Console Bar */}
        {currentTrack && !isMinimized && (
          <div className="bg-bg-panel/95 backdrop-blur-xl border border-hairline rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col gap-2.5">
          {/* Top Row: Track & Persona Info + Dynamic Visualizer */}
          <div className="flex items-center justify-between px-2 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Persona Avatar Badge */}
              <button
                onClick={() => setVoiceStudioOpen(!voiceStudioOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-bg-surface hover:bg-bg-hover border border-hairline transition shadow-sm group"
                title="Change Voice Persona"
              >
                <span className="text-lg">{selectedPersona.avatar}</span>
                <div className="text-left hidden sm:block">
                  <div className="text-[11px] font-bold text-ink-primary group-hover:text-amber transition leading-none">
                    {selectedPersona.name}
                  </div>
                  <div className="text-[9px] font-mono text-ink-dim">{selectedPersona.role}</div>
                </div>
                <Sliders className="w-3 h-3 text-ink-dim group-hover:text-amber ml-1" />
              </button>

              {/* Title & Type */}
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber font-bold">
                    {currentTrack.isTTS ? "Neural Voice Cadence" : "Studio Audio Master"}
                  </span>
                  <span className="text-ink-dim font-mono text-[10px]">•</span>
                  <span className="text-xs text-ink-primary font-semibold truncate">
                    {currentTrack.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Sound Waveform Visualizer & Minimize Button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-bg-surface border border-hairline shrink-0">
                <Activity className="w-3.5 h-3.5 text-cryo mr-1" />
                {[20, 50, 80, 40, 90, 60, 30].map((baseHeight, idx) => {
                  const height = isPlaying
                    ? Math.max(15, Math.min(100, baseHeight * (audioLevel / 50)))
                    : 20;
                  return (
                    <span
                      key={idx}
                      className="w-1 rounded-full transition-all duration-150"
                      style={{
                        height: `${Math.round(height * 0.16)}px`,
                        backgroundColor: isPlaying ? "var(--amber)" : "var(--border-strong)",
                      }}
                    />
                  );
                })}
              </div>

              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-lg bg-bg-surface hover:bg-bg-hover text-ink-dim hover:text-ink-primary transition border border-hairline"
                title="Minimize player to floating corner pill"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Spoken Phrase Spotlight */}
          {activeSpokenPhrase && (
            <div className="px-3 py-1.5 rounded-xl bg-bg-surface/70 border border-hairline/60 text-xs text-ink-secondary line-clamp-1 italic font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber shrink-0 animate-ping" />
              <span className="truncate">"{activeSpokenPhrase}"</span>
            </div>
          )}

          {/* Progress Bar */}
          <div className="flex items-center gap-3 px-2">
            <span className="text-[10px] font-mono text-ink-dim tabular-nums">
              {formatTime(currentTime)}
            </span>
            <div
              className="flex-1 h-1.5 bg-bg-hover rounded-full overflow-hidden cursor-pointer relative group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                seek(pos * duration);
              }}
            >
              <div
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-amber to-amber-bright rounded-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-ink-dim tabular-nums">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between px-2 pt-1 border-t border-hairline">
            {/* Left Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVoiceStudioOpen(!voiceStudioOpen)}
                className="px-2.5 py-1 rounded-lg text-xs font-mono border border-hairline bg-bg-surface hover:bg-bg-hover text-ink-secondary flex items-center gap-1.5 transition"
              >
                <Headphones className="w-3.5 h-3.5 text-amber" />
                <span className="hidden sm:inline">Voice Studio</span>
              </button>

              {manifest && (
                <button
                  onClick={() => setTranscriptOpen(!transcriptOpen)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition flex items-center gap-1.5 ${
                    transcriptOpen
                      ? "bg-amber-subtle text-amber border-amber/40 font-bold"
                      : "bg-bg-surface hover:bg-bg-hover text-ink-secondary border-hairline"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Transcript</span>
                </button>
              )}
            </div>

            {/* Center Playback Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => skip(-10)}
                className="p-1.5 rounded-lg hover:bg-bg-hover text-ink-muted hover:text-ink-primary transition"
                title="Rewind 10 seconds"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="p-2.5 rounded-full bg-amber text-on-amber hover:scale-105 active:scale-95 transition shadow-lg shadow-amber-glow"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={() => skip(10)}
                className="p-1.5 rounded-lg hover:bg-bg-hover text-ink-muted hover:text-ink-primary transition"
                title="Fast forward 10 seconds"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Right Speed & Sync Controls */}
            <div className="flex items-center gap-1.5">
              <div className="hidden sm:flex items-center rounded-lg bg-bg-surface border border-hairline p-0.5">
                {rates.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRate(r)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                      playbackRate === r
                        ? "bg-amber text-on-amber font-bold"
                        : "text-ink-dim hover:text-ink-primary"
                    }`}
                  >
                    {r}x
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSyncScroll(!syncScroll)}
                className={`p-1.5 rounded-lg text-xs font-mono border transition ${
                  syncScroll
                    ? "bg-amber-subtle text-amber border-amber/40"
                    : "bg-bg-surface text-ink-dim border-hairline"
                }`}
                title="Auto-scroll to active sentence"
              >
                <span className="text-[10px]">SYNC</span>
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-lg bg-bg-surface hover:bg-bg-hover text-ink-dim hover:text-ink-primary transition border border-hairline"
                title="Compact into floating button"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </aside>
  );
}
