import os
import re
import csv
import json
from pathlib import Path

source_dir = Path("data/1_afd_freeze_dryer_docs/stage-2")
dest_dir = Path("research-data/hosokawa-afd-freeze-dryer/chapters")
dest_dir.mkdir(parents=True, exist_ok=True)

# 1. Delete old temporary chapter 22 if present
old_ch22 = dest_dir / "22-practical-equipment-sizing-vacuum-and-cryogenics.mdx"
if old_ch22.exists():
    old_ch22.unlink()
    print("Deleted obsolete 22-practical-equipment-sizing-vacuum-and-cryogenics.mdx")

act_mapping = {
    "00": {"act": "Overview", "actId": "act-0"},
    "01": {"act": "Foundations", "actId": "act-1"},
    "02": {"act": "Foundations", "actId": "act-1"},
    "03": {"act": "The Machine", "actId": "act-2"},
    "04": {"act": "The Machine", "actId": "act-2"},
    "05": {"act": "The Machine", "actId": "act-2"},
    "06": {"act": "The Machine", "actId": "act-2"},
    "07": {"act": "The Machine", "actId": "act-2"},
    "08": {"act": "The Machine", "actId": "act-2"},
    "09": {"act": "Build It", "actId": "act-3"},
    "10": {"act": "Build It", "actId": "act-3"},
    "11": {"act": "Build It", "actId": "act-3"},
    "12": {"act": "Build It", "actId": "act-3"},
    "13": {"act": "Build It", "actId": "act-3"},
    "14": {"act": "Make It Real", "actId": "act-4"},
    "15": {"act": "Make It Real", "actId": "act-4"},
    "16": {"act": "Build It", "actId": "act-3"},
    "17": {"act": "Make It Real", "actId": "act-4"},
    "18": {"act": "Make It Real", "actId": "act-4"},
    "19": {"act": "Automation, P&ID & CAD", "actId": "act-5"},
    "20": {"act": "Automation, P&ID & CAD", "actId": "act-5"},
    "21": {"act": "Automation, P&ID & CAD", "actId": "act-5"},
    "22": {"act": "Automation, P&ID & CAD", "actId": "act-5"},
    "23": {"act": "Automation, P&ID & CAD", "actId": "act-5"},
    "24": {"act": "Automation, P&ID & CAD", "actId": "act-5"},
}

simulators_map = {
    "02": ["PhaseDiagramExplorer"],
    "03": ["AfdComparisonFlip"],
    "04": ["CycleProfileScrubber"],
    "05": ["VesselCrossSection3D"],
    "06": ["VacuumPumpdownSimulator", "ComparativePressureDetector", "RefrigerationCascadeDiagram"],
    "11": ["SublimationRateCalculator", "RefrigerationLoadCalculator", "VacuumPumpdownSimulator"],
}

# Helper to read CSV to markdown table
def csv_to_md_table(csv_path: Path) -> str:
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)
    if not rows:
        return ""
    header = rows[0]
    md = "| " + " | ".join(header) + " |\n"
    md += "| " + " | ".join(["---"] * len(header)) + " |\n"
    for r in rows[1:]:
        # Escape any pipe in cells and wrap in clean format
        clean_cells = [cell.replace("|", "\\|").replace("\n", "<br>") for cell in r]
        md += "| " + " | ".join(clean_cells) + " |\n"
    return md

