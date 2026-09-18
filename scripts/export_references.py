import re
import json
from pathlib import Path

md_path = Path("data/1_afd_freeze_dryer_docs/stage-2/18_references_and_source_list.md")
out_json_path = Path("research-data/hosokawa-afd-freeze-dryer/data/references.json")

# Chapter mappings derived from file 18 section "How this package used these sources"
chapter_citations = {
    1: ["03", "04", "05"],
    2: ["03", "04"],
    3: ["03", "05"],
    4: ["07"],
    5: ["03"],
    6: ["03", "05", "06", "10", "11"],
    7: ["03", "05", "06", "08"],
    8: ["03"],
    9: ["02", "11"],
    10: ["02", "11"],
    11: ["06"],
    12: ["06", "11"],
    13: ["06", "14"],
    14: ["06"],
    15: ["06"],
    16: ["06"],
    17: ["06"],
    18: ["05", "10"],
    19: ["05", "10"],
    20: ["05", "10", "14"],
    21: ["05", "11"],
    22: ["05", "11"],
    23: ["05", "11"],
    24: ["05"],
    25: ["05"],
    26: ["14"],
    27: ["14"],
    28: ["08", "14"],
    29: ["14"],
    30: ["09"],
    31: ["09"],
    32: ["09"],
    33: ["09"],
    34: ["02", "11"],
    35: ["18", "19", "24"],
    36: ["18", "21", "24"],
    37: ["18", "19", "20"],
    38: ["03", "18"],
    39: ["06", "11", "23"],
    40: ["22"],
    41: ["20", "22"],
    42: ["21"],
    43: ["19"]
}

with open(md_path, encoding="utf-8") as f:
    lines = f.readlines()

current_cat = "General"
refs = []
cat_re = re.compile(r"^##\s+([A-Z]\.\s+.*)")
item_re = re.compile(r"^(\d+)\.\s+(.*)")

for line in lines:
    line_s = line.strip()
    c_m = cat_re.match(line_s)
    if c_m:
        current_cat = c_m.group(1).strip()
        continue
    i_m = item_re.match(line_s)
    if i_m:
        ref_id = int(i_m.group(1))
        content = i_m.group(2).strip()
        
        # Extract URL if present
        url = ""
        url_match = re.search(r"https?://[^\s\)]+", content)
        if url_match:
            url = url_match.group(0)

        # Clean title / author
        parts = content.split(" — ")
        title = parts[0].strip() if len(parts) > 1 else content
        description = parts[1].strip() if len(parts) > 1 else ""

        cited_by = chapter_citations.get(ref_id, [])

        refs.append({
            "id": ref_id,
            "category": current_cat,
            "raw": content,
            "title": title,
            "description": description,
            "url": url,
            "citedByChapters": cited_by
        })

print(f"Parsed {len(refs)} references.")
out_json_path.parent.mkdir(parents=True, exist_ok=True)
with open(out_json_path, "w", encoding="utf-8") as f:
    json.dump(refs, f, indent=2, ensure_ascii=False)
print(f"Saved references to {out_json_path}")
