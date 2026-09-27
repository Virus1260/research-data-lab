"use client";

import React from "react";
import katex from "katex";

interface KatexEquationProps {
  expression: string;
  displayMode?: boolean;
  className?: string;
}

export function KatexEquation({ expression, displayMode = false, className = "" }: KatexEquationProps) {
  try {
    const html = katex.renderToString(expression, {
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

    if (displayMode) {
      return (
        <div
          className={`equation-block ${className}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    return (
      <span
        className={`equation-inline ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <span className={`equation-inline text-amber ${className}`}>{expression}</span>;
  }
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
