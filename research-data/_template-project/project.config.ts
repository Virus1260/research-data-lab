import type { ProjectConfig } from "../hosokawa-afd-freeze-dryer/project.config";

export const project: ProjectConfig = {
  slug: "template-research-project",
  title: "Template Research Project",
  subtitle: "Interactive Technical Research Dossier",
  heroFinding: "The single most important technical finding of this research dossier goes here.",
  heroFindingHighlight: "single most important technical finding",
  tags: ["Engineering", "Research", "Physics"],
  acts: [
    {
      id: "act-1",
      name: "Foundations",
      roman: "I",
      description: "Fundamental principles, mathematics, and baseline concepts.",
      chapters: ["01-introduction"],
    },
  ],
  simulators: {
    "01-introduction": [],
  },
  summary: "Template project scaffold for adding new engineering research dossiers to the Research Data lab.",
  stats: {
    chaptersCount: 1,
    subsystemsCount: 1,
    bomItemsCount: 1,
    referencesCount: 1,
  },
};
