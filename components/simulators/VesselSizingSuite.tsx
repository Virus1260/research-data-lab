"use client";

import React, { useState, useMemo } from "react";
import {
  HOSOKAWA_PRESETS,
  calculateConeGeometry,
  calculateJacketCrossCheck,
  calculateHeadDimensions,
  generateCadScheduleExport,
  HeadType,
  HosokawaPreset,
} from "@/lib/vesselSizing";
import {
  ShieldAlert,
  Download,
  Copy,
  Check,
  Maximize2,
  Sliders,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";

export function VesselSizingSuite() {
  // Preset or Custom selection
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(2); // Default 20 L model (10 L batch)
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customWorkingVolumeL, setCustomWorkingVolumeL] = useState<number>(10);

  // Sizing driver mode: 'volume' (default) | 'height' | 'vol_and_height' | 'diameter'
  const [drivingMode, setDrivingMode] = useState<"volume" | "height" | "vol_and_height" | "diameter">("volume");
  const [targetHeightCm, setTargetHeightCm] = useState<number>(44.5);
  const [targetDiameterCm, setTargetDiameterCm] = useState<number>(41.5);

  // Active volumes
  const currentPreset: HosokawaPreset = HOSOKAWA_PRESETS[selectedPresetIndex];
  const workingVolumeL = isCustomMode ? customWorkingVolumeL : currentPreset.maxBatchVolumeL;
  const nominalVolumeL = isCustomMode ? customWorkingVolumeL / 0.5 : currentPreset.nominalVolumeL;

  // Geometry parameters
  const [halfAngleDeg, setHalfAngleDeg] = useState<number>(25); // 20° to 35°
  const [minorDiaMm, setMinorDiaMm] = useState<number>(currentPreset.defaultMinorDiaMm);
  const [shellThicknessMm, setShellThicknessMm] = useState<number>(4.0); // mm

  // Annular Jacket parameters (50 mm default as requested by user)
  const [annularGapMm, setAnnularGapMm] = useState<number>(50); // 20 mm to 100 mm, default 50 mm
  const [jacketWallThicknessMm, setJacketWallThicknessMm] = useState<number>(3.0); // mm
  const [fluidType, setFluidType] = useState<"silicone" | "glycol" | "mineral">("silicone");

  const fluidDensities = {
    silicone: 920, // Syltherm XLT / Silicone Oil (kg/m³)
    glycol: 1040,  // 50/50 Water-Propylene Glycol (kg/m³)
    mineral: 880,  // Paratherm / Mineral Oil (kg/m³)
  };
  const fluidDensityKg_m3 = fluidDensities[fluidType];

  // Jacket thermal parameters
  const [sublimationRateKg_h, setSublimationRateKg_h] = useState<number>(currentPreset.sublimationCapacityKg_h);
  const [heatTransferCoeffU, setHeatTransferCoeffU] = useState<number>(100); // W/(m²·K)
  const [deltaT_C, setDeltaT_C] = useState<number>(20); // °C

  // Head selection parameters
  const [headType, setHeadType] = useState<HeadType>("torispherical");
  const [designPressureBar, setDesignPressureBar] = useState<number>(3.0); // barg (SIP clean steam)
  const [allowableStressMPa, setAllowableStressMPa] = useState<number>(115); // 316L at 120°C
  const [jointEfficiency, setJointEfficiency] = useState<number>(1.0);

  // Blueprint sketch visual theme mode: 'paper' (light CAD) or 'blueprint' (dark CAD)
  const [sketchCadMode, setSketchCadMode] = useState<"paper" | "blueprint">("paper");

  // Copy status
  const [copied, setCopied] = useState<boolean>(false);

  // Update sublimation rate & minor diameter when preset changes
  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setIsCustomMode(false);
    setDrivingMode("volume");
    const p = HOSOKAWA_PRESETS[index];
    setSublimationRateKg_h(p.sublimationCapacityKg_h);
    setMinorDiaMm(p.defaultMinorDiaMm);
    // sync target height and diameter from preset for smooth mode switching
    const initialGeom = calculateConeGeometry({
      nominalVolumeL: p.nominalVolumeL,
      workingVolumeL: p.maxBatchVolumeL,
      halfAngleDeg: 25,
      minorDiaMm: p.defaultMinorDiaMm,
    });
    setTargetHeightCm(initialGeom.heightCm);
    setTargetDiameterCm(initialGeom.diameterCm);
  };

  // Calculations
  const coneGeom = useMemo(() => {
    return calculateConeGeometry({
      nominalVolumeL,
      workingVolumeL,
      halfAngleDeg,
      minorDiaMm,
      shellThicknessMm,
      drivingMode,
      targetHeightCm,
      targetDiameterCm,
    });
  }, [
    nominalVolumeL,
    workingVolumeL,
    halfAngleDeg,
    minorDiaMm,
    shellThicknessMm,
    drivingMode,
    targetHeightCm,
    targetDiameterCm,
  ]);

  const jacketResult = useMemo(() => {
    return calculateJacketCrossCheck({
      sublimationRateKg_h,
      heatTransferCoeffU,
      deltaT_C,
      coneLateralAreaM2: coneGeom.lateralAreaM2,
      topDiameterCm: coneGeom.diameterCm,
      annularGapMm,
      jacketWallThicknessMm,
      fluidDensityKg_m3,
    });
  }, [
    sublimationRateKg_h,
    heatTransferCoeffU,
    deltaT_C,
    coneGeom,
    annularGapMm,
    jacketWallThicknessMm,
    fluidDensityKg_m3,
  ]);

  const headGeom = useMemo(() => {
    return calculateHeadDimensions({
      headType,
      topDiameterMm: coneGeom.diameterCm * 10,
      designPressureBar,
      allowableStressMPa,
      jointEfficiency,
    });
  }, [headType, coneGeom.diameterCm, designPressureBar, allowableStressMPa, jointEfficiency]);

  // Total vessel fabrication height stack
  const bottomStubHeightMm = 60; // Standard ASME BPE discharge spool
  const totalFabricationHeightMm = headGeom.headDepthMm + coneGeom.heightMm + bottomStubHeightMm;

  const activeNominalVolumeL = (drivingMode === "volume" || drivingMode === "vol_and_height") ? nominalVolumeL : coneGeom.calculatedNominalVolumeL;
  const activeWorkingVolumeL = (drivingMode === "volume" || drivingMode === "vol_and_height") ? workingVolumeL : coneGeom.calculatedWorkingVolumeL;

  // Export JSON payload
  const jsonExport = useMemo(() => {
    const presetName = isCustomMode || drivingMode !== "volume" ? `Custom-${activeWorkingVolumeL}L-Batch` : `AFD-${currentPreset.modelL}L`;
    return generateCadScheduleExport(presetName, coneGeom, headGeom, jacketResult);
  }, [isCustomMode, drivingMode, activeWorkingVolumeL, currentPreset, coneGeom, headGeom, jacketResult]);

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

  // SVG Scaler calculations for detailed fabrication blueprint (AutoCAD standard)
  const svgW = 680;
  const svgH = 530;
  const cx = 310; // Vessel center line x (balanced between left dimension ladders and right leader callouts)

  // Scale: map total vessel height and diameter to fit inside viewport
  const maxModelExtentMm = Math.max(totalFabricationHeightMm, coneGeom.diameterMm * 1.05, 300);
  const pxScale = 300 / maxModelExtentMm; // px per mm

  const dishRisePx = Math.max(14, headGeom.headDepthMm * pxScale);
  const topFlangeY = Math.max(90, dishRisePx + 48); // Guaranteed >= 48px clearance above dish crown for D_major dimension
  const dishCrownY = topFlangeY - dishRisePx;

  const coneRadiusPx = (coneGeom.diameterMm / 2) * pxScale;
  const minorRadiusPx = Math.max(8, (coneGeom.minorDiameterMm / 2) * pxScale);

  const coneHeightPx = coneGeom.heightMm * pxScale;
  const apexY = topFlangeY + coneHeightPx;

  const stubHeightPx = Math.max(16, bottomStubHeightMm * pxScale);
  const dischargeBottomY = apexY + stubHeightPx;

  // Working Liquid Level (50% Volume -> 79.4% Height in a cone)
  const fillHeightMm = coneGeom.fillHeightMm;
  const fillHeightPx = fillHeightMm * pxScale;
  const fillLevelY = apexY - fillHeightPx;
  const fillFraction = fillHeightMm / Math.max(1, coneGeom.heightMm);
  const fillRadiusPx = minorRadiusPx + (coneRadiusPx - minorRadiusPx) * fillFraction;

  // Annular Jacket offsets
  const jacketGapPx = Math.max(8, annularGapMm * pxScale * 2.0); // scaled visually for clear readability
  const jacketTopY = topFlangeY + 14;
  const jacketBottomY = apexY - 8;
  const jacketRadiusTopPx = coneRadiusPx + jacketGapPx;
  const jacketRadiusBottomPx = minorRadiusPx + jacketGapPx * 0.8;

  // CAD Theme styling constants
  const isDarkCAD = sketchCadMode === "blueprint";
  const cadBg = isDarkCAD ? "#070d1e" : "#fdfcf9";
  const gridStroke = isDarkCAD ? "#172554" : "#e2e8f0";
  const centerLineColor = isDarkCAD ? "#38bdf8" : "#94a3b8";
  const shellStroke = isDarkCAD ? "#f8fafc" : "#0f172a";
  const shellFill = isDarkCAD ? "#0f172a" : "#f8fafc";
  const jacketStroke = isDarkCAD ? "#60a5fa" : "#2563eb";
  const jacketFill = isDarkCAD ? "rgba(37, 99, 235, 0.15)" : "rgba(219, 234, 254, 0.7)";
  const fluidStroke = isDarkCAD ? "#22d3ee" : "#0284c7";
  const dimColor = isDarkCAD ? "#38bdf8" : "#334155";
  const dimTextColor = isDarkCAD ? "#f1f5f9" : "#0f172a";
  const highlightAmber = isDarkCAD ? "#fbbf24" : "#b45309";
  const titleBlockBg = isDarkCAD ? "#0b152d" : "#ffffff";
  const titleBlockBorder = isDarkCAD ? "#1e293b" : "#cbd5e1";

  return (
    <div className="instrument-card rounded-2xl p-5 my-6 border border-hairline bg-bg-panel backdrop-blur-sm shadow-xl transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-hairline gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-400 font-bold">
              Dedicated Sizing Suite • Chapter 25
            </span>
          </div>
          <h3 className="text-xl font-bold text-ink-primary mt-1 flex items-center gap-2">
            AFD Conical Freeze-Dryer Vessel Sizing & Fabrication Suite
          </h3>
          <p className="text-xs text-ink-secondary mt-0.5">
            Parametric vessel geometry, 50 mm annular jacket modeling, ASME Section VIII UG-32 heads, and Windenburg-Trilling vacuum stability.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 text-xs font-mono text-ink-primary bg-bg-surface hover:bg-bg-inset px-3 py-1.5 rounded-lg border border-hairline transition-all active:scale-95 shadow-xs"
            title="Copy CAD Nozzle Schedule JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy JSON"}
          </button>
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-800 dark:text-cyan-200 bg-cyan-100 dark:bg-cyan-950/60 hover:bg-cyan-200 dark:hover:bg-cyan-900/60 px-3 py-1.5 rounded-lg border border-cyan-400 dark:border-cyan-600 transition-all active:scale-95 shadow-xs"
            title="Download Schedule for SolidWorks / CAD"
          >
            <Download className="w-3.5 h-3.5" />
            Export CAD
          </button>
        </div>
      </div>

      {/* Mandatory Engineering Limitation Banner */}
      <div className="mb-6 rounded-xl border border-amber-400 dark:border-amber-600/50 bg-amber-50 dark:bg-amber-950/30 p-3.5 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Preliminary / Comparative Sizing Tool Only:
          </span>{" "}
          This module is a preliminary sizing calculator for parametric exploration, annular jacket hydrodynamics, and CAD seeding. It does not replace a certified ASME BPVC Section VIII Division 1 or Division 2 calculation. Final shell thicknesses, knuckle stresses, and vacuum buckling margins must be certified in PV Elite (or equivalent licensed software) prior to cutting metal.
        </div>
      </div>

      {/* Model Presets Selector (Hosokawa 10-model range) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono font-semibold uppercase text-ink-secondary flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            Hosokawa Published Model Presets (50% Batch Rule Verified)
          </label>
          <button
            onClick={() => setIsCustomMode(!isCustomMode)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
              isCustomMode
                ? "border-cyan-600 bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-200 font-bold"
                : "border-hairline text-ink-muted hover:text-ink-primary bg-bg-surface"
            }`}
          >
            {isCustomMode ? "● Custom Volume Mode Active" : "Switch to Custom Volume"}
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
                className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                  isSelected
                    ? "border-cyan-600 dark:border-cyan-400 bg-cyan-100 dark:bg-cyan-950/50 shadow-md text-cyan-900 dark:text-cyan-100 scale-[1.02] ring-1 ring-cyan-500/40"
                    : "border-hairline bg-bg-surface hover:bg-bg-panel text-ink-secondary"
                }`}
              >
                <div className={`text-xs font-bold font-mono ${isSelected ? "text-cyan-900 dark:text-cyan-200 font-black" : "text-ink-primary"}`}>
                  {preset.modelL} L
                </div>
                <div className="text-[10px] text-ink-muted mt-0.5">
                  Batch: <span className="font-semibold text-ink-primary">{preset.maxBatchVolumeL} L</span>
                </div>
                <div className="text-[9px] text-cyan-700 dark:text-cyan-400 font-mono mt-0.5">
                  {preset.sublimationCapacityKg_h} kg/h
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Input Mode Bar */}
        {isCustomMode && (
          <div className="mt-3 p-3 rounded-xl bg-bg-surface border border-cyan-500/40 flex flex-wrap items-center gap-4 text-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-ink-primary font-medium">Target Batch Working Volume:</span>
              <input
                type="number"
                min="0.2"
                max="2000"
                step="0.5"
                value={customWorkingVolumeL}
                onChange={(e) => setCustomWorkingVolumeL(Math.max(0.1, Number(e.target.value)))}
                className="w-24 bg-bg-panel border border-border-strong rounded px-2 py-1 font-mono text-cyan-800 dark:text-cyan-300 font-bold text-sm focus:outline-none focus:border-cyan-500"
              />
              <span className="font-mono text-ink-muted">Liters (50% design point)</span>
            </div>
            <div className="text-ink-secondary">
              Implied Nominal Vessel:{" "}
              <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300">
                {(customWorkingVolumeL / 0.5).toFixed(1)} L
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Full-Width CAD Fabrication & Parametric Sizing Studio */}
      <div className="bg-bg-surface rounded-2xl p-5 sm:p-7 border border-hairline space-y-6 shadow-sm">
        {/* CAD Header Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-hairline">
          <div>
            <span className="text-sm font-mono font-bold text-ink-primary flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Dimensioned Vessel Cross-Section (Fabrication CAD Projection)
            </span>
            <p className="text-xs text-ink-muted mt-0.5">
              AutoCAD-standard scale projection with active liquid fill level, formed dished head, and 50 mm annular jacket.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Dished Head Profile Selector */}
            <div className="flex items-center gap-1 bg-bg-panel p-1 rounded-xl border border-hairline text-xs font-mono">
              <span className="text-[10px] text-ink-muted px-2 font-bold uppercase tracking-wider">Head:</span>
              {(["torispherical", "ellipsoidal", "flat"] as HeadType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setHeadType(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                    headType === type
                      ? "bg-purple-600 text-white font-bold shadow-xs"
                      : "text-ink-secondary hover:text-ink-primary hover:bg-bg-surface"
                  }`}
                >
                  {type === "torispherical" ? "Torispherical (F&D)" : type === "ellipsoidal" ? "2:1 Ellipsoidal" : "Flat Cover"}
                </button>
              ))}
            </div>

            {/* Annular Jacket Gap Indicator */}
            <div className="flex items-center gap-1.5 bg-bg-panel px-3 py-1.5 rounded-xl border border-hairline text-xs font-mono">
              <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Jacket:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">50 mm Gap</span>
            </div>

            {/* CAD Mode Toggle: Paper (Light) vs Deep Blueprint (Dark) */}
            <div className="flex items-center rounded-xl border border-hairline bg-bg-panel p-1">
              <button
                onClick={() => setSketchCadMode("paper")}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  sketchCadMode === "paper"
                    ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-xs"
                    : "text-ink-muted hover:text-ink-primary"
                }`}
                title="White Drafting Paper Mode"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Paper CAD</span>
              </button>
              <button
                onClick={() => setSketchCadMode("blueprint")}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  sketchCadMode === "blueprint"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-ink-muted hover:text-ink-primary"
                }`}
                title="Deep Blueprint CAD Mode"
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Blueprint</span>
              </button>
            </div>
          </div>
        </div>

        {/* SVG Fabrication Blueprint Canvas */}
        <div
          className="relative w-full h-[520px] max-w-4xl mx-auto rounded-xl overflow-hidden border border-hairline shadow-inner flex items-center justify-center transition-colors"
          style={{ backgroundColor: cadBg }}
        >
              <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full select-none">
                <defs>
                  {/* Subtle Drafting Grid */}
                  <pattern id="cadGridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke={gridStroke} strokeWidth="0.5" strokeOpacity="0.6" />
                  </pattern>

                  {/* Liquid Gradient */}
                  <linearGradient id="fluidCadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={fluidStroke} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={fluidStroke} stopOpacity="0.65" />
                  </linearGradient>

                  {/* Dimension Arrowheads */}
                  <marker id="arrowHead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill={dimColor} />
                  </marker>
                  <marker id="arrowHeadStart" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
                    <path d="M6,0 L0,3 L6,6 Z" fill={dimColor} />
                  </marker>
                </defs>

                {/* Background Grid */}
                <rect width={svgW} height={svgH} fill="url(#cadGridPattern)" />

                {/* Vessel Vertical Centerline */}
                <line
                  x1={cx}
                  y1={dishCrownY - 35}
                  x2={cx}
                  y2={dischargeBottomY + 45}
                  stroke={centerLineColor}
                  strokeDasharray="6,4,2,4"
                  strokeWidth="1"
                />

                {/* ========================================================================= */}
                {/* 1. ANNULAR HEATING / COOLING JACKET (50 MM DEFAULT GAP) */}
                {/* ========================================================================= */}
                {/* Left Annular Jacket Envelope */}
                <polygon
                  points={`${cx - coneRadiusPx},${jacketTopY} ${cx - jacketRadiusTopPx},${jacketTopY} ${cx - jacketRadiusBottomPx},${jacketBottomY} ${cx - minorRadiusPx - 4},${jacketBottomY}`}
                  fill={jacketFill}
                  stroke={jacketStroke}
                  strokeWidth="2"
                  strokeDasharray="5,2.5"
                />
                {/* Right Annular Jacket Envelope */}
                <polygon
                  points={`${cx + coneRadiusPx},${jacketTopY} ${cx + jacketRadiusTopPx},${jacketTopY} ${cx + jacketRadiusBottomPx},${jacketBottomY} ${cx + minorRadiusPx + 4},${jacketBottomY}`}
                  fill={jacketFill}
                  stroke={jacketStroke}
                  strokeWidth="2"
                  strokeDasharray="5,2.5"
                />

                {/* Jacket Top Closure Ring Weld Seals */}
                <line
                  x1={cx - coneRadiusPx}
                  y1={jacketTopY}
                  x2={cx - jacketRadiusTopPx}
                  y2={jacketTopY}
                  stroke={jacketStroke}
                  strokeWidth="2.5"
                />
                <line
                  x1={cx + coneRadiusPx}
                  y1={jacketTopY}
                  x2={cx + jacketRadiusTopPx}
                  y2={jacketTopY}
                  stroke={jacketStroke}
                  strokeWidth="2.5"
                />

                {/* Jacket Bottom Closure Ring Weld Seals */}
                <line
                  x1={cx - minorRadiusPx - 4}
                  y1={jacketBottomY}
                  x2={cx - jacketRadiusBottomPx}
                  y2={jacketBottomY}
                  stroke={jacketStroke}
                  strokeWidth="2.5"
                />
                <line
                  x1={cx + minorRadiusPx + 4}
                  y1={jacketBottomY}
                  x2={cx + jacketRadiusBottomPx}
                  y2={jacketBottomY}
                  stroke={jacketStroke}
                  strokeWidth="2.5"
                />

                {/* Jacket Fluid Inlet Nozzle J1 (Bottom Right, Tri-Clamp connection) */}
                <rect
                  x={cx + jacketRadiusBottomPx}
                  y={jacketBottomY - 14}
                  width="18"
                  height="10"
                  fill={jacketFill}
                  stroke={jacketStroke}
                  strokeWidth="1.5"
                />
                <line
                  x1={cx + jacketRadiusBottomPx + 18}
                  y1={jacketBottomY - 18}
                  x2={cx + jacketRadiusBottomPx + 18}
                  y2={jacketBottomY}
                  stroke={jacketStroke}
                  strokeWidth="2.5"
                />
                <text
                  x={cx + jacketRadiusBottomPx + 24}
                  y={jacketBottomY - 6}
                  fill={jacketStroke}
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  J1 (Inlet)
                </text>

                {/* Jacket Fluid Outlet Nozzle J2 (Top Left, Tri-Clamp connection) */}
                <rect
                  x={cx - jacketRadiusTopPx - 18}
                  y={jacketTopY + 8}
                  width="18"
                  height="10"
                  fill={jacketFill}
                  stroke={jacketStroke}
                  strokeWidth="1.5"
                />
                <line
                  x1={cx - jacketRadiusTopPx - 18}
                  y1={jacketTopY + 4}
                  x2={cx - jacketRadiusTopPx - 18}
                  y2={jacketTopY + 22}
                  stroke={jacketStroke}
                  strokeWidth="2.5"
                />
                {/* J2 label placed cleanly to the left with textAnchor end to prevent line overlaps */}
                <text
                  x={cx - jacketRadiusTopPx - 24}
                  y={jacketTopY + 16}
                  fill={jacketStroke}
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  J2 (Outlet)
                </text>

                {/* ========================================================================= */}
                {/* 2. INNER CONICAL VESSEL SHELL */}
                {/* ========================================================================= */}
                <path
                  d={`M ${cx - coneRadiusPx} ${topFlangeY} 
                     L ${cx - minorRadiusPx} ${apexY} 
                     L ${cx + minorRadiusPx} ${apexY} 
                     L ${cx + coneRadiusPx} ${topFlangeY}`}
                  fill={shellFill}
                  stroke={shellStroke}
                  strokeWidth="2.5"
                />

                {/* ========================================================================= */}
                {/* 3. WORKING LIQUID FILL REGION (50% Volume -> 79.4% Height) */}
                {/* ========================================================================= */}
                <path
                  d={`M ${cx - fillRadiusPx} ${fillLevelY} 
                     L ${cx - minorRadiusPx} ${apexY} 
                     L ${cx + minorRadiusPx} ${apexY} 
                     L ${cx + fillRadiusPx} ${fillLevelY} Z`}
                  fill="url(#fluidCadGrad)"
                  stroke={fluidStroke}
                  strokeWidth="1.5"
                />

                {/* Live Working Liquid Surface Line */}
                <line
                  x1={cx - fillRadiusPx - 10}
                  y1={fillLevelY}
                  x2={cx + fillRadiusPx + 10}
                  y2={fillLevelY}
                  stroke={fluidStroke}
                  strokeWidth="2"
                  strokeDasharray="4,2"
                />

                {/* Liquid Level Callout Leader (AutoCAD Dogleg to right) */}
                <line
                  x1={cx + fillRadiusPx}
                  y1={fillLevelY}
                  x2={cx + coneRadiusPx + 24}
                  y2={fillLevelY + 14}
                  stroke={fluidStroke}
                  strokeWidth="1"
                />
                <line
                  x1={cx + coneRadiusPx + 24}
                  y1={fillLevelY + 14}
                  x2={cx + coneRadiusPx + 145}
                  y2={fillLevelY + 14}
                  stroke={fluidStroke}
                  strokeWidth="1"
                />
                <text
                  x={cx + coneRadiusPx + 30}
                  y={fillLevelY + 10}
                  fill={dimTextColor}
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  50% Vol (79.4% h)
                </text>
                <text
                  x={cx + coneRadiusPx + 30}
                  y={fillLevelY + 23}
                  fill={fluidStroke}
                  fontSize="8"
                  fontFamily="monospace"
                >
                  Batch: {workingVolumeL} L (Liquid Level)
                </text>

                {/* ========================================================================= */}
                {/* 4. DISHED TOP HEAD PROFILES TO EXACT SCALE */}
                {/* ========================================================================= */}
                {headType === "flat" && (
                  <g>
                    {/* Flat Heavy Bolted Flange Cover */}
                    <rect
                      x={cx - coneRadiusPx - 14}
                      y={topFlangeY - 8}
                      width={(coneRadiusPx + 14) * 2}
                      height="8"
                      fill={isDarkCAD ? "#1e293b" : "#e2e8f0"}
                      stroke={shellStroke}
                      strokeWidth="2"
                    />
                    {/* Bolt Circle Centerline Markers */}
                    <circle cx={cx - coneRadiusPx - 6} cy={topFlangeY - 4} r="2" fill={dimColor} />
                    <circle cx={cx + coneRadiusPx + 6} cy={topFlangeY - 4} r="2" fill={dimColor} />
                  </g>
                )}

                {headType === "ellipsoidal" && (
                  <path
                    d={`M ${cx - coneRadiusPx} ${topFlangeY} 
                       A ${coneRadiusPx} ${dishRisePx} 0 0 1 ${cx + coneRadiusPx} ${topFlangeY}`}
                    fill="none"
                    stroke={shellStroke}
                    strokeWidth="2.5"
                  />
                )}

                {headType === "torispherical" && (
                  /* Torispherical F&D: Tangent Knuckle Curve + Crown Spherical Dome */
                  <path
                    d={`M ${cx - coneRadiusPx} ${topFlangeY} 
                       C ${cx - coneRadiusPx} ${topFlangeY - dishRisePx * 0.65}, 
                         ${cx - coneRadiusPx * 0.55} ${dishCrownY}, 
                         ${cx} ${dishCrownY} 
                       C ${cx + coneRadiusPx * 0.55} ${dishCrownY}, 
                         ${cx + coneRadiusPx} ${topFlangeY - dishRisePx * 0.65}, 
                         ${cx + coneRadiusPx} ${topFlangeY}`}
                    fill="none"
                    stroke={shellStroke}
                    strokeWidth="2.5"
                  />
                )}

                {/* Top Flange Weld Line */}
                <line
                  x1={cx - coneRadiusPx - 8}
                  y1={topFlangeY}
                  x2={cx + coneRadiusPx + 8}
                  y2={topFlangeY}
                  stroke={shellStroke}
                  strokeWidth="1.5"
                />

                {/* ========================================================================= */}
                {/* 5. BOTTOM APEX DISCHARGE STUB (DN BORE & FLANGE) */}
                {/* ========================================================================= */}
                <rect
                  x={cx - minorRadiusPx}
                  y={apexY}
                  width={minorRadiusPx * 2}
                  height={stubHeightPx}
                  fill={isDarkCAD ? "#1e293b" : "#e2e8f0"}
                  stroke={shellStroke}
                  strokeWidth="2"
                />
                {/* Bottom Discharge Tri-Clamp Flange */}
                <rect
                  x={cx - minorRadiusPx - 4}
                  y={dischargeBottomY - 3}
                  width={(minorRadiusPx + 4) * 2}
                  height="4"
                  fill={shellStroke}
                />

                {/* ========================================================================= */}
                {/* 6. CONE ANGLE ARC CALLOUTS (SYMMETRICAL AUTOCAD STANDARD) */}
                {/* ========================================================================= */}
                <path
                  d={`M ${cx - 22} ${apexY - 36} A 32 32 0 0 1 ${cx + 22} ${apexY - 36}`}
                  fill="none"
                  stroke={highlightAmber}
                  strokeWidth="1.5"
                />
                <rect
                  x={cx - 36}
                  y={apexY - 56}
                  width="72"
                  height="26"
                  rx="4"
                  fill={isDarkCAD ? "#070d1e" : "#ffffff"}
                  stroke={highlightAmber}
                  strokeWidth="1"
                  strokeOpacity="0.85"
                />
                <text
                  x={cx}
                  y={apexY - 43}
                  fill={highlightAmber}
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  α={coneGeom.halfAngleDeg}°
                </text>
                <text
                  x={cx}
                  y={apexY - 33}
                  fill={highlightAmber}
                  fontSize="7.5"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  (2α={coneGeom.includedAngleDeg}°)
                </text>

                {/* ========================================================================= */}
                {/* 7. DETAILED DIMENSION LADDERS (AUTOCAD ISO / ASME STANDARD - ZERO OVERLAP) */}
                {/* ========================================================================= */}
                {/* TOP MAJOR DIAMETER DIMENSION (Cleanly above dish crown) */}
                <line x1={cx - coneRadiusPx} y1={topFlangeY} x2={cx - coneRadiusPx} y2={dishCrownY - 24} stroke={dimColor} strokeWidth="0.8" strokeDasharray="3,2" />
                <line x1={cx + coneRadiusPx} y1={topFlangeY} x2={cx + coneRadiusPx} y2={dishCrownY - 24} stroke={dimColor} strokeWidth="0.8" strokeDasharray="3,2" />
                <line
                  x1={cx - coneRadiusPx}
                  y1={dishCrownY - 18}
                  x2={cx + coneRadiusPx}
                  y2={dishCrownY - 18}
                  stroke={dimColor}
                  strokeWidth="1.2"
                  markerEnd="url(#arrowHead)"
                  markerStart="url(#arrowHeadStart)"
                />
                <text x={cx} y={dishCrownY - 24} fill={dimTextColor} fontSize="9.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  D_major = {coneGeom.diameterCm} cm ({coneGeom.diameterMm} mm)
                </text>

                {/* BOTTOM MINOR APEX DIAMETER DIMENSION */}
                <line x1={cx - minorRadiusPx} y1={dischargeBottomY} x2={cx - minorRadiusPx} y2={dischargeBottomY + 24} stroke={dimColor} strokeWidth="0.8" strokeDasharray="3,2" />
                <line x1={cx + minorRadiusPx} y1={dischargeBottomY} x2={cx + minorRadiusPx} y2={dischargeBottomY + 24} stroke={dimColor} strokeWidth="0.8" strokeDasharray="3,2" />
                <line
                  x1={cx - minorRadiusPx}
                  y1={dischargeBottomY + 18}
                  x2={cx + minorRadiusPx}
                  y2={dischargeBottomY + 18}
                  stroke={dimColor}
                  strokeWidth="1"
                  markerEnd="url(#arrowHead)"
                  markerStart="url(#arrowHeadStart)"
                />
                <text x={cx} y={dischargeBottomY + 32} fill={dimTextColor} fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  D_minor = {coneGeom.minorDiameterMm} mm (DN{coneGeom.minorDiameterMm})
                </text>

                {/* LEFT DIMENSION CHAIN: ZERO OVERLAP DUAL LADDER */}
                {/* OUTER LADDER: TOTAL FABRICATION HEIGHT STACK (x = 28) */}
                <line x1={cx - coneRadiusPx - 10} y1={dishCrownY} x2={24} y2={dishCrownY} stroke={dimColor} strokeWidth="0.8" strokeDasharray="3,2" />
                <line x1={cx - minorRadiusPx - 10} y1={dischargeBottomY} x2={24} y2={dischargeBottomY} stroke={dimColor} strokeWidth="0.8" strokeDasharray="3,2" />
                <line
                  x1={28}
                  y1={dishCrownY}
                  x2={28}
                  y2={dischargeBottomY}
                  stroke={dimColor}
                  strokeWidth="1.2"
                  markerEnd="url(#arrowHead)"
                  markerStart="url(#arrowHeadStart)"
                />
                <text
                  x={14}
                  y={(dishCrownY + dischargeBottomY) / 2}
                  fill={dimTextColor}
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                  transform={`rotate(-90 14 ${(dishCrownY + dischargeBottomY) / 2})`}
                >
                  H_total = {(totalFabricationHeightMm / 10).toFixed(1)} cm
                </text>

                {/* INNER LADDER: COMPONENT SEGMENT HEIGHTS (x = 72) */}
                {/* Witness lines extending to inner ladder */}
                <line x1={cx - coneRadiusPx - 10} y1={topFlangeY} x2={66} y2={topFlangeY} stroke={dimColor} strokeWidth="0.7" strokeDasharray="2,2" />
                <line x1={cx - minorRadiusPx - 10} y1={apexY} x2={66} y2={apexY} stroke={dimColor} strokeWidth="0.7" strokeDasharray="2,2" />
                <line x1={28} y1={dishCrownY} x2={66} y2={dishCrownY} stroke={dimColor} strokeWidth="0.7" strokeDasharray="2,2" />
                <line x1={28} y1={dischargeBottomY} x2={66} y2={dischargeBottomY} stroke={dimColor} strokeWidth="0.7" strokeDasharray="2,2" />

                {/* 1. h_dish segment */}
                <line x1={72} y1={dishCrownY} x2={72} y2={topFlangeY} stroke={dimColor} strokeWidth="0.9" markerEnd="url(#arrowHead)" markerStart="url(#arrowHeadStart)" />
                <text x={80} y={(dishCrownY + topFlangeY) / 2 + 3} fill={dimTextColor} fontSize="8" fontFamily="monospace" fontWeight="bold">
                  h_dish: {headGeom.headDepthMm}mm
                </text>

                {/* 2. h_cone segment */}
                <line x1={72} y1={topFlangeY} x2={72} y2={apexY} stroke={dimColor} strokeWidth="1" markerEnd="url(#arrowHead)" markerStart="url(#arrowHeadStart)" />
                <text x={80} y={(topFlangeY + apexY) / 2 + 3} fill={dimTextColor} fontSize="8" fontFamily="monospace" fontWeight="bold">
                  h_cone: {coneGeom.heightCm}cm
                </text>

                {/* 3. h_stub segment */}
                <line x1={72} y1={apexY} x2={72} y2={dischargeBottomY} stroke={dimColor} strokeWidth="0.9" markerEnd="url(#arrowHead)" markerStart="url(#arrowHeadStart)" />
                <text x={80} y={(apexY + dischargeBottomY) / 2 + 3} fill={dimTextColor} fontSize="8" fontFamily="monospace" fontWeight="bold">
                  h_stub: 60mm
                </text>

                {/* RIGHT SIDE CALLOUT: ANNULAR JACKET 50 MM GAP (AUTOCAD DOGLEG LEADER) */}
                <line
                  x1={cx + jacketRadiusTopPx}
                  y1={jacketTopY + 10}
                  x2={cx + jacketRadiusTopPx + 24}
                  y2={jacketTopY - 14}
                  stroke={jacketStroke}
                  strokeWidth="1"
                />
                <line
                  x1={cx + jacketRadiusTopPx + 24}
                  y1={jacketTopY - 14}
                  x2={cx + jacketRadiusTopPx + 130}
                  y2={jacketTopY - 14}
                  stroke={jacketStroke}
                  strokeWidth="1"
                />
                <text
                  x={cx + jacketRadiusTopPx + 30}
                  y={jacketTopY - 19}
                  fill={jacketStroke}
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  Annular Gap: {annularGapMm} mm
                </text>
                <text
                  x={cx + jacketRadiusTopPx + 30}
                  y={jacketTopY - 6}
                  fill={dimColor}
                  fontSize="7.5"
                  fontFamily="monospace"
                >
                  Jkt ID = D_cone + {annularGapMm * 2}mm
                </text>

                {/* ========================================================================= */}
                {/* 8. STANDARD ASME FABRICATION TITLE BLOCK */}
                {/* ========================================================================= */}
                <g transform={`translate(${svgW - 176}, ${svgH - 64})`}>
                  <rect
                    width="168"
                    height="56"
                    fill={titleBlockBg}
                    stroke={titleBlockBorder}
                    strokeWidth="1"
                    rx="3"
                  />
                  <line x1="0" y1="16" x2="168" y2="16" stroke={titleBlockBorder} strokeWidth="0.8" />
                  <line x1="0" y1="36" x2="168" y2="36" stroke={titleBlockBorder} strokeWidth="0.8" />
                  <line x1="88" y1="36" x2="88" y2="56" stroke={titleBlockBorder} strokeWidth="0.8" />
                  
                  <text x="6" y="11" fill={dimTextColor} fontSize="7" fontFamily="monospace" fontWeight="bold">
                    HOSOKAWA AFD FREEZE-DRYER
                  </text>
                  <text x="6" y="26" fill={dimColor} fontSize="7" fontFamily="monospace">
                    DWG: AFD-SK-08 • 50% RULE
                  </text>
                  <text x="6" y="33" fill={dimColor} fontSize="6.5" fontFamily="monospace">
                    NOM: {nominalVolumeL}L | BATCH: {workingVolumeL}L
                  </text>
                  <text x="6" y="46" fill={dimColor} fontSize="6.5" fontFamily="monospace">
                    DISH: {headType.toUpperCase().slice(0, 7)}
                  </text>
                  <text x="6" y="53" fill={jacketStroke} fontSize="6.5" fontFamily="monospace" fontWeight="bold">
                    GAP: {annularGapMm}mm
                  </text>
                  <text x="94" y="46" fill={dimColor} fontSize="6.5" fontFamily="monospace">
                    SCALE: 1:{(1 / pxScale / 10).toFixed(0)}
                  </text>
                  <text x="94" y="53" fill={dimTextColor} fontSize="6.5" fontFamily="monospace">
                    MAT: 316L/304L
                  </text>
                </g>
              </svg>
            </div>

        {/* Fabrication Metrics Summary Ribbon (6 cards, full width) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-bg-panel border border-hairline">
            <span className="text-[10px] font-mono text-ink-muted uppercase block">Top Dia (D_major)</span>
            <div className="text-base font-bold font-mono text-ink-primary mt-0.5">{coneGeom.diameterCm} cm</div>
            <span className="text-[10px] text-ink-muted font-mono">{coneGeom.diameterMm} mm</span>
          </div>
          <div className="p-3.5 rounded-xl bg-bg-panel border border-hairline">
            <span className="text-[10px] font-mono text-ink-muted uppercase block">Cone Height (h_cone)</span>
            <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">{coneGeom.heightCm} cm</div>
            <span className="text-[10px] text-ink-muted font-mono">{coneGeom.heightMm} mm</span>
          </div>
          <div className="p-3.5 rounded-xl bg-bg-panel border border-hairline">
            <span className="text-[10px] font-mono text-ink-muted uppercase block">Slant Wall Length</span>
            <div className="text-base font-bold font-mono text-ink-primary mt-0.5">{coneGeom.slantLengthCm} cm</div>
            <span className="text-[10px] text-ink-muted font-mono">{coneGeom.slantLengthMm} mm</span>
          </div>
          <div className="p-3.5 rounded-xl bg-bg-panel border border-hairline">
            <span className="text-[10px] font-mono text-ink-muted uppercase block">Lateral Area (A_lat)</span>
            <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{coneGeom.lateralAreaM2} m²</div>
            <span className="text-[10px] text-ink-muted font-mono">Heat Surface</span>
          </div>
          <div className="p-3.5 rounded-xl bg-bg-panel border border-hairline">
            <span className="text-[10px] font-mono text-ink-muted uppercase block">50% Liquid Level</span>
            <div className="text-base font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">{coneGeom.fillHeightCm} cm</div>
            <span className="text-[10px] text-ink-muted font-mono">{coneGeom.fillHeightPercent}% Total Height</span>
          </div>
          <div className="p-3.5 rounded-xl bg-bg-panel border border-hairline">
            <span className="text-[10px] font-mono text-ink-muted uppercase block">Total Assembled H</span>
            <div className="text-base font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">{(totalFabricationHeightMm / 10).toFixed(1)} cm</div>
            <span className="text-[10px] text-ink-muted font-mono">{totalFabricationHeightMm.toFixed(0)} mm Stack</span>
          </div>
        </div>

        {/* Fabrication Dimensional Controls Bar */}
        <div className="pt-4 border-t border-hairline space-y-6">
          {/* 1. Sizing Driver Mode Selection Tabs */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-2.5 gap-2">
              <span className="font-semibold text-ink-primary flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Parametric Coupling Strategy:
              </span>
              <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
                {drivingMode === "volume"
                  ? "Fix V & α → Height & Top Dia auto-adjust when nozzle changes"
                  : drivingMode === "height"
                  ? "Fix h & α → Volume & Top Dia auto-adjust when nozzle changes"
                  : drivingMode === "vol_and_height"
                  ? "Fix V & h → Angle α & Top Dia auto-adjust when nozzle changes"
                  : "Fix D & α → Height & Volume auto-adjust when nozzle changes"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-xl bg-bg-panel border border-hairline">
              <button
                onClick={() => {
                  setDrivingMode("volume");
                  if (drivingMode === "height" || drivingMode === "diameter") {
                    setIsCustomMode(true);
                    setCustomWorkingVolumeL(coneGeom.calculatedWorkingVolumeL);
                  }
                }}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold transition cursor-pointer text-center ${
                  drivingMode === "volume"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-bg-surface"
                }`}
              >
                Volume Driven (V)
              </button>
              <button
                onClick={() => {
                  setDrivingMode("height");
                  setTargetHeightCm(coneGeom.heightCm);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold transition cursor-pointer text-center ${
                  drivingMode === "height"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-bg-surface"
                }`}
              >
                Height Driven (h)
              </button>
              <button
                onClick={() => {
                  setDrivingMode("vol_and_height");
                  setTargetHeightCm(coneGeom.heightCm);
                  if (drivingMode === "height" || drivingMode === "diameter") {
                    setIsCustomMode(true);
                    setCustomWorkingVolumeL(coneGeom.calculatedWorkingVolumeL);
                  }
                }}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold transition cursor-pointer text-center ${
                  drivingMode === "vol_and_height"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-bg-surface"
                }`}
              >
                Fixed V & h (Auto α)
              </button>
              <button
                onClick={() => {
                  setDrivingMode("diameter");
                  setTargetDiameterCm(coneGeom.diameterCm);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold transition cursor-pointer text-center ${
                  drivingMode === "diameter"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-bg-surface"
                }`}
              >
                Top Dia (D)
              </button>
            </div>
          </div>

          {/* 2. Direct Primary Parameter Controls Grid (Volume, Height & Top Diameter Dynamically Coupled) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Vessel Volume Slider */}
            <div className={`p-5 sm:p-6 rounded-2xl bg-bg-panel border space-y-3.5 transition-all ${
              drivingMode === "volume" || drivingMode === "vol_and_height"
                ? "border-cyan-500/50 shadow-sm"
                : "border-hairline"
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-ink-primary">Vessel Volume</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-surface text-ink-dim border border-hairline font-semibold">V</span>
                    {(drivingMode === "volume" || drivingMode === "vol_and_height") && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-mono font-bold border border-cyan-500/30">
                        Active Driver
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-ink-muted">
                    50% Batch: <strong className="text-ink-secondary">{coneGeom.calculatedWorkingVolumeL} L</strong>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-cyan-600 dark:text-cyan-400 font-black text-xl leading-none">
                    {coneGeom.calculatedNominalVolumeL} <span className="text-xs font-bold text-ink-muted">L</span>
                  </div>
                  <div className="text-[10px] font-mono text-ink-muted mt-1">Nominal Gross</div>
                </div>
              </div>
              <div className="pt-2">
                <input
                  type="range"
                  min="1"
                  max="1500"
                  step="1"
                  value={
                    drivingMode === "height" || drivingMode === "diameter"
                      ? coneGeom.calculatedNominalVolumeL
                      : isCustomMode
                      ? customWorkingVolumeL / 0.5
                      : currentPreset.nominalVolumeL
                  }
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (drivingMode !== "vol_and_height") {
                      setDrivingMode("volume");
                    }
                    setIsCustomMode(true);
                    setCustomWorkingVolumeL(val * 0.5);
                  }}
                  className="w-full accent-cyan-600 dark:accent-cyan-400 cursor-pointer h-2"
                />
                <div className="flex justify-between text-[11px] font-mono text-ink-muted mt-2">
                  <span>1 L</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">20 L (Std)</span>
                  <span>100 L</span>
                  <span>500 L</span>
                  <span>1500 L</span>
                </div>
              </div>
            </div>

            {/* Cone Shell Height Slider */}
            <div className={`p-5 sm:p-6 rounded-2xl bg-bg-panel border space-y-3.5 transition-all ${
              drivingMode === "height" || drivingMode === "vol_and_height"
                ? "border-amber/50 shadow-sm"
                : "border-hairline"
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-ink-primary">Cone Shell Height</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-surface text-ink-dim border border-hairline font-semibold">h_cone</span>
                    {(drivingMode === "height" || drivingMode === "vol_and_height") && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber/20 text-amber font-mono font-bold border border-amber/40">
                        Active Driver
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-ink-muted">
                    Fabrication: <strong className="text-ink-secondary">{coneGeom.heightMm.toFixed(0)} mm</strong>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-amber font-black text-xl leading-none">
                    {coneGeom.heightCm.toFixed(1)} <span className="text-xs font-bold text-ink-muted">cm</span>
                  </div>
                  <div className="text-[10px] font-mono text-ink-muted mt-1">Axial Depth</div>
                </div>
              </div>
              <div className="pt-2">
                <input
                  type="range"
                  min="15"
                  max="250"
                  step="0.5"
                  value={drivingMode === "height" || drivingMode === "vol_and_height" ? targetHeightCm : coneGeom.heightCm}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTargetHeightCm(val);
                    if (drivingMode !== "vol_and_height") {
                      setDrivingMode("height");
                    }
                  }}
                  className="w-full accent-amber cursor-pointer h-2"
                />
                <div className="flex justify-between text-[11px] font-mono text-ink-muted mt-2">
                  <span>15 cm</span>
                  <span className="text-amber font-bold">44.5 cm (20L)</span>
                  <span>120 cm</span>
                  <span>250 cm</span>
                </div>
              </div>
            </div>

            {/* Top Major Diameter Slider */}
            <div className={`p-5 sm:p-6 rounded-2xl bg-bg-panel border space-y-3.5 transition-all ${
              drivingMode === "diameter"
                ? "border-emerald-500/50 shadow-sm"
                : "border-hairline"
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-ink-primary">Top Major Diameter</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-surface text-ink-dim border border-hairline font-semibold">D_major</span>
                    {drivingMode === "diameter" && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold border border-emerald-500/40">
                        Active Driver
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-ink-muted">
                    Shell OD: <strong className="text-ink-secondary">{coneGeom.outerDiameterMm.toFixed(0)} mm</strong>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xl leading-none">
                    {coneGeom.diameterCm.toFixed(1)} <span className="text-xs font-bold text-ink-muted">cm</span>
                  </div>
                  <div className="text-[10px] font-mono text-ink-muted mt-1">Inside Flange Bore</div>
                </div>
              </div>
              <div className="pt-2">
                <input
                  type="range"
                  min="20"
                  max="250"
                  step="0.5"
                  value={drivingMode === "diameter" ? targetDiameterCm : coneGeom.diameterCm}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTargetDiameterCm(val);
                    setDrivingMode("diameter");
                  }}
                  className="w-full accent-emerald-600 dark:accent-emerald-400 cursor-pointer h-2"
                />
                <div className="flex justify-between text-[11px] font-mono text-ink-muted mt-2">
                  <span>20 cm</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">41.5 cm (20L)</span>
                  <span>120 cm</span>
                  <span>250 cm</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Cone Angle & Bottom Nozzle Bore Dual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cone Half-Angle Slider */}
            <div className={`p-5 sm:p-6 rounded-2xl bg-bg-panel border space-y-3.5 ${
              drivingMode === "vol_and_height" ? "opacity-95 border-dashed border-purple-500/40" : "border-hairline"
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-ink-primary">Cone Half-Angle</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-surface text-ink-dim border border-hairline font-semibold">α</span>
                    {drivingMode === "vol_and_height" ? (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-mono font-bold border border-purple-500/30">
                        Auto-Solved
                      </span>
                    ) : (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-mono font-bold border border-cyan-500/30">
                        Manual
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-ink-muted">
                    Included Angle: <strong className="text-ink-secondary">2α = {coneGeom.includedAngleDeg}°</strong>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-cyan-600 dark:text-cyan-400 font-black text-xl leading-none">
                    {coneGeom.halfAngleDeg}°
                  </div>
                  <div className="text-[10px] font-mono text-ink-muted mt-1">From Vertical</div>
                </div>
              </div>
              <div className="pt-2">
                <input
                  type="range"
                  min="20"
                  max="35"
                  step="0.5"
                  value={coneGeom.halfAngleDeg}
                  disabled={drivingMode === "vol_and_height"}
                  onChange={(e) => setHalfAngleDeg(Number(e.target.value))}
                  className={`w-full accent-cyan-600 dark:accent-cyan-400 h-2 ${
                    drivingMode === "vol_and_height" ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }`}
                />
                <div className="flex justify-between text-[11px] text-ink-muted font-mono mt-2">
                  <span>20° (Steep / Fast slide)</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">25° (Hosokawa Std)</span>
                  <span>35° (Shallow)</span>
                </div>
              </div>
            </div>

            {/* Minor Apex Discharge Nozzle Bore */}
            <div className="p-5 sm:p-6 rounded-2xl bg-bg-panel border border-cyan-500/30 space-y-3.5 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-ink-primary">Apex Discharge Bore</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-surface text-ink-dim border border-hairline font-semibold">D_minor</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-mono font-bold border border-cyan-500/30">
                      Coupled
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-ink-muted">
                    Tri-Clamp Spool Flange
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-cyan-600 dark:text-cyan-400 font-black text-xl leading-none">
                    DN{minorDiaMm}
                  </div>
                  <div className="text-[10px] font-mono text-ink-muted mt-1">{minorDiaMm} mm bore</div>
                </div>
              </div>
              {/* Quick Presets */}
              <div className="flex gap-2 pt-1">
                {[80, 100, 150, 200, 250].map((bore) => (
                  <button
                    key={bore}
                    onClick={() => setMinorDiaMm(bore)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold border transition cursor-pointer ${
                      minorDiaMm === bore
                        ? "border-cyan-600 bg-cyan-100 dark:bg-cyan-950/60 text-cyan-900 dark:text-cyan-200 font-bold shadow-xs"
                        : "border-hairline bg-bg-surface text-ink-muted hover:text-ink-primary hover:bg-bg-hover"
                    }`}
                  >
                    DN{bore}
                  </button>
                ))}
              </div>
              {/* Continuous slider for arbitrary custom nozzle */}
              <div className="pt-2">
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="5"
                  value={minorDiaMm}
                  onChange={(e) => setMinorDiaMm(Number(e.target.value))}
                  className="w-full accent-cyan-600 dark:accent-cyan-400 cursor-pointer h-2"
                />
                <div className="flex justify-between text-[11px] font-mono text-ink-muted mt-2">
                  <span>50 mm</span>
                  <span>Continuous Bore: 50 mm to 300 mm</span>
                  <span>300 mm</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Dynamic Coupling Feedback Banner */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-bg-panel to-bg-panel border border-cyan-500/30 text-xs font-mono text-ink-primary space-y-3">
            <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
              <span>Live Frustum Coupling Active:</span>
            </div>
            <div className="text-ink-secondary leading-relaxed pl-6 text-xs sm:text-sm">
              Apex nozzle set to <strong className="text-cyan-600 dark:text-cyan-400 font-bold">DN{minorDiaMm} ({minorDiaMm} mm)</strong>.
              {drivingMode === "volume" && (
                <span>
                  {" "}To preserve nominal volume <strong className="text-ink-primary font-bold">{coneGeom.calculatedNominalVolumeL} L</strong> and cone angle <strong className="text-ink-primary font-bold">α={coneGeom.halfAngleDeg}°</strong>, the truncation plane shifted: cone height adjusted to <strong className="text-amber font-bold">{coneGeom.heightCm} cm</strong> and top major diameter adjusted to <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{coneGeom.diameterCm} cm</strong>.
                </span>
              )}
              {drivingMode === "height" && (
                <span>
                  {" "}Holding cone height fixed at <strong className="text-amber font-bold">{coneGeom.heightCm} cm</strong> with cone angle <strong className="text-ink-primary font-bold">α={coneGeom.halfAngleDeg}°</strong>: widening the discharge bore expanded top diameter to <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{coneGeom.diameterCm} cm</strong> and nominal volume to <strong className="text-cyan-600 dark:text-cyan-400 font-bold">{coneGeom.calculatedNominalVolumeL} L</strong>.
                </span>
              )}
              {drivingMode === "vol_and_height" && (
                <span>
                  {" "}Holding both volume (<strong className="text-cyan-600 dark:text-cyan-400 font-bold">{coneGeom.calculatedNominalVolumeL} L</strong>) and cone height (<strong className="text-amber font-bold">{coneGeom.heightCm} cm</strong>) fixed: solved required cone angle <strong className="text-purple-600 dark:text-purple-400 font-bold">α={coneGeom.halfAngleDeg}°</strong> (included angle 2α={coneGeom.includedAngleDeg}°) and top diameter <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{coneGeom.diameterCm} cm</strong>.
                </span>
              )}
              {drivingMode === "diameter" && (
                <span>
                  {" "}Holding top diameter fixed at <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{coneGeom.diameterCm} cm</strong> with angle <strong className="text-ink-primary font-bold">α={coneGeom.halfAngleDeg}°</strong>: cone height adjusted to <strong className="text-amber font-bold">{coneGeom.heightCm} cm</strong> and nominal volume to <strong className="text-cyan-600 dark:text-cyan-400 font-bold">{coneGeom.calculatedNominalVolumeL} L</strong>.
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-muted pl-6 pt-3 border-t border-hairline">
              <span>Slant Wall Length: <strong className="text-ink-primary font-bold">{coneGeom.slantLengthCm} cm</strong></span>
              <span>Lateral Area: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{coneGeom.lateralAreaM2} m²</strong></span>
              <span>50% Liquid Level: <strong className="text-cyan-600 dark:text-cyan-400 font-bold">{coneGeom.fillHeightCm} cm</strong> ({coneGeom.fillHeightPercent.toFixed(1)}% of height)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
