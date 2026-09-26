"use client";

import React, { useState, useMemo } from "react";
import {
  HOSOKAWA_PRESETS,
  calculateConeGeometry,
  calculateJacketCrossCheck,
  calculateHeadDimensions,
  calculateWindenburgTrilling,
  generateCadScheduleExport,
  HeadType,
  HosokawaPreset,
} from "@/lib/vesselSizing";
import {
  Layers,
  Flame,
  ShieldAlert,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Maximize2,
  Gauge,
  Sliders,
  CheckCircle2,
  XCircle,
  FileCode,
  Sparkles,
} from "lucide-react";

export function VesselSizingSuite() {
  // Preset or Custom selection
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(2); // Default 20 L model (10 L batch)
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customWorkingVolumeL, setCustomWorkingVolumeL] = useState<number>(10);

  // Active volumes
  const currentPreset: HosokawaPreset = HOSOKAWA_PRESETS[selectedPresetIndex];
  const workingVolumeL = isCustomMode ? customWorkingVolumeL : currentPreset.maxBatchVolumeL;
  const nominalVolumeL = isCustomMode ? customWorkingVolumeL / 0.5 : currentPreset.nominalVolumeL;

  // Geometry parameters
  const [halfAngleDeg, setHalfAngleDeg] = useState<number>(25); // 20° to 35°

  // Jacket thermal parameters
  const [sublimationRateKg_h, setSublimationRateKg_h] = useState<number>(currentPreset.sublimationCapacityKg_h);
  const [heatTransferCoeffU, setHeatTransferCoeffU] = useState<number>(100); // W/(m²·K)
  const [deltaT_C, setDeltaT_C] = useState<number>(20); // °C

  // Head selection parameters
  const [headType, setHeadType] = useState<HeadType>("torispherical");
  const [designPressureBar, setDesignPressureBar] = useState<number>(3.0); // barg (SIP clean steam)
  const [allowableStressMPa, setAllowableStressMPa] = useState<number>(115); // 316L at 120°C
  const [jointEfficiency, setJointEfficiency] = useState<number>(1.0);

  // External pressure trial thickness
  const [trialThicknessMm, setTrialThicknessMm] = useState<number>(3.0);

  // Copy status
  const [copied, setCopied] = useState<boolean>(false);

  // Update sublimation rate when preset changes (if not in custom mode)
  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setIsCustomMode(false);
    setSublimationRateKg_h(HOSOKAWA_PRESETS[index].sublimationCapacityKg_h);
  };

  // Calculations
  const coneGeom = useMemo(() => {
    return calculateConeGeometry({
      nominalVolumeL,
      workingVolumeL,
      halfAngleDeg,
    });
  }, [nominalVolumeL, workingVolumeL, halfAngleDeg]);

  const jacketResult = useMemo(() => {
    return calculateJacketCrossCheck({
      sublimationRateKg_h,
      heatTransferCoeffU,
      deltaT_C,
      coneLateralAreaM2: coneGeom.lateralAreaM2,
      topDiameterCm: coneGeom.diameterCm,
    });
  }, [sublimationRateKg_h, heatTransferCoeffU, deltaT_C, coneGeom]);

  const headGeom = useMemo(() => {
    return calculateHeadDimensions({
      headType,
      topDiameterMm: coneGeom.diameterCm * 10,
      designPressureBar,
      allowableStressMPa,
      jointEfficiency,
    });
  }, [headType, coneGeom.diameterCm, designPressureBar, allowableStressMPa, jointEfficiency]);

  const bucklingResult = useMemo(() => {
    return calculateWindenburgTrilling({
      diameterMm: coneGeom.diameterCm * 10,
      coneHeightMm: coneGeom.heightCm * 10,
      halfAngleDeg,
      trialThicknessMm,
    });
  }, [coneGeom, halfAngleDeg, trialThicknessMm]);

  // Export JSON payload
  const jsonExport = useMemo(() => {
    const presetName = isCustomMode ? `Custom-${workingVolumeL}L-Batch` : `AFD-${currentPreset.modelL}L`;
    return generateCadScheduleExport(presetName, coneGeom, headGeom, jacketResult);
  }, [isCustomMode, workingVolumeL, currentPreset, coneGeom, headGeom, jacketResult]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonExport, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(jsonExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AFD_V-101_${isCustomMode ? "Custom" : currentPreset.modelL + "L"}_sizing_schedule.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // SVG Scaler calculations for 2D diagram
  const svgWidth = 360;
  const svgHeight = 400;
  const maxDim = Math.max(coneGeom.diameterCm, coneGeom.heightCm * 1.15, 30);
  const scale = 250 / maxDim; // px per cm

  const cx = svgWidth / 2;
  const topY = 65;
  const apexY = topY + coneGeom.heightCm * scale;
  const coneRadiusPx = (coneGeom.diameterCm / 2) * scale;
  const fillLevelY = apexY - coneGeom.fillHeightCm * scale;
  const fillRadiusPx = (coneGeom.fillHeightCm * Math.tan((halfAngleDeg * Math.PI) / 180)) * scale;

  return (
    <div className="instrument-card rounded-2xl p-5 my-6 border border-hairline bg-bg-panel backdrop-blur-sm shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-hairline gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
              Simulator 08 • Chapters 05, 11 & 25
            </span>
          </div>
          <h3 className="text-xl font-bold text-ink-primary mt-1 flex items-center gap-2">
            Parametric Vessel Sizing Suite & CAD Generator
          </h3>
          <p className="text-xs text-ink-secondary mt-0.5">
            Hosokawa-matched 50% working volume geometry, ASME UG-32 head sizing, and thermal cross-check.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 text-xs font-mono text-ink-primary bg-bg-hover hover:bg-bg-inset px-3 py-1.5 rounded-lg border border-hairline transition-all active:scale-95"
            title="Copy CAD Nozzle Schedule JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy JSON"}
          </button>
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/40 px-3 py-1.5 rounded-lg border border-cyan-500/30 transition-all active:scale-95"
            title="Download Schedule for SolidWorks"
          >
            <Download className="w-3.5 h-3.5" />
            Export CAD
          </button>
        </div>
      </div>

      {/* Mandatory Engineering Limitation Banner */}
      <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-3 text-amber-200/90 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold uppercase tracking-wider text-amber-300">
            Preliminary / Comparative Sizing Tool Only:
          </span>{" "}
          This module is a preliminary sizing calculator for geometric exploration and CAD seeding. It does not replace a
          certified ASME BPVC Section VIII Division 1 or Division 2 calculation. Final wall thicknesses and vacuum buckling
          margins must be certified in PV Elite (or equivalent licensed software) prior to cutting metal.
        </div>
      </div>

      {/* Model Presets Selector (Hosokawa 10-model range) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono font-semibold uppercase text-ink-secondary flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Hosokawa Published Model Presets (50% Batch Rule Verified)
          </label>
          <button
            onClick={() => setIsCustomMode(!isCustomMode)}
            className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
              isCustomMode
                ? "border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold"
                : "border-hairline text-ink-muted hover:text-ink-primary"
            }`}
          >
            {isCustomMode ? "● Custom Volume Mode" : "Switch to Custom"}
          </button>
        </div>

        {/* 10 Preset Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {HOSOKAWA_PRESETS.map((preset, idx) => {
            const isSelected = !isCustomMode && selectedPresetIndex === idx;
            return (
              <button
                key={preset.modelL}
                onClick={() => handleSelectPreset(idx)}
                className={`p-2 rounded-xl text-center border transition-all ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-500/20 shadow-md shadow-cyan-500/10 scale-[1.02]"
                    : "border-hairline bg-bg-inset hover:bg-bg-hover text-ink-secondary"
                }`}
              >
                <div className={`text-xs font-bold font-mono ${isSelected ? "text-cyan-300" : "text-ink-primary"}`}>
                  {preset.modelL} L
                </div>
                <div className="text-[10px] text-ink-muted mt-0.5">
                  Batch: <span className="font-semibold text-ink-primary">{preset.maxBatchVolumeL} L</span>
                </div>
                <div className="text-[9px] text-cyan-400/80 font-mono mt-0.5">
                  {preset.sublimationCapacityKg_h} kg/h
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Input Mode Bar */}
        {isCustomMode && (
          <div className="mt-3 p-3 rounded-xl bg-bg-inset border border-cyan-500/30 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-ink-secondary">Target Batch Working Volume:</span>
              <input
                type="number"
                min="0.2"
                max="2000"
                step="0.5"
                value={customWorkingVolumeL}
                onChange={(e) => setCustomWorkingVolumeL(Math.max(0.1, Number(e.target.value)))}
                className="w-24 bg-bg-panel border border-hairline rounded px-2 py-1 font-mono text-cyan-300 font-bold text-sm focus:outline-none focus:border-cyan-500"
              />
              <span className="font-mono text-ink-muted">Liters</span>
            </div>
            <div className="text-ink-muted">
              Implied Nominal Vessel (at 50% fill):{" "}
              <span className="font-mono font-bold text-cyan-400">{(customWorkingVolumeL / 0.5).toFixed(1)} L</span>
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Split: Diagram & Real-Time Geometry vs Sizing Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive 2D Dimensioned Cross-Section (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-bg-inset rounded-2xl p-4 border border-hairline">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-medium text-ink-secondary flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                Dimensioned Vessel Cross-Section
              </span>
              <span className="text-[10px] font-mono text-ink-muted">To-Scale SVG Projection</span>
            </div>

            {/* SVG Engineering Sketch */}
            <div className="relative w-full h-[320px] flex items-center justify-center bg-[#090d16] rounded-xl overflow-hidden border border-hairline/60">
              <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
                <defs>
                  {/* Fluid Gradient */}
                  <linearGradient id="fluidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.75" />
                  </linearGradient>
                  {/* Jacket Gradient */}
                  <linearGradient id="jacketGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Centerline */}
                <line x1={cx} y1={25} x2={cx} y2={apexY + 45} stroke="#334155" strokeDasharray="5,4" strokeWidth="1" />

                {/* Top Dished Head */}
                {headType === "flat" ? (
                  <line
                    x1={cx - coneRadiusPx}
                    y1={topY}
                    x2={cx + coneRadiusPx}
                    y2={topY}
                    stroke="#94a3b8"
                    strokeWidth="3"
                  />
                ) : (
                  <path
                    d={`M ${cx - coneRadiusPx} ${topY} Q ${cx} ${topY - (headType === "ellipsoidal" ? 32 : 22)} ${cx + coneRadiusPx} ${topY}`}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                  />
                )}

                {/* Outer Jacket Layer */}
                <path
                  d={`M ${cx - coneRadiusPx - 10} ${topY + 5} 
                     L ${cx - 16} ${apexY - 10} 
                     L ${cx + 16} ${apexY - 10} 
                     L ${cx + coneRadiusPx + 10} ${topY + 5}`}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="6"
                  strokeOpacity="0.3"
                  strokeDasharray="8,4"
                />

                {/* Conical Vessel Shell */}
                <path
                  d={`M ${cx - coneRadiusPx} ${topY} 
                     L ${cx - 8} ${apexY} 
                     L ${cx + 8} ${apexY} 
                     L ${cx + coneRadiusPx} ${topY}`}
                  fill="#0f172a"
                  stroke="#cbd5e1"
                  strokeWidth="2.5"
                />

                {/* Liquid Fill Region (at 50% volume -> 79.4% height) */}
                <path
                  d={`M ${cx - fillRadiusPx} ${fillLevelY} 
                     L ${cx - 8} ${apexY} 
                     L ${cx + 8} ${apexY} 
                     L ${cx + fillRadiusPx} ${fillLevelY} Z`}
                  fill="url(#fluidGrad)"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                />

                {/* Fill Level Line */}
                <line
                  x1={cx - fillRadiusPx - 15}
                  y1={fillLevelY}
                  x2={cx + fillRadiusPx + 15}
                  y2={fillLevelY}
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                  strokeDasharray="3,2"
                />
                <text x={cx + fillRadiusPx + 20} y={fillLevelY + 4} fill="#22d3ee" fontSize="10" fontFamily="monospace">
                  50% Vol ({coneGeom.fillHeightPercent}%)
                </text>

                {/* Bottom Discharge Stub */}
                <rect x={cx - 10} y={apexY} width={20} height={18} fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />

                {/* Angle Arc at Apex */}
                <path
                  d={`M ${cx - 18} ${apexY - 38} A 40 40 0 0 1 ${cx} ${apexY - 40}`}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                />
                <text x={cx - 36} y={apexY - 42} fill="#f59e0b" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  {halfAngleDeg}°
                </text>

                {/* Height Dimension Line */}
                <line x1={32} y1={topY} x2={32} y2={apexY} stroke="#64748b" strokeWidth="1" />
                <line x1={27} y1={topY} x2={37} y2={topY} stroke="#64748b" strokeWidth="1" />
                <line x1={27} y1={apexY} x2={37} y2={apexY} stroke="#64748b" strokeWidth="1" />
                <text
                  x={22}
                  y={(topY + apexY) / 2}
                  fill="#94a3b8"
                  fontSize="11"
                  fontFamily="monospace"
                  textAnchor="middle"
                  transform={`rotate(-90 22 ${(topY + apexY) / 2})`}
                >
                  h = {coneGeom.heightCm} cm
                </text>

                {/* Top Diameter Dimension Line */}
                <line x1={cx - coneRadiusPx} y1={25} x2={cx + coneRadiusPx} y2={25} stroke="#64748b" strokeWidth="1" />
                <line x1={cx - coneRadiusPx} y1={20} x2={cx - coneRadiusPx} y2={30} stroke="#64748b" strokeWidth="1" />
                <line x1={cx + coneRadiusPx} y1={20} x2={cx + coneRadiusPx} y2={30} stroke="#64748b" strokeWidth="1" />
                <text x={cx} y={18} fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="middle">
                  D = {coneGeom.diameterCm} cm
                </text>
              </svg>
            </div>
          </div>

          {/* Half-Angle Slider */}
          <div className="mt-4 pt-3 border-t border-hairline">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-ink-secondary">Cone Half-Angle (α from vertical):</span>
              <span className="font-mono text-cyan-400 font-bold text-sm">{halfAngleDeg}°</span>
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
            <div className="flex justify-between text-[10px] text-ink-muted font-mono mt-1">
              <span>20° (Steep / Tall / Low Buckling)</span>
              <span>25° (Nauta Default)</span>
              <span>35° (Shallow / Compact)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Geometry Metrics, Key Insight, Jacket & Head Check (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Highlight Card: The Critical 50% Vol = 79.4% Height Insight */}
          <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-bg-panel to-bg-panel p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-ink-primary">The Non-Linear Cone Insight</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                V ∝ h³
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center my-3">
              <div className="p-2.5 rounded-xl bg-bg-inset border border-hairline">
                <div className="text-lg font-black text-cyan-400 font-mono">{coneGeom.fillHeightPercent}%</div>
                <div className="text-[10px] text-ink-muted">Fill Height %</div>
              </div>
              <div className="p-2.5 rounded-xl bg-bg-inset border border-hairline">
                <div className="text-lg font-black text-ink-primary font-mono">{coneGeom.fillHeightCm} cm</div>
                <div className="text-[10px] text-ink-muted">Liquid Surface</div>
              </div>
              <div className="p-2.5 rounded-xl bg-bg-inset border border-hairline">
                <div className="text-lg font-black text-amber-400 font-mono">{coneGeom.freeboardPercent}%</div>
                <div className="text-[10px] text-ink-muted">Freeboard %</div>
              </div>
              <div className="p-2.5 rounded-xl bg-bg-inset border border-hairline">
                <div className="text-lg font-black text-ink-primary font-mono">{coneGeom.freeboardHeightCm} cm</div>
                <div className="text-[10px] text-ink-muted">Freeboard Height</div>
              </div>
            </div>

            <p className="text-xs text-ink-secondary leading-relaxed">
              In a cone, volume scales with the <strong>cube</strong> of height. Filling to 50% volume puts the liquid
              surface at <strong className="text-cyan-300">79.4% of total height</strong>, leaving only 20.6% linear
              freeboard. An 80% fill would leave only 7.2% freeboard, suffocating the orbiting agitator, blocking vapor
              escape, and causing powder entrainment into the filter.
            </p>
          </div>

          {/* Sizing Geometry Results Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-bg-inset border border-hairline">
              <span className="text-[10px] font-mono text-ink-muted uppercase">Top Diameter (D)</span>
              <div className="text-lg font-bold font-mono text-ink-primary mt-0.5">{coneGeom.diameterCm} cm</div>
              <span className="text-[10px] text-ink-secondary font-mono">{coneGeom.diameterCm * 10} mm</span>
            </div>
            <div className="p-3 rounded-xl bg-bg-inset border border-hairline">
              <span className="text-[10px] font-mono text-ink-muted uppercase">Cone Height (h)</span>
              <div className="text-lg font-bold font-mono text-ink-primary mt-0.5">{coneGeom.heightCm} cm</div>
              <span className="text-[10px] text-ink-secondary font-mono">{coneGeom.heightCm * 10} mm</span>
            </div>
            <div className="p-3 rounded-xl bg-bg-inset border border-hairline">
              <span className="text-[10px] font-mono text-ink-muted uppercase">Lateral Area (A_cone)</span>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{coneGeom.lateralAreaM2} m²</div>
              <span className="text-[10px] text-ink-secondary font-mono">Slant: {coneGeom.slantLengthCm} cm</span>
            </div>
          </div>

          {/* Module 4: Jacket Thermal Duty Cross-Check */}
          <div className="p-4 rounded-2xl bg-bg-inset border border-hairline space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-signal" />
                <h4 className="text-xs font-mono font-bold uppercase text-ink-primary">
                  Jacket Heat-Transfer Cross-Check (File 11 §2)
                </h4>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1 ${
                  jacketResult.isAdequate
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                }`}
              >
                {jacketResult.isAdequate ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {jacketResult.isAdequate ? "CONE AREA ADEQUATE" : "CYLINDER EXTENSION NEEDED"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono text-ink-muted">Sublimation Rate (ṁ)</label>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0.05"
                    value={sublimationRateKg_h}
                    onChange={(e) => setSublimationRateKg_h(Number(e.target.value))}
                    className="w-full bg-bg-panel border border-hairline rounded px-2 py-1 font-mono text-xs text-ink-primary"
                  />
                  <span className="text-[10px] font-mono text-ink-muted">kg/h</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono text-ink-muted">Heat Coeff (U)</label>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    step="5"
                    min="20"
                    max="300"
                    value={heatTransferCoeffU}
                    onChange={(e) => setHeatTransferCoeffU(Number(e.target.value))}
                    className="w-full bg-bg-panel border border-hairline rounded px-2 py-1 font-mono text-xs text-ink-primary"
                  />
                  <span className="text-[10px] font-mono text-ink-muted">W/m²K</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono text-ink-muted">Jacket ΔT</label>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    step="1"
                    min="5"
                    max="50"
                    value={deltaT_C}
                    onChange={(e) => setDeltaT_C(Number(e.target.value))}
                    className="w-full bg-bg-panel border border-hairline rounded px-2 py-1 font-mono text-xs text-ink-primary"
                  />
                  <span className="text-[10px] font-mono text-ink-muted">°C</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-hairline/60 gap-2">
              <span className="text-ink-secondary">
                Duty: <strong className="text-ink-primary font-mono">{jacketResult.heatDutyW} W</strong> • Req. Area:{" "}
                <strong className="text-amber-400 font-mono">{jacketResult.requiredAreaM2} m²</strong> vs Cone:{" "}
                <strong className="text-emerald-400 font-mono">{jacketResult.coneAreaM2} m²</strong>
              </span>
              {!jacketResult.isAdequate && (
                <span className="text-amber-300 font-mono text-[11px]">
                  Add cylindrical shell height: <strong>+{jacketResult.suggestedCylinderExtensionCm} cm</strong>
                </span>
              )}
            </div>
          </div>

          {/* Module 5: Top Head Selector & ASME UG-32 Calculation */}
          <div className="p-4 rounded-2xl bg-bg-inset border border-hairline space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-mono font-bold uppercase text-ink-primary">
                  Top Closure / Head Selector (ASME UG-32/33)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-ink-muted">SIP Clean Steam Case</span>
            </div>

            {/* Head Selector Radio Tiles */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setHeadType("torispherical")}
                className={`p-2 rounded-xl border text-center text-xs font-mono transition-all ${
                  headType === "torispherical"
                    ? "border-purple-500 bg-purple-500/20 text-purple-300 font-bold"
                    : "border-hairline bg-bg-panel text-ink-muted hover:text-ink-primary"
                }`}
              >
                Torispherical (F&D)
                <div className="text-[9px] text-ink-muted font-normal">Practical Default (M≈1.77)</div>
              </button>
              <button
                onClick={() => setHeadType("ellipsoidal")}
                className={`p-2 rounded-xl border text-center text-xs font-mono transition-all ${
                  headType === "ellipsoidal"
                    ? "border-purple-500 bg-purple-500/20 text-purple-300 font-bold"
                    : "border-hairline bg-bg-panel text-ink-muted hover:text-ink-primary"
                }`}
              >
                2:1 Ellipsoidal
                <div className="text-[9px] text-ink-muted font-normal">K=1.0 • Smooth Curve</div>
              </button>
              <button
                onClick={() => setHeadType("flat")}
                className={`p-2 rounded-xl border text-center text-xs font-mono transition-all ${
                  headType === "flat"
                    ? "border-amber-500 bg-amber-500/20 text-amber-300 font-bold"
                    : "border-hairline bg-bg-panel text-ink-muted hover:text-ink-primary"
                }`}
              >
                Flat Cover
                <div className="text-[9px] text-ink-muted font-normal">Small dia only (&lt;300mm)</div>
              </button>
            </div>

            {/* Flat Head Warning if Diameter > 300mm */}
            {headGeom.warning && (
              <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{headGeom.warning}</span>
              </div>
            )}

            {/* Head Dimensions & Thickness Readout */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="bg-bg-panel p-2 rounded-lg border border-hairline">
                <span className="text-[10px] text-ink-muted font-mono block">Estimated Thickness</span>
                <span className="font-mono font-bold text-purple-300 text-sm">{headGeom.thicknessMm} mm</span>
              </div>
              <div className="bg-bg-panel p-2 rounded-lg border border-hairline">
                <span className="text-[10px] text-ink-muted font-mono block">Crown Radius (L)</span>
                <span className="font-mono text-ink-primary">{headGeom.crownRadiusL_mm} mm</span>
              </div>
              <div className="bg-bg-panel p-2 rounded-lg border border-hairline">
                <span className="text-[10px] text-ink-muted font-mono block">Knuckle Radius (r)</span>
                <span className="font-mono text-ink-primary">{headGeom.knuckleRadiusR_mm} mm</span>
              </div>
              <div className="bg-bg-panel p-2 rounded-lg border border-hairline">
                <span className="text-[10px] text-ink-muted font-mono block">Dish Depth</span>
                <span className="font-mono text-ink-primary">{headGeom.headDepthMm} mm</span>
              </div>
            </div>
          </div>

          {/* Module 6: Preliminary External-Pressure Sanity Check */}
          <div className="p-4 rounded-2xl bg-bg-inset border border-hairline space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-mono font-bold uppercase text-ink-primary">
                  Preliminary Vacuum Buckling Check (Windenburg-Trilling)
                </h4>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  bucklingResult.isSafeForFullVacuum
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/20 text-rose-300"
                }`}
              >
                {bucklingResult.isSafeForFullVacuum ? "PASSES FV ESTIMATE" : "THICKNESS LOW"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-secondary">Trial Shell Thickness:</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1.5"
                  max="10.0"
                  step="0.5"
                  value={trialThicknessMm}
                  onChange={(e) => setTrialThicknessMm(Number(e.target.value))}
                  className="w-32 accent-emerald-400 cursor-pointer"
                />
                <span className="font-mono text-emerald-400 font-bold w-12 text-right">{trialThicknessMm} mm</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-ink-muted">
              <span>
                P_crit: <strong className="text-ink-primary">{bucklingResult.pCriticalBar} bar</strong>
              </span>
              <span>
                Allowable (FS=3): <strong className="text-emerald-400">{bucklingResult.allowableExternalBar} bar</strong>{" "}
                (Min 1.013 bar)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
