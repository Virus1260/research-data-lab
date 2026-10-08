import os
import re

MAPPING = [
    {
        "old_file": "02-physics-and-thermodynamics.mdx",
        "new_file": "01-physics-and-thermodynamics.mdx",
        "old_slug": "02-physics-and-thermodynamics",
        "new_slug": "01-physics-and-thermodynamics",
        "num": "01",
        "title": "01 — Physics, Thermodynamics & Sublimation Kinetics",
        "clean_title": "Physics, Thermodynamics & Sublimation Kinetics",
        "act": "Foundations & Flowsheets",
        "actId": "act-1"
    },
    {
        "old_file": "03-hosokawa-afd-vs-generic-lyophilizers.mdx",
        "new_file": "02-hosokawa-afd-vs-generic-lyophilizers.mdx",
        "old_slug": "03-hosokawa-afd-vs-generic-lyophilizers",
        "new_slug": "02-hosokawa-afd-vs-generic-lyophilizers",
        "num": "02",
        "title": "02 — Hosokawa AFD vs Generic Lyophilizers & Competitors",
        "clean_title": "Hosokawa AFD vs Generic Lyophilizers & Competitors",
        "act": "Foundations & Flowsheets",
        "actId": "act-1"
    },
    {
        "old_file": "27-canonical-bfd-and-unbundled-pfd-process-flowsheets.mdx",
        "new_file": "03-process-flowsheets-bfd-and-pfd.mdx",
        "old_slug": "27-canonical-bfd-and-unbundled-pfd-process-flowsheets",
        "new_slug": "03-process-flowsheets-bfd-and-pfd",
        "num": "03",
        "title": "03 — Process Flowsheets: Canonical BFD, PFD & Mass Balances",
        "clean_title": "Process Flowsheets: Canonical BFD, PFD & Mass Balances",
        "act": "Foundations & Flowsheets",
        "actId": "act-1"
    },
    {
        "old_file": "04-system-architecture-and-subsystems.mdx",
        "new_file": "04-system-architecture-and-subsystems.mdx",
        "old_slug": "04-system-architecture-and-subsystems",
        "new_slug": "04-system-architecture-and-subsystems",
        "num": "04",
        "title": "04 — System Architecture & 17 Subsystems Overview",
        "clean_title": "System Architecture & 17 Subsystems Overview",
        "act": "Foundations & Flowsheets",
        "actId": "act-1"
    },
    {
        "old_file": "05-vessel-chamber-agitator-and-materials.mdx",
        "new_file": "05-vessel-chamber-agitator-and-materials.mdx",
        "old_slug": "05-vessel-chamber-agitator-and-materials",
        "new_slug": "05-vessel-chamber-agitator-and-materials",
        "num": "05",
        "title": "05 — Vessel Conical Chamber, Agitator & Drive Mechanism",
        "clean_title": "Vessel Conical Chamber, Agitator & Drive Mechanism",
        "act": "Mechanical & Vessel Engineering",
        "actId": "act-2"
    },
    {
        "old_file": "10-materials-fabrication-tolerances-workshop-vs-purchased.mdx",
        "new_file": "06-materials-fabrication-tolerances-and-welding.mdx",
        "old_slug": "10-materials-fabrication-tolerances-workshop-vs-purchased",
        "new_slug": "06-materials-fabrication-tolerances-and-welding",
        "num": "06",
        "title": "06 — Materials, Machining Tolerances, Finishing & Welding",
        "clean_title": "Materials, Machining Tolerances, Finishing & Welding",
        "act": "Mechanical & Vessel Engineering",
        "actId": "act-2"
    },
    {
        "old_file": "11-design-calculations-and-sizing-methodology.mdx",
        "new_file": "07-design-calculations-and-sizing-methodology.mdx",
        "old_slug": "11-design-calculations-and-sizing-methodology",
        "new_slug": "07-design-calculations-and-sizing-methodology",
        "num": "07",
        "title": "07 — Design Calculations, Sizing Equations & Heat Transfer",
        "clean_title": "Design Calculations, Sizing Equations & Heat Transfer",
        "act": "Mechanical & Vessel Engineering",
        "actId": "act-2"
    },
    {
        "old_file": "25-vessel-sizing-suite-tool-spec-and-prompt.mdx",
        "new_file": "08-vessel-sizing-suite-and-parametric-tool.mdx",
        "old_slug": "25-vessel-sizing-suite-tool-spec-and-prompt",
        "new_slug": "08-vessel-sizing-suite-and-parametric-tool",
        "num": "08",
        "title": "08 — Parametric Vessel Sizing Suite & Engineering Tools",
        "clean_title": "Parametric Vessel Sizing Suite & Engineering Tools",
        "act": "Mechanical & Vessel Engineering",
        "actId": "act-2"
    },
    {
        "old_file": "24-cad-solidworks-equipment-nozzle-schedule.mdx",
        "new_file": "09-cad-solidworks-assembly-and-nozzle-schedule.mdx",
        "old_slug": "24-cad-solidworks-equipment-nozzle-schedule",
        "new_slug": "09-cad-solidworks-assembly-and-nozzle-schedule",
        "num": "09",
        "title": "09 — CAD SolidWorks Assembly Hierarchy & Nozzle Schedule",
        "clean_title": "CAD SolidWorks Assembly Hierarchy & Nozzle Schedule",
        "act": "Mechanical & Vessel Engineering",
        "actId": "act-2"
    },
    {
        "old_file": "13-drawings-and-schematics-to-create.mdx",
        "new_file": "10-drawings-and-schematics-to-create.mdx",
        "old_slug": "13-drawings-and-schematics-to-create",
        "new_slug": "10-drawings-and-schematics-to-create",
        "num": "10",
        "title": "10 — Workshop Fabrication Drawings, Schematics & GA Layouts",
        "clean_title": "Workshop Fabrication Drawings, Schematics & GA Layouts",
        "act": "Mechanical & Vessel Engineering",
        "actId": "act-2"
    },
    {
        "old_file": "12-bill-of-materials-and-system-breakdown.mdx",
        "new_file": "11-bill-of-materials-and-system-breakdown.mdx",
        "old_slug": "12-bill-of-materials-and-system-breakdown",
        "new_slug": "11-bill-of-materials-and-system-breakdown",
        "num": "11",
        "title": "11 — Itemized Bill of Materials & System Component Breakdown",
        "clean_title": "Itemized Bill of Materials & System Component Breakdown",
        "act": "Mechanical & Vessel Engineering",
        "actId": "act-2"
    },
    {
        "old_file": "06-refrigeration-vacuum-and-condenser-systems.mdx",
        "new_file": "12-refrigeration-vacuum-and-condenser-systems.mdx",
        "old_slug": "06-refrigeration-vacuum-and-condenser-systems",
        "new_slug": "12-refrigeration-vacuum-and-condenser-systems",
        "num": "12",
        "title": "12 — Refrigeration, Cold-Trap Condenser & Vacuum Skids",
        "clean_title": "Refrigeration, Cold-Trap Condenser & Vacuum Skids",
        "act": "Process Skids, Vacuum & Utilities",
        "actId": "act-3"
    },
    {
        "old_file": "23-engineering-resolution-freezing-methods-and-thermal-duty.mdx",
        "new_file": "13-freezing-methods-and-thermal-duty.mdx",
        "old_slug": "23-engineering-resolution-freezing-methods-and-thermal-duty",
        "new_slug": "13-freezing-methods-and-thermal-duty",
        "num": "13",
        "title": "13 — Freezing Methods, Cryogenic LN2 & Thermal Heat Duty",
        "clean_title": "Freezing Methods, Cryogenic LN2 & Thermal Heat Duty",
        "act": "Process Skids, Vacuum & Utilities",
        "actId": "act-3"
    },
    {
        "old_file": "07-cip-sip-sealing-insulation-utilities.mdx",
        "new_file": "14-cip-sip-sealing-insulation-and-utilities.mdx",
        "old_slug": "07-cip-sip-sealing-insulation-utilities",
        "new_slug": "14-cip-sip-sealing-insulation-and-utilities",
        "num": "14",
        "title": "14 — CIP Spray Systems, SIP Sterilization, Sealing & Utilities",
        "clean_title": "CIP Spray Systems, SIP Sterilization, Sealing & Utilities",
        "act": "Process Skids, Vacuum & Utilities",
        "actId": "act-3"
    },
    {
        "old_file": "19-piping-and-instrumentation-diagram.mdx",
        "new_file": "15-piping-and-instrumentation-diagram.mdx",
        "old_slug": "19-piping-and-instrumentation-diagram",
        "new_slug": "15-piping-and-instrumentation-diagram",
        "num": "15",
        "title": "15 — Complete Piping & Instrumentation Diagram (P&ID)",
        "clean_title": "Complete Piping & Instrumentation Diagram (P&ID)",
        "act": "Process Skids, Vacuum & Utilities",
        "actId": "act-3"
    },
    {
        "old_file": "08-instrumentation-controls-electrical-structural.mdx",
        "new_file": "16-instrumentation-and-electrical-hardware.mdx",
        "old_slug": "08-instrumentation-controls-electrical-structural",
        "new_slug": "16-instrumentation-and-electrical-hardware",
        "num": "16",
        "title": "16 — Instrumentation Sensors, Electrical Hardware & Skid Frame",
        "clean_title": "Instrumentation Sensors, Electrical Hardware & Skid Frame",
        "act": "Electrical, Controls & Safety Automation",
        "actId": "act-4"
    },
    {
        "old_file": "20-control-system-architecture.mdx",
        "new_file": "17-control-system-architecture.mdx",
        "old_slug": "20-control-system-architecture",
        "new_slug": "17-control-system-architecture",
        "num": "17",
        "title": "17 — PLC / SCADA Control Architecture & Industrial Network",
        "clean_title": "PLC / SCADA Control Architecture & Industrial Network",
        "act": "Electrical, Controls & Safety Automation",
        "actId": "act-4"
    },
    {
        "old_file": "21-batch-sequence-and-operating-cycle.mdx",
        "new_file": "18-batch-sequence-and-operating-cycle.mdx",
        "old_slug": "21-batch-sequence-and-operating-cycle",
        "new_slug": "18-batch-sequence-and-operating-cycle",
        "num": "18",
        "title": "18 — Automated Batch Sequence, SCADA Phases & Recipe Cycle",
        "clean_title": "Automated Batch Sequence, SCADA Phases & Recipe Cycle",
        "act": "Electrical, Controls & Safety Automation",
        "actId": "act-4"
    },
    {
        "old_file": "22-interlocks-cause-effect-matrix-and-io-list.mdx",
        "new_file": "19-interlocks-cause-effect-matrix-and-io-list.mdx",
        "old_slug": "22-interlocks-cause-effect-matrix-and-io-list",
        "new_slug": "19-interlocks-cause-effect-matrix-and-io-list",
        "num": "19",
        "title": "19 — Safety Interlocks, Cause & Effect Matrix & I/O Schedule",
        "clean_title": "Safety Interlocks, Cause & Effect Matrix & I/O Schedule",
        "act": "Electrical, Controls & Safety Automation",
        "actId": "act-4"
    },
    {
        "old_file": "09-safety-and-hazard-analysis.mdx",
        "new_file": "20-safety-and-hazard-analysis.mdx",
        "old_slug": "09-safety-and-hazard-analysis",
        "new_slug": "20-safety-and-hazard-analysis",
        "num": "20",
        "title": "20 — Safety Analysis, HAZOP, ATEX & Explosion Protection",
        "clean_title": "Safety Analysis, HAZOP, ATEX & Explosion Protection",
        "act": "Electrical, Controls & Safety Automation",
        "actId": "act-4"
    },
    {
        "old_file": "15-commissioning-test-plan.mdx",
        "new_file": "21-commissioning-and-qualification-test-plan.mdx",
        "old_slug": "15-commissioning-test-plan",
        "new_slug": "21-commissioning-and-qualification-test-plan",
        "num": "21",
        "title": "21 — Commissioning, Hydrostatic Testing & Vacuum Leak Qual",
        "clean_title": "Commissioning, Hydrostatic Testing & Vacuum Leak Qual",
        "act": "Commissioning & Maintenance",
        "actId": "act-5"
    },
    {
        "old_file": "17-maintenance-and-troubleshooting.mdx",
        "new_file": "22-maintenance-and-troubleshooting.mdx",
        "old_slug": "17-maintenance-and-troubleshooting",
        "new_slug": "22-maintenance-and-troubleshooting",
        "num": "22",
        "title": "22 — Preventative Maintenance, Seal Overhaul & Diagnostics",
        "clean_title": "Preventative Maintenance, Seal Overhaul & Diagnostics",
        "act": "Commissioning & Maintenance",
        "actId": "act-5"
    }
]

