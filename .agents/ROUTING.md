# ROUTING.md — Application Navigation, Entry & Exit Architecture

## 1. Routing Model
The application uses the **Next.js 15 App Router** filesystem hierarchy under `/app`. Dynamic segments are wrapped in brackets (`[project]`, `[chapter]`).

---

## 2. Primary Entry Points
| Route | File Path | Type | Purpose |
|---|---|---|---|
| `/` | `app/page.tsx` | RSC | **The Archive**: Global lab catalog listing available research packages and monographs. |
| `/[project]` | `app/[project]/page.tsx` | RSC | **Topic Curriculum Index**: The definitive table of contents for a monograph, structured into 4 Act Stations and 19 chapters. Contains the full compendium export engine. **Never place large simulator playgrounds directly here**. |
| `/[project]/[chapter]` | `app/[project]/[chapter]/page.tsx` | RSC | **Chapter Reader & Simulator**: In-depth chapter reading environment, supporting inline KaTeX equations, synchronized audio playback, word highlighting, and individual chapter exports. |

---

## 3. Dedicated Laboratory & Specialized Stations
| Route | File Path | Description |
|---|---|---|
| `/[project]/lab` | `app/[project]/lab/page.tsx` | **The Lab (Physics Playground)**: Dedicated laboratory workspace hosting 4 thermodynamic simulators (Clausius-Clapeyron, sublimation rate, vacuum evacuation, refrigeration duty). |
| `/[project]/bom` | `app/[project]/bom/page.tsx` | **The Bench (BOM)**: Interactive bill of materials inspecting 74 parts across 17 engineering subsystems with filtering, cost breakdowns, and specs. |
| `/[project]/references` | `app/[project]/references/page.tsx` | **The Shelf (Sources)**: Complete bibliography of 34 verified patents, academic papers, and technical monographs with interactive outbound link cards. |

---

## 4. API Endpoints
| Endpoint | File Path | Method | Purpose |
|---|---|---|---|
| `/api/topics` | `app/api/topics/route.ts` | `GET` | Returns JSON hierarchy of all 19 chapters and their subheadings for the global Master Bookmark Drawer. |
| `/api/audio/[project]/[chapter]` | `app/api/audio/[project]/[chapter]/route.ts` | `GET` | Streams pre-generated studio audio or synthesized speech manifests. |

---

## 5. Exit Points & Outbound Actions
1. **Export Modal Engine (`components/exhibit/ExportModal.tsx`)**:
   - **Microsoft Word Export**: Triggers dynamic client-side generation and download of `.doc` files with duplex margins, real HTML tables, and dynamic headers/footers.
   - **Markdown Export**: Generates `.md` dossier downloads formatted for Obsidian and note vaults.
   - **Browser Print Preview**: Triggers `window.print()` formatted for A4 physical duplex printing or "Save as PDF".
2. **Interactive External References (`InteractiveUrlLink`)**:
   - All references to patents (USPTO, EPO), academic journals, and standards are rendered with structured interactive badges that safely open outbound destinations (`target="_blank"`, `rel="noopener noreferrer"`).

---

## 6. Global Navigation Overlays
- **Master Bookmark Drawer (`components/exhibit/MasterBookmarkDrawer.tsx`)**:
  - Registered globally in `app/layout.tsx`.
  - Accessible via the `Index` button in the top navigation bar or pressing the `B` key anywhere on the site.
  - Allows jumping directly to any subtopic in any of the 19 chapters.
- **Floating Narrator Deck (`components/narrator/NarratorDeck.tsx`)**:
  - Appears whenever audio playback begins. Minimizable into a compact pill in the corner.
