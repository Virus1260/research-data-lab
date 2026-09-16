"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { ReferenceItem } from "@/lib/types";
import { Search, ExternalLink, Library, Bookmark, Filter, BookOpen } from "lucide-react";

interface ReferencesExplorerProps {
  projectSlug: string;
  references: ReferenceItem[];
}

export function ReferencesExplorer({ projectSlug, references }: ReferencesExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedChapter, setSelectedChapter] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    references.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set);
  }, [references]);

  const chapters = useMemo(() => {
    const set = new Set<string>();
    references.forEach((r) => {
      r.citedByChapters.forEach((ch) => set.add(ch));
    });
    return Array.from(set).sort();
  }, [references]);

  const filtered = useMemo(() => {
    return references.filter((ref) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        ref.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === "all" || ref.category === selectedCategory;

      const matchesCh =
        selectedChapter === "all" || ref.citedByChapters.includes(selectedChapter);

      return matchesSearch && matchesCat && matchesCh;
    });
  }, [references, searchQuery, selectedCategory, selectedChapter]);

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Bar */}
      <div className="bg-bg-panel border border-hairline p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-ink-dim absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patents, standards, papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-inset border border-hairline rounded-xl pl-9 pr-3 py-2 text-xs text-ink-primary placeholder:text-ink-dim font-mono outline-none focus:border-amber-signal/50 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-bg-inset border border-hairline text-xs text-ink-secondary rounded-xl px-3 py-2 font-mono outline-none cursor-pointer max-w-xs truncate"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Chapter Filter Select */}
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="bg-bg-inset border border-hairline text-xs text-ink-secondary rounded-xl px-3 py-2 font-mono outline-none cursor-pointer"
          >
            <option value="all">Cited by Any Chapter</option>
            {chapters.map((ch) => (
              <option key={ch} value={ch}>
                Cited in Ch {ch}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* References Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((ref) => (
          <div
            key={ref.id}
            className="p-5 rounded-2xl bg-bg-panel border border-hairline hover:border-hairline-strong transition flex flex-col justify-between space-y-4 shadow-lg group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-amber-signal font-semibold">
                  Source #{ref.id} • {ref.category.split(".")[0]}
                </span>
                {ref.citedByChapters.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-ink-dim">
                    <span>Cited in:</span>
                    {ref.citedByChapters.map((ch) => (
                      <span
                        key={ch}
                        className="bg-bg-hover px-1.5 py-0.5 rounded text-amber-bright font-bold"
                      >
                        Ch {ch}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <h3 className="text-sm font-bold text-ink-primary group-hover:text-amber transition leading-snug">
                {ref.title}
              </h3>

              {ref.description && (
                <div className="text-xs text-ink-secondary leading-relaxed font-mono break-all pt-1">
                  {(() => {
                    const urlRegex = /(https?:\/\/[^\s<>)"]+)/g;
                    const parts = ref.description.split(urlRegex);
                    return parts.map((part, pIdx) => {
                      if (part.startsWith("http://") || part.startsWith("https://")) {
                        let cleanPart = part;
                        let trailingPunct = "";
                        while (cleanPart.match(/[.,;:)\]]$/)) {
                          trailingPunct = cleanPart.slice(-1) + trailingPunct;
                          cleanPart = cleanPart.slice(0, -1);
                        }
                        return (
                          <React.Fragment key={pIdx}>
                            <a
                              href={cleanPart}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 my-0.5 rounded-lg bg-amber/10 hover:bg-amber/25 border border-amber/30 hover:border-amber/60 text-amber font-mono text-[11px] font-semibold transition-all duration-150 group shadow-xs align-middle"
                              title={`Open ${cleanPart} in new tab`}
                            >
                              <span className="truncate max-w-[200px] sm:max-w-xs group-hover:underline">
                                {cleanPart}
                              </span>
                              <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber text-on-amber text-[9px] uppercase font-bold shrink-0">
                                <span>Open ↗</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </span>
                            </a>
                            {trailingPunct}
                          </React.Fragment>
                        );
                      }
                      return <span key={pIdx}>{part}</span>;
                    });
                  })()}
                </div>
              )}
            </div>

            {/* Outbound link footer */}
            <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs gap-2">
              <span className="text-[10px] font-mono text-ink-dim truncate max-w-[200px]">
                {ref.category}
              </span>
              {ref.url ? (
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-subtle hover:bg-amber text-amber hover:text-on-amber font-mono text-xs font-bold transition border border-amber/30 shadow-sm"
                >
                  <span>Access Primary Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(ref.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-surface hover:bg-bg-hover text-ink-muted hover:text-ink-primary font-mono text-[11px] transition border border-hairline"
                >
                  <span>Search Literature</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center text-xs text-ink-dim font-mono rounded-2xl bg-bg-panel border border-hairline">
          No references match your selected filters.
        </div>
      )}
    </div>
  );
}
