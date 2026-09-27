"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  getWaterPhaseState,
  WATER_CONSTANTS,
  getIceSublimationPressureMbar,
  getWaterVaporPressureMbar,
} from "@/lib/physics";
import { useTheme } from "@/components/layout/ThemeProvider";
import {
  Activity,
  ShieldCheck,
  Thermometer,
  Gauge,
  Sparkles,
  Play,
  Pause,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  Layers,
  Flame,
  Snowflake,
  Wind,
  Info,
  CheckCircle2,
  AlertTriangle,
  Maximize2,
  Minimize2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type ProcessType = "FREE" | "EVAP_HEAT" | "EVAP_VAC" | "SUBLIMATION";
export type ViewScale = "PROCESS" | "FULL";

interface LandmarkPoint {
  id: string;
  name: string;
  shortLabel: string;
  tempC: number;
  pressMbar: number;
  category: "landmark" | "polymorph" | "safety";
  color: string;
  badgePos: "top-left" | "top-right" | "bottom" | "right";
  desc: string;
  physics: string;
  relevanceToAFD: string;
}

export function PhaseDiagramExplorer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
  const [showPolymorphExplainer, setShowPolymorphExplainer] = useState<boolean>(false);

  // Full Screen State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Hover states: either arbitrary coordinate hover or landmark pin hover
  const [hoveredLandmark, setHoveredLandmark] = useState<LandmarkPoint | null>(null);
  const [hoverCoord, setHoverCoord] = useState<{
    t: number;
    p: number;
    x: number;
    y: number;
    phaseName: string;
  } | null>(null);

  const phase = getWaterPhaseState(tempC, pressMbar);

  // Fullscreen escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Scale definitions
  const isProcess = viewScale === "PROCESS";
  const minT = isProcess ? -80 : -250;
  const maxT = isProcess ? 130 : 380;
  const minLogP = isProcess ? -3 : -5; // 0.001 mbar vs 0.00001 mbar (1 Pa in full)
  const maxLogP = isProcess ? 3.4 : 5.4; // ~2500 mbar vs ~250,000 mbar (250 bar)

  // SVG Geometry - 820 x 480 high resolution coordinate space
  const svgWidth = 820;
  const svgHeight = 480;
  const margin = { top: 45, right: 80, bottom: 65, left: 85 };
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
    const scaleX = svgWidth / rect.width;
    const scaleY = svgHeight / rect.height;
    const x = Math.max(margin.left, Math.min(margin.left + plotWidth, (e.clientX - rect.left) * scaleX));
    const y = Math.max(margin.top, Math.min(margin.top + plotHeight, (e.clientY - rect.top) * scaleY));
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
    const scaleX = svgWidth / rect.width;
    const scaleY = svgHeight / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (x >= margin.left && x <= margin.left + plotWidth && y >= margin.top && y <= margin.top + plotHeight) {
      const curT = Math.round(xToT(x));
      const curP = Number(yToP(y).toFixed(4));
      const curPhase = getWaterPhaseState(curT, curP);
      setHoverCoord({
        t: curT,
        p: curP,
        x,
        y,
        phaseName: curPhase.state,
      });
      if (e.buttons === 1) {
        setTempC(curT);
        setPressMbar(curP);
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
    setHoveredLandmark(null);
  };

  // --- Master Landmark Definitions with Plain English Explanations ---
  const landmarks: LandmarkPoint[] = [
    {
      id: "triple_point",
      name: "Solid / Liquid / Vapour Triple Point",
      shortLabel: "Triple Point (0.01°C, 6.11 mbar)",
      tempC: WATER_CONSTANTS.TRIPLE_POINT_TEMP_C,
      pressMbar: WATER_CONSTANTS.TRIPLE_POINT_PRESS_MBAR,
      category: "landmark",
      color: "#f59e0b",
      badgePos: "right",
      desc: "The unique thermodynamic coordinate where ice, liquid water, and water vapor coexist in stable thermodynamic equilibrium.",
      physics: "Temperature: 273.16 K (0.01 °C) • Pressure: 611.73 Pa (6.117 mbar = 0.006 atm).",
      relevanceToAFD: "Crucial rule: Freeze-drying MUST operate strictly below 6.11 mbar. Above this pressure, ice melts to liquid water causing structural collapse!",
    },
    {
      id: "freezing_point",
      name: "Normal Freezing Point at 1 atm",
      shortLabel: "0°C (1 atm Freezing)",
      tempC: 0.0,
      pressMbar: 1013.25,
      category: "landmark",
      color: "#38bdf8",
      badgePos: "top-left",
      desc: "Standard melting and freezing point of water under sea-level atmospheric pressure.",
      physics: "Temperature: 273.15 K (0.00 °C) • Pressure: 101.325 kPa (1013.25 mbar = 1.0 atm).",
      relevanceToAFD: "Latent heat of fusion: 334 kJ/kg. The cantilevered auger gently agitates the slurry during this phase to create loose, porous snow-like granules.",
    },
    {
      id: "standard_conditions",
      name: "Standard Room Conditions (Lab Ambient)",
      shortLabel: "25°C Std Conditions",
      tempC: 25.0,
      pressMbar: 1013.25,
      category: "landmark",
      color: isDark ? "#ffffff" : "#0f172a",
      badgePos: "bottom",
      desc: "Standard laboratory charging conditions where pharmaceutical solutions and suspensions are loaded into the vessel.",
      physics: "Temperature: 298.15 K (25.0 °C) • Pressure: 101.325 kPa (1.0 atm). Liquid water density: ~1.000 g/cm³.",
      relevanceToAFD: "Starting point for batch charging. The vessel is pre-purged with sterile nitrogen before cooling begins.",
    },
    {
      id: "boiling_point",
      name: "Normal Boiling Point at 1 atm",
      shortLabel: "100°C (1 atm Boiling)",
      tempC: 100.0,
      pressMbar: 1013.25,
      category: "landmark",
      color: "#ef4444",
      badgePos: "top-right",
      desc: "Temperature where saturation vapor pressure equals atmospheric pressure, causing bulk boiling and rapid steam evaporation.",
      physics: "Temperature: 373.15 K (100.00 °C) • Pressure: 101.325 kPa (1.0 atm).",
      relevanceToAFD: "Requires Latent Heat of Vaporization: 2,257 kJ/kg. High heat causes catastrophic denaturation of proteins, enzymes, and live probiotics!",
    },
    {
      id: "critical_point",
      name: "Thermodynamic Critical Point",
      shortLabel: "Critical Point (374°C, 221 bar)",
      tempC: 373.95,
      pressMbar: 220640,
      category: "landmark",
      color: "#ec4899",
      badgePos: "top-left",
      desc: "The absolute termination of the liquid-gas boundary curve.",
      physics: "Temperature: 647.10 K (373.95 °C) • Pressure: 22.064 MPa (220.64 bar).",
      relevanceToAFD: "Beyond this point, liquid and gas merge into a single supercritical fluid with zero surface tension. Relevant to supercritical CO₂ extraction, but far above freeze-drying.",
    },
    {
      id: "ice_ih",
      name: "Ice Ih (Hexagonal Normal Ice)",
      shortLabel: "Ice Ih (Normal Ice)",
      tempC: -20.0,
      pressMbar: 2.0,
      category: "polymorph",
      color: "#38bdf8",
      badgePos: "right",
      desc: "The everyday normal ice found on Earth, snow, and standard lyophilization. Hexagonal crystal geometry with open cavities.",
      physics: "Density: 0.917 g/cm³ (lighter than liquid water, which is why ice floats!). Held by tetrahedral hydrogen bonding.",
      relevanceToAFD: "This is the ONLY ice polymorph present during freeze-drying. Its porous structure sublimes directly into low-density vapor.",
    },
    {
      id: "ice_ic",
      name: "Ice Ic (Metastable Cubic Ice)",
      shortLabel: "Ice Ic (Cubic Ice)",
      tempC: -140.0,
      pressMbar: 100.0,
      category: "polymorph",
      color: "#7dd3fc",
      badgePos: "right",
      desc: "A metastable cubic crystal form of ice formed by condensation of water vapor at cryogenic temperatures below -130 °C.",
      physics: "Similar density to Ice Ih, but crystal lattice has diamond-cubic symmetry instead of hexagonal symmetry.",
      relevanceToAFD: "Found in upper atmosphere clouds and space science; not produced in standard freeze drying skids.",
    },
    {
      id: "high_pressure_ice",
      name: "High-Pressure Ice Polymorphs (Ice II, III, V, VI, VII, X)",
      shortLabel: "High-P Ice Polymorphs",
      tempC: -40.0,
      pressMbar: 500000,
      category: "polymorph",
      color: "#a855f7",
      badgePos: "right",
      desc: "Exotic crystal arrangements of water molecules that only exist under crushing planetary pressures (2,000 to 600,000 atmospheres!).",
      physics: "Under extreme pressure, hydrogen bonds bend and the open hexagonal lattice collapses into dense, tightly packed structures that are heavier than liquid water!",
      relevanceToAFD: "Shown in Hosokawa's educational webinar to illustrate the complete physical phase space of water. Deeply relevant to planetary astrophysics (interiors of icy moons like Ganymede and Callisto), but never reached in pharmaceutical dryers.",
    },
  ];

  // --- Thermodynamic Curves Construction ---
  // Sublimation Curve: minT to 0.01°C
  const subCurvePoints: { x: number; y: number; t: number; p: number }[] = [];
  const tStepSub = isProcess ? 2 : 5;
  for (let t = minT; t <= 0.01; t += tStepSub) {
    const p = getIceSublimationPressureMbar(t);
    subCurvePoints.push({ x: tToX(t), y: pToY(p), t, p });
  }
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
  if (!isProcess && maxT >= 373.95) {
    vapCurvePoints.push({ x: tToX(373.95), y: pToY(220640), t: 373.95, p: 220640 });
  }
  const vapCurvePath = `M ${vapCurvePoints.map((pt) => `${pt.x},${pt.y}`).join(" L ")}`;

  // Melting Line: upward from triple point to high pressure
  const meltTopX = tToX(isProcess ? -0.1 : -22);
  const meltTopY = pToY(Math.pow(10, maxLogP));
  const meltPath = `M ${tpX},${tpY} L ${meltTopX},${meltTopY}`;

  // Polygon Shaded Regions
  const solidPolygon = [
    `${margin.left},${margin.top}`,
    `${meltTopX},${meltTopY}`,
    `${tpX},${tpY}`,
    ...[...subCurvePoints].reverse().map((pt) => `${pt.x},${pt.y}`),
    `${margin.left},${pToY(getIceSublimationPressureMbar(minT))}`,
    `${margin.left},${margin.top}`,
  ].join(" ");

  const liquidPolygon = [
    `${meltTopX},${meltTopY}`,
    `${tpX},${tpY}`,
    ...vapCurvePoints.map((pt) => `${pt.x},${pt.y}`),
    `${tToX(maxVapT)},${margin.top}`,
    `${meltTopX},${margin.top}`,
  ].join(" ");

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

  // Landmark Coordinates
  const normalBoilX = tToX(100);
  const normalBoilY = pToY(1013.25);
  const normalFreezeX = tToX(0);
  const normalFreezeY = pToY(1013.25);
  const stdCondX = tToX(25);
  const stdCondY = pToY(1013.25);
  const critX = tToX(373.95);
  const critY = pToY(220640);

  // --- Process Pathways Data (Derived directly from Screenshots 232233 & 232329) ---
  const processStepsData = {
    EVAP_HEAT: [
      {
        step: 1,
        title: "Starting Liquid API / Solution (Standard Conditions)",
        t: 25,
        p: 1013.25,
        desc: "Product is charged into the vessel under atmospheric pressure (1 atm = 101.3 kPa) at 25 °C.",
      },
      {
        step: 2,
        title: "Sensible Heating at Constant Atmospheric Pressure",
        t: 70,
        p: 1013.25,
        desc: "Thermal energy is transferred across the jacket. Sensible heat (Q = m·cp·ΔT) raises temperature towards boiling.",
      },
      {
        step: 3,
        title: "Atmospheric Boiling (Liquid to Vapor Evaporation)",
        t: 100,
        p: 1013.25,
        desc: "Boiling occurs at 100 °C, requiring Latent Heat of Vaporization (2,257 kJ/kg). High heat denatures proteins and active molecules!",
      },
    ],
    EVAP_VAC: [
      {
        step: 1,
        title: "Liquid at Mild Operating Temperature (40 °C)",
        t: 40,
        p: 1013.25,
        desc: "Solution is held at a safe, gentle temperature (40 °C) under atmospheric pressure.",
      },
      {
        step: 2,
        title: "Chamber Depressurization (Vacuum Draw)",
        t: 40,
        p: 200,
        desc: "Vacuum pumps pull pressure down vertically along the 40 °C isotherm.",
      },
      {
        step: 3,
        title: "Low-Temperature Vacuum Boiling (Evaporation)",
        t: 40,
        p: 73.8,
        desc: "Chamber drops below 74 mbar, crossing the boiling curve. Water evaporates vigorously at 40 °C without thermal degradation!",
      },
    ],
    SUBLIMATION: [
      {
        step: 1,
        title: "Stage 1: Cooling & Agitated Granulation",
        t: -40,
        p: 1013.25,
        desc: "TCU chills the jacket. Cantilevered auger rotates to freeze the slurry into loose snow-like granules (ΔH_fus = 334 kJ/kg).",
      },
      {
        step: 2,
        title: "Stage 2: Deep Vacuum Depressurization",
        t: -40,
        p: 0.1,
        desc: "Chamber pressure is pulled down to 0.1 mbar (10 Pa), deep below the 6.11 mbar triple point. Liquid water is physically impossible!",
      },
      {
        step: 3,
        title: "Stage 3: Sublimation Heating & Secondary Desorption",
        t: 25,
        p: 0.1,
        desc: "Jacket supplies Sublimation Enthalpy (2,840 kJ/kg). Ice converts directly to vapor without melt-back, yielding ready-to-fill loose bulk powder!",
      },
    ],
  };

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

  // Dynamic Theme Palette Values
  const canvasBg = isDark ? "#0c0d10" : "#ffffff";
  const frameBorder = isDark ? "rgba(255, 255, 255, 0.25)" : "rgba(18, 14, 11, 0.35)";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(18, 14, 11, 0.08)";
  const axisTextPrimary = isDark ? "#faf8f5" : "#120e0b";
  const axisTextMuted = isDark ? "#94a3b8" : "#4e4437";
  const badgeBg = isDark ? "#161b22" : "#ffffff";

  return (
    <div
      className={`transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-bg p-4 sm:p-8 overflow-y-auto flex flex-col justify-between"
          : "instrument-card rounded-2xl p-4 sm:p-6 my-6 border border-hairline bg-bg-panel backdrop-blur-md max-w-4xl mx-auto shadow-2xl"
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-4 border-b border-hairline gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cryo animate-pulse shadow-sm shadow-cryo" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-cryo font-bold">
              Simulator 01 • Chapter 02
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-bg-hover text-ink-primary border border-hairline font-semibold">
              Hosokawa Phase Dynamics (Webinar Spec)
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-ink-primary mt-1 tracking-tight">
            Water Phase Diagram Explorer &amp; Dynamic Process Pathways
          </h3>
          <p className="text-xs text-ink-secondary mt-0.5">
            Full Clausius–Clapeyron sublimation equilibrium, vacuum boiling suppression, and dynamic freeze-drying kinetics.
          </p>
        </div>

        {/* Live Phase State & Control Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Phase Badge */}
          <div
            className="px-3 py-1.5 rounded-xl border font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
            style={{
              borderColor: phase.color,
              backgroundColor: `${phase.color}20`,
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

          {/* Full Screen Toggle Button (User-Requested) */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition border shadow-sm ${
              isFullscreen
                ? "bg-amber text-[#0e0a02] border-amber-bright hover:bg-amber-bright"
                : "bg-bg-hover hover:bg-bg-panel border-hairline text-ink-primary"
            }`}
            title={isFullscreen ? "Exit Full Screen (Esc)" : "Expand to Full Screen"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>Exit Full Screen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>Full Screen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Process Selection Tabs (Directly from Screenshots 232233 & 232329) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => selectProcess("FREE")}
          className={`px-3 py-2.5 rounded-xl text-xs font-mono text-left transition border ${
            selectedProcess === "FREE"
              ? "bg-amber/15 border-amber text-amber font-bold shadow-sm ring-1 ring-amber/30"
              : "bg-bg-surface hover:bg-bg-hover border-hairline text-ink-secondary"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase text-ink-dim font-semibold">
            <Sparkles className="w-3 h-3 text-amber" /> Mode 01
          </div>
          <div className="font-bold text-ink-primary mt-0.5">Free Exploration</div>
        </button>

        <button
          onClick={() => selectProcess("EVAP_HEAT")}
          className={`px-3 py-2.5 rounded-xl text-xs font-mono text-left transition border ${
            selectedProcess === "EVAP_HEAT"
              ? "bg-orange-500/15 border-orange-500 text-orange-500 dark:text-orange-400 font-bold shadow-sm ring-1 ring-orange-500/30"
              : "bg-bg-surface hover:bg-bg-hover border-hairline text-ink-secondary"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase text-ink-dim font-semibold">
            <Flame className="w-3 h-3 text-orange-500" /> Mode 02
          </div>
          <div className="font-bold text-ink-primary mt-0.5">Atmos. Evaporation</div>
        </button>

        <button
          onClick={() => selectProcess("EVAP_VAC")}
          className={`px-3 py-2.5 rounded-xl text-xs font-mono text-left transition border ${
            selectedProcess === "EVAP_VAC"
              ? "bg-sky-500/15 border-sky-500 text-sky-600 dark:text-sky-400 font-bold shadow-sm ring-1 ring-sky-500/30"
              : "bg-bg-surface hover:bg-bg-hover border-hairline text-ink-secondary"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase text-ink-dim font-semibold">
            <Wind className="w-3 h-3 text-sky-500" /> Mode 03
          </div>
          <div className="font-bold text-ink-primary mt-0.5">Vacuum Drying</div>
        </button>

        <button
          onClick={() => selectProcess("SUBLIMATION")}
          className={`px-3 py-2.5 rounded-xl text-xs font-mono text-left transition border ${
            selectedProcess === "SUBLIMATION"
              ? "bg-cryo/20 border-cryo text-cryo font-bold shadow-sm ring-1 ring-cryo/40"
              : "bg-bg-surface hover:bg-bg-hover border-hairline text-ink-secondary"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase text-ink-dim font-semibold">
            <Snowflake className="w-3 h-3 text-cryo" /> Mode 04 (AFD)
          </div>
          <div className="font-bold text-ink-primary mt-0.5">Freeze Drying</div>
        </button>
      </div>

      {/* Main Interactive SVG Canvas (Theme-Adaptive Container) */}
      <div
        className={`relative rounded-2xl border-2 border-hairline p-3 overflow-hidden select-none shadow-xl transition-all ${
          isFullscreen ? "flex-1 min-h-[500px] flex items-center justify-center" : ""
        }`}
        style={{ backgroundColor: canvasBg }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[560px] cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          suppressHydrationWarning
        >
          <defs>
            {/* Theme-Adaptive Region Fills */}
            <linearGradient id="solidRegionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity={isDark ? 0.38 : 0.20} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={isDark ? 0.18 : 0.07} />
            </linearGradient>

            <linearGradient id="liquidRegionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#16a34a" stopOpacity={isDark ? 0.36 : 0.20} />
              <stop offset="100%" stopColor="#4ade80" stopOpacity={isDark ? 0.16 : 0.07} />
            </linearGradient>

            <linearGradient id="vaporRegionGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d97706" stopOpacity={isDark ? 0.35 : 0.18} />
              <stop offset="100%" stopColor="#fde047" stopOpacity={isDark ? 0.15 : 0.05} />
            </linearGradient>

            {/* Fine graph grid pattern */}
            <pattern id="fineGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke={gridColor} strokeWidth="0.8" />
            </pattern>

            {/* Hatch pattern for AFD operating envelope */}
            <pattern id="fdHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="var(--amber)" strokeWidth="1.5" strokeOpacity="0.4" />
            </pattern>

            {/* Arrow markers */}
            <marker id="arrowHead" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 z" fill="var(--amber)" />
            </marker>
            <marker id="arrowHeadPrimary" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto">
              <path d="M 0 1 L 7 4 L 0 7 z" fill={axisTextPrimary} />
            </marker>
          </defs>

          {/* Background Graph Paper */}
          <rect x={margin.left} y={margin.top} width={plotWidth} height={plotHeight} fill="url(#fineGrid)" />

          {/* Region Shaded Fills */}
          {showRegions && (
            <g className="transition-opacity duration-300">
              <polygon points={solidPolygon} fill="url(#solidRegionGrad)" />
              <polygon points={liquidPolygon} fill="url(#liquidRegionGrad)" />
              <polygon points={vaporPolygon} fill="url(#vaporRegionGrad)" />
            </g>
          )}

          {/* Grid Lines */}
          {(isProcess ? [-60, -40, -20, 0, 20, 40, 60, 80, 100, 120] : [-250, -200, -150, -100, -50, 0, 50, 100, 150, 200, 250, 300, 350]).map(
            (t) => (
              <line
                key={`grid-x-${t}`}
                x1={tToX(t)}
                y1={margin.top}
                x2={tToX(t)}
                y2={margin.top + plotHeight}
                stroke={t === 0 || t === 100 ? (isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)") : gridColor}
                strokeWidth={t === 0 || t === 100 ? "1.5" : "1"}
                strokeDasharray={t === 0 || t === 100 ? "none" : "2 3"}
              />
            )
          )}
          {(isProcess ? [-2, -1, 0, 1, 2, 3] : [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5]).map((logP) => {
            const p = Math.pow(10, logP);
            return (
              <line
                key={`grid-y-${logP}`}
                x1={margin.left}
                y1={pToY(p)}
                x2={margin.left + plotWidth}
                y2={pToY(p)}
                stroke={gridColor}
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
              <g transform={`translate(${fdBoxX1 + 8}, ${fdBoxY1 + 18})`}>
                <rect
                  x="-3"
                  y="-12"
                  width="134"
                  height="18"
                  rx="4"
                  fill={badgeBg}
                  stroke="var(--amber)"
                  strokeWidth="1.2"
                />
                <text x="3" y="1" fill="var(--amber)" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                  ★ AFD OPERATING ZONE
                </text>
              </g>
            </g>
          )}

          {/* Phase Boundary Curves */}
          {/* Sublimation Line */}
          <path d={subCurvePath} fill="none" stroke={isDark ? "#38bdf8" : "#0284c7"} strokeWidth="3" />

          {/* Vaporization Line */}
          <path d={vapCurvePath} fill="none" stroke={isDark ? "#4ade80" : "#16a34a"} strokeWidth="3" />

          {/* Solid-Liquid Melting Line */}
          <path d={meltPath} fill="none" stroke={isDark ? "#c084fc" : "#7c3aed"} strokeWidth="2.5" strokeDasharray="4 3" />

          {/* Region Subtle Watermarks inside Canvas */}
          {showRegions && (
            <g opacity={isDark ? 0.8 : 0.7} pointerEvents="none">
              <text
                x={tToX(isProcess ? -50 : -140)}
                y={pToY(isProcess ? 20 : 1000)}
                fill={isDark ? "#38bdf8" : "#0369a1"}
                fontSize="14"
                fontFamily="monospace"
                fontWeight="900"
                letterSpacing="1"
              >
                SOLID (ICE)
              </text>
              <text
                x={tToX(isProcess ? 55 : 120)}
                y={pToY(isProcess ? 300 : 5000)}
                fill={isDark ? "#4ade80" : "#15803d"}
                fontSize="14"
                fontFamily="monospace"
                fontWeight="900"
                letterSpacing="1"
              >
                LIQUID WATER
              </text>
              <text
                x={tToX(isProcess ? 65 : 160)}
                y={pToY(isProcess ? 0.05 : 0.005)}
                fill={isDark ? "#fbbf24" : "#b45309"}
                fontSize="14"
                fontFamily="monospace"
                fontWeight="900"
                letterSpacing="1"
              >
                VAPOUR (GAS)
              </text>
            </g>
          )}

          {/* DYNAMIC LANDMARK PINS (Hover-Driven: ZERO TEXT OVERLAP EVER) */}
          {showKeyMarkers && selectedProcess === "FREE" && (
            <g>
              {landmarks
                .filter((lm) => {
                  if (isProcess) {
                    return lm.tempC >= minT && lm.tempC <= maxT && lm.pressMbar >= Math.pow(10, minLogP) && lm.pressMbar <= Math.pow(10, maxLogP);
                  }
                  return true;
                })
                .map((lm) => {
                  const px = tToX(lm.tempC);
                  const py = pToY(lm.pressMbar);
                  const isHovered = hoveredLandmark?.id === lm.id;

                  return (
                    <g
                      key={lm.id}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredLandmark(lm)}
                      onClick={() => {
                        setTempC(lm.tempC);
                        setPressMbar(lm.pressMbar);
                      }}
                    >
                      {/* Pulse ring on hover */}
                      {isHovered && (
                        <circle cx={px} cy={py} r="14" fill="none" stroke={lm.color} strokeWidth="2" className="animate-ping" />
                      )}

                      {/* Drop-line to axes for 1 atm landmarks */}
                      {lm.pressMbar === 1013.25 && (
                        <line
                          x1={px}
                          y1={py}
                          x2={px}
                          y2={margin.top + plotHeight}
                          stroke={lm.color}
                          strokeWidth="1.2"
                          strokeDasharray="2 2"
                          opacity={isHovered ? 0.9 : 0.4}
                        />
                      )}

                      {/* Main Landmark Pin */}
                      <circle
                        cx={px}
                        cy={py}
                        r={isHovered ? 8 : lm.id === "triple_point" ? 7 : 5.5}
                        fill={lm.color}
                        stroke={badgeBg}
                        strokeWidth={isHovered ? 3 : 2}
                        style={{ filter: isHovered ? `drop-shadow(0 0 8px ${lm.color})` : "none" }}
                      />

                      {/* Discrete Small Pin Tag (Non-overlapping minimal label) */}
                      <text
                        x={px}
                        y={lm.badgePos === "bottom" ? py + 14 : py - 10}
                        fill={lm.color}
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="transition-opacity"
                        opacity={isHovered ? 1 : 0.85}
                      >
                        {lm.shortLabel}
                      </text>
                    </g>
                  );
                })}
            </g>
          )}

          {/* --- PROCESS PATHWAYS (Screenshots 232233 & 232329) --- */}
          {/* Mode 02: Atmospheric Evaporation via Heating (Screenshot 232233) */}
          {selectedProcess === "EVAP_HEAT" && isProcess && (
            <g className="transition-all">
              <line
                x1={stdCondX}
                y1={stdCondY}
                x2={tToX(112)}
                y2={stdCondY}
                stroke={axisTextPrimary}
                strokeWidth="4.5"
                strokeDasharray="6 3"
                markerEnd="url(#arrowHeadPrimary)"
              />
              <circle cx={stdCondX} cy={stdCondY} r="7" fill={axisTextPrimary} stroke={badgeBg} strokeWidth="2" />
              <circle cx={normalBoilX} cy={normalBoilY} r="7" fill="#ef4444" stroke={badgeBg} strokeWidth="2" />

              <g transform={`translate(${tToX(42)}, ${stdCondY - 34})`}>
                <rect
                  x="-6"
                  y="-16"
                  width="135"
                  height="30"
                  rx="6"
                  fill={badgeBg}
                  stroke={axisTextPrimary}
                  strokeWidth="2"
                  filter="drop-shadow(0 4px 8px rgba(0,0,0,0.25))"
                />
                <text x="12" y="5" fill={axisTextPrimary} fontSize="16" fontFamily="Arial, sans-serif" fontWeight="900">
                  Heating →
                </text>
              </g>
            </g>
          )}

          {/* Mode 03: Vacuum Evaporation via Pressure Decrease (Screenshot 232233) */}
          {selectedProcess === "EVAP_VAC" && isProcess && (
            <g className="transition-all">
              <line
                x1={tToX(40)}
                y1={pToY(1013.25)}
                x2={tToX(40)}
                y2={pToY(20)}
                stroke={axisTextPrimary}
                strokeWidth="4.5"
                strokeDasharray="6 3"
                markerEnd="url(#arrowHeadPrimary)"
              />
              <circle cx={tToX(40)} cy={pToY(1013.25)} r="7" fill="#0284c7" stroke={badgeBg} strokeWidth="2" />
              <circle cx={tToX(40)} cy={pToY(73.8)} r="7" fill="#16a34a" stroke={badgeBg} strokeWidth="2" />

              <g transform={`translate(${tToX(40) + 16}, ${pToY(300)})`}>
                <rect
                  x="-6"
                  y="-16"
                  width="170"
                  height="50"
                  rx="6"
                  fill={badgeBg}
                  stroke={axisTextPrimary}
                  strokeWidth="2"
                  filter="drop-shadow(0 4px 8px rgba(0,0,0,0.25))"
                />
                <text x="8" y="4" fill={axisTextPrimary} fontSize="15" fontFamily="Arial, sans-serif" fontWeight="900">
                  Decrease
                </text>
                <text x="8" y="24" fill={axisTextPrimary} fontSize="15" fontFamily="Arial, sans-serif" fontWeight="900">
                  Pressure ↓
                </text>
              </g>
            </g>
          )}

          {/* Mode 04: Liquid to Solid to Vapor Sublimation (Screenshot 232329) */}
          {selectedProcess === "SUBLIMATION" && isProcess && (
            <g className="transition-all">
              <line
                x1={stdCondX}
                y1={stdCondY}
                x2={tToX(-40)}
                y2={stdCondY}
                stroke={axisTextPrimary}
                strokeWidth="4"
                strokeDasharray="6 3"
                markerEnd="url(#arrowHeadPrimary)"
              />
              <line
                x1={tToX(-40)}
                y1={stdCondY}
                x2={tToX(-40)}
                y2={pToY(0.1)}
                stroke={axisTextPrimary}
                strokeWidth="4"
                strokeDasharray="6 3"
                markerEnd="url(#arrowHeadPrimary)"
              />
              <line
                x1={tToX(-40)}
                y1={pToY(0.1)}
                x2={tToX(25)}
                y2={pToY(0.1)}
                stroke={axisTextPrimary}
                strokeWidth="4"
                strokeDasharray="6 3"
                markerEnd="url(#arrowHeadPrimary)"
              />

              <circle cx={stdCondX} cy={stdCondY} r="6.5" fill={axisTextPrimary} stroke={badgeBg} strokeWidth="2" />
              <circle cx={tToX(-40)} cy={stdCondY} r="6.5" fill="#0284c7" stroke={badgeBg} strokeWidth="2" />
              <circle cx={tToX(-40)} cy={pToY(0.1)} r="6.5" fill="var(--amber)" stroke={badgeBg} strokeWidth="2" />
              <circle cx={tToX(25)} cy={pToY(0.1)} r="6.5" fill="#16a34a" stroke={badgeBg} strokeWidth="2" />

              <g transform={`translate(${tToX(-22)}, ${stdCondY - 34})`}>
                <rect
                  x="-6"
                  y="-16"
                  width="125"
                  height="30"
                  rx="6"
                  fill={badgeBg}
                  stroke={axisTextPrimary}
                  strokeWidth="2"
                  filter="drop-shadow(0 4px 8px rgba(0,0,0,0.25))"
                />
                <text x="8" y="5" fill={axisTextPrimary} fontSize="15" fontFamily="Arial, sans-serif" fontWeight="900">
                  ← Cooling
                </text>
              </g>

              <g transform={`translate(${tToX(-40) - 185}, ${pToY(20)})`}>
                <rect
                  x="-6"
                  y="-16"
                  width="170"
                  height="50"
                  rx="6"
                  fill={badgeBg}
                  stroke={axisTextPrimary}
                  strokeWidth="2"
                  filter="drop-shadow(0 4px 8px rgba(0,0,0,0.25))"
                />
                <text x="8" y="4" fill={axisTextPrimary} fontSize="15" fontFamily="Arial, sans-serif" fontWeight="900">
                  Decrease
                </text>
                <text x="8" y="24" fill={axisTextPrimary} fontSize="15" fontFamily="Arial, sans-serif" fontWeight="900">
                  Pressure ↓
                </text>
              </g>

              <g transform={`translate(${tToX(-15)}, ${pToY(0.1) + 24})`}>
                <rect
                  x="-6"
                  y="-16"
                  width="130"
                  height="30"
                  rx="6"
                  fill={badgeBg}
                  stroke={axisTextPrimary}
                  strokeWidth="2"
                  filter="drop-shadow(0 4px 8px rgba(0,0,0,0.25))"
                />
                <text x="10" y="5" fill={axisTextPrimary} fontSize="15" fontFamily="Arial, sans-serif" fontWeight="900">
                  Heating →
                </text>
              </g>
            </g>
          )}

          {/* Current Dynamic Operating Point */}
          <g pointerEvents="none">
            <circle
              cx={tToX(tempC)}
              cy={pToY(pressMbar)}
              r="8.5"
              fill={phase.color}
              stroke={badgeBg}
              strokeWidth="2.5"
              className="animate-pulse"
              style={{ filter: `drop-shadow(0 0 8px ${phase.color})` }}
            />
            <circle
              cx={tToX(tempC)}
              cy={pToY(pressMbar)}
              r="17"
              fill="none"
              stroke={phase.color}
              strokeWidth="1.8"
              strokeDasharray="4 2"
              opacity="0.9"
            />
          </g>

          {/* Interactive Hover Crosshair */}
          {hoverCoord && !hoveredLandmark && (
            <g pointerEvents="none">
              <line
                x1={hoverCoord.x}
                y1={margin.top}
                x2={hoverCoord.x}
                y2={margin.top + plotHeight}
                stroke={axisTextPrimary}
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.5"
              />
              <line
                x1={margin.left}
                y1={hoverCoord.y}
                x2={margin.left + plotWidth}
                y2={hoverCoord.y}
                stroke={axisTextPrimary}
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.5"
              />
              <circle cx={hoverCoord.x} cy={hoverCoord.y} r="4.5" fill={axisTextPrimary} />
            </g>
          )}

          {/* Outer Frame */}
          <rect
            x={margin.left}
            y={margin.top}
            width={plotWidth}
            height={plotHeight}
            fill="none"
            stroke={frameBorder}
            strokeWidth="2"
          />

          {/* Top X-Axis Ticks & Labels: Kelvin */}
          {(isProcess ? [-60, -40, -20, 0, 20, 40, 60, 80, 100, 120] : [-250, -200, -150, -100, -50, 0, 50, 100, 150, 200, 250, 300, 350]).map((t) => (
            <g key={`top-tick-x-${t}`}>
              <line
                x1={tToX(t)}
                y1={margin.top}
                x2={tToX(t)}
                y2={margin.top - 5}
                stroke={frameBorder}
                strokeWidth="1.5"
              />
              <text
                x={tToX(t)}
                y={margin.top - 10}
                fill={axisTextMuted}
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {(t + 273.15).toFixed(0)} K
              </text>
            </g>
          ))}

          {/* Bottom X-Axis Ticks & Labels: Celsius */}
          {(isProcess ? [-60, -40, -20, 0, 20, 40, 60, 80, 100, 120] : [-250, -200, -150, -100, -50, 0, 50, 100, 150, 200, 250, 300, 350]).map((t) => (
            <g key={`bot-tick-x-${t}`}>
              <line
                x1={tToX(t)}
                y1={margin.top + plotHeight}
                x2={tToX(t)}
                y2={margin.top + plotHeight + 6}
                stroke={frameBorder}
                strokeWidth="1.5"
              />
              <text
                x={tToX(t)}
                y={margin.top + plotHeight + 20}
                fill={axisTextPrimary}
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {t}°C
              </text>
            </g>
          ))}

          {/* Left Y-Axis Ticks & Labels: Pascals */}
          {(isProcess ? [-3, -2, -1, 0, 1, 2, 3] : [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]).map((logP) => {
            const pMbar = Math.pow(10, logP);
            const pa = pMbar * 100;
            let paLabel = `${pa} Pa`;
            if (pa >= 1e9) paLabel = `${pa / 1e9} GPa`;
            else if (pa >= 1e6) paLabel = `${pa / 1e6} MPa`;
            else if (pa >= 1e3) paLabel = `${pa / 1e3} kPa`;

            return (
              <g key={`left-tick-y-${logP}`}>
                <line
                  x1={margin.left - 6}
                  y1={pToY(pMbar)}
                  x2={margin.left}
                  y2={pToY(pMbar)}
                  stroke={frameBorder}
                  strokeWidth="1.5"
                />
                <text
                  x={margin.left - 10}
                  y={pToY(pMbar) + 4}
                  fill={axisTextPrimary}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  {paLabel}
                </text>
              </g>
            );
          })}

          {/* Right Y-Axis Ticks & Labels: Bar / mbar */}
          {(isProcess ? [-3, -2, -1, 0, 1, 2, 3] : [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]).map((logP) => {
            const pMbar = Math.pow(10, logP);
            let barLabel = `${pMbar} mbar`;
            if (pMbar >= 1000) barLabel = `${pMbar / 1000} bar`;
            else if (pMbar < 0.1) barLabel = `${(pMbar * 1000).toFixed(0)} μbar`;

            return (
              <g key={`right-tick-y-${logP}`}>
                <line
                  x1={margin.left + plotWidth}
                  y1={pToY(pMbar)}
                  x2={margin.left + plotWidth + 6}
                  y2={pToY(pMbar)}
                  stroke={frameBorder}
                  strokeWidth="1.5"
                />
                <text
                  x={margin.left + plotWidth + 10}
                  y={pToY(pMbar) + 4}
                  fill={axisTextMuted}
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="start"
                >
                  {barLabel}
                </text>
              </g>
            );
          })}

          {/* Axis Header Titles */}
          <text
            x={margin.left + plotWidth / 2}
            y={margin.top - 24}
            fill={axisTextMuted}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            TEMPERATURE (KELVIN)
          </text>
          <text
            x={margin.left + plotWidth / 2}
            y={margin.top + plotHeight + 42}
            fill={axisTextPrimary}
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            TEMPERATURE (CELSIUS)
          </text>
          <text
            transform={`rotate(-90) translate(${-(margin.top + plotHeight / 2)}, 22)`}
            fill={axisTextPrimary}
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            PRESSURE (PASCAL)
          </text>
          <text
            transform={`rotate(90) translate(${margin.top + plotHeight / 2}, ${-(svgWidth - 22)})`}
            fill={axisTextMuted}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            PRESSURE (BAR / MBAR)
          </text>
        </svg>

        {/* Live Hover Tooltip Card (Appears on Hover: Never Overlaps Chart Data) */}
        {hoveredLandmark && (
          <div
            className="absolute top-4 left-4 max-w-sm p-3.5 rounded-xl border border-hairline shadow-2xl text-xs font-mono backdrop-blur-md z-30 transition-all"
            style={{ backgroundColor: badgeBg, color: axisTextPrimary }}
          >
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-hairline">
              <span className="font-extrabold text-sm" style={{ color: hoveredLandmark.color }}>
                {hoveredLandmark.name}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-bg-inset text-ink-muted uppercase">
                {hoveredLandmark.category}
              </span>
            </div>
            <p className="text-[11px] text-ink-secondary mb-1.5 leading-snug">
              {hoveredLandmark.desc}
            </p>
            <div className="text-[10px] font-semibold text-cryo mb-1">
              {hoveredLandmark.physics}
            </div>
            <div className="text-[10px] text-amber font-medium">
              💡 {hoveredLandmark.relevanceToAFD}
            </div>
          </div>
        )}

        {/* Dynamic Coordinate Probe Card */}
        {hoverCoord && !hoveredLandmark && (
          <div
            className="absolute bottom-3 left-4 px-4 py-2 rounded-xl border border-hairline shadow-lg text-xs font-mono flex flex-wrap items-center gap-3 backdrop-blur-md pointer-events-none z-20"
            style={{ backgroundColor: badgeBg, color: axisTextPrimary }}
          >
            <div>
              <span className="text-ink-muted">Temp:</span>{" "}
              <strong className="text-cryo font-bold">{hoverCoord.t} °C</strong>{" "}
              <span className="text-ink-dim">({(hoverCoord.t + 273.15).toFixed(1)} K)</span>
            </div>
            <div className="h-3.5 w-px bg-hairline" />
            <div>
              <span className="text-ink-muted">Pressure:</span>{" "}
              <strong className="text-amber font-bold">
                {hoverCoord.p < 0.1 ? hoverCoord.p.toFixed(3) : hoverCoord.p.toFixed(1)} mbar
              </strong>{" "}
              <span className="text-ink-dim">({(hoverCoord.p * 100).toFixed(0)} Pa)</span>
            </div>
            <div className="h-3.5 w-px bg-hairline" />
            <div>
              <span className="text-ink-muted">Phase:</span>{" "}
              <span className="font-bold px-2 py-0.5 rounded bg-bg-hover text-ink-primary">
                {hoverCoord.phaseName}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Educational Guide: What is an Ice Polymorph? (Deciphering Roman Numerals) */}
      <div className="mt-4 rounded-xl border border-hairline bg-bg-surface overflow-hidden transition-all shadow-sm">
        <button
          onClick={() => setShowPolymorphExplainer(!showPolymorphExplainer)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-bg-hover transition"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cryo" />
            <span className="text-xs font-extrabold text-ink-primary">
              What are Ice Polymorphs? Deciphering the Roman Numerals (Ice Ih, Ic, II, III...)
            </span>
          </div>
          {showPolymorphExplainer ? (
            <ChevronUp className="w-4 h-4 text-ink-dim" />
          ) : (
            <ChevronDown className="w-4 h-4 text-ink-dim" />
          )}
        </button>

        {showPolymorphExplainer && (
          <div className="px-4 pb-4 pt-1 text-xs text-ink-secondary space-y-2.5 border-t border-hairline/60">
            <p className="leading-relaxed">
              <strong className="text-ink-primary">Polymorphism in Water:</strong> Water does not freeze into just one kind of solid. Depending on temperature and pressure, water molecules (H₂O) assemble into at least <strong className="text-cryo">19 different crystalline structures (polymorphs)</strong>, designated by Roman numerals (Ice I through Ice XIX):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 font-mono text-[11px]">
              <div className="p-3 rounded-lg bg-bg-panel border border-hairline">
                <div className="text-cryo font-bold text-xs flex items-center gap-1.5">
                  <Snowflake className="w-3.5 h-3.5" /> Ice Ih (Hexagonal)
                </div>
                <div className="text-ink-secondary mt-1 text-[11px] leading-snug">
                  Everyday normal ice on Earth at atmospheric pressure. The water molecules form an open hexagonal honeycomb held by hydrogen bonds. Because of these open pockets, <strong className="text-ink-primary">Ice Ih is less dense than water (0.917 g/cm³)</strong>, which is why ice cubes float!
                </div>
                <div className="mt-2 text-[10px] text-amber font-semibold">
                  ★ The ONLY ice phase in freeze-drying.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-bg-panel border border-hairline">
                <div className="text-sky-400 font-bold text-xs flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Ice Ic (Cubic Ice)
                </div>
                <div className="text-ink-secondary mt-1 text-[11px] leading-snug">
                  A metastable cubic crystal form created when water vapor condenses at deep cryogenic temperatures (below -130 °C). Found in high-altitude clouds and space ice.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-bg-panel border border-hairline">
                <div className="text-purple-400 font-bold text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Ice II, III, V, VI, VII, X
                </div>
                <div className="text-ink-secondary mt-1 text-[11px] leading-snug">
                  High-pressure exotic ice phases that only exist under extreme planetary pressures (&gt; 2,000 to 600,000 atmospheres). Under this pressure, the open honeycomb collapses into dense crystals that <strong className="text-ink-primary">sink in water</strong>! Found deep inside icy moons like Ganymede and Neptune.
                </div>
              </div>
            </div>

            <p className="text-[11px] text-ink-dim pt-1 italic">
              <strong>Why Hosokawa included them:</strong> Hosokawa displayed the full-scale diagram in their webinar to demonstrate that the <span className="text-amber font-semibold">AFD Freeze-Drying Operating Envelope (0.05 to 1.5 mbar, -55°C to -10°C)</span> occupies a tiny, highly-controlled thermodynamic niche strictly inside the <span className="text-cryo font-semibold">Ice Ih</span> sublimation region beneath the triple point!
            </p>
          </div>
        )}
      </div>

      {/* Process Step Scrubber (When a process pathway is active) */}
      {selectedProcess !== "FREE" && (
        <div className="mt-4 p-4 rounded-xl bg-bg-surface border border-hairline transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber text-[#0e0a02] shadow-sm">
                Step {processStep + 1} of {processStepsData[selectedProcess].length}
              </span>
              <h4 className="text-sm font-extrabold text-ink-primary">
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
                className="px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-bg-hover hover:bg-bg-panel border border-hairline text-ink-primary transition"
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
                className="px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-bg-hover hover:bg-bg-panel border border-hairline text-ink-primary transition"
              >
                Next
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-lg bg-amber text-[#0e0a02] font-bold text-xs hover:bg-amber-bright transition shadow-sm"
                title={isPlaying ? "Pause cycle" : "Auto-play cycle"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <p className="text-xs text-ink-secondary leading-relaxed font-medium">
            {processStepsData[selectedProcess][processStep].desc}
          </p>
        </div>
      )}

      {/* Manual Precision Sliders & Dual Readout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-hairline">
        <div className="bg-bg-surface p-4 rounded-xl border border-hairline shadow-sm">
          <div className="flex justify-between items-center text-xs mb-2.5">
            <span className="text-ink-secondary flex items-center gap-1.5 font-bold">
              <Thermometer className="w-4 h-4 text-cryo" /> Temperature (°C / K)
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="font-extrabold text-ink-primary text-sm">{tempC}°C</span>
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

        <div className="bg-bg-surface p-4 rounded-xl border border-hairline shadow-sm">
          <div className="flex justify-between items-center text-xs mb-2.5">
            <span className="text-ink-secondary flex items-center gap-1.5 font-bold">
              <Gauge className="w-4 h-4 text-amber" /> Chamber Pressure
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="font-extrabold text-ink-primary text-sm">
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
      <div className="mt-4 p-4 rounded-xl bg-bg-surface border border-hairline text-xs text-ink-secondary space-y-2.5 shadow-sm">
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-ink-primary">Thermodynamic State Analysis: </span>
            <span className="font-medium text-ink-secondary">{phase.description}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2.5 border-t border-hairline font-mono text-[11px]">
          <div className="p-2.5 rounded-lg bg-bg-inset border border-hairline shadow-inner">
            <div className="text-ink-dim text-[10px] font-bold">Saturation Vapor Pressure</div>
            <div className="text-cryo font-extrabold text-xs mt-0.5">
              {tempC <= 0.01
                ? `${getIceSublimationPressureMbar(tempC).toFixed(4)} mbar`
                : `${getWaterVaporPressureMbar(tempC).toFixed(2)} mbar`}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-bg-inset border border-hairline shadow-inner">
            <div className="text-ink-dim text-[10px] font-bold">Enthalpy Requirement</div>
            <div className="text-amber font-extrabold text-xs mt-0.5">
              {phase.state === "SOLID" || phase.state === "SUBLIMING"
                ? "2,840 kJ/kg (Sublimation)"
                : phase.state === "LIQUID" || phase.state === "BOILING"
                ? "2,257 kJ/kg (Vaporization)"
                : "Superheated Vapor"}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-bg-inset border border-hairline shadow-inner">
            <div className="text-ink-dim text-[10px] font-bold">AFD Lyophilization Window</div>
            <div className="mt-0.5 font-extrabold text-xs flex items-center gap-1">
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
