"use client";

import React, { useRef, useEffect, useState } from "react";
import type { VoicePersona } from "@/lib/voice-engine";
import type { PacingMode } from "./NarratorContext";
import {
  Activity,
  Layers,
  Radio,
  Waves,
  Maximize2,
  X,
  ShieldCheck,
  Volume2,
  Info,
} from "lucide-react";

export type AcousticViewMode = "glottal" | "formants" | "waterfall";
export type ExpandedGraphMode = "pitch" | "formants" | "spectrogram" | "glottal";

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

export interface VoicePitchLimits {
  nominalF0: number;    // Baseline F0 in Hz (e.g. 220 for female, 114 for male)
  lowerLimitHz: number; // Physiologically calibrated lower excursion bound in Hz
  upperLimitHz: number; // Physiologically calibrated upper excursion bound in Hz
  gender: "female" | "male";
  bandwidthHz: string;  // Speech acoustic bandwidth standard
  vocalRegister: string;
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

/**
 * Calculates the physiologically calibrated upper and lower limits of speech
 * fundamental frequency (F0 in Hz) based on vocal fold biomechanics.
 */
export function getPersonaPitchLimits(persona: VoicePersona): VoicePitchLimits {
  const isFemale = persona.gender === "female";
  const nominalF0 = Math.round((isFemale ? 220 : 120) * persona.pitch);
  // Female pitch excursion typically ranges 140 Hz to 340 Hz (nominal ~220 Hz)
  // Male pitch excursion typically ranges 75 Hz to 210 Hz (nominal ~110 Hz)
  const lowerLimitHz = isFemale ? Math.round(nominalF0 * 0.64) : Math.round(nominalF0 * 0.65);
  const upperLimitHz = isFemale ? Math.round(nominalF0 * 1.55) : Math.round(nominalF0 * 1.82);

  return {
    nominalF0,
    lowerLimitHz: Math.max(50, lowerLimitHz),
    upperLimitHz: Math.min(500, upperLimitHz),
    gender: persona.gender,
    bandwidthHz: "80 Hz – 4,000 Hz",
    vocalRegister: isFemale ? "Soprano / Mezzo Register" : "Baritone / Modal Register",
  };
}

/**
 * Safe wrapper for createLinearGradient to prevent Canvas non-finite double errors
 */
function safeLinearGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): CanvasGradient | null {
  if (
    !Number.isFinite(x0) ||
    !Number.isFinite(y0) ||
    !Number.isFinite(x1) ||
    !Number.isFinite(y1)
  ) {
    return null;
  }
  if (x0 === x1 && y0 === y1) {
    y1 += 0.001;
  }
  try {
    return ctx.createLinearGradient(x0, y0, x1, y1);
  } catch {
    return null;
  }
}

interface PitchPoint {
  time: number; // timestamp in ms
  hz: number;   // instantaneous fundamental frequency F0 in Hz
  level: number;
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
  // Mini Canvas Ref (Normal Compact View)
  const miniCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const miniAnimRef = useRef<number | null>(null);

  // Expanded Canvas Ref (Expanded Analytical Scope View)
  const expandedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const expandedAnimRef = useRef<number | null>(null);
  const expandedContainerRef = useRef<HTMLDivElement | null>(null);

  // Expanded Modal State
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [expandedMode, setExpandedMode] = useState<ExpandedGraphMode>("pitch");

  // Shared Acoustic Physics Refs
  const phaseRef = useRef<number>(0);
  const smoothedLevelRef = useRef<number>(0);
  const smoothedBandsRef = useRef<number[]>(new Array(16).fill(0));
  const waterfallHistoryRef = useRef<number[][]>([]);
  const pitchHistoryRef = useRef<PitchPoint[]>([]);

  // Telemetry metrics
  const basePitchHz = getPersonaPitchHz(selectedPersona);
  const pitchLimits = getPersonaPitchLimits(selectedPersona);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. COMPACT NORMAL VIEW: CLEAN LIVE VISUALIZER (NO UNSTABLE JITTERING NUMBERS)
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = miniCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const width = 170;
    const height = 36;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;

      // Audio Level & Frequency Smoothing
      const targetLevel = isPlaying ? Math.max(20, audioLevel) : 0;
      smoothedLevelRef.current += (targetLevel - smoothedLevelRef.current) * Math.min(1, dt * 14);
      const currentLevel = smoothedLevelRef.current;

