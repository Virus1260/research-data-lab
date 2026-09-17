"use client";

import React, { useState } from "react";
import type { ChapterMeta } from "@/lib/types";
import { ExportModal } from "./ExportModal";
import { Download, FileText, Printer, Sparkles } from "lucide-react";

interface MonographExportButtonProps {
  chapters: ChapterMeta[];
  projectSlug: string;
  variant?: "hero" | "sidebar" | "compact";
  className?: string;
}

export function MonographExportButton({
  chapters,
  projectSlug,
  variant = "hero",
  className = "",
}: MonographExportButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {variant === "hero" && (
        <button
          onClick={() => setModalOpen(true)}
          className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-amber hover:bg-amber-bright text-[#0e0a02] font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-amber/25 hover:scale-105 active:scale-95 border border-amber/50 group ${className}`}
          title="Download or Print complete 19-chapter compendium in Microsoft Word, PDF, or Markdown"
        >
          <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
          <span>Export Monograph ({chapters.length} Chs)</span>
        </button>
      )}

      {variant === "sidebar" && (
        <button
          onClick={() => setModalOpen(true)}
          className={`w-full p-3.5 rounded-2xl bg-bg-surface hover:bg-bg-hover border border-amber/40 hover:border-amber transition text-left space-y-2 group shadow-sm ${className}`}
          title="Download or Print complete 19-chapter compendium in Microsoft Word, PDF, or Markdown"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-subtle flex items-center justify-center text-amber group-hover:scale-110 transition">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber/15 text-amber font-bold">
              DUPLEX A4
            </span>
          </div>
          <div>
            <div className="text-xs font-bold text-ink-primary group-hover:text-amber transition flex items-center gap-1.5">
              <span>Export Full Compendium</span>
            </div>
            <p className="text-[10px] font-mono text-ink-dim leading-relaxed">
              Word (.doc) &bull; PDF Print &bull; Markdown
            </p>
          </div>
        </button>
      )}

      {variant === "compact" && (
        <button
          onClick={() => setModalOpen(true)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-bg-surface hover:bg-bg-hover border border-hairline hover:border-amber/50 text-ink-primary text-xs font-mono transition shadow-xs ${className}`}
          title="Download or Print complete 19-chapter compendium"
        >
          <Download className="w-3.5 h-3.5 text-amber" />
          <span>Export Monograph</span>
        </button>
      )}

      {/* Export Modal with all 19 chapters loaded */}
      <ExportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        allChapters={chapters}
        projectSlug={projectSlug}
        defaultMode="all"
      />
    </>
  );
}
