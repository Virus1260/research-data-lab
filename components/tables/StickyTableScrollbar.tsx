'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeftRight } from 'lucide-react';
import { useNarrator } from '@/components/narrator/NarratorContext';

interface StickyTableScrollbarProps {
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

/**
 * StickyTableScrollbar
 * Renders a sleek floating horizontal scrollbar that sticks to the bottom of the viewport
 * whenever a wide table exceeds the screen width, allowing intuitive horizontal scrolling
 * at any vertical scroll position without having to scroll all the way to the table bottom.
 * 
 * Automatically shifts upward if the audio narrator player console is open to prevent overlapping.
 */
export const StickyTableScrollbar: React.FC<StickyTableScrollbarProps> = ({
  tableContainerRef,
  className = '',
}) => {
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [clientWidth, setClientWidth] = useState(0);
  const [isNeeded, setIsNeeded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [bounds, setBounds] = useState<{ left: number; width: number; visible: boolean }>({
    left: 0,
    width: 0,
    visible: false,
  });

  const { currentTrack, isMinimized } = useNarrator();
  const isAudioDeckOpen = Boolean(currentTrack && !isMinimized);

  const updateMeasurements = useCallback(() => {
    const el = tableContainerRef.current;
    if (!el) {
      setIsNeeded(false);
      return;
    }
    const sw = el.scrollWidth;
    const cw = el.clientWidth;
    setScrollWidth(sw);
    setClientWidth(cw);
    const needed = sw > cw + 4;
    setIsNeeded(needed);

    if (sw > cw) {
      setScrollProgress(Math.round((el.scrollLeft / (sw - cw)) * 100));
    }

    const rect = el.getBoundingClientRect();
    const isVisibleInViewport = rect.top < window.innerHeight && rect.bottom > 80;

    setBounds({
      left: Math.max(0, rect.left),
      width: rect.width,
      visible: isVisibleInViewport,
    });
  }, [tableContainerRef]);

  useEffect(() => {
    const el = tableContainerRef.current;
    if (!el) return;

    updateMeasurements();

    const handleTableScroll = () => {
      if (scrollbarRef.current && el) {
        if (Math.abs(scrollbarRef.current.scrollLeft - el.scrollLeft) > 1) {
          scrollbarRef.current.scrollLeft = el.scrollLeft;
        }
        const max = el.scrollWidth - el.clientWidth;
        setScrollProgress(max > 0 ? Math.round((el.scrollLeft / max) * 100) : 0);
      }
    };

    const handleWindowScroll = () => {
      updateMeasurements();
    };

    el.addEventListener('scroll', handleTableScroll, { passive: true });
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    window.addEventListener('resize', updateMeasurements);

    const ro = new ResizeObserver(() => {
      updateMeasurements();
    });
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', handleTableScroll);
      window.removeEventListener('scroll', handleWindowScroll);
      window.removeEventListener('resize', updateMeasurements);
      ro.disconnect();
    };
  }, [tableContainerRef, updateMeasurements]);

  const handleStickyScroll = () => {
    const el = tableContainerRef.current;
    const sb = scrollbarRef.current;
    if (el && sb) {
      if (Math.abs(el.scrollLeft - sb.scrollLeft) > 1) {
        el.scrollLeft = sb.scrollLeft;
      }
      const max = el.scrollWidth - el.clientWidth;
      setScrollProgress(max > 0 ? Math.round((sb.scrollLeft / max) * 100) : 0);
    }
  };

  const handleNudge = (direction: 'left' | 'right') => {
    const el = tableContainerRef.current;
    if (!el) return;
    const step = Math.max(200, el.clientWidth * 0.35);
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  if (!isNeeded || !bounds.visible || bounds.width <= 0) return null;

  return (
    <div
      className={`no-print transition-all duration-300 ${className}`}
      style={{
        position: 'fixed',
        bottom: isAudioDeckOpen ? '92px' : '0px',
        left: bounds.left,
        width: bounds.width,
        zIndex: 40,
        background: 'color-mix(in srgb, var(--bg-panel) 92%, transparent)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '2px solid var(--amber)',
        borderLeft: '1px solid var(--border)',
        borderRight: '1px solid var(--border)',
        borderBottom: 'none',
        borderRadius: '14px 14px 0 0',
        padding: '6px 14px',
        boxShadow: '0 -8px 24px -4px rgba(0, 0, 0, 0.25), 0 -1px 4px rgba(217, 119, 6, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxSizing: 'border-box',
      }}
    >
      {/* Nudge Left Button */}
      <button
        type="button"
        onClick={() => handleNudge('left')}
        title="Scroll Table Left"
        className="w-7 h-7 rounded-lg border border-hairline bg-bg-surface hover:bg-bg-hover text-ink-primary hover:text-amber flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Synchronized Horizontal Scroll Track */}
      <div
        ref={scrollbarRef}
        onScroll={handleStickyScroll}
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          height: 16,
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--amber) transparent',
        }}
        className="custom-sticky-scrollbar flex items-center"
      >
        <div
          style={{
            width: scrollWidth,
            height: 1,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Nudge Right Button */}
      <button
        type="button"
        onClick={() => handleNudge('right')}
        title="Scroll Table Right"
        className="w-7 h-7 rounded-lg border border-hairline bg-bg-surface hover:bg-bg-hover text-ink-primary hover:text-amber flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Progress & Quick Indicator Badge */}
      <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber/10 border border-amber/30 text-[10px] font-mono text-amber font-bold whitespace-nowrap shrink-0">
        <ChevronsLeftRight className="w-3 h-3" />
        <span>{scrollProgress}%</span>
      </div>
    </div>
  );
};
