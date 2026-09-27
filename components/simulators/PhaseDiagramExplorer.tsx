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
  Thermometer,
  Gauge,
  Sparkles,
  Play,
  Pause,
  Layers,
  Flame,
  Snowflake,
  Wind,
  Info,
  CheckCircle2,
  Maximize2,
  Minimize2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
  Sliders,
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
  colorLight: string;
  colorDark: string;
  desc: string;
  physics: string;
  relevanceToAFD: string;
}

/**
 * Dynamic physical pressure formatter:
 * Automatically scales units across 11 orders of magnitude so it never
 * displays meaningless "0.000 mbar" or "0 Pa" under deep vacuum!
 */
export function formatPressureDynamic(pMbar: number): { primary: string; secondary: string } {
  if (pMbar <= 0) {
    return { primary: "0.00 mbar", secondary: "0 Pa" };
  }

  // Mega-Bar / Giga-Pascal range (>= 1,000,000 mbar = 1,000 bar)
  if (pMbar >= 1000000) {
    const kbar = pMbar / 1000000;
    const mpa = pMbar * 0.1;
    return {
      primary: `${kbar.toFixed(2)} kbar`,
      secondary: mpa >= 1000 ? `${(mpa / 1000).toFixed(2)} GPa` : `${mpa.toFixed(0)} MPa`,
    };
  }

  // Bar range (>= 1,000 mbar)
  if (pMbar >= 1000) {
    const bar = pMbar / 1000;
    const pa = pMbar * 100;
    let paStr = `${(pa / 1e5).toFixed(2)} bar`;
    if (pa >= 1e6) paStr = `${(pa / 1e6).toFixed(2)} MPa`;
    else if (pa >= 1e3) paStr = `${(pa / 1e3).toFixed(1)} kPa`;
    return {
      primary: bar >= 100 ? `${bar.toFixed(1)} bar` : `${bar.toFixed(2)} bar`,
      secondary: paStr,
    };
  }

  // Standard mbar range (1 mbar to 999.9 mbar)
  if (pMbar >= 1) {
    const pa = pMbar * 100;
    const paStr = pa >= 1000 ? `${(pa / 1000).toFixed(2)} kPa` : `${pa.toFixed(0)} Pa`;
    return {
      primary: `${pMbar < 10 ? pMbar.toFixed(2) : pMbar.toFixed(1)} mbar`,
      secondary: paStr,
    };
  }

  // Lyophilization operating window (0.01 mbar to 0.999 mbar)
  if (pMbar >= 0.01) {
    const pa = pMbar * 100;
    return {
      primary: `${pMbar.toFixed(3)} mbar`,
      secondary: `${pa.toFixed(1)} Pa (${(pMbar * 1000).toFixed(0)} μbar)`,
    };
  }

  // Deep Vacuum (0.0001 mbar to 0.00999 mbar) -> Convert to microbars (μbar) & millipascals (mPa)
  const microbar = pMbar * 1000;
  const pa = pMbar * 100;

  if (microbar >= 0.1) {
    return {
      primary: `${microbar.toFixed(2)} μbar`,
      secondary: `${(pa * 1000).toFixed(0)} mPa (${pMbar.toFixed(4)} mbar)`,
    };
  }

  // Ultra-deep vacuum (0.001 μbar to 0.099 μbar)
  if (microbar >= 0.001) {
    return {
      primary: `${microbar.toFixed(3)} μbar`,
      secondary: `${(pa * 1000).toFixed(1)} mPa`,
    };
  }

  // Absolute deep limit: Scientific notation
  return {
    primary: `${pMbar.toExponential(2)} mbar`,
    secondary: `${pa.toExponential(2)} Pa`,
  };
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
  const [showSlidersDrawer, setShowSlidersDrawer] = useState<boolean>(false);

  // Full Screen State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Interactive Landmark Selection & Hover States
  const [hoveredLandmark, setHoveredLandmark] = useState<LandmarkPoint | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<LandmarkPoint | null>(null);

  // Active landmark is either the click-locked one or currently hovered one
  const activeLandmark = selectedLandmark || hoveredLandmark;

  // Hover cursor state on arbitrary coordinates
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
      if (e.key === "Escape") {
        if (selectedLandmark) {
          setSelectedLandmark(null);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, selectedLandmark]);

  // Scale definitions with extended ranges:
  // Full Scale now extends from Absolute Zero (-273.15 °C = 0 K) to +400 °C (673.15 K)
  // and from 0.003 μbar (0.3 mPa) up to 3,162 bar (316 MPa)!
  const isProcess = viewScale === "PROCESS";
  const minT = isProcess ? -85 : -273.15; // Extends to true Absolute Zero (0 Kelvin!)
  const maxT = isProcess ? 140 : 400;     // Extends to 400 °C (673.15 K)
  const minLogP = isProcess ? -3.2 : -5.5; // 0.0006 mbar vs 0.000003 mbar (0.3 mPa)
  const maxLogP = isProcess ? 3.5 : 6.5;   // 3,162 mbar (3.16 bar) vs 3,162,277 mbar (3,162 bar / 316 MPa)

  // SVG Geometry - 920 x 520 high resolution coordinate space with generous margins
  const svgWidth = 920;
  const svgHeight = 520;
  const margin = { top: 55, right: 95, bottom: 70, left: 100 };
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

  // Background Pointer interaction
  const handleCanvasPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setSelectedLandmark(null);

    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = svgWidth / rect.width;
    const scaleY = svgHeight / rect.height;
    const x = Math.max(margin.left, Math.min(margin.left + plotWidth, (e.clientX - rect.left) * scaleX));
    const y = Math.max(margin.top, Math.min(margin.top + plotHeight, (e.clientY - rect.top) * scaleY));
    const newT = Math.round(xToT(x));
    const newP = Number(yToP(y).toFixed(5));
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
      const curP = Number(yToP(y).toFixed(5));
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

  // --- Master Landmark Definitions with High Contrast Palette ---
  const landmarks: LandmarkPoint[] = [
    {
      id: "triple_point",
      name: "Solid / Liquid / Vapour Triple Point",
      shortLabel: "Triple Point (0.01°C, 6.11 mbar)",
      tempC: WATER_CONSTANTS.TRIPLE_POINT_TEMP_C,
      pressMbar: WATER_CONSTANTS.TRIPLE_POINT_PRESS_MBAR,
      category: "landmark",
      colorLight: "#b45309",
      colorDark: "#fbbf24",
      desc: "The unique thermodynamic coordinate where ice, liquid water, and water vapor coexist in stable thermodynamic equilibrium.",
      physics: "Temperature: 273.16 K (0.01 °C) • Pressure: 611.73 Pa (6.117 mbar = 0.006 atm).",
      relevanceToAFD: "Crucial boundary: Freeze-drying MUST operate strictly below 6.11 mbar. Above this pressure, ice melts to liquid water, causing product collapse!",
    },
    {
      id: "freezing_point",
      name: "Normal Freezing Point at 1 atm",
      shortLabel: "0°C (1 atm Freezing)",
      tempC: 0.0,
      pressMbar: 1013.25,
      category: "landmark",
      colorLight: "#0369a1",
      colorDark: "#38bdf8",
      desc: "Standard melting and freezing point of water under sea-level atmospheric pressure.",
      physics: "Temperature: 273.15 K (0.00 °C) • Pressure: 101.325 kPa (1013.25 mbar = 1.0 atm).",
      relevanceToAFD: "Latent heat of fusion: 334 kJ/kg. The cantilevered auger gently agitates the slurry during freezing to create loose, porous snow-like granules.",
    },
    {
      id: "standard_conditions",
      name: "Standard Laboratory Conditions (Ambient)",
      shortLabel: "25°C Std Conditions",
      tempC: 25.0,
      pressMbar: 1013.25,
      category: "landmark",
      colorLight: "#0f172a",
      colorDark: "#f8fafc",
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
      colorLight: "#dc2626",
      colorDark: "#f87171",
      desc: "Temperature where saturation vapor pressure equals atmospheric pressure, causing bulk boiling and rapid steam evaporation.",
      physics: "Temperature: 373.15 K (100.00 °C) • Pressure: 101.325 kPa (1.0 atm).",
      relevanceToAFD: "Requires Latent Heat of Vaporization: 2,257 kJ/kg. High heat causes catastrophic thermal denaturation of proteins, enzymes, and live probiotics!",
    },
    {
      id: "critical_point",
      name: "Thermodynamic Critical Point",
      shortLabel: "Critical Point (374°C, 221 bar)",
      tempC: 373.95,
      pressMbar: 220640,
      category: "landmark",
      colorLight: "#be185d",
      colorDark: "#f472b6",
      desc: "The absolute termination of the liquid-gas boundary curve.",
      physics: "Temperature: 647.10 K (373.95 °C) • Pressure: 22.064 MPa (220.64 bar = 217.75 atm).",
      relevanceToAFD: "Beyond this point, liquid and gas merge into a single supercritical fluid with zero surface tension. Relevant to supercritical CO₂ extraction, but far above freeze-drying.",
    },
    {
      id: "ice_ih",
      name: "Ice Ih (Hexagonal Normal Ice)",
      shortLabel: "Ice Ih (Normal Ice)",
      tempC: -20.0,
      pressMbar: 2.0,
      category: "polymorph",
      colorLight: "#0284c7",
      colorDark: "#38bdf8",
      desc: "The everyday normal ice found on Earth, snow, and standard lyophilization. Hexagonal crystal geometry with open cavities.",
      physics: "Density: 0.917 g/cm³ (lighter than liquid water, which is why ice floats!). Held by tetrahedral hydrogen bonding.",
      relevanceToAFD: "This is the ONLY ice polymorph present during freeze-drying. Its porous structure sublimes directly into low-density vapor.",
    },
    {
      id: "ice_ic",
      name: "Ice Ic (Metastable Cubic Ice)",
      shortLabel: "Ice Ic (Cubic Ice)",
      tempC: -140.0,
      pressMbar: 10.0,
      category: "polymorph",
      colorLight: "#0369a1",
      colorDark: "#7dd3fc",
      desc: "A metastable cubic crystal form of ice formed by condensation of water vapor at cryogenic temperatures below -130 °C.",
      physics: "Similar density to Ice Ih, but crystal lattice has diamond-cubic symmetry instead of hexagonal symmetry.",
      relevanceToAFD: "Found in upper atmosphere clouds and space science; not produced in standard freeze drying skids.",
    },
    {
      id: "high_pressure_ice",
      name: "High-Pressure Ice Polymorphs (Ice II, III, V, VI, VII)",
      shortLabel: "High-P Ice Polymorphs",
      tempC: -40.0,
      pressMbar: 800000, // 800 bar = 80 MPa, securely inside high pressure region
      category: "polymorph",
      colorLight: "#6b21a8",
      colorDark: "#c084fc",
      desc: "Exotic crystal arrangements of water molecules that only exist under extreme planetary pressures (2,000 to 600,000 atmospheres!).",
      physics: "Under extreme pressure, hydrogen bonds bend and the open hexagonal lattice collapses into dense, tightly packed structures that are heavier than liquid water!",
      relevanceToAFD: "Shown in Hosokawa's educational webinar to illustrate the complete physical phase space of water. Found deep inside icy planetary moons like Ganymede, but never reached in pharmaceutical dryers.",
    },
    {
      id: "absolute_zero",
      name: "Absolute Zero (Third Law of Thermodynamics)",
      shortLabel: "0 K Absolute Zero",
      tempC: -273.15,
      pressMbar: 0.00001,
      category: "landmark",
      colorLight: "#0f172a",
      colorDark: "#38bdf8",
      desc: "The fundamental lower limit of temperature where entropy of a perfect crystal reaches zero and all thermal molecular motion ceases.",
      physics: "Temperature: 0.00 K (-273.15 °C) • Vapor pressure mathematically approaches zero.",
      relevanceToAFD: "Cryogenic reference datum. Industrial freeze-drying operates at practical refrigerant temperatures (-55 °C to -80 °C).",
    },
  ];

  // --- Thermodynamic Curves Construction ---
  const subCurvePoints: { x: number; y: number; t: number; p: number }[] = [];
  const tStepSub = isProcess ? 2 : 4;
  for (let t = Math.max(minT, -120); t <= 0.01; t += tStepSub) {
    const p = getIceSublimationPressureMbar(t);
    if (p >= Math.pow(10, minLogP)) {
      subCurvePoints.push({ x: tToX(t), y: pToY(p), t, p });
    }
  }
  const tpX = tToX(WATER_CONSTANTS.TRIPLE_POINT_TEMP_C);
  const tpY = pToY(WATER_CONSTANTS.TRIPLE_POINT_PRESS_MBAR);
  subCurvePoints.push({
    x: tpX,
    y: tpY,
    t: WATER_CONSTANTS.TRIPLE_POINT_TEMP_C,
    p: WATER_CONSTANTS.TRIPLE_POINT_PRESS_MBAR,
  });

  // Flat extension of sublimation boundary along floor down to minT (-273.15 °C)
  const subCurveFloorPoints = [
    { x: tToX(minT), y: margin.top + plotHeight },
    { x: tToX(Math.max(minT, -120)), y: margin.top + plotHeight },
    ...subCurvePoints,
  ];

  const subCurvePath = `M ${subCurveFloorPoints.map((pt) => `${pt.x},${pt.y}`).join(" L ")}`;

  const vapCurvePoints: { x: number; y: number; t: number; p: number }[] = [
    { x: tpX, y: tpY, t: 0.01, p: WATER_CONSTANTS.TRIPLE_POINT_PRESS_MBAR },
  ];
  const maxVapT = Math.min(maxT, 373.95);
  const tStepVap = isProcess ? 2 : 6;
  for (let t = 0.01 + tStepVap; t <= maxVapT; t += tStepVap) {
    const p = getWaterVaporPressureMbar(t);
    vapCurvePoints.push({ x: tToX(t), y: pToY(p), t, p });
  }
  if (!isProcess && maxT >= 373.95) {
    vapCurvePoints.push({ x: tToX(373.95), y: pToY(220640), t: 373.95, p: 220640 });
  }
  const vapCurvePath = `M ${vapCurvePoints.map((pt) => `${pt.x},${pt.y}`).join(" L ")}`;

  const meltTopX = tToX(isProcess ? -0.1 : -22);
  const meltTopY = pToY(Math.pow(10, maxLogP));
  const meltPath = `M ${tpX},${tpY} L ${meltTopX},${meltTopY}`;

  // Polygon Shaded Regions
  const solidPolygon = [
    `${margin.left},${margin.top}`,
    `${meltTopX},${meltTopY}`,
    `${tpX},${tpY}`,
    ...[...subCurveFloorPoints].reverse().map((pt) => `${pt.x},${pt.y}`),
    `${margin.left},${margin.top + plotHeight}`,
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
    `${tToX(minT)},${margin.top + plotHeight}`,
    ...subCurveFloorPoints.map((pt) => `${pt.x},${pt.y}`),
    ...vapCurvePoints.map((pt) => `${pt.x},${pt.y}`),
    `${tToX(maxVapT)},${margin.top + plotHeight}`,
    `${tToX(minT)},${margin.top + plotHeight}`,
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

  // Dynamic Theme Palette Values (Guaranteed High AAA Contrast)
  const canvasBg = isDark ? "#0c0d10" : "#ffffff";
  const frameBorder = isDark ? "#475569" : "#0f172a";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.10)";
  const axisTextPrimary = isDark ? "#f8fafc" : "#0f172a"; // 16:1 AAA contrast
  const axisTextMuted = isDark ? "#94a3b8" : "#334155";   // 8.5:1 AAA contrast
  const badgeBg = isDark ? "#14171f" : "#ffffff";

  // High-contrast Watermark Text Colors on top of shaded zones
  const solidWatermarkColor = isDark ? "#7dd3fc" : "#082f49"; // Deep Navy 950 in light mode
  const liquidWatermarkColor = isDark ? "#86efac" : "#052e16"; // Deep Emerald 950 in light mode
  const vaporWatermarkColor = isDark ? "#fde047" : "#451a03"; // Deep Roasted Umber 950 in light mode

  // Formatted current operating pressure
  const curPressFormatted = formatPressureDynamic(pressMbar);

  return (
    <div
      className={`transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-bg p-2 sm:p-4 overflow-hidden flex flex-col justify-between h-screen w-screen"
          : "instrument-card rounded-2xl p-4 sm:p-6 my-6 border border-hairline bg-bg-panel backdrop-blur-md max-w-5xl mx-auto shadow-2xl"
      }`}
    >
      {/* --- SLEEK COMPACT TOP BAR (Optimized for Large Canvas Space) --- */}
      <div className="flex flex-wrap items-center justify-between pb-2.5 mb-2 border-b border-hairline gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 dark:bg-sky-400 animate-pulse shadow-sm shadow-sky-500" />
          <h3 className="text-sm sm:text-base font-black text-slate-950 dark:text-slate-50 tracking-tight">
            Water Phase Diagram Explorer
          </h3>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-bg-hover text-slate-800 dark:text-slate-200 border border-hairline font-bold">
            Hosokawa Webinar Spec
          </span>
          {/* Active Phase Badge */}
          <div
            className="px-2.5 py-0.5 rounded-lg border font-mono text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
            style={{
              borderColor: phase.color,
              backgroundColor: `${phase.color}20`,
              color: isDark ? phase.color : "#0f172a",
            }}
          >
            <Activity className="w-3.5 h-3.5" style={{ color: phase.color }} />
            <span>{phase.state}</span>
          </div>
        </div>

        {/* Center: Minimalist Mode Segmented Controls */}
        <div className="flex items-center rounded-xl bg-bg-inset border border-hairline p-0.5 text-xs font-mono">
          <button
            onClick={() => selectProcess("FREE")}
            className={`px-2.5 py-1 rounded-lg transition font-bold ${
              selectedProcess === "FREE"
                ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Free
          </button>
          <button
            onClick={() => selectProcess("EVAP_HEAT")}
            className={`px-2.5 py-1 rounded-lg transition font-bold ${
              selectedProcess === "EVAP_HEAT"
                ? "bg-orange-500 text-white font-black shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Atmos Evap
          </button>
          <button
            onClick={() => selectProcess("EVAP_VAC")}
            className={`px-2.5 py-1 rounded-lg transition font-bold ${
              selectedProcess === "EVAP_VAC"
                ? "bg-sky-500 text-white font-black shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Vac Drying
          </button>
          <button
            onClick={() => selectProcess("SUBLIMATION")}
            className={`px-2.5 py-1 rounded-lg transition font-bold ${
              selectedProcess === "SUBLIMATION"
                ? "bg-sky-600 text-white font-black shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            AFD Freeze Drying
          </button>
        </div>

        {/* Right: Scale & Fullscreen Actions */}
        <div className="flex items-center gap-2">
          {/* Scale Zoom Switcher */}
          <div className="flex items-center rounded-lg bg-bg-inset border border-hairline p-0.5">
            <button
              onClick={() => setViewScale("PROCESS")}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition ${
                viewScale === "PROCESS"
                  ? "bg-bg-panel text-amber-800 dark:text-amber-300 font-black shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              Process View
            </button>
            <button
              onClick={() => setViewScale("FULL")}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition ${
                viewScale === "FULL"
                  ? "bg-bg-panel text-sky-800 dark:text-sky-300 font-black shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              Full Scale (0 K - 400°C)
            </button>
          </div>

          {/* Toggle Precision Sliders */}
          <button
            onClick={() => setShowSlidersDrawer(!showSlidersDrawer)}
            className={`p-1.5 rounded-lg border text-xs font-mono transition ${
              showSlidersDrawer
                ? "bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-200 border-sky-400"
                : "bg-bg-hover hover:bg-bg-panel border-hairline text-slate-800 dark:text-slate-200"
            }`}
            title="Toggle Precision Sliders"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Full Screen Toggle Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition border shadow-sm ${
              isFullscreen
                ? "bg-amber text-[#0e0a02] border-amber-bright hover:bg-amber-bright"
                : "bg-bg-hover hover:bg-bg-panel border-hairline text-slate-800 dark:text-slate-200"
            }`}
            title={isFullscreen ? "Exit Full Screen (Esc)" : "Expand to Full Screen"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Screen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- MAIN INTERACTIVE SVG CANVAS (Maximized Vertical Height) --- */}
      <div
        className={`relative rounded-xl border-2 border-hairline overflow-hidden select-none shadow-xl transition-all flex items-center justify-center ${
          isFullscreen ? "flex-1 w-full min-h-0 py-1" : "p-2 sm:p-3 my-1"
        }`}
        style={{ backgroundColor: canvasBg }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className={`w-full ${isFullscreen ? "h-full max-h-[84vh] object-contain" : "h-auto max-h-[560px]"} cursor-crosshair`}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          suppressHydrationWarning
        >
          <defs>
            {/* Region Fills */}
            <linearGradient id="solidRegionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity={isDark ? 0.38 : 0.20} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={isDark ? 0.18 : 0.08} />
            </linearGradient>

            <linearGradient id="liquidRegionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#16a34a" stopOpacity={isDark ? 0.36 : 0.20} />
              <stop offset="100%" stopColor="#4ade80" stopOpacity={isDark ? 0.16 : 0.08} />
            </linearGradient>

            <linearGradient id="vaporRegionGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d97706" stopOpacity={isDark ? 0.35 : 0.18} />
              <stop offset="100%" stopColor="#fde047" stopOpacity={isDark ? 0.15 : 0.06} />
            </linearGradient>

            {/* Fine graph grid pattern */}
            <pattern id="fineGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke={gridColor} strokeWidth="0.8" />
            </pattern>

            {/* Hatch pattern for AFD operating envelope */}
            <pattern id="fdHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke={isDark ? "#fbbf24" : "#b45309"} strokeWidth="1.5" strokeOpacity="0.45" />
            </pattern>

            {/* Arrow markers */}
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

          {/* Grid Lines: X Axis */}
          {(isProcess
            ? [-80, -60, -40, -20, 0, 20, 40, 60, 80, 100, 120]
            : [-273.15, -200, -150, -100, -50, 0, 50, 100, 150, 200, 250, 300, 350, 400]
          ).map((t) => (
            <line
              key={`grid-x-${t}`}
              x1={tToX(t)}
              y1={margin.top}
              x2={tToX(t)}
              y2={margin.top + plotHeight}
              stroke={t === 0 || t === 100 ? (isDark ? "rgba(255,255,255,0.30)" : "rgba(15,23,42,0.30)") : gridColor}
              strokeWidth={t === 0 || t === 100 ? "1.8" : "1"}
              strokeDasharray={t === 0 || t === 100 ? "none" : "2 3"}
            />
          ))}

          {/* Grid Lines: Y Axis (Logarithmic) */}
          {(isProcess ? [-3, -2, -1, 0, 1, 2, 3] : [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6]).map((logP) => {
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
                stroke={isDark ? "#fbbf24" : "#b45309"}
                strokeWidth="2.2"
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
                  stroke={isDark ? "#fbbf24" : "#b45309"}
                  strokeWidth="1.4"
                />
                <text x="3" y="1" fill={isDark ? "#fbbf24" : "#78350f"} fontSize="9.5" fontFamily="monospace" fontWeight="900">
                  ★ AFD OPERATING ZONE
                </text>
              </g>
            </g>
          )}

          {/* Phase Boundary Curves */}
          <path d={subCurvePath} fill="none" stroke={isDark ? "#38bdf8" : "#0369a1"} strokeWidth="3" />
          <path d={vapCurvePath} fill="none" stroke={isDark ? "#4ade80" : "#15803d"} strokeWidth="3" />
          <path d={meltPath} fill="none" stroke={isDark ? "#c084fc" : "#6b21a8"} strokeWidth="2.5" strokeDasharray="4 3" />

          {/* Region High-Contrast Watermarks */}
          {showRegions && (
            <g pointerEvents="none">
              <text
                x={tToX(isProcess ? -50 : -160)}
                y={pToY(isProcess ? 20 : 500)}
                fill={solidWatermarkColor}
                fontSize="15"
                fontFamily="monospace"
                fontWeight="900"
                letterSpacing="1.2"
              >
                SOLID (ICE)
              </text>
              <text
                x={tToX(isProcess ? 65 : 120)}
                y={pToY(isProcess ? 300 : 5000)}
                fill={liquidWatermarkColor}
                fontSize="15"
                fontFamily="monospace"
                fontWeight="900"
                letterSpacing="1.2"
              >
                LIQUID WATER
              </text>
              <text
                x={tToX(isProcess ? 75 : 170)}
                y={pToY(isProcess ? 0.05 : 0.005)}
                fill={vaporWatermarkColor}
                fontSize="15"
                fontFamily="monospace"
                fontWeight="900"
                letterSpacing="1.2"
              >
                VAPOUR (GAS)
              </text>
            </g>
          )}

          {/* STABLE, FLICKER-FREE LANDMARK PINS */}
          {showKeyMarkers && selectedProcess === "FREE" && (
            <g>
              {landmarks
                .filter((lm) => {
                  if (isProcess) {
                    return (
                      lm.tempC >= minT &&
                      lm.tempC <= maxT &&
                      lm.pressMbar >= Math.pow(10, minLogP) &&
                      lm.pressMbar <= Math.pow(10, maxLogP)
                    );
                  }
                  return true;
                })
                .map((lm) => {
                  const px = tToX(lm.tempC);
                  const py = pToY(lm.pressMbar);
                  const isHovered = hoveredLandmark?.id === lm.id;
                  const isSelected = selectedLandmark?.id === lm.id;
                  const isActive = isHovered || isSelected;
                  const pinColor = isDark ? lm.colorDark : lm.colorLight;

                  return (
                    <g
                      key={lm.id}
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        setHoveredLandmark(lm);
                      }}
                      onMouseLeave={(e) => {
                        e.stopPropagation();
                        setHoveredLandmark(null);
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setSelectedLandmark(lm);
                        setTempC(lm.tempC);
                        setPressMbar(lm.pressMbar);
                      }}
                    >
                      {/* Generous, Stable Invisible Hit Circle */}
                      <circle cx={px} cy={py} r="18" fill="transparent" />

                      {/* Drop-line to axes for 1 atm landmarks */}
                      {lm.pressMbar === 1013.25 && (
                        <line
                          x1={px}
                          y1={py}
                          x2={px}
                          y2={margin.top + plotHeight}
                          stroke={pinColor}
                          strokeWidth="1.4"
                          strokeDasharray="2 2"
                          opacity={isActive ? 0.95 : 0.4}
                          pointerEvents="none"
                        />
                      )}

                      {/* Stable Glow Halo on Hover */}
                      {isActive && (
                        <circle
                          cx={px}
                          cy={py}
                          r="14"
                          fill="none"
                          stroke={pinColor}
                          strokeWidth="2.5"
                          opacity="0.85"
                          pointerEvents="none"
                        />
                      )}

                      {/* Main Landmark Pin */}
                      <circle
                        cx={px}
                        cy={py}
                        r={isActive ? 8.5 : lm.id === "triple_point" ? 7.5 : 6}
                        fill={pinColor}
                        stroke={badgeBg}
                        strokeWidth={isActive ? 3 : 2}
                        pointerEvents="none"
                        style={{
                          filter: isActive ? `drop-shadow(0 0 10px ${pinColor})` : "none",
                        }}
                      />
                    </g>
                  );
                })}
            </g>
          )}

          {/* --- PROCESS PATHWAYS (Rendered in BOTH Process View and Full Scale!) --- */}
          {/* Mode 02: Atmospheric Evaporation via Heating (Webinar Slide 12 / Screenshot 232233) */}
          {selectedProcess === "EVAP_HEAT" && (
            <g className="transition-all">
              <line
                x1={stdCondX}
                y1={stdCondY}
                x2={tToX(112)}
                y2={stdCondY}
                stroke={axisTextPrimary}
                strokeWidth={isProcess ? "4.5" : "3.5"}
                strokeDasharray="6 3"
                markerEnd="url(#arrowHeadPrimary)"
              />
              <circle cx={stdCondX} cy={stdCondY} r="7" fill={axisTextPrimary} stroke={badgeBg} strokeWidth="2" />
              <circle cx={normalBoilX} cy={normalBoilY} r="7" fill="#dc2626" stroke={badgeBg} strokeWidth="2" />

              <g transform={`translate(${tToX(isProcess ? 42 : 50)}, ${stdCondY - 28})`}>
                <rect
                  x="-6"
                  y="-14"
                  width="115"
                  height="26"
                  rx="6"
                  fill={badgeBg}
                  stroke={axisTextPrimary}
                  strokeWidth="1.8"
                  filter="drop-shadow(0 3px 6px rgba(0,0,0,0.25))"
                />
                <text x="10" y="4" fill={axisTextPrimary} fontSize="13" fontFamily="Arial, sans-serif" fontWeight="900">
                  Heating →
                </text>
              </g>
            </g>
          )}

          {/* Mode 03: Vacuum Evaporation via Pressure Decrease (Webinar Slide 13 / Screenshot 232233) */}
          {selectedProcess === "EVAP_VAC" && (
            <g className="transition-all">
              <line
                x1={tToX(40)}
                y1={pToY(1013.25)}
                x2={tToX(40)}
                y2={pToY(20)}
                stroke={axisTextPrimary}
                strokeWidth={isProcess ? "4.5" : "3.5"}
                strokeDasharray="6 3"
                markerEnd="url(#arrowHeadPrimary)"
              />
              <circle cx={tToX(40)} cy={pToY(1013.25)} r="7" fill="#0369a1" stroke={badgeBg} strokeWidth="2" />
              <circle cx={tToX(40)} cy={pToY(73.8)} r="7" fill="#15803d" stroke={badgeBg} strokeWidth="2" />

              <g transform={`translate(${tToX(40) + 12}, ${pToY(300)})`}>
                <rect
                  x="-4"
                  y="-14"
                  width="140"
                  height="42"
                  rx="6"
                  fill={badgeBg}
                  stroke={axisTextPrimary}
                  strokeWidth="1.8"
                  filter="drop-shadow(0 3px 6px rgba(0,0,0,0.25))"
                />
                <text x="8" y="2" fill={axisTextPrimary} fontSize="12.5" fontFamily="Arial, sans-serif" fontWeight="900">
                  Decrease
                </text>
                <text x="8" y="20" fill={axisTextPrimary} fontSize="12.5" fontFamily="Arial, sans-serif" fontWeight="900">
                  Pressure ↓
                </text>
              </g>
            </g>
          )}

          {/* Mode 04: Active Freeze Drying (AFD) Sublimation Pathway (Webinar Slide 14 / Screenshot 232329) */}
          {selectedProcess === "SUBLIMATION" && (
            <g className="transition-all">
              {/* Path 1: Freezing & Agitated Granulation (Sensible cooling + latent freeze) */}
              <line
                x1={stdCondX}
                y1={stdCondY}
                x2={tToX(-40)}
                y2={stdCondY}
                stroke={axisTextPrimary}
                strokeWidth={isProcess ? "4" : "3"}
                strokeDasharray="6 3"
                markerEnd="url(#arrowHeadPrimary)"
              />
              {/* Path 2: Deep Vacuum Depressurization */}
              <line
                x1={tToX(-40)}
                y1={stdCondY}
                x2={tToX(-40)}
                y2={pToY(0.1)}
                stroke={axisTextPrimary}
                strokeWidth={isProcess ? "4" : "3"}
                strokeDasharray="6 3"
                markerEnd="url(#arrowHeadPrimary)"
              />
              {/* Path 3: Sublimation Dynamic Heating */}
              <line
                x1={tToX(-40)}
                y1={pToY(0.1)}
                x2={tToX(25)}
                y2={pToY(0.1)}
                stroke={axisTextPrimary}
                strokeWidth={isProcess ? "4" : "3"}
                strokeDasharray="6 3"
                markerEnd="url(#arrowHeadPrimary)"
              />

              {/* Landmark points along the freeze-drying trajectory */}
              <circle cx={stdCondX} cy={stdCondY} r="6.5" fill={axisTextPrimary} stroke={badgeBg} strokeWidth="2" />
              <circle cx={tToX(-40)} cy={stdCondY} r="6.5" fill="#0369a1" stroke={badgeBg} strokeWidth="2" />
              <circle cx={tToX(-40)} cy={pToY(0.1)} r="6.5" fill={isDark ? "#fbbf24" : "#b45309"} stroke={badgeBg} strokeWidth="2" />
              <circle cx={tToX(25)} cy={pToY(0.1)} r="6.5" fill="#15803d" stroke={badgeBg} strokeWidth="2" />

              {/* Annotation Badges */}
              <g transform={`translate(${isProcess ? tToX(-22) : tToX(-18)}, ${stdCondY - 28})`}>
                <rect
                  x="-6"
                  y="-14"
                  width="105"
                  height="26"
                  rx="6"
                  fill={badgeBg}
                  stroke={axisTextPrimary}
                  strokeWidth="1.8"
                  filter="drop-shadow(0 3px 6px rgba(0,0,0,0.25))"
                />
                <text x="6" y="4" fill={axisTextPrimary} fontSize="12.5" fontFamily="Arial, sans-serif" fontWeight="900">
                  ← Cooling
                </text>
              </g>

              <g transform={`translate(${isProcess ? tToX(-40) - 150 : tToX(-40) - 130}, ${pToY(20)})`}>
                <rect
                  x="-4"
                  y="-14"
                  width="125"
                  height="42"
                  rx="6"
                  fill={badgeBg}
                  stroke={axisTextPrimary}
                  strokeWidth="1.8"
                  filter="drop-shadow(0 3px 6px rgba(0,0,0,0.25))"
                />
                <text x="6" y="2" fill={axisTextPrimary} fontSize="12" fontFamily="Arial, sans-serif" fontWeight="900">
                  Decrease
                </text>
                <text x="6" y="20" fill={axisTextPrimary} fontSize="12" fontFamily="Arial, sans-serif" fontWeight="900">
                  Pressure ↓
                </text>
              </g>

              <g transform={`translate(${isProcess ? tToX(-15) : tToX(-10)}, ${pToY(0.1) + 20})`}>
                <rect
                  x="-6"
                  y="-14"
                  width="110"
                  height="26"
                  rx="6"
                  fill={badgeBg}
                  stroke={axisTextPrimary}
                  strokeWidth="1.8"
                  filter="drop-shadow(0 3px 6px rgba(0,0,0,0.25))"
                />
                <text x="8" y="4" fill={axisTextPrimary} fontSize="12.5" fontFamily="Arial, sans-serif" fontWeight="900">
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
          {hoverCoord && !activeLandmark && (
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
            pointerEvents="none"
          />

          {/* Top X-Axis Ticks & Labels: Kelvin (Reaches 0 Kelvin = Absolute Zero!) */}
          {(isProcess
            ? [-80, -60, -40, -20, 0, 20, 40, 60, 80, 100, 120]
            : [-273.15, -200, -150, -100, -50, 0, 50, 100, 150, 200, 250, 300, 350, 400]
          ).map((t) => {
            const k = t + 273.15;
            const kStr = k <= 0.05 ? "0 K (Abs Zero)" : `${k.toFixed(0)} K`;
            return (
              <g key={`top-tick-x-${t}`} pointerEvents="none">
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
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {kStr}
                </text>
              </g>
            );
          })}

          {/* Bottom X-Axis Ticks & Labels: Celsius */}
          {(isProcess
            ? [-80, -60, -40, -20, 0, 20, 40, 60, 80, 100, 120]
            : [-273.15, -200, -150, -100, -50, 0, 50, 100, 150, 200, 250, 300, 350, 400]
          ).map((t) => {
            const cStr = t === -273.15 ? "-273.15°C" : `${t}°C`;
            return (
              <g key={`bot-tick-x-${t}`} pointerEvents="none">
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
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {cStr}
                </text>
              </g>
            );
          })}

          {/* Left Y-Axis Ticks & Labels: Pascals (Dynamic Multi-Scale) */}
          {(isProcess ? [-3, -2, -1, 0, 1, 2, 3] : [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6]).map((logP) => {
            const pMbar = Math.pow(10, logP);
            const pa = pMbar * 100;
            let paLabel = `${pa} Pa`;
            if (pa >= 1e9) paLabel = `${pa / 1e9} GPa`;
            else if (pa >= 1e6) paLabel = `${pa / 1e6} MPa`;
            else if (pa >= 1e3) paLabel = `${pa / 1e3} kPa`;
            else if (pa < 0.1) paLabel = `${(pa * 1000).toFixed(0)} mPa`;

            return (
              <g key={`left-tick-y-${logP}`} pointerEvents="none">
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
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="900"
                  textAnchor="end"
                >
                  {paLabel}
                </text>
              </g>
            );
          })}

          {/* Right Y-Axis Ticks & Labels: Bar / mbar / μbar */}
          {(isProcess ? [-3, -2, -1, 0, 1, 2, 3] : [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6]).map((logP) => {
            const pMbar = Math.pow(10, logP);
            let barLabel = `${pMbar} mbar`;
            if (pMbar >= 1000000) barLabel = `${pMbar / 1000000} kbar`;
            else if (pMbar >= 1000) barLabel = `${pMbar / 1000} bar`;
            else if (pMbar < 0.1) barLabel = `${(pMbar * 1000).toFixed(0)} μbar`;

            return (
              <g key={`right-tick-y-${logP}`} pointerEvents="none">
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
                  fontSize="9"
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
            pointerEvents="none"
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
            pointerEvents="none"
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
            pointerEvents="none"
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
            pointerEvents="none"
          >
            PRESSURE (BAR / MBAR / μBAR)
          </text>
        </svg>

        {/* Dynamic Coordinate Probe Card (Dynamic Multi-Scale Unit Resolution) */}
        {hoverCoord && !activeLandmark && (
          <div
            className="absolute bottom-3 left-4 px-3.5 py-1.5 rounded-xl border border-hairline shadow-xl text-xs font-mono flex flex-wrap items-center gap-2.5 backdrop-blur-md pointer-events-none z-20"
            style={{ backgroundColor: badgeBg, color: axisTextPrimary }}
          >
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-bold">Temp:</span>{" "}
              <strong className="text-sky-800 dark:text-sky-300 font-black">{hoverCoord.t} °C</strong>{" "}
              <span className="text-slate-500 dark:text-slate-400">
                ({(hoverCoord.t + 273.15).toFixed(1)} K)
              </span>
            </div>
            <div className="h-3.5 w-px bg-slate-300 dark:bg-slate-700" />
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-bold">Pressure:</span>{" "}
              <strong className="text-amber-800 dark:text-amber-300 font-black">
                {formatPressureDynamic(hoverCoord.p).primary}
              </strong>{" "}
              <span className="text-slate-500 dark:text-slate-400">
                ({formatPressureDynamic(hoverCoord.p).secondary})
              </span>
            </div>
            <div className="h-3.5 w-px bg-slate-300 dark:bg-slate-700" />
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-bold">Phase:</span>{" "}
              <span className="font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                {hoverCoord.phaseName}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* --- DEDICATED ACTIVE LANDMARK INSPECTOR CARD --- */}
      {activeLandmark && (
        <div className="mt-2 p-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#14171f] shadow-2xl transition-all animate-in fade-in slide-in-from-top-2 duration-200 shrink-0">
          <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: isDark ? activeLandmark.colorDark : activeLandmark.colorLight }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-950 dark:text-slate-50">
                    {activeLandmark.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 uppercase font-black">
                    {activeLandmark.category}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-sky-800 dark:text-sky-300 mt-0.5">
                  {activeLandmark.physics}
                </div>
              </div>
            </div>

            {/* Click-to-Close Button */}
            <button
              onClick={() => {
                setSelectedLandmark(null);
                setHoveredLandmark(null);
              }}
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition border border-slate-300 dark:border-slate-600"
              title="Close Inspection Card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 text-xs text-slate-800 dark:text-slate-200 space-y-1.5">
            <p className="leading-relaxed font-medium">
              {activeLandmark.desc}
            </p>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 text-[11px] font-semibold flex items-start gap-2">
              <span className="text-sm shrink-0">💡</span>
              <span className="leading-snug">{activeLandmark.relevanceToAFD}</span>
            </div>
          </div>
        </div>
      )}

      {/* --- COLLAPSIBLE PRECISION SLIDERS DRAWER (Hidden by Default in Full Screen) --- */}
      {(showSlidersDrawer || !isFullscreen) && (
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-hairline shrink-0">
          <div className="bg-white dark:bg-[#14171f] p-3 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-bold">
                <Thermometer className="w-4 h-4 text-sky-700 dark:text-sky-400" /> Temperature (°C / K)
              </span>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="font-black text-slate-950 dark:text-slate-50 text-sm">{tempC}°C</span>
                <span className="text-slate-500 dark:text-slate-400">({(tempC + 273.15).toFixed(1)} K)</span>
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
              className="w-full accent-sky-700 dark:accent-sky-400 cursor-pointer"
            />
          </div>

          <div className="bg-white dark:bg-[#14171f] p-3 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-bold">
                <Gauge className="w-4 h-4 text-amber-700 dark:text-amber-400" /> Chamber Pressure
              </span>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="font-black text-slate-950 dark:text-slate-50 text-sm">
                  {curPressFormatted.primary}
                </span>
                <span className="text-slate-500 dark:text-slate-400">({curPressFormatted.secondary})</span>
              </div>
            </div>
            <input
              type="range"
              min={minLogP}
              max={maxLogP}
              step="0.05"
              value={Math.log10(Math.max(Math.pow(10, minLogP), pressMbar))}
              onChange={(e) => {
                setPressMbar(Number(Math.pow(10, Number(e.target.value)).toFixed(5)));
                if (selectedProcess !== "FREE") setSelectedProcess("FREE");
              }}
              className="w-full accent-amber-700 dark:accent-amber-400 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* --- EDUCATIONAL GUIDE: ICE POLYMORPHS DRAWER (Non-fullscreen or collapsible) --- */}
      {!isFullscreen && (
        <div className="mt-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#14171f] overflow-hidden transition-all shadow-sm">
          <button
            onClick={() => setShowPolymorphExplainer(!showPolymorphExplainer)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-700 dark:text-sky-400" />
              <span className="text-xs font-black text-slate-950 dark:text-slate-100">
                What are Ice Polymorphs? Deciphering the Roman Numerals (Ice Ih, Ic, II, III...)
              </span>
            </div>
            {showPolymorphExplainer ? (
              <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            )}
          </button>

          {showPolymorphExplainer && (
            <div className="px-4 pb-4 pt-1 text-xs text-slate-800 dark:text-slate-200 space-y-2.5 border-t border-slate-200 dark:border-slate-800">
              <p className="leading-relaxed">
                <strong className="text-slate-950 dark:text-slate-50">Polymorphism in Water:</strong> Water does not freeze into just one kind of solid. Depending on temperature and pressure, water molecules (H₂O) assemble into at least <strong className="text-sky-900 dark:text-sky-300">19 different crystalline structures (polymorphs)</strong>, designated by Roman numerals (Ice I through Ice XIX):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 font-mono text-[11px]">
                <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-300 dark:border-sky-800">
                  <div className="text-sky-950 dark:text-sky-300 font-black text-xs flex items-center gap-1.5">
                    <Snowflake className="w-3.5 h-3.5" /> Ice Ih (Hexagonal)
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 mt-1 text-[11px] leading-snug">
                    Everyday normal ice on Earth at atmospheric pressure. The water molecules form an open hexagonal honeycomb held by hydrogen bonds. Because of these open pockets, <strong className="text-slate-950 dark:text-slate-50">Ice Ih is less dense than water (0.917 g/cm³)</strong>, which is why ice cubes float!
                  </div>
                  <div className="mt-2 text-[10px] text-amber-900 dark:text-amber-300 font-black">
                    ★ The ONLY ice phase in freeze-drying.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-300 dark:border-cyan-800">
                  <div className="text-cyan-950 dark:text-cyan-300 font-black text-xs flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Ice Ic (Cubic Ice)
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 mt-1 text-[11px] leading-snug">
                    A metastable cubic crystal form created when water vapor condenses at deep cryogenic temperatures (below -130 °C). Found in high-altitude clouds and space ice.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-800">
                  <div className="text-purple-950 dark:text-purple-300 font-black text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Ice II, III, V, VI, VII
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 mt-1 text-[11px] leading-snug">
                    High-pressure exotic ice phases that only exist under extreme planetary pressures (&gt; 2,000 to 600,000 atmospheres). Under this pressure, the open honeycomb collapses into dense crystals that <strong className="text-slate-950 dark:text-slate-50">sink in water</strong>! Found deep inside icy moons like Ganymede and Neptune.
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 italic">
                <strong>Why Hosokawa included them:</strong> Hosokawa displayed the full-scale diagram in their webinar to demonstrate that the <span className="text-amber-800 dark:text-amber-300 font-black">AFD Freeze-Drying Operating Envelope (0.05 to 1.5 mbar, -55°C to -10°C)</span> occupies a tiny, highly-controlled thermodynamic niche strictly inside the <span className="text-sky-800 dark:text-sky-300 font-black">Ice Ih</span> sublimation region beneath the triple point!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
