import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../../layouts/AppLayout';
import { supabase } from '../../../supabase/client';

interface SavedTimeline {
  id: string;
  name: string;
  description: string | null;
  delivery_date: string;
  status: string;
  baseline_count: number;
  created_at: string;
  updated_at: string;
}

export function ViewProcurementTimeline() {
  const navigate = useNavigate();
  const [timelines, setTimelines] = useState<SavedTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimelines = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('procurement_timelines')
      .select('id, name, description, delivery_date, status, baseline_count, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setTimelines(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTimelines();
  }, [fetchTimelines]);

  return (
    <AppLayout pageTitle="View Procurement Timeline">
      <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Procurement Timeline
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              All saved procurement items and their timelines.
            </p>
          </div>
          <Link
            to="/demo/procurement-timeline"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            + Add Item
          </Link>
        </div>

        {loading && (
          <p className="text-sm text-slate-500">Loading...</p>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && timelines.length === 0 && (
          <p className="text-sm text-slate-500">
            No procurement items saved yet. Click "+ Add Item" to create one.
          </p>
        )}

        {!loading && timelines.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 pr-4 text-left font-medium text-slate-600">Item Name</th>
                  <th className="py-2 pr-4 text-left font-medium text-slate-600">Description</th>
                  <th className="py-2 pr-4 text-left font-medium text-slate-600">Status</th>
                  <th className="py-2 pr-4 text-left font-medium text-slate-600">Delivery Date</th>
                  <th className="py-2 pr-4 text-left font-medium text-slate-600">Baselines</th>
                  <th className="py-2 text-left font-medium text-slate-600">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {timelines.map((tl) => (
                  <tr
                    key={tl.id}
                    className="border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => navigate(`/demo/procurement-timeline?id=${tl.id}`)}
                  >
                    <td className="py-2 pr-4 font-medium text-slate-900">{tl.name}</td>
                    <td className="py-2 pr-4 text-slate-600">{tl.description || '—'}</td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        tl.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                        tl.status === 'active' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {tl.status.charAt(0).toUpperCase() + tl.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-slate-600">
                      {new Date(tl.delivery_date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td className="py-2 pr-4 text-slate-600">{tl.baseline_count}</td>
                    <td className="py-2 text-slate-600">
                      {new Date(tl.updated_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
