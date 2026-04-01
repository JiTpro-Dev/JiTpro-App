import {
  Blocks,
  Wrench,
  TreePine,
  DoorOpen,
  PaintBucket,
  Signpost,
  Refrigerator,
  Armchair,
  type LucideIcon,
} from 'lucide-react';
import type { CsiDivision, ProcurementItem } from './sampleData';

const iconMap: Record<string, LucideIcon> = {
  Blocks,
  Wrench,
  TreePine,
  DoorOpen,
  PaintBucket,
  Signpost,
  Refrigerator,
  Armchair,
};

interface ScopeBuilderCardsProps {
  divisions: CsiDivision[];
  items: ProcurementItem[];
  onSelectDivision: (divisionCode: string) => void;
}

export function ScopeBuilderCards({ divisions, items, onSelectDivision }: ScopeBuilderCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
      {divisions.map((division) => {
        const Icon = iconMap[division.icon] ?? Blocks;
        const count = items.filter((item) => item.csiDivision === division.code).length;

        return (
          <button
            key={division.code}
            onClick={() => onSelectDivision(division.code)}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icon size={20} />
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  count > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {count}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Div {division.code}
              </p>
              <p className="mt-0.5 text-[14px] font-semibold text-slate-800">{division.name}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
