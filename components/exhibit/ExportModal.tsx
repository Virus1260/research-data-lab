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
  Loader2,
} from "lucide-react";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  convertMillimetersToTwip,
} from "docx";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter?: ChapterMeta | null;
  allChapters?: ChapterMeta[];
  projectSlug?: string;
  defaultMode?: "single" | "all";
}

/**
 * Tokenizes markdown inline formatting into docx TextRun elements:
 * supports **bold**, *italic*, `code`, and links.
 */
function parseInlineRuns(text: string): TextRun[] {
  if (!text) return [new TextRun({ text: "" })];

  // Strip raw HTML tags if any (e.g. <br>, <strong>)
  const clean = text.replace(/<[^>]+>/g, "");
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|_([^_]+)_|\[([^\]]+)\]\(([^)]+)\)|https?:\/\/[^\s]+)/g;
  const runs: TextRun[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(clean)) !== null) {
    if (match.index > lastIndex) {
      runs.push(
        new TextRun({
          text: clean.slice(lastIndex, match.index),
          font: "Calibri",
          size: 22,
          color: "1A1A1A",
        })
      );
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      runs.push(
        new TextRun({
          text: token.slice(2, -2),
          bold: true,
          font: "Calibri",
          size: 22,
          color: "0C1829",
        })
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      runs.push(
        new TextRun({
          text: token.slice(1, -1),
          font: "Consolas",
          size: 19,
          color: "0F172A",
          shading: { fill: "F1F5F9" },
        })
      );
    } else if ((token.startsWith("*") && token.endsWith("*")) || (token.startsWith("_") && token.endsWith("_"))) {
      runs.push(
        new TextRun({
          text: token.slice(1, -1),
          italics: true,
          font: "Calibri",
          size: 22,
          color: "2D3748",
        })
      );
    } else if (token.startsWith("[") && token.includes("](")) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        runs.push(
          new TextRun({
            text: linkMatch[1],
            color: "0366D6",
            underline: {},
            font: "Calibri",
            size: 22,
          })
        );
      }
    } else if (token.startsWith("http://") || token.startsWith("https://")) {
      runs.push(
        new TextRun({
          text: token,
          color: "0366D6",
          underline: {},
          font: "Consolas",
          size: 19,
        })
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < clean.length) {
    runs.push(
      new TextRun({
        text: clean.slice(lastIndex),
        font: "Calibri",
        size: 22,
        color: "1A1A1A",
      })
    );
  }

  return runs.length > 0 ? runs : [new TextRun({ text: clean, font: "Calibri", size: 22 })];
}

/**
 * Parses Markdown chapter text into genuine docx paragraphs, tables, lists, and code blocks.
 * Ignores empty lines so NO accidental blank pages are created.
 */
