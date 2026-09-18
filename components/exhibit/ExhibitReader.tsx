"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { ChapterMeta, AudioManifest } from "@/lib/types";
import { KatexEquation } from "./KatexEquation";
import { ExportModal } from "./ExportModal";
import {
  Volume2,
  VolumeX,
  Headphones,
  Play,
  Pause,
  List,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sigma,
  Calculator,
  Sliders,
  Download,
  ExternalLink,
} from "lucide-react";
import { useNarrator } from "@/components/narrator/NarratorContext";
import { SystemArchitectureFlowChart } from "@/components/diagrams/SystemArchitectureFlowChart";
import { AutomationHierarchyChart } from "@/components/diagrams/AutomationHierarchyChart";
import { BatchStateTransitionChart } from "@/components/diagrams/BatchStateTransitionChart";
import { IsaTagAnatomyChart } from "@/components/diagrams/IsaTagAnatomyChart";
import { FullBatchProcedureChart } from "@/components/diagrams/FullBatchProcedureChart";
import { Isa88HierarchyChart } from "@/components/diagrams/Isa88HierarchyChart";
import { EngineeringDiagramsGallery } from "@/components/diagrams/EngineeringDiagramsGallery";
import { StickyMarkdownTable } from "@/components/tables/StickyMarkdownTable";
import {
  SublimationHeatDutyWorkbench,
  JacketSurfaceAreaWorkbench,
  FreezingRefrigerationLoadWorkbench,
  VacuumPumpdownWorkbench,
  ClausiusClapeyronWorkbench,
  PikalHeatMassWorkbench,
  MassTransferResistanceWorkbench,
  SublimationMassFlowWorkbench,
  IdealGasVacuumVolumeWorkbench,
  SublimationTheoreticalFormulaCard,
  UniversalInteractiveEquationCard,
} from "@/components/exhibit/InteractiveEquationWorkbench";

interface ExhibitReaderProps {
  chapter: ChapterMeta;
  projectSlug: string;
  prevChapter?: ChapterMeta | null;
  nextChapter?: ChapterMeta | null;
  audioUrl?: string | null;
  manifest?: AudioManifest | null;
  allChapters?: ChapterMeta[];
}

/**
 * Interactive link component that dynamically represents any reference or URL
 * as readable text accompanied by a clickable "Open in new tab" interactive button badge.
 */
