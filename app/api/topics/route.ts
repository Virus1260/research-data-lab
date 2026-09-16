import { NextResponse } from "next/server";
import { getProjectChapters } from "@/lib/content";

export const dynamic = "force-static";

export async function GET() {
  try {
    const chapters = getProjectChapters("hosokawa-afd-freeze-dryer");
    const topics = chapters.map((c) => ({
      slug: c.slug,
      chapterNumber: c.chapterNumber,
      title: c.title,
      act: c.act,
      actId: c.actId,
      readTime: c.readTime,
      headings: c.headings.filter((h) => h.level <= 3),
    }));
    return NextResponse.json(topics);
  } catch (err) {
    console.error("Error fetching topics:", err);
    return NextResponse.json([], { status: 500 });
  }
}
