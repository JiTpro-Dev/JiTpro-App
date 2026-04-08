import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useCompany } from '../../context/CompanyContext';
import { supabase } from '../../../supabase/client';
import { Plus, Pencil, X, EyeOff, Eye } from 'lucide-react';

interface PersonRow {
  person_id: string;
  person_type: string;
  name: string;
  first_name: string;
  last_name: string;
  title: string;
  organization: string;
  organization_id: string | null;
  email: string;
  phone: string;
  roleCategory: string;
  contactType: 'Contact' | 'User';
  is_active: boolean;
}

interface OrgOption {
  id: string;
  name: string;
}

type SortKey = 'name' | 'title' | 'organization' | 'email' | 'phone' | 'roleCategory' | 'contactType';
type SortDir = 'asc' | 'desc';

const ROLE_CATEGORIES = [
  'owner', 'architect', 'engineer', 'designer', 'consultant',
  'subcontractor', 'supplier', 'principal', 'senior_project_manager',
  'project_manager', 'project_engineer', 'superintendent', 'foreman', 'other',
];

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  title: '',
  contact_type: 'external',
  role_category: '',
  organization_id: '' as string,
  notes: '',
};

export function People() {
  const { activeCompanyId } = useCompany();

  const [rows, setRows] = useState<PersonRow[]>([]);
  const [allRows, setAllRows] = useState<PersonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showInactive, setShowInactive] = useState(false);

  // Org options for dropdowns
  const [orgOptions, setOrgOptions] = useState<OrgOption[]>([]);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<PersonRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Deactivate
  const [deactivatingPerson, setDeactivatingPerson] = useState<PersonRow | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  async function fetchData() {
    if (!activeCompanyId) return;
    setLoading(true);
    setError(null);

    const [peopleRes, orgsRes] = await Promise.all([
      supabase
        .from('directory_people')
        .select('person_id, person_type, first_name, last_name, title, email, phone, role_label, contact_type, organization_name, organization_id, is_active')
        .eq('company_id', activeCompanyId!)
        .order('last_name', { ascending: true }),
      supabase
        .from('organizations')
        .select('id, name')
        .eq('company_id', activeCompanyId!)
        .eq('is_active', true)
        .order('name'),
    ]);

    if (peopleRes.error) {
      setError('Could not load people.');
      setLoading(false);
      return;
    }

    const mapped: PersonRow[] = (peopleRes.data ?? []).map((p) => ({
      person_id: p.person_id,
      person_type: p.person_type,
      name: [p.first_name, p.last_name].filter(Boolean).join(' ') || '\u2014',
      first_name: p.first_name ?? '',
      last_name: p.last_name ?? '',
      title: p.title ?? '',
      organization: p.organization_name ?? '',
      organization_id: p.organization_id ?? null,
      email: p.email ?? '',
      phone: p.phone ?? '',
      roleCategory: p.role_label ?? '',
      contactType: p.person_type === 'user' ? 'User' : 'Contact',
      is_active: p.is_active,
    }));

    setAllRows(mapped);
    setOrgOptions(orgsRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [activeCompanyId]);

  // Filter active/inactive
  useEffect(() => {
    setRows(showInactive ? allRows : allRows.filter((r) => r.is_active));
  }, [allRows, showInactive]);

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
        r.email.toLowerCase().includes(q) ||
        r.organization.toLowerCase().includes(q),
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
    if (col !== sortKey) return <span className="ml-1 text-slate-300">{'\u2195'}</span>;
    return <span className="ml-1 text-slate-600">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>;
  }

  // --- CRUD ---

  function openCreate() {
    setEditingPerson(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(person: PersonRow) {
    setEditingPerson(person);
    setForm({
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email,
      phone: person.phone,
      title: person.title,
      contact_type: person.contactType === 'User' ? 'internal' : 'external',
      role_category: person.roleCategory,
      organization_id: person.organization_id ?? '',
      notes: '',
    });
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingPerson(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  async function handleSave() {
    if (!activeCompanyId) return;
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setFormError('First and last name are required.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      company_id: activeCompanyId,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      title: form.title.trim() || null,
      contact_type: form.contact_type || null,
      role_category: form.role_category || null,
      organization_id: form.organization_id || null,
    };

    if (editingPerson) {
      const { error: updateError } = await supabase
        .from('people')
        .update(payload)
        .eq('id', editingPerson.person_id);

      if (updateError) {
        setFormError('Could not update person.');
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from('people')
        .insert({ ...payload, person_type: 'contact', is_active: true });

      if (insertError) {
        setFormError('Could not create person.');
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    closeForm();
    fetchData();
  }

  // --- Deactivate / Reactivate ---

  async function handleDeactivate() {
    if (!deactivatingPerson) return;
    setDeactivating(true);

    const { error: updateError } = await supabase
      .from('people')
      .update({ is_active: false })
      .eq('id', deactivatingPerson.person_id);

    if (updateError) setError('Could not deactivate person.');

    setDeactivating(false);
    setDeactivatingPerson(null);
    fetchData();
  }

  async function handleReactivate(person: PersonRow) {
    const { error: updateError } = await supabase
      .from('people')
      .update({ is_active: true })
      .eq('id', person.person_id);

    if (updateError) {
      setError('Could not reactivate person.');
      return;
    }
    fetchData();
  }

  const activeCount = allRows.filter((r) => r.is_active).length;
  const inactiveCount = allRows.filter((r) => !r.is_active).length;

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
            : `${activeCount} active${inactiveCount > 0 ? ` \u00b7 ${inactiveCount} inactive` : ''}`
        }
        filters={
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by name, email, org..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-[12px] text-slate-700 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
            />
            {inactiveCount > 0 && (
              <button
                onClick={() => setShowInactive(!showInactive)}
                className={`flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition ${
                  showInactive
                    ? 'border-slate-400 bg-slate-100 text-slate-700'
                    : 'border-slate-200 text-slate-400 hover:text-slate-600'
                }`}
              >
                {showInactive ? <Eye size={12} /> : <EyeOff size={12} />}
                {showInactive ? 'Showing inactive' : 'Show inactive'}
              </button>
            )}
          </div>
        }
        actions={
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-slate-700"
          >
            <Plus size={14} />
            Add Person
          </button>
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

        {!loading && !error && allRows.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-center">
            <div className="text-[13px] font-medium text-slate-700">No people yet</div>
            <div className="text-[11px] text-slate-400">Add contacts and team members to your company directory.</div>
            <button
              onClick={openCreate}
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-slate-700"
            >
              <Plus size={14} />
              Add Person
            </button>
          </div>
        )}

        {!loading && !error && allRows.length > 0 && (
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
                  <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-[12px] text-slate-400">
                      No results match your search.
                    </td>
                  </tr>
                ) : (
                  sorted.map((row, i) => (
                    <tr
                      key={row.person_id}
                      className={`border-b border-slate-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                    >
                      <td className="px-4 py-3 text-[12px] font-medium text-slate-900">
                        {row.name}
                        {!row.is_active && (
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{row.title || '\u2014'}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{row.organization || '\u2014'}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{row.email || '\u2014'}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{row.phone || '\u2014'}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{row.roleCategory || '\u2014'}</td>
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
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(row)}
                            className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          {row.is_active ? (
                            <button
                              onClick={() => setDeactivatingPerson(row)}
                              className="rounded p-1 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                              title="Deactivate"
                            >
                              <EyeOff size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(row)}
                              className="rounded p-1 text-slate-400 transition hover:bg-green-50 hover:text-green-600"
                              title="Reactivate"
                            >
                              <Eye size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Person Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-slate-800">
                {editingPerson ? 'Edit Person' : 'New Person'}
              </h3>
              <button onClick={closeForm} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    placeholder="John"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    placeholder="Smith"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-medium text-slate-600">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Project Manager"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-medium text-slate-600">Organization</label>
                <select
                  value={form.organization_id}
                  onChange={(e) => setForm({ ...form, organization_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="">No organization</option>
                  {orgOptions.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">Type</label>
                  <select
                    value={form.contact_type}
                    onChange={(e) => setForm({ ...form, contact_type: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">Role</label>
                  <select
                    value={form.role_category}
                    onChange={(e) => setForm({ ...form, role_category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="">Select role...</option>
                    {ROLE_CATEGORIES.map((r) => (
                      <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formError && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">{formError}</div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSave}
                  disabled={!form.first_name.trim() || !form.last_name.trim() || saving}
                  className="rounded-lg bg-slate-800 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? 'Saving...' : editingPerson ? 'Update Person' : 'Add Person'}
                </button>
                <button
                  onClick={closeForm}
                  className="rounded-lg border border-slate-300 px-5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation */}
      {deactivatingPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-[15px] font-semibold text-slate-800">Deactivate Person</h3>
            <p className="mb-4 text-[13px] text-slate-600">
              Deactivate <span className="font-medium">{deactivatingPerson.name}</span>? They will be hidden from selection lists but can be reactivated later.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeactivate}
                disabled={deactivating}
                className="rounded-lg bg-amber-600 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-amber-700 disabled:opacity-40"
              >
                {deactivating ? 'Deactivating...' : 'Deactivate'}
              </button>
              <button
                onClick={() => setDeactivatingPerson(null)}
                className="rounded-lg border border-slate-300 px-5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
