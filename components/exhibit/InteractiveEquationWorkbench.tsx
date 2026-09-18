'use client';

import React, { useState } from 'react';
import { KatexEquation } from '@/components/exhibit/KatexEquation';
import {
  Sliders,
  Calculator,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Flame,
  Layers,
  Snowflake,
  Wind,
  Info,
  Gauge,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ============================================================================
// 1. SUBLIMATION RATE & JACKET HEAT DUTY WORKBENCH
// Q = (dm/dt) × ΔHs
// ============================================================================
export function SublimationHeatDutyWorkbench() {
  // Default: Hosokawa AFD-20 benchmark (0.8 kg/h sublimation)
  const [subRateKgH, setSubRateKgH] = useState(0.8);
  const [dHSubKjKg, setDHSubKjKg] = useState(2838);
  const [batchWaterKg, setBatchWaterKg] = useState(9.0);
  const [copied, setCopied] = useState(false);

  // Conversions
  const subRateKgS = subRateKgH / 3600;
  const subRateKgSExp = subRateKgS.toExponential(3);
  const heatDutyWatts = subRateKgS * (dHSubKjKg * 1000);
  const heatDutyKW = heatDutyWatts / 1000;
  const dryingTimeHours = subRateKgH > 0 ? batchWaterKg / subRateKgH : 0;

  const isHosokawaReference = Math.abs(subRateKgH - 0.8) < 0.01;

  const copyFormula = () => {
    navigator.clipboard.writeText(`Q = (dm/dt) * ΔHs = ${subRateKgH} kg/h * ${dHSubKjKg} kJ/kg = ${heatDutyWatts.toFixed(1)} W`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetDefaults = () => {
    setSubRateKgH(0.8);
    setDHSubKjKg(2838);
    setBatchWaterKg(9.0);
  };

  return (
    <div className="my-8 rounded-2xl border-2 border-amber/40 bg-bg-panel shadow-xl overflow-hidden transition-all duration-300 hover:border-amber/60 hover:shadow-2xl">
      {/* Workbench Header */}
      <div className="p-4 sm:p-5 border-b border-hairline bg-gradient-to-r from-amber/10 via-bg-surface to-bg-panel flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber text-on-amber flex items-center justify-center shadow-md shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber text-on-amber text-[10px] font-mono font-bold tracking-wider uppercase">
                Interactive Engineering Workbench
              </span>
              {isHosokawaReference && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] font-mono font-semibold">
                  <Check className="w-3 h-3" /> Hosokawa 20L Benchmark
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-ink-primary mt-1">
              Sublimation Rate ↔ Jacket Heat Duty Calculator
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetDefaults}
            title="Reset to Hosokawa 20L default (0.8 kg/h)"
            className="p-2 rounded-lg border border-hairline text-ink-muted hover:text-amber hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={copyFormula}
            className="p-2 rounded-lg border border-hairline text-ink-muted hover:text-amber hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
            title="Copy formula and values"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic KaTeX Formula Display */}
      <div className="p-4 sm:p-6 bg-bg-surface/50 border-b border-hairline">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {/* Theoretical Law */}
          <div className="p-4 rounded-xl bg-bg-panel border border-hairline flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-ink-dim font-bold mb-1">
              Governing Physical Law
            </span>
            <div className="py-1 overflow-x-auto w-full">
              <KatexEquation expression="Q = \dot{m} \cdot \Delta H_s = \left(\frac{dm}{dt}\right) \times \Delta H_s" displayMode />
            </div>
          </div>

          {/* Live Parameter Substitution */}
          <div className="p-4 rounded-xl bg-amber-subtle/20 dark:bg-amber-subtle/30 border-2 border-amber/40 flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
              <span>Live Evaluated Heat Duty</span>
            </div>
            <div className="py-1 overflow-x-auto w-full text-ink-primary font-bold">
              <KatexEquation
                expression={`Q = (${subRateKgSExp}\\text{ kg/s}) \\times (${dHSubKjKg.toLocaleString()}\\text{ kJ/kg}) \\approx \\mathbf{${heatDutyWatts.toFixed(0)}\\text{ W}}`}
                displayMode
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Real-Time Readouts */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-ink-primary flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber" /> Sublimation Rate (ṁ)
              </span>
              <span className="font-mono text-amber font-bold text-sm">{subRateKgH.toFixed(2)} kg/h</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.05"
              value={subRateKgH}
              onChange={(e) => setSubRateKgH(Number(e.target.value))}
              className="w-full accent-amber cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-ink-dim mt-1">
              <span>0.1 kg/h (Lab scale)</span>
              <span className="text-amber font-bold">0.8 kg/h (AFD-20)</span>
              <span>3.0 kg/h (Pilot scale)</span>
            </div>
          </div>

          <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-ink-primary flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cryo" /> Batch Water / Ice Content
              </span>
              <span className="font-mono text-cryo font-bold text-sm">{batchWaterKg.toFixed(1)} kg</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="20.0"
              step="0.5"
              value={batchWaterKg}
              onChange={(e) => setBatchWaterKg(Number(e.target.value))}
              className="w-full accent-[#7FD4FF] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-ink-dim mt-1">
              <span>1 kg</span>
              <span>9 kg (90% of 10kg batch)</span>
              <span>20 kg</span>
            </div>
          </div>

          <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-ink-primary">Latent Heat of Sublimation ($\Delta H_s$)</span>
              <span className="font-mono text-ink-secondary font-bold text-sm">{dHSubKjKg} kJ/kg</span>
            </div>
            <div className="text-[11px] font-mono text-ink-dim">
              Standard physical constant for ice sublimation at 0 °C to −20 °C (2,838 kJ/kg = 334 fusion + 2,504 vaporization).
            </div>
          </div>
        </div>

        {/* Live Calculation Cards (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          <div className="p-4 rounded-xl bg-amber-subtle/25 border-2 border-amber/40 shadow-xs flex flex-col justify-between">
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber font-bold flex items-center justify-between">
              <span>Required Jacket Heat Duty</span>
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
            </div>
            <div className="my-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-ink-primary">
                {Math.round(heatDutyWatts)}
              </span>
              <span className="text-sm font-bold text-amber ml-1">W</span>
              <span className="text-xs font-mono text-ink-dim ml-2">({heatDutyKW.toFixed(3)} kW)</span>
            </div>
            <div className="text-[11px] text-ink-secondary leading-relaxed">
              {heatDutyWatts < 1000 ? (
                <span>✓ Easily powered by a standard single-phase 120V/230V TCU circulation heater circuit.</span>
              ) : (
                <span>⚡ Requires dedicated multi-phase or high-capacity thermal fluid heat transfer unit.</span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-bg-surface border border-hairline shadow-xs flex flex-col justify-between">
            <div className="text-[11px] font-mono uppercase tracking-wider text-cryo font-bold flex items-center justify-between">
              <span>Primary Drying Duration</span>
              <Clock className="w-3.5 h-3.5 text-cryo" />
            </div>
            <div className="my-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-ink-primary">
                {dryingTimeHours.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-cryo ml-1">hours</span>
              <span className="text-xs font-mono text-ink-dim ml-2">({(dryingTimeHours * 60).toFixed(0)} min)</span>
            </div>
            <div className="text-[11px] text-ink-secondary leading-relaxed">
              Calculated for {batchWaterKg} kg water. Matches Hosokawa patent timeline (&quot;10–100 hours for industrial batches&quot;).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. REQUIRED JACKET HEAT-TRANSFER SURFACE AREA WORKBENCH
// Q = U × A × ΔT → A = Q / (U × ΔT)
// ============================================================================
export function JacketSurfaceAreaWorkbench() {
  const [heatDutyW, setHeatDutyW] = useState(631);
  const [uCoeff, setUCoeff] = useState(100); // W/m²K
  const [deltaT, setDeltaT] = useState(20); // K
  const [copied, setCopied] = useState(false);

  const reqArea = deltaT > 0 && uCoeff > 0 ? heatDutyW / (uCoeff * deltaT) : 0;

  // Hosokawa 20L typical cone wetted area is ~0.15 to 0.65 m²
  const isOptimalArea = reqArea >= 0.15 && reqArea <= 0.65;

  const copyFormula = () => {
    navigator.clipboard.writeText(`A = Q / (U * ΔT) = ${heatDutyW} W / (${uCoeff} W/m²K * ${deltaT} K) = ${reqArea.toFixed(3)} m²`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 rounded-2xl border-2 border-cryo/40 bg-bg-panel shadow-xl overflow-hidden transition-all duration-300 hover:border-cryo/60 hover:shadow-2xl">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-hairline bg-gradient-to-r from-cryo/10 via-bg-surface to-bg-panel flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cryo text-slate-900 flex items-center justify-center shadow-md shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cryo text-slate-900 text-[10px] font-mono font-bold tracking-wider uppercase">
                Interactive Sizing Workbench
              </span>
              {isOptimalArea && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] font-mono font-semibold">
                  <Check className="w-3 h-3" /> Within 10–20L Vessel Geometry
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-ink-primary mt-1">
              Required Jacket Heat-Transfer Surface Area (A = Q / [U · ΔT])
            </h3>
          </div>
        </div>

        <button
          onClick={copyFormula}
          className="p-2 rounded-lg border border-hairline text-ink-muted hover:text-cryo hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
          title="Copy calculation"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* KaTeX Equations */}
      <div className="p-4 sm:p-6 bg-bg-surface/50 border-b border-hairline">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <div className="p-4 rounded-xl bg-bg-panel border border-hairline flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-ink-dim font-bold mb-1">
              Heat-Transfer Law
            </span>
            <div className="py-1 overflow-x-auto w-full">
              <KatexEquation expression="Q = U \cdot A \cdot \Delta T \implies A = \frac{Q}{U \cdot \Delta T}" displayMode />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cryo-subtle/20 dark:bg-cryo-subtle/30 border-2 border-cryo/40 flex flex-col justify-center items-center text-center">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-cryo font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-cryo animate-pulse" />
              <span>Live Evaluated Required Area</span>
            </div>
            <div className="py-1 overflow-x-auto w-full text-ink-primary font-bold">
              <KatexEquation
                expression={`A = \\frac{${heatDutyW}\\text{ W}}{\\mathbf{${uCoeff}}\\text{ W/m}^2\\text{K} \\times \\mathbf{${deltaT}}\\text{ K}} = \\mathbf{${reqArea.toFixed(3)}\\text{ m}^2}`}
                displayMode
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Sensitivity Table */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-ink-primary">Heat Duty ($Q$)</span>
              <span className="font-mono text-amber font-bold text-sm">{heatDutyW} W</span>
            </div>
            <input
              type="range"
              min="200"
              max="2000"
              step="25"
              value={heatDutyW}
              onChange={(e) => setHeatDutyW(Number(e.target.value))}
              className="w-full accent-amber cursor-pointer"
            />
          </div>

          <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-ink-primary">Overall Heat Transfer Coeff ($U$)</span>
              <span className="font-mono text-cryo font-bold text-sm">{uCoeff} W/(m²·K)</span>
            </div>
            <input
              type="range"
              min="20"
              max="250"
              step="5"
              value={uCoeff}
              onChange={(e) => setUCoeff(Number(e.target.value))}
              className="w-full accent-[#7FD4FF] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-ink-dim mt-1">
              <span>Static Vial (15–30)</span>
              <span className="text-cryo font-bold">AFD Stirred (50–200)</span>
              <span>Aggressive Mix (250)</span>
            </div>
          </div>

          <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-ink-primary">Jacket-to-Product Temp Diff ($\Delta T$)</span>
              <span className="font-mono text-ink-primary font-bold text-sm">{deltaT} °C / K</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={deltaT}
              onChange={(e) => setDeltaT(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>
        </div>

        {/* Live Area Output + Sensitivity Matrix */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-xl bg-cryo-subtle/25 border-2 border-cryo/40 shadow-xs">
            <div className="text-[11px] font-mono uppercase tracking-wider text-cryo font-bold">
              Required Vessel Jacket Contact Area
            </div>
            <div className="my-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-ink-primary">
                {reqArea.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-cryo ml-1">m²</span>
              <span className="text-xs font-mono text-ink-dim ml-2">({(reqArea * 10000).toFixed(0)} cm²)</span>
            </div>
            <div className="text-[11px] text-ink-secondary leading-relaxed">
              {isOptimalArea ? (
                <span className="text-emerald-500 font-semibold">
                  ✓ Fits standard 10–20 L conical vessel wetted internal area (0.15–0.65 m²).
                </span>
              ) : reqArea > 0.65 ? (
                <span className="text-amber font-semibold">
                  ⚠️ Required area exceeds single 20L vessel cone; increase ΔT or enhance agitation.
                </span>
              ) : (
                <span className="text-emerald-500 font-semibold">
                  ✓ Easily accommodated with ample reserve heating surface.
                </span>
              )}
            </div>
          </div>

          {/* Interactive Sensitivity Matrix */}
          <div className="rounded-xl border border-hairline bg-bg-surface p-3 text-xs font-mono">
            <div className="text-[10px] uppercase text-ink-dim font-bold mb-2">
              Sensitivity Matrix (at ΔT = {deltaT} K, Q = {heatDutyW} W)
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {[50, 100, 150, 200].map((testU) => {
                const a = heatDutyW / (testU * deltaT);
                const isSelected = testU === uCoeff;
                return (
                  <button
                    key={testU}
                    onClick={() => setUCoeff(testU)}
                    className={`p-2 rounded-lg border transition cursor-pointer ${
                      isSelected
                        ? 'bg-cryo text-slate-900 border-cryo font-bold shadow-xs'
                        : 'bg-bg-panel border-hairline hover:border-cryo/40 text-ink-primary'
                    }`}
                  >
                    <div className="text-[10px] text-ink-dim">U={testU}</div>
                    <div className="text-xs font-bold mt-0.5">{a.toFixed(2)} m²</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. FREEZING-STAGE 3-STEP REFRIGERATION LOAD WORKBENCH
// Q1 + Q2 + Q3 = Q_total
// ============================================================================
export function FreezingRefrigerationLoadWorkbench() {
  const [batchMassKg, setBatchMassKg] = useState(10);
  const [waterFraction, setWaterFraction] = useState(0.9); // 90% water
  const [tempAmbientC, setTempAmbientC] = useState(20);
  const [tempFrozenC, setTempFrozenC] = useState(-30);
  const [freezingDurationHours, setFreezingDurationHours] = useState(1.0);
  const [copied, setCopied] = useState(false);

  // Thermodynamic calculations
  const waterMassKg = batchMassKg * waterFraction;
  const cpLiquid = 4.2; // kJ/kg·K
  const cpIce = 2.1; // kJ/kg·K
  const dHf = 334; // kJ/kg

  // Step 1: Sensible liquid cooling (+20°C -> 0°C)
  const q1_kj = batchMassKg * cpLiquid * (tempAmbientC - 0);

  // Step 2: Latent heat of freezing (water mass × 334 kJ/kg)
  const q2_kj = waterMassKg * dHf;

  // Step 3: Sensible ice cooling (0°C -> -30°C)
  const q3_kj = batchMassKg * cpIce * (0 - tempFrozenC);

  // Total heat removed
  const qTotal_kj = q1_kj + q2_kj + q3_kj;
  const qTotal_mj = qTotal_kj / 1000;

  // Freezing kinetics
  const totalTempSwingC = tempAmbientC - tempFrozenC;
  const freezingDurationMin = freezingDurationHours * 60;
  const coolingRateC_min = freezingDurationMin > 0 ? totalTempSwingC / freezingDurationMin : 0;
  const isPatentRate = coolingRateC_min >= 0.1 && coolingRateC_min <= 10.0;

  // Average refrigeration power (kW)
  const avgDutyKW = freezingDurationHours > 0 ? qTotal_kj / (freezingDurationHours * 3600) : 0;
  // Recommended chiller rating (1.5x - 2.0x safety factor)
  const recommendedChillerKW = avgDutyKW * 1.75;

  const copyFormula = () => {
    navigator.clipboard.writeText(
      `Q1=${q1_kj.toFixed(0)} kJ, Q2=${q2_kj.toFixed(0)} kJ, Q3=${q3_kj.toFixed(0)} kJ | Total=${qTotal_kj.toFixed(0)} kJ (${qTotal_mj.toFixed(2)} MJ) | Avg Duty=${avgDutyKW.toFixed(2)} kW`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 rounded-2xl border-2 border-sky-500/40 bg-bg-panel shadow-xl overflow-hidden transition-all duration-300 hover:border-sky-500/60 hover:shadow-2xl">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-hairline bg-gradient-to-r from-sky-500/10 via-bg-surface to-bg-panel flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Snowflake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-500 text-white text-[10px] font-mono font-bold tracking-wider uppercase">
                3-Step Batch Heat Balance
              </span>
              {isPatentRate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] font-mono font-semibold">
                  <ShieldCheck className="w-3 h-3" /> Patent Optimum (0.1–10 °C/min)
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-ink-primary mt-1">
              Freezing-Stage Refrigeration Load & Chiller Duty
            </h3>
          </div>
        </div>

        <button
          onClick={copyFormula}
          className="p-2 rounded-lg border border-hairline text-ink-muted hover:text-sky-500 hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
          title="Copy calculation balance"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* 3-Step Heat Removal Visual Stack */}
      <div className="p-4 sm:p-6 bg-bg-surface/50 border-b border-hairline space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-bg-panel border border-hairline shadow-xs">
            <div className="text-[10px] font-mono uppercase text-ink-dim font-bold flex items-center justify-between">
              <span>Step 1: Cool Liquid</span>
              <span className="text-sky-500 font-bold">{tempAmbientC} → 0 °C</span>
            </div>
            <div className="my-1.5 text-lg sm:text-xl font-mono font-extrabold text-ink-primary">
              {Math.round(q1_kj).toLocaleString()} <span className="text-xs font-bold text-sky-500">kJ</span>
            </div>
            <div className="text-[10px] font-mono text-ink-dim">
              m · c_p,liq · ΔT ({batchMassKg}kg × 4.2 × {tempAmbientC}K)
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-sky-500/10 border-2 border-sky-500/30 shadow-xs">
            <div className="text-[10px] font-mono uppercase text-sky-500 font-bold flex items-center justify-between">
              <span>Step 2: Latent Fusion</span>
              <span className="text-sky-500 font-bold">{waterMassKg.toFixed(1)} kg Ice</span>
            </div>
            <div className="my-1.5 text-lg sm:text-xl font-mono font-extrabold text-sky-500">
              {Math.round(q2_kj).toLocaleString()} <span className="text-xs font-bold text-sky-500">kJ</span>
            </div>
            <div className="text-[10px] font-mono text-ink-dim">
              m_water · ΔH_f ({waterMassKg.toFixed(1)}kg × 334 kJ/kg)
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-bg-panel border border-hairline shadow-xs">
            <div className="text-[10px] font-mono uppercase text-ink-dim font-bold flex items-center justify-between">
              <span>Step 3: Cool Ice</span>
              <span className="text-sky-500 font-bold">0 → {tempFrozenC} °C</span>
            </div>
            <div className="my-1.5 text-lg sm:text-xl font-mono font-extrabold text-ink-primary">
              {Math.round(q3_kj).toLocaleString()} <span className="text-xs font-bold text-sky-500">kJ</span>
            </div>
            <div className="text-[10px] font-mono text-ink-dim">
              m · c_p,ice · ΔT ({batchMassKg}kg × 2.1 × {Math.abs(tempFrozenC)}K)
            </div>
          </div>
        </div>

        {/* Total Sum Bar */}
        <div className="p-3 rounded-xl bg-amber-subtle/25 border border-amber/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber" />
            <span className="font-bold text-ink-primary">Total Heat Removal (Q_total):</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base font-extrabold text-amber">
              {Math.round(qTotal_kj).toLocaleString()} kJ
            </span>
            <span className="px-2 py-0.5 rounded bg-amber text-on-amber font-bold text-[11px]">
              ≈ {qTotal_mj.toFixed(2)} MJ
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Cooling Rate Analysis */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-ink-primary">Batch Total Mass</span>
                <span className="font-mono text-sky-500 font-bold">{batchMassKg} kg</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                step="1"
                value={batchMassKg}
                onChange={(e) => setBatchMassKg(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-ink-primary">Water Content</span>
                <span className="font-mono text-amber font-bold">{(waterFraction * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.98"
                step="0.02"
                value={waterFraction}
                onChange={(e) => setWaterFraction(Number(e.target.value))}
                className="w-full accent-amber cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-ink-primary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-ink-dim" /> Target Freezing Duration
              </span>
              <span className="font-mono text-sky-500 font-bold text-sm">
                {freezingDurationHours} h ({freezingDurationMin} min)
              </span>
            </div>
            <input
              type="range"
              min="0.25"
              max="4.0"
              step="0.25"
              value={freezingDurationHours}
              onChange={(e) => setFreezingDurationHours(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-ink-dim mt-1">
              <span>0.25 h (Flash freeze)</span>
              <span>1.0 h (Standard batch)</span>
              <span>4.0 h (Gentle freeze)</span>
            </div>
          </div>
        </div>

        {/* Chiller Duty & Patent Window */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-xl bg-sky-500/15 border-2 border-sky-500/40 shadow-xs">
            <div className="text-[11px] font-mono uppercase tracking-wider text-sky-500 font-bold flex items-center justify-between">
              <span>Average Refrigeration Duty</span>
              <span className="text-[10px] font-mono text-ink-dim">{coolingRateC_min.toFixed(2)} °C/min</span>
            </div>
            <div className="my-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-ink-primary">
                {avgDutyKW.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-sky-500 ml-1">kW</span>
            </div>
            <div className="text-[11px] text-ink-secondary leading-relaxed">
              Implied cooling rate: <span className="font-bold text-sky-500">{coolingRateC_min.toFixed(2)} °C/min</span>.
              {isPatentRate ? (
                <span className="text-emerald-500 block mt-1 font-semibold">
                  ✓ Sits inside Hosokawa patent-disclosed 0.1–10 °C/min optimum range.
                </span>
              ) : (
                <span className="text-amber block mt-1 font-semibold">
                  ⚠️ Outside Hosokawa patent 0.1–10 °C/min optimum window.
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-bg-surface border border-hairline flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase text-ink-dim font-bold">Recommended TCU Chiller Size</div>
              <div className="text-xs text-ink-secondary">Including 1.75× safety & loss margin</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-extrabold font-mono text-amber">
                {recommendedChillerKW.toFixed(2)} kW
              </div>
              <div className="text-[10px] font-mono text-ink-dim">≈ {(recommendedChillerKW * 0.284).toFixed(2)} TR</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. VACUUM PUMP-DOWN EVACUATION TIME WORKBENCH
// t = (V / S) × ln(P1 / P2)
// ============================================================================
export function VacuumPumpdownWorkbench() {
  const [vesselLiters, setVesselLiters] = useState(20); // 20L = 0.02 m³
  const [pumpSpeedM3H, setPumpSpeedM3H] = useState(10); // m³/h
  const [p1Mbar, setP1Mbar] = useState(1013.25); // Atmospheric
  const [p2Mbar, setP2Mbar] = useState(1.0); // Target roughing
  const [copied, setCopied] = useState(false);

  // Volume in m³
  const vM3 = vesselLiters / 1000;
  // Pump speed in m³/s
  const sM3S = pumpSpeedM3H / 3600;
  // Time constant tau = V / S in seconds
  const tauSec = sM3S > 0 ? vM3 / sM3S : 0;
  // Pumpdown time
  const pumpdownSec = tauSec > 0 && p1Mbar > p2Mbar ? tauSec * Math.log(p1Mbar / p2Mbar) : 0;

  const copyFormula = () => {
    navigator.clipboard.writeText(`t = (V/S) * ln(P1/P2) = (${vesselLiters}L / ${pumpSpeedM3H} m³/h) * ln(${p1Mbar}/${p2Mbar}) = ${pumpdownSec.toFixed(1)} s`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 rounded-2xl border-2 border-emerald-500/40 bg-bg-panel shadow-xl overflow-hidden transition-all duration-300 hover:border-emerald-500/60 hover:shadow-2xl">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-hairline bg-gradient-to-r from-emerald-500/10 via-bg-surface to-bg-panel flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-mono font-bold tracking-wider uppercase">
                Vacuum Sizing Workbench
              </span>
              <span className="text-[10px] font-mono text-ink-dim">Dry Evacuation</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-ink-primary mt-1">
              Vacuum Pump-Down Time (t = [V / S] · ln[P₁ / P₂])
            </h3>
          </div>
        </div>

        <button
          onClick={copyFormula}
          className="p-2 rounded-lg border border-hairline text-ink-muted hover:text-emerald-500 hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
          title="Copy pumpdown calculation"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* KaTeX Display */}
      <div className="p-4 sm:p-6 bg-bg-surface/50 border-b border-hairline">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <div className="p-4 rounded-xl bg-bg-panel border border-hairline flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-ink-dim font-bold mb-1">
              Dry Evacuation Physics Law
            </span>
            <div className="py-1 overflow-x-auto w-full">
              <KatexEquation expression="t = \left(\frac{V}{S}\right) \cdot \ln\left(\frac{P_1}{P_2}\right)" displayMode />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/40 flex flex-col justify-center items-center text-center">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Evaluated Evacuation Time</span>
            </div>
            <div className="py-1 overflow-x-auto w-full text-ink-primary font-bold">
              <KatexEquation
                expression={`t = \\left(\\frac{${vM3}\\text{ m}^3}{${(sM3S * 1000).toFixed(2)}\\text{ L/s}}\\right) \\cdot \\ln\\left(\\frac{${p1Mbar.toFixed(0)}}{${p2Mbar}}\\right) \\approx \\mathbf{${pumpdownSec.toFixed(1)}\\text{ s}}`}
                displayMode
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sliders & Speed Presets */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-ink-primary">Free Chamber Volume ($V$)</span>
              <span className="font-mono text-emerald-500 font-bold text-sm">{vesselLiters} L ({(vesselLiters / 1000).toFixed(3)} m³)</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={vesselLiters}
              onChange={(e) => setVesselLiters(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-ink-primary">Pump Speed ($S$)</span>
              <span className="font-mono text-emerald-500 font-bold text-sm">{pumpSpeedM3H} m³/h</span>
            </div>
            <input
              type="range"
              min="2"
              max="60"
              step="1"
              value={pumpSpeedM3H}
              onChange={(e) => setPumpSpeedM3H(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Quick Speed Presets */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-ink-dim uppercase font-bold">Standard Presets:</span>
            {[5, 10, 20, 50].map((presetS) => (
              <button
                key={presetS}
                onClick={() => setPumpSpeedM3H(presetS)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition cursor-pointer ${
                  pumpSpeedM3H === presetS
                    ? 'bg-emerald-500 text-white font-bold border-emerald-500 shadow-xs'
                    : 'bg-bg-surface border-hairline text-ink-secondary hover:text-emerald-500'
                }`}
              >
                {presetS} m³/h
              </button>
            ))}
          </div>
        </div>

        {/* Output Time Display */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/40 shadow-xs">
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-500 font-bold">
              Evacuation Time to {p2Mbar} mbar
            </div>
            <div className="my-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-ink-primary">
                {pumpdownSec.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-emerald-500 ml-1">seconds</span>
              <span className="text-xs font-mono text-ink-dim ml-2">({(pumpdownSec / 60).toFixed(2)} min)</span>
            </div>
            <div className="text-[11px] text-ink-secondary leading-relaxed">
              Dry evacuation time constant $\tau = {tauSec.toFixed(2)}$ s. Once product begins subliming, vacuum specification is dictated by continuous vapor throughput.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. CLAUSIUS-CLAPEYRON VAPOR PRESSURE WORKBENCH (Chapter 02)
// dP/dT = L / (T·Δv)
// ============================================================================
export function ClausiusClapeyronWorkbench() {
  const [tempC, setTempC] = useState(-20);
  const [copied, setCopied] = useState(false);

  const T_K = tempC + 273.15;
  const T_tp = 273.16;
  const P_tp = 6.1112; // mbar at triple point
  const deltaH_over_R = 6149.1; // K for ice sublimation

  // Exact saturation vapor pressure of ice
  const pSatMbar = tempC <= 0.01
    ? P_tp * Math.exp(-deltaH_over_R * (1 / T_K - 1 / T_tp))
    : 6.1112 * Math.exp((17.27 * tempC) / (tempC + 237.3));

  const pSatPa = pSatMbar * 100;
  const isSublimationWindow = tempC <= 0.01 && pSatMbar <= 6.11;

  const copyFormula = () => {
    navigator.clipboard.writeText(`At T = ${tempC} °C, P_sat(ice) = ${pSatMbar.toFixed(3)} mbar (${pSatPa.toFixed(1)} Pa)`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 rounded-2xl border-2 border-indigo-500/40 bg-bg-panel shadow-xl overflow-hidden transition-all duration-300 hover:border-indigo-500/60 hover:shadow-2xl">
      <div className="p-4 sm:p-5 border-b border-hairline bg-gradient-to-r from-indigo-500/10 via-bg-surface to-bg-panel flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500 text-white text-[10px] font-mono font-bold tracking-wider uppercase">
                Thermodynamic Law Explorer
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold">
                {isSublimationWindow ? 'Ice Sublimation Phase' : 'Liquid Phase Boundary'}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-ink-primary mt-1">
              Clausius-Clapeyron Relation: Vapor Pressure of Ice vs. Temperature
            </h3>
          </div>
        </div>

        <button
          onClick={copyFormula}
          className="p-2 rounded-lg border border-hairline text-ink-muted hover:text-indigo-400 hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 bg-bg-surface/50 border-b border-hairline">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <div className="p-4 rounded-xl bg-bg-panel border border-hairline flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-ink-dim font-bold mb-1">
              Differential Formulation
            </span>
            <div className="py-1 overflow-x-auto w-full">
              <KatexEquation expression="\frac{dP}{dT} = \frac{L}{T \cdot \Delta v} \implies \ln\left(\frac{P}{P_{tp}}\right) = \frac{\Delta H_{sub}}{R}\left(\frac{1}{T_{tp}} - \frac{1}{T}\right)" displayMode />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-500/15 border-2 border-indigo-500/40 flex flex-col justify-center items-center text-center">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>Evaluated at T = {tempC} °C</span>
            </div>
            <div className="py-1 overflow-x-auto w-full text-ink-primary font-bold">
              <KatexEquation
                expression={`P_{sat} = 6.1112 \\cdot \\exp\\left[-6149.1\\left(\\frac{1}{${T_K.toFixed(2)}} - \\frac{1}{273.16}\\right)\\right] = \\mathbf{${pSatMbar < 0.001 ? pSatMbar.toExponential(3) : pSatMbar.toFixed(3)}\\text{ mbar}}`}
                displayMode
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-bg-surface p-4 rounded-xl border border-hairline">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-semibold text-ink-primary">Ice Temperature ($T$)</span>
              <span className="font-mono text-indigo-400 font-bold text-base">{tempC} °C ({T_K.toFixed(2)} K)</span>
            </div>
            <input
              type="range"
              min="-60"
              max="5"
              step="1"
              value={tempC}
              onChange={(e) => setTempC(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-ink-dim mt-1.5">
              <span>−60 °C (0.01 mbar)</span>
              <span>−30 °C (0.38 mbar)</span>
              <span>−10 °C (2.60 mbar)</span>
              <span>0 °C (6.11 mbar)</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 p-4 rounded-xl bg-indigo-500/15 border-2 border-indigo-500/40 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
            Ice Saturation Vapor Pressure
          </div>
          <div className="my-2">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-ink-primary">
              {pSatMbar < 0.01 ? pSatMbar.toFixed(4) : pSatMbar.toFixed(3)}
            </span>
            <span className="text-sm font-bold text-indigo-400 ml-1">mbar</span>
            <span className="text-xs font-mono text-ink-dim ml-2">({pSatPa.toFixed(1)} Pa)</span>
          </div>
          <div className="text-[11px] text-ink-secondary leading-relaxed">
            Chamber pressure must remain strictly below this value to sustain sublimation without cake melt-collapse.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6. PIKAL HEAT & MASS TRANSFER WORKBENCH (Chapter 02)
// Q = Kv · Av · (Ts − Tb) & dm/dt = Q / ΔHs
// ============================================================================
export function PikalHeatMassWorkbench() {
  const [tsShelfC, setTsShelfC] = useState(20);
  const [tbSubC, setTbSubC] = useState(-25);
  const [kvCoeff, setKvCoeff] = useState(25); // W/m²K
  const [areaM2, setAreaM2] = useState(1.0); // m²
  const [copied, setCopied] = useState(false);

  const deltaT = tsShelfC - tbSubC;
  const heatDutyWatts = deltaT > 0 ? kvCoeff * areaM2 * deltaT : 0;
  const dHSub = 2838000; // J/kg
  const massRateKgH = (heatDutyWatts / dHSub) * 3600;

  const copyFormula = () => {
    navigator.clipboard.writeText(`Q = Kv * Av * (Ts - Tb) = ${heatDutyWatts.toFixed(1)} W | dm/dt = ${massRateKgH.toFixed(3)} kg/h`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 rounded-2xl border-2 border-amber/40 bg-bg-panel shadow-xl overflow-hidden transition-all duration-300 hover:border-amber/60 hover:shadow-2xl">
      <div className="p-4 sm:p-5 border-b border-hairline bg-gradient-to-r from-amber/10 via-bg-surface to-bg-panel flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber text-on-amber flex items-center justify-center shadow-md shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber text-on-amber text-[10px] font-mono font-bold tracking-wider uppercase">
                Pikal Model Sizing Suite
              </span>
              <span className="text-[10px] font-mono text-ink-dim">Primary Drying Heat & Mass Flux</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-ink-primary mt-1">
              Heat Flow to Product & Sublimation Mass Flow
            </h3>
          </div>
        </div>

        <button
          onClick={copyFormula}
          className="p-2 rounded-lg border border-hairline text-ink-muted hover:text-amber hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 bg-bg-surface/50 border-b border-hairline">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <div className="p-4 rounded-xl bg-bg-panel border border-hairline flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-ink-dim font-bold mb-1">
              Heat Flow Governing Law
            </span>
            <div className="py-1 overflow-x-auto w-full">
              <KatexEquation expression="Q = K_v \cdot A_v \cdot (T_s - T_b) \implies \frac{dm}{dt} = \frac{Q}{\Delta H_s}" displayMode />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-subtle/20 dark:bg-amber-subtle/30 border-2 border-amber/40 flex flex-col justify-center items-center text-center">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
              <span>Live Evaluated Sublimation Flow</span>
            </div>
            <div className="py-1 overflow-x-auto w-full text-ink-primary font-bold">
              <KatexEquation
                expression={`Q = \\mathbf{${heatDutyWatts.toFixed(0)}\\text{ W}} \\implies \\frac{dm}{dt} = \\mathbf{${massRateKgH.toFixed(3)}\\text{ kg/h}}`}
                displayMode
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-ink-primary">Jacket/Shelf Temp ($T_s$)</span>
                <span className="font-mono text-amber font-bold">{tsShelfC} °C</span>
              </div>
              <input
                type="range"
                min="-10"
                max="50"
                step="1"
                value={tsShelfC}
                onChange={(e) => setTsShelfC(Number(e.target.value))}
                className="w-full accent-amber cursor-pointer"
              />
            </div>

            <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-ink-primary">Sublimation Front ($T_b$)</span>
                <span className="font-mono text-cryo font-bold">{tbSubC} °C</span>
              </div>
              <input
                type="range"
                min="-45"
                max="-5"
                step="1"
                value={tbSubC}
                onChange={(e) => setTbSubC(Number(e.target.value))}
                className="w-full accent-[#7FD4FF] cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-ink-primary">Overall Transfer Coeff ($K_v$)</span>
              <span className="font-mono text-ink-primary font-bold">{kvCoeff} W/(m²·K)</span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={kvCoeff}
              onChange={(e) => setKvCoeff(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-1 gap-3">
          <div className="p-4 rounded-xl bg-amber-subtle/25 border-2 border-amber/40 shadow-xs">
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber font-bold">
              Calculated Sublimation Rate
            </div>
            <div className="my-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-ink-primary">
                {massRateKgH.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-amber ml-1">kg/h</span>
              <span className="text-xs font-mono text-ink-dim ml-2">({(massRateKgH * 1000 / 60).toFixed(1)} g/min)</span>
            </div>
            <div className="text-[11px] text-ink-secondary leading-relaxed">
              Total driving thermal gradient $\Delta T = {deltaT}$ K. Heat flux $Q = {Math.round(heatDutyWatts)}$ W into active sublimation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 7. UNIVERSAL INTERACTIVE EQUATION CARD (For all generic mathematical formulations)
// ============================================================================
interface UniversalEquationCardProps {
  latexFormula: string;
  originalBlock?: string;
}

export function UniversalInteractiveEquationCard({
  latexFormula,
  originalBlock,
}: UniversalEquationCardProps) {
  const [copied, setCopied] = useState(false);
  const [showInspector, setShowInspector] = useState(false);

  const copyLatex = () => {
    navigator.clipboard.writeText(latexFormula);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-2xl p-4 sm:p-5 border-2 border-amber/30 bg-bg-panel shadow-lg overflow-hidden transition-all duration-300 hover:border-amber/50 hover:shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-hairline">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber shadow-sm animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Governing Physics Law</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowInspector(!showInspector)}
            className="px-2.5 py-1 rounded-lg border border-hairline text-ink-muted hover:text-amber hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inspect</span>
            {showInspector ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={copyLatex}
            className="p-1.5 rounded-lg border border-hairline text-ink-muted hover:text-amber hover:bg-bg-surface transition cursor-pointer text-xs font-mono"
            title="Copy LaTeX"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main KaTeX Rendered Formula */}
      <div className="py-4 text-center overflow-x-auto">
        <KatexEquation expression={latexFormula} displayMode />
      </div>

      {/* Expandable Parameter & Source Inspector */}
      {showInspector && originalBlock && (
        <div className="mt-3 pt-3 border-t border-hairline text-xs font-mono text-ink-secondary bg-bg-surface/60 p-3 rounded-xl space-y-1.5 animate-fade-in">
          <div className="text-[10px] uppercase font-bold text-amber">Symbolic Representation:</div>
          <code className="text-ink-primary block overflow-x-auto">{originalBlock}</code>
        </div>
      )}
    </div>
  );
}
