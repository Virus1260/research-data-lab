# MASTER BUILD PROMPT — "Research Data" Interactive Lab (v1: Hosokawa AFD Freeze Dryer)

You are an expert full-stack developer and elite UI/UX design engineer. You are building **"Research Data"** — a personal, ever-growing digital laboratory that turns deep technical research dossiers into visual, interactive, narrated experiences. This is not a blog and not a docs site. It should feel like walking into a well-lit private research lab where every exhibit responds to your touch.

This prompt ships **project #1 — the Hosokawa AFD Pharma Freeze Dryer study** — as both the seed content and the reference implementation that proves out the reusable architecture every future project will slot into.

---

## 0. Environment & Tooling Context

Before writing any code, load context from my local setup:

- **Skills vault** (1,032+ modular skills) at `E:\git_desktop\ai-agents-skills-vault\skills\` and the platform-specific mirrors (`~/.gemini/config/skills/`, `~/.agents/skills/`, `~/.claude/skills/`, `~/.cursor/skills/`). Proactively inspect and invoke whatever is relevant — at minimum check for `taste-skill`, `ui-ux-pro-max`, `impeccable`, `emil-design-eng`, `animate`, `ponytail`, `omni-context-rtk`, `vercel-react-best-practices`, and anything scroll/animation/3D/audio related.
- **161 brand `DESIGN.md` token sets** at `E:\git_desktop\ai-agents-skills-vault\design-systems\`. Pull tokens (not full themes) from **Vercel** (obsidian minimalism, Geist type system) and **Linear** (keyboard-driven navigation, restraint) as your base influences — see §6 for how they combine with this project's own palette.
- **Dynamic skill discovery**: if a capability you need has no installed skill (e.g., MDX-to-SSML narration pipelines, a specific 3D-model-viewer pattern, a command-palette pattern), run Vercel's `find-skills` (`npx skills find <query>` or check `skills.sh`) and install what's genuinely useful before hand-rolling it.
- **Vercel Web Interface Guidelines**: full compliance — visual hierarchy, WCAG AA/AAA contrast, visible focus states, full keyboard navigation, 44×44px minimum touch targets, real loading/empty/error states, Geist/Geist Mono type scale.
- **Testing**: Playwright CLI / Vercel's `agent-browser`, run against a local `next dev` server. No feature is "done" until it passes a zero-console-error, zero-hydration-mismatch, three-viewport (390 / 768 / 1440px) automated pass with screenshots as evidence. Self-heal on failure and re-run until green.
- **Code discipline**: atomic, minimal, no speculative abstraction (Ponytail principles). Content is data, not hardcoded JSX — see §9.

**Operating instruction:** Acknowledge this context in one sentence, name the specific skills/guidelines/design tokens you're pulling in for this build, then proceed straight to implementation. Don't ask me clarifying questions you can reasonably resolve from this document — make a call, note the assumption in a comment, and keep moving.

---

## 1. Product Vision

A first-time visitor lands, and within one screen understands: *this is a place where dense engineering research becomes something you explore, not something you scroll past.* They pick a project. They land in that project's "lab." They can absorb it two ways simultaneously — **listening** to a narrator that never stops just because they've looked away from the current paragraph, and **looking**, dragging sliders on real physics (a phase diagram, a pump-down curve, a refrigeration load) and watching the numbers respond in real time, because the underlying formulas are wired up, not decorative.

Every one of the 19 research chapters already delivered (see §3) has a single hardest idea in it. The site's job is to make that idea *felt*, not just stated — the way a working diagram of a sublimation curve or a live agitator-clearance model teaches faster than a paragraph ever could.

---

## 2. Repository Restructuring — "Research Data" as a Container

Reorganize the repo so content and code are fully decoupled:

```
/research-data/                          ← all research projects live here, forever
  /hosokawa-afd-freeze-dryer/            ← project #1 (this ship)
    project.config.ts                    ← metadata + chapter order + simulator registry (schema in §9)
    /chapters/
      00-readme.mdx
      01-beginner-foundations-and-glossary.mdx
      02-physics-and-thermodynamics.mdx
      03-hosokawa-afd-vs-generic-lyophilizers.mdx
      04-system-architecture-and-subsystems.mdx
      05-vessel-chamber-agitator-and-materials.mdx
      06-refrigeration-vacuum-and-condenser-systems.mdx
      07-cip-sip-sealing-insulation-utilities.mdx
      08-instrumentation-controls-electrical-structural.mdx
      09-safety-and-hazard-analysis.mdx
      10-materials-fabrication-tolerances-workshop-vs-purchased.mdx
      11-design-calculations-and-sizing-methodology.mdx
      12-bill-of-materials-and-system-breakdown.mdx
      13-drawings-and-schematics-to-create.mdx
      14-validation-qualification-and-gmp-compliance.mdx
      15-commissioning-test-plan.mdx
      16-build-roadmap-prototype-to-pharma-capable.mdx
      17-maintenance-and-troubleshooting.mdx
      18-references-and-source-list.mdx
    /diagrams/                           ← the 5 originals: water_phase_diagram.png,
                                            stirred_conical_freeze_dryer_schematic.png,
                                            system_block_diagram.png,
                                            refrigeration_cascade_diagram.png,
                                            freeze_drying_cycle_profile.png
    /data/
      bom.json                           ← re-exported from the delivered BOM .xlsx (74 line items,
                                            17 subsystems, columns: subsystem, item, notes, makeOrBuy,
                                            source, packageRef, qty, unitCost)
    /audio/                              ← generated narration output lands here (see §8)
  /_template-project/                    ← a scaffold folder future projects are copied from
