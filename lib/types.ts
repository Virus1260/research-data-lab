export interface ActConfig {
  id: string;
  name: string;
  roman: string;
  description: string;
  chapters: string[];
}

export interface ProjectStats {
  chaptersCount: number;
  subsystemsCount: number;
  bomItemsCount: number;
  referencesCount: number;
}

export interface ProjectConfig {
  slug: string;
  title: string;
  subtitle: string;
  heroFinding: string;
  heroFindingHighlight: string;
  tags: string[];
  acts: ActConfig[];
  simulators: Record<string, string[]>;
  summary: string;
  stats: ProjectStats;
}

export interface ChapterFrontmatter {
  title: string;
  chapterNumber: string;
  slug: string;
  act: string;
  actId: string;
  readTime: string;
  simulators: string[];
}

export interface ChapterMeta extends ChapterFrontmatter {
  content: string;
  headings: { level: number; text: string; id: string }[];
}

export interface BOMItem {
  id: number;
  subsystem: string;
  item: string;
  notes: string;
  makeOrBuy: string;
  source: string;
  packageRef: string;
  qty: string;
  unitCost: string;
}

export interface ReferenceItem {
  id: number;
  category: string;
  raw: string;
  title: string;
  description: string;
  url: string;
  citedByChapters: string[];
}

export interface AudioCue {
  id: number;
  text: string;
  start: number;
  end: number;
  duration: number;
}

export interface AudioManifest {
  chapterSlug: string;
  chapterNumber: string;
  title: string;
  audioUrl: string;
  voice: string;
  totalDuration: number;
  cuesCount: number;
  cues: AudioCue[];
}
