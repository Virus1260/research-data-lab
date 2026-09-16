import fs from "fs";
import path from "path";
import { project as hosokawaProject } from "@/research-data/hosokawa-afd-freeze-dryer/project.config";
import type { ProjectConfig, ChapterMeta, BOMItem, ReferenceItem, AudioManifest } from "@/lib/types";

const RESEARCH_DATA_DIR = path.join(process.cwd(), "research-data");

/**
 * Returns all active research projects in the laboratory
 */
export function getAllProjects(): ProjectConfig[] {
  // In v1, hosokawa-afd-freeze-dryer is project #1.
  // We can also scan the filesystem for future projects dropped in.
  const projects: ProjectConfig[] = [hosokawaProject];
  return projects;
}

export function getProjectBySlug(slug: string): ProjectConfig | null {
  if (slug === hosokawaProject.slug) {
    return hosokawaProject;
  }
  return null;
}

/**
 * Parses frontmatter and headings from an MDX file content
 */
function parseMDXContent(rawContent: string): { frontmatter: Record<string, any>; content: string; headings: { level: number; text: string; id: string }[] } {
  let frontmatter: Record<string, any> = {};
  let body = rawContent;

  const fmMatch = rawContent.match(/^---([\s\S]*?)---\s*([\s\S]*)$/);
  if (fmMatch) {
    const yamlBlock = fmMatch[1];
    body = fmMatch[2];

    const lines = yamlBlock.split("\n");
    for (const line of lines) {
      const parts = line.split(":");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let val: any = parts.slice(1).join(":").trim();
        // Strip quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        // Handle array
        if (val.startsWith("[") && val.endsWith("]")) {
          try {
            val = JSON.parse(val.replace(/'/g, '"'));
          } catch {
            val = [];
          }
        }
        frontmatter[key] = val;
      }
    }
  }

  // Extract headings
  const headings: { level: number; text: string; id: string }[] = [];
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(body)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ level, text, id });
  }

  return { frontmatter, content: body, headings };
}

/**
 * Returns all chapters for a given project
 */
export function getProjectChapters(projectSlug: string): ChapterMeta[] {
  const chaptersDir = path.join(RESEARCH_DATA_DIR, projectSlug, "chapters");
  if (!fs.existsSync(chaptersDir)) {
    return [];
  }

  const files = fs.readdirSync(chaptersDir).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  const chapters: ChapterMeta[] = [];

  for (const filename of files) {
    const fullPath = path.join(chaptersDir, filename);
    const rawContent = fs.readFileSync(fullPath, "utf-8");
    const { frontmatter, content, headings } = parseMDXContent(rawContent);

    const slug = filename.replace(/\.(mdx|md)$/, "");
    const numMatch = slug.match(/^(\d+)/);
    const num = numMatch ? numMatch[1] : "00";

    chapters.push({
      title: frontmatter.title || slug,
      chapterNumber: frontmatter.chapterNumber || num,
      slug: frontmatter.slug || slug,
      act: frontmatter.act || "General",
      actId: frontmatter.actId || "act-1",
      readTime: frontmatter.readTime || "5 min read",
      simulators: Array.isArray(frontmatter.simulators) ? frontmatter.simulators : [],
      content,
      headings,
    });
  }

  // Sort by chapterNumber
  return chapters.sort((a, b) => a.chapterNumber.localeCompare(b.chapterNumber));
}

/**
 * Returns a specific chapter by project and chapter slug
 */
export function getChapterBySlug(projectSlug: string, chapterSlug: string): ChapterMeta | null {
  const chapters = getProjectChapters(projectSlug);
  return chapters.find((c) => c.slug === chapterSlug) || null;
}

/**
 * Returns BOM items for a project
 */
export function getProjectBOM(projectSlug: string): BOMItem[] {
  const bomPath = path.join(RESEARCH_DATA_DIR, projectSlug, "data", "bom.json");
  if (!fs.existsSync(bomPath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(bomPath, "utf-8");
    return JSON.parse(raw) as BOMItem[];
  } catch (err) {
    console.error("Error reading BOM:", err);
    return [];
  }
}

/**
 * Returns references for a project
 */
export function getProjectReferences(projectSlug: string): ReferenceItem[] {
  const refsPath = path.join(RESEARCH_DATA_DIR, projectSlug, "data", "references.json");
  if (!fs.existsSync(refsPath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(refsPath, "utf-8");
    return JSON.parse(raw) as ReferenceItem[];
  } catch (err) {
    console.error("Error reading references:", err);
    return [];
  }
}

/**
 * Returns audio manifest for a chapter if it exists
 */
export function getChapterAudioManifest(projectSlug: string, chapterSlug: string): AudioManifest | null {
  const chNum = chapterSlug.split("-")[0];
  const possibleNames = [
    `${chapterSlug}.manifest.json`,
    `chapter-${chNum}.manifest.json`,
    `chapter-03.manifest.json`,
  ];

  for (const name of possibleNames) {
    const manifestPath = path.join(RESEARCH_DATA_DIR, projectSlug, "audio", name);
    if (fs.existsSync(manifestPath)) {
      try {
        return JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as AudioManifest;
      } catch (err) {
        console.error("Error reading audio manifest:", err);
      }
    }
  }

  return null;
}

/**
 * Returns audio file URL for a chapter if it exists in public or research-data
 */
export function getChapterAudioUrl(projectSlug: string, chapterSlug: string): string | null {
  const chNum = chapterSlug.split("-")[0];
  const possibleAudioFiles = [
    `${chapterSlug}.mp3`,
    `chapter-${chNum}.mp3`,
    `chapter-03.mp3`,
  ];

  const publicAudioDir = path.join(process.cwd(), "public", "research-data", projectSlug, "audio");
  for (const name of possibleAudioFiles) {
    if (fs.existsSync(path.join(publicAudioDir, name))) {
      return `/research-data/${projectSlug}/audio/${name}`;
    }
  }

  const researchAudioDir = path.join(RESEARCH_DATA_DIR, projectSlug, "audio");
  for (const name of possibleAudioFiles) {
    if (fs.existsSync(path.join(researchAudioDir, name))) {
      return `/research-data/${projectSlug}/audio/${name}`;
    }
  }

  return null;
}

