import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, CheckCircle, XCircle, Info } from 'lucide-react';

const MatchScore = ({ score = 0, breakdown, reasons = [], size = 'md', showDetails = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Score color tiers
  const getScoreColor = (val) => {
    if (val >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (val >= 60) return 'text-sky-600 bg-sky-50 border-sky-200';
    if (val >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-slate-600 bg-slate-100 border-slate-200';
  };

  const getProgressColor = (val) => {
    if (val >= 80) return 'bg-emerald-500';
    if (val >= 60) return 'bg-sky-500';
    if (val >= 40) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  return (
    <div className="inline-block w-full">
      <div
        className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-all ${getScoreColor(
          score
        )}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Click to see match breakdown"
      >
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-bold text-sm tracking-tight">{score}% Match</span>
        </div>

        {showDetails && (
          <div className="flex items-center gap-1 text-xs opacity-75 hover:opacity-100">
            <span>Why?</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        )}
      </div>

      {/* Expandable Explanation Drawer */}
      {showDetails && isOpen && (
        <div className="mt-2.5 p-3.5 bg-slate-900 text-slate-100 rounded-xl text-xs space-y-3 shadow-xl animate-fadeIn border border-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-semibold text-slate-200 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sky-400" /> Match Breakdown (100%)
            </span>
            <span className="text-emerald-400 font-bold">{score}% Overall</span>
          </div>

          {/* Breakdown Bars */}
          {breakdown && (
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Skill Match (60% wt)</span>
                  <span className="font-semibold">{breakdown.skill || 0} / 60</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((breakdown.skill || 0) / 60) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Interest & Role (20% wt)</span>
                  <span className="font-semibold">{breakdown.interest || 0} / 20</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-sky-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((breakdown.interest || 0) / 20) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Availability (20% wt)</span>
                  <span className="font-semibold">{breakdown.availability || 0} / 20</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((breakdown.availability || 0) / 20) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Reasons List */}
          {reasons && reasons.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Match Insights:</span>
              <ul className="space-y-1">
                {reasons.map((reason, idx) => {
                  const isCheck = reason.startsWith('✓');
                  const isCross = reason.startsWith('✗');
                  return (
                    <li key={idx} className="flex items-start gap-1.5 text-slate-200 leading-snug">
                      {isCheck && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                      {isCross && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />}
                      {!isCheck && !isCross && <span className="text-slate-400">•</span>}
                      <span>{reason.replace(/^[✓✗•]\s*/, '')}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchScore;
