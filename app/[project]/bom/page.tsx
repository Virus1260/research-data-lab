import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjectBOM } from "@/lib/content";
import { InteractiveBOMTable } from "@/components/bench/InteractiveBOMTable";
import { Table, Sparkles } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function BenchPage({ params }: { params: Promise<{ project: string }> }) {
  const resolvedParams = await params;
  const project = getProjectBySlug(resolvedParams.project);

  if (!project) {
    notFound();
  }

  const bomItems = getProjectBOM(project.slug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-ink-dim mb-4">
        <Link href="/" className="hover:text-ink-primary transition">
          ARCHIVE
        </Link>
        <span>/</span>
        <Link href={`/${project.slug}`} className="hover:text-amber transition uppercase">
          {project.slug}
        </Link>
        <span>/</span>
        <span className="text-amber">THE BENCH (BOM)</span>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl bg-bg-panel border border-hairline p-6 sm:p-8 mb-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cryo-subtle border border-cryo/25 text-cryo text-xs font-mono">
              <Table className="w-3.5 h-3.5" />
              <span>Interactive Hardware Bill of Materials</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-ink-primary tracking-tight">
              The Bench — System Parts Explorer
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted max-w-2xl">
              74 engineering components across 17 subsystems. Cross-referenced directly to the sizing math,
              fabrication tolerances, and patent disclosures across the 19 research chapters.
            </p>
          </div>
        </div>
      </div>

      {/* Table Component */}
      <InteractiveBOMTable projectSlug={project.slug} items={bomItems} />
    </div>
  );
}
