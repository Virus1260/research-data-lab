"use client";

import React, { useState } from "react";
import {
  Layers,
  Shield,
  Cpu,
  Monitor,
  Database,
  Radio,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from "lucide-react";

interface HierarchyTier {
  level: number;
  title: string;
  subtitle: string;
  hardware: string;
  protocol: string;
  role: string;
  segregation: "Supervisory" | "BPCS" | "SIS (SIL 2)" | "Field";
  features: string[];
}

const TIERS: HierarchyTier[] = [
  {
    level: 3,
    title: "Level 3: Factory Historian, SCADA & MES",
    subtitle: "Enterprise Regulatory Compliance (21 CFR Part 11)",
    hardware: "Industrial Dell/HP Server Cluster, RAID-10 SQL Database",
    protocol: "OPC UA Secure Architecture (TLS 1.3) / HTTPS REST",
    role: "Centralized electronic batch records (eBR), immutable audit logs, dual electronic signatures, and historical process trending.",
    segregation: "Supervisory",
    features: [
      "Time-stamped audit trails for every parameter modification",
      "Cryptographic digital signatures (operator + supervisor)",
      "Automated PDF Monograph & batch report generation",
    ],
  },
  {
    level: 2,
    title: "Level 2: Supervisory HMI Station",
    subtitle: "Operator Process Visualization & Recipe Execution",
    hardware: "Siemens SIMATIC IPC477E 19\" Touch Panel / WinCC Unified",
    protocol: "Industrial Ethernet TCP/IP (1 Gbps)",
    role: "Real-time process visualization, faceplates, dynamic phase step transitions, and graphical alarm management.",
    segregation: "Supervisory",
    features: [
      "Multi-touch high-definition vector P&ID mimics",
      "Dynamic ISA-88 recipe phase sequencer display",
      "Alarm shelving, priority routing, and horn silencing",
    ],
  },
  {
    level: 1,
    title: "Level 1: Dual Segregated Controllers (BPCS vs. SIS)",
    subtitle: "Basic Process Control (S7-1500) & Fail-Safe Safety (S7-1500F)",
    hardware: "Siemens S7-1517-3 PN/DP + S7-1518F-4 PN/DP Safety PLC",
    protocol: "PROFINET IRT (Isochronous Real-Time) + PROFIsafe (SIL 2)",
    role: "Physical and logical segregation ensuring process automation loops cannot override emergency shutdown or relief logic.",
    segregation: "SIS (SIL 2)",
    features: [
      "BPCS: Executes PID temperature ramps, vacuum throttling, and agitator RPM",
      "SIS: Hardwired emergency stop relays, 1oo2 overpressure trips, rupture disk monitoring",
      "Safety cyclic check time: < 20 ms deterministic response",
    ],
  },
  {
    level: 0,
    title: "Level 0: Field Level Instruments & Actuators",
    subtitle: "Sanitary Sensors, Modulating Valves, Drives & Safety Barriers",
    hardware: "Capacitance Diaphragm Manometers, RTD PT100, VFDs, Pneumatic Valves",
    protocol: "4-20mA HART, IO-Link v1.1, NAMUR Proximity, Hardwired 24VDC",
    role: "Physical measurement and actuation in direct contact with pharmaceutical process boundaries.",
    segregation: "Field",
    features: [
      "Capacitance manometer (0.001–10 mbar) + Pirani gauge dual-point pair",
      "Air-to-Open spring-return isolation valves (<100ms fail-closed action)",
      "Double mechanical seal barrier fluid pressure transmitters",
    ],
  },
];

export function AutomationHierarchyChart() {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [safetyMode, setSafetyMode] = useState<boolean>(false);

  const activeTier = TIERS.find((t) => t.level === selectedLevel) || TIERS[1];

  return (
    <div className="my-8 rounded-3xl border border-hairline bg-bg-panel shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-hairline bg-bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-500 font-bold">
              ISA-95 Automation Pyramid • Physical Architecture
            </span>
          </div>
          <h3 className="text-xl font-black text-ink-primary mt-1">
            4-Tier Control & Safety Segregation Architecture
          </h3>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Compliant with IEC 61511 (SIL 2 Safety Instrumented Systems) and 21 CFR Part 11 Electronic Records.
          </p>
        </div>

        <button
          onClick={() => setSafetyMode(!safetyMode)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
            safetyMode
              ? "bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-sm"
              : "bg-bg-panel border-hairline text-ink-secondary hover:text-ink-primary hover:bg-bg-hover"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{safetyMode ? "Viewing SIS Safety Loops" : "Highlight Safety Loops"}</span>
        </button>
      </div>

      {/* Interactive Pyramid Tiers */}
      <div className="p-5 sm:p-7 space-y-3">
        {TIERS.map((tier) => {
          const isSelected = selectedLevel === tier.level;
          const isSafetyHighlighted = safetyMode && tier.segregation.includes("SIS");

          return (
            <div
              key={tier.level}
              onClick={() => setSelectedLevel(tier.level)}
              className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-200 relative ${
                isSelected
                  ? "ring-2 ring-amber border-amber bg-bg-surface shadow-xl -translate-y-0.5"
                  : isSafetyHighlighted
                  ? "border-rose-500/60 bg-rose-500/5 shadow-md"
                  : "border-hairline bg-bg-panel hover:bg-bg-hover"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                      tier.level === 1
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                        : "bg-bg-inset text-amber border border-hairline"
                    }`}
                  >
                    L{tier.level}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-ink-primary">
                      {tier.title}
                    </h4>
                    <p className="text-xs text-ink-muted">{tier.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${
                      tier.segregation.includes("SIS")
                        ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                        : "bg-bg-hover border-hairline text-ink-secondary"
                    }`}
                  >
                    {tier.segregation}
                  </span>
                  <span className="text-xs font-mono text-ink-dim hidden md:inline">
                    {tier.protocol.split("/")[0]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Tier Inspection Panel */}
      <div className="p-5 sm:p-6 border-t border-hairline bg-bg-surface">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-hairline">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-ink-muted">
              Tier Technical Specification
            </div>
            <h4 className="text-base font-bold text-ink-primary">{activeTier.title}</h4>
          </div>
          <div className="text-xs font-mono text-ink-secondary bg-bg-inset px-3 py-1 rounded-lg border border-hairline">
            Hardware: {activeTier.hardware}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed mb-4">
          {activeTier.role}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activeTier.features.map((feat, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-bg-panel border border-hairline text-xs text-ink-primary font-mono flex items-start gap-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
