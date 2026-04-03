import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useCompany, type CompanyInfo } from '../context/CompanyContext';
import { supabase } from '../../supabase/client';

export function Dashboard() {
  const { user } = useAuth();
  const { setActiveCompany } = useCompany();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function loadCompanies() {
      // Check super admin status from app_metadata
      const { data: { session } } = await supabase.auth.getSession();
      const appMeta = session?.user?.app_metadata;
      setIsSuperAdmin(appMeta?.is_super_admin === true);

      // Step 1: Get company IDs for this user
      const { data: userRows, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('auth_id', user!.id);

      if (userError || !userRows || userRows.length === 0) {
        setLoading(false);
        return;
      }

      const companyIds = userRows.map((r) => r.company_id);

      // Step 2: Get company details
      const { data: companyRows, error: companyError } = await supabase
        .from('companies')
        .select('id, display_name, legal_name, setup_completed')
        .in('id', companyIds);

      if (!companyError && companyRows) {
        setCompanies(companyRows);
      }
      setLoading(false);
    }

    loadCompanies();
  }, [user]);

  const completedCompanies = companies.filter((c) => c.setup_completed);
  const pendingCompanies = companies.filter((c) => !c.setup_completed);

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Your Companies</h2>
        <p className="mt-1 text-sm text-slate-500">Select a company to enter, or set up a new one.</p>
      </div>

      {loading ? (
        <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200 text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      ) : (
        <>
          {/* Setup New Company button — always on top */}
          {(isSuperAdmin || companies.length === 0) && (
            <Link
              to="/setup"
              className="inline-block rounded-md bg-slate-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors mb-6"
            >
              + Setup New Company
            </Link>
          )}

          {/* Company buttons */}
          {companies.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {completedCompanies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCompany(c);
                    navigate('/app/home');
                  }}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  {c.display_name || c.legal_name}
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    Active
                  </span>
                </button>
              ))}
              {pendingCompanies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/setup/${c.id}`)}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all"
                >
                  {c.display_name || c.legal_name}
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    Resume Setup
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No companies message */}
          {companies.length === 0 && (
            <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200 text-center">
              <p className="text-slate-600 mb-2">No companies yet.</p>
              <p className="text-sm text-slate-400">Click above to set up your first company.</p>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
