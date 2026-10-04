"use client";

import React, { useState, useEffect, useId } from "react";
import { useTheme } from "@/components/layout/ThemeProvider";
import {
  Play,
  Pause,
  RotateCcw,
  Flame,
  Snowflake,
  Wind,
  Layers,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2,
  Minimize2,
  Split,
  Activity,
  Droplets,
  Zap,
  Gauge,
  Thermometer,
  Boxes,
  Clock,
  ChevronRight,
  Crosshair,
  FileText,
  Search,
  Settings2,
  Sun,
  Moon,
  Monitor,
  Eye,
} from "lucide-react";

// ============================================================================
// SOLVENT THERMODYNAMIC DATABASE
// ============================================================================
interface SolventData {
  name: string;
  formula: string;
  triplePointP: number; // mbar
  triplePointT: number; // °C
  boilingPtAtm: number; // °C
  meltingPtAtm: number; // °C
  latentHeatVap: number; // kJ/kg
  latentHeatSub: number; // kJ/kg
  vacDryerOpP: number; // mbar
  vacDryerBoilT: number; // °C
  vacDryerCondT: number; // °C
  afdOpP: number; // mbar
  afdSublimT: number; // °C
  afdCondT: number; // °C
  vaporDensityVac: number; // kg/m3 at vacDryerOpP
  vaporDensityAfd: number; // kg/m3 at afdOpP
  expansionRatioAfd: number; // m3/g
}

const SOLVENTS: Record<string, SolventData> = {
  water: {
    name: "Water",
    formula: "H₂O",
    triplePointP: 6.11,
    triplePointT: 0.01,
    boilingPtAtm: 100.0,
    meltingPtAtm: 0.0,
    latentHeatVap: 2260,
    latentHeatSub: 2838,
    vacDryerOpP: 40.0,
    vacDryerBoilT: 29.0,
    vacDryerCondT: 18.0,
    afdOpP: 0.15,
    afdSublimT: -25.0,
    afdCondT: -70.0,
    vaporDensityVac: 0.029,
    vaporDensityAfd: 0.00013,
    expansionRatioAfd: 1.24,
  },
  ethanol: {
    name: "Ethanol",
    formula: "C₂H₅OH",
    triplePointP: 0.00043,
    triplePointT: -114.1,
    boilingPtAtm: 78.37,
    meltingPtAtm: -114.1,
    latentHeatVap: 846,
    latentHeatSub: 954,
    vacDryerOpP: 30.0,
    vacDryerBoilT: 18.0,
    vacDryerCondT: -5.0,
    afdOpP: 0.005,
    afdSublimT: -65.0,
    afdCondT: -110.0,
    vaporDensityVac: 0.057,
    vaporDensityAfd: 0.000015,
    expansionRatioAfd: 8.5,
  },
  acetone: {
    name: "Acetone",
    formula: "C₃H₆O",
    triplePointP: 0.023,
    triplePointT: -94.8,
    boilingPtAtm: 56.05,
    meltingPtAtm: -94.7,
    latentHeatVap: 538,
    latentHeatSub: 622,
    vacDryerOpP: 50.0,
    vacDryerBoilT: -2.0,
    vacDryerCondT: -20.0,
    afdOpP: 0.01,
    afdSublimT: -70.0,
    afdCondT: -105.0,
    vaporDensityVac: 0.118,
    vaporDensityAfd: 0.000032,
    expansionRatioAfd: 4.8,
  },
};

// ============================================================================
// P&ID ITEM DATA SHEET SPECIFICATIONS (AutoCAD Plant 3D Tag Schedule)
// ============================================================================
interface PidItemSpec {
  tag: string;
  name: string;
  service: string;
  system: "vac" | "afd" | "common";
  spec: string;
  designP: string;
  designT: string;
  moc: string;
  nozzles?: string[];
  telemetry: {
    label: string;
    value: string;
    status: "ok" | "warn" | "active";
  }[];
  description: string;
}

const PID_SPECS: Record<string, PidItemSpec> = {
  "VD-101": {
    tag: "VD-101",
    name: "Vacuum Contact Conical Dryer",
    service: "Liquid Slurry Evaporation & Contact Drying",
    system: "vac",
    spec: "ASME VIII Div 1 / cGMP Sanitary",
    designP: "Full Vacuum (-1.0 bar) to +3.0 bar g",
    designT: "-10°C to +150°C",
    moc: "AISI 316L / Hastelloy C-22 (Ra < 0.4 µm)",
    nozzles: ["N1: Slurry Feed 2\" Triclamp", "N2: Overhead Vapor 3\" Flanged", "N3: Bottom Discharge 4\" Spherical Valve", "N4/N5: Jacket Supply/Return 1\""],
    telemetry: [
      { label: "Vessel Pressure (PIT-101)", value: "40.0 mbar", status: "ok" },
      { label: "Product Bed Temp (TIT-101)", value: "+29.0 °C", status: "ok" },
      { label: "Jacket Temp (TIT-102)", value: "+54.0 °C", status: "active" },
      { label: "Agitator Speed (SI-101)", value: "45 RPM", status: "ok" },
    ],
    description: "Conical Nauta mixing vessel equipped with full thermal jacket and rotating/orbiting mixing screw. Evaporates liquid solvent via nucleate boiling above triple point pressure.",
  },
  "FL-101": {
    tag: "FL-101",
    name: "Vacuum Dust Vapor Filter",
    service: "Vapor Particulate Entrainment Separation",
    system: "vac",
    spec: "Sanitary Cylindrical Top Vessel",
    designP: "Full Vacuum to +3.0 bar g",
    designT: "Up to +120°C",
    moc: "316L with Sintered Porous SS Filter Candles (1 µm)",
    nozzles: ["Vapor Inlet Flange 3\"", "Vapor Outlet to Condenser 3\"", "N2 Reverse Pulse Blowback 1/2\""],
    telemetry: [
      { label: "Differential Pressure (PDIT-101)", value: "4.2 mbar", status: "ok" },
      { label: "Pulse Blowback State", value: "Ready / Idle", status: "ok" },
    ],
    description: "Mounted directly onto dryer top nozzle. Retains entrained fines while allowing clean solvent vapor to pass overhead to condenser. Periodically pulsed with dry N2.",
  },
  "HE-101": {
    tag: "HE-101",
    name: "Primary TEMA Shell & Tube Condenser",
    service: "Vapor Liquefaction & Solvent Recovery",
    system: "vac",
    spec: "TEMA BEM Fixed Tubesheet",
    designP: "Shell: Full Vacuum / Tubes: 6.0 bar g",
    designT: "-10°C to +100°C",
    moc: "Tubes: Hastelloy C-22 / Shell: 316L",
    nozzles: ["Vapor In 3\"", "Condensate Out 1.5\"", "CWS In 1.5\"", "CWR Out 1.5\"", "Vacuum Vent 1.5\""],
    telemetry: [
      { label: "Cooling Water In (TIT-103)", value: "+15.0 °C", status: "ok" },
      { label: "Cooling Water Out (TIT-104)", value: "+19.2 °C", status: "ok" },
      { label: "Condensation Heat Duty", value: "11.3 kW", status: "active" },
    ],
    description: "Standard TEMA shell-and-tube heat exchanger. Solvent vapor strikes chilled tube bundle and condenses into a continuous liquid film running down into receiver by gravity.",
  },
  "TK-101": {
    tag: "TK-101",
    name: "Solvent Condensate Receptacle",
    service: "Liquid Solvent Collection Under Vacuum",
    system: "vac",
    spec: "Vertical Pressure Vessel with Dished Heads",
    designP: "Full Vacuum to +2.0 bar g",
    designT: "0°C to +80°C",
    moc: "316L Stainless Steel",
    telemetry: [
      { label: "Liquid Level (LIT-101)", value: "64 %", status: "ok" },
      { label: "Accumulated Solvent", value: "12.8 kg", status: "active" },
      { label: "Drain Valve (HV-102)", value: "Closed (Continuous Buffer)", status: "ok" },
    ],
    description: "Collects recovered liquid solvent under continuous vacuum. Can be drained via barometric seal leg or isolated drain cycle without interrupting the drying process.",
  },
  "VP-101": {
    tag: "VP-101",
    name: "Liquid Ring Vacuum Pump Skid",
    service: "Moderate Vacuum Evacuation (20-100 mbar)",
    system: "vac",
    spec: "Two-Stage Liquid Ring Vacuum Pump",
    designP: "Atmospheric Discharge",
    designT: "+10°C to +40°C",
    moc: "Cast Iron / 316L Impeller",
    telemetry: [
      { label: "Suction Vacuum", value: "38.5 mbar abs", status: "ok" },
      { label: "Service Liquid Temp", value: "+16.5 °C", status: "ok" },
      { label: "Motor Power (M-102)", value: "5.5 kW (Running)", status: "active" },
    ],
    description: "Pulls process chamber down to moderate vacuum levels. Compresses non-condensable inert gases and discharges to secondary condenser HE-102.",
  },
  "AFD-201": {
    tag: "AFD-201",
    name: "Active Freeze Dryer Vessel",
    service: "Cryogenic Dynamic Freezing & Ice Sublimation",
    system: "afd",
    spec: "Pharma cGMP Sanitary Cantilevered Conical",
    designP: "Ultra-High Vacuum (10⁻³ mbar) to +3.0 bar g",
    designT: "-50°C to +100°C",
    moc: "AISI 316L / 1.4404 (Electropolished Ra < 0.2 µm)",
    nozzles: ["N1: Sanitary Feed In 2\"", "N2: Cryo Sublimation Duct 10\" (DN250)", "N3: Bottom Bellows Flush Valve 4\"", "N4/N5: Cryo Thermal Fluid Loop 1.5\""],
    telemetry: [
      { label: "Chamber Vacuum (PIT-201A)", value: "0.15 mbar", status: "ok" },
      { label: "Product Bed Temp (TIT-201)", value: "-24.8 °C", status: "ok" },
      { label: "Cryo Jacket Temp (TIT-202)", value: "+8.5 °C", status: "active" },
      { label: "Screw Orbit Frequency (SI-201)", value: "22.0 Hz", status: "ok" },
    ],
    description: "Hosokawa conical vacuum vessel with top-driven cantilevered screw without bottom bearing (per patent NL 2026893 B1). Freezes liquid into discrete granules, then sublimates ice directly to gas.",
  },
  "FL-201": {
    tag: "FL-201",
    name: "Heated Cryogenic Vapor Filter",
    service: "Sublimation Fines Separation with Anti-Frost Jacket",
    system: "afd",
    spec: "Jacketed Heated Sanitary Top Housing",
    designP: "Full Cryo Vacuum to +3.0 bar g",
    designT: "-40°C to +120°C",
    moc: "316L with PTFE Membrane / Sintered Metal (0.5 µm)",
    telemetry: [
      { label: "Filter Jacket Temp (TIT-205)", value: "+35.0 °C (Anti-Frost)", status: "ok" },
      { label: "Filter Differential (PDIT-201)", value: "0.08 mbar", status: "ok" },
    ],
    description: "Sanitary vapor filter equipped with heated thermal jacket. Heating prevents sublimated vapor from desublimating/frosting onto filter cloth, eliminating filter blinding.",
  },
  "CT-201": {
    tag: "CT-201",
    name: "Cryogenic Cold Trap Condenser",
    service: "Vapor Desublimation & Solid Ice Cake Accumulation",
    system: "afd",
    spec: "Vacuum Pressure Vessel with Internal Finned Coils",
    designP: "High Vacuum (10⁻³ mbar) to +2.0 bar g",
    designT: "-80°C to +120°C (Steam CIP/Defrost)",
    moc: "AISI 316L Cold Plates / Monel Refrigerant Tubes",
    nozzles: ["Vapor In 10\" DN250", "Cryo Refrigerant In/Out 2\"", "Clean Steam Defrost In 1.5\"", "Melt Drain Dump 2\"", "Vacuum Backing 4\""],
    telemetry: [
      { label: "Coil Surface Temp (TIT-203)", value: "-72.4 °C", status: "ok" },
      { label: "Ice Cake Thickness", value: "14.2 mm", status: "warn" },
      { label: "Trapped Ice Mass", value: "13.6 kg Solid Ice", status: "active" },
    ],
    description: "Cryogenic trap operating at -70°C. Water vapor hits freezing coils and immediately desublimates into solid ice crystals without forming liquid. Requires thermal defrost between batches.",
  },
  "VP-201": {
    tag: "VP-201",
    name: "High-Vacuum Booster & Dry Screw Skid",
    service: "Ultra-Deep Vacuum Evacuation (< 0.1 mbar)",
    system: "afd",
    spec: "Roots Booster + Multi-Stage Dry Screw Backing Pump",
    designP: "Atmospheric Discharge",
    designT: "Ambient (+20°C)",
    moc: "Ductile Iron Housing / PTFE Coated Screws",
    telemetry: [
      { label: "Inlet Vacuum (PIT-203)", value: "0.045 mbar", status: "ok" },
      { label: "Roots Blower Speed", value: "3450 RPM", status: "active" },
      { label: "Dry Screw Power", value: "7.5 kW", status: "ok" },
    ],
    description: "High-vacuum pumping train. Roots mechanical booster handles high volumetric gas throughput at ultra-low pressures, backed by oil-free dry screw pump.",
  },
  "REF-201": {
    tag: "REF-201",
    name: "Two-Stage Cascade Refrigeration Unit",
    service: "Continuous -75°C Low-Temperature Cold Trap Supply",
    system: "afd",
    spec: "Dual Circuit Cascade R404A / R23",
    designP: "High Side 25 bar / Low Side 18 bar",
    designT: "-85°C to +45°C",
    moc: "Semi-Hermetic Screw Compressors",
    telemetry: [
      { label: "Stage 1 (R404A) Evap", value: "-35.0 °C", status: "ok" },
      { label: "Stage 2 (R23) Suction", value: "-78.5 °C", status: "ok" },
      { label: "Cooling Capacity", value: "18.5 kW @ -70°C", status: "active" },
    ],
    description: "Provides low-temperature direct-expansion cooling to cold trap coils CT-201, holding coil surface at -75°C under peak sublimation heat loads.",
  },
};

