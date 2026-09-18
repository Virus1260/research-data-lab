import json
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

xlsx_path = Path("data/1_afd_freeze_dryer_docs/stage-2/bom/AFD_replica_BOM.xlsx")
out_json_path = Path("research-data/hosokawa-afd-freeze-dryer/data/bom.json")

with zipfile.ZipFile(xlsx_path) as z:
    ss_root = ET.fromstring(z.read("xl/sharedStrings.xml"))
    ns = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
    shared_strings = []
    for si in ss_root.findall(f"{ns}si"):
        text = "".join(si.itertext())
        shared_strings.append(text)

    sheet_root = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
    rows = sheet_root.findall(f"{ns}sheetData/{ns}row")

    col_names = ["id", "subsystem", "item", "notes", "makeOrBuy", "source", "packageRef", "qty", "unitCost", "lineTotal"]
    items = []

    # Map column letter (A, B, C...) to index 0..9
    def col_idx(col_ref):
        letters = "".join([ch for ch in col_ref if ch.isalpha()])
        idx = 0
        for ch in letters:
            idx = idx * 26 + (ord(ch.upper()) - ord('A') + 1)
        return idx - 1

    # Skip header row (row index 0)
    for r in rows[1:]:
        row_cells = {}
        for c in r.findall(f"{ns}c"):
            ref = c.get("r", "")
            t = c.get("t", "")
            v = c.find(f"{ns}v")
            val = v.text if v is not None else ""
            if t == "s" and val.isdigit():
                val = shared_strings[int(val)]
            c_idx = col_idx(ref)
            if c_idx < len(col_names):
                row_cells[col_names[c_idx]] = val.strip() if isinstance(val, str) else val

        # Only include if we have at least an item name
        if row_cells.get("item"):
            # Clean up id
            raw_id = row_cells.get("id", "")
            try:
                item_id = int(raw_id)
            except ValueError:
                item_id = len(items) + 1

            item_obj = {
                "id": item_id,
                "subsystem": row_cells.get("subsystem", ""),
                "item": row_cells.get("item", ""),
                "notes": row_cells.get("notes", ""),
                "makeOrBuy": row_cells.get("makeOrBuy", ""),
                "source": row_cells.get("source", ""),
                "packageRef": row_cells.get("packageRef", ""),
                "qty": row_cells.get("qty", ""),
                "unitCost": row_cells.get("unitCost", ""),
            }
            items.append(item_obj)

print(f"Extracted {len(items)} BOM items across subsystems.")
out_json_path.parent.mkdir(parents=True, exist_ok=True)
with open(out_json_path, "w", encoding="utf-8") as f:
    json.dump(items, f, indent=2, ensure_ascii=False)

print(f"Successfully saved to {out_json_path}")
