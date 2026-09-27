import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/content";
import { WebinarSlideDeckViewer, SlideItem } from "@/components/webinar/WebinarSlideDeckViewer";
import slidesData from "@/data/nauta_webinar_slides.json";
import {
  Presentation,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Flame,
  Filter,
  Download,
  Video,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ project: string }> }) {
  const resolvedParams = await params;
  const project = getProjectBySlug(resolvedParams.project);
  if (!project) return { title: "Webinar Not Found" };

  return {
    title: `Nauta® Mixing & Drying Technology Slide Deck | ${project.title}`,
    description:
      "Full 33-slide interactive presentation extracted from the Hosokawa Vrieco-Nauta educational webinar with zero duplicate slides and technical synthesis.",
  };
}

export default async function WebinarPage({ params }: { params: Promise<{ project: string }> }) {
  const resolvedParams = await params;
  const project = getProjectBySlug(resolvedParams.project);

  if (!project) {
    notFound();
  }

  const slides: SlideItem[] = slidesData as SlideItem[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-xs font-mono text-ink-dim">
        <Link href="/" className="hover:text-ink-primary transition">
          THE ARCHIVE
        </Link>
        <span>/</span>
        <Link href={`/${project.slug}`} className="text-amber uppercase hover:underline">
          {project.slug}
        </Link>
        <span>/</span>
        <span className="text-ink-primary uppercase">NAUTA WEBINAR & PPT DECK</span>
      </div>

      {/* Hero Header */}
      <div className="relative rounded-3xl bg-bg-panel border border-hairline p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/10 border border-amber/30 text-xs font-mono text-amber">
            <Presentation className="w-3.5 h-3.5" />
            <span>Master Engineering Slide Deck</span>
            <span className="text-ink-dim">•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 33 Unique Canonical Slides (0 Duplicates)
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-ink-primary tracking-tight leading-tight">
            Deep Dive into Nauta® Mixing &amp; Drying Technology
          </h1>

          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            Directly extracted from Hosokawa Micron Powder Systems&apos; authoritative technical webinar 
            (Chris Paulsworth). This slide deck establishes the foundational conical screw mechanics, 
            cantilevered auger design, thermal jacket configurations, and top vapor filter engineering 
            that empower the Active Freeze Dryer (AFD).
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
            <a
              href="/nauta_webinar/Nauta_Mixing_and_Drying_Technology_Webinar.pptx"
              download
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber hover:bg-amber-bright text-[#0e0a02] font-black tracking-wider transition shadow-lg shadow-amber/20 hover:scale-105 active:scale-95 border border-amber/40"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD PPTX (WIDESCREEN 16:9)</span>
            </a>

            <a
              href="/nauta_webinar/Nauta_Mixing_and_Drying_Technology_Webinar.pdf"
              download
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-hover border border-hairline text-ink-primary hover:bg-bg-hover/80 transition"
            >
              <Download className="w-4 h-4 text-cryo" />
              <span>DOWNLOAD HIGH-RES PDF</span>
            </a>

            <a
              href="https://www.youtube.com/watch?v=91mCewt5t38&t=39s"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-hover border border-hairline text-ink-secondary hover:text-ink-primary transition"
            >
              <Video className="w-4 h-4 text-rose-400" />
              <span>Original YouTube Webinar (47:35)</span>
              <ExternalLink className="w-3 h-3 text-ink-dim" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Slide Deck Interactive Viewer Component */}
      <WebinarSlideDeckViewer
        slides={slides}
        pptxUrl="/nauta_webinar/Nauta_Mixing_and_Drying_Technology_Webinar.pptx"
        pdfUrl="/nauta_webinar/Nauta_Mixing_and_Drying_Technology_Webinar.pdf"
        youtubeUrl="https://www.youtube.com/watch?v=91mCewt5t38&t=39s"
      />

      {/* Technical Synthesis & Deep Dive */}
      <div className="space-y-6">
        <div className="border-b border-hairline pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-ink-primary font-serif">
              Engineering Synthesis: 4 Core Lessons for the Active Freeze Dryer
            </h2>
            <p className="text-xs text-ink-secondary font-mono mt-0.5">
              How Vrieco-Nauta conical mixing physics directly dictate the operational parameters of the AFD-0.5
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl bg-bg-panel border border-hairline p-6 space-y-3 hover:border-hairline-strong transition">
            <div className="w-9 h-9 rounded-xl bg-amber/10 border border-amber/30 flex items-center justify-center text-amber">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-ink-primary">
              1. 10:1 Auger to Orbit Power Kinematics
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              As revealed in Slide 12, the screw auger performs over 90% of the mechanical displacement 
              work inside the cone. Sizing the screw motor at ~1.5 kW with high torque at 60–120 RPM, 
              paired with an orbital drive motor of 0.25–0.37 kW at 1.5–3.0 RPM, provides optimal 
              macro-convection without localized mechanical shear hot-spots.
            </p>
            <div className="text-[11px] font-mono text-amber">
              AFD Rule: Never undersize auger breakaway torque when dealing with frozen granular cakes.
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-bg-panel border border-hairline p-6 space-y-3 hover:border-hairline-strong transition">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-ink-primary">
              2. Cantilevered Screw vs Bottom Pintle Bearing
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              In Slide 19, Hosokawa explicitly compares cantilevered versus bottom-supported screws. 
              For pharmaceutical freeze drying, bottom bearings are strictly prohibited due to grease 
              leaks, seal wear, and clean-in-place (CIP) dead zones. The screw must be suspended entirely 
              from the orbital arm universal joint with a precision conical wall clearance of 3–5 mm.
            </p>
            <div className="text-[11px] font-mono text-emerald-400">
              AFD Rule: Eliminates 100% of submerged seal failure modes and batch contamination.
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-bg-panel border border-hairline p-6 space-y-3 hover:border-hairline-strong transition">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-ink-primary">
              3. Half-Pipe Spiral Coils for Sublimation Heat
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Slides 24 &amp; 25 highlight that vacuum conversion requires a high-velocity thermal fluid 
              jacket. External half-pipe coil jackets resist full vacuum implosion while enforcing turbulent 
              Syltherm XLT circulation. Upward powder convective renewal at the vessel wall guarantees 
              heat transfer coefficients (U = 80–140 W/m²·K) up to 4× higher than static tray lyophilizers.
            </p>
            <div className="text-[11px] font-mono text-rose-400">
              AFD Rule: Drastically slashes primary sublimation cycles from 48 hours down to 8–12 hours.
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl bg-bg-panel border border-hairline p-6 space-y-3 hover:border-hairline-strong transition">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Filter className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-ink-primary">
              4. Heated Vapor Filter Dome &amp; Condensation Prevention
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Slides 27 &amp; 32 reveal the crucial design of the top vapor dome: it must be electrically 
              or fluid-heated above product sublimation temperature (e.g. +40 °C) to prevent sublimed vapor 
              from condensing on the filter candles. Automatic reverse-pulse nitrogen blowback continuously 
              returns collected powder fines directly into the agitated bed.
            </p>
            <div className="text-[11px] font-mono text-purple-400">
              AFD Rule: Zero product entrainment loss into the condenser or vacuum pumping train.
            </div>
          </div>
        </div>
      </div>

      {/* Navigation footer */}
      <div className="rounded-2xl bg-bg-inset border border-hairline p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-ink-dim uppercase">Next Engineering Exploration</div>
          <div className="text-sm font-bold text-ink-primary">
            Chapter 05: Vessel, Chamber, Agitator &amp; Materials of Construction
          </div>
        </div>
        <Link
          href={`/${project.slug}/05-vessel-chamber-agitator-and-materials`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber hover:bg-amber-bright text-[#0e0a02] font-bold text-xs uppercase tracking-wider transition"
        >
          <span>Read Chapter 05</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
