"use client";

import React, { useState } from "react";
import { Play, ExternalLink, Clock, ShieldCheck, Film } from "lucide-react";

interface YouTubeEmbedProps {
  url: string;
  title: string;
  channel?: string;
  caption?: string;
  duration?: string;
  chapterContext?: string;
  className?: string;
}

export function YouTubeEmbed({
  url,
  title,
  channel = "Hosokawa Micron",
  caption,
  duration,
  chapterContext,
  className = "",
}: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract video ID and start time
  let videoId = "";
  let startTime = 0;

  try {
    if (url.includes("youtu.be/")) {
      const parts = url.split("youtu.be/")[1].split("?");
      videoId = parts[0];
      if (parts[1]) {
        const params = new URLSearchParams(parts[1]);
        if (params.get("t")) {
          startTime = parseInt(params.get("t")?.replace("s", "") || "0", 10);
        }
      }
    } else if (url.includes("youtube.com/watch")) {
      const u = new URL(url);
      videoId = u.searchParams.get("v") || "";
      const t = u.searchParams.get("t");
      if (t) {
        startTime = parseInt(t.replace("s", ""), 10);
      }
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("embed/")[1].split("?")[0];
    } else {
      videoId = url;
    }
  } catch (e) {
    videoId = url;
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0${
    startTime > 0 ? `&start=${startTime}` : ""
  }`;

  return (
    <figure
      className={`my-8 rounded-3xl border border-hairline bg-bg-panel overflow-hidden shadow-xl transition-all duration-200 hover:border-amber/40 hover:shadow-2xl ${className}`}
    >
      {/* Header bar */}
      <div className="px-5 py-3.5 bg-bg-surface border-b border-hairline flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-red-500 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <span className="font-bold text-ink-primary truncate">{title}</span>
          {chapterContext && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber/10 border border-amber/20 text-[10px] text-amber uppercase font-semibold">
              {chapterContext}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 text-[11px] text-ink-dim">
          {channel && <span className="text-ink-secondary font-medium">{channel}</span>}
          {duration && (
            <span className="flex items-center gap-1 bg-bg-panel px-2 py-0.5 rounded-md border border-hairline text-ink-dim">
              <Clock className="w-3 h-3 text-amber" />
              {duration}
            </span>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-amber hover:text-amber-hover transition-colors font-medium ml-1"
            title="Open original video on YouTube"
          >
            <span>YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Video player frame / placeholder */}
      <div className="relative aspect-video bg-[#07090e] flex items-center justify-center overflow-hidden">
        {isPlaying ? (
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="w-full h-full border-0"
          />
        ) : (
          <div
            className="relative w-full h-full cursor-pointer group"
            onClick={() => setIsPlaying(true)}
          >
            {/* Thumbnail */}
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02] opacity-80 group-hover:opacity-95"
              onError={(e) => {
                // Fallback to hqdefault if maxresdefault fails
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 group-hover:from-black/60 transition-colors" />

            {/* Centered play button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-red-600 border border-white/20">
                <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white ml-1 text-white" />
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono font-semibold text-white/90 shadow-lg tracking-wider">
                CLICK TO PLAY TECHNICAL WEBINAR
              </span>
            </div>

            {/* Bottom thumbnail tag */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white/80 font-mono drop-shadow-md">
              <div className="flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber" />
                <span className="truncate max-w-[280px] sm:max-w-md">{title}</span>
              </div>
              <span className="text-[11px] bg-black/60 px-2 py-0.5 rounded border border-white/10">
                {channel}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Caption & technical takeaways */}
      {caption && (
        <figcaption className="px-5 py-3.5 bg-bg-surface border-t border-hairline flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 text-xs">
          <div className="flex items-start gap-2.5 text-ink-primary font-mono leading-relaxed">
            <span className="w-2 h-2 rounded-full bg-amber shrink-0 mt-1.5" />
            <div>
              <span className="font-semibold text-ink-primary">Engineering Takeaway: </span>
              <span className="text-ink-secondary">{caption}</span>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-mono text-ink-dim self-end sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verified Source</span>
          </div>
        </figcaption>
      )}
    </figure>
  );
}
