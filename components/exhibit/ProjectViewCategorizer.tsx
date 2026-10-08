"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Wrench,
  Cpu,
  Layers,
  Flame,
  Search,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Boxes,
  FileCode2,
  HardHat,
  SlidersHorizontal,
  Compass,
  Zap,
  Activity,
  Sparkles,
} from "lucide-react";
import type { ChapterMeta, ActConfig } from "@/lib/types";

interface ProjectViewCategorizerProps {
  projectSlug: string;
  chapters: ChapterMeta[];
  acts: ActConfig[];
}

export type CategoryKey = "all" | "mechanical" | "process" | "automation" | "reference";

interface ChapterDetailMeta {
  deliverable: string;
  hardwareFocus: string;
  tags: string[];
  simulatorName?: string;
  discipline: "MECHANICAL" | "PROCESS" | "ELECTRICAL" | "FOUNDATIONS" | "TESTING";
  disciplineColor: string;
}

export const CHAPTER_DETAILS: Record<string, ChapterDetailMeta> = {
  "01-physics-and-thermodynamics": {
    deliverable: "Phase equilibrium curves, Goff-Gratch vapor pressure equations, Knudsen diffusion regime, and sonic choked sublimating vapor flux.",
    hardwareFocus: "Sublimation Heat Flux & Mass Transfer",
    tags: ["Clausius-Clapeyron", "Knudsen Diffusion", "Goff-Gratch", "Sonic Limit"],
    simulatorName: "PhaseDiagramExplorer",
    discipline: "FOUNDATIONS",
    disciplineColor: "text-amber border-amber/30 bg-amber/10",
  },
  "02-hosokawa-afd-vs-generic-lyophilizers": {
    deliverable: "Three-way engineering benchmark comparing conventional static shelf freeze dryers vs. Lyo Beads (cryopelletization) vs. agitated conical AFD.",
    hardwareFocus: "Agitated Conical vs Shelf vs Beads",
    tags: ["Nauta Screw Agitation", "Dynamic Cake Renewal", "Lyo Beads Matrix"],
    simulatorName: "AfdComparisonFlip",
    discipline: "FOUNDATIONS",
    disciplineColor: "text-amber border-amber/30 bg-amber/10",
  },
  "03-process-flowsheets-bfd-and-pfd": {
    deliverable: "Canonical Block Flow Diagram (BFD) and unbundled Process Flow Diagrams (PFD) with mass & energy balances for LN2, solvent vapor, and product.",
    hardwareFocus: "System Flowsheets & Mass Balances",
    tags: ["Canonical BFD", "ISA PFD", "Mass/Energy Balances", "Stream Tables"],
    simulatorName: "VacuumVsFreezeDryerStudio",
    discipline: "FOUNDATIONS",
    disciplineColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  },
  "04-system-architecture-and-subsystems": {
    deliverable: "17-subsystem architectural breakdown, physical skid interfaces, utility hookups, and overall process cycle time scrubber.",
    hardwareFocus: "17-Subsystem Skid Integration",
    tags: ["17 Subsystems", "Physical Skid Boundaries", "Cycle Profiling"],
    simulatorName: "CycleProfileScrubber",
    discipline: "FOUNDATIONS",
    disciplineColor: "text-amber border-amber/30 bg-amber/10",
  },
  "05-vessel-chamber-agitator-and-materials": {
    deliverable: "Conical chamber angle (17-20°), orbiting cantilever screw agitator, zero-bottom-bearing mount, and double dry gas mechanical seal.",
    hardwareFocus: "Cone & Cantilever Screw Agitator",
    tags: ["SS316L / Hastelloy", "Zero Bottom Bearing", "Double Mechanical Seal", "Orbital Drive"],
    simulatorName: "VesselCrossSection3D",
    discipline: "MECHANICAL",
    disciplineColor: "text-amber border-amber/40 bg-amber/15",
  },
  "06-materials-fabrication-tolerances-and-welding": {
    deliverable: "Material callouts (EN 1.4404 / SS316L), surface finish standards (Ra ≤ 0.4 µm electropolished), ASME Section VIII Div 1 weld preps, and CNC machining tolerances.",
    hardwareFocus: "Workshop Machining & ASME Sec VIII",
    tags: ["Ra ≤ 0.4 µm", "WPS/PQR ASME", "Orbital Tube Welds", "Electropolishing"],
    discipline: "MECHANICAL",
    disciplineColor: "text-amber border-amber/40 bg-amber/15",
  },
  "07-design-calculations-and-sizing-methodology": {
    deliverable: "First-principles engineering equations: vessel working volume, heat transfer coefficients (U_jacket), motor drive torque, and condenser ice capture capacity.",
    hardwareFocus: "Sizing Math & Thermal Balances",
    tags: ["Sublimation Rate", "Refrigeration Load", "Torque Equations", "Pumping Speed"],
    simulatorName: "SublimationRateCalculator",
    discipline: "MECHANICAL",
    disciplineColor: "text-amber border-amber/40 bg-amber/15",
  },
  "08-vessel-sizing-suite-and-parametric-tool": {
    deliverable: "Interactive sizing suite for 5L to 500L pilot/production units: aspect ratios, cone half-angles, surface-to-volume scaling, and jacket pressure drops.",
    hardwareFocus: "Parametric Cone Geometry Sizing",
    tags: ["Parametric Sizing", "Cone Half-Angle", "Scaling Equations", "Jacket Area"],
    simulatorName: "VesselSizingSuite",
    discipline: "MECHANICAL",
    disciplineColor: "text-amber border-amber/40 bg-amber/15",
  },
  "09-cad-solidworks-assembly-and-nozzle-schedule": {
    deliverable: "Complete nozzle schedule (N1–N18) with ASME BPE Tri-Clamp and DIN 11864 sanitary flanges, plus 3D SolidWorks assembly tree hierarchy.",
    hardwareFocus: "3D CAD Model & Nozzles N1-N18",
    tags: ["Nozzle Schedule N1-N18", "ASME BPE Flanges", "SolidWorks Hierarchy", "CAD Clearance"],
    discipline: "MECHANICAL",
    disciplineColor: "text-amber border-amber/40 bg-amber/15",
  },
  "10-drawings-and-schematics-to-create": {
    deliverable: "Workshop fabrication drawing checklist: GA layout, vessel cross-section, cantilever shaft details, jacket baffle layout, and skid skid mounting.",
    hardwareFocus: "Shop Drawings & GA Blueprints",
    tags: ["Shop Drawings", "GA Views", "Cross-Sections", "Welding Maps"],
    discipline: "MECHANICAL",
    disciplineColor: "text-amber border-amber/40 bg-amber/15",
  },
  "11-bill-of-materials-and-system-breakdown": {
    deliverable: "Itemized 75+ component Bill of Materials across all 17 subsystems with OEM part numbers, materials, pressure ratings, and procurement lead times.",
    hardwareFocus: "75-Item Master Component BOM",
    tags: ["Itemized BOM", "OEM Vendors", "Procurement Specs", "17 Subsystems"],
    discipline: "MECHANICAL",
    disciplineColor: "text-amber border-amber/40 bg-amber/15",
  },
  "12-refrigeration-vacuum-and-condenser-systems": {
    deliverable: "Cascade refrigeration skid (-85°C condenser), dry screw backing pump + Roots blower vacuum train, Pirani vs Capacitance manometer ratio, and ISO 13408-3 leak rates.",
    hardwareFocus: "Refrigeration & Vacuum Skids",
    tags: ["Cascade Cooling -85°C", "Dry Screw + Roots", "MKS Baratron", "ISO 13408-3 Leak Rate"],
    simulatorName: "RefrigerationCascadeDiagram",
    discipline: "PROCESS",
    disciplineColor: "text-cyan-400 border-cyan-500/40 bg-cyan-500/15",
  },
  "13-freezing-methods-and-thermal-duty": {
    deliverable: "Direct jacket freezing vs cryogenic liquid nitrogen (LN2) spray direct injection, phase nucleation rates, and peak refrigeration duty calculations.",
    hardwareFocus: "Cryogenic Freezing & Heat Duty",
    tags: ["Cryogenic LN2 Spray", "Jacket TCU Chilling", "Nucleation Kinetics", "Thermal Duty Balance"],
    discipline: "PROCESS",
    disciplineColor: "text-cyan-400 border-cyan-500/40 bg-cyan-500/15",
  },
  "14-cip-sip-sealing-insulation-and-utilities": {
    deliverable: "Riboflavin-validated rotary spray balls, 121°C clean steam-in-place (SIP), pharmaceutical elastomer compatibility (EPDM / Kalrez), and utility consumption tables.",
    hardwareFocus: "Sanitary Cleaning & Aseptic Steam",
    tags: ["Rotary Spray CIP", "121°C SIP Steam", "Kalrez Aseptic Seals", "Utility Consumption"],
    discipline: "PROCESS",
    disciplineColor: "text-cyan-400 border-cyan-500/40 bg-cyan-500/15",
  },
  "15-piping-and-instrumentation-diagram": {
    deliverable: "AutoCAD Plant 3D style piping & instrumentation diagram conforming to ISA-5.1 with tagged control loops, automated sanitary valves, and vacuum isolation.",
    hardwareFocus: "Full ISA-5.1 P&ID Blueprint",
    tags: ["ISA-5.1 Tags", "Control Loops", "Sanitary Diaphragm Valves", "Vacuum Isolation"],
    discipline: "PROCESS",
    disciplineColor: "text-cyan-400 border-cyan-500/40 bg-cyan-500/15",
  },
  "16-instrumentation-and-electrical-hardware": {
    deliverable: "Sensors, transmitters, MKS Baratron capacitance manometers, PT100 RTDs, load cells, motor VFDs, and ATEX Zone 21/22 electrical enclosures.",
    hardwareFocus: "Sensors, VFDs & ATEX Enclosures",
    tags: ["PT100 RTDs", "MKS Baratron", "Load Cells", "ATEX Flameproof Enclosures"],
    discipline: "ELECTRICAL",
    disciplineColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/15",
  },
  "17-control-system-architecture": {
    deliverable: "PLC/SCADA system architecture (Siemens S7-1500 / Beckhoff TwinCAT 3), EtherCAT industrial fieldbus, distributed remote I/O islands, and 21 CFR Part 11 audit trails.",
    hardwareFocus: "PLC, SCADA & Fieldbus Network",
    tags: ["Siemens S7-1500", "EtherCAT Fieldbus", "21 CFR Part 11", "SCADA Architecture"],
    discipline: "ELECTRICAL",
    disciplineColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/15",
  },
  "18-batch-sequence-and-operating-cycle": {
    deliverable: "ISA-88 batch recipe state machine: automated step transitions from inerting, chilling, freezing, primary sublimation, secondary desorption, to powder discharge.",
    hardwareFocus: "Automated ISA-88 State Machine",
    tags: ["ISA-88 State Machine", "Recipe Progression", "PRT/MTM Endpoints", "Automatic Interlocks"],
    discipline: "ELECTRICAL",
    disciplineColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/15",
  },
  "19-interlocks-cause-effect-matrix-and-io-list": {
    deliverable: "SIL-2 Cause & Effect safety matrix, BPCS vs. SIS safety interlocks, ESD emergency shutdown logic, and full discrete/analog I/O allocation schedule.",
    hardwareFocus: "Safety Interlocks & Complete I/O List",
    tags: ["Cause & Effect Matrix", "SIL-2 Safety Loops", "Emergency Shutdown", "Digital & Analog I/O"],
    discipline: "ELECTRICAL",
    disciplineColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/15",
  },
  "20-safety-and-hazard-analysis": {
    deliverable: "Process HAZOP study, solvent vapor flammability envelopes, ATEX dust explosion venting, rupture disc burst pressures, and inert nitrogen overpressure reliefs.",
    hardwareFocus: "HAZOP & ATEX Explosion Safety",
    tags: ["HAZOP Study", "ATEX Explosion Venting", "Rupture Discs", "N2 Inert Blanket"],
    discipline: "ELECTRICAL",
    disciplineColor: "text-amber border-amber/30 bg-amber/10",
  },
  "21-commissioning-and-qualification-test-plan": {
    deliverable: "Site Acceptance Testing (SAT) protocol, hydrostatic pressure test (1.5x design), ISO 13408-3 vacuum leak rate verification (Q_leak ≤ 0.010 mbar·L/s), and thermal mapping.",
    hardwareFocus: "Factory & Site Acceptance (FAT/SAT)",
    tags: ["ISO 13408-3 Leak Rate", "Hydrostatic Test", "Thermal Mapping", "SAT Protocol"],
    discipline: "TESTING",
    disciplineColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  },
  "22-maintenance-and-troubleshooting": {
    deliverable: "Preventative maintenance SOPs, orbital drive lubrication intervals, mechanical seal inspection & cartridge replacement guide, and vacuum failure decision tree.",
    hardwareFocus: "Seal Overhaul & Diagnostic Trees",
    tags: ["Mechanical Seal Overhaul", "Lubrication Schedule", "Vacuum Troubleshooting", "Drive Maintenance"],
    discipline: "TESTING",
    disciplineColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  },
};

