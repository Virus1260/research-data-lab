"use client";

import React, { useState } from "react";
import { WebinarSlideDeckViewer, SlideItem } from "@/components/webinar/WebinarSlideDeckViewer";
import {
  Presentation,
  Flame,
  Zap,
  ShieldCheck,
  Filter,
  Download,
  Video,
  ExternalLink,
  CheckCircle2,
  Layers,
  Thermometer,
  Gauge,
  Activity,
} from "lucide-react";

interface Props {
  nautaSlides: SlideItem[];
  dryingSlides: SlideItem[];
  initialDeck?: "drying" | "nauta";
}

export function DualWebinarDeckPortal({
  nautaSlides,
  dryingSlides,
  initialDeck = "drying",
}: Props) {
  const [activeDeck, setActiveDeck] = useState<"drying" | "nauta">(initialDeck);

  return (
    <div className="space-y-8">
      {/* Interactive Deck Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-2xl bg-bg-surface border border-hairline shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveDeck("drying")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
              activeDeck === "drying"
                ? "bg-amber text-[#0e0a02] shadow-md shadow-amber/25 scale-[1.02]"
                : "text-ink-secondary hover:text-ink-primary hover:bg-bg-hover"
            }`}
          >
            <Thermometer className="w-4 h-4" />
            <span>Basics of Material Drying (45 Slides)</span>
            {activeDeck === "drying" && <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setActiveDeck("nauta")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
              activeDeck === "nauta"
                ? "bg-amber text-[#0e0a02] shadow-md shadow-amber/25 scale-[1.02]"
                : "text-ink-secondary hover:text-ink-primary hover:bg-bg-hover"
            }`}
          >
            <Presentation className="w-4 h-4" />
            <span>Nauta® Mixing & Vacuum Drying (33 Slides)</span>
            {activeDeck === "nauta" && <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="text-[11px] font-mono text-ink-dim px-3 py-1 flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 border-hairline">
          <span>ACTIVE DECK:</span>
          <span className="text-amber font-semibold">
            {activeDeck === "drying" ? "45 UNIQUE SLIDES" : "33 UNIQUE SLIDES"} (0 DUPLICATES)
          </span>
        </div>
      </div>

      {/* Slide Viewer Render */}
      {activeDeck === "drying" ? (
        <WebinarSlideDeckViewer
          key="drying-deck"
          slides={dryingSlides}
          deckTitle="Basics of Material Drying Technology"
          deckSubtitle="45 CANONICAL SLIDES • ZERO DUPLICATES • 4:3 NATIVE RATIO"
          pptxUrl="/drying_webinar/Basics_of_Material_Drying_Webinar.pptx"
          pdfUrl="/drying_webinar/Basics_of_Material_Drying_Webinar.pdf"
          youtubeUrl="https://www.youtube.com/watch?v=yqA_Jjalj0g"
        />
      ) : (
        <WebinarSlideDeckViewer
          key="nauta-deck"
          slides={nautaSlides}
          deckTitle="Hosokawa Nauta® Mixing & Drying Technology"
          deckSubtitle="33 CANONICAL SLIDES • ZERO DUPLICATES • WIDESCREEN 16:9"
          pptxUrl="/nauta_webinar/Nauta_Mixing_and_Drying_Technology_Webinar.pptx"
          pdfUrl="/nauta_webinar/Nauta_Mixing_and_Drying_Technology_Webinar.pdf"
          youtubeUrl="https://www.youtube.com/watch?v=91mCewt5t38&t=39s"
        />
      )}

      {/* Technical Synthesis & Engineering Highlights */}
      {activeDeck === "drying" ? (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b border-hairline pb-3">
            <h2 className="text-xl font-bold text-ink-primary font-serif">
              Engineering Synthesis: Thermodynamics of Material Drying
            </h2>
            <p className="text-xs text-ink-secondary font-mono mt-0.5">
              Core thermodynamic laws, drying rate kinetics, and phase change physics extracted from the webinar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-bg-panel border border-hairline p-6 space-y-3 hover:border-hairline-strong transition">
              <div className="w-9 h-9 rounded-xl bg-amber/10 border border-amber/30 flex items-center justify-center text-amber">
                <Thermometer className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-ink-primary">
                1. Sublimation vs Evaporation Phase Path (Slides 08–11)
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Liquid removal can occur via evaporation (above the triple point: 0.01 °C, 6.11 mbar) 
                or direct sublimation (below the triple point). In freeze drying, absolute pressure must 
                be maintained strictly below the triple point to transition ice directly to vapor, preventing 
                liquid phase formation and structural cake collapse.
              </p>
              <div className="text-[11px] font-mono text-amber">
                AFD Rule: Chamber absolute pressure setpoint must not exceed 0.5–2.0 mbar during primary drying.
              </div>
            </div>

            <div className="rounded-2xl bg-bg-panel border border-hairline p-6 space-y-3 hover:border-hairline-strong transition">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-ink-primary">
                2. Latent Heat Balance: 2,840 kJ/kg Requirement (Slides 12–15)
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Sublimating ice requires 2,840 kJ/kg (heat of fusion 334 kJ/kg + heat of vaporization 2,506 kJ/kg). 
                Because drying is endothermic, product temperature will plummet unless heat is continuously conducted 
                through the vessel wall. In an agitated bed, moving particles continuously replenish contact with 
                the heated wall, multiplying heat transfer rates up to 4× over static shelves.
              </p>
              <div className="text-[11px] font-mono text-rose-400">
                AFD Rule: TCU jacket circulation must supply controlled heat without exceeding product glass transition Tg&apos;.
              </div>
            </div>

            <div className="rounded-2xl bg-bg-panel border border-hairline p-6 space-y-3 hover:border-hairline-strong transition">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-ink-primary">
                3. Constant vs. Falling Rate Drying Kinetics (Slides 16–18)
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Drying proceeds in two regimes: (1) Constant rate period where surface moisture sublimates unimpeded, 
                and (2) Falling rate period where moisture must diffuse through porous dry powder channels. Agitating 
                the bed constantly exposes fresh frozen cores, drastically shortening the falling rate duration.
              </p>
              <div className="text-[11px] font-mono text-blue-400">
                AFD Rule: Dynamic bed turnover eliminates the thick insulating dried layer that stalls static tray lyophilizers.
              </div>
            </div>

            <div className="rounded-2xl bg-bg-panel border border-hairline p-6 space-y-3 hover:border-hairline-strong transition">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-ink-primary">
                4. Energy & Process Optimization: Pre-Concentration (Slides 25, 34–36)
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Thermal drying is the most energy-intensive unit operation. Dewatering feedstocks mechanically 
                (filtration/centrifugation) from 35% to 65% dry solids slashes thermal evaporation energy by 72.5%. 
                For freeze drying, maximizing initial solids concentration minimizes ice sublimation duty and cycle hours.
              </p>
              <div className="text-[11px] font-mono text-emerald-400">
                AFD Rule: Optimize upstream nanofiltration or spray concentration to minimize thermal freeze-drying load.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b border-hairline pb-3">
            <h2 className="text-xl font-bold text-ink-primary font-serif">
              Engineering Synthesis: 4 Core Lessons for the Active Freeze Dryer
            </h2>
            <p className="text-xs text-ink-secondary font-mono mt-0.5">
              How Vrieco-Nauta conical mixing physics directly dictate the operational parameters of the AFD-0.5
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

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
            </div>

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
            </div>

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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