// ============================================================================
// HOSOKAWA SCADA TIME-SERIES CURVE DATA (Faithfully modeled from Image 3)
// ============================================================================
interface ScadaPoint {
  timeHours: number;
  phase: string;
  hz: number; // Agitator Drive Frequency (Hz)
  tCond: number; // Cold Trap Temp (°C)
  tJacket: number; // Vessel Jacket Temp (°C)
  tProduct: number; // Product Bed Temp (°C)
  vacDryer: number; // Vacuum Chamber Pressure (mbar)
  vacFilter: number; // Vacuum Filter Pressure (mbar)
}

const HOSOKAWA_SCADA_DATA: ScadaPoint[] = [
  // 12-11-2007 12:00 -> Inoculation & Deep Freezing
  { timeHours: 0.0, phase: "Charge & Start", hz: 40, tCond: 22, tJacket: 18, tProduct: 18, vacDryer: 1013, vacFilter: 1013 },
  { timeHours: 0.8, phase: "Agitated Freezing", hz: 58, tCond: -25, tJacket: -15, tProduct: 2, vacDryer: 980, vacFilter: 980 },
  { timeHours: 1.5, phase: "Agitated Freezing", hz: 50, tCond: -48, tJacket: -38, tProduct: -18, vacDryer: 300, vacFilter: 320 },
  { timeHours: 2.2, phase: "Deep Vacuum Evacuation", hz: 20, tCond: -68, tJacket: -35, tProduct: -22, vacDryer: 0.8, vacFilter: 1.1 },
  { timeHours: 3.5, phase: "Primary Sublimation Start", hz: 20, tCond: -75, tJacket: 2, tProduct: -25, vacDryer: 0.35, vacFilter: 0.42 },
  { timeHours: 6.0, phase: "Peak Primary Sublimation", hz: 20, tCond: -76, tJacket: 8, tProduct: -23, vacDryer: 0.28, vacFilter: 0.34 },
  { timeHours: 9.0, phase: "Peak Primary Sublimation", hz: 20, tCond: -78, tJacket: 10, tProduct: -21, vacDryer: 0.25, vacFilter: 0.30 },
  { timeHours: 12.0, phase: "Primary Sublimation (Steady)", hz: 20, tCond: -77, tJacket: 11, tProduct: -20, vacDryer: 0.22, vacFilter: 0.27 },
  { timeHours: 15.0, phase: "Primary Sublimation (Steady)", hz: 20, tCond: -78, tJacket: 11, tProduct: -19, vacDryer: 0.20, vacFilter: 0.25 },
  { timeHours: 18.0, phase: "Sublimation Completion", hz: 20, tCond: -75, tJacket: 12, tProduct: -15, vacDryer: 0.18, vacFilter: 0.22 },
  { timeHours: 21.0, phase: "Secondary Desorption Ramp", hz: 20, tCond: -72, tJacket: 35, tProduct: -2, vacDryer: 0.15, vacFilter: 0.19 },
  { timeHours: 23.5, phase: "Secondary Desorption Soak", hz: 20, tCond: -70, tJacket: 48, tProduct: 28, vacDryer: 0.12, vacFilter: 0.16 },
  { timeHours: 24.5, phase: "Batch Complete / Discharge", hz: 0, tCond: -40, tJacket: 48, tProduct: 32, vacDryer: 1013, vacFilter: 1013 },
  { timeHours: 26.0, phase: "Condenser Defrost Cycle", hz: 0, tCond: +45, tJacket: 20, tProduct: 20, vacDryer: 1013, vacFilter: 1013 },
];

