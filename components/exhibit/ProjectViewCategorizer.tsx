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
} from "lucide-react";
import type { ChapterMeta, ActConfig } from "@/lib/types";

interface ProjectViewCategorizerProps {
  projectSlug: string;
  chapters: ChapterMeta[];
  acts: ActConfig[];
}

export type CategoryKey = "all" | "mechanical" | "process" | "automation" | "reference";

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
    badge: "FABRICATION ESSENTIAL",
    badgeColor: "bg-amber/20 text-amber border-amber/40",
    description:
      "Vessel cone geometry, cantilever screw flighting, zero-bottom-bearing mount, machining tolerances, BOM parts, and SolidWorks CAD nozzle schedule.",
    slugs: [
      "05-vessel-chamber-agitator-and-materials",
      "10-materials-fabrication-tolerances-workshop-vs-purchased",
      "11-design-calculations-and-sizing-methodology",
      "12-bill-of-materials-and-system-breakdown",
      "13-drawings-and-schematics-to-create",
      "24-cad-solidworks-equipment-nozzle-schedule",
      "25-vessel-sizing-suite-tool-spec-and-prompt",
    ],
    isBuildEssential: true,
  },
  {
    key: "process",
    title: "Piping, Vacuum, Refrigeration & Skids",
    shortLabel: "Process Skids & P&ID",
    icon: Flame,
    badge: "PROCESS HARDWARE",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
    description:
      "Complete ISA-5.1 P&ID, cryogenic cold-trap condenser sizing, dry screw + Roots vacuum train, TCU jacket loop, and thermal cooling duties.",
    slugs: [
      "06-refrigeration-vacuum-and-condenser-systems",
      "07-cip-sip-sealing-insulation-utilities",
      "19-piping-and-instrumentation-diagram",
      "23-engineering-resolution-freezing-methods-and-thermal-duty",
      "27-canonical-bfd-and-unbundled-pfd-process-flowsheets",
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
      "08-instrumentation-controls-electrical-structural",
      "20-control-system-architecture",
      "21-batch-sequence-and-operating-cycle",
      "22-interlocks-cause-effect-matrix-and-io-list",
    ],
    isBuildEssential: true,
  },
  {
    key: "reference",
    title: "Process Theory, Validation & Regulatory Documentation",
    shortLabel: "Theory & Documentation",
    icon: BookOpen,
    badge: "REFERENCE & GOVERNANCE",
    badgeColor: "bg-neutral-500/20 text-neutral-400 border-neutral-500/40",
    description:
      "Sublimation physics, formulation science, competitive benchmarks vs shelf dryers and Lyo Beads, FDA cGMP validation (IQ/OQ/PQ), and literature citations.",
    slugs: [
      "01-beginner-foundations-and-glossary",
      "02-physics-and-thermodynamics",
      "03-hosokawa-afd-vs-generic-lyophilizers",
      "04-system-architecture-and-subsystems",
      "09-safety-and-hazard-analysis",
      "14-validation-qualification-and-gmp-compliance",
      "15-commissioning-test-plan",
      "16-build-roadmap-prototype-to-pharma-capable",
      "17-maintenance-and-troubleshooting",
      "18-references-and-source-list",
      "26-hosokawa-afd-patent-nl2026893b1-translation-and-engineering-analysis",
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

  // Filtered chapters for search or category
  const filteredCategories = useMemo(() => {
    return BUILDER_CATEGORIES.map((cat) => {
      let catChapters = cat.slugs
        .map((slug) => chapterMap.get(slug))
        .filter((c): c is ChapterMeta => Boolean(c));

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        catChapters = catChapters.filter(
          (c) =>
            c.title.toLowerCase().includes(query) ||
            c.chapterNumber.includes(query) ||
            c.slug.toLowerCase().includes(query)
        );
      }

      return {
        ...cat,
        chapters: catChapters,
      };
    }).filter((cat) => {
      if (selectedCategory !== "all" && cat.key !== selectedCategory) {
        return false;
      }
      return cat.chapters.length > 0;
    });
  }, [chapterMap, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* View Mode & Filter Switcher Bar */}
      <div className="rounded-2xl bg-bg-panel border border-hairline p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-widest text-amber font-bold flex items-center gap-2">
              <HardHat className="w-3.5 h-3.5 text-amber" />
              <span>Project Navigation Architecture</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-ink-primary">
              Choose Your Engineering Workflow
            </h2>
          </div>

          {/* View Mode Toggle Button Group */}
          <div className="inline-flex rounded-xl bg-bg-inset p-1 border border-hairline">
            <button
              onClick={() => setViewMode("builder")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition ${
                viewMode === "builder"
                  ? "bg-amber text-[#0e0a02] font-black shadow-sm"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Machine Builder View</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded text-[10px] ${
                  viewMode === "builder"
                    ? "bg-[#0e0a02]/20 text-[#0e0a02]"
                    : "bg-bg-panel text-amber"
                }`}
              >
                16 Core
              </span>
            </button>

            <button
              onClick={() => setViewMode("acts")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition ${
                viewMode === "acts"
                  ? "bg-amber text-[#0e0a02] font-black shadow-sm"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Act Stations (I – V)</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded text-[10px] ${
                  viewMode === "acts"
                    ? "bg-[#0e0a02]/20 text-[#0e0a02]"
                    : "bg-bg-panel text-ink-dim"
                }`}
              >
                All 28
              </span>
            </button>
          </div>
        </div>

        {/* Builder View Sub-Filter Controls */}
        {viewMode === "builder" && (
          <div className="space-y-3 pt-1">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                  selectedCategory === "all"
                    ? "bg-amber/15 border-amber text-amber font-bold"
                    : "bg-bg-surface border-hairline text-ink-secondary hover:border-hairline-strong"
                }`}
              >
                All Chapters ({chapters.length})
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
                placeholder="Search drawings, nozzles, P&ID, BOM, torque..."
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
                <span>BUILDER PRIORITY FILTER ACTIVE</span>
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Fabricating the physical AFD machine requires{" "}
                <strong className="text-ink-primary font-bold">16 core engineering blueprints</strong>{" "}
                (Mechanical, Skids, P&amp;ID, and PLC Controls). Pure regulatory paperwork,
                glossaries, and theoretical essays are segregated into the Reference section below.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded-md bg-amber/20 border border-amber/40 text-amber font-bold">
                16 Build Blueprints
              </span>
              <span className="px-2.5 py-1 rounded-md bg-bg-inset border border-hairline text-ink-dim">
                12 Reference
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

                {/* Chapter Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {cat.chapters.map((chapter) => {
                    const isEssential = buildEssentialSlugs.has(chapter.slug);
                    return (
                      <Link
                        key={chapter.slug}
                        href={`/${projectSlug}/${chapter.slug}`}
                        className="group p-4 rounded-xl bg-bg-surface hover:bg-bg-hover border border-hairline hover:border-amber/40 transition flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-mono text-ink-dim">
                            <span className="text-amber font-semibold">
                              CH {chapter.chapterNumber}
                            </span>
                            <div className="flex items-center gap-2">
                              {isEssential ? (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[9px]">
                                  BUILD BLUEPRINT
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded bg-bg-inset border border-hairline text-ink-dim text-[9px]">
                                  REFERENCE
                                </span>
                              )}
                              <span>{chapter.readTime}</span>
                            </div>
                          </div>
                          <h4 className="text-xs font-bold text-ink-primary group-hover:text-amber-bright transition leading-snug">
                            {chapter.title}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-hairline/50 text-[10px] text-ink-dim font-mono">
                          <span className="group-hover:text-ink-secondary transition flex items-center gap-1">
                            Open specifications
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
              <span>The {acts.length} Act Stations (Chronological)</span>
            </h2>
            <span className="text-xs font-mono text-ink-dim">
              {chapters.length} Chapters Grouped by Narrative Role
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

                {/* Chapters List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {act.chapters.map((chSlug) => {
                    const chapter = chapterMap.get(chSlug);
                    if (!chapter) return null;
                    return (
                      <Link
                        key={chapter.slug}
                        href={`/${projectSlug}/${chapter.slug}`}
                        className="group p-4 rounded-xl bg-bg-surface hover:bg-bg-hover border border-hairline hover:border-amber/40 transition flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-ink-dim">
                            <span className="text-amber font-semibold">
                              CH {chapter.chapterNumber}
                            </span>
                            <span>{chapter.readTime}</span>
                          </div>
                          <h4 className="text-xs font-bold text-ink-primary group-hover:text-amber-bright transition leading-snug">
                            {chapter.title}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-hairline/50 text-[10px] text-ink-dim font-mono">
                          <span className="group-hover:text-ink-secondary transition flex items-center gap-1">
                            Read chapter
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
