# TECH_STACK.md — Core Technologies, Libraries & Approved Tools

## 1. Primary Technology Stack
| Category | Technology | Version | Usage |
|---|---|---|---|
| **Framework** | Next.js | 15.5.x | App Router architecture, React 19 compatibility, Server Components (RSC). |
| **Language** | TypeScript | 5.x | Strict mode enabled (`tsconfig.json`). Full type safety for domain models. |
| **Styling** | Tailwind CSS | 3.4.x | Utility-first styling integrated with custom CSS variables in `globals.css`. |
| **Math Rendering** | KaTeX | 0.16.x | High-performance rendering of LaTeX engineering and thermodynamic formulas. |
| **Iconography** | Lucide React | 0.475.x | Consistent, lightweight SVG iconography throughout the lab interface. |
| **Speech Engine** | Web Speech API | Native | In-browser neural voice synthesis with custom cadence pauses and phonetic rules. |

---

## 2. Core Domain Data Types (`lib/types.ts`)
- `ProjectConfig`: Metadata for a research monograph, including slug, title, hero finding, acts, and stats.
- `ChapterMeta`: Full representation of an individual chapter, including chapter number, read time, act ID, simulators, headings, and raw content.
- `BOMItem`: Structured definition for parts in the 74-item bill of materials (part number, subsystem, vendor, material, cryogenic rating).
- `VoicePersona`: Audio persona definitions (`id`, `name`, `role`, `accent`, `lang`, `avatar`, `pitch`, `rate`, `pauseScale`).

---

## 3. Audio & Speech Architecture
The laboratory includes an integrated speech engine (`components/narrator/`):
- **Natural Personas**:
  - `Dr. Ananya Sharma` (Indian English Female, Lead Bioprocess Scientist, warm professional cadence).
  - `Prof. Rajesh Ramanathan` (Indian English Male, Senior Thermal Engineering Consultant, measured analytical cadence).
- **Human Touch Engineering**:
  - Phonetic conversion of numbers (e.g., reads `"03"` as `"three"`, `"0"` as empty or `"zero"` depending on context, preventing robotic `"shunya teen"` utterances).
  - Punctuation clause pauses: adds weighted silence after semicolons, commas, periods, and formula terms.
  - Live in-page word highlighting synchronized with `SpeechSynthesisUtterance.onboundary`.

---

## 4. Package Installation Policy
> [!IMPORTANT]
> **Strict Agent Policy**: Do not install new npm packages without asking the user.
> The codebase already has KaTeX, Lucide React, Tailwind, and full TypeScript support. Always leverage existing utilities in `lib/` and native browser APIs.
