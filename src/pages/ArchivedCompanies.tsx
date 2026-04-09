import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArchiveRestore, ArrowLeft } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../supabase/client';

interface ArchivedCompany {
  id: string;
  display_name: string | null;
  legal_name: string;
  archived_at: string;
}

export function ArchivedCompanies() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<ArchivedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function loadArchived() {
      const { data, error } = await supabase
        .from('companies')
        .select('id, display_name, legal_name, archived_at')
        .not('archived_at', 'is', null)
        .order('archived_at', { ascending: false });

      if (!error && data) {
        setCompanies(data as ArchivedCompany[]);
      }
      setLoading(false);
    }

    loadArchived();
  }, [user]);

  async function handleRestore(company: ArchivedCompany) {
    setRestoring(company.id);

    const { error } = await supabase
      .from('companies')
      .update({ archived_at: null })
      .eq('id', company.id);

    if (!error) {
      setCompanies((prev) => prev.filter((c) => c.id !== company.id));
    }

    setRestoring(null);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <AppLayout pageTitle="Archived Companies">
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
        <h2 className="text-xl font-semibold text-slate-900">Archived Companies & Projects</h2>
        <p className="mt-1 text-sm text-slate-500">
          {loading ? 'Loading...' : `${companies.length} archived company${companies.length !== 1 ? 'ies' : ''}`}
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200 text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200 text-center">
          <p className="text-slate-600 mb-2">No archived companies.</p>
          <p className="text-sm text-slate-400">Companies you archive will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {companies.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {c.display_name || c.legal_name}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {c.legal_name} · Archived {formatDate(c.archived_at)}
                </div>
              </div>
              <button
                onClick={() => handleRestore(c)}
                disabled={restoring === c.id}
                className="ml-4 flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <ArchiveRestore size={13} />
                {restoring === c.id ? 'Restoring...' : 'Restore'}
              </button>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
