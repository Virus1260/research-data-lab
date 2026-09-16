import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjectReferences } from "@/lib/content";
import { ReferencesExplorer } from "@/components/shelf/ReferencesExplorer";
import { Library, Sparkles } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ReferencesPage({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const resolvedParams = await params;
  const project = getProjectBySlug(resolvedParams.project);

  if (!project) {
    notFound();
  }

  const references = getProjectReferences(project.slug);

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
        <span className="text-amber">THE SHELF (REFERENCES)</span>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl bg-bg-panel border border-hairline p-6 sm:p-8 mb-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-subtle border border-amber/25 text-amber-bright text-xs font-mono">
              <Library className="w-3.5 h-3.5" />
              <span>Primary Technical Literature & Patents</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-ink-primary tracking-tight">
              The Shelf — Cited References
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted max-w-2xl">
              All 34 verifiable engineering sources backing this research package: Hosokawa patents, ASME BPVC
              and BPE bioprocessing standards, GAMP 5 validation protocols, NFPA 652 combustible dust guidelines,
              and peer-reviewed freeze-drying physics.
            </p>
          </div>
        </div>
      </div>

      {/* References Explorer Grid */}
      <ReferencesExplorer projectSlug={project.slug} references={references} />
    </div>
  );
}
