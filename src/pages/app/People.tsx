import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useCompany } from '../../context/CompanyContext';
import { supabase } from '../../../supabase/client';

interface PersonRow {
  id: string;
  name: string;
  title: string;
  organization: string;
  email: string;
  phone: string;
  roleCategory: string;
  contactType: 'Contact' | 'User';
}

type SortKey = keyof PersonRow;
type SortDir = 'asc' | 'desc';

export function People() {
  const { activeCompanyId } = useCompany();

  const [rows, setRows] = useState<PersonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => {
    if (!activeCompanyId) return;

    async function fetchPeople() {
      setLoading(true);
      setError(null);

      const [contactsRes, usersRes] = await Promise.all([
        supabase
          .from('company_contacts')
          .select('id, first_name, last_name, title, company_organization, email, phone, role_category')
          .eq('company_id', activeCompanyId!),
        supabase
          .from('users')
          .select('id, first_name, last_name, title, email, phone, role_category')
          .eq('company_id', activeCompanyId!),
      ]);

      const { data: contacts, error: contactsError } = contactsRes;
      const { data: users, error: usersError } = usersRes;

      if (contactsError || usersError) {
        setError('Could not load people.');
        setLoading(false);
        return;
      }

      const contactRows: PersonRow[] = (contacts ?? []).map((c) => ({
        id: `contact-${c.id}`,
        name: [c.first_name, c.last_name].filter(Boolean).join(' ') || '—',
        title: c.title ?? '',
        organization: c.company_organization ?? '',
        email: c.email ?? '',
        phone: c.phone ?? '',
        roleCategory: c.role_category ?? '',
        contactType: 'Contact',
      }));

      const userRows: PersonRow[] = (users ?? []).map((u) => ({
        id: `user-${u.id}`,
        name: [u.first_name, u.last_name].filter(Boolean).join(' ') || '—',
        title: u.title ?? '',
        organization: '',
        email: u.email ?? '',
        phone: u.phone ?? '',
        roleCategory: u.role_category ?? '',
        contactType: 'User',
      }));

      setRows([...contactRows, ...userRows]);
      setLoading(false);
    }

    fetchPeople();
  }, [activeCompanyId]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  function SortIndicator({ col }: { col: SortKey }) {
    if (col !== sortKey) return <span className="ml-1 text-slate-300">↕</span>;
    return <span className="ml-1 text-slate-600">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'title', label: 'Title' },
    { key: 'organization', label: 'Organization' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'roleCategory', label: 'Role' },
    { key: 'contactType', label: 'Type' },
  ];

  return (
    <>
      <PageHeader
        title="People"
        stats={
          loading
            ? 'Loading...'
            : `${rows.length} person${rows.length !== 1 ? 's' : ''}`
        }
        filters={
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-[12px] text-slate-700 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
          />
        }
      />

      <div className="p-5">
        {loading && (
          <div className="flex h-32 items-center justify-center text-[12px] text-slate-400">
            Loading people...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-[12px] text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-center">
            <div className="text-[13px] font-medium text-slate-700">No people yet</div>
            <div className="text-[11px] text-slate-400">Contacts and team members will appear here.</div>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="cursor-pointer select-none px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500 hover:text-slate-700"
                    >
                      {col.label}
                      <SortIndicator col={col.key} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-[12px] text-slate-400">
                      No results match your search.
                    </td>
                  </tr>
                ) : (
                  sorted.map((row, i) => (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                    >
                      <td className="px-4 py-3 text-[12px] font-medium text-slate-900">{row.name}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{row.title || '—'}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{row.organization || '—'}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{row.email || '—'}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{row.phone || '—'}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{row.roleCategory || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            row.contactType === 'User'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {row.contactType}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
