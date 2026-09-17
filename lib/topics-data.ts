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
    "slug": "00-readme",
    "chapterNumber": "00",
    "title": "Hosokawa AFD Pharma Freeze Dryer — Deep Technical Study & Workshop Build Package",
    "act": "Overview",
    "actId": "act-0",
    "readTime": "4 min read",
    "headings": [
      {
        "level": 1,
        "text": "Hosokawa AFD Pharma Freeze Dryer — Deep Technical Study & Workshop Build Package",
        "id": "hosokawa-afd-pharma-freeze-dryer-deep-technical-study-workshop-build-package"
      },
      {
        "level": 2,
        "text": "How this package is organized",
        "id": "how-this-package-is-organized"
      },
      {
        "level": 2,
        "text": "Critical framing — read this before anything else",
        "id": "critical-framing-read-this-before-anything-else"
      },
      {
        "level": 2,
        "text": "Scope honesty",
        "id": "scope-honesty"
      }
    ]
  },
  {
    "slug": "01-beginner-foundations-and-glossary",
    "chapterNumber": "01",
    "title": "Beginner Foundations & Glossary",
    "act": "Foundations",
    "actId": "act-1",
    "readTime": "6 min read",
    "headings": [
      {
        "level": 1,
        "text": "01 — Beginner Foundations & Glossary",
        "id": "01-beginner-foundations-glossary"
      },
      {
        "level": 2,
        "text": "What freeze-drying actually is",
        "id": "what-freeze-drying-actually-is"
      },
      {
        "level": 2,
        "text": "Why pharma cares specifically",
        "id": "why-pharma-cares-specifically"
      },
      {
        "level": 2,
        "text": "The three-stage process, in slightly more depth",
        "id": "the-three-stage-process-in-slightly-more-depth"
      },
      {
        "level": 2,
        "text": "Terms you need before the rest of this package makes sense",
        "id": "terms-you-need-before-the-rest-of-this-package-makes-sense"
      },
      {
        "level": 2,
        "text": "Reading order recommendation",
        "id": "reading-order-recommendation"
      }
    ]
  },
  {
    "slug": "02-physics-and-thermodynamics",
    "chapterNumber": "02",
    "title": "Physics & Thermodynamics of Freeze-Drying",
    "act": "Foundations",
    "actId": "act-1",
    "readTime": "8 min read",
    "headings": [
      {
        "level": 1,
        "text": "02 — Physics & Thermodynamics of Freeze-Drying",
        "id": "02-physics-thermodynamics-of-freeze-drying"
      },
      {
        "level": 2,
        "text": "1. The water phase diagram — why vacuum, not just cold",
        "id": "1-the-water-phase-diagram-why-vacuum-not-just-cold"
      },
      {
        "level": 2,
        "text": "2. Vapor pressure of ice vs. temperature (why \"how cold\" sets \"how low a vacuum you need\")",
        "id": "2-vapor-pressure-of-ice-vs-temperature-why-how-cold-sets-how-low-a-vacuum-you-need"
      },
      {
        "level": 2,
        "text": "3. Heat and mass transfer during primary drying — the Pikal model",
        "id": "3-heat-and-mass-transfer-during-primary-drying-the-pikal-model"
      },
      {
        "level": 2,
        "text": "4. Secondary drying / desorption",
        "id": "4-secondary-drying-desorption"
      },
      {
        "level": 2,
        "text": "5. How agitation changes the heat-transfer picture (the AFD-relevant physics)",
        "id": "5-how-agitation-changes-the-heat-transfer-picture-the-afd-relevant-physics"
      },
      {
        "level": 2,
        "text": "6. Freezing rate and ice crystal structure",
        "id": "6-freezing-rate-and-ice-crystal-structure"
      },
      {
        "level": 2,
        "text": "Sources for this file",
        "id": "sources-for-this-file"
      }
    ]
  },
  {
    "slug": "03-hosokawa-afd-vs-generic-lyophilizers",
    "chapterNumber": "03",
    "title": "What Is Actually Hosokawa/AFD-Specific vs. Generic Pharma Freeze-Drying",
    "act": "The Machine",
    "actId": "act-2",
    "readTime": "12 min read",
    "headings": [
      {
        "level": 1,
        "text": "03 — What Is Actually Hosokawa/AFD-Specific vs. Generic Pharma Freeze-Drying",
        "id": "03-what-is-actually-hosokawaafd-specific-vs-generic-pharma-freeze-drying"
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
        "text": "3. The Nauta® mixer connection — your best real-world reference platform",
        "id": "3-the-nauta-mixer-connection-your-best-real-world-reference-platform"
      },
      {
        "level": 2,
        "text": "4. Generic pharma freeze-drying literature that does *not* directly describe the AFD",
        "id": "4-generic-pharma-freeze-drying-literature-that-does-not-directly-describe-the-afd"
      },
      {
        "level": 2,
        "text": "5. Quick-reference: AFD-family vs. classic shelf/tray dryer",
        "id": "5-quick-reference-afd-family-vs-classic-shelftray-dryer"
      }
    ]
  },
  {
    "slug": "04-system-architecture-and-subsystems",
    "chapterNumber": "04",
    "title": "System Architecture & Subsystem Breakdown",
    "act": "The Machine",
    "actId": "act-2",
    "readTime": "4 min read",
    "headings": [
      {
        "level": 1,
        "text": "04 — System Architecture & Subsystem Breakdown",
        "id": "04-system-architecture-subsystem-breakdown"
      },
      {
        "level": 2,
        "text": "Top-level subsystem map",
        "id": "top-level-subsystem-map"
      },
      {
        "level": 2,
        "text": "Subsystem list, with what each one does and where it's covered in this package",
        "id": "subsystem-list-with-what-each-one-does-and-where-its-covered-in-this-package"
      },
      {
        "level": 2,
        "text": "How the process cycle exercises each subsystem",
        "id": "how-the-process-cycle-exercises-each-subsystem"
      },
      {
        "level": 2,
        "text": "Why this maps well to a workshop build",
        "id": "why-this-maps-well-to-a-workshop-build"
      }
    ]
  },
  {
    "slug": "05-vessel-chamber-agitator-and-materials",
    "chapterNumber": "05",
    "title": "Vessel, Chamber, Agitator & Materials",
    "act": "The Machine",
    "actId": "act-2",
    "readTime": "7 min read",
    "headings": [
      {
        "level": 1,
        "text": "05 — Vessel, Chamber, Agitator & Materials",
        "id": "05-vessel-chamber-agitator-materials"
      },
      {
        "level": 2,
        "text": "1. Vessel geometry",
        "id": "1-vessel-geometry"
      },
      {
        "level": 2,
        "text": "2. Fittings on the lid (per NL2026893B1's worked example — useful as a checklist)",
        "id": "2-fittings-on-the-lid-per-nl2026893b1s-worked-example-useful-as-a-checklist"
      },
      {
        "level": 2,
        "text": "3. Agitator",
        "id": "3-agitator"
      },
      {
        "level": 2,
        "text": "4. Materials of construction",
        "id": "4-materials-of-construction"
      },
      {
        "level": 2,
        "text": "5. Pressure/vacuum vessel design (structural)",
        "id": "5-pressurevacuum-vessel-design-structural"
      },
      {
        "level": 2,
        "text": "6. Bottom discharge valve",
        "id": "6-bottom-discharge-valve"
      }
    ]
  },
  {
    "slug": "06-refrigeration-vacuum-and-condenser-systems",
    "chapterNumber": "06",
    "title": "Refrigeration, Vacuum & Condenser/Material Collector Systems",
    "act": "The Machine",
    "actId": "act-2",
    "readTime": "7 min read",
    "headings": [
      {
        "level": 1,
        "text": "06 — Refrigeration, Vacuum & Condenser/Material Collector Systems",
        "id": "06-refrigeration-vacuum-condensermaterial-collector-systems"
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
        "level": 2,
        "text": "4. Condenser vs. material collector — don't conflate these",
        "id": "4-condenser-vs-material-collector-dont-conflate-these"
      },
      {
        "level": 2,
        "text": "5. Valve requirements on the vacuum path",
        "id": "5-valve-requirements-on-the-vacuum-path"
      }
    ]
  },
  {
    "slug": "07-cip-sip-sealing-insulation-utilities",
    "chapterNumber": "07",
    "title": "CIP/SIP, Sealing, Insulation & Utilities",
    "act": "The Machine",
    "actId": "act-2",
    "readTime": "5 min read",
    "headings": [
      {
        "level": 1,
        "text": "07 — CIP/SIP, Sealing, Insulation & Utilities",
        "id": "07-cipsip-sealing-insulation-utilities"
      },
      {
        "level": 2,
        "text": "1. Clean-In-Place (CIP)",
        "id": "1-clean-in-place-cip"
      },
      {
        "level": 2,
        "text": "2. Sterilize-In-Place (SIP)",
        "id": "2-sterilize-in-place-sip"
      },
      {
        "level": 2,
        "text": "3. Sealing",
        "id": "3-sealing"
      },
      {
        "level": 2,
        "text": "4. Insulation",
        "id": "4-insulation"
      },
      {
        "level": 2,
        "text": "5. Utility Management Skid",
        "id": "5-utility-management-skid"
      }
    ]
  },
  {
    "slug": "08-instrumentation-controls-electrical-structural",
    "chapterNumber": "08",
    "title": "Instrumentation, Controls, Electrical, Structural Frame & Piping",
    "act": "The Machine",
    "actId": "act-2",
    "readTime": "6 min read",
    "headings": [
      {
        "level": 1,
        "text": "08 — Instrumentation, Controls, Electrical, Structural Frame & Piping",
        "id": "08-instrumentation-controls-electrical-structural-frame-piping"
      },
      {
        "level": 2,
        "text": "1. Instrumentation",
        "id": "1-instrumentation"
      },
      {
        "level": 2,
        "text": "2. Valves",
        "id": "2-valves"
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
    "slug": "09-safety-and-hazard-analysis",
    "chapterNumber": "09",
    "title": "Safety & Hazard Analysis",
    "act": "Build It",
    "actId": "act-3",
    "readTime": "7 min read",
    "headings": [
      {
        "level": 1,
        "text": "09 — Safety & Hazard Analysis",
        "id": "09-safety-hazard-analysis"
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
    "slug": "10-materials-fabrication-tolerances-workshop-vs-purchased",
    "chapterNumber": "10",
    "title": "Materials, Fabrication, Tolerances & Workshop vs. Purchased",
    "act": "Build It",
    "actId": "act-3",
    "readTime": "6 min read",
    "headings": [
      {
        "level": 1,
        "text": "10 — Materials, Fabrication, Tolerances & Workshop vs. Purchased",
        "id": "10-materials-fabrication-tolerances-workshop-vs-purchased"
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
    "slug": "11-design-calculations-and-sizing-methodology",
    "chapterNumber": "11",
    "title": "Design Calculations & Sizing Methodology",
    "act": "Build It",
    "actId": "act-3",
    "readTime": "8 min read",
    "headings": [
      {
        "level": 1,
        "text": "11 — Design Calculations & Sizing Methodology",
        "id": "11-design-calculations-sizing-methodology"
      },
      {
        "level": 2,
        "text": "1. Sublimation rate ↔ heat duty (cross-checked against Hosokawa's published figure)",
        "id": "1-sublimation-rate-heat-duty-cross-checked-against-hosokawas-published-figure"
      },
      {
        "level": 2,
        "text": "2. Required jacket heat-transfer area",
        "id": "2-required-jacket-heat-transfer-area"
      },
      {
        "level": 2,
        "text": "3. Freezing-stage refrigeration load",
        "id": "3-freezing-stage-refrigeration-load"
      },
      {
        "level": 2,
        "text": "4. Vacuum pump-down time (empty-vessel, first-pass estimate)",
        "id": "4-vacuum-pump-down-time-empty-vessel-first-pass-estimate"
      },
      {
        "level": 2,
        "text": "5. Agitator power — an honest \"you must measure this\" section",
        "id": "5-agitator-power-an-honest-you-must-measure-this-section"
      },
      {
        "level": 2,
        "text": "6. External-pressure vessel thickness — method reference",
        "id": "6-external-pressure-vessel-thickness-method-reference"
      }
    ]
  },
  {
    "slug": "12-bill-of-materials-and-system-breakdown",
    "chapterNumber": "12",
    "title": "Bill of Materials & System Breakdown",
    "act": "Build It",
    "actId": "act-3",
    "readTime": "2 min read",
    "headings": [
      {
        "level": 1,
        "text": "12 — Bill of Materials & System Breakdown",
        "id": "12-bill-of-materials-system-breakdown"
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
    "slug": "13-drawings-and-schematics-to-create",
    "chapterNumber": "13",
    "title": "Drawings & Schematics to Create Before Cutting Metal",
    "act": "Build It",
    "actId": "act-3",
    "readTime": "3 min read",
    "headings": [
      {
        "level": 1,
        "text": "13 — Drawings & Schematics to Create Before Cutting Metal",
        "id": "13-drawings-schematics-to-create-before-cutting-metal"
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
    "slug": "14-validation-qualification-and-gmp-compliance",
    "chapterNumber": "14",
    "title": "Validation, Qualification & GMP Compliance",
    "act": "Make It Real",
    "actId": "act-4",
    "readTime": "5 min read",
    "headings": [
      {
        "level": 1,
        "text": "14 — Validation, Qualification & GMP Compliance",
        "id": "14-validation-qualification-gmp-compliance"
      },
      {
        "level": 2,
        "text": "1. The regulatory framework, at a glance",
        "id": "1-the-regulatory-framework-at-a-glance"
      },
      {
        "level": 2,
        "text": "2. The qualification lifecycle: DQ → IQ → OQ → PQ",
        "id": "2-the-qualification-lifecycle-dq-iq-oq-pq"
      },
      {
        "level": 2,
        "text": "3. What this means concretely for a freeze dryer specifically",
        "id": "3-what-this-means-concretely-for-a-freeze-dryer-specifically"
      },
      {
        "level": 2,
        "text": "4. Where this package's own claims stop",
        "id": "4-where-this-packages-own-claims-stop"
      }
    ]
  },
  {
    "slug": "15-commissioning-test-plan",
    "chapterNumber": "15",
    "title": "Commissioning Test Plan (FAT/SAT-Style, for Your Own Build)",
    "act": "Make It Real",
    "actId": "act-4",
    "readTime": "5 min read",
    "headings": [
      {
        "level": 1,
        "text": "15 — Commissioning Test Plan (FAT/SAT-Style, for Your Own Build)",
        "id": "15-commissioning-test-plan-fatsat-style-for-your-own-build"
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
    "slug": "16-build-roadmap-prototype-to-pharma-capable",
    "chapterNumber": "16",
    "title": "Build Roadmap: Prototype → Pharma-Capable System",
    "act": "Build It",
    "actId": "act-3",
    "readTime": "4 min read",
    "headings": [
      {
        "level": 1,
        "text": "16 — Build Roadmap: Prototype → Pharma-Capable System",
        "id": "16-build-roadmap-prototype-pharma-capable-system"
      },
      {
        "level": 2,
        "text": "Stage 0 — Study & design (this package's files 01–13)",
        "id": "stage-0-study-design-this-packages-files-0113"
      },
      {
        "level": 2,
        "text": "Stage 1 — Non-vacuum mechanical mockup",
        "id": "stage-1-non-vacuum-mechanical-mockup"
      },
      {
        "level": 2,
        "text": "Stage 2 — Bench-scale cold/vacuum prototype (small batch, no CIP/SIP, atmospheric-adjacent instrumentation)",
        "id": "stage-2-bench-scale-coldvacuum-prototype-small-batch-no-cipsip-atmospheric-adjacent-instrumentation"
      },
      {
        "level": 2,
        "text": "Stage 3 — Pilot-scale system with full subsystem set",
        "id": "stage-3-pilot-scale-system-with-full-subsystem-set"
      },
      {
        "level": 2,
        "text": "Stage 4 — GMP-capable system (only if the goal is genuinely regulated manufacturing)",
        "id": "stage-4-gmp-capable-system-only-if-the-goal-is-genuinely-regulated-manufacturing"
      },
      {
        "level": 2,
        "text": "Suggested overall sequencing logic",
        "id": "suggested-overall-sequencing-logic"
      }
    ]
  },
  {
    "slug": "17-maintenance-and-troubleshooting",
    "chapterNumber": "17",
    "title": "Maintenance & Troubleshooting",
    "act": "Make It Real",
    "actId": "act-4",
    "readTime": "5 min read",
    "headings": [
      {
        "level": 1,
        "text": "17 — Maintenance & Troubleshooting",
        "id": "17-maintenance-troubleshooting"
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
  },
  {
    "slug": "18-references-and-source-list",
    "chapterNumber": "18",
    "title": "References & Source List",
    "act": "Make It Real",
    "actId": "act-4",
    "readTime": "5 min read",
    "headings": [
      {
        "level": 1,
        "text": "18 — References & Source List",
        "id": "18-references-source-list"
      },
      {
        "level": 2,
        "text": "A. Hosokawa primary sources (AFD-specific)",
        "id": "a-hosokawa-primary-sources-afd-specific"
      },
      {
        "level": 2,
        "text": "B. Patents (the core AFD engineering-detail sources — file 03)",
        "id": "b-patents-the-core-afd-engineering-detail-sources-file-03"
      },
      {
        "level": 2,
        "text": "C. Freeze-drying physics & process science",
        "id": "c-freeze-drying-physics-process-science"
      },
      {
        "level": 2,
        "text": "D. Refrigeration & vacuum systems",
        "id": "d-refrigeration-vacuum-systems"
      },
      {
        "level": 2,
        "text": "E. Sanitary design, materials & standards",
        "id": "e-sanitary-design-materials-standards"
      },
      {
        "level": 2,
        "text": "F. Pressure/vacuum vessel design",
        "id": "f-pressurevacuum-vessel-design"
      },
      {
        "level": 2,
        "text": "G. Agitator drives & seals",
        "id": "g-agitator-drives-seals"
      },
      {
        "level": 2,
        "text": "H. Control systems, validation & GMP compliance",
        "id": "h-control-systems-validation-gmp-compliance"
      },
      {
        "level": 2,
        "text": "I. Safety — combustible dust / ATEX / NFPA",
        "id": "i-safety-combustible-dust-atex-nfpa"
      },
      {
        "level": 2,
        "text": "J. Fundamental physical/thermodynamic data",
        "id": "j-fundamental-physicalthermodynamic-data"
      },
      {
        "level": 2,
        "text": "How this package used these sources",
        "id": "how-this-package-used-these-sources"
      },
      {
        "level": 2,
        "text": "What this package could not find publicly (stated explicitly, per your request)",
        "id": "what-this-package-could-not-find-publicly-stated-explicitly-per-your-request"
      }
    ]
  },
  {
    "slug": "19-piping-and-instrumentation-diagram",
    "chapterNumber": "19",
    "title": "Piping & Instrumentation Diagram (P&ID) and ISA 5.1 Tagging",
    "act": "Automation & P&ID",
    "actId": "act-5",
    "readTime": "7 min read",
    "headings": [
      {
        "level": 1,
        "text": "19 — Piping & Instrumentation Diagram (P&ID) and ISA 5.1 Tagging",
        "id": "19-piping-instrumentation-diagram-pid-and-isa-51-tagging"
      },
      {
        "level": 2,
        "text": "1. The ISA 5.1 Tagging Alphabet",
        "id": "1-the-isa-51-tagging-alphabet"
      },
      {
        "level": 3,
        "text": "First Letter — Physical Variable Being Measured",
        "id": "first-letter-physical-variable-being-measured"
      },
      {
        "level": 3,
        "text": "Succeeding Letters — Instrument Function & Role",
        "id": "succeeding-letters-instrument-function-role"
      },
      {
        "level": 3,
        "text": "Decoding Practical Examples:",
        "id": "decoding-practical-examples"
      },
      {
        "level": 2,
        "text": "2. Bubble Geometry & Line Symbology",
        "id": "2-bubble-geometry-line-symbology"
      },
      {
        "level": 2,
        "text": "3. Walkthrough of Process Flow Subsystems",
        "id": "3-walkthrough-of-process-flow-subsystems"
      },
      {
        "level": 3,
        "text": "Subsystem A: Agitated Conical Vessel (`V-101`)",
        "id": "subsystem-a-agitated-conical-vessel-v-101"
      },
      {
        "level": 3,
        "text": "Subsystem B: Dual-Gauge Vacuum Measurement (`PIT-101A` vs `PIT-101B`)",
        "id": "subsystem-b-dual-gauge-vacuum-measurement-pit-101a-vs-pit-101b"
      },
      {
        "level": 3,
        "text": "Subsystem C: Vapor Flow & Dust Separation (`V-102`)",
        "id": "subsystem-c-vapor-flow-dust-separation-v-102"
      },
      {
        "level": 3,
        "text": "Subsystem D: Refrigerated Condenser Coil (`E-101`) & Vacuum Train (`PKG-401`)",
        "id": "subsystem-d-refrigerated-condenser-coil-e-101-vacuum-train-pkg-401"
      },
      {
        "level": 3,
        "text": "Subsystem E: Temperature Control Unit (`TCU-201`) & Cascade Skid (`PKG-301`)",
        "id": "subsystem-e-temperature-control-unit-tcu-201-cascade-skid-pkg-301"
      }
    ]
  },
  {
    "slug": "20-control-system-architecture",
    "chapterNumber": "20",
    "title": "Control System Architecture & Safety Separation (BPCS vs. SIS)",
    "act": "Automation & P&ID",
    "actId": "act-5",
    "readTime": "6 min read",
    "headings": [
      {
        "level": 1,
        "text": "20 — Control System Architecture & Safety Separation (BPCS vs. SIS)",
        "id": "20-control-system-architecture-safety-separation-bpcs-vs-sis"
      },
      {
        "level": 2,
        "text": "1. The Core Axiom: BPCS vs. SIS Isolation",
        "id": "1-the-core-axiom-bpcs-vs-sis-isolation"
      },
      {
        "level": 3,
        "text": "Tier 1: Basic Process Control System (BPCS)",
        "id": "tier-1-basic-process-control-system-bpcs"
      },
      {
        "level": 3,
        "text": "Tier 2: Safety Instrumented System (SIS)",
        "id": "tier-2-safety-instrumented-system-sis"
      },
      {
        "level": 2,
        "text": "2. Hardwired Emergency Stop Philosophy (`ESD-001`)",
        "id": "2-hardwired-emergency-stop-philosophy-esd-001"
      },
      {
        "level": 2,
        "text": "3. The Four-Tier Automation Hierarchy",
        "id": "3-the-four-tier-automation-hierarchy"
      },
      {
        "level": 3,
        "text": "Layer 1: Field Devices",
        "id": "layer-1-field-devices"
      },
      {
        "level": 3,
        "text": "Layer 2: I/O Interface",
        "id": "layer-2-io-interface"
      },
      {
        "level": 3,
        "text": "Layer 3: Programmable Automation Controllers",
        "id": "layer-3-programmable-automation-controllers"
      },
      {
        "level": 3,
        "text": "Layer 4: Supervisory SCADA & Data Historian",
        "id": "layer-4-supervisory-scada-data-historian"
      },
      {
        "level": 2,
        "text": "4. Communication & Network Architecture",
        "id": "4-communication-network-architecture"
      }
    ]
  },
  {
    "slug": "21-batch-sequence-and-operating-cycle",
    "chapterNumber": "21",
    "title": "Batch Sequence & Operating Cycle (ISA-88 State Machine)",
    "act": "Automation & P&ID",
    "actId": "act-5",
    "readTime": "7 min read",
    "headings": [
      {
        "level": 1,
        "text": "21 — Batch Sequence & Operating Cycle (ISA-88 State Machine)",
        "id": "21-batch-sequence-operating-cycle-isa-88-state-machine"
      },
      {
        "level": 2,
        "text": "1. The ISA-88 Hierarchical Model",
        "id": "1-the-isa-88-hierarchical-model"
      },
      {
        "level": 3,
        "text": "Why Phases Are the Magic Building Block",
        "id": "why-phases-are-the-magic-building-block"
      },
      {
        "level": 2,
        "text": "2. The Universal Phase State Machine",
        "id": "2-the-universal-phase-state-machine"
      },
      {
        "level": 3,
        "text": "Standard States & Behaviors",
        "id": "standard-states-behaviors"
      },
      {
        "level": 2,
        "text": "3. AFD Lyophilization Cycle Mapped to ISA-88",
        "id": "3-afd-lyophilization-cycle-mapped-to-isa-88"
      },
      {
        "level": 2,
        "text": "4. Automated Phase Transition: Comparative Pressure Convergence",
        "id": "4-automated-phase-transition-comparative-pressure-convergence"
      }
    ]
  },
  {
    "slug": "22-practical-equipment-sizing-vacuum-and-cryogenics",
    "chapterNumber": "22",
    "title": "Practical Equipment Sizing: Vacuum, -60°C Cryogenics & Safety Interlocks",
    "act": "Automation & P&ID",
    "actId": "act-5",
    "readTime": "9 min read",
    "headings": [
      {
        "level": 1,
        "text": "22 — Practical Equipment Sizing: Vacuum, -60°C Cryogenics & Safety Interlocks",
        "id": "22-practical-equipment-sizing-vacuum--60c-cryogenics-safety-interlocks"
      },
      {
        "level": 2,
        "text": "1. Vacuum System Selection: Reaching & Holding 0.04 mbar",
        "id": "1-vacuum-system-selection-reaching-holding-004-mbar"
      },
      {
        "level": 3,
        "text": "Why Conventional Pumps Fail Here:",
        "id": "why-conventional-pumps-fail-here"
      },
      {
        "level": 3,
        "text": "The Proven Industrial Solution: Dry Screw Pump + Roots Mechanical Booster",
        "id": "the-proven-industrial-solution-dry-screw-pump-roots-mechanical-booster"
      },
      {
        "level": 3,
        "text": "Commercial Hardware Specifications:",
        "id": "commercial-hardware-specifications"
      },
      {
        "level": 2,
        "text": "2. Cryogenic Thermal Engineering: How to Achieve -60°C",
        "id": "2-cryogenic-thermal-engineering-how-to-achieve--60c"
      },
      {
        "level": 3,
        "text": "Option A: Two-Stage Mechanical Cascade Refrigeration Skid (`PKG-301`)",
        "id": "option-a-two-stage-mechanical-cascade-refrigeration-skid-pkg-301"
      },
      {
        "level": 3,
        "text": "Option B: Liquid Nitrogen (LN2) Indirect Cryogenic Skid",
        "id": "option-b-liquid-nitrogen-ln2-indirect-cryogenic-skid"
      },
      {
        "level": 2,
        "text": "3. Cause-and-Effect (C&E) Safety Interlock Matrix",
        "id": "3-cause-and-effect-ce-safety-interlock-matrix"
      },
      {
        "level": 2,
        "text": "4. Chronological Step-by-Step Cycle Execution",
        "id": "4-chronological-step-by-step-cycle-execution"
      }
    ]
  }
];