function markdownToDocxParagraphs(markdown: string): (Paragraph | Table)[] {
  const lines = markdown.split("\n");
  const elements: (Paragraph | Table)[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Skip frontmatter if raw
    if (trimmed === "---") {
      i++;
      while (i < lines.length && lines[i].trim() !== "---") {
        i++;
      }
      if (i < lines.length) i++;
      continue;
    }

    // 2. Code blocks
    if (trimmed.startsWith("```")) {
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: lines[i],
                font: "Consolas",
                size: 18,
                color: "1F2937",
              }),
            ],
            shading: { fill: "F3F4F6" },
            spacing: { before: 20, after: 20, line: 240 },
          })
        );
        i++;
      }
      if (i < lines.length) i++;
      continue;
    }

    // 3. Markdown Tables
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const parseCells = (r: string) =>
          r
            .slice(1, -1)
            .split("|")
            .map((c) => c.trim());
        const headers = parseCells(tableLines[0]);
        const startIdx = tableLines[1].includes("---") ? 2 : 1;

        const rows: TableRow[] = [
          new TableRow({
            children: headers.map(
              (h) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: h, bold: true, font: "Calibri", size: 20, color: "0C1829" })],
                      spacing: { before: 60, after: 60 },
                    }),
                  ],
                  shading: { fill: "F3F0E8" },
                })
            ),
          }),
        ];

        for (let r = startIdx; r < tableLines.length; r++) {
          const cells = parseCells(tableLines[r]);
          const fill = r % 2 === 0 ? "FAF8F5" : "FFFFFF";
          rows.push(
            new TableRow({
              children: cells.map(
                (c) =>
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: parseInlineRuns(c),
                        spacing: { before: 40, after: 40 },
                      }),
                    ],
                    shading: { fill },
                  })
              ),
            })
          );
        }

        elements.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
          })
        );
      }
      continue;
    }

    // 4. Custom interactive component placeholders (strip raw JSX)
    if (trimmed.startsWith("<") && (trimmed.endsWith("/>") || trimmed.endsWith(">"))) {
      const compName = trimmed.replace(/[<>/]/g, "").trim().split(" ")[0];
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[Interactive Exhibit / Diagram: ${compName} — Explore online in Research Data Lab]`,
              italics: true,
              font: "Calibri",
              size: 20,
              color: "888888",
            }),
          ],
          spacing: { before: 60, after: 60 },
        })
      );
      i++;
      continue;
    }

    // 5. Headings
    if (trimmed.startsWith("### ")) {
      elements.push(
        new Paragraph({
          text: trimmed.slice(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 180, after: 80 },
        })
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        new Paragraph({
          text: trimmed.slice(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 100 },
        })
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      elements.push(
        new Paragraph({
          text: trimmed.slice(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 280, after: 120 },
        })
      );
      i++;
      continue;
    }

    // 6. Bullet lists
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(
        new Paragraph({
          children: parseInlineRuns(trimmed.slice(2)),
          bullet: { level: 0 },
          spacing: { before: 30, after: 30, line: 260 },
        })
      );
      i++;
      continue;
    }

    // 7. Numbered lists
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({ text: numMatch[1] + ". ", bold: true, font: "Calibri", size: 22 }),
            ...parseInlineRuns(numMatch[2]),
          ],
          spacing: { before: 30, after: 30, line: 260 },
        })
      );
      i++;
      continue;
    }

    // 8. Blockquotes
    if (trimmed.startsWith("> ")) {
      elements.push(
        new Paragraph({
          children: parseInlineRuns(trimmed.slice(2)),
          indent: { left: convertMillimetersToTwip(8) },
          spacing: { before: 80, after: 80, line: 260 },
        })
      );
      i++;
      continue;
    }

    // 9. Standard paragraphs
    elements.push(
      new Paragraph({
        children: parseInlineRuns(trimmed),
        spacing: { before: 40, after: 100, line: 276 },
      })
    );
    i++;
  }

  return elements;
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
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);

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

  // 2. Export as genuine OpenXML Microsoft Word (.docx) with uniform 20mm margins and true page breaks
  const handleExportWord = async () => {
    try {
      setIsGeneratingDocx(true);
      const isSingle = exportMode === "single" && chapter;
      const docTitle = isSingle
        ? `${chapter.chapterNumber} — ${chapter.title}`
        : "Hosokawa Active Freeze Dryer (AFD) — Technical Monograph Compendium";
      const subTitle = isSingle
        ? `Research Data Lab • ${chapter.act} • Chapter ${chapter.chapterNumber}`
        : "Complete 19-Chapter Research Package & Engineering Compendium";

      const docElements: (Paragraph | Table)[] = [];

      // Document Cover Title Block
      docElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: subTitle.toUpperCase(),
              bold: true,
              font: "Consolas",
              size: 20,
              color: "C68410",
            }),
          ],
          spacing: { before: 100, after: 80 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: docTitle,
              bold: true,
              font: "Calibri",
              size: 44,
              color: "0C1829",
            }),
          ],
          spacing: { before: 80, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "A4 Format • Uniform 20mm Common Margins • Verified Word OpenXML Pagination",
              font: "Calibri",
              size: 20,
              color: "64748B",
            }),
          ],
          spacing: { before: 40, after: 240 },
        })
      );

      // Table of Contents Table if multi-chapter
      if (activeChapters.length > 1) {
        docElements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "DOCUMENT CHAPTER INDEX & TABLE OF CONTENTS",
                bold: true,
                font: "Calibri",
                size: 24,
                color: "0C1829",
              }),
            ],
            spacing: { before: 160, after: 100 },
          })
        );

        const tocRows: TableRow[] = [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 12, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "CH #", bold: true, font: "Calibri", size: 19 })] })],
                shading: { fill: "F3F0E8" },
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "CHAPTER TITLE", bold: true, font: "Calibri", size: 19 })] })],
                shading: { fill: "F3F0E8" },
              }),
              new TableCell({
                width: { size: 23, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "ACT / STAGE", bold: true, font: "Calibri", size: 19 })] })],
                shading: { fill: "F3F0E8" },
              }),
              new TableCell({
                width: { size: 15, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "READ TIME", bold: true, font: "Calibri", size: 19 })], alignment: AlignmentType.RIGHT })],
                shading: { fill: "F3F0E8" },
              }),
            ],
          }),
        ];

        activeChapters.forEach((c, idx) => {
          const fill = idx % 2 === 0 ? "FAF8F5" : "FFFFFF";
          tocRows.push(
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: c.chapterNumber, bold: true, font: "Consolas", size: 19, color: "C68410" })] })],
                  shading: { fill },
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: c.title, font: "Calibri", size: 20, color: "0F172A", bold: true })] })],
                  shading: { fill },
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: c.act, font: "Calibri", size: 19, color: "475569" })] })],
                  shading: { fill },
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: c.readTime, font: "Calibri", size: 19, color: "64748B" })], alignment: AlignmentType.RIGHT })],
                  shading: { fill },
                }),
              ],
            })
          );
        });

        docElements.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tocRows,
          })
        );
      }

      // Chapters content: Add clean PageBreak only between chapters!
      activeChapters.forEach((c, index) => {
        if (index > 0 || activeChapters.length > 1) {
          docElements.push(new Paragraph({ children: [new PageBreak()] }));
        }

        docElements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `RESEARCH DATA LAB • ${c.act.toUpperCase()} • CHAPTER ${c.chapterNumber}`,
                font: "Consolas",
                size: 18,
                color: "888888",
              }),
            ],
            spacing: { before: 180, after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: c.title,
                bold: true,
                font: "Calibri",
                size: 34,
                color: "0C1829",
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 60, after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Estimated Reading Time: ${c.readTime} • Hosokawa AFD Engineering Package`,
                italics: true,
                font: "Calibri",
                size: 19,
                color: "64748B",
              }),
            ],
            spacing: { before: 40, after: 200 },
          }),
          ...markdownToDocxParagraphs(c.content)
        );
      });

      // Attribution footer at end of document
      docElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Generated by Research Data Lab • Hosokawa AFD Engineering Package • Source: https://github.com/Virus1260/research-data-lab",
              font: "Consolas",
              size: 17,
              color: "888888",
            }),
          ],
          spacing: { before: 300, after: 100 },
        })
      );

      // Build Document with uniform 20mm margins on all sides
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: convertMillimetersToTwip(20),
                  right: convertMillimetersToTwip(20),
                  bottom: convertMillimetersToTwip(20),
                  left: convertMillimetersToTwip(20),
                },
              },
            },
            headers: {
              default: new Header({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: "RESEARCH DATA LAB • HOSOKAWA ACTIVE FREEZE DRYER (AFD) MONOGRAPH",
                        size: 17,
                        color: "777777",
                        font: "Calibri",
                      }),
                    ],
                  }),
                ],
              }),
            },
            footers: {
              default: new Footer({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: "OPEN LAB COMPENDIUM • UNIFORM 20mm MARGINS • Page ",
                        size: 17,
                        color: "777777",
                        font: "Calibri",
                      }),
                      new TextRun({
                        children: [PageNumber.CURRENT],
                        size: 17,
                        color: "777777",
                        font: "Calibri",
                      }),
                      new TextRun({
                        text: " of ",
                        size: 17,
                        color: "777777",
                        font: "Calibri",
                      }),
                      new TextRun({
                        children: [PageNumber.TOTAL_PAGES],
                        size: 17,
                        color: "777777",
                        font: "Calibri",
                      }),
                    ],
                  }),
                ],
              }),
            },
            children: docElements,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const fileName = isSingle
        ? `${chapter.slug}.docx`
        : `hosokawa-afd-monograph-complete.docx`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", fileName);
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 10000);

      onClose();
    } catch (err) {
      console.error("Failed to export docx:", err);
    } finally {
      setIsGeneratingDocx(false);
    }
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
margins: "A4 common 20mm"
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
    a.setAttribute("download", fileName);
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 10000);
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
            <span>Clean Standard A4 Publishing Engine</span>
          </div>
          <p className="text-ink-secondary leading-relaxed">
            Formatted with <strong>uniform 20mm margins</strong> on all sides across all pages for both Word (.docx) and PDF,
            ensuring consistent borders, clean reading, and proper printing.
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
                Pitch-black vector text with uniform 20mm margins.
              </p>
            </div>
          </button>

          {/* Microsoft Word (.docx) */}
          <button
            onClick={handleExportWord}
            disabled={isGeneratingDocx}
            className="p-4 rounded-2xl bg-bg-surface hover:bg-bg-hover border border-hairline hover:border-cryo transition text-left space-y-2 group shadow-sm disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-xl bg-cryo-subtle flex items-center justify-center text-cryo group-hover:scale-110 transition">
              {isGeneratingDocx ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-bold text-ink-primary group-hover:text-cryo transition">
                {isGeneratingDocx ? "Generating .docx..." : "Microsoft Word (.docx)"}
              </div>
              <p className="text-[11px] text-ink-dim leading-relaxed">
                Native OpenXML .docx • Uniform 20mm Margins • Verified Pagination.
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
