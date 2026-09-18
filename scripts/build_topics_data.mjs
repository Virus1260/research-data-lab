import fs from "fs";
import path from "path";

const chaptersDir = path.join(process.cwd(), "research-data", "hosokawa-afd-freeze-dryer", "chapters");
const outputFile = path.join(process.cwd(), "lib", "topics-data.ts");

function parseMDX(rawContent) {
  let frontmatter = {};
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
        let val = parts.slice(1).join(":").trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        frontmatter[key] = val;
      }
    }
  }

  const headings = [];
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

  return { frontmatter, headings };
}

const files = fs.readdirSync(chaptersDir).filter(f => f.endsWith(".mdx") || f.endsWith(".md")).sort();
const chapterTopics = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(chaptersDir, file), "utf-8");
  const { frontmatter, headings } = parseMDX(content);
  const slug = file.replace(/\.(mdx|md)$/, "");
  const numMatch = slug.match(/^(\d+)/);
  const num = numMatch ? numMatch[1] : "00";

  chapterTopics.push({
    slug: frontmatter.slug || slug,
    chapterNumber: frontmatter.chapterNumber || num,
    title: frontmatter.title || slug,
    act: frontmatter.act || "General",
    actId: frontmatter.actId || "act-1",
    readTime: frontmatter.readTime || "5 min read",
    headings
  });
}

// Sort by chapterNumber
chapterTopics.sort((a, b) => a.chapterNumber.localeCompare(b.chapterNumber));

const outputCode = `// ─────────────────────────────────────────────────────────────────────────────
// PRE-COMPILED STATIC RESEARCH TOPIC INDEX
// Zero-latency, 120 FPS synchronous data store for MasterBookmarkDrawer
// Eliminates network roundtrips and loading screens entirely.
// ─────────────────────────────────────────────────────────────────────────────

export interface TopicHeading {
  level: number;
  text: string;
  id: string;
}

export interface ChapterTopic {
  slug: string;
  chapterNumber: string;
  title: string;
  act: string;
  actId: string;
  readTime: string;
  headings: TopicHeading[];
}

export const STATIC_CHAPTER_TOPICS: ChapterTopic[] = ${JSON.stringify(chapterTopics, null, 2)};
`;

fs.writeFileSync(outputFile, outputCode, "utf-8");
console.log(`Generated static topic index with ${chapterTopics.length} chapters into ${outputFile}`);
