import os
import re

base_dir = r"e:\git_desktop\research-data-lab\research-data\hosokawa-afd-freeze-dryer\chapters"
target_files = [
    "00-readme.mdx",
    "01-beginner-foundations-and-glossary.mdx",
    "14-validation-qualification-and-gmp-compliance.mdx",
    "16-build-roadmap-prototype-to-pharma-capable.mdx",
    "18-references-and-source-list.mdx",
    "26-hosokawa-afd-patent-nl2026893b1-translation-and-engineering-analysis.mdx"
]

for fname in target_files:
    fpath = os.path.join(base_dir, fname)
    if not os.path.exists(fpath):
        print(f"{fname}: NOT FOUND")
        continue
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    yts = re.findall(r"::youtube\[([^\]]+)\]\{([^}]+)\}", content)
    imgs = re.findall(r"!\[([^\]]*)\]\(([^)]+)\)", content)
    eqs = re.findall(r"\$\$([\s\S]*?)\$\$", content)
    print(f"=== {fname} ===")
    print(f"Lines: {len(content.splitlines())}")
    print(f"YouTube links ({len(yts)}):")
    for yt in yts:
        print(f"  - URL: {yt[0]} | Meta: {yt[1]}")
    print(f"Images ({len(imgs)}):")
    for img in imgs:
        print(f"  - Alt: {img[0]} | Path: {img[1]}")
    print(f"Equations count: {len(eqs)}")
    print()
