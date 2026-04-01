import { Plus, MapPin, Building2 } from 'lucide-react';
import type { ProcurementItem } from './sampleData';
import { statusConfig, submittalTypeLabels } from './sampleData';

interface ItemListProps {
  items: ProcurementItem[];
  subdivisionCode: string;
  subdivisionName: string;
  onAddItem: () => void;
}

export function ItemList({ items, subdivisionCode, subdivisionName, onAddItem }: ItemListProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Section header */}
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[11px] font-medium text-slate-400">{subdivisionCode}</span>
            <h2 className="text-[15px] font-semibold text-slate-800">{subdivisionName}</h2>
          </div>
          <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Item cards */}
      <div className="flex-1 overflow-y-auto p-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <p className="text-[14px]">No items yet for this section.</p>
            <p className="mt-1 text-[12px]">Use the button below to add your first procurement item.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const status = statusConfig[item.status];
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${status.rowClass}`}
                >
                  {/* Top row: name + status badge */}
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[14px] font-semibold text-slate-900">{item.name}</p>
                    <span
                      className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.badgeClass}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="mt-1 text-[13px] text-slate-500">{item.description}</p>
                  )}

                  {/* Location + Vendor */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-500">
                    {item.locations.length > 0 && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400" />
                        {item.locations.join(', ')}
                      </span>
                    )}
                    {item.vendor && (
                      <span className="flex items-center gap-1">
                        <Building2 size={11} className="text-slate-400" />
                        {item.vendor}
                      </span>
                    )}
                  </div>

                  {/* Submittal type tags */}
                  {item.requiresSubmittal && item.submittalTypes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.submittalTypes.map((type) => (
                        <span
                          key={type}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                        >
                          {submittalTypeLabels[type]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add item button */}
      <div className="border-t border-slate-200 bg-white px-6 py-4">
        <button
          onClick={onAddItem}
          className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <Plus size={15} />
          Add Procurement Item
        </button>
      </div>
    </div>
  );
}
