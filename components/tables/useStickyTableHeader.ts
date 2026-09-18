'use client';

import { useEffect, RefObject } from 'react';

export interface UseStickyTableHeaderOptions {
  topOffset?: number;
}

/**
 * useStickyTableHeader
 * Provides true 120fps hardware-accelerated, zero-flicker sticky table headers.
 * 
 * Clones the table's thead into a dedicated GPU-composited fixed overlay container
 * positioned right below the site navigation bar (default topOffset: 56px).
 * Locks horizontal scrolling 1:1 with the underlying table container.
 * Automatically pins when scrolling into the table and unpins when leaving the table.
 */
export function useStickyTableHeader(
  tableContainerRef: RefObject<HTMLElement | null>,
  theadRef: RefObject<HTMLElement | null>,
  options: UseStickyTableHeaderOptions = {}
) {
  const { topOffset = 56 } = options;

  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    const thead = theadRef.current;
    if (!tableContainer || !thead || typeof document === 'undefined') return;

    const table = thead.closest('table');
    if (!table) return;

    // 1. Create the fixed floating header overlay container
    const headerContainer = document.createElement('div');
    headerContainer.className = 'sticky-markdown-table-header no-print';
    headerContainer.style.position = 'fixed';
    headerContainer.style.top = `${topOffset}px`;
    headerContainer.style.left = '0px';
    headerContainer.style.width = '0px';
    headerContainer.style.height = `${thead.offsetHeight || 44}px`;
    headerContainer.style.overflow = 'hidden';
    headerContainer.style.zIndex = '35';
    headerContainer.style.display = 'none';
    headerContainer.style.pointerEvents = 'auto';
    headerContainer.style.boxShadow = '0 8px 24px -4px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(217, 119, 6, 0.15)';
    headerContainer.style.borderBottom = '2px solid var(--amber)';
    headerContainer.style.borderRadius = '16px 16px 0 0';
    headerContainer.style.backgroundColor = 'var(--bg-surface)';
    headerContainer.style.backdropFilter = 'blur(16px)';
    headerContainer.style.willChange = 'transform, width, left';

    // 2. Create the inner table containing the cloned header
    const fixedTable = document.createElement('table');
    fixedTable.style.tableLayout = 'fixed';
    fixedTable.style.width = `${table.offsetWidth}px`;
    fixedTable.style.minWidth = '100%';
    fixedTable.style.borderCollapse = 'collapse';
    fixedTable.style.textAlign = 'left';
    fixedTable.style.fontSize = window.getComputedStyle(table).fontSize || '12px';
    fixedTable.style.transform = `translate3d(-${tableContainer.scrollLeft}px, 0, 0)`;
    fixedTable.style.willChange = 'transform';

    const clonedThead = thead.cloneNode(true) as HTMLElement;
    fixedTable.appendChild(clonedThead);
    headerContainer.appendChild(fixedTable);
    document.body.appendChild(headerContainer);

    // 3. Synchronize column widths from original thead to cloned thead
    const syncColumnWidths = () => {
      const realThs = thead.querySelectorAll('th');
      const fixedThs = clonedThead.querySelectorAll('th');

      realThs.forEach((rTh, idx) => {
        const fTh = fixedThs[idx];
        if (fTh) {
          const rect = rTh.getBoundingClientRect();
          const w = rect.width;
          fTh.style.width = `${w}px`;
          fTh.style.minWidth = `${w}px`;
          fTh.style.maxWidth = `${w}px`;
          fTh.style.boxSizing = 'border-box';
          fTh.style.padding = window.getComputedStyle(rTh).padding;
          fTh.style.backgroundColor = 'var(--bg-surface)';
        }
      });

      fixedTable.style.width = `${table.offsetWidth}px`;
      headerContainer.style.height = `${thead.offsetHeight || 44}px`;
    };

    // Run initial column sizing
    syncColumnWidths();

    // 4. Horizontal scroll sync (instant 1:1 hardware transform)
    const onHorizontalScroll = () => {
      fixedTable.style.transform = `translate3d(-${tableContainer.scrollLeft}px, 0, 0)`;
    };
    tableContainer.addEventListener('scroll', onHorizontalScroll, { passive: true });

    // 5. Viewport vertical scroll sync
    let isCurrentlyVisible = false;

    const updateVisibility = () => {
      const tableRect = tableContainer.getBoundingClientRect();
      const theadHeight = thead.offsetHeight || 44;

      // Table is in view and user has scrolled past the original table header
      const isPastTop = tableRect.top <= topOffset;
      const isBeforeBottom = tableRect.bottom > (topOffset + theadHeight + 12);

      if (isPastTop && isBeforeBottom) {
        if (!isCurrentlyVisible) {
          headerContainer.style.display = 'block';
          isCurrentlyVisible = true;
        }
        headerContainer.style.left = `${tableRect.left}px`;
        headerContainer.style.width = `${tableContainer.clientWidth}px`;
        headerContainer.style.top = `${topOffset}px`;
        fixedTable.style.transform = `translate3d(-${tableContainer.scrollLeft}px, 0, 0)`;
      } else {
        if (isCurrentlyVisible) {
          headerContainer.style.display = 'none';
          isCurrentlyVisible = false;
        }
      }
    };

    const onWindowScroll = () => {
      updateVisibility();
    };

    const onResize = () => {
      syncColumnWidths();
      updateVisibility();
    };

    window.addEventListener('scroll', onWindowScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // Observe table resizing
    const resizeObserver = new ResizeObserver(() => {
      syncColumnWidths();
      updateVisibility();
    });
    resizeObserver.observe(tableContainer);
    resizeObserver.observe(table);

    // Initial check
    updateVisibility();

    // Cleanup
    return () => {
      tableContainer.removeEventListener('scroll', onHorizontalScroll);
      window.removeEventListener('scroll', onWindowScroll);
      window.removeEventListener('resize', onResize);
      resizeObserver.disconnect();
      if (headerContainer.parentNode) {
        headerContainer.parentNode.removeChild(headerContainer);
      }
    };
  }, [tableContainerRef, theadRef, topOffset]);
}
