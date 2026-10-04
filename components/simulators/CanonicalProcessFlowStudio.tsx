"use client";

import React, { useState, useEffect, useId } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  FileCode,
  Table,
  Activity,
  Layers,
  Flame,
  Snowflake,
  Wind,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Info,
} from "lucide-react";

export function CanonicalProcessFlowStudio() {
  const compId = useId().replace(/:/g, "");
  // Diagram View: "bfd" (Canonical Slide BFD) | "pfd" (Unbundled Orthogonal PFD)
  const [activeTab, setActiveTab] = useState<"bfd" | "pfd">("bfd");

  // Curve Mode: "scada" (Slide 3 Real PLC SCADA) | "volume" (Slide 4 Volume Shrinkage) | "theoretical" (Slide 2 Temperature-curve)
  const [curveMode, setCurveMode] = useState<"scada" | "volume" | "theoretical">("scada");

  // Simulation Time in minutes (0 to 510 min, approx 8.5 hour batch)
  const [timeMin, setTimeMin] = useState<number>(180); // Default inside primary sublimation
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(5); // 1x, 5x, 15x
  const [selectedStream, setSelectedStream] = useState<number | null>(null);

  // Auto-play timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeMin((prev) => {
          if (prev >= 510) {
            setIsPlaying(false);
            return 510;
          }
          return prev + playbackSpeed * 0.5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Kinetics & Physics Engine mapping timeMin to realistic state values
  let stageLabel = "";
  let stageDescription = "";
  let tProduct = 20.0;
  let tJacket = -5.0;
  let tCondenser = -20.0;
  let chamberP = 1013.0; // mbar
  let filterP = 1013.0; // mbar
  let agitatorHz = 0.0; // Hz
  let materialVolume = 4.35; // Liters in drying chamber (Slide 4 curve: 4.35 L down to 0.05 L)
  let collectorVolume = 0.0; // Liters in product collector
  let sublimationHeatActive = false;
  let liquidFeedActive = false;
  let freezingMediumActive = false;
  let vaporFlowActive = false;
  let cleanVaporActive = false;
  let productDischargeActive = false;
  let vacuumActive = false;

  if (timeMin <= 20) {
    stageLabel = "1. Liquid Charge & Vessel Inoculation";
    stageDescription = "15.0 kg formulated aqueous solution charged via top dispersion nozzle. Pre-chilling jacket.";
    liquidFeedActive = true;
    tProduct = 20.0 - (timeMin / 20) * 5.0;
    tJacket = -5.0;
    tCondenser = -30.0;
    chamberP = 1013.0;
    filterP = 1013.0;
    agitatorHz = 5.0;
    materialVolume = 4.35;
    collectorVolume = 0.0;
  } else if (timeMin <= 90) {
    stageLabel = "2. Introduction Freezing Medium / Flash Cryo-Freezing";
    stageDescription = "Flash cryogenic crystallization into 200–500 µm frozen granules. Agitator rotating at 20 Hz (50 RPM).";
    freezingMediumActive = true;
    agitatorHz = 20.0;
    const prog = (timeMin - 20) / 70;
    tProduct = 15.0 - prog * 60.0; // drops to -45°C
    tJacket = -5.0 - prog * 10.0; // -15°C
    tCondenser = -30.0 - prog * 40.0; // pulls down to -70°C
    chamberP = 1013.0;
    filterP = 1013.0;
    materialVolume = 4.35;
    collectorVolume = 0.0;
  } else if (timeMin <= 110) {
    stageLabel = "3. Deep Evacuation (Start Drying / Vacuum)";
    stageDescription = "Dry vacuum pump train pulls chamber down from atmosphere to 0.15 mbar. Sublimation begins.";
    vacuumActive = true;
    agitatorHz = 20.0;
    const prog = (timeMin - 90) / 20;
    tProduct = -45.0 + prog * 35.0; // rebounds to -10°C sublimation equilibrium
    tJacket = -15.0 + prog * 10.0; // -5°C
    tCondenser = -70.0;
    chamberP = Math.max(0.15, 1013.0 * Math.pow(0.15 / 1013.0, prog));
    filterP = Math.max(0.12, chamberP * 0.85);
    materialVolume = 4.35;
    collectorVolume = 0.0;
  } else if (timeMin <= 410) {
    stageLabel = "4. Primary Sublimation Plateau (Active Dynamic Drying)";
    stageDescription = "Constant rate sublimation. Wall contact renewal by orbiting screw. Vapor carries light dust into Product Collector.";
    sublimationHeatActive = true;
    vaporFlowActive = true;
    cleanVaporActive = true;
    vacuumActive = true;
    agitatorHz = 20.0;
    tProduct = -8.5 + Math.sin(timeMin * 0.05) * 0.5; // steady flat plateau
    if (timeMin <= 260) {
      tJacket = -5.0;
    } else if (timeMin <= 340) {
      tJacket = 0.0;
    } else {
      tJacket = 7.0;
    }
    tCondenser = -72.0 + Math.sin(timeMin * 0.1) * 2.0; // oscillation from refrigeration cycle
    chamberP = 0.15 + Math.sin(timeMin * 0.08) * 0.01;
    filterP = 0.13;
    // Volume shrinkage following Hosokawa experimental curve:
    const prog = (timeMin - 110) / (410 - 110);
    materialVolume = Math.max(0.80, 0.80 + 3.55 * Math.pow(1 - prog, 1.6));
    collectorVolume = (4.35 - materialVolume) * 0.34;
  } else if (timeMin <= 480) {
    stageLabel = "5. Secondary Drying / Desorption Ramp";
    stageDescription = "Sublimation finished. Jacket steps up to +20°C / +50°C. Residual bound water reduced to <1.5%.";
    sublimationHeatActive = true;
    cleanVaporActive = true;
    vacuumActive = true;
    agitatorHz = 15.0;
    const prog = (timeMin - 410) / 70;
    tJacket = 7.0 + prog * 13.0; // steps up to +20°C
    tProduct = -8.0 + prog * 25.0; // rises to +17°C
    tCondenser = -68.0;
    chamberP = 0.04;
    filterP = 0.035;
    materialVolume = Math.max(0.05, 0.80 * (1 - prog));
    collectorVolume = 1.21 + prog * 0.29;
  } else {
    stageLabel = "6. N2 Break & Continuous Dry Product Discharge";
    stageDescription = "Sterile N2 breaks vacuum. Bottom spherical segment valve opens. 100% loose dry powder discharges into canister.";
    productDischargeActive = true;
    agitatorHz = 0.0;
    const prog = (timeMin - 480) / 30;
    tJacket = 20.0;
    tProduct = 18.0;
    tCondenser = -40.0;
    chamberP = 0.04 + prog * 1012.96;
    filterP = chamberP;
    materialVolume = 0.0;
    collectorVolume = 1.50;
  }

  // Stream Database for PFD
  const streams = [
    { id: 1, name: "Liquid Feed Solution", from: "Inoculation Header", to: "Drying Chamber (V-101)", phase: "Liquid", flow: "15.0 kg", temp: "+20.0 °C", press: "1013 mbar", active: liquidFeedActive },
    { id: 2, name: "Sublimation Heat (Syltherm HTF)", from: "TCU-201 Skid", to: "Vessel Jacket", phase: "Liquid", flow: "1250 kg/h", temp: `${tJacket.toFixed(1)} °C`, press: "2.5 barg", active: sublimationHeatActive },
    { id: 3, name: "Raw Vapor + API Dust", from: "Drying Chamber (V-101)", to: "Product Collector (V-102)", phase: "Vapor + Solids", flow: "3.92 kg/h", temp: `${tProduct.toFixed(1)} °C`, press: `${chamberP.toFixed(2)} mbar`, active: vaporFlowActive },
    { id: 4, name: "Harvested Dry API Powder", from: "Product Collector (V-102)", to: "Product Canister", phase: "Solid (<1.5% H2O)", flow: "1.50 kg", temp: "+20.0 °C", press: "Atm / Vac", active: productDischargeActive },
    { id: 5, name: "Screened Water Vapor", from: "Product Collector (V-102)", to: "Freeze Condenser (E-101)", phase: "Clean Vapor", flow: "3.89 kg/h", temp: "-24.0 °C", press: `${filterP.toFixed(2)} mbar`, active: cleanVaporActive },
    { id: 6, name: "Non-Condensibles to Vacuum", from: "Freeze Condenser (E-101)", to: "Vacuum Skid (PKG-401)", phase: "Gas (N2 trace)", flow: "0.05 kg/h", temp: `${tCondenser.toFixed(1)} °C`, press: "0.08 mbar", active: vacuumActive },
    { id: 7, name: "Sterile N2 Micro-Bleed", from: "Utility Header", to: "Drying Chamber", phase: "Gas", flow: "0.04 kg/h", temp: "+20.0 °C", press: "3.0 barg", active: timeMin >= 110 && timeMin <= 480 },
    { id: 8, name: "Sintered Filter Jet Pulse", from: "Accumulator Tank", to: "Product Collector", phase: "Pulse Gas", flow: "0.80 kg/pulse", temp: "+20.0 °C", press: "6.0 barg", active: vaporFlowActive },
  ];

  // Download DXF File Trigger
  const handleDownloadDXF = () => {
    const filename =
      activeTab === "bfd"
        ? "hosokawa_afd_canonical_bfd.dxf"
        : "hosokawa_afd_unbundled_pfd.dxf";
    downloadSpecificDXF(filename);
  };

  // Direct specific DXF download
  const downloadSpecificDXF = (filename: string) => {
    const link = document.createElement("a");
    link.href = `/cad/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Slide 4 Bed Volume Shrinkage CSV Dataset
  const handleDownloadVolumeCSV = () => {
    let csv = "Clock_Time,Elapsed_Drying_Hours,Volume_in_Dryer_L,Percent_Remaining_pct,Dry_Powder_in_Collector_kg,Superficial_Vapor_Velocity_ms\n";
    const volumeData = [
      ["10:45", "0.00", "4.35", "100.0", "0.00", "1.85"],
      ["11:15", "0.50", "3.95", "90.8", "0.14", "2.10"],
      ["11:45", "1.00", "3.50", "80.5", "0.29", "2.35"],
      ["12:05", "1.33", "3.25", "74.7", "0.38", "2.45"],
      ["13:00", "2.25", "2.80", "64.4", "0.53", "2.60"],
      ["14:00", "3.25", "2.62", "60.2", "0.60", "2.65"],
      ["15:15", "4.50", "2.22", "51.0", "0.73", "2.50"],
      ["16:15", "5.50", "1.72", "39.5", "0.91", "2.40"],
      ["16:45", "6.00", "1.68", "38.6", "0.92", "2.30"],
      ["21:00", "10.25", "0.88", "20.2", "1.20", "1.45"],
      ["08:00", "21.25", "0.04", "0.9", "1.49", "0.20"],
    ];
    volumeData.forEach((row) => {
      csv += `${row.join(",")}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hosokawa_afd_bed_volume_shrinkage_dataset.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download SCADA CSV Trigger
  const handleDownloadCSV = () => {
    let csv = "Time_min,T_Jacket_C,T_Product_C,T_Condenser_C,Chamber_P_mbar,Filter_P_mbar,Agitator_Hz,Stage\n";
    for (let t = 0; t <= 510; t += 5) {
      let tj = -5.0, tp = 20.0, tc = -70.0, cp = 1013.0, fp = 1013.0, hz = 0.0, st = "";
      if (t <= 20) {
        tp = 20 - (t / 20) * 5; tj = -5; tc = -30; cp = 1013; fp = 1013; hz = 5; st = "Liquid Charge";
      } else if (t <= 90) {
        const p = (t - 20) / 70; tp = 15 - p * 60; tj = -5 - p * 10; tc = -30 - p * 40; cp = 1013; fp = 1013; hz = 20; st = "Freezing Medium";
      } else if (t <= 110) {
        const p = (t - 90) / 20; tp = -45 + p * 35; tj = -15 + p * 10; tc = -70; cp = 1013 * Math.pow(0.15 / 1013, p); fp = cp * 0.85; hz = 20; st = "Vacuum Evacuation";
      } else if (t <= 410) {
        tp = -8.5; tj = t <= 260 ? -5 : (t <= 340 ? 0 : 7); tc = -72; cp = 0.15; fp = 0.13; hz = 20; st = "Primary Sublimation";
      } else if (t <= 480) {
        const p = (t - 410) / 70; tj = 7 + p * 13; tp = -8 + p * 25; tc = -68; cp = 0.04; fp = 0.035; hz = 15; st = "Secondary Desorption";
      } else {
        const p = (t - 480) / 30; tj = 20; tp = 18; tc = -40; cp = 0.04 + p * 1013; fp = cp; hz = 0; st = "Product Discharge";
      }
      csv += `${t},${tj.toFixed(2)},${tp.toFixed(2)},${tc.toFixed(2)},${cp.toFixed(3)},${fp.toFixed(3)},${hz.toFixed(1)},${st}\n`;
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hosokawa_afd_scada_kinetics_dataset.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans my-8">
      {/* Top Header & Breadcrumb Bar */}
      <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Hosokawa Active Freeze Drying — Dynamic Process Studio
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Interactive BFD · PFD · SCADA
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Canonical slide architecture, unbundled orthogonal streams, and synchronized SCADA kinetics.
            </p>
          </div>
        </div>

        {/* View Mode Tabs & CAD Export Button */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
            <button
              onClick={() => setActiveTab("bfd")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "bfd"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Canonical BFD
            </button>
            <button
              onClick={() => setActiveTab("pfd")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "pfd"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Unbundled PFD (No Line Bundling)
            </button>
          </div>

          {/* Direct CAD DWG/DXF Download */}
          <button
            onClick={handleDownloadDXF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            title="Download AutoCAD DXF / DWG-Compatible layered vector drawing"
          >
            <FileCode className="w-4 h-4" />
            Download CAD (.DXF / DWG)
          </button>
        </div>
      </div>

      {/* Main Interactive Diagram Canvas */}
      <div className="p-6 relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Active Stage Banner */}
        <div className="mb-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Current Batch Phase ({timeMin.toFixed(0)} min / 510 min)
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {stageLabel}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 text-xs">
            <div className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400">Dryer Bed:</span>{" "}
              <span className="font-mono font-bold text-purple-400">{materialVolume.toFixed(2)} L</span>
              <span className="text-[10px] text-slate-500 ml-1">
                ({((materialVolume / 4.35) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400">T-Jacket:</span>{" "}
              <span className="font-mono font-bold text-amber-400">{tJacket.toFixed(1)} °C</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400">T-Product:</span>{" "}
              <span className="font-mono font-bold text-cyan-400">{tProduct.toFixed(1)} °C</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400">Pressure:</span>{" "}
              <span className="font-mono font-bold text-emerald-400">
                {chamberP >= 10.0 ? chamberP.toFixed(0) : chamberP.toFixed(2)} mbar
              </span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400">Agitator:</span>{" "}
              <span className="font-mono font-bold text-indigo-400">{agitatorHz.toFixed(1)} Hz</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: CANONICAL HOSOKAWA BFD (Matching user slide 1:1)       */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "bfd" && (
          <div className="w-full relative border border-slate-800 rounded-xl bg-slate-950/70 p-4 overflow-x-auto">
            <svg
              viewBox="0 0 1100 480"
              className="w-full h-auto select-none"
              style={{ minWidth: "850px" }}
            >
              <defs>
                {/* Gradients */}
                <linearGradient id={`grad-cyan-${compId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                <linearGradient id={`grad-red-${compId}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
                <linearGradient id={`grad-green-${compId}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                {/* Arrow markers */}
                <marker id={`arr-green-${compId}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
                </marker>
                <marker id={`arr-cyan-${compId}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                </marker>
                <marker id={`arr-red-${compId}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                </marker>
              </defs>

              {/* Title on Canvas */}
              <text x="50" y="40" fill="#3b82f6" fontSize="24" fontWeight="bold" fontFamily="system-ui">
                Now: Active Freeze Drying !
              </text>
              <text x="950" y="40" fill="#64748b" fontSize="13" fontWeight="bold" textAnchor="end">
                HOSOKAWA MICRON B.V.
              </text>

              {/* Outer Diagram Frame */}
              <rect x="50" y="60" width="1000" height="390" rx="12" fill="none" stroke="#334155" strokeWidth="1.5" />

              {/* ======================================================= */}
              {/* TOP INPUT BOXES & DOWNWARD ARROWS                       */}
              {/* ======================================================= */}
              {/* 1. Material to be dried */}
              <g className="cursor-pointer transition-all hover:opacity-90">
                <rect x="120" y="90" width="180" height="42" rx="4" fill="#0f172a" stroke={liquidFeedActive ? "#38bdf8" : "#475569"} strokeWidth="2" />
                <text x="210" y="116" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">
                  Material to be dried
                </text>
                {/* Downward cyan striped arrow */}
                <line
                  x1="260"
                  y1="132"
                  x2="260"
                  y2="195"
                  stroke="#38bdf8"
                  strokeWidth="12"
                  strokeDasharray={liquidFeedActive ? "8 4" : "none"}
                  className={liquidFeedActive ? "animate-pulse" : "opacity-40"}
                  markerEnd={`url(#arr-cyan-${compId})`}
                />
              </g>

              {/* 2. Freezing medium */}
              <g className="cursor-pointer transition-all hover:opacity-90">
                <rect x="330" y="90" width="180" height="42" rx="4" fill="#0f172a" stroke={freezingMediumActive ? "#38bdf8" : "#475569"} strokeWidth="2" />
                <text x="420" y="116" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">
                  Freezing medium
                </text>
                {/* Downward cyan striped arrow */}
                <line
                  x1="390"
                  y1="132"
                  x2="390"
                  y2="195"
                  stroke="#38bdf8"
                  strokeWidth="12"
                  strokeDasharray={freezingMediumActive ? "8 4" : "none"}
                  className={freezingMediumActive ? "animate-pulse" : "opacity-40"}
                  markerEnd={`url(#arr-cyan-${compId})`}
                />
              </g>

              {/* ======================================================= */}
              {/* LEFT INPUT: SUBLIMATION HEAT (Bold Red Arrow)          */}
              {/* ======================================================= */}
              <g className="cursor-pointer transition-all hover:opacity-90">
                <text
                  x="135"
                  y="262"
                  fill="#ef4444"
                  fontSize="16"
                  fontWeight="bold"
                  fontStyle="italic"
                  textAnchor="end"
                >
                  Sublimation Heat
                </text>
                <path
                  d="M 145 255 L 210 255 L 210 242 L 235 262 L 210 282 L 210 269 L 145 269 Z"
                  fill={sublimationHeatActive ? `url(#grad-red-${compId})` : "#64748b"}
                  className={sublimationHeatActive ? "animate-pulse" : "opacity-40"}
                />
              </g>

              {/* ======================================================= */}
              {/* THREE CORE HORIZONTAL BLOCKS                           */}
              {/* ======================================================= */}
              {/* BLOCK 1: Drying Chamber */}
              <g
                onClick={() => setSelectedStream(1)}
                className="cursor-pointer transition-all hover:brightness-110"
              >
                <rect
                  x="240"
                  y="195"
                  width="140"
                  height="130"
                  rx="6"
                  fill="#111827"
                  stroke={vaporFlowActive || sublimationHeatActive ? "#3b82f6" : "#475569"}
                  strokeWidth="2.5"
                />
                {/* Dynamic Bed Level in Drying Chamber */}
                <rect
                  x="244"
                  y={321 - Math.max(4, (materialVolume / 4.35) * 115)}
                  width="132"
                  height={Math.max(4, (materialVolume / 4.35) * 115)}
                  rx="4"
                  fill="#38bdf8"
                  fillOpacity="0.22"
                  stroke="#38bdf8"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                />
                <text x="310" y="240" fill="#f8fafc" fontSize="16" fontWeight="bold" textAnchor="middle">
                  Drying
                </text>
                <text x="310" y="262" fill="#f8fafc" fontSize="16" fontWeight="bold" textAnchor="middle">
                  Chamber
                </text>
                <text x="310" y="282" fill="#64748b" fontSize="11" textAnchor="middle">
                  (V-101 Conical)
                </text>
                <text x="310" y="305" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Bed: {materialVolume.toFixed(2)} L
                </text>
              </g>

              {/* INTER-BLOCK ARROW 1: Drying Chamber -> Product Collector */}
              <g>
                <path
                  d="M 380 260 L 450 260 L 450 250 L 475 265 L 450 280 L 450 270 L 380 270 Z"
                  fill={vaporFlowActive ? `url(#grad-green-${compId})` : "#334155"}
                  className={vaporFlowActive ? "animate-pulse" : "opacity-40"}
                />
                <text x="428" y="244" fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Vapor + Dust
                </text>
              </g>

              {/* BLOCK 2: Product Collector */}
              <g
                onClick={() => setSelectedStream(3)}
                className="cursor-pointer transition-all hover:brightness-110"
              >
                <rect
                  x="480"
                  y="195"
                  width="140"
                  height="130"
                  rx="6"
                  fill="#111827"
                  stroke={productDischargeActive ? "#10b981" : "#475569"}
                  strokeWidth="2.5"
                />
                {/* Dynamic Accumulated Cake Level in Collector */}
                {collectorVolume > 0.05 && (
                  <rect
                    x="484"
                    y={321 - Math.max(4, (collectorVolume / 1.50) * 115)}
                    width="132"
                    height={Math.max(4, (collectorVolume / 1.50) * 115)}
                    rx="4"
                    fill="#10b981"
                    fillOpacity="0.22"
                    stroke="#10b981"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                  />
                )}
                <text x="550" y="240" fill="#f8fafc" fontSize="16" fontWeight="bold" textAnchor="middle">
                  Product
                </text>
                <text x="550" y="262" fill="#f8fafc" fontSize="16" fontWeight="bold" textAnchor="middle">
                  Collector
                </text>
                <text x="550" y="282" fill="#64748b" fontSize="11" textAnchor="middle">
                  (V-102 Sintered)
                </text>
                <text x="550" y="305" fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Cake: {collectorVolume.toFixed(2)} L
                </text>
              </g>

              {/* INTER-BLOCK ARROW 2: Product Collector -> Solvent Freeze Condenser */}
              <g>
                <path
                  d="M 620 260 L 690 260 L 690 250 L 715 265 L 690 280 L 690 270 L 620 270 Z"
                  fill={cleanVaporActive ? `url(#grad-green-${compId})` : "#334155"}
                  className={cleanVaporActive ? "animate-pulse" : "opacity-40"}
                />
                <text x="668" y="244" fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Clean Vapor
                </text>
              </g>

              {/* BLOCK 3: Solvent Freeze Condenser */}
              <g
                onClick={() => setSelectedStream(5)}
                className="cursor-pointer transition-all hover:brightness-110"
              >
                <rect
                  x="720"
                  y="195"
                  width="140"
                  height="130"
                  rx="6"
                  fill="#111827"
                  stroke={cleanVaporActive ? "#06b6d4" : "#475569"}
                  strokeWidth="2.5"
                />
                <text x="790" y="242" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">
                  Solvent
                </text>
                <text x="790" y="262" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">
                  Freeze
                </text>
                <text x="790" y="282" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">
                  Condenser
                </text>
                <text x="790" y="305" fill="#06b6d4" fontSize="11" textAnchor="middle">
                  (-75 °C)
                </text>
              </g>

              {/* RIGHT OUTFLOW ARROW: Vacuum */}
              <g>
                <path
                  d="M 860 260 L 935 260 L 935 250 L 960 265 L 935 280 L 935 270 L 860 270 Z"
                  fill={vacuumActive ? `url(#grad-green-${compId})` : "#334155"}
                  className={vacuumActive ? "animate-pulse" : "opacity-40"}
                />
                <text
                  x="980"
                  y="270"
                  fill="#10b981"
                  fontSize="18"
                  fontWeight="bold"
                  fontStyle="italic"
                >
                  Vacuum
                </text>
              </g>

              {/* ======================================================= */}
              {/* BOTTOM DISCHARGE: DRIED PRODUCT                        */}
              {/* ======================================================= */}
              <g className="cursor-pointer transition-all hover:opacity-90">
                {/* Downward cyan striped arrow out of Product Collector */}
                <line
                  x1="550"
                  y1="325"
                  x2="550"
                  y2="375"
                  stroke="#38bdf8"
                  strokeWidth="12"
                  strokeDasharray={productDischargeActive ? "8 4" : "none"}
                  className={productDischargeActive ? "animate-pulse" : "opacity-40"}
                  markerEnd={`url(#arr-cyan-${compId})`}
                />
                <rect x="460" y="385" width="180" height="42" rx="4" fill="#0f172a" stroke={productDischargeActive ? "#38bdf8" : "#475569"} strokeWidth="2" />
                <text x="550" y="411" fill="#f8fafc" fontSize="15" fontWeight="bold" textAnchor="middle">
                  Dried Product
                </text>
              </g>
            </svg>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: UNBUNDLED PFD (Zero Line Bundling)                     */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "pfd" && (
          <div className="w-full relative border border-slate-800 rounded-xl bg-slate-950/70 p-4 overflow-x-auto">
            <svg
              viewBox="0 0 1100 480"
              className="w-full h-auto select-none"
              style={{ minWidth: "900px" }}
            >
              {/* Title & Guidance */}
              <text x="50" y="35" fill="#f8fafc" fontSize="18" fontWeight="bold">
                AFD-60 Unbundled Process Flow Diagram (PFD)
              </text>
              <text x="50" y="55" fill="#94a3b8" fontSize="12">
                Every stream is an isolated, orthogonal line with zero bundling or spaghetti crossing.
              </text>

              {/* Equipment 1: V-101 Drying Chamber (Conical representation) */}
              <g className="cursor-pointer" onClick={() => setSelectedStream(1)}>
                <rect x="220" y="140" width="120" height="70" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                <polygon points="220,210 340,210 290,300 270,300" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                <text x="280" y="180" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">V-101</text>
                <text x="280" y="196" fill="#94a3b8" fontSize="10" textAnchor="middle">Conical Sublimator</text>
              </g>

              {/* Equipment 2: V-102 Product Collector */}
              <g className="cursor-pointer" onClick={() => setSelectedStream(3)}>
                <rect x="470" y="140" width="110" height="130" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                <text x="525" y="195" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">V-102</text>
                <text x="525" y="212" fill="#94a3b8" fontSize="10" textAnchor="middle">Product Collector</text>
                <text x="525" y="226" fill="#64748b" fontSize="9" textAnchor="middle">Sintered Filter</text>
              </g>

              {/* Equipment 3: E-101 Freeze Condenser */}
              <g className="cursor-pointer" onClick={() => setSelectedStream(5)}>
                <rect x="710" y="140" width="110" height="130" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                <text x="765" y="195" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">E-101</text>
                <text x="765" y="212" fill="#94a3b8" fontSize="10" textAnchor="middle">Freeze Condenser</text>
                <text x="765" y="226" fill="#06b6d4" fontSize="9" textAnchor="middle">-75 °C Cryo Coil</text>
              </g>

              {/* Equipment 4: TCU-201 Thermal Skid */}
              <g className="cursor-pointer" onClick={() => setSelectedStream(2)}>
                <rect x="50" y="150" width="100" height="110" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="100" y="195" fill="#f59e0b" fontSize="13" fontWeight="bold" textAnchor="middle">TCU-201</text>
                <text x="100" y="212" fill="#cbd5e1" fontSize="10" textAnchor="middle">Heat/Cool Skid</text>
                <text x="100" y="226" fill="#94a3b8" fontSize="9" textAnchor="middle">Syltherm XLT</text>
              </g>

              {/* Equipment 5: PKG-401 Vacuum Pump Skid */}
              <g className="cursor-pointer" onClick={() => setSelectedStream(6)}>
                <rect x="920" y="150" width="110" height="110" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                <text x="975" y="195" fill="#10b981" fontSize="13" fontWeight="bold" textAnchor="middle">PKG-401</text>
                <text x="975" y="212" fill="#cbd5e1" fontSize="10" textAnchor="middle">Vacuum Train</text>
                <text x="975" y="226" fill="#94a3b8" fontSize="9" textAnchor="middle">Roots + Dry Screw</text>
              </g>

              {/* Equipment 6: Product Canister */}
              <rect x="475" y="370" width="100" height="50" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="525" y="398" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">Canister</text>
              <text x="525" y="412" fill="#94a3b8" fontSize="9" textAnchor="middle">1.5 kg Dry Solids</text>

              {/* UNBUNDLED ORTHOGONAL PROCESS STREAMS (No Bundling!) */}
              {/* Stream 01: Liquid Feed */}
              <line x1="250" y1="80" x2="250" y2="140" stroke="#38bdf8" strokeWidth="2.5" />
              <polygon points="250,140 246,132 254,132" fill="#38bdf8" />
              <circle cx="250" cy="100" r="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="250" y="104" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">01</text>
              <text x="240" y="75" fill="#94a3b8" fontSize="10" textAnchor="end">Liquid Feed (15 kg)</text>

              {/* Stream 02: TCU Supply (Top Orthogonal Line) */}
              <line x1="150" y1="180" x2="220" y2="180" stroke="#f59e0b" strokeWidth="2.5" />
              <polygon points="220,180 212,176 212,184" fill="#f59e0b" />
              <circle cx="185" cy="180" r="10" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="185" y="184" fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="middle">09</text>

              {/* Stream 03: TCU Return (Bottom Orthogonal Line) */}
              <line x1="220" y1="230" x2="150" y2="230" stroke="#f59e0b" strokeWidth="2.5" />
              <polygon points="150,230 158,226 158,234" fill="#f59e0b" />
              <circle cx="185" cy="230" r="10" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="185" y="234" fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="middle">10</text>

              {/* Stream 05: Raw Sublimation Vapor + Dust (Completely Straight Orthogonal) */}
              <line x1="340" y1="180" x2="470" y2="180" stroke="#38bdf8" strokeWidth="3" />
              <polygon points="470,180 462,175 462,185" fill="#38bdf8" />
              <circle cx="405" cy="180" r="11" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="405" y="184" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">02</text>
              <text x="405" y="165" fill="#cbd5e1" fontSize="10" textAnchor="middle">3.92 kg/h Vapor+Dust</text>

              {/* Stream 08: Clean Water Vapor (Completely Straight Orthogonal) */}
              <line x1="580" y1="180" x2="710" y2="180" stroke="#10b981" strokeWidth="3" />
              <polygon points="710,180 702,175 702,185" fill="#10b981" />
              <circle cx="645" cy="180" r="11" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
              <text x="645" y="184" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="middle">03</text>
              <text x="645" y="165" fill="#cbd5e1" fontSize="10" textAnchor="middle">3.89 kg/h Clean Vapor</text>

              {/* Stream 09: Non-Condensibles to Vacuum (Straight Orthogonal) */}
              <line x1="820" y1="180" x2="920" y2="180" stroke="#10b981" strokeWidth="2.5" />
              <polygon points="920,180 912,176 912,184" fill="#10b981" />
              <circle cx="870" cy="180" r="10" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
              <text x="870" y="184" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">05</text>

              {/* Stream 10: Vacuum Exhaust */}
              <line x1="1030" y1="180" x2="1080" y2="180" stroke="#10b981" strokeWidth="2.5" />
              <polygon points="1080,180 1072,176 1072,184" fill="#10b981" />
              <text x="1085" y="184" fill="#94a3b8" fontSize="10">Vent</text>

              {/* Stream 04: Product Discharge */}
              <line x1="525" y1="270" x2="525" y2="370" stroke="#38bdf8" strokeWidth="3" />
              <polygon points="525,370 520,362 530,362" fill="#38bdf8" />
              <circle cx="525" cy="320" r="11" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="525" y="324" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">04</text>
              <text x="545" y="324" fill="#cbd5e1" fontSize="10">Dry Cake (1.5 kg)</text>
            </svg>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SIMULATABLE SCADA & TEMPERATURE/PRESSURE GRAPH                */}
        {/* ------------------------------------------------------------- */}
        <div className="mt-6 p-5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Curve Display:</span>
              <button
                onClick={() => setCurveMode("scada")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  curveMode === "scada"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Actual PLC / SCADA Data (Hosokawa 2007)
              </button>
              <button
                onClick={() => setCurveMode("volume")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  curveMode === "volume"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Dryer Bed Volume Decrease [L] (Slide 4)
              </button>
              <button
                onClick={() => setCurveMode("theoretical")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  curveMode === "theoretical"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Theoretical Temperature-Curve (Slide 2)
              </button>
            </div>

            {/* Time Scrubber Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? "Pause" : "Play Batch"}
              </button>
              <button
                onClick={() => setTimeMin(0)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                title="Reset batch"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1"
              >
                <option value={1}>1x Speed</option>
                <option value={5}>5x Speed</option>
                <option value={15}>15x Speed</option>
              </select>
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium"
                title="Download CSV of simulation curve"
              >
                <Table className="w-3.5 h-3.5" />
                CSV
              </button>
            </div>
          </div>

          {/* Time Slider */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
              <span>0h (Charge)</span>
              <span className="text-white font-bold">
                Batch Time: {(timeMin / 60).toFixed(2)} hrs ({timeMin.toFixed(0)} min)
              </span>
              <span>8.5h (Discharge)</span>
            </div>
            <input
              type="range"
              min={0}
              max={510}
              step={1}
              value={timeMin}
              onChange={(e) => setTimeMin(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Graphical SVG Curve Canvas */}
          <div className="w-full relative border border-slate-800 rounded-xl bg-slate-950 p-2 overflow-x-auto">
            {curveMode === "volume" && (
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 mb-1 bg-purple-950/30 border border-purple-900/40 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-purple-200">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span className="font-semibold">Slide 4 Experimental Data:</span>
                  <span>Bed volume shrinks 4.35 L ➔ 0.04 L via continuous dynamic elutriation into V-102.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadSpecificDXF("hosokawa_afd_volume_shrinkage.dxf")}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-300 text-xs font-medium transition-all"
                    title="Download Slide 4 Volume Shrinkage CAD DXF"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    CAD (.DXF)
                  </button>
                  <button
                    onClick={handleDownloadVolumeCSV}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-all"
                    title="Download Slide 4 11-point experimental dataset as CSV"
                  >
                    <Table className="w-3.5 h-3.5" />
                    Volume Data (.CSV)
                  </button>
                </div>
              </div>
            )}

            <svg
              viewBox="0 0 1000 340"
              className="w-full h-auto select-none"
              style={{ minHeight: "260px" }}
            >
              {curveMode === "volume" ? (
                <>
                  {/* ======================================================= */}
                  {/* SLIDE 4: AUTHENTIC HOSOKAWA SLIDE REPLICA               */}
                  {/* ======================================================= */}
                  {/* Slide Title in Bold Italic Navy/Blue */}
                  <text
                    x="500"
                    y="28"
                    fill="#38bdf8"
                    fontSize="18"
                    fontWeight="bold"
                    fontStyle="italic"
                    textAnchor="middle"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    Decrease of material volume during Active Freeze Drying
                  </text>

                  {/* Gray Plot Box Background (Authentic Hosokawa Slide Styling) */}
                  <rect
                    x="90"
                    y="42"
                    width="840"
                    height="220"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="1.5"
                  />

                  {/* Y-Axis Grid Lines & Labels (0,00 to 5,00 in 0,50 increments) */}
                  {[
                    { val: "5,00", y: 42 },
                    { val: "4,50", y: 64 },
                    { val: "4,00", y: 86 },
                    { val: "3,50", y: 108 },
                    { val: "3,00", y: 130 },
                    { val: "2,50", y: 152 },
                    { val: "2,00", y: 174 },
                    { val: "1,50", y: 196 },
                    { val: "1,00", y: 218 },
                    { val: "0,50", y: 240 },
                    { val: "0,00", y: 262 },
                  ].map((tick, idx) => (
                    <g key={idx}>
                      <line
                        x1="90"
                        y1={tick.y}
                        x2="930"
                        y2={tick.y}
                        stroke={tick.val === "0,00" ? "#64748b" : "#334155"}
                        strokeWidth={tick.val === "0,00" ? 1.5 : 1}
                        strokeDasharray={tick.val === "0,00" ? "none" : "3 3"}
                      />
                      <text
                        x="80"
                        y={tick.y + 4}
                        fill="#cbd5e1"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {tick.val}
                      </text>
                    </g>
                  ))}

                  {/* Y-Axis Title */}
                  <text
                    x="35"
                    y="152"
                    fill="#f8fafc"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    transform="rotate(-90 35 152)"
                  >
                    Volume in Dryer [liter]
                  </text>

                  {/* X-Axis Ticks & Grid Lines (Hosokawa Timestamps: 8:24, 13:12, 18:00, 22:48, 3:36, 8:24, 13:12) */}
                  {[
                    { time: "8:24", x: 90, sub: "0.0h" },
                    { time: "13:12", x: 230, sub: "+4.8h" },
                    { time: "18:00", x: 370, sub: "+9.6h" },
                    { time: "22:48", x: 510, sub: "+14.4h" },
                    { time: "3:36", x: 650, sub: "+19.2h" },
                    { time: "8:24", x: 790, sub: "+24.0h" },
                    { time: "13:12", x: 930, sub: "+28.8h" },
                  ].map((tm, idx) => (
                    <g key={idx}>
                      <line
                        x1={tm.x}
                        y1="42"
                        x2={tm.x}
                        y2="262"
                        stroke="#334155"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                      <line x1={tm.x} y1="262" x2={tm.x} y2="267" stroke="#64748b" strokeWidth="1.5" />
                      <text
                        x={tm.x}
                        y="279"
                        fill="#cbd5e1"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {tm.time}
                      </text>
                      <text
                        x={tm.x}
                        y="291"
                        fill="#64748b"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {tm.sub}
                      </text>
                    </g>
                  ))}

                  {/* X-Axis Title */}
                  <text
                    x="510"
                    y="312"
                    fill="#f8fafc"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Drying Time [hr]
                  </text>

                  {/* Bottom Left Logo: HOSOKAWA MICRON B.V. */}
                  <g transform="translate(90, 318)">
                    <circle cx="8" cy="8" r="7" fill="none" stroke="#0284c7" strokeWidth="1.5" />
                    <line x1="1" y1="8" x2="15" y2="8" stroke="#0284c7" strokeWidth="1" />
                    <ellipse cx="8" cy="8" rx="4" ry="7" fill="none" stroke="#0284c7" strokeWidth="1" />
                    <text x="22" y="12" fill="#94a3b8" fontSize="11" fontWeight="bold" letterSpacing="0.5">
                      HOSOKAWA MICRON B.V.
                    </text>
                  </g>

                  {/* Purple Continuous Shrinkage Curve (Smooth Bezier) */}
                  <path
                    d="M 158.5 70.8 Q 166 79 173.1 88.4 T 187.7 108.2 T 197.3 119.2 Q 210 129 224.2 139.0 T 253.3 146.9 T 289.8 164.5 T 319.0 186.5 T 333.5 188.3 Q 395 204 457.5 223.5 Q 618 245 778.3 260.2"
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* 11 Experimental Sample Points (Hollow Circles matching Hosokawa slide) */}
                  {[
                    { clk: "10:45", dt: 2.35, v: 4.35, cx: 158.5, cy: 70.8, showLabel: true },
                    { clk: "11:15", dt: 2.85, v: 3.95, cx: 173.1, cy: 88.4, showLabel: false },
                    { clk: "11:45", dt: 3.35, v: 3.50, cx: 187.7, cy: 108.2, showLabel: true },
                    { clk: "12:05", dt: 3.68, v: 3.25, cx: 197.3, cy: 119.2, showLabel: false },
                    { clk: "13:00", dt: 4.60, v: 2.80, cx: 224.2, cy: 139.0, showLabel: true },
                    { clk: "14:00", dt: 5.60, v: 2.62, cx: 253.3, cy: 146.9, showLabel: false },
                    { clk: "15:15", dt: 6.85, v: 2.22, cx: 289.8, cy: 164.5, showLabel: false },
                    { clk: "16:15", dt: 7.85, v: 1.72, cx: 319.0, cy: 186.5, showLabel: false },
                    { clk: "16:45", dt: 8.35, v: 1.68, cx: 333.5, cy: 188.3, showLabel: true },
                    { clk: "21:00", dt: 12.60, v: 0.88, cx: 457.5, cy: 223.5, showLabel: true },
                    { clk: "08:00", dt: 23.60, v: 0.04, cx: 778.3, cy: 260.2, showLabel: true },
                  ].map((pt, idx) => (
                    <g key={idx} className="cursor-pointer group">
                      <circle
                        cx={pt.cx}
                        cy={pt.cy}
                        r="5.5"
                        fill="#1e293b"
                        stroke="#c084fc"
                        strokeWidth="2.5"
                        className="transition-all hover:r-7 hover:stroke-purple-300"
                      />
                      {pt.showLabel && (
                        <text
                          x={pt.cx}
                          y={pt.cy - 9}
                          fill="#e9d5ff"
                          fontSize="9.5"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {pt.v.toFixed(2)}L
                        </text>
                      )}
                    </g>
                  ))}

                  {/* Dynamic Time Scrubber Tracking Cursor */}
                  {(() => {
                    // Map timeMin (0 to 510 min) to curve X position (freezing: 158.5 -> sublimation to 778.3)
                    const normTime = Math.min(1.0, Math.max(0, (timeMin - 110) / (510 - 110)));
                    const scrubX = timeMin < 110 ? 158.5 : 158.5 + normTime * (778.3 - 158.5);
                    const scrubY = 262 - (materialVolume / 5.0) * 220;
                    return (
                      <g>
                        <line
                          x1={scrubX}
                          y1="42"
                          x2={scrubX}
                          y2="262"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                        />
                        <circle cx={scrubX} cy={scrubY} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                        {(() => {
                          const badgeY = Math.max(46, Math.min(236, scrubY - 24));
                          return (
                            <g>
                              <rect
                                x={scrubX - 50}
                                y={badgeY}
                                width="100"
                                height="18"
                                rx="4"
                                fill="#020617"
                                fillOpacity="0.9"
                                stroke="#38bdf8"
                                strokeWidth="1.2"
                              />
                              <text
                                x={scrubX}
                                y={badgeY + 13}
                                fill="#38bdf8"
                                fontSize="10"
                                fontWeight="bold"
                                fontFamily="monospace"
                                textAnchor="middle"
                              >
                                Bed: {materialVolume.toFixed(2)} L
                              </text>
                            </g>
                          );
                        })()}
                      </g>
                    );
                  })()}
                </>
              ) : (
                <>
                  {/* ======================================================= */}
                  {/* SCADA & THEORETICAL TEMPERATURE/PRESSURE CANVAS          */}
                  {/* ======================================================= */}
                  {/* Left Y-axis Grid Lines (-80 to +60 °C) */}
                  <line x1="70" y1="30" x2="930" y2="30" stroke="#1e293b" strokeDasharray="3 3" />
                  <text x="60" y="34" fill="#64748b" fontSize="10" textAnchor="end">+60 °C</text>

                  <line x1="70" y1="70" x2="930" y2="70" stroke="#1e293b" strokeDasharray="3 3" />
                  <text x="60" y="74" fill="#64748b" fontSize="10" textAnchor="end">+30 °C</text>

                  <line x1="70" y1="110" x2="930" y2="110" stroke="#334155" strokeWidth="1.5" />
                  <text x="60" y="114" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">0 °C</text>

                  <line x1="70" y1="150" x2="930" y2="150" stroke="#1e293b" strokeDasharray="3 3" />
                  <text x="60" y="154" fill="#64748b" fontSize="10" textAnchor="end">-30 °C</text>

                  <line x1="70" y1="190" x2="930" y2="190" stroke="#1e293b" strokeDasharray="3 3" />
                  <text x="60" y="194" fill="#64748b" fontSize="10" textAnchor="end">-60 °C</text>

                  <line x1="70" y1="230" x2="930" y2="230" stroke="#1e293b" strokeDasharray="3 3" />
                  <text x="60" y="234" fill="#64748b" fontSize="10" textAnchor="end">-80 °C</text>

                  {/* Right Y-axis: Pressure log scale */}
                  <text x="940" y="34" fill="#10b981" fontSize="10">1000 mbar</text>
                  <text x="940" y="110" fill="#10b981" fontSize="10">10 mbar</text>
                  <text x="940" y="180" fill="#10b981" fontSize="10">0.1 mbar</text>
                  <text x="940" y="230" fill="#10b981" fontSize="10">0.01 mbar</text>

                  {/* Evaluated Numeric X-Axis Markers */}
                  <text x={70} y="260" fill="#64748b" fontSize="10" textAnchor="middle">0h (Charge)</text>
                  <text x={221} y="260" fill="#64748b" fontSize="10" textAnchor="middle">1.5h (Freezing)</text>
                  <text x={491} y="260" fill="#64748b" fontSize="10" textAnchor="middle">4h (Sublimation)</text>
                  <text x={775} y="260" fill="#64748b" fontSize="10" textAnchor="middle">7h (Desorption)</text>
                  <text x={930} y="260" fill="#64748b" fontSize="10" textAnchor="middle">8.5h (Harvest)</text>

                  {curveMode === "theoretical" ? (
                    <>
                      {/* Slide 2 Theoretical Curves */}
                      <path
                        d="M 70 117 L 220 117 L 500 117 L 500 110 L 640 110 L 640 100 L 760 100 L 760 83 L 930 83"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                      />
                      <path
                        d="M 70 83 L 103 83 L 138 210 L 172 210 L 220 124 L 640 121 Q 720 118 760 90 T 930 86"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="3"
                      />
                    </>
                  ) : (
                    <>
                      {/* Slide 3 Real SCADA Curves */}
                      <path
                        d="M 70 90 L 103 100 L 103 80 L 138 120 L 760 120 L 760 90 L 930 90"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                      <path
                        d="M 70 190 L 103 210 L 138 220 L 400 225 L 700 220 L 760 215 L 930 200"
                        fill="none"
                        stroke="#d946ef"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M 70 105 L 103 140 L 138 135 L 300 95 L 700 95 L 730 65 L 760 50 L 930 50"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M 70 110 L 103 160 L 138 180 L 220 120 L 650 120 L 730 80 L 760 55 L 930 55"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="3"
                      />
                      <path
                        d="M 70 30 L 103 30 L 138 165 L 700 170 L 760 175 L 800 200 L 880 30 L 930 30"
                        fill="none"
                        stroke="#14b8a6"
                        strokeWidth="2"
                      />
                      <path
                        d="M 70 30 L 103 30 L 138 175 L 700 180 L 760 185 L 800 205 L 880 30 L 930 30"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    </>
                  )}

                  {/* Scrubber Tracking Cursor for SCADA */}
                  {(() => {
                    const curX = 70 + (timeMin / 510) * 860;
                    return (
                      <g>
                        <line
                          x1={curX}
                          y1="25"
                          x2={curX}
                          y2="245"
                          stroke="#f8fafc"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                        <circle cx={curX} cy="25" r="4" fill="#3b82f6" />
                        <rect
                          x={curX - 45}
                          y="5"
                          width="90"
                          height="18"
                          rx="3"
                          fill="#1e293b"
                          stroke="#3b82f6"
                          strokeWidth="1"
                        />
                        <text x={curX} y="17" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">
                          {timeMin.toFixed(0)} min
                        </text>
                      </g>
                    );
                  })()}
                </>
              )}
            </svg>

            {/* Legend & Summary */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs">
              {curveMode === "volume" ? (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-1 bg-purple-400 rounded" />
                    <span className="text-purple-200 font-semibold">Volume in Dryer [liter] (Shrinkage Curve)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-purple-400 bg-slate-900" />
                    <span>Hosokawa Pilot Sample Points (10:45 to 08:00 next day)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
                    <span>Dryer Bed: {materialVolume.toFixed(2)} L ({((materialVolume / 4.35) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-cyan-400 font-mono">
                    <span>Collector: {collectorVolume.toFixed(2)} kg</span>
                  </div>
                </div>
              ) : curveMode === "theoretical" ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-blue-500 rounded" />
                    <span className="text-slate-300">T-Jacket (Stepped Heating)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-red-500 rounded" />
                    <span className="text-slate-300">T-Product (Plunge & Plateau)</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-indigo-500 rounded" />
                    <span className="text-slate-300">Agitator Speed (Hz)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-fuchsia-500 rounded" />
                    <span className="text-slate-300">T-Condenser (°C)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-amber-500 rounded" />
                    <span className="text-slate-300">T-Jacket (°C)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-cyan-400 rounded" />
                    <span className="text-slate-300">T-Product (°C)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-teal-400 rounded" />
                    <span className="text-slate-300">Vac Dryer (mbar)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-blue-400 rounded" />
                    <span className="text-slate-300">Vac Filter (mbar)</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STREAM INSPECTOR & INTERLOCK DATA TABLE                       */}
        {/* ------------------------------------------------------------- */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Table className="w-4 h-4 text-blue-400" />
              Unbundled Process Stream Schedule (Live Batch Data)
            </h3>
            <span className="text-xs text-slate-400">Click a stream to inspect state variables</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900/90 text-slate-300 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Stream</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Source & Destination</th>
                  <th className="py-2.5 px-3">Phase</th>
                  <th className="py-2.5 px-3">Mass Flow</th>
                  <th className="py-2.5 px-3">Temp</th>
                  <th className="py-2.5 px-3">Pressure</th>
                  <th className="py-2.5 px-3">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {streams.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedStream(s.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedStream === s.id
                        ? "bg-blue-600/20 text-white"
                        : "hover:bg-slate-900/60 text-slate-300"
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-blue-400">[{s.id.toString().padStart(2, "0")}]</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-200">{s.name}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-400">{s.from} → {s.to}</td>
                    <td className="py-2.5 px-3 text-slate-300">{s.phase}</td>
                    <td className="py-2.5 px-3 text-slate-200">{s.flow}</td>
                    <td className="py-2.5 px-3 text-amber-300">{s.temp}</td>
                    <td className="py-2.5 px-3 text-emerald-300">{s.press}</td>
                    <td className="py-2.5 px-3">
                      {s.active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Active Flow
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-500">
                          Idle / Closed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
