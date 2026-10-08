import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjectChapters } from "@/lib/content";
import { MonographExportButton } from "@/components/exhibit/MonographExportButton";
import {
  Compass,
  ArrowRight,
  BookOpen,
  Cpu,
  Table,
  Library,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Layers,
  CheckCircle2,
  Download,
  Presentation,
} from "lucide-react";

import { ProjectViewCategorizer } from "@/components/exhibit/ProjectViewCategorizer";

export const dynamic = 'force-dynamic';

export default async function LabPage({ params }: { params: Promise<{ project: string }> }) {
  const resolvedParams = await params;
  const project = getProjectBySlug(resolvedParams.project);

  if (!project) {
    notFound();
  }

  const chapters = getProjectChapters(project.slug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb & Project Header */}
      <div className="flex items-center gap-2 text-xs font-mono text-ink-dim mb-4">
        <Link href="/" className="hover:text-ink-primary transition">
          THE ARCHIVE
        </Link>
        <span>/</span>
        <span className="text-amber uppercase">{project.slug}</span>
      </div>

      {/* Hero Finding Console Banner */}
      <div className="relative rounded-3xl bg-bg-panel border border-hairline p-6 sm:p-10 mb-12 shadow-2xl overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-subtle rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-hover border border-hairline text-xs font-mono text-ink-secondary">
            <Sparkles className="w-3.5 h-3.5 text-amber" />
            <span>Load-Bearing Engineering Thesis</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-ink-primary tracking-tight leading-snug">
            The AFD is not a conventional shelf/tray freeze dryer.{" "}
            <span className="text-amber-bright underline decoration-amber/40 underline-offset-8">
              It is an agitated, jacketed, downward-conical vessel
            </span>{" "}
            where product is frozen and dried while being continuously stirred, discharging as loose powder instead of vial cakes.
          </h1>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href={`/${project.slug}/02-hosokawa-afd-vs-generic-lyophilizers`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber hover:bg-amber-bright text-[#0e0a02] font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber/30 hover:scale-105 active:scale-95 border border-amber/40"
            >
              <span>Explore Chapter 02 (Hero Finding)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <MonographExportButton
              chapters={chapters}
              projectSlug={project.slug}
              variant="hero"
            />

            <Link
              href={`/${project.slug}/03-process-flowsheets-bfd-and-pfd`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber/15 border border-amber/40 text-amber hover:bg-amber/25 font-mono text-xs transition shadow-sm"
            >
              <Cpu className="w-3.5 h-3.5 text-amber" />
              <span>Ch. 03: CAD Flowsheets (DWG/BFD/PFD)</span>
            </Link>

            <Link
              href={`/${project.slug}/bom`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-hover border border-hairline text-ink-primary font-mono text-xs hover:bg-bg-hover transition"
            >
              <Table className="w-3.5 h-3.5 text-cryo" />
              <span>{project.stats.bomItemsCount}-Part BOM</span>
            </Link>

            <Link
              href={`/${project.slug}/references`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-hover border border-hairline text-ink-primary font-mono text-xs hover:bg-bg-hover transition"
            >
              <Library className="w-3.5 h-3.5 text-amber" />
              <span>{project.stats.referencesCount} Primary Sources</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Machine Builder Console (Left 8 cols) + Progress Rail (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Categorizer View (8 cols) */}
        <div className="lg:col-span-8">
          <ProjectViewCategorizer
            projectSlug={project.slug}
            chapters={chapters}
            acts={project.acts}
          />
        </div>

        {/* Lab Intelligence Progress Rail (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-bg-panel border border-hairline p-6 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-ink-primary font-bold">
                Project Dashboard
              </h3>
              <div className="w-2 h-2 rounded-full bg-cryo animate-ping" />
            </div>

            {/* Quick Monograph Download / Print Widget */}
            <MonographExportButton
              chapters={chapters}
              projectSlug={project.slug}
              variant="sidebar"
            />

            {/* Coverage Meter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-ink-dim">Research Coverage</span>
                <span className="text-amber font-bold">{chapters.length} / {chapters.length} Chapters (100%)</span>
              </div>
              <div className="h-2 w-full bg-bg-inset rounded-full overflow-hidden border border-hairline">
                <div className="h-full bg-gradient-to-r from-amber to-amber-bright w-full" />
              </div>
            </div>

            {/* Simulators Active */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-ink-dim">Physics Simulators</span>
                <span className="text-cryo font-bold">8 Operational</span>
              </div>
              <div className="h-2 w-full bg-bg-inset rounded-full overflow-hidden border border-hairline">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-cryo w-full" />
              </div>
            </div>

            {/* Quick Feature Jump Boxes */}
            <div className="space-y-2.5 pt-2 border-t border-hairline">
              <Link
                href={`/${project.slug}/02-hosokawa-afd-vs-generic-lyophilizers`}
                className="p-3 rounded-xl bg-bg-inset border border-hairline hover:border-amber/30 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-ink-primary group-hover:text-amber-bright transition">
                    Listen to Lab Assistant
                  </div>
                  <div className="text-[10px] text-ink-dim font-mono">Ch. 02 Pre-generated Narration</div>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-dim group-hover:text-amber transition" />
              </Link>

              <Link
                href={`/${project.slug}/01-physics-and-thermodynamics`}
                className="p-3 rounded-xl bg-bg-inset border border-hairline hover:border-cryo/30 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-ink-primary group-hover:text-cryo transition">
                    Phase Diagram &amp; Thermodynamics Lab
                  </div>
                  <div className="text-[10px] text-ink-dim font-mono">Interactive Clausius–Clapeyron curves</div>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-dim group-hover:text-cryo transition" />
              </Link>

              <Link
                href={`/${project.slug}/webinar`}
                className="p-3 rounded-xl bg-bg-inset border border-hairline hover:border-amber/30 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-ink-primary group-hover:text-amber transition">
                    Hosokawa Webinars &amp; PPT Portal
                  </div>
                  <div className="text-[10px] text-ink-dim font-mono">78 Canonical Slides • 0 Duplicates</div>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-dim group-hover:text-amber transition" />
              </Link>

              <Link
                href={`/${project.slug}/bom`}
                className="p-3 rounded-xl bg-bg-inset border border-hairline hover:border-hairline-strong transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-ink-primary">The Bench (BOM)</div>
                  <div className="text-[10px] text-ink-dim font-mono">{project.stats.bomItemsCount} Parts Across {project.stats.subsystemsCount} Subsystems</div>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-dim transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