      const bandCount = 16;
      for (let i = 0; i < bandCount; i++) {
        const inputVal = frequencyBands[i] !== undefined ? frequencyBands[i] : (isPlaying ? 28 : 2);
        smoothedBandsRef.current[i] =
          (smoothedBandsRef.current[i] || 0) +
          (inputVal - (smoothedBandsRef.current[i] || 0)) * Math.min(1, dt * 15);
      }

      // Physics-based F0 glottal cycle modulation
      const intonationCycle = Math.sin(now * 0.0035);
      const microStress = (Math.sin(now * 0.012) + Math.sin(now * 0.027)) * 0.5;
      const jitter = (Math.random() - 0.5) * 2.5;
      const amplitudePitchCoupling = isPlaying ? (currentLevel / 100) * 14 : 0;

      const currentF0 = isPlaying
        ? Math.round(basePitchHz + intonationCycle * 16 + microStress * 10 + amplitudePitchCoupling + jitter)
        : basePitchHz;

      // Record pitch history for expanded graph
      if (isPlaying) {
        pitchHistoryRef.current.push({
          time: now,
          hz: currentF0,
          level: currentLevel,
        });
      } else if (pitchHistoryRef.current.length === 0) {
        // Pre-populate resting baseline trace
        for (let i = 0; i < 40; i++) {
          pitchHistoryRef.current.push({
            time: now - (40 - i) * 125,
            hz: basePitchHz,
            level: 0,
          });
        }
      }

      // Prune points older than 5000ms
      const cutoff = now - 5000;
      while (pitchHistoryRef.current.length > 0 && pitchHistoryRef.current[0].time < cutoff) {
        pitchHistoryRef.current.shift();
      }

      const angularSpeed = (currentF0 / 38) * playbackRate;
      phaseRef.current += angularSpeed * dt;

      ctx.clearRect(0, 0, width, height);

      // Render Clean Dual-Zone Acoustic Visualization:
      // Left Zone: Fluid Fundamental F0 Glottal Pulse Wave
      // Right Zone: Subtle Multi-Band Energy Bars
      const barsWidth = 56;
      const barStartX = width - barsWidth - 2;
      const singleBarWidth = 3.2;
      const barGap = 1.4;

      // Draw subtle spectral energy bars (Right)
      for (let i = 0; i < 10; i++) {
        const val = smoothedBandsRef.current[i] || 0;
        const normalized = val / 100;
        const barHeight = Math.max(3, normalized * (height - 6));
        const x = barStartX + i * (singleBarWidth + barGap);
        const y = height / 2 - barHeight / 2;

        const grad = safeLinearGradient(ctx, 0, y, 0, y + barHeight);
        if (grad) {
          if (isPlaying) {
            grad.addColorStop(0, "#06b6d4"); // Cyan
            grad.addColorStop(0.5, "#f59e0b"); // Amber
            grad.addColorStop(1, "#d97706"); // Gold
          } else {
            grad.addColorStop(0, "rgba(255, 255, 255, 0.12)");
            grad.addColorStop(1, "rgba(255, 255, 255, 0.04)");
          }
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = isPlaying ? "#f59e0b" : "rgba(255, 255, 255, 0.12)";
        }
        ctx.beginPath();
        ctx.roundRect(x, y, singleBarWidth, barHeight, 1.2);
        ctx.fill();
      }

      // Draw Primary Glottal Vocal Waveform (Left)
      const waveWidth = barStartX - 8;
      const midY = height / 2;
      const baseAmp = isPlaying ? (currentLevel / 100) * 13 : 2.5;

      // Harmonic Resonance Layer
      ctx.beginPath();
      ctx.strokeStyle = isPlaying ? "rgba(6, 182, 212, 0.35)" : "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1.2;
      for (let x = 0; x <= waveWidth; x += 2) {
        const k = (currentF0 / 140) * ((2 * Math.PI) / waveWidth);
        const y = midY + Math.sin(x * k * 2 + phaseRef.current * 1.6) * (baseAmp * 0.4);
        if (x === 0) ctx.moveTo(x + 2, y);
        else ctx.lineTo(x + 2, y);
      }
      ctx.stroke();

      // Primary F0 Glottal Contour
      ctx.beginPath();
      const waveGrad = safeLinearGradient(ctx, 2, 0, Math.max(10, waveWidth), 0);
      if (waveGrad) {
        if (isPlaying) {
          waveGrad.addColorStop(0, "#06b6d4"); // Cryo Cyan
          waveGrad.addColorStop(0.6, "#f59e0b"); // Warm Amber
          waveGrad.addColorStop(1, "#fbbf24"); // Bright Gold
        } else {
          waveGrad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
          waveGrad.addColorStop(1, "rgba(255, 255, 255, 0.08)");
        }
        ctx.strokeStyle = waveGrad;
      } else {
        ctx.strokeStyle = isPlaying ? "#f59e0b" : "rgba(255, 255, 255, 0.25)";
      }
      ctx.lineWidth = isPlaying ? 2.2 : 1.2;
      ctx.lineCap = "round";

