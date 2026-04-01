import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import type { CsiDivision, CsiSubdivision } from './sampleData';

interface CsiTreeProps {
  divisions: CsiDivision[];
  activeDivision: string;
  activeSubdivision: string;
  onSelectDivision: (divisionCode: string) => void;
  onSelectSubdivision: (subdivisionCode: string) => void;
  onBackToCards: () => void;
}

export function CsiTree({
  divisions,
  activeDivision,
  activeSubdivision,
  onSelectDivision,
  onSelectSubdivision,
  onBackToCards,
}: CsiTreeProps) {
  return (
    <nav className="flex h-full w-56 flex-shrink-0 flex-col bg-slate-800 text-sm">
      {/* Back link */}
      <button
        onClick={onBackToCards}
        className="flex items-center gap-2 px-4 py-3 text-slate-300 transition hover:text-white focus:outline-none"
      >
        <ArrowLeft size={14} />
        <span className="text-xs font-medium uppercase tracking-wide">Back to Divisions</span>
      </button>

      <div className="h-px bg-slate-700" />

      {/* Division list */}
      <div className="flex-1 overflow-y-auto py-2">
        {divisions.map((division) => {
          const isActive = division.code === activeDivision;

          return (
            <div key={division.code}>
              {/* Division row */}
              <button
                onClick={() => onSelectDivision(division.code)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition focus:outline-none ${
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <span className="font-medium leading-tight">{division.name}</span>
                {isActive ? (
                  <ChevronDown size={14} className="flex-shrink-0 text-slate-400" />
                ) : (
                  <ChevronRight size={14} className="flex-shrink-0 text-slate-500" />
                )}
              </button>

              {/* Subdivisions — shown only for active division */}
              {isActive && (
                <div className="bg-slate-900/40">
                  {division.subdivisions.map((sub: CsiSubdivision) => {
                    const isSelected = sub.code === activeSubdivision;
                    return (
                      <button
                        key={sub.code}
                        onClick={() => onSelectSubdivision(sub.code)}
                        className={`relative flex w-full flex-col px-5 py-2 text-left transition focus:outline-none ${
                          isSelected
                            ? 'border-l-2 border-amber-500 bg-slate-700/60 text-white'
                            : 'border-l-2 border-transparent text-slate-400 hover:bg-slate-700/40 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-[11px] font-mono text-slate-500">{sub.code}</span>
                        <span className="text-[12px] leading-snug">{sub.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
