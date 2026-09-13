import { notFound } from "next/navigation";
import { getProjectBySlug, getChapterBySlug, getProjectChapters, getChapterAudioManifest } from "@/lib/content";
import { ExhibitReader } from "@/components/exhibit/ExhibitReader";
import { SimulatorRegistry } from "@/components/simulators/SimulatorRegistry";

interface PageProps {
  params: Promise<{ project: string; chapter: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { project, chapter } = await params;
  const chapterData = getChapterBySlug(project, chapter);
  if (!chapterData) return { title: "Chapter Not Found" };

  return {
    title: `${chapterData.title} — Research Data Lab`,
    description: `Interactive chapter: ${chapterData.title}. ${chapterData.act} · ${chapterData.readTime}.`,
  };
}

export async function generateStaticParams() {
  const projectSlugs = ["hosokawa-afd-freeze-dryer"];
  const params: { project: string; chapter: string }[] = [];
  for (const project of projectSlugs) {
    const chapters = getProjectChapters(project);
    for (const ch of chapters) {
      params.push({ project, chapter: ch.slug });
    }
  }
  return params;
}

export default async function ChapterPage({ params }: PageProps) {
  const { project, chapter } = await params;

  const projectConfig = getProjectBySlug(project);
  if (!projectConfig) notFound();

  const chapterData = getChapterBySlug(project, chapter);
  if (!chapterData) notFound();

  const allChapters = getProjectChapters(project);
  const currentIndex = allChapters.findIndex((c) => c.slug === chapter);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  // Audio URL — check if manifest exists
  const audioManifest = getChapterAudioManifest(project, chapter);
  const audioUrl = `/research-data/${project}/audio/${chapter}.mp3`;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Simulators for this chapter (above the reader) */}
      {chapterData.simulators && chapterData.simulators.length > 0 && (
        <div className="px-4 sm:px-8 pt-8">
          <SimulatorRegistry simulatorIds={chapterData.simulators} />
        </div>
      )}

      <ExhibitReader
        chapter={chapterData}
        projectSlug={project}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
        audioUrl={audioManifest ? audioUrl : null}
      />
    </div>
  );
}
