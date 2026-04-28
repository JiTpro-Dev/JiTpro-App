import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../../supabase/client';

const STORAGE_KEY = 'jitpro_active_company_id';

export interface CompanyInfo {
  id: string;
  display_name: string | null;
  legal_name: string;
  setup_completed: boolean;
}

interface CompanyContextType {
  activeCompanyId: string | null;
  activeCompany: CompanyInfo | null;
  loading: boolean;
  setActiveCompany: (company: CompanyInfo) => void;
  clearActiveCompany: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

/** Validate membership and fetch company data for a given ID. */
async function fetchAndValidateCompany(
  authId: string,
  companyId: string
): Promise<CompanyInfo | null> {
  // Verify the user belongs to this company
  const { data: membership } = await supabase
    .from('people')
    .select('company_id')
    .eq('auth_id', authId)
    .eq('company_id', companyId)
    .eq('person_type', 'user')
    .maybeSingle();

  if (!membership) return null;

  // Fetch fresh company data
  const { data: company } = await supabase
    .from('companies')
    .select('id, display_name, legal_name, setup_completed')
    .eq('id', companyId)
    .maybeSingle();

  return company ?? null;
}

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [activeCompany, setActiveCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount (or user change), restore from localStorage and validate
  useEffect(() => {
    // Wait for auth to finish resolving before deciding anything. Setting
    // loading=false while auth is still in flight causes AppShell to render
    // with no activeCompany and bounce back to /dashboard before the
    // post-auth re-run of this effect can validate the stored company.
    if (authLoading) return;

    if (!user) {
      setActiveCompanyId(null);
      setActiveCompany(null);
      setLoading(false);
      return;
    }

    async function restoreCompany() {
      const storedId = localStorage.getItem(STORAGE_KEY);
      if (!storedId) {
        setLoading(false);
        return;
      }

      const company = await fetchAndValidateCompany(user!.id, storedId);

      if (company) {
        setActiveCompanyId(company.id);
        setActiveCompany(company);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }

      setLoading(false);
    }

    restoreCompany();
  }, [user, authLoading]);

  const handleSetActiveCompany = useCallback((company: CompanyInfo) => {
    localStorage.setItem(STORAGE_KEY, company.id);
    setActiveCompanyId(company.id);
    setActiveCompany(company);
  }, []);

  const handleClearActiveCompany = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setActiveCompanyId(null);
    setActiveCompany(null);
  }, []);

  return (
    <CompanyContext.Provider
      value={{
        activeCompanyId,
        activeCompany,
        loading,
        setActiveCompany: handleSetActiveCompany,
        clearActiveCompany: handleClearActiveCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
