'use client';

import React, { useState } from 'react';
import { KatexEquation } from '@/components/exhibit/KatexEquation';
import { GoverningEquationStepStack } from '@/components/exhibit/GoverningEquationStepStack';
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
  Compass,
  Maximize2,
  CheckCircle2,
  Shield,
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

      {/* KaTeX Equations & Dynamic What is What Variable Deck */}
      <div className="p-4 sm:p-6 bg-bg-surface/50 border-b border-hairline">
        <GoverningEquationStepStack
          step1Number={1}
          step2Number={2}
          equationTitle="Fourier-Newton Conductive/Convective Balance"
          latex="Q = U \cdot A \cdot \Delta T \implies A = \frac{Q}{U \cdot \Delta T}"
          liveEvaluatedLatex={`A = \\frac{${heatDutyW}\\text{ W}}{\\mathbf{${uCoeff}}\\text{ W/m}^2\\text{K} \\times \\mathbf{${deltaT}}\\text{ K}} = \\mathbf{${reqArea.toFixed(3)}\\text{ m}^2}`}
          liveEvaluatedTitle="Live Evaluated Required Area"
          variables={[
            { symbol: 'Q', name: 'Sublimation Thermal Duty', unit: 'W / kW', role: 'Latent heat rate required to sustain sublimation (2,840 kJ/kg of ice sublimed).' },
            { symbol: 'U', name: 'Overall Heat Transfer Coeff', unit: 'W/(m²·K)', role: 'Heat conductance from jacket fluid through 316L shell and contact layer to agitated bed.' },
            { symbol: 'A', name: 'Heat Transfer Surface Area', unit: 'm²', role: 'Total wetted inside conical jacket surface required to transfer heat without stalling.' },
            { symbol: '\\Delta T', name: 'Temperature Difference', unit: 'K / °C', role: 'Thermal driving force between circulating jacket heat transfer fluid and product cake.' },
          ]}
          variableCategoryLabel="Thermal Balance Parameters"
          accentColor="cyan"
        />
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
// ============================================================================
// 7. MASS TRANSFER RESISTANCE WORKBENCH (Tang & Pikal 2004 Formulation)
// dm/dt = Ap · (Pice - Pchamber) / Rp
// ============================================================================
export function MassTransferResistanceWorkbench() {
  const [apAreaM2, setApAreaM2] = useState(0.2); // m²
  const [tempIceC, setTempIceC] = useState(-30); // °C
  const [pChamberMbar, setPChamberMbar] = useState(0.05); // mbar
  const [rpCake, setRpCake] = useState(3.5); // 10^5 Pa·s·m²/kg
  const [copied, setCopied] = useState(false);

  // Saturation vapor pressure of ice at tempIceC (mbar)
  // Huang (2018) / Goff-Gratch empirical formula for ice:
  const pIceMbar = 6.11 * Math.pow(10, (9.5 * tempIceC) / (265.5 + tempIceC));
  const pIcePa = pIceMbar * 100;
  const pChamberPa = pChamberMbar * 100;

  const deltaP_Pa = Math.max(0, pIcePa - pChamberPa);
  const deltaP_Mbar = Math.max(0, pIceMbar - pChamberMbar);

  // Rp in Pa·s·m²/kg (rpCake * 10^5)
  const rpActual = rpCake * 1e5;
  // Sublimation flux J = ΔP / Rp in kg/(m²·s)
  const massFluxKgM2S = deltaP_Pa / rpActual;
  // Total mass flow rate dm/dt in kg/h
  const massRateKgH = massFluxKgM2S * apAreaM2 * 3600;
  const massRateGMin = (massRateKgH * 1000) / 60;

  const isStalled = pChamberMbar >= pIceMbar;
  const isNearCollapse = tempIceC > -25;

  const copyFormula = () => {
    navigator.clipboard.writeText(
      `dm/dt = Ap * (Pice - Pchamber) / Rp: Ap=${apAreaM2}m², Tice=${tempIceC}°C (Pice=${pIceMbar.toFixed(3)}mbar), Pch=${pChamberMbar}mbar, Rp=${rpCake}e5 -> dm/dt=${massRateKgH.toFixed(3)}kg/h`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 rounded-2xl border-2 border-amber/40 bg-bg-panel shadow-xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-hairline bg-bg-surface/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-subtle text-amber flex items-center justify-center border border-amber/30 shrink-0">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber text-on-amber text-[10px] font-mono font-bold tracking-wider uppercase">
                Interactive Mass-Transfer Workbench
              </span>
              <span className="text-[10px] font-mono text-ink-dim hidden sm:inline">
                Tang &amp; Pikal (2004) Model
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-ink-primary mt-1">
              Dried-Product Cake Resistance &amp; Vapor Flow (dm/dt = Ap · [Pice − Pchamber] / Rp)
            </h3>
          </div>
        </div>

        <button
          onClick={copyFormula}
          className="p-2 rounded-lg border border-hairline text-ink-muted hover:text-amber hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
          title="Copy calculation"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Equations */}
      <div className="p-4 sm:p-6 bg-bg-surface/40 border-b border-hairline">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <div className="p-4 rounded-xl bg-bg-panel border border-hairline flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-ink-dim font-bold mb-1">
              Tang &amp; Pikal Mass Flow Law
            </span>
            <div className="py-1 overflow-x-auto w-full">
              <KatexEquation expression="\frac{dm}{dt} = \frac{A_p \cdot (P_{ice} - P_{chamber})}{R_p}" displayMode />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-subtle/20 dark:bg-amber-subtle/30 border-2 border-amber/40 flex flex-col justify-center items-center text-center">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
              <span>Live Calculated Sublimation Flux</span>
            </div>
            <div className="py-1 overflow-x-auto w-full text-ink-primary font-bold">
              <KatexEquation
                expression={`\\frac{dm}{dt} = \\frac{${apAreaM2.toFixed(2)} \\cdot (${pIcePa.toFixed(1)} - ${pChamberPa.toFixed(1)})}{${rpCake.toFixed(1)} \\times 10^5} \\implies \\mathbf{${massRateKgH.toFixed(3)}\\text{ kg/h}}`}
                displayMode
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sliders & Readouts */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-ink-primary">Sublimation Front Area (Ap)</span>
                <span className="font-mono text-amber font-bold">{apAreaM2.toFixed(2)} m²</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={apAreaM2}
                onChange={(e) => setApAreaM2(Number(e.target.value))}
                className="w-full accent-amber cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink-dim mt-1 font-mono">
                <span>0.05 m² (Lab)</span>
                <span>0.20 m² (AFD 20L)</span>
                <span>1.00 m² (Pilot)</span>
              </div>
            </div>

            <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-ink-primary">Front Temp (Tice)</span>
                <span className="font-mono text-cryo font-bold">{tempIceC} °C</span>
              </div>
              <input
                type="range"
                min="-45"
                max="-10"
                step="1"
                value={tempIceC}
                onChange={(e) => setTempIceC(Number(e.target.value))}
                className="w-full accent-[#7FD4FF] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink-dim mt-1 font-mono">
                <span>-45 °C</span>
                <span>Pice = {pIceMbar.toFixed(3)} mbar</span>
                <span>-10 °C</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-ink-primary">Chamber Pressure (Pch)</span>
                <span className="font-mono text-ink-primary font-bold">{pChamberMbar.toFixed(3)} mbar</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.50"
                step="0.01"
                value={pChamberMbar}
                onChange={(e) => setPChamberMbar(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink-dim mt-1 font-mono">
                <span>0.010 mbar</span>
                <span>{pChamberPa.toFixed(0)} Pa</span>
                <span>0.500 mbar</span>
              </div>
            </div>

            <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-ink-primary">Cake Resistance (Rp)</span>
                <span className="font-mono text-amber font-bold">{rpCake.toFixed(1)} × 10⁵ Pa·s/m</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="15.0"
                step="0.5"
                value={rpCake}
                onChange={(e) => setRpCake(Number(e.target.value))}
                className="w-full accent-amber cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink-dim mt-1 font-mono">
                <span>1.0 (Early)</span>
                <span>3.5 (Mid-cycle)</span>
                <span>15.0 (Thick crust)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Readouts (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="p-4 rounded-xl bg-amber-subtle/25 border-2 border-amber/40 shadow-xs">
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber font-bold">
              Calculated Sublimation Flow Rate
            </div>
            <div className="my-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-ink-primary">
                {isStalled ? "0.000" : massRateKgH.toFixed(3)}
              </span>
              <span className="text-sm font-bold text-amber ml-1">kg/h</span>
              <span className="text-xs font-mono text-ink-dim ml-2">
                ({isStalled ? "0.0" : massRateGMin.toFixed(1)} g/min)
              </span>
            </div>
            <div className="text-[11px] text-ink-secondary leading-relaxed">
              Driving pressure gradient ΔP = {deltaP_Mbar.toFixed(3)} mbar ({deltaP_Pa.toFixed(1)} Pa).
            </div>
          </div>

          {/* Diagnostic status banner */}
          <div className="space-y-1.5">
            {isStalled ? (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Sublimation Stalled! Chamber pressure exceeds ice vapor pressure.</span>
              </div>
            ) : isNearCollapse ? (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Warning: Tice &gt; -25°C approaches typical cake collapse temperature (Tc).</span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Active sublimation driving force within safe design margin.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 8. SUBLIMATION MASS FLOW FROM HEAT INPUT WORKBENCH
// dm/dt = Q / ΔHs
// ============================================================================
export function SublimationMassFlowWorkbench() {
  const [heatDutyW, setHeatDutyW] = useState(631); // W (Hosokawa 20L spec)
  const [batchWaterKg, setBatchWaterKg] = useState(9.0); // kg
  const [dHSubKjKg] = useState(2838); // kJ/kg
  const [copied, setCopied] = useState(false);

  // dm/dt = Q / ΔHs
  const massRateKgS = heatDutyW / (dHSubKjKg * 1000);
  const massRateKgH = massRateKgS * 3600;
  const massRateGMin = (massRateKgH * 1000) / 60;
  const primaryHours = massRateKgH > 0 ? batchWaterKg / massRateKgH : 0;

  const copyFormula = () => {
    navigator.clipboard.writeText(
      `dm/dt = Q / ΔHs: Q=${heatDutyW}W, ΔHs=${dHSubKjKg}kJ/kg -> dm/dt=${massRateKgH.toFixed(3)}kg/h, batch=${batchWaterKg}kg -> t=${primaryHours.toFixed(2)}h`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 rounded-2xl border-2 border-amber/40 bg-bg-panel shadow-xl overflow-hidden transition-all duration-300">
      <div className="p-4 sm:p-5 border-b border-hairline bg-bg-surface/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-subtle text-amber flex items-center justify-center border border-amber/30 shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber text-on-amber text-[10px] font-mono font-bold tracking-wider uppercase">
                Interactive Mass Flux Solver
              </span>
              <span className="text-[10px] font-mono text-ink-dim hidden sm:inline">
                Energy-to-Mass Conservation
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-ink-primary mt-1">
              Sublimation Mass Flow from Heat Input (dm/dt = Q / ΔHs)
            </h3>
          </div>
        </div>

        <button
          onClick={copyFormula}
          className="p-2 rounded-lg border border-hairline text-ink-muted hover:text-amber hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
          title="Copy calculation"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 bg-bg-surface/40 border-b border-hairline">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <div className="p-4 rounded-xl bg-bg-panel border border-hairline flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-ink-dim font-bold mb-1">
              Energy Conservation Law
            </span>
            <div className="py-1 overflow-x-auto w-full">
              <KatexEquation expression="\frac{dm}{dt} = \frac{Q}{\Delta H_s} \quad (\Delta H_s \approx 2{,}838\text{ kJ/kg})" displayMode />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-subtle/20 dark:bg-amber-subtle/30 border-2 border-amber/40 flex flex-col justify-center items-center text-center">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
              <span>Live Evaluated Sublimation Rate</span>
            </div>
            <div className="py-1 overflow-x-auto w-full text-ink-primary font-bold">
              <KatexEquation
                expression={`\\frac{dm}{dt} = \\frac{\\mathbf{${heatDutyW}\\text{ W}}}{2{,}838{,}000\\text{ J/kg}} \\times 3600 = \\mathbf{${massRateKgH.toFixed(3)}\\text{ kg/h}}`}
                displayMode
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-ink-primary">Jacket Heat Transfer Duty (Q)</span>
              <span className="font-mono text-amber font-bold">{heatDutyW} W</span>
            </div>
            <input
              type="range"
              min="100"
              max="2500"
              step="25"
              value={heatDutyW}
              onChange={(e) => setHeatDutyW(Number(e.target.value))}
              className="w-full accent-amber cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-ink-dim mt-1 font-mono">
              <span>100 W</span>
              <span>631 W (Hosokawa 20L spec)</span>
              <span>2,500 W (Pilot scale)</span>
            </div>
          </div>

          <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-ink-primary">Batch Water Mass to Sublime</span>
              <span className="font-mono text-ink-primary font-bold">{batchWaterKg.toFixed(1)} kg</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="20.0"
              step="0.5"
              value={batchWaterKg}
              onChange={(e) => setBatchWaterKg(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-ink-dim mt-1 font-mono">
              <span>1.0 kg</span>
              <span>9.0 kg (90% of 10kg batch)</span>
              <span>20.0 kg</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="p-4 rounded-xl bg-amber-subtle/25 border-2 border-amber/40 shadow-xs">
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber font-bold">
              Sublimation Rate &amp; Drying Duration
            </div>
            <div className="my-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-ink-primary">
                {massRateKgH.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-amber ml-1">kg/h</span>
              <span className="text-xs font-mono text-ink-dim ml-2">({massRateGMin.toFixed(1)} g/min)</span>
            </div>
            <div className="text-xs font-mono text-ink-primary font-bold mt-2">
              Primary Drying Duration: <span className="text-amber">{primaryHours.toFixed(1)} hours</span>
            </div>
          </div>

          {Math.abs(heatDutyW - 631) < 20 && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Exact match to Hosokawa AFD-20 benchmark (0.8 kg/h at ~630 W, 11.25 h drying).</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 9. IDEAL GAS VAPOR EXPANSION WORKBENCH (Deep Vacuum Volumetric Expansion)
// V = nRT / P
// ============================================================================
export function IdealGasVacuumVolumeWorkbench() {
  const [gasType, setGasType] = useState<'co2' | 'water'>('co2');
  const [massKg, setMassKg] = useState(1.0);
  const [tempC, setTempC] = useState(0);
  const [pressureMbar, setPressureMbar] = useState(0.04); // Chapter 23 reference: 0.04 mbar
  const [copied, setCopied] = useState(false);

  // Molar masses in g/mol
  const molarMass = gasType === 'co2' ? 44.01 : 18.015;
  const gasName = gasType === 'co2' ? 'Carbon Dioxide (CO₂)' : 'Water Vapor (H₂O)';
  const moles = (massKg * 1000) / molarMass;
  const tempK = tempC + 273.15;
  const pressurePa = pressureMbar * 100;

  // V = nRT / P (m³)
  const R = 8.314; // J/(mol·K)
  const volumeM3 = pressurePa > 0 ? (moles * R * tempK) / pressurePa : 0;
  const volumeLiters = volumeM3 * 1000;

  // Volume at STP (1013.25 mbar, 0°C)
  const volumeStpLiters = ((moles * R * 273.15) / 101325) * 1000;
  const expansionRatio = volumeStpLiters > 0 ? volumeLiters / volumeStpLiters : 0;

  const copyFormula = () => {
    navigator.clipboard.writeText(
      `Ideal Gas Law V = nRT/P: ${massKg}kg of ${gasName}, T=${tempC}°C, P=${pressureMbar}mbar -> V=${Math.round(volumeLiters).toLocaleString()} Liters (${expansionRatio.toFixed(0)}x expansion)`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 rounded-2xl border-2 border-amber/40 bg-bg-panel shadow-xl overflow-hidden transition-all duration-300">
      <div className="p-4 sm:p-5 border-b border-hairline bg-bg-surface/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-subtle text-amber flex items-center justify-center border border-amber/30 shrink-0">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber text-on-amber text-[10px] font-mono font-bold tracking-wider uppercase">
                Interactive Vacuum Physics Workbench
              </span>
              <span className="text-[10px] font-mono text-ink-dim hidden sm:inline">
                Ideal Gas Law Under Deep Vacuum
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-ink-primary mt-1">
              Gas Volumetric Expansion at Deep Vacuum (V = nRT / P)
            </h3>
          </div>
        </div>

        <button
          onClick={copyFormula}
          className="p-2 rounded-lg border border-hairline text-ink-muted hover:text-amber hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
          title="Copy calculation"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 bg-bg-surface/40 border-b border-hairline">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <div className="p-4 rounded-xl bg-bg-panel border border-hairline flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-ink-dim font-bold mb-1">
              Ideal Gas Law (Vacuum Form)
            </span>
            <div className="py-1 overflow-x-auto w-full">
              <KatexEquation expression="V = \frac{n \cdot R \cdot T}{P} \quad \left(n = \frac{m}{M}\right)" displayMode />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-subtle/20 dark:bg-amber-subtle/30 border-2 border-amber/40 flex flex-col justify-center items-center text-center">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
              <span>Expanded Vapor Volume</span>
            </div>
            <div className="py-1 overflow-x-auto w-full text-ink-primary font-bold">
              <KatexEquation
                expression={`V = \\frac{${moles.toFixed(1)}\\text{ mol} \\times 8.314 \\times ${tempK.toFixed(0)}\\text{ K}}{${pressurePa.toFixed(1)}\\text{ Pa}} \\implies \\mathbf{${Math.round(volumeLiters).toLocaleString()}\\text{ Liters}}`}
                displayMode
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 bg-bg-surface p-2.5 rounded-xl border border-hairline">
            <span className="text-xs font-semibold text-ink-primary">Substance:</span>
            <button
              onClick={() => setGasType('co2')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                gasType === 'co2' ? 'bg-amber text-on-amber font-bold' : 'bg-bg-panel text-ink-secondary border border-hairline'
              }`}
            >
              CO₂ (Dry Ice / Direct Injection)
            </button>
            <button
              onClick={() => setGasType('water')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                gasType === 'water' ? 'bg-amber text-on-amber font-bold' : 'bg-bg-panel text-ink-secondary border border-hairline'
              }`}
            >
              Water Vapor (Sublimation)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-ink-primary">Sublimed Mass (m)</span>
                <span className="font-mono text-amber font-bold">{massKg.toFixed(1)} kg ({moles.toFixed(1)} mol)</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={massKg}
                onChange={(e) => setMassKg(Number(e.target.value))}
                className="w-full accent-amber cursor-pointer"
              />
            </div>

            <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-ink-primary">Vacuum Pressure (P)</span>
                <span className="font-mono text-cryo font-bold">{pressureMbar.toFixed(3)} mbar ({pressurePa.toFixed(1)} Pa)</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="1.0"
                step="0.01"
                value={pressureMbar}
                onChange={(e) => setPressureMbar(Number(e.target.value))}
                className="w-full accent-[#7FD4FF] cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="p-4 rounded-xl bg-amber-subtle/25 border-2 border-amber/40 shadow-xs">
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber font-bold">
              Calculated Volume at Vacuum
            </div>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-ink-primary">
                {Math.round(volumeLiters / 1000).toLocaleString()}k
              </span>
              <span className="text-sm font-bold text-amber ml-1">Liters</span>
              <span className="text-xs font-mono text-ink-dim block mt-1">
                ({volumeM3.toFixed(0)} m³ of gas)
              </span>
            </div>
            <div className="text-xs font-mono text-ink-primary font-bold">
              Expansion vs. Atmospheric: <span className="text-amber">{Math.round(expansionRatio).toLocaleString()}× larger</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-mono">
            Directly confirms Chapter 23: 1 kg CO₂ at 0.04 mbar occupies ~13 million liters of gas, illustrating why direct cryogen injection overloads freeze dryer vacuum systems.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 10. SUBLIMATION THEORETICAL FORMULA CARD (Interactive Formula Explorer)
// Q = (dm/dt) × ΔHs
// ============================================================================
export function SublimationTheoreticalFormulaCard() {
  const [copied, setCopied] = useState(false);
  const [selectedVar, setSelectedVar] = useState<'q' | 'm' | 'dh'>('q');

  const varDetails = {
    q: {
      symbol: 'Q',
      name: 'Heat Duty / Energy Input Rate',
      units: 'Watts (W) or Joules/sec (J/s)',
      explanation: 'The rate of thermal energy delivered across the vessel jacket wall to supply the latent heat required to sustain continuous sublimation without product temperature drop.',
      benchmark: '631 W for Hosokawa 20L model at 0.8 kg/h sublimation.',
    },
    m: {
      symbol: 'ṁ or (dm/dt)',
      name: 'Sublimation Mass Flow Rate',
      units: 'kg/h or kg/s',
      explanation: 'The mass of ice converted directly into water vapor per unit time. Governed strictly by the rate of heat conduction to the sublimation front.',
      benchmark: '0.80 kg/h (2.222 × 10⁻⁴ kg/s) published spec for Hosokawa AFD-20.',
    },
    dh: {
      symbol: 'ΔHs',
      name: 'Latent Heat of Sublimation of Ice',
      units: 'kJ/kg or J/kg',
      explanation: 'Thermodynamic enthalpy required to sublimate ice directly to vapor. Equal to latent heat of fusion (334 kJ/kg) + latent heat of vaporization (2,504 kJ/kg).',
      benchmark: '≈ 2,838 kJ/kg (2,838,000 J/kg) at typical lyophilization vacuum.',
    },
  };

  const copyLatex = () => {
    navigator.clipboard.writeText('Q = \\dot{m} \\cdot \\Delta H_s');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-2xl p-4 sm:p-5 border-2 border-amber/40 bg-bg-panel shadow-lg overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-hairline">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber shadow-sm animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber font-bold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            <span>Fundamental Sublimation Enthalpy Law</span>
          </span>
        </div>

        <button
          onClick={copyLatex}
          className="p-1.5 rounded-lg border border-hairline text-ink-muted hover:text-amber hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
          title="Copy LaTeX"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy LaTeX'}</span>
        </button>
      </div>

      <div className="py-4 text-center overflow-x-auto bg-bg-surface/50 rounded-xl my-2 border border-hairline">
        <KatexEquation expression="Q = \dot{m} \cdot \Delta H_s \iff \dot{m} = \frac{Q}{\Delta H_s}" displayMode />
      </div>

      {/* Interactive Variable Selector */}
      <div className="mt-4 pt-3 border-t border-hairline">
        <div className="text-[11px] font-mono text-ink-dim uppercase tracking-wider mb-2 font-semibold">
          Click any variable to inspect engineering definition:
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {(['q', 'm', 'dh'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedVar(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                selectedVar === key
                  ? 'bg-amber text-on-amber font-bold shadow-sm ring-1 ring-amber'
                  : 'bg-bg-surface text-ink-secondary hover:text-ink-primary border border-hairline'
              }`}
            >
              <span>{varDetails[key].symbol}</span>
              <span className="text-[10px] opacity-80">({varDetails[key].name.split(' ')[0]})</span>
            </button>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-bg-surface border border-hairline space-y-1.5 text-xs font-mono animate-fade-in">
          <div className="flex items-center justify-between text-ink-primary font-bold">
            <span>{varDetails[selectedVar].name} ({varDetails[selectedVar].symbol})</span>
            <span className="text-amber text-[11px]">{varDetails[selectedVar].units}</span>
          </div>
          <p className="text-ink-secondary text-[11px] leading-relaxed font-sans">
            {varDetails[selectedVar].explanation}
          </p>
          <div className="text-[10px] text-cryo font-mono pt-1">
            <strong>Hosokawa Benchmark:</strong> {varDetails[selectedVar].benchmark}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 11. CONE GEOMETRY & HEAT TRANSFER AREA SOLVER
// ============================================================================
export function ConeGeometryWorkbench() {
  const [volumeL, setVolumeL] = useState(20); // 20 L nominal vessel
  const [halfAngleDeg, setHalfAngleDeg] = useState(25); // 25° default
  const [activeFormula, setActiveFormula] = useState<'height' | 'diameter' | 'slant' | 'area'>('height');
  const [copied, setCopied] = useState(false);

  const alphaRad = (halfAngleDeg * Math.PI) / 180;
  const tanAlpha = Math.tan(alphaRad);
  const tan2Alpha = tanAlpha * tanAlpha;
  const sinAlpha = Math.sin(alphaRad);

  const volumeCm3 = volumeL * 1000;
  const heightCm = Math.cbrt((3 * volumeCm3) / (Math.PI * tan2Alpha));
  const radiusCm = heightCm * tanAlpha;
  const diameterCm = 2 * radiusCm;
  const slantCm = radiusCm / sinAlpha;
  const lateralAreaM2 = (Math.PI * radiusCm * slantCm) / 10000;

  const PURE_FORMULAS = {
    height: {
      title: 'Conical Shell Axial Height Derivation',
      latex: 'V = \\frac{\\pi}{3} \\cdot r^2 \\cdot h = \\frac{\\pi}{3} \\cdot \\tan^2(\\alpha) \\cdot h^3 \\implies h = \\left[ \\frac{3 \\cdot V}{\\pi \\cdot \\tan^2(\\alpha)} \\right]^{1/3}',
      variables: [
        { symbol: 'h', name: 'Conical Shell Height', unit: 'cm / mm', role: 'Vertical depth from bottom discharge nozzle to top head tangent seam.' },
        { symbol: 'V', name: 'Nominal Internal Volume', unit: 'L / cm³', role: 'Total gross volume enclosed by the conical vessel shell (1 L = 1,000 cm³).' },
        { symbol: '\\alpha', name: 'Cone Half-Angle (Semi-Angle)', unit: 'degrees (°)', role: 'Angle between vertical centerline and conical shell wall (Hosokawa standard is 25°).' },
        { symbol: '\\tan(\\alpha)', name: 'Aspect Ratio Ratio (r / h)', unit: 'ratio', role: 'Taper tangent ratio determining product slide angle and discharge flowability.' },
        { symbol: '\\pi', name: 'Archimedes Constant', unit: 'constant', role: 'Circle perimeter-to-diameter ratio (approximately 3.14159).' },
      ],
    },
    diameter: {
      title: 'Top Base Major Diameter Formulation',
      latex: 'r = h \\cdot \\tan(\\alpha) \\implies D = 2 \\cdot r = 2 \\cdot h \\cdot \\tan(\\alpha)',
      variables: [
        { symbol: 'D', name: 'Top Major Diameter', unit: 'cm / mm', role: 'Internal diameter at top flange where conical shell joins the dished head.' },
        { symbol: 'r', name: 'Top Base Radius', unit: 'cm / mm', role: 'Half of top diameter (r = D / 2) at top tangent plane.' },
        { symbol: 'h', name: 'Conical Shell Height', unit: 'cm / mm', role: 'Axial vertical depth calculated from nominal volume and half-angle.' },
        { symbol: '\\alpha', name: 'Cone Half-Angle', unit: 'degrees (°)', role: 'Vessel semi-angle from vertical axis governing radial taper expansion.' },
      ],
    },
    slant: {
      title: 'Conical Shell Slant Wall Generator Length',
      latex: 'L_{\\text{slant}} = \\sqrt{h^2 + r^2} = \\frac{r}{\\sin(\\alpha)} = \\frac{D / 2}{\\sin(\\alpha)}',
      variables: [
        { symbol: 'L_{\\text{slant}}', name: 'Slant Generator Length', unit: 'cm / mm', role: 'True wall length along conical generator line from apex to upper flange.' },
        { symbol: 'D', name: 'Top Major Diameter', unit: 'cm / mm', role: 'Upper inside diameter across top circular opening.' },
        { symbol: '\\alpha', name: 'Cone Half-Angle', unit: 'degrees (°)', role: 'Semi-angle from vertical axis.' },
        { symbol: '\\sin(\\alpha)', name: 'Sine of Half-Angle', unit: 'ratio', role: 'Trigonometric sine projecting top radius onto slanted wall.' },
      ],
    },
    area: {
      title: 'Lateral Heat Transfer Surface Area Formulation',
      latex: 'A_{\\text{lat}} = \\pi \\cdot r \\cdot L_{\\text{slant}} = \\pi \\cdot \\left(\\frac{D}{2}\\right) \\cdot L_{\\text{slant}} = \\frac{\\pi \\cdot D^2}{4 \\cdot \\sin(\\alpha)}',
      variables: [
        { symbol: 'A_{\\text{lat}}', name: 'Lateral Heat Transfer Area', unit: 'm²', role: 'Total wetted conical jacket contact area available for sublimation heat input.' },
        { symbol: 'D', name: 'Top Major Diameter', unit: 'm / cm', role: 'Upper inside diameter of the conical vessel shell.' },
        { symbol: 'L_{\\text{slant}}', name: 'Slant Generator Length', unit: 'm / cm', role: 'Effective contact length along the conical jacket heating wall.' },
        { symbol: '\\pi', name: 'Archimedes Constant', unit: 'constant', role: 'Circle geometry constant (approximately 3.14159).' },
      ],
    },
  };

  const copyResults = () => {
    navigator.clipboard.writeText(
      `Conical Vessel Geometry: V=${volumeL}L, α=${halfAngleDeg}°, h=${heightCm.toFixed(2)}cm, D=${diameterCm.toFixed(2)}cm, Slant=${slantCm.toFixed(2)}cm, Area=${lateralAreaM2.toFixed(3)}m²`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSubstitutedLatex = () => {
    switch (activeFormula) {
      case 'height':
        return `h = \\left[ \\frac{3 \\cdot (${volumeCm3.toLocaleString()}\\text{ cm}^3)}{\\pi \\cdot \\tan^2(${halfAngleDeg}^\\circ)} \\right]^{1/3} = \\mathbf{${heightCm.toFixed(2)}\\text{ cm}} \\quad (${(heightCm * 10).toFixed(1)}\\text{ mm})`;
      case 'diameter':
        return `D = 2 \\cdot (${heightCm.toFixed(2)}\\text{ cm}) \\cdot \\tan(${halfAngleDeg}^\\circ) = \\mathbf{${diameterCm.toFixed(2)}\\text{ cm}} \\quad (${(diameterCm * 10).toFixed(1)}\\text{ mm})`;
      case 'slant':
        return `L_{\\text{slant}} = \\frac{${(diameterCm / 2).toFixed(2)}\\text{ cm}}{\\sin(${halfAngleDeg}^\\circ)} = \\mathbf{${slantCm.toFixed(2)}\\text{ cm}} \\quad (${(slantCm * 10).toFixed(1)}\\text{ mm})`;
      case 'area':
        return `A_{\\text{lat}} = \\pi \\cdot (${(diameterCm / 2).toFixed(2)}\\text{ cm}) \\cdot (${slantCm.toFixed(2)}\\text{ cm}) = \\mathbf{${lateralAreaM2.toFixed(3)}\\text{ m}^2} \\quad (${(lateralAreaM2 * 10000).toFixed(0)}\\text{ cm}^2)`;
    }
  };

  const currentDef = PURE_FORMULAS[activeFormula];

  return (
    <div className="my-8 rounded-2xl border-2 border-amber/40 bg-bg-panel shadow-xl overflow-hidden transition-all duration-300 hover:border-amber/60">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-hairline bg-gradient-to-r from-amber/15 via-bg-surface to-bg-panel flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber text-on-amber flex items-center justify-center shadow-md shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber text-on-amber text-[10px] font-mono font-bold tracking-wider uppercase">
                Interactive Sizing Workbench
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-semibold">
                ASME / Hosokawa Geometry
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-ink-primary mt-1">
              Conical Shell Geometry & Heat Transfer Area Solver
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setVolumeL(20);
              setHalfAngleDeg(25);
            }}
            className="p-2 rounded-lg border border-hairline text-ink-muted hover:text-amber hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">20L Default</span>
          </button>
          <button
            onClick={copyResults}
            className="p-2 rounded-lg border border-hairline text-ink-muted hover:text-amber hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Step Tabs: Select Which Formula to Inspect and Simulate */}
        <div>
          <div className="text-xs font-semibold text-ink-muted mb-2 uppercase tracking-wider font-mono">
            Select Active Mathematical Formulation:
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'height', label: 'Cone Height (h)' },
              { id: 'diameter', label: 'Top Diameter (D)' },
              { id: 'slant', label: 'Slant Length (L_slant)' },
              { id: 'area', label: 'Lateral Area (A_lat)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFormula(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer border ${
                  activeFormula === tab.id
                    ? 'bg-amber text-on-amber border-amber shadow-sm'
                    : 'bg-bg-surface text-ink-secondary border-hairline hover:bg-bg-panel hover:text-ink-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 1 & 2: GOVERNING EQUATION & DYNAMIC UNSTACKABLE WHAT IS WHAT */}
        <GoverningEquationStepStack
          step1Number={1}
          step2Number={2}
          equationTitle={currentDef.title}
          latex={currentDef.latex}
          variables={currentDef.variables}
          variableCategoryLabel="Dimensional Symbols & Descriptions"
          accentColor="amber"
        />

        {/* STEP 3: INTERACTIVE SIMULATION & NUMERICAL EVALUATION */}
        <div className="p-4 sm:p-5 rounded-xl bg-bg-surface border-2 border-amber/30 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-mono font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-primary">
                Interactive Simulation (Live Numerical Substitution)
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              Active Parameters Live Coupled
            </span>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-bg-panel border border-hairline space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-ink-primary">Nominal Vessel Volume (V):</span>
                <span className="font-mono font-bold text-amber text-sm">{volumeL} Liters</span>
              </div>
              <input
                type="range"
                min="1"
                max="200"
                step="1"
                value={volumeL}
                onChange={(e) => setVolumeL(Number(e.target.value))}
                className="w-full accent-amber cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-ink-muted">
                <span>1 L (R&D)</span>
                <span>20 L (Benchmark)</span>
                <span>200 L (Pilot)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-bg-panel border border-hairline space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-ink-primary">Cone Half-Angle (α from vertical):</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm">{halfAngleDeg}°</span>
              </div>
              <input
                type="range"
                min="20"
                max="35"
                step="1"
                value={halfAngleDeg}
                onChange={(e) => setHalfAngleDeg(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-ink-muted">
                <span>20° (Steep / Buckling resistant)</span>
                <span>25° (Standard)</span>
                <span>35° (Shallow)</span>
              </div>
            </div>
          </div>

          {/* Live Substituted KaTeX Equation */}
          <div className="p-4 rounded-xl bg-bg-panel border-2 border-amber/40 shadow-inner">
            <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1 text-center">
              Active Numerical Substitution & Evaluated Result:
            </div>
            <div className="text-center overflow-x-auto py-2 font-mono text-ink-primary">
              <KatexEquation expression={getSubstitutedLatex()} displayMode />
            </div>
          </div>

          {/* Computed Metrics Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-bg-panel border border-hairline text-center">
              <div className="text-[10px] uppercase font-mono text-ink-muted">Cone Height (h)</div>
              <div className="text-lg font-bold font-mono text-ink-primary mt-0.5">{heightCm.toFixed(1)} cm</div>
              <div className="text-[10px] font-mono text-ink-muted">{(heightCm * 10).toFixed(0)} mm</div>
            </div>
            <div className="p-3 rounded-xl bg-bg-panel border border-hairline text-center">
              <div className="text-[10px] uppercase font-mono text-ink-muted">Major Diameter (D)</div>
              <div className="text-lg font-bold font-mono text-ink-primary mt-0.5">{diameterCm.toFixed(1)} cm</div>
              <div className="text-[10px] font-mono text-ink-muted">{(diameterCm * 10).toFixed(0)} mm</div>
            </div>
            <div className="p-3 rounded-xl bg-bg-panel border border-hairline text-center">
              <div className="text-[10px] uppercase font-mono text-ink-muted">Slant Length</div>
              <div className="text-lg font-bold font-mono text-ink-primary mt-0.5">{slantCm.toFixed(1)} cm</div>
              <div className="text-[10px] font-mono text-ink-muted">{(slantCm * 10).toFixed(0)} mm</div>
            </div>
            <div className="p-3 rounded-xl bg-bg-panel border border-hairline text-center">
              <div className="text-[10px] uppercase font-mono text-ink-muted">Lateral Area</div>
              <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{lateralAreaM2.toFixed(3)} m²</div>
              <div className="text-[10px] font-mono text-ink-muted">Jacket wetted surface</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 12. NON-LINEAR CONICAL FILL HEIGHT WORKBENCH
// h_fill = h * (V_fill / V_nom)^(1/3)
// ============================================================================
export function NonlinearFillHeightWorkbench() {
  const [fillFractionPercent, setFillFractionPercent] = useState(50); // Default 50%
  const [totalHeightCm, setTotalHeightCm] = useState(44.5); // Hosokawa 20L default
  const [copied, setCopied] = useState(false);

  const fillFraction = fillFractionPercent / 100;
  const heightRatio = Math.cbrt(fillFraction);
  const fillHeightCm = totalHeightCm * heightRatio;
  const freeboardHeightCm = totalHeightCm - fillHeightCm;
  const freeboardPercent = (1 - heightRatio) * 100;

  const copyFormula = () => {
    navigator.clipboard.writeText(
      `Conical Non-linear Fill: Volume Fill=${fillFractionPercent}%, Liquid Height=${(heightRatio * 100).toFixed(1)}% (${fillHeightCm.toFixed(1)}cm), Freeboard=${freeboardPercent.toFixed(1)}% (${freeboardHeightCm.toFixed(1)}cm)`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const latexFormula = `h_{\\text{fill}} = h_{\\text{total}} \\cdot \\left(\\frac{${fillFractionPercent}\\%}{100\\%}\\right)^{1/3} = ${totalHeightCm}\\text{ cm} \\cdot ${(heightRatio).toFixed(4)} = \\mathbf{${fillHeightCm.toFixed(2)}\\text{ cm}} \\quad (${(heightRatio * 100).toFixed(1)}\\%\\text{ of } h_{\\text{total}})`;

  return (
    <div className="my-8 rounded-2xl border-2 border-cyan-500/40 bg-bg-panel shadow-xl overflow-hidden transition-all duration-300 hover:border-cyan-500/60">
      <div className="p-4 sm:p-5 border-b border-hairline bg-gradient-to-r from-cyan-500/15 via-bg-surface to-bg-panel flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-600 text-white text-[10px] font-mono font-bold tracking-wider uppercase">
                Interactive Fluid Dynamics
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber/15 text-amber border border-amber/30 text-[10px] font-mono font-semibold">
                V ∝ h³ Cubic Law
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-ink-primary mt-1">
              Cone Non-Linear Height vs. Volume Fill Calculator
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFillFractionPercent(50);
              setTotalHeightCm(44.5);
            }}
            className="p-2 rounded-lg border border-hairline text-ink-muted hover:text-cyan-600 hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">50% Benchmark</span>
          </button>
          <button
            onClick={copyFormula}
            className="p-2 rounded-lg border border-hairline text-ink-muted hover:text-cyan-600 hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* STEP 1 & 2: GOVERNING EQUATION & DYNAMIC UNSTACKABLE WHAT IS WHAT */}
        <GoverningEquationStepStack
          step1Number={1}
          step2Number={2}
          equationTitle="Conical Frustum Liquid Level Cubic Law"
          latex="h_{\text{fill}} = h_{\text{total}} \cdot \left(\frac{V_{\text{fill}}}{V_{\text{nominal}}}\right)^{1/3} = h_{\text{total}} \cdot f^{1/3} \qquad h_{\text{freeboard}} = h_{\text{total}} - h_{\text{fill}} = h_{\text{total}} \cdot \left(1 - f^{1/3}\right)"
          variables={[
            { symbol: 'h_{\\text{fill}}', name: 'Liquid Fill Depth', unit: 'cm / mm', role: 'Vertical depth of liquid powder slurry from cone discharge nozzle to free surface.' },
            { symbol: 'h_{\\text{total}}', name: 'Total Shell Height', unit: 'cm / mm', role: 'Full vertical height of the conical processing chamber.' },
            { symbol: 'V_{\\text{fill}}', name: 'Working Batch Volume', unit: 'L / cm³', role: 'Liquid batch volume charged into the freeze dryer (typically 50% of nominal).' },
            { symbol: 'V_{\\text{nominal}}', name: 'Nominal Vessel Volume', unit: 'L / cm³', role: 'Total gross internal volume of the conical vessel shell.' },
            { symbol: 'f', name: 'Volume Fill Fraction', unit: 'fraction / %', role: 'Ratio V_fill / V_nominal (Hosokawa AFD cGMP operating benchmark is 0.50).' },
            { symbol: 'f^{1/3}', name: 'Cubic Non-Linear Factor', unit: 'ratio', role: 'Geometric factor showing volume scales with the third power of depth in a cone (0.5^(1/3) = 0.7937).' },
            { symbol: 'h_{\\text{freeboard}}', name: 'Vapor Freeboard', unit: 'cm / mm', role: 'Headspace clearance required above bed for sublime vapor escape without powder entrainment.' },
          ]}
          variableCategoryLabel="Dimensional Symbols & Descriptions"
          accentColor="cyan"
        />

        {/* STEP 3: INTERACTIVE SIMULATION & NUMERICAL EVALUATION */}
        <div className="p-4 sm:p-5 rounded-xl bg-bg-surface border-2 border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-mono font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-primary">
                Interactive Simulation (Live Numerical Substitution)
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              Active Parameters Live Coupled
            </span>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-bg-panel border border-hairline space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-ink-primary">Volume Fill Percentage (f):</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm">{fillFractionPercent}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="1"
                value={fillFractionPercent}
                onChange={(e) => setFillFractionPercent(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-ink-muted">
                <span>30%</span>
                <span className="text-cyan-600 font-bold">50% (Hosokawa Limit)</span>
                <span className="text-rose-500 font-bold">80% (Danger)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-bg-panel border border-hairline space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-ink-primary">Total Vessel Height (h_total):</span>
                <span className="font-mono font-bold text-amber text-sm">{totalHeightCm} cm</span>
              </div>
              <input
                type="range"
                min="20"
                max="250"
                step="0.5"
                value={totalHeightCm}
                onChange={(e) => setTotalHeightCm(Number(e.target.value))}
                className="w-full accent-amber cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-ink-muted">
                <span>20 cm (R&D)</span>
                <span>44.5 cm (20L)</span>
                <span>250 cm (Industrial)</span>
              </div>
            </div>
          </div>

          {/* Live Substituted KaTeX Equation */}
          <div className="p-4 rounded-xl bg-bg-panel border-2 border-cyan-500/40 shadow-inner">
            <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1 text-center">
              Active Numerical Substitution & Evaluated Result:
            </div>
            <div className="text-center overflow-x-auto py-2 font-mono text-ink-primary">
              <KatexEquation expression={latexFormula} displayMode />
            </div>
          </div>

          {/* Visual Progress Bars */}
          <div className="p-4 rounded-xl bg-bg-panel border border-hairline space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-ink-secondary">Volume Fill: {fillFractionPercent}%</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">Liquid Surface: {(heightRatio * 100).toFixed(1)}% of Height</span>
              </div>
              <div className="w-full h-4 rounded-full bg-bg-surface border border-hairline overflow-hidden flex">
                <div
                  style={{ width: `${heightRatio * 100}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-600 transition-all duration-200"
                />
                <div
                  style={{ width: `${freeboardPercent}%` }}
                  className="h-full bg-amber/20 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex justify-between text-[11px] font-mono text-ink-muted">
              <span>Liquid Depth: <strong className="text-ink-primary">{fillHeightCm.toFixed(1)} cm</strong> ({(fillHeightCm * 10).toFixed(0)} mm)</span>
              <span>Freeboard Remaining: <strong className="text-amber">{freeboardHeightCm.toFixed(1)} cm</strong> ({freeboardPercent.toFixed(1)}%)</span>
            </div>

            {fillFractionPercent > 65 && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Warning: Freeboard collapsed to under 15%. Agitator folding action and vapor disengagement will be severely impaired.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 13. HEAD THICKNESS ASME UG-32 WORKBENCH
// Torispherical UG-32(e) vs 2:1 Ellipsoidal UG-32(d)
// ============================================================================
export function HeadThicknessWorkbench() {
  const [headType, setHeadType] = useState<'torispherical' | 'ellipsoidal'>('torispherical');
  const [diameterMm, setDiameterMm] = useState(415); // Top diameter in mm
  const [pressureBar, setPressureBar] = useState(3.0); // Steam SIP pressure
  const [stressMPa, setStressMPa] = useState(115); // 316L allowable stress
  const [jointEff, setJointEff] = useState(1.0);
  const [copied, setCopied] = useState(false);

  const P_MPa = pressureBar * 0.1;
  const S_MPa = stressMPa;
  const E = jointEff;
  const D = diameterMm;
  const denominator = 2 * S_MPa * E - 0.2 * P_MPa;

  const L = headType === 'torispherical' ? D : 0.9 * D;
  const r = headType === 'torispherical' ? 0.06 * D : 0.17 * D;
  const mFactor = headType === 'torispherical' ? (3 + Math.sqrt(L / r)) / 4 : 1.0;
  const kFactor = 1.0;

  const thicknessMm =
    headType === 'torispherical'
      ? (P_MPa * L * mFactor) / Math.max(1, denominator)
      : (P_MPa * D * kFactor) / Math.max(1, denominator);

  const dishDepthMm = headType === 'torispherical' ? 0.169 * D : D / 4;

  const copyFormula = () => {
    navigator.clipboard.writeText(
      `ASME UG-32 Head Thickness (${headType}): D=${D}mm, P=${pressureBar}bar, S=${stressMPa}MPa, t=${thicknessMm.toFixed(2)}mm`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const latexFormula =
    headType === 'torispherical'
      ? `t = \\frac{P \\cdot L \\cdot M}{2SE - 0.2P} = \\frac{(${P_MPa.toFixed(2)}) \\cdot (${D}) \\cdot (${mFactor.toFixed(3)})}{2(${S_MPa})(${E}) - 0.2(${P_MPa.toFixed(2)})} = ${thicknessMm.toFixed(2)}\\text{ mm}`
      : `t = \\frac{P \\cdot D \\cdot K}{2SE - 0.2P} = \\frac{(${P_MPa.toFixed(2)}) \\cdot (${D}) \\cdot (1.0)}{2(${S_MPa})(${E}) - 0.2(${P_MPa.toFixed(2)})} = ${thicknessMm.toFixed(2)}\\text{ mm}`;

  return (
    <div className="my-8 rounded-2xl border-2 border-emerald-500/40 bg-bg-panel shadow-xl overflow-hidden transition-all duration-300 hover:border-emerald-500/60">
      <div className="p-4 sm:p-5 border-b border-hairline bg-gradient-to-r from-emerald-500/15 via-bg-surface to-bg-panel flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-mono font-bold tracking-wider uppercase">
                ASME Section VIII Div 1
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-semibold">
                UG-32 Structural Head Sizing
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-ink-primary mt-1">
              Top Closure Head Thickness & Profile Calculator
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-hairline bg-bg-surface p-0.5">
            <button
              onClick={() => setHeadType('torispherical')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition cursor-pointer ${
                headType === 'torispherical' ? 'bg-emerald-600 text-white shadow-sm' : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Torispherical F&D
            </button>
            <button
              onClick={() => setHeadType('ellipsoidal')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition cursor-pointer ${
                headType === 'ellipsoidal' ? 'bg-emerald-600 text-white shadow-sm' : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              2:1 Ellipsoidal
            </button>
          </div>
          <button
            onClick={copyFormula}
            className="p-2 rounded-lg border border-hairline text-ink-muted hover:text-emerald-600 hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* STEP 1 & 2: GOVERNING EQUATION & DYNAMIC UNSTACKABLE WHAT IS WHAT */}
        <GoverningEquationStepStack
          step1Number={1}
          step2Number={2}
          equationTitle={headType === 'torispherical' ? 'ASME Section VIII Div 1 UG-32(e)' : 'ASME Section VIII Div 1 UG-32(d)'}
          latex={
            headType === 'torispherical'
              ? "t = \\frac{P \\cdot L \\cdot M}{2 S E - 0.2 P} \\qquad \\text{where } M = \\frac{1}{4} \\left( 3 + \\sqrt{\\frac{L}{r}} \\right) \\quad (L \\le D, \\; r \\ge 0.06D)"
              : "t = \\frac{P \\cdot D \\cdot K}{2 S E - 0.2 P} \\qquad \\text{where } K = \\frac{1}{6} \\left[ 2 + \\left(\\frac{D}{2h}\\right)^2 \\right] = 1.00 \\quad (\\text{for } 2:1 \\text{ ratio})"
          }
          variables={[
            { symbol: 't', name: 'Minimum Design Thickness', unit: 'mm', role: 'Minimum uncorroded wall thickness required to withstand internal clean steam pressure.' },
            { symbol: 'P', name: 'Internal Design Pressure', unit: 'MPa / barg', role: 'Peak steam-in-place (SIP) sterilization design pressure (typically 3.0 barg at 134°C).' },
            { symbol: 'D', name: 'Inside Shell Diameter', unit: 'mm', role: 'Internal diameter at upper flange seam where conical shell attaches to head skirt.' },
            { symbol: 'L', name: 'Inside Crown Radius', unit: 'mm', role: 'Spherical dish radius (L = D for standard ASME flanged & dished torispherical).' },
            { symbol: 'r', name: 'Inside Knuckle Radius', unit: 'mm', role: 'Toroidal knuckle transition radius providing flexibility (r ≥ 0.06D per ASME code).' },
            { symbol: 'M', name: 'Torispherical Stress Factor', unit: 'ratio', role: 'Geometric stress concentration factor derived from crown-to-knuckle ratio L/r.' },
            { symbol: 'K', name: 'Ellipsoidal Stress Factor', unit: 'ratio', role: 'Geometry factor for ellipsoidal heads; equals exactly 1.0 for standard 2:1 ratio.' },
            { symbol: 'S', name: 'Maximum Allowable Stress', unit: 'MPa', role: 'Allowable tensile stress for 316L stainless steel at 120°C per ASME Section II-D (115 MPa).' },
            { symbol: 'E', name: 'Weld Joint Efficiency', unit: 'ratio', role: 'Efficiency factor for head-to-flange circumferential seam (E = 1.0 for 100% RT).' },
          ]}
          variableCategoryLabel="Code Parameters & Material Allowables"
          accentColor="emerald"
        />

        {/* STEP 3: INTERACTIVE SIMULATION & NUMERICAL EVALUATION */}
        <div className="p-4 sm:p-5 rounded-xl bg-bg-surface border-2 border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-mono font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-primary">
                Interactive Simulation (Live Numerical Substitution)
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              Active Parameters Live Coupled
            </span>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-bg-panel border border-hairline space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-ink-primary">Top Diameter (D):</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{diameterMm} mm</span>
              </div>
              <input
                type="range"
                min="200"
                max="1500"
                step="5"
                value={diameterMm}
                onChange={(e) => setDiameterMm(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-bg-panel border border-hairline space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-ink-primary">Steam Pressure (P):</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{pressureBar} barg</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="6.0"
                step="0.1"
                value={pressureBar}
                onChange={(e) => setPressureBar(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-bg-panel border border-hairline space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-ink-primary">Allowable Stress (S):</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{stressMPa} MPa</span>
              </div>
              <input
                type="range"
                min="90"
                max="140"
                step="5"
                value={stressMPa}
                onChange={(e) => setStressMPa(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Live Substituted Equation */}
          <div className="p-4 rounded-xl bg-bg-panel border-2 border-emerald-500/40 shadow-inner">
            <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1 text-center">
              Active Numerical Substitution & Evaluated Result:
            </div>
            <div className="text-center overflow-x-auto py-2 font-mono text-ink-primary">
              <KatexEquation expression={latexFormula} displayMode />
            </div>
          </div>

          {/* Results Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-bg-panel border border-hairline">
              <div className="text-[10px] uppercase font-mono text-ink-muted">Min Thickness (t)</div>
              <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {Math.max(2.0, thicknessMm).toFixed(2)} mm
              </div>
              <div className="text-[10px] font-mono text-ink-muted">Internal steam governed</div>
            </div>
            <div className="p-3 rounded-xl bg-bg-panel border border-hairline">
              <div className="text-[10px] uppercase font-mono text-ink-muted">Crown Radius (L)</div>
              <div className="text-lg font-bold font-mono text-ink-primary mt-0.5">{Math.round(L)} mm</div>
              <div className="text-[10px] font-mono text-ink-muted">{headType === 'torispherical' ? 'L = D' : 'L = 0.9D'}</div>
            </div>
            <div className="p-3 rounded-xl bg-bg-panel border border-hairline">
              <div className="text-[10px] uppercase font-mono text-ink-muted">Knuckle Radius (r)</div>
              <div className="text-lg font-bold font-mono text-ink-primary mt-0.5">{Math.round(r)} mm</div>
              <div className="text-[10px] font-mono text-ink-muted">{headType === 'torispherical' ? 'r ≥ 0.06D' : 'r = 0.17D'}</div>
            </div>
            <div className="p-3 rounded-xl bg-bg-panel border border-hairline">
              <div className="text-[10px] uppercase font-mono text-ink-muted">Dish Depth</div>
              <div className="text-lg font-bold font-mono text-ink-primary mt-0.5">{Math.round(dishDepthMm)} mm</div>
              <div className="text-[10px] font-mono text-ink-muted">Forming rise</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 14. BUCKLING PRESSURE WINDENBURG-TRILLING WORKBENCH
// Classical Elastic Buckling Pressure for Conical / Cylindrical Shells
// ============================================================================
export function BucklingPressureWorkbench() {
  const [thicknessMm, setThicknessMm] = useState(3.0);
  const [diameterMm, setDiameterMm] = useState(457);
  const [slantLengthMm, setSlantLengthMm] = useState(490);
  const [copied, setCopied] = useState(false);

  const E_MPa = 193000; // 316L Young's Modulus in MPa
  const nu = 0.3; // Poisson ratio

  const t_over_Do = thicknessMm / diameterMm;
  const L_over_Do = slantLengthMm / diameterMm;

  const numerator = 2.42 * E_MPa * Math.pow(t_over_Do, 2.5);
  const denominator = Math.pow(1 - nu * nu, 0.75) * Math.max(0.01, L_over_Do - 0.45 * Math.pow(t_over_Do, 0.5));

  const pCritMPa = Math.max(0.01, numerator / Math.max(0.01, denominator));
  const pCritBar = pCritMPa * 10.0;
  const allowableExternalBar = pCritBar / 3.0; // ASME safety factor = 3.0
  const isSafe = allowableExternalBar >= 1.013;

  const copyFormula = () => {
    navigator.clipboard.writeText(
      `Windenburg-Trilling Elastic Buckling: t=${thicknessMm}mm, Do=${diameterMm}mm, L=${slantLengthMm}mm -> P_crit=${pCritBar.toFixed(2)} bar, P_allowable=${allowableExternalBar.toFixed(2)} bar`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const latexFormula = `P_{\\text{cr}} = \\frac{2.42 \\cdot E \\cdot (t / D_o)^{5/2}}{(1 - \\nu^2)^{3/4} \\cdot \\left[\\frac{L}{D_o} - 0.45 \\cdot (t / D_o)^{1/2}\\right]} = ${pCritBar.toFixed(2)}\\text{ bar} \\implies P_{\\text{allowable}} = \\frac{P_{\\text{cr}}}{3.0} = ${allowableExternalBar.toFixed(2)}\\text{ bar}`;

  return (
    <div className="my-8 rounded-2xl border-2 border-indigo-500/40 bg-bg-panel shadow-xl overflow-hidden transition-all duration-300 hover:border-indigo-500/60">
      <div className="p-4 sm:p-5 border-b border-hairline bg-gradient-to-r from-indigo-500/15 via-bg-surface to-bg-panel flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-mono font-bold tracking-wider uppercase">
                Vacuum Buckling Physics
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-[10px] font-mono font-semibold">
                Windenburg-Trilling 1934
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-ink-primary mt-1">
              Preliminary Shell Elastic Buckling & Vacuum Rating Calculator
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setThicknessMm(3.0);
              setDiameterMm(457);
              setSlantLengthMm(490);
            }}
            className="p-2 rounded-lg border border-hairline text-ink-muted hover:text-indigo-600 hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">20L Default</span>
          </button>
          <button
            onClick={copyFormula}
            className="p-2 rounded-lg border border-hairline text-ink-muted hover:text-indigo-600 hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* STEP 1 & 2: GOVERNING EQUATION & DYNAMIC UNSTACKABLE WHAT IS WHAT */}
        <GoverningEquationStepStack
          step1Number={1}
          step2Number={2}
          equationTitle="Windenburg-Trilling (1934) Elastic Instability"
          latex="P_{\text{cr}} = \frac{2.42 \cdot E \cdot (t / D_o)^{5/2}}{(1 - \nu^2)^{3/4} \cdot \left[\frac{L}{D_o} - 0.45 \cdot (t / D_o)^{1/2}\right]} \qquad P_{\text{allowable}} = \frac{P_{\text{cr}}}{\text{FS}} = \frac{P_{\text{cr}}}{3.0}"
          variables={[
            { symbol: 'P_{\\text{cr}}', name: 'Critical Buckling Pressure', unit: 'bar / MPa', role: 'Theoretical external differential pressure causing instantaneous elastic collapse of the shell.' },
            { symbol: 'P_{\\text{allowable}}', name: 'Permissible Vacuum Rating', unit: 'bar', role: 'Safe working external differential pressure (must exceed 1.013 bar for full vacuum freeze drying).' },
            { symbol: 'E', name: 'Elastic Modulus', unit: 'MPa', role: "Young's modulus of 316L stainless steel (193,000 MPa at operating temperature)." },
            { symbol: '\\nu', name: "Poisson's Ratio", unit: 'ratio', role: 'Transverse-to-axial strain ratio for austenitic stainless steels (standard 0.30).' },
            { symbol: 't', name: 'Shell Wall Thickness', unit: 'mm', role: 'Minimum uncorroded structural metal thickness of the conical shell wall.' },
            { symbol: 'D_o', name: 'Equivalent Outer Diameter', unit: 'mm', role: 'Mean outside diameter across the conical vessel frustum span.' },
            { symbol: 'L', name: 'Unsupported Axial Span', unit: 'mm', role: 'Slant wall length between stiffening rings, top flange, and bottom nozzle reinforcement.' },
            { symbol: '\\text{FS}', name: 'ASME Safety Factor', unit: 'ratio', role: 'Safety margin against vacuum collapse (standard FS = 3.0 per ASME Section VIII Div 1).' },
          ]}
          variableCategoryLabel="Buckling Parameters & Material Constants"
          accentColor="purple"
        />

        {/* STEP 3: INTERACTIVE SIMULATION & NUMERICAL EVALUATION */}
        <div className="p-4 sm:p-5 rounded-xl bg-bg-surface border-2 border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-mono font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-primary">
                Interactive Simulation (Live Numerical Substitution)
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              Active Parameters Live Coupled
            </span>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-bg-panel border border-hairline space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-ink-primary">Shell Thickness (t):</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{thicknessMm.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="8.0"
                step="0.5"
                value={thicknessMm}
                onChange={(e) => setThicknessMm(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-bg-panel border border-hairline space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-ink-primary">Equivalent Dia (Do):</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{diameterMm} mm</span>
              </div>
              <input
                type="range"
                min="200"
                max="1500"
                step="10"
                value={diameterMm}
                onChange={(e) => setDiameterMm(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-bg-panel border border-hairline space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-ink-primary">Effective Length (L):</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{slantLengthMm} mm</span>
              </div>
              <input
                type="range"
                min="200"
                max="1500"
                step="10"
                value={slantLengthMm}
                onChange={(e) => setSlantLengthMm(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Live Equation */}
          <div className="p-4 rounded-xl bg-bg-panel border-2 border-indigo-500/40 shadow-inner">
            <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1 text-center">
              Active Numerical Substitution & Evaluated Result:
            </div>
            <div className="text-center overflow-x-auto py-2 font-mono text-ink-primary">
              <KatexEquation expression={latexFormula} displayMode />
            </div>
          </div>

          {/* Status Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-mono ${
            isSafe
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {isSafe ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-rose-500" />}
              <span>
                {isSafe
                  ? `Safe for Full Vacuum: Allowable ${allowableExternalBar.toFixed(2)} bar exceeds 1.013 bar requirement (Safety Factor 3.0).`
                  : `Insufficient Thickness: Allowable ${allowableExternalBar.toFixed(2)} bar falls below 1.013 bar full vacuum. Increase thickness.`}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-bg-panel border border-hairline">
              {isSafe ? 'PASS' : 'FAIL'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 15. UNIVERSAL INTERACTIVE EQUATION CARD (High Contrast, Adaptive, Interactive)
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
    <div className="my-5 rounded-2xl p-4 sm:p-5 border border-hairline bg-bg-panel shadow-sm overflow-hidden transition-all duration-200 hover:border-amber-500/40">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-hairline">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500/80" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted font-semibold flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Governing Physical Law</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowInspector(!showInspector)}
            className="px-2.5 py-1 rounded-lg border border-hairline text-ink-muted hover:text-ink-primary hover:bg-bg-surface transition cursor-pointer text-xs font-mono flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inspect</span>
            {showInspector ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={copyLatex}
            className="p-1.5 rounded-lg border border-hairline text-ink-muted hover:text-amber-600 dark:hover:text-amber-400 hover:bg-bg-surface transition cursor-pointer text-xs font-mono"
            title="Copy LaTeX"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main KaTeX Rendered Formula */}
      <div className="py-3 text-center overflow-x-auto text-ink-primary font-medium">
        <KatexEquation expression={latexFormula} displayMode />
      </div>

      {/* Expandable Parameter & Source Inspector */}
      {showInspector && (
        <div className="mt-3 pt-3 border-t border-hairline text-xs font-mono text-ink-secondary bg-bg-surface p-3 rounded-xl space-y-1.5 animate-fade-in border border-hairline">
          <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">LaTeX Expression:</div>
          <code className="text-ink-primary block overflow-x-auto p-1.5 bg-bg-panel rounded border border-hairline">{latexFormula}</code>
          {originalBlock && (
            <>
              <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 mt-2">Source Code Representation:</div>
              <code className="text-ink-primary block overflow-x-auto p-1.5 bg-bg-panel rounded border border-hairline">{originalBlock}</code>
            </>
          )}
        </div>
      )}
    </div>
  );
}


