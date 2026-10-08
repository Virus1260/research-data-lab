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
      name: "Foundations & Flowsheets",
      roman: "I",
      description: "Sublimation thermodynamics, Knudsen diffusion, Hosokawa AFD differentiation, and mass/energy balance flowsheets.",
      chapters: [
        "01-physics-and-thermodynamics",
        "02-hosokawa-afd-vs-generic-lyophilizers",
        "03-process-flowsheets-bfd-and-pfd",
        "04-system-architecture-and-subsystems",
      ],
    },
    {
      id: "act-2",
      name: "Mechanical & Vessel Engineering",
      roman: "II",
      description: "Conical vessel geometry, cantilevered orbital screw agitator, metallurgy, sizing math, SolidWorks CAD nozzles, and shop drawings.",
      chapters: [
        "05-vessel-chamber-agitator-and-materials",
        "06-materials-fabrication-tolerances-and-welding",
        "07-design-calculations-and-sizing-methodology",
        "08-vessel-sizing-suite-and-parametric-tool",
        "09-cad-solidworks-assembly-and-nozzle-schedule",
        "10-drawings-and-schematics-to-create",
        "11-bill-of-materials-and-system-breakdown",
      ],
    },
    {
      id: "act-3",
      name: "Process Skids, Vacuum & Utilities",
      roman: "III",
      description: "Refrigeration skids, cold-trap condensers, dry screw vacuum train, cryogenic freezing heat duty, CIP/SIP, and ISA-5.1 P&ID.",
      chapters: [
        "12-refrigeration-vacuum-and-condenser-systems",
        "13-freezing-methods-and-thermal-duty",
        "14-cip-sip-sealing-insulation-and-utilities",
        "15-piping-and-instrumentation-diagram",
      ],
    },
    {
      id: "act-4",
      name: "Electrical, Controls & Safety Automation",
      roman: "IV",
      description: "Instrumentation sensors, PLC/SCADA architecture, ISA-88 automated batch cycles, SIL safety interlocks, and HAZOP analysis.",
      chapters: [
        "16-instrumentation-and-electrical-hardware",
        "17-control-system-architecture",
        "18-batch-sequence-and-operating-cycle",
        "19-interlocks-cause-effect-matrix-and-io-list",
        "20-safety-and-hazard-analysis",
      ],
    },
    {
      id: "act-5",
      name: "Commissioning & Maintenance",
      roman: "V",
      description: "FAT/SAT protocols, ISO 13408-3 vacuum leak decay qualification, preventative maintenance, and mechanical seal overhaul.",
      chapters: [
        "21-commissioning-and-qualification-test-plan",
        "22-maintenance-and-troubleshooting",
      ],
    },
  ],
  simulators: {
    "01-physics-and-thermodynamics": ["PhaseDiagramExplorer"],
    "02-hosokawa-afd-vs-generic-lyophilizers": ["AfdComparisonFlip"],
    "03-process-flowsheets-bfd-and-pfd": ["VacuumVsFreezeDryerStudio"],
    "04-system-architecture-and-subsystems": ["CycleProfileScrubber"],
    "05-vessel-chamber-agitator-and-materials": ["VesselCrossSection3D"],
    "07-design-calculations-and-sizing-methodology": [
      "SublimationRateCalculator",
      "RefrigerationLoadCalculator",
      "VacuumPumpdownSimulator",
    ],
    "08-vessel-sizing-suite-and-parametric-tool": ["VesselSizingSuite"],
    "12-refrigeration-vacuum-and-condenser-systems": [
      "VacuumPumpdownSimulator",
      "ComparativePressureDetector",
      "RefrigerationCascadeDiagram",
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
