import { useState } from 'react';
import type { ProcurementItem, ItemStatus } from './scopeBuilderTypes';

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: 'ready', label: 'Ready' },
  { value: 'pending_selection', label: 'Pending Selection' },
  { value: 'missing_design', label: 'Missing Design' },
];

interface AddItemFormProps {
  csiCode: string;
  csiDivision: string;
  csiLabel: string;
  costCodeId: string;
  onSave: (item: Omit<ProcurementItem, 'id' | 'project_id' | 'sort_order'>) => void;
  onCancel: () => void;
}

export function AddItemForm({ csiCode, csiDivision, csiLabel, costCodeId, onSave, onCancel }: AddItemFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ItemStatus>('missing_design');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) return;
    if (!costCodeId) {
      setFormError('Cost code must be at least at the section level.');
      return;
    }
    setFormError(null);
    setSaving(true);
    await onSave({
      name: name.trim(),
      description: description.trim() || null,
      cost_code_id: costCodeId,
      csi_code: csiCode,
      csi_division: csiDivision,
      csi_label: csiLabel,
      status,
      notes: notes.trim() || null,
      requires_submittal: false,
    });
    setSaving(false);
  };

  return (
    <div className="mx-6 mb-6 rounded-xl border-2 border-amber-400 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-[14px] font-semibold text-slate-800">New Procurement Item</h3>

      <div className="flex flex-col gap-4">
        {/* Item Name */}
        <div>
          <label className="mb-1 block text-[12px] font-medium text-slate-600">
            Item Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kitchen Cabinets — Unit A"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-[12px] font-medium text-slate-600">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this item…"
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        {/* Status */}
        <div>
          <label className="mb-1 block text-[12px] font-medium text-slate-600">Status</label>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-[12px] font-medium transition ${
                  status === opt.value
                    ? 'border-slate-800 bg-slate-800 text-white'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 block text-[12px] font-medium text-slate-600">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes…"
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        {/* Validation error */}
        {formError && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">
            {formError}
          </div>
        )}

        {/* Save / Cancel */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="rounded-lg bg-slate-800 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            {saving ? 'Saving…' : 'Save Item'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
