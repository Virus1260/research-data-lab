# PROJECT.md — Project Overview: Research Data Lab

## 1. What We Are Building
**Research Data Lab** is an interactive, browser-based engineering laboratory, interactive compendium, and simulation suite dedicated to advanced pharmaceutical process technology, specifically the **Hosokawa Active Freeze Dryer (AFD)**.

The system serves pharmaceutical formulation scientists, bioprocess engineers, cleanroom validation specialists, and equipment design engineers. It provides interactive, mathematically rigorous documentation, real-time thermodynamic simulation, interactive mechanical bills of materials (BOM), and dynamic publishing capabilities.

---

## 2. Why We Are Building It (The Problem It Solves)
Conventional pharmaceutical freeze-drying (lyophilization) is historically performed in **static shelf/tray dryers**:
- Solutions are filled into thousands of individual glass vials or shallow trays placed on refrigerated shelves.
- Drying cycles are slow (often 48–120 hours) due to poor conductive heat transfer through glass and static ice beds.
- Results in uneven cake structures, edge-effect temperature variations, and high scrap rates.
- Unloading dried vial cakes requires manual milling, micronization, or powder filling under aseptic cleanrooms, risking contamination and worker exposure to potent active pharmaceutical ingredients (APIs).

**The Solution — Active Freeze Drying (AFD):**
The Hosokawa AFD revolutionizes this process:
- It utilizes an **agitated, downward-pointing conical vessel** with a jacketed wall and a central rotating orbital screw or ribbon stirrer.
- Liquid product is rapidly frozen into granular frozen particles while gently agitated.
- Primary and secondary drying occur under dynamic vacuum agitation, achieving **up to 10× faster sublimation heat transfer** than static trays.
- The finished product discharges directly through a bottom aseptic valve as a **free-flowing, uniform, sterile powder**, completely eliminating tray handling and separate micronization milling.

---

## 3. Core Features (Non-Negotiable)
1. **Curriculum of 19 Interactive Engineering Chapters**:
   - Structured into 4 thematic Act Stations:
     - **Act I**: Foundations & The Core Thesis (Ch 01–05)
     - **Act II**: Physics & Mathematical Modeling (Ch 06–09)
     - **Act III**: Subsystems, Mechanical Design & Engineering (Ch 10–13)
     - **Act IV**: Make It Real — Validation, Troubleshooting & Sources (Ch 14–19)
2. **Interactive Physics Simulators & Split Formula Engines**:
   - Real-time numerical evaluation of thermodynamic equations (Clausius-Clapeyron, heat transfer flux, sublimation rate, vacuum pumpdown evacuation).
   - Side-by-side animated split display: pure symbolic mathematical law on the left, live evaluated variables on the right driven by interactive range sliders.
3. **Master Bill of Materials (The Bench BOM)**:
   - Exhaustive specification of 74 commercial & custom engineering parts across 17 process subsystems (conical vessel, vacuum system, cooling jacket, orbital drive, aseptic discharge valve, CIP/SIP).
4. **Primary Literature Reference Catalog**:
   - 34 verified patents, academic papers, and pharmaceutical monographs, formatted with dynamic interactive outbound badges and direct links.
5. **Natural Studio Voice Narration**:
   - Built-in human-sounding speech engine with natural Indian English personas (`Dr. Ananya Sharma` and `Prof. Rajesh Ramanathan`).
   - Phonetic English numeral pronunciation, cadence-matched pauses, live in-page word highlighting, and synchronized smooth scrolling.
6. **Duplex Spiral-Binding Print & Word Export Engine**:
   - One-click export for both individual chapters and the entire 19-chapter compendium into Microsoft Word (`.doc`), print-ready PDF, and Markdown (`.md`).
   - A4 duplex layout with 28mm spine gutter margins (odd pages left, even pages right) to ensure spiral binding never punches through text.
   - Genuine Word XML headers, footers with dynamic page numbers (`Page X of Y`), and styled data tables.
7. **Master Topic & Subtopic Global Drawer**:
   - Collapsible right-edge navigation drawer accessible on every page via the top navigation bar or keyboard shortcut (`B`).
