"use client";

import React, { useState } from "react";
import { KatexEquation } from "@/components/exhibit/KatexEquation";
import { Layers, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

export interface EquationVariable {
  symbol: string;
  name: string;
  unit: string;
  role: string;
}

export interface GoverningEquationStepStackProps {
  step1Number?: number;
  step2Number?: number;
  equationTitle: string;
  latex: string;
  liveEvaluatedLatex?: string;
  liveEvaluatedTitle?: string;
  variables: EquationVariable[];
  variableCategoryLabel?: string;
  accentColor?: "amber" | "cyan" | "purple" | "emerald";
  defaultExpanded?: boolean;
  className?: string;
}

export function GoverningEquationStepStack({
  step1Number = 1,
  step2Number = 2,
  equationTitle,
  latex,
  liveEvaluatedLatex,
  liveEvaluatedTitle = "Live Parameter Evaluation",
  variables,
  variableCategoryLabel = "Dimensional Symbols & Descriptions",
  accentColor = "amber",
  defaultExpanded = false,
  className = "",
}: GoverningEquationStepStackProps) {
  const [isUnstacked, setIsUnstacked] = useState(defaultExpanded);

  // Accent styling tokens
  const accentStyles = {
    amber: {
      badge: "bg-amber text-on-amber",
      borderHover: "hover:border-amber/60",
      activePill: "bg-amber/15 text-amber border-amber/40",
      varBadge: "bg-amber/15 text-amber border-amber/30",
      liveBg: "bg-amber-subtle/20 dark:bg-amber-subtle/30",
      liveBorder: "border-amber/40",
      liveText: "text-amber",
      liveDot: "bg-amber",
    },
    cyan: {
      badge: "bg-cyan-600 text-white",
      borderHover: "hover:border-cyan-500/60",
      activePill: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/40",
      varBadge: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
      liveBg: "bg-cyan-500/10 dark:bg-cyan-950/30",
      liveBorder: "border-cyan-500/40",
      liveText: "text-cyan-600 dark:text-cyan-400",
      liveDot: "bg-cyan-500",
    },
    purple: {
      badge: "bg-purple-600 text-white",
      borderHover: "hover:border-purple-500/60",
      activePill: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/40",
      varBadge: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
      liveBg: "bg-purple-500/10 dark:bg-purple-950/30",
      liveBorder: "border-purple-500/40",
      liveText: "text-purple-600 dark:text-purple-400",
      liveDot: "bg-purple-500",
    },
    emerald: {
      badge: "bg-emerald-600 text-white",
      borderHover: "hover:border-emerald-500/60",
      activePill: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40",
      varBadge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      liveBg: "bg-emerald-500/10 dark:bg-emerald-950/30",
      liveBorder: "border-emerald-500/40",
      liveText: "text-emerald-600 dark:text-emerald-400",
      liveDot: "bg-emerald-500",
    },
  }[accentColor];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* STEP 1: ORIGINAL GOVERNING EQUATION CARD (Stack Parent) */}
      <div className="relative group">
        {/* Layered Card Deck Visual Cues (Visible when stacked behind) */}
        {!isUnstacked && (
          <>
            <div
              className="absolute -bottom-1.5 inset-x-3 h-2 rounded-b-xl bg-bg-panel/80 border-b border-x border-hairline -z-10 shadow-xs transition-all duration-200 group-hover:-bottom-2"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-3 inset-x-6 h-2 rounded-b-xl bg-bg-panel/50 border-b border-x border-hairline -z-20 shadow-xs transition-all duration-200 group-hover:-bottom-3.5"
              aria-hidden="true"
            />
          </>
        )}

        {/* Main Equation Card */}
        <div
          onClick={() => setIsUnstacked(!isUnstacked)}
          className={`p-4 sm:p-5 rounded-xl bg-bg-surface border border-hairline transition-all duration-200 cursor-pointer select-none shadow-xs ${accentStyles.borderHover} ${
            isUnstacked ? "ring-1 ring-cyan-500/30" : ""
          }`}
          role="button"
          tabIndex={0}
          aria-expanded={isUnstacked}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsUnstacked(!isUnstacked);
            }
          }}
          title={isUnstacked ? "Click to restack variable definitions behind equation" : "Click to unstack variable definitions"}
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline pb-2.5 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`w-5 h-5 rounded-full ${accentStyles.badge} text-[11px] font-mono font-bold flex items-center justify-center shrink-0`}>
                {step1Number}
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-primary">
                Original Governing Equation (Pure Formulation)
              </span>
              <span className="text-[11px] font-mono text-ink-muted">
                • {equationTitle}
              </span>
            </div>

            {/* Interactive Unstacking Pill / Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border transition-all ${
                  isUnstacked
                    ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/40 shadow-xs"
                    : "bg-bg-panel text-ink-secondary border-hairline group-hover:border-cyan-500/40 group-hover:text-cyan-600 dark:group-hover:text-cyan-400"
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isUnstacked ? "Hide What is What" : `What is What (${variables.length})`}
                </span>
                {isUnstacked ? (
                  <ChevronUp className="w-3.5 h-3.5 shrink-0 transition-transform" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-y-0.5" />
                )}
              </span>
            </div>
          </div>

          {/* Equation Body: Single or Dual View */}
          {liveEvaluatedLatex ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-2">
              <div className="p-3.5 rounded-lg bg-bg-panel border border-hairline flex flex-col justify-center items-center text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-ink-dim font-bold mb-1">
                  Theoretical Formulation
                </span>
                <div className="py-1 overflow-x-auto w-full">
                  <KatexEquation expression={latex} displayMode />
                </div>
              </div>
              <div className={`p-3.5 rounded-lg ${accentStyles.liveBg} border-2 ${accentStyles.liveBorder} flex flex-col justify-center items-center text-center relative overflow-hidden`}>
                <div className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest ${accentStyles.liveText} font-bold mb-1`}>
                  <span className={`w-2 h-2 rounded-full ${accentStyles.liveDot} animate-pulse`} />
                  <span>{liveEvaluatedTitle}</span>
                </div>
                <div className="py-1 overflow-x-auto w-full text-ink-primary font-bold">
                  <KatexEquation expression={liveEvaluatedLatex} displayMode />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-3 px-4 rounded-lg bg-bg-panel border border-hairline overflow-x-auto text-center font-medium my-2">
              <KatexEquation expression={latex} displayMode />
            </div>
          )}

          {/* Bottom Card Footer Hint */}
          <div className="flex items-center justify-between text-[10px] font-mono text-ink-muted pt-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-500" />
              {isUnstacked
                ? "Variable deck unstacked below • Click anywhere on this card to restack"
                : "Variable deck stacked behind • Click card to unstack definitions"}
            </span>
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold underline underline-offset-2">
              {isUnstacked ? "Stack Behind ▴" : "Unstack Variables ▾"}
            </span>
          </div>
        </div>
      </div>

      {/* STEP 2: WHAT IS WHAT (Variable Definitions & Physical Units) - Unstacked with Smooth Transition */}
      {isUnstacked && (
        <div className="animate-in fade-in slide-in-from-top-3 duration-300 p-4 sm:p-5 rounded-xl bg-bg-surface border-2 border-cyan-500/30 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-hairline pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] font-mono font-bold flex items-center justify-center">
                {step2Number}
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-primary">
                What is What (Variable Definitions & Physical Units)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hidden sm:inline">
                {variableCategoryLabel}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUnstacked(false);
                }}
                className="text-[11px] font-mono px-2 py-0.5 rounded border border-hairline bg-bg-panel hover:bg-bg-hover text-ink-muted hover:text-ink-primary transition cursor-pointer flex items-center gap-1"
                title="Restack behind Original Equation"
              >
                <ChevronUp className="w-3 h-3" />
                <span>Stack Behind</span>
              </button>
            </div>
          </div>

          {/* Grid of Variables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {variables.map((v, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-bg-panel border border-hairline flex flex-col justify-between hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`px-2 py-0.5 rounded ${accentStyles.varBadge} text-xs font-mono font-bold`}>
                    <KatexEquation expression={v.symbol} />
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-bg-surface border border-hairline text-[10px] font-mono text-ink-muted">
                    {v.unit}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-ink-primary mb-1">{v.name}</div>
                  <div className="text-[11px] text-ink-secondary leading-relaxed">{v.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
