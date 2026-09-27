"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Compass,
  Table,
  Library,
  Presentation,
  Atom,
  Sun,
  Moon,
  Headphones,
  Bookmark,
  Menu,
  X,
} from "lucide-react";
import { useNarrator } from "@/components/narrator/NarratorContext";
import { useTheme } from "@/components/layout/ThemeProvider";

export function Header({ projectSlug = "hosokawa-afd-freeze-dryer" }: { projectSlug?: string }) {
  const pathname = usePathname();
  const { isPlaying, currentTrack, togglePlay, selectedPersona, voiceStudioOpen, setVoiceStudioOpen } = useNarrator();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu whenever navigation occurs
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Archive", icon: Atom },
    { href: `/${projectSlug}`, label: "The Lab", icon: Compass },
    { href: `/${projectSlug}/webinar`, label: "Nauta Deck", icon: Presentation },
    { href: `/${projectSlug}/bom`, label: "The Bench", icon: Table },
    { href: `/${projectSlug}/references`, label: "The Shelf", icon: Library },
  ];

  const triggerPalette = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  };

  return (
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-md transition-colors duration-150"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-panel) 92%, transparent)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Primary Navigation */}
        <div className="flex items-center gap-3 lg:gap-5 min-w-0 shrink-0">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 shrink-0"
              style={{ background: 'var(--amber-subtle)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full transition-all"
                style={{ background: 'var(--amber)', boxShadow: '0 0 10px var(--amber-glow)' }}
              />
            </div>
            <div className="flex items-center">
              <span className="font-bold text-sm tracking-tight transition shrink-0" style={{ color: 'var(--ink-primary)' }}>
                RESEARCH DATA
              </span>
              <span
                className="hidden sm:inline-block ml-1.5 text-[9px] font-mono uppercase tracking-widest pl-1.5 shrink-0"
                style={{ color: 'var(--ink-dim)', borderLeft: '1px solid var(--border)' }}
              >
                LAB V1
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1 shrink-0">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname?.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0"
                  style={{
                    backgroundColor: isActive ? 'var(--amber-subtle)' : 'transparent',
                    color: isActive ? 'var(--amber)' : 'var(--ink-muted)',
                    border: isActive ? '1px solid color-mix(in srgb, var(--amber) 35%, transparent)' : '1px solid transparent',
                    fontWeight: isActive ? '600' : '500',
                  }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Controls & Utility Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Audio mini status - only on extra wide screens where there's plenty of space */}
          {currentTrack && (
            <button
              onClick={togglePlay}
              className="hidden 2xl:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono transition-all shrink-0"
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

          {/* Voice Persona & Acoustics Studio */}
          <button
            onClick={() => setVoiceStudioOpen(!voiceStudioOpen)}
            className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all hover:scale-105 active:scale-95 shrink-0"
            style={{
              backgroundColor: voiceStudioOpen ? 'var(--amber-subtle)' : 'var(--bg-surface)',
              border: `1px solid ${voiceStudioOpen ? 'color-mix(in srgb, var(--amber) 45%, transparent)' : 'var(--border)'}`,
              color: voiceStudioOpen ? 'var(--amber)' : 'var(--ink-secondary)',
            }}
            title={`Narrator: ${selectedPersona.name} (${selectedPersona.accent}) - Click to adjust voice or human pacing rules`}
            aria-label="Acoustic Voice Studio"
          >
            <span className="text-base leading-none">{selectedPersona.avatar}</span>
            <span className="hidden xl:inline font-semibold">{selectedPersona.name.split(" ")[0]}</span>
            <Headphones className="w-3.5 h-3.5 text-amber opacity-80 shrink-0" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center w-8 h-8 sm:w-auto sm:px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all hover:scale-105 active:scale-95 shrink-0"
            style={{
              color: 'var(--ink-secondary)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-surface)',
            }}
            title={theme === 'dark' ? 'Switch to Light Mode (Press T or Ctrl+Shift+L)' : 'Switch to Dark Mode (Press T or Ctrl+Shift+L)'}
            aria-label="Toggle theme (T)"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-ink-muted transition-transform hover:-rotate-12" />
            )}
            <span className="hidden 2xl:inline font-semibold">Theme</span>
            <kbd className="hidden 2xl:inline text-[9px] px-1 py-0.5 rounded bg-bg border border-border">T</kbd>
          </button>

          {/* Master Topic Index / Bookmark Drawer */}
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "b" }))}
            className="hidden sm:inline-flex items-center justify-center w-8 h-8 sm:w-auto sm:px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all hover:scale-105 active:scale-95 shrink-0"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--ink-secondary)',
            }}
            title="Open Master Topic & Subtopic Index (Shortcut: B)"
            aria-label="Topic Index"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber" />
            <span className="hidden 2xl:inline font-semibold">Index</span>
            <kbd className="hidden 2xl:inline text-[9px] px-1 py-0.5 rounded bg-bg border border-border">B</kbd>
          </button>

          {/* Ctrl+K Search Palette */}
          <button
            onClick={triggerPalette}
            className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--ink-muted)',
            }}
            title="Open command palette (Ctrl+K or /)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Search</span>
            <kbd
              className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded font-mono"
              style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden h-8 w-8 sm:h-9 sm:w-9 inline-flex items-center justify-center rounded-lg text-xs font-mono transition-all hover:scale-105 active:scale-95 shrink-0"
            style={{
              backgroundColor: mobileMenuOpen ? 'var(--amber-subtle)' : 'var(--bg-surface)',
              border: `1px solid ${mobileMenuOpen ? 'color-mix(in srgb, var(--amber) 45%, transparent)' : 'var(--border)'}`,
              color: mobileMenuOpen ? 'var(--amber)' : 'var(--ink-secondary)',
            }}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t px-4 py-4 space-y-3 bg-bg-panel/95 backdrop-blur-xl animate-fade-in shadow-2xl"
          style={{ borderColor: "var(--border)" }}
        >
          <nav className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname?.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all"
                  style={{
                    backgroundColor: isActive ? "var(--amber-subtle)" : "var(--bg-surface)",
                    color: isActive ? "var(--amber)" : "var(--ink-secondary)",
                    border: `1px solid ${isActive ? "color-mix(in srgb, var(--amber) 40%, transparent)" : "var(--border)"}`,
                  }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-hairline flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                triggerPalette();
              }}
              className="w-full p-2.5 rounded-xl bg-bg-surface border border-hairline text-xs font-mono text-ink-secondary flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-amber" />
                <span>Search Dossier</span>
              </span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-bg border border-border">Ctrl+K</kbd>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "b" }));
              }}
              className="w-full p-2.5 rounded-xl bg-bg-surface border border-hairline text-xs font-mono text-ink-secondary flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Bookmark className="w-3.5 h-3.5 text-amber" />
                <span>Topic Index (Bookmarked Sections)</span>
              </span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-bg border border-border">B</kbd>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
