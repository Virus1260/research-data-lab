export interface ActConfig {
  id: string;
  name: string;
  roman: string;
  description: string;
  chapters: string[];
}

export interface ProjectConfig {
  slug: string;
  title: string;
  subtitle: string;
  heroFinding: string;
  heroFindingHighlight: string;
  tags: string[];
  acts: ActConfig[];
  simulators: Record<string, string[]>;
  summary: string;
  stats: {
    chaptersCount: number;
    subsystemsCount: number;
    bomItemsCount: number;
    referencesCount: number;
  };
}

export const project: ProjectConfig = {
  slug: "hosokawa-afd-freeze-dryer",
  title: "Hosokawa AFD Pharma Freeze Dryer",
  subtitle: "Engineering Dossier & Interactive Reconstructive Analysis",
  heroFinding:
    "The AFD is not a conventional shelf/tray freeze dryer. It is an agitated, jacketed, downward-conical vessel where product is frozen and dried while being continuously stirred, discharging as loose powder instead of vial cakes.",
  heroFindingHighlight:
    "an agitated, jacketed, downward-conical vessel where product is frozen and dried while being continuously stirred",
  tags: ["Pharma Engineering", "Mechanical", "Vacuum Systems", "Cryogenics", "cGMP"],
  acts: [
    {
      id: "act-1",
      name: "Foundations",
      roman: "I",
      description: "Build the physics vocabulary and thermodynamics from first principles.",
      chapters: [
        "01-beginner-foundations-and-glossary",
        "02-physics-and-thermodynamics",
      ],
    },
    {
      id: "act-2",
      name: "The Machine",
      roman: "II",
      description: "The AFD-specific architecture, mechanical layout, and subsystems.",
      chapters: [
        "03-hosokawa-afd-vs-generic-lyophilizers",
        "04-system-architecture-and-subsystems",
        "05-vessel-chamber-agitator-and-materials",
        "06-refrigeration-vacuum-and-condenser-systems",
        "07-cip-sip-sealing-insulation-utilities",
        "08-instrumentation-controls-electrical-structural",
      ],
    },
    {
      id: "act-3",
      name: "Build It",
      roman: "III",
      description: "Safety hazards, materials fabrication, sizing math, BOM, drawings, and roadmap.",
      chapters: [
        "09-safety-and-hazard-analysis",
        "10-materials-fabrication-tolerances-workshop-vs-purchased",
        "11-design-calculations-and-sizing-methodology",
        "12-bill-of-materials-and-system-breakdown",
        "13-drawings-and-schematics-to-create",
        "16-build-roadmap-prototype-to-pharma-capable",
      ],
    },
    {
      id: "act-4",
      name: "Make It Real",
      roman: "IV",
      description: "Validation protocols, commissioning tests, maintenance regimens, and primary sources.",
      chapters: [
        "14-validation-qualification-and-gmp-compliance",
        "15-commissioning-test-plan",
        "17-maintenance-and-troubleshooting",
        "18-references-and-source-list",
      ],
    },
  ],
  simulators: {
    "02-physics-and-thermodynamics": ["PhaseDiagramExplorer"],
    "03-hosokawa-afd-vs-generic-lyophilizers": ["AfdComparisonFlip"],
    "04-system-architecture-and-subsystems": ["CycleProfileScrubber"],
    "05-vessel-chamber-agitator-and-materials": ["VesselCrossSection3D"],
    "06-refrigeration-vacuum-and-condenser-systems": [
      "VacuumPumpdownSimulator",
      "ComparativePressureDetector",
      "RefrigerationCascadeDiagram",
    ],
    "11-design-calculations-and-sizing-methodology": [
      "SublimationRateCalculator",
      "RefrigerationLoadCalculator",
      "VacuumPumpdownSimulator",
    ],
  },
  summary:
    "A 19-chapter engineering research dossier on Hosokawa's Active Freeze Dryer technology, reconstructed from patents, public literature, and heat/mass transfer physics.",
  stats: {
    chaptersCount: 19,
    subsystemsCount: 17,
    bomItemsCount: 74,
    referencesCount: 34,
  },
};
