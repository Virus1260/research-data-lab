# Research Data Lab

> An interactive digital laboratory that transforms dense engineering research dossiers into visual, narrated, playable experiences.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🧪 Project #1 — Hosokawa AFD Pharma Freeze Dryer

**The AFD is not a conventional shelf/tray freeze dryer.** It is an agitated, jacketed, downward-conical vessel where product is frozen and dried while being continuously stirred, discharging as loose powder instead of vial cakes.

This interactive lab covers:
- 19 chapters from foundations → physics → build plan
- 8 interactive physics simulators (drag sliders, see real equations live)
- 74-item annotated Bill of Materials
- 34 academic & patent references
- Neural TTS narration for Chapter 03 (with transcript sync)
- Light & dark theme (light by default)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Live Equation Playground** | Interact with Clausius-Clapeyron, sublimation rate, vacuum pumpdown & refrigeration equations |
| **Interactive Simulators** | 8 physics simulators wired to real engineering math |
| **Narration Engine** | Pre-generated audio with sentence-level transcript sync |
| **Light / Dark Theme** | Toggle via header (light default, persisted in `localStorage`) |
| **⌘K Command Palette** | Jump to any chapter, simulator, or BOM item instantly |
| **Proper Tables** | Professional data tables with hover states and filtering |
| **KaTeX Equations** | All formulas rendered with LaTeX precision |
| **Scrollytelling TOC** | Sticky mini-map with active section tracking |

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/research-data-lab.git
cd research-data-lab

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
research-data-lab/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (ThemeProvider, NarratorProvider)
│   ├── page.tsx                  # Archive — gallery of research capsules
│   └── [project]/
│       ├── page.tsx              # The Lab — project overview console
│       ├── [chapter]/page.tsx    # Exhibit — scrollytelling chapter reader
│       ├── bom/page.tsx          # The Bench — interactive BOM table
│       └── references/page.tsx   # The Shelf — source catalog
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # Nav + theme toggle
│   │   ├── ThemeProvider.tsx     # Light/dark context (localStorage)
│   │   └── ThemeScript.tsx       # FOUC prevention inline script
│   ├── exhibit/
│   │   ├── ExhibitReader.tsx     # Markdown → HTML renderer with KaTeX
│   │   ├── KatexEquation.tsx     # LaTeX equation renderer
│   │   └── LawEquationsPlayground.tsx  # 4 live physics playgrounds
│   ├── simulators/               # 8 interactive simulators
│   │   ├── PhaseDiagramExplorer.tsx
│   │   ├── SublimationRateCalculator.tsx
│   │   ├── VacuumPumpdownSimulator.tsx
│   │   ├── CycleProfileScrubber.tsx
│   │   └── ...
│   ├── narrator/                 # Audio narration engine
│   │   ├── NarratorContext.tsx
│   │   └── NarratorDeck.tsx
│   └── command-palette/          # ⌘K search
│
├── research-data/
│   └── hosokawa-afd-freeze-dryer/
│       ├── project.config.ts     # Project metadata & act structure
│       ├── chapters/             # 19 MDX chapter files
│       ├── data/
│       │   ├── bom.json          # 74 BOM line items
│       │   └── references.json   # 34 cited references
│       ├── diagrams/             # 5 technical diagrams
│       └── audio/                # Neural TTS narration + manifests
│
├── lib/
│   ├── content.ts                # Server-side content readers
│   ├── physics.ts                # Physics formula implementations
│   └── types.ts                  # TypeScript interfaces
│
└── scripts/
    ├── generate_narration.py     # Azure Neural TTS pipeline
    ├── export_bom.py             # Excel → JSON BOM export
    └── migrate_chapters.py       # MD → MDX migration
```

---

## 🎨 Design System

**Obsidian Cleanroom** (dark) / **Lab Daylight** (light):

| Token | Dark | Light |
|-------|------|-------|
| Background | `#08090A` | `#F5F6F8` |
| Panel | `#0D0F12` | `#FFFFFF` |
| Cryo accent | `#7FD4FF` | `#2B8DC8` |
| Amber accent | `#E5A93C` | `#C8830A` |
| Typography | Geist Sans + Geist Mono | Same |

---

## 🔬 Interactive Simulators

1. **Phase Diagram Explorer** (Ch. 02) — Draggable P–T chart with state boundaries
2. **Sublimation Rate Calculator** (Ch. 11) — Heat-duty → drying time
3. **Vacuum Pumpdown Simulator** (Ch. 06/11) — Exponential evacuation curve
4. **Cycle Profile Scrubber** (Ch. 04) — 5-stage process timeline
5. **Comparative Pressure Detector** (Ch. 06) — Pirani vs. capacitance gauge
6. **Refrigeration Load Calculator** (Ch. 11) — Cooling duty & patent spec
7. **AFD Comparison Flip** (Ch. 03) — AFD vs. conventional lyophilizer
8. **Vessel Cross-Section** (Ch. 05) — Interactive 3D vessel exploded view

---

## 📖 Adding a New Research Project

1. Create `research-data/<your-project-slug>/`
2. Add `project.config.ts` (copy from `_template-project/`)
3. Add MDX chapters in `chapters/`
4. Add `data/bom.json` and `data/references.json`
5. Run `npm run dev` — the project auto-appears in the Archive

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full schema.

---

## 🤖 Neural TTS Narration

```bash
pip install edge-tts
python scripts/generate_narration.py <chapter-slug>
# Outputs: public/research-data/<project>/audio/<chapter>.mp3
#          public/research-data/<project>/audio/<chapter>.manifest.json
```

---

## 🧠 Antigravity Brain Path

This project is maintained by the Antigravity IDE. The active brain/context for this project lives at:

```
C:\Users\Shekhar\.gemini\antigravity-ide\brain\c8a63233-3b28-442f-a429-51adf4072fb2\
```

To resume: open the Antigravity IDE and reference conversation `c8a63233-3b28-442f-a429-51adf4072fb2`.

---

## 📄 License

MIT © 2026 Research Data Lab
