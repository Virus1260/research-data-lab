# STANDARDS.md — Visual, Architectural & Code Quality Standards

## 1. Next.js Component Architecture Rules
1. **Server Components (RSC) by Default**:
   - All page entries (`app/page.tsx`, `app/[project]/page.tsx`, `app/[project]/[chapter]/page.tsx`) must remain Server Components.
   - Perform file reading, Markdown/MDX parsing, and metadata generation exclusively on the server (`lib/content.ts`).
   - Pass serializable plain data props to interactive client leaf components.

2. **Isolated Client Components (`"use client"`)**:
   - Mark a component with `"use client"` **only** when it requires:
     - React state or lifecycle hooks (`useState`, `useEffect`, `useCallback`, `useRef`).
     - Browser-specific APIs (`window`, `navigator.speechSynthesis`, `localStorage`, clipboard).
     - User interactions (sliders, audio playback, toggle modals, drawers).
   - Keep client components as small, localized leaves at the bottom of the component hierarchy (e.g., `MonographExportButton`, `NarratorDeck`, `DynamicSplitFormula`).

---

## 2. Design System & CSS Token Standards
The application uses a semantic token architecture backed by CSS custom properties in `app/globals.css` and Tailwind CSS utilities.

### Color Tokens (Never use unmapped ad-hoc hex values):
- **Amber Palette (Core Scientific Accent & Thermodynamics)**:
  - `--amber`: `#c68410` (standard brand gold/amber)
  - `--amber-bright`: `#d99b26` (hover & high-emphasis state)
  - `--amber-subtle`: translucent warm tint for badge backdrops and glows
  - `--on-amber`: high-contrast dark ink `#0e0a02` for text on solid amber buttons
- **Cryo Palette (Cooling, Vacuum & Cryogenics)**:
  - `--cryo`: `#0284c7` (cyan/blue cold accent)
  - `--cryo-bright`: `#38bdf8`
  - `--cryo-subtle`: translucent cool tint
- **Neutral & Surface Tokens**:
  - `--bg-base`: underlying viewport canvas
  - `--bg-surface`: card surfaces and panels
  - `--bg-panel`: elevated containers and consoles
  - `--bg-inset`: indented form controls and badge chips
  - `--bg-hover`: active hover states
- **Typography Inks**:
  - `--ink-primary`: main high-contrast text headings and body
  - `--ink-secondary`: readable descriptive paragraphs (contrast >= 7:1)
  - `--ink-dim`: timestamps, chapter numbers, and metadata badges
  - `--border` / `--hairline`: subtle boundary dividers

### Contrast & Legibility Mandate:
- In dark and light modes, ensure all text meets WCAG AAA standards.
- Range sliders and interactive handles must have clear visible tracks and tactile thumb controls with grab cursors.

---

## 3. Print & Publishing Standards (Duplex Spiral-Binding Ready)
1. **Duplex A4 Gutter Margins**:
   - Spiral binding punching requires a **28mm binding margin (gutter)** on the spine edge.
   - **Odd (Recto) Pages**: Left margin `28mm`, Right margin `14mm`.
   - **Even (Verso) Pages**: Left margin `14mm`, Right margin `28mm`.
   - **Top & Bottom Margins**: Common `20mm`.
   - These rules must be declared identically in:
     - `@page :left` and `@page :right` in `app/globals.css`.
     - `mso-mirror-margins: 1; margin: 56.7pt 39.7pt 56.7pt 79.4pt;` in Word document exports.
2. **Pitch-Black Vector Print Contrast**:
   - Printing to PDF or physical paper must **never appear faded, gray, or halftoned**.
   - In `@media print`, explicitly enforce:
     ```css
     .chapter-body *, article *, p, li, td, th, div, span {
       color: #000000 !important;
       -webkit-text-fill-color: #000000 !important;
       opacity: 1 !important;
     }
     ```
   - Hide all non-print interface chrome: navigation headers, audio decks, sliders, and drawers.

---

## 4. Microsoft Word (.doc) Export Rules
1. Must generate genuine Microsoft Office HTML using XML namespaces:
   `xmlns:o='urn:schemas-microsoft-com:office:office'` and `xmlns:w='urn:schemas-microsoft-com:office:word'`.
2. Must embed `<w:View>Print</w:View>` to force Word into print-layout view on open.
3. Must use genuine Word dynamic page numbering codes in the running footer:
   `Page <span style="mso-field-code:' PAGE '"></span> of <span style="mso-field-code:' NUMPAGES '"></span>`.
4. Must include a structured **Document Chapter Index / Table of Contents** at the top of the file.
5. All Markdown tables must be converted to native HTML `<table>`, `<th>`, `<td>` with explicit borders, not raw ASCII pipes.

---

## 5. File Naming & Code Conventions
- **Components**: PascalCase filenames (`ExhibitReader.tsx`, `ExportModal.tsx`, `NarratorDeck.tsx`).
- **Pages & Routes**: Follow Next.js App Router conventions (`page.tsx`, `layout.tsx`).
- **Utilities & Helpers**: camelCase filenames (`lib/content.ts`, `lib/types.ts`).
- **CSS**: Consolidated in `app/globals.css`. No inline `<style>` tags with conflicting global rules.
