"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  getWaterPhaseState,
  WATER_CONSTANTS,
  getIceSublimationPressureMbar,
  getWaterVaporPressureMbar,
} from "@/lib/physics";
import {
  Activity,
  ShieldCheck,
  Thermometer,
  Gauge,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ArrowDown,
  Layers,
  Flame,
  Snowflake,
  Wind,
  Info,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export type ProcessType = "FREE" | "EVAP_HEAT" | "EVAP_VAC" | "SUBLIMATION";
export type ViewScale = "PROCESS" | "FULL";

export function PhaseDiagramExplorer() {
  // Current operating coordinate
  const [tempC, setTempC] = useState<number>(-35); // Default in primary drying zone
  const [pressMbar, setPressMbar] = useState<number>(0.05); // Default in vacuum zone

  // View & UI controls
  const [viewScale, setViewScale] = useState<ViewScale>("PROCESS");
  const [selectedProcess, setSelectedProcess] = useState<ProcessType>("FREE");
  const [processStep, setProcessStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showRegions, setShowRegions] = useState<boolean>(true);
  const [showFdZone, setShowFdZone] = useState<boolean>(true);
  const [showKeyMarkers, setShowKeyMarkers] = useState<boolean>(true);

  // Hover cursor state
  const [hoverCoord, setHoverCoord] = useState<{ t: number; p: number; x: number; y: number } | null>(null);

  const phase = getWaterPhaseState(tempC, pressMbar);

  // Scale definitions
  // Process Scale: -80°C to +130°C, 0.001 mbar to 2500 mbar (High detail on drying & sterilization)
  // Full Scale: -250°C to +380°C, 0.00001 mbar to 250,000 mbar (Critical point 374°C, 220 bar, per Screenshot 231932)
  const isProcess = viewScale === "PROCESS";
  const minT = isProcess ? -80 : -250;
  const maxT = isProcess ? 130 : 380;
  const minLogP = isProcess ? -3 : -5; // 0.001 mbar vs 0.00001 mbar
  const maxLogP = isProcess ? 3.4 : 5.4; // ~2500 mbar vs ~250,000 mbar

  // SVG Geometry
  const svgWidth = 660;
  const svgHeight = 400;
  const margin = { top: 35, right: 35, bottom: 55, left: 75 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  const round = (val: number, decimals = 2) => Number(val.toFixed(decimals));

  const tToX = useCallback(
    (t: number) => {
      const clampedT = Math.max(minT, Math.min(maxT, t));
      return round(margin.left + ((clampedT - minT) / (maxT - minT)) * plotWidth);
    },
    [minT, maxT, plotWidth, margin.left]
  );

  const pToY = useCallback(
    (p: number) => {
      const minP = Math.pow(10, minLogP);
      const maxP = Math.pow(10, maxLogP);
      const clampedP = Math.max(minP, Math.min(maxP, p));
      const logP = Math.log10(clampedP);
      const normalized = (logP - minLogP) / (maxLogP - minLogP);
      return round(margin.top + (1 - normalized) * plotHeight);
    },
    [minLogP, maxLogP, plotHeight, margin.top]
  );

  const xToT = useCallback(
    (x: number) => {
      const norm = (x - margin.left) / plotWidth;
      return minT + norm * (maxT - minT);
    },
    [minT, maxT, plotWidth, margin.left]
  );

  const yToP = useCallback(
    (y: number) => {
      const norm = 1 - (y - margin.top) / plotHeight;
      const logP = minLogP + norm * (maxLogP - minLogP);
      return Math.pow(10, logP);
    },
    [minLogP, maxLogP, plotHeight, margin.top]
  );

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Pointer interaction
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(margin.left, Math.min(margin.left + plotWidth, e.clientX - rect.left));
    const y = Math.max(margin.top, Math.min(margin.top + plotHeight, e.clientY - rect.top));
    const newT = Math.round(xToT(x));
    const newP = Number(yToP(y).toFixed(4));
    setTempC(newT);
    setPressMbar(newP);
    if (selectedProcess !== "FREE") {
      setSelectedProcess("FREE");
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= margin.left && x <= margin.left + plotWidth && y >= margin.top && y <= margin.top + plotHeight) {
      setHoverCoord({
        t: Math.round(xToT(x)),
        p: Number(yToP(y).toFixed(4)),
        x,
        y,
      });
      if (e.buttons === 1) {
        setTempC(Math.round(xToT(x)));
        setPressMbar(Number(yToP(y).toFixed(4)));
        if (selectedProcess !== "FREE") {
          setSelectedProcess("FREE");
        }
      }
    } else {
      setHoverCoord(null);
    }
  };

  const handlePointerLeave = () => {
    setHoverCoord(null);
  };

  // --- Thermodynamic Curve Construction ---
  // Sublimation Curve: minT to 0.01°C
  const subCurvePoints: { x: number; y: number; t: number; p: number }[] = [];
  const tStepSub = isProcess ? 2 : 5;
  for (let t = minT; t <= 0.01; t += tStepSub) {
    const p = getIceSublimationPressureMbar(t);
    subCurvePoints.push({ x: tToX(t), y: pToY(p), t, p });
  }
  // Ensure anchor at exact triple point
  const tpX = tToX(WATER_CONSTANTS.TRIPLE_POINT_TEMP_C);
  const tpY = pToY(WATER_CONSTANTS.TRIPLE_POINT_PRESS_MBAR);
  subCurvePoints.push({
    x: tpX,
    y: tpY,
    t: WATER_CONSTANTS.TRIPLE_POINT_TEMP_C,
    p: WATER_CONSTANTS.TRIPLE_POINT_PRESS_MBAR,
  });

  const subCurvePath = `M ${subCurvePoints.map((pt) => `${pt.x},${pt.y}`).join(" L ")}`;

  // Vaporization Curve: 0.01°C to maxT (or critical point 373.95°C)
  const vapCurvePoints: { x: number; y: number; t: number; p: number }[] = [
    { x: tpX, y: tpY, t: 0.01, p: WATER_CONSTANTS.TRIPLE_POINT_PRESS_MBAR },
  ];
  const maxVapT = Math.min(maxT, 373.95);
  const tStepVap = isProcess ? 2 : 8;
  for (let t = 0.01 + tStepVap; t <= maxVapT; t += tStepVap) {
    const p = getWaterVaporPressureMbar(t);
    vapCurvePoints.push({ x: tToX(t), y: pToY(p), t, p });
  }
  // Anchor at critical point in full view
  if (!isProcess && maxT >= 373.95) {
    vapCurvePoints.push({ x: tToX(373.95), y: pToY(220640), t: 373.95, p: 220640 });
  }
  const vapCurvePath = `M ${vapCurvePoints.map((pt) => `${pt.x},${pt.y}`).join(" L ")}`;

  // Melting Line: upward from triple point to max pressure
  // Water ice melting line has a slight negative slope (freezing point drops under extreme pressure)
  const meltTopX = tToX(isProcess ? -0.1 : -22);
  const meltTopY = pToY(Math.pow(10, maxLogP));
  const meltPath = `M ${tpX},${tpY} L ${meltTopX},${meltTopY}`;

  // Polygon Shaded Regions
  // 1. SOLID REGION: bounded by top-left corner, melt line, triple point, sublimation line down to minT
  const solidPolygon = [
    `${margin.left},${margin.top}`,
    `${meltTopX},${meltTopY}`,
    `${tpX},${tpY}`,
    ...[...subCurvePoints].reverse().map((pt) => `${pt.x},${pt.y}`),
    `${margin.left},${pToY(getIceSublimationPressureMbar(minT))}`,
    `${margin.left},${margin.top}`,
  ].join(" ");

  // 2. LIQUID REGION: bounded by melt line down to triple point, vaporization line up to maxVapT, top boundary
  const liquidPolygon = [
    `${meltTopX},${meltTopY}`,
    `${tpX},${tpY}`,
    ...vapCurvePoints.map((pt) => `${pt.x},${pt.y}`),
    `${tToX(maxVapT)},${margin.top}`,
    `${meltTopX},${margin.top}`,
  ].join(" ");

  // 3. VAPOR REGION: bounded by sublimation curve, triple point, vaporization curve, right edge, bottom edge, left edge
  const vaporPolygon = [
    `${margin.left},${pToY(getIceSublimationPressureMbar(minT))}`,
    ...subCurvePoints.map((pt) => `${pt.x},${pt.y}`),
    ...vapCurvePoints.map((pt) => `${pt.x},${pt.y}`),
    `${tToX(maxVapT)},${margin.top + plotHeight}`,
    `${margin.left},${margin.top + plotHeight}`,
  ].join(" ");

  // Freeze Drying Operating Window Box (Hosokawa Empirical Window)
  const fdBoxX1 = tToX(-55);
  const fdBoxX2 = tToX(-10);
  const fdBoxY1 = pToY(1.5);
  const fdBoxY2 = pToY(0.05);

  // Key Physical Landmark Points
  const normalBoilX = tToX(100);
  const normalBoilY = pToY(1013.25);
  const normalFreezeX = tToX(0);
  const normalFreezeY = pToY(1013.25);
  const critX = tToX(373.95);
  const critY = pToY(220640);

  // --- Process Pathway Definitions (Derived directly from Screenshots 232233 & 232329) ---
  const processStepsData = {
    EVAP_HEAT: [
      {
        step: 1,
        title: "Starting Liquid API / Solution",
        t: 20,
        p: 1013.25,
        desc: "Product enters vessel at room temperature (20 °C) under 1 atm atmospheric pressure.",
      },
      {
        step: 2,
        title: "Heating at Constant Pressure",
        t: 70,
        p: 1013.25,
        desc: "Thermal energy is supplied through the jacket. Sensible heat raises solution temperature toward the boiling line.",
      },
      {
        step: 3,
        title: "Atmospheric Boiling & Evaporation",
        t: 100,
        p: 1013.25,
        desc: "Boiling occurs at 100 °C, requiring Latent Heat of Vaporization (2,257 kJ/kg). High heat denatures fragile proteins!",
      },
    ],
    EVAP_VAC: [
      {
        step: 1,
        title: "Warm Liquid Slurry",
        t: 40,
        p: 1013.25,
        desc: "Material charged at mild temperature (40 °C) under atmospheric pressure.",
      },
      {
        step: 2,
        title: "Chamber Pressure Reduction",
        t: 40,
        p: 200,
        desc: "Vacuum pump engages, pulling pressure downward. Evaporation rate accelerates.",
      },
      {
        step: 3,
        title: "Low-Temperature Vacuum Boiling",
        t: 40,
        p: 73.8,
        desc: "Pressure drops below 74 mbar, crossing the boiling curve. Water evaporates vigorously at gentle 40 °C without thermal damage!",
      },
    ],
    SUBLIMATION: [
      {
        step: 1,
        title: "Stage 1: Cooling & Agitated Granulation",
        t: -40,
        p: 1013.25,
        desc: "TCU chills the jacket. Continuous auger rotation breaks the freezing slurry into free-flowing snow-like granules (ΔH_fus = 334 kJ/kg).",
      },
      {
        step: 2,
        title: "Stage 2: Deep Vacuum Evacuation",
        t: -40,
        p: 0.1,
        desc: "Chamber is evacuated to 0.1 mbar (10 Pa), landing strictly below the 6.11 mbar triple point. Liquid phase is physically locked out.",
      },
      {
        step: 3,
        title: "Stage 3: Sublimation & Secondary Desorption",
        t: 25,
        p: 0.1,
        desc: "Jacket supplies Sublimation Enthalpy (2,840 kJ/kg). Ice converts directly to vapor without melt-back, yielding ready-to-fill bulk dry powder!",
      },
    ],
  };

  // Sync process step to operating point
  const applyProcessStep = useCallback(
    (processKey: ProcessType, stepIdx: number) => {
      if (processKey === "FREE") return;
      const steps = processStepsData[processKey];
      if (steps && steps[stepIdx]) {
        setTempC(steps[stepIdx].t);
        setPressMbar(steps[stepIdx].p);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Auto-play animation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && selectedProcess !== "FREE") {
      const steps = processStepsData[selectedProcess];
      interval = setInterval(() => {
        setProcessStep((prev) => {
          const next = (prev + 1) % steps.length;
          applyProcessStep(selectedProcess, next);
          return next;
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedProcess, applyProcessStep]);

  const selectProcess = (proc: ProcessType) => {
    setSelectedProcess(proc);
    setProcessStep(0);
    setIsPlaying(false);
    if (proc !== "FREE") {
      applyProcessStep(proc, 0);
    }
  };

  return (
    <div className="instrument-card rounded-2xl p-4 sm:p-6 my-6 border border-hairline bg-bg-panel backdrop-blur-md max-w-4xl mx-auto shadow-2xl transition-all">
      {/* Header & Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-4 border-b border-hairline gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cryo animate-pulse shadow-sm shadow-cryo" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-cryo font-bold">
              Simulator 01 • Chapter 02
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-bg-hover text-ink-muted border border-hairline">
              Hosokawa Phase Dynamics
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-ink-primary mt-1 tracking-tight">
            Water Phase Diagram Explorer &amp; Thermodynamic Pathways
          </h3>
          <p className="text-xs text-ink-secondary mt-0.5">
            Full Clausius–Clapeyron sublimation equilibrium, vacuum boiling suppression, and dynamic freeze-drying kinetics.
          </p>
        </div>

        {/* Live Status Indicators */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Phase Badge */}
          <div
            className="px-3 py-1.5 rounded-xl border font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
            style={{
              borderColor: phase.color,
              backgroundColor: `${phase.color}18`,
              color: phase.color,
            }}
          >
            <Activity className="w-4 h-4" />
            <span>{phase.state}</span>
          </div>

          {/* Scale Zoom Switcher */}
          <div className="flex items-center rounded-xl bg-bg-inset border border-hairline p-0.5">
            <button
              onClick={() => setViewScale("PROCESS")}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition ${
                viewScale === "PROCESS"
                  ? "bg-bg-panel text-amber-bright font-bold shadow-sm"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              Process View
            </button>
            <button
              onClick={() => setViewScale("FULL")}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition ${
                viewScale === "FULL"
                  ? "bg-bg-panel text-cryo font-bold shadow-sm"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              Full Scale
            </button>
          </div>
        </div>
      </div>

      {/* Process Selection Tabs (Directly from Screenshots 232233 & 232329) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => selectProcess("FREE")}
          className={`px-3 py-2 rounded-xl text-xs font-mono text-left transition border ${
            selectedProcess === "FREE"
              ? "bg-amber/15 border-amber text-amber font-bold shadow-sm"
              : "bg-bg-surface hover:bg-bg-hover border-hairline text-ink-secondary"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase text-ink-muted">
            <Sparkles className="w-3 h-3 text-amber" /> Mode 01
          </div>
          <div className="font-bold mt-0.5">Free Exploration</div>
        </button>

        <button
          onClick={() => selectProcess("EVAP_HEAT")}
          className={`px-3 py-2 rounded-xl text-xs font-mono text-left transition border ${
            selectedProcess === "EVAP_HEAT"
              ? "bg-orange-500/15 border-orange-500 text-orange-400 font-bold shadow-sm"
              : "bg-bg-surface hover:bg-bg-hover border-hairline text-ink-secondary"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase text-ink-muted">
            <Flame className="w-3 h-3 text-orange-400" /> Mode 02
          </div>
          <div className="font-bold mt-0.5">Atmos. Evaporation</div>
        </button>

        <button
          onClick={() => selectProcess("EVAP_VAC")}
          className={`px-3 py-2 rounded-xl text-xs font-mono text-left transition border ${
            selectedProcess === "EVAP_VAC"
              ? "bg-sky-500/15 border-sky-500 text-sky-400 font-bold shadow-sm"
              : "bg-bg-surface hover:bg-bg-hover border-hairline text-ink-secondary"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase text-ink-muted">
            <Wind className="w-3 h-3 text-sky-400" /> Mode 03
          </div>
          <div className="font-bold mt-0.5">Vacuum Drying</div>
        </button>

        <button
          onClick={() => selectProcess("SUBLIMATION")}
          className={`px-3 py-2 rounded-xl text-xs font-mono text-left transition border ${
            selectedProcess === "SUBLIMATION"
              ? "bg-cryo/20 border-cryo text-cryo font-bold shadow-sm"
              : "bg-bg-surface hover:bg-bg-hover border-hairline text-ink-secondary"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase text-ink-muted">
            <Snowflake className="w-3 h-3 text-cryo" /> Mode 04 (AFD)
          </div>
          <div className="font-bold mt-0.5">Freeze Drying</div>
        </button>
      </div>

      {/* Main Interactive SVG Canvas */}
      <div className="relative bg-bg-inset rounded-2xl border border-hairline p-3 overflow-hidden select-none shadow-inner">
        {/* Layer Visibility Controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-bg-panel/90 backdrop-blur-md p-1 rounded-xl border border-hairline shadow-md text-[10px] font-mono">
          <button
            onClick={() => setShowRegions(!showRegions)}
            className={`px-2 py-1 rounded-lg transition ${
              showRegions ? "bg-amber/20 text-amber font-bold" : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            Regions
          </button>
          <button
            onClick={() => setShowFdZone(!showFdZone)}
            className={`px-2 py-1 rounded-lg transition ${
              showFdZone ? "bg-cryo/20 text-cryo font-bold" : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            AFD Zone
          </button>
          <button
            onClick={() => setShowKeyMarkers(!showKeyMarkers)}
            className={`px-2 py-1 rounded-lg transition ${
              showKeyMarkers ? "bg-amber-bright/20 text-amber-bright font-bold" : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            Key Points
          </button>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[380px] cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          suppressHydrationWarning
        >
          <defs>
            {/* High-Contrast Gradient Fills for Phase Regions */}
            <linearGradient id="solidRegionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.12" />
            </linearGradient>

            <linearGradient id="liquidRegionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.14" />
            </linearGradient>

            <linearGradient id="vaporRegionGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.10" />
            </linearGradient>

            {/* Hatch pattern for AFD operating envelope */}
            <pattern id="fdHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="var(--amber)" strokeWidth="1.5" strokeOpacity="0.4" />
            </pattern>

            {/* Arrow marker for process pathways */}
            <marker id="arrowHead" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 z" fill="var(--amber-bright)" />
            </marker>
            <marker id="arrowHeadCyan" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 z" fill="#38bdf8" />
            </marker>
            <marker id="arrowHeadOrange" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 z" fill="#f97316" />
            </marker>
          </defs>

          {/* Region Shaded Fills (Solves contrast issue completely) */}
          {showRegions && (
            <g className="transition-opacity duration-300">
              {/* Solid Ice Region */}
              <polygon points={solidPolygon} fill="url(#solidRegionGrad)" />

              {/* Liquid Water Region */}
              <polygon points={liquidPolygon} fill="url(#liquidRegionGrad)" />

              {/* Vapor Region */}
              <polygon points={vaporPolygon} fill="url(#vaporRegionGrad)" />
            </g>
          )}

          {/* Subtle Grid Lines */}
          {(isProcess ? [-60, -40, -20, 0, 20, 40, 60, 80, 100, 120] : [-200, -150, -100, -50, 0, 100, 200, 300]).map(
            (t) => (
              <line
                key={`grid-x-${t}`}
                x1={tToX(t)}
                y1={margin.top}
                x2={tToX(t)}
                y2={margin.top + plotHeight}
                stroke="var(--chart-grid)"
                strokeDasharray="2 3"
              />
            )
          )}
          {(isProcess ? [-2, -1, 0, 1, 2, 3] : [-4, -2, 0, 2, 4]).map((logP) => {
            const p = Math.pow(10, logP);
            return (
              <line
                key={`grid-y-${logP}`}
                x1={margin.left}
                y1={pToY(p)}
                x2={margin.left + plotWidth}
                y2={pToY(p)}
                stroke="var(--chart-grid)"
                strokeDasharray="2 3"
              />
            );
          })}

          {/* Freeze Drying Operating Window (AFD Specification) */}
          {showFdZone && (
            <g>
              <rect
                x={fdBoxX1}
                y={fdBoxY1}
                width={fdBoxX2 - fdBoxX1}
                height={fdBoxY2 - fdBoxY1}
                fill="url(#fdHatch)"
                stroke="var(--amber)"
                strokeWidth="2"
                strokeDasharray="4 2"
                className="animate-pulse"
              />
              {/* High Contrast Badge for AFD Zone */}
              <g transform={`translate(${fdBoxX1 + 6}, ${fdBoxY1 + 16})`}>
                <rect
                  x="-2"
                  y="-11"
                  width="134"
                  height="16"
                  rx="4"
                  fill="var(--bg-panel)"
                  stroke="var(--amber)"
                  strokeWidth="1"
                  fillOpacity="0.95"
                />
                <text x="2" y="1" fill="var(--amber)" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  ★ AFD SUBLIMATION ZONE
                </text>
              </g>
            </g>
          )}

          {/* Phase Boundary Curves (Thick, High-Contrast Lines) */}
          {/* Sublimation Line */}
          <path d={subCurvePath} fill="none" stroke="#0284c7" strokeWidth="3" />

          {/* Vaporization Line */}
          <path d={vapCurvePath} fill="none" stroke="#2563eb" strokeWidth="3" />

          {/* Solid-Liquid Melting Line */}
          <path d={meltPath} fill="none" stroke="#9333ea" strokeWidth="2.5" strokeDasharray="4 3" />

          {/* Region High-Contrast Badges inside Canvas */}
          {showRegions && (
            <g>
              {/* Solid Badge */}
              <g transform={`translate(${tToX(isProcess ? -55 : -140)}, ${pToY(isProcess ? 200 : 1000)})`}>
                <rect
                  x="-4"
                  y="-14"
                  width="92"
                  height="20"
                  rx="6"
                  fill="var(--bg-panel)"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                  fillOpacity="0.95"
                />
                <text x="4" y="0" fill="#0284c7" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  SOLID (ICE)
                </text>
              </g>

              {/* Liquid Badge */}
              <g transform={`translate(${tToX(isProcess ? 45 : 120)}, ${pToY(isProcess ? 500 : 5000)})`}>
                <rect
                  x="-4"
                  y="-14"
                  width="96"
                  height="20"
                  rx="6"
                  fill="var(--bg-panel)"
                  stroke="#2563eb"
                  strokeWidth="1.5"
                  fillOpacity="0.95"
                />
                <text x="4" y="0" fill="#2563eb" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  LIQUID WATER
                </text>
              </g>

              {/* Vapor Badge */}
              <g transform={`translate(${tToX(isProcess ? 30 : 140)}, ${pToY(isProcess ? 0.02 : 0.005)})`}>
                <rect
                  x="-4"
                  y="-14"
                  width="92"
                  height="20"
                  rx="6"
                  fill="var(--bg-panel)"
                  stroke="#d97706"
                  strokeWidth="1.5"
                  fillOpacity="0.95"
                />
                <text x="4" y="0" fill="#d97706" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  VAPOR (GAS)
                </text>
              </g>
            </g>
          )}

          {/* Critical Physical Landmarks (Triple Point, 1 atm Freezing, 1 atm Boiling, Critical Point) */}
          {showKeyMarkers && (
            <g>
              {/* 1. TRIPLE POINT PIN */}
              <circle cx={tpX} cy={tpY} r="7" fill="none" stroke="var(--amber)" strokeWidth="2" className="animate-ping" />
              <circle cx={tpX} cy={tpY} r="5" fill="var(--amber)" stroke="var(--bg-panel)" strokeWidth="2" />
              <g transform={`translate(${tpX + 8}, ${tpY - 8})`}>
                <rect
                  x="-3"
                  y="-12"
                  width="180"
                  height="16"
                  rx="4"
                  fill="var(--bg-panel)"
                  stroke="var(--amber)"
                  strokeWidth="1.2"
                  fillOpacity="0.95"
                />
                <text x="2" y="-1" fill="var(--amber)" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  TRIPLE POINT (0.01°C, 6.11 mbar)
                </text>
              </g>

              {/* 2. NORMAL BOILING POINT (100°C at 1013 mbar) */}
              {isProcess && (
                <g>
                  <circle cx={normalBoilX} cy={normalBoilY} r="4.5" fill="#f97316" stroke="var(--bg-panel)" strokeWidth="1.5" />
                  <g transform={`translate(${normalBoilX - 145}, ${normalBoilY - 10})`}>
                    <rect
                      x="-3"
                      y="-12"
                      width="142"
                      height="16"
                      rx="4"
                      fill="var(--bg-panel)"
                      stroke="#f97316"
                      strokeWidth="1"
                      fillOpacity="0.95"
                    />
                    <text x="2" y="-1" fill="#ea580c" fontSize="9" fontFamily="monospace" fontWeight="bold">
                      Boiling (100°C, 1 atm)
                    </text>
                  </g>
                </g>
              )}

              {/* 3. NORMAL FREEZING POINT (0°C at 1013 mbar) */}
              {isProcess && (
                <g>
                  <circle cx={normalFreezeX} cy={normalFreezeY} r="4" fill="#0284c7" stroke="var(--bg-panel)" strokeWidth="1.5" />
                  <g transform={`translate(${normalFreezeX - 135}, ${normalFreezeY + 16})`}>
                    <rect
                      x="-3"
                      y="-12"
                      width="130"
                      height="16"
                      rx="4"
                      fill="var(--bg-panel)"
                      stroke="#0284c7"
                      strokeWidth="1"
                      fillOpacity="0.95"
                    />
                    <text x="2" y="-1" fill="#0284c7" fontSize="9" fontFamily="monospace" fontWeight="bold">
                      Freeze (0°C, 1 atm)
                    </text>
                  </g>
                </g>
              )}

              {/* 4. CRITICAL POINT (in Full View: 374°C, 220 bar) */}
              {!isProcess && (
                <g>
                  <circle cx={critX} cy={critY} r="6" fill="#e11d48" stroke="var(--bg-panel)" strokeWidth="2" />
                  <g transform={`translate(${critX - 170}, ${critY - 10})`}>
                    <rect
                      x="-3"
                      y="-12"
                      width="165"
                      height="16"
                      rx="4"
                      fill="var(--bg-panel)"
                      stroke="#e11d48"
                      strokeWidth="1"
                      fillOpacity="0.95"
                    />
                    <text x="2" y="-1" fill="#e11d48" fontSize="9" fontFamily="monospace" fontWeight="bold">
                      CRITICAL POINT (374°C, 220.6 bar)
                    </text>
                  </g>
                </g>
              )}
            </g>
          )}

          {/* --- PROCESS PATHWAY OVERLAYS (Representing Screenshot 232233 & 232329) --- */}
          {selectedProcess === "EVAP_HEAT" && isProcess && (
            <g>
              {/* Heating at 1 atm line (from 20°C to 110°C at 1013 mbar) */}
              <line
                x1={tToX(20)}
                y1={pToY(1013.25)}
                x2={tToX(110)}
                y2={pToY(1013.25)}
                stroke="#f97316"
                strokeWidth="4"
                strokeDasharray="6 3"
                markerEnd="url(#arrowHeadOrange)"
              />
              <circle cx={tToX(20)} cy={pToY(1013.25)} r="5" fill="#f97316" stroke="var(--bg-panel)" strokeWidth="2" />
              <circle cx={tToX(100)} cy={pToY(1013.25)} r="5" fill="#e11d48" stroke="var(--bg-panel)" strokeWidth="2" />

              <g transform={`translate(${tToX(30)}, ${pToY(1013.25) - 22})`}>
                <rect x="-4" y="-12" width="168" height="18" rx="4" fill="#f97316" />
                <text x="4" y="1" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  HEATING AT 1 ATM → BOILING
                </text>
              </g>
            </g>
          )}

          {selectedProcess === "EVAP_VAC" && isProcess && (
            <g>
              {/* Vacuum Evaporation Line: vertical pressure drop at 40°C */}
              <line
                x1={tToX(40)}
                y1={pToY(1013.25)}
                x2={tToX(40)}
                y2={pToY(25)}
                stroke="#38bdf8"
                strokeWidth="4"
                strokeDasharray="6 3"
                markerEnd="url(#arrowHeadCyan)"
              />
              <circle cx={tToX(40)} cy={pToY(1013.25)} r="5" fill="#38bdf8" stroke="var(--bg-panel)" strokeWidth="2" />
              <circle cx={tToX(40)} cy={pToY(73.8)} r="5" fill="#0284c7" stroke="var(--bg-panel)" strokeWidth="2" />

              <g transform={`translate(${tToX(40) + 10}, ${pToY(300)})`}>
                <rect x="-4" y="-12" width="180" height="18" rx="4" fill="#0284c7" />
                <text x="4" y="1" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  DECREASE PRESSURE (VACUUM)
                </text>
              </g>
            </g>
          )}

          {selectedProcess === "SUBLIMATION" && isProcess && (
            <g>
              {/* Step 1: Cooling Line (20°C down to -40°C at 1013 mbar) */}
              <line
                x1={tToX(20)}
                y1={pToY(1013.25)}
                x2={tToX(-40)}
                y2={pToY(1013.25)}
                stroke="#0284c7"
                strokeWidth="3.5"
                strokeDasharray="5 3"
              />
              {/* Step 2: Vacuum Draw (-40°C from 1013 mbar down to 0.1 mbar) */}
              <line
                x1={tToX(-40)}
                y1={pToY(1013.25)}
                x2={tToX(-40)}
                y2={pToY(0.1)}
                stroke="#d97706"
                strokeWidth="3.5"
                strokeDasharray="5 3"
              />
              {/* Step 3: Sublimation Heating (-40°C up to +25°C at 0.1 mbar) */}
              <line
                x1={tToX(-40)}
                y1={pToY(0.1)}
                x2={tToX(25)}
                y2={pToY(0.1)}
                stroke="var(--amber)"
                strokeWidth="4"
                strokeDasharray="6 3"
                markerEnd="url(#arrowHead)"
              />

              {/* Waypoint Checkpoints */}
              <circle cx={tToX(20)} cy={pToY(1013.25)} r="5" fill="#0284c7" stroke="var(--bg-panel)" strokeWidth="2" />
              <circle cx={tToX(-40)} cy={pToY(1013.25)} r="5" fill="#38bdf8" stroke="var(--bg-panel)" strokeWidth="2" />
              <circle cx={tToX(-40)} cy={pToY(0.1)} r="5" fill="#d97706" stroke="var(--bg-panel)" strokeWidth="2" />
              <circle cx={tToX(25)} cy={pToY(0.1)} r="5" fill="var(--amber)" stroke="var(--bg-panel)" strokeWidth="2" />

              {/* Labels for Stages */}
              <g transform={`translate(${tToX(-20)}, ${pToY(1013.25) - 18})`}>
                <rect x="-2" y="-10" width="105" height="15" rx="3" fill="#0284c7" />
                <text x="2" y="1" fill="#ffffff" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                  ① COOLING / FREEZE
                </text>
              </g>

              <g transform={`translate(${tToX(-40) - 120}, ${pToY(20)})`}>
                <rect x="-2" y="-10" width="112" height="15" rx="3" fill="#d97706" />
                <text x="2" y="1" fill="#ffffff" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                  ② EVACUATE TO VACUUM
                </text>
              </g>

              <g transform={`translate(${tToX(-15)}, ${pToY(0.1) + 18})`}>
                <rect x="-2" y="-10" width="135" height="15" rx="3" fill="var(--amber)" />
                <text x="2" y="1" fill="#ffffff" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                  ③ SUBLIMATION HEATING
                </text>
              </g>
            </g>
          )}

          {/* Current Dynamic Operating Point */}
          <g>
            <circle
              cx={tToX(tempC)}
              cy={pToY(pressMbar)}
              r="8"
              fill={phase.color}
              stroke="var(--bg-panel)"
              strokeWidth="2.5"
              className="animate-pulse"
              style={{ filter: `drop-shadow(0 0 8px ${phase.color})` }}
            />
            <circle
              cx={tToX(tempC)}
              cy={pToY(pressMbar)}
              r="16"
              fill="none"
              stroke={phase.color}
              strokeWidth="1.5"
              strokeDasharray="3 2"
              opacity="0.8"
            />
          </g>

          {/* Interactive Hover Crosshair */}
          {hoverCoord && (
            <g>
              <line
                x1={hoverCoord.x}
                y1={margin.top}
                x2={hoverCoord.x}
                y2={margin.top + plotHeight}
                stroke="var(--ink-primary)"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.5"
              />
              <line
                x1={margin.left}
                y1={hoverCoord.y}
                x2={margin.left + plotWidth}
                y2={hoverCoord.y}
                stroke="var(--ink-primary)"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.5"
              />
              <circle cx={hoverCoord.x} cy={hoverCoord.y} r="4" fill="var(--ink-primary)" opacity="0.7" />
            </g>
          )}

          {/* Axes Lines (High Contrast Strong Border) */}
          <line
            x1={margin.left}
            y1={margin.top + plotHeight}
            x2={margin.left + plotWidth}
            y2={margin.top + plotHeight}
            stroke="var(--border-strong)"
            strokeWidth="2"
          />
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={margin.top + plotHeight}
            stroke="var(--border-strong)"
            strokeWidth="2"
          />

          {/* X-Axis Ticks & Dual Labels (°C and K) */}
          {(isProcess ? [-60, -40, -20, 0, 20, 40, 60, 80, 100, 120] : [-200, -100, 0, 100, 200, 300]).map((t) => (
            <g key={`tick-x-${t}`}>
              <line
                x1={tToX(t)}
                y1={margin.top + plotHeight}
                x2={tToX(t)}
                y2={margin.top + plotHeight + 5}
                stroke="var(--border-strong)"
                strokeWidth="1.5"
              />
              <text
                x={tToX(t)}
                y={margin.top + plotHeight + 16}
                fill="var(--ink-primary)"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="600"
                textAnchor="middle"
              >
                {t}°C
              </text>
              <text
                x={tToX(t)}
                y={margin.top + plotHeight + 27}
                fill="var(--ink-muted)"
                fontSize="8.5"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {(t + 273.15).toFixed(0)}K
              </text>
            </g>
          ))}

          {/* Y-Axis Ticks & Dual Labels (mbar and Pa) */}
          {(isProcess ? [-3, -2, -1, 0, 1, 2, 3] : [-4, -2, 0, 2, 4]).map((logP) => {
            const p = Math.pow(10, logP);
            const pa = p * 100;
            return (
              <g key={`tick-y-${logP}`}>
                <line
                  x1={margin.left - 5}
                  y1={pToY(p)}
                  x2={margin.left}
                  y2={pToY(p)}
                  stroke="var(--border-strong)"
                  strokeWidth="1.5"
                />
                <text
                  x={margin.left - 8}
                  y={pToY(p) - 1}
                  fill="var(--ink-primary)"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  {p >= 1 ? `${p}` : p.toFixed(p < 0.01 ? 3 : 2)} mbar
                </text>
                <text
                  x={margin.left - 8}
                  y={pToY(p) + 9}
                  fill="var(--ink-muted)"
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {pa >= 1000 ? `${(pa / 1000).toFixed(0)} kPa` : `${pa.toFixed(0)} Pa`}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Live Hover Tooltip Card */}
        {hoverCoord && (
          <div className="absolute bottom-3 left-4 bg-bg-panel/95 backdrop-blur-md px-3 py-2 rounded-xl border border-hairline shadow-lg text-xs font-mono flex items-center gap-3">
            <span className="text-ink-secondary">
              Probe: <strong className="text-ink-primary">{hoverCoord.t} °C</strong> ({(hoverCoord.t + 273.15).toFixed(1)} K)
            </span>
            <span className="text-hairline">|</span>
            <span className="text-ink-secondary">
              Pressure: <strong className="text-ink-primary">{hoverCoord.p < 0.1 ? hoverCoord.p.toFixed(3) : hoverCoord.p.toFixed(1)} mbar</strong>
            </span>
            <span className="text-hairline">|</span>
            <span className="text-amber font-semibold">
              {getWaterPhaseState(hoverCoord.t, hoverCoord.p).state}
            </span>
          </div>
        )}
      </div>

      {/* Process Step Scrubber & Explanation (When a process pathway is active) */}
      {selectedProcess !== "FREE" && (
        <div className="mt-4 p-4 rounded-xl bg-bg-surface border border-hairline transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber/15 text-amber border border-amber/30">
                Step {processStep + 1} of {processStepsData[selectedProcess].length}
              </span>
              <h4 className="text-sm font-bold text-ink-primary">
                {processStepsData[selectedProcess][processStep].title}
              </h4>
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const steps = processStepsData[selectedProcess];
                  const prev = (processStep - 1 + steps.length) % steps.length;
                  setProcessStep(prev);
                  applyProcessStep(selectedProcess, prev);
                }}
                className="px-2.5 py-1 text-xs font-mono rounded-lg bg-bg-hover hover:bg-bg-panel border border-hairline text-ink-primary transition"
              >
                Back
              </button>
              <button
                onClick={() => {
                  const steps = processStepsData[selectedProcess];
                  const next = (processStep + 1) % steps.length;
                  setProcessStep(next);
                  applyProcessStep(selectedProcess, next);
                }}
                className="px-2.5 py-1 text-xs font-mono rounded-lg bg-bg-hover hover:bg-bg-panel border border-hairline text-ink-primary transition"
              >
                Next
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-lg bg-amber text-[#0e0a02] font-bold text-xs hover:bg-amber-bright transition shadow-sm"
                title={isPlaying ? "Pause cycle" : "Auto-play cycle"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <p className="text-xs text-ink-secondary leading-relaxed">
            {processStepsData[selectedProcess][processStep].desc}
          </p>
        </div>
      )}

      {/* Manual Precision Sliders & Dual Readout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-hairline">
        <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-ink-secondary flex items-center gap-1.5 font-medium">
              <Thermometer className="w-4 h-4 text-cryo" /> Temperature (°C / K)
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="font-bold text-ink-primary">{tempC}°C</span>
              <span className="text-ink-dim">({(tempC + 273.15).toFixed(1)} K)</span>
            </div>
          </div>
          <input
            type="range"
            min={minT}
            max={maxT}
            step="1"
            value={tempC}
            onChange={(e) => {
              setTempC(Number(e.target.value));
              if (selectedProcess !== "FREE") setSelectedProcess("FREE");
            }}
            className="w-full accent-cryo cursor-pointer"
          />
        </div>

        <div className="bg-bg-surface p-3.5 rounded-xl border border-hairline">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-ink-secondary flex items-center gap-1.5 font-medium">
              <Gauge className="w-4 h-4 text-amber" /> Chamber Pressure
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="font-bold text-ink-primary">
                {pressMbar < 0.1 ? pressMbar.toFixed(3) : pressMbar.toFixed(1)} mbar
              </span>
              <span className="text-ink-dim">({(pressMbar * 100).toFixed(0)} Pa)</span>
            </div>
          </div>
          <input
            type="range"
            min={minLogP}
            max={maxLogP}
            step="0.05"
            value={Math.log10(Math.max(Math.pow(10, minLogP), pressMbar))}
            onChange={(e) => {
              setPressMbar(Number(Math.pow(10, Number(e.target.value)).toFixed(4)));
              if (selectedProcess !== "FREE") setSelectedProcess("FREE");
            }}
            className="w-full accent-amber cursor-pointer"
          />
        </div>
      </div>

      {/* Thermodynamic Insights Readout Card */}
      <div className="mt-4 p-4 rounded-xl bg-bg-surface border border-hairline text-xs text-ink-secondary space-y-2">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-ink-primary">Thermodynamic State Analysis: </span>
            {phase.description}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-hairline/60 font-mono text-[11px]">
          <div className="p-2 rounded-lg bg-bg-inset border border-hairline">
            <div className="text-ink-dim text-[10px]">Saturation Vapor Pressure</div>
            <div className="text-cryo font-bold mt-0.5">
              {tempC <= 0.01
                ? `${getIceSublimationPressureMbar(tempC).toFixed(4)} mbar`
                : `${getWaterVaporPressureMbar(tempC).toFixed(2)} mbar`}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-bg-inset border border-hairline">
            <div className="text-ink-dim text-[10px]">Enthalpy Requirement</div>
            <div className="text-amber font-bold mt-0.5">
              {phase.state === "SOLID" || phase.state === "SUBLIMING"
                ? "2,840 kJ/kg (Sublimation)"
                : phase.state === "LIQUID" || phase.state === "BOILING"
                ? "2,257 kJ/kg (Vaporization)"
                : "Superheated Vapor"}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-bg-inset border border-hairline">
            <div className="text-ink-dim text-[10px]">Lyophilization Window</div>
            <div className="mt-0.5 font-bold flex items-center gap-1">
              {phase.isFreezeDryingWindow ? (
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE (SAFE)
                </span>
              ) : (
                <span className="text-ink-dim flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Outside Envelope
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
