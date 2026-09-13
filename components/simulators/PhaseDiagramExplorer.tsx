"use client";

import React, { useState, useRef } from "react";
import { getWaterPhaseState, WATER_CONSTANTS, getIceSublimationPressureMbar, getWaterVaporPressureMbar } from "@/lib/physics";
import { Activity, ShieldCheck, Thermometer, Gauge, Sparkles } from "lucide-react";

export function PhaseDiagramExplorer() {
  const [tempC, setTempC] = useState<number>(-35); // Default in primary drying zone
  const [pressMbar, setPressMbar] = useState<number>(0.05); // Default in vacuum zone
  const [showWindow, setShowWindow] = useState<boolean>(true);

  const phase = getWaterPhaseState(tempC, pressMbar);

  // SVG Chart boundaries
  const minT = -80;
  const maxT = 80;
  const minLogP = -3; // 0.001 mbar
  const maxLogP = 3.3; // ~2000 mbar

  const svgWidth = 540;
  const svgHeight = 320;
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  const tToX = (t: number) => margin.left + ((t - minT) / (maxT - minT)) * plotWidth;
  const pToY = (p: number) => {
    const logP = Math.log10(Math.max(0.0005, p));
    const normalized = (logP - minLogP) / (maxLogP - minLogP);
    return margin.top + (1 - normalized) * plotHeight;
  };

  const xToT = (x: number) => minT + ((x - margin.left) / plotWidth) * (maxT - minT);
  const yToP = (y: number) => {
    const norm = 1 - (y - margin.top) / plotHeight;
    const logP = minLogP + norm * (maxLogP - minLogP);
    return Math.pow(10, logP);
  };

  const svgRef = useRef<SVGSVGElement | null>(null);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(margin.left, Math.min(margin.left + plotWidth, e.clientX - rect.left));
    const y = Math.max(margin.top, Math.min(margin.top + plotHeight, e.clientY - rect.top));
    setTempC(Math.round(xToT(x)));
    setPressMbar(Number(yToP(y).toFixed(4)));
  };

  // Generate sublimation curve points (-80°C to 0.01°C)
  const subCurvePoints: string[] = [];
  for (let t = -80; t <= 0.01; t += 2) {
    const p = getIceSublimationPressureMbar(t);
    subCurvePoints.push(`${tToX(t).toFixed(1)},${pToY(p).toFixed(1)}`);
  }
  const subCurvePath = `M ${subCurvePoints.join(" L ")}`;

  // Generate vaporization curve points (0.01°C to 80°C)
  const vapCurvePoints: string[] = [];
  for (let t = 0.01; t <= 80; t += 2) {
    const p = getWaterVaporPressureMbar(t);
    vapCurvePoints.push(`${tToX(t).toFixed(1)},${pToY(p).toFixed(1)}`);
  }
  const vapCurvePath = `M ${vapCurvePoints.join(" L ")}`;

  // Melting line (nearly vertical upward from triple point 0.01°C)
  const tpX = tToX(WATER_CONSTANTS.TRIPLE_POINT_TEMP_C);
  const tpY = pToY(WATER_CONSTANTS.TRIPLE_POINT_PRESS_MBAR);
  const meltPath = `M ${tpX},${tpY} L ${tpX - 2},${margin.top}`;

  // Freeze drying target box
  const fdBoxX1 = tToX(-55);
  const fdBoxX2 = tToX(-10);
  const fdBoxY1 = pToY(1.0);
  const fdBoxY2 = pToY(0.01);

  return (
    <div className="instrument-card rounded-2xl p-5 my-6 border border-white/10 bg-[#0D0F12]/90 backdrop-blur-sm">
      {/* Simulator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cryo animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-cryo">
              Simulator 01 • Chapter 02
            </span>
          </div>
          <h3 className="text-lg font-medium text-ink-primary mt-1">
            Water Phase Diagram Explorer (Clausius–Clapeyron Derived)
          </h3>
        </div>

        {/* Live Phase State Badge */}
        <div className="flex items-center gap-2">
          <div
            className="px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition shadow"
            style={{
              borderColor: phase.color,
              backgroundColor: `${phase.color}15`,
              color: phase.color,
            }}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{phase.state}</span>
          </div>

          <button
            onClick={() => setShowWindow(!showWindow)}
            className={`text-[11px] font-mono px-2.5 py-1.5 rounded-lg border transition ${
              showWindow
                ? "bg-amber-signal/15 border-amber-signal text-amber-signal"
                : "bg-white/5 border-white/10 text-ink-muted hover:text-ink-secondary"
            }`}
          >
            Freeze-Dry Zone
          </button>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative bg-[#08090A] rounded-xl border border-white/5 p-2 overflow-hidden select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto cursor-crosshair"
          onPointerDown={handlePointerDown}
        >
          {/* Background Grid */}
          {[-60, -40, -20, 0, 20, 40, 60].map((t) => (
            <line
              key={t}
              x1={tToX(t)}
              y1={margin.top}
              x2={tToX(t)}
              y2={margin.top + plotHeight}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="3 3"
            />
          ))}
          {[-2, -1, 0, 1, 2, 3].map((logP) => {
            const p = Math.pow(10, logP);
            return (
              <line
                key={logP}
                x1={margin.left}
                y1={pToY(p)}
                x2={margin.left + plotWidth}
                y2={pToY(p)}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Freeze Drying Operating Window Overlay */}
          {showWindow && (
            <rect
              x={fdBoxX1}
              y={fdBoxY1}
              width={fdBoxX2 - fdBoxX1}
              height={fdBoxY2 - fdBoxY1}
              fill="rgba(229, 169, 60, 0.12)"
              stroke="#E5A93C"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          )}

          {/* Sublimation Curve */}
          <path d={subCurvePath} fill="none" stroke="#7FD4FF" strokeWidth="2.5" />

          {/* Vaporization Curve */}
          <path d={vapCurvePath} fill="none" stroke="#38BDF8" strokeWidth="2.5" />

          {/* Melting Line */}
          <path d={meltPath} fill="none" stroke="#CBD2DC" strokeWidth="1.5" strokeDasharray="2 2" />

          {/* Region Labels */}
          <text x={tToX(-45)} y={pToY(100)} fill="#7FD4FF" fontSize="12" fontWeight="600" opacity="0.6">
            SOLID (ICE)
          </text>
          <text x={tToX(30)} y={pToY(300)} fill="#38BDF8" fontSize="12" fontWeight="600" opacity="0.6">
            LIQUID
          </text>
          <text x={tToX(10)} y={pToY(0.01)} fill="#A78BFA" fontSize="12" fontWeight="600" opacity="0.6">
            VAPOR
          </text>

          {/* Triple Point Marker */}
          <circle cx={tpX} cy={tpY} r="4.5" fill="#E5A93C" stroke="#FFF" strokeWidth="1.5" />
          <text x={tpX + 8} y={tpY - 4} fill="#E5A93C" fontSize="10" fontFamily="monospace" fontWeight="bold">
            Triple Point (0.01°C, 6.11 mbar)
          </text>

          {/* Current Operating Point */}
          <circle
            cx={tToX(tempC)}
            cy={pToY(pressMbar)}
            r="7"
            fill={phase.color}
            stroke="#FFFFFF"
            strokeWidth="2"
            className="animate-pulse"
          />
          <circle cx={tToX(tempC)} cy={pToY(pressMbar)} r="14" fill="none" stroke={phase.color} strokeWidth="1" opacity="0.5" />

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

          {/* Axis Labels */}
          {[-60, -30, 0, 30, 60].map((t) => (
            <text
              key={t}
              x={tToX(t)}
              y={margin.top + plotHeight + 18}
              fill="#8A91A0"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {t}°C
            </text>
          ))}
          {[-2, 0, 2].map((logP) => {
            const p = Math.pow(10, logP);
            return (
              <text
                key={logP}
                x={margin.left - 8}
                y={pToY(p) + 3}
                fill="#8A91A0"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="end"
              >
                {p >= 1 ? `${p}` : p.toFixed(2)}
              </text>
            );
          })}
        </svg>

        {/* Legend / Overlay Note */}
        <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-ink-muted px-1 gap-2">
          <span>Click / drag on plot to explore state transitions.</span>
          {phase.isFreezeDryingWindow && (
            <div className="flex items-center gap-1 text-amber-signal font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Optimal Freeze-Drying Operating Window Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Manual Precision Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-white/10">
        <div className="bg-[#08090A] p-3 rounded-xl border border-white/5">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-ink-secondary flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-cryo" /> Temperature
            </span>
            <span className="font-mono text-ink-primary font-bold">{tempC}°C</span>
          </div>
          <input
            type="range"
            min="-80"
            max="60"
            step="1"
            value={tempC}
            onChange={(e) => setTempC(Number(e.target.value))}
            className="w-full accent-[#7FD4FF] cursor-pointer"
          />
        </div>

        <div className="bg-[#08090A] p-3 rounded-xl border border-white/5">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-ink-secondary flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-signal" /> Pressure (mbar)
            </span>
            <span className="font-mono text-ink-primary font-bold">
              {pressMbar < 0.1 ? pressMbar.toFixed(3) : pressMbar.toFixed(1)} mbar
            </span>
          </div>
          <input
            type="range"
            min="-3"
            max="3"
            step="0.05"
            value={Math.log10(Math.max(0.001, pressMbar))}
            onChange={(e) => setPressMbar(Number(Math.pow(10, Number(e.target.value)).toFixed(4)))}
            className="w-full accent-[#E5A93C] cursor-pointer"
          />
        </div>
      </div>

      {/* Physics explanation readout */}
      <div className="mt-3 p-3 rounded-xl bg-white/5 text-xs text-ink-secondary flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-amber-signal shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-ink-primary">Thermodynamic Readout: </span>
          {phase.description} (Saturation Vapor Pressure:{" "}
          <span className="font-mono text-cryo font-medium">
            {getIceSublimationPressureMbar(tempC).toFixed(4)} mbar
          </span>
          ).
        </div>
      </div>
    </div>
  );
}
