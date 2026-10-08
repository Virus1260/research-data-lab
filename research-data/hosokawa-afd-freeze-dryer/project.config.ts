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
      name: "Foundations & Physics",
      roman: "I",
      description: "Sublimation kinetics, Clausius-Clapeyron curves, and dynamic boundary layer renewal physics.",
      chapters: [
        "02-physics-and-thermodynamics",
      ],
    },
    {
      id: "act-2",
      name: "The Machine Architecture",
      roman: "II",
      description: "AFD-specific mechanics, conical vessel layout, cold trap refrigeration, and utility skids.",
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
      name: "Workshop Fabrication & Sizing",
      roman: "III",
      description: "Machining tolerances, motor torque sizing, 316L metallurgy, itemized BOM, and shop drawings.",
      chapters: [
        "09-safety-and-hazard-analysis",
        "10-materials-fabrication-tolerances-workshop-vs-purchased",
        "11-design-calculations-and-sizing-methodology",
        "12-bill-of-materials-and-system-breakdown",
        "13-drawings-and-schematics-to-create",
      ],
    },
    {
      id: "act-4",
      name: "Commissioning & Maintenance",
      roman: "IV",
      description: "Leak-rate hold test protocols (ISO 13408-3), thermal mapping, and routine servicing procedures.",
      chapters: [
        "15-commissioning-test-plan",
        "17-maintenance-and-troubleshooting",
      ],
    },
    {
      id: "act-5",
      name: "Automation, P&ID & CAD",
      roman: "V",
      description: "P&ID flow architecture, ISA 5.1 instrumentation, BPCS vs. SIS safety separation, C&E interlocks, thermal duty, and SolidWorks CAD schedule.",
      chapters: [
        "19-piping-and-instrumentation-diagram",
        "20-control-system-architecture",
        "21-batch-sequence-and-operating-cycle",
        "22-interlocks-cause-effect-matrix-and-io-list",
        "23-engineering-resolution-freezing-methods-and-thermal-duty",
        "24-cad-solidworks-equipment-nozzle-schedule",
        "25-vessel-sizing-suite-tool-spec-and-prompt",
        "27-canonical-bfd-and-unbundled-pfd-process-flowsheets",
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
    "25-vessel-sizing-suite-tool-spec-and-prompt": ["VesselSizingSuite"],
    "27-canonical-bfd-and-unbundled-pfd-process-flowsheets": [
      "VacuumVsFreezeDryerStudio"
    ],
  },
  summary:
    "A lean, build-focused 22-chapter engineering execution dossier on Hosokawa's Active Freeze Dryer technology, containing exact mechanical dimensions, ISA-5.1 P&ID, Cause & Effect interlocks, parametric vessel sizing, SolidWorks nozzle schedules, and CAD flowsheets.",
  stats: {
    chaptersCount: 22,
    subsystemsCount: 17,
    bomItemsCount: 75,
    referencesCount: 48,
  },
};