export function VacuumVsFreezeDryerStudio() {
  const compId = useId().replace(/:/g, "");
  const { theme } = useTheme();
  const isGlobalDark = theme === "dark";

  // Visual Theme Modes: "auto" (follows app), "cad-dark" (AutoCAD Model Space), "cad-light" (AutoCAD White Plot)
  const [cadStyle, setCadStyle] = useState<"auto" | "cad-dark" | "cad-light">("auto");
  const isCadDark = cadStyle === "cad-dark" ? true : cadStyle === "cad-light" ? false : isGlobalDark;

  // Studio Modes
  const [activeTab, setActiveTab] = useState<"pidComparison" | "scadaCurves" | "stepper" | "parametric" | "phaseDiagram">("pidComparison");
  const [selectedSolventKey, setSelectedSolventKey] = useState<string>("water");
  const solvent = SOLVENTS[selectedSolventKey] || SOLVENTS.water;

  // P&ID View Mode: "split" (side-by-side), "vacOnly", "afdOnly"
  const [pidViewMode, setPidViewMode] = useState<"split" | "vacOnly" | "afdOnly">("split");
  const [selectedTag, setSelectedTag] = useState<string>("AFD-201");

  // Stepper State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // SCADA Scrubber State
  const [scadaTimeIdx, setScadaTimeIdx] = useState<number>(5);
  const activeScadaPoint = HOSOKAWA_SCADA_DATA[scadaTimeIdx] || HOSOKAWA_SCADA_DATA[0];

  // Parametric Sliders
  const [batchWetKg, setBatchWetKg] = useState<number>(20.0);
  const [solventFraction, setSolventFraction] = useState<number>(0.75); // 75% solvent, 25% dry solids
  const [dryingTimeHours, setDryingTimeHours] = useState<number>(6.0);

  // Auto-play timer for Stepper
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev >= 7 ? 1 : prev + 1));
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Dynamic Engineering Calculations
  const solventMassKg = batchWetKg * solventFraction;
  const solidsMassKg = batchWetKg * (1 - solventFraction);
  const evapRateKgH = solventMassKg / Math.max(0.5, dryingTimeHours * 0.6); // Vacuum drying peak
  const sublimRateKgH = solventMassKg / Math.max(0.5, dryingTimeHours); // AFD sublimation rate

  const volFlowVacM3H = evapRateKgH / solvent.vaporDensityVac;
  const volFlowAfdM3H = sublimRateKgH / solvent.vaporDensityAfd;
  const volExpansionMultiplier = Math.round(volFlowAfdM3H / Math.max(1, volFlowVacM3H));

  // Minimum Recommended Vapor Duct Diameter to prevent sonic choking (Mach < 0.25)
  const minDuctDiaVacMm = Math.round(Math.sqrt((volFlowVacM3H / 3600 / (Math.PI / 4 * 40)) * 1000000));
  const minDuctDiaAfdMm = Math.round(Math.sqrt((volFlowAfdM3H / 3600 / (Math.PI / 4 * 60)) * 1000000));

  // AutoCAD Plant 3D Theme Palette
  const cad = isCadDark
    ? {
        bg: "#090d16",
        panelBg: "#0d131f",
        cardBg: "#111827",
        gridLine: "#1e293b",
        gridCross: "#334155",
        processGreen: "#00FF66", // AutoCAD Green (Process Lines)
        vacuumCyan: "#00E5FF", // AutoCAD Cyan (Vapor & Vacuum)
        coolingBlue: "#38bdf8", // Utility Cooling Water
        cryoIndigo: "#818cf8", // Low-Temp Refrigerant
        heatingOrange: "#f97316", // Thermal Heating Fluid
        metalStroke: "#e2e8f0", // Clean Equipment Outlines
        jacketStroke: "#f59e0b",
        vesselFill: "#0b1120",
        balloonFill: "#0f172a",
        balloonStroke: "#00E5FF",
        textPrimary: "#f8fafc",
        textSecondary: "#94a3b8",
        textMuted: "#64748b",
        border: "#1e293b",
        borderHighlight: "#38bdf8",
      }
    : {
        bg: "#ffffff",
        panelBg: "#f8fafc",
        cardBg: "#f1f5f9",
        gridLine: "#e2e8f0",
        gridCross: "#cbd5e1",
        processGreen: "#047857", // Deep CAD Green
        vacuumCyan: "#0284c7", // Deep Technical Cyan
        coolingBlue: "#0369a1", // Deep Blue
        cryoIndigo: "#4338ca", // Technical Indigo
        heatingOrange: "#c2410c", // Technical Amber
        metalStroke: "#0f172a", // Crisp Dark Ink
        jacketStroke: "#b45309",
        vesselFill: "#f8fafc",
        balloonFill: "#ffffff",
        balloonStroke: "#0284c7",
        textPrimary: "#0f172a",
        textSecondary: "#334155",
        textMuted: "#64748b",
        border: "#cbd5e1",
        borderHighlight: "#0284c7",
      };

  const selectedSpec = PID_SPECS[selectedTag] || PID_SPECS["AFD-201"];

  return (
    <div
      className="w-full rounded-2xl border shadow-2xl overflow-hidden font-sans my-8 transition-colors duration-200"
      style={{
        backgroundColor: cad.panelBg,
        borderColor: cad.border,
        color: cad.textPrimary,
      }}
    >
      {/* ==================================================================== */}
      {/* STUDIO TITLEBAR & AUTOCAD CONTROLS */}
      {/* ==================================================================== */}
      <div
        className="px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-3"
        style={{ backgroundColor: cad.bg, borderColor: cad.border }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center border font-mono font-bold text-xs"
            style={{
              backgroundColor: isCadDark ? "#1e293b" : "#e2e8f0",
              borderColor: cad.border,
              color: cad.vacuumCyan,
            }}
          >
            <Crosshair className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">
                AutoCAD Plant 3D P&ID: Vacuum Dryer vs. Active Freeze Dryer
              </h2>
              <span
                className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold border"
                style={{
                  backgroundColor: isCadDark ? "rgba(0, 229, 255, 0.1)" : "rgba(2, 132, 199, 0.1)",
                  color: cad.vacuumCyan,
                  borderColor: cad.vacuumCyan,
                }}
              >
                ISA-5.1 Instrumentation Standard
              </span>
            </div>
            <p className="text-xs" style={{ color: cad.textSecondary }}>
              Engineering P&ID schematics, live Hosokawa SCADA curves, and parametric duct expansion calculators.
            </p>
          </div>
        </div>

        {/* View Tabs & Style Switcher */}
        <div className="flex items-center gap-2">
          {/* CAD Theme Switcher */}
          <div
            className="flex items-center p-1 rounded-lg border text-xs"
            style={{ backgroundColor: cad.panelBg, borderColor: cad.border }}
          >
            <button
              onClick={() => setCadStyle("cad-dark")}
              className={`px-2 py-1 rounded flex items-center gap-1.5 font-mono text-[11px] transition ${
                cadStyle === "cad-dark"
                  ? "bg-slate-800 text-cyan-400 font-bold shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="AutoCAD Plant 3D Dark Wireframe Model Space"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>CAD Dark</span>
            </button>
            <button
              onClick={() => setCadStyle("cad-light")}
              className={`px-2 py-1 rounded flex items-center gap-1.5 font-mono text-[11px] transition ${
                cadStyle === "cad-light"
                  ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-300"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="AutoCAD White Plot / Clean Architectural Draughting"
            >
              <Sun className="w-3.5 h-3.5" />
              <span>CAD White</span>
            </button>
            <button
              onClick={() => setCadStyle("auto")}
              className={`px-2 py-1 rounded flex items-center gap-1.5 font-mono text-[11px] transition ${
                cadStyle === "auto"
                  ? "bg-blue-600/20 text-blue-500 font-bold"
                  : "text-slate-400 hover:text-slate-500"
              }`}
              title="Match Application Theme"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Auto</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECONDARY TOOLBAR: SYSTEM MODES & SOLVENT SELECTOR */}
      {/* ==================================================================== */}
      <div
        className="px-5 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs"
        style={{ backgroundColor: cad.panelBg, borderColor: cad.border }}
      >
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab("pidComparison")}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition ${
              activeTab === "pidComparison"
                ? "bg-blue-600 text-white shadow-sm"
                : "hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>P&ID Flowsheets</span>
          </button>
          <button
            onClick={() => setActiveTab("scadaCurves")}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition ${
              activeTab === "scadaCurves"
                ? "bg-blue-600 text-white shadow-sm"
                : "hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Hosokawa SCADA Curves</span>
          </button>
          <button
            onClick={() => setActiveTab("stepper")}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition ${
              activeTab === "stepper"
                ? "bg-blue-600 text-white shadow-sm"
                : "hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>7-Step Process Stepper</span>
          </button>
          <button
            onClick={() => setActiveTab("parametric")}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition ${
              activeTab === "parametric"
                ? "bg-blue-600 text-white shadow-sm"
                : "hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Parametric Duct Sizing</span>
          </button>
          <button
            onClick={() => setActiveTab("phaseDiagram")}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition ${
              activeTab === "phaseDiagram"
                ? "bg-blue-600 text-white shadow-sm"
                : "hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>P-T Phase Boundary</span>
          </button>
        </div>

        {/* Process Solvent Selector */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold" style={{ color: cad.textMuted }}>
            SOLVENT:
          </span>
          <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-900 p-0.5 rounded-md border border-slate-300 dark:border-slate-800">
            {Object.keys(SOLVENTS).map((key) => {
              const s = SOLVENTS[key];
              const isSelected = selectedSolventKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedSolventKey(key)}
                  className={`px-2 py-1 rounded text-xs font-mono font-medium transition ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {s.name} ({s.formula})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: AUTOCAD PLANT 3D P&ID FLOWSHEETS */}
      {/* ==================================================================== */}
      {activeTab === "pidComparison" && (
        <div className="p-4 sm:p-6 space-y-4">
          {/* Subheader: View Layout Selector + Plant 3D Model Coordinates */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px]" style={{ color: cad.textMuted }}>
                P&ID LAYOUT:
              </span>
              <button
                onClick={() => setPidViewMode("split")}
                className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold border transition ${
                  pidViewMode === "split"
                    ? "bg-blue-600 text-white border-blue-500"
                    : "border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Side-by-Side Dual Plant (1:1 Comparative)
              </button>
              <button
                onClick={() => setPidViewMode("vacOnly")}
                className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold border transition ${
                  pidViewMode === "vacOnly"
                    ? "bg-amber-600 text-white border-amber-500"
                    : "border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                VD-101 Vacuum Dryer Installation
              </button>
              <button
                onClick={() => setPidViewMode("afdOnly")}
                className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold border transition ${
                  pidViewMode === "afdOnly"
                    ? "bg-cyan-600 text-white border-cyan-500"
                    : "border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                AFD-201 Active Freeze Dryer Installation
              </button>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]" style={{ color: cad.textMuted }}>
              <span>[Top] [2D Wireframe]</span>
              <span>GRID: 20mm</span>
              <span>SNAP: ON</span>
              <span className="text-cyan-500 font-bold">CLICK ANY EQUIPMENT / BALLOON TO INSPECT</span>
            </div>
          </div>

          {/* Side-by-Side or Full Canvas Grid */}
          <div
            className={`grid gap-4 ${
              pidViewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {/* -------------------------------------------------------------- */}
            {/* P&ID 1: STANDARD VACUUM DRYING INSTALLATION (VD-101) */}
            {/* -------------------------------------------------------------- */}
            {(pidViewMode === "split" || pidViewMode === "vacOnly") && (
              <div
                className="rounded-xl border p-3.5 relative overflow-hidden transition-all shadow-inner"
                style={{
                  backgroundColor: cad.bg,
                  borderColor: cad.border,
                }}
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cad.heatingOrange }}
                    />
                    <h3 className="font-bold text-xs uppercase tracking-wider font-mono">
                      DWG-001: VACUUM DRYING SYSTEM (VD-101)
                    </h3>
                  </div>
                  <span
                    className="font-mono text-[11px] px-2 py-0.5 rounded border font-semibold"
                    style={{
                      borderColor: cad.heatingOrange,
                      color: cad.heatingOrange,
                      backgroundColor: isCadDark ? "rgba(249, 115, 22, 0.1)" : "rgba(194, 65, 12, 0.1)",
                    }}
                  >
                    Moderate Vacuum: 20 – 100 mbar (Liquefaction)
                  </span>
                </div>

                {/* SVG P&ID Canvas: AutoCAD Plant 3D Vector Style */}
                <svg
                  viewBox="0 0 700 520"
                  className="w-full h-auto select-none font-mono"
                  style={{ minWidth: "550px" }}
                >
                  <defs>
                    {/* AutoCAD Background Graticule Pattern */}
                    <pattern
                      id={`cad-grid-vac-${compId}`}
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke={cad.gridLine}
                        strokeWidth="0.5"
                      />
                      <circle cx="20" cy="20" r="0.8" fill={cad.gridCross} />
                    </pattern>

                    {/* AutoCAD Arrowheads */}
                    <marker
                      id={`arr-proc-${compId}`}
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="5"
                      markerHeight="5"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill={cad.processGreen} />
                    </marker>
                    <marker
                      id={`arr-vac-${compId}`}
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="5"
                      markerHeight="5"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill={cad.vacuumCyan} />
                    </marker>
                    <marker
                      id={`arr-cool-${compId}`}
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="5"
                      markerHeight="5"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill={cad.coolingBlue} />
                    </marker>
                    <marker
                      id={`arr-heat-${compId}`}
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="5"
                      markerHeight="5"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill={cad.heatingOrange} />
                    </marker>
                  </defs>

                  {/* Canvas Grid Background */}
                  <rect width="700" height="520" fill={`url(#cad-grid-vac-${compId})`} />

                  {/* EQUIPMENT 1: CONICAL VACUUM DRYER (VD-101) */}
                  <g
                    className="cursor-pointer transition hover:opacity-80"
                    onClick={() => setSelectedTag("VD-101")}
                  >
                    {/* Heating Jacket Outline (External Offset) */}
                    <path
                      d="M 125 150 L 115 280 L 155 375 L 185 375 L 225 280 L 215 150"
                      fill="none"
                      stroke={cad.heatingOrange}
                      strokeWidth="1.8"
                      strokeDasharray="4 2"
                    />

                    {/* Jacketed Conical Body (True Nauta Shape) */}
                    <path
                      d="M 130 150 L 210 150 L 180 370 L 160 370 Z"
                      fill={cad.vesselFill}
                      stroke={selectedTag === "VD-101" ? cad.vacuumCyan : cad.metalStroke}
                      strokeWidth={selectedTag === "VD-101" ? "2.5" : "1.8"}
                    />

                    {/* Dished Top Head */}
                    <path
                      d="M 130 150 C 130 135, 210 135, 210 150 Z"
                      fill={cad.vesselFill}
                      stroke={selectedTag === "VD-101" ? cad.vacuumCyan : cad.metalStroke}
                      strokeWidth="1.8"
                    />

                    {/* Bottom Discharge Nozzle & Flange Pair */}
                    <rect x="160" y="370" width="20" height="15" fill="none" stroke={cad.metalStroke} strokeWidth="1.5" />
                    <line x1="155" y1="385" x2="185" y2="385" stroke={cad.metalStroke} strokeWidth="2.5" />
                    <line x1="155" y1="388" x2="185" y2="388" stroke={cad.metalStroke} strokeWidth="2.5" />

                    {/* Mixing Screw Axis & Helical Flights (Animated) */}
                    <line x1="195" y1="145" x2="168" y2="365" stroke={cad.textMuted} strokeWidth="2" />
                    <path
                      d="M 190 160 L 202 165 M 186 190 L 198 195 M 182 220 L 194 225 M 178 250 L 190 255 M 174 280 L 186 285 M 170 310 L 182 315 M 166 340 L 178 345"
                      stroke={cad.processGreen}
                      strokeWidth="2.5"
                    />

                    {/* Drive Motor Unit M-101 */}
                    <rect x="180" y="95" width="25" height="35" fill={cad.vesselFill} stroke={cad.metalStroke} strokeWidth="1.5" />
                    <text x="192" y="115" fill={cad.textSecondary} fontSize="8" textAnchor="middle" fontWeight="bold">M</text>
                    <line x1="192" y1="130" x2="192" y2="140" stroke={cad.metalStroke} strokeWidth="2" />

                    {/* Boiling Liquid Slurry Level in Bottom */}
                    <path
                      d="M 148 290 L 192 290 L 178 355 L 162 355 Z"
                      fill="rgba(56, 189, 248, 0.25)"
                      stroke={cad.coolingBlue}
                      strokeWidth="1"
                    />
                    {/* Boiling Bubbles Animation */}
                    <circle cx="165" cy="310" r="2.5" fill={cad.textPrimary} className="animate-ping" opacity="0.8" />
                    <circle cx="175" cy="330" r="2" fill={cad.textPrimary} className="animate-pulse" opacity="0.7" />

                    {/* Equipment Tag Callout */}
                    <text x="170" y="220" fill={cad.textPrimary} fontSize="11" fontWeight="bold" textAnchor="middle">
                      VD-101
                    </text>
                    <text x="170" y="235" fill={cad.textSecondary} fontSize="8.5" textAnchor="middle">
                      VACUUM DRYER
                    </text>
                    <text x="170" y="248" fill={cad.heatingOrange} fontSize="8" textAnchor="middle">
                      P = 40 mbar (Boiling +29°C)
                    </text>
                  </g>

                  {/* EQUIPMENT 2: TOP VAPOR DUST FILTER (FL-101) */}
                  <g
                    className="cursor-pointer transition hover:opacity-80"
                    onClick={() => setSelectedTag("FL-101")}
                  >
                    <rect x="135" y="80" width="30" height="50" rx="3" fill={cad.vesselFill} stroke={cad.metalStroke} strokeWidth="1.8" />
                    <line x1="135" y1="80" x2="165" y2="80" stroke={cad.metalStroke} strokeWidth="2" />
                    <line x1="143" y1="95" x2="143" y2="125" stroke={cad.textMuted} strokeWidth="1.5" strokeDasharray="2 1" />
                    <line x1="150" y1="95" x2="150" y2="125" stroke={cad.textMuted} strokeWidth="1.5" strokeDasharray="2 1" />
                    <line x1="157" y1="95" x2="157" y2="125" stroke={cad.textMuted} strokeWidth="1.5" strokeDasharray="2 1" />

                    <line x1="145" y1="130" x2="155" y2="130" stroke={cad.metalStroke} strokeWidth="3" />
                    <line x1="145" y1="135" x2="155" y2="135" stroke={cad.metalStroke} strokeWidth="3" />

                    <text x="150" y="72" fill={cad.textSecondary} fontSize="8.5" fontWeight="bold" textAnchor="middle">
                      FL-101
                    </text>
                  </g>

                  {/* PIPING: OVERHEAD COMPACT VAPOR LINE (DN50 / 2" SCH 10S) */}
                  <path
                    d="M 150 80 L 150 45 L 360 45 L 360 110"
                    fill="none"
                    stroke={cad.vacuumCyan}
                    strokeWidth="3.5"
                    markerEnd={`url(#arr-vac-${compId})`}
                  />
                  <path
                    d="M 150 80 L 150 45 L 360 45 L 360 110"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeDasharray="6 12"
                    className="animate-pulse"
                  />
                  <text x="250" y="38" fill={cad.vacuumCyan} fontSize="9" fontWeight="bold" textAnchor="middle">
                    2"-SS316-VAP-101 (DN50 Compact)
                  </text>

                  {/* EQUIPMENT 3: TEMA SHELL & TUBE CONDENSER (HE-101) */}
                  <g
                    className="cursor-pointer transition hover:opacity-80"
                    onClick={() => setSelectedTag("HE-101")}
                  >
                    <rect x="330" y="110" width="60" height="150" rx="10" fill={cad.vesselFill} stroke={selectedTag === "HE-101" ? cad.vacuumCyan : cad.coolingBlue} strokeWidth="2" />
                    
                    <line x1="330" y1="130" x2="390" y2="130" stroke={cad.metalStroke} strokeWidth="2" />
                    <line x1="330" y1="240" x2="390" y2="240" stroke={cad.metalStroke} strokeWidth="2" />

                    <line x1="345" y1="130" x2="345" y2="240" stroke={cad.coolingBlue} strokeWidth="1.2" strokeDasharray="3 2" />
                    <line x1="360" y1="130" x2="360" y2="240" stroke={cad.coolingBlue} strokeWidth="1.2" strokeDasharray="3 2" />
                    <line x1="375" y1="130" x2="375" y2="240" stroke={cad.coolingBlue} strokeWidth="1.2" strokeDasharray="3 2" />

                    <line x1="390" y1="220" x2="440" y2="220" stroke={cad.coolingBlue} strokeWidth="2" markerStart={`url(#arr-cool-${compId})`} />
                    <text x="445" y="223" fill={cad.coolingBlue} fontSize="7.5">CWS (+15°C)</text>

                    <line x1="390" y1="150" x2="440" y2="150" stroke={cad.coolingBlue} strokeWidth="2" markerEnd={`url(#arr-cool-${compId})`} />
                    <text x="445" y="153" fill={cad.coolingBlue} fontSize="7.5">CWR (+19°C)</text>

                    <text x="360" y="180" fill={cad.textPrimary} fontSize="10" fontWeight="bold" textAnchor="middle">
                      HE-101
                    </text>
                    <text x="360" y="195" fill={cad.textSecondary} fontSize="8" textAnchor="middle">
                      TEMA CONDENSER
                    </text>
                    <text x="360" y="208" fill={cad.coolingBlue} fontSize="7.5" textAnchor="middle">
                      Vapor ➔ Liquid
                    </text>
                  </g>

                  {/* EQUIPMENT 4: SOLVENT RECEIVER TANK (TK-101) */}
                  <g
                    className="cursor-pointer transition hover:opacity-80"
                    onClick={() => setSelectedTag("TK-101")}
                  >
                    <line x1="360" y1="260" x2="360" y2="330" stroke={cad.processGreen} strokeWidth="2.5" markerEnd={`url(#arr-proc-${compId})`} />
                    <circle cx="360" cy="285" r="2.5" fill={cad.processGreen} className="animate-bounce" />

                    <rect x="330" y="330" width="60" height="90" rx="8" fill={cad.vesselFill} stroke={selectedTag === "TK-101" ? cad.vacuumCyan : cad.metalStroke} strokeWidth="1.8" />
                    <rect x="333" y="375" width="54" height="42" rx="4" fill="rgba(4, 120, 87, 0.3)" stroke={cad.processGreen} strokeWidth="1" />
                    
                    <text x="360" y="360" fill={cad.textPrimary} fontSize="9.5" fontWeight="bold" textAnchor="middle">
                      TK-101
                    </text>
                    <text x="360" y="395" fill={cad.processGreen} fontSize="8.5" fontWeight="bold" textAnchor="middle">
                      LIQUID SOLVENT
                    </text>
                    <text x="360" y="408" fill={cad.textMuted} fontSize="7.5" textAnchor="middle">
                      {solventMassKg.toFixed(1)} kg Collected
                    </text>

                    <line x1="360" y1="420" x2="360" y2="455" stroke={cad.processGreen} strokeWidth="2" />
                    <path d="M 353 435 L 367 445 L 353 445 L 367 435 Z" fill={cad.balloonFill} stroke={cad.metalStroke} strokeWidth="1.2" />
                    <text x="375" y="442" fill={cad.textSecondary} fontSize="7.5">HV-102 (Drain)</text>
                  </g>

                  {/* EQUIPMENT 5: VACUUM PUMP SKID (VP-101) */}
                  <g
                    className="cursor-pointer transition hover:opacity-80"
                    onClick={() => setSelectedTag("VP-101")}
                  >
                    <path
                      d="M 360 110 L 360 85 L 530 85 L 530 180"
                      fill="none"
                      stroke={cad.vacuumCyan}
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      markerEnd={`url(#arr-vac-${compId})`}
                    />
                    <text x="445" y="78" fill={cad.vacuumCyan} fontSize="8">
                      1.5"-VAC-101 (Non-condensables)
                    </text>

                    <circle cx="530" cy="205" r="25" fill={cad.vesselFill} stroke={selectedTag === "VP-101" ? cad.vacuumCyan : cad.metalStroke} strokeWidth="2" />
                    <path d="M 515 205 L 545 190 L 545 220 Z" fill={cad.textMuted} />
                    <text x="530" y="242" fill={cad.textPrimary} fontSize="9.5" fontWeight="bold" textAnchor="middle">
                      VP-101
                    </text>
                    <text x="530" y="254" fill={cad.textSecondary} fontSize="8" textAnchor="middle">
                      VACUUM PUMP
                    </text>

                    <rect x="590" y="160" width="30" height="70" rx="5" fill={cad.vesselFill} stroke={cad.metalStroke} strokeWidth="1.2" />
                    <line x1="555" y1="205" x2="590" y2="205" stroke={cad.metalStroke} strokeWidth="1.5" />
                    <text x="605" y="152" fill={cad.textMuted} fontSize="7.5" textAnchor="middle">HE-102</text>
                    <text x="605" y="242" fill={cad.textMuted} fontSize="7" textAnchor="middle">EXHAUST COND</text>
                  </g>

                  {/* ISA-5.1 INSTRUMENT BALLOONS */}
                  <g className="cursor-pointer" onClick={() => setSelectedTag("VD-101")}>
                    <line x1="130" y1="180" x2="70" y2="180" stroke={cad.vacuumCyan} strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="50" cy="180" r="14" fill={cad.balloonFill} stroke={cad.balloonStroke} strokeWidth="1.5" />
                    <line x1="36" y1="180" x2="64" y2="180" stroke={cad.balloonStroke} strokeWidth="1" />
                    <text x="50" y="174" fill={cad.textPrimary} fontSize="8" fontWeight="bold" textAnchor="middle">PI</text>
                    <text x="50" y="190" fill={cad.textSecondary} fontSize="7.5" textAnchor="middle">101</text>
                  </g>

                  <g className="cursor-pointer" onClick={() => setSelectedTag("VD-101")}>
                    <line x1="145" y1="330" x2="70" y2="330" stroke={cad.heatingOrange} strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="50" cy="330" r="14" fill={cad.balloonFill} stroke={cad.heatingOrange} strokeWidth="1.5" />
                    <line x1="36" y1="330" x2="64" y2="330" stroke={cad.heatingOrange} strokeWidth="1" />
                    <text x="50" y="324" fill={cad.textPrimary} fontSize="8" fontWeight="bold" textAnchor="middle">TI</text>
                    <text x="50" y="340" fill={cad.textSecondary} fontSize="7.5" textAnchor="middle">101</text>
                  </g>

                  <g className="cursor-pointer" onClick={() => setSelectedTag("TK-101")}>
                    <line x1="390" y1="360" x2="450" y2="360" stroke={cad.processGreen} strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="470" cy="360" r="14" fill={cad.balloonFill} stroke={cad.processGreen} strokeWidth="1.5" />
                    <line x1="456" y1="360" x2="484" y2="360" stroke={cad.processGreen} strokeWidth="1" />
                    <text x="470" y="354" fill={cad.textPrimary} fontSize="8" fontWeight="bold" textAnchor="middle">LI</text>
                    <text x="470" y="370" fill={cad.textSecondary} fontSize="7.5" textAnchor="middle">101</text>
                  </g>

                  {/* Status Banner */}
                  <rect x="20" y="475" width="660" height="30" rx="4" fill={cad.panelBg} stroke={cad.border} strokeWidth="1" />
                  <text x="35" y="494" fill={cad.processGreen} fontSize="9" fontWeight="bold">
                    ● BATCH STATUS: CONTINUOUS DRAINAGE
                  </text>
                  <text x="260" y="494" fill={cad.textSecondary} fontSize="8.5">
                    Solvent condenses continuously into TK-101. Turnaround penalty = 0 min.
                  </text>
                  <text x="650" y="494" fill={cad.textMuted} fontSize="8" textAnchor="end">
                    TEMA SHELL & TUBE CONDENSER
                  </text>
                </svg>
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* P&ID 2: ACTIVE FREEZE DRYING INSTALLATION (AFD-201) */}
            {/* -------------------------------------------------------------- */}
            {(pidViewMode === "split" || pidViewMode === "afdOnly") && (
              <div
                className="rounded-xl border p-3.5 relative overflow-hidden transition-all shadow-inner"
                style={{
                  backgroundColor: cad.bg,
                  borderColor: cad.border,
                }}
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cad.vacuumCyan }}
                    />
                    <h3 className="font-bold text-xs uppercase tracking-wider font-mono">
                      DWG-002: ACTIVE FREEZE DRYING SYSTEM (AFD-201)
                    </h3>
                  </div>
                  <span
                    className="font-mono text-[11px] px-2 py-0.5 rounded border font-semibold"
                    style={{
                      borderColor: cad.vacuumCyan,
                      color: cad.vacuumCyan,
                      backgroundColor: isCadDark ? "rgba(0, 229, 255, 0.1)" : "rgba(2, 132, 199, 0.1)",
                    }}
                  >
                    Deep Vacuum: &lt; 1 mbar (Solid Sublimation)
                  </span>
                </div>

                {/* SVG P&ID Canvas: AutoCAD Plant 3D Vector Style */}
                <svg
                  viewBox="0 0 700 520"
                  className="w-full h-auto select-none font-mono"
                  style={{ minWidth: "550px" }}
                >
                  <defs>
                    <pattern
                      id={`cad-grid-afd-${compId}`}
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke={cad.gridLine}
                        strokeWidth="0.5"
                      />
                      <circle cx="20" cy="20" r="0.8" fill={cad.gridCross} />
                    </pattern>
                  </defs>

                  {/* Canvas Grid Background */}
                  <rect width="700" height="520" fill={`url(#cad-grid-afd-${compId})`} />

                  {/* EQUIPMENT 1: CONICAL AFD VESSEL (AFD-201) */}
                  <g
                    className="cursor-pointer transition hover:opacity-80"
                    onClick={() => setSelectedTag("AFD-201")}
                  >
                    {/* Cryogenic Thermal Jacket with Vacuum Insulation */}
                    <path
                      d="M 120 150 L 110 280 L 150 375 L 190 375 L 230 280 L 220 150"
                      fill="none"
                      stroke={cad.cryoIndigo}
                      strokeWidth="2"
                      strokeDasharray="5 2"
                    />

                    {/* Conical Vessel Shell (Hastelloy C-22 Mirror Polish) */}
                    <path
                      d="M 128 150 L 212 150 L 182 370 L 158 370 Z"
                      fill={cad.vesselFill}
                      stroke={selectedTag === "AFD-201" ? cad.vacuumCyan : cad.metalStroke}
                      strokeWidth={selectedTag === "AFD-201" ? "2.5" : "1.8"}
                    />

                    {/* Dished Top Head */}
                    <path
                      d="M 128 150 C 128 132, 212 132, 212 150 Z"
                      fill={cad.vesselFill}
                      stroke={selectedTag === "AFD-201" ? cad.vacuumCyan : cad.metalStroke}
                      strokeWidth="1.8"
                    />

                    {/* Cantilevered Top Drive Unit M-201 (NL 2026893 B1 - No Bottom Bearing!) */}
                    <rect x="180" y="85" width="28" height="42" fill={cad.vesselFill} stroke={cad.metalStroke} strokeWidth="1.8" />
                    <text x="194" y="108" fill={cad.vacuumCyan} fontSize="8.5" textAnchor="middle" fontWeight="bold">M/VFD</text>
                    <text x="194" y="120" fill={cad.textMuted} fontSize="6.5" textAnchor="middle">NL'893</text>

                    {/* Orbiting Cantilevered Screw (No Bottom Support!) */}
                    <line x1="195" y1="140" x2="168" y2="350" stroke={cad.metalStroke} strokeWidth="2.5" />
                    <path
                      d="M 190 155 L 202 160 M 186 185 L 198 190 M 182 215 L 194 220 M 178 245 L 190 250 M 174 275 L 186 280 M 170 305 L 182 310 M 166 335 L 178 340"
                      stroke={cad.vacuumCyan}
                      strokeWidth="2.5"
                    />
                    <line x1="168" y1="352" x2="168" y2="368" stroke={cad.vacuumCyan} strokeWidth="1" strokeDasharray="1 1" />

                    {/* Bottom Zero-Deadleg Flush Discharge Valve XV-201 */}
                    <rect x="158" y="370" width="24" height="18" fill="none" stroke={cad.metalStroke} strokeWidth="1.5" />
                    <line x1="150" y1="388" x2="190" y2="388" stroke={cad.metalStroke} strokeWidth="2.5" />
                    <line x1="150" y1="391" x2="190" y2="391" stroke={cad.metalStroke} strokeWidth="2.5" />
                    <path d="M 170 388 L 170 410" stroke={cad.metalStroke} strokeWidth="2" />
                    <circle cx="170" cy="415" r="5" fill={cad.processGreen} stroke={cad.metalStroke} strokeWidth="1" />

                    {/* Frozen Granular Bed Inside Vessel (-25°C Solid Ice Granules) */}
                    <g opacity="0.85">
                      <circle cx="160" cy="310" r="3" fill="#ffffff" stroke={cad.vacuumCyan} strokeWidth="0.8" />
                      <circle cx="172" cy="315" r="2.8" fill="#ffffff" stroke={cad.vacuumCyan} strokeWidth="0.8" />
                      <circle cx="180" cy="325" r="3.2" fill="#ffffff" stroke={cad.vacuumCyan} strokeWidth="0.8" />
                      <circle cx="165" cy="335" r="2.6" fill="#ffffff" stroke={cad.vacuumCyan} strokeWidth="0.8" />
                      <circle cx="176" cy="345" r="3.0" fill="#ffffff" stroke={cad.vacuumCyan} strokeWidth="0.8" />
                      <circle cx="168" cy="358" r="2.4" fill="#ffffff" stroke={cad.vacuumCyan} strokeWidth="0.8" />
                    </g>

                    <text x="170" y="215" fill={cad.textPrimary} fontSize="11" fontWeight="bold" textAnchor="middle">
                      AFD-201
                    </text>
                    <text x="170" y="230" fill={cad.vacuumCyan} fontSize="8.5" fontWeight="bold" textAnchor="middle">
                      ACTIVE FREEZE DRYER
                    </text>
                    <text x="170" y="244" fill={cad.textSecondary} fontSize="8" textAnchor="middle">
                      P = 0.15 mbar (&lt; 6.11 mbar)
                    </text>
                    <text x="170" y="258" fill={cad.cryoIndigo} fontSize="8" textAnchor="middle">
                      Bed: -25°C (Solid Granules)
                    </text>
                  </g>

                  {/* EQUIPMENT 2: HEATED VAPOR DUST FILTER (FL-201) */}
                  <g
                    className="cursor-pointer transition hover:opacity-80"
                    onClick={() => setSelectedTag("FL-201")}
                  >
                    <rect x="130" y="70" width="36" height="58" rx="4" fill={cad.vesselFill} stroke={selectedTag === "FL-201" ? cad.vacuumCyan : cad.metalStroke} strokeWidth="1.8" />
                    <rect x="127" y="73" width="42" height="52" rx="4" fill="none" stroke={cad.heatingOrange} strokeWidth="1.2" strokeDasharray="3 1" />
                    
                    <line x1="140" y1="85" x2="140" y2="120" stroke={cad.textMuted} strokeWidth="1.5" strokeDasharray="2 1" />
                    <line x1="148" y1="85" x2="148" y2="120" stroke={cad.textMuted} strokeWidth="1.5" strokeDasharray="2 1" />
                    <line x1="156" y1="85" x2="156" y2="120" stroke={cad.textMuted} strokeWidth="1.5" strokeDasharray="2 1" />

                    <text x="148" y="62" fill={cad.textPrimary} fontSize="8.5" fontWeight="bold" textAnchor="middle">
                      FL-201
                    </text>
                    <text x="148" y="112" fill={cad.heatingOrange} fontSize="6.5" textAnchor="middle">
                      HEATED +35°C
                    </text>
                  </g>

                  {/* OVERSIZED SUBLIMATION VAPOR DUCT (DN250 / 10" OVERHEAD!) */}
                  <path
                    d="M 148 70 L 148 35 L 360 35 L 360 110"
                    fill="none"
                    stroke={cad.vacuumCyan}
                    strokeWidth="10"
                    strokeLinecap="round"
                    markerEnd={`url(#arr-vac-${compId})`}
                  />
                  <path
                    d="M 148 70 L 148 35 L 360 35 L 360 110"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeDasharray="8 14"
                    className="animate-pulse"
                  />
                  <rect x="240" y="27" width="26" height="16" fill={cad.balloonFill} stroke={cad.vacuumCyan} strokeWidth="1.5" />
                  <line x1="253" y1="27" x2="253" y2="43" stroke={cad.vacuumCyan} strokeWidth="2" />
                  <text x="253" y="22" fill={cad.vacuumCyan} fontSize="7.5" fontWeight="bold" textAnchor="middle">HV-201 (DN250)</text>

                  <text x="310" y="58" fill={cad.vacuumCyan} fontSize="8.5" fontWeight="bold" textAnchor="middle">
                    10"-SS316L-SUBLIM-201 (&gt;220x Volume!)
                  </text>

                  {/* EQUIPMENT 3: CRYOGENIC COLD TRAP (CT-201) */}
                  <g
                    className="cursor-pointer transition hover:opacity-80"
                    onClick={() => setSelectedTag("CT-201")}
                  >
                    <rect x="315" y="110" width="90" height="175" rx="12" fill={cad.vesselFill} stroke={selectedTag === "CT-201" ? cad.vacuumCyan : cad.cryoIndigo} strokeWidth="2.2" />

                    <path
                      d="M 330 140 L 390 140 M 330 160 L 390 160 M 330 180 L 390 180 M 330 200 L 390 200 M 330 220 L 390 220 M 330 240 L 390 240"
                      stroke={cad.vacuumCyan}
                      strokeWidth="4"
                    />

                    <path
                      d="M 326 138 L 394 138 M 326 158 L 394 158 M 326 178 L 394 178 M 326 198 L 394 198 M 326 218 L 394 218 M 326 238 L 394 238"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeDasharray="2 1"
                      opacity="0.9"
                    />

                    <line x1="405" y1="160" x2="465" y2="160" stroke={cad.cryoIndigo} strokeWidth="2.5" markerStart={`url(#arr-cool-${compId})`} />
                    <text x="470" y="163" fill={cad.cryoIndigo} fontSize="7.5">REF-S (-75°C)</text>

                    <line x1="405" y1="220" x2="465" y2="220" stroke={cad.cryoIndigo} strokeWidth="2.5" markerEnd={`url(#arr-cool-${compId})`} />
                    <text x="470" y="223" fill={cad.cryoIndigo} fontSize="7.5">REF-R (-68°C)</text>

                    <line x1="360" y1="95" x2="360" y2="110" stroke={cad.heatingOrange} strokeWidth="2" />
                    <text x="360" y="90" fill={cad.heatingOrange} fontSize="7.5" textAnchor="middle">DEFROST STEAM IN</text>

                    <line x1="360" y1="285" x2="360" y2="320" stroke={cad.metalStroke} strokeWidth="2" />
                    <path d="M 353 300 L 367 310 L 353 310 L 367 300 Z" fill={cad.balloonFill} stroke={cad.metalStroke} strokeWidth="1.2" />
                    <text x="375" y="307" fill={cad.textMuted} fontSize="7.5">XV-203 (Melt Dump)</text>

                    <text x="360" y="130" fill={cad.textPrimary} fontSize="11" fontWeight="bold" textAnchor="middle">
                      CT-201
                    </text>
                    <text x="360" y="260" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      SOLID ICE CAKE
                    </text>
                    <text x="360" y="272" fill={cad.vacuumCyan} fontSize="7.5" textAnchor="middle">
                      NO LIQUID FORMED
                    </text>
                  </g>

                  {/* EQUIPMENT 4: HIGH-VACUUM PUMPING SKID (VP-201A/B) */}
                  <g
                    className="cursor-pointer transition hover:opacity-80"
                    onClick={() => setSelectedTag("VP-201")}
                  >
                    <path
                      d="M 405 250 L 530 250 L 530 205"
                      fill="none"
                      stroke={cad.vacuumCyan}
                      strokeWidth="3"
                      markerEnd={`url(#arr-vac-${compId})`}
                    />
                    <text x="470" y="243" fill={cad.vacuumCyan} fontSize="8">
                      4"-VAC-201 (Non-condensables)
                    </text>

                    <circle cx="530" cy="180" r="22" fill={cad.vesselFill} stroke={selectedTag === "VP-201" ? cad.vacuumCyan : cad.metalStroke} strokeWidth="2" />
                    <circle cx="522" cy="180" r="7" fill="none" stroke={cad.textMuted} strokeWidth="1.5" />
                    <circle cx="538" cy="180" r="7" fill="none" stroke={cad.textMuted} strokeWidth="1.5" />
                    <text x="530" y="152" fill={cad.textPrimary} fontSize="8.5" fontWeight="bold" textAnchor="middle">
                      VP-201A (ROOTS)
                    </text>

                    <line x1="530" y1="202" x2="530" y2="225" stroke={cad.metalStroke} strokeWidth="2" />

                    <rect x="510" y="225" width="40" height="30" rx="3" fill={cad.vesselFill} stroke={cad.metalStroke} strokeWidth="1.8" />
                    <text x="530" y="243" fill={cad.textPrimary} fontSize="8" fontWeight="bold" textAnchor="middle">
                      VP-201B
                    </text>
                    <text x="530" y="270" fill={cad.textSecondary} fontSize="7.5" textAnchor="middle">
                      DRY SCREW BACKING
                    </text>
                  </g>

                  {/* INSTRUMENTATION BALLOONS (ISA-5.1 STANDARD) */}
                  <g className="cursor-pointer" onClick={() => setSelectedTag("AFD-201")}>
                    <line x1="128" y1="180" x2="68" y2="180" stroke={cad.vacuumCyan} strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="48" cy="180" r="14" fill={cad.balloonFill} stroke={cad.vacuumCyan} strokeWidth="1.5" />
                    <line x1="34" y1="180" x2="62" y2="180" stroke={cad.vacuumCyan} strokeWidth="1" />
                    <text x="48" y="174" fill={cad.textPrimary} fontSize="7.5" fontWeight="bold" textAnchor="middle">PIT</text>
                    <text x="48" y="190" fill={cad.textSecondary} fontSize="7" textAnchor="middle">201A</text>
                  </g>

                  <g className="cursor-pointer" onClick={() => setSelectedTag("AFD-201")}>
                    <line x1="145" y1="330" x2="68" y2="330" stroke={cad.cryoIndigo} strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="48" cy="330" r="14" fill={cad.balloonFill} stroke={cad.cryoIndigo} strokeWidth="1.5" />
                    <line x1="34" y1="330" x2="62" y2="330" stroke={cad.cryoIndigo} strokeWidth="1" />
                    <text x="48" y="324" fill={cad.textPrimary} fontSize="7.5" fontWeight="bold" textAnchor="middle">TIT</text>
                    <text x="48" y="340" fill={cad.textSecondary} fontSize="7" textAnchor="middle">201</text>
                  </g>

                  <g className="cursor-pointer" onClick={() => setSelectedTag("CT-201")}>
                    <line x1="330" y1="200" x2="270" y2="200" stroke={cad.vacuumCyan} strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="250" cy="200" r="14" fill={cad.balloonFill} stroke={cad.vacuumCyan} strokeWidth="1.5" />
                    <line x1="236" y1="200" x2="264" y2="200" stroke={cad.vacuumCyan} strokeWidth="1" />
                    <text x="250" y="194" fill={cad.textPrimary} fontSize="7.5" fontWeight="bold" textAnchor="middle">TIT</text>
                    <text x="250" y="210" fill={cad.textSecondary} fontSize="7" textAnchor="middle">203</text>
                  </g>

                  {/* Status Banner */}
                  <rect x="20" y="475" width="660" height="30" rx="4" fill={cad.panelBg} stroke={cad.border} strokeWidth="1" />
                  <text x="35" y="494" fill={cad.vacuumCyan} fontSize="9" fontWeight="bold">
                    ● BATCH STATUS: SOLID ICE TRAPPED (DEFROST MANDATORY)
                  </text>
                  <text x="315" y="494" fill={cad.textSecondary} fontSize="8.5">
                    Ice cake builds up on CT-201 coils. Requires 45–90 min thermal defrost before restart.
                  </text>
                  <text x="650" y="494" fill={cad.textMuted} fontSize="8" textAnchor="end">
                    CRYOGENIC COLD TRAP
                  </text>
                </svg>
              </div>
            )}
          </div>

          {/* AUTOCAD PLANT 3D PROPERTY INSPECTOR PANEL */}
          <div
            className="rounded-xl border p-4 transition-colors font-mono"
            style={{ backgroundColor: cad.cardBg, borderColor: cad.border }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 mb-3" style={{ borderColor: cad.border }}>
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <FileText className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tracking-tight text-blue-500">
                      TAG: {selectedSpec.tag} — {selectedSpec.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedSpec.system === "vac" ? "Vacuum Dryer Route" : "Active Freeze Dryer Route"}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: cad.textSecondary }}>
                    Service: {selectedSpec.service}
                  </span>
                </div>
              </div>

              {/* Tag Quick Selector Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {Object.keys(PID_SPECS).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                      selectedTag === tag
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Spec Attributes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs mb-3">
              <div className="p-2.5 rounded-lg border" style={{ backgroundColor: cad.panelBg, borderColor: cad.border }}>
                <span className="text-[10px] block" style={{ color: cad.textMuted }}>P&ID PIPING SPEC:</span>
                <span className="font-semibold font-mono" style={{ color: cad.textPrimary }}>{selectedSpec.spec}</span>
              </div>
              <div className="p-2.5 rounded-lg border" style={{ backgroundColor: cad.panelBg, borderColor: cad.border }}>
                <span className="text-[10px] block" style={{ color: cad.textMuted }}>DESIGN PRESSURE (P_des):</span>
                <span className="font-semibold font-mono text-cyan-500">{selectedSpec.designP}</span>
              </div>
              <div className="p-2.5 rounded-lg border" style={{ backgroundColor: cad.panelBg, borderColor: cad.border }}>
                <span className="text-[10px] block" style={{ color: cad.textMuted }}>DESIGN TEMPERATURE (T_des):</span>
                <span className="font-semibold font-mono text-amber-500">{selectedSpec.designT}</span>
              </div>
              <div className="p-2.5 rounded-lg border" style={{ backgroundColor: cad.panelBg, borderColor: cad.border }}>
                <span className="text-[10px] block" style={{ color: cad.textMuted }}>MATERIAL OF CONSTRUCTION:</span>
                <span className="font-semibold font-mono" style={{ color: cad.textPrimary }}>{selectedSpec.moc}</span>
              </div>
            </div>

            {/* Live Telemetry Sensor Channels */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {selectedSpec.telemetry.map((t, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded border flex items-center justify-between"
                  style={{ backgroundColor: cad.bg, borderColor: cad.border }}
                >
                  <span className="text-[10px]" style={{ color: cad.textSecondary }}>{t.label}:</span>
                  <span
                    className={`font-bold font-mono text-[11px] ${
                      t.status === "warn"
                        ? "text-amber-500"
                        : t.status === "active"
                        ? "text-cyan-400"
                        : "text-emerald-500"
                    }`}
                  >
                    {t.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: HOSOKAWA SCADA CURVES */}
      {/* ==================================================================== */}
      {activeTab === "scadaCurves" && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>Hosokawa Micron B.V. Actual SCADA Trend Archive</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
                  Multi-Batch Telemetry Verification
                </span>
              </h3>
              <p style={{ color: cad.textSecondary }}>
                Real production SCADA curves demonstrating agitator drive frequency, cold trap coil temperature (-75°C), jacket ramp, product bed sublimation plateau (-25°C), and chamber vacuum.
              </p>
            </div>

            {/* Time Scrubber Controls */}
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[11px]" style={{ color: cad.textMuted }}>BATCH TIME:</span>
              <span className="text-sm font-bold text-cyan-400">
                {activeScadaPoint.timeHours.toFixed(1)} h
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                {activeScadaPoint.phase}
              </span>
            </div>
          </div>

          {/* Time Scrubber Slider */}
          <div className="p-3 rounded-xl border space-y-2" style={{ backgroundColor: cad.bg, borderColor: cad.border }}>
            <div className="flex items-center justify-between text-xs font-mono" style={{ color: cad.textMuted }}>
              <span>Phase 1: Inoculation & Freezing (0h)</span>
              <span>Phase 2: Primary Sublimation (3h–18h)</span>
              <span>Phase 3: Secondary Desorption (21h–24h)</span>
              <span>Phase 4: Defrost (26h)</span>
            </div>
            <input
              type="range"
              min={0}
              max={HOSOKAWA_SCADA_DATA.length - 1}
              step={1}
              value={scadaTimeIdx}
              onChange={(e) => setScadaTimeIdx(parseInt(e.target.value, 10))}
              className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Interactive SCADA Curve SVG Plot */}
          <div
            className="rounded-xl border p-4 overflow-x-auto shadow-inner"
            style={{ backgroundColor: cad.bg, borderColor: cad.border }}
          >
            <svg viewBox="0 0 900 420" className="w-full h-auto select-none font-mono" style={{ minWidth: "750px" }}>
              {/* Grid Lines */}
              <g stroke={cad.gridLine} strokeWidth="0.8">
                <line x1="80" y1="40" x2="820" y2="40" />
                <line x1="80" y1="90" x2="820" y2="90" />
                <line x1="80" y1="140" x2="820" y2="140" />
                <line x1="80" y1="190" x2="820" y2="190" />
                <line x1="80" y1="240" x2="820" y2="240" />
                <line x1="80" y1="290" x2="820" y2="290" />
                <line x1="80" y1="340" x2="820" y2="340" />

                <line x1="80" y1="40" x2="80" y2="340" />
                <line x1="200" y1="40" x2="200" y2="340" />
                <line x1="360" y1="40" x2="360" y2="340" />
                <line x1="520" y1="40" x2="520" y2="340" />
                <line x1="680" y1="40" x2="680" y2="340" />
                <line x1="820" y1="40" x2="820" y2="340" />
              </g>

              {/* Left Y-Axis */}
              <text x="30" y="200" fill={cad.textPrimary} fontSize="11" fontWeight="bold" textAnchor="middle" transform="rotate(-90, 30, 200)">
                Temp. [°C]
              </text>
              <g fill={cad.textSecondary} fontSize="9" textAnchor="end">
                <text x="75" y="44">+80</text>
                <text x="75" y="94">+50</text>
                <text x="75" y="144">+20</text>
                <text x="75" y="194">0</text>
                <text x="75" y="244">-25</text>
                <text x="75" y="294">-60</text>
                <text x="75" y="344">-100</text>
              </g>

              {/* Right Y-Axis */}
              <text x="870" y="200" fill={cad.textPrimary} fontSize="11" fontWeight="bold" textAnchor="middle" transform="rotate(90, 870, 200)">
                Pressure [mbar] (Log)
              </text>
              <g fill={cad.textSecondary} fontSize="9" textAnchor="start">
                <text x="825" y="44">1000.00</text>
                <text x="825" y="104">100.00</text>
                <text x="825" y="164">10.00</text>
                <text x="825" y="224">1.00</text>
                <text x="825" y="284">0.10</text>
                <text x="825" y="344">0.01</text>
              </g>

              {/* X-Axis */}
              <g fill={cad.textSecondary} fontSize="8.5" textAnchor="middle">
                <text x="80" y="360">12-11-2007 12:00</text>
                <text x="260" y="360">13-11-2007 0:00</text>
                <text x="460" y="360">13-11-2007 12:00</text>
                <text x="640" y="360">14-11-2007 0:00</text>
                <text x="820" y="360">14-11-2007 12:00</text>
                <text x="450" y="385" fill={cad.textPrimary} fontSize="10" fontWeight="bold">date / time</text>
              </g>

              {/* SCADA Traces */}
              {/* 1. hz - Dark Blue */}
              <path
                d="M 80 100 L 110 50 L 130 70 L 150 145 L 430 145 L 460 330 L 480 145 L 750 145 L 780 70 L 820 70"
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="2.5"
              />

              {/* 2. T-cond - Hot Pink */}
              <path
                d="M 80 140 L 95 240 L 120 290 L 150 315 L 430 325 L 450 310 L 470 330 L 750 330 L 780 325 L 820 325"
                fill="none"
                stroke="#ec4899"
                strokeWidth="2.8"
                strokeDasharray="4 1"
              />

              {/* 3. T-jacket - Bright Yellow */}
              <path
                d="M 80 150 L 110 220 L 150 200 L 220 165 L 400 160 L 420 100 L 450 60 L 480 230 L 520 185 L 680 180 L 750 150 L 780 60 L 820 60"
                fill="none"
                stroke="#eab308"
                strokeWidth="2.8"
              />

              {/* 4. T-product - Cyan */}
              <path
                d="M 80 145 L 110 200 L 135 240 L 160 235 L 410 228 L 430 220 L 450 70 L 480 238 L 520 215 L 700 210 L 750 160 L 780 70 L 820 70"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.8"
              />

              {/* 5. vac dryer - Green */}
              <path
                d="M 80 40 L 110 50 L 125 150 L 150 275 L 420 288 L 450 50 L 480 285 L 750 295 L 780 320 L 820 325"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
              />

              {/* Cursor */}
              {(() => {
                const cursorX = 80 + (scadaTimeIdx / (HOSOKAWA_SCADA_DATA.length - 1)) * (820 - 80);
                return (
                  <g>
                    <line x1={cursorX} y1="35" x2={cursorX} y2="345" stroke="#ffffff" strokeWidth="1.8" strokeDasharray="4 3" />
                    <circle cx={cursorX} cy="35" r="4" fill="#38bdf8" />
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Legend and Live Readout Table */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg border flex flex-col justify-between" style={{ backgroundColor: cad.cardBg, borderColor: cad.border }}>
              <span className="flex items-center gap-1.5 font-bold text-blue-500">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                hz (Agitator):
              </span>
              <span className="text-sm font-extrabold">{activeScadaPoint.hz} Hz</span>
            </div>

            <div className="p-2.5 rounded-lg border flex flex-col justify-between" style={{ backgroundColor: cad.cardBg, borderColor: cad.border }}>
              <span className="flex items-center gap-1.5 font-bold text-pink-500">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                T-cond:
              </span>
              <span className="text-sm font-extrabold text-pink-400">{activeScadaPoint.tCond} °C</span>
            </div>

            <div className="p-2.5 rounded-lg border flex flex-col justify-between" style={{ backgroundColor: cad.cardBg, borderColor: cad.border }}>
              <span className="flex items-center gap-1.5 font-bold text-yellow-500">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                T-jacket:
              </span>
              <span className="text-sm font-extrabold text-yellow-400">+{activeScadaPoint.tJacket} °C</span>
            </div>

            <div className="p-2.5 rounded-lg border flex flex-col justify-between" style={{ backgroundColor: cad.cardBg, borderColor: cad.border }}>
              <span className="flex items-center gap-1.5 font-bold text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                T-product:
              </span>
              <span className="text-sm font-extrabold text-cyan-300">{activeScadaPoint.tProduct} °C</span>
            </div>

            <div className="p-2.5 rounded-lg border flex flex-col justify-between" style={{ backgroundColor: cad.cardBg, borderColor: cad.border }}>
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                vac dryer:
              </span>
              <span className="text-sm font-extrabold text-emerald-300">{activeScadaPoint.vacDryer} mbar</span>
            </div>

            <div className="p-2.5 rounded-lg border flex flex-col justify-between" style={{ backgroundColor: cad.cardBg, borderColor: cad.border }}>
              <span className="flex items-center gap-1.5 font-bold text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                vac filter:
              </span>
              <span className="text-sm font-extrabold text-blue-300">{activeScadaPoint.vacFilter} mbar</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: 7-STEP PROCESS STEPPER */}
      {/* ==================================================================== */}
      {activeTab === "stepper" && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="text-base font-bold">Synchronized 7-Step Divergence Stepper</h3>
              <p style={{ color: cad.textSecondary }}>
                Walk through the 7 physical process steps from slurry feed to final product discharge and turnaround.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition text-xs ${
                  isPlaying ? "bg-amber-600 text-white" : "bg-blue-600 text-white hover:bg-blue-500"
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? "Pause Auto-Step" : "Auto-Play Steps"}</span>
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStep(1);
                }}
                className="p-1.5 rounded-lg border hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                style={{ borderColor: cad.border }}
                title="Reset to Step 1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stepper Buttons (1 to 7) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <button
                key={num}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStep(num);
                }}
                className={`py-2 px-1 text-center rounded-lg border transition font-mono ${
                  currentStep === num
                    ? "bg-blue-600 text-white font-bold border-blue-400 shadow-md"
                    : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
                }`}
                style={{ borderColor: currentStep === num ? undefined : cad.border }}
              >
                <div className="text-[10px] uppercase tracking-wider">Step</div>
                <div className="text-sm font-bold">{num}</div>
              </button>
            ))}
          </div>

          {/* Step Comparison Cards Side-by-Side */}
          {(() => {
            const stepTitles = [
              "Step 1: Preparing & Loading the Material",
              "Step 2: Establishing System Vacuum",
              "Step 3: Applying Heat Energy",
              "Step 4: Vapor Traveling to Condenser",
              "Step 5: How Condenser Traps Vapor",
              "Step 6: Discharging Final Product",
              "Step 7: Post-Batch Turnaround & Cleanup",
            ];
            const vacTexts = [
              "Wet slurry loaded at ambient (+20°C). Product remains 100% liquid phase.",
              "Moderate vacuum (20–100 mbar). Water boils at +29°C. Stays strictly ABOVE triple point.",
              "Hot water/steam (+60°C). Liquid boils vigorously with nucleate bubbling and surface foaming.",
              "Dense compact vapor (v_g ≈ 35 m³/kg). Easily travels through standard DN50–DN80 piping.",
              "TEMA shell & tube condenser with plant water (+15°C). Vapor liquefies into continuous liquid droplets.",
              "Particles shrink via capillary forces into dense, compacted agglomerate cake requiring secondary milling.",
              "Zero downtime! Liquid solvent continuously drains into receiver. Vessel ready immediately.",
            ];
            const afdTexts = [
              "Liquid feed is chilled below freezing (-40°C) and shattered into 200–500 µm frozen solid granules by the orbital screw.",
              "Ultra-deep vacuum (0.15 mbar). Stays strictly BELOW triple point (6.11 mbar). Liquid phase is physically forbidden!",
              "Gentle sublimation heat (-5°C to +20°C). Bed stays locked at -25°C due to massive latent heat sink (2838 kJ/kg). No boiling.",
              "Vapor expands >220x (v_g ≈ 7,692 m³/kg). Requires massive DN250/DN300 duct to avoid sonic choked flow (Ma < 0.25).",
              "Cryogenic cold trap (-70°C). Water vapor desublimates instantly into solid crystalline ice cake. Zero liquid formed.",
              "Ice sublimes leaving open microscopic pores. Yields an ultra-porous, intact, free-flowing aerogel powder.",
              "Mandatory 45–90 min defrost cycle! Coils buried under solid ice block must be melted with clean steam before restart.",
            ];

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="rounded-xl border p-4 space-y-2"
                  style={{ backgroundColor: cad.cardBg, borderColor: cad.border }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
                      VACUUM DRYER ROUTE
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono">
                      Liquefaction
                    </span>
                  </div>
                  <h4 className="font-bold text-sm">{stepTitles[currentStep - 1]}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: cad.textSecondary }}>
                    {vacTexts[currentStep - 1]}
                  </p>
                </div>

                <div
                  className="rounded-xl border p-4 space-y-2"
                  style={{ backgroundColor: cad.cardBg, borderColor: cad.border }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      ACTIVE FREEZE DRYER ROUTE
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono">
                      Solidification
                    </span>
                  </div>
                  <h4 className="font-bold text-sm">{stepTitles[currentStep - 1]}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: cad.textSecondary }}>
                    {afdTexts[currentStep - 1]}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: PARAMETRIC DUCT & REFRIGERATION CALCULATOR */}
      {/* ==================================================================== */}
      {activeTab === "parametric" && (
        <div className="p-4 sm:p-6 space-y-4 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold font-sans">Parametric Vapor Duct & Heat Load Calculator</h3>
              <p style={{ color: cad.textSecondary }} className="font-sans">
                Real-time fluid dynamic calculations demonstrating why freeze drying vapor ducts must be oversized.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold">
              SOLVENT: {solvent.name} ({solvent.formula})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border" style={{ backgroundColor: cad.bg, borderColor: cad.border }}>
            <div>
              <div className="flex justify-between mb-1.5">
                <span style={{ color: cad.textSecondary }}>Wet Batch Charge:</span>
                <span className="font-bold text-cyan-400">{batchWetKg.toFixed(1)} kg</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={batchWetKg}
                onChange={(e) => setBatchWetKg(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span style={{ color: cad.textSecondary }}>Solvent Fraction:</span>
                <span className="font-bold text-cyan-400">{(solventFraction * 100).toFixed(0)} %</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.95"
                step="0.05"
                value={solventFraction}
                onChange={(e) => setSolventFraction(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span style={{ color: cad.textSecondary }}>Drying Cycle Time:</span>
                <span className="font-bold text-cyan-400">{dryingTimeHours.toFixed(1)} hours</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="16.0"
                step="0.5"
                value={dryingTimeHours}
                onChange={(e) => setDryingTimeHours(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: cad.border }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b" style={{ backgroundColor: cad.cardBg, borderColor: cad.border }}>
                  <th className="p-3">Engineering Parameter</th>
                  <th className="p-3 text-amber-500">Vacuum Dryer (Evaporation)</th>
                  <th className="p-3 text-cyan-400">Active Freeze Dryer (Sublimation)</th>
                  <th className="p-3">Physical Multiplier</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: cad.border }}>
                <tr>
                  <td className="p-3" style={{ color: cad.textSecondary }}>Chamber Operating Pressure</td>
                  <td className="p-3 font-bold">{solvent.vacDryerOpP} mbar</td>
                  <td className="p-3 font-bold text-cyan-400">{solvent.afdOpP} mbar</td>
                  <td className="p-3 font-bold text-rose-500">{((solvent.vacDryerOpP / solvent.afdOpP)).toFixed(0)}x deeper vacuum</td>
                </tr>
                <tr>
                  <td className="p-3" style={{ color: cad.textSecondary }}>Vapor Specific Volume (v_g)</td>
                  <td className="p-3 font-bold">{(1 / solvent.vaporDensityVac).toFixed(1)} m³/kg</td>
                  <td className="p-3 font-bold text-cyan-400">{(1 / solvent.vaporDensityAfd).toFixed(0)} m³/kg</td>
                  <td className="p-3 font-bold text-rose-500">{volExpansionMultiplier}x volumetric expansion</td>
                </tr>
                <tr>
                  <td className="p-3" style={{ color: cad.textSecondary }}>Peak Volumetric Flow Rate</td>
                  <td className="p-3 font-bold">{volFlowVacM3H.toFixed(1)} m³/h</td>
                  <td className="p-3 font-bold text-cyan-400">{volFlowAfdM3H.toFixed(0)} m³/h</td>
                  <td className="p-3 font-bold text-rose-500">{(volFlowAfdM3H / Math.max(1, volFlowVacM3H)).toFixed(0)}x gas volume</td>
                </tr>
                <tr>
                  <td className="p-3" style={{ color: cad.textSecondary }}>Minimum Non-Choking Vapor Duct</td>
                  <td className="p-3 font-bold text-amber-500">DN{minDuctDiaVacMm} (Standard Pipe)</td>
                  <td className="p-3 font-bold text-cyan-400">DN{minDuctDiaAfdMm} (Massive Low-Conductance)</td>
                  <td className="p-3 font-bold text-rose-500">{(minDuctDiaAfdMm / Math.max(1, minDuctDiaVacMm)).toFixed(1)}x duct diameter</td>
                </tr>
                <tr>
                  <td className="p-3" style={{ color: cad.textSecondary }}>Condenser Surface Temperature</td>
                  <td className="p-3 font-bold">+{solvent.vacDryerCondT} °C (Water Chiller)</td>
                  <td className="p-3 font-bold text-cyan-400">{solvent.afdCondT} °C (Cryo Cascade)</td>
                  <td className="p-3 font-bold">Requires cryogenic refrigeration</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: P-T PHASE BOUNDARY EXPLORER */}
      {/* ==================================================================== */}
      {activeTab === "phaseDiagram" && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="text-base font-bold">Thermodynamic P-T Phase Boundary & Triple Point</h3>
              <p style={{ color: cad.textSecondary }}>
                Understand why operating strictly below the Triple Point (P &lt; 6.11 mbar for water) is mandatory to prevent liquid melting.
              </p>
            </div>
            <div className="font-mono text-xs">
              <span style={{ color: cad.textMuted }}>TRIPLE POINT: </span>
              <span className="font-bold text-cyan-400">{solvent.triplePointP} mbar</span> @{" "}
              <span className="font-bold text-amber-400">{solvent.triplePointT} °C</span>
            </div>
          </div>

          <div className="rounded-xl border p-4 shadow-inner" style={{ backgroundColor: cad.bg, borderColor: cad.border }}>
            <svg viewBox="0 0 750 350" className="w-full h-auto select-none font-mono" style={{ minWidth: "600px" }}>
              <line x1="80" y1="50" x2="700" y2="50" stroke={cad.gridLine} strokeWidth="1" strokeDasharray="3 3" />
              <line x1="80" y1="150" x2="700" y2="150" stroke={cad.gridLine} strokeWidth="1" strokeDasharray="3 3" />
              <line x1="80" y1="250" x2="700" y2="250" stroke={cad.gridLine} strokeWidth="1" strokeDasharray="3 3" />

              <path d="M 80 320 C 150 300, 260 250, 360 180" fill="none" stroke={cad.vacuumCyan} strokeWidth="3" />
              <path d="M 360 180 C 440 140, 560 90, 680 50" fill="none" stroke={cad.heatingOrange} strokeWidth="3" />
              <path d="M 360 180 L 350 40" fill="none" stroke={cad.metalStroke} strokeWidth="2.5" />

              <circle cx="360" cy="180" r="6" fill="#ffffff" stroke={cad.vacuumCyan} strokeWidth="2" />
              <text x="375" y="175" fill={cad.textPrimary} fontSize="11" fontWeight="bold">
                TRIPLE POINT ({solvent.triplePointP} mbar, {solvent.triplePointT}°C)
              </text>

              <text x="220" y="100" fill={cad.textMuted} fontSize="14" fontWeight="bold">SOLID (ICE)</text>
              <text x="500" y="110" fill={cad.textMuted} fontSize="14" fontWeight="bold">LIQUID</text>
              <text x="450" y="270" fill={cad.textMuted} fontSize="14" fontWeight="bold">GAS (VAPOR)</text>

              <circle cx="560" cy="100" r="7" fill={cad.heatingOrange} />
              <text x="575" y="105" fill={cad.heatingOrange} fontSize="10" fontWeight="bold">
                VACUUM DRYER (Boils at +29°C / 40 mbar)
              </text>

              <circle cx="250" cy="260" r="7" fill={cad.vacuumCyan} />
              <text x="265" y="265" fill={cad.vacuumCyan} fontSize="10" fontWeight="bold">
                ACTIVE FREEZE DRYER (Sublimes at -25°C / 0.15 mbar)
              </text>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
