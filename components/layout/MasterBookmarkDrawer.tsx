"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  Star,
  ExternalLink,
  BookOpen,
  Hash,
  Compass,
} from "lucide-react";

import { STATIC_CHAPTER_TOPICS, type ChapterTopic, type TopicHeading } from "@/lib/topics-data";

export function MasterBookmarkDrawer({
  projectSlug = "hosokawa-afd-freeze-dryer",
}: {
  projectSlug?: string;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  // Synchronous static data load: zero latency, 120 FPS instant rendering
  const [topics, setTopics] = useState<ChapterTopic[]>(STATIC_CHAPTER_TOPICS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "bookmarks">("all");
  const [savedBookmarks, setSavedBookmarks] = useState<string[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Auto-expand currently active chapter when drawer opens
  useEffect(() => {
    if (!isOpen) return;
    const current = topics.find((c) => pathname?.includes(c.slug));
    if (current) {
      setExpandedChapters((prev) => ({
        ...prev,
        [current.slug]: true,
      }));
    }
  }, [isOpen, pathname, topics]);

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("afd_research_bookmarks");
      if (stored) {
        setSavedBookmarks(JSON.parse(stored));
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  // Toggle bookmark
  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = savedBookmarks.includes(id)
      ? savedBookmarks.filter((b) => b !== id)
      : [...savedBookmarks, id];
    setSavedBookmarks(updated);
    try {
      localStorage.setItem("afd_research_bookmarks", JSON.stringify(updated));
    } catch (e) {
      // Ignore
    }
  };

  // Toggle chapter expansion
  const toggleChapter = (slug: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  // Keyboard shortcut: 'B' toggles drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "b" || e.key === "B") &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName) &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Filter topics and subtopics based on search query
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) {
      if (activeTab === "bookmarks") {
        return topics.filter(
          (c) =>
            savedBookmarks.includes(c.slug) ||
            c.headings.some((h) => savedBookmarks.includes(`${c.slug}#${h.id}`))
        );
      }
      return topics;
    }
    const q = searchQuery.toLowerCase();
    return topics
      .map((c) => {
        const matchesChapter =
          c.title.toLowerCase().includes(q) ||
          c.act.toLowerCase().includes(q) ||
          c.chapterNumber.includes(q);
        const matchingHeadings = c.headings.filter((h) =>
          h.text.toLowerCase().includes(q)
        );

        if (matchesChapter || matchingHeadings.length > 0) {
          return {
            ...c,
            headings: matchingHeadings.length > 0 ? matchingHeadings : c.headings,
          };
        }
        return null;
      })
      .filter(Boolean) as ChapterTopic[];
  }, [topics, searchQuery, activeTab, savedBookmarks]);

  return (
    <>
      {/* Edge Trigger Handle */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-bg-panel/95 backdrop-blur-md border-l border-t border-b border-hairline py-3.5 px-1.5 rounded-l-xl shadow-2xl flex flex-col items-center gap-2 hover:bg-bg-hover hover:border-amber transition group cursor-pointer"
        title="Open Master Topic & Subtopic Index (Shortcut: B)"
        aria-label="Open Topics and Bookmarks"
      >
        <Bookmark className="w-4 h-4 text-amber group-hover:scale-110 transition" />
        <span
          className="text-[10px] font-mono uppercase tracking-widest text-ink-muted group-hover:text-amber font-semibold"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          INDEX • B
        </span>
        {savedBookmarks.length > 0 && (
          <span className="w-4 h-4 rounded-full bg-amber text-on-amber text-[9px] font-bold flex items-center justify-center font-mono shadow-sm">
            {savedBookmarks.length}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-over Drawer Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[440px] bg-bg-panel/95 backdrop-blur-2xl border-l border-hairline shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-subtle flex items-center justify-center border border-amber/30 text-amber">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink-primary">Research Topic Navigator</h2>
              <p className="text-[11px] font-mono text-ink-dim">
                19 Chapters & Comprehensive Subtopic Anchors
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-ink-dim hover:text-ink-primary hover:bg-bg-hover transition"
            title="Close drawer (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 border-b border-hairline space-y-3 bg-bg-surface/40">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-ink-dim absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topics, equations, subtopics... (Esc to close)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-panel border border-hairline rounded-xl pl-9 pr-3 py-2 text-xs text-ink-primary placeholder:text-ink-dim font-mono outline-none focus:border-amber/60 transition shadow-inner"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-bg-panel border border-hairline rounded-xl text-xs font-mono">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-1 rounded-lg transition ${
                activeTab === "all"
                  ? "bg-amber text-on-amber font-bold shadow-sm"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              All Topics ({topics.length})
            </button>
            <button
              onClick={() => setActiveTab("bookmarks")}
              className={`flex-1 py-1 rounded-lg transition flex items-center justify-center gap-1 ${
                activeTab === "bookmarks"
                  ? "bg-amber text-on-amber font-bold shadow-sm"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              <span>Saved ({savedBookmarks.length})</span>
            </button>
          </div>
        </div>

        {/* Topics List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading && (
            <div className="text-center py-12 text-xs font-mono text-ink-dim">
              Loading comprehensive topic index...
            </div>
          )}

          {!loading && filteredTopics.length === 0 && (
            <div className="text-center py-12 text-xs font-mono text-ink-dim space-y-1">
              <p>No topics or subtopics match your search.</p>
              {activeTab === "bookmarks" && (
                <p className="text-[11px] text-amber">Click the star icon on any chapter or subtopic to save it here!</p>
              )}
            </div>
          )}

          {!loading &&
            filteredTopics.map((chapter) => {
              const isExpanded = expandedChapters[chapter.slug] || searchQuery.trim().length > 0;
              const isBookmarked = savedBookmarks.includes(chapter.slug);
              const isCurrentChapter = pathname?.includes(chapter.slug);

              return (
                <div
                  key={chapter.slug}
                  className={`rounded-xl transition-all ${
                    isCurrentChapter
                      ? "bg-bg-panel border-2 border-amber ring-2 ring-amber/25 shadow-md border-l-4 border-l-amber"
                      : "bg-bg-panel border border-hairline hover:border-hairline-strong hover:shadow-xs"
                  }`}
                >
                  {/* Chapter Header Row */}
                  <div className="p-3 flex items-start justify-between gap-2">
                    <button
                      onClick={() => toggleChapter(chapter.slug)}
                      className="flex items-start gap-2.5 text-left min-w-0 flex-1 group"
                    >
                      <span className={`p-1 rounded border transition mt-0.5 shrink-0 ${
                        isCurrentChapter
                          ? "bg-amber/15 border-amber/40 text-amber"
                          : "bg-bg-surface border-hairline text-ink-dim group-hover:text-amber"
                      }`}>
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        {isCurrentChapter ? (
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className="px-2 py-0.5 rounded bg-amber text-on-amber font-mono font-bold text-[10px] shadow-xs">
                              Ch {chapter.chapterNumber}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-amber bg-amber/15 px-1.5 py-0.5 rounded-full border border-amber/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
                              Active Chapter
                            </span>
                            <span className="text-[10px] font-mono text-ink-secondary truncate">
                              • {chapter.act}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-ink-muted mb-0.5">
                            <span className="text-amber font-bold">Ch {chapter.chapterNumber}</span>
                            <span>•</span>
                            <span className="truncate">{chapter.act}</span>
                          </div>
                        )}
                        <div className={`text-xs sm:text-sm font-bold leading-snug line-clamp-2 transition mt-0.5 ${
                          isCurrentChapter
                            ? "text-ink-primary font-extrabold"
                            : "text-ink-primary group-hover:text-amber"
                        }`}>
                          {chapter.title}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Bookmark Button */}
                      <button
                        onClick={(e) => toggleBookmark(chapter.slug, e)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          isBookmarked
                            ? "bg-amber-subtle border-amber/40 text-amber"
                            : "border-transparent text-ink-dim hover:text-amber hover:bg-bg-surface"
                        }`}
                        title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                      >
                        <Star className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
                      </button>

                      {/* Direct Jump Link */}
                      <Link
                        href={`/${projectSlug}/${chapter.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 rounded-lg border border-hairline text-ink-muted hover:text-ink-primary hover:bg-bg-surface transition cursor-pointer"
                        title="Jump to Chapter"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Expandable Subtopics List */}
                  {isExpanded && chapter.headings.length > 0 && (
                    <div className={`px-3 pb-3 pt-2 space-y-1.5 ${
                      isCurrentChapter
                        ? "border-t border-amber/25 bg-amber-subtle/15 dark:bg-amber-subtle/25 rounded-b-xl"
                        : "border-t border-hairline"
                    }`}>
                      <div className={`text-[10px] font-mono uppercase tracking-wider mb-2 pl-2 font-bold flex items-center gap-1.5 ${
                        isCurrentChapter ? "text-amber font-extrabold" : "text-ink-secondary"
                      }`}>
                        <Compass className="w-3 h-3 text-amber" />
                        <span>Key Subtopics & Deep Anchors</span>
                      </div>
                      {chapter.headings.map((heading) => {
                        const headingId = `${chapter.slug}#${heading.id}`;
                        const isSubBookmarked = savedBookmarks.includes(headingId);

                        return (
                          <div
                            key={heading.id}
                            className={`flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg transition group text-xs ${
                              isCurrentChapter
                                ? "hover:bg-amber-subtle/40 bg-bg-surface/50"
                                : "hover:bg-bg-hover"
                            }`}
                          >
                            <Link
                              href={`/${projectSlug}/${chapter.slug}#${heading.id}`}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center gap-2 transition truncate flex-1 font-medium ${
                                isCurrentChapter
                                  ? "text-ink-primary hover:text-amber font-semibold"
                                  : "text-ink-secondary hover:text-ink-primary"
                              }`}
                              style={{ paddingLeft: heading.level === 3 ? "14px" : "4px" }}
                            >
                              <Hash className={`w-3.5 h-3.5 shrink-0 transition ${
                                isCurrentChapter ? "text-amber opacity-90" : "text-ink-dim opacity-70 group-hover:text-amber"
                              }`} />
                              <span className="truncate text-xs leading-relaxed">
                                {heading.text}
                              </span>
                            </Link>

                            <button
                              onClick={(e) => toggleBookmark(headingId, e)}
                              className={`p-1 rounded transition shrink-0 cursor-pointer ${
                                isSubBookmarked
                                  ? "text-amber"
                                  : "opacity-0 group-hover:opacity-100 text-ink-dim hover:text-amber"
                              }`}
                              title={isSubBookmarked ? "Remove Bookmark" : "Bookmark Subtopic"}
                            >
                              <Star className={`w-3 h-3 ${isSubBookmarked ? "fill-current" : ""}`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Drawer Footer Status */}
        <div className="p-3 border-t border-hairline bg-bg-surface/50 text-[11px] font-mono text-ink-dim flex items-center justify-between">
          <span>Press B to toggle • Esc to close</span>
          <span className="text-amber font-semibold">100% Offline Index</span>
        </div>
      </div>
    </>
  );
}
