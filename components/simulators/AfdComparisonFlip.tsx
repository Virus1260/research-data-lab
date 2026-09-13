"use client";

import React, { useState } from "react";
import { ArrowLeftRight, Check, X, ShieldAlert, Sparkles, Layers, RefreshCw } from "lucide-react";

export function AfdComparisonFlip() {
  const [activeView, setActiveView] = useState<"afd" | "generic" | "sideBySide">("sideBySide");

  const comparisonData = [
    {
      feature: "Product Physical Form",
      generic: "Caked freeze-dried block inside glass vials or shallow trays",
      genericStatus: false,
      afd: "Free-flowing fine dry powder directly dischargeable into bags/bins",
      afdStatus: true,
    },
    {
      feature: "Vessel Mechanical Geometry",
      generic: "Rectangular or cylindrical chamber with multiple stacked static shelves",
      genericStatus: false,
      afd: "Downward-conical jacketed vessel with rotating wall-scraping agitator (Nauta family)",
      afdStatus: true,
    },
    {
      feature: "Heat Transfer Mechanism",
      generic: "Stationary conduction through tray bottom and vial glass (poor contact U ≈ 10–15 W/m²K)",
      genericStatus: false,
      afd: "Continuous particle renewal against heated jacket (stirred contact U ≈ 30–60 W/m²K)",
      afdStatus: true,
    },
    {
      feature: "Process Step Count",
      generic: "Multi-step: Formulation → Filling vials → Lyophilisation → Milling/Crushing cakes",
      genericStatus: false,
      afd: "One-pot: Liquid/paste charge → Freezing → Sublimation → Loose powder discharge",
      afdStatus: true,
    },
    {
      feature: "Ice Condenser Location",
      generic: "Separate external condenser chamber connected via large isolation butterfly valve",
      genericStatus: false,
      afd: "Integrated directly above or beside vessel, paired with cyclonic dust collector",
      afdStatus: true,
    },
    {
      feature: "Operator Exposure / Containment",
      generic: "High risk during manual tray loading and dry cake removal (requires isolator)",
      genericStatus: false,
      afd: "Closed containment (OEB 4/5 compatible), automatic bottom-valve discharge",
      afdStatus: true,
    },
  ];

  return (
    <div className="instrument-card rounded-2xl p-5 my-6 border border-white/10 bg-[#0D0F12]/90 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-signal animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-signal">
              Simulator 08 • Chapter 03
            </span>
          </div>
          <h3 className="text-lg font-medium text-ink-primary mt-1">
            AFD vs. Conventional Shelf Lyophilizer Architecture Comparison
          </h3>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-xs">
          <button
            onClick={() => setActiveView("sideBySide")}
            className={`px-3 py-1 rounded-lg transition font-mono ${
              activeView === "sideBySide"
                ? "bg-amber-signal/20 text-amber-bright border border-amber-signal/40 font-bold"
                : "text-ink-muted hover:text-ink-secondary"
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setActiveView("afd")}
            className={`px-3 py-1 rounded-lg transition font-mono ${
              activeView === "afd"
                ? "bg-amber-signal/20 text-amber-bright border border-amber-signal/40 font-bold"
                : "text-ink-muted hover:text-ink-secondary"
            }`}
          >
            Hosokawa AFD
          </button>
          <button
            onClick={() => setActiveView("generic")}
            className={`px-3 py-1 rounded-lg transition font-mono ${
              activeView === "generic"
                ? "bg-amber-signal/20 text-amber-bright border border-amber-signal/40 font-bold"
                : "text-ink-muted hover:text-ink-secondary"
            }`}
          >
            Generic Shelf
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="space-y-3">
        {comparisonData.map((row, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-xl bg-[#08090A] border border-white/5 hover:border-white/10 transition"
          >
            {/* Feature Name */}
            <div className="md:col-span-4 flex items-center gap-2">
              <span className="font-mono text-xs text-amber-signal font-semibold">
                {row.feature}
              </span>
            </div>

            {/* Generic Shelf column */}
            {(activeView === "sideBySide" || activeView === "generic") && (
              <div
                className={`${
                  activeView === "sideBySide" ? "md:col-span-4" : "md:col-span-8"
                } p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-ink-muted flex items-start gap-2`}
              >
                <X className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-mono text-ink-dim uppercase">
                    Conventional Shelf Dryer
                  </div>
                  <div>{row.generic}</div>
                </div>
              </div>
            )}

            {/* Hosokawa AFD column */}
            {(activeView === "sideBySide" || activeView === "afd") && (
              <div
                className={`${
                  activeView === "sideBySide" ? "md:col-span-4" : "md:col-span-8"
                } p-2.5 rounded-lg bg-amber-signal/[0.04] border border-amber-signal/20 text-xs text-ink-primary flex items-start gap-2`}
              >
                <Check className="w-4 h-4 text-amber-signal shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-mono text-amber-signal uppercase font-bold">
                    Hosokawa AFD Architecture
                  </div>
                  <div>{row.afd}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hero Finding Quote Callout */}
      <div className="mt-4 p-3 rounded-xl bg-amber-signal/10 border border-amber-signal/30 text-xs text-ink-secondary flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-signal shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-bright">The Core Insight: </span>
          The AFD is fundamentally a mechanical mixer operating as a vacuum freeze dryer. Because the bed is continuously agitated, heat transfer is not limited by frozen cake thickness, and product discharges as ready-to-use bulk powder.
        </div>
      </div>
    </div>
  );
}
