import { useState } from 'react';
import { Plus, Pencil, Check, X } from 'lucide-react';
import type { ProcurementItem, ItemStatus } from './scopeBuilderTypes';
import { statusConfig } from './scopeBuilderTypes';

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: 'ready', label: 'Ready' },
  { value: 'pending_selection', label: 'Pending' },
  { value: 'missing_design', label: 'Missing' },
];

interface ItemListProps {
  items: ProcurementItem[];
  subdivisionCode: string;
  subdivisionName: string;
  onAddItem: () => void;
  onUpdateItem: (itemId: string, updates: Partial<Pick<ProcurementItem, 'name' | 'description' | 'status' | 'notes'>>) => Promise<void>;
}

export function ItemList({ items, subdivisionCode, subdivisionName, onAddItem, onUpdateItem }: ItemListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<ItemStatus>('missing_design');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = (item: ProcurementItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDescription(item.description ?? '');
    setEditStatus(item.status);
    setEditNotes(item.notes ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    setSaving(true);
    await onUpdateItem(editingId, {
      name: editName.trim(),
      description: editDescription.trim() || null,
      status: editStatus,
      notes: editNotes.trim() || null,
    });
    setSaving(false);
    setEditingId(null);
  };

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
              const isEditing = editingId === item.id;

              if (isEditing) {
                return (
                  <div key={item.id} className="rounded-xl border-2 border-amber-400 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-[13px] text-slate-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description…"
                        rows={2}
                        className="w-full resize-none rounded-lg border border-slate-300 px-3 py-1.5 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                      <div className="flex gap-1.5">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setEditStatus(opt.value)}
                            className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition ${
                              editStatus === opt.value
                                ? 'border-slate-800 bg-slate-800 text-white'
                                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Notes…"
                        rows={1}
                        className="w-full resize-none rounded-lg border border-slate-300 px-3 py-1.5 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          disabled={!editName.trim() || saving}
                          className="flex items-center gap-1 rounded-md bg-slate-800 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-slate-700 disabled:opacity-40"
                        >
                          <Check size={13} /> {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <X size={13} /> Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  className={`group rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${status.rowClass}`}
                >
                  {/* Top row: name + status badge + edit button */}
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[14px] font-semibold text-slate-900">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="rounded p-1 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100"
                        title="Edit item"
                      >
                        <Pencil size={13} />
                      </button>
                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.badgeClass}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="mt-1 text-[13px] text-slate-500">{item.description}</p>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <p className="mt-1 text-[12px] italic text-slate-400">{item.notes}</p>
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
