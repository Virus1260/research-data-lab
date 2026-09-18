"use client";

import React, { useState } from "react";
import {
  GitBranch,
  Play,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Flame,
  Snowflake,
  Wind,
  Layers,
  ChevronRight,
  Sparkles,
  Lock,
} from "lucide-react";
import { useTheme } from "../layout/ThemeProvider";

interface BatchStage {
  id: string;
  number: number;
  name: string;
  tag: string;
  group: "prep" | "core" | "finish" | "clean" | "safety";
  color: string;
  triggerCondition: string;
  exitCondition: string;
  equipmentState: {
    jacketTemp: string;
    chamberPressure: string;
    agitatorStatus: string;
    activeValves: string[];
    criticalSensors: string[];
  };
  description: string;
  isAbortBranch?: boolean;
}

const BATCH_STAGES: BatchStage[] = [
  {
    id: "idle",
    number: 1,
    name: "IDLE / STANDBY",
    tag: "IDLE",
    group: "prep",
    color: "#94a3b8",
    triggerCondition: "Batch initialization or fault cleared & acknowledged",
    exitCondition: "SIP requested or direct leak-test authorized",
    equipmentState: {
      jacketTemp: "+20°C (Ambient)",
      chamberPressure: "1,013 mbar (Atmospheric)",
      agitatorStatus: "Stopped (0 RPM)",
      activeValves: ["All Process Valves Closed"],
      criticalSensors: ["ZS-101 (Lid Closed Confirmed)"],
    },
    description: "Vessel clean, empty, and depressurized. Supervisory recipe manager standing by for batch authorization.",
  },
  {
    id: "pre_sterilize",
    number: 2,
    name: "PRE-STERILIZATION (SIP)",
    tag: "PRE_STERILIZE",
    group: "prep",
    color: "#f59e0b",
    triggerCondition: "Recipe SIP cycle requested",
    exitCondition: "121.5°C Pure steam held for ≥30 min (F₀ ≥ 15 min)",
    equipmentState: {
      jacketTemp: "+121.5°C (Steam Traced)",
      chamberPressure: "2.1 bar(g) Pure Steam",
      agitatorStatus: "Slow Jog (2 RPM)",
      activeValves: ["XV-401 (Pure Steam In)", "XV-402 (Condensate Trap)"],
      criticalSensors: ["TE-101 (Core Temp)", "PT-101 (Chamber Steam Pressure)"],
    },
    description: "Steam-in-place cycle heats all wetted 316L vessel and agitator surfaces to 121.5°C under positive pure steam pressure.",
  },
  {
    id: "leak_test",
    number: 3,
    name: "DEEP VACUUM LEAK TEST",
    tag: "LEAK_TEST",
    group: "prep",
    color: "#06b6d4",
    triggerCondition: "SIP cycle complete or SIP bypass authorized",
    exitCondition: "Rate-of-rise < 0.02 mbar·L/s over 15 min hold",
    equipmentState: {
      jacketTemp: "+20°C",
      chamberPressure: "0.015 mbar (Deep Vacuum)",
      agitatorStatus: "Stopped",
      activeValves: ["XV-301 (Vapor Spool Throttle Isolated)"],
      criticalSensors: ["PIT-101A (Capacitance)", "PIT-101B (Pirani)"],
    },
    description: "Evacuates chamber to 0.015 mbar, isolates all headers, and monitors pressure rise to verify sterile containment seal before charging API.",
  },
  {
    id: "product_charge",
    number: 4,
    name: "ASEPTIC PRODUCT CHARGE",
    tag: "PRODUCT_CHARGE",
    group: "core",
    color: "#3b82f6",
    triggerCondition: "Vacuum leak test pass confirmation",
    exitCondition: "Batch volume confirmed (Load cells) & charge valve closed",
    equipmentState: {
      jacketTemp: "+4°C (Pre-chilled Jacket)",
      chamberPressure: "Atmospheric N₂ blanket (1,000 mbar)",
      agitatorStatus: "Gentle Blending (4 RPM)",
      activeValves: ["XV-102 (Aseptic Liquid Charge)"],
      criticalSensors: ["LIT-101 (Vessel Level)", "WIT-101 (Vessel Weight)"],
    },
    description: "Liquid API solution pumped through 0.22µm sterile filter into the pre-chilled cone under sterile nitrogen blanket.",
  },
  {
    id: "pre_cool",
    number: 5,
    name: "JACKET PRE-COOLING",
    tag: "PRE_COOL",
    group: "core",
    color: "#6366f1",
    triggerCondition: "Liquid charge confirmed and lid interlock ZS-101 active",
    exitCondition: "Product temperature reaches sub-zero liquid target (-5°C)",
    equipmentState: {
      jacketTemp: "-40°C (Syltherm XLT circulation)",
      chamberPressure: "950 mbar",
      agitatorStatus: "Continuous Scraper (6 RPM)",
      activeValves: ["TCU Freezing Cascade Active"],
      criticalSensors: ["TE-101 (Product Core RTD)", "TIC-201 (Jacket In)"],
    },
    description: "Rapidly circulates -40°C fluid through jacket. Wall-scraping ribbon agitator prevents ice crust freezing on wall.",
  },
  {
    id: "vif_freezing",
    number: 6,
    name: "VACUUM-INDUCED GRANULATION",
    tag: "VACUUM_INDUCED_FREEZING",
    group: "core",
    color: "#8b5cf6",
    triggerCondition: "Jacket at target freeze setpoint",
    exitCondition: "Core temperature drops below Glass Transition Tg' (-34°C)",
    equipmentState: {
      jacketTemp: "-52°C",
      chamberPressure: "Controlled flash draw (4.5 mbar)",
      agitatorStatus: "Orbital Thin-Bed Scraper (8 RPM)",
      activeValves: ["XV-301 (Fine Throttle Modulation)"],
      criticalSensors: ["TE-101 (API Core)", "JIT-101 (Agitator Motor Torque)"],
    },
    description: "Controlled vacuum pull flashes surface water while agitator shears the slush into uniform granular snow-like ice beads without bulk caking.",
  },
  {
    id: "primary_drying",
    number: 7,
    name: "PRIMARY SUBLIMATION DRYING",
    tag: "PRIMARY_DRYING",
    group: "core",
    color: "#ec4899",
    triggerCondition: "Product core fully solidified below Tg' (-34°C)",
    exitCondition: "PIT-101A (Capacitance) and PIT-101B (Pirani) convergence",
    equipmentState: {
      jacketTemp: "-10°C to +15°C (Ramped Sublimation Heat)",
      chamberPressure: "0.04 to 0.08 mbar",
      agitatorStatus: "Intermittent Pulsed Mixing (3 RPM, 30s on / 60s off)",
      activeValves: ["XV-301 (Full Open to -60°C Condenser)"],
      criticalSensors: ["PIT-101A vs PIT-101B (Dual Convergence)", "TE-101"],
    },
    description: "Ice sublimates directly to vapor. Heat supplied via jacket while agitator bed turnover increases drying rate by 400% vs static trays.",
  },
  {
    id: "secondary_drying",
    number: 8,
    name: "SECONDARY DESORPTION DRYING",
    tag: "SECONDARY_DRYING",
    group: "core",
    color: "#f43f5e",
    triggerCondition: "Dual pressure gauge convergence (PIT-101A/B delta < 0.03 mbar)",
    exitCondition: "Target residual moisture < 1.0% & hold time met (4 hrs)",
    equipmentState: {
      jacketTemp: "+35°C (Controlled Desorption Ramp)",
      chamberPressure: "0.010 mbar (Ultimate Base Vacuum)",
      agitatorStatus: "Gentle Periodic Turnover (2 RPM)",
      activeValves: ["Roots Blower + Dry Screw Pump Full Capacity"],
      criticalSensors: ["PIT-101A", "TE-101 (Product matches jacket temp)"],
    },
    description: "Removes tightly bound moisture by heating product to +35°C under ultimate high vacuum. Agitator ensures homogenous bulk temperature.",
  },
  {
    id: "filter_blowback",
    number: 9,
    name: "FILTER BLOWBACK & POST-BLEND",
    tag: "FILTER_BLOWBACK_POSTBLEND",
    group: "finish",
    color: "#d97706",
    triggerCondition: "Desorption hold time satisfied",
    exitCondition: "Blowback pulses complete (3 cycles) & homogeneity achieved",
    equipmentState: {
      jacketTemp: "+22°C (Cool down to room temp)",
      chamberPressure: "0.05 mbar",
      agitatorStatus: "Reverse Blending Rotation (6 RPM)",
      activeValves: ["XV-405 (N₂ Reverse Pulse Jet to Top Filter)"],
      criticalSensors: ["PDT-102 (Filter Differential Pressure)"],
    },
    description: "Pulsed sterile N₂ reverse blowback knocks fine powder back off vapor filters. Agitator reverse-blends the batch into final uniform powder.",
  },
  {
    id: "vacuum_break",
    number: 10,
    name: "STERILE VACUUM BREAK",
    tag: "VACUUM_BREAK",
    group: "finish",
    color: "#10b981",
    triggerCondition: "Post-blend complete and vessel cooled to ambient",
    exitCondition: "Chamber pressure reaches 1,010 mbar (PSH-101 trip)",
    equipmentState: {
      jacketTemp: "+20°C",
      chamberPressure: "Ramping from 0.01 mbar -> 1,010 mbar (Sterile N₂)",
      agitatorStatus: "Stopped",
      activeValves: ["XV-403 (Sterile N₂ Bleed via 0.2µm PTFE Filter)"],
      criticalSensors: ["PSH-101 (Atmospheric Pressure Confirmed)"],
    },
    description: "Breaks chamber vacuum strictly with sterile filtered nitrogen gas to protect sterile dry API from ambient air contamination.",
  },
  {
    id: "sterile_discharge",
    number: 11,
    name: "ASEPTIC POWDER DISCHARGE",
    tag: "STERILE_DISCHARGE",
    group: "finish",
    color: "#059669",
    triggerCondition: "Atmospheric pressure confirmed (PSH-101) & canister docked",
    exitCondition: "Vessel tare weight reached & discharge valve XV-105 closed",
    equipmentState: {
      jacketTemp: "+20°C",
      chamberPressure: "1,010 mbar (N₂ Overpressure +50 mbar)",
      agitatorStatus: "Downward Pushing Discharge Flight (5 RPM)",
      activeValves: ["XV-105 (Sanitary Ball-Segment Valve Open)"],
      criticalSensors: ["ZS-105 (Discharge Valve Full Open Position)"],
    },
    description: "Opens bottom inflatable-seal ball-segment valve. Ribbon screw rotates downward to discharge granular API powder into sterile canister.",
  },
  {
    id: "cip_wash",
    number: 12,
    name: "AUTOMATED CIP CLEANING",
    tag: "CIP_WASH",
    group: "clean",
    color: "#0284c7",
    triggerCondition: "Discharge valve confirmed closed & canister removed",
    exitCondition: "WFI conductivity rinse < 1.3 µS/cm at 25°C",
    equipmentState: {
      jacketTemp: "+65°C Rinse / Ambient Drain",
      chamberPressure: "Atmospheric vented",
      agitatorStatus: "Alternating Forward / Reverse Wash (12 RPM)",
      activeValves: ["XV-501 (WFI Rotary Spray Balls)", "XV-502 (CIP Drain)"],
      criticalSensors: ["QIT-501 (Conductivity Transmitter)"],
    },
    description: "Retractable 360° rotary spray heads deliver high-pressure WFI wash and detergent rinse, preparing machine for the next batch cycle.",
  },
  {
    id: "abort_sis",
    number: 13,
    name: "EMERGENCY SAFETY ABORT",
    tag: "ABORT",
    group: "safety",
    color: "#ef4444",
    triggerCondition: "SIS SIL 2 safety interlock trip (file 22)",
    exitCondition: "Fault cleared, vessel made safe & operator acknowledged",
    equipmentState: {
      jacketTemp: "TCU Circulation Locked Safe",
      chamberPressure: "Isolated / Emergency Vent",
      agitatorStatus: "Immediate Fast Stop (<0.5s)",
      activeValves: ["All Process Isolation Valves Tripped Safe"],
      criticalSensors: ["SIS SIL 2 Safety Loop Confirmed"],
    },
    description: "Hardwired safety shutdown triggered by overpressure (PSV), vacuum collapse, or cooling failure. BPCS yields to safety PLC.",
    isAbortBranch: true,
  },
];