interface CategoryDefinition {
  key: CategoryKey;
  title: string;
  shortLabel: string;
  icon: React.ElementType;
  badge: string;
  badgeColor: string;
  description: string;
  slugs: string[];
  isBuildEssential: boolean;
}

const BUILDER_CATEGORIES: CategoryDefinition[] = [
  {
    key: "mechanical",
    title: "Mechanical & Vessel Fabrication",
    shortLabel: "Mechanical Build",
    icon: Wrench,
    badge: "FABRICATION BLUEPRINTS",
    badgeColor: "bg-amber/20 text-amber border-amber/40",
    description:
      "Vessel cone geometry, cantilever screw flighting, zero-bottom-bearing mount, machining tolerances, BOM parts, and SolidWorks CAD nozzle schedule.",
    slugs: [
      "05-vessel-chamber-agitator-and-materials",
      "06-materials-fabrication-tolerances-and-welding",
      "07-design-calculations-and-sizing-methodology",
      "08-vessel-sizing-suite-and-parametric-tool",
      "09-cad-solidworks-assembly-and-nozzle-schedule",
      "10-drawings-and-schematics-to-create",
      "11-bill-of-materials-and-system-breakdown",
    ],
    isBuildEssential: true,
  },
  {
    key: "process",
    title: "Process Skids, Refrigeration & Vacuum P&ID",
    shortLabel: "Process Skids & P&ID",
    icon: Flame,
    badge: "PROCESS HARDWARE",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
    description:
      "Cascade refrigeration skids (-85°C condenser), dry screw + Roots vacuum train, cryogenic LN2 freezing duty, CIP/SIP utilities, and complete ISA-5.1 P&ID.",
    slugs: [
      "12-refrigeration-vacuum-and-condenser-systems",
      "13-freezing-methods-and-thermal-duty",
      "14-cip-sip-sealing-insulation-and-utilities",
      "15-piping-and-instrumentation-diagram",
    ],
    isBuildEssential: true,
  },
  {
    key: "automation",
    title: "Electrical, Instrumentation & PLC Automation",
    shortLabel: "Electrical & Controls",
    icon: Cpu,
    badge: "WIRING & PLC LOGIC",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    description:
      "Sensor selection (MKS Baratron, Pirani, RTD PT100), electrical panel architecture, complete I/O wiring map, and ISA-88 batch state machine logic.",
    slugs: [
      "16-instrumentation-and-electrical-hardware",
      "17-control-system-architecture",
      "18-batch-sequence-and-operating-cycle",
      "19-interlocks-cause-effect-matrix-and-io-list",
    ],
    isBuildEssential: true,
  },
  {
    key: "reference",
    title: "Flowsheets, Sublimation Theory & Field Testing",
    shortLabel: "Flowsheets & Testing",
    icon: BookOpen,
    badge: "THEORY & PROTOCOLS",
    badgeColor: "bg-neutral-500/20 text-neutral-400 border-neutral-500/40",
    description:
      "Sublimation physics, competitive benchmarks vs shelf dryers and Lyo Beads, canonical BFD/PFD flowsheets, HAZOP safety, and SAT testing.",
    slugs: [
      "01-physics-and-thermodynamics",
      "02-hosokawa-afd-vs-generic-lyophilizers",
      "03-process-flowsheets-bfd-and-pfd",
      "04-system-architecture-and-subsystems",
      "20-safety-and-hazard-analysis",
      "21-commissioning-and-qualification-test-plan",
      "22-maintenance-and-troubleshooting",
    ],
    isBuildEssential: false,
  },
];

