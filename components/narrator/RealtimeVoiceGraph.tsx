"use client";

import React, { useRef, useEffect } from "react";
import type { VoicePersona } from "@/lib/voice-engine";
import type { PacingMode } from "./NarratorContext";

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
 * Calculates the fundamental acoustic frequency (F0 in Hz)
 * based on persona vocal biology and pitch calibration.
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
  const smoothedBandsRef = useRef<number[]>(new Array(14).fill(0));

  const pitchHz = getPersonaPitchHz(selectedPersona);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const width = 180;
    const height = 36;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Target level based on playback state
      const targetLevel = isPlaying ? Math.max(25, audioLevel) : 0;
      smoothedLevelRef.current += (targetLevel - smoothedLevelRef.current) * Math.min(1, dt * 12);

      // Smooth each frequency band
      const currentLevel = smoothedLevelRef.current;
      for (let i = 0; i < 14; i++) {
        const target = isPlaying ? (frequencyBands[i] || 30) : 4;
        smoothedBandsRef.current[i] += (target - smoothedBandsRef.current[i]) * Math.min(1, dt * 14);
      }

      // Increment wave phase based on pitch frequency and playback rate
      // Higher pitch = faster angular phase speed (f0)
      const angularSpeed = (pitchHz / 45) * playbackRate;
      phaseRef.current += angularSpeed * dt;

      ctx.clearRect(0, 0, width, height);

      // ─── LAYER 1: MULTILAYER SPECTRAL FORMANT BARS (Background) ───
      const barCount = 14;
      const barGap = 2;
      const totalBarWidth = 75;
      const barStartX = width - totalBarWidth - 4;
      const singleBarWidth = (totalBarWidth - (barCount - 1) * barGap) / barCount;

      for (let i = 0; i < barCount; i++) {
        const bandVal = smoothedBandsRef.current[i] || 0;
        const normalized = bandVal / 100;
        const barHeight = Math.max(3, normalized * (height - 8));
        const x = barStartX + i * (singleBarWidth + barGap);
        const y = height / 2 - barHeight / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isPlaying) {
          // Dynamic dual gradient: cryo cyan to amber gold
          gradient.addColorStop(0, "rgba(6, 182, 212, 0.85)");
          gradient.addColorStop(0.5, "rgba(245, 158, 11, 0.95)");
          gradient.addColorStop(1, "rgba(217, 119, 6, 0.75)");
        } else {
          gradient.addColorStop(0, "rgba(255, 255, 255, 0.15)");
          gradient.addColorStop(1, "rgba(255, 255, 255, 0.05)");
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Rounded bar
        ctx.roundRect(x, y, singleBarWidth, barHeight, 1.5);
        ctx.fill();
      }

      // ─── LAYER 2: FUNDAMENTAL PITCH HARMONIC SINE WAVE (Foreground) ───
      const waveWidth = barStartX - 10;
      const midY = height / 2;
      const baseAmplitude = isPlaying ? (currentLevel / 100) * 12 : 2;

      // 1. Secondary Harmonic Wave (Ghost / Resonance Layer)
      ctx.beginPath();
      ctx.strokeStyle = isPlaying ? "rgba(6, 182, 212, 0.35)" : "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 1.2;

      for (let x = 0; x <= waveWidth; x += 2) {
        const spatialFreq = (pitchHz / 200) * (2 * Math.PI / waveWidth);
        const y = midY + Math.sin(x * spatialFreq * 2 + phaseRef.current * 1.5) * (baseAmplitude * 0.45);
        if (x === 0) ctx.moveTo(x + 4, y);
        else ctx.lineTo(x + 4, y);
      }
      ctx.stroke();

      // 2. Primary Fundamental Pitch Wave (F0 Core Layer)
      ctx.beginPath();
      const waveGrad = ctx.createLinearGradient(4, 0, waveWidth, 0);
      if (isPlaying) {
        waveGrad.addColorStop(0, "#06b6d4"); // Cryo cyan
        waveGrad.addColorStop(0.5, "#f59e0b"); // Warm amber
        waveGrad.addColorStop(1, "#fbbf24"); // Bright gold
      } else {
        waveGrad.addColorStop(0, "rgba(255, 255, 255, 0.2)");
        waveGrad.addColorStop(1, "rgba(255, 255, 255, 0.1)");
      }

      ctx.strokeStyle = waveGrad;
      ctx.lineWidth = isPlaying ? 2.0 : 1.2;
      ctx.lineCap = "round";

      for (let x = 0; x <= waveWidth; x += 2) {
        // Spatial wavelength modulated by voice pitch
        const spatialFreq = (pitchHz / 120) * (2 * Math.PI / waveWidth);
        // Envelope: taper edges so wave connects cleanly
        const envelope = Math.sin((x / waveWidth) * Math.PI);
        const y = midY + Math.sin(x * spatialFreq - phaseRef.current) * (baseAmplitude * envelope);
        if (x === 0) ctx.moveTo(x + 4, y);
        else ctx.lineTo(x + 4, y);
      }
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, pitchHz, playbackRate, audioLevel, frequencyBands]);

  return (
    <div
      className="relative flex items-center gap-2 px-2.5 py-1 rounded-2xl bg-bg-surface border border-hairline shrink-0 shadow-sm transition-all"
      title={`Live Voice Acoustics: ${selectedPersona.name} • Fundamental Pitch ~${pitchHz} Hz (${selectedPersona.gender === "female" ? "Soprano/Alto" : "Baritone/Tenor"})`}
    >
      {/* Live Canvas Waveform & Multilayer Formants */}
      <canvas
        ref={canvasRef}
        style={{ width: "180px", height: "36px" }}
        className="block"
      />

      {/* Real-time F0 Pitch & State Metric Overlay */}
      <div className="flex flex-col items-end justify-center border-l border-hairline/60 pl-2 pr-0.5">
        <div className="flex items-center gap-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isPlaying
                ? "bg-amber animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                : "bg-ink-dim/40"
            }`}
          />
          <span className="text-[10px] font-mono font-bold text-ink-primary tabular-nums tracking-tight">
            {pitchHz} <span className="text-[9px] text-ink-dim font-normal">Hz</span>
          </span>
        </div>
        <span className="text-[8px] font-mono text-amber uppercase tracking-wider font-semibold">
          {isPlaying ? "F₀ RESONANCE" : "IDLE"}
        </span>
      </div>
    </div>
  );
}
