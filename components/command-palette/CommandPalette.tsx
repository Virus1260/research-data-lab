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
      subtitle: "Clausius–Clapeyron P–T plot & sublimation line (Ch 01)",
      href: `/${projectSlug}/01-physics-and-thermodynamics`,
    },
    {
      id: "sim-compare",
      category: "Simulators",
      title: "AFD vs Generic Shelf Lyophilizer",
      subtitle: "Architecture morphing comparison (Ch 02)",
      href: `/${projectSlug}/02-hosokawa-afd-vs-generic-lyophilizers`,
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
      subtitle: "Exponential pump-down curve & tau constant (Ch 12)",
      href: `/${projectSlug}/12-refrigeration-vacuum-and-condenser-systems`,
    },
    {
      id: "sim-pirani",
      category: "Simulators",
      title: "Comparative Pressure Endpoint Detector",
      subtitle: "Pirani vs Capacitance manometer convergence (Ch 12)",
      href: `/${projectSlug}/12-refrigeration-vacuum-and-condenser-systems`,
    },
    {
      id: "sim-cascade",
      category: "Simulators",
      title: "Refrigeration Cascade Schematic",
      subtitle: "Dual refrigerant loops (-85°C cryogenic) (Ch 12)",
      href: `/${projectSlug}/12-refrigeration-vacuum-and-condenser-systems`,
    },
    {
      id: "sim-subrate",
      category: "Simulators",
      title: "Sublimation Rate & Heat Duty Calculator",
      subtitle: "Live Q = U · A · ΔT heat flux equations (Ch 07)",
      href: `/${projectSlug}/07-design-calculations-and-sizing-methodology`,
    },
    {
      id: "sim-refrig",
      category: "Simulators",
      title: "Refrigeration Load & Cooling Rate Calculator",
      subtitle: "Patent 0.1–10°C/min compliance check (Ch 07)",
      href: `/${projectSlug}/07-design-calculations-and-sizing-methodology`,
    },

    // Key Chapters
    {
      id: "ch-01",
      category: "Chapters",
      title: "Ch 01: Physics & Thermodynamics",
      subtitle: "Foundations Act • Phase diagrams & Knudsen diffusion",
      href: `/${projectSlug}/01-physics-and-thermodynamics`,
    },
    {
      id: "ch-02",
      category: "Chapters",
      title: "Ch 02: Hosokawa AFD vs Generic Lyophilizers",
      subtitle: "Foundations Act • Hero finding & competitor benchmark (Narrated)",
      href: `/${projectSlug}/02-hosokawa-afd-vs-generic-lyophilizers`,
    },
    {
      id: "ch-03",
      category: "Chapters",
      title: "Ch 03: Process Flowsheets (BFD & PFD)",
      subtitle: "Foundations Act • Canonical flowsheet & mass balances",
      href: `/${projectSlug}/03-process-flowsheets-bfd-and-pfd`,
    },
    {
      id: "ch-04",
      category: "Chapters",
      title: "Ch 04: System Architecture & Subsystems",
      subtitle: "Foundations Act • 17-subsystem skid architecture",
      href: `/${projectSlug}/04-system-architecture-and-subsystems`,
    },
    {
      id: "ch-05",
      category: "Chapters",
      title: "Ch 05: Vessel, Chamber, Agitator & Materials",
      subtitle: "Mechanical Act • Conical geometry & cantilever drive",
      href: `/${projectSlug}/05-vessel-chamber-agitator-and-materials`,
    },
    {
      id: "ch-06",
      category: "Chapters",
      title: "Ch 06: Materials, Tolerances & Welding",
      subtitle: "Mechanical Act • ASME Sec VIII weld preps & Ra < 0.4 um",
      href: `/${projectSlug}/06-materials-fabrication-tolerances-and-welding`,
    },
    {
      id: "ch-07",
      category: "Chapters",
      title: "Ch 07: Design Calculations & Sizing Methodology",
      subtitle: "Mechanical Act • Engineering math & torque equations",
      href: `/${projectSlug}/07-design-calculations-and-sizing-methodology`,
    },
    {
      id: "ch-08",
      category: "Chapters",
      title: "Ch 08: Vessel Sizing Suite & Parametric Tool",
      subtitle: "Mechanical Act • Interactive sizing tool (5L to 500L)",
      href: `/${projectSlug}/08-vessel-sizing-suite-and-parametric-tool`,
    },
    {
      id: "ch-09",
      category: "Chapters",
      title: "Ch 09: CAD SolidWorks & Nozzle Schedule",
      subtitle: "Mechanical Act • Nozzle schedule N1-N18 & 3D hierarchy",
      href: `/${projectSlug}/09-cad-solidworks-assembly-and-nozzle-schedule`,
    },
    {
      id: "ch-10",
      category: "Chapters",
      title: "Ch 10: Drawings & Schematics to Create",
      subtitle: "Mechanical Act • Shop GA blueprints & cross sections",
      href: `/${projectSlug}/10-drawings-and-schematics-to-create`,
    },
    {
      id: "ch-11",
      category: "Chapters",
      title: "Ch 11: Bill of Materials & System Breakdown",
      subtitle: "Mechanical Act • 75-component master BOM",
      href: `/${projectSlug}/11-bill-of-materials-and-system-breakdown`,
    },
    {
      id: "ch-12",
      category: "Chapters",
      title: "Ch 12: Refrigeration, Vacuum & Condenser Systems",
      subtitle: "Process Skids Act • Cascade cooling & dual gauges",
      href: `/${projectSlug}/12-refrigeration-vacuum-and-condenser-systems`,
    },
    {
      id: "ch-15",
      category: "Chapters",
      title: "Ch 15: Piping & Instrumentation Diagram (P&ID)",
      subtitle: "Process Skids Act • Complete ISA-5.1 P&ID layout",
      href: `/${projectSlug}/15-piping-and-instrumentation-diagram`,
    },
    {
      id: "ch-18",
      category: "Chapters",
      title: "Ch 18: Batch Sequence & Operating Cycle",
      subtitle: "Controls Act • Automated ISA-88 recipe state machine",
      href: `/${projectSlug}/18-batch-sequence-and-operating-cycle`,
    },
    {
      id: "ch-19",
      category: "Chapters",
      title: "Ch 19: Safety Interlocks & I/O Schedule",
      subtitle: "Controls Act • SIL-2 matrix & discrete/analog channels",
      href: `/${projectSlug}/19-interlocks-cause-effect-matrix-and-io-list`,
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
