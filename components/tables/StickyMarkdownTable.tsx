'use client';

import React, { useRef } from 'react';
import { useStickyTableHeader } from './useStickyTableHeader';
import { StickyTableScrollbar } from './StickyTableScrollbar';

interface StickyMarkdownTableProps {
  headerRow: string[];
  bodyRows: string[][];
  renderInline: (text: string) => React.ReactNode;
}

export const StickyMarkdownTable: React.FC<StickyMarkdownTableProps> = ({
  headerRow,
  bodyRows,
  renderInline,
}) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const theadRef = useRef<HTMLTableSectionElement>(null);

  // Hook for freezing the header at top: 56px (below the sticky navbar)
  useStickyTableHeader(tableContainerRef, theadRef, { topOffset: 56 });

  return (
    <div className="relative my-8">
      {/* Scrollable Table Container */}
      <div
        ref={tableContainerRef}
        className="overflow-x-auto rounded-2xl border border-hairline shadow-md bg-bg-panel transition-all"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--amber) transparent',
        }}
      >
        <table className="w-full border-collapse text-left">
          <thead ref={theadRef}>
            <tr className="bg-bg-surface border-b border-hairline">
              {headerRow.map((cell, colIdx) => (
                <th
                  key={colIdx}
                  className="px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider text-ink-primary whitespace-nowrap bg-bg-surface"
                >
                  {renderInline(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {bodyRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-bg-hover transition-colors even:bg-bg-surface/30"
              >
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="px-4 py-3 text-xs sm:text-sm text-ink-secondary font-mono-data leading-relaxed"
                  >
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Viewport-Sticky Horizontal Scrollbar for Wide Tables */}
      <StickyTableScrollbar tableContainerRef={tableContainerRef} />
    </div>
  );
};
