"use client";

import React, { useState } from "react";
import type { ChapterMeta } from "@/lib/types";
import {
  Printer,
  FileText,
  Download,
  Copy,
  Check,
  X,
  FileCode,
  BookOpen,
  Sparkles,
} from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: ChapterMeta;
  projectSlug?: string;
}

export function ExportModal({
  isOpen,
  onClose,
  chapter,
  projectSlug = "hosokawa-afd-freeze-dryer",
}: ExportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // 1. Instant Print / Save as PDF
  const handlePrint = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // 2. Export as Word Document (.doc)
  const handleExportWord = () => {
    const title = chapter.title;
    const act = chapter.act;
    const contentHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <style>
          body { font-family: 'Calibri', 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1612; margin: 40px; }
          h1 { font-size: 24pt; color: #0a0b0d; margin-bottom: 6pt; border-bottom: 2pt solid #c68410; padding-bottom: 8pt; }
          .header-meta { font-family: 'Consolas', monospace; font-size: 10pt; color: #888888; text-transform: uppercase; margin-bottom: 20pt; }
          h2 { font-size: 16pt; color: #1a1612; margin-top: 24pt; margin-bottom: 8pt; border-bottom: 1pt solid #dddddd; padding-bottom: 4pt; }
          h3 { font-size: 13pt; color: #333333; margin-top: 16pt; }
          p { font-size: 11pt; margin-bottom: 10pt; }
          table { border-collapse: collapse; width: 100%; margin: 16pt 0; font-size: 10pt; }
          th, td { border: 1pt solid #cccccc; padding: 6pt 10pt; text-align: left; }
          th { background-color: #f5f0e6; font-weight: bold; color: #1a1612; }
          code, pre { font-family: 'Consolas', monospace; background-color: #f2ede3; padding: 2pt 4pt; border-radius: 3pt; font-size: 9.5pt; }
          .callout { background-color: #f7f3e8; border-left: 4pt solid #c68410; padding: 10pt; margin: 12pt 0; }
          .footer { font-size: 9pt; color: #999999; margin-top: 40pt; border-top: 1pt solid #eeeeee; padding-top: 10pt; }
        </style>
      </head>
      <body>
        <div class="header-meta">RESEARCH DATA LAB • ${act} • CHAPTER ${chapter.chapterNumber}</div>
        <h1>${title}</h1>
        <div class="header-meta">Estimated Reading Time: ${chapter.readTime} • Hosokawa AFD Technical Monograph</div>
        <div class="content">
          ${chapter.content
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
          }
        </div>
        <div class="footer">
          Generated from Research Data Lab (Hosokawa AFD Lyophilization Engineering Package) • Source: https://github.com/Virus1260/research-data-lab
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + contentHtml], {
      type: "application/msword;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chapter.slug}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  // 3. Export as Markdown (.md)
  const handleExportMarkdown = () => {
    const rawMarkdown = `---
title: "${chapter.title}"
chapterNumber: "${chapter.chapterNumber}"
slug: "${chapter.slug}"
act: "${chapter.act}"
readTime: "${chapter.readTime}"
---

# ${chapter.title}

${chapter.content}
`;
    const blob = new Blob([rawMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chapter.slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  // 4. Copy Rich Text
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(
        `# ${chapter.title}\n\n${chapter.content}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in no-print">
      <div
        className="w-full max-w-lg bg-bg-panel border border-hairline rounded-3xl p-6 shadow-2xl space-y-5"
        style={{ backgroundColor: "var(--bg-panel)" }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-subtle flex items-center justify-center border border-amber/30 text-amber">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink-primary">Export & Print Monograph</h3>
              <p className="text-[11px] font-mono text-ink-dim truncate max-w-[280px]">
                {chapter.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-dim hover:text-ink-primary hover:bg-bg-hover transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Print / PDF */}
          <button
            onClick={handlePrint}
            className="p-4 rounded-2xl bg-bg-surface hover:bg-bg-hover border border-hairline hover:border-amber transition text-left space-y-2 group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-subtle flex items-center justify-center text-amber group-hover:scale-110 transition">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-ink-primary group-hover:text-amber transition">
                Print / Save as PDF
              </div>
              <p className="text-[11px] text-ink-dim leading-relaxed">
                Opens clean print layout without navigation bars or audio players.
              </p>
            </div>
          </button>

          {/* Microsoft Word */}
          <button
            onClick={handleExportWord}
            className="p-4 rounded-2xl bg-bg-surface hover:bg-bg-hover border border-hairline hover:border-cryo transition text-left space-y-2 group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-cryo-subtle flex items-center justify-center text-cryo group-hover:scale-110 transition">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-ink-primary group-hover:text-cryo transition">
                Microsoft Word (.doc)
              </div>
              <p className="text-[11px] text-ink-dim leading-relaxed">
                Formatted with tables, equations, styles, and chapter headings.
              </p>
            </div>
          </button>

          {/* Markdown */}
          <button
            onClick={handleExportMarkdown}
            className="p-4 rounded-2xl bg-bg-surface hover:bg-bg-hover border border-hairline hover:border-amber transition text-left space-y-2 group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-subtle flex items-center justify-center text-amber group-hover:scale-110 transition">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-ink-primary group-hover:text-amber transition">
                Markdown Dossier (.md)
              </div>
              <p className="text-[11px] text-ink-dim leading-relaxed">
                Clean source text ready for Obsidian, Logseq, or local vaults.
              </p>
            </div>
          </button>

          {/* Copy to Clipboard */}
          <button
            onClick={handleCopyText}
            className="p-4 rounded-2xl bg-bg-surface hover:bg-bg-hover border border-hairline hover:border-cryo transition text-left space-y-2 group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-bg-inset flex items-center justify-center text-ink-secondary group-hover:scale-110 transition">
              {copied ? <Check className="w-4 h-4 text-cryo" /> : <Copy className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-bold text-ink-primary">
                {copied ? "Copied to Clipboard!" : "Copy Full Article"}
              </div>
              <p className="text-[11px] text-ink-dim leading-relaxed">
                Instant clipboard copy for reports or AI prompts.
              </p>
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <div className="pt-2 text-[11px] font-mono text-ink-dim text-center border-t border-hairline">
          All exports include citations, formulas, and technical metadata.
        </div>
      </div>
    </div>
  );
}
