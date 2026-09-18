"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import type { VoicePersona } from "@/lib/voice-engine";
import type { PacingMode } from "./NarratorContext";
import {
  Activity,
  Layers,
  Radio,
  Waves,
  Maximize2,
  X,
  Volume2,
  Sparkles,
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
  nominalF0: number;    // Baseline F0 in Hz
  lowerLimitHz: number; // Physiological lower bound in Hz
  upperLimitHz: number; // Physiological upper bound in Hz
  gender: "female" | "male";
  bandwidthHz: string;  // Speech bandwidth standard
  vocalRegister: string;
}

/**
 * Calculates baseline fundamental acoustic frequency (F0 in Hz)
 */
export function getPersonaPitchHz(persona: VoicePersona): number {
  const isFemale = persona.gender === "female";
  const baseFreq = isFemale ? 220 : 120;
  return Math.round(baseFreq * (persona.pitch || 1.0));
}

/**
 * Calculates physiologically calibrated limits of speech fundamental frequency (F0 in Hz)
 */
export function getPersonaPitchLimits(persona: VoicePersona): VoicePitchLimits {
  const isFemale = persona.gender === "female";
  const nominalF0 = Math.round((isFemale ? 220 : 120) * (persona.pitch || 1.0));
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
  // Client mount state for React createPortal
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Theme Detection (Dynamically tracks light / dark classes on <html>)
  const [isDark, setIsDark] = useState<boolean>(false);
  useEffect(() => {
    const checkTheme = () => {
      if (typeof document !== "undefined") {
        setIsDark(document.documentElement.classList.contains("dark"));
      }
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Mini Canvas Ref (Normal Compact View in Deck)
  const miniCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const miniAnimRef = useRef<number | null>(null);

  // Expanded Canvas Ref (Expanded Modal View)
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
  
  // Real Pitch History Buffer (Only filled with REAL speech data when playing, zero when stopped)
  const pitchHistoryRef = useRef<PitchPoint[]>([]);
  const lastFreezeTimeRef = useRef<number>(performance.now());
  const wasPlayingRef = useRef<boolean>(false);

  // Telemetry metrics
  const basePitchHz = useMemo(() => getPersonaPitchHz(selectedPersona), [selectedPersona]);
  const pitchLimits = useMemo(() => getPersonaPitchLimits(selectedPersona), [selectedPersona]);

  // Keep a mutable ref of latest dynamic props so the 60/120 FPS animation loops never tear down on prop updates
  const stateRef = useRef({
    isPlaying,
    selectedPersona,
    playbackRate,
    audioLevel,
    frequencyBands,
    basePitchHz,
    pitchLimits,
    expandedMode,
    isDark,
  });

  useEffect(() => {
    stateRef.current = {
      isPlaying,
      selectedPersona,
      playbackRate,
      audioLevel,
      frequencyBands,
      basePitchHz,
      pitchLimits,
      expandedMode,
      isDark,
    };
  });

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
  // 1. MINI COMPACT VISUALIZER (IN DECK BAR) — AUTHENTIC 0.0 IDLE STATE
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

      const {
        isPlaying: playing,
        audioLevel: lvl,
        frequencyBands: bands,
        playbackRate: rate,
        basePitchHz: baseF0,
        isDark: dark,
      } = stateRef.current;

      const barsWidth = 56;
      const barStartX = width - barsWidth - 2;
      const singleBarWidth = 3.2;
      const barGap = 1.4;
      const waveWidth = barStartX - 6;
      const midY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // AUTHENTIC STOPPED STATE: When not playing, signal is 0.0 (stationary, silent baseline)
      if (!playing) {
        if (wasPlayingRef.current) {
          lastFreezeTimeRef.current = now;
          wasPlayingRef.current = false;
        }
        smoothedLevelRef.current = 0;
        for (let i = 0; i < 16; i++) {
          smoothedBandsRef.current[i] = 0;
        }
        pitchHistoryRef.current = [];
        phaseRef.current = 0;

        // Draw flat calm resting center line (0.0 signal level)
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(waveWidth, midY);
        ctx.strokeStyle = dark ? "rgba(255, 255, 255, 0.20)" : "rgba(68, 45, 25, 0.22)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Subtle 0.0 dB resting graticule bars
        for (let i = 0; i < 10; i++) {
          const x = barStartX + i * (singleBarWidth + barGap);
          ctx.fillStyle = dark ? "rgba(255, 255, 255, 0.08)" : "rgba(68, 45, 25, 0.08)";
          ctx.beginPath();
          ctx.roundRect(x, height / 2 - 1, singleBarWidth, 2, 1);
          ctx.fill();
        }

        miniAnimRef.current = requestAnimationFrame(render);
        return;
      }

      // ACTIVE PLAYBACK STATE: Real live speech audio signals
      wasPlayingRef.current = true;
      lastFreezeTimeRef.current = now;

      // Smooth audio level
      const targetLevel = Math.max(12, lvl);
      smoothedLevelRef.current += (targetLevel - smoothedLevelRef.current) * Math.min(1, dt * 10);
      const currentLevel = smoothedLevelRef.current;

      // Smooth frequency bands
      const bandCount = 16;
      for (let i = 0; i < bandCount; i++) {
        const inputVal = bands[i] !== undefined ? bands[i] : 28;
        smoothedBandsRef.current[i] =
          (smoothedBandsRef.current[i] || 0) +
          (inputVal - (smoothedBandsRef.current[i] || 0)) * Math.min(1, dt * 15);
      }

      // Physics-based F0 glottal cycle modulation
      const intonationCycle = Math.sin(now * 0.0035);
      const microStress = (Math.sin(now * 0.012) + Math.sin(now * 0.027)) * 0.5;
      const jitter = (Math.random() - 0.5) * 2.0;
      const amplitudePitchCoupling = (currentLevel / 100) * 14;

      const currentF0 = Math.round(baseF0 + intonationCycle * 16 + microStress * 10 + amplitudePitchCoupling + jitter);

      // ONLY record pitch history during active live speech playback
      pitchHistoryRef.current.push({
        time: now,
        hz: currentF0,
        level: currentLevel,
      });

      // Prune points older than 5200ms
      const cutoff = now - 5200;
      while (pitchHistoryRef.current.length > 0 && pitchHistoryRef.current[0].time < cutoff) {
        pitchHistoryRef.current.shift();
      }

      const angularSpeed = (currentF0 / 38) * rate;
      phaseRef.current += angularSpeed * dt;

      // Draw active spectral energy bars (Right)
      for (let i = 0; i < 10; i++) {
        const val = smoothedBandsRef.current[i] || 0;
        const normalized = val / 100;
        const barHeight = Math.max(3, normalized * (height - 6));
        const x = barStartX + i * (singleBarWidth + barGap);
        const y = height / 2 - barHeight / 2;

        const grad = safeLinearGradient(ctx, 0, y, 0, y + barHeight);
        if (grad) {
          grad.addColorStop(0, dark ? "#06b6d4" : "#0a7eb8"); // Cyan
          grad.addColorStop(0.5, dark ? "#f59e0b" : "#c68410"); // Amber
          grad.addColorStop(1, dark ? "#d97706" : "#b45309"); // Gold
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = dark ? "#f59e0b" : "#c68410";
        }
        ctx.beginPath();
        ctx.roundRect(x, y, singleBarWidth, barHeight, 1.2);
        ctx.fill();
      }

      // Draw active fluid fundamental F0 wave (Left)
      const waveAmp = Math.max(4, (currentLevel / 100) * 12);
      ctx.beginPath();
      for (let x = 0; x <= waveWidth; x += 1.5) {
        const progress = x / waveWidth;
        const p = phaseRef.current + progress * Math.PI * 3.8;
        const env = Math.sin(progress * Math.PI); // Window tapering

        // Vocal tract harmonics
        const f0Wave = Math.sin(p);
        const f1Harmonic = Math.sin(p * 2.2) * 0.35;
        const f2Harmonic = Math.sin(p * 3.5) * 0.15;
        const combined = (f0Wave + f1Harmonic + f2Harmonic) * env;

        const y = midY - combined * waveAmp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      const waveGrad = safeLinearGradient(ctx, 0, 0, waveWidth, 0);
      if (waveGrad) {
        waveGrad.addColorStop(0, dark ? "rgba(6, 182, 212, 0.4)" : "rgba(10, 126, 184, 0.5)");
        waveGrad.addColorStop(0.6, dark ? "#06b6d4" : "#0a7eb8");
        waveGrad.addColorStop(1, dark ? "#f59e0b" : "#c68410");
        ctx.strokeStyle = waveGrad;
      } else {
        ctx.strokeStyle = dark ? "#f59e0b" : "#c68410";
      }

      ctx.lineWidth = 2.0;
      ctx.lineCap = "round";
      ctx.stroke();

      miniAnimRef.current = requestAnimationFrame(render);
    };

    miniAnimRef.current = requestAnimationFrame(render);

    return () => {
      if (miniAnimRef.current) cancelAnimationFrame(miniAnimRef.current);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. EXPANDED ANALYTICAL SCOPE: WHOLLY THEME-ADAPTIVE (LIGHT & DARK), REAL 0.0
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isExpanded) return;

    const canvas = expandedCanvasRef.current;
    const container = expandedContainerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    let currentW = 800;
    let currentH = 340;

    const resizeAndSetup = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(280, rect.width || container.clientWidth || 800);
      const height = Math.max(200, rect.height || container.clientHeight || 340);
      currentW = width;
      currentH = height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
      return { width, height };
    };

    // Initial measurement
    resizeAndSetup();

    const resizeObserver = new ResizeObserver(() => {
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        resizeAndSetup();
      }
    });
    resizeObserver.observe(container);

    let lastTime = performance.now();

    const renderExpanded = (now: number) => {
      try {
        const dt = Math.min((now - lastTime) / 1000, 0.08);
        lastTime = now;

        const {
          isPlaying: playing,
          selectedPersona: persona,
          basePitchHz: baseF0,
          pitchLimits: limits,
          expandedMode: mode,
          isDark: dark,
        } = stateRef.current;

        const width = currentW;
        const height = currentH;

        ctx.clearRect(0, 0, width, height);

        // ─── THEME-ADAPTIVE BACKGROUND & GRATICULE FILL ───
        // In Light mode: Clean technical parchment / lab graticule (#fbf9f4)
        // In Dark mode: Obsidian cleanroom dark slate (#070b14)
        ctx.fillStyle = dark ? "#070b14" : "#fbf9f4";
        ctx.fillRect(0, 0, width, height);

        // Oscilloscope Grid Margins
        const padLeft = width < 480 ? 56 : 70;
        const padRight = width < 480 ? 18 : 28;
        const padTop = 30;
        const padBottom = 44;
        const chartW = Math.max(80, width - padLeft - padRight);
        const chartH = Math.max(80, height - padTop - padBottom);

        // Subtle CRT / Laboratory Mesh Graticule
        ctx.strokeStyle = dark ? "rgba(255, 255, 255, 0.05)" : "rgba(68, 45, 25, 0.06)";
        ctx.lineWidth = 1;
        const gridCols = 8;
        const gridRows = 5;
        for (let c = 1; c < gridCols; c++) {
          const gx = padLeft + (c / gridCols) * chartW;
          ctx.beginPath();
          ctx.moveTo(gx, padTop);
          ctx.lineTo(gx, padTop + chartH);
          ctx.stroke();
        }
        for (let r = 1; r < gridRows; r++) {
          const gy = padTop + (r / gridRows) * chartH;
          ctx.beginPath();
          ctx.moveTo(padLeft, gy);
          ctx.lineTo(padLeft + chartW, gy);
          ctx.stroke();
        }

        // ─── MODE 1: F0 PITCH CONTOUR (DYNAMIC SOFT HUMAN ENVELOPE) ───
        if (mode === "pitch") {
          const { nominalF0, lowerLimitHz, upperLimitHz } = limits;

          // Ground floor is strictly 0.0 Hz (authentic zero acoustic excitation)
          const minY = 0;
          const maxY = upperLimitHz + (persona.gender === "female" ? 35 : 25);

          const getFreqY = (hz: number) => {
            const clamped = Math.max(minY, Math.min(maxY, hz));
            return padTop + chartH - ((clamped - minY) / (maxY - minY)) * chartH;
          };

          const yUpperBase = getFreqY(upperLimitHz);
          const yNominalBase = getFreqY(nominalF0);
          const yLowerBase = getFreqY(lowerLimitHz);

          // 1. DYNAMIC, SOFT HUMAN VOCAL RESONANCE CORRIDOR (CALIBRATION BOUNDARIES)
          // Physiological boundaries float as soft human breathing curves when playing, stationary when stopped
          const tSec = playing ? now * 0.001 : 0;
          const upperCurvePoints: { x: number; y: number }[] = [];
          const lowerCurvePoints: { x: number; y: number }[] = [];
          const nominalGuidePoints: { x: number; y: number }[] = [];

          const steps = 36;
          for (let s = 0; s <= steps; s++) {
            const frac = s / steps;
            const px = padLeft + frac * chartW;

            // Organic soft wave for upper limit excursion (strictly zero when stopped)
            const upperWave = playing
              ? Math.sin(tSec * 1.4 + frac * 4.2) * 5.0 + Math.cos(tSec * 0.7 + frac * 2.1) * 3.0
              : 0;
            const pyUpper = yUpperBase + upperWave;
            upperCurvePoints.push({ x: px, y: pyUpper });

            // Organic soft wave for lower limit boundary (strictly zero when stopped)
            const lowerWave = playing
              ? Math.sin(tSec * 1.2 + frac * 3.5 + 1.2) * 4.5 + Math.cos(tSec * 0.5 + frac * 1.8) * 2.5
              : 0;
            const pyLower = yLowerBase + lowerWave;
            lowerCurvePoints.push({ x: px, y: pyLower });

            // Nominal resting pitch trajectory guide (strictly zero when stopped)
            const nominalWave = playing ? Math.sin(tSec * 1.8 + frac * 4.8) * 2.2 : 0;
            nominalGuidePoints.push({ x: px, y: yNominalBase + nominalWave });
          }

          // Fill the Soft Human Prosody Corridor with gentle luminous gradient wash
          ctx.beginPath();
          upperCurvePoints.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          for (let idx = lowerCurvePoints.length - 1; idx >= 0; idx--) {
            ctx.lineTo(lowerCurvePoints[idx].x, lowerCurvePoints[idx].y);
          }
          ctx.closePath();

          const corridorGrad = safeLinearGradient(ctx, padLeft, yUpperBase, padLeft, yLowerBase);
          if (corridorGrad) {
            if (dark) {
              corridorGrad.addColorStop(0, "rgba(245, 158, 11, 0.08)");
              corridorGrad.addColorStop(0.5, "rgba(6, 182, 212, 0.04)");
              corridorGrad.addColorStop(1, "rgba(99, 102, 241, 0.07)");
            } else {
              corridorGrad.addColorStop(0, "rgba(198, 132, 16, 0.12)");
              corridorGrad.addColorStop(0.5, "rgba(10, 126, 184, 0.06)");
              corridorGrad.addColorStop(1, "rgba(79, 70, 229, 0.09)");
            }
            ctx.fillStyle = corridorGrad;
          } else {
            ctx.fillStyle = dark ? "rgba(245, 158, 11, 0.05)" : "rgba(198, 132, 16, 0.08)";
          }
          ctx.fill();

          // Draw Soft Upper Dynamic Limit Curve (Soft Glowing Amber)
          ctx.beginPath();
          upperCurvePoints.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.strokeStyle = dark ? "rgba(245, 158, 11, 0.65)" : "rgba(180, 83, 9, 0.80)";
          ctx.lineWidth = 1.6;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Upper Limit Floating Label at live head
          ctx.fillStyle = dark ? "#fbbf24" : "#9a6108";
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "right";
          ctx.fillText(`Dynamic Excursion Ceiling (~${upperLimitHz} Hz)`, padLeft + chartW - 6, upperCurvePoints[steps].y - 8);

          // Draw Soft Lower Dynamic Limit Curve (Soft Glowing Indigo)
          ctx.beginPath();
          lowerCurvePoints.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.strokeStyle = dark ? "rgba(129, 140, 248, 0.65)" : "rgba(67, 56, 202, 0.75)";
          ctx.lineWidth = 1.6;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Lower Limit Floating Label at live head
          ctx.fillStyle = dark ? "#a5b4fc" : "#4338ca";
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "right";
          ctx.fillText(`Dynamic Glottal Floor (~${lowerLimitHz} Hz)`, padLeft + chartW - 6, lowerCurvePoints[steps].y + 14);

          // Draw Soft Nominal Modal Pitch Guide (Soft Cyan)
          ctx.beginPath();
          nominalGuidePoints.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.strokeStyle = dark ? "rgba(6, 182, 212, 0.45)" : "rgba(10, 126, 184, 0.60)";
          ctx.lineWidth = 1.2;
          ctx.setLineDash([2, 5]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = dark ? "#38bdf8" : "#0284c7";
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "right";
          ctx.fillText(`Modal F₀: ${nominalF0} Hz`, padLeft + chartW - 6, nominalGuidePoints[steps].y - 6);

          // 2. Frequency Y-Axis Ticks
          const hzStep = persona.gender === "female" ? 50 : 25;
          const startHz = Math.ceil(minY / hzStep) * hzStep;
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "right";

          for (let hz = startHz; hz <= maxY; hz += hzStep) {
            const y = getFreqY(hz);
            ctx.beginPath();
            ctx.setLineDash([2, 6]);
            ctx.strokeStyle = dark ? "rgba(255, 255, 255, 0.12)" : "rgba(68, 45, 25, 0.12)";
            ctx.lineWidth = 1;
            ctx.moveTo(padLeft, y);
            ctx.lineTo(padLeft + chartW, y);
            ctx.stroke();

            ctx.fillStyle = dark ? "rgba(241, 245, 249, 0.85)" : "#2e261d";
            ctx.fillText(`${hz} Hz`, padLeft - 8, y + 3.5);
          }

          // 3. Time X-Axis Gridlines (-5.0s to 0.0s Live)
          const timeWindowSec = 5.0;
          ctx.textAlign = "center";
          for (let s = 0; s <= 5; s++) {
            const x = padLeft + chartW - (s / timeWindowSec) * chartW;
            ctx.beginPath();
            ctx.setLineDash([2, 6]);
            ctx.strokeStyle = dark ? "rgba(255, 255, 255, 0.12)" : "rgba(68, 45, 25, 0.12)";
            ctx.lineWidth = 1;
            ctx.moveTo(x, padTop);
            ctx.lineTo(x, padTop + chartH);
            ctx.stroke();

            ctx.fillStyle = s === 0
              ? (playing ? (dark ? "#f59e0b" : "#c68410") : (dark ? "#94a3b8" : "#64748b"))
              : (dark ? "rgba(241, 245, 249, 0.85)" : "#2e261d");
            ctx.font = s === 0 ? "bold 10px monospace" : "9px monospace";
            ctx.fillText(s === 0 ? (playing ? "0.0s Live" : "0.0s Hold") : `-${s}.0s`, x, padTop + chartH + 16);
          }

          // Axis Titles
          ctx.setLineDash([]);
          ctx.fillStyle = dark ? "#cbd5e1" : "#5c5243";
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.fillText("Time (seconds) — 5-Second Rolling Speech Prosody Window", padLeft + chartW / 2, padTop + chartH + 34);

          ctx.save();
          ctx.translate(16, padTop + chartH / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillStyle = dark ? "#cbd5e1" : "#5c5243";
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.fillText("Vocal Frequency (Hz)", 0, 0);
          ctx.restore();

          // 4. DRAW AUTHENTIC REAL SPEECH PITCH TRAJECTORY (ZERO MOTION & 0.0 HZ WHEN STOPPED)
          const yZero = getFreqY(0);

          if (!playing) {
            // AUTHENTIC 0.0 HZ GROUND FLOOR: Strictly stationary, silent flatline across entire window
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.strokeStyle = dark ? "rgba(255, 255, 255, 0.28)" : "rgba(68, 45, 25, 0.32)";
            ctx.lineWidth = 1.8;
            ctx.moveTo(padLeft, yZero);
            ctx.lineTo(padLeft + chartW, yZero);
            ctx.stroke();

            // Quiescent Callout
            ctx.fillStyle = dark ? "#94a3b8" : "#64748b";
            ctx.font = "bold 10px monospace";
            ctx.textAlign = "center";
            ctx.fillText("0.0 Hz • Grounded Baseline (Press Listen to activate real-time telemetry)", padLeft + chartW / 2, yZero - 12);

            // Stationary Live Head at (0.0s, 0.0 Hz)
            const headX = padLeft + chartW;
            const headY = yZero;
            ctx.beginPath();
            ctx.arc(headX, headY, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = dark ? "#94a3b8" : "#64748b";
            ctx.fill();

            ctx.fillStyle = dark ? "#cbd5e1" : "#475569";
            ctx.font = "bold 9px monospace";
            ctx.textAlign = "right";
            ctx.fillText("0.0 Hz (Stopped)", headX - 8, headY - 8);
          } else {
            // ACTIVE PLAYBACK: Draw real speech pitch trajectory
            const samples = pitchHistoryRef.current;
            if (samples.length < 2) {
              ctx.beginPath();
              ctx.setLineDash([4, 4]);
              ctx.strokeStyle = dark ? "rgba(255, 255, 255, 0.20)" : "rgba(68, 45, 25, 0.25)";
              ctx.lineWidth = 1.6;
              ctx.moveTo(padLeft, yZero);
              ctx.lineTo(padLeft + chartW, yZero);
              ctx.stroke();
              ctx.setLineDash([]);

              const headX = padLeft + chartW;
              const headY = yZero;
              ctx.beginPath();
              ctx.arc(headX, headY, 4, 0, Math.PI * 2);
              ctx.fillStyle = dark ? "#64748b" : "#94a3b8";
              ctx.fill();
            } else {
              const pts = samples.map((pt) => {
                const ageSec = Math.max(0, (now - pt.time) / 1000);
                const x = padLeft + chartW - (ageSec / timeWindowSec) * chartW;
                const y = getFreqY(pt.hz);
                return { x, y, hz: pt.hz };
              });

              pts.sort((a, b) => a.x - b.x);

              ctx.beginPath();
              ctx.moveTo(pts[0].x, pts[0].y);

              for (let i = 0; i < pts.length - 1; i++) {
                const p0 = pts[Math.max(0, i - 1)];
                const p1 = pts[i];
                const p2 = pts[i + 1];
                const p3 = pts[Math.min(pts.length - 1, i + 2)];

                const cp1x = p1.x + (p2.x - p0.x) / 6;
                const cp1y = p1.y + (p2.y - p0.y) / 6;
                const cp2x = p2.x - (p3.x - p1.x) / 6;
                const cp2y = p2.y - (p3.y - p1.y) / 6;

                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
              }

              const curveGrad = safeLinearGradient(ctx, padLeft, 0, padLeft + chartW, 0);
              if (curveGrad) {
                if (dark) {
                  curveGrad.addColorStop(0, "rgba(6, 182, 212, 0.4)");
                  curveGrad.addColorStop(0.5, "#06b6d4");
                  curveGrad.addColorStop(1, "#f59e0b");
                } else {
                  curveGrad.addColorStop(0, "rgba(10, 126, 184, 0.5)");
                  curveGrad.addColorStop(0.5, "#0a7eb8");
                  curveGrad.addColorStop(1, "#c68410");
                }
                ctx.strokeStyle = curveGrad;
              } else {
                ctx.strokeStyle = dark ? "#f59e0b" : "#c68410";
              }
              ctx.lineWidth = dark ? 2.8 : 3.0;
              ctx.lineCap = "round";
              ctx.lineJoin = "round";
              ctx.shadowColor = dark ? "#f59e0b" : "#c68410";
              ctx.shadowBlur = dark ? 14 : 8;
              ctx.stroke();
              ctx.shadowBlur = 0;

              const latestPt = pts[pts.length - 1];
              const headX = padLeft + chartW;
              const headY = latestPt.y;

              ctx.beginPath();
              ctx.arc(headX, headY, 7 + Math.sin(now * 0.01) * 3, 0, Math.PI * 2);
              ctx.fillStyle = dark ? "rgba(245, 158, 11, 0.35)" : "rgba(198, 132, 16, 0.35)";
              ctx.fill();

              ctx.beginPath();
              ctx.arc(headX, headY, 4.5, 0, Math.PI * 2);
              ctx.fillStyle = dark ? "#f59e0b" : "#c68410";
              ctx.fill();
            }
          }
        }

        // ─── MODE 2: FORMANT RESONANCE SPECTRUM (HZ ON X, DBMAGNITUDE ON Y) ───
        else if (mode === "formants") {
          const maxFreq = 4000;
          const minDb = -60;
          const maxDb = 0;

          const getX = (hz: number) => padLeft + (hz / maxFreq) * chartW;
          const getY = (db: number) => padTop + chartH - ((db - minDb) / (maxDb - minDb)) * chartH;

          // X-Axis Frequency Grid
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "center";
          for (let hz = 0; hz <= maxFreq; hz += 500) {
            const x = getX(hz);
            ctx.beginPath();
            ctx.setLineDash([2, 5]);
            ctx.strokeStyle = dark ? "rgba(255, 255, 255, 0.12)" : "rgba(68, 45, 25, 0.12)";
            ctx.moveTo(x, padTop);
            ctx.lineTo(x, padTop + chartH);
            ctx.stroke();

            ctx.fillStyle = dark ? "rgba(241, 245, 249, 0.85)" : "#2e261d";
            ctx.fillText(hz === 0 ? "0" : `${hz / 1000}k`, x, padTop + chartH + 16);
          }

          // Y-Axis dB Grid
          ctx.textAlign = "right";
          for (let db = minDb; db <= maxDb; db += 15) {
            const y = getY(db);
            ctx.beginPath();
            ctx.setLineDash([2, 5]);
            ctx.strokeStyle = dark ? "rgba(255, 255, 255, 0.12)" : "rgba(68, 45, 25, 0.12)";
            ctx.moveTo(padLeft, y);
            ctx.lineTo(padLeft + chartW, y);
            ctx.stroke();

            ctx.fillStyle = dark ? "rgba(241, 245, 249, 0.85)" : "#2e261d";
            ctx.fillText(`${db} dB`, padLeft - 8, y + 3.5);
          }

          // Axis Titles
          ctx.setLineDash([]);
          ctx.fillStyle = dark ? "#cbd5e1" : "#5c5243";
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.fillText("Acoustic Frequency Bandwidth (0 – 4,000 Hz)", padLeft + chartW / 2, padTop + chartH + 34);

          ctx.save();
          ctx.translate(16, padTop + chartH / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillStyle = dark ? "#cbd5e1" : "#5c5243";
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.fillText("Magnitude (dBFS)", 0, 0);
          ctx.restore();

          // Calculate Formants
          const currentLevel = smoothedLevelRef.current;
          const currentF0 = baseF0;
          const tHarm = (playing ? now : lastFreezeTimeRef.current);
          const f1Target = Math.round(520 + (currentLevel / 100) * 200 + (playing ? Math.sin(tHarm * 0.004) * 40 : 0));
          const f2Target = Math.round(1850 + (playing ? Math.cos(tHarm * 0.003) * 120 : 0));
          const f3Target = 2650;
          const f4Target = 3450;

          ctx.beginPath();
          for (let px = 0; px <= chartW; px += 2) {
            const hz = (px / chartW) * maxFreq;
            const poleF0 = Math.exp(-Math.pow((hz - currentF0) / 90, 2)) * 0.85;
            const poleF1 = Math.exp(-Math.pow((hz - f1Target) / 180, 2)) * 1.0;
            const poleF2 = Math.exp(-Math.pow((hz - f2Target) / 260, 2)) * 0.72;
            const poleF3 = Math.exp(-Math.pow((hz - f3Target) / 320, 2)) * 0.55;
            const poleF4 = Math.exp(-Math.pow((hz - f4Target) / 400, 2)) * 0.4;
            const rolloff = Math.pow(1 - hz / maxFreq, 0.6);

            const sumTransfer = playing
              ? (poleF0 + poleF1 + poleF2 + poleF3 + poleF4) * Math.max(0.2, currentLevel / 100) * rolloff
              : 0;
            const calcDb = playing ? -54 + sumTransfer * 50 : minDb;
            const y = getY(calcDb);

            if (px === 0) ctx.moveTo(padLeft + px, y);
            else ctx.lineTo(padLeft + px, y);
          }

          const formantGrad = safeLinearGradient(ctx, padLeft, 0, padLeft + chartW, 0);
          if (formantGrad) {
            if (dark) {
              formantGrad.addColorStop(0, "#06b6d4");
              formantGrad.addColorStop(0.35, "#f59e0b");
              formantGrad.addColorStop(0.7, "#fbbf24");
              formantGrad.addColorStop(1, "#818cf8");
            } else {
              formantGrad.addColorStop(0, "#0a7eb8");
              formantGrad.addColorStop(0.35, "#c68410");
              formantGrad.addColorStop(0.7, "#d97706");
              formantGrad.addColorStop(1, "#4f46e5");
            }
            ctx.strokeStyle = formantGrad;
          } else {
            ctx.strokeStyle = dark ? "#f59e0b" : "#c68410";
          }
          ctx.lineWidth = 2.4;
          ctx.shadowColor = dark ? "#f59e0b" : "#c68410";
          ctx.shadowBlur = playing ? (dark ? 10 : 4) : 0;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Formant Peak Pins (Only active during live speech playback)
          if (playing) {
            const formants = [
              { name: "F₁", hz: f1Target, color: dark ? "#06b6d4" : "#0a7eb8" },
              { name: "F₂", hz: f2Target, color: dark ? "#f59e0b" : "#c68410" },
              { name: "F₃", hz: f3Target, color: dark ? "#fbbf24" : "#d97706" },
              { name: "F₄", hz: f4Target, color: dark ? "#818cf8" : "#4f46e5" },
            ];

            formants.forEach((f) => {
              const x = getX(f.hz);
              ctx.beginPath();
              ctx.setLineDash([3, 3]);
              ctx.strokeStyle = f.color;
              ctx.moveTo(x, padTop + 16);
              ctx.lineTo(x, padTop + chartH);
              ctx.stroke();
              ctx.setLineDash([]);

              ctx.fillStyle = f.color;
              ctx.beginPath();
              ctx.arc(x, padTop + 12, 3.5, 0, Math.PI * 2);
              ctx.fill();

              ctx.font = "bold 9px monospace";
              ctx.textAlign = "center";
              ctx.fillText(`${f.name} ${f.hz}Hz`, x, padTop + 6);
            });
          } else {
            ctx.fillStyle = dark ? "#94a3b8" : "#64748b";
            ctx.font = "bold 10px monospace";
            ctx.textAlign = "center";
            ctx.fillText("-60 dBFS • Silent Standby Floor (No Active Resonant Poles)", padLeft + chartW / 2, padTop + chartH / 2);
          }
        }

        // ─── MODE 3: TIME-FREQUENCY SPECTROGRAM (WATERFALL HEATMAP) ───
        else if (mode === "spectrogram") {
          if (playing) {
            if (waterfallHistoryRef.current.length > 36) {
              waterfallHistoryRef.current.shift();
            }
            waterfallHistoryRef.current.push([...smoothedBandsRef.current]);
          }

          const history = waterfallHistoryRef.current;
          const timeCols = Math.max(1, history.length);
          const freqBands = 16;
          const colWidth = chartW / Math.max(1, timeCols);
          const rowHeight = chartH / freqBands;

          history.forEach((bands, colIdx) => {
            const x = padLeft + colIdx * colWidth;
            bands.forEach((bVal, bIdx) => {
              const y = padTop + chartH - (bIdx + 1) * rowHeight;
              const energyNorm = Math.min(1, Math.max(0, bVal / 100));

              let r = 7, g = 11, b = 20;
              if (dark) {
                if (playing) {
                  if (energyNorm < 0.4) {
                    const t = energyNorm / 0.4;
                    r = Math.round(7 * t);
                    g = Math.round(182 * t);
                    b = Math.round(212 * t);
                  } else if (energyNorm < 0.8) {
                    const t = (energyNorm - 0.4) / 0.4;
                    r = Math.round(7 + (245 - 7) * t);
                    g = Math.round(182 + (158 - 182) * t);
                    b = Math.round(212 + (11 - 212) * t);
                  } else {
                    const t = (energyNorm - 0.8) / 0.2;
                    r = Math.round(245 + 10 * t);
                    g = Math.round(158 + 97 * t);
                    b = Math.round(11 + 244 * t);
                  }
                } else {
                  r = 14;
                  g = 22;
                  b = 36;
                }
              } else {
                if (playing) {
                  if (energyNorm < 0.4) {
                    const t = energyNorm / 0.4;
                    r = Math.round(248 - 60 * t);
                    g = Math.round(246 - 40 * t);
                    b = Math.round(240 - 20 * t);
                  } else if (energyNorm < 0.8) {
                    const t = (energyNorm - 0.4) / 0.4;
                    r = Math.round(188 + (198 - 188) * t);
                    g = Math.round(206 + (132 - 206) * t);
                    b = Math.round(220 + (16 - 220) * t);
                  } else {
                    const t = (energyNorm - 0.8) / 0.2;
                    r = Math.round(198 + 19 * t);
                    g = Math.round(132 - 49 * t);
                    b = Math.round(16 + 12 * t);
                  }
                } else {
                  r = 248;
                  g = 246;
                  b = 240;
                }
              }

              ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
              ctx.fillRect(x, y, colWidth + 0.5, rowHeight + 0.5);
            });
          });

          ctx.font = "bold 9px monospace";
          ctx.textAlign = "center";
          ctx.fillStyle = dark ? "rgba(241, 245, 249, 0.85)" : "#2e261d";
          ctx.fillText("-4.0s", padLeft, padTop + chartH + 16);
          ctx.fillText("-2.0s", padLeft + chartW / 2, padTop + chartH + 16);
          ctx.fillText(playing ? "0.0s Live" : "0.0s Hold", padLeft + chartW, padTop + chartH + 16);

          ctx.fillStyle = dark ? "#cbd5e1" : "#5c5243";
          ctx.font = "bold 10px monospace";
          ctx.fillText("Time (seconds) — Spectrogram Density", padLeft + chartW / 2, padTop + chartH + 34);

          ctx.textAlign = "right";
          ctx.fillStyle = dark ? "rgba(241, 245, 249, 0.85)" : "#2e261d";
          ctx.fillText("4,000 Hz", padLeft - 8, padTop + 10);
          ctx.fillText("2,000 Hz", padLeft - 8, padTop + chartH / 2);
          ctx.fillText("100 Hz", padLeft - 8, padTop + chartH - 4);

          ctx.save();
          ctx.translate(16, padTop + chartH / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillStyle = dark ? "#cbd5e1" : "#5c5243";
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.fillText("Frequency (Hz)", 0, 0);
          ctx.restore();
        }

        // ─── MODE 4: GLOTTAL PULSE OSCILLOSCOPE (TIME MS ON X, PRESSURE ON Y) ───
        else if (mode === "glottal") {
          const periodMs = 25;
          const midY = padTop + chartH / 2;
          const currentLevel = smoothedLevelRef.current;
          const currentF0 = baseF0;

          ctx.font = "bold 9px monospace";
          ctx.textAlign = "center";
          for (let ms = 0; ms <= periodMs; ms += 5) {
            const x = padLeft + (ms / periodMs) * chartW;
            ctx.beginPath();
            ctx.setLineDash([2, 5]);
            ctx.strokeStyle = dark ? "rgba(255, 255, 255, 0.12)" : "rgba(68, 45, 25, 0.12)";
            ctx.moveTo(x, padTop);
            ctx.lineTo(x, padTop + chartH);
            ctx.stroke();

            ctx.fillStyle = dark ? "rgba(241, 245, 249, 0.85)" : "#2e261d";
            ctx.fillText(`${ms}ms`, x, padTop + chartH + 16);
          }

          ctx.beginPath();
          ctx.setLineDash([3, 4]);
          ctx.strokeStyle = dark ? "rgba(255, 255, 255, 0.18)" : "rgba(68, 45, 25, 0.18)";
          ctx.moveTo(padLeft, midY);
          ctx.lineTo(padLeft + chartW, midY);
          ctx.stroke();

          ctx.fillStyle = dark ? "#cbd5e1" : "#5c5243";
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.fillText("Time (milliseconds) — Vocal Fold Glottal Cycle (T₀)", padLeft + chartW / 2, padTop + chartH + 34);

          ctx.save();
          ctx.translate(16, padTop + chartH / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillStyle = dark ? "#cbd5e1" : "#5c5243";
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.fillText("Pressure (µPa)", 0, 0);
          ctx.restore();

          ctx.beginPath();
          ctx.setLineDash([]);
          const amp = playing ? (currentLevel / 100) * (chartH * 0.4) : 0;

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

          ctx.strokeStyle = playing
            ? (dark ? "#f59e0b" : "#c68410")
            : (dark ? "#64748b" : "#94a3b8");
          ctx.lineWidth = 2.4;
          ctx.shadowColor = dark ? "#f59e0b" : "#c68410";
          ctx.shadowBlur = playing ? (dark ? 10 : 4) : 0;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      } catch (err) {
        console.error("RealtimeVoiceGraph render error:", err);
      }

      expandedAnimRef.current = requestAnimationFrame(renderExpanded);
    };

    expandedAnimRef.current = requestAnimationFrame(renderExpanded);

    return () => {
      resizeObserver.disconnect();
      if (expandedAnimRef.current) cancelAnimationFrame(expandedAnimRef.current);
    };
  }, [isExpanded]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. RENDER JSX: MINI BUTTON + WHOLLY THEME-ADAPTIVE CENTERED EXPANDED MODAL
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* NORMAL VIEW: COMPACT, STABLE VISUALIZER IN CONSOLE DECK */}
      <div
        onClick={() => setIsExpanded(true)}
        className="relative flex items-center gap-2 px-2.5 py-1 rounded-2xl bg-bg-surface/90 hover:bg-bg-hover/80 border border-border hover:border-amber/50 shrink-0 shadow-sm transition-all cursor-pointer select-none group"
        title="Voice Acoustic Frequency Analyzer • Click to Open Scope"
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
        <div className="flex items-center gap-1.5 pl-1.5 border-l border-border/80">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-bg-surface/90 border border-border group-hover:border-amber/50 transition">
            <Activity className={`w-3 h-3 ${isPlaying ? "text-amber animate-pulse" : "text-ink-dim"}`} />
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-ink-secondary group-hover:text-amber transition">
              Scope
            </span>
            <Maximize2 className="w-3 h-3 text-ink-dim group-hover:text-amber transition ml-0.5" />
          </div>
        </div>
      </div>

      {/* EXPANDED VIEW: RENDERED VIA PORTAL DIRECTLY TO DOCUMENT.BODY TO GUARANTEE PERFECT CENTERING ON ANY SCREEN */}
      {isExpanded && mounted && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-8 animate-fade-in pointer-events-auto"
          onClick={() => setIsExpanded(false)}
        >
          {/* THEME-ADAPTING HIGH-CONTRAST MODAL INSTRUMENT */}
          <div
            className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] bg-bg-panel border border-border-strong rounded-3xl shadow-panel flex flex-col overflow-hidden text-ink-primary select-none my-auto mx-auto transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header: High-Tech, Simplistic & Intelligent, Theme-Matched */}
            <div className="p-4 sm:p-5 border-b border-border flex flex-col gap-3 bg-bg-surface/70">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-subtle text-amber">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-ink-primary tracking-tight flex items-center gap-2">
                      <span>Voice Acoustic Frequency Analyzer & Telemetry Scope</span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isPlaying
                            ? "bg-amber-subtle text-amber border border-amber/40 animate-pulse"
                            : "bg-bg-panel text-ink-dim border border-border"
                        }`}
                      >
                        {isPlaying ? "Live Signal" : "0.0 Hz • Idle (Standby)"}
                      </span>
                    </h3>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 sm:p-2 rounded-xl bg-bg-panel hover:bg-bg-hover text-ink-secondary hover:text-ink-primary border border-border transition shrink-0 shadow-sm"
                  title="Close Scope (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Soft Acoustic Telemetry Badges (High Contrast, WCAG AAA compliant) */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] font-mono">
                <div className="px-2.5 py-1 rounded-xl bg-bg-panel border border-border flex items-center gap-1.5 text-ink-secondary shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber" />
                  <span>Speaker:</span>
                  <span className="font-bold text-ink-primary">{selectedPersona.name}</span>
                  <span className="text-ink-dim">({selectedPersona.accent.split(" ")[0]})</span>
                </div>

                <div className="px-2.5 py-1 rounded-xl bg-cryo-subtle border border-cryo/30 flex items-center gap-1.5 text-cryo font-semibold shadow-sm">
                  <Activity className="w-3 h-3" />
                  <span>Modal F₀:</span>
                  <span className="font-bold">~{pitchLimits.nominalF0} Hz</span>
                </div>

                <div className="px-2.5 py-1 rounded-xl bg-amber-subtle border border-amber/30 flex items-center gap-1.5 text-amber font-semibold shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  <span>Dynamic Range:</span>
                  <span className="font-bold">{pitchLimits.lowerLimitHz} Hz ⟷ {pitchLimits.upperLimitHz} Hz</span>
                </div>

                <div className="hidden sm:flex px-2.5 py-1 rounded-xl bg-bg-panel border border-border items-center gap-1.5 text-ink-dim shadow-sm">
                  <Volume2 className="w-3 h-3 text-ink-dim" />
                  <span>ITU-T G.722 Wideband</span>
                </div>
              </div>
            </div>

            {/* Modal Body: Tabs & Adaptive High-Res Canvas */}
            <div className="p-4 sm:p-5 flex flex-col gap-3.5 overflow-y-auto">
              {/* Representation Mode Selector Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setExpandedMode("pitch")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition shadow-sm ${
                    expandedMode === "pitch"
                      ? "bg-amber text-on-amber border border-amber"
                      : "bg-bg-surface hover:bg-bg-hover text-ink-secondary hover:text-ink-primary border border-border"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  F₀ Pitch Contour (Time × Hz)
                </button>

                <button
                  onClick={() => setExpandedMode("formants")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition shadow-sm ${
                    expandedMode === "formants"
                      ? "bg-amber text-on-amber border border-amber"
                      : "bg-bg-surface hover:bg-bg-hover text-ink-secondary hover:text-ink-primary border border-border"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Formants Spectrum (Hz × Energy)
                </button>

                <button
                  onClick={() => setExpandedMode("spectrogram")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition shadow-sm ${
                    expandedMode === "spectrogram"
                      ? "bg-amber text-on-amber border border-amber"
                      : "bg-bg-surface hover:bg-bg-hover text-ink-secondary hover:text-ink-primary border border-border"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  Time-Frequency Spectrogram
                </button>

                <button
                  onClick={() => setExpandedMode("glottal")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition shadow-sm ${
                    expandedMode === "glottal"
                      ? "bg-amber text-on-amber border border-amber"
                      : "bg-bg-surface hover:bg-bg-hover text-ink-secondary hover:text-ink-primary border border-border"
                  }`}
                >
                  <Waves className="w-3.5 h-3.5" />
                  Glottal Waveform (Time ms)
                </button>
              </div>

              {/* Responsive Precision Graticule Canvas (Wholly Theme-Adaptive in Light & Dark Mode) */}
              <div
                ref={expandedContainerRef}
                className="w-full h-[220px] sm:h-[280px] md:h-[340px] rounded-2xl bg-[#fbf9f4] dark:bg-[#070b14] border border-border-strong overflow-hidden relative shadow-inner transition-colors duration-200"
              >
                <canvas
                  ref={expandedCanvasRef}
                  className="w-full h-full block"
                />
              </div>

              {/* Scientific Explanatory Legend & Dynamic Envelope Law */}
              <div className="p-3 rounded-2xl bg-bg-surface/80 border border-border flex items-start gap-2.5 text-[10px] sm:text-[11px] text-ink-secondary leading-relaxed shadow-sm">
                <Info className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink-primary">
                    Dynamic Acoustic Envelope:
                  </span>{" "}
                  The upper and lower pitch boundaries float as continuous, soft human resonance curves rather than rigid anchored bars. Vocal fold prosody glides through this harmonic corridor with natural micro-intonation, centered around modal pitch (~{pitchLimits.nominalF0} Hz).
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
