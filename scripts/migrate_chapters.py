import os
import re
from pathlib import Path

source_dir = Path("afd_freeze_dryer_docs")
dest_dir = Path("research-data/hosokawa-afd-freeze-dryer/chapters")
dest_dir.mkdir(parents=True, exist_ok=True)

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
}

simulators_map = {
    "02": ["PhaseDiagramExplorer"],
    "03": ["AfdComparisonFlip"],
    "04": ["CycleProfileScrubber"],
    "05": ["VesselCrossSection3D"],
    "06": ["VacuumPumpdownSimulator", "ComparativePressureDetector", "RefrigerationCascadeDiagram"],
    "11": ["SublimationRateCalculator", "RefrigerationLoadCalculator", "VacuumPumpdownSimulator"],
}

files = sorted([f for f in os.listdir(source_dir) if f.endswith(".md")])
print(f"Found {len(files)} markdown source files.")

for fname in files:
    src_path = source_dir / fname
    with open(src_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Determine num prefix
    num_match = re.match(r"^(\d+)", fname)
    num = num_match.group(1) if num_match else "00"

    # Destination name with hyphens instead of underscores
    dest_name = fname.replace("_", "-").replace(".md", ".mdx").lower()
    slug = dest_name.replace(".mdx", "")

    # Extract title from first # heading or filename
    title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    if title_match:
        raw_title = title_match.group(1).strip()
        # Clean title e.g. "03 — What Is Actually..." -> "What Is Actually..."
        title = re.sub(r"^\d+\s*[-—:]\s*", "", raw_title).strip()
    else:
        title = slug.replace("-", " ").title()

    act_info = act_mapping.get(num, {"act": "General", "actId": "act-0"})
    sims = simulators_map.get(num, [])

    # Approximate reading time (200 words/min)
    word_count = len(content.split())
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
    # Replace markdown image links with Next.js public-friendly path
    # e.g., diagrams/water_phase_diagram.png -> /research-data/hosokawa-afd-freeze-dryer/diagrams/water_phase_diagram.png
    processed_content = re.sub(
        r'(!\[.*?\]\()diagrams/([^)]+\.png)\)',
        r'\1/research-data/hosokawa-afd-freeze-dryer/diagrams/\2)',
        content
    )
    processed_content = re.sub(
        r'(!\[.*?\]\()(\./)?diagrams/([^)]+\.png)\)',
        r'\1/research-data/hosokawa-afd-freeze-dryer/diagrams/\3)',
        processed_content
    )

    out_file = dest_dir / dest_name
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(frontmatter + processed_content)

print(f"Successfully migrated {len(files)} chapters to {dest_dir}")
