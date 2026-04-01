// src/pages/setup/steps/CostCodes.tsx
import { useCallback, useRef, useState } from 'react';
import { Upload, Database, SkipForward } from 'lucide-react';
import type { CostCodeNode } from '../setupTypes';

type CostCodeSource = 'upload' | 'csi50' | 'csi16' | 'skip' | null;

interface CostCodesProps {
  costCodes: CostCodeNode[];
  onCostCodesChange: (codes: CostCodeNode[]) => void;
  showNumbers: boolean;
  onShowNumbersChange: (show: boolean) => void;
}

function parseCostCodeCSV(text: string): CostCodeNode[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const nodes: CostCodeNode[] = [];
  const seen = new Map<string, string>();
  let sortOrder = 0;

  for (const line of lines.slice(1)) {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if ((ch === ',' || ch === '\t') && !inQuotes) { fields.push(current.trim()); current = ''; }
      else { current += ch; }
    }
    fields.push(current.trim());

    const pairs: { code: string; title: string }[] = [];
    for (let i = 0; i < 8; i += 2) {
      const code = fields[i] || '';
      const title = fields[i + 1] || '';
      if (code && title) pairs.push({ code, title });
    }

    let parentId: string | null = null;
    for (let level = 0; level < pairs.length; level++) {
      const { code, title } = pairs[level];
      if (seen.has(code)) {
        parentId = seen.get(code)!;
        continue;
      }
      const id = `cc-${sortOrder}`;
      nodes.push({
        id,
        code,
        title,
        level: level + 1,
        parentId,
        sortOrder: sortOrder++,
      });
      seen.set(code, id);
      parentId = id;
    }
  }
  return nodes;
}

export function CostCodes({ costCodes, onCostCodesChange, showNumbers, onShowNumbersChange }: CostCodesProps) {
  const [source, setSource] = useState<CostCodeSource>(costCodes.length > 0 ? 'upload' : null);
  const [format, setFormat] = useState<'csi50' | 'csi16' | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError(null);

    if (!file.name.endsWith('.csv')) {
      setCsvError('Please upload a .csv file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCostCodeCSV(text);
      if (parsed.length === 0) {
        setCsvError('No cost codes found. Check that the file has a header row and data rows with code-title pairs.');
        return;
      }
      onCostCodesChange(parsed);
    };
    reader.readAsText(file);
  }, [onCostCodesChange]);

  const divisionCount = costCodes.filter((c) => c.level === 1).length;
  const sectionCount = costCodes.filter((c) => c.level === 2).length;
  const subsectionCount = costCodes.filter((c) => c.level === 3).length;
  const paragraphCount = costCodes.filter((c) => c.level === 4).length;

  const sourceCards: { key: CostCodeSource; icon: React.ReactNode; title: string; description: string }[] = [
    { key: 'upload', icon: <Upload size={20} />, title: 'Upload Your Own', description: "Import your company's cost code structure from a CSV file" },
    { key: 'csi50', icon: <Database size={20} />, title: 'CSI MasterFormat (50-Division)', description: 'The current standard with 50 divisions for detailed organization' },
    { key: 'csi16', icon: <Database size={20} />, title: 'CSI MasterFormat (16-Division)', description: 'The legacy 16-division format still used by many contractors' },
    { key: 'skip', icon: <SkipForward size={20} />, title: 'Skip for Now', description: 'Set up cost codes later from Company Settings' },
  ];

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Cost Code Library</h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload your company's cost code structure or use the standard CSI MasterFormat list.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {sourceCards.map((card) => (
          <button
            key={card.key}
            onClick={() => { setSource(card.key); if (card.key !== 'upload') onCostCodesChange([]); }}
            className={`rounded-lg border p-4 text-left transition-colors ${
              source === card.key
                ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className={`mb-2 ${source === card.key ? 'text-slate-900' : 'text-slate-400'}`}>
              {card.icon}
            </div>
            <div className="text-sm font-medium text-slate-900">{card.title}</div>
            <div className="mt-1 text-xs text-slate-500">{card.description}</div>
          </button>
        ))}
      </div>

      {source === 'upload' && (
        <div className="mt-6 space-y-4">
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-full h-28 rounded-md border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:border-slate-300 hover:bg-slate-100 transition-colors"
          >
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">Click to upload cost code CSV</p>
              <p className="text-xs text-slate-400 mt-1">Expected columns: division_code, division_title, section_code, section_title, ...</p>
            </div>
          </div>
          {csvError && <p className="text-sm text-red-600">{csvError}</p>}
        </div>
      )}

      {source === 'csi50' && costCodes.length === 0 && (
        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            The CSI MasterFormat 50-division structure will be loaded with all divisions, sections, subsections, and paragraphs. You can customize this later from Company Settings.
          </p>
          <button
            onClick={() => {
              // Placeholder: in production, load from Supabase or bundled JSON
              onCostCodesChange([{ id: 'csi-placeholder', code: '01 00 00', title: 'General Requirements', level: 1, parentId: null, sortOrder: 0 }]);
            }}
            className="mt-3 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
          >
            Load 50-Division MasterFormat
          </button>
        </div>
      )}

      {source === 'csi16' && costCodes.length === 0 && (
        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            The legacy 16-division MasterFormat structure will be loaded. This is the traditional format many contractors still use (Divisions 1–16). You can customize this later from Company Settings.
          </p>
          <button
            onClick={() => {
              // Placeholder: in production, load from Supabase or bundled JSON
              onCostCodesChange([{ id: 'csi16-placeholder', code: '01', title: 'General Requirements', level: 1, parentId: null, sortOrder: 0 }]);
            }}
            className="mt-3 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
          >
            Load 16-Division MasterFormat
          </button>
        </div>
      )}

      {source === 'skip' && (
        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            You can set up cost codes later from Company Settings. Some features like the Scope Builder will require cost codes to be configured first.
          </p>
        </div>
      )}

      {costCodes.length > 0 && (
        <div className="mt-6 rounded-md bg-green-50 border border-green-200 px-4 py-3">
          <p className="text-sm font-medium text-green-800">
            {divisionCount} division{divisionCount !== 1 ? 's' : ''}
            {sectionCount > 0 && `, ${sectionCount} section${sectionCount !== 1 ? 's' : ''}`}
            {subsectionCount > 0 && `, ${subsectionCount} subsection${subsectionCount !== 1 ? 's' : ''}`}
            {paragraphCount > 0 && `, ${paragraphCount} paragraph${paragraphCount !== 1 ? 's' : ''}`}
            {' '}loaded
          </p>
        </div>
      )}

      {source !== 'skip' && source !== null && (
        <div className="mt-6 rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onShowNumbersChange(!showNumbers)}
              className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                showNumbers ? 'bg-slate-800' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={showNumbers}
              aria-label="Show cost code numbers"
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  showNumbers ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <div>
              <span className="text-sm font-medium text-slate-700">Show numeric cost code values (company default)</span>
              <p className="text-xs text-slate-500">
                Sets the default for all projects. When off, only descriptions are shown. Project managers can override this setting at the project level.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
