import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/content";
import { SlideItem } from "@/components/webinar/WebinarSlideDeckViewer";
import { DualWebinarDeckPortal } from "@/components/webinar/DualWebinarDeckPortal";
import { YouTubeEmbed } from "@/components/media/YouTubeEmbed";
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

      {/* Master Video Catalog */}
      <section className="space-y-6 pt-6 border-t border-hairline">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400 mb-2">
              <Video className="w-3.5 h-3.5 text-red-500" />
              <span>Hosokawa Micron Multimedia Video Catalog</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink-primary font-serif">
              Master Technical Webinars &amp; Industrial Demonstrations
            </h2>
            <p className="text-xs sm:text-sm text-ink-secondary font-mono mt-1">
              9 canonical video resources with direct chapter cross-references, topic breakdowns, and privacy-enhanced playback
            </p>
          </div>
          <span className="text-xs font-mono text-ink-dim px-3 py-1 rounded-lg bg-bg-panel border border-hairline self-start sm:self-auto">
            9 COMPLETE SESSIONS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TECHNICAL_VIDEOS.map((vid) => (
            <div
              key={vid.id}
              className="flex flex-col justify-between rounded-3xl bg-bg-panel border border-hairline p-5 shadow-lg hover:border-amber/40 transition-all duration-200 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-amber/10 border border-amber/20 text-[10px] text-amber font-semibold">
                    {vid.channel}
                  </span>
                  <span className="text-ink-dim">{vid.duration}</span>
                </div>

                <h3 className="text-sm font-bold text-ink-primary group-hover:text-amber transition-colors line-clamp-2">
                  {vid.title}
                </h3>

                <p className="text-xs text-ink-secondary leading-relaxed line-clamp-3">
                  {vid.caption}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-hairline space-y-3">
                <div className="text-[11px] font-mono text-ink-dim flex items-center justify-between">
                  <span>Linked Chapter:</span>
                  <Link
                    href={`/${project.slug}/${vid.chapterSlug}`}
                    className="text-amber hover:underline truncate max-w-[180px] font-semibold"
                  >
                    {vid.chapter}
                  </Link>
                </div>

                <a
                  href={vid.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-bg-surface hover:bg-bg-hover border border-hairline text-xs font-mono font-bold text-ink-primary transition group/btn"
                >
                  <Video className="w-3.5 h-3.5 text-red-500" />
                  <span>Watch on YouTube</span>
                  <ExternalLink className="w-3 h-3 text-ink-dim group-hover/btn:text-amber transition" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

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

const TECHNICAL_VIDEOS = [
  {
    id: "wMskOQfCFdo",
    url: "https://www.youtube.com/watch?v=wMskOQfCFdo",
    title: "Mixing Powder 101: Basic Principles of Mixing",
    channel: "HosokawaMicron",
    duration: "45:24",
    chapter: "Chapter 01: Physics & Thermodynamics",
    chapterSlug: "01-physics-and-thermodynamics",
    caption: "Bulk solid convective transport, shear forces, diffusive micro-mixing, and segregation prevention in conical blenders."
  },
  {
    id: "yqA_Jjalj0g",
    url: "https://www.youtube.com/watch?v=yqA_Jjalj0g",
    title: "Basics of Material Drying Webinar",
    channel: "HosokawaMicron",
    duration: "44:28",
    chapter: "Chapter 01: Physics & Thermodynamics",
    chapterSlug: "01-physics-and-thermodynamics",
    caption: "Thermodynamic laws of solvent removal, sensible vs latent heat, drying rate kinetics, and phase boundary constraints."
  },
  {
    id: "rK11VtqUz3w",
    url: "https://www.youtube.com/watch?v=rK11VtqUz3w",
    title: "RIBOCONE Conical Ribbon Mixer Dryer",
    channel: "Foeth / Hosokawa",
    duration: "0:27",
    chapter: "Chapter 02: AFD vs Generic Lyophilizers",
    chapterSlug: "02-hosokawa-afd-vs-generic-lyophilizers",
    caption: "Double helical ribbon sweep kinematics vs orbiting screw agitated conical vacuum drying comparison."
  },
  {
    id: "91mCewt5t38",
    url: "https://www.youtube.com/watch?v=91mCewt5t38",
    title: "Deep Dive into Nauta Mixing & Drying Technology",
    channel: "HosokawaMicron",
    duration: "47:36",
    chapter: "Chapter 04: System Architecture & Subsystems",
    chapterSlug: "04-system-architecture-and-subsystems",
    caption: "Mechanical design of Vrieco-Nauta batch skids, cantilevered drive integration, vacuum tightness, and condenser circuits."
  },
  {
    id: "oNc7KjdoQys",
    url: "https://www.youtube.com/watch?v=oNc7KjdoQys",
    title: "Laboratory Mixer for Dry Powders - Labomixer",
    channel: "HosokawaMicron",
    duration: "3:08",
    chapter: "Chapter 05: Vessel, Chamber, Agitator & Materials",
    chapterSlug: "05-vessel-chamber-agitator-and-materials",
    caption: "Auger rotation, orbital arm 3D movement, convective lifting, and powder circulation in a transparent conical chamber."
  },
  {
    id: "ak9cC1hoIdo",
    url: "https://www.youtube.com/watch?v=ak9cC1hoIdo",
    title: "Nauta® Mixer CIP Cleaning Process",
    channel: "Hosokawa Micron B.V.",
    duration: "1:45",
    chapter: "Chapter 14: CIP, SIP, Sealing & Utilities",
    chapterSlug: "14-cip-sip-sealing-insulation-and-utilities",
    caption: "Automated rotary spray balls providing complete riboflavin-validated wash coverage over cover, arm, walls, and valve."
  },
  {
    id: "Xlwxu3NfhvU",
    url: "https://www.youtube.com/watch?v=Xlwxu3NfhvU",
    title: "Nauta Conical Vacuum Dryers | Shiv Shakkti",
    channel: "Shiv Shakkti Process Eq.",
    duration: "1:15",
    chapter: "Chapter 06: Materials & Workshop Fabrication",
    chapterSlug: "06-materials-fabrication-tolerances-and-welding",
    caption: "ASME pressure vessel cone rolling, jacket welding, mirror internal surface finishing, and drive skid fitment."
  },
  {
    id: "8J1il5RoBGY",
    url: "https://www.youtube.com/watch?v=8J1il5RoBGY",
    title: "Mixing of Dry Powder Cell Culture Media",
    channel: "Hosokawa Micron B.V.",
    duration: "1:50",
    chapter: "Chapter 14: CIP, SIP, Sealing & Utilities",
    chapterSlug: "14-cip-sip-sealing-insulation-and-utilities",
    caption: "Aseptic pharmaceutical processing of temperature-sensitive, shear-fragile cell culture media powders."
  },
  {
    id: "TOQTa-9G9Lw",
    url: "https://www.youtube.com/watch?v=TOQTa-9G9Lw",
    title: "ExpertTalk | Battery Production & High Containment",
    channel: "Hosokawa Micron B.V.",
    duration: "9:11",
    chapter: "Chapter 06: Materials & Workshop Fabrication",
    chapterSlug: "06-materials-fabrication-tolerances-and-welding",
    caption: "Closed-loop inert nitrogen vacuum drying of toxic and explosive battery slurries with full containment."
  },
  {
    id: "6MbMTYzVbCY",
    url: "https://www.youtube.com/watch?v=6MbMTYzVbCY",
    title: "Conical Paddle Dryer (CPD)",
    channel: "Hosokawa Micron B.V.",
    duration: "1:47",
    chapter: "Chapter 02: AFD vs Generic Lyophilizers",
    chapterSlug: "02-hosokawa-afd-vs-generic-lyophilizers",
    caption: "Heavy-duty central paddle agitation for viscous pasty slurries, dense filter cakes, and toxic containment vacuum drying."
  },
  {
    id: "ZYifIAtqusM",
    url: "https://www.youtube.com/watch?v=ZYifIAtqusM",
    title: "Silo Design: Mass Flow vs Funnel Flow - DEM Case Study",
    channel: "EngineerDo",
    duration: "1:15",
    chapter: "Chapter 05: Vessel, Chamber, Agitator & Materials",
    chapterSlug: "05-vessel-chamber-agitator-and-materials",
    caption: "Discrete Element Method (DEM) simulation comparing funnel flow vs steep conical mass flow and rat-hole prevention."
  }
];
