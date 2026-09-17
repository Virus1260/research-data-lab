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
  Layers,
  Sparkles,
} from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter?: ChapterMeta | null;
  allChapters?: ChapterMeta[];
  projectSlug?: string;
  defaultMode?: "single" | "all";
}

/**
 * Converts Markdown text into clean, highly styled Microsoft Word HTML
 * properly handling tables, bullet/numbered lists, blockquotes, code blocks,
 * and typographic styling.
 */
function markdownToWordHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Code Blocks
    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(
          lines[i]
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
        );
        i++;
      }
      i++; // skip closing ```
      output.push(
        `<pre style="background:#f4f6f8; border:1pt solid #d1d5db; padding:8pt 10pt; font-family:'Consolas','Courier New',monospace; font-size:9pt; line-height:1.4; color:#1f2937; margin:10pt 0;"><code>${codeLines.join("\n")}</code></pre>`
      );
      continue;
    }

    // 2. Markdown Tables
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerRow = tableLines[0];
        const isSeparator = tableLines[1].includes("---");
        const bodyStartIndex = isSeparator ? 2 : 1;

        const parseCells = (row: string) =>
          row
            .slice(1, -1)
            .split("|")
            .map((c) => c.trim());

        const headers = parseCells(headerRow);
        let tableHtml = `<table class="data-table" style="border-collapse:collapse; width:100%; margin:14pt 0; font-family:'Calibri',sans-serif; font-size:9.5pt;">`;
        tableHtml += `<thead><tr style="background-color:#f3f0e8;">`;
        headers.forEach((h) => {
          tableHtml += `<th style="border:1pt solid #b0a390; padding:6pt 8pt; text-align:left; font-weight:bold; color:#0c1829;">${formatInline(h)}</th>`;
        });
        tableHtml += `</tr></thead><tbody>`;

        for (let r = bodyStartIndex; r < tableLines.length; r++) {
          const cells = parseCells(tableLines[r]);
          const bgColor = r % 2 === 0 ? "#faf8f5" : "#ffffff";
          tableHtml += `<tr style="background-color:${bgColor};">`;
          cells.forEach((c) => {
            tableHtml += `<td style="border:1pt solid #d4c8b6; padding:5pt 8pt; color:#1a1a1a; vertical-align:top;">${formatInline(c)}</td>`;
          });
          tableHtml += `</tr>`;
        }
        tableHtml += `</tbody></table>`;
        output.push(tableHtml);
        continue;
      }
    }

    // 3. Blockquotes / Callouts
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      output.push(
        `<div class="callout" style="background:#fdfaf3; border-left:3.5pt solid #c68410; padding:8pt 12pt; margin:12pt 0; font-style:italic; color:#1e293b;">${formatInline(quoteLines.join(" "))}</div>`
      );
      continue;
    }

    // 4. Headings
    if (trimmed.startsWith("#### ")) {
      output.push(`<h4 style="font-size:11.5pt; font-weight:bold; color:#374151; margin-top:12pt; margin-bottom:4pt;">${formatInline(trimmed.slice(5))}</h4>`);
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      output.push(`<h3 style="font-size:13pt; font-weight:bold; color:#1e293b; margin-top:16pt; margin-bottom:6pt;">${formatInline(trimmed.slice(4))}</h3>`);
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      output.push(
        `<h2 style="font-size:15.5pt; font-weight:bold; color:#0f172a; margin-top:20pt; margin-bottom:6pt; border-bottom:1pt solid #e2e8f0; padding-bottom:3pt;">${formatInline(trimmed.slice(3))}</h2>`
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      output.push(
        `<h1 style="font-size:20pt; font-weight:bold; color:#0c1829; margin-top:22pt; margin-bottom:8pt; border-bottom:2pt solid #c68410; padding-bottom:5pt;">${formatInline(trimmed.slice(2))}</h1>`
      );
      i++;
      continue;
    }

    // 5. Unordered Lists
    if (trimmed.match(/^[-*+] /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^[-*+] /)) {
        listItems.push(lines[i].trim().replace(/^[-*+] /, ""));
        i++;
      }
      let listHtml = `<ul style="margin:8pt 0 10pt 20pt; padding:0; list-style-type:disc; color:#1f2937;">`;
      listItems.forEach((li) => {
        listHtml += `<li style="margin-bottom:4pt; line-height:1.5;">${formatInline(li)}</li>`;
      });
      listHtml += `</ul>`;
      output.push(listHtml);
      continue;
    }

    // 6. Ordered Lists
    if (trimmed.match(/^\d+\. /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\. /)) {
        listItems.push(lines[i].trim().replace(/^\d+\. /, ""));
        i++;
      }
      let listHtml = `<ol style="margin:8pt 0 10pt 20pt; padding:0; list-style-type:decimal; color:#1f2937;">`;
      listItems.forEach((li) => {
        listHtml += `<li style="margin-bottom:4pt; line-height:1.5;">${formatInline(li)}</li>`;
      });
      listHtml += `</ol>`;
      output.push(listHtml);
      continue;
    }

    // 7. Horizontal Rule
    if (trimmed.match(/^---+$/) || trimmed.match(/^\*\*\*+$/)) {
      output.push(`<hr style="border:none; border-top:1pt solid #d1d5db; margin:16pt 0;" />`);
      i++;
      continue;
    }

    // 8. Normal Paragraph
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().match(/^(#{1,4} |[-*+] |\d+\. |```|> |---|\*\*\*|\|)/)
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length > 0) {
      output.push(
        `<p style="margin:0 0 8pt 0; line-height:1.55; text-align:justify; color:#111827; font-size:10.5pt;">${formatInline(paraLines.join(" "))}</p>`
      );
    } else {
      i++;
    }
  }

  return output.join("\n");
}

