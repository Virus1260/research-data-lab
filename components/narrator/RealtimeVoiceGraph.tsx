"use client";

import React, { useRef, useEffect, useState } from "react";
import type { VoicePersona } from "@/lib/voice-engine";
import type { PacingMode } from "./NarratorContext";
import { Activity, Layers, Radio, Sparkles } from "lucide-react";

export type AcousticViewMode = "glottal" | "formants" | "waterfall";

interface RealtimeVoiceGraphProps {
  isPlaying: boolean;
  selectedPersona: VoicePersona;
  pacingMode: PacingMode;
  playbackRate: number;
  audioLevel: number;
  frequencyBands: number[];
  activePhrase?: string;
  isTTS?: boolean;
}

/**
 * Calculates the baseline fundamental acoustic frequency (F0 in Hz)
 * based on persona vocal tract biology and pitch calibration.
 */
export function getPersonaPitchHz(persona: VoicePersona): number {
  const isFemale = persona.gender === "female";
  const baseFreq = isFemale ? 220 : 120; // 220Hz female average, 120Hz male baritone average
  return Math.round(baseFreq * persona.pitch);
}

export function RealtimeVoiceGraph({
  isPlaying,
  selectedPersona,
  pacingMode,
  playbackRate,
  audioLevel,
  frequencyBands,
  activePhrase = "",
  isTTS = true,
}: RealtimeVoiceGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);
  const smoothedLevelRef = useRef<number>(0);
  const smoothedBandsRef = useRef<number[]>(new Array(16).fill(0));
  const waterfallHistoryRef = useRef<number[][]>([]);

  // View mode state: toggleable by clicking the visualizer
  const [viewMode, setViewMode] = useState<AcousticViewMode>("glottal");

  // Dynamic live F0 fundamental frequency and formants state (updates in real-time)
  const [liveF0, setLiveF0] = useState<number>(getPersonaPitchHz(selectedPersona));
  const [f0Delta, setF0Delta] = useState<number>(0);
  const [f1Hz, setF1Hz] = useState<number>(540);
  const [f2Hz, setF2Hz] = useState<number>(1850);
  const [dbFS, setDbFS] = useState<number>(-40);

  const basePitchHz = getPersonaPitchHz(selectedPersona);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-DPI displays for ultra-crisp 120 FPS rendering
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const width = 200;
    const height = 40;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let lastTime = performance.now();
    let lastMetricUpdate = 0;

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;

      // 1. Dynamic Audio Level Smoothing
      const targetLevel = isPlaying ? Math.max(22, audioLevel) : 0;
      smoothedLevelRef.current += (targetLevel - smoothedLevelRef.current) * Math.min(1, dt * 14);
      const currentLevel = smoothedLevelRef.current;

      // 2. Smooth 16 Acoustic Frequency Bands
      const bandCount = 16;
      for (let i = 0; i < bandCount; i++) {
        const inputVal = frequencyBands[i] !== undefined ? frequencyBands[i] : (isPlaying ? 30 : 2);
        smoothedBandsRef.current[i] = (smoothedBandsRef.current[i] || 0) + (inputVal - (smoothedBandsRef.current[i] || 0)) * Math.min(1, dt * 15);
      }

      // 3. Dynamic Physics-Based Fundamental Frequency F0(t) with Real Vocal Fold Jitter & Intonation
      // Vocal cord physics: intonation arc + micro-prosodic cadence + jitter perturbation
      const intonationCycle = Math.sin(now * 0.0035);
      const microStress = (Math.sin(now * 0.012) + Math.sin(now * 0.027)) * 0.5;
      const jitter = (Math.random() - 0.5) * 2.8; // ~1% natural vocal cord jitter
      const amplitudePitchCoupling = isPlaying ? (currentLevel / 100) * 16 : 0;

      // Dynamic F0 Excursion: fluctuates realistically during speech
      const currentF0 = isPlaying
        ? Math.round(basePitchHz + intonationCycle * 18 + microStress * 12 + amplitudePitchCoupling + jitter)
        : basePitchHz;

      // Compute Live Formants F1 (vowel height) and F2 (vowel fronting)
      const currentF1 = Math.round(380 + (currentLevel / 100) * 290 + Math.sin(now * 0.005) * 60);
      const currentF2 = Math.round(1450 + (currentF0 / basePitchHz) * 350 + Math.cos(now * 0.004) * 140);
      const currentDb = isPlaying ? Math.max(-42, Math.round(20 * Math.log10(Math.max(0.01, currentLevel / 100)))) : -48;

      // Throttle React state updates to ~12 FPS for buttery smooth text readout without excessive re-renders
      if (now - lastMetricUpdate > 80) {
        lastMetricUpdate = now;
        setLiveF0(currentF0);
        setF0Delta(currentF0 - basePitchHz);
        setF1Hz(currentF1);
        setF2Hz(currentF2);
        setDbFS(currentDb);
      }

      // 4. Update phase speed proportional to current instantaneous F0
      const angularSpeed = (currentF0 / 38) * playbackRate;
      phaseRef.current += angularSpeed * dt;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // ─── VIEW MODE 1: GLOTTAL ACOUSTIC WAVEFORM + SPECTRAL BARS ───
      if (viewMode === "glottal") {
        // Spectrum Bars (Right Half)
        const barsWidth = 84;
        const barStartX = width - barsWidth - 4;
        const singleBarWidth = 3.8;
        const barGap = 1.4;

        for (let i = 0; i < 14; i++) {
          const val = smoothedBandsRef.current[i] || 0;
          const normalized = val / 100;
          const barHeight = Math.max(3, normalized * (height - 8));
          const x = barStartX + i * (singleBarWidth + barGap);
          const y = height / 2 - barHeight / 2;

          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          if (isPlaying) {
            grad.addColorStop(0, "#06b6d4"); // Cryo Cyan
            grad.addColorStop(0.5, "#f59e0b"); // Warm Amber
            grad.addColorStop(1, "#d97706"); // Dark Gold
          } else {
            grad.addColorStop(0, "rgba(255, 255, 255, 0.12)");
            grad.addColorStop(1, "rgba(255, 255, 255, 0.04)");
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, singleBarWidth, barHeight, 1.2);
          ctx.fill();
        }

        // Glottal Vocal Waveform (Left Half)
        const waveWidth = barStartX - 10;
        const midY = height / 2;
        const baseAmp = isPlaying ? (currentLevel / 100) * 14 : 2;

        // Harmonic Resonance Layer (Ghost overtone)
        ctx.beginPath();
        ctx.strokeStyle = isPlaying ? "rgba(6, 182, 212, 0.3)" : "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1.2;
        for (let x = 0; x <= waveWidth; x += 2) {
          const k = (currentF0 / 140) * (2 * Math.PI / waveWidth);
          const y = midY + Math.sin(x * k * 2 + phaseRef.current * 1.6) * (baseAmp * 0.4);
          if (x === 0) ctx.moveTo(x + 4, y);
          else ctx.lineTo(x + 4, y);
        }
        ctx.stroke();

        // Primary Fundamental F0 Glottal Pulse Wave
        ctx.beginPath();
        const waveGrad = ctx.createLinearGradient(4, 0, waveWidth, 0);
        if (isPlaying) {
          waveGrad.addColorStop(0, "#06b6d4"); // Cyan
          waveGrad.addColorStop(0.55, "#f59e0b"); // Amber
          waveGrad.addColorStop(1, "#fbbf24"); // Bright gold
        } else {
          waveGrad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
          waveGrad.addColorStop(1, "rgba(255, 255, 255, 0.08)");
        }
        ctx.strokeStyle = waveGrad;
        ctx.lineWidth = isPlaying ? 2.2 : 1.2;
        ctx.lineCap = "round";

        for (let x = 0; x <= waveWidth; x += 2) {
          const spatialFreq = (currentF0 / 95) * (2 * Math.PI / waveWidth);
          const envelope = Math.sin((x / waveWidth) * Math.PI);
          // Bi-phase glottal closure simulation
          const glottalWave = Math.sin(x * spatialFreq - phaseRef.current) + 0.25 * Math.sin(2 * (x * spatialFreq - phaseRef.current));
          const y = midY + glottalWave * (baseAmp * envelope);
          if (x === 0) ctx.moveTo(x + 4, y);
          else ctx.lineTo(x + 4, y);
        }
        ctx.stroke();
      }

      // ─── VIEW MODE 2: FORMANT RESONANCES COMB FILTER (F1, F2, F3) ───
      else if (viewMode === "formants") {
        const midY = height / 2;
        ctx.beginPath();
        ctx.strokeStyle = isPlaying ? "#f59e0b" : "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1.8;

        for (let x = 0; x <= width - 8; x += 2) {
          const normX = x / (width - 8); // 0 to 1 represents 100 Hz to 4000 Hz
          const freq = 100 + normX * 3900;

          // Gaussian bell curves centered around F0, F1, F2
          const bellF0 = Math.exp(-Math.pow((freq - currentF0) / 120, 2)) * 0.8;
          const bellF1 = Math.exp(-Math.pow((freq - currentF1) / 220, 2)) * 1.0;
          const bellF2 = Math.exp(-Math.pow((freq - currentF2) / 380, 2)) * 0.75;
          const totalTransfer = isPlaying ? (bellF0 + bellF1 + bellF2) * (currentLevel / 100) : 0.08;

          const y = height - 4 - totalTransfer * (height - 8);
          if (x === 0) ctx.moveTo(x + 4, y);
          else ctx.lineTo(x + 4, y);
        }
        ctx.stroke();

        // Formant Peak Indicators
        if (isPlaying) {
          const f1X = 4 + ((currentF1 - 100) / 3900) * (width - 8);
          const f2X = 4 + ((currentF2 - 100) / 3900) * (width - 8);

          ctx.fillStyle = "#06b6d4";
          ctx.beginPath();
          ctx.arc(f1X, 10, 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#fbbf24";
          ctx.beginPath();
          ctx.arc(f2X, 14, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ─── VIEW MODE 3: ACOUSTIC CASCADE WATERFALL ───
      else if (viewMode === "waterfall") {
        // Record history snapshot every 3 frames
        if (waterfallHistoryRef.current.length > 24) {
          waterfallHistoryRef.current.shift();
        }
        waterfallHistoryRef.current.push([...smoothedBandsRef.current]);

        const history = waterfallHistoryRef.current;
        const rowHeight = height / Math.max(1, history.length);

        history.forEach((rowBands, rIdx) => {
          const y = rIdx * rowHeight;
          const barW = (width - 8) / rowBands.length;

          rowBands.forEach((bVal, bIdx) => {
            const x = 4 + bIdx * barW;
            const alpha = (bVal / 100) * ((rIdx + 1) / history.length) * (isPlaying ? 0.85 : 0.15);
            ctx.fillStyle = isPlaying ? `rgba(245, 158, 11, ${alpha})` : `rgba(255, 255, 255, ${alpha * 0.4})`;
            ctx.fillRect(x, y, barW - 1, rowHeight);
          });
        });
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, basePitchHz, playbackRate, audioLevel, frequencyBands, viewMode]);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "glottal" ? "formants" : prev === "formants" ? "waterfall" : "glottal"));
  };

  return (
    <div
      onClick={toggleViewMode}
      className="relative flex items-center gap-2.5 px-3 py-1 rounded-2xl bg-bg-surface/90 hover:bg-bg-hover/80 border border-hairline shrink-0 shadow-sm transition-all cursor-pointer select-none group"
      title={`Live Voice Engineering Telemetry (Click to cycle view: ${viewMode})\n• Voice: ${selectedPersona.name} (${selectedPersona.accent})\n• F₀ Fundamental Pitch: ${liveF0} Hz (Δ ${f0Delta >= 0 ? "+" : ""}${f0Delta} Hz)\n• Formant F₁: ${f1Hz} Hz (Pharyngeal) • F₂: ${f2Hz} Hz (Oral)\n• SPL: ${dbFS} dBFS`}
    >
      {/* Realtime Canvas Visualizer */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          style={{ width: "200px", height: "40px" }}
          className="block"
        />
        {/* Subtle Mode Indicator Pill */}
        <span className="absolute -bottom-0.5 left-1 text-[8px] font-mono uppercase tracking-wider text-ink-dim/70 group-hover:text-amber transition">
          {viewMode === "glottal" ? "F₀ Glottal" : viewMode === "formants" ? "Formants F₁-F₂" : "Spectral Waterfall"}
        </span>
      </div>

      {/* Dynamic F0 Pitch & Acoustic Formants Readout */}
      <div className="flex flex-col items-end justify-center border-l border-hairline/60 pl-2.5 pr-0.5 min-w-[76px]">
        {/* Live Fluctuating Fundamental Pitch */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isPlaying
                ? "bg-amber animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.9)]"
                : "bg-ink-dim/40"
            }`}
          />
          <span className="text-[11px] font-mono font-bold text-ink-primary tabular-nums tracking-tight">
            {liveF0} <span className="text-[9px] text-ink-dim font-normal">Hz</span>
          </span>
        </div>

        {/* Dynamic Telemetry Sub-row: Delta or Formant */}
        <div className="flex items-center gap-1">
          {isPlaying ? (
            <span
              className={`text-[8.5px] font-mono font-semibold tabular-nums ${
                f0Delta > 0 ? "text-amber" : f0Delta < 0 ? "text-cyan-400" : "text-ink-dim"
              }`}
            >
              {f0Delta >= 0 ? `+${f0Delta}` : f0Delta} Hz
            </span>
          ) : (
            <span className="text-[8px] font-mono text-ink-dim uppercase tracking-wider">
              {selectedPersona.gender === "female" ? "Soprano" : "Baritone"}
            </span>
          )}

          <span className="text-[8px] font-mono text-ink-muted">•</span>

          <span className="text-[8.5px] font-mono text-ink-dim tabular-nums font-medium">
            {dbFS} <span className="text-[7.5px]">dB</span>
          </span>
        </div>
      </div>
    </div>
  );
}
