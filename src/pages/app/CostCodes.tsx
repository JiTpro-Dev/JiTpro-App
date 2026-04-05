// src/pages/app/CostCodes.tsx
import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useCompany } from '../../context/CompanyContext';
import { supabase } from '../../../supabase/client';

interface CostCodeRow {
  id: string;
  code: string | null;
  title: string;
  level: number;
  sort_order: number;
}

const LEVEL_INDENT: Record<number, string> = {
  1: 'pl-0',
  2: 'pl-5',
  3: 'pl-10',
  4: 'pl-16',
};

const LEVEL_LABEL: Record<number, string> = {
  1: 'Division',
  2: 'Section',
  3: 'Subsection',
  4: 'Paragraph',
};

export function CostCodes() {
  const { activeCompanyId } = useCompany();

  const [loading, setLoading] = useState(true);
  const [costCodes, setCostCodes] = useState<CostCodeRow[]>([]);
  const [showNumbers, setShowNumbers] = useState(true);
  const [stats, setStats] = useState('');

  useEffect(() => {
    if (!activeCompanyId) return;

    async function load() {
      setLoading(true);
      try {
        const [companyRes, codesRes] = await Promise.all([
          supabase
            .from('companies')
            .select('show_cost_code_numbers')
            .eq('id', activeCompanyId!)
            .single(),
          supabase
            .from('cost_codes')
            .select('id, code, title, level, sort_order')
            .eq('company_id', activeCompanyId!)
            .order('sort_order', { ascending: true }),
        ]);

        if (companyRes.data?.show_cost_code_numbers !== undefined) {
          setShowNumbers(companyRes.data.show_cost_code_numbers);
        }

        const codes: CostCodeRow[] = codesRes.data ?? [];
        setCostCodes(codes);

        // Build stats string
        const divCount = codes.filter((c) => c.level === 1).length;
        const secCount = codes.filter((c) => c.level === 2).length;
        const subCount = codes.filter((c) => c.level === 3).length;
        const paraCount = codes.filter((c) => c.level === 4).length;

        const parts: string[] = [];
        if (divCount > 0) parts.push(`${divCount} division${divCount !== 1 ? 's' : ''}`);
        if (secCount > 0) parts.push(`${secCount} section${secCount !== 1 ? 's' : ''}`);
        if (subCount > 0) parts.push(`${subCount} subsection${subCount !== 1 ? 's' : ''}`);
        if (paraCount > 0) parts.push(`${paraCount} paragraph${paraCount !== 1 ? 's' : ''}`);
        setStats(parts.join(' · '));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [activeCompanyId]);

  return (
    <>
      <PageHeader
        title="Cost Code Library"
        stats={loading ? undefined : stats || undefined}
      />

      <div className="p-5">
        {loading ? (
          <div className="flex h-32 items-center justify-center rounded-lg border border-slate-200 bg-white">
            <span className="text-[12px] text-slate-400">Loading cost codes…</span>
          </div>
        ) : costCodes.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-[14px]">
            <p className="text-[12px] text-slate-500">
              No cost codes configured. Set up cost codes in Company Settings.
            </p>
          </div>
        ) : (
          <>
            {/* Toggle */}
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-[14px]">
              <button
                onClick={() => setShowNumbers((prev) => !prev)}
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
              <span className="text-[12px] font-medium text-slate-700">
                Show numeric cost code values
              </span>
            </div>

            {/* Tree */}
            <div className="rounded-lg border border-slate-200 bg-white">
              {costCodes.map((row, idx) => {
                const indent = LEVEL_INDENT[row.level] ?? 'pl-0';
                const isDiv = row.level === 1;
                const isLast = idx === costCodes.length - 1;

                return (
                  <div
                    key={row.id}
                    className={`flex items-baseline gap-2 px-[14px] py-2 ${indent} ${
                      !isLast ? 'border-b border-slate-100' : ''
                    } ${isDiv ? 'bg-slate-50' : 'bg-white'}`}
                  >
                    {showNumbers && row.code && (
                      <span className="text-[11px] font-mono text-slate-400 flex-shrink-0">
                        {row.code}
                      </span>
                    )}
                    <span
                      className={`${
                        isDiv
                          ? 'text-[12px] font-semibold text-slate-900'
                          : 'text-[12px] text-slate-700'
                      }`}
                    >
                      {row.title}
                    </span>
                    {isDiv && (
                      <span className="ml-auto text-[9px] font-semibold uppercase tracking-[0.05em] text-slate-400">
                        {LEVEL_LABEL[row.level]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
