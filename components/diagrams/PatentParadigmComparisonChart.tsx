"use client";

import React, { useState, useRef } from "react";
import { useStickyTableHeader } from "../tables/useStickyTableHeader";
import { StickyTableScrollbar } from "../tables/StickyTableScrollbar";
import {
  Wind,
  Filter,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  ArrowDown,
  Layers,
  Sparkles,
  Thermometer,
  Activity,
  CheckCircle2,
  XCircle,
  Cpu,
  Flame,
} from "lucide-react";

type TabMode = "comparison" | "simulation" | "matrix";
type StageMode = "freezing" | "elutriation" | "blowback";

export function PatentParadigmComparisonChart() {
  const [activeTab, setActiveTab] = useState<TabMode>("comparison");
  const [activeStage, setActiveStage] = useState<StageMode>("elutriation");

  return (
    <div className="my-8 not-prose rounded-3xl border border-hairline bg-bg-panel shadow-2xl overflow-hidden">
      {/* Header bar */}
      <div className="p-5 sm:p-6 border-b border-hairline bg-bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>AFD Architecture Evolution Matrix</span>
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-ink-primary mt-1">
            Classic Active Freeze Dryer vs. Dynamic Elutriation Collector
          </h3>
          <p className="text-xs font-mono text-ink-muted mt-0.5">
            EP 1 601 919 B1 (Static Bed Attrition) to NL 2026893 B1 (Dynamic External Elutriation)
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-bg-panel rounded-2xl border border-hairline self-start md:self-auto">
          <button
            onClick={() => setActiveTab("comparison")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === "comparison"
                ? "bg-amber text-obsidian shadow-sm"
                : "text-ink-secondary hover:text-ink-primary hover:bg-bg-hover"
            }`}
          >
            Visual Comparison
          </button>
          <button
            onClick={() => setActiveTab("simulation")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === "simulation"
                ? "bg-amber text-obsidian shadow-sm"
                : "text-ink-secondary hover:text-ink-primary hover:bg-bg-hover"
            }`}
          >
            Operating Modes (NL 2026893)
          </button>
          <button
            onClick={() => setActiveTab("matrix")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === "matrix"
                ? "bg-amber text-obsidian shadow-sm"
                : "text-ink-secondary hover:text-ink-primary hover:bg-bg-hover"
            }`}
          >
            Engineering Matrix
          </button>
        </div>
      </div>

      {/* Tab 1: Visual Comparison Cards */}
      {activeTab === "comparison" && (
        <div className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Card 1: Classic AFD (EP 1 601 919 B1) */}
            <div className="lg:col-span-5 rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-500/5 via-bg-surface to-bg-panel p-5 flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-hairline">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                      EP 1 601 919 B1
                    </span>
                    <span className="text-xs font-mono text-ink-muted">Legacy Baseline (2005)</span>
                  </div>
                  <XCircle className="w-4 h-4 text-red-400" />
                </div>

                <h4 className="text-base font-bold text-ink-primary mt-3 mb-1">
                  Classic Active Freeze Dryer
                </h4>
                <p className="text-xs text-ink-secondary mb-4">
                  Single conical chamber with orbiting screw agitator retaining 100% of powder.
                </p>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-bg-surface/80 border border-hairline space-y-1">
                    <div className="text-[11px] font-bold text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Residence & Containment</span>
                    </div>
                    <div className="text-ink-secondary text-[11px] leading-relaxed">
                      100% of batch remains inside the agitated cone during the entire 12 - 24 hour cycle.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-bg-surface/80 border border-hairline space-y-1">
                    <div className="text-[11px] font-bold text-red-400 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Agitator Shear & Attrition</span>
                    </div>
                    <div className="text-ink-secondary text-[11px] leading-relaxed">
                      Constant screw contact causes severe shear-heating, particle attrition, and 2 - 4 log viability loss in live cells.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-bg-surface/80 border border-hairline space-y-1">
                    <div className="text-[11px] font-bold text-red-400 flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5" />
                      <span>Heat Transfer Starvation</span>
                    </div>
                    <div className="text-ink-secondary text-[11px] leading-relaxed">
                      Bed volume contracts as moisture sublimates, leaving 40% - 50% of upper cone jacket starved and unutilized.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-hairline flex items-center justify-between text-[11px] font-mono text-red-400/90">
                <span>Vessel Agitator: Continuous Screw</span>
                <span className="font-bold">Loss of Structure</span>
              </div>
            </div>

            {/* Central Aerodynamic Bridge */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center py-4 lg:py-0 px-2 text-center">
              <div className="w-full flex items-center justify-center my-2">
                <div className="hidden lg:flex flex-col items-center gap-2">
                  <div className="px-2.5 py-1 rounded-lg bg-amber/10 border border-amber/30 text-[10px] font-mono font-bold text-amber">
                    PARADIGM SHIFT
                  </div>
                  <div className="h-8 w-0.5 bg-gradient-to-b from-amber/20 to-amber" />
                  <div className="w-10 h-10 rounded-full bg-amber/15 border border-amber/40 flex items-center justify-center shadow-lg animate-pulse">
                    <Wind className="w-5 h-5 text-amber" />
                  </div>
                  <div className="h-8 w-0.5 bg-gradient-to-b from-amber to-amber/20" />
                  <div className="text-[10px] font-mono text-ink-muted leading-tight max-w-[120px]">
                    Sublimation Vapor Aerodynamic Elutriation
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber mt-1" />
                </div>

                <div className="flex lg:hidden items-center gap-2 my-2">
                  <div className="px-2.5 py-1 rounded-lg bg-amber/10 border border-amber/30 text-[10px] font-mono font-bold text-amber">
                    AERODYNAMIC ELUTRIATION TRANSITION
                  </div>
                  <ArrowDown className="w-4 h-4 text-amber animate-bounce" />
                </div>
              </div>
            </div>

            {/* Card 2: Dynamic Elutriation Collector (NL 2026893 B1) */}
            <div className="lg:col-span-5 rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/5 via-bg-surface to-bg-panel p-5 flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-hairline">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      NL 2026893 B1
                    </span>
                    <span className="text-xs font-mono text-ink-muted">Modern Platform (2023)</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>

                <h4 className="text-base font-bold text-ink-primary mt-3 mb-1">
                  Dynamic Elutriation Collector Freeze Dryer
                </h4>
                <p className="text-xs text-ink-secondary mb-4">
                  Dual-chamber system with external dynamic heated filter candle (40/140) and bypass isolation.
                </p>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-bg-surface/80 border border-hairline space-y-1">
                    <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5" />
                      <span>Aerodynamic Elutriation</span>
                    </div>
                    <div className="text-ink-secondary text-[11px] leading-relaxed">
                      Subliming vapor aerodynamic drag continuously elutriates dried fines out of the cone the instant moisture evaporates.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-bg-surface/80 border border-hairline space-y-1">
                    <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Zero-Shear Gentle Collection</span>
                    </div>
                    <div className="text-ink-secondary text-[11px] leading-relaxed">
                      Dried fines gently deposit on external heated filter candle (70), entirely isolated from rotating screw mechanical shear.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-bg-surface/80 border border-hairline space-y-1">
                    <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Bypass Isolation & Unified Blend</span>
                    </div>
                    <div className="text-ink-secondary text-[11px] leading-relaxed">
                      Dual-mode bypass valve (30/214) protects filter during freezing; reverse-pulse blowback returns fines for unified batch blending.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-hairline flex items-center justify-between text-[11px] font-mono text-emerald-400/90">
                <span>Filter Surface: Heated Jacket (70)</span>
                <span className="font-bold">100% Viability & Sphericity</span>
              </div>
            </div>
          </div>

          {/* Quick takeaway summary callout */}
          <div className="p-4 rounded-2xl bg-amber/5 border border-amber/20 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber shrink-0 mt-0.5" />
            <div className="text-xs text-ink-secondary leading-relaxed">
              <strong className="text-ink-primary font-bold">The Core Technical Innovation:</strong>{" "}
              In NL 2026893 B1, the external dynamic filter candle (40/140) ceases to be a passive safety barrier against dust loss. Instead, it becomes an active secondary drying and collection station. By capitalizing on vapor sublimation velocity (u_vapor &gt; v_terminal), fragile dried particles escape the destructive grinding of the orbiting screw before attrition can occur.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Operating Modes Simulation */}
      {activeTab === "simulation" && (
        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-ink-muted mr-2">Select Cycle Phase:</span>
            <button
              onClick={() => setActiveStage("freezing")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                activeStage === "freezing"
                  ? "bg-cryo text-obsidian font-bold shadow-sm"
                  : "bg-bg-surface border border-hairline text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" />
              <span>Phase 1: Freezing & Nucleation</span>
            </button>
            <button
              onClick={() => setActiveStage("elutriation")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                activeStage === "elutriation"
                  ? "bg-amber text-obsidian font-bold shadow-sm"
                  : "bg-bg-surface border border-hairline text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Phase 2: Sublimation & Elutriation</span>
            </button>
            <button
              onClick={() => setActiveStage("blowback")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                activeStage === "blowback"
                  ? "bg-emerald-400 text-obsidian font-bold shadow-sm"
                  : "bg-bg-surface border border-hairline text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Phase 3: Reverse-Pulse Blowback</span>
            </button>
          </div>

          {/* Interactive Phase Schematic Box */}
          <div className="p-5 rounded-2xl bg-bg-surface border border-hairline space-y-4">
            {activeStage === "freezing" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cryo/20 text-cryo border border-cryo/30">
                      BYPASS VALVE (30 / 214) = CLOSED
                    </span>
                    <span className="text-xs font-mono text-ink-muted">Cold Freezing / Atomization Step</span>
                  </div>
                  <span className="text-xs font-mono text-cryo">Vessel Temp: -40°C</span>
                </div>
                <div className="p-4 rounded-xl bg-bg-panel border border-hairline font-mono text-xs text-ink-secondary leading-relaxed space-y-2">
                  <div className="text-ink-primary font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cryo" />
                    <span>Isolation of Dynamic Filter Chamber:</span>
                  </div>
                  <p>
                    During liquid introduction, spray droplet freezing, and bulk cake consolidation, bypass isolation valve 30 (or port valve 214) remains firmly shut. This completely isolates the external filter candle (40/140) from moisture condensation, liquid splashing, and ice glazing.
                  </p>
                  <p className="text-ink-muted text-[11px]">
                    Agitator screw operates at low speed (2 - 5 RPM) to promote uniform ice crystallite nucleation without high shear.
                  </p>
                </div>
              </div>
            )}

            {activeStage === "elutriation" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber/20 text-amber border border-amber/30">
                      BYPASS VALVE (30 / 214) = OPEN
                    </span>
                    <span className="text-xs font-mono text-ink-muted">Active Primary Sublimation Step</span>
                  </div>
                  <span className="text-xs font-mono text-amber">Vapor Velocity: 5 - 25 m/s</span>
                </div>
                <div className="p-4 rounded-xl bg-bg-panel border border-hairline font-mono text-xs text-ink-secondary leading-relaxed space-y-2">
                  <div className="text-ink-primary font-bold flex items-center gap-2">
                    <Wind className="w-4 h-4 text-amber" />
                    <span>Aerodynamic Fines Segregation & Gentle Secondary Drying:</span>
                  </div>
                  <p>
                    Vacuum source pulls high-velocity sublimation vapor out of conical chamber 20 into dynamic filter housing 40. Dry, lightweight particles whose terminal settling velocity is less than the ascending vapor velocity are elutriated out of the cone.
                  </p>
                  <p>
                    These particles collect gently on the porous stainless steel filter candle (40/140), which is heated via external thermal jacket 70 to continue gentle secondary desorptive drying in absolute safety away from the orbiting screw.
                  </p>
                </div>
              </div>
            )}

            {activeStage === "blowback" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      PULSE-JET N₂ BLOWBACK = ACTIVE
                    </span>
                    <span className="text-xs font-mono text-ink-muted">Unified Batch Homogenization Step</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">Blowback Pressure: 2 - 4 bar N₂</span>
                </div>
                <div className="p-4 rounded-xl bg-bg-panel border border-hairline font-mono text-xs text-ink-secondary leading-relaxed space-y-2">
                  <div className="text-ink-primary font-bold flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-emerald-400" />
                    <span>Return of Fines for Unified Homogeneous Batch:</span>
                  </div>
                  <p>
                    Once residual moisture targets are met (&lt;1.0% w/w), the filter candle is subjected to reverse micro-pulses of sterile dry nitrogen gas. The dislodged dry cake drops down gravitational funnel 80 back into conical chamber 20.
                  </p>
                  <p>
                    The orbiting screw is operated briefly at gentle blending speed (3 - 5 RPM) to create a single, completely homogeneous batch blend before aseptic container discharge through bottom valve 28.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Detailed Engineering Matrix */}
      {activeTab === "matrix" && <EngineeringMatrixTab />}
    </div>
  );
}

function EngineeringMatrixTab() {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const theadRef = useRef<HTMLTableSectionElement>(null);

  // Freezes table header at top 56px below navbar
  useStickyTableHeader(tableContainerRef, theadRef, { topOffset: 56 });

  return (
    <div className="relative p-5 sm:p-6">
      <div
        ref={tableContainerRef}
        className="overflow-x-auto rounded-2xl border border-hairline shadow-md bg-bg-panel transition-all"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "var(--amber) transparent",
        }}
      >
        <table className="w-full min-w-[1100px] border-collapse text-left font-mono text-xs">
          <thead ref={theadRef}>
            <tr className="border-b border-hairline bg-bg-surface">
              <th className="px-4 py-3 min-w-[220px] text-xs font-mono font-bold uppercase tracking-wider text-ink-primary whitespace-nowrap bg-bg-surface">
                Architectural Feature
              </th>
              <th className="px-4 py-3 min-w-[280px] text-xs font-mono font-bold uppercase tracking-wider text-ink-primary whitespace-nowrap bg-bg-surface">
                Classic Active Freeze Dryer (EP 1 601 919 B1)
              </th>
              <th className="px-4 py-3 min-w-[320px] text-xs font-mono font-bold uppercase tracking-wider text-ink-primary whitespace-nowrap bg-bg-surface">
                Dynamic Elutriation Collector (NL 2026893 B1)
              </th>
              <th className="px-4 py-3 min-w-[320px] text-xs font-mono font-bold uppercase tracking-wider text-ink-primary whitespace-nowrap bg-bg-surface">
                Bioprocess & Clinical Impact
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            <tr className="hover:bg-bg-hover transition-colors even:bg-bg-surface/30">
              <td className="px-4 py-3 min-w-[220px] font-bold text-ink-primary align-top">
                Product Residence Chamber
              </td>
              <td className="px-4 py-3 min-w-[280px] text-ink-secondary leading-relaxed align-top">
                100% of product remains trapped inside the agitated cone throughout entire 12 - 24 h cycle
              </td>
              <td className="px-4 py-3 min-w-[320px] text-ink-secondary leading-relaxed align-top">
                Continuous aerodynamic elutriation carries dry fines into external collection filter candle (40/140)
              </td>
              <td className="px-4 py-3 min-w-[320px] text-ink-secondary leading-relaxed align-top">
                Eliminates prolonged mechanical exposure for dry finished product
              </td>
            </tr>
            <tr className="hover:bg-bg-hover transition-colors even:bg-bg-surface/30">
              <td className="px-4 py-3 min-w-[220px] font-bold text-ink-primary align-top">
                Agitator Mechanical Shear
              </td>
              <td className="px-4 py-3 min-w-[280px] text-ink-secondary leading-relaxed align-top">
                Constant contact with orbiting helical screw causes shear-heating and particle attrition
              </td>
              <td className="px-4 py-3 min-w-[320px] text-ink-secondary leading-relaxed align-top">
                Fines gently collect on heated filter surface (70) completely shielded from rotating screw
              </td>
              <td className="px-4 py-3 min-w-[320px] text-ink-secondary leading-relaxed align-top">
                Prevents cell wall rupture in live probiotics (+2 to 4 log CFU survival) and preserves PLGA microsphere surface morphology
              </td>
            </tr>
            <tr className="hover:bg-bg-hover transition-colors even:bg-bg-surface/30">
              <td className="px-4 py-3 min-w-[220px] font-bold text-ink-primary align-top">
                Heat-Transfer Surface Area
              </td>
              <td className="px-4 py-3 min-w-[280px] text-ink-secondary leading-relaxed align-top">
                Sublimation reduces cake volume; bed falls below 50% cone height leaving upper jacket starved
              </td>
              <td className="px-4 py-3 min-w-[320px] text-ink-secondary leading-relaxed align-top">
                Dual-zone heating: jacketed cone (2) plus independent heated jacket (7) on filter candle housing
              </td>
              <td className="px-4 py-3 min-w-[320px] text-ink-secondary leading-relaxed align-top">
                Sustains high sublimation and desorption rates throughout the final cycle plateau
              </td>
            </tr>
            <tr className="hover:bg-bg-hover transition-colors even:bg-bg-surface/30">
              <td className="px-4 py-3 min-w-[220px] font-bold text-ink-primary align-top">
                Vapor Routing & Process Valves
              </td>
              <td className="px-4 py-3 min-w-[280px] text-ink-secondary leading-relaxed align-top">
                Fixed internal dome filtration or unseparated vapor exhaust
              </td>
              <td className="px-4 py-3 min-w-[320px] text-ink-secondary leading-relaxed align-top">
                Dual-mode bypass isolation valve (30 / 214) isolates filter candle during freezing, routes vapor during drying
              </td>
              <td className="px-4 py-3 min-w-[320px] text-ink-secondary leading-relaxed align-top">
                Prevents cake splashing and moisture blinding during freezing; enables high-speed elutriation in sublimation
              </td>
            </tr>
            <tr className="hover:bg-bg-hover transition-colors even:bg-bg-surface/30">
              <td className="px-4 py-3 min-w-[220px] font-bold text-ink-primary align-top">
                Batch Homogenization
              </td>
              <td className="px-4 py-3 min-w-[280px] text-ink-secondary leading-relaxed align-top">
                Standard bottom discharge of agitated bed
              </td>
              <td className="px-4 py-3 min-w-[320px] text-ink-secondary leading-relaxed align-top">
                Optional reverse-pulse N₂ blowback returns collected fines to conical vessel for unified batch blending
              </td>
              <td className="px-4 py-3 min-w-[320px] text-ink-secondary leading-relaxed align-top">
                Guarantees batch-wide uniformity and particle size distribution consistency without manual handling
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <StickyTableScrollbar tableContainerRef={tableContainerRef} />
    </div>
  );
}
