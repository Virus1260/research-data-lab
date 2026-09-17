"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Cpu, Table, Bookmark, X, ArrowRight, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";

interface PaletteItem {
  id: string;
  category: "Chapters" | "Simulators" | "Data" | "Navigation";
  title: string;
  subtitle: string;
  href: string;
}

export function CommandPalette({ projectSlug = "hosokawa-afd-freeze-dryer" }: { projectSlug?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const items: PaletteItem[] = [
    // Nav
    {
      id: "archive",
      category: "Navigation",
      title: "The Archive",
      subtitle: "Return to project repository gallery",
      href: "/",
    },
    {
      id: "lab",
      category: "Navigation",
      title: "The Lab (Project Hub)",
      subtitle: "Hero finding, act consoles & progress rail",
      href: `/${projectSlug}`,
    },
    {
      id: "bom",
      category: "Data",
      title: "The Bench (Interactive BOM)",
      subtitle: "74-line parts explorer across 17 subsystems",
      href: `/${projectSlug}/bom`,
    },
    {
      id: "refs",
      category: "Data",
      title: "The Shelf (Sources & Literature)",
      subtitle: "34 cited references filterable by chapter",
      href: `/${projectSlug}/references`,
    },

    // Simulators
    {
      id: "sim-phase",
      category: "Simulators",
      title: "Water Phase Diagram Explorer",
      subtitle: "Clausius–Clapeyron P–T plot & sublimation line (Ch 02)",
      href: `/${projectSlug}/02-physics-and-thermodynamics`,
    },
    {
      id: "sim-compare",
      category: "Simulators",
      title: "AFD vs Generic Shelf Lyophilizer",
      subtitle: "Architecture morphing comparison (Ch 03)",
      href: `/${projectSlug}/03-hosokawa-afd-vs-generic-lyophilizers`,
    },
    {
      id: "sim-cycle",
      category: "Simulators",
      title: "Freeze-Drying Cycle Profile Scrubber",
      subtitle: "36-hour interactive process stage timeline (Ch 04)",
      href: `/${projectSlug}/04-system-architecture-and-subsystems`,
    },
    {
      id: "sim-3d",
      category: "Simulators",
      title: "3D Conical Vessel Cross-Section",
      subtitle: "Interactive 3D layer peeler & agitator clearance (Ch 05)",
      href: `/${projectSlug}/05-vessel-chamber-agitator-and-materials`,
    },
    {
      id: "sim-pump",
      category: "Simulators",
      title: "Vacuum Pump-Down Simulator",
      subtitle: "Exponential pump-down curve & tau constant (Ch 06)",
      href: `/${projectSlug}/06-refrigeration-vacuum-and-condenser-systems`,
    },
    {
      id: "sim-pirani",
      category: "Simulators",
      title: "Comparative Pressure Endpoint Detector",
      subtitle: "Pirani vs Capacitance manometer convergence (Ch 06)",
      href: `/${projectSlug}/06-refrigeration-vacuum-and-condenser-systems`,
    },
    {
      id: "sim-cascade",
      category: "Simulators",
      title: "Refrigeration Cascade Schematic",
      subtitle: "Dual refrigerant loops (-65°C cryogenic) (Ch 06)",
      href: `/${projectSlug}/06-refrigeration-vacuum-and-condenser-systems`,
    },
    {
      id: "sim-subrate",
      category: "Simulators",
      title: "Sublimation Rate & Heat Duty Calculator",
      subtitle: "Live Q = U · A · ΔT heat flux equations (Ch 11)",
      href: `/${projectSlug}/11-design-calculations-and-sizing-methodology`,
    },
    {
      id: "sim-refrig",
      category: "Simulators",
      title: "Refrigeration Load & Cooling Rate Calculator",
      subtitle: "Patent 0.1–10°C/min compliance check (Ch 11)",
      href: `/${projectSlug}/11-design-calculations-and-sizing-methodology`,
    },

    // Key Chapters
    {
      id: "ch-01",
      category: "Chapters",
      title: "Ch 01: Beginner Foundations & Glossary",
      subtitle: "Foundations Act • Sublimation vocabulary",
      href: `/${projectSlug}/01-beginner-foundations-and-glossary`,
    },
    {
      id: "ch-02",
      category: "Chapters",
      title: "Ch 02: Physics & Thermodynamics",
      subtitle: "Foundations Act • Phase diagrams & heat transfer",
      href: `/${projectSlug}/02-physics-and-thermodynamics`,
    },
    {
      id: "ch-03",
      category: "Chapters",
      title: "Ch 03: Hosokawa AFD vs Generic Lyophilizers",
      subtitle: "The Machine Act • Hero finding & patent analysis (Narrated)",
      href: `/${projectSlug}/03-hosokawa-afd-vs-generic-lyophilizers`,
    },
    {
      id: "ch-04",
      category: "Chapters",
      title: "Ch 04: System Architecture & Subsystems",
      subtitle: "The Machine Act • Process cycle profiles",
      href: `/${projectSlug}/04-system-architecture-and-subsystems`,
    },
    {
      id: "ch-05",
      category: "Chapters",
      title: "Ch 05: Vessel, Chamber, Agitator & Materials",
      subtitle: "The Machine Act • Conical geometry & tolerances",
      href: `/${projectSlug}/05-vessel-chamber-agitator-and-materials`,
    },
    {
      id: "ch-06",
      category: "Chapters",
      title: "Ch 06: Refrigeration, Vacuum & Condenser Systems",
      subtitle: "The Machine Act • Cascade cooling & dual gauges",
      href: `/${projectSlug}/06-refrigeration-vacuum-and-condenser-systems`,
    },
    {
      id: "ch-11",
      category: "Chapters",
      title: "Ch 11: Design Calculations & Sizing Methodology",
      subtitle: "Build It Act • Engineering math & sizing equations",
      href: `/${projectSlug}/11-design-calculations-and-sizing-methodology`,
    },
    {
      id: "ch-12",
      category: "Chapters",
      title: "Ch 12: Bill of Materials & System Breakdown",
      subtitle: "Build It Act • 17 subsystems architecture",
      href: `/${projectSlug}/12-bill-of-materials-and-system-breakdown`,
    },
    {
      id: "ch-16",
      category: "Chapters",
      title: "Ch 16: Build Roadmap: Prototype to Pharma-Capable",
      subtitle: "Build It Act • Staged engineering milestones",
      href: `/${projectSlug}/16-build-roadmap-prototype-to-pharma-capable`,
    },
    {
      id: "ch-18",
      category: "Chapters",
      title: "Ch 18: References & Source List",
      subtitle: "Make It Real Act • 34 primary patents & standards",
      href: `/${projectSlug}/18-references-and-source-list`,
    },
  ];

  // Listen for Ctrl+K, /, and theme toggle shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable);

      // Search palette: Ctrl+K, Meta+K, or "/"
      if (
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") ||
        (!isInput && e.key === "/")
      ) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // Theme toggle: Ctrl+Shift+L, Alt+T, or 'T' (when not in input)
      if (
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") ||
        (e.altKey && e.key.toLowerCase() === "t") ||
        (!isInput && e.key.toLowerCase() === "t" && !e.ctrlKey && !e.metaKey && !e.altKey)
      ) {
        e.preventDefault();
        toggleTheme();
        return;
      }

      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTheme]);

  const filtered = query.trim()
    ? items.filter(
        (i) =>
          i.title.toLowerCase().includes(query.toLowerCase()) ||
          i.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          i.category.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  const navigateTo = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm flex items-start justify-center pt-24 px-4">
      <div className="bg-bg-panel border border-hairline-strong rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3 border-b border-hairline gap-3">
          <Search className="w-5 h-5 text-amber-signal" />
          <input
            type="text"
            autoFocus
            placeholder="Search chapters, simulators, BOM items... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-ink-primary placeholder:text-ink-dim outline-none font-mono"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded text-ink-dim hover:text-ink-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-ink-muted font-mono">
              No matching research items found for "{query}".
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.href)}
                className="w-full text-left p-3 rounded-xl hover:bg-bg-hover transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-bg-hover text-ink-muted group-hover:text-amber-signal group-hover:bg-amber-signal/10 transition">
                    {item.category === "Chapters" && <BookOpen className="w-4 h-4" />}
                    {item.category === "Simulators" && <Cpu className="w-4 h-4" />}
                    {item.category === "Data" && <Table className="w-4 h-4" />}
                    {item.category === "Navigation" && <Bookmark className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink-primary group-hover:text-amber-bright transition">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-ink-muted">{item.subtitle}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-ink-dim uppercase border border-hairline px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-dim group-hover:text-amber-signal opacity-0 group-hover:opacity-100 transition" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2 bg-bg-inset border-t border-hairline flex items-center justify-between text-[11px] text-ink-dim font-mono">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-1.5 h-9 px-2 rounded-lg border border-hairline text-ink-secondary hover:text-ink-primary hover:bg-bg-hover"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {theme === "dark" ? "Light lab" : "Dark lab"}
          </button>
          <span>ESC to close • Ctrl+K or / anywhere • T for theme</span>
        </div>
      </div>
    </div>
  );
}
