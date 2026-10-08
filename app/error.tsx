"use client";

import { useEffect } from "react";
import { RotateCw, AlertTriangle } from "lucide-react";

export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If it's a ChunkLoadError caused by dev recompile or production re-deployment, auto reload once
    const isChunkError =
      error?.name === "ChunkLoadError" ||
      error?.message?.includes("Loading chunk") ||
      error?.message?.includes("Failed to fetch");

    if (isChunkError) {
      const reloaded = sessionStorage.getItem("chunk_auto_reload");
      if (!reloaded) {
        sessionStorage.setItem("chunk_auto_reload", "1");
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl bg-bg-panel border border-hairline p-6 sm:p-8 shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber/10 border border-amber/30 text-amber flex items-center justify-center mx-auto">
          <RotateCw className="w-6 h-6 animate-spin text-amber" />
        </div>
        <h2 className="text-lg font-bold text-ink-primary">
          Blueprint Code Updated
        </h2>
        <p className="text-xs text-ink-secondary leading-relaxed">
          The engineering codebase and chapter structures were just updated. Reloading will fetch the latest compiled specifications and simulators.
        </p>
        <div className="pt-2">
          <button
            onClick={() => {
              sessionStorage.removeItem("chunk_auto_reload");
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber hover:bg-amber-bright text-[#0e0a02] font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber/20 hover:scale-105 active:scale-95"
          >
            <RotateCw className="w-4 h-4" />
            <span>Reload Latest Blueprint</span>
          </button>
        </div>
      </div>
    </div>
  );
}
