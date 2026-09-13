"use client";

import React, { useState } from "react";
import { Snowflake, RefreshCw, Zap, Flame, ShieldCheck } from "lucide-react";

export function RefrigerationCascadeDiagram() {
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    title: string;
    stage: string;
    temp: string;
    desc: string;
  }>({
    id: "cascade-exchanger",
    title: "Cascade Interchanger / Evaporator-Condenser",
    stage: "Thermal Coupling Bridge",
    temp: "-35°C to -40°C",
    desc: "Thermal interface where evaporating high-stage refrigerant condenses the low-stage discharge gas at sub-zero temperatures.",
  });

  const nodes = [
    {
      id: "high-comp",
      title: "High-Stage Compressor",
      stage: "High-Stage (R404A / R449A / Propane)",
      temp: "+45°C condensing",
      desc: "Rejects process heat to ambient plant cooling water or air-cooled condenser.",
    },
    {
      id: "cascade-exchanger",
      title: "Cascade Condenser / Interchanger",
      stage: "Coupling Heat Exchanger",
      temp: "-35°C intermediate",
      desc: "Evaporates high-stage refrigerant while condensing high-pressure low-stage gas.",
    },
    {
      id: "low-comp",
      title: "Low-Stage Cryogenic Compressor",
      stage: "Low-Stage (R23 / Ethane R170)",
      temp: "-55°C suction",
      desc: "Compresses ultra-low temperature vapor from the vessel jacket / ice condenser.",
    },
    {
      id: "vessel-jacket",
      title: "Vessel Jacket / Ice Condenser Coils",
      stage: "Process Evaporator",
      temp: "-55°C to -65°C",
      desc: "Extracts latent heat from the freeze dryer charge and freezes sublimated water vapor.",
    },
  ];

  return (
    <div className="instrument-card rounded-2xl p-5 my-6 border border-hairline bg-bg-panel backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-hairline gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cryo animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-cryo">
              Simulator 09 • Chapter 06
            </span>
          </div>
          <h3 className="text-lg font-medium text-ink-primary mt-1">
            Two-Stage Cascade Cryogenic Refrigeration Schematic
          </h3>
        </div>
        <div className="text-xs font-mono text-ink-muted bg-bg-hover px-3 py-1.5 rounded-lg border border-hairline">
          Dual Refrigerant Loops (-65°C Cryogenic Duty)
        </div>
      </div>

      {/* SVG Diagram Canvas */}
      <div className="bg-bg-inset p-4 rounded-xl border border-hairline relative">
        <svg viewBox="0 0 600 240" className="w-full h-auto select-none">
          {/* High Stage Loop Rect */}
          <rect
            x="30"
            y="30"
            width="250"
            height="180"
            rx="12"
            fill="rgba(245, 166, 35, 0.03)"
            stroke="rgba(245, 166, 35, 0.2)"
            strokeDasharray="4 2"
          />
          <text x="45" y="52" fill="var(--amber)" fontSize="10" fontFamily="monospace" fontWeight="bold">
            HIGH STAGE (-40°C)
          </text>

          {/* Low Stage Loop Rect */}
          <rect
            x="320"
            y="30"
            width="250"
            height="180"
            rx="12"
            fill="rgba(127, 212, 255, 0.03)"
            stroke="rgba(127, 212, 255, 0.2)"
            strokeDasharray="4 2"
          />
          <text x="335" y="52" fill="var(--cryo)" fontSize="10" fontFamily="monospace" fontWeight="bold">
            LOW STAGE (-65°C)
          </text>

          {/* Refrigerant Flow Lines */}
          <path
            d="M 120 90 L 220 90 L 220 150 L 120 150 Z"
            fill="none"
            stroke="var(--amber)"
            strokeWidth="2"
            strokeDasharray="6 4"
            className="animate-pulse"
          />
          <path
            d="M 380 90 L 480 90 L 480 150 L 380 150 Z"
            fill="none"
            stroke="var(--cryo)"
            strokeWidth="2"
            strokeDasharray="6 4"
            className="animate-pulse"
          />

          {/* Nodes */}
          {/* Node 1: High Stage Compressor */}
          <g
            className="cursor-pointer transition hover:opacity-80"
            onClick={() => setSelectedNode(nodes[0])}
          >
            <circle
              cx="120"
              cy="90"
              r="22"
              fill={selectedNode.id === "high-comp" ? "var(--amber)" : "var(--bg-surface)"}
              stroke="var(--amber)"
              strokeWidth="2"
            />
            <text
              x="120"
              y="94"
              fill={selectedNode.id === "high-comp" ? "var(--on-amber)" : "var(--ink-primary)"}
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              COMP-1
            </text>
          </g>

          {/* Node 2: Cascade Interchanger (in center bridge) */}
          <g
            className="cursor-pointer transition hover:opacity-80"
            onClick={() => setSelectedNode(nodes[1])}
          >
            <rect
              x="260"
              y="70"
              width="80"
              height="100"
              rx="8"
              fill={selectedNode.id === "cascade-exchanger" ? "var(--bg-elevated)" : "var(--bg-surface)"}
              stroke="var(--cryo)"
              strokeWidth="2"
            />
            <text
              x="300"
              y="115"
              fill={selectedNode.id === "cascade-exchanger" ? "var(--on-amber)" : "var(--cryo)"}
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              CASCADE HX
            </text>
            <text
              x="300"
              y="130"
              fill={selectedNode.id === "cascade-exchanger" ? "var(--on-amber)" : "var(--ink-muted)"}
              fontSize="8"
              fontFamily="monospace"
              textAnchor="middle"
            >
              -35°C
            </text>
          </g>

          {/* Node 3: Low Stage Compressor */}
          <g
            className="cursor-pointer transition hover:opacity-80"
            onClick={() => setSelectedNode(nodes[2])}
          >
            <circle
              cx="380"
              cy="90"
              r="22"
              fill={selectedNode.id === "low-comp" ? "var(--cryo)" : "var(--bg-surface)"}
              stroke="var(--cryo)"
              strokeWidth="2"
            />
            <text
              x="380"
              y="94"
              fill={selectedNode.id === "low-comp" ? "var(--on-amber)" : "var(--ink-primary)"}
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              COMP-2
            </text>
          </g>

          {/* Node 4: Vessel Jacket / Condenser */}
          <g
            className="cursor-pointer transition hover:opacity-80"
            onClick={() => setSelectedNode(nodes[3])}
          >
            <rect
              x="450"
              y="70"
              width="65"
              height="100"
              rx="6"
              fill={selectedNode.id === "vessel-jacket" ? "var(--cryo)" : "var(--bg-surface)"}
              stroke="var(--cryo)"
              strokeWidth="2"
            />
            <text
              x="482"
              y="115"
              fill={selectedNode.id === "vessel-jacket" ? "var(--on-amber)" : "var(--cryo)"}
              fontSize="8"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              AFD JACKET
            </text>
            <text
              x="482"
              y="130"
              fill={selectedNode.id === "vessel-jacket" ? "var(--on-amber)" : "var(--ink-primary)"}
              fontSize="8"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              -60°C
            </text>
          </g>
        </svg>

        <div className="text-[10px] text-ink-dim font-mono text-center mt-1">
          Click any component to inspect its role and temperature rating.
        </div>
      </div>

      {/* Selected Node Spec Inspector */}
      <div className="mt-4 p-4 rounded-xl bg-bg-inset border border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-amber-signal font-bold">
              {selectedNode.stage}
            </span>
            <span className="text-xs font-mono text-cryo bg-cryo/10 px-2 py-0.5 rounded">
              {selectedNode.temp}
            </span>
          </div>
          <div className="text-sm font-bold text-ink-primary">{selectedNode.title}</div>
          <p className="text-xs text-ink-secondary">{selectedNode.desc}</p>
        </div>
      </div>
    </div>
  );
}
