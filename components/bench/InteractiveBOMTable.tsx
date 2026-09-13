"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { BOMItem } from "@/lib/types";
import { Search, Filter, Layers, ExternalLink, ArrowRight, CheckCircle2, ShoppingCart, Wrench } from "lucide-react";

interface InteractiveBOMTableProps {
  projectSlug: string;
  items: BOMItem[];
}

export function InteractiveBOMTable({ projectSlug, items }: InteractiveBOMTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>("all");
  const [selectedMakeBuy, setSelectedMakeBuy] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<BOMItem | null>(null);

  // Extract unique subsystems
  const subsystems = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.subsystem) set.add(i.subsystem);
    });
    return Array.from(set).sort();
  }, [items]);

  // Filtered items
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubsystem =
        selectedSubsystem === "all" || item.subsystem === selectedSubsystem;

      const matchesMakeBuy =
        selectedMakeBuy === "all" ||
        (selectedMakeBuy === "make" && item.makeOrBuy.toLowerCase().startsWith("make")) ||
        (selectedMakeBuy === "buy" && item.makeOrBuy.toLowerCase().startsWith("buy")) ||
        (selectedMakeBuy === "contract" && item.makeOrBuy.toLowerCase().includes("contract"));

      return matchesSearch && matchesSubsystem && matchesMakeBuy;
    });
  }, [items, searchQuery, selectedSubsystem, selectedMakeBuy]);

  // Statistics
  const stats = useMemo(() => {
    let make = 0;
    let buy = 0;
    let contract = 0;
    items.forEach((i) => {
      const mb = i.makeOrBuy.toLowerCase();
      if (mb.startsWith("make")) make++;
      else if (mb.startsWith("buy")) buy++;
      else if (mb.includes("contract")) contract++;
    });
    return { total: items.length, make, buy, contract };
  }, [items]);

  const cardStyle = { background: 'var(--bg-panel)', border: '1px solid var(--border)' };
  const inputStyle = { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink-primary)' };
  const selectStyle = { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink-secondary)' };

  // Resolve chapter link from packageRef e.g. "05, 09, 10" -> "05-vessel-chamber-agitator-and-materials"
  const getChapterSlugFromRef = (refStr: string) => {
    const firstRef = refStr.split(",")[0].trim();
    const chapterMap: Record<string, string> = {
      "01": "01-beginner-foundations-and-glossary",
      "02": "02-physics-and-thermodynamics",
      "03": "03-hosokawa-afd-vs-generic-lyophilizers",
      "04": "04-system-architecture-and-subsystems",
      "05": "05-vessel-chamber-agitator-and-materials",
      "06": "06-refrigeration-vacuum-and-condenser-systems",
      "07": "07-cip-sip-sealing-insulation-utilities",
      "08": "08-instrumentation-controls-electrical-structural",
      "09": "09-safety-and-hazard-analysis",
      "10": "10-materials-fabrication-tolerances-workshop-vs-purchased",
      "11": "11-design-calculations-and-sizing-methodology",
      "12": "12-bill-of-materials-and-system-breakdown",
      "13": "13-drawings-and-schematics-to-create",
      "14": "14-validation-qualification-and-gmp-compliance",
      "15": "15-commissioning-test-plan",
      "16": "16-build-roadmap-prototype-to-pharma-capable",
      "17": "17-maintenance-and-troubleshooting",
      "18": "18-references-and-source-list",
    };
    return chapterMap[firstRef] || "12-bill-of-materials-and-system-breakdown";
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl" style={cardStyle}>
          <div className="text-xs font-mono uppercase" style={{ color: 'var(--ink-dim)' }}>Total Components</div>
          <div className="text-2xl font-bold font-mono mt-1" style={{ color: 'var(--ink-primary)' }}>{stats.total}</div>
          <div className="text-[10px]" style={{ color: 'var(--ink-muted)' }}>Across 17 Subsystems</div>
        </div>

        <div className="p-4 rounded-xl" style={cardStyle}>
          <div className="text-xs font-mono uppercase flex items-center gap-1.5" style={{ color: 'var(--ink-dim)' }}>
            <Wrench className="w-3.5 h-3.5" style={{ color: 'var(--amber)' }} /> Make in Workshop
          </div>
          <div className="text-2xl font-bold font-mono mt-1" style={{ color: 'var(--amber-bright)' }}>{stats.make}</div>
          <div className="text-[10px]" style={{ color: 'var(--ink-muted)' }}>Machined / Welded / Assembled</div>
        </div>

        <div className="p-4 rounded-xl" style={cardStyle}>
          <div className="text-xs font-mono uppercase flex items-center gap-1.5" style={{ color: 'var(--ink-dim)' }}>
            <ShoppingCart className="w-3.5 h-3.5" style={{ color: 'var(--cryo)' }} /> Commercial Off-The-Shelf
          </div>
          <div className="text-2xl font-bold font-mono mt-1" style={{ color: 'var(--cryo)' }}>{stats.buy}</div>
          <div className="text-[10px]" style={{ color: 'var(--ink-muted)' }}>Valves, Pumps, Sensors, PLC</div>
        </div>

        <div className="p-4 rounded-xl" style={cardStyle}>
          <div className="text-xs font-mono uppercase" style={{ color: 'var(--ink-dim)' }}>Contract Fabricate</div>
          <div className="text-2xl font-bold font-mono mt-1" style={{ color: 'var(--ink-primary)' }}>{stats.contract}</div>
          <div className="text-[10px]" style={{ color: 'var(--ink-muted)' }}>Pressure boundary / Electropolish</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between" style={cardStyle}>
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-dim)' }} />
          <input
            type="text"
            placeholder="Search items, specs, standards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl pl-9 pr-3 py-2 text-xs font-mono outline-none transition"
            style={{ ...inputStyle, '::placeholder': { color: 'var(--ink-dim)' } } as React.CSSProperties}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Subsystem Select */}
          <select
            value={selectedSubsystem}
            onChange={(e) => setSelectedSubsystem(e.target.value)}
            className="text-xs rounded-xl px-3 py-2 font-mono outline-none cursor-pointer"
            style={selectStyle}
          >
            <option value="all">All Subsystems ({subsystems.length})</option>
            {subsystems.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {/* Make / Buy Filter Buttons */}
          <div className="flex items-center gap-1 p-1 rounded-xl text-xs font-mono" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            {["all", "make", "buy", "contract"].map((mb) => (
              <button
                key={mb}
                onClick={() => setSelectedMakeBuy(mb)}
                className="px-2.5 py-1 rounded-lg capitalize transition font-mono text-xs"
                style={selectedMakeBuy === mb ? {
                  background: 'var(--amber-subtle)',
                  color: 'var(--amber-bright)',
                  border: '1px solid color-mix(in srgb, var(--amber) 35%, transparent)',
                  fontWeight: '700',
                } : {
                  color: 'var(--ink-muted)',
                  border: '1px solid transparent',
                }}
              >
                {mb}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl overflow-hidden shadow-xl" style={cardStyle}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-[11px] font-mono uppercase" style={{ borderBottom: '1px solid var(--border)', background: 'var(--table-header-bg)', color: 'var(--ink-dim)' }}>
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4">Subsystem & Item</th>
                <th className="py-3 px-4 hidden md:table-cell">Function / Engineering Notes</th>
                <th className="py-3 px-4 w-32">Source / Standard</th>
                <th className="py-3 px-4 w-28">Make / Buy</th>
                <th className="py-3 px-4 w-24 text-right">Chapter</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {filtered.map((item, idx) => {
                const isSelected = selectedItem?.id === item.id;
                const chapterSlug = getChapterSlugFromRef(item.packageRef);

                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(isSelected ? null : item)}
                    className="transition cursor-pointer"
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: isSelected
                        ? 'var(--amber-subtle)'
                        : idx % 2 === 1
                        ? 'var(--table-stripe)'
                        : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--amber)' : '3px solid transparent',
                    }}
                  >
                    <td className="py-3 px-4 text-[11px]" style={{ color: 'var(--ink-dim)' }}>{item.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-sans font-semibold text-xs" style={{ color: 'var(--ink-primary)' }}>
                        {item.item}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--ink-dim)' }}>{item.subsystem}</div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell font-sans text-xs leading-relaxed max-w-xs" style={{ color: 'var(--ink-secondary)' }}>
                      {item.notes}
                    </td>
                    <td className="py-3 px-4 text-[11px]" style={{ color: 'var(--ink-muted)' }}>{item.source || "—"}</td>
                    <td className="py-3 px-4">
                      <span
                        className="inline-block text-[10px] px-2 py-0.5 rounded"
                        style={item.makeOrBuy.toLowerCase().startsWith("make") ? {
                          background: 'var(--amber-subtle)',
                          border: '1px solid color-mix(in srgb, var(--amber) 35%, transparent)',
                          color: 'var(--amber-bright)',
                        } : item.makeOrBuy.toLowerCase().startsWith("buy") ? {
                          background: 'var(--cryo-subtle)',
                          border: '1px solid color-mix(in srgb, var(--cryo) 35%, transparent)',
                          color: 'var(--cryo)',
                        } : {
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border)',
                          color: 'var(--ink-secondary)',
                        }}
                      >
                        {item.makeOrBuy.split("(")[0].trim()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/${projectSlug}/${chapterSlug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] hover:underline"
                        style={{ color: 'var(--amber)' }}
                        title={`Jump to Chapter ${item.packageRef}`}
                      >
                        <span>Ch {item.packageRef.split(",")[0].trim()}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs font-mono" style={{ color: 'var(--ink-dim)' }}>
            No BOM items match current filters.
          </div>
        )}
      </div>

      {/* Item Detail Inspector Modal / Drawer */}
      {selectedItem && (
        <div className="p-5 rounded-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ background: 'var(--bg)', border: '1px solid color-mix(in srgb, var(--amber) 45%, transparent)' }}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-amber-signal font-bold">
                Item #{selectedItem.id} Details
              </span>
              <span className="text-[10px] font-mono text-ink-dim">
                {selectedItem.subsystem}
              </span>
            </div>
            <div className="text-base font-bold text-ink-primary">{selectedItem.item}</div>
            <p className="text-xs text-ink-secondary">{selectedItem.notes}</p>
            <div className="text-[11px] font-mono text-ink-muted pt-1">
              Source Standard: <span className="text-ink-primary">{selectedItem.source}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/${projectSlug}/${getChapterSlugFromRef(selectedItem.packageRef)}`}
              className="px-4 py-2 rounded-xl bg-amber-signal text-obsidian font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-amber-bright transition"
            >
              <span>View in Dossier Ch {selectedItem.packageRef}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setSelectedItem(null)}
              className="px-3 py-2 rounded-xl bg-white/5 text-ink-muted hover:text-ink-primary text-xs font-mono"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
