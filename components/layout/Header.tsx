"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Compass, Table, Library, Atom, Sun, Moon } from "lucide-react";
import { useNarrator } from "@/components/narrator/NarratorContext";
import { useTheme } from "@/components/layout/ThemeProvider";

export function Header({ projectSlug = "hosokawa-afd-freeze-dryer" }: { projectSlug?: string }) {
  const pathname = usePathname();
  const { isPlaying, currentTrack, togglePlay } = useNarrator();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { href: "/", label: "Archive", icon: Atom },
    { href: `/${projectSlug}`, label: "The Lab", icon: Compass },
    { href: `/${projectSlug}/bom`, label: "The Bench", icon: Table },
    { href: `/${projectSlug}/references`, label: "The Shelf", icon: Library },
  ];

  const triggerPalette = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  };

  return (
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-panel) 92%, transparent)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
              style={{ background: 'var(--amber-subtle)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full transition-all"
                style={{ background: 'var(--amber)', boxShadow: '0 0 10px var(--amber-glow)' }}
              />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight transition" style={{ color: 'var(--ink-primary)' }}>
                RESEARCH DATA
              </span>
              <span
                className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase tracking-widest pl-2"
                style={{ color: 'var(--ink-dim)', borderLeft: '1px solid var(--border)' }}
              >
                LAB V1
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname?.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                  style={{
                    backgroundColor: isActive ? 'var(--amber-subtle)' : 'transparent',
                    color: isActive ? 'var(--amber)' : 'var(--ink-muted)',
                    border: isActive ? '1px solid color-mix(in srgb, var(--amber) 35%, transparent)' : '1px solid transparent',
                    fontWeight: isActive ? '600' : '500',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Audio mini status */}
          {currentTrack && (
            <button
              onClick={togglePlay}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono transition-all"
              style={{
                backgroundColor: isPlaying ? 'var(--amber-subtle)' : 'var(--bg-surface)',
                border: `1px solid ${isPlaying ? 'color-mix(in srgb, var(--amber) 50%, transparent)' : 'var(--border)'}`,
                color: isPlaying ? 'var(--amber)' : 'var(--ink-muted)',
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: isPlaying ? 'var(--amber)' : 'var(--ink-dim)',
                  animation: isPlaying ? 'pulse 1.5s infinite' : 'none',
                }}
              />
              <span className="truncate max-w-[120px]">{currentTrack.title}</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg transition-all"
            style={{
              color: 'var(--ink-muted)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-surface)',
            }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* ⌘K Palette */}
          <button
            onClick={triggerPalette}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--ink-muted)',
            }}
            title="Open command palette (⌘K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search Lab</span>
            <kbd
              className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              ⌘K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
