# Adding New Research Projects to "Research Data"

"Research Data" is designed as a modular, extensible digital laboratory. Content and code are strictly decoupled: adding a new engineering dossier requires zero changes to the application code, routes, or layout components.

## Quickstart: Adding Project #2

### 1. Copy the Scaffold Template
```bash
cp -r research-data/_template-project research-data/your-new-project-slug
```

### 2. Configure `project.config.ts`
Edit `research-data/your-new-project-slug/project.config.ts`:
```ts
export const project: ProjectConfig = {
  slug: "your-new-project-slug",
  title: "Your Project Title",
  subtitle: "Engineering Dossier & Reconstructive Analysis",
  heroFinding: "The single most important technical finding goes here...",
  heroFindingHighlight: "highlighted key clause",
  tags: ["Aerospace", "Cryogenics", "Thermodynamics"],
  acts: [
    {
      id: "act-1",
      name: "Foundations",
      roman: "I",
      description: "First principles and mathematical derivations.",
      chapters: ["01-physics-and-math", "02-system-overview"],
    },
    // Add additional acts...
  ],
  simulators: {
    "01-physics-and-math": ["YourCustomSimulatorName"],
  },
  summary: "Comprehensive technical overview...",
  stats: {
    chaptersCount: 12,
    subsystemsCount: 8,
    bomItemsCount: 45,
    referencesCount: 20,
  },
};
```

### 3. Add Chapters (`/chapters/`)
Place your research files in `research-data/your-new-project-slug/chapters/` as `.mdx` files with frontmatter:
```markdown
---
title: "Chapter Title"
chapterNumber: "01"
slug: "01-chapter-slug"
act: "Foundations"
actId: "act-1"
readTime: "5 min read"
simulators: ["YourCustomSimulatorName"]
---

# 01 — Chapter Title

Your engineering content in Markdown/MDX...
```

### 4. Supply Structured Data (`/data/`)
- **`bom.json`**: An array of bill-of-materials items (`id`, `subsystem`, `item`, `notes`, `makeOrBuy`, `source`, `packageRef`, `qty`, `unitCost`).
- **`references.json`**: An array of cited references (`id`, `category`, `title`, `description`, `url`, `citedByChapters`).

### 5. Supply Diagrams (`/diagrams/`)
Place PNG/SVG diagrams in `research-data/your-new-project-slug/diagrams/` and copy them to `public/research-data/your-new-project-slug/diagrams/` for static web serving.

### 6. Optional: Add Narration Audio (`/audio/`)
Provide pre-generated neural narration audio `chapter-<num>.mp3` and timestamp manifest `chapter-<num>.manifest.json` in `research-data/your-new-project-slug/audio/` and `public/research-data/your-new-project-slug/audio/`.

### 7. Run & Verify
Start the development server:
```bash
npm run dev
```
Navigate to `http://localhost:3000` — your project will automatically appear as an interactive capsule in The Archive gallery and provide all Lab, Exhibit, Bench, and Shelf routes immediately.
