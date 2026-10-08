import re

fpath = r"e:\git_desktop\research-data-lab\research-data\hosokawa-afd-freeze-dryer\chapters\26-hosokawa-afd-patent-nl2026893b1-translation-and-engineering-analysis.mdx"
with open(fpath, "r", encoding="utf-8") as f:
    text = f.read()

eqs = re.findall(r"\$\$([\s\S]*?)\$\$", text)
print(f"Equations in Ch 26 ({len(eqs)}):")
for eq in eqs:
    print("---")
    print(eq.strip())
