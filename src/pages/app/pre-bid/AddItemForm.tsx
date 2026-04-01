import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import type { ProcurementItem, ItemStatus, SubmittalType } from './sampleData';
import { sampleLocations, submittalTypeLabels } from './sampleData';

const ALL_SUBMITTAL_TYPES: SubmittalType[] = [
  'shop_drawings',
  'product_data',
  'samples',
  'mockups',
  'certificates',
  'design_mix',
  'manufacturer_instructions',
  'warranties',
];

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: 'ready', label: 'Ready' },
  { value: 'pending_selection', label: 'Pending Selection' },
  { value: 'missing_design', label: 'Missing Design' },
];

interface AddItemFormProps {
  csiCode: string;
  csiDivision: string;
  csiLabel: string;
  onSave: (item: ProcurementItem) => void;
  onCancel: () => void;
}

export function AddItemForm({ csiCode, csiDivision, csiLabel, onSave, onCancel }: AddItemFormProps) {
  const [name, setName] = useState('');
  const [vendor, setVendor] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ItemStatus>('pending_selection');
  const [requiresSubmittal, setRequiresSubmittal] = useState(false);
  const [submittalTypes, setSubmittalTypes] = useState<SubmittalType[]>([]);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  const handleToggleLocation = (loc: string) => {
    setLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  const handleRemoveLocation = (loc: string) => {
    setLocations((prev) => prev.filter((l) => l !== loc));
  };

  const handleToggleSubmittalType = (type: SubmittalType) => {
    setSubmittalTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const newItem: ProcurementItem = {
      id: `item-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      csiCode,
      csiDivision,
      csiLabel,
      locations,
      vendor: vendor.trim() || null,
      requiresSubmittal,
      submittalTypes: requiresSubmittal ? submittalTypes : [],
      status,
      notes: '',
    };
    onSave(newItem);
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

        {/* Vendor */}
        <div>
          <label className="mb-1 block text-[12px] font-medium text-slate-600">Vendor</label>
          <input
            type="text"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="e.g. ABC Millwork"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        {/* Location(s) */}
        <div>
          <label className="mb-1 block text-[12px] font-medium text-slate-600">Location(s)</label>
          {/* Selected location tags */}
          {locations.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {locations.map((loc) => (
                <span
                  key={loc}
                  className="flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[12px] font-medium text-amber-800"
                >
                  {loc}
                  <button
                    onClick={() => handleRemoveLocation(loc)}
                    className="text-amber-600 hover:text-amber-900 focus:outline-none"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {/* Dropdown picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLocationDropdownOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <span>Add location…</span>
              <ChevronDown size={14} />
            </button>
            {locationDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                {sampleLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      handleToggleLocation(loc);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-slate-50 ${
                      locations.includes(loc) ? 'font-medium text-amber-700' : 'text-slate-700'
                    }`}
                  >
                    <span
                      className={`h-3.5 w-3.5 flex-shrink-0 rounded-sm border ${
                        locations.includes(loc)
                          ? 'border-amber-500 bg-amber-500'
                          : 'border-slate-300'
                      }`}
                    />
                    {loc}
                  </button>
                ))}
                <div className="border-t border-slate-100 p-2">
                  <button
                    type="button"
                    onClick={() => setLocationDropdownOpen(false)}
                    className="w-full rounded-md py-1 text-center text-[12px] font-medium text-slate-500 hover:text-slate-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
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

        {/* Requires Submittal */}
        <div>
          <label className="mb-1 block text-[12px] font-medium text-slate-600">Requires Submittal</label>
          <div className="flex gap-2">
            {[true, false].map((val) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => setRequiresSubmittal(val)}
                className={`rounded-lg border px-5 py-2 text-[12px] font-medium transition ${
                  requiresSubmittal === val
                    ? 'border-slate-800 bg-slate-800 text-white'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                {val ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>

        {/* Submittal Types (only when requiresSubmittal = true) */}
        {requiresSubmittal && (
          <div>
            <label className="mb-2 block text-[12px] font-medium text-slate-600">Submittal Types</label>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {ALL_SUBMITTAL_TYPES.map((type) => {
                const checked = submittalTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleToggleSubmittalType(type)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-[12px] transition ${
                      checked
                        ? 'border-amber-400 bg-amber-50 text-amber-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`h-3.5 w-3.5 flex-shrink-0 rounded-sm border ${
                        checked ? 'border-amber-500 bg-amber-500' : 'border-slate-300'
                      }`}
                    />
                    {submittalTypeLabels[type]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Save / Cancel */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="rounded-lg bg-slate-800 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            Save Item
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
