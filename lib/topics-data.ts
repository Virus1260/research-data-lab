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
    "title": "Hosokawa AFD Pharma Freeze Dryer: Deep Technical Study & Workshop Build Package",
    "act": "Overview",
    "actId": "act-0",
    "readTime": "6 min read",
    "headings": [
      {
        "level": 1,
        "text": "Hosokawa AFD Pharma Freeze Dryer: Deep Technical Study & Workshop Build Package",
        "id": "hosokawa-afd-pharma-freeze-dryer-deep-technical-study-workshop-build-package"
      },
      {
        "level": 2,
        "text": "How this package is organized",
        "id": "how-this-package-is-organized"
      },
      {
        "level": 2,
        "text": "Critical framing: read this before anything else",
        "id": "critical-framing-read-this-before-anything-else"
      },
      {
        "level": 2,
        "text": "What is new in this extended edition (P&ID, controls, CAD prep, vessel sizing)",
        "id": "what-is-new-in-this-extended-edition-pid-controls-cad-prep-vessel-sizing"
      },
      {
        "level": 2,
        "text": "Scope honesty",
        "id": "scope-honesty"
      },
      {
        "level": 2,
        "text": "Key published design constant: 50% working-volume ratio",
        "id": "key-published-design-constant-50-working-volume-ratio"
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
        "text": "03: What Is Actually Hosokawa/AFD-Specific vs. Generic Pharma Freeze-Drying",
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
        "text": "3. The Nauta mixer connection: your best real-world reference platform",
        "id": "3-the-nauta-mixer-connection-your-best-real-world-reference-platform"
      },
      {
        "level": 2,
        "text": "4. Generic pharma freeze-drying literature that does not directly describe the AFD",
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
    "readTime": "12 min read",
    "headings": [
      {
        "level": 1,
        "text": "05: Vessel, Chamber, Agitator & Materials",
        "id": "05-vessel-chamber-agitator-materials"
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
        "text": "3. Agitator",
        "id": "3-agitator"
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
    "readTime": "10 min read",
    "headings": [
      {
        "level": 1,
        "text": "11: Design Calculations & Sizing Methodology",
        "id": "11-design-calculations-sizing-methodology"
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
    "readTime": "7 min read",
    "headings": [
      {
        "level": 1,
        "text": "18: References & Source List",
        "id": "18-references-source-list"
      },
      {
        "level": 2,
        "text": "A. Hosokawa primary sources (AFD-specific)",
        "id": "a-hosokawa-primary-sources-afd-specific"
      },
      {
        "level": 2,
        "text": "B. Patents (core AFD engineering-detail sources)",
        "id": "b-patents-core-afd-engineering-detail-sources"
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
        "text": "I. Safety: combustible dust / ATEX / NFPA",
        "id": "i-safety-combustible-dust-atex-nfpa"
      },
      {
        "level": 2,
        "text": "J. Fundamental physical/thermodynamic data",
        "id": "j-fundamental-physicalthermodynamic-data"
      },
      {
        "level": 2,
        "text": "K. Added for the P&ID / controls / CAD extension (files 19-24)",
        "id": "k-added-for-the-pid-controls-cad-extension-files-19-24"
      },
      {
        "level": 2,
        "text": "L. Added for vessel and head sizing extension (files 05, 11, 25)",
        "id": "l-added-for-vessel-and-head-sizing-extension-files-05-11-25"
      },
      {
        "level": 2,
        "text": "How this package used these sources",
        "id": "how-this-package-used-these-sources"
      },
      {
        "level": 2,
        "text": "What this package could not find publicly",
        "id": "what-this-package-could-not-find-publicly"
      }
    ]
  },
  {
    "slug": "19-piping-and-instrumentation-diagram",
    "chapterNumber": "19",
    "title": "P&ID: How to Read It, and the Full Diagram for This Machine",
    "act": "Automation, P&ID & CAD",
    "actId": "act-5",
    "readTime": "6 min read",
    "headings": [
      {
        "level": 1,
        "text": "19 — P&ID: How to Read It, and the Full Diagram for This Machine",
        "id": "19-pid-how-to-read-it-and-the-full-diagram-for-this-machine"
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
        "text": "3. Walking the diagram, subsystem by subsystem",
        "id": "3-walking-the-diagram-subsystem-by-subsystem"
      },
      {
        "level": 2,
        "text": "4. Why some tags repeat the same letter twice on purpose",
        "id": "4-why-some-tags-repeat-the-same-letter-twice-on-purpose"
      },
      {
        "level": 2,
        "text": "5. The structured data behind this diagram",
        "id": "5-the-structured-data-behind-this-diagram"
      },
      {
        "level": 2,
        "text": "6. What's illustrative vs. what's fixed",
        "id": "6-whats-illustrative-vs-whats-fixed"
      }
    ]
  },
  {
    "slug": "20-control-system-architecture",
    "chapterNumber": "20",
    "title": "Control System Architecture",
    "act": "Automation, P&ID & CAD",
    "actId": "act-5",
    "readTime": "5 min read",
    "headings": [
      {
        "level": 1,
        "text": "20 — Control System Architecture",
        "id": "20-control-system-architecture"
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
    "slug": "21-batch-sequence-and-operating-cycle",
    "chapterNumber": "21",
    "title": "Batch Sequence & Operating Cycle (ISA-88 Structure)",
    "act": "Automation, P&ID & CAD",
    "actId": "act-5",
    "readTime": "6 min read",
    "headings": [
      {
        "level": 1,
        "text": "21 — Batch Sequence & Operating Cycle (ISA-88 Structure)",
        "id": "21-batch-sequence-operating-cycle-isa-88-structure"
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
        "text": "4. A genuinely useful transition condition: ending Primary Drying automatically",
        "id": "4-a-genuinely-useful-transition-condition-ending-primary-drying-automatically"
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
    "slug": "22-interlocks-cause-effect-matrix-and-io-list",
    "chapterNumber": "22",
    "title": "Interlocks: Cause & Effect Matrix and I/O List",
    "act": "Automation, P&ID & CAD",
    "actId": "act-5",
    "readTime": "11 min read",
    "headings": [
      {
        "level": 1,
        "text": "22 — Interlocks: Cause & Effect Matrix and I/O List",
        "id": "22-interlocks-cause-effect-matrix-and-io-list"
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
    "slug": "23-engineering-resolution-freezing-methods-and-thermal-duty",
    "chapterNumber": "23",
    "title": "Engineering Resolution: How the Freezing Stage Actually Works",
    "act": "Automation, P&ID & CAD",
    "actId": "act-5",
    "readTime": "9 min read",
    "headings": [
      {
        "level": 1,
        "text": "23 — Engineering Resolution: How the Freezing Stage Actually Works",
        "id": "23-engineering-resolution-how-the-freezing-stage-actually-works"
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
    "slug": "24-cad-solidworks-equipment-nozzle-schedule",
    "chapterNumber": "24",
    "title": "CAD/SolidWorks Preparation: Equipment, Nozzle & Valve Schedule",
    "act": "Automation, P&ID & CAD",
    "actId": "act-5",
    "readTime": "12 min read",
    "headings": [
      {
        "level": 1,
        "text": "24 — CAD/SolidWorks Preparation: Equipment, Nozzle & Valve Schedule",
        "id": "24-cadsolidworks-preparation-equipment-nozzle-valve-schedule"
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
    "slug": "25-vessel-sizing-suite-tool-spec-and-prompt",
    "chapterNumber": "25",
    "title": "Vessel Sizing Suite: Tool Specification & Parametric Engineering Architecture",
    "act": "Automation, P&ID & CAD",
    "actId": "act-5",
    "readTime": "12 min read",
    "headings": [
      {
        "level": 1,
        "text": "25: Vessel Sizing Suite: Tool Specification & Parametric Engineering Architecture",
        "id": "25-vessel-sizing-suite-tool-specification-parametric-engineering-architecture"
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
    "slug": "26-hosokawa-afd-patent-nl2026893b1-translation-and-engineering-analysis",
    "chapterNumber": "26",
    "title": "Hosokawa AFD Patent NL 2026893 B1: Translation, Claims Analysis & Engineering Evaluation",
    "act": "Automation, P&ID & CAD",
    "actId": "act-5",
    "readTime": "25 min read",
    "headings": [
      {
        "level": 1,
        "text": "26: Hosokawa AFD Patent NL 2026893 B1: Translation, Claims Analysis & Engineering Evaluation",
        "id": "26-hosokawa-afd-patent-nl-2026893-b1-translation-claims-analysis-engineering-evaluation"
      },
      {
        "level": 2,
        "text": "Executive Summary & Patent Dossier",
        "id": "executive-summary-patent-dossier"
      },
      {
        "level": 3,
        "text": "Official Patent Bibliographic Data",
        "id": "official-patent-bibliographic-data"
      },
      {
        "level": 2,
        "text": "1. Paradigm Shift: EP 1 601 919 B1 vs. NL 2026893 B1",
        "id": "1-paradigm-shift-ep-1-601-919-b1-vs-nl-2026893-b1"
      },
      {
        "level": 3,
        "text": "The Two Fundamental Engineering Bottlenecks Solved",
        "id": "the-two-fundamental-engineering-bottlenecks-solved"
      },
      {
        "level": 2,
        "text": "2. Statement-by-Statement Dutch to English Translation of Claims (Conclusies 1 to 27)",
        "id": "2-statement-by-statement-dutch-to-english-translation-of-claims-conclusies-1-to-27"
      },
      {
        "level": 3,
        "text": "Claim 1: Primary Apparatus Claim (The Fundamental Invention)",
        "id": "claim-1-primary-apparatus-claim-the-fundamental-invention"
      },
      {
        "level": 3,
        "text": "Claim 2: Side-by-Side Skid Architecture",
        "id": "claim-2-side-by-side-skid-architecture"
      },
      {
        "level": 3,
        "text": "Claim 3: Collector Housing Partitioning & Flow Path",
        "id": "claim-3-collector-housing-partitioning-flow-path"
      },
      {
        "level": 3,
        "text": "Claim 4: Collecting Filter Screen Candle",
        "id": "claim-4-collecting-filter-screen-candle"
      },
      {
        "level": 3,
        "text": "Claim 5: Collector Material Discharge Port",
        "id": "claim-5-collector-material-discharge-port"
      },
      {
        "level": 3,
        "text": "Claim 6: Bottom Apex Collector Outlet",
        "id": "claim-6-bottom-apex-collector-outlet"
      },
      {
        "level": 3,
        "text": "Claim 7: Heated Double-Walled Collector Jacket",
        "id": "claim-7-heated-double-walled-collector-jacket"
      },
      {
        "level": 3,
        "text": "Claim 8: Dedicated Powder Receiver Vessel",
        "id": "claim-8-dedicated-powder-receiver-vessel"
      },
      {
        "level": 3,
        "text": "Claim 9: Receiver Body with Internal Volume",
        "id": "claim-9-receiver-body-with-internal-volume"
      },
      {
        "level": 3,
        "text": "Claim 10: Receiver Mated to Collector Drain",
        "id": "claim-10-receiver-mated-to-collector-drain"
      },
      {
        "level": 3,
        "text": "Claim 11: Heated Receiver Jacket for Moisture Stripping",
        "id": "claim-11-heated-receiver-jacket-for-moisture-stripping"
      },
      {
        "level": 3,
        "text": "Claim 12: Elevated / Top-Mounted Collector Position",
        "id": "claim-12-elevated-top-mounted-collector-position"
      },
      {
        "level": 3,
        "text": "Claim 13: Inter-Stage Vacuum Isolation Valve",
        "id": "claim-13-inter-stage-vacuum-isolation-valve"
      },
      {
        "level": 3,
        "text": "Claim 14: Non-Return Isolation of Collected Cake",
        "id": "claim-14-non-return-isolation-of-collected-cake"
      },
      {
        "level": 3,
        "text": "Claim 15: Fine Dust Entrainment Bypass Conduit",
        "id": "claim-15-fine-dust-entrainment-bypass-conduit"
      },
      {
        "level": 3,
        "text": "Claim 16: Reverse Pulse Gas Purge Lance",
        "id": "claim-16-reverse-pulse-gas-purge-lance"
      },
      {
        "level": 3,
        "text": "Claim 17: Conical Chamber with Cantilevered Screw Agitator",
        "id": "claim-17-conical-chamber-with-cantilevered-screw-agitator"
      },
      {
        "level": 3,
        "text": "Claim 18: Vessel Cover with Fluidization Gas Nozzles",
        "id": "claim-18-vessel-cover-with-fluidization-gas-nozzles"
      },
      {
        "level": 3,
        "text": "Claim 19: Normally Closed Bottom Product Discharge Valve",
        "id": "claim-19-normally-closed-bottom-product-discharge-valve"
      },
      {
        "level": 3,
        "text": "Claim 20: Completely Enclosed Containment Standard",
        "id": "claim-20-completely-enclosed-containment-standard"
      },
      {
        "level": 3,
        "text": "Claim 21: Sub-Assembly Protection for Collector Unit",
        "id": "claim-21-sub-assembly-protection-for-collector-unit"
      },
      {
        "level": 3,
        "text": "Claim 22: Primary Method Claim for Dynamic Elutriation Freeze Drying",
        "id": "claim-22-primary-method-claim-for-dynamic-elutriation-freeze-drying"
      },
      {
        "level": 3,
        "text": "Claim 23: Pre-Evacuation In-Situ Freezing Step",
        "id": "claim-23-pre-evacuation-in-situ-freezing-step"
      },
      {
        "level": 3,
        "text": "Claim 24: Terminal Intermittent Gas Bleed / Venting",
        "id": "claim-24-terminal-intermittent-gas-bleed-venting"
      },
      {
        "level": 3,
        "text": "Claim 25: Periodic Collector Blowback Pulse",
        "id": "claim-25-periodic-collector-blowback-pulse"
      },
      {
        "level": 3,
        "text": "Claim 26: Powder Re-Introduction & Final Post-Mixing",
        "id": "claim-26-powder-re-introduction-final-post-mixing"
      },
      {
        "level": 3,
        "text": "Claim 27: Dynamic Valve Control Across Cycle Phases",
        "id": "claim-27-dynamic-valve-control-across-cycle-phases"
      },
      {
        "level": 2,
        "text": "3. Engineering Numerals & Physical Subsystems Key",
        "id": "3-engineering-numerals-physical-subsystems-key"
      },
      {
        "level": 2,
        "text": "4. Operational Cycle & SCADA State Machine Integration",
        "id": "4-operational-cycle-scada-state-machine-integration"
      },
      {
        "level": 3,
        "text": "Dynamic Process Timing & Valve States (FIG 5 Engineering Analysis)",
        "id": "dynamic-process-timing-valve-states-fig-5-engineering-analysis"
      },
      {
        "level": 2,
        "text": "5. CAD Integration: Vectorized Drawings & SolidWorks Modeling Guide",
        "id": "5-cad-integration-vectorized-drawings-solidworks-modeling-guide"
      },
      {
        "level": 3,
        "text": "SolidWorks / Inventor Modeling Instructions",
        "id": "solidworks-inventor-modeling-instructions"
      },
      {
        "level": 2,
        "text": "6. Synthesis: Why NL 2026893 B1 Must Govern Future AFD Workshop Builds",
        "id": "6-synthesis-why-nl-2026893-b1-must-govern-future-afd-workshop-builds"
      }
    ]
  }
];