/app/                                    ← Next.js App Router, reads /research-data at build time
```

**Why this shape:** dropping a new folder into `/research-data/` with the same `project.config.ts` contract is the *entire* integration step for project #2, #3, #N. No page, route, or component should ever hardcode "freeze dryer."

---

## 3. What You're Actually Visualizing (Project #1 Content Map)

This project is a 19-chapter engineering research dossier on a real piece of pharmaceutical equipment (Hosokawa's Active Freeze Dryer), built from the manufacturer's own patents and public technical literature. Its single most important finding, and the one the whole site should make unmissable within the first few seconds on the project's landing screen:

> **The AFD is not a conventional shelf/tray freeze dryer.** It's an agitated, jacketed, downward-conical vessel — mechanically the same family as a conical screw mixer — where product is frozen and dried while being continuously stirred, coming out as loose powder instead of vial "cakes." Almost everything people assume about freeze dryers (static shelves, a separate ice condenser) doesn't apply here.

Treat that sentence as the hero statement of the entire project. Everything else — the 18 supporting chapters, the 5 diagrams, the 74-line BOM, the calculations — exists to unpack *that* claim from first principles (physics) through to buildable hardware (BOM, drawings, roadmap).

Group the 19 chapters into four acts for navigation purposes (see §4) — don't present them as one flat list of 19 links:

| Act | Chapters | Narrative role |
|---|---|---|
| **I. Foundations** | 01, 02 | Build the physics vocabulary from zero |
| **II. The Machine** | 03, 04, 05, 06, 07, 08 | The AFD-specific architecture, subsystem by subsystem |
| **III. Build It** | 09, 10, 11, 12, 13, 16 | Safety, fabrication, sizing math, BOM, drawings, staged roadmap |
| **IV. Make It Real** | 14, 15, 17, 18 | Validation/GMP, commissioning, maintenance, sources |

---

## 4. Site Map & Navigation Flow

```
/                          → THE ARCHIVE (project selector — landing page)
/[project]                 → THE LAB (project hub / overview)
/[project]/[chapter]       → EXHIBIT (single chapter, scrollytelling + simulators)
/[project]/bom             → THE BENCH (interactive BOM / parts explorer)
/[project]/references      → THE SHELF (source list, filterable by which chapter cites it)
```

**Flow, step by step:**

1. **The Archive (`/`)** — Not a list. A dark gallery of glowing "research capsules" (cards), one per project. Each capsule shows: title, one-line hook, a tiny looping preview (e.g., the phase-diagram curve animating), tag chips (Pharma Engineering / Mechanical / Vacuum Systems). Hovering lifts the capsule and starts its preview animation. Clicking triggers a shared-layout transition (Motion `layoutId`) straight into that project's hub — the capsule visually *becomes* the hub's hero, so the transition never feels like a hard page load.

2. **The Lab (`/[project]`)** — The project hub. Hero zone leads with the single most important finding (§3), rendered big, with the key phrase visually distinct (this is also lesson zero in how the narrator/emphasis system works — see §6 and §8). Below the hero: **not** a linear table of contents. A grid/console of four **Act stations** (§3's grouping), each expandable into its chapters. A persistent right-edge rail shows overall progress (chapters visited, simulators touched) like an instrument's status LEDs.

3. **Exhibit (`/[project]/[chapter]`)** — One chapter. Scrollytelling layout (Lenis smooth scroll + GSAP ScrollTrigger pins/reveals): sections fade/slide in as they reach the viewport, tables render as real components (not raw markdown tables), and every place the source content has a number-heavy concept (a formula, a calculation, a diagram) gets one of the interactive simulators from §7 embedded inline, live, in place of a static image. A collapsible left mini-map shows this chapter's sub-sections as jump anchors.

4. **The Bench (`/[project]/bom`)** — `bom.json` rendered as a real interactive table: filter by subsystem, filter by Make/Buy, search, click a row to see its `packageRef` jump straight to the relevant Exhibit chapter/section.

5. **The Shelf (`/[project]/references`)** — every source from chapter 18, filterable by which chapter cites it, each with an outbound link.

**Global, persistent across every route inside a project:** the narrator control deck (§8) and a `⌘K` command palette (search chapters, jump to any simulator, jump to a BOM item, toggle theme) — this is the "I don't want to scroll to get anywhere" escape hatch, Linear-style.

---

## 5. UI/UX Interaction Model — "Live Laboratory," Not a Document

Explicitly reject the single-column, top-to-bottom scroll-only doc layout. Every screen should read as an **instrument**, not a page:

- **Hub pages** are consoles/dashboards (grid of stations, not a bullet list).
- **Chapter pages** scroll, but the scroll drives *state changes* (pinned sections, revealed layers, simulators that animate in) rather than just revealing more static text.
- **The BOM** is a real interactive data table, not a markdown table screenshot.
- **The vessel** (Ch. 05) is something you rotate and peel apart in 3D, not a flat PNG.
- Depth and hierarchy come from **light** (soft glows, backlit panel edges) and **motion**, not drop shadows and rounded-card sprawl.

---

## 6. Feel & Taste — "Obsidian Cleanroom"

Direction: a fusion of clinical lab-instrument precision and the dark, warm-metal cinematic register you already established for your GitHub profile (dark-gold, cinematic, luxury — not flat/generic AI-slop). Concretely:

- **Base palette**: near-black obsidian background (`#0A0B0D`–`#111318` range), graphite panels one step lighter, hairline 1px borders at low opacity instead of drop-shadow cards.
- **Data/instrument accent**: a cold blue-white (`#7FD4FF`-ish) for chart lines, live readouts, vacuum/cryogenic motifs — this is the "the machine is alive" color.
- **Signal accent (gold)**: a warm amber-gold (in your established dark-gold register) reserved *exclusively* for: the single most important sentence on any page, active navigation state, the narrator's current-emphasis highlight (§8), and primary CTAs. Because it's scarce, it always means "pay attention here" — tie this directly into the TTS emphasis system so sight and sound reinforce the same signal.
- **Type**: Geist Sans for prose, **Geist Mono for every number, unit, formula, and spec** — this single choice does a lot of work to make the site feel like precision instrumentation rather than a blog.
- **Texture**: a faint grain/noise overlay and subtle backlight bloom on hover states — evokes a lit instrument panel, not a flat SaaS dashboard.
- **Motion register**: slow, confident, physically-damped easing for structural transitions (page/section changes); reserve springier, bouncier physics for small tactile controls only (sliders, toggles, the play button) — precision over playfulness everywhere else.

