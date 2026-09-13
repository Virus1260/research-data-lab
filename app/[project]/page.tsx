import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjectChapters } from "@/lib/content";
import { LawEquationsPlayground } from "@/components/exhibit/LawEquationsPlayground";
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
  Activity,
  CheckCircle2,
} from "lucide-react";

export default async function LabPage({ params }: { params: Promise<{ project: string }> }) {
  const resolvedParams = await params;
  const project = getProjectBySlug(resolvedParams.project);

  if (!project) {
    notFound();
  }

  const chapters = getProjectChapters(project.slug);
  const chapterMap = new Map(chapters.map((c) => [c.slug, c]));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb & Project Header */}
      <div className="flex items-center gap-2 text-xs font-mono text-ink-dim mb-4">
        <Link href="/" className="hover:text-ink-primary transition">
          THE ARCHIVE
        </Link>
        <span>/</span>
        <span className="text-amber-signal uppercase">{project.slug}</span>
      </div>

      {/* Hero Finding Console Banner */}
      <div className="relative rounded-3xl bg-bg-panel border border-hairline p-6 sm:p-10 mb-12 shadow-2xl overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-signal/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-hover border border-hairline text-xs font-mono text-ink-secondary">
            <Sparkles className="w-3.5 h-3.5 text-amber-signal" />
            <span>Load-Bearing Engineering Thesis</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-ink-primary tracking-tight leading-snug">
            The AFD is not a conventional shelf/tray freeze dryer.{" "}
            <span className="text-amber-bright underline decoration-amber-signal/40 underline-offset-8">
              It is an agitated, jacketed, downward-conical vessel
            </span>{" "}
            where product is frozen and dried while being continuously stirred, discharging as loose powder instead of vial cakes.
          </h1>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={`/${project.slug}/03-hosokawa-afd-vs-generic-lyophilizers`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-signal text-on-amber font-semibold text-xs uppercase tracking-wider hover:bg-amber-bright transition shadow-lg shadow-amber-signal/20 hover:scale-105 active:scale-95"
            >
              <span>Explore Chapter 03 (Hero Finding)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={`/${project.slug}/bom`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-hover border border-hairline text-ink-primary font-mono text-xs hover:bg-bg-hover transition"
            >
              <Table className="w-3.5 h-3.5 text-cryo" />
              <span>Explore 74-Part BOM</span>
            </Link>

            <Link
              href={`/${project.slug}/references`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-hover border border-hairline text-ink-primary font-mono text-xs hover:bg-bg-hover transition"
            >
              <Library className="w-3.5 h-3.5 text-amber-signal" />
              <span>34 Primary Sources</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Act Stations Console (Left 8 cols) + Progress Rail (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Act Stations Console (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-ink-primary font-bold flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-signal" />
              <span>The Four Act Stations</span>
            </h2>
            <span className="text-xs font-mono text-ink-dim">19 Chapters Grouped by Role</span>
          </div>

          <div className="space-y-6">
            {project.acts.map((act) => (
              <div
                key={act.id}
                className="rounded-2xl bg-bg-panel border border-hairline p-6 shadow-lg hover:border-hairline-strong transition space-y-4"
              >
                {/* Act Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-amber-signal/20 text-amber-signal text-xs font-mono font-bold flex items-center justify-center">
                        {act.roman}
                      </span>
                      <h3 className="text-lg font-bold text-ink-primary">
                        Act {act.roman}. {act.name}
                      </h3>
                    </div>
                    <p className="text-xs text-ink-muted">{act.description}</p>
                  </div>
                  <span className="text-[11px] font-mono text-ink-dim bg-bg-hover px-2.5 py-1 rounded-md">
                    {act.chapters.length} Chapters
                  </span>
                </div>

                {/* Chapters in this Act */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {act.chapters.map((chSlug) => {
                    const ch = chapterMap.get(chSlug);
                    if (!ch) return null;
                    const hasSims = ch.simulators && ch.simulators.length > 0;

                    return (
                      <Link
                        key={ch.slug}
                        href={`/${project.slug}/${ch.slug}`}
                        className="group/item p-3 rounded-xl bg-bg-inset border border-hairline hover:border-amber-signal/40 transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-mono text-ink-dim mb-1">
                            <span className="text-amber-signal font-bold">CH {ch.chapterNumber}</span>
                            <span>{ch.readTime}</span>
                          </div>
                          <h4 className="text-xs font-semibold text-ink-secondary group-hover/item:text-ink-primary transition line-clamp-2">
                            {ch.title}
                          </h4>
                        </div>

                        {/* Simulator indicator badge */}
                        {hasSims && (
                          <div className="mt-3 pt-2 border-t border-hairline flex items-center gap-1.5 text-[10px] font-mono text-cryo">
                            <Cpu className="w-3 h-3" />
                            <span>{ch.simulators.length} Interactive Simulator{ch.simulators.length > 1 ? "s" : ""}</span>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Persistent Right-Edge Instrument Rail (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-20 rounded-2xl bg-bg-panel border border-hairline p-5 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cryo animate-pulse" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-ink-primary font-bold">
                  Instrument Rail
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                SYSTEM ONLINE
              </span>
            </div>

            {/* Progress Status Gauges */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-ink-secondary">Research Coverage</span>
                  <span className="text-amber-bright font-bold">19 / 19 Chapters (100%)</span>
                </div>
                <div className="h-1.5 w-full bg-bg-hover rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-signal to-amber-bright w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-ink-secondary">Physics Simulators</span>
                  <span className="text-cryo font-bold">8 Operational</span>
                </div>
                <div className="h-1.5 w-full bg-bg-hover rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-cryo w-full" />
                </div>
              </div>
            </div>

            {/* Quick Feature Jump Boxes */}
            <div className="space-y-2.5 pt-2 border-t border-hairline">
              <Link
                href={`/${project.slug}/03-hosokawa-afd-vs-generic-lyophilizers`}
                className="p-3 rounded-xl bg-bg-inset border border-hairline hover:border-amber-signal/30 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-ink-primary group-hover:text-amber-bright transition">
                    Listen to Lab Assistant
                  </div>
                  <div className="text-[10px] text-ink-dim font-mono">Ch. 03 Pre-generated Narration</div>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-dim group-hover:text-amber-signal transition" />
              </Link>

              <Link
                href={`/${project.slug}/02-physics-and-thermodynamics`}
                className="p-3 rounded-xl bg-bg-inset border border-hairline hover:border-cryo/30 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-ink-primary group-hover:text-cryo transition">
                    Phase Diagram Plotter
                  </div>
                  <div className="text-[10px] text-ink-dim font-mono">Clausius–Clapeyron curves</div>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-dim group-hover:text-cryo transition" />
              </Link>

              <Link
                href={`/${project.slug}/bom`}
                className="p-3 rounded-xl bg-bg-inset border border-hairline hover:border-hairline-strong transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-ink-primary">The Bench (BOM)</div>
                  <div className="text-[10px] text-ink-dim font-mono">74 Parts Across 17 Subsystems</div>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-dim transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Live Law Equations Playground */}
      <div className="mt-16 mb-8">
        <div className="flex items-center justify-between mb-6" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          <h2 className="text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-2" style={{ color: 'var(--ink-primary)' }}>
            <Activity className="w-4 h-4" style={{ color: 'var(--cryo)' }} />
            <span>Live Physics Playground</span>
          </h2>
          <span className="text-xs font-mono" style={{ color: 'var(--ink-dim)' }}>4 interactive law equations</span>
        </div>
        <LawEquationsPlayground />
      </div>
    </div>
  );
}
