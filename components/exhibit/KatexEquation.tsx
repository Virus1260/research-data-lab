"use client";

import React, { useEffect, useRef } from "react";

interface KatexEquationProps {
  expression: string;
  displayMode?: boolean;
  className?: string;
}

export function KatexEquation({ expression, displayMode = false, className = "" }: KatexEquationProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    import("katex").then((katex) => {
      if (!containerRef.current) return;
      try {
        katex.default.render(expression, containerRef.current, {
          displayMode,
          throwOnError: false,
          errorColor: "var(--amber)",
          strict: false,
          trust: false,
          macros: {
            "\\degC": "^{\\circ}\\text{C}",
            "\\mbar": "\\text{ mbar}",
            "\\kgph": "\\text{ kg/h}",
          },
        });
      } catch (err) {
        if (containerRef.current) {
          containerRef.current.textContent = expression;
          containerRef.current.style.color = "var(--amber)";
        }
      }
    });
  }, [expression, displayMode]);

  if (displayMode) {
    return (
      <div className={`equation-block ${className}`}>
        <span ref={containerRef as React.RefObject<HTMLSpanElement>} />
      </div>
    );
  }

  return (
    <span
      ref={containerRef}
      className={`equation-inline ${className}`}
    />
  );
}

// Block equation with label
export function EquationBlock({
  expression,
  label,
  description,
  className = "",
}: {
  expression: string;
  label?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={`my-6 ${className}`}>
      {label && (
        <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--ink-dim)' }}>
          {label}
        </div>
      )}
      <KatexEquation expression={expression} displayMode />
      {description && (
        <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
          {description}
        </p>
      )}
    </div>
  );
}
