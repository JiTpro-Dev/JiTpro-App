import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, X } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useCompany, type CompanyInfo } from '../context/CompanyContext';
import { supabase } from '../../supabase/client';

export function Dashboard() {
  const { user } = useAuth();
  const { activeCompanyId, setActiveCompany, clearActiveCompany } = useCompany();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<CompanyInfo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function loadCompanies() {
      const { data: companyRows, error: companyError } = await supabase
        .from('companies')
        .select('id, display_name, legal_name, setup_completed')
        .order('created_at');

      if (!companyError && companyRows) {
        setCompanies(companyRows);
      }
      setLoading(false);
    }

    loadCompanies();
  }, [user]);

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError(null);

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', deleteTarget.id);

    if (error) {
      setDeleteError(error.message);
      setDeleting(false);
      return;
    }

    // Remove from local state
    setCompanies((prev) => prev.filter((c) => c.id !== deleteTarget.id));

    // If we deleted the active company, clear it
    if (activeCompanyId === deleteTarget.id) {
      clearActiveCompany();
    }

    setDeleteTarget(null);
    setDeleting(false);
  }

  const completedCompanies = companies.filter((c) => c.setup_completed);
  const pendingCompanies = companies.filter((c) => !c.setup_completed);

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Your Companies</h2>
          <p className="mt-1 text-sm text-slate-500">
            {loading
              ? 'Loading...'
              : `${companies.length} company${companies.length !== 1 ? 'ies' : ''} · ${completedCompanies.length} active · ${pendingCompanies.length} pending setup`}
          </p>
        </div>
        <Link
          to="/setup"
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          + Setup New Company
        </Link>
      </div>

      {loading ? (
        <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200 text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200 text-center">
          <p className="text-slate-600 mb-2">No companies yet.</p>
          <p className="text-sm text-slate-400">Click above to set up your first company.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {completedCompanies.map((c) => (
            <div
              key={c.id}
              className="group relative flex w-full items-start justify-between rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
            >
              <button
                onClick={() => {
                  setActiveCompany(c);
                  navigate('/app/home');
                }}
                className="min-w-0 flex-1 text-left"
              >
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {c.display_name || c.legal_name}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500 truncate">
                  {c.legal_name}
                </div>
              </button>
              <div className="ml-3 flex items-center gap-2 shrink-0">
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-semibold text-green-700">
                  Active
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }}
                  className="rounded p-1 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  title="Delete company"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          {pendingCompanies.map((c) => (
            <div
              key={c.id}
              className="group relative flex w-full items-start justify-between rounded-lg border border-amber-200 bg-white p-5 transition-colors hover:border-amber-300 hover:bg-amber-50/30 hover:shadow-sm"
            >
              <button
                onClick={() => navigate(`/setup/${c.id}`)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {c.display_name || c.legal_name}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  Setup not complete
                </div>
              </button>
              <div className="ml-3 flex items-center gap-2 shrink-0">
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                  Resume Setup
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }}
                  className="rounded p-1 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  title="Delete company"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Delete Company</h3>
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[13px] text-slate-600 mb-1">
              Are you sure you want to delete <strong>{deleteTarget.display_name || deleteTarget.legal_name}</strong>?
            </p>
            <p className="text-[12px] text-red-600 mb-4">
              This is irreversible. All projects, procurement items, contacts, cost codes, and other data associated with this company will be permanently deleted.
            </p>

            {deleteError && (
              <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Company'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
