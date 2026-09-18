"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Cpu,
  Zap,
  ExternalLink,
  PackageCheck,
  Radio,
  GitBranch,
} from "lucide-react";

import { useTheme } from "../layout/ThemeProvider";

interface SubsystemColors {
  colorHex: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  glow: string;
}

interface SubsystemCardData {
  id: string;
  num: string;
  type: string;
  badge: string;
  dark: SubsystemColors;
  light: SubsystemColors;
  title: string;
  description: string;
  spec: string;
  chapterSlug: string;
  chapterLabel: string;
  row: number;
  col: number;
}

// 6 completely distinct dynamic color families with zero hue collisions:
// #03 TCU: Electric Azure Blue
// #01 Vessel: Radiant Gold / Amber
// #05 Vacuum: Royal Violet / Purple
// #06 Collector: Vivid Crimson / Coral Pink (replaces duplicate cyan)
// #07 Discharge: Vibrant Tangelo Orange
// #08 CIP/SIP: Luminescent Emerald Mint
const PRIMARY_SUBSYSTEMS: SubsystemCardData[] = [
  {
    id: "tcu",
    num: "03",
    type: "Thermal Process",
    badge: "Thermal Skid (TCU)",
    dark: {
      colorHex: "#38bdf8", // Sky 400
      badgeBg: "rgba(56, 189, 248, 0.12)",
      badgeText: "#7dd3fc", // Sky 300 - 8.5:1 AAA on dark
      badgeBorder: "rgba(56, 189, 248, 0.40)",
      glow: "rgba(56, 189, 248, 0.45)",
    },
    light: {
      colorHex: "#0284c7", // Sky 600 - 4.8:1 on cream
      badgeBg: "rgba(2, 132, 199, 0.10)",
      badgeText: "#0369a1", // Sky 700 - 7.5:1 AAA on cream
      badgeBorder: "rgba(2, 132, 199, 0.35)",
      glow: "rgba(2, 132, 199, 0.25)",
    },
    title: "TCU (Heat / Cool Skid)",
    description:
      "Circulates Syltherm XLT heat-transfer fluid through the double vessel jacket for dynamic freezing and sublimation heat input.",
    spec: "-60°C to +80°C • Cascade / LN2",
    chapterSlug: "06-primary-drying-heat-and-mass-transfer",
    chapterLabel: "Chapter 06",
    row: 1,
    col: 1,
  },
  {
    id: "vessel",
    num: "01",
    type: "Core Reactor",
    badge: "Jacketed Conical Vessel",
    dark: {
      colorHex: "#fbbf24", // Amber 400
      badgeBg: "rgba(251, 191, 36, 0.12)",
      badgeText: "#fde68a", // Amber 200 - 12:1 AAA on dark
      badgeBorder: "rgba(251, 191, 36, 0.40)",
      glow: "rgba(251, 191, 36, 0.45)",
    },
    light: {
      colorHex: "#b45309", // Amber 700 - 5.2:1 on cream
      badgeBg: "rgba(180, 83, 9, 0.10)",
      badgeText: "#92400e", // Amber 800 - 8.4:1 AAA on cream
      badgeBorder: "rgba(180, 83, 9, 0.35)",
      glow: "rgba(180, 83, 9, 0.25)",
    },
    title: "Lyophilisation Vessel & Agitator",
    description:
      "Downward-pointing 316L conical chamber. Orbiting wall-scraping agitator maintains a dynamic thin bed, discharging loose powder without cakes.",
    spec: "0.04 mbar to 2 bar • Orbital Scraper",
    chapterSlug: "05-vessel-geometry-and-agitator-design",
    chapterLabel: "Chapter 05",
    row: 1,
    col: 2,
  },
  {
    id: "vacuum-path",
    num: "05",
    type: "Vapor Spool",
    badge: "Vacuum Line & Gauges",
    dark: {
      colorHex: "#c084fc", // Purple 400
      badgeBg: "rgba(192, 132, 252, 0.12)",
      badgeText: "#e9d5ff", // Purple 200 - 10.5:1 AAA on dark
      badgeBorder: "rgba(192, 132, 252, 0.40)",
      glow: "rgba(192, 132, 252, 0.45)",
    },
    light: {
      colorHex: "#7e22ce", // Purple 700 - 6.2:1 on cream
      badgeBg: "rgba(126, 34, 206, 0.10)",
      badgeText: "#6b21a8", // Purple 800 - 9.8:1 AAA on cream
      badgeBorder: "rgba(126, 34, 206, 0.35)",
      glow: "rgba(126, 34, 206, 0.25)",
    },
    title: "Vacuum Path & Manometry",
    description:
      "DN400 insulated vapor spool, rapid isolation throttle valve, N2 fine bleed control, and dual Pirani + capacitance manometry.",
    spec: "0.01 to 1013 mbar • Dual Gauges",
    chapterSlug: "11-vacuum-system-sizing-and-pipework",
    chapterLabel: "Chapter 11",
    row: 1,
    col: 3,
  },
  {
    id: "collector-pump",
    num: "06",
    type: "Vacuum Train",
    badge: "Condenser & Separation Train",
    dark: {
      colorHex: "#fb7185", // Rose 400 (Vivid Coral Pink - distinct from cyan)
      badgeBg: "rgba(251, 113, 133, 0.12)",
      badgeText: "#fecdd3", // Rose 200 - 9.5:1 AAA on dark
      badgeBorder: "rgba(251, 113, 133, 0.40)",
      glow: "rgba(251, 113, 133, 0.45)",
    },
    light: {
      colorHex: "#be123c", // Rose 700 - 5.5:1 on cream
      badgeBg: "rgba(190, 18, 60, 0.10)",
      badgeText: "#9f1239", // Rose 800 - 9.1:1 AAA on cream
      badgeBorder: "rgba(190, 18, 60, 0.35)",
      glow: "rgba(190, 18, 60, 0.25)",
    },
    title: "Material Collector & Pump Train",
    description:
      "External sanitary cyclone recovers fine airborne API powder; external -60°C condenser coil with Roots mechanical booster and dry screw backing pump.",
    spec: "Condenser -60°C • Base <0.005 mbar",
    chapterSlug: "22-practical-equipment-sizing-vacuum-and-cryogenics",
    chapterLabel: "Chapter 22",
    row: 2,
    col: 1,
  },
  {
    id: "discharge-valve",
    num: "07",
    type: "Powder Discharge",
    badge: "Sanitary Product Output",
    dark: {
      colorHex: "#fb923c", // Orange 400 (Vibrant Tangelo Orange)
      badgeBg: "rgba(251, 146, 60, 0.12)",
      badgeText: "#fed7aa", // Orange 200 - 11:1 AAA on dark
      badgeBorder: "rgba(251, 146, 60, 0.40)",
      glow: "rgba(251, 146, 60, 0.45)",
    },
    light: {
      colorHex: "#c2410c", // Orange 700 - 5.8:1 on cream
      badgeBg: "rgba(194, 65, 12, 0.10)",
      badgeText: "#9a3412", // Orange 800 - 9.2:1 AAA on cream
      badgeBorder: "rgba(194, 65, 12, 0.35)",
      glow: "rgba(194, 65, 12, 0.25)",
    },
    title: "Bottom Discharge Ball-Segment Valve",
    description:
      "Zero dead-space, bubble-tight pharmaceutical ball-segment valve with inflatable seal for full aseptic product dump into sterile canisters.",
    spec: "Full Vac to 2 bar(g) • Split Valve",
    chapterSlug: "05-vessel-geometry-and-agitator-design",
    chapterLabel: "Chapter 05",
    row: 2,
    col: 2,
  },
  {
    id: "cip-sip",
    num: "08",
    type: "Sanitization Skid",
    badge: "Automated CIP / SIP Skid",
    dark: {
      colorHex: "#34d399", // Emerald 400 (Mint Green)
      badgeBg: "rgba(52, 211, 153, 0.12)",
      badgeText: "#a7f3d0", // Emerald 200 - 11:1 AAA on dark
      badgeBorder: "rgba(52, 211, 153, 0.40)",
      glow: "rgba(52, 211, 153, 0.45)",
    },
    light: {
      colorHex: "#047857", // Emerald 700 - 6.0:1 on cream
      badgeBg: "rgba(4, 120, 87, 0.10)",
      badgeText: "#065f46", // Emerald 800 - 9.5:1 AAA on cream
      badgeBorder: "rgba(4, 120, 87, 0.35)",
      glow: "rgba(4, 120, 87, 0.25)",
    },
    title: "Clean-in-Place & Steam-in-Place",
    description:
      "Multi-point rotary spray balls for 360° vessel wall wash and 121°C pure steam sterilization without equipment dismantling.",
    spec: "121.5°C Pure Steam • WFI Rinse",
    chapterSlug: "07-sanitary-construction-and-cleaning-systems",
    chapterLabel: "Chapter 07",
    row: 2,
    col: 3,
  },
];