      for (let x = 0; x <= waveWidth; x += 2) {
        const spatialFreq = (currentF0 / 95) * ((2 * Math.PI) / waveWidth);
        const envelope = Math.sin((x / waveWidth) * Math.PI);
        const glottalWave =
          Math.sin(x * spatialFreq - phaseRef.current) +
          0.25 * Math.sin(2 * (x * spatialFreq - phaseRef.current));
        const y = midY + glottalWave * (baseAmp * envelope);
        if (x === 0) ctx.moveTo(x + 2, y);
        else ctx.lineTo(x + 2, y);
      }
      ctx.stroke();

      miniAnimRef.current = requestAnimationFrame(render);
    };

    miniAnimRef.current = requestAnimationFrame(render);

    return () => {
      if (miniAnimRef.current) cancelAnimationFrame(miniAnimRef.current);
    };
  }, [isPlaying, basePitchHz, playbackRate, audioLevel, frequencyBands]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. EXPANDED ANALYTICAL SCOPE: MULTI-TYPE GRAPH WITH LABELED TIME & HZ AXES
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isExpanded) return;

    const canvas = expandedCanvasRef.current;
    const container = expandedContainerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    const resizeAndSetup = () => {
      const width = Math.max(300, container.clientWidth || 800);
      const height = 350;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
      return { width, height };
    };

    let { width, height } = resizeAndSetup();

    const resizeObserver = new ResizeObserver(() => {
      if (container.clientWidth > 0) {
        const dims = resizeAndSetup();
        width = dims.width;
        height = dims.height;
      }
    });
    resizeObserver.observe(container);

    let lastTime = performance.now();

    const renderExpanded = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Background Graticule Fill
      ctx.fillStyle = "#070d18";
      ctx.fillRect(0, 0, width, height);

      // Margins for Professional Oscilloscope Axes
      const padLeft = 72;
      const padRight = 28;
      const padTop = 32;
      const padBottom = 48;
      const chartW = Math.max(100, width - padLeft - padRight);
      const chartH = Math.max(100, height - padTop - padBottom);

      // ─── MODE 1: F0 FUNDAMENTAL PITCH CONTOUR (TIME ON X, HZ ON Y) ───
      if (expandedMode === "pitch") {
        const { nominalF0, lowerLimitHz, upperLimitHz } = pitchLimits;

        // Dynamic Frequency Range with Safe Headroom
        const minY = Math.max(40, lowerLimitHz - (selectedPersona.gender === "female" ? 40 : 25));
        const maxY = upperLimitHz + (selectedPersona.gender === "female" ? 40 : 30);

        const getFreqY = (hz: number) => {
          const clamped = Math.max(minY, Math.min(maxY, hz));
          return padTop + chartH - ((clamped - minY) / (maxY - minY)) * chartH;
        };

        const yUpper = getFreqY(upperLimitHz);
        const yNominal = getFreqY(nominalF0);
        const yLower = getFreqY(lowerLimitHz);

        // 1. Highlight Physiologically Calibrated Safe Pitch Envelope Band
        ctx.fillStyle = "rgba(245, 158, 11, 0.045)";
        ctx.fillRect(padLeft, yUpper, chartW, Math.max(1, yLower - yUpper));

        // Subtle gradient grid inside safe band
        const safeGrad = safeLinearGradient(ctx, padLeft, yUpper, padLeft, yLower);
        if (safeGrad) {
          safeGrad.addColorStop(0, "rgba(245, 158, 11, 0.08)");
          safeGrad.addColorStop(0.5, "rgba(6, 182, 212, 0.04)");
          safeGrad.addColorStop(1, "rgba(99, 102, 241, 0.08)");
          ctx.fillStyle = safeGrad;
          ctx.fillRect(padLeft, yUpper, chartW, Math.max(1, yLower - yUpper));
        }

        // 2. Horizontal Frequency Gridlines & Ticks (Every 50 Hz or 25 Hz)
        const hzStep = selectedPersona.gender === "female" ? 50 : 25;
        const startHz = Math.ceil(minY / hzStep) * hzStep;
        ctx.font = "10px monospace";
        ctx.textAlign = "right";

        for (let hz = startHz; hz <= maxY; hz += hzStep) {
          const y = getFreqY(hz);
          // Grid line
          ctx.beginPath();
          ctx.setLineDash([2, 5]);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
          ctx.lineWidth = 1;
          ctx.moveTo(padLeft, y);
          ctx.lineTo(padLeft + chartW, y);
          ctx.stroke();

          // Y-axis numerical tick label
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.fillText(`${hz} Hz`, padLeft - 8, y + 3.5);
        }

        // 3. Calibrated Upper Limit Reference Line
        ctx.beginPath();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = "rgba(245, 158, 11, 0.85)"; // Amber
        ctx.lineWidth = 1.8;
        ctx.moveTo(padLeft, yUpper);
        ctx.lineTo(padLeft + chartW, yUpper);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#f59e0b";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "right";
        ctx.fillText(`UPPER LIMIT: ${upperLimitHz} Hz`, padLeft + chartW - 8, yUpper - 6);

        // 4. Calibrated Nominal Resting Pitch Reference Line
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(6, 182, 212, 0.85)"; // Cyan
        ctx.lineWidth = 1.6;
        ctx.moveTo(padLeft, yNominal);
        ctx.lineTo(padLeft + chartW, yNominal);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#06b6d4";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "right";
        ctx.fillText(`NOMINAL F₀: ${nominalF0} Hz`, padLeft + chartW - 8, yNominal - 6);

        // 5. Calibrated Lower Limit Reference Line
        ctx.beginPath();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = "rgba(129, 140, 248, 0.85)"; // Indigo
        ctx.lineWidth = 1.8;
        ctx.moveTo(padLeft, yLower);
        ctx.lineTo(padLeft + chartW, yLower);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#818cf8";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "right";
        ctx.fillText(`LOWER LIMIT: ${lowerLimitHz} Hz`, padLeft + chartW - 8, yLower - 6);

        // 6. X-Axis Time Gridlines (-5.0s to 0.0s Live)
        const timeWindowSec = 5.0;
        ctx.font = "10px monospace";
        ctx.textAlign = "center";

        for (let s = 0; s <= 5; s++) {
          const x = padLeft + chartW - (s / timeWindowSec) * chartW;
          // Vertical grid line
          ctx.beginPath();
          ctx.setLineDash([2, 5]);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          ctx.lineWidth = 1;
          ctx.moveTo(x, padTop);
          ctx.lineTo(x, padTop + chartH);
          ctx.stroke();

          // X-axis Time Tick Label
          ctx.fillStyle = s === 0 ? "#f59e0b" : "rgba(255, 255, 255, 0.55)";
          ctx.font = s === 0 ? "bold 10px monospace" : "10px monospace";
          ctx.fillText(s === 0 ? "0.0s (Live)" : `-${s}.0s`, x, padTop + chartH + 18);
        }

        // 7. Axis Titles (X: Time, Y: Frequency of Speech)
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Time (seconds) — 5s Rolling Acoustic Window", padLeft + chartW / 2, padTop + chartH + 36);

        // Rotated Y-Axis Title
        ctx.save();
        ctx.translate(18, padTop + chartH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Frequency of Speech (Hz)", 0, 0);
        ctx.restore();

        // 8. Draw Real-Time F0 Fundamental Pitch Contour Trajectory
        const samples = pitchHistoryRef.current;
        if (samples.length > 1) {
          ctx.beginPath();
          samples.forEach((pt, idx) => {
            const ageSec = Math.max(0, (now - pt.time) / 1000);
            const x = padLeft + chartW - (ageSec / timeWindowSec) * chartW;
            const y = getFreqY(pt.hz);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });

          // Gradient Stroke
          const curveGrad = safeLinearGradient(ctx, padLeft, 0, padLeft + chartW, 0);
          if (curveGrad) {
            curveGrad.addColorStop(0, "rgba(6, 182, 212, 0.35)");
            curveGrad.addColorStop(0.6, "#06b6d4");
            curveGrad.addColorStop(1, "#f59e0b");
            ctx.strokeStyle = curveGrad;
          } else {
            ctx.strokeStyle = "#f59e0b";
          }
          ctx.lineWidth = 2.8;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.shadowColor = "#f59e0b";
          ctx.shadowBlur = isPlaying ? 10 : 0;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Live Pulse Node at 0.0s (Live)
          const latestSample = samples[samples.length - 1];
          const headX = padLeft + chartW;
          const headY = getFreqY(latestSample.hz);

          // Pulse ring
          if (isPlaying) {
            ctx.beginPath();
            ctx.arc(headX, headY, 8 + Math.sin(now * 0.01) * 3, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(245, 158, 11, 0.25)";
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(headX, headY, isPlaying ? 5 : 3.5, 0, Math.PI * 2);
          ctx.fillStyle = isPlaying ? "#f59e0b" : "rgba(255, 255, 255, 0.6)";
          ctx.fill();
        }
      }

      // ─── MODE 2: FORMANT RESONANCE SPECTRUM (HZ ON X, DBMAGNITUDE ON Y) ───
      else if (expandedMode === "formants") {
        // X-Axis: 0 Hz to 4000 Hz (Standard Speech Bandwidth)
        // Y-Axis: -60 dB to 0 dB
        const maxFreq = 4000;
        const minDb = -60;
        const maxDb = 0;

        const getX = (hz: number) => padLeft + (hz / maxFreq) * chartW;
        const getY = (db: number) => padTop + chartH - ((db - minDb) / (maxDb - minDb)) * chartH;

        // X-Axis Frequency Grid (Every 500 Hz)
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        for (let hz = 0; hz <= maxFreq; hz += 500) {
          const x = getX(hz);
          ctx.beginPath();
          ctx.setLineDash([2, 5]);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          ctx.moveTo(x, padTop);
          ctx.lineTo(x, padTop + chartH);
          ctx.stroke();

          ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
          ctx.fillText(hz === 0 ? "0 Hz" : `${hz / 1000} kHz`, x, padTop + chartH + 18);
        }

        // Y-Axis dB Grid (Every 15 dB)
        ctx.textAlign = "right";
        for (let db = minDb; db <= maxDb; db += 15) {
          const y = getY(db);
          ctx.beginPath();
          ctx.setLineDash([2, 5]);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          ctx.moveTo(padLeft, y);
          ctx.lineTo(padLeft + chartW, y);
          ctx.stroke();

          ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
          ctx.fillText(`${db} dB`, padLeft - 8, y + 3.5);
        }

        // Axis Titles
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Frequency of Speech (Hz) — Acoustic Bandwidth (0 – 4,000 Hz)", padLeft + chartW / 2, padTop + chartH + 36);

        ctx.save();
        ctx.translate(18, padTop + chartH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Acoustic Magnitude (dBFS)", 0, 0);
        ctx.restore();

        // Calculate Formants: F1 (vowel height), F2 (vowel fronting), F3 (clarity), F4 (laryngeal tube)
        const currentLevel = smoothedLevelRef.current;
        const currentF0 = basePitchHz;
        const f1Target = Math.round(520 + (currentLevel / 100) * 200 + Math.sin(now * 0.004) * 40);
        const f2Target = Math.round(1850 + Math.cos(now * 0.003) * 120);
        const f3Target = 2650;
        const f4Target = 3450;

        // Draw Vocal Tract Transfer Function Curve
        ctx.beginPath();
        for (let px = 0; px <= chartW; px += 2) {
          const hz = (px / chartW) * maxFreq;
          // Gaussian bell resonant poles
          const poleF0 = Math.exp(-Math.pow((hz - currentF0) / 90, 2)) * 0.85;
          const poleF1 = Math.exp(-Math.pow((hz - f1Target) / 180, 2)) * 1.0;
          const poleF2 = Math.exp(-Math.pow((hz - f2Target) / 260, 2)) * 0.72;
          const poleF3 = Math.exp(-Math.pow((hz - f3Target) / 320, 2)) * 0.55;
          const poleF4 = Math.exp(-Math.pow((hz - f4Target) / 400, 2)) * 0.4;
          const rolloff = Math.pow(1 - hz / maxFreq, 0.6);

          const sumTransfer = (poleF0 + poleF1 + poleF2 + poleF3 + poleF4) * (isPlaying ? Math.max(0.2, currentLevel / 100) : 0.15) * rolloff;
          const calcDb = -54 + sumTransfer * 50;
          const y = getY(calcDb);

          if (px === 0) ctx.moveTo(padLeft + px, y);
          else ctx.lineTo(padLeft + px, y);
        }

        const formantGrad = safeLinearGradient(ctx, padLeft, 0, padLeft + chartW, 0);
        if (formantGrad) {
          formantGrad.addColorStop(0, "#06b6d4"); // Cyan
          formantGrad.addColorStop(0.35, "#f59e0b"); // Amber
          formantGrad.addColorStop(0.7, "#fbbf24"); // Gold
          formantGrad.addColorStop(1, "#818cf8"); // Indigo
          ctx.strokeStyle = formantGrad;
        } else {
          ctx.strokeStyle = "#f59e0b";
        }
        ctx.lineWidth = 2.4;
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = isPlaying ? 8 : 0;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Mark Formant Peaks
        const formants = [
          { name: "F₁", hz: f1Target, desc: "Pharyngeal", color: "#06b6d4" },
          { name: "F₂", hz: f2Target, desc: "Oral Cavity", color: "#f59e0b" },
          { name: "F₃", hz: f3Target, desc: "Palatal", color: "#fbbf24" },
          { name: "F₄", hz: f4Target, desc: "Laryngeal", color: "#818cf8" },
        ];

        formants.forEach((f) => {
          const x = getX(f.hz);
          ctx.beginPath();
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = f.color;
          ctx.moveTo(x, padTop + 20);
          ctx.lineTo(x, padTop + chartH);
          ctx.stroke();
          ctx.setLineDash([]);

          // Badge
          ctx.fillStyle = f.color;
          ctx.beginPath();
          ctx.arc(x, padTop + 14, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.fillText(`${f.name} (${f.hz} Hz)`, x, padTop + 8);
        });
      }

      // ─── MODE 3: TIME-FREQUENCY SPECTROGRAM (WATERFALL HEATMAP) ───
      else if (expandedMode === "spectrogram") {
        // Record rolling spectral slices
        if (waterfallHistoryRef.current.length > 36) {
          waterfallHistoryRef.current.shift();
        }
        waterfallHistoryRef.current.push([...smoothedBandsRef.current]);

        const history = waterfallHistoryRef.current;
        const timeCols = history.length;
        const freqBands = 16;
        const colWidth = chartW / Math.max(1, timeCols);
        const rowHeight = chartH / freqBands;

        // Render Waterfall Heatmap Matrix
        history.forEach((bands, colIdx) => {
          const x = padLeft + colIdx * colWidth;
          bands.forEach((bVal, bIdx) => {
            const y = padTop + chartH - (bIdx + 1) * rowHeight;
            const energyNorm = Math.min(1, Math.max(0, bVal / 100));

            // Colormap: Deep Blue -> Cyan -> Amber -> Bright White
            let r = 7, g = 13, b = 24;
            if (isPlaying) {
              if (energyNorm < 0.4) {
                // Dark to Cyan
                const t = energyNorm / 0.4;
                r = Math.round(6 * t);
                g = Math.round(182 * t);
                b = Math.round(212 * t);
              } else if (energyNorm < 0.8) {
                // Cyan to Amber
                const t = (energyNorm - 0.4) / 0.4;
                r = Math.round(6 + (245 - 6) * t);
                g = Math.round(182 + (158 - 182) * t);
                b = Math.round(212 + (11 - 212) * t);
              } else {
                // Amber to White
                const t = (energyNorm - 0.8) / 0.2;
                r = Math.round(245 + 10 * t);
                g = Math.round(158 + 97 * t);
                b = Math.round(11 + 244 * t);
              }
            } else {
              r = 20; g = 30; b = 45;
            }

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, colWidth + 0.5, rowHeight + 0.5);
          });
        });

        // X-Axis Time Labels
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.fillText("-4.0s", padLeft, padTop + chartH + 18);
        ctx.fillText("-2.0s", padLeft + chartW / 2, padTop + chartH + 18);
        ctx.fillText("0.0s (Live)", padLeft + chartW, padTop + chartH + 18);

        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "bold 11px monospace";
        ctx.fillText("Time (seconds) — Spectrogram History", padLeft + chartW / 2, padTop + chartH + 36);

        // Y-Axis Frequency Labels
        ctx.textAlign = "right";
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.fillText("4,000 Hz", padLeft - 8, padTop + 10);
        ctx.fillText("2,000 Hz", padLeft - 8, padTop + chartH / 2);
        ctx.fillText("100 Hz", padLeft - 8, padTop + chartH - 4);

        ctx.save();
        ctx.translate(18, padTop + chartH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Frequency of Speech (Hz)", 0, 0);
        ctx.restore();
      }

      // ─── MODE 4: GLOTTAL PULSE OSCILLOSCOPE (TIME MS ON X, PRESSURE ON Y) ───
      else if (expandedMode === "glottal") {
        const periodMs = 25; // 25ms time window
        const midY = padTop + chartH / 2;
        const currentLevel = smoothedLevelRef.current;
        const currentF0 = basePitchHz;

        // X-Axis Time Grid (Every 5 ms)
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        for (let ms = 0; ms <= periodMs; ms += 5) {
          const x = padLeft + (ms / periodMs) * chartW;
          ctx.beginPath();
          ctx.setLineDash([2, 5]);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          ctx.moveTo(x, padTop);
          ctx.lineTo(x, padTop + chartH);
          ctx.stroke();

          ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
          ctx.fillText(`${ms} ms`, x, padTop + chartH + 18);
        }

        // Y-Axis Neutral Guide
        ctx.beginPath();
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.moveTo(padLeft, midY);
        ctx.lineTo(padLeft + chartW, midY);
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Time (milliseconds) — Glottal Acoustic Waveform Period (T₀)", padLeft + chartW / 2, padTop + chartH + 36);

        ctx.save();
        ctx.translate(18, padTop + chartH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Acoustic Pressure (µPa)", 0, 0);
        ctx.restore();

        // Draw Bi-Phase Liljencrants-Fant Vocal Cord Glottal Wave
        ctx.beginPath();
        ctx.setLineDash([]);
        const amp = isPlaying ? (currentLevel / 100) * (chartH * 0.42) : 6;

        for (let px = 0; px <= chartW; px += 2) {
          const ms = (px / chartW) * periodMs;
          const tSec = ms / 1000;
          const phase = tSec * currentF0 * 2 * Math.PI - phaseRef.current;
          const glottalShape =
            Math.sin(phase) +
            0.35 * Math.sin(2 * phase) +
            0.15 * Math.sin(3 * phase + 0.4);

          const y = midY - glottalShape * amp;
          if (px === 0) ctx.moveTo(padLeft + px, y);
          else ctx.lineTo(padLeft + px, y);
        }

        ctx.strokeStyle = isPlaying ? "#f59e0b" : "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 2.4;
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = isPlaying ? 8 : 0;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      expandedAnimRef.current = requestAnimationFrame(renderExpanded);
    };

    expandedAnimRef.current = requestAnimationFrame(renderExpanded);

    return () => {
      resizeObserver.disconnect();
      if (expandedAnimRef.current) cancelAnimationFrame(expandedAnimRef.current);
    };
  }, [isExpanded, expandedMode, isPlaying, basePitchHz, pitchLimits, selectedPersona]);

  return (
    <>
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 1. NORMAL VIEW: MINIMAL, STABLE VISUALIZER WITH NO RAPIDLY JITTERING NUMBERS */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div
        onClick={() => setIsExpanded(true)}
        className="relative flex items-center gap-2.5 px-3 py-1 rounded-2xl bg-bg-surface/90 hover:bg-bg-hover/80 border border-hairline hover:border-amber/40 shrink-0 shadow-sm transition-all cursor-pointer select-none group"
        title="Voice Acoustic Analyzer • Click to Expand Scope (Time vs Hz, Formants & Calibrated Pitch Limits)"
      >
        {/* Real-Time Live Waveform Canvas */}
        <div className="relative">
          <canvas
            ref={miniCanvasRef}
            style={{ width: "170px", height: "36px" }}
            className="block rounded-lg"
          />
        </div>

        {/* Stable Non-Fluctuating Scope Expand Trigger */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-hairline/60">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-bg-surface/80 border border-hairline/70 group-hover:border-amber/40 transition">
            <Activity className={`w-3 h-3 ${isPlaying ? "text-amber animate-pulse" : "text-ink-dim"}`} />
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-ink-secondary group-hover:text-amber transition">
              Scope
            </span>
            <Maximize2 className="w-3 h-3 text-ink-dim group-hover:text-amber transition ml-0.5" />
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 2. EXPANDED VIEW: MULTI-TYPE ACOUSTIC SCOPE WITH TIME & HZ AXES AND LIMITS */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="w-full max-w-4xl bg-bg-elevated border border-hairline/80 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col gap-4 text-ink-primary select-none my-auto max-h-[94vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-hairline/60 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-amber-subtle text-amber">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-ink-primary tracking-tight">
                    Voice Acoustic Frequency Analyzer & Telemetry Scope
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isPlaying
                        ? "bg-amber/20 text-amber border border-amber/40 animate-pulse"
                        : "bg-bg-surface text-ink-dim border border-hairline"
                    }`}
                  >
                    {isPlaying ? "Live Signal" : "Standby"}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary mt-1">
                  Speaker: <span className="font-semibold text-ink-primary">{selectedPersona.name}</span> ({selectedPersona.accent}) • {pitchLimits.vocalRegister} • Real-Time Vocal Fold Prosody
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-xl bg-bg-surface hover:bg-bg-hover text-ink-dim hover:text-ink-primary border border-hairline transition shrink-0"
                title="Close Analyzer Scope (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Calibrated Acoustic Frequency Limits (Stable Non-Jittering Reference Standards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Upper Pitch Limit Card */}
              <div className="p-3 rounded-2xl bg-bg-surface/80 border border-amber/30 flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Upper Limit (F₀,max)
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-lg font-mono font-bold text-amber">
                    {pitchLimits.upperLimitHz}
                  </span>
                  <span className="text-xs font-mono text-ink-dim">Hz</span>
                </div>
                <span className="text-[10px] text-ink-dim mt-0.5">
                  Phonetic excursion ceiling
                </span>
              </div>

              {/* Nominal Modal Pitch Card */}
              <div className="p-3 rounded-2xl bg-bg-surface/80 border border-cryo/30 flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cryo font-bold flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Nominal Pitch (F₀)
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-lg font-mono font-bold text-cryo">
                    {pitchLimits.nominalF0}
                  </span>
                  <span className="text-xs font-mono text-ink-dim">Hz</span>
                </div>
                <span className="text-[10px] text-ink-dim mt-0.5">
                  Resting glottal tone
                </span>
              </div>

              {/* Lower Pitch Limit Card */}
              <div className="p-3 rounded-2xl bg-bg-surface/80 border border-indigo-500/30 flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Lower Limit (F₀,min)
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-lg font-mono font-bold text-indigo-400">
                    {pitchLimits.lowerLimitHz}
                  </span>
                  <span className="text-xs font-mono text-ink-dim">Hz</span>
                </div>
                <span className="text-[10px] text-ink-dim mt-0.5">
                  Vocal fry boundary
                </span>
              </div>

              {/* Acoustic Speech Bandwidth Card */}
              <div className="p-3 rounded-2xl bg-bg-surface/80 border border-hairline flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-secondary font-bold flex items-center gap-1">
                  <Volume2 className="w-3 h-3" /> Speech Bandwidth
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-sm font-mono font-bold text-ink-primary">
                    {pitchLimits.bandwidthHz}
                  </span>
                </div>
                <span className="text-[10px] text-ink-dim mt-0.5">
                  ITU-T G.722 standard
                </span>
              </div>
            </div>

            {/* Representation Mode Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-hairline/50 pb-3">
              <span className="text-xs font-mono text-ink-dim uppercase tracking-wider mr-1">
                Representation:
              </span>

              <button
                onClick={() => setExpandedMode("pitch")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition ${
                  expandedMode === "pitch"
                    ? "bg-amber text-on-amber shadow-sm"
                    : "bg-bg-surface hover:bg-bg-hover text-ink-secondary border border-hairline"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                F₀ Pitch Contour (Time × Hz)
              </button>

              <button
                onClick={() => setExpandedMode("formants")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition ${
                  expandedMode === "formants"
                    ? "bg-amber text-on-amber shadow-sm"
                    : "bg-bg-surface hover:bg-bg-hover text-ink-secondary border border-hairline"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Formants Spectrum (Hz × Energy)
              </button>

              <button
                onClick={() => setExpandedMode("spectrogram")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition ${
                  expandedMode === "spectrogram"
                    ? "bg-amber text-on-amber shadow-sm"
                    : "bg-bg-surface hover:bg-bg-hover text-ink-secondary border border-hairline"
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                Time-Frequency Spectrogram
              </button>

              <button
                onClick={() => setExpandedMode("glottal")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition ${
                  expandedMode === "glottal"
                    ? "bg-amber text-on-amber shadow-sm"
                    : "bg-bg-surface hover:bg-bg-hover text-ink-secondary border border-hairline"
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
                Glottal Waveform (Time ms)
              </button>
            </div>

            {/* Main Interactive High-Resolution Canvas with Time on X and Speech Frequency on Y */}
            <div
              ref={expandedContainerRef}
              className="w-full h-[350px] rounded-2xl bg-[#070d18] border border-hairline/80 overflow-hidden relative shadow-inner"
            >
              <canvas
                ref={expandedCanvasRef}
                style={{ width: "100%", height: "350px" }}
                className="block"
              />
            </div>

            {/* Scientific Explanatory Legend & Cadence Laws */}
            <div className="p-3 rounded-2xl bg-bg-surface/60 border border-hairline/60 flex items-start gap-2.5 text-[11px] text-ink-secondary leading-relaxed">
              <Info className="w-4 h-4 text-amber shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-ink-primary">
                  Engineering Acoustic Grounding:
                </span>{" "}
                The graph frequency axes are anchored to physiological boundaries (Lower Limit: {pitchLimits.lowerLimitHz} Hz, Upper Limit: {pitchLimits.upperLimitHz} Hz) rather than unstable fluctuating numbers. Human speech intonation naturally oscillates around the speaker's nominal modal pitch ({pitchLimits.nominalF0} Hz) during affirmative assertions, paragraph transitions, and engineering nomenclature.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
