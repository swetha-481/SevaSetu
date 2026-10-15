import React, { useState } from 'react';
import { Sparkles, Eye, Shield, Volume2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { arePhoneticallyEquivalent, computeVisualCharacterDiff } from '../utils/phonetics';

interface VisualDiffInspectorProps {
  nameA: string;
  nameB: string;
  docAName: string;
  docBName: string;
}

export const VisualDiffInspector: React.FC<VisualDiffInspectorProps> = ({
  nameA,
  nameB,
  docAName,
  docBName
}) => {
  const [showPhonetics, setShowPhonetics] = useState(true);

  const phoneticResult = arePhoneticallyEquivalent(nameA, nameB);
  const { diffA, diffB } = computeVisualCharacterDiff(nameA, nameB);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              Interactive Visual Diff &amp; Phonetic Inspector
            </h3>
            <p className="text-xs text-slate-400">
              Sub-character alignment &amp; Indian transliteration equivalence
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPhonetics(!showPhonetics)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          <span>{showPhonetics ? 'Hide Phonetics' : 'Analyze Indian Speech'}</span>
        </button>
      </div>

      {/* Visual Character Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Document A Name */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
            <span>{docAName} (Name as Printed)</span>
            <span className="font-mono">{nameA.length} chars</span>
          </div>
          <div className="flex items-center flex-wrap gap-1 font-mono text-base font-bold tracking-wider py-1">
            {diffA.map((item, idx) => (
              <span
                key={`a-${idx}`}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  item.type === 'same'
                    ? 'text-emerald-300 bg-emerald-950/50 border border-emerald-800/40'
                    : item.type === 'removed'
                    ? 'text-rose-300 bg-rose-950/70 border border-rose-800/60 line-through'
                    : 'text-amber-300 bg-amber-950/60 border border-amber-800/50'
                }`}
              >
                {item.char}
              </span>
            ))}
          </div>
        </div>

        {/* Document B Name */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
            <span>{docBName} (Name as Printed)</span>
            <span className="font-mono">{nameB.length} chars</span>
          </div>
          <div className="flex items-center flex-wrap gap-1 font-mono text-base font-bold tracking-wider py-1">
            {diffB.map((item, idx) => (
              <span
                key={`b-${idx}`}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  item.type === 'same'
                    ? 'text-emerald-300 bg-emerald-950/50 border border-emerald-800/40'
                    : item.type === 'added'
                    ? 'text-blue-300 bg-blue-950/70 border border-blue-800/60'
                    : 'text-amber-300 bg-amber-950/60 border border-amber-800/50'
                }`}
              >
                {item.char}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Indian Phonetic Speech Equivalence Assessment */}
      {showPhonetics && (
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Volume2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200">
                Indian Transliteration / Phonetic Fingerprint:
              </p>
              <p className="text-slate-400 mt-0.5">
                {phoneticResult.isMatch
                  ? phoneticResult.explanation
                  : `Phonetic keys: "${phoneticResult.keyA.toUpperCase()}" vs "${phoneticResult.keyB.toUpperCase()}" (Different spoken sounds).`}
              </p>
            </div>
          </div>

          <div>
            {phoneticResult.isMatch ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sounds Identical
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <AlertTriangle className="w-3.5 h-3.5" />
                Distinct Sound
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
