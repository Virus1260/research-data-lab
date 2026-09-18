"use client";

import React, { useState } from "react";
import { Tag, ArrowDown, Activity, ShieldAlert, Cpu, Radio, Gauge, Check } from "lucide-react";
import { useTheme } from "../layout/ThemeProvider";

interface TagExample {
  tag: string;
  first: string;
  firstMeaning: string;
  firstDesc: string;
  modifiers: string;
  modifiersMeaning: string;
  modifiersDesc: string;
  loop: string;
  loopDesc: string;
  suffix: string;
  suffixDesc: string;
  role: string;
  isSafety?: boolean;
}

const PRESET_TAGS: TagExample[] = [
  {
    tag: "PIT-101A",
    first: "P",
    firstMeaning: "Pressure / Vacuum",
    firstDesc: "Chamber absolute pressure sensor (0.01 to 2,000 mbar)",
    modifiers: "IT",
    modifiersMeaning: "Indicating Transmitter",
    modifiersDesc: "Continuously transmits 4-20mA / HART signal to PLC and HMI",
    loop: "101",
    loopDesc: "Primary Freeze-Drying Chamber & Agitator Vessel Loop",
    suffix: "A",
    suffixDesc: "Primary redundant channel (paired with capacitance manometer 101B)",
    role: "Process Monitoring & Dual-Gauge Pirani Convergence",
  },
  {
    tag: "TIC-201",
    first: "T",
    firstMeaning: "Temperature",
    firstDesc: "Vessel jacket heat-transfer fluid temperature sensor (PT100 RTD)",
    modifiers: "IC",
    modifiersMeaning: "Indicating Controller",
    modifiersDesc: "Compares RTD reading to recipe setpoint and outputs 0-100% TCU valve command",
    loop: "201",
    loopDesc: "Thermal Control Unit (TCU) Heating & Freezing Circulation Skid",
    suffix: "",
    suffixDesc: "Single primary loop controller",
    role: "Active Shelf/Jacket Sublimation Heat Regulation",
  },
  {
    tag: "PSV-102",
    first: "P",
    firstMeaning: "Pressure",
    firstDesc: "Vessel overpressure protection relief device",
    modifiers: "SV",
    modifiersMeaning: "Safety Valve",
    modifiersDesc: "Mechanical spring-loaded rupture/relief disc (trips autonomously at 2.5 bar)",
    loop: "102",
    loopDesc: "Primary Chamber ASME Section VIII Relief Header",
    suffix: "",
    suffixDesc: "Dedicated mechanical safety device",
    role: "Safety Instrumented Autonomous Vessel Overpressure Relief",
    isSafety: true,
  },
  {
    tag: "XV-301",
    first: "X",
    firstMeaning: "Unclassified / On-Off",
    firstDesc: "Vapor path rapid isolation actuator",
    modifiers: "V",
    modifiersMeaning: "Valve",
    modifiersDesc: "Pneumatic split-second butterfly throttle valve (<250ms closing)",
    loop: "301",
    loopDesc: "DN400 Main Vapor Spool & Condenser Isolation Line",
    suffix: "",
    suffixDesc: "Automated isolation point",
    role: "Barometric Isolation during Pressure Rise Testing (PRT)",
  },
];