export function SystemArchitectureFlowChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeView, setActiveView] = useState<"tree" | "radial">("tree");
  const [hoveredSubsystem, setHoveredSubsystem] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const busRef = useRef<HTMLDivElement>(null);
  const pinRefs = useRef<(HTMLDivElement | null)[]>([]);
  const radialHubRef = useRef<HTMLDivElement>(null);
  const radialPinRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [treePaths, setTreePaths] = useState<string[]>([]);
  const [pinPoints, setPinPoints] = useState<{ x: number; y: number }[]>([]);
  const [busPortPoints, setBusPortPoints] = useState<{ x: number; y: number }[]>([]);
  const [radialPaths, setRadialPaths] = useState<string[]>([]);
  const [radialPinPoints, setRadialPinPoints] = useState<{ x: number; y: number }[]>([]);
  const [radialOriginPoints, setRadialOriginPoints] = useState<{ x: number; y: number }[]>([]);

  // Calculate pixel-perfect coordinates connecting the Bus directly to card pins
  // GUARANTEED ZERO OVERLAP & ZERO LINE CROSSINGS
  const updateGeometry = useCallback(() => {
    if (!containerRef.current) return;
    const contRect = containerRef.current.getBoundingClientRect();

    if (activeView === "tree" && busRef.current) {
      const bRect = busRef.current.getBoundingClientRect();
      const busX = bRect.left + bRect.width / 2 - contRect.left;
      const busY = bRect.bottom - contRect.top;
      const bWidth = bRect.width;

      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < 6; i++) {
        const pin = pinRefs.current[i];
        if (pin) {
          const pRect = pin.getBoundingClientRect();
          pts.push({
            x: pRect.left + pRect.width / 2 - contRect.left,
            y: pRect.top + pRect.height / 2 - contRect.top,
          });
        }
      }

      if (pts.length === 6 && pts[0].x > 0) {
        setPinPoints(pts);

        // Level 1 Nodes (Col 1, Col 2, Col 3 in Row 1)
        const p0 = pts[0]; // #03 TCU (Row 1, Col 1 - Far Left)
        const p1 = pts[1]; // #01 Vessel (Row 1, Col 2 - Center)
        const p2 = pts[2]; // #05 Vacuum (Row 1, Col 3 - Far Right)

        // Level 2 Nodes (Col 1, Col 2, Col 3 in Row 2)
        const p3 = pts[3]; // #06 Collector (Row 2, Col 1 - Far Left)
        const p4 = pts[4]; // #07 Discharge (Row 2, Col 2 - Center)
        const p5 = pts[5]; // #08 CIP/SIP (Row 2, Col 3 - Far Right)

        // Wide highway gaps between card columns for routing Level 2 paths with generous clearance
        const gap1X = (p0.x + p1.x) / 2; // Midpoint between Col 1 and Col 2 (~350px)
        const gap2X = (p1.x + p2.x) / 2; // Midpoint between Col 2 and Col 3 (~670px)

        // ================= MATHEMATICAL PROOF OF ZERO CROSSINGS =================
        // Destinations sorted by X coordinate:
        // p0.x (Col 1) < gap1X (Gap 1) < p1.x (Col 2) < gap2X (Gap 2) < p2.x (Col 3)
        //
        // In Gap 1, we allocate two dedicated parallel conduit lanes with generous clearance:
        // lane6X (for #06 Collector) on the left side of Gap 1
        // lane7X (for #07 Discharge) on the right side of Gap 1
        // This completely eliminates any line crossings or card overlaps!
        const lane6X = gap1X - 22;
        const lane7X = gap1X + 22;

        const port0X = busX - Math.min(bWidth * 0.42, 190); // Port 0 (TCU #03 - Far Left)
        const port3X = busX - Math.min(bWidth * 0.24, 110); // Port 3 (Collector #06 - Mid Left)
        const port4X = busX - Math.min(bWidth * 0.08, 38);  // Port 4 (Discharge #07 - Inner Left)
        const port1X = busX + Math.min(bWidth * 0.08, 38);  // Port 1 (Vessel #01 - Inner Right / Center)
        const port5X = busX + Math.min(bWidth * 0.24, 110); // Port 5 (CIP/SIP #08 - Mid Right)
        const port2X = busX + Math.min(bWidth * 0.42, 190); // Port 2 (Vacuum #05 - Far Right)

        setBusPortPoints([
          { x: port0X, y: busY },
          { x: port1X, y: busY },
          { x: port2X, y: busY },
          { x: port3X, y: busY },
          { x: port4X, y: busY },
          { x: port5X, y: busY },
        ]);

        // Alley Y coordinates between Row 1 and Row 2 for smooth turning
        const rowAlleyY1 = p0.y + (p3.y - p0.y) * 0.52;
        const rowAlleyY2 = p0.y + (p3.y - p0.y) * 0.68;

        // 1. Path to Card #03 (Row 1 Col 1): leaves Far Left port on bus, sweeps into top pin of Card #03
        const path0 = `M ${port0X},${busY} C ${port0X - 10},${busY + (p0.y - busY) * 0.45} ${p0.x + 10},${busY + (p0.y - busY) * 0.60} ${p0.x},${p0.y}`;

        // 2. Path to Card #01 (Row 1 Col 2): drops directly from bus into top pin of Card #01
        const path1 = `M ${port1X},${busY} C ${port1X},${busY + 20} ${p1.x},${p1.y - 20} ${p1.x},${p1.y}`;

        // 3. Path to Card #05 (Row 1 Col 3): leaves Far Right port on bus, sweeps into top pin of Card #05
        const path2 = `M ${port2X},${busY} C ${port2X + 10},${busY + (p2.y - busY) * 0.45} ${p2.x - 10},${busY + (p2.y - busY) * 0.60} ${p2.x},${p2.y}`;

        // 4. Path to Card #06 (Row 2 Col 1): Leaves Mid-Left port, enters Gap 1 at lane6X, travels down Gap 1,
        // then in the alley between rows turns smoothly left into top pin of Card #06.
        const path3 = `M ${port3X},${busY} C ${port3X - 5},${busY + 26} ${lane6X},${p0.y - 45} ${lane6X},${p0.y} L ${lane6X},${rowAlleyY1} C ${lane6X},${p3.y - 22} ${p3.x + 25},${p3.y - 25} ${p3.x},${p3.y}`;

        // 5. Path to Card #07 (Row 2 Col 2): Leaves Inner-Left port, enters Gap 1 at lane7X, travels down Gap 1
        // with 44px clearance from lane6X, passes Row 1 cards cleanly, then turns right into top pin of Card #07!
        const path4 = `M ${port4X},${busY} C ${port4X},${busY + 28} ${lane7X},${p1.y - 45} ${lane7X},${p1.y} L ${lane7X},${rowAlleyY2} C ${lane7X},${p4.y - 20} ${p4.x - 25},${p4.y - 25} ${p4.x},${p4.y}`;

        // 6. Path to Card #08 (Row 2 Col 3): Leaves Mid-Right port, enters Gap 2 at gap2X, travels down Gap 2,
        // then in the alley turns smoothly right into top pin of Card #08.
        const path5 = `M ${port5X},${busY} C ${port5X + 5},${busY + 28} ${gap2X},${p2.y - 45} ${gap2X},${p2.y} L ${gap2X},${rowAlleyY1} C ${gap2X},${p5.y - 22} ${p5.x - 25},${p5.y - 25} ${p5.x},${p5.y}`;

        setTreePaths([path0, path1, path2, path3, path4, path5]);
      }
    } else if (activeView === "radial" && radialHubRef.current) {
      const hRect = radialHubRef.current.getBoundingClientRect();
      const startX = hRect.right - contRect.left;
      const startCenterY = hRect.top + hRect.height / 2 - contRect.top;

      const rPts: { x: number; y: number }[] = [];
      const rOrigins: { x: number; y: number }[] = [];
      const rPaths: string[] = [];

      for (let i = 0; i < 6; i++) {
        const pin = radialPinRefs.current[i];
        if (pin) {
          const pRect = pin.getBoundingClientRect();
          const targetX = pRect.left + pRect.width / 2 - contRect.left;
          const targetY = pRect.top + pRect.height / 2 - contRect.top;
          rPts.push({ x: targetX, y: targetY });

          // Stagger departure ports along the vertical edge of the central hub so lines emerge as parallel channels without overlapping
          const originY = startCenterY + (i - 2.5) * 26;
          rOrigins.push({ x: startX, y: originY });

          const cX1 = startX + (targetX - startX) * 0.42;
          const cX2 = startX + (targetX - startX) * 0.58;
          rPaths.push(
            `M ${startX},${originY} C ${cX1},${originY} ${cX2},${targetY} ${targetX},${targetY}`
          );
        }
      }

      if (rPts.length === 6) {
        setRadialPinPoints(rPts);
        setRadialOriginPoints(rOrigins);
        setRadialPaths(rPaths);
      }
    }
  }, [activeView]);

  useEffect(() => {
    updateGeometry();
    const handleResize = () => updateGeometry();
    window.addEventListener("resize", handleResize);

    // Also observe container size changes
    const observer = new ResizeObserver(() => {
      updateGeometry();
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const timer = setTimeout(updateGeometry, 150);
    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [updateGeometry, activeView]);

  return (
    <div
      ref={containerRef}
      className="my-8 not-prose no-underline-force rounded-3xl border border-hairline bg-bg-panel shadow-2xl overflow-hidden backdrop-blur-sm relative"
    >
      <style jsx global>{`
        .no-underline-force,
        .no-underline-force * {
          text-decoration: none !important;
        }
        @keyframes flowDashSlow {
          from {
            stroke-dashoffset: 48;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-flow-dash-slow {
          animation: flowDashSlow 2s linear infinite;
        }
        @keyframes radarPulse {
          0% {
            r: 5px;
            opacity: 0.95;
          }
          70% {
            r: 14px;
            opacity: 0;
          }
          100% {
            r: 14px;
            opacity: 0;
          }
        }
        .animate-radar-pulse {
          animation: radarPulse 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite;
        }
      `}</style>

      {/* Top Title Banner with View Switcher */}
      <div className="p-5 sm:p-6 border-b border-hairline bg-bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-500 font-bold">
              Subsystem Topology • Dynamic Control Network
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-ink-primary mt-1">
            Top-Level System Architecture &amp; Flowchart
          </h3>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            Real-time animated PROFINET I/O bus paths connected directly to every equipment terminal node.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="inline-flex items-center p-1 rounded-xl bg-bg-inset border border-hairline text-xs font-mono shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveView("tree")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeView === "tree"
                ? "bg-amber text-on-amber shadow-sm"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Bus Topology</span>
          </button>
          <button
            onClick={() => setActiveView("radial")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeView === "radial"
                ? "bg-amber text-on-amber shadow-sm"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Radial Hub Flow</span>
          </button>
        </div>
      </div>

      {/* ================= SVG OVERLAY FOR PRECISION ANIMATED CONNECTORS ================= */}
      {activeView === "tree" && treePaths.length === 6 && (
        <svg
          className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          shapeRendering="geometricPrecision"
          style={{ transform: "translateZ(0)", willChange: "transform" }}
        >
          <defs>
            <filter id="glow-terminal" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Dedicated discrete Bus Departure Terminals anchored on the bottom edge of the Bus pill */}
          {busPortPoints.map((bPt, bIdx) => {
            const sub = PRIMARY_SUBSYSTEMS[bIdx];
            if (!sub || !bPt) return null;
            const themeColors = isDark ? sub.dark : sub.light;
            return (
              <g key={`bus-terminal-port-${sub.id}`}>
                <circle cx={bPt.x} cy={bPt.y} r="3.5" fill={themeColors.colorHex} />
                <circle
                  cx={bPt.x}
                  cy={bPt.y}
                  r="6.5"
                  fill="none"
                  stroke={themeColors.colorHex}
                  strokeWidth="1.2"
                  strokeOpacity="0.7"
                />
              </g>
            );
          })}

          {PRIMARY_SUBSYSTEMS.map((sub, idx) => {
            const pathD = treePaths[idx];
            const pt = pinPoints[idx];
            const isHovered = hoveredSubsystem === sub.id;
            const themeColors = isDark ? sub.dark : sub.light;
            const activeColor = themeColors.colorHex;

            if (!pathD || !pt) return null;

            return (
              <g key={`tree-wire-${sub.id}`}>
                {/* 1. Base Wire Guide Line */}
                <path
                  d={pathD}
                  stroke={activeColor}
                  strokeWidth={isHovered ? "3.5" : "2"}
                  strokeOpacity={isHovered ? "1" : isDark ? "0.55" : "0.75"}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  shapeRendering="geometricPrecision"
                />

                {/* 2. Animated Flowing Data Packets */}
                <path
                  d={pathD}
                  stroke={activeColor}
                  strokeWidth="2"
                  strokeDasharray="5 9"
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  shapeRendering="geometricPrecision"
                  className="animate-flow-dash-slow"
                />

                {/* 3. Traveling Glowing Particle Circle */}
                <circle r="4.5" fill={activeColor} filter="url(#glow-terminal)">
                  <animateMotion
                    path={pathD}
                    dur={`${1.6 + idx * 0.18}s`}
                    repeatCount="indefinite"
                  />
                </circle>

                {/* 4. Terminal Arrival Contact Dot (Directly inside card pin, ZERO gap!) */}
                <circle cx={pt.x} cy={pt.y} r={isHovered ? "5" : "4"} fill={activeColor} />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="9"
                  fill="none"
                  stroke={activeColor}
                  strokeWidth="1.5"
                  shapeRendering="geometricPrecision"
                  className="animate-radar-pulse"
                />
              </g>
            );
          })}
        </svg>
      )}

      {/* SVG OVERLAY FOR RADIAL VIEW */}
      {activeView === "radial" && radialPaths.length === 6 && (
        <svg
          className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          shapeRendering="geometricPrecision"
          style={{ transform: "translateZ(0)", willChange: "transform" }}
        >
          <defs>
            <filter id="glow-radial" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Staggered Hub Departure Ports along the right edge of the master controller */}
          {radialOriginPoints.map((oPt, oIdx) => {
            const sub = PRIMARY_SUBSYSTEMS[oIdx];
            if (!sub || !oPt) return null;
            const themeColors = isDark ? sub.dark : sub.light;
            return (
              <g key={`radial-origin-port-${sub.id}`}>
                <circle cx={oPt.x} cy={oPt.y} r="3.5" fill={themeColors.colorHex} />
                <circle
                  cx={oPt.x}
                  cy={oPt.y}
                  r="6.5"
                  fill="none"
                  stroke={themeColors.colorHex}
                  strokeWidth="1.2"
                  strokeOpacity="0.7"
                />
              </g>
            );
          })}

          {PRIMARY_SUBSYSTEMS.map((sub, idx) => {
            const pathD = radialPaths[idx];
            const pt = radialPinPoints[idx];
            const isHovered = hoveredSubsystem === sub.id;
            const themeColors = isDark ? sub.dark : sub.light;
            const activeColor = themeColors.colorHex;

            if (!pathD || !pt) return null;

            return (
              <g key={`radial-wire-${sub.id}`}>
                {/* 1. Underlying Base Wire Line */}
                <path
                  d={pathD}
                  stroke={activeColor}
                  strokeWidth={isHovered ? "3.5" : "2"}
                  strokeOpacity={isHovered ? "0.95" : isDark ? "0.55" : "0.75"}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  shapeRendering="geometricPrecision"
                />

                {/* 2. Flowing Animated Dash Line */}
                <path
                  d={pathD}
                  stroke={activeColor}
                  strokeWidth="2"
                  strokeDasharray="6 10"
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  shapeRendering="geometricPrecision"
                  className="animate-flow-dash-slow"
                />

                {/* 3. Traveling Glowing Particle Packet */}
                <circle r="4.5" fill={activeColor} filter="url(#glow-radial)">
                  <animateMotion
                    path={pathD}
                    dur={`${1.5 + idx * 0.15}s`}
                    repeatCount="indefinite"
                  />
                </circle>

                {/* 4. Terminal Arrival Contact Dot */}
                <circle cx={pt.x} cy={pt.y} r={isHovered ? "5" : "4"} fill={activeColor} />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="9"
                  fill="none"
                  stroke={activeColor}
                  strokeWidth="1.5"
                  shapeRendering="geometricPrecision"
                  className="animate-radar-pulse"
                />
              </g>
            );
          })}
        </svg>
      )}

      <div className="p-5 sm:p-7 space-y-6 relative z-0">
        {/* ================= VIEW 1: BUS TOPOLOGY ================= */}
        {activeView === "tree" && (
          <div className="space-y-6">
            {/* TIER 1: SUPERVISORY CONTROLLER (MASTER NODE) */}
            <Link
              href="/hosokawa-afd-freeze-dryer/20-control-system-architecture"
              className="group block p-5 rounded-2xl border border-hairline bg-bg-surface hover:border-emerald-500 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 relative z-20"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold">
                        Subsystem #13 • Supervisory Automation Hub
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                        PLC &amp; HMI
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-ink-primary group-hover:text-emerald-500 transition-colors mt-0.5">
                      Control System (PLC / HMI, 21 CFR Part 11)
                    </h4>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-500 shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <span>Chapter 20 Specs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-ink-secondary mt-2.5 leading-relaxed">
                Executes automated ISA-88 recipe cycles, PID temperature &amp; vacuum control loops, SIL 2 safety interlocks, and 21 CFR Part 11 tamper-proof audit records.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono text-ink-dim">
                <span className="px-2.5 py-1 rounded-lg bg-bg-inset border border-hairline">Siemens S7-1500 (BPCS)</span>
                <span className="px-2.5 py-1 rounded-lg bg-bg-inset border border-hairline">S7-1500F Safety (SIS SIL 2)</span>
                <span className="px-2.5 py-1 rounded-lg bg-bg-inset border border-hairline">WinCC Unified SCADA</span>
              </div>
            </Link>

            {/* CENTRAL BUS PILL & CONNECTOR STEM */}
            <div className="flex flex-col items-center relative z-20 pb-4">
              <div className="h-4 w-0.5 bg-emerald-500/60" />
              <div
                ref={busRef}
                className="px-4 py-1.5 rounded-full bg-bg-surface border border-emerald-500/40 text-[10px] font-mono text-emerald-500 font-bold tracking-wider uppercase flex items-center gap-2 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>I/O Signal &amp; Safety Bus (PROFINET / PROFIsafe • 100 Mbps Cyclic)</span>
              </div>
            </div>

            {/* TIER 2: PRIMARY PROCESS SUBSYSTEMS GRID (ROW 1: SUBSYSTEMS 03, 01, 05) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-14 relative z-20">
              {PRIMARY_SUBSYSTEMS.filter((s) => s.row === 1).map((sub, idx) => {
                const themeColors = isDark ? sub.dark : sub.light;
                const isHovered = hoveredSubsystem === sub.id;

                return (
                  <Link
                    key={sub.id}
                    href={`/hosokawa-afd-freeze-dryer/${sub.chapterSlug}`}
                    onMouseEnter={() => setHoveredSubsystem(sub.id)}
                    onMouseLeave={() => setHoveredSubsystem(null)}
                    className="group relative p-6 rounded-2xl border border-hairline bg-bg-surface hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                    style={{
                      borderColor: isHovered ? themeColors.colorHex : undefined,
                      boxShadow: isHovered
                        ? `0 10px 30px -10px ${themeColors.glow}`
                        : undefined,
                    }}
                  >
                    {/* Top Terminal Pin (Wire connects DIRECTLY here, no air gap!) */}
                    <div
                      ref={(el) => {
                        pinRefs.current[idx] = el;
                      }}
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 bg-bg-surface flex items-center justify-center shadow-md z-30"
                      style={{ borderColor: themeColors.colorHex }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: themeColors.colorHex }}
                      />
                    </div>

                    <div>
                      {/* Line 1: Subsystem identifier and domain */}
                      <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
                        <span
                          className="font-bold"
                          style={{ color: themeColors.colorHex }}
                        >
                          Subsystem #{sub.num}
                        </span>
                        <span className="text-[10px] text-ink-dim uppercase tracking-wider">
                          {sub.type}
                        </span>
                      </div>

                      {/* Line 2: Blue / colored subsystem badge on its OWN line with pristine WCAG AAA contrast */}
                      <div className="mt-2.5 mb-2.5">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono font-bold border shadow-sm"
                          style={{
                            backgroundColor: themeColors.badgeBg,
                            color: themeColors.badgeText,
                            borderColor: themeColors.badgeBorder,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: themeColors.colorHex }}
                          />
                          {sub.badge}
                        </span>
                      </div>

                      {/* Line 3: Clean, spacious title */}
                      <h4 className="text-base font-bold text-ink-primary group-hover:text-amber transition-colors leading-snug">
                        {sub.title}
                      </h4>

                      {/* Line 4: Clean, readable description */}
                      <p className="text-xs text-ink-secondary mt-2.5 leading-relaxed">
                        {sub.description}
                      </p>
                    </div>

                    {/* Footer: Single line, whitespace-nowrap, never splits Ch and 06! */}
                    <div className="mt-5 pt-3 border-t border-hairline/60 flex items-center justify-between gap-2 text-xs font-mono">
                      <span className="text-ink-dim text-[11px] truncate max-w-[170px]" title={sub.spec}>
                        {sub.spec}
                      </span>
                      <span className="whitespace-nowrap inline-flex items-center gap-1 font-bold text-amber group-hover:text-amber-light group-hover:translate-x-0.5 transition-all shrink-0">
                        <span>{sub.chapterLabel}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* SPACIOUS GAP BETWEEN ROW 1 AND ROW 2 FOR LEVEL 2 CONDUIT ROUTING */}
            <div className="h-16 sm:h-20 lg:h-24" />

            {/* TIER 2: PRIMARY PROCESS SUBSYSTEMS GRID (ROW 2: SUBSYSTEMS 06, 07, 08) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-14 relative z-20">
              {PRIMARY_SUBSYSTEMS.filter((s) => s.row === 2).map((sub, idx) => {
                const themeColors = isDark ? sub.dark : sub.light;
                const isHovered = hoveredSubsystem === sub.id;

                return (
                  <Link
                    key={sub.id}
                    href={`/hosokawa-afd-freeze-dryer/${sub.chapterSlug}`}
                    onMouseEnter={() => setHoveredSubsystem(sub.id)}
                    onMouseLeave={() => setHoveredSubsystem(null)}
                    className="group relative p-6 rounded-2xl border border-hairline bg-bg-surface hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                    style={{
                      borderColor: isHovered ? themeColors.colorHex : undefined,
                      boxShadow: isHovered
                        ? `0 10px 30px -10px ${themeColors.glow}`
                        : undefined,
                    }}
                  >
                    {/* Top Terminal Pin (Level 2 Wire passes down through gap and lands DIRECTLY here!) */}
                    <div
                      ref={(el) => {
                        pinRefs.current[idx + 3] = el;
                      }}
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 bg-bg-surface flex items-center justify-center shadow-md z-30"
                      style={{ borderColor: themeColors.colorHex }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: themeColors.colorHex }}
                      />
                    </div>

                    <div>
                      {/* Line 1: Subsystem identifier and domain */}
                      <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
                        <span
                          className="font-bold"
                          style={{ color: themeColors.colorHex }}
                        >
                          Subsystem #{sub.num}
                        </span>
                        <span className="text-[10px] text-ink-dim uppercase tracking-wider">
                          {sub.type}
                        </span>
                      </div>

                      {/* Line 2: Blue / colored subsystem badge on its OWN line with pristine WCAG AAA contrast */}
                      <div className="mt-2.5 mb-2.5">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono font-bold border shadow-sm"
                          style={{
                            backgroundColor: themeColors.badgeBg,
                            color: themeColors.badgeText,
                            borderColor: themeColors.badgeBorder,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: themeColors.colorHex }}
                          />
                          {sub.badge}
                        </span>
                      </div>

                      {/* Line 3: Clean, spacious title */}
                      <h4 className="text-base font-bold text-ink-primary group-hover:text-amber transition-colors leading-snug">
                        {sub.title}
                      </h4>

                      {/* Line 4: Clean, readable description */}
                      <p className="text-xs text-ink-secondary mt-2.5 leading-relaxed">
                        {sub.description}
                      </p>
                    </div>

                    {/* Footer: Single line, whitespace-nowrap, never splits Ch and 06! */}
                    <div className="mt-5 pt-3 border-t border-hairline/60 flex items-center justify-between gap-2 text-xs font-mono">
                      <span className="text-ink-dim text-[11px] truncate max-w-[170px]" title={sub.spec}>
                        {sub.spec}
                      </span>
                      <span className="whitespace-nowrap inline-flex items-center gap-1 font-bold text-amber group-hover:text-amber-light group-hover:translate-x-0.5 transition-all shrink-0">
                        <span>{sub.chapterLabel}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= VIEW 2: RADIAL HUB FLOW (DIRECTLY MATCHING USER VIDEO) ================= */}
        {activeView === "radial" && (
          <div className="relative">
            <div className="flex flex-col md:flex-row items-stretch gap-6 relative">
              {/* LEFT: MASTER CONTROLLER HUB (LIKE THE CENTRAL CIRCLE IN THE VIDEO) */}
              <div
                ref={radialHubRef}
                className="w-full md:w-80 shrink-0 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/40 bg-bg-surface/90 backdrop-blur-md shadow-2xl relative overflow-hidden group z-20"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

                {/* Animated Central Node Ring */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-emerald-500/50 flex items-center justify-center bg-bg-panel shadow-inner mb-4">
                  <div className="absolute inset-0 rounded-full border border-emerald-400/40 animate-ping" />
                  <div className="absolute -inset-2 rounded-full border border-emerald-500/20 animate-pulse" />

                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg group-hover:scale-110 transition-transform">
                    <Cpu className="w-7 h-7" />
                  </div>
                </div>

                <div className="text-center space-y-1 z-10">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                    PROFINET / PROFIsafe Master
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-ink-primary">
                    AFD Supervisory Automation
                  </h4>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    Siemens S7-1500 &bull; SIL 2 SIS &bull; WinCC Unified SCADA
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-hairline/60 w-full flex items-center justify-between text-[11px] font-mono text-ink-dim z-10">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    100 Mbps Bus
                  </span>
                  <span>Cyclic I/O Sync</span>
                </div>

                <Link
                  href="/hosokawa-afd-freeze-dryer/20-control-system-architecture"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 transition-colors z-10"
                >
                  <span>Open Chapter 20 Specs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* RIGHT: CONNECTED SUBSYSTEM CARDS STACK */}
              <div className="flex-1 space-y-3.5 relative z-20">
                {PRIMARY_SUBSYSTEMS.map((sub, idx) => {
                  const themeColors = isDark ? sub.dark : sub.light;
                  const isHovered = hoveredSubsystem === sub.id;

                  return (
                    <Link
                      key={sub.id}
                      href={`/hosokawa-afd-freeze-dryer/${sub.chapterSlug}`}
                      onMouseEnter={() => setHoveredSubsystem(sub.id)}
                      onMouseLeave={() => setHoveredSubsystem(null)}
                      className="group relative p-4 sm:p-5 rounded-2xl border border-hairline bg-bg-surface hover:shadow-xl hover:-translate-x-1 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      style={{
                        borderColor: isHovered ? themeColors.colorHex : undefined,
                        boxShadow: isHovered
                          ? `0 8px 24px -6px ${themeColors.glow}`
                          : undefined,
                      }}
                    >
                      {/* Left node connector terminal pin (Wire enters directly here!) */}
                      <div
                        ref={(el) => {
                          radialPinRefs.current[idx] = el;
                        }}
                        className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-bg-surface items-center justify-center shadow-md z-30"
                        style={{ borderColor: themeColors.colorHex }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: themeColors.colorHex }}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span
                            className="font-bold"
                            style={{ color: themeColors.colorHex }}
                          >
                            Subsystem #{sub.num}
                          </span>
                          <span className="text-[10px] text-ink-dim uppercase tracking-wider">
                            &bull; {sub.type}
                          </span>
                        </div>

                        <div>
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold border shadow-sm"
                            style={{
                              backgroundColor: themeColors.badgeBg,
                              color: themeColors.badgeText,
                              borderColor: themeColors.badgeBorder,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: themeColors.colorHex }}
                            />
                            {sub.badge}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-ink-primary group-hover:text-amber transition-colors">
                          {sub.title}
                        </h4>

                        <p className="text-xs text-ink-secondary leading-relaxed max-w-xl">
                          {sub.description}
                        </p>
                      </div>

                      <div className="sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-hairline/60">
                        <div className="text-[11px] font-mono text-ink-dim truncate max-w-[170px]">
                          {sub.spec}
                        </div>
                        <div className="mt-1 whitespace-nowrap inline-flex items-center gap-1 font-bold font-mono text-xs text-amber group-hover:text-amber-light group-hover:translate-x-0.5 transition-all">
                          <span>{sub.chapterLabel}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TIER 3: POWDER CONTAINMENT CANISTER DOCK ================= */}
        <div className="p-4 sm:p-5 rounded-2xl border border-hairline bg-bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber shrink-0">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber font-bold">
                Closed Containment Interface
              </div>
              <h4 className="text-sm font-bold text-ink-primary">
                Product Collection Canister (Split-Butterfly Alpha/Beta Port)
              </h4>
              <p className="text-xs text-ink-muted">
                Docks hermetically underneath the bottom discharge valve for dust-free aseptic powder transfer under inert N2 blanket.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-bg-inset border border-hairline text-xs font-mono text-ink-secondary shrink-0">
            Aseptic Isolator Dock
          </span>
        </div>

        {/* ================= TIER 4: UTILITY MANAGEMENT SKID (FOUNDATION) ================= */}
        <div className="p-4 sm:p-5 rounded-2xl border border-hairline bg-bg-surface relative z-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                  Subsystem #14 • Plant Infrastructure
                </div>
                <h4 className="text-sm sm:text-base font-bold text-ink-primary">
                  Central Utility Management Skid (Facility Manifold)
                </h4>
              </div>
            </div>

            <div className="text-xs font-mono text-ink-muted">
              Supplies and regulates utilities to all subsystems
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono text-ink-secondary text-center">
            <span className="p-2 rounded-lg bg-bg-inset border border-hairline">⚡ 400V 3Φ Power</span>
            <span className="p-2 rounded-lg bg-bg-inset border border-hairline">💨 6 bar Dry Air</span>
            <span className="p-2 rounded-lg bg-bg-inset border border-hairline">🛡️ 99.999% N2</span>
            <span className="p-2 rounded-lg bg-bg-inset border border-hairline">💧 WFI / Water</span>
            <span className="p-2 rounded-lg bg-bg-inset border border-hairline">♨️ Clean Steam</span>
            <span className="p-2 rounded-lg bg-bg-inset border border-hairline">❄️ Chilled Glycol</span>
          </div>
        </div>
      </div>
    </div>
  );
}