export function ProjectViewCategorizer({
  projectSlug,
  chapters,
  acts,
}: ProjectViewCategorizerProps) {
  const [viewMode, setViewMode] = useState<"builder" | "acts">("builder");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const chapterMap = useMemo(() => {
    return new Map(chapters.map((c) => [c.slug, c]));
  }, [chapters]);

  // Total build-essential chapters count
  const buildEssentialSlugs = useMemo(() => {
    const slugs = new Set<string>();
    BUILDER_CATEGORIES.filter((c) => c.isBuildEssential).forEach((cat) => {
      cat.slugs.forEach((s) => slugs.add(s));
    });
    return slugs;
  }, []);

  // Filter categories based on category tab & search query
  const filteredCategories = useMemo(() => {
    return BUILDER_CATEGORIES.filter((cat) => {
      if (selectedCategory === "all") return true;
      return cat.key === selectedCategory;
    })
      .map((cat) => {
        const catChapters = cat.slugs
          .map((slug) => chapterMap.get(slug))
          .filter((ch): ch is ChapterMeta => Boolean(ch))
          .filter((ch) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            const detail = CHAPTER_DETAILS[ch.slug];
            return (
              ch.title.toLowerCase().includes(q) ||
              ch.chapterNumber.includes(q) ||
              ch.slug.toLowerCase().includes(q) ||
              (detail && (
                detail.deliverable.toLowerCase().includes(q) ||
                detail.hardwareFocus.toLowerCase().includes(q) ||
                detail.tags.some((t) => t.toLowerCase().includes(q))
              ))
            );
          });

        return {
          ...cat,
          chapters: catChapters,
        };
      })
      .filter((cat) => cat.chapters.length > 0);
  }, [selectedCategory, searchQuery, chapterMap]);

  return (
    <div className="space-y-6">
      {/* View Switcher & Filter Toolbar */}
      <div className="rounded-2xl bg-bg-panel border border-hairline p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber" />
            <span className="text-xs font-mono uppercase tracking-widest text-ink-primary font-bold">
              Engineering Navigation Mode
            </span>
          </div>

          {/* View Mode Toggle Pill */}
          <div className="flex items-center bg-bg-surface p-1 rounded-xl border border-hairline text-xs font-mono">
            <button
              onClick={() => setViewMode("builder")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition ${
                viewMode === "builder"
                  ? "bg-amber text-[#0e0a02] font-black shadow-md shadow-amber/20"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>Machine Builder View</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-bold">
                15 Blueprints
              </span>
            </button>

            <button
              onClick={() => setViewMode("acts")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition ${
                viewMode === "acts"
                  ? "bg-amber text-[#0e0a02] font-black shadow-md shadow-amber/20"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Act Stations (I–V)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-bold">
                22 Chapters
              </span>
            </button>
          </div>
        </div>

        {/* Builder View Sub-Filters & Quick Search */}
        {viewMode === "builder" && (
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                  selectedCategory === "all"
                    ? "bg-amber/15 border-amber text-amber font-bold"
                    : "bg-bg-surface border-hairline text-ink-secondary hover:border-hairline-strong"
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>All Disciplines</span>
                <span className="text-[10px] text-ink-dim">(22)</span>
              </button>

              {BUILDER_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                    selectedCategory === cat.key
                      ? "bg-amber/15 border-amber text-amber font-bold"
                      : "bg-bg-surface border-hairline text-ink-secondary hover:border-hairline-strong"
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  <span>{cat.shortLabel}</span>
                  <span className="text-[10px] text-ink-dim">({cat.slugs.length})</span>
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-dim" />
              <input
                type="text"
                placeholder="Search drawings, nozzles, P&ID, BOM, torque, vacuum..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-bg-surface border border-hairline text-xs text-ink-primary placeholder:text-ink-dim focus:outline-none focus:border-amber transition font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* RENDER MODE A: MACHINE BUILDER VIEW */}
      {viewMode === "builder" && (
        <div className="space-y-8">
          {/* Machine Builder Executive Notice */}
          <div className="rounded-2xl bg-amber/5 border border-amber/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber">
                <CheckCircle2 className="w-4 h-4 text-amber" />
                <span>HARDWARE EXECUTION ARCHITECTURE</span>
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed">
                The 22 chapters are structured into 4 disciplined engineering tracks.{" "}
                <strong className="text-ink-primary font-bold">15 core hardware blueprints</strong>{" "}
                govern physical fabrication, vacuum skids, and PLC automation. 7 foundational chapters provide mass balances, thermodynamic physics, and validation testing.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded-md bg-amber/20 border border-amber/40 text-amber font-bold">
                15 Build Blueprints
              </span>
              <span className="px-2.5 py-1 rounded-md bg-bg-inset border border-hairline text-ink-dim">
                7 Flowsheets &amp; Testing
              </span>
            </div>
          </div>

          {/* Grouped Category Sections */}
          <div className="space-y-8">
            {filteredCategories.map((cat) => (
              <div
                key={cat.key}
                className="rounded-2xl bg-bg-panel border border-hairline p-6 shadow-lg space-y-4 hover:border-hairline-strong transition"
              >
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-hairline pb-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <cat.icon className="w-4 h-4 text-amber" />
                      <span
                        className={`text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${cat.badgeColor}`}
                      >
                        {cat.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-ink-primary flex items-center gap-2 pt-1">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-ink-secondary">{cat.description}</p>
                  </div>
                  <div className="self-start px-2.5 py-1 rounded-full bg-bg-inset border border-hairline text-[10px] font-mono text-ink-dim">
                    {cat.chapters.length} Chapters
                  </div>
                </div>

                {/* Chapter Cards Grid with Full Detail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {cat.chapters.map((chapter) => {
                    const isEssential = buildEssentialSlugs.has(chapter.slug);
                    const detail = CHAPTER_DETAILS[chapter.slug];
                    return (
                      <Link
                        key={chapter.slug}
                        href={`/${projectSlug}/${chapter.slug}`}
                        className="group p-4 rounded-xl bg-bg-surface hover:bg-bg-hover border border-hairline hover:border-amber/40 transition flex flex-col justify-between space-y-3.5 shadow-sm"
                      >
                        <div className="space-y-2">
                          {/* Top Row: Chapter Number + Badges + Read Time */}
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-amber/20 text-amber font-bold font-mono text-[11px] border border-amber/30">
                                CH {chapter.chapterNumber}
                              </span>
                              {detail && (
                                <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${detail.disciplineColor}`}>
                                  {detail.discipline}
                                </span>
                              )}
                            </div>
                            <span className="text-ink-dim">{chapter.readTime}</span>
                          </div>

                          {/* Title */}
                          <h4 className="text-sm font-bold text-ink-primary group-hover:text-amber-bright transition leading-snug">
                            {chapter.title}
                          </h4>

                          {/* Key Deliverable Statement */}
                          {detail && (
                            <p className="text-[11px] text-ink-secondary leading-relaxed line-clamp-2">
                              {detail.deliverable}
                            </p>
                          )}

                          {/* Interactive Simulator Badge if exists */}
                          {detail?.simulatorName && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono">
                              <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                              <span>Simulator: {detail.simulatorName}</span>
                            </div>
                          )}

                          {/* Technical Tags Chips */}
                          {detail?.tags && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {detail.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-1.5 py-0.5 rounded bg-bg-inset border border-hairline text-[9px] font-mono text-ink-muted"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer Action */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-hairline/60 text-[10px] text-ink-dim font-mono">
                          <span className="group-hover:text-amber transition flex items-center gap-1 font-semibold">
                            Open Blueprint Specs
                          </span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition text-amber" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER MODE B: CHRONOLOGICAL ACT STATIONS (ORIGINAL VIEW) */}
      {viewMode === "acts" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-ink-primary font-bold flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber" />
              <span>The {acts.length} Act Stations (Sequential 01–22)</span>
            </h2>
            <span className="text-xs font-mono text-ink-dim">
              {chapters.length} Chapters Grouped by Project Phase
            </span>
          </div>

          <div className="space-y-6">
            {acts.map((act) => (
              <div
                key={act.id}
                className="rounded-2xl bg-bg-panel border border-hairline p-6 shadow-lg hover:border-hairline-strong transition space-y-4"
              >
                {/* Act Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-amber font-bold mb-1">
                      Act Station
                    </div>
                    <h3 className="text-lg font-bold text-ink-primary flex items-center gap-2">
                      <span className="font-mono text-amber">{act.roman}</span>
                      <span>{act.name}</span>
                    </h3>
                    <p className="text-xs text-ink-secondary mt-1 max-w-xl">
                      {act.description}
                    </p>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-bg-inset border border-hairline text-[10px] font-mono text-ink-dim">
                    {act.chapters.length} Chapters
                  </div>
                </div>

                {/* Chapters List with Rich Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {act.chapters.map((chSlug) => {
                    const chapter = chapterMap.get(chSlug);
                    if (!chapter) return null;
                    const detail = CHAPTER_DETAILS[chapter.slug];
                    return (
                      <Link
                        key={chapter.slug}
                        href={`/${projectSlug}/${chapter.slug}`}
                        className="group p-4 rounded-xl bg-bg-surface hover:bg-bg-hover border border-hairline hover:border-amber/40 transition flex flex-col justify-between space-y-3.5"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono text-ink-dim">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-amber/20 text-amber font-bold font-mono text-[11px] border border-amber/30">
                                CH {chapter.chapterNumber}
                              </span>
                              {detail && (
                                <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${detail.disciplineColor}`}>
                                  {detail.discipline}
                                </span>
                              )}
                            </div>
                            <span>{chapter.readTime}</span>
                          </div>

                          <h4 className="text-xs font-bold text-ink-primary group-hover:text-amber-bright transition leading-snug">
                            {chapter.title}
                          </h4>

                          {detail && (
                            <p className="text-[11px] text-ink-secondary leading-relaxed line-clamp-2">
                              {detail.deliverable}
                            </p>
                          )}

                          {detail?.simulatorName && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono">
                              <Activity className="w-3 h-3 text-cyan-400" />
                              <span>{detail.simulatorName}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-hairline/50 text-[10px] text-ink-dim font-mono">
                          <span className="group-hover:text-amber transition flex items-center gap-1 font-semibold">
                            Read specification
                          </span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition text-amber" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
