import React from "react";
import Link from "next/link";
import { getAllProjects } from "@/lib/content";
import { ArrowRight, Sparkles, BookOpen, Layers, Cpu, Atom, ChevronRight } from "lucide-react";

export default function ArchivePage() {
  const projects = getAllProjects();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-signal/10 border border-amber-signal/25 text-amber-bright text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Digital Laboratory</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-ink-primary">
          Dense engineering dossiers,{" "}
          <span className="text-amber-signal">made interactive.</span>
        </h1>

        <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
          Not a blog and not a documentation site. An exploratory research environment where complex thermodynamics,
          patented hardware architectures, and system calculations respond directly to your touch.
        </p>
      </div>

      {/* Capsule Gallery */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <Atom className="w-4 h-4 text-cryo" />
            <h2 className="text-xs font-mono uppercase tracking-widest text-ink-primary font-semibold">
              Active Research Capsules
            </h2>
          </div>
          <span className="text-xs font-mono text-ink-dim">1 Ship • Ready to Explore</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <Link
              key={proj.slug}
              href={`/${proj.slug}`}
              className="group block rounded-2xl bg-bg-panel border border-hairline hover:border-amber-signal/40 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-signal/10 relative overflow-hidden"
            >
              {/* Subtle back-light glow */}
              <div className="absolute -right-20 -top-20 w-48 h-48 bg-cryo/10 rounded-full blur-3xl group-hover:bg-amber-signal/15 transition-all duration-500 pointer-events-none" />

              {/* Tags Row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {proj.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-bg-hover border border-hairline text-ink-secondary group-hover:border-hairline transition"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1 mb-3">
                <h3 className="text-xl font-bold text-ink-primary group-hover:text-amber-bright transition flex items-center justify-between">
                  <span>{proj.title}</span>
                  <ArrowRight className="w-4 h-4 text-ink-dim group-hover:text-amber-signal group-hover:translate-x-1 transition" />
                </h3>
                <p className="text-xs font-mono text-ink-muted">{proj.subtitle}</p>
              </div>

              {/* Hero Hook */}
              <p className="text-xs text-ink-secondary leading-relaxed line-clamp-3 mb-6 bg-bg-inset p-3 rounded-xl border border-hairline">
                "{proj.heroFinding}"
              </p>

              {/* Tiny Looping Physics Preview Animation */}
              <div className="h-16 w-full bg-bg-inset rounded-xl border border-hairline p-2 mb-6 flex items-center justify-center relative overflow-hidden">
                <svg viewBox="0 0 300 50" className="w-full h-full">
                  {/* Subtle grid */}
                  <line x1="0" y1="25" x2="300" y2="25" stroke="var(--chart-grid)" strokeDasharray="3 3" />
                  <path
                    d="M 10 40 Q 60 40, 100 35 T 180 20 T 260 5"
                    fill="none"
                    stroke="var(--cryo)"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="animate-pulse"
                  />
                  <circle cx="180" cy="20" r="3" fill="var(--amber)" className="animate-ping" />
                  <circle cx="180" cy="20" r="3" fill="var(--amber)" />
                </svg>
                <div className="absolute bottom-1 right-2 text-[9px] font-mono text-ink-dim">
                  Live Sublimation Curve
                </div>
              </div>

              {/* Metrics Footer */}
              <div className="grid grid-cols-4 gap-2 pt-4 border-t border-hairline text-center">
                <div>
                  <div className="text-sm font-bold font-mono text-ink-primary group-hover:text-amber-bright transition">
                    {proj.stats.chaptersCount}
                  </div>
                  <div className="text-[10px] font-mono text-ink-dim uppercase">Chapters</div>
                </div>
                <div>
                  <div className="text-sm font-bold font-mono text-ink-primary group-hover:text-cryo transition">
                    {proj.stats.subsystemsCount}
                  </div>
                  <div className="text-[10px] font-mono text-ink-dim uppercase">Subsystems</div>
                </div>
                <div>
                  <div className="text-sm font-bold font-mono text-ink-primary">
                    {proj.stats.bomItemsCount}
                  </div>
                  <div className="text-[10px] font-mono text-ink-dim uppercase">BOM Items</div>
                </div>
                <div>
                  <div className="text-sm font-bold font-mono text-ink-primary">
                    {proj.stats.referencesCount}
                  </div>
                  <div className="text-[10px] font-mono text-ink-dim uppercase">Sources</div>
                </div>
              </div>
            </Link>
          ))}

          {/* Template Scaffold Card for Project #2 */}
          <div className="rounded-2xl bg-bg-panel/50 border border-dashed border-hairline p-6 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-bg-hover text-ink-dim mb-4">
                <span>Extensible Architecture</span>
              </div>
              <h3 className="text-lg font-semibold text-ink-secondary mb-2">
                Project #2 Scaffold Ready
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed mb-4">
                The laboratory container is fully decoupled from the freeze dryer. Drop a new research folder into{" "}
                <code className="text-[11px] font-mono text-amber-signal">/research-data/</code> to immediately deploy a new interactive exhibit.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-bg-inset border border-hairline text-xs font-mono text-ink-dim flex items-center justify-between">
              <span>See CONTRIBUTING.md</span>
              <ChevronRight className="w-4 h-4 text-ink-dim" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
