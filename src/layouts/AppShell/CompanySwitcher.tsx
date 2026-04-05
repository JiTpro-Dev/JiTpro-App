import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronsUpDown, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCompany, type CompanyInfo } from '../../context/CompanyContext';
import { supabase } from '../../../supabase/client';

interface CompanySwitcherProps {
  isCollapsed: boolean;
}

export function CompanySwitcher({ isCollapsed }: CompanySwitcherProps) {
  const { user } = useAuth();
  const { activeCompanyId, setActiveCompany } = useCompany();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function loadCompanies() {
      const { data: userRows } = await supabase
        .from('users')
        .select('company_id')
        .eq('auth_id', user!.id);

      if (!userRows || userRows.length <= 1) {
        setCompanies([]);
        return;
      }

      const companyIds = userRows.map((r) => r.company_id);
      const { data: companyRows } = await supabase
        .from('companies')
        .select('id, display_name, legal_name, setup_completed')
        .in('id', companyIds)
        .eq('setup_completed', true);

      setCompanies(companyRows ?? []);
    }

    loadCompanies();
  }, [user]);

  // Don't render if user only has one company
  if (companies.length <= 1) return null;

  const handleSwitch = (company: CompanyInfo) => {
    setActiveCompany(company);
    setIsOpen(false);
    navigate('/app/home');
  };

  if (isCollapsed) {
    return (
      <div className="border-t border-slate-700 p-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mx-auto flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          title="Switch company"
        >
          <ChevronsUpDown size={14} />
        </button>
        {isOpen && (
          <div className="absolute bottom-12 left-1 z-50 w-48 rounded-md border border-slate-700 bg-slate-900 py-1 shadow-lg">
            {companies.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSwitch(c)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-slate-300 hover:bg-slate-800 hover:text-slate-100"
              >
                {c.id === activeCompanyId && <Check size={12} className="text-amber-400 shrink-0" />}
                {c.id !== activeCompanyId && <span className="w-3 shrink-0" />}
                <span className="truncate">{c.display_name || c.legal_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-t border-slate-700 p-2 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] text-slate-400 hover:bg-slate-700 hover:text-slate-200"
      >
        <span className="truncate">Switch Company</span>
        <ChevronsUpDown size={12} className="shrink-0" />
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-2 right-2 mb-1 z-50 rounded-md border border-slate-700 bg-slate-900 py-1 shadow-lg">
          {companies.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSwitch(c)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-slate-300 hover:bg-slate-800 hover:text-slate-100"
            >
              {c.id === activeCompanyId && <Check size={12} className="text-amber-400 shrink-0" />}
              {c.id !== activeCompanyId && <span className="w-3 shrink-0" />}
              <span className="truncate">{c.display_name || c.legal_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
