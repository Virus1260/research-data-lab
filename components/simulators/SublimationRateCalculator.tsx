"use client";

import React, { useState } from "react";
import { calculateSublimationRate } from "@/lib/physics";
import { Zap, Clock, Wind, Flame, Layers } from "lucide-react";

export function SublimationRateCalculator() {
  const [uCoeff, setUCoeff] = useState<number>(35); // W/(m^2*K) typical stirred vacuum contact
  const [area, setArea] = useState<number>(1.2); // m^2 jacket area (~50L vessel)
  const [deltaT, setDeltaT] = useState<number>(25); // °C jacket-to-product delta
  const [iceMass, setIceMass] = useState<number>(15); // kg ice in batch

  const results = calculateSublimationRate({
    heatTransferCoeffU: uCoeff,
    jacketAreaM2: area,
    deltaT_C: deltaT,
    batchWaterMassKg: iceMass,
  });

  // Particle speed factor for visualizer (0.5 to 3.0s duration)
  const animDuration = Math.max(0.4, Math.min(3.0, 3.0 / Math.max(0.1, results.sublimationRateKg_h)));

  return (
    <div className="instrument-card rounded-2xl p-5 my-6 border border-white/10 bg-[#0D0F12]/90 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/10 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-signal animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-signal">
              Simulator 02 • Chapter 11
            </span>
          </div>
          <h3 className="text-lg font-medium text-ink-primary mt-1">
            Sublimation Rate & Heat Flux Calculator
          </h3>
        </div>
        <div className="text-xs font-mono text-ink-muted bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
          Q = U · A · ΔT • ṁ = Q / ΔH_sub
        </div>
      </div>

      {/* Main Grid: Controls + Live Readouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#08090A] p-3.5 rounded-xl border border-white/5">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-ink-secondary flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-signal" /> Heat Transfer Coeff (U)
              </span>
              <span className="font-mono text-amber-bright font-bold">{uCoeff} W/(m²·K)</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              step="1"
              value={uCoeff}
              onChange={(e) => setUCoeff(Number(e.target.value))}
              className="w-full accent-[#E5A93C] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-ink-dim mt-1 font-mono">
              <span>Static bed (15)</span>
              <span>AFD Stirred (30–50)</span>
              <span>High agitation (75)</span>
            </div>
          </div>

          <div className="bg-[#08090A] p-3.5 rounded-xl border border-white/5">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-ink-secondary flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cryo" /> Contact Jacket Area (A)
              </span>
              <span className="font-mono text-cryo font-bold">{area.toFixed(2)} m²</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="5.0"
              step="0.1"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full accent-[#7FD4FF] cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#08090A] p-3.5 rounded-xl border border-white/5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-ink-secondary">ΔT (Jacket - Ice)</span>
                <span className="font-mono text-ink-primary font-bold">{deltaT}°C</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={deltaT}
                onChange={(e) => setDeltaT(Number(e.target.value))}
                className="w-full accent-[#E5A93C] cursor-pointer"
              />
            </div>

            <div className="bg-[#08090A] p-3.5 rounded-xl border border-white/5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-ink-secondary">Batch Ice Mass</span>
                <span className="font-mono text-ink-primary font-bold">{iceMass} kg</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                step="1"
                value={iceMass}
                onChange={(e) => setIceMass(Number(e.target.value))}
                className="w-full accent-[#7FD4FF] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Live Physics Readouts + Animated Flux (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#08090A] p-3.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-signal" /> Heat Duty
              </div>
              <div className="text-xl font-bold font-mono text-amber-bright">
                {results.heatDutyKW} <span className="text-xs font-normal text-ink-muted">kW</span>
              </div>
              <div className="text-[10px] text-ink-dim font-mono">{results.heatDutyWatts} W</div>
            </div>

            <div className="bg-[#08090A] p-3.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
                <Wind className="w-3.5 h-3.5 text-cryo" /> Sublimation Rate
              </div>
              <div className="text-xl font-bold font-mono text-cryo">
                {results.sublimationRateKg_h}{" "}
                <span className="text-xs font-normal text-ink-muted">kg/h</span>
              </div>
              <div className="text-[10px] text-ink-dim font-mono">{results.sublimationRateG_min} g/min</div>
            </div>
          </div>

          {/* Primary Drying Completion Time Hero Card */}
          <div className="bg-[#08090A] p-4 rounded-xl border border-amber-signal/30 relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-signal flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Est. Primary Drying Time
              </span>
              <span className="text-[10px] font-mono text-ink-dim">100% Sublimation</span>
            </div>
            <div className="text-2xl font-mono font-bold text-ink-primary">
              {results.dryingTimeHours} <span className="text-sm font-normal text-ink-muted">hours</span>
            </div>

            {/* Micro Particle Vapor Stream */}
            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-[11px] text-ink-muted font-mono">Vapor Flux Velocity:</span>
              <div className="flex items-center gap-1 overflow-hidden h-4 w-32 px-1 bg-white/5 rounded">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-cryo"
                    style={{
                      animation: `pulse ${animDuration}s ease-in-out infinite`,
                      animationDelay: `${i * (animDuration / 6)}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
