import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../supabase/client';

interface CompanyInfo {
  id: string;
  display_name: string | null;
  legal_name: string;
  setup_completed: boolean;
}

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadCompanies() {
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
          {/* Completed companies */}
          {completedCompanies.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
              {completedCompanies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate('/app/home')}
                  className="rounded-lg bg-white p-6 shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all text-left"
                >
                  <h3 className="font-semibold text-slate-900">
                    {c.display_name || c.legal_name}
                  </h3>
                  <span className="mt-3 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                    Active
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Pending setup companies */}
          {pendingCompanies.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
              {pendingCompanies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate('/setup')}
                  className="rounded-lg bg-white p-6 shadow-sm border border-amber-200 hover:border-amber-300 hover:shadow-md transition-all text-left"
                >
                  <h3 className="font-semibold text-slate-900">
                    {c.display_name || c.legal_name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">Setup incomplete</p>
                  <span className="mt-3 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    Resume Setup
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No companies message */}
          {companies.length === 0 && (
            <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200 text-center mb-6">
              <p className="text-slate-600 mb-2">No companies yet.</p>
              <p className="text-sm text-slate-400">Click below to set up your first company.</p>
            </div>
          )}

          {/* Setup New Company button */}
          <Link
            to="/setup"
            className="inline-block rounded-md bg-slate-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
          >
            + Setup New Company
          </Link>
        </>
      )}
    </AppLayout>
  );
}
