import os

cdir = r'research-data/hosokawa-afd-freeze-dryer/chapters'
files = sorted(os.listdir(cdir))

all_blocks = []

for f in files:
    if not f.endswith(('.mdx', '.md')): continue
    fpath = os.path.join(cdir, f)
    with open(fpath, 'r', encoding='utf-8') as fp:
        lines = fp.readlines()
    
    in_code = False
    code_lang = ''
    code_lines = []
    start_line = 0
    
    for idx, line in enumerate(lines, 1):
        if line.strip().startswith('```'):
            if not in_code:
                in_code = True
                code_lang = line.strip()[3:].strip().lower()
                code_lines = []
                start_line = idx
            else:
                in_code = False
                text = ''.join(code_lines)
                all_blocks.append({
                    'file': f,
                    'start': start_line,
                    'end': idx,
                    'lang': code_lang,
                    'content': text
                })
        elif in_code:
            code_lines.append(line)

print(f'Total code blocks across all 22 chapters: {len(all_blocks)}')
for idx, b in enumerate(all_blocks, 1):
    print(f"\n--- BLOCK {idx}: {b['file']} ({b['start']}-{b['end']}) [lang: '{b['lang']}'] ---")
    safe_content = b['content'].encode('ascii', 'replace').decode('ascii')
    print(safe_content)
