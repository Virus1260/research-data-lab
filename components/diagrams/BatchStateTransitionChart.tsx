"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  AlertOctagon,
  CheckCircle,
  RotateCcw,
  Activity,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

type BatchState = "IDLE" | "STARTING" | "RUNNING" | "HOLDING" | "HELD" | "RESTARTING" | "COMPLETING" | "COMPLETE" | "ABORTED";

interface StateInfo {
  state: BatchState;
  color: string;
  category: "quiescent" | "transient" | "safety";
  description: string;
  entryCriteria: string;
  activeActuators: string;
  exitCriteria: string;
}

const STATES: Record<BatchState, StateInfo> = {
  IDLE: {
    state: "IDLE",
    color: "#64748B",
    category: "quiescent",
    description: "System sanitized, leak-checked, and waiting in steady state for recipe initiation.",
    entryCriteria: "CIP/SIP validation passes; vacuum integrity test verified (<0.01 mbar·L/s).",
    activeActuators: "All process valves closed; vacuum train off; agitator stationary.",
    exitCriteria: "Operator START command or batch recipe launch triggered from HMI.",
  },
  STARTING: {
    state: "STARTING",
    color: "#0EA5E9",
    category: "transient",
    description: "Pre-conditioning utilities, pre-cooling condenser coils to -60°C, establishing jacket boundary temperatures.",
    entryCriteria: "START command received; safety interlocks verified normal.",
    activeActuators: "Refrigeration high/low compressors start; TCU circulating pump runs at 50% flow.",
    exitCriteria: "Ice condenser reaches ≤ -60°C and vessel jacket stabilizes at target freezing temp.",
  },
  RUNNING: {
    state: "RUNNING",
    color: "#10B981",
    category: "transient",
    description: "Active processing: liquid atomization, freeze crystallization, deep vacuum sublimation, and agitated desorption.",
    entryCriteria: "Condenser cold; formulation dosing initiated.",
    activeActuators: "Agitator rotates at 5–15 RPM; roots + dry screw vacuum train running at 0.04 mbar; TCU heat ramp active.",
    exitCriteria: "Phase timer complete or comparative manometry endpoint detected (ΔP ≤ 3%).",
  },
  HOLDING: {
    state: "HOLDING",
    color: "#F59E0B",
    category: "transient",
    description: "Graceful process pause initiated by operator or non-critical process deviation.",
    entryCriteria: "Hold command or warning threshold exceeded (e.g. minor pressure deviation).",
    activeActuators: "TCU freezes temperature ramp at current value; agitator slows to idle 3 RPM.",
    exitCriteria: "Equipment holds safe static condition.",
  },
  HELD: {
    state: "HELD",
    color: "#D97706",
    category: "quiescent",
    description: "Steady-state hold protecting API product from collapse while awaiting operator resolution.",
    entryCriteria: "All actuators transition into safe hold positions.",
    activeActuators: "Vessel jacket maintains holding temperature; vacuum isolation valve remains in position.",
    exitCriteria: "Operator un-hold / restart command.",
  },
  RESTARTING: {
    state: "RESTARTING",
    color: "#0284C7",
    category: "transient",
    description: "Controlled re-ramp returning equipment to active RUNNING state.",
    entryCriteria: "RESTART command executed; all process permissives verified green.",
    activeActuators: "Agitator accelerates to setpoint; TCU resumes programmed ramp.",
    exitCriteria: "Operating conditions restored to recipe curve.",
  },
  COMPLETING: {
    state: "COMPLETING",
    color: "#8B5CF6",
    category: "transient",
    description: "Final phase execution: vacuum isolation, sterile N2 gas break to 1013 mbar, bottom valve discharge.",
    entryCriteria: "Secondary drying complete (residual moisture < 1%).",
    activeActuators: "Vacuum valve slams shut; N2 bleed valve modulates to 1 atm; bottom ball segment valve opens.",
    exitCriteria: "Powder discharged into canister and confirmed empty.",
  },
  COMPLETE: {
    state: "COMPLETE",
    color: "#059669",
    category: "quiescent",
    description: "Batch cycle successfully finished; electronic batch record signed and archived.",
    entryCriteria: "Product canister sealed and transferred to isolator.",
    activeActuators: "All utilities isolated; system ready for CIP.",
    exitCriteria: "Operator acknowledge & e-signature.",
  },
  ABORTED: {
    state: "ABORTED",
    color: "#EF4444",
    category: "safety",
    description: "Emergency shutdown triggered by hardwired Safety Instrumented System (SIS SIL 2).",
    entryCriteria: "Emergency stop pressed, rupture disk burst, or critical pressure excursion (>0.3 mbar).",
    activeActuators: "All heating killed; vacuum isolation valve spring-closed (<100ms); agitator emergency braked.",
    exitCriteria: "Requires maintenance key-switch reset and quality deviation root-cause sign-off.",
  },
};