/**
 * Replaces markdown bold, italic, code, URLs, and formulas with inline HTML
 */
function formatInline(text: string): string {
  return text
    // Escaped entities
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#000000; font-weight:700;">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em style="font-style:italic;">$1</em>')
    .replace(/_([^_]+)_/g, '<em style="font-style:italic;">$1</em>')
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code style="font-family:\'Consolas\',monospace; background-color:#f1f5f9; color:#0f172a; padding:1pt 3pt; border-radius:2pt; font-size:9pt; border:1px solid #e2e8f0;">$1</code>'
    )
    // Markdown links [text](url)
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" style="color:#0366d6; text-decoration:underline;">$1</a>'
    )
    // Raw URLs
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" style="color:#0366d6; text-decoration:underline; font-family:\'Consolas\',monospace; font-size:9pt;">$1</a>'
    );
}

export function ExportModal({
  isOpen,
  onClose,
  chapter,
  allChapters = [],
  projectSlug = "hosokawa-afd-freeze-dryer",
  defaultMode,
}: ExportModalProps) {
  const hasMultiple = allChapters.length > 0;
  const initialMode = defaultMode || (chapter ? "single" : "all");
  const [exportMode, setExportMode] = useState<"single" | "all">(initialMode);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activeChapters: ChapterMeta[] =
    exportMode === "all" || !chapter ? allChapters : [chapter];

  // 1. Instant Print / Save as PDF
  const handlePrint = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // 2. Export as Microsoft Word (.doc) with Duplex Spiral-Binding Margins & Dynamic Headers/Footers
  const handleExportWord = () => {
    const isSingle = exportMode === "single" && chapter;
    const docTitle = isSingle
      ? `${chapter.chapterNumber} — ${chapter.title}`
      : "Hosokawa Active Freeze Dryer (AFD) — Technical Monograph Compendium";
    const subTitle = isSingle
      ? `Research Data Lab • ${chapter.act} • Chapter ${chapter.chapterNumber}`
      : "Complete 19-Chapter Research Package & Engineering Compendium";

    // Build Table of Contents / Index for the document
    let indexHtml = "";
    if (activeChapters.length > 1) {
      indexHtml = `
        <div style="margin:20pt 0; border:1pt solid #d1d5db; background:#faf8f5; padding:16pt 20pt; border-radius:4pt;">
          <h2 style="font-size:14pt; font-weight:bold; color:#0c1829; margin-top:0; margin-bottom:8pt; border-bottom:1.5pt solid #c68410; padding-bottom:4pt;">
            DOCUMENT CHAPTER INDEX &amp; TABLE OF CONTENTS
          </h2>
          <table style="width:100%; border-collapse:collapse; font-size:9.5pt; font-family:'Calibri',sans-serif;">
            <thead>
              <tr style="border-bottom:1pt solid #b0a390; color:#555555; text-align:left;">
                <th style="padding:4pt 6pt; width:60px;">CH #</th>
                <th style="padding:4pt 6pt;">CHAPTER TITLE</th>
                <th style="padding:4pt 6pt; width:140px;">ACT / STAGE</th>
                <th style="padding:4pt 6pt; width:80px; text-align:right;">READ TIME</th>
              </tr>
            </thead>
            <tbody>
              ${activeChapters
                .map(
                  (c, idx) => `
                <tr style="border-bottom:0.5pt dotted #cccccc;">
                  <td style="padding:5pt 6pt; font-family:'Consolas',monospace; font-weight:bold; color:#c68410;">${c.chapterNumber}</td>
                  <td style="padding:5pt 6pt;">
                    <a href="#ch-${c.chapterNumber}" style="color:#0f172a; text-decoration:none; font-weight:600;">${c.title}</a>
                  </td>
                  <td style="padding:5pt 6pt; color:#475569; font-size:9pt;">${c.act}</td>
                  <td style="padding:5pt 6pt; color:#64748b; font-size:9pt; text-align:right;">${c.readTime}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;
    } else if (chapter) {
      indexHtml = `
        <div style="margin:16pt 0; border:1pt solid #e2e8f0; background:#f8fafc; padding:12pt 16pt; border-radius:4pt;">
          <h3 style="font-size:11pt; font-weight:bold; color:#0f172a; margin-top:0; margin-bottom:6pt; text-transform:uppercase; letter-spacing:0.5pt;">
            Chapter Topics &amp; Outlines
          </h3>
          <ul style="margin:0 0 0 16pt; padding:0; font-size:9.5pt; color:#334155;">
            ${chapter.headings
              .filter((h) => h.level === 2)
              .map((h) => `<li style="margin-bottom:3pt;">${h.text}</li>`)
              .join("")}
          </ul>
        </div>
      `;
    }

    // Build chapter body content
    const chaptersContentHtml = activeChapters
      .map((c, index) => {
        const pageBreakStyle =
          index > 0
            ? "page-break-before:always; mso-break-type:section-break; margin-top:24pt;"
            : "";
        return `
          <div id="ch-${c.chapterNumber}" style="${pageBreakStyle}">
            <div style="font-family:'Consolas',monospace; font-size:9.5pt; color:#888888; text-transform:uppercase; letter-spacing:0.5pt; margin-bottom:4pt;">
              RESEARCH DATA LAB &bull; ${c.act} &bull; CHAPTER ${c.chapterNumber}
            </div>
            <h1 style="font-size:22pt; font-weight:bold; color:#0c1829; margin-top:2pt; margin-bottom:4pt; border-bottom:2pt solid #c68410; padding-bottom:6pt;">
              ${c.title}
            </h1>
            <div style="font-size:9.5pt; font-family:'Calibri',sans-serif; color:#64748b; margin-bottom:14pt;">
              Estimated Reading Time: ${c.readTime} &bull; Hosokawa AFD Engineering Package
            </div>
            <div class="chapter-text">
              ${markdownToWordHtml(c.content)}
            </div>
          </div>
        `;
      })
      .join("\n");

    const fullWordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${docTitle}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          /* A4 Portrait with Duplex Spiral-Binding Margins:
             Odd Pages: Left 28mm (79.4pt) gutter, Right 14mm (39.7pt)
             Even Pages: Left 14mm (39.7pt), Right 28mm (79.4pt) gutter
             Top / Bottom: 20mm (56.7pt) */
          @page Section1 {
            size: 595.3pt 841.9pt;
            margin: 56.7pt 39.7pt 56.7pt 79.4pt;
            mso-mirror-margins: 1;
            mso-header-margin: 35.4pt;
            mso-footer-margin: 35.4pt;
            mso-title-page: yes;
            mso-header: h1;
            mso-footer: f1;
          }
          div.Section1 { page: Section1; }
          body {
            font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.55;
            color: #111111;
          }
          p.MsoHeader, li.MsoHeader, div.MsoHeader {
            margin: 0;
            font-size: 8.5pt;
            font-family: 'Calibri', sans-serif;
            color: #666666;
            border-bottom: 0.5pt solid #cccccc;
            padding-bottom: 4pt;
          }
          p.MsoFooter, li.MsoFooter, div.MsoFooter {
            margin: 0;
            font-size: 8.5pt;
            font-family: 'Calibri', sans-serif;
            color: #666666;
            border-top: 0.5pt solid #cccccc;
            padding-top: 4pt;
          }
        </style>
      </head>
      <body>
        <div class="Section1">
          <!-- Microsoft Word Running Header Definition -->
          <div style="mso-element:header" id="h1">
            <p class="MsoHeader">
              <span style="float:left;">RESEARCH DATA LAB &bull; HOSOKAWA ACTIVE FREEZE DRYER</span>
              <span style="float:right;">ENGINEERING MONOGRAPH</span>
            </p>
          </div>

          <!-- Microsoft Word Running Footer with Real Word Dynamic Page Numbers -->
          <div style="mso-element:footer" id="f1">
            <p class="MsoFooter">
              <span style="float:left;">OPEN LAB COMPENDIUM &bull; DUPLEX SPIRAL READY</span>
              <span style="float:right;">Page <span style="mso-field-code:' PAGE '"></span> of <span style="mso-field-code:' NUMPAGES '"></span></span>
            </p>
          </div>

          <!-- Cover / Title Header -->
          <div style="border-bottom:2pt solid #0c1829; padding-bottom:14pt; margin-bottom:16pt;">
            <div style="font-family:'Consolas',monospace; font-size:10pt; font-weight:bold; color:#c68410; text-transform:uppercase; letter-spacing:1pt;">
              ${subTitle}
            </div>
            <h1 style="font-size:24pt; font-weight:bold; color:#0c1829; margin-top:6pt; margin-bottom:6pt; line-height:1.2;">
              ${docTitle}
            </h1>
            <div style="font-size:10pt; color:#475569;">
              Duplex Spiral-Binding Ready (A4 • 28mm Spine Gutter • Dynamic Page Numbering • Real Formatted Tables)
            </div>
          </div>

          <!-- Chapter Index / Table of Contents -->
          ${indexHtml}

          <!-- Chapter Contents -->
          ${chaptersContentHtml}

          <!-- Document End Attribution -->
          <div style="margin-top:30pt; padding-top:10pt; border-top:1pt solid #dddddd; font-size:8.5pt; color:#888888; font-family:'Consolas',monospace;">
            Generated by Research Data Lab &bull; Hosokawa AFD Engineering Package &bull; Source: https://github.com/Virus1260/research-data-lab
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + fullWordHtml], {
      type: "application/msword;charset=utf-8",
    });
    const fileName = isSingle
      ? `${chapter.slug}.doc`
      : `hosokawa-afd-monograph-complete.doc`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  // 3. Export as Markdown (.md)
  const handleExportMarkdown = () => {
    const isSingle = exportMode === "single" && chapter;
    let content = "";
    let fileName = "";

    if (isSingle) {
      content = `---
title: "${chapter.title}"
chapterNumber: "${chapter.chapterNumber}"
slug: "${chapter.slug}"
act: "${chapter.act}"
readTime: "${chapter.readTime}"
---

# ${chapter.title}

${chapter.content}
`;
      fileName = `${chapter.slug}.md`;
    } else {
      content = `---
title: "Hosokawa Active Freeze Dryer (AFD) — Technical Monograph Compendium"
version: "1.0.0"
chaptersCount: ${activeChapters.length}
duplexBinding: "A4 ready (28mm gutter)"
---

# Hosokawa Active Freeze Dryer (AFD) — Technical Monograph Compendium

${activeChapters
  .map(
    (c) => `
---
<!-- CHAPTER ${c.chapterNumber} -->

# Chapter ${c.chapterNumber}: ${c.title}
*Act: ${c.act} | Read Time: ${c.readTime}*

${c.content}
`
  )
  .join("\n\n")}
`;
      fileName = `hosokawa-afd-monograph-complete.md`;
    }

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  // 4. Copy Rich Text
  const handleCopyText = async () => {
    try {
      const isSingle = exportMode === "single" && chapter;
      const textToCopy = isSingle
        ? `# ${chapter.title}\n\n${chapter.content}`
        : `# Hosokawa Active Freeze Dryer Monograph\n\n` +
          activeChapters.map((c) => `## Chapter ${c.chapterNumber}: ${c.title}\n\n${c.content}`).join("\n\n---\n\n");

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print">
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
              <h3 className="text-sm font-bold text-ink-primary">Export &amp; Print Monograph</h3>
              <p className="text-[11px] font-mono text-ink-dim truncate max-w-[280px]">
                {exportMode === "all" || !chapter
                  ? `Full Compendium (${activeChapters.length} Chapters)`
                  : chapter.title}
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

        {/* Scope Toggle (Current Chapter vs Full 19 Chapters) */}
        {hasMultiple && chapter && (
          <div className="p-1 bg-bg-surface rounded-xl border border-hairline flex items-center text-xs font-mono">
            <button
              onClick={() => setExportMode("single")}
              className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
                exportMode === "single"
                  ? "bg-amber text-on-amber shadow-xs"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Current Chapter ({chapter.chapterNumber})</span>
            </button>
            <button
              onClick={() => setExportMode("all")}
              className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
                exportMode === "all"
                  ? "bg-amber text-on-amber shadow-xs"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Full Monograph ({allChapters.length} Chs)</span>
            </button>
          </div>
        )}

        {/* Informative Specs Banner */}
        <div className="p-3 rounded-xl bg-bg-surface/50 border border-hairline/60 text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Duplex Spiral-Binding Print &amp; Word Engine</span>
          </div>
          <p className="text-ink-secondary leading-relaxed">
            Formatted for A4 duplex printing: <strong>28mm gutter margin</strong> on the binding edge
            (left on odd pages, right on even pages) so spiral punching never cuts into formulas or text.
          </p>
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
                Pitch-black vector text with odd/even spiral gutters.
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
                Formatted tables, Table of Contents, Page X of Y footers.
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
                Raw source text ready for Obsidian, Logseq, or local notes.
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
                Instant clipboard copy for reports or AI research.
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
