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
} from "lucide-react";

export const dynamic = 'force-dynamic';

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
              href={`/${project.slug}/03-hosokawa-afd-vs-generic-lyophilizers`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber hover:bg-amber-bright text-[#0e0a02] font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber/30 hover:scale-105 active:scale-95 border border-amber/40"
            >
              <span>Explore Chapter 03 (Hero Finding)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <MonographExportButton
              chapters={chapters}
              projectSlug={project.slug}
              variant="hero"
            />

            <Link
              href={`/${project.slug}/bom`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-hover border border-hairline text-ink-primary font-mono text-xs hover:bg-bg-hover transition"
            >
              <Table className="w-3.5 h-3.5 text-cryo" />
              <span>74-Part BOM</span>
            </Link>

            <Link
              href={`/${project.slug}/references`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-hover border border-hairline text-ink-primary font-mono text-xs hover:bg-bg-hover transition"
            >
              <Library className="w-3.5 h-3.5 text-amber" />
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
              <Compass className="w-4 h-4 text-amber" />
              <span>The {project.acts.length} Act Stations</span>
            </h2>
            <span className="text-xs font-mono text-ink-dim">{chapters.length} Chapters Grouped by Role</span>
          </div>

          <div className="space-y-6">
            {project.acts.map((act) => (
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
                        href={`/${project.slug}/${chapter.slug}`}
                        className="group p-4 rounded-xl bg-bg-surface hover:bg-bg-hover border border-hairline hover:border-amber/40 transition flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-ink-dim">
                            <span className="text-amber font-semibold">CH {chapter.chapterNumber}</span>
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
                href={`/${project.slug}/03-hosokawa-afd-vs-generic-lyophilizers`}
                className="p-3 rounded-xl bg-bg-inset border border-hairline hover:border-amber/30 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-ink-primary group-hover:text-amber-bright transition">
                    Listen to Lab Assistant
                  </div>
                  <div className="text-[10px] text-ink-dim font-mono">Ch. 03 Pre-generated Narration</div>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-dim group-hover:text-amber transition" />
              </Link>

              <Link
                href={`/${project.slug}/lab`}
                className="p-3 rounded-xl bg-bg-inset border border-hairline hover:border-cryo/30 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-ink-primary group-hover:text-cryo transition">
                    Phase Diagram Plotter &amp; Lab
                  </div>
                  <div className="text-[10px] text-ink-dim font-mono">Interactive Clausius–Clapeyron curves</div>
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
    </div>
  );
}
