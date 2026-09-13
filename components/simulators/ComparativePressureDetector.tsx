"use client";

import React, { useState } from "react";
import { calculatePiraniVsCapacitanceConvergence } from "@/lib/physics";
import { CheckCircle2, AlertCircle, Sparkles, Activity } from "lucide-react";

export function ComparativePressureDetector() {
  const [progress, setProgress] = useState<number>(0.75); // 0 to 1.0

  const state = calculatePiraniVsCapacitanceConvergence(progress);

  // SVG dimensions
  const svgWidth = 520;
  const svgHeight = 220;
  const margin = { top: 20, right: 30, bottom: 35, left: 55 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  // Generate historical points for plot
  const pointsCap: string[] = [];
  const pointsPir: string[] = [];

  for (let i = 0; i <= 40; i++) {
    const p = i / 40;
    const s = calculatePiraniVsCapacitanceConvergence(p);
    const x = margin.left + p * plotWidth;
    // P ranges from 0.05 to 0.16 mbar
    const normCap = (s.capacitanceMbar - 0.05) / 0.11;
    const normPir = (s.piraniMbar - 0.05) / 0.11;
    const yCap = margin.top + (1 - normCap) * plotHeight;
    const yPir = margin.top + (1 - normPir) * plotHeight;

    pointsCap.push(`${x.toFixed(1)},${yCap.toFixed(1)}`);
    pointsPir.push(`${x.toFixed(1)},${yPir.toFixed(1)}`);
  }

  const currX = margin.left + progress * plotWidth;

  return (
    <div className="instrument-card rounded-2xl p-5 my-6 border border-hairline bg-bg-panel backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-hairline gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cryo animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-cryo">
              Simulator 05 • Chapter 06
            </span>
          </div>
          <h3 className="text-lg font-medium text-ink-primary mt-1">
            Comparative Pressure Manometry (End of Primary Drying Detector)
          </h3>
        </div>

        {state.isEndpointDetected ? (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>Primary Drying Complete</span>
          </div>
        ) : (
          <div className="px-3 py-1.5 rounded-lg bg-amber-signal/15 border border-amber-signal/30 text-amber-bright font-mono text-xs font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>Sublimation in Progress</span>
          </div>
        )}
      </div>

      {/* Interactive Plot */}
      <div className="bg-bg-inset p-3 rounded-xl border border-hairline relative">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((p) => (
            <line
              key={p}
              x1={margin.left + p * plotWidth}
              y1={margin.top}
              x2={margin.left + p * plotWidth}
              y2={margin.top + plotHeight}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="2 2"
            />
          ))}

          {/* Capacitance line (true mechanical pressure) */}
          <path d={`M ${pointsCap.join(" L ")}`} fill="none" stroke="#7FD4FF" strokeWidth="2" />

          {/* Pirani line (gas-composition dependent) */}
          <path d={`M ${pointsPir.join(" L ")}`} fill="none" stroke="#E5A93C" strokeWidth="2.5" />

          {/* Current scrubber vertical needle */}
          <line
            x1={currX}
            y1={margin.top}
            x2={currX}
            y2={margin.top + plotHeight}
            stroke="var(--bg-panel)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Convergence threshold zone (> 0.85) */}
          <rect
            x={margin.left + 0.85 * plotWidth}
            y={margin.top}
            width={0.15 * plotWidth}
            height={plotHeight}
            fill="rgba(16, 185, 129, 0.08)"
            stroke="rgba(16, 185, 129, 0.3)"
            strokeDasharray="2 2"
          />

          {/* Legend */}
          <circle cx={margin.left + 10} cy={margin.top + 10} r="4" fill="#E5A93C" />
          <text x={margin.left + 20} y={margin.top + 14} fill="#E5A93C" fontSize="10" fontFamily="monospace">
            Thermal Pirani Gauge (Reads ~1.6× in H2O vapor)
          </text>

          <circle cx={margin.left + 10} cy={margin.top + 26} r="4" fill="#7FD4FF" />
          <text x={margin.left + 20} y={margin.top + 30} fill="#7FD4FF" fontSize="10" fontFamily="monospace">
            Capacitance Diaphragm Manometer (True Total Pressure)
          </text>
        </svg>

        {/* Scrubber slider */}
        <div className="mt-3 pt-3 border-t border-hairline">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-ink-muted">Drying Cycle Progress:</span>
            <span className="font-mono text-amber-bright font-bold">
              {(progress * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-[#E5A93C] cursor-pointer"
          />
        </div>
      </div>

      {/* Telemetry Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <div className="bg-bg-inset p-3 rounded-xl border border-hairline">
          <div className="text-[11px] text-ink-muted">Pirani Gauge Output</div>
          <div className="text-xl font-bold font-mono text-amber-bright">
            {state.piraniMbar} <span className="text-xs font-normal text-ink-muted">mbar</span>
          </div>
          <div className="text-[10px] text-ink-dim font-mono">Thermal conductivity mode</div>
        </div>

        <div className="bg-bg-inset p-3 rounded-xl border border-hairline">
          <div className="text-[11px] text-ink-muted">Capacitance Manometer</div>
          <div className="text-xl font-bold font-mono text-cryo">
            {state.capacitanceMbar} <span className="text-xs font-normal text-ink-muted">mbar</span>
          </div>
          <div className="text-[10px] text-ink-dim font-mono">Mechanical diaphragm deflection</div>
        </div>

        <div className="bg-bg-inset p-3 rounded-xl border border-hairline">
          <div className="text-[11px] text-ink-muted">Gauge Delta Convergence</div>
          <div
            className={`text-xl font-bold font-mono ${
              state.isEndpointDetected ? "text-emerald-400" : "text-ink-primary"
            }`}
          >
            {state.diffPercent}%
          </div>
          <div className="text-[10px] text-ink-dim font-mono">
            {state.isEndpointDetected ? "Converged (<5% diff)" : "Divergent (active sublimation)"}
          </div>
        </div>
      </div>

      {/* Key AHA takeaway callout */}
      <div className="mt-3 p-3 rounded-xl bg-bg-hover text-xs text-ink-secondary flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-amber-signal shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-ink-primary">Why This Matters: </span>
          Pirani gauges rely on thermal gas transfer, which is 1.6× higher for light water vapor than air. When the Pirani signal sharply plunges down to match the Capacitance gauge, operators know 100% of the ice has sublimed without ever opening the vacuum chamber!
        </div>
      </div>
    </div>
  );
}
