import asyncio
import json
import re
from pathlib import Path
import edge_tts

chapter_path = Path("research-data/hosokawa-afd-freeze-dryer/chapters/03-hosokawa-afd-vs-generic-lyophilizers.mdx")
output_audio = Path("research-data/hosokawa-afd-freeze-dryer/audio/chapter-03.mp3")
output_manifest = Path("research-data/hosokawa-afd-freeze-dryer/audio/chapter-03.manifest.json")
public_audio = Path("public/research-data/hosokawa-afd-freeze-dryer/audio/chapter-03.mp3")
public_manifest = Path("public/research-data/hosokawa-afd-freeze-dryer/audio/chapter-03.manifest.json")

output_audio.parent.mkdir(parents=True, exist_ok=True)
public_audio.parent.mkdir(parents=True, exist_ok=True)

# Read MDX
with open(chapter_path, "r", encoding="utf-8") as f:
    raw_mdx = f.read()

# Strip frontmatter
content = re.sub(r"^---[\s\S]*?---\s*", "", raw_mdx)

# Extract paragraphs and headings to form narration text
lines = content.split("\n")
narration_segments = []

for line in lines:
    line_clean = line.strip()
    if not line_clean:
        continue
    # Skip raw links or markdown tables if any
    if line_clean.startswith("|") or line_clean.startswith("```"):
        continue
    if line_clean.startswith("# "):
        narration_segments.append(f"Chapter 3: {line_clean.replace('# ', '')}.")
    elif line_clean.startswith("## "):
        narration_segments.append(f"Section: {line_clean.replace('## ', '')}.")
    elif line_clean.startswith("### "):
        narration_segments.append(f"{line_clean.replace('### ', '')}.")
    elif line_clean.startswith("- "):
        bullet_text = line_clean[2:].strip()
        # Clean bold tags
        bullet_text = re.sub(r"\*\*(.*?)\*\*", r"\1", bullet_text)
        bullet_text = re.sub(r"\*(.*?)\*", r"\1", bullet_text)
        bullet_text = re.sub(r"https?://\S+", "", bullet_text)
        narration_segments.append(bullet_text)
    else:
        para_text = re.sub(r"\*\*(.*?)\*\*", r"\1", line_clean)
        para_text = re.sub(r"\*(.*?)\*", r"\1", para_text)
        para_text = re.sub(r"https?://\S+", "", para_text)
        if len(para_text) > 10:
            narration_segments.append(para_text)

# We want a concise, authoritative narration representing Chapter 3's core findings
# Combine top high-impact segments into a cohesive spoken script
spoken_script = " ".join(narration_segments[:25]) # Narrative core covering intro, patents, and comparison

print(f"Prepared narration script with {len(spoken_script.split())} words.")

async def generate():
    voice = "en-US-ChristopherNeural"
    comm = edge_tts.Communicate(spoken_script, voice=voice, rate="+2%", pitch="-1Hz", boundary="SentenceBoundary")

    audio_bytes = bytearray()
    boundaries = []

    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            audio_bytes.extend(chunk["data"])
        elif chunk["type"] == "SentenceBoundary":
            start_sec = round(chunk["offset"] / 10_000_000, 3)
            dur_sec = round(chunk["duration"] / 10_000_000, 3)
            end_sec = round(start_sec + dur_sec, 3)
            boundaries.append({
                "id": len(boundaries) + 1,
                "text": chunk["text"],
                "start": start_sec,
                "end": end_sec,
                "duration": dur_sec
            })

    total_duration = boundaries[-1]["end"] if boundaries else 0

    with open(output_audio, "wb") as f:
        f.write(audio_bytes)
    with open(public_audio, "wb") as f:
        f.write(audio_bytes)

    manifest_data = {
        "chapterSlug": "03-hosokawa-afd-vs-generic-lyophilizers",
        "chapterNumber": "03",
        "title": "What Is Actually Hosokawa/AFD-Specific vs. Generic Pharma Freeze-Drying",
        "audioUrl": "/research-data/hosokawa-afd-freeze-dryer/audio/chapter-03.mp3",
        "voice": voice,
        "totalDuration": total_duration,
        "cuesCount": len(boundaries),
        "cues": boundaries
    }

    with open(output_manifest, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)
    with open(public_manifest, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)

    print(f"Successfully generated {output_audio} ({len(audio_bytes)} bytes, duration: {total_duration}s) with {len(boundaries)} sentence cues.")

asyncio.run(generate())
