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

interface TopicHeading {
  level: number;
  text: string;
  id: string;
}

interface ChapterTopic {
  slug: string;
  chapterNumber: string;
  title: string;
  act: string;
  actId: string;
  readTime: string;
  headings: TopicHeading[];
}

export function MasterBookmarkDrawer({
  projectSlug = "hosokawa-afd-freeze-dryer",
}: {
  projectSlug?: string;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [topics, setTopics] = useState<ChapterTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "bookmarks">("all");
  const [savedBookmarks, setSavedBookmarks] = useState<string[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Load topics from API on first open
  useEffect(() => {
    if (!isOpen || topics.length > 0) return;
    setLoading(true);
    fetch("/api/topics")
      .then((res) => res.json())
      .then((data: ChapterTopic[]) => {
        setTopics(data);
        // Expand currently active chapter
        const current = data.find((c) => pathname?.includes(c.slug));
        if (current) {
          setExpandedChapters({ [current.slug]: true });
        }
      })
      .catch((err) => console.error("Failed to load topics:", err))
      .finally(() => setLoading(false));
  }, [isOpen, topics.length, pathname]);

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
                  className={`rounded-xl border transition-all ${
                    isCurrentChapter
                      ? "bg-amber-subtle/30 border-amber/40 shadow-sm"
                      : "bg-bg-panel border-hairline hover:border-hairline-strong"
                  }`}
                >
                  {/* Chapter Header Row */}
                  <div className="p-3 flex items-start justify-between gap-2">
                    <button
                      onClick={() => toggleChapter(chapter.slug)}
                      className="flex items-start gap-2.5 text-left min-w-0 flex-1 group"
                    >
                      <span className="p-1 rounded bg-bg-surface border border-hairline text-ink-dim group-hover:text-amber transition mt-0.5 shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-ink-dim">
                          <span className="text-amber font-bold">Ch {chapter.chapterNumber}</span>
                          <span>•</span>
                          <span className="truncate">{chapter.act}</span>
                        </div>
                        <div className="text-xs font-bold text-ink-primary group-hover:text-amber transition leading-snug line-clamp-2 mt-0.5">
                          {chapter.title}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Bookmark Button */}
                      <button
                        onClick={(e) => toggleBookmark(chapter.slug, e)}
                        className={`p-1.5 rounded-lg border transition ${
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
                        className="p-1.5 rounded-lg border border-hairline text-ink-muted hover:text-ink-primary hover:bg-bg-surface transition"
                        title="Jump to Chapter"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Expandable Subtopics List */}
                  {isExpanded && chapter.headings.length > 0 && (
                    <div className="px-3 pb-3 pt-1 border-t border-hairline space-y-1">
                      <div className="text-[10px] font-mono text-ink-dim uppercase tracking-wider mb-1.5 pl-5">
                        Key Subtopics & Deep Anchors
                      </div>
                      {chapter.headings.map((heading) => {
                        const headingId = `${chapter.slug}#${heading.id}`;
                        const isSubBookmarked = savedBookmarks.includes(headingId);

                        return (
                          <div
                            key={heading.id}
                            className="flex items-center justify-between gap-2 py-1 px-2 rounded-lg hover:bg-bg-hover transition group text-xs"
                          >
                            <Link
                              href={`/${projectSlug}/${chapter.slug}#${heading.id}`}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-1.5 text-ink-secondary hover:text-amber transition truncate flex-1"
                              style={{ paddingLeft: heading.level === 3 ? "12px" : "4px" }}
                            >
                              <Hash className="w-3 h-3 text-ink-dim shrink-0 opacity-60" />
                              <span className="truncate text-[11px] leading-relaxed">
                                {heading.text}
                              </span>
                            </Link>

                            <button
                              onClick={(e) => toggleBookmark(headingId, e)}
                              className={`p-1 rounded transition shrink-0 ${
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
