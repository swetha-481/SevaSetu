import React, { useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { SYNTHETIC_TEST_CASES, SyntheticTestCase } from '../data/syntheticPresets';

interface SampleCasePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase: (testCase: SyntheticTestCase) => void;
}

export const SampleCasePickerModal: React.FC<SampleCasePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectCase
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base">Select Sample Test Case</h3>
              <p className="text-xs text-slate-300">
                Fictional synthetic records to evaluate matching rules and OCR verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of cases */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {SYNTHETIC_TEST_CASES.map((tc) => (
            <div
              key={tc.id}
              onClick={() => {
                onSelectCase(tc);
                onClose();
              }}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50 cursor-pointer transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-900">
                    {tc.title}
                  </h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tc.badgeColor}`}>
                    {tc.badge}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  {tc.subtitle}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                  {tc.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all shrink-0 self-start sm:self-auto">
                <span>Load Case</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Synthetic test data with invented identities for testing purposes only.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