Pull Vercel's obsidian-minimalist `DESIGN.md` tokens and Linear's spacing/keyboard-nav tokens as your base scaffolding, then apply the palette/type above on top — don't ship either brand's theme verbatim.

---

## 7. Signature Interactive Simulators (build these — this is the whole point)

Each is a small, self-contained, reusable component (see §9's registry pattern) wired to the *actual* equations already derived in the research content — not illustrative-only widgets.

1. **Phase Diagram Explorer** (Ch. 02) — draggable point on a live P–T plot (log-scale pressure). Dragging updates a readout: "at this T/P, water is: SOLID / LIQUID / VAPOR / SUBLIMING." Toggleable overlay of the freeze-drying operating window and the triple point (0.01 °C, 6.11 mbar). Base this on the existing `water_phase_diagram.png` but make every curve computed (Clausius–Clapeyron-derived), not a static raster.
2. **Sublimation Rate & Jacket Area Calculator** (Ch. 11) — sliders for heat-transfer coefficient U, ΔT, and batch water mass; live-computed heat duty, sublimation rate, and drying time, with a small animated ice→vapor visual that speeds up/slows down as you drag.
3. **Freezing-Stage Refrigeration Load Calculator** (Ch. 11) — sliders for batch mass, water fraction, and target freeze time; outputs average refrigeration duty against Hosokawa's own disclosed 0.1–10 °C/min patent range, flagging in gold if a chosen freeze time falls outside it.
4. **Vacuum Pump-Down Simulator** (Ch. 06 / 11) — sliders for vessel volume and pump speed; renders the live exponential pump-down curve to a chosen target pressure.
5. **Comparative Pressure ("End of Drying") Detector** (Ch. 06) — a scrubbable timeline showing the Pirani and capacitance-manometer traces converging; scrubbing to the convergence point highlights "primary drying complete" — this is the single best "aha, that's how they know it's done" moment in the whole dossier.
6. **Full Cycle Profile Scrubber** (Ch. 04, built on `freeze_drying_cycle_profile.png`'s data) — one time slider drives jacket temp, product temp, and chamber pressure together, with the five process-stage bands highlighting as the marker crosses them.
7. **3D Vessel Cross-Section** (Ch. 05, react-three-fiber) — rotate the conical vessel; toggle-peel outer cladding → jacket → wall → agitator; hover any layer for its spec callout (materials, clearance tolerance, etc.).
8. **AFD vs. Generic Lyophilizer Flip Comparison** (Ch. 03) — an interactive toggle/slider that morphs between the two machine architectures side by side, mirroring Ch. 03 §5's table but as a visual, not a table.
9. **Refrigeration Cascade Diagram** (Ch. 06) — the existing block diagram rebuilt as clickable SVG nodes (anime.js flow-path animation along the refrigerant lines); clicking a component reveals its role.

If any of these needs a charting/interaction pattern you don't already have a skill for (e.g., a log-scale draggable-point plot), that's exactly the trigger for the Vercel `find-skills` step in §0 — don't hand-roll fragile D3 code you don't have a tested pattern for.

---

## 8. The Narrator Engine — "Lab Assistant" Audio

This is a first-class feature, not an accessibility afterthought. Requirements:

- **Not** robotic default browser TTS run raw. Every chapter's narration is **pre-generated at build time** (content is static/versioned, so there's no reason to pay real-time latency or accept lower quality) using a neural TTS with real prosody control — **ElevenLabs** is the primary recommendation for natural, expressive delivery; **Azure Neural TTS** or **Google Cloud TTS** are acceptable SSML-robust fallbacks if cost is a constraint. Request word/sentence-level timestamps from whichever provider you use (both ElevenLabs and Azure support this) so playback can highlight text in sync.
- **Content → speech pipeline**: walk each chapter's MDX AST and transform it before synthesis: `**bold**` spans → `<emphasis level="strong">` (and these are exactly the phrases that should also get the gold-accent highlight from §6 — sight and sound share one "pay attention" signal); em-dashes and colons → short `<break>`; paragraph boundaries → medium `<break>`; H2/H3 headings → a longer pause (a "new section" chime is a nice touch). Numbers and formulas get a slightly reduced `rate` so they're parseable by ear.
- **Decoupled playback (the specific behavior you asked for)**: the narrator queues and plays an entire chapter (or the whole project) as one continuous track. **Scrolling ahead in the visual content never pauses, restarts, or waits for the narrator.** The current spoken paragraph gets a subtle passive indicator (a soft gold underline) purely as a locator — it never forces the viewport to follow. A separate, explicitly opt-in **"Sync scroll to narration"** toggle exists for anyone who *wants* auto-follow; it is off by default.
- **Persistent control deck** (bottom bar, present on every Exhibit page): play/pause, ±15s skip, 0.75×–2× speed, next/previous chapter, and a mini transcript popover. This deck is the same component used across every future project — build it once, generically, driven by whatever chapter audio manifest is active.

---

## 9. Tech Stack & Content Schema

- **Framework**: Next.js 15 (App Router) + TypeScript + Tailwind CSS.
- **Content layer**: Velite (or Contentlayer2) reading `/research-data/**`, MDX + Zod-validated frontmatter. `project.config.ts` shape (illustrative):
  ```ts
  export const project = {
    slug: "hosokawa-afd-freeze-dryer",
    title: "Hosokawa AFD Pharma Freeze Dryer",
    heroFinding: "The AFD is not a conventional shelf/tray freeze dryer...",
    tags: ["Pharma Engineering", "Mechanical", "Vacuum Systems"],
    acts: [
      { name: "Foundations", chapters: ["01-...", "02-..."] },
      { name: "The Machine", chapters: ["03-...", "04-...", "05-...", "06-...", "07-...", "08-..."] },
      { name: "Build It", chapters: ["09-...", "10-...", "11-...", "12-...", "13-...", "16-..."] },
      { name: "Make It Real", chapters: ["14-...", "15-...", "17-...", "18-..."] },
    ],
    simulators: {
      "02-physics-and-thermodynamics": ["PhaseDiagramExplorer"],
      "06-refrigeration-vacuum-and-condenser-systems": ["VacuumPumpdownSimulator", "ComparativePressureDetector", "RefrigerationCascadeDiagram"],
      "11-design-calculations-and-sizing-methodology": ["SublimationRateCalculator", "RefrigerationLoadCalculator"],
      // ...
    },
  } satisfies ProjectConfig;
  ```
  This is the **entire contract** a future project must satisfy — no other code should special-case a project by name.
- **Animation**: **Motion** (formerly Framer Motion — package is now `motion`, import from `motion/react`) for component/page/shared-layout transitions; **GSAP** (100% free as of the Webflow acquisition, ScrollTrigger/ScrollSmoother/SplitText/Flip/MorphSVG all included, no license needed) for scroll-driven reveals and SVG diagram animation; **anime.js** for small bespoke SVG micro-animations (refrigerant-flow paths, vapor paths); **Lenis** underlying all scroll for inertial smoothness.
- **3D**: react-three-fiber + drei for the vessel cross-section.
- **Simulators/charts**: visx or D3 for the custom physics widgets in §7 (they need real per-pixel interaction, not chart-library defaults); Recharts is fine anywhere a simpler static-ish chart suffices.
- **UI primitives**: shadcn/ui + Radix (accessible foundations), Lucide icons, `cmdk` for the ⌘K palette.
- **Audio**: pre-generated narration files + timestamp manifests, served as static assets per chapter; a thin client player component reads the manifest.

---

## 10. Skill Vault & Dynamic Discovery Protocol

- Before building each major subsystem (narrator, 3D vessel, physics simulators, command palette), check the local skills vault first for a matching, already-vetted pattern.
- If nothing matches, run `npx skills find "<capability>"` (or check `skills.sh`) and install a vetted skill rather than improvising a brittle one-off.
- Log which skills you actually used at the top of your final summary so the vault's own catalog can be updated later.

---

## 11. Quality Bar & Testing Loop

For every route and every simulator:
- Automated Playwright pass at 390px / 768px / 1440px+.
- Zero console errors, zero React/Next hydration mismatches, zero broken network requests.
- Interactive journeys: drag every simulator's controls through their full range and assert the displayed numbers actually change and stay physically sensible (e.g., pump-down time never negative, phase state matches the real water phase diagram).
- Verify narration playback survives scrolling to a different chapter and back without restarting, and that the "Sync scroll" toggle behaves as specified in §8.
- Full-page screenshots captured as visual proof for both the Archive and at least one Exhibit page, light-mode-off (this is a dark-first product) and at all three viewports.
- Self-heal: on any failure, diagnose from the stack trace/DOM snapshot, patch, re-run — don't hand back a partially-green result.

---

## 12. Deliverable

Ship, in order:
1. The restructured `/research-data/hosokawa-afd-freeze-dryer/` content tree (chapters migrated in as MDX, diagrams and `bom.json` moved in).
2. The Next.js app shell: Archive → Lab → Exhibit → Bench → Shelf routes, fully data-driven off `project.config.ts`.
3. At minimum, simulators #1, #2, #4, and #6 from §7 fully working end-to-end (the rest can follow, but these four are the MVP proof that "everything can be simulated" isn't just a slogan).
4. The narrator control deck with at least one fully narrated chapter (Ch. 03, since it carries the hero finding) as the proof-of-concept for the full pipeline in §8.
5. The `_template-project/` scaffold folder plus a short `CONTRIBUTING.md` explaining how to drop in project #2.
6. Your automated test results and screenshots as evidence, per §11.