export function IsaTagAnatomyChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedTagIndex, setSelectedTagIndex] = useState<number>(0);

  const current = PRESET_TAGS[selectedTagIndex];

  return (
    <div className="my-8 not-prose rounded-3xl border border-hairline bg-bg-panel shadow-2xl overflow-hidden backdrop-blur-sm">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 border-b border-hairline bg-bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber font-bold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>ANSI / ISA-5.1 Specification Standard</span>
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-ink-primary mt-1">
            Interactive Instrument Tag Architecture &amp; Decoding Matrix
          </h3>
        </div>

        {/* Preset Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-ink-dim mr-1 uppercase">Sample Tag:</span>
          {PRESET_TAGS.map((p, idx) => {
            const isSelected = idx === selectedTagIndex;
            return (
              <button
                key={p.tag}
                onClick={() => setSelectedTagIndex(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  isSelected
                    ? "bg-amber text-on-amber shadow-sm scale-105"
                    : "bg-bg-surface hover:bg-bg-hover text-ink-secondary border border-hairline"
                }`}
              >
                {p.tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Visual Breakdown Container */}
      <div className="p-5 sm:p-7 space-y-6">
        {/* The Instrument Tag Pill Anatomy Visual */}
        <div className="flex flex-col items-center">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-dim mb-3">
            Syntactic Tag Segmentation
          </div>

          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-bg-inset border border-hairline shadow-inner max-w-full">
            {/* 1. First Letter */}
            <div className="flex flex-col items-center">
              <div className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-amber-subtle border-2 border-amber shadow-md flex items-center gap-1.5">
                <span className="text-lg sm:text-2xl font-black font-mono text-amber">
                  {current.first}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase font-bold text-amber mt-1.5">
                First Letter
              </span>
            </div>

            {/* 2. Modifier / Action Letters */}
            <div className="flex flex-col items-center">
              <div className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-cryo-subtle border-2 border-cryo shadow-md flex items-center gap-1.5">
                <span className="text-lg sm:text-2xl font-black font-mono text-cryo">
                  {current.modifiers}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase font-bold text-cryo mt-1.5">
                Function Letters
              </span>
            </div>

            {/* Separator Dash */}
            <div className="text-2xl font-black font-mono text-ink-dim pb-5">-</div>

            {/* 3. Loop Number */}
            <div className="flex flex-col items-center">
              <div className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-purple-500/10 border-2 border-purple-500 shadow-md flex items-center gap-1.5">
                <span className="text-lg sm:text-2xl font-black font-mono text-purple-400">
                  {current.loop}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase font-bold text-purple-400 mt-1.5">
                Loop Number
              </span>
            </div>

            {/* 4. Suffix (if present) */}
            {current.suffix && (
              <div className="flex flex-col items-center">
                <div className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-emerald-500/10 border-2 border-emerald-500 shadow-md flex items-center gap-1.5">
                  <span className="text-lg sm:text-2xl font-black font-mono text-emerald-400">
                    {current.suffix}
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 mt-1.5">
                  Channel / Suffix
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Downward Connector Guide Lines */}
        <div className="flex justify-center text-ink-dim">
          <ArrowDown className="w-5 h-5 text-amber animate-bounce" />
        </div>

        {/* 4 Clean Semantic Cards with Zero ASCII Character Clubbing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: What it measures */}
          <div className="p-4 rounded-2xl border-2 border-amber/30 bg-amber-subtle/30 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-amber font-bold mb-1.5">
                <span>WHAT IT MEASURES</span>
                <Gauge className="w-4 h-4" />
              </div>
              <div className="text-base font-bold text-ink-primary">
                {current.firstMeaning}
              </div>
              <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
                {current.firstDesc}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-amber/20 text-[10px] font-mono text-ink-dim">
              Code: <span className="font-bold text-amber">{current.first}</span> (Variable)
            </div>
          </div>

          {/* Card 2: What it does */}
          <div className="p-4 rounded-2xl border-2 border-cryo/30 bg-cryo-subtle/30 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-cryo font-bold mb-1.5">
                <span>WHAT IT DOES</span>
                <Radio className="w-4 h-4" />
              </div>
              <div className="text-base font-bold text-ink-primary">
                {current.modifiersMeaning}
              </div>
              <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
                {current.modifiersDesc}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-cryo/20 text-[10px] font-mono text-ink-dim">
              Function: <span className="font-bold text-cryo">{current.modifiers}</span> (Role)
            </div>
          </div>

          {/* Card 3: Which Loop */}
          <div className="p-4 rounded-2xl border-2 border-purple-500/30 bg-purple-500/10 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-purple-400 font-bold mb-1.5">
                <span>WHICH CONTROL LOOP</span>
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-base font-bold text-ink-primary">
                Loop #{current.loop}
              </div>
              <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
                {current.loopDesc}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-purple-500/20 text-[10px] font-mono text-ink-dim">
              Subsystem Index: <span className="font-bold text-purple-400">{current.loop}</span>
            </div>
          </div>

          {/* Card 4: Suffix / Redundancy */}
          <div className="p-4 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/10 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold mb-1.5">
                <span>REDUNDANCY / CHANNEL</span>
                <Activity className="w-4 h-4" />
              </div>
              <div className="text-base font-bold text-ink-primary">
                {current.suffix ? `Channel "${current.suffix}"` : "Single Instrument"}
              </div>
              <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
                {current.suffixDesc}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-500/20 text-[10px] font-mono text-ink-dim">
              Safety Verification: <span className="font-bold text-emerald-400">{current.suffix || "None"}</span>
            </div>
          </div>
        </div>

        {/* Synthesis Translation Callout */}
        <div className="p-4 rounded-2xl bg-bg-surface border border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-subtle text-amber shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <span className="text-ink-dim">Full Decoded Plain-English Sentence:</span>
              <div className="text-sm font-bold text-ink-primary mt-0.5">
                <span className="text-amber">{current.tag}</span> is a{" "}
                <span className="text-ink-primary font-bold">{current.firstMeaning}</span>{" "}
                <span className="text-cryo font-bold">{current.modifiersMeaning}</span> in{" "}
                <span className="text-purple-400 font-bold">Loop {current.loop}</span>{" "}
                ({current.role})
              </div>
            </div>
          </div>

          {current.isSafety && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 font-bold text-[11px] shrink-0">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SIS Safety Instrumented Function</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
