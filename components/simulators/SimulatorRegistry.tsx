"use client";

import React from "react";
import { PhaseDiagramExplorer } from "./PhaseDiagramExplorer";
import { SublimationRateCalculator } from "./SublimationRateCalculator";
import { RefrigerationLoadCalculator } from "./RefrigerationLoadCalculator";
import { VacuumPumpdownSimulator } from "./VacuumPumpdownSimulator";
import { ComparativePressureDetector } from "./ComparativePressureDetector";
import { CycleProfileScrubber } from "./CycleProfileScrubber";
import { VesselCrossSection3D } from "./VesselCrossSection3D";
import { AfdComparisonFlip } from "./AfdComparisonFlip";
import { RefrigerationCascadeDiagram } from "./RefrigerationCascadeDiagram";

interface RegistryProps {
  name: string;
}

export function SimulatorComponent({ name }: RegistryProps) {
  switch (name) {
    case "PhaseDiagramExplorer":
      return <PhaseDiagramExplorer />;
    case "SublimationRateCalculator":
      return <SublimationRateCalculator />;
    case "RefrigerationLoadCalculator":
      return <RefrigerationLoadCalculator />;
    case "VacuumPumpdownSimulator":
      return <VacuumPumpdownSimulator />;
    case "ComparativePressureDetector":
      return <ComparativePressureDetector />;
    case "CycleProfileScrubber":
      return <CycleProfileScrubber />;
    case "VesselCrossSection3D":
      return <VesselCrossSection3D />;
    case "AfdComparisonFlip":
      return <AfdComparisonFlip />;
    case "RefrigerationCascadeDiagram":
      return <RefrigerationCascadeDiagram />;
    default:
      return null;
  }
}

// Convenience wrapper that renders a list of simulators by ID
export function SimulatorRegistry({ simulatorIds }: { simulatorIds: string[] }) {
  if (!simulatorIds || simulatorIds.length === 0) return null;
  return (
    <div className="space-y-8 mb-8">
      {simulatorIds.map((id) => (
        <SimulatorComponent key={id} name={id} />
      ))}
    </div>
  );
}
