"use client";

import React, { useState } from "react";
import { calculateRefrigerationLoad } from "@/lib/physics";
import { Snowflake, ShieldCheck, AlertTriangle, Zap, Clock } from "lucide-react";

export function RefrigerationLoadCalculator() {
  const [batchMass, setBatchMass] = useState<number>(50); // kg
  const [waterFraction, setWaterFraction] = useState<number>(0.8); // 80% water
  const [freezeTimeMin, setFreezeTimeMin] = useState<number>(90); // 90 minutes

  const results = calculateRefrigerationLoad({
    batchMassKg: batchMass,
    waterFraction: waterFraction,
    freezingTimeMin: freezeTimeMin,
  });

  return (
    <div className="instrument-card rounded-2xl p-5 my-6 border border-hairline bg-bg-panel backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-hairline gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cryo animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-cryo">
              Simulator 03 • Chapter 11
            </span>
          </div>
          <h3 className="text-lg font-medium text-ink-primary mt-1">
            Freezing-Stage Refrigeration Load & Cooling Rate Calculator
          </h3>
        </div>

        {results.isWithinPatentRange ? (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Patent Compliant (0.1–10 °C/min)</span>
          </div>
        ) : (
          <div className="px-3 py-1.5 rounded-lg bg-amber-signal/20 border border-amber-signal text-amber-bright font-mono text-xs font-semibold flex items-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            <span>Outside Hosokawa Patent Optimum</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sliders (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-bg-inset p-3.5 rounded-xl border border-hairline">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-ink-secondary">Total Batch Mass</span>
              <span className="font-mono text-cryo font-bold">{batchMass} kg</span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={batchMass}
              onChange={(e) => setBatchMass(Number(e.target.value))}
              className="w-full accent-[#7FD4FF] cursor-pointer"
            />
          </div>

          <div className="bg-bg-inset p-3.5 rounded-xl border border-hairline">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-ink-secondary">Water Content Fraction</span>
              <span className="font-mono text-amber-bright font-bold">
                {(waterFraction * 100).toFixed(0)}% ({(batchMass * waterFraction).toFixed(1)} kg H2O)
              </span>
            </div>
            <input
              type="range"
              min="0.3"
              max="0.95"
              step="0.05"
              value={waterFraction}
              onChange={(e) => setWaterFraction(Number(e.target.value))}
              className="w-full accent-[#E5A93C] cursor-pointer"
            />
          </div>

          <div className="bg-bg-inset p-3.5 rounded-xl border border-hairline">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-ink-secondary">Target Freezing Time</span>
              <span className="font-mono text-ink-primary font-bold">
                {freezeTimeMin} minutes ({(freezeTimeMin / 60).toFixed(1)} h)
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              step="5"
              value={freezeTimeMin}
              onChange={(e) => setFreezeTimeMin(Number(e.target.value))}
              className="w-full accent-[#7FD4FF] cursor-pointer"
            />
          </div>
        </div>

        {/* Readouts (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg-inset p-3.5 rounded-xl border border-hairline">
              <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-signal" /> Average Refrig Power
              </div>
              <div className="text-2xl font-bold font-mono text-amber-bright">
                {results.avgRefrigerationKW}{" "}
                <span className="text-xs font-normal text-ink-muted">kW</span>
              </div>
              <div className="text-[10px] text-ink-dim font-mono">Heat removal rate</div>
            </div>

            <div className="bg-bg-inset p-3.5 rounded-xl border border-hairline">
              <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
                <Snowflake className="w-3.5 h-3.5 text-cryo" /> Cooling Rate
              </div>
              <div
                className={`text-2xl font-bold font-mono ${
                  results.isWithinPatentRange ? "text-cryo" : "text-amber-signal"
                }`}
              >
                {results.coolingRateC_min}{" "}
                <span className="text-xs font-normal text-ink-muted">°C/min</span>
              </div>
              <div className="text-[10px] text-ink-dim font-mono">Patent: 0.1–10.0 °C/min</div>
            </div>
          </div>

          <div className="bg-bg-inset p-3.5 rounded-xl border border-hairline">
            <div className="text-xs text-ink-muted mb-2 font-mono uppercase tracking-wider">
              Enthalpy Breakdown (Total: {(results.totalHeatRemovedKJ / 1000).toFixed(2)} MJ)
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-ink-secondary">
                <span>Latent Heat of Fusion (334 kJ/kg):</span>
                <span className="text-amber-bright">{results.qLatentFusionKJ} kJ</span>
              </div>
              <div className="flex justify-between text-ink-secondary">
                <span>Sensible Cooling (Liquid + Ice):</span>
                <span className="text-cryo">
                  {results.qSensibleLiquidKJ + results.qSensibleIceKJ} kJ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