export function FullBatchProcedureChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeStageId, setActiveStageId] = useState<string>("primary_drying");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const activeStage = BATCH_STAGES.find((s) => s.id === activeStageId) || BATCH_STAGES[6];

  const filteredStages =
    activeFilter === "all"
      ? BATCH_STAGES
      : BATCH_STAGES.filter((s) => s.group === activeFilter || s.isAbortBranch);

  return (
    <div className="my-8 not-prose rounded-3xl border border-hairline bg-bg-panel shadow-2xl overflow-hidden backdrop-blur-sm">
      {/* Top Header */}
      <div className="p-5 sm:p-6 border-b border-hairline bg-bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-500 font-bold flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5" />
              <span>ISA-88 Top-Level Batch State Machine</span>
            </span>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-ink-primary mt-1">
            Full Automated 14-Stage Batch Procedure
          </h3>
          <p className="text-xs text-ink-secondary mt-1">
            Complete supervisory sequence from initial SIP to sterile powder discharge and clean-in-place
          </p>
        </div>

        {/* Phase Group Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-bg-panel p-1 rounded-xl border border-hairline">
          {[
            { id: "all", label: "All 14 Stages" },
            { id: "prep", label: "Prep & SIP" },
            { id: "core", label: "Drying Core" },
            { id: "finish", label: "Discharge" },
            { id: "safety", label: "Safety SIS" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                activeFilter === tab.id
                  ? "bg-amber text-on-amber shadow-sm"
                  : "text-ink-secondary hover:text-ink-primary hover:bg-bg-hover"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Workspace: Horizontal Stepper Rail + Deep Inspector Card */}
      <div className="p-5 sm:p-7 space-y-6">
        {/* Stage Timeline Stepper Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-ink-dim">
            <span>PROCEDURAL PROGRESSION PIPELINE</span>
            <span>Click any phase node to inspect telemetry &amp; interlocks</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {filteredStages.map((stage) => {
              const isActive = stage.id === activeStage.id;
              const isAbort = stage.isAbortBranch;

              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStageId(stage.id)}
                  className={`relative p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group ${
                    isActive
                      ? isAbort
                        ? "bg-rose-500/15 border-rose-500 ring-2 ring-rose-500/40 shadow-lg"
                        : "bg-amber-subtle border-amber ring-2 ring-amber/40 shadow-lg -translate-y-0.5"
                      : "bg-bg-surface hover:bg-bg-hover border-hairline hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        isAbort
                          ? "bg-rose-500/20 text-rose-400"
                          : isActive
                          ? "bg-amber text-on-amber"
                          : "bg-bg-panel text-ink-dim"
                      }`}
                    >
                      {isAbort ? "TRIP" : `0${stage.number}`}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-amber animate-ping" />
                    )}
                  </div>

                  <div className="text-xs font-bold text-ink-primary group-hover:text-amber transition-colors line-clamp-2 leading-tight">
                    {stage.name}
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-hairline/40 text-[9px] font-mono text-ink-dim truncate">
                    {stage.tag}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Stage Deep Inspector Card */}
        <div className="rounded-3xl border-2 border-amber/40 bg-bg-surface p-5 sm:p-7 shadow-xl space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-hairline">
            <div className="flex items-start sm:items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-xl shadow-md shrink-0"
                style={{
                  backgroundColor: activeStage.isAbortBranch
                    ? "rgba(239, 68, 68, 0.15)"
                    : "color-mix(in srgb, var(--amber) 20%, var(--bg-panel))",
                  color: activeStage.isAbortBranch ? "#ef4444" : "var(--amber)",
                  borderColor: activeStage.isAbortBranch ? "#ef4444" : "var(--amber)",
                  borderWidth: 2,
                }}
              >
                {activeStage.isAbortBranch ? "!" : `0${activeStage.number}`}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber">
                    Phase Sequence {activeStage.number} of 13
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-bg-panel border border-hairline text-ink-dim">
                    State: {activeStage.tag}
                  </span>
                </div>
                <h4 className="text-lg sm:text-2xl font-black text-ink-primary mt-0.5">
                  {activeStage.name}
                </h4>
              </div>
            </div>

            {/* Stage navigation quick buttons */}
            <div className="flex items-center gap-2">
              <button
                disabled={activeStage.number <= 1}
                onClick={() => {
                  const prev = BATCH_STAGES.find((s) => s.number === activeStage.number - 1);
                  if (prev) setActiveStageId(prev.id);
                }}
                className="px-3 py-1.5 rounded-xl border border-hairline bg-bg-panel hover:bg-bg-hover text-xs font-mono font-bold text-ink-secondary disabled:opacity-30 disabled:pointer-events-none transition"
              >
                ← Prev Phase
              </button>
              <button
                disabled={activeStage.number >= BATCH_STAGES.length - 1}
                onClick={() => {
                  const next = BATCH_STAGES.find((s) => s.number === activeStage.number + 1);
                  if (next) setActiveStageId(next.id);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber text-on-amber text-xs font-mono font-bold shadow-md hover:scale-105 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                Next Phase →
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            {activeStage.description}
          </p>

          {/* Live Physical Equipment Telemetry State for this Phase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-bg-panel border border-hairline flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-ink-dim flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber" />
                <span>Jacket Temp (TIC-201)</span>
              </span>
              <span className="text-base font-mono font-bold text-amber mt-2">
                {activeStage.equipmentState.jacketTemp}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-bg-panel border border-hairline flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-ink-dim flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-cryo" />
                <span>Chamber Pressure (PIT-101A)</span>
              </span>
              <span className="text-base font-mono font-bold text-cryo mt-2">
                {activeStage.equipmentState.chamberPressure}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-bg-panel border border-hairline flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-ink-dim flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                <span>Agitator Flight Velocity</span>
              </span>
              <span className="text-base font-mono font-bold text-purple-400 mt-2">
                {activeStage.equipmentState.agitatorStatus}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-bg-panel border border-hairline flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-ink-dim flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Interlock Safety Status</span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 mt-2 truncate" title={activeStage.equipmentState.criticalSensors.join(", ")}>
                {activeStage.equipmentState.criticalSensors[0]}
              </span>
            </div>
          </div>

          {/* Transition Logic Gate (Entry & Exit Conditions) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-bg-panel border border-emerald-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-500 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PHASE ENTRY TRIGGER CONDITION</span>
                </div>
                <div className="text-sm font-semibold text-ink-primary mt-1">
                  {activeStage.triggerCondition}
                </div>
              </div>
              <div className="mt-3 text-[10px] font-mono text-ink-dim">
                Gate: Validated by supervisory recipe engine before sequencer advance
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-bg-panel border border-amber/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-amber font-bold mb-1">
                  <ArrowRight className="w-4 h-4" />
                  <span>PHASE COMPLETION / EXIT CRITERIA</span>
                </div>
                <div className="text-sm font-semibold text-ink-primary mt-1">
                  {activeStage.exitCondition}
                </div>
              </div>
              <div className="mt-3 text-[10px] font-mono text-ink-dim">
                Next Stage Handshake: Verifies physical sensor threshold convergence
              </div>
            </div>
          </div>

          {/* Active Process Valves list */}
          <div className="p-3.5 rounded-2xl bg-bg-panel border border-hairline flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <span className="text-ink-dim">Automated Actuator Commands:</span>
            <div className="flex flex-wrap items-center gap-2">
              {activeStage.equipmentState.activeValves.map((v, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-bg-surface border border-hairline font-bold text-ink-primary">
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