function InteractiveUrlLink({
  url,
  label,
  className = "",
}: {
  url: string;
  label?: string;
  className?: string;
}) {
  let displayLabel = label;
  if (!displayLabel) {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      const host = parsed.hostname.replace(/^www\./, "");
      const path =
        parsed.pathname.length > 32
          ? parsed.pathname.slice(0, 30) + "…"
          : parsed.pathname === "/"
          ? ""
          : parsed.pathname;
      displayLabel = `${host}${path}`;
    } catch {
      displayLabel = url.length > 42 ? url.slice(0, 40) + "…" : url;
    }
  }

  const targetHref = url.startsWith("http") ? url : `https://${url}`;

  return (
    <a
      href={targetHref}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 my-0.5 mx-1 rounded-lg text-xs font-mono font-medium transition-all duration-200 group border shadow-xs align-middle hover:shadow-md hover:-translate-y-0.5 ${className}`}
      style={{
        background: "color-mix(in srgb, var(--amber-subtle) 70%, var(--bg-surface))",
        borderColor: "color-mix(in srgb, var(--amber) 40%, var(--border))",
        color: "var(--ink-primary)",
      }}
      title={`Open external reference: ${targetHref}`}
    >
      <span className="truncate max-w-[220px] sm:max-w-md group-hover:text-amber underline decoration-amber/30 group-hover:decoration-amber transition-colors">
        {displayLabel}
      </span>
      <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all duration-150 shrink-0"
        style={{
          background: "var(--amber)",
          color: "var(--on-amber)",
        }}
      >
        <span>Open ↗</span>
        <ExternalLink className="w-2.5 h-2.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </span>
    </a>
  );
}

// Convert known textual engineering formulas to LaTeX
function formulaToLatex(formula: string): string | null {
  const t = formula.trim();
  if (t.includes("dP/dT = L / (T·Δv)") || t.includes("dP/dT = L / (T.Δv)") || t.includes("dP/dT")) {
    return "\\frac{dP}{dT} = \\frac{L}{T \\cdot \\Delta v}";
  }
  if (t.includes("Q = Kv · Av · (Ts − Tb)") || t.includes("Q = Kv . Av . (Ts - Tb)")) {
    return "Q = K_v \\cdot A_v \\cdot (T_s - T_b)";
  }
  if (t.includes("dm/dt = Q / ΔHs") || t.includes("dm/dt = Q / dHs")) {
    return "\\frac{dm}{dt} = \\frac{Q}{\\Delta H_s}";
  }
  if (t.includes("dm/dt = (Ap / Rp) · (Pice − Pch)") || t.includes("(Ap / Rp)")) {
    return "\\frac{dm}{dt} = \\frac{A_p}{R_p} \\cdot (P_{ice} - P_{ch})";
  }
  if (t.includes("Q = (dm/dt) × ΔHs") || t.includes("Q = (dm/dt) x dHs")) {
    return "Q = \\dot{m} \\cdot \\Delta H_s";
  }
  if (t.includes("Q = U × A × ΔT") || t.includes("A = Q / (U × ΔT)")) {
    return "Q = U \\cdot A \\cdot \\Delta T \\implies A = \\frac{Q}{U \\cdot \\Delta T}";
  }
  if (t.includes("Kn = λ / Lc") || t.includes("Kn = lambda / Lc")) {
    return "Kn = \\frac{\\lambda}{L_c}";
  }
  if (t.includes("P(t) =") && t.includes("exp")) {
    return "P(t) = P_{ult} + (P_0 - P_{ult}) \\cdot \\exp\\left(-\\frac{S \\cdot t}{V}\\right)";
  }
  if (t.includes("Q_cond = ṁ · ΔH_sub") || t.includes("Q_cond")) {
    return "Q_{cond} = \\dot{m} \\cdot \\Delta H_{sub}";
  }
  if (t.includes("R_p = (P_sub") || t.includes("R_p = (Pice")) {
    return "R_p = \\frac{P_{sub} - P_{ch}}{\\dot{m} / A_p}";
  }
  if (t.includes("Q_total =") || t.includes("Q_total") || t.includes("ΔH_fusion")) {
    return "Q_{total} = m \\cdot c_{p,liq} \\cdot \\Delta T_{cool} + m_{water} \\cdot \\Delta H_{fus} + m \\cdot c_{p,ice} \\cdot \\Delta T_{freeze}";
  }
  if (t.includes("t = (V / S) × ln(P1 / P2)") || t.includes("t = (V / S)") || (t.includes("ln(P1 / P2)") && t.includes("V / S"))) {
    return "t = \\frac{V}{S} \\cdot \\ln\\left(\\frac{P_1}{P_2}\\right)";
  }
  if (t.includes("dm/dt = Ap · (Pice − Pchamber) / Rp") || t.includes("dm/dt = Ap . (Pice - Pchamber)")) {
    return "\\frac{dm}{dt} = \\frac{A_p \\cdot (P_{ice} - P_{chamber})}{R_p}";
  }
  return null;
}

export function ExhibitReader({
  chapter,
  projectSlug,
  prevChapter,
  nextChapter,
  audioUrl,
  manifest,
  allChapters = [],
}: ExhibitReaderProps) {
  const [mounted, setMounted] = useState(false);
  const {
    loadTrack,
    togglePlay,
    currentTrack,
    isPlaying,
    isMinimized,
    selectedPersona,
    voiceStudioOpen,
    transcriptOpen,
    setVoiceStudioOpen,
    activeSpokenPhrase,
    activeCue,
    syncScroll,
    syncToSelection,
  } = useNarrator();
  const [tocOpen, setTocOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [selectionPopupPos, setSelectionPopupPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Floating selection boundary sync popover listener
  useEffect(() => {
    if (!mounted) return;

    const handleMouseUp = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelectionPopupPos(null);
        return;
      }
      const text = sel.toString().trim();
      if (text.length < 3) {
        setSelectionPopupPos(null);
        return;
      }

      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect && rect.width > 0 && rect.height > 0) {
          setSelectionPopupPos({
            top: Math.max(12, rect.top - 46),
            left: Math.max(12, rect.left + rect.width / 2 - 110),
          });
        }
      } catch {
        setSelectionPopupPos(null);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest(".narrator-selection-pill")) return;
      setSelectionPopupPos(null);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [mounted]);

  // Intersection observer for TOC highlighting
  useEffect(() => {
    if (!mounted) return;
    const headingElements = document.querySelectorAll("h1[id], h2[id], h3[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-10% 0% -80% 0%" }
    );
    headingElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [chapter.content, mounted]);

  const isCurrentTrack = currentTrack?.slug === chapter.slug;
  const isThisPlaying = isCurrentTrack && isPlaying;

  // In-page speech highlighting & smooth auto-scroll for active narration
  useEffect(() => {
    if (!mounted) return;

    // Clean up previous highlights
    const prevHighlights = document.querySelectorAll(".narrator-active-highlight");
    prevHighlights.forEach((el) => el.classList.remove("narrator-active-highlight"));

    if (!isThisPlaying) return;

    // Target cue or phrase
    const targetText = (activeCue?.text || activeSpokenPhrase || "").trim().toLowerCase();
    if (!targetText || targetText.length < 4) return;

    const mainContainer = document.getElementById("monograph-reader-main");
    if (!mainContainer) return;

    // Find the paragraph, list item, or heading containing words from the spoken phrase
    const candidates = mainContainer.querySelectorAll("p, li, h1, h2, h3, blockquote");
    const searchWords = targetText
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);
    if (searchWords.length === 0) return;

    let bestMatch: Element | null = null;
    let highestScore = 0;

    for (const el of Array.from(candidates)) {
      const elText = (el.textContent || "").toLowerCase();
      let score = 0;
      for (const word of searchWords) {
        if (elText.includes(word)) score++;
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = el;
      }
    }

    if (bestMatch && highestScore >= Math.min(2, searchWords.length)) {
      bestMatch.classList.add("narrator-active-highlight");
      if (syncScroll) {
        bestMatch.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeSpokenPhrase, activeCue, isThisPlaying, syncScroll, mounted]);

  // Removed if (!mounted) return null; to enable full SSR rendering and eliminate layout shift

  const handlePlayNarration = () => {
    if (isThisPlaying) {
      togglePlay();
    } else if (currentTrack?.slug === chapter.slug) {
      togglePlay();
    } else {
      loadTrack(chapter.slug, chapter.title, audioUrl || "", manifest, chapter.content);
    }
  };

  // Enhanced markdown renderer with KaTeX, tables, and code blocks
  function renderMarkdown(content: string): React.ReactNode[] {
    const rawLines = content.split("\n");
    const lines = rawLines.map((l) => l.replace(/\r$/, ""));
    const elements: React.ReactNode[] = [];
    let i = 0;
    let key = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Blank line
      if (!line.trim()) {
        i++;
        continue;
      }

      // Custom Dynamic Interactive Diagram Tags
      if (
        line.trim() === "<SystemArchitectureFlowChart />" ||
        line.trim() === "<SystemArchitectureFlowChart/>" ||
        line.trim() === "::SystemArchitectureFlowChart"
      ) {
        elements.push(
          <div key={key++} className="my-6">
            <SystemArchitectureFlowChart />
          </div>
        );
        i++;
        continue;
      }

      if (
        line.trim() === "<AutomationHierarchyChart />" ||
        line.trim() === "<AutomationHierarchyChart/>" ||
        line.trim() === "::AutomationHierarchyChart"
      ) {
        elements.push(
          <div key={key++} className="my-6">
            <AutomationHierarchyChart />
          </div>
        );
        i++;
        continue;
      }

      if (
        line.trim() === "<BatchStateTransitionChart />" ||
        line.trim() === "<BatchStateTransitionChart/>" ||
        line.trim() === "::BatchStateTransitionChart"
      ) {
        elements.push(
          <div key={key++} className="my-6">
            <BatchStateTransitionChart />
          </div>
        );
        i++;
        continue;
      }

      if (
        line.trim() === "<IsaTagAnatomyChart />" ||
        line.trim() === "<IsaTagAnatomyChart/>" ||
        line.trim() === "::IsaTagAnatomyChart"
      ) {
        elements.push(
          <div key={key++} className="my-6">
            <IsaTagAnatomyChart />
          </div>
        );
        i++;
        continue;
      }

      if (
        line.trim() === "<FullBatchProcedureChart />" ||
        line.trim() === "<FullBatchProcedureChart/>" ||
        line.trim() === "::FullBatchProcedureChart"
      ) {
        elements.push(
          <div key={key++} className="my-6">
            <FullBatchProcedureChart />
          </div>
        );
        i++;
        continue;
      }

      if (
        line.trim() === "<Isa88HierarchyChart />" ||
        line.trim() === "<Isa88HierarchyChart/>" ||
        line.trim() === "::Isa88HierarchyChart"
      ) {
        elements.push(
          <div key={key++} className="my-6">
            <Isa88HierarchyChart />
          </div>
        );
        i++;
        continue;
      }

      if (
        line.trim() === "<EngineeringDiagramsGallery />" ||
        line.trim() === "<EngineeringDiagramsGallery/>" ||
        line.trim() === "::EngineeringDiagramsGallery"
      ) {
        elements.push(
          <div key={key++} className="my-6">
            <EngineeringDiagramsGallery />
          </div>
        );
        i++;
        continue;
      }

      if (
        line.trim() === "<IdealGasVacuumVolumeWorkbench />" ||
        line.trim() === "<IdealGasVacuumVolumeWorkbench/>" ||
        line.trim() === "::IdealGasVacuumVolumeWorkbench"
      ) {
        elements.push(
          <div key={key++} className="my-6">
            <IdealGasVacuumVolumeWorkbench />
          </div>
        );
        i++;
        continue;
      }

      if (
        line.trim() === "<MassTransferResistanceWorkbench />" ||
        line.trim() === "<MassTransferResistanceWorkbench/>" ||
        line.trim() === "::MassTransferResistanceWorkbench"
      ) {
        elements.push(
          <div key={key++} className="my-6">
            <MassTransferResistanceWorkbench />
          </div>
        );
        i++;
        continue;
      }

      if (
        line.trim() === "<SublimationMassFlowWorkbench />" ||
        line.trim() === "<SublimationMassFlowWorkbench/>" ||
        line.trim() === "::SublimationMassFlowWorkbench"
      ) {
        elements.push(
          <div key={key++} className="my-6">
            <SublimationMassFlowWorkbench />
          </div>
        );
        i++;
        continue;
      }

      // Single-line display equation: $$ ... $$
      if (line.trim().startsWith("$$") && line.trim().endsWith("$$") && line.trim().length > 4) {
        const expr = line.trim().slice(2, -2).trim();
        elements.push(
          <div key={key++} className="my-6">
            <UniversalInteractiveEquationCard latexFormula={expr} />
          </div>
        );
        i++;
        continue;
      }

      // Multi-line display equation block: $$ ... $$
      if (line.trim() === "$$" || (line.trim().startsWith("$$") && !line.trim().endsWith("$$"))) {
        const eqLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith("$$")) {
          eqLines.push(lines[i]);
          i++;
        }
        i++; // skip closing $$
        const expr = eqLines.join("\n").trim();
        elements.push(
          <div key={key++} className="my-6">
            <UniversalInteractiveEquationCard latexFormula={expr} />
          </div>
        );
        continue;
      }

      // Fenced code block or formula block
      if (line.startsWith("```")) {
        const lang = line.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```

        const fullBlock = codeLines.join("\n").trim();
        const latexFormula = formulaToLatex(fullBlock);

        // 1. Sublimation Heat Duty: Worked Numerical Solution vs. Theoretical Formula
        if (fullBlock.includes("dm/dt = 0.8 kg/h") && fullBlock.includes("631 W")) {
          elements.push(
            <div key={key++} className="my-6">
              <SublimationHeatDutyWorkbench />
            </div>
          );
          continue;
        }

        if (
          fullBlock.includes("Q = (dm/dt) × ΔHs") ||
          fullBlock.includes("Q = (dm/dt) x dHs")
        ) {
          elements.push(
            <div key={key++} className="my-6">
              <SublimationTheoreticalFormulaCard />
            </div>
          );
          continue;
        }

        // 2. Sublimation Mass Flow Rate from Heat Input
        if (
          fullBlock.includes("dm/dt = Q / ΔHs") ||
          fullBlock.includes("dm/dt = Q / dHs")
        ) {
          elements.push(
            <div key={key++} className="my-6">
              <SublimationMassFlowWorkbench />
            </div>
          );
          continue;
        }

        // 3. Mass Transfer Resistance through Dried Cake Layer (Tang & Pikal 2004)
        if (
          fullBlock.includes("dm/dt = Ap · (Pice − Pchamber) / Rp") ||
          fullBlock.includes("Pice − Pchamber") ||
          fullBlock.includes("Pice - Pchamber") ||
          (fullBlock.includes("Ap") && fullBlock.includes("Rp") && (fullBlock.includes("Pice") || fullBlock.includes("Pchamber")))
        ) {
          elements.push(
            <div key={key++} className="my-6">
              <MassTransferResistanceWorkbench />
            </div>
          );
          continue;
        }

        // 4. Ideal Gas Law / Deep Vacuum Volumetric Expansion
        if (
          fullBlock.includes("PV = nRT") ||
          fullBlock.includes("V = nRT/P") ||
          fullBlock.includes("13 million liters")
        ) {
          elements.push(
            <div key={key++} className="my-6">
              <IdealGasVacuumVolumeWorkbench />
            </div>
          );
          continue;
        }

        // 5. Jacket Heat-Transfer Surface Area Workbench
        if (
          fullBlock.includes("Q = U × A × ΔT") ||
          fullBlock.includes("A = Q / (U × ΔT)") ||
          (fullBlock.includes("Q = U . A . ΔT") && fullBlock.includes("A = Q / (U . ΔT)"))
        ) {
          elements.push(
            <div key={key++} className="my-6">
              <JacketSurfaceAreaWorkbench />
            </div>
          );
          continue;
        }

        // 6. Freezing-Stage 3-Step Refrigeration Load Workbench
        if (
          fullBlock.includes("Q1 (cool liquid") ||
          fullBlock.includes("Q_total = m × cp_liquid") ||
          (fullBlock.includes("Q1") && fullBlock.includes("Q2") && fullBlock.includes("4,476 kJ")) ||
          (fullBlock.includes("cp_liquid") && (fullBlock.includes("cp_ice") || fullBlock.includes("cp_solid")) && (fullBlock.includes("ΔHf") || fullBlock.includes("ΔH_fusion")))
        ) {
          elements.push(
            <div key={key++} className="my-6">
              <FreezingRefrigerationLoadWorkbench />
            </div>
          );
          continue;
        }

        // 7. Vacuum Pumpdown Evacuation Workbench
        if (
          fullBlock.includes("t = (V / S) × ln(P1 / P2)") ||
          (fullBlock.includes("t = (V / S)") && fullBlock.includes("ln("))
        ) {
          elements.push(
            <div key={key++} className="my-6">
              <VacuumPumpdownWorkbench />
            </div>
          );
          continue;
        }

        // 8. Clausius-Clapeyron Vapor Pressure Workbench
        if (
          fullBlock.includes("dP/dT = L / (T·Δv)") ||
          fullBlock.includes("dP/dT = L / (T.Δv)") ||
          (fullBlock.includes("dP/dT") && fullBlock.includes("Δv"))
        ) {
          elements.push(
            <div key={key++} className="my-6">
              <ClausiusClapeyronWorkbench />
            </div>
          );
          continue;
        }

        // 9. Pikal Heat Transfer Workbench
        if (
          fullBlock.includes("Q = Kv · Av · (Ts − Tb)") ||
          fullBlock.includes("Q = Kv . Av . (Ts - Tb)") ||
          (fullBlock.includes("Kv") && fullBlock.includes("Av") && (fullBlock.includes("Ts") || fullBlock.includes("Tb")))
        ) {
          elements.push(
            <div key={key++} className="my-6">
              <PikalHeatMassWorkbench />
            </div>
          );
          continue;
        }

        // 10. Universal Interactive Equation Card for any other recognized physical law
        if (latexFormula) {
          elements.push(
            <div key={key++} className="my-6">
              <UniversalInteractiveEquationCard latexFormula={latexFormula} originalBlock={fullBlock} />
            </div>
          );
          continue;
        }

        // Check if it's a Top-level System Architecture / Subsystems Map
        if (
          (fullBlock.includes("Control System (PLC") || fullBlock.includes("TCU") || fullBlock.includes("Subsystem")) &&
          (fullBlock.includes("Vessel") || fullBlock.includes("Vacuum") || fullBlock.includes("Utility Management Skid") || fullBlock.includes("Bottom Discharge"))
        ) {
          elements.push(
            <div key={key++} className="my-6">
              <SystemArchitectureFlowChart />
            </div>
          );
          continue;
        }

        // Check if it's an Automation Hierarchy (ISA-95 Level 3 / Level 2 / Level 1 or Supervisory Tier)
        if (
          (fullBlock.includes("Supervisory Tier") || fullBlock.includes("Level 3:") || fullBlock.includes("Automation Hierarchy")) &&
          (fullBlock.includes("Controller Tier") || fullBlock.includes("Field Device") || fullBlock.includes("BPCS") || fullBlock.includes("Level 1:"))
        ) {
          elements.push(
            <div key={key++} className="my-6">
              <AutomationHierarchyChart />
            </div>
          );
          continue;
        }

        // Check if it's the Full Batch State Machine (Mermaid stateDiagram-v2 or full batch procedure)
        if (
          lang === "mermaid" ||
          fullBlock.includes("stateDiagram") ||
          (fullBlock.includes("IDLE") &&
            (fullBlock.includes("PRE_STERILIZE") ||
              fullBlock.includes("LEAK_TEST") ||
              fullBlock.includes("VACUUM_INDUCED_FREEZING") ||
              fullBlock.includes("PRIMARY_DRYING") ||
              fullBlock.includes("SECONDARY_DRYING") ||
              fullBlock.includes("STERILE_DISCHARGE")))
        ) {
          elements.push(
            <div key={key++} className="my-6">
              <FullBatchProcedureChart />
            </div>
          );
          continue;
        }

        // Check if it's the ISA-88 4-Tier Hierarchy
        if (
          fullBlock.includes("Procedure") &&
          fullBlock.includes("Unit Procedure") &&
          fullBlock.includes("Operation") &&
          fullBlock.includes("Phase")
        ) {
          elements.push(
            <div key={key++} className="my-6">
              <Isa88HierarchyChart />
            </div>
          );
          continue;
        }

        // Check if it's an ISA-88 Batch State Machine (IDLE -> RUNNING -> COMPLETE / HELD / ABORTED)
        if (
          (fullBlock.includes("IDLE") || fullBlock.includes("STARTING")) &&
          fullBlock.includes("RUNNING") &&
          (fullBlock.includes("COMPLETE") || fullBlock.includes("ABORTED") || fullBlock.includes("ABORTING") || fullBlock.includes("HELD") || fullBlock.includes("HOLDING"))
        ) {
          elements.push(
            <div key={key++} className="my-6">
              <BatchStateTransitionChart />
            </div>
          );
          continue;
        }

        // Check if it's an ISA-5.1 Instrument Tag Syntax ASCII diagram ([First letter] ... WHAT it measures)
        if (
          fullBlock.includes("[First letter]") &&
          (fullBlock.includes("WHAT it measures") || fullBlock.includes("more letters") || fullBlock.includes("loop number"))
        ) {
          elements.push(
            <div key={key++} className="my-6">
              <IsaTagAnatomyChart />
            </div>
          );
          continue;
        }

        // Check if it's a multi-step engineering calculation (e.g. Q1, Q2, dm/dt steps)
        const isCalc =
          fullBlock.includes("Q1") ||
          fullBlock.includes("Q2") ||
          fullBlock.includes("Total ≈") ||
          (fullBlock.includes("=") && fullBlock.includes("kg"));

        if (isCalc) {
          if (fullBlock.includes("Q1") || fullBlock.includes("Total ≈ 4,476") || fullBlock.includes("4,476 kJ")) {
            elements.push(
              <div key={key++} className="my-6">
                <FreezingRefrigerationLoadWorkbench />
              </div>
            );
            continue;
          }

          if (fullBlock.includes("dm/dt = 0.8 kg/h") && fullBlock.includes("631 W")) {
            elements.push(
              <div key={key++} className="my-6">
                <SublimationHeatDutyWorkbench />
              </div>
            );
            continue;
          }

          elements.push(
            <div
              key={key++}
              className="my-6 rounded-2xl p-5 border-2 border-amber/30 bg-bg-panel shadow-lg overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-hairline">
                <div className="flex items-center gap-2">
                  <Calculator className="w-3.5 h-3.5 text-amber" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-amber font-bold">
                    Engineering Sizing Calculation
                  </span>
                </div>
                <span className="text-[10px] font-mono text-ink-dim">Worked Batch Balance</span>
              </div>
              <pre className="text-xs sm:text-sm font-mono leading-relaxed text-ink-primary overflow-x-auto whitespace-pre p-3 rounded-xl bg-bg-surface border border-hairline">
                {fullBlock}
              </pre>
            </div>
          );
          continue;
        }

        // Standard code block
        elements.push(
          <div key={key++} className="my-5 rounded-xl border border-hairline bg-bg-panel shadow-sm overflow-hidden">
            {lang && (
              <div className="px-4 py-1.5 bg-bg-surface border-b border-hairline text-[10px] font-mono uppercase text-ink-muted">
                {lang}
              </div>
            )}
            <pre className="p-4 overflow-x-auto">
              <code className="text-xs sm:text-sm font-mono text-ink-secondary leading-relaxed">
                {codeLines.join("\n")}
              </code>
            </pre>
          </div>
        );
        continue;
      }

      // Markdown Table Parser
      const isTableLine = line.includes("|");
      const nextIsSeparator = lines[i + 1]?.includes("---") && lines[i + 1]?.includes("|");

      if (isTableLine && (nextIsSeparator || line.includes("---"))) {
        const tableLines: string[] = [];
        while (i < lines.length && (lines[i].includes("|") || lines[i].trim().match(/^[-| :]+$/))) {
          tableLines.push(lines[i].trim());
          i++;
        }

        // Filter separator line (|---|---|)
        const contentRows = tableLines.filter((l) => !l.match(/^\|?\s*[-:]+[-| :]*$/));
        const parsedRows = contentRows.map((rowStr) => {
          const rawCells = rowStr.split("|").map((c) => c.trim());
          if (rawCells[0] === "") rawCells.shift();
          if (rawCells[rawCells.length - 1] === "") rawCells.pop();
          return rawCells;
        });

        if (parsedRows.length > 0) {
          const [headerRow, ...bodyRows] = parsedRows;
          elements.push(
            <StickyMarkdownTable
              key={key++}
              headerRow={headerRow}
              bodyRows={bodyRows}
              renderInline={renderInline}
            />
          );
          continue;
        }
      }

      // Embedded Image Block: ![alt](url)
      const imageBlockMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imageBlockMatch) {
        const [, altText, srcUrl] = imageBlockMatch;
        elements.push(
          <figure
            key={key++}
            className="my-8 rounded-3xl border border-hairline bg-bg-panel overflow-hidden shadow-xl group transition-all duration-200 hover:border-amber/40 hover:shadow-2xl"
          >
            <div
              className="relative bg-bg-surface/50 p-3 sm:p-6 flex items-center justify-center cursor-pointer overflow-hidden group/img"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.open(srcUrl, "_blank");
                }
              }}
              title="Click to open full-resolution image in a new tab"
            >
              <img
                src={srcUrl}
                alt={altText || "Engineering Diagram"}
                className="max-h-[580px] w-auto max-w-full rounded-2xl object-contain shadow-md transition-transform duration-300 group-hover/img:scale-[1.01]"
                loading="lazy"
              />
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-bg-panel/90 backdrop-blur-md border border-hairline text-xs font-mono font-semibold text-ink-primary opacity-0 group-hover/img:opacity-100 transition-all duration-200 flex items-center gap-1.5 shadow-lg">
                <span>Open Full Image</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber" />
              </div>
            </div>
            {altText && (
              <figcaption className="px-5 py-3 bg-bg-surface border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <span className="font-bold text-ink-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber" />
                  {altText}
                </span>
                <span className="text-[11px] text-ink-dim flex items-center gap-1">
                  <span>Click image to inspect in full resolution</span>
                  <ExternalLink className="w-3 h-3 text-amber" />
                </span>
              </figcaption>
            )}
          </figure>
        );
        i++;
        continue;
      }

      // Headings
      const h1Match = line.match(/^# (.+)$/);
      const h2Match = line.match(/^## (.+)$/);
      const h3Match = line.match(/^### (.+)$/);
      const h4Match = line.match(/^#### (.+)$/);

      if (h1Match) {
        const id = h1Match[1].toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        elements.push(
          <h1
            key={key++}
            id={id}
            className="scroll-mt-24 text-2xl sm:text-4xl font-extrabold tracking-tight mt-10 mb-5 text-ink-primary"
          >
            {renderInline(h1Match[1])}
          </h1>
        );
        i++;
        continue;
      }
      if (h2Match) {
        const id = h2Match[1].toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        elements.push(
          <h2
            key={key++}
            id={id}
            className="scroll-mt-24 text-xl sm:text-2xl font-bold tracking-tight mt-10 mb-4 pb-2 text-ink-primary border-b border-hairline flex items-center gap-2"
          >
            <span className="text-amber text-sm font-mono">§</span>
            <span>{renderInline(h2Match[1])}</span>
          </h2>
        );
        i++;
        continue;
      }
      if (h3Match) {
        const id = h3Match[1].toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        elements.push(
          <h3
            key={key++}
            id={id}
            className="scroll-mt-24 text-base sm:text-lg font-bold mt-7 mb-2 text-cryo"
          >
            {renderInline(h3Match[1])}
          </h3>
        );
        i++;
        continue;
      }
      if (h4Match) {
        elements.push(
          <h4
            key={key++}
            className="text-xs font-bold uppercase tracking-widest mt-5 mb-2 text-ink-muted"
          >
            {renderInline(h4Match[1])}
          </h4>
        );
        i++;
        continue;
      }

      // Blockquote
      if (line.startsWith("> ")) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].startsWith("> ")) {
          quoteLines.push(lines[i].slice(2));
          i++;
        }
        elements.push(
          <blockquote
            key={key++}
            className="my-5 pl-4 py-3 pr-4 rounded-r-xl bg-bg-surface border-l-4 border-amber text-sm sm:text-base italic text-ink-secondary"
          >
            {quoteLines.join(" ")}
          </blockquote>
        );
        continue;
      }

      // Unordered list
      if (line.match(/^[-*+] /)) {
        const listItems: string[] = [];
        while (i < lines.length && lines[i].match(/^[-*+] /)) {
          listItems.push(lines[i].slice(2));
          i++;
        }
        elements.push(
          <ul key={key++} className="my-4 space-y-2 ml-5 list-disc text-ink-secondary marker:text-amber">
            {listItems.map((item, j) => {
              const hasUrl =
                item.includes("http://") || item.includes("https://") || item.includes("www.");
              return (
                <li
                  key={j}
                  className={`text-sm sm:text-base leading-relaxed pl-1 rounded-xl transition-all ${
                    hasUrl
                      ? "p-2 bg-bg-surface/30 hover:bg-bg-hover/70 border border-hairline/40 my-1.5"
                      : ""
                  }`}
                >
                  {renderInline(item)}
                </li>
              );
            })}
          </ul>
        );
        continue;
      }

      // Ordered list
      if (line.match(/^\d+\. /)) {
        const listItems: string[] = [];
        while (i < lines.length && lines[i].match(/^\d+\. /)) {
          listItems.push(lines[i].replace(/^\d+\. /, ""));
          i++;
        }
        elements.push(
          <ol key={key++} className="my-4 space-y-2.5 ml-5 list-decimal text-ink-secondary marker:text-amber marker:font-bold">
            {listItems.map((item, j) => {
              const hasUrl =
                item.includes("http://") || item.includes("https://") || item.includes("www.");
              return (
                <li
                  key={j}
                  className={`text-sm sm:text-base leading-relaxed pl-1 rounded-xl transition-all ${
                    hasUrl
                      ? "p-2.5 bg-bg-surface/35 hover:bg-bg-hover/80 border border-hairline/50 my-2 shadow-xs hover:border-amber/30"
                      : ""
                  }`}
                >
                  {renderInline(item)}
                </li>
              );
            })}
          </ol>
        );
        continue;
      }

      // Horizontal rule
      if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
        elements.push(<hr key={key++} className="my-10 border-hairline" />);
        i++;
        continue;
      }

      // Paragraph
      const paraLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].match(/^(#{1,6} |[-*+] |\d+\. |```|> |---|\*\*\*|\|)/)
      ) {
        paraLines.push(lines[i]);
        i++;
      }
      if (paraLines.length > 0) {
        elements.push(
          <p key={key++} className="text-sm sm:text-base leading-relaxed mb-4 text-ink-secondary">
            {renderInline(paraLines.join(" "))}
          </p>
        );
      } else {
        i++;
      }
    }

    return elements;
  }

  // Inline formatting: bold, italic, code, inline math, markdown links, raw URLs
  function renderInline(text: string): React.ReactNode {
    if (!text) return null;

    // Matches: KaTeX $...$, Markdown images ![alt](url), Markdown links [text](url), Raw URLs (https?:// or www.), **bold**, *italic*, `code`
    const TOKEN_REGEX =
      /(\$[^$]+\$|!\[[^\]]*\]\([^\s)]+\)|\[[^\]]+\]\([^\s)]+\)|(?:https?:\/\/|www\.)[^\s<>)"]+|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    const tokens = text.split(TOKEN_REGEX);

    return (
      <>
        {tokens.map((token, idx) => {
          if (!token) return null;

          // Inline KaTeX Math: $...$
          if (token.startsWith("$") && token.endsWith("$") && token.length > 2) {
            return <KatexEquation key={idx} expression={token.slice(1, -1)} />;
          }

          // Embedded Image: ![alt](url)
          if (token.startsWith("![") && token.includes("](") && token.endsWith(")")) {
            const imgMatch = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
            if (imgMatch) {
              const [, alt, src] = imgMatch;
              return (
                <span
                  key={idx}
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.open(src, "_blank");
                    }
                  }}
                  className="inline-block my-3 cursor-pointer group"
                  title="Click to open full-resolution image in a new tab"
                >
                  <img
                    src={src}
                    alt={alt || "Diagram"}
                    className="max-h-80 w-auto rounded-xl border border-hairline shadow-md group-hover:border-amber/40 transition-all inline-block"
                  />
                </span>
              );
            }
          }

          // Markdown Link: [label](url)
          if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
            const match = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if (match) {
              const [, label, linkUrl] = match;
              if (
                linkUrl.startsWith("http://") ||
                linkUrl.startsWith("https://") ||
                linkUrl.startsWith("www.")
              ) {
                return <InteractiveUrlLink key={idx} url={linkUrl} label={label} />;
              }
              // Internal application link
              return (
                <Link
                  key={idx}
                  href={linkUrl}
                  className="inline-flex items-center gap-1 text-cryo hover:text-amber font-semibold underline underline-offset-2 transition-colors"
                >
                  <span>{label}</span>
                </Link>
              );
            }
          }

          // Raw URL: https://... or http://... or www....
          if (
            token.startsWith("http://") ||
            token.startsWith("https://") ||
            token.startsWith("www.")
          ) {
            let cleanUrl = token;
            let trailingPunct = "";
            while (cleanUrl.match(/[.,;:)\]]$/)) {
              trailingPunct = cleanUrl.slice(-1) + trailingPunct;
              cleanUrl = cleanUrl.slice(0, -1);
            }
            return (
              <React.Fragment key={idx}>
                <InteractiveUrlLink url={cleanUrl} />
                {trailingPunct}
              </React.Fragment>
            );
          }

          // Bold: **...**
          if (token.startsWith("**") && token.endsWith("**")) {
            return (
              <strong key={idx} className="font-bold text-ink-primary">
                {token.slice(2, -2)}
              </strong>
            );
          }

          // Italic: *...*
          if (token.startsWith("*") && token.endsWith("*") && !token.startsWith("**")) {
            return (
              <em key={idx} className="italic text-ink-primary">
                {token.slice(1, -1)}
              </em>
            );
          }

          // Code: `...`
          if (token.startsWith("`") && token.endsWith("`")) {
            return (
              <code
                key={idx}
                className="bg-bg-surface border border-hairline text-cryo px-1.5 py-0.5 rounded text-xs font-mono font-semibold"
              >
                {token.slice(1, -1)}
              </code>
            );
          }

          return <React.Fragment key={idx}>{token}</React.Fragment>;
        })}
      </>
    );
  }

  return (
    <div className="flex gap-0 relative">
      {/* Left TOC */}
      <aside className="hidden xl:flex flex-col sticky top-16 h-[calc(100vh-4rem)] w-60 shrink-0 pt-8 pr-4 overflow-y-auto border-r border-hairline">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink-dim font-semibold">
            Contents
          </span>
          <button
            onClick={() => setTocOpen(!tocOpen)}
            className="text-ink-dim hover:text-ink-primary transition"
            title="Toggle TOC"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {tocOpen && (
          <nav className="space-y-1">
            {chapter.headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className={`block text-xs leading-snug py-1.5 px-2 rounded-lg transition-all ${
                  activeSection === h.id
                    ? "bg-amber/15 text-ink-primary font-extrabold border-l-3 border-amber shadow-xs ring-1 ring-amber/25"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-bg-hover font-medium"
                }`}
                style={{
                  paddingLeft: h.level === 1 ? "8px" : h.level === 2 ? "14px" : "22px",
                }}
              >
                {h.text}
              </a>
            ))}
          </nav>
        )}
      </aside>

      {/* Main Chapter Content */}
      <main
        id="monograph-reader-main"
        className={`flex-1 min-w-0 px-4 sm:px-10 pt-10 max-w-4xl transition-all duration-300 ${
          voiceStudioOpen
            ? "pb-[560px]"
            : transcriptOpen
            ? "pb-[380px]"
            : currentTrack && !isMinimized
            ? "pb-72 sm:pb-96"
            : "pb-28"
        }`}
      >
        {/* Chapter Header */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber text-on-amber font-bold shadow-xs">
                {chapter.act}
              </span>
              <span className="text-xs font-mono text-ink-secondary font-semibold">
                Ch {chapter.chapterNumber} • {chapter.readTime}
              </span>
            </div>

            {/* Export / Print Action */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExportOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono bg-bg-panel hover:bg-bg-hover text-ink-primary border border-hairline transition shadow-sm hover:border-amber/40 cursor-pointer"
                title="Export or Print this chapter (PDF, Word, Markdown)"
              >
                <Download className="w-3.5 h-3.5 text-amber" />
                <span className="font-semibold">Export / Print</span>
              </button>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-ink-primary leading-tight">
            {chapter.title}
          </h1>

          <div className="h-0.5 w-full bg-gradient-to-r from-amber via-cryo to-transparent opacity-50 rounded-full" />

          {/* Mobile Quick In-Page Table of Contents Dropdown */}
          <div className="xl:hidden pt-2">
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-bg-surface border border-hairline text-xs font-mono text-ink-secondary hover:text-ink-primary transition shadow-xs"
            >
              <span className="flex items-center gap-2 font-bold text-amber">
                <List className="w-4 h-4" />
                <span>Table of Contents ({chapter.headings.length} Sections)</span>
              </span>
              <span className="text-[11px] font-semibold text-ink-dim">
                {tocOpen ? "▲ Collapse" : "▼ Jump to Section"}
              </span>
            </button>
            {tocOpen && (
              <nav className="mt-2 p-3 rounded-xl bg-bg-panel border border-hairline space-y-1 animate-fade-in shadow-lg max-h-72 overflow-y-auto">
                {chapter.headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    onClick={() => setTocOpen(false)}
                    className={`block text-xs leading-snug py-2 px-3 rounded-lg transition-all ${
                      activeSection === h.id
                        ? "bg-amber/15 text-ink-primary font-extrabold border-l-3 border-amber shadow-xs ring-1 ring-amber/25"
                        : "text-ink-secondary hover:text-ink-primary hover:bg-bg-hover font-medium"
                    }`}
                    style={{
                      paddingLeft: h.level === 1 ? "10px" : h.level === 2 ? "16px" : "24px",
                    }}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </div>

        {/* Chapter Markdown Content */}
        <article className="chapter-body space-y-2">
          {renderMarkdown(chapter.content)}
        </article>

        {/* Chapter Navigation Footer (Fully Responsive Stack on Mobile) */}
        <div className="relative z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-16 pt-8 border-t border-hairline mb-4">
          {prevChapter ? (
            <a
              href={`/${projectSlug}/${prevChapter.slug}`}
              className="flex-1 flex items-center gap-3 p-4 rounded-2xl bg-bg-panel hover:bg-bg-surface border border-hairline hover:border-amber/50 hover:shadow-lg transition-all group shadow-xs cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-ink-dim group-hover:text-amber group-hover:-translate-x-1 transition shrink-0" />
              <div className="truncate">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-ink-secondary mb-1">
                  <span>Previous Chapter</span>
                  {prevChapter.chapterNumber && (
                    <span className="px-2 py-0.5 rounded bg-amber text-on-amber font-mono font-bold text-[10px] shadow-xs">
                      Ch {prevChapter.chapterNumber}
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-ink-primary truncate group-hover:text-amber transition">
                  {prevChapter.title}
                </div>
              </div>
            </a>
          ) : (
            <div className="hidden sm:block flex-1" />
          )}

          {nextChapter && (
            <a
              href={`/${projectSlug}/${nextChapter.slug}`}
              className="flex-1 flex items-center justify-between sm:justify-end gap-3 p-4 rounded-2xl bg-bg-panel hover:bg-bg-surface border border-hairline hover:border-amber/50 hover:shadow-lg transition-all group text-right shadow-xs cursor-pointer"
            >
              <div className="truncate text-left sm:text-right">
                <div className="flex items-center justify-start sm:justify-end gap-2 text-[10px] font-mono uppercase tracking-widest text-ink-secondary mb-1">
                  {nextChapter.chapterNumber && (
                    <span className="px-2 py-0.5 rounded bg-amber text-on-amber font-mono font-bold text-[10px] shadow-xs">
                      Ch {nextChapter.chapterNumber}
                    </span>
                  )}
                  <span>Next Chapter</span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-ink-primary truncate group-hover:text-amber transition">
                  {nextChapter.title}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-ink-dim group-hover:text-amber group-hover:translate-x-1 transition shrink-0" />
            </a>
          )}
        </div>

        {/* Guaranteed scrollable clearance ensuring chapter buttons never hide behind the audio console, voice studio, or transcript */}
        <div
          className="w-full pointer-events-none transition-all duration-300"
          style={{
            height: voiceStudioOpen
              ? "560px"
              : transcriptOpen
              ? "360px"
              : currentTrack && !isMinimized
              ? "180px"
              : "64px",
          }}
          aria-hidden="true"
        />

        {/* Floating Selection Sync Pill */}
        {selectionPopupPos && (
          <div
            style={{
              position: "fixed",
              top: `${selectionPopupPos.top}px`,
              left: `${selectionPopupPos.left}px`,
              zIndex: 9999,
            }}
            className="narrator-selection-pill animate-fade-in pointer-events-auto"
          >
            <button
              onClick={() => {
                if (currentTrack?.slug !== chapter.slug) {
                  loadTrack(chapter.slug, chapter.title, audioUrl || "", manifest, chapter.content);
                }
                syncToSelection();
                setSelectionPopupPos(null);
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber text-on-amber font-mono text-xs font-bold shadow-2xl hover:scale-105 active:scale-95 transition border border-amber-bright cursor-pointer"
              title="Start narration cleanly from the beginning of this selected sentence"
            >
              <Volume2 className="w-3.5 h-3.5 fill-current" />
              <span>Read from this sentence</span>
              <span className="opacity-75 text-[10px] hidden sm:inline">
                ({selectedPersona.name.split(" ")[0]})
              </span>
            </button>
          </div>
        )}

        {/* Export & Print Monograph Modal */}
        <ExportModal
          isOpen={exportOpen}
          onClose={() => setExportOpen(false)}
          chapter={chapter}
          allChapters={allChapters}
          projectSlug={projectSlug}
        />

        {/* Floating Listen AI Voice Button */}
        <button
          onClick={handlePlayNarration}
          className={`fixed z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xl group ${
            currentTrack && !isMinimized ? "bottom-24 right-6" : "bottom-6 right-6"
          } ${
            isThisPlaying
              ? "bg-amber text-on-amber border-2 border-amber-bright shadow-amber-glow animate-pulse ring-2 ring-amber/50"
              : isCurrentTrack
              ? "bg-amber/20 text-amber border-2 border-amber hover:bg-amber/30"
              : "bg-bg-panel/95 hover:bg-bg-surface text-amber border border-amber/40 hover:border-amber hover:shadow-amber/20"
          }`}
          title={
            isThisPlaying
              ? `Pause Narration (${selectedPersona.name.split(" ")[0]})`
              : isCurrentTrack
              ? `Resume Narration (${selectedPersona.name.split(" ")[0]})`
              : audioUrl
              ? `Listen to Chapter (${selectedPersona.name.split(" ")[0]} - Studio Audio)`
              : `Listen to Chapter (${selectedPersona.name.split(" ")[0]} - AI Voice)`
          }
          aria-label={isThisPlaying ? "Pause Narration" : "Listen to Chapter with AI Voice"}
        >
          {isThisPlaying ? (
            <Volume2 className="w-6 h-6 text-on-amber transition-transform group-hover:scale-110" />
          ) : isCurrentTrack ? (
            <Play className="w-5 h-5 text-amber fill-current ml-0.5 transition-transform group-hover:scale-110" />
          ) : (
            <Headphones className="w-6 h-6 text-amber transition-transform group-hover:scale-110" />
          )}
          {!isThisPlaying && !isCurrentTrack && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber" />
            </span>
          )}
        </button>
      </main>
    </div>
  );
}