chapters_dir = os.path.join(os.getcwd(), "research-data", "hosokawa-afd-freeze-dryer", "chapters")

# Read all contents first
contents = {}
for item in MAPPING:
    old_path = os.path.join(chapters_dir, item["old_file"])
    with open(old_path, "r", encoding="utf-8") as f:
        contents[item["old_file"]] = f.read()

# Build replace table for slugs and paths
slug_replacements = {}
for item in MAPPING:
    slug_replacements[item["old_slug"]] = item["new_slug"]

# Process each file content
updated_contents = {}
for item in MAPPING:
    raw = contents[item["old_file"]]
    
    # 1. Update frontmatter
    # Replace title
    raw = re.sub(r'title:\s*["\'].*?["\']', f'title: "{item["clean_title"]}"', raw, count=1)
    # Replace chapterNumber
    raw = re.sub(r'chapterNumber:\s*["\'].*?["\']', f'chapterNumber: "{item["num"]}"', raw, count=1)
    # Replace slug
    raw = re.sub(r'slug:\s*["\'].*?["\']', f'slug: "{item["new_slug"]}"', raw, count=1)
    # Replace act
    raw = re.sub(r'act:\s*["\'].*?["\']', f'act: "{item["act"]}"', raw, count=1)
    # Replace actId
    raw = re.sub(r'actId:\s*["\'].*?["\']', f'actId: "{item["actId"]}"', raw, count=1)
    
    # 2. Update top H1 heading
    raw = re.sub(r'^(#\s+)(\d+\s*[—\-–:]*\s*)([^\n]+)', f'# {item["title"]}', raw, flags=re.MULTILINE, count=1)
    
    # 3. Replace all internal links to other chapters
    for old_s, new_s in slug_replacements.items():
        raw = raw.replace(f'/{old_s}', f'/{new_s}')
        raw = raw.replace(f'"{old_s}"', f'"{new_s}"')
        raw = raw.replace(f"'{old_s}'", f"'{new_s}'")
    
    updated_contents[item["new_file"]] = raw

# Remove all old files
for item in MAPPING:
    old_path = os.path.join(chapters_dir, item["old_file"])
    if os.path.exists(old_path):
        os.remove(old_path)

# Write all new files
for item in MAPPING:
    new_path = os.path.join(chapters_dir, item["new_file"])
    with open(new_path, "w", encoding="utf-8") as f:
        f.write(updated_contents[item["new_file"]])

print("Successfully restructured all 22 chapters with 01-22 sequential numbering!")
