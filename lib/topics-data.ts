// ─────────────────────────────────────────────────────────────────────────────
// PRE-COMPILED STATIC RESEARCH TOPIC INDEX
// Zero-latency, 120 FPS synchronous data store for MasterBookmarkDrawer
// Eliminates network roundtrips and loading screens entirely.
// ─────────────────────────────────────────────────────────────────────────────

export interface TopicHeading {
  level: number;
  text: string;
  id: string;
}

export interface ChapterTopic {
  slug: string;
  chapterNumber: string;
  title: string;
  act: string;
  actId: string;
  readTime: string;
  headings: TopicHeading[];
}

export const STATIC_CHAPTER_TOPICS: ChapterTopic[] = [
  {
    "slug": "01-physics-and-thermodynamics",
    "chapterNumber": "01",
    "title": "Physics, Thermodynamics & Sublimation Kinetics",
    "act": "Foundations & Flowsheets",
    "actId": "act-1",
    "readTime": "9 min read",
    "headings": [
      {
        "level": 1,
        "text": "01 — Physics, Thermodynamics & Sublimation Kinetics",
        "id": "01-physics-thermodynamics-sublimation-kinetics"
      },
      {
        "level": 2,
        "text": "1. Water Phase Diagram & The Triple Point Boundary",
        "id": "1-water-phase-diagram-the-triple-point-boundary"
      },
      {
        "level": 3,
        "text": "Why Vacuum is Mandatory for Sublimation",
        "id": "why-vacuum-is-mandatory-for-sublimation"
      },
      {
        "level": 2,
        "text": "2. Sensible vs. Latent Heat in Drying Systems",
        "id": "2-sensible-vs-latent-heat-in-drying-systems"
      },
      {
        "level": 3,
        "text": "A. Sensible Heat Energy ($Q_{sens}$)",
        "id": "a-sensible-heat-energy-q_sens"
      },
      {
        "level": 3,
        "text": "B. Latent Heat of Phase Transitions ($\\Delta H$)",
        "id": "b-latent-heat-of-phase-transitions-delta-h"
      },
      {
        "level": 2,
        "text": "3. Vapor Pressure of Ice & Sublimation Mass Transfer Kinetics",
        "id": "3-vapor-pressure-of-ice-sublimation-mass-transfer-kinetics"
      },
      {
        "level": 3,
        "text": "A. The Primary Drying Mass Flow Equation",
        "id": "a-the-primary-drying-mass-flow-equation"
      },
      {
        "level": 3,
        "text": "B. Cake Resistance ($R_p$) Dynamics & The Static Freeze-Drying Bottleneck",
        "id": "b-cake-resistance-r_p-dynamics-the-static-freeze-drying-bottleneck"
      },
      {
        "level": 3,
        "text": "C. Pore Flow Regimes & The Knudsen Number ($Kn$)",
        "id": "c-pore-flow-regimes-the-knudsen-number-kn"
      },
      {
        "level": 3,
        "text": "D. Vapor Duct Sonic Choking ($Ma = 1.0$)",
        "id": "d-vapor-duct-sonic-choking-ma-10"
      },
      {
        "level": 2,
        "text": "4. Moisture Binding Mechanisms & Drying Rate Curves",
        "id": "4-moisture-binding-mechanisms-drying-rate-curves"
      },
      {
        "level": 3,
        "text": "Two Primary Types of Moisture",
        "id": "two-primary-types-of-moisture"
      },
      {
        "level": 3,
        "text": "Constant Rate vs. Falling Rate Periods",
        "id": "constant-rate-vs-falling-rate-periods"
      },
      {
        "level": 2,
        "text": "5. The Agitated Convective Advantage in the AFD",
        "id": "5-the-agitated-convective-advantage-in-the-afd"
      },
      {
        "level": 2,
        "text": "6. Vacuum Boiling Point Depression for Solvent Systems",
        "id": "6-vacuum-boiling-point-depression-for-solvent-systems"
      }
    ]
  },
  {
    "slug": "02-hosokawa-afd-vs-generic-lyophilizers",
    "chapterNumber": "02",
    "title": "Hosokawa AFD vs Generic Lyophilizers & Competitors",
    "act": "Foundations & Flowsheets",
    "actId": "act-1",
    "readTime": "12 min read",
    "headings": [
      {
        "level": 1,
        "text": "02 — Hosokawa AFD vs Generic Lyophilizers & Competitors",
        "id": "02-hosokawa-afd-vs-generic-lyophilizers-competitors"
      },
      {
        "level": 2,
        "text": "1. What Hosokawa's own page tells you (verbatim facts, paraphrased)",
        "id": "1-what-hosokawas-own-page-tells-you-verbatim-facts-paraphrased"
      },
      {
        "level": 2,
        "text": "2. What Hosokawa's own patents tell you (this is where the real engineering detail is)",
        "id": "2-what-hosokawas-own-patents-tell-you-this-is-where-the-real-engineering-detail-is"
      },
      {
        "level": 3,
        "text": "2a. NL1022668C2 / EP1601919B1, \"Stirred freeze drying\" (filed 2003, granted 2004/2012)",
        "id": "2a-nl1022668c2-ep1601919b1-stirred-freeze-drying-filed-2003-granted-20042012"
      },
      {
        "level": 3,
        "text": "2b. NL2026893B1 / WO2022103268A1, \"Freeze dryer and method for freeze drying\" (filed 2020, granted 2022)",
        "id": "2b-nl2026893b1-wo2022103268a1-freeze-dryer-and-method-for-freeze-drying-filed-2020-granted-2022"
      },
      {
        "level": 3,
        "text": "2c. What this tells you about the AFD's real mechanical architecture",
        "id": "2c-what-this-tells-you-about-the-afds-real-mechanical-architecture"
      },
      {
        "level": 2,
        "text": "3. The Nauta Mixer Connection: Proven Mechanical Kinematics",
        "id": "3-the-nauta-mixer-connection-proven-mechanical-kinematics"
      },
      {
        "level": 2,
        "text": "4. Generic Pharma Freeze-Drying Literature vs. The Real AFD",
        "id": "4-generic-pharma-freeze-drying-literature-vs-the-real-afd"
      },
      {
        "level": 3,
        "text": "3b. Alternative Agitated Conical Architectures: Ribocone (Helical Ribbon) vs. Nauta (Screw)",
        "id": "3b-alternative-agitated-conical-architectures-ribocone-helical-ribbon-vs-nauta-screw"
      },
      {
        "level": 3,
        "text": "3c. Conical Paddle Dryer (CPD) for High-Viscosity Slurries & Filter Cakes",
        "id": "3c-conical-paddle-dryer-cpd-for-high-viscosity-slurries-filter-cakes"
      },
      {
        "level": 2,
        "text": "5. Comprehensive Engineering Comparison: Hosokawa AFD vs. Classic Shelf Lyophilizer",
        "id": "5-comprehensive-engineering-comparison-hosokawa-afd-vs-classic-shelf-lyophilizer"
      },
      {
        "level": 2,
        "text": "6. Three-Way Technology Comparison: Hosokawa AFD vs. Lyo Beads (Cryopelletization) vs. Shelf Lyophilizers",
        "id": "6-three-way-technology-comparison-hosokawa-afd-vs-lyo-beads-cryopelletization-vs-shelf-lyophilizers"
      },
      {
        "level": 3,
        "text": "The Mechanism of Lyo Beads",
        "id": "the-mechanism-of-lyo-beads"
      },
      {
        "level": 3,
        "text": "The Tradeoffs: Why Hosokawa AFD is Superior for Bulk Active Production",
        "id": "the-tradeoffs-why-hosokawa-afd-is-superior-for-bulk-active-production"
      }
    ]
  },
  {
    "slug": "03-process-flowsheets-bfd-and-pfd",
    "chapterNumber": "03",
    "title": "Process Flowsheets: Canonical BFD, PFD & Mass Balances",
    "act": "Foundations & Flowsheets",
    "actId": "act-1",
    "readTime": "18 min read",
    "headings": [
      {
        "level": 1,
        "text": "03 — Process Flowsheets: Canonical BFD, PFD & Mass Balances",
        "id": "03-process-flowsheets-canonical-bfd-pfd-mass-balances"
      },
      {
        "level": 2,
        "text": "Process Flow Divergence Overview",
        "id": "process-flow-divergence-overview"
      },
      {
        "level": 2,
        "text": "Step 1: Preparing and Loading the Material",
        "id": "step-1-preparing-and-loading-the-material"
      },
      {
        "level": 3,
        "text": "Step 1 — Vacuum Dryer: Liquid Slurry Ambient Loading",
        "id": "step-1-vacuum-dryer-liquid-slurry-ambient-loading"
      },
      {
        "level": 3,
        "text": "Step 1 — Freeze Dryer: In-Situ Dynamic Cryogenic Freezing",
        "id": "step-1-freeze-dryer-in-situ-dynamic-cryogenic-freezing"
      },
      {
        "level": 2,
        "text": "Step 2: Establishing the System Vacuum",
        "id": "step-2-establishing-the-system-vacuum"
      },
      {
        "level": 3,
        "text": "Step 2 — Vacuum Dryer: Moderate Evaporation Vacuum (20–100 mbar)",
        "id": "step-2-vacuum-dryer-moderate-evaporation-vacuum-20100-mbar"
      },
      {
        "level": 3,
        "text": "Step 2 — Freeze Dryer: Deep Sublimation Vacuum (< 6.11 mbar)",
        "id": "step-2-freeze-dryer-deep-sublimation-vacuum-611-mbar"
      },
      {
        "level": 2,
        "text": "Step 3: Applying Heat Energy",
        "id": "step-3-applying-heat-energy"
      },
      {
        "level": 3,
        "text": "Step 3 — Vacuum Dryer: Conductive Heat Evaporation & Liquid Boiling",
        "id": "step-3-vacuum-dryer-conductive-heat-evaporation-liquid-boiling"
      },
      {
        "level": 3,
        "text": "Step 3 — Freeze Dryer: Controlled Sublimation Energy & Latent Heat Sink",
        "id": "step-3-freeze-dryer-controlled-sublimation-energy-latent-heat-sink"
      },
      {
        "level": 2,
        "text": "Step 4: Vapor Traveling to the Condenser",
        "id": "step-4-vapor-traveling-to-the-condenser"
      },
      {
        "level": 3,
        "text": "Step 4 — Vacuum Dryer: Compact Low-Velocity Vapor Flow (DN50-80)",
        "id": "step-4-vacuum-dryer-compact-low-velocity-vapor-flow-dn50-80"
      },
      {
        "level": 3,
        "text": "Step 4 — Freeze Dryer: Massive >220× Volumetric Expansion & Wide Ducts (DN200-300)",
        "id": "step-4-freeze-dryer-massive-220-volumetric-expansion-wide-ducts-dn200-300"
      },
      {
        "level": 2,
        "text": "Step 5: How the Condenser Traps the Vapor",
        "id": "step-5-how-the-condenser-traps-the-vapor"
      },
      {
        "level": 3,
        "text": "Step 5 — Vacuum Dryer: TEMA Shell & Tube Liquefaction Condenser",
        "id": "step-5-vacuum-dryer-tema-shell-tube-liquefaction-condenser"
      },
      {
        "level": 3,
        "text": "Step 5 — Freeze Dryer: Cryogenic Cold Trap Desublimation & Solid Ice Cake",
        "id": "step-5-freeze-dryer-cryogenic-cold-trap-desublimation-solid-ice-cake"
      },
      {
        "level": 2,
        "text": "Step 6: Discharging the Final Product",
        "id": "step-6-discharging-the-final-product"
      },
      {
        "level": 3,
        "text": "Step 6 — Vacuum Dryer: Dense Agglomerate Cake Discharge",
        "id": "step-6-vacuum-dryer-dense-agglomerate-cake-discharge"
      },
      {
        "level": 3,
        "text": "Step 6 — Freeze Dryer: Porous Free-Flowing Micro-Granular Powder Discharge",
        "id": "step-6-freeze-dryer-porous-free-flowing-micro-granular-powder-discharge"
      },
      {
        "level": 2,
        "text": "Step 7: Post-Batch Cleanup (The Turnaround)",
        "id": "step-7-post-batch-cleanup-the-turnaround"
      },
      {
        "level": 3,
        "text": "Step 7 — Vacuum Dryer: Continuous Solvent Drain & Zero Downtime",
        "id": "step-7-vacuum-dryer-continuous-solvent-drain-zero-downtime"
      },
      {
        "level": 3,
        "text": "Step 7 — Freeze Dryer: Mandatory Ice Trap Thermal Defrost Cycle",
        "id": "step-7-freeze-dryer-mandatory-ice-trap-thermal-defrost-cycle"
      },
      {
        "level": 2,
        "text": "Direct Technical Summary",
        "id": "direct-technical-summary"
      },
      {
        "level": 2,
        "text": "Project Engineering Consultation & Decision Framework",
        "id": "project-engineering-consultation-decision-framework"
      },
      {
        "level": 3,
        "text": "1. System Layout Decision: Greenfield vs. Retrofit",
        "id": "1-system-layout-decision-greenfield-vs-retrofit"
      },
      {
        "level": 3,
        "text": "2. Solvent Selection Engineering Guide",
        "id": "2-solvent-selection-engineering-guide"
      }
    ]
  },
  {
    "slug": "04-system-architecture-and-subsystems",
    "chapterNumber": "04",
    "title": "System Architecture & 17 Subsystems Overview",
    "act": "Foundations & Flowsheets",
    "actId": "act-1",
    "readTime": "6 min read",
    "headings": [
      {
        "level": 1,
        "text": "04 — System Architecture & 17 Subsystems Overview",
        "id": "04-system-architecture-17-subsystems-overview"
      },
      {
        "level": 2,
        "text": "1. Top-Level Subsystem Architecture",
        "id": "1-top-level-subsystem-architecture"
      },
      {
        "level": 2,
        "text": "2. Definitive 17-Subsystem Engineering Specification",
        "id": "2-definitive-17-subsystem-engineering-specification"
      },
      {
        "level": 2,
        "text": "3. How the Process Cycle Exercises the Subsystems",
        "id": "3-how-the-process-cycle-exercises-the-subsystems"
      }
    ]
  },
  {
    "slug": "05-vessel-chamber-agitator-and-materials",
    "chapterNumber": "05",
    "title": "Vessel Conical Chamber, Agitator & Drive Mechanism",
    "act": "Mechanical & Vessel Engineering",
    "actId": "act-2",
    "readTime": "12 min read",
    "headings": [
      {
        "level": 1,
        "text": "05 — Vessel Conical Chamber, Agitator & Drive Mechanism",
        "id": "05-vessel-conical-chamber-agitator-drive-mechanism"
      },
      {
        "level": 2,
        "text": "1. Vessel geometry",
        "id": "1-vessel-geometry"
      },
      {
        "level": 2,
        "text": "1a. Sizing the vessel: working-volume ratio, cone angle, and closures",
        "id": "1a-sizing-the-vessel-working-volume-ratio-cone-angle-and-closures"
      },
      {
        "level": 3,
        "text": "The working-volume ratio is published data: 50%, not 80%",
        "id": "the-working-volume-ratio-is-published-data-50-not-80"
      },
      {
        "level": 3,
        "text": "Volume fraction versus height fraction in a cone",
        "id": "volume-fraction-versus-height-fraction-in-a-cone"
      },
      {
        "level": 3,
        "text": "Selecting cone half-angle",
        "id": "selecting-cone-half-angle"
      },
      {
        "level": 3,
        "text": "Worked sizing example: 10 L working volume (20 L nominal vessel)",
        "id": "worked-sizing-example-10-l-working-volume-20-l-nominal-vessel"
      },
      {
        "level": 2,
        "text": "1b. Top closure and bottom apex: head geometry selection",
        "id": "1b-top-closure-and-bottom-apex-head-geometry-selection"
      },
      {
        "level": 3,
        "text": "Comparing head types for vacuum and pressure service",
        "id": "comparing-head-types-for-vacuum-and-pressure-service"
      },
      {
        "level": 3,
        "text": "Dual load case verification",
        "id": "dual-load-case-verification"
      },
      {
        "level": 3,
        "text": "Bottom apex transition",
        "id": "bottom-apex-transition"
      },
      {
        "level": 2,
        "text": "2. Fittings on the lid",
        "id": "2-fittings-on-the-lid"
      },
      {
        "level": 2,
        "text": "3. Agitator Kinematics & Mixing Dynamics",
        "id": "3-agitator-kinematics-mixing-dynamics"
      },
      {
        "level": 3,
        "text": "Three-Action Triad Kinematics",
        "id": "three-action-triad-kinematics"
      },
      {
        "level": 3,
        "text": "Agitator Comparison: Screw vs. Ribocone Ribbons",
        "id": "agitator-comparison-screw-vs-ribocone-ribbons"
      },
      {
        "level": 3,
        "text": "Sizing Kinematics: The 10:1 Power Ratio",
        "id": "sizing-kinematics-the-101-power-ratio"
      },
      {
        "level": 3,
        "text": "Cantilevered Suspension vs. Bottom Bearing",
        "id": "cantilevered-suspension-vs-bottom-bearing"
      },
      {
        "level": 3,
        "text": "Jacket construction options",
        "id": "jacket-construction-options"
      },
      {
        "level": 2,
        "text": "4. Materials of construction",
        "id": "4-materials-of-construction"
      },
      {
        "level": 3,
        "text": "ASME Section VIII and ASME BPE are complementary",
        "id": "asme-section-viii-and-asme-bpe-are-complementary"
      },
      {
        "level": 2,
        "text": "5. Pressure and vacuum vessel design",
        "id": "5-pressure-and-vacuum-vessel-design"
      },
      {
        "level": 2,
        "text": "6. Bottom discharge valve",
        "id": "6-bottom-discharge-valve"
      }
    ]
  },
  {
    "slug": "06-materials-fabrication-tolerances-and-welding",
    "chapterNumber": "06",
    "title": "Materials, Machining Tolerances, Finishing & Welding",
    "act": "Mechanical & Vessel Engineering",
    "actId": "act-2",
    "readTime": "6 min read",
    "headings": [
      {
        "level": 1,
        "text": "06 — Materials, Machining Tolerances, Finishing & Welding",
        "id": "06-materials-machining-tolerances-finishing-welding"
      },
      {
        "level": 2,
        "text": "1. General principle",
        "id": "1-general-principle"
      },
      {
        "level": 2,
        "text": "2. Item-by-item make/buy assessment",
        "id": "2-item-by-item-makebuy-assessment"
      },
      {
        "level": 2,
        "text": "3. Tolerances and surface finishes worth calling out explicitly",
        "id": "3-tolerances-and-surface-finishes-worth-calling-out-explicitly"
      },
      {
        "level": 2,
        "text": "4. Suggested staged fabrication approach",
        "id": "4-suggested-staged-fabrication-approach"
      }
    ]
  },
  {
    "slug": "07-design-calculations-and-sizing-methodology",
    "chapterNumber": "07",
    "title": "Design Calculations, Sizing Equations & Heat Transfer",
    "act": "Mechanical & Vessel Engineering",
    "actId": "act-2",
    "readTime": "10 min read",
    "headings": [
      {
        "level": 1,
        "text": "07 — Design Calculations, Sizing Equations & Heat Transfer",
        "id": "07-design-calculations-sizing-equations-heat-transfer"
      },
      {
        "level": 2,
        "text": "1. Sublimation rate and thermal duty",
        "id": "1-sublimation-rate-and-thermal-duty"
      },
      {
        "level": 2,
        "text": "2. Required jacket heat-transfer area",
        "id": "2-required-jacket-heat-transfer-area"
      },
      {
        "level": 2,
        "text": "3. Freezing-stage refrigeration duty",
        "id": "3-freezing-stage-refrigeration-duty"
      },
      {
        "level": 2,
        "text": "4. Vacuum pump evacuation time",
        "id": "4-vacuum-pump-evacuation-time"
      },
      {
        "level": 2,
        "text": "5. Agitator motor sizing",
        "id": "5-agitator-motor-sizing"
      },
      {
        "level": 2,
        "text": "6. External-pressure shell thickness: ASME UG-28",
        "id": "6-external-pressure-shell-thickness-asme-ug-28"
      },
      {
        "level": 2,
        "text": "7. External pressure tooling methodology: Division 1 vs Division 2 vs PV Elite",
        "id": "7-external-pressure-tooling-methodology-division-1-vs-division-2-vs-pv-elite"
      }
    ]
  },
  {
    "slug": "08-vessel-sizing-suite-and-parametric-tool",
    "chapterNumber": "08",
    "title": "Parametric Vessel Sizing Suite & Engineering Tools",
    "act": "Mechanical & Vessel Engineering",
    "actId": "act-2",
    "readTime": "12 min read",
    "headings": [
      {
        "level": 1,
        "text": "08 — Parametric Vessel Sizing Suite & Engineering Tools",
        "id": "08-parametric-vessel-sizing-suite-engineering-tools"
      },
      {
        "level": 2,
        "text": "1. What this tool is and what it is not",
        "id": "1-what-this-tool-is-and-what-it-is-not"
      },
      {
        "level": 2,
        "text": "2. Interactive Core Calculation Workbenches",
        "id": "2-interactive-core-calculation-workbenches"
      },
      {
        "level": 3,
        "text": "2.1 Conical Shell Geometry Workbench (Height, Diameter, Slant & Lateral Area)",
        "id": "21-conical-shell-geometry-workbench-height-diameter-slant-lateral-area"
      },
      {
        "level": 3,
        "text": "2.2 The Non-Linear Cone Fill Height Insight (V ∝ h³)",
        "id": "22-the-non-linear-cone-fill-height-insight-v-h"
      },
      {
        "level": 3,
        "text": "2.3 Sublimation Heat Duty & Annular Heat-Transfer Area Cross-Check",
        "id": "23-sublimation-heat-duty-annular-heat-transfer-area-cross-check"
      },
      {
        "level": 3,
        "text": "2.4 ASME Section VIII UG-32 Dished Head Thickness Calculator",
        "id": "24-asme-section-viii-ug-32-dished-head-thickness-calculator"
      },
      {
        "level": 3,
        "text": "2.5 Preliminary Vacuum Buckling & External Pressure Analysis",
        "id": "25-preliminary-vacuum-buckling-external-pressure-analysis"
      },
      {
        "level": 2,
        "text": "3. Parametric Vessel Sizing & Fabrication Suite (Live CAD Simulator)",
        "id": "3-parametric-vessel-sizing-fabrication-suite-live-cad-simulator"
      },
      {
        "level": 2,
        "text": "4. Humanized Technical Specification & Engineering Matrices",
        "id": "4-humanized-technical-specification-engineering-matrices"
      },
      {
        "level": 3,
        "text": "4.1 Hosokawa AFD Published Model Range & Working Volume Matrix",
        "id": "41-hosokawa-afd-published-model-range-working-volume-matrix"
      },
      {
        "level": 3,
        "text": "4.2 Governing Mechanical Sizing Formulation Matrix",
        "id": "42-governing-mechanical-sizing-formulation-matrix"
      },
      {
        "level": 3,
        "text": "4.3 Top Closure Head Types & ASME UG-32/UG-33 Compliance Matrix",
        "id": "43-top-closure-head-types-asme-ug-32ug-33-compliance-matrix"
      },
      {
        "level": 3,
        "text": "4.4 50 mm Annular Jacket Heat Transfer & Hydrodynamics Matrix",
        "id": "44-50-mm-annular-jacket-heat-transfer-hydrodynamics-matrix"
      },
      {
        "level": 2,
        "text": "5. CAD Export & Equipment Schedule JSON Schema",
        "id": "5-cad-export-equipment-schedule-json-schema"
      },
      {
        "level": 2,
        "text": "6. Architectural Role within the Research Lab",
        "id": "6-architectural-role-within-the-research-lab"
      }
    ]
  },
  {
    "slug": "09-cad-solidworks-assembly-and-nozzle-schedule",
    "chapterNumber": "09",
    "title": "CAD SolidWorks Assembly Hierarchy & Nozzle Schedule",
    "act": "Mechanical & Vessel Engineering",
    "actId": "act-2",
    "readTime": "12 min read",
    "headings": [
      {
        "level": 1,
        "text": "09 — CAD SolidWorks Assembly Hierarchy & Nozzle Schedule",
        "id": "09-cad-solidworks-assembly-hierarchy-nozzle-schedule"
      },
      {
        "level": 2,
        "text": "1. Why a separate schedule from the P&ID",
        "id": "1-why-a-separate-schedule-from-the-pid"
      },
      {
        "level": 2,
        "text": "2. Reading the equipment schedule",
        "id": "2-reading-the-equipment-schedule"
      },
      {
        "level": 2,
        "text": "3. Reading the nozzle schedule",
        "id": "3-reading-the-nozzle-schedule"
      },
      {
        "level": 2,
        "text": "4. Reading the valve schedule",
        "id": "4-reading-the-valve-schedule"
      },
      {
        "level": 2,
        "text": "5. What to do with this in SolidWorks, practically",
        "id": "5-what-to-do-with-this-in-solidworks-practically"
      },
      {
        "level": 2,
        "text": "Design Basis",
        "id": "design-basis"
      },
      {
        "level": 2,
        "text": "Major Equipment Schedule",
        "id": "major-equipment-schedule"
      },
      {
        "level": 2,
        "text": "Vessel Nozzle Schedule (V-101)",
        "id": "vessel-nozzle-schedule-v-101"
      },
      {
        "level": 2,
        "text": "Valve Schedule & Fail Positions",
        "id": "valve-schedule-fail-positions"
      }
    ]
  },
  {
    "slug": "10-drawings-and-schematics-to-create",
    "chapterNumber": "10",
    "title": "Workshop Fabrication Drawings, Schematics & GA Layouts",
    "act": "Mechanical & Vessel Engineering",
    "actId": "act-2",
    "readTime": "3 min read",
    "headings": [
      {
        "level": 1,
        "text": "10 — Workshop Fabrication Drawings, Schematics & GA Layouts",
        "id": "10-workshop-fabrication-drawings-schematics-ga-layouts"
      },
      {
        "level": 2,
        "text": "Recommended drawing package",
        "id": "recommended-drawing-package"
      },
      {
        "level": 2,
        "text": "Suggested sequencing",
        "id": "suggested-sequencing"
      }
    ]
  },
  {
    "slug": "11-bill-of-materials-and-system-breakdown",
    "chapterNumber": "11",
    "title": "Itemized Bill of Materials & System Component Breakdown",
    "act": "Mechanical & Vessel Engineering",
    "actId": "act-2",
    "readTime": "2 min read",
    "headings": [
      {
        "level": 1,
        "text": "11 — Itemized Bill of Materials & System Component Breakdown",
        "id": "11-itemized-bill-of-materials-system-component-breakdown"
      },
      {
        "level": 2,
        "text": "Spreadsheet structure",
        "id": "spreadsheet-structure"
      },
      {
        "level": 2,
        "text": "How the BOM maps to the rest of this package",
        "id": "how-the-bom-maps-to-the-rest-of-this-package"
      },
      {
        "level": 2,
        "text": "Subsystems represented in the BOM (17 groups, matching file 04's subsystem map)",
        "id": "subsystems-represented-in-the-bom-17-groups-matching-file-04s-subsystem-map"
      },
      {
        "level": 2,
        "text": "A note on quantities and costs",
        "id": "a-note-on-quantities-and-costs"
      }
    ]
  },
  {
    "slug": "12-refrigeration-vacuum-and-condenser-systems",
    "chapterNumber": "12",
    "title": "Refrigeration, Cold-Trap Condenser & Vacuum Skids",
    "act": "Process Skids, Vacuum & Utilities",
    "actId": "act-3",
    "readTime": "7 min read",
    "headings": [
      {
        "level": 1,
        "text": "12 — Refrigeration, Cold-Trap Condenser & Vacuum Skids",
        "id": "12-refrigeration-cold-trap-condenser-vacuum-skids"
      },
      {
        "level": 2,
        "text": "1. The Temperature Control Unit (TCU)",
        "id": "1-the-temperature-control-unit-tcu"
      },
      {
        "level": 2,
        "text": "2. Refrigeration system design",
        "id": "2-refrigeration-system-design"
      },
      {
        "level": 2,
        "text": "3. Vacuum system",
        "id": "3-vacuum-system"
      },
      {
        "level": 3,
        "text": "3a. Pump selection",
        "id": "3a-pump-selection"
      },
      {
        "level": 3,
        "text": "3b. Pressure instrumentation — and why you need two kinds of gauge",
        "id": "3b-pressure-instrumentation-and-why-you-need-two-kinds-of-gauge"
      },
      {
        "level": 3,
        "text": "3c. Achievable vacuum level",
        "id": "3c-achievable-vacuum-level"
      },
      {
        "level": 3,
        "text": "3d. Vacuum Leak Rate Specification & Qualification (ISO 13408-3)",
        "id": "3d-vacuum-leak-rate-specification-qualification-iso-13408-3"
      },
      {
        "level": 2,
        "text": "4. Condenser vs. Heated Vapor Filter Dome (Material Collector)",
        "id": "4-condenser-vs-heated-vapor-filter-dome-material-collector"
      },
      {
        "level": 3,
        "text": "A. The Heated Vapor Filter Dome",
        "id": "a-the-heated-vapor-filter-dome"
      },
      {
        "level": 3,
        "text": "B. Cryogenic Cold Trap Condenser vs. Liquid Condenser",
        "id": "b-cryogenic-cold-trap-condenser-vs-liquid-condenser"
      },
      {
        "level": 2,
        "text": "5. Valve requirements on the vacuum path",
        "id": "5-valve-requirements-on-the-vacuum-path"
      }
    ]
  },
  {
    "slug": "13-freezing-methods-and-thermal-duty",
    "chapterNumber": "13",
    "title": "Freezing Methods, Cryogenic LN2 & Thermal Heat Duty",
    "act": "Process Skids, Vacuum & Utilities",
    "actId": "act-3",
    "readTime": "9 min read",
    "headings": [
      {
        "level": 1,
        "text": "13 — Freezing Methods, Cryogenic LN2 & Thermal Heat Duty",
        "id": "13-freezing-methods-cryogenic-ln2-thermal-heat-duty"
      },
      {
        "level": 2,
        "text": "1. Direct product-contact freezing: what the patent allows vs. what's actually wise",
        "id": "1-direct-product-contact-freezing-what-the-patent-allows-vs-whats-actually-wise"
      },
      {
        "level": 2,
        "text": "2. How the jacket actually gets cold, then hot again — the TCU/HTF architecture in depth",
        "id": "2-how-the-jacket-actually-gets-cold-then-hot-again-the-tcuhtf-architecture-in-depth"
      },
      {
        "level": 2,
        "text": "3. How agitation, jacket temperature, and vacuum together produce granular freezing (not a solid block)",
        "id": "3-how-agitation-jacket-temperature-and-vacuum-together-produce-granular-freezing-not-a-solid-block"
      },
      {
        "level": 2,
        "text": "4. Thermal duty for the freezing stage — extending file 11's method",
        "id": "4-thermal-duty-for-the-freezing-stage-extending-file-11s-method"
      },
      {
        "level": 2,
        "text": "5. Agitator torque and shear — what actually happens as the batch freezes",
        "id": "5-agitator-torque-and-shear-what-actually-happens-as-the-batch-freezes"
      }
    ]
  },
  {
    "slug": "14-cip-sip-sealing-insulation-and-utilities",
    "chapterNumber": "14",
    "title": "CIP Spray Systems, SIP Sterilization, Sealing & Utilities",
    "act": "Process Skids, Vacuum & Utilities",
    "actId": "act-3",
    "readTime": "7 min read",
    "headings": [
      {
        "level": 1,
        "text": "14 — CIP Spray Systems, SIP Sterilization, Sealing & Utilities",
        "id": "14-cip-spray-systems-sip-sterilization-sealing-utilities"
      },
      {
        "level": 2,
        "text": "1. Clean-In-Place (CIP) Architecture & Spray Nozzle Geometry",
        "id": "1-clean-in-place-cip-architecture-spray-nozzle-geometry"
      },
      {
        "level": 3,
        "text": "A. Cover Spray Nozzles (Drawing 9-4, Doc 8390105_1)",
        "id": "a-cover-spray-nozzles-drawing-9-4-doc-8390105_1"
      },
      {
        "level": 3,
        "text": "B. Vessel Wall Spray Nozzles (Drawing 9-5, Doc 8390106_1)",
        "id": "b-vessel-wall-spray-nozzles-drawing-9-5-doc-8390106_1"
      },
      {
        "level": 3,
        "text": "C. Dual WIP/CIP Distribution Manifold (Drawing 9-1, Doc 8390096_1)",
        "id": "c-dual-wipcip-distribution-manifold-drawing-9-1-doc-8390096_1"
      },
      {
        "level": 2,
        "text": "2. Sterilize-In-Place (SIP) System",
        "id": "2-sterilize-in-place-sip-system"
      },
      {
        "level": 2,
        "text": "3. Dynamic Sealing & Sanitary Materials",
        "id": "3-dynamic-sealing-sanitary-materials"
      },
      {
        "level": 2,
        "text": "4. Vessel Insulation & Cladding",
        "id": "4-vessel-insulation-cladding"
      },
      {
        "level": 2,
        "text": "5. Utility Management Skid (UMS) Interface Matrix",
        "id": "5-utility-management-skid-ums-interface-matrix"
      }
    ]
  },
  {
    "slug": "15-piping-and-instrumentation-diagram",
    "chapterNumber": "15",
    "title": "Complete Piping & Instrumentation Diagram (P&ID)",
    "act": "Process Skids, Vacuum & Utilities",
    "actId": "act-3",
    "readTime": "6 min read",
    "headings": [
      {
        "level": 1,
        "text": "15 — Complete Piping & Instrumentation Diagram (P&ID)",
        "id": "15-complete-piping-instrumentation-diagram-pid"
      },
      {
        "level": 2,
        "text": "1. The alphabet: ISA 5.1 instrument tags",
        "id": "1-the-alphabet-isa-51-instrument-tags"
      },
      {
        "level": 2,
        "text": "2. Line types",
        "id": "2-line-types"
      },
      {
        "level": 2,
        "text": "3. Walking the Diagram: Subsystem by Subsystem",
        "id": "3-walking-the-diagram-subsystem-by-subsystem"
      },
      {
        "level": 2,
        "text": "4. Why Instrumentation Tags Share Loop Identifiers",
        "id": "4-why-instrumentation-tags-share-loop-identifiers"
      },
      {
        "level": 2,
        "text": "5. Architectural Data Model & Integration",
        "id": "5-architectural-data-model-integration"
      }
    ]
  },
  {
    "slug": "16-instrumentation-and-electrical-hardware",
    "chapterNumber": "16",
    "title": "Instrumentation Sensors, Electrical Hardware & Skid Frame",
    "act": "Electrical, Controls & Safety Automation",
    "actId": "act-4",
    "readTime": "6 min read",
    "headings": [
      {
        "level": 1,
        "text": "16 — Instrumentation Sensors, Electrical Hardware & Skid Frame",
        "id": "16-instrumentation-sensors-electrical-hardware-skid-frame"
      },
      {
        "level": 2,
        "text": "1. Process Instrumentation Architecture",
        "id": "1-process-instrumentation-architecture"
      },
      {
        "level": 2,
        "text": "2. Sanitary Process & Vacuum Valve Selection",
        "id": "2-sanitary-process-vacuum-valve-selection"
      },
      {
        "level": 2,
        "text": "3. Control system (PLC/HMI/SCADA)",
        "id": "3-control-system-plchmiscada"
      },
      {
        "level": 2,
        "text": "4. Electrical system",
        "id": "4-electrical-system"
      },
      {
        "level": 2,
        "text": "5. Structural frame",
        "id": "5-structural-frame"
      },
      {
        "level": 2,
        "text": "6. Piping",
        "id": "6-piping"
      }
    ]
  },
  {
    "slug": "17-control-system-architecture",
    "chapterNumber": "17",
    "title": "PLC / SCADA Control Architecture & Industrial Network",
    "act": "Electrical, Controls & Safety Automation",
    "actId": "act-4",
    "readTime": "5 min read",
    "headings": [
      {
        "level": 1,
        "text": "17 — PLC / SCADA Control Architecture & Industrial Network",
        "id": "17-plc-scada-control-architecture-industrial-network"
      },
      {
        "level": 2,
        "text": "1. The one idea that makes everything else make sense",
        "id": "1-the-one-idea-that-makes-everything-else-make-sense"
      },
      {
        "level": 2,
        "text": "2. The four layers, bottom to top",
        "id": "2-the-four-layers-bottom-to-top"
      },
      {
        "level": 2,
        "text": "3. What talks to what (and, just as importantly, what doesn't)",
        "id": "3-what-talks-to-what-and-just-as-importantly-what-doesnt"
      },
      {
        "level": 2,
        "text": "4. Networks",
        "id": "4-networks"
      },
      {
        "level": 2,
        "text": "5. Where the ISA-88 recipe logic (file 21) actually lives",
        "id": "5-where-the-isa-88-recipe-logic-file-21-actually-lives"
      }
    ]
  },
  {
    "slug": "18-batch-sequence-and-operating-cycle",
    "chapterNumber": "18",
    "title": "Automated Batch Sequence, SCADA Phases & Recipe Cycle",
    "act": "Electrical, Controls & Safety Automation",
    "actId": "act-4",
    "readTime": "6 min read",
    "headings": [
      {
        "level": 1,
        "text": "18 — Automated Batch Sequence, SCADA Phases & Recipe Cycle",
        "id": "18-automated-batch-sequence-scada-phases-recipe-cycle"
      },
      {
        "level": 2,
        "text": "1. Why structure the recipe at all, instead of just writing PLC code",
        "id": "1-why-structure-the-recipe-at-all-instead-of-just-writing-plc-code"
      },
      {
        "level": 2,
        "text": "2. This machine's cycle, mapped onto that structure",
        "id": "2-this-machines-cycle-mapped-onto-that-structure"
      },
      {
        "level": 2,
        "text": "3. How a phase actually behaves (the part that removes the \"PLC code = magic\" feeling)",
        "id": "3-how-a-phase-actually-behaves-the-part-that-removes-the-plc-code-magic-feeling"
      },
      {
        "level": 2,
        "text": "4. Quantitative Automated Transition Logic: Ending Primary Drying",
        "id": "4-quantitative-automated-transition-logic-ending-primary-drying"
      },
      {
        "level": 3,
        "text": "Gate 1: Comparative Pressure Divergence (`PIT-101A` vs `PIT-101B`)",
        "id": "gate-1-comparative-pressure-divergence-pit-101a-vs-pit-101b"
      },
      {
        "level": 3,
        "text": "Gate 2: Automated Pressure Rise Test (PRT) / Manometric Temperature Measurement (MTM)",
        "id": "gate-2-automated-pressure-rise-test-prt-manometric-temperature-measurement-mtm"
      },
      {
        "level": 2,
        "text": "5. The full batch as one state diagram",
        "id": "5-the-full-batch-as-one-state-diagram"
      },
      {
        "level": 2,
        "text": "6. Recipe vs. equipment — the other half of ISA-88",
        "id": "6-recipe-vs-equipment-the-other-half-of-isa-88"
      }
    ]
  },
  {
    "slug": "19-interlocks-cause-effect-matrix-and-io-list",
    "chapterNumber": "19",
    "title": "Safety Interlocks, Cause & Effect Matrix & I/O Schedule",
    "act": "Electrical, Controls & Safety Automation",
    "actId": "act-4",
    "readTime": "11 min read",
    "headings": [
      {
        "level": 1,
        "text": "19 — Safety Interlocks, Cause & Effect Matrix & I/O Schedule",
        "id": "19-safety-interlocks-cause-effect-matrix-io-schedule"
      },
      {
        "level": 2,
        "text": "1. What a Cause & Effect (C&E) Matrix actually is, and why it's the right format",
        "id": "1-what-a-cause-effect-ce-matrix-actually-is-and-why-its-the-right-format"
      },
      {
        "level": 2,
        "text": "2. Reading the columns in `cause_and_effect_matrix.csv`",
        "id": "2-reading-the-columns-in-cause_and_effect_matrixcsv"
      },
      {
        "level": 2,
        "text": "3. Two interlocks worth understanding in detail (because the *reasoning*, not just the row, is the transferable skill)",
        "id": "3-two-interlocks-worth-understanding-in-detail-because-the-reasoning-not-just-the-row-is-the-transferable-skill"
      },
      {
        "level": 2,
        "text": "4. Reading the I/O list",
        "id": "4-reading-the-io-list"
      },
      {
        "level": 2,
        "text": "5. What this file deliberately does not do",
        "id": "5-what-this-file-deliberately-does-not-do"
      },
      {
        "level": 2,
        "text": "IEC 62881 Cause & Effect Interlock Matrix",
        "id": "iec-62881-cause-effect-interlock-matrix"
      },
      {
        "level": 2,
        "text": "Complete Control System I/O List (30 Tags)",
        "id": "complete-control-system-io-list-30-tags"
      }
    ]
  },
  {
    "slug": "20-safety-and-hazard-analysis",
    "chapterNumber": "20",
    "title": "Safety Analysis, HAZOP, ATEX & Explosion Protection",
    "act": "Electrical, Controls & Safety Automation",
    "actId": "act-4",
    "readTime": "7 min read",
    "headings": [
      {
        "level": 1,
        "text": "20 — Safety Analysis, HAZOP, ATEX & Explosion Protection",
        "id": "20-safety-analysis-hazop-atex-explosion-protection"
      },
      {
        "level": 2,
        "text": "1. Vacuum / implosion hazard",
        "id": "1-vacuum-implosion-hazard"
      },
      {
        "level": 2,
        "text": "2. Refrigeration hazards",
        "id": "2-refrigeration-hazards"
      },
      {
        "level": 2,
        "text": "3. Electrical hazards",
        "id": "3-electrical-hazards"
      },
      {
        "level": 2,
        "text": "4. Combustible dust hazard (ATEX / NFPA 652)",
        "id": "4-combustible-dust-hazard-atex-nfpa-652"
      },
      {
        "level": 2,
        "text": "5. Pressure-relief and general process safety",
        "id": "5-pressure-relief-and-general-process-safety"
      },
      {
        "level": 2,
        "text": "6. Where this package draws the \"educational/prototype\" line",
        "id": "6-where-this-package-draws-the-educationalprototype-line"
      }
    ]
  },
  {
    "slug": "21-commissioning-and-qualification-test-plan",
    "chapterNumber": "21",
    "title": "Commissioning, Hydrostatic Testing & Vacuum Leak Qual",
    "act": "Commissioning & Maintenance",
    "actId": "act-5",
    "readTime": "5 min read",
    "headings": [
      {
        "level": 1,
        "text": "21 — Commissioning, Hydrostatic Testing & Vacuum Leak Qual",
        "id": "21-commissioning-hydrostatic-testing-vacuum-leak-qual"
      },
      {
        "level": 2,
        "text": "Stage 1 — Pre-power mechanical checks",
        "id": "stage-1-pre-power-mechanical-checks"
      },
      {
        "level": 2,
        "text": "Stage 2 — Electrical pre-commissioning (power off, then controlled power-on)",
        "id": "stage-2-electrical-pre-commissioning-power-off-then-controlled-power-on"
      },
      {
        "level": 2,
        "text": "Stage 3 — Empty-vessel vacuum and leak testing",
        "id": "stage-3-empty-vessel-vacuum-and-leak-testing"
      },
      {
        "level": 2,
        "text": "Stage 4 — Empty-vessel thermal (TCU/jacket) testing",
        "id": "stage-4-empty-vessel-thermal-tcujacket-testing"
      },
      {
        "level": 2,
        "text": "Stage 5 — Agitator functional/load testing",
        "id": "stage-5-agitator-functionalload-testing"
      },
      {
        "level": 2,
        "text": "Stage 6 — Integrated cold/vacuum test (no product, or an inert placebo)",
        "id": "stage-6-integrated-coldvacuum-test-no-product-or-an-inert-placebo"
      },
      {
        "level": 2,
        "text": "Stage 7 — CIP (and SIP, if equipped) commissioning",
        "id": "stage-7-cip-and-sip-if-equipped-commissioning"
      },
      {
        "level": 2,
        "text": "Stage 8 — First real product run",
        "id": "stage-8-first-real-product-run"
      },
      {
        "level": 2,
        "text": "A note on documentation discipline",
        "id": "a-note-on-documentation-discipline"
      }
    ]
  },
  {
    "slug": "22-maintenance-and-troubleshooting",
    "chapterNumber": "22",
    "title": "Preventative Maintenance, Seal Overhaul & Diagnostics",
    "act": "Commissioning & Maintenance",
    "actId": "act-5",
    "readTime": "5 min read",
    "headings": [
      {
        "level": 1,
        "text": "22 — Preventative Maintenance, Seal Overhaul & Diagnostics",
        "id": "22-preventative-maintenance-seal-overhaul-diagnostics"
      },
      {
        "level": 2,
        "text": "1. Preventive maintenance schedule (generic starting point — tune against your own experience)",
        "id": "1-preventive-maintenance-schedule-generic-starting-point-tune-against-your-own-experience"
      },
      {
        "level": 2,
        "text": "2. Troubleshooting matrix",
        "id": "2-troubleshooting-matrix"
      },
      {
        "level": 2,
        "text": "3. A general troubleshooting principle worth stating explicitly",
        "id": "3-a-general-troubleshooting-principle-worth-stating-explicitly"
      }
    ]
  }
];
