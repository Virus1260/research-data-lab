"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Layers,
  Wind,
  Filter,
  Flame,
  Snowflake,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowDown,
  ArrowDownCircle,
  ExternalLink,
} from "lucide-react";

export function SystemArchitectureFlowChart() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="my-8 rounded-3xl border border-hairline bg-bg-panel shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-hairline bg-bg-surface flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber font-bold">
              Subsystem Topology • Interconnection Map
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-ink-primary mt-1">
            Top-Level System Architecture & Flowchart
          </h3>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            Physical material flows, high-vacuum vapor paths, and I/O fieldbus links across all 5 core AFD subsystems.
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-8 space-y-6">
        {/* ================= TIER 1: CONTROL SYSTEM (TOP) ================= */}
        <div className="flex justify-center">
          <div
            onMouseEnter={() => setHoveredNode("plc")}
            onMouseLeave={() => setHoveredNode(null)}
            className={`w-full max-w-2xl p-5 rounded-2xl border transition-all duration-200 bg-bg-surface relative ${
              hoveredNode === "plc"
                ? "ring-2 ring-emerald-500 border-emerald-500 shadow-xl -translate-y-0.5"
                : "border-hairline hover:border-border-strong shadow-sm"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold">
                    Subsystem #13 • Supervisory Automation
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-ink-primary">
                    Control System (PLC / HMI, 21 CFR Part 11)
                  </h4>
                </div>
              </div>

              <Link
                href="/hosokawa-afd-freeze-dryer/20-control-system-architecture"
                className="inline-flex items-center gap-1 text-xs font-mono text-emerald-500 hover:text-emerald-400 font-semibold shrink-0"
              >
                <span>Ch 20 Specs</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <p className="text-xs text-ink-secondary mt-2.5 leading-relaxed">
              Executes ISA-88 recipe cycles, closed-loop PID thermal & vacuum control, hardwired safety interlocks (SIS SIL 2), and immutable audit logs.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono text-ink-dim">
              <span className="px-2 py-0.5 rounded bg-bg-inset border border-hairline">Siemens S7-1500 (BPCS)</span>
              <span className="px-2 py-0.5 rounded bg-bg-inset border border-hairline">S7-1500F Safety (SIS SIL 2)</span>
              <span className="px-2 py-0.5 rounded bg-bg-inset border border-hairline">WinCC Unified HMI</span>
            </div>
          </div>
        </div>

        {/* ================= I/O BUS CONNECTOR LINE ================= */}
        <div className="flex flex-col items-center">
          <div className="h-6 w-0.5 bg-emerald-500/50" />
          <div className="px-3 py-1 rounded-full bg-bg-surface border border-emerald-500/40 text-[10px] font-mono text-emerald-500 font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
            <span>I/O Signal & Safety Bus (PROFINET / PROFIsafe)</span>
          </div>
          <div className="w-full max-w-5xl h-0.5 bg-emerald-500/30" />
          <div className="w-full max-w-5xl grid grid-cols-5">
            <div className="flex justify-center"><div className="h-4 w-0.5 bg-emerald-500/30" /></div>
            <div className="flex justify-center"><div className="h-4 w-0.5 bg-emerald-500/30" /></div>
            <div className="flex justify-center"><div className="h-4 w-0.5 bg-emerald-500/30" /></div>
            <div className="flex justify-center"><div className="h-4 w-0.5 bg-emerald-500/30" /></div>
            <div className="flex justify-center"><div className="h-4 w-0.5 bg-emerald-500/30" /></div>
          </div>
        </div>

        {/* ================= TIER 2: 5 CORE CONNECTED SUBSYSTEMS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 relative">
          {/* 1. TCU (Heat/Cool) */}
          <div
            onMouseEnter={() => setHoveredNode("tcu")}
            onMouseLeave={() => setHoveredNode(null)}
            className={`p-4 rounded-2xl border transition-all duration-200 bg-bg-surface flex flex-col justify-between relative ${
              hoveredNode === "tcu"
                ? "ring-2 ring-sky-500 border-sky-500 shadow-xl -translate-y-1"
                : "border-hairline hover:border-border-strong shadow-sm"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-sky-500">#03 • Process</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20">
                  Thermal Skid
                </span>
              </div>
              <h4 className="text-sm font-bold text-ink-primary">
                TCU (Heat / Cool Skid)
              </h4>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Circulates Syltherm XLT (-60°C to +80°C) through double jacket for dynamic freezing & heating.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-hairline/60 flex items-center justify-between">
              <span className="text-[10px] font-mono text-ink-dim">Cascade / LN2</span>
              <Link
                href="/hosokawa-afd-freeze-dryer/06-primary-drying-heat-and-mass-transfer"
                className="text-[11px] font-mono text-amber hover:underline flex items-center gap-0.5"
              >
                <span>Ch 06</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>

          {/* 2. Vessel / Chamber + Agitator */}
          <div
            onMouseEnter={() => setHoveredNode("vessel")}
            onMouseLeave={() => setHoveredNode(null)}
            className={`p-4 rounded-2xl border transition-all duration-200 bg-bg-surface flex flex-col justify-between relative ${
              hoveredNode === "vessel"
                ? "ring-2 ring-amber border-amber shadow-xl -translate-y-1"
                : "border-hairline hover:border-border-strong shadow-sm"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-amber">#01 • Core Reactor</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-subtle text-amber border border-amber/30">
                  Jacketed Vessel
                </span>
              </div>
              <h4 className="text-sm font-bold text-ink-primary">
                Vessel / Chamber + Agitator
              </h4>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Downward conical 316L vessel. Orbiting scraper agitator eliminates cakes, producing free-flowing powder.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-hairline/60 flex items-center justify-between">
              <span className="text-[10px] font-mono text-ink-dim">0.04 mbar • -60°C</span>
              <Link
                href="/hosokawa-afd-freeze-dryer/05-vessel-geometry-and-agitator-design"
                className="text-[11px] font-mono text-amber hover:underline flex items-center gap-0.5"
              >
                <span>Ch 05</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>

          {/* 3. Vacuum Path */}
          <div
            onMouseEnter={() => setHoveredNode("vacuum")}
            onMouseLeave={() => setHoveredNode(null)}
            className={`p-4 rounded-2xl border transition-all duration-200 bg-bg-surface flex flex-col justify-between relative ${
              hoveredNode === "vacuum"
                ? "ring-2 ring-purple-500 border-purple-500 shadow-xl -translate-y-1"
                : "border-hairline hover:border-border-strong shadow-sm"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-purple-400">#05 • Vapor Spool</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Vacuum Line
                </span>
              </div>
              <h4 className="text-sm font-bold text-ink-primary">
                Vacuum Path & Bypass
              </h4>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                DN400 vapor duct, high-vacuum isolation valve, N2 fine bleed valve, and dual manometry gauges.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-hairline/60 flex items-center justify-between">
              <span className="text-[10px] font-mono text-ink-dim">Capacitance + Pirani</span>
              <Link
                href="/hosokawa-afd-freeze-dryer/11-vacuum-system-sizing-and-pipework"
                className="text-[11px] font-mono text-amber hover:underline flex items-center gap-0.5"
              >
                <span>Ch 11</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>

          {/* 4. Material Collector & Vacuum Pump */}
          <div
            onMouseEnter={() => setHoveredNode("collector")}
            onMouseLeave={() => setHoveredNode(null)}
            className={`p-4 rounded-2xl border transition-all duration-200 bg-bg-surface flex flex-col justify-between relative ${
              hoveredNode === "collector"
                ? "ring-2 ring-sky-400 border-sky-400 shadow-xl -translate-y-1"
                : "border-hairline hover:border-border-strong shadow-sm"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-sky-400">#06 • Condenser</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Vacuum Train
                </span>
              </div>
              <h4 className="text-sm font-bold text-ink-primary">
                Material Collector & Pump Train
              </h4>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Sanitary cyclone recovers loose API powder; -60°C condenser + Roots booster & dry screw pump.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-hairline/60 flex items-center justify-between">
              <span className="text-[10px] font-mono text-ink-dim">0.04 mbar Base</span>
              <Link
                href="/hosokawa-afd-freeze-dryer/22-practical-equipment-sizing-vacuum-and-cryogenics"
                className="text-[11px] font-mono text-amber hover:underline flex items-center gap-0.5"
              >
                <span>Ch 22</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>

          {/* 5. CIP/SIP Skid */}
          <div
            onMouseEnter={() => setHoveredNode("cipsip")}
            onMouseLeave={() => setHoveredNode(null)}
            className={`p-4 rounded-2xl border transition-all duration-200 bg-bg-surface flex flex-col justify-between relative ${
              hoveredNode === "cipsip"
                ? "ring-2 ring-emerald-500 border-emerald-500 shadow-xl -translate-y-1"
                : "border-hairline hover:border-border-strong shadow-sm"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-emerald-500">#08 • Sanitization</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  CIP / SIP
                </span>
              </div>
              <h4 className="text-sm font-bold text-ink-primary">
                CIP / SIP Skid
              </h4>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Rotary spray balls for 360° vessel wash; 121°C clean steam sterilization across all ports.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-hairline/60 flex items-center justify-between">
              <span className="text-[10px] font-mono text-ink-dim">121°C Steam • WFI</span>
              <Link
                href="/hosokawa-afd-freeze-dryer/07-sanitary-construction-and-cleaning-systems"
                className="text-[11px] font-mono text-amber hover:underline flex items-center gap-0.5"
              >
                <span>Ch 07</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ================= TIER 3: PRODUCT DISCHARGE BRANCH (BELOW VESSEL) ================= */}
        <div className="flex flex-col items-center pt-1">
          <div className="h-6 w-0.5 bg-amber/50" />
          <div className="px-3 py-0.5 rounded-full bg-bg-surface border border-amber/40 text-[10px] font-mono text-amber font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm mb-3">
            <ArrowDown className="w-3 h-3 text-amber" />
            <span>Gravity Product Discharge Path</span>
          </div>

          <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Bottom Discharge Valve Card */}
            <div className="p-4 rounded-2xl border border-hairline bg-bg-surface shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber font-bold">
                  Subsystem #07 • Zero Dead-Leg
                </div>
                <h4 className="text-sm font-bold text-ink-primary mt-0.5">
                  Bottom Discharge Valve
                </h4>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Ball-segment valve with inflatable seal for full product dump at end of drying cycle.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-hairline/60 text-[10px] font-mono text-ink-dim">
                Bubble-tight to 2 bar(g)
              </div>
            </div>

            {/* Product Canister Card */}
            <div className="p-4 rounded-2xl border border-hairline bg-bg-surface shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-600 font-bold">
                  Containment Interface
                </div>
                <h4 className="text-sm font-bold text-ink-primary mt-0.5">
                  Product Collection Canister
                </h4>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Hermetic dock container with split butterfly valve for dust-free aseptic powder transfer.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-hairline/60 text-[10px] font-mono text-ink-dim">
                Inert N2 Blanket Pack
              </div>
            </div>
          </div>
        </div>

        {/* ================= TIER 4: UTILITY MANAGEMENT SKID (FOUNDATION) ================= */}
        <div className="pt-2">
          <div className="p-4 sm:p-5 rounded-2xl border border-hairline bg-bg-surface shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                    Subsystem #14 • Plant Infrastructure
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-ink-primary">
                    Utility Management Skid (Facility Manifold)
                  </h4>
                </div>
              </div>

              <div className="text-xs font-mono text-ink-muted">
                Interfaces all subsystems to central plant utilities
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono text-ink-secondary text-center">
              <span className="p-2 rounded-lg bg-bg-inset border border-hairline">⚡ 400V 3Φ Power</span>
              <span className="p-2 rounded-lg bg-bg-inset border border-hairline">💨 6 bar Dry Air</span>
              <span className="p-2 rounded-lg bg-bg-inset border border-hairline">🛡️ 99.999% N2</span>
              <span className="p-2 rounded-lg bg-bg-inset border border-hairline">💧 WFI / Water</span>
              <span className="p-2 rounded-lg bg-bg-inset border border-hairline">♨️ Clean Steam</span>
              <span className="p-2 rounded-lg bg-bg-inset border border-hairline">❄️ Chilled Glycol</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