# Helper to build CAD schedule markdown tables
def cad_json_to_md(json_path: Path) -> str:
    with open(json_path, mode="r", encoding="utf-8") as f:
        data = json.load(f)
    
    md = "\n## Design Basis\n\n"
    md += "| Parameter | Specification / Basis |\n|---|---|\n"
    for k, v in data.get("design_basis", {}).items():
        k_clean = k.replace("_", " ").title()
        md += f"| **{k_clean}** | {v} |\n"
    
    md += "\n## Major Equipment Schedule\n\n"
    eq_list = data.get("equipment_schedule", [])
    if eq_list:
        headers = ["Tag", "Description", "Process Rating", "Jacket Rating", "Design Temp", "Product Contact MOC", "Notes"]
        md += "| " + " | ".join(headers) + " |\n"
        md += "| " + " | ".join(["---"] * len(headers)) + " |\n"
        for eq in eq_list:
            row = [
                f"`{eq.get('tag', '')}`",
                eq.get('description', ''),
                eq.get('design_pressure_process_side', ''),
                eq.get('design_pressure_jacket_side', ''),
                eq.get('design_temperature', ''),
                eq.get('moc_product_contact', ''),
                eq.get('notes', '').replace("\n", "<br>")
            ]
            md += "| " + " | ".join(row) + " |\n"

    md += "\n## Vessel Nozzle Schedule (V-101)\n\n"
    noz_list = data.get("nozzle_schedule", [])
    if noz_list:
        headers = ["Nozzle", "Function", "Size / Range", "Connection Standard", "Gasket MOC", "Face-to-Face / Notes"]
        md += "| " + " | ".join(headers) + " |\n"
        md += "| " + " | ".join(["---"] * len(headers)) + " |\n"
        for noz in noz_list:
            row = [
                f"**{noz.get('nozzle_tag', '')}**",
                noz.get('function', ''),
                noz.get('size_dn_range', ''),
                noz.get('connection_standard', ''),
                noz.get('gasket_moc', ''),
                noz.get('face_to_face_note', noz.get('notes', ''))
            ]
            md += "| " + " | ".join(row) + " |\n"

    md += "\n## Valve Schedule & Fail Positions\n\n"
    vlv_list = data.get("valve_schedule", [])
    if vlv_list:
        headers = ["Valve Tag", "Valve Type", "Actuation", "Fail Position", "Connection"]
        md += "| " + " | ".join(headers) + " |\n"
        md += "| " + " | ".join(["---"] * len(headers)) + " |\n"
        for vlv in vlv_list:
            row = [
                f"`{vlv.get('tag', '')}`",
                vlv.get('type', ''),
                vlv.get('actuation', ''),
                f"**{vlv.get('fail_position', '')}**",
                vlv.get('connection', '')
            ]
            md += "| " + " | ".join(row) + " |\n"

    return md

files = sorted([f for f in os.listdir(source_dir) if f.endswith(".md")])
print(f"Found {len(files)} markdown source files in {source_dir}.")

