import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/content";
import { SlideItem } from "@/components/webinar/WebinarSlideDeckViewer";
import { DualWebinarDeckPortal } from "@/components/webinar/DualWebinarDeckPortal";
import nautaSlidesData from "@/data/nauta_webinar_slides.json";
import dryingSlidesData from "@/data/basics_of_drying_slides.json";
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
  BookOpen,
  Thermometer,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ project: string }> }) {
  const resolvedParams = await params;
  const project = getProjectBySlug(resolvedParams.project);
  if (!project) return { title: "Webinar Not Found" };

  return {
    title: `Hosokawa Master Webinars & Slide Decks (78 Unique Slides) | ${project.title}`,
    description:
      "Full interactive PowerPoint presentations extracted from Hosokawa Micron webinars: Basics of Material Drying (45 slides) and Nauta Mixing & Drying (33 slides) with zero duplicate slides.",
  };
}

export default async function WebinarPage({ params }: { params: Promise<{ project: string }> }) {
  const resolvedParams = await params;
  const project = getProjectBySlug(resolvedParams.project);

  if (!project) {
    notFound();
  }

  const nautaSlides: SlideItem[] = nautaSlidesData as SlideItem[];
  const dryingSlides: SlideItem[] = dryingSlidesData as SlideItem[];

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
        <span className="text-ink-primary uppercase">HOSOKAWA WEBINARS &amp; PPT DECKS</span>
      </div>

      {/* Hero Header */}
      <div className="relative rounded-3xl bg-bg-panel border border-hairline p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/10 border border-amber/30 text-xs font-mono text-amber">
            <Presentation className="w-3.5 h-3.5" />
            <span>Hosokawa Master Engineering Slide Decks</span>
            <span className="text-ink-dim">•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 78 Total Unique Canonical Slides (0 Duplicates)
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-ink-primary tracking-tight leading-tight">
            Thermal Drying Thermodynamics &amp; Nauta® Agitated Lyophilization
          </h1>

          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            Directly extracted from Hosokawa Micron Powder Systems&apos; authoritative technical webinars. 
            Toggle between the foundational thermodynamics of drying (sensible/latent heat, phase equilibria, drying curves) 
            and the advanced mechanical engineering of Vrieco-Nauta agitated conical vacuum lyophilizers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
            {/* Quick Card 1: Basics of Drying */}
            <div className="p-3.5 rounded-2xl bg-bg-surface border border-hairline flex flex-col justify-between gap-2.5">
              <div>
                <div className="text-[10px] text-amber uppercase font-bold flex items-center gap-1.5">
                  <Thermometer className="w-3 h-3" />
                  <span>Webinar 1: Thermodynamics (45 Slides)</span>
                </div>
                <div className="text-xs font-bold text-ink-primary mt-1">
                  Basics of Material Drying Technology
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/drying_webinar/Basics_of_Material_Drying_Webinar.pptx"
                  download
                  className="px-2.5 py-1.5 rounded-lg bg-amber/15 hover:bg-amber/25 border border-amber/30 text-amber text-[11px] font-bold transition flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> PPTX
                </a>
                <a
                  href="/drying_webinar/Basics_of_Material_Drying_Webinar.pdf"
                  download
                  className="px-2.5 py-1.5 rounded-lg bg-bg-hover hover:bg-bg-hover/80 border border-hairline text-ink-secondary text-[11px] transition flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> PDF
                </a>
                <a
                  href="https://www.youtube.com/watch?v=yqA_Jjalj0g"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-[11px] text-ink-dim hover:text-ink-primary flex items-center gap-1"
                >
                  <Video className="w-3 h-3 text-rose-400" />
                  <span>YouTube (44:28)</span>
                </a>
              </div>
            </div>

            {/* Quick Card 2: Nauta Conical Dryer */}
            <div className="p-3.5 rounded-2xl bg-bg-surface border border-hairline flex flex-col justify-between gap-2.5">
              <div>
                <div className="text-[10px] text-amber uppercase font-bold flex items-center gap-1.5">
                  <Presentation className="w-3 h-3" />
                  <span>Webinar 2: Mechanics &amp; AFD (33 Slides)</span>
                </div>
                <div className="text-xs font-bold text-ink-primary mt-1">
                  Deep Dive into Nauta® Mixing &amp; Drying
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/nauta_webinar/Nauta_Mixing_and_Drying_Technology_Webinar.pptx"
                  download
                  className="px-2.5 py-1.5 rounded-lg bg-amber/15 hover:bg-amber/25 border border-amber/30 text-amber text-[11px] font-bold transition flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> PPTX
                </a>
                <a
                  href="/nauta_webinar/Nauta_Mixing_and_Drying_Technology_Webinar.pdf"
                  download
                  className="px-2.5 py-1.5 rounded-lg bg-bg-hover hover:bg-bg-hover/80 border border-hairline text-ink-secondary text-[11px] transition flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> PDF
                </a>
                <a
                  href="https://www.youtube.com/watch?v=91mCewt5t38&t=39s"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-[11px] text-ink-dim hover:text-ink-primary flex items-center gap-1"
                >
                  <Video className="w-3 h-3 text-rose-400" />
                  <span>YouTube (47:35)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Dual-Deck Portal Component */}
      <DualWebinarDeckPortal
        nautaSlides={nautaSlides}
        dryingSlides={dryingSlides}
        initialDeck="drying"
      />

      {/* Navigation footer */}
      <div className="rounded-2xl bg-bg-inset border border-hairline p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-ink-dim uppercase">Related Foundational Chapter</div>
          <div className="text-sm font-bold text-ink-primary">
            Chapter 02: Physics, Thermodynamics &amp; Phase Space of Freeze Drying
          </div>
        </div>
        <Link
          href={`/${project.slug}/02-physics-and-thermodynamics`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber hover:bg-amber-bright text-[#0e0a02] font-bold text-xs uppercase tracking-wider transition"
        >
          <span>Read Chapter 02</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
