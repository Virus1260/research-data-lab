import Link from "next/link";
import { Home, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
            <Home className="w-10 h-10" style={{ color: 'var(--ink-dim)' }} />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--ink-primary)' }}>Research Not Found</h1>
          <p style={{ color: 'var(--ink-muted)' }}>
            The research project or chapter you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold hover:scale-105 active:scale-95 transition-all"
          style={{ backgroundColor: 'var(--amber)', color: 'var(--on-amber)', boxShadow: '0 10px 25px -5px var(--amber-glow)' }}
        >
          <span>Return to Archive</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}