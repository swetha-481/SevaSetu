import React from 'react';
import { ShieldCheck, BookOpen, RotateCcw, Sparkles } from 'lucide-react';

interface NavbarProps {
  onReset: () => void;
  onOpenGuide: () => void;
  onSelectSample: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onReset,
  onOpenGuide,
  onSelectSample
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs print:hidden">
      {/* Civic accent bar */}
      <div className="h-1.5 w-full flex">
        <div className="w-1/3 bg-amber-500" />
        <div className="w-1/3 bg-slate-200" />
        <div className="w-1/3 bg-emerald-600" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                SevaSetu <span className="font-hindi text-sm text-slate-600 font-normal">| सेवा सेतु</span>
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                Consistency Checker
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Explainable Document Cross-Verification &amp; Discrepancy Detection
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onSelectSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Try a Sample Case</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
            <span>Civic Guidance</span>
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Clear all fields"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
