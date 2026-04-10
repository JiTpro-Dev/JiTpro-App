import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Archive, Trash2, X } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useCompany, type CompanyInfo } from '../context/CompanyContext';
import { supabase } from '../../supabase/client';

interface DashboardCompany extends CompanyInfo {
  archived_at: string | null;
}

export function Dashboard() {
  const { user } = useAuth();
  const { activeCompanyId, setActiveCompany, clearActiveCompany } = useCompany();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<DashboardCompany[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<DashboardCompany | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Archive state
  const [archivingId, setArchivingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function loadCompanies() {
      const { data: companyRows, error: companyError } = await supabase
        .from('companies')
        .select('id, display_name, legal_name, setup_completed, archived_at')
        .is('archived_at', null)
        .order('created_at');

      if (!companyError && companyRows) {
        setCompanies(companyRows as DashboardCompany[]);
      }
      setLoading(false);
    }

    loadCompanies();
  }, [user]);

  async function handleArchive(company: DashboardCompany) {
    setArchivingId(company.id);
    const { error } = await supabase
      .from('companies')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', company.id);

    if (error) {
      console.error('Archive failed:', error);
      alert('Failed to archive company. Please try again.');
      setArchivingId(null);
      return;
    }

    setCompanies((prev) => prev.filter((c) => c.id !== company.id));

    if (activeCompanyId === company.id) {
      clearActiveCompany();
    }

    setArchivingId(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError(null);

    const { error, count } = await supabase
      .from('companies')
      .delete({ count: 'exact' })
      .eq('id', deleteTarget.id);

    if (error) {
      setDeleteError(error.message);
      setDeleting(false);
      return;
    }

    if (count === 0) {
      setDeleteError('Delete was blocked. You may not have permission to delete this company.');
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

  // Check if there are any archived companies (for showing the link)
  const [hasArchived, setHasArchived] = useState(false);
  useEffect(() => {
    if (!user) return;
    supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .not('archived_at', 'is', null)
      .then(({ count }) => {
        setHasArchived((count ?? 0) > 0);
      });
  }, [user, companies]);

  return (
    <AppLayout pageTitle="Sandbox Dashboard">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Your Companies</h2>
          <p className="mt-1 text-sm text-slate-400">
            {loading
              ? 'Loading...'
              : `${companies.length} ${companies.length !== 1 ? 'companies' : 'company'} · ${completedCompanies.length} active · ${pendingCompanies.length} pending setup`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasArchived && (
            <Link
              to="/archived"
              className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Archived Companies
            </Link>
          )}
          <Link
            to="/setup"
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-amber-400 transition-colors"
          >
            + Setup New Company
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg bg-slate-800 p-8 shadow-sm border border-slate-700 text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-lg bg-slate-800 p-8 shadow-sm border border-slate-700 text-center">
          <p className="text-slate-300 mb-2">No companies yet.</p>
          <p className="text-sm text-slate-500">Click above to set up your first company.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {completedCompanies.map((c) => (
            <div
              key={c.id}
              className="group relative flex w-full items-start justify-between rounded-lg border border-amber-500 bg-slate-800 p-5 transition-colors hover:border-amber-400 hover:bg-slate-700 hover:shadow-sm"
            >
              <button
                onClick={() => {
                  setActiveCompany(c);
                  navigate('/app/home');
                }}
                className="min-w-0 flex-1 text-left"
              >
                <div className="text-sm font-semibold text-white truncate">
                  {c.display_name || c.legal_name}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400 truncate">
                  {c.legal_name}
                </div>
              </button>
              <div className="ml-3 flex items-center gap-2 shrink-0">
                <span className="rounded-full bg-green-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-green-300">
                  Active
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleArchive(c); }}
                  disabled={archivingId === c.id}
                  className="rounded p-1 text-slate-500 opacity-0 transition hover:bg-amber-500/20 hover:text-amber-300 group-hover:opacity-100"
                  title="Archive company"
                >
                  <Archive size={13} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }}
                  className="rounded p-1 text-slate-500 opacity-0 transition hover:bg-red-500/20 hover:text-red-300 group-hover:opacity-100"
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
              className="group relative flex w-full items-start justify-between rounded-lg border border-amber-500 bg-slate-800 p-5 transition-colors hover:border-amber-400 hover:bg-slate-700 hover:shadow-sm"
            >
              <button
                onClick={() => navigate(`/setup/${c.id}`)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="text-sm font-semibold text-white truncate">
                  {c.display_name || c.legal_name}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400">
                  Setup not complete
                </div>
              </button>
              <div className="ml-3 flex items-center gap-2 shrink-0">
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
                  Resume Setup
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleArchive(c); }}
                  disabled={archivingId === c.id}
                  className="rounded p-1 text-slate-500 opacity-0 transition hover:bg-amber-500/20 hover:text-amber-300 group-hover:opacity-100"
                  title="Archive company"
                >
                  <Archive size={13} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }}
                  className="rounded p-1 text-slate-500 opacity-0 transition hover:bg-red-500/20 hover:text-red-300 group-hover:opacity-100"
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
              <h3 className="text-sm font-semibold text-red-700">Permanently Delete Company</h3>
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[13px] text-slate-600 mb-2">
              You are about to permanently delete <strong>{deleteTarget.display_name || deleteTarget.legal_name}</strong>.
            </p>
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 mb-4">
              <p className="text-[12px] text-red-700 font-medium mb-1">
                This action cannot be undone.
              </p>
              <p className="text-[11px] text-red-600">
                All projects, contacts, organizations, cost codes, calendars, templates, and every other record associated with this company will be permanently removed from the database.
              </p>
            </div>
            <p className="text-[12px] text-slate-500 mb-4">
              If you just want to hide this company from your dashboard, use <strong>Archive</strong> instead.
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
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
