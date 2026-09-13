"use client";

import React, { useState } from "react";
import { calculatePumpdown } from "@/lib/physics";
import { Gauge, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";

export function VacuumPumpdownSimulator() {
  const [volume, setVolume] = useState<number>(100); // Liters
  const [speed, setSpeed] = useState<number>(40); // m^3/h
  const [leakRate, setLeakRate] = useState<number>(0.002); // mbar*L/s
  const [targetP, setTargetP] = useState<number>(0.05); // mbar

  const results = calculatePumpdown({
    chamberVolumeLiters: volume,
    pumpSpeedM3H: speed,
    leakRateMbarL_s: leakRate,
    targetPressureMbar: targetP,
  });

  // SVG Chart
  const svgWidth = 500;
  const svgHeight = 220;
  const margin = { top: 15, right: 20, bottom: 35, left: 55 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  const maxTime = results.curvePoints.length > 0 ? results.curvePoints[results.curvePoints.length - 1].timeMin : 10;
  const minLogP = -3; // 0.001 mbar
  const maxLogP = 3.1; // ~1013 mbar

  const tToX = (t: number) => margin.left + (t / maxTime) * plotWidth;
  const pToY = (p: number) => {
    const logP = Math.log10(Math.max(0.0005, p));
    const norm = (logP - minLogP) / (maxLogP - minLogP);
    return margin.top + (1 - Math.max(0, Math.min(1, norm))) * plotHeight;
  };

  const pathPoints = results.curvePoints.map((pt) => `${tToX(pt.timeMin).toFixed(1)},${pToY(pt.pressureMbar).toFixed(1)}`);
  const curvePath = pathPoints.length > 0 ? `M ${pathPoints.join(" L ")}` : "";

  return (
    <div className="instrument-card rounded-2xl p-5 my-6 border border-hairline bg-bg-panel backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-hairline gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cryo animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-cryo">
              Simulator 04 • Chapters 06 & 11
            </span>
          </div>
          <h3 className="text-lg font-medium text-ink-primary mt-1">
            Chamber Vacuum Pump-Down Simulator
          </h3>
        </div>
        <div className="text-xs font-mono text-ink-muted bg-bg-hover px-3 py-1.5 rounded-lg border border-hairline">
          P(t) = (P₀ - P_ult) · e^(-S·t/V) + P_ult
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sliders (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-bg-inset p-3.5 rounded-xl border border-hairline">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-ink-secondary">Vessel Chamber Volume</span>
              <span className="font-mono text-cryo font-bold">{volume} Liters</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-[#7FD4FF] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-ink-dim mt-1 font-mono">
              <span>AFD R&D (10–20 L)</span>
              <span>Pilot (50–100 L)</span>
              <span>Production (500 L)</span>
            </div>
          </div>

          <div className="bg-bg-inset p-3.5 rounded-xl border border-hairline">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-ink-secondary">Pump Displacement Speed (S)</span>
              <span className="font-mono text-amber-bright font-bold">{speed} m³/h</span>
            </div>
            <input
              type="range"
              min="10"
              max="250"
              step="5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-[#E5A93C] cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg-inset p-3 rounded-xl border border-hairline">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-ink-secondary">Leak Rate</span>
                <span className="font-mono text-ink-primary">{leakRate}</span>
              </div>
              <input
                type="range"
                min="0.0005"
                max="0.01"
                step="0.0005"
                value={leakRate}
                onChange={(e) => setLeakRate(Number(e.target.value))}
                className="w-full accent-[#7FD4FF] cursor-pointer"
              />
              <span className="text-[9px] text-ink-dim font-mono">mbar·L/s</span>
            </div>

            <div className="bg-bg-inset p-3 rounded-xl border border-hairline">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-ink-secondary">Target Vacuum</span>
                <span className="font-mono text-ink-primary">{targetP}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.2"
                step="0.01"
                value={targetP}
                onChange={(e) => setTargetP(Number(e.target.value))}
                className="w-full accent-[#E5A93C] cursor-pointer"
              />
              <span className="text-[9px] text-ink-dim font-mono">mbar</span>
            </div>
          </div>
        </div>

        {/* Live SVG Pumpdown Curve (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div className="bg-bg-inset rounded-xl border border-hairline p-2 relative">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
              {/* Target Line */}
              <line
                x1={margin.left}
                y1={pToY(targetP)}
                x2={margin.left + plotWidth}
                y2={pToY(targetP)}
                stroke="#E5A93C"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <text
                x={margin.left + plotWidth - 5}
                y={pToY(targetP) - 5}
                fill="#E5A93C"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="end"
              >
                Target: {targetP} mbar
              </text>

              {/* Pumpdown Curve */}
              {curvePath && <path d={curvePath} fill="none" stroke="#7FD4FF" strokeWidth="2.5" />}

              {/* Axes */}
              <line
                x1={margin.left}
                y1={margin.top + plotHeight}
                x2={margin.left + plotWidth}
                y2={margin.top + plotHeight}
                stroke="rgba(255,255,255,0.2)"
              />
              <line
                x1={margin.left}
                y1={margin.top}
                x2={margin.left}
                y2={margin.top + plotHeight}
                stroke="rgba(255,255,255,0.2)"
              />

              {/* Labels */}
              <text
                x={margin.left + plotWidth / 2}
                y={margin.top + plotHeight + 25}
                fill="#8A91A0"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
              >
                Time (minutes)
              </text>
              <text
                x={margin.left - 10}
                y={pToY(1000)}
                fill="#8A91A0"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="end"
              >
                1000
              </text>
              <text
                x={margin.left - 10}
                y={pToY(1)}
                fill="#8A91A0"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="end"
              >
                1.0
              </text>
              <text
                x={margin.left - 10}
                y={pToY(0.01)}
                fill="#8A91A0"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="end"
              >
                0.01
              </text>
            </svg>
          </div>

          {/* Time to target readout */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="bg-bg-inset p-3 rounded-xl border border-hairline">
              <div className="text-[11px] text-ink-muted">Time to Target Pressure</div>
              <div className="text-xl font-bold font-mono text-amber-bright">
                {results.timeToTargetMin}{" "}
                <span className="text-xs font-normal text-ink-muted">min</span>
              </div>
              <div className="text-[10px] text-ink-dim font-mono">{results.timeToTargetSec} seconds</div>
            </div>

            <div className="bg-bg-inset p-3 rounded-xl border border-hairline">
              <div className="text-[11px] text-ink-muted">Chamber Tau Constant</div>
              <div className="text-xl font-bold font-mono text-cryo">
                {results.tauSeconds}{" "}
                <span className="text-xs font-normal text-ink-muted">sec</span>
              </div>
              <div className="text-[10px] text-ink-dim font-mono">
                Ult: {results.effectiveUltimateMbar} mbar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
