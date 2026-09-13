"use client";

import React, { useState } from "react";
import { Play, Pause, RotateCcw, Thermometer, Gauge, Clock, ShieldCheck } from "lucide-react";

export function CycleProfileScrubber() {
  const [timeHours, setTimeHours] = useState<number>(14.5); // Default in primary drying
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Total cycle length: 36 hours
  const totalHours = 36;

  // Compute temperatures and pressure across cycle
  let stageName = "1. Loading & Purging";
  let stageDesc = "Product charged under sanitary laminar flow; vessel inerted with N2.";
  let stageColor = "#8A91A0";
  let jacketT = 20;
  let productT = 20;
  let chamberP = 1013;

  if (timeHours <= 2) {
    stageName = "1. Loading & Inertization";
    stageDesc = "Product charged, agitator started at 15 RPM, vessel purged with dry N2.";
    stageColor = "#8A91A0";
    jacketT = 20 - (timeHours / 2) * 20; // 20°C down to 0°C
    productT = 20 - (timeHours / 2) * 15; // 20°C down to 5°C
    chamberP = 1013;
  } else if (timeHours <= 8) {
    stageName = "2. Agitated Freezing Stage";
    stageDesc = "Cryogenic cooling via jacket (-50°C). Product frozen into loose snow-like granules.";
    stageColor = "#7FD4FF";
    const prog = (timeHours - 2) / 6;
    jacketT = 0 - prog * 50; // 0 to -50°C
    productT = 5 - prog * 50; // 5 to -45°C
    chamberP = 1013;
  } else if (timeHours <= 26) {
    stageName = "3. Primary Drying (Sublimation)";
    stageDesc = "Deep vacuum (<0.1 mbar). Agitator stirs gently, heating jacket sublimates ice directly to vapor.";
    stageColor = "#E5A93C";
    const prog = (timeHours - 8) / 18;
    jacketT = -50 + prog * 70; // -50°C ramps up to +20°C
    productT = -45 + prog * 30; // -45°C gently rises to -15°C
    chamberP = 0.08; // 0.08 mbar deep vacuum
  } else if (timeHours <= 32) {
    stageName = "4. Secondary Drying (Desorption)";
    stageDesc = "Bound water desorbed under ultra-low vacuum and +35°C jacket heat to <1% residual moisture.";
    stageColor = "#F59E0B";
    const prog = (timeHours - 26) / 6;
    jacketT = 20 + prog * 15; // 20 to 35°C
    productT = -15 + prog * 40; // -15 to +25°C
    chamberP = 0.02; // ultra deep vacuum
  } else {
    stageName = "5. Nitrogen Break & Discharge";
    stageDesc = "Chamber backfilled with sterile nitrogen. Bottom ball valve opens for gravity powder discharge.";
    stageColor = "#10B981";
    const prog = (timeHours - 32) / 4;
    jacketT = 35 - prog * 15;
    productT = 25;
    chamberP = 0.02 + prog * 1013; // venting up to 1013 mbar
  }

  // Auto playback loop
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeHours((prev) => {
          if (prev >= totalHours) return 0;
          return Number((prev + 0.25).toFixed(2));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="instrument-card rounded-2xl p-5 my-6 border border-hairline bg-bg-panel backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-hairline gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-signal animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-signal">
              Simulator 06 • Chapter 04
            </span>
          </div>
          <h3 className="text-lg font-medium text-ink-primary mt-1">
            Full Freeze-Drying Cycle Profile Scrubber
          </h3>
        </div>

        {/* Current Stage Indicator */}
        <div
          className="px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
          style={{
            borderColor: stageColor,
            backgroundColor: `${stageColor}15`,
            color: stageColor,
          }}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stageColor }} />
          <span>{stageName}</span>
        </div>
      </div>

      {/* Main Scrubber Slider */}
      <div className="bg-bg-inset p-4 rounded-xl border border-hairline space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-secondary flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-signal" /> Cycle Time
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold text-amber-bright">
              {timeHours.toFixed(1)}{" "}
              <span className="text-xs font-normal text-ink-muted">/ {totalHours} h</span>
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-bg-hover border border-hairline text-ink-primary hover:bg-bg-hover"
              title={isPlaying ? "Pause cycle" : "Play cycle"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setTimeHours(0);
              }}
              className="p-1.5 rounded-lg bg-bg-hover border border-hairline text-ink-muted hover:text-ink-primary"
              title="Reset cycle"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max={totalHours}
          step="0.2"
          value={timeHours}
          onChange={(e) => setTimeHours(Number(e.target.value))}
          className="w-full accent-[#E5A93C] cursor-pointer"
        />

        {/* Process Stage Bands on Timeline */}
        <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-mono pt-1">
          <div
            className={`p-1 rounded cursor-pointer transition ${
              timeHours <= 2 ? "bg-bg-hover text-ink-primary font-bold" : "text-ink-dim"
            }`}
            onClick={() => setTimeHours(1)}
          >
            Purge (0–2h)
          </div>
          <div
            className={`p-1 rounded cursor-pointer transition ${
              timeHours > 2 && timeHours <= 8 ? "bg-cryo/20 text-cryo font-bold" : "text-ink-dim"
            }`}
            onClick={() => setTimeHours(5)}
          >
            Freeze (2–8h)
          </div>
          <div
            className={`p-1 rounded cursor-pointer transition ${
              timeHours > 8 && timeHours <= 26 ? "bg-amber-signal/20 text-amber-signal font-bold" : "text-ink-dim"
            }`}
            onClick={() => setTimeHours(17)}
          >
            Primary Dry (8–26h)
          </div>
          <div
            className={`p-1 rounded cursor-pointer transition ${
              timeHours > 26 && timeHours <= 32 ? "bg-amber-500/20 text-amber-400 font-bold" : "text-ink-dim"
            }`}
            onClick={() => setTimeHours(29)}
          >
            Secondary (26–32h)
          </div>
          <div
            className={`p-1 rounded cursor-pointer transition ${
              timeHours > 32 ? "bg-emerald-500/20 text-emerald-400 font-bold" : "text-ink-dim"
            }`}
            onClick={() => setTimeHours(34)}
          >
            Discharge (32–36h)
          </div>
        </div>
      </div>

      {/* Live Synchronized Instrument Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <div className="bg-bg-inset p-3.5 rounded-xl border border-hairline">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
            <Thermometer className="w-3.5 h-3.5 text-cryo" /> Jacket Temp
          </div>
          <div className="text-xl font-bold font-mono text-cryo">
            {jacketT.toFixed(1)} <span className="text-xs font-normal text-ink-muted">°C</span>
          </div>
          <div className="text-[10px] text-ink-dim font-mono">Heat transfer fluid TCU</div>
        </div>

        <div className="bg-bg-inset p-3.5 rounded-xl border border-hairline">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
            <Thermometer className="w-3.5 h-3.5 text-amber-signal" /> Product Temp
          </div>
          <div className="text-xl font-bold font-mono text-amber-bright">
            {productT.toFixed(1)} <span className="text-xs font-normal text-ink-muted">°C</span>
          </div>
          <div className="text-[10px] text-ink-dim font-mono">In-bed Pt100 RTD sensor</div>
        </div>

        <div className="bg-bg-inset p-3.5 rounded-xl border border-hairline">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
            <Gauge className="w-3.5 h-3.5 text-ink-primary" /> Chamber Pressure
          </div>
          <div className="text-xl font-bold font-mono text-ink-primary">
            {chamberP < 1 ? chamberP.toFixed(3) : Math.round(chamberP)}{" "}
            <span className="text-xs font-normal text-ink-muted">mbar</span>
          </div>
          <div className="text-[10px] text-ink-dim font-mono">
            {chamberP < 1 ? "Vacuum Sublimation" : "Atmospheric N2"}
          </div>
        </div>
      </div>

      {/* Stage Description Context */}
      <div className="mt-3 p-3 rounded-xl bg-bg-hover text-xs text-ink-secondary flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-amber-signal shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-ink-primary">{stageName}: </span>
          {stageDesc}
        </div>
      </div>
    </div>
  );
}
