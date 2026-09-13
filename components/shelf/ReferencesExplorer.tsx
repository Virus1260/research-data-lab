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
      <div className="bg-[#0D0F12] border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-ink-dim absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patents, standards, papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#08090A] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-ink-primary placeholder:text-ink-dim font-mono outline-none focus:border-amber-signal/50 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#08090A] border border-white/10 text-xs text-ink-secondary rounded-xl px-3 py-2 font-mono outline-none cursor-pointer max-w-xs truncate"
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
            className="bg-[#08090A] border border-white/10 text-xs text-ink-secondary rounded-xl px-3 py-2 font-mono outline-none cursor-pointer"
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
            className="p-5 rounded-2xl bg-[#0D0F12] border border-white/10 hover:border-white/20 transition flex flex-col justify-between space-y-4 shadow-lg group"
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
                        className="bg-white/5 px-1.5 py-0.5 rounded text-amber-bright font-bold"
                      >
                        Ch {ch}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <h3 className="text-sm font-bold text-ink-primary group-hover:text-white transition leading-snug">
                {ref.title}
              </h3>

              {ref.description && (
                <p className="text-xs text-ink-secondary leading-relaxed">
                  {ref.description}
                </p>
              )}
            </div>

            {/* Outbound link footer */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-ink-dim truncate max-w-[240px]">
                {ref.category}
              </span>
              {ref.url ? (
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-signal hover:text-amber-bright transition"
                >
                  <span>Access Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-[10px] font-mono text-ink-dim">Standard Reference</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center text-xs text-ink-dim font-mono rounded-2xl bg-[#0D0F12] border border-white/5">
          No references match your selected filters.
        </div>
      )}
    </div>
  );
}