for fname in files:
    src_path = source_dir / fname
    with open(src_path, "r", encoding="utf-8") as f:
        content = f.read()

    num_match = re.match(r"^(\d+)", fname)
    num = num_match.group(1) if num_match else "00"

    dest_name = fname.replace("_", "-").replace(".md", ".mdx").lower()
    slug = dest_name.replace(".mdx", "")

    # Extract title from first # heading or filename
    title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    if title_match:
        raw_title = title_match.group(1).strip()
        title = re.sub(r"^\d+\s*[-—:]\s*", "", raw_title).strip()
    else:
        title = slug.replace("-", " ").title()

    act_info = act_mapping.get(num, {"act": "General", "actId": "act-0"})
    sims = simulators_map.get(num, [])

    # Process and enhance content per chapter
    processed_content = content

    # Replace relative diagram references
    processed_content = re.sub(
        r'(!\[.*?\]\()diagrams/([^)]+)\)',
        r'\1/diagrams/\2)',
        processed_content
    )

    # Specific chapter enhancements
    if num == "02":
        if "/diagrams/water_phase_diagram.png" not in processed_content:
            processed_content = re.sub(
                r'(## 1\..*?\n)',
                r'![Water Phase Diagram & Lyophilization Path](/diagrams/water_phase_diagram.png)\n\n\1',
                processed_content,
                count=1
            )
    elif num == "04":
        if "/diagrams/system_block_diagram.png" not in processed_content:
            processed_content = re.sub(
                r'(## 1\..*?\n)',
                r'![AFD System Architecture Block Diagram](/diagrams/system_block_diagram.png)\n\n<SystemArchitectureFlowChart />\n\n\1',
                processed_content,
                count=1
            )
        elif "<SystemArchitectureFlowChart />" not in processed_content:
            processed_content = processed_content.replace(
                "![AFD System Architecture Block Diagram](/diagrams/system_block_diagram.png)",
                "![AFD System Architecture Block Diagram](/diagrams/system_block_diagram.png)\n\n<SystemArchitectureFlowChart />"
            )
    elif num == "05":
        if "/diagrams/stirred_conical_freeze_dryer_schematic.png" not in processed_content:
            processed_content = re.sub(
                r'(## 1\..*?\n)',
                r'![Stirred Conical Freeze Dryer Schematic](/diagrams/stirred_conical_freeze_dryer_schematic.png)\n\n\1',
                processed_content,
                count=1
            )
    elif num == "06":
        if "/diagrams/refrigeration_cascade_diagram.png" not in processed_content:
            processed_content = re.sub(
                r'(## 2\..*?\n)',
                r'![Refrigeration Cascade System Diagram](/diagrams/refrigeration_cascade_diagram.png)\n\n\1',
                processed_content,
                count=1
            )
    elif num == "19":
        if "/diagrams/pid_afd_freeze_dryer.png" not in processed_content:
            processed_content = re.sub(
                r'(## 1\..*?\n)',
                r'![P&ID — AFD-Style Stirred/Agitated Pharma Freeze Dryer](/diagrams/pid_afd_freeze_dryer.png)\n\n\1',
                processed_content,
                count=1
            )
    elif num == "20":
        if "/diagrams/control_system_architecture.png" not in processed_content:
            processed_content = re.sub(
                r'(## 1\..*?\n)',
                r'![Control System Architecture — BPCS vs SIS](/diagrams/control_system_architecture.png)\n\n<AutomationHierarchyChart />\n\n\1',
                processed_content,
                count=1
            )
        elif "<AutomationHierarchyChart />" not in processed_content:
            processed_content += "\n\n<AutomationHierarchyChart />\n"
    elif num == "21":
        if "/diagrams/isa88_batch_structure.png" not in processed_content:
            processed_content = re.sub(
                r'(## 1\..*?\n)',
                r'![ISA-88 Batch Structure & Phase State Machine](/diagrams/isa88_batch_structure.png)\n\n<BatchStateTransitionChart />\n\n\1',
                processed_content,
                count=1
            )
        elif "<BatchStateTransitionChart />" not in processed_content:
            processed_content += "\n\n<BatchStateTransitionChart />\n"
    elif num == "22":
        # Inject the Cause & Effect matrix table and I/O list table
        ce_csv = Path("data/1_afd_freeze_dryer_docs/stage-2/pid_controls_data/cause_and_effect_matrix.csv")
        io_csv = Path("data/1_afd_freeze_dryer_docs/stage-2/pid_controls_data/io_list.csv")
        
        ce_table = csv_to_md_table(ce_csv) if ce_csv.exists() else ""
        io_table = csv_to_md_table(io_csv) if io_csv.exists() else ""

        appendix = f"\n\n---\n\n## IEC 62881 Cause & Effect Interlock Matrix\n\n{ce_table}\n\n---\n\n## Complete Control System I/O List (30 Tags)\n\n{io_table}\n"
        processed_content = processed_content + appendix
    elif num == "24":
        # Inject the CAD equipment, nozzle and valve schedule
        cad_json = Path("data/1_afd_freeze_dryer_docs/stage-2/pid_controls_data/cad_equipment_nozzle_schedule.json")
        if cad_json.exists():
            appendix = "\n\n---\n\n" + cad_json_to_md(cad_json)
            processed_content = processed_content + appendix

    # Word count and read time
    word_count = len(processed_content.split())
    read_minutes = max(1, round(word_count / 200))

    frontmatter = f"""---
title: "{title}"
chapterNumber: "{num}"
slug: "{slug}"
act: "{act_info['act']}"
actId: "{act_info['actId']}"
readTime: "{read_minutes} min read"
simulators: {sims}
---

"""
    out_file = dest_dir / dest_name
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(frontmatter + processed_content)

    print(f"Wrote chapter {num}: {dest_name} ({read_minutes} min read)")

print(f"All {len(files)} chapters successfully migrated to {dest_dir}!")
