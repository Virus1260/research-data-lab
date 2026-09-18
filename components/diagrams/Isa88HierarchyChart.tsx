"use client";

import React, { useState } from "react";
import { Layers, ChevronRight, CheckCircle2, Cpu, Box, Workflow, Activity } from "lucide-react";

interface HierarchyLevel {
  id: string;
  name: string;
  levelNum: number;
  badge: string;
  badgeColor: string;
  example: string;
  description: string;
  scope: string;
  details: string[];
}

const HIERARCHY_LEVELS: HierarchyLevel[] = [
  {
    id: "procedure",
    name: "Procedure",
    levelNum: 1,
    badge: "Entire Batch",
    badgeColor: "#38bdf8",
    example: "AFD-Batch-001: Sterile Inactivated Vaccine Cake Production",
    description: "The complete, end-to-end recipe from clean empty vessel to discharged dry API powder canister.",
    scope: "Plant / System Master Level",
    details: [
      "Coordinates all unit operations across preparation, drying, and cleaning",
      "Assigns 21 CFR Part 11 electronic batch records (EBR) and audit trails",
      "Tracks overall cycle time (typically 24 to 36 hours total)",
    ],
  },
  {
    id: "unit_procedure",
    name: "Unit Procedure",
    levelNum: 2,
    badge: "Major Unit Step",
    badgeColor: "#fbbf24",
    example: "Primary Sublimation Drying on AFD Chamber",
    description: "An ordered sequence of operations targeting a major physical state transition on a specific major equipment unit.",
    scope: "Vessel Unit Level",
    details: [
      "Controls the dedicated lyophilisation chamber, condenser, and TCU skid",
      "Ensures vacuum integrity and refrigeration cascade synchronization",
      "Monitors batch critical quality attributes (e.g. moisture loss rate)",
    ],
  },
  {
    id: "operation",
    name: "Operation",
    levelNum: 3,
    badge: "Targeted Goal",
    badgeColor: "#a855f7",
    example: "Sublimation Heat & Vacuum Balance Control",
    description: "An independent procedural sequence that accomplishes an identifiable thermodynamic or chemical change.",
    scope: "Skid & Loop Boundary",
    details: [
      "Balances Syltherm jacket heat input with sublimation vapor withdrawal",
      "Maintains 0.04 to 0.08 mbar sublimation pressure plateaus",
      "Transitions automatically to Secondary Drying upon Pirani convergence",
    ],
  },
  {
    id: "phase",
    name: "Phase",
    levelNum: 4,
    badge: "Smallest Executable Step",
    badgeColor: "#34d399",
    example: "Hold Vacuum Setpoint at 0.04 mbar (PIC-101)",
    description: "The smallest atomic executable building block in the PLC. Directly drives actuators and reads physical sensors.",
    scope: "Direct PLC Actuator / Sensor Logic",
    details: [
      "Directly commands throttle valve XV-301 and N₂ bleed valve FV-101",
      "Reads pressure transmitter PIT-101A and temperature sensor TE-101",
      "Can transition to RUNNING, HELD, or ABORTED states independently",
    ],
  },
];

export function Isa88HierarchyChart() {
  const [activeLevelId, setActiveLevelId] = useState<string>("phase");
  const activeLevel = HIERARCHY_LEVELS.find((l) => l.id === activeLevelId) || HIERARCHY_LEVELS[3];

  return (
    <div className="my-8 not-prose rounded-3xl border border-hairline bg-bg-panel shadow-2xl overflow-hidden backdrop-blur-sm">
      <div className="p-5 sm:p-6 border-b border-hairline bg-bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>ANSI / ISA-88 Structural Standard</span>
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-ink-primary mt-1">
            Procedural Hierarchy Model (Batch Recipe Architecture)
          </h3>
        </div>
        <span className="text-xs font-mono text-ink-dim">
          Separation of Recipe from Equipment
        </span>
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        {/* Visual Nested Cascade Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HIERARCHY_LEVELS.map((lvl) => {
            const isSelected = lvl.id === activeLevel.id;
            return (
              <button
                key={lvl.id}
                onClick={() => setActiveLevelId(lvl.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group ${
                  isSelected
                    ? "bg-amber-subtle border-amber shadow-lg -translate-y-1 ring-2 ring-amber/40"
                    : "bg-bg-surface hover:bg-bg-hover border-hairline"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                    <span
                      className="px-2 py-0.5 rounded-full font-bold uppercase"
                      style={{
                        backgroundColor: `${lvl.badgeColor}20`,
                        color: lvl.badgeColor,
                      }}
                    >
                      Tier 0{lvl.levelNum}
                    </span>
                    <span className="text-ink-dim">{lvl.badge}</span>
                  </div>

                  <h4 className="text-base font-bold text-ink-primary group-hover:text-amber transition-colors">
                    {lvl.name}
                  </h4>

                  <p className="text-xs text-ink-secondary mt-1.5 line-clamp-2 leading-relaxed">
                    {lvl.description}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-hairline text-[10px] font-mono text-amber flex items-center justify-between">
                  <span>Inspect Details</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Tier Deep Inspector */}
        <div className="p-5 sm:p-6 rounded-2xl bg-bg-surface border border-hairline space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-hairline">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-sm"
                style={{
                  backgroundColor: `${activeLevel.badgeColor}20`,
                  color: activeLevel.badgeColor,
                  borderColor: activeLevel.badgeColor,
                  borderWidth: 1.5,
                }}
              >
                0{activeLevel.levelNum}
              </div>
              <div>
                <h5 className="text-base font-bold text-ink-primary">
                  {activeLevel.name} Level Specification
                </h5>
                <span className="text-xs font-mono text-ink-dim">
                  Scope: {activeLevel.scope}
                </span>
              </div>
            </div>

            <div className="px-3 py-1 rounded-xl bg-bg-panel border border-hairline text-xs font-mono text-ink-primary">
              AFD Concrete Example: <span className="text-amber font-bold">{activeLevel.example}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            {activeLevel.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {activeLevel.details.map((d, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-bg-panel border border-hairline flex items-start gap-2 text-xs text-ink-secondary"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