export function BatchStateTransitionChart() {
  const [currentState, setCurrentState] = useState<BatchState>("RUNNING");
  const [selectedState, setSelectedState] = useState<BatchState>("RUNNING");

  const info = STATES[selectedState];

  const advanceState = () => {
    switch (currentState) {
      case "IDLE":
        setCurrentState("STARTING");
        setSelectedState("STARTING");
        break;
      case "STARTING":
        setCurrentState("RUNNING");
        setSelectedState("RUNNING");
        break;
      case "RUNNING":
        setCurrentState("COMPLETING");
        setSelectedState("COMPLETING");
        break;
      case "COMPLETING":
        setCurrentState("COMPLETE");
        setSelectedState("COMPLETE");
        break;
      case "COMPLETE":
        setCurrentState("IDLE");
        setSelectedState("IDLE");
        break;
      case "HOLDING":
        setCurrentState("HELD");
        setSelectedState("HELD");
        break;
      case "HELD":
        setCurrentState("RESTARTING");
        setSelectedState("RESTARTING");
        break;
      case "RESTARTING":
        setCurrentState("RUNNING");
        setSelectedState("RUNNING");
        break;
      case "ABORTED":
        setCurrentState("IDLE");
        setSelectedState("IDLE");
        break;
    }
  };

  const triggerHold = () => {
    if (currentState === "RUNNING") {
      setCurrentState("HOLDING");
      setSelectedState("HOLDING");
    } else if (currentState === "HELD") {
      setCurrentState("RESTARTING");
      setSelectedState("RESTARTING");
    }
  };

  const triggerAbort = () => {
    setCurrentState("ABORTED");
    setSelectedState("ABORTED");
  };

  return (
    <div className="my-8 rounded-3xl border border-hairline bg-bg-panel shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Header & Controls */}
      <div className="p-5 sm:p-6 border-b border-hairline bg-bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber font-bold">
              ISA-88 Batch State Engine Simulator
            </span>
          </div>
          <h3 className="text-xl font-black text-ink-primary mt-1">
            Deterministic Operating Phase State Machine
          </h3>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Click any state node to inspect transition rules, or test cycle transitions with live simulation buttons.
          </p>
        </div>

        {/* Live Simulator Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={advanceState}
            className="px-3.5 py-1.5 rounded-xl bg-amber text-on-amber text-xs font-mono font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-md"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Step State</span>
          </button>
          <button
            onClick={triggerHold}
            className="px-3 py-1.5 rounded-xl bg-bg-hover border border-hairline text-xs font-mono font-semibold text-ink-secondary hover:text-ink-primary transition-all flex items-center gap-1"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Hold / Resume</span>
          </button>
          <button
            onClick={triggerAbort}
            className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs font-mono font-bold text-rose-400 hover:bg-rose-500/25 transition-all flex items-center gap-1"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>SIS Trip</span>
          </button>
        </div>
      </div>

      {/* State Nodes Flow */}
      <div className="p-5 sm:p-7 space-y-4">
        {/* Main Primary Lifecycle Path */}
        <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
          Nominal Sequential Recipe Path:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(["IDLE", "STARTING", "RUNNING", "COMPLETING", "COMPLETE"] as BatchState[]).map((st) => {
            const isCurrent = currentState === st;
            const isSelected = selectedState === st;
            return (
              <div
                key={st}
                onClick={() => setSelectedState(st)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 relative ${
                  isCurrent
                    ? "ring-2 ring-emerald-400 border-emerald-400 bg-emerald-500/10 shadow-lg -translate-y-0.5"
                    : isSelected
                    ? "ring-2 ring-amber border-amber bg-bg-surface shadow-md"
                    : "border-hairline bg-bg-panel hover:bg-bg-hover"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-ink-muted">Phase</span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
                <div className="text-xs sm:text-sm font-bold font-mono text-ink-primary">
                  {st}
                </div>
                {isCurrent && (
                  <div className="mt-1 text-[9px] font-mono text-emerald-400 font-bold uppercase">
                    • Active State
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Exception & Recovery Branches */}
        <div className="pt-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-2">
            Exception & Emergency Safety Branches:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["HOLDING", "HELD", "RESTARTING", "ABORTED"] as BatchState[]).map((st) => {
              const isCurrent = currentState === st;
              const isSelected = selectedState === st;
              const isAborted = st === "ABORTED";
              return (
                <div
                  key={st}
                  onClick={() => setSelectedState(st)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isCurrent
                      ? isAborted
                        ? "ring-2 ring-rose-500 border-rose-500 bg-rose-500/15 shadow-lg"
                        : "ring-2 ring-amber border-amber bg-amber-500/10 shadow-md"
                      : isSelected
                      ? "ring-1 ring-ink-muted border-border-strong bg-bg-surface"
                      : "border-hairline bg-bg-inset hover:bg-bg-hover"
                  }`}
                >
                  <div className="text-xs font-mono font-bold text-ink-secondary">
                    {st}
                  </div>
                  <div className="text-[10px] font-mono text-ink-muted mt-0.5">
                    {isAborted ? "Hardwired SIS Emergency" : "Operator Hold Branch"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected State Technical Detail Drawer */}
      <div className="p-5 sm:p-6 border-t border-hairline bg-bg-surface">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-hairline">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: info.color }}
            />
            <h4 className="text-base font-bold font-mono text-ink-primary">
              State: {info.state}
            </h4>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-bg-inset border border-hairline text-ink-muted">
            {info.category}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed mb-4">
          {info.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-bg-panel border border-hairline space-y-1">
            <span className="text-[10px] text-ink-muted uppercase tracking-wider font-bold block">
              Entry Conditions
            </span>
            <p className="text-ink-secondary">{info.entryCriteria}</p>
          </div>

          <div className="p-3 rounded-xl bg-bg-panel border border-hairline space-y-1">
            <span className="text-[10px] text-ink-muted uppercase tracking-wider font-bold block">
              Active Actuator Actions
            </span>
            <p className="text-sky-400">{info.activeActuators}</p>
          </div>

          <div className="p-3 rounded-xl bg-bg-panel border border-hairline space-y-1">
            <span className="text-[10px] text-ink-muted uppercase tracking-wider font-bold block">
              Exit / Transition Triggers
            </span>
            <p className="text-amber">{info.exitCriteria}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
