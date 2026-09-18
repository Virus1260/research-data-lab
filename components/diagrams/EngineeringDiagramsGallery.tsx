"use client";

import React, { useState } from "react";
import { ExternalLink, Layers, Eye, CheckCircle2 } from "lucide-react";

interface DiagramCard {
  id: string;
  title: string;
  category: string;
  src: string;
  description: string;
  tags: string[];
}

const DIAGRAMS: DiagramCard[] = [
  {
    id: "system-block",
    title: "System Architecture & Subsystem Bus",
    category: "Architecture",
    src: "/diagrams/system_block_diagram.png",
    description:
      "High-level block diagram detailing I/O signal flow between BPCS, TCU, Conical Chamber, Vacuum Skid, and Bottom Valve.",
    tags: ["ISA Architecture", "Subsystems", "I/O Bus"],
  },
  {
    id: "pid-drawing",
    title: "Complete Process & Instrumentation Diagram",
    category: "P&ID / Controls",
    src: "/diagrams/pid_afd_freeze_dryer.png",
    description:
      "ANSI/ISA-5.1 compliant instrumentation drawing with tag loops, control valves, safety relief valves, and vacuum manifold.",
    tags: ["ANSI/ISA-5.1", "P&ID", "Loop Tags"],
  },
  {
    id: "water-phase",
    title: "Water Phase Diagram & Sublimation Path",
    category: "Thermodynamics",
    src: "/diagrams/water_phase_diagram.png",
    description:
      "Triple point (0.01 °C, 6.11 mbar) reference showing vacuum-induced freezing, sublimation window, and desorption vectors.",
    tags: ["Phase Diagram", "Sublimation", "Triple Point"],
  },
  {
    id: "conical-schematic",
    title: "Stirred Conical Freeze Dryer Geometry",
    category: "Mechanical CAD",
    src: "/diagrams/stirred_conical_freeze_dryer_schematic.png",
    description:
      "Conical vessel section with double-jacket fluid paths, orbiting wall-scraping agitator clearance, and sanitary lid nozzles.",
    tags: ["ASME VIII", "Double Jacket", "Agitator"],
  },
  {
    id: "cascade-refrigeration",
    title: "Cascade Refrigeration & TCU Circulation",
    category: "Thermal / Fluid",
    src: "/diagrams/refrigeration_cascade_diagram.png",
    description:
      "Two-stage refrigeration circuit cooling single silicone thermal fluid (Syltherm XLT) from −55 °C to +50 °C with brazed PHE.",
    tags: ["Cascade", "TCU", "-55°C", "Syltherm"],
  },
  {
    id: "cycle-profile",
    title: "Process Cycle Time, Temperature & Vacuum Profile",
    category: "Process Data",
    src: "/diagrams/freeze_drying_cycle_profile.png",
    description:
      "Synchronous batch trajectory logging jacket temperature, product core temp, and Pirani/capacitance manometer pressure.",
    tags: ["Batch Trajectory", "Pirani", "Desorption"],
  },
  {
    id: "control-architecture",
    title: "Control System Architecture (BPCS vs SIS)",
    category: "Safety & Automation",
    src: "/diagrams/control_system_architecture.png",
    description:
      "IEC 61511 architectural boundary separating recipe BPCS PLC from independent hardwired Safety Instrumented System.",
    tags: ["IEC 61511", "BPCS", "SIS SIL-2"],
  },
  {
    id: "isa88-batch",
    title: "ISA-88 Batch Procedure State Machine",
    category: "ISA-88 Batch",
    src: "/diagrams/isa88_batch_structure.png",
    description:
      "Procedure, unit procedure, operation, and phase lifecycle state machine with automated Primary-to-Secondary drying transitions.",
    tags: ["ISA-88", "S88", "Batch States"],
  },
];

export function EngineeringDiagramsGallery() {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  const categories = ["All", "Architecture", "P&ID / Controls", "Mechanical CAD", "Thermal / Fluid", "Process Data"];

  const filteredDiagrams =
    selectedFilter === "All"
      ? DIAGRAMS
      : DIAGRAMS.filter((d) => d.category === selectedFilter);

  return (
    <div className="my-8 rounded-3xl border border-hairline bg-bg-panel p-5 sm:p-7 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-hairline">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-amber/10 border border-amber/30 flex items-center justify-center text-amber shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink-primary font-serif tracking-tight">
              Engineering Drawing & Schematic Package
            </h3>
            <p className="text-xs text-ink-secondary font-mono">
              High-resolution vector & schematic drawings created for the AFD Lyophilizer
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-mono transition shadow-sm ${
                selectedFilter === cat
                  ? "bg-amber text-on-amber font-bold border border-amber"
                  : "bg-bg-surface hover:bg-bg-hover text-ink-secondary hover:text-ink-primary border border-hairline"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Interactive Diagram Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredDiagrams.map((d) => (
          <div
            key={d.id}
            onClick={() => {
              if (typeof window !== "undefined") {
                window.open(d.src, "_blank");
              }
            }}
            className="group cursor-pointer rounded-2xl border border-hairline bg-bg-surface hover:border-amber/50 hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between"
            title="Click to view full-resolution drawing in new tab"
          >
            {/* Image Preview Container */}
            <div className="relative bg-bg-inset/40 p-4 h-48 sm:h-52 flex items-center justify-center overflow-hidden">
              <img
                src={d.src}
                alt={d.title}
                loading="lazy"
                className="max-h-full max-w-full object-contain rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-ink-primary/0 group-hover:bg-ink-primary/5 transition-colors duration-200" />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-bg-panel/95 backdrop-blur-md border border-hairline text-[11px] font-mono text-ink-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 shadow-md">
                <Eye className="w-3.5 h-3.5 text-amber" />
                <span>Full Drawing</span>
                <ExternalLink className="w-3 h-3 text-ink-dim" />
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-amber tracking-wider">
                    {d.category}
                  </span>
                  <span className="text-[10px] font-mono text-ink-dim flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-cryo" />
                    Verified Original
                  </span>
                </div>
                <h4 className="text-sm font-bold text-ink-primary group-hover:text-amber transition-colors">
                  {d.title}
                </h4>
                <p className="mt-1 text-xs text-ink-secondary leading-relaxed font-sans line-clamp-2">
                  {d.description}
                </p>
              </div>

              {/* Tags & Action */}
              <div className="pt-2 border-t border-hairline/60 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {d.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-bg-inset border border-hairline/60 text-[10px] font-mono text-ink-dim"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-mono text-amber font-semibold flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <span>Inspect</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
