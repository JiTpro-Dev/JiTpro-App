import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useCompany } from '../../context/CompanyContext';
import { supabase } from '../../../supabase/client';
import { Plus, Pencil, X, EyeOff, Eye, UserPlus, ChevronRight } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  org_type: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
}

interface OrgPerson {
  person_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  role_label: string | null;
  contact_type: string | null;
}

const ORG_TYPES = [
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'architect', label: 'Architect' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'owner', label: 'Owner' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'other', label: 'Other' },
];

const ORG_TYPE_LABELS: Record<string, string> = Object.fromEntries(ORG_TYPES.map((t) => [t.value, t.label]));

const EMPTY_ORG_FORM = {
  name: '',
  org_type: '',
  contact_email: '',
  contact_phone: '',
  address: '',
  notes: '',
};

const EMPTY_PERSON_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  title: '',
  contact_type: 'external' as string,
  role_category: '',
};

const ROLE_CATEGORIES = [
  'owner', 'architect', 'engineer', 'designer', 'consultant',
  'subcontractor', 'supplier', 'principal', 'senior_project_manager',
  'project_manager', 'project_engineer', 'superintendent', 'foreman', 'other',
];

export function Organizations() {
  const { activeCompanyId } = useCompany();

  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [people, setPeople] = useState<OrgPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());

  // Org form
  const [showOrgForm, setShowOrgForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [orgForm, setOrgForm] = useState(EMPTY_ORG_FORM);
  const [orgFormError, setOrgFormError] = useState<string | null>(null);
  const [savingOrg, setSavingOrg] = useState(false);

  // Person form (add person to org)
  const [addingPersonToOrg, setAddingPersonToOrg] = useState<Organization | null>(null);
  const [personForm, setPersonForm] = useState(EMPTY_PERSON_FORM);
  const [personFormError, setPersonFormError] = useState<string | null>(null);
  const [savingPerson, setSavingPerson] = useState(false);

  // Deactivate
  const [deactivatingOrg, setDeactivatingOrg] = useState<Organization | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  async function fetchData() {
    if (!activeCompanyId) return;
    setLoading(true);
    setError(null);

    const [orgsRes, peopleRes] = await Promise.all([
      supabase
        .from('organizations')
        .select('id, name, org_type, contact_email, contact_phone, address, notes, is_active')
        .eq('company_id', activeCompanyId)
        .order('name'),
      supabase
        .from('directory_people')
        .select('person_id, first_name, last_name, email, phone, title, role_label, contact_type, organization_id')
        .eq('company_id', activeCompanyId)
        .eq('is_active', true),
    ]);

    if (orgsRes.error || peopleRes.error) {
      setError('Could not load organizations.');
      setLoading(false);
      return;
    }

    setOrgs(orgsRes.data ?? []);
    setPeople(peopleRes.data as any[] ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [activeCompanyId]);

  // People grouped by org
  const peopleByOrg = useMemo(() => {
    const map = new Map<string, OrgPerson[]>();
    for (const p of people) {
      const orgId = (p as any).organization_id;
      if (!orgId) continue;
      if (!map.has(orgId)) map.set(orgId, []);
      map.get(orgId)!.push(p);
    }
    return map;
  }, [people]);

  // Filter orgs
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orgs
      .filter((o) => showInactive || o.is_active)
      .filter((o) =>
        o.name.toLowerCase().includes(q) ||
        (o.org_type ?? '').toLowerCase().includes(q),
      );
  }, [orgs, search, showInactive]);

  function toggleOrg(id: string) {
    setExpandedOrgs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // --- Org CRUD ---

  function openCreateOrg() {
    setEditingOrg(null);
    setOrgForm(EMPTY_ORG_FORM);
    setOrgFormError(null);
    setShowOrgForm(true);
  }

  function openEditOrg(org: Organization) {
    setEditingOrg(org);
    setOrgForm({
      name: org.name,
      org_type: org.org_type ?? '',
      contact_email: org.contact_email ?? '',
      contact_phone: org.contact_phone ?? '',
      address: org.address ?? '',
      notes: org.notes ?? '',
    });
    setOrgFormError(null);
    setShowOrgForm(true);
  }

  function closeOrgForm() {
    setShowOrgForm(false);
    setEditingOrg(null);
    setOrgForm(EMPTY_ORG_FORM);
    setOrgFormError(null);
  }

  async function handleSaveOrg() {
    if (!activeCompanyId) return;
    if (!orgForm.name.trim()) {
      setOrgFormError('Organization name is required.');
      return;
    }

    setSavingOrg(true);
    setOrgFormError(null);

    const payload = {
      company_id: activeCompanyId,
      name: orgForm.name.trim(),
      org_type: orgForm.org_type || null,
      contact_email: orgForm.contact_email.trim() || null,
      contact_phone: orgForm.contact_phone.trim() || null,
      address: orgForm.address.trim() || null,
      notes: orgForm.notes.trim() || null,
    };

    if (editingOrg) {
      const { error: updateError } = await supabase
        .from('organizations')
        .update(payload)
        .eq('id', editingOrg.id);

      if (updateError) {
        setOrgFormError(
          updateError.message.includes('idx_organizations_company_name')
            ? 'An organization with this name already exists.'
            : 'Could not update organization.',
        );
        setSavingOrg(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from('organizations')
        .insert(payload);

      if (insertError) {
        setOrgFormError(
          insertError.message.includes('idx_organizations_company_name')
            ? 'An organization with this name already exists.'
            : 'Could not create organization.',
        );
        setSavingOrg(false);
        return;
      }
    }

    setSavingOrg(false);
    closeOrgForm();
    fetchData();
  }

  // --- Deactivate / Reactivate org ---

  async function handleDeactivateOrg() {
    if (!deactivatingOrg) return;
    setDeactivating(true);

    const { error: updateError } = await supabase
      .from('organizations')
      .update({ is_active: false })
      .eq('id', deactivatingOrg.id);

    if (updateError) setError('Could not deactivate organization.');

    setDeactivating(false);
    setDeactivatingOrg(null);
    fetchData();
  }

  async function handleReactivateOrg(org: Organization) {
    const { error: updateError } = await supabase
      .from('organizations')
      .update({ is_active: true })
      .eq('id', org.id);

    if (updateError) {
      setError('Could not reactivate organization.');
      return;
    }
    fetchData();
  }

  // --- Add person to org ---

  function openAddPerson(org: Organization) {
    setAddingPersonToOrg(org);
    setPersonForm(EMPTY_PERSON_FORM);
    setPersonFormError(null);
  }

  function closePersonForm() {
    setAddingPersonToOrg(null);
    setPersonForm(EMPTY_PERSON_FORM);
    setPersonFormError(null);
  }

  async function handleSavePerson() {
    if (!activeCompanyId || !addingPersonToOrg) return;
    if (!personForm.first_name.trim() || !personForm.last_name.trim()) {
      setPersonFormError('First and last name are required.');
      return;
    }

    setSavingPerson(true);
    setPersonFormError(null);

    const { error: insertError } = await supabase
      .from('people')
      .insert({
        company_id: activeCompanyId,
        organization_id: addingPersonToOrg.id,
        first_name: personForm.first_name.trim(),
        last_name: personForm.last_name.trim(),
        email: personForm.email.trim() || null,
        phone: personForm.phone.trim() || null,
        title: personForm.title.trim() || null,
        person_type: 'contact',
        contact_type: personForm.contact_type || 'external',
        role_category: personForm.role_category || null,
        is_active: true,
      });

    if (insertError) {
      setPersonFormError('Could not add person.');
      setSavingPerson(false);
      return;
    }

    setSavingPerson(false);
    closePersonForm();
    fetchData();
  }

  const activeCount = orgs.filter((o) => o.is_active).length;
  const inactiveCount = orgs.filter((o) => !o.is_active).length;

  return (
    <>
      <PageHeader
        title="Organizations"
        stats={
          loading
            ? 'Loading...'
            : `${activeCount} organization${activeCount !== 1 ? 's' : ''}${inactiveCount > 0 ? ` \u00b7 ${inactiveCount} inactive` : ''}`
        }
        filters={
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by name or type..."
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
            onClick={openCreateOrg}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-slate-700"
          >
            <Plus size={14} />
            Add Organization
          </button>
        }
      />

      <div className="p-5">
        {loading && (
          <div className="flex h-32 items-center justify-center text-[12px] text-slate-400">
            Loading organizations...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-[12px] text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && orgs.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-center">
            <div className="text-[13px] font-medium text-slate-700">No organizations yet</div>
            <div className="text-[11px] text-slate-400">Add companies, subcontractors, vendors, and other organizations.</div>
            <button
              onClick={openCreateOrg}
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-slate-700"
            >
              <Plus size={14} />
              Add Organization
            </button>
          </div>
        )}

        {!loading && !error && orgs.length > 0 && (
          <div className="space-y-2">
            {filtered.map((org) => {
              const isOpen = expandedOrgs.has(org.id);
              const orgPeople = peopleByOrg.get(org.id) ?? [];

              return (
                <div key={org.id} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                  {/* Org header */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <button
                      onClick={() => toggleOrg(org.id)}
                      className="flex items-center gap-3 text-left"
                    >
                      <ChevronRight
                        size={14}
                        className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                      />
                      <div>
                        <span className="text-[13px] font-semibold text-slate-900">{org.name}</span>
                        {!org.is_active && (
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                            Inactive
                          </span>
                        )}
                        {org.org_type && (
                          <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                            {ORG_TYPE_LABELS[org.org_type] ?? org.org_type}
                          </span>
                        )}
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        {orgPeople.length} {orgPeople.length === 1 ? 'person' : 'people'}
                      </span>
                      <button
                        onClick={() => openAddPerson(org)}
                        className="rounded p-1 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                        title="Add person"
                      >
                        <UserPlus size={14} />
                      </button>
                      <button
                        onClick={() => openEditOrg(org)}
                        className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      {org.is_active ? (
                        <button
                          onClick={() => setDeactivatingOrg(org)}
                          className="rounded p-1 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                          title="Deactivate"
                        >
                          <EyeOff size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivateOrg(org)}
                          className="rounded p-1 text-slate-400 transition hover:bg-green-50 hover:text-green-600"
                          title="Reactivate"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded people list */}
                  {isOpen && (
                    <div className="border-t border-slate-100">
                      {orgPeople.length === 0 ? (
                        <div className="px-4 py-4 text-center text-[12px] text-slate-400">
                          No people in this organization yet.
                          <button
                            onClick={() => openAddPerson(org)}
                            className="ml-2 text-blue-600 hover:underline"
                          >
                            Add one
                          </button>
                        </div>
                      ) : (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50">
                              <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">Name</th>
                              <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">Title</th>
                              <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">Email</th>
                              <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">Phone</th>
                              <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">Role</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orgPeople.map((person, i) => (
                              <tr
                                key={person.person_id}
                                className={`border-t border-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                              >
                                <td className="px-4 py-2.5 text-[12px] font-medium text-slate-900">
                                  {[person.first_name, person.last_name].filter(Boolean).join(' ')}
                                </td>
                                <td className="px-4 py-2.5 text-[12px] text-slate-600">{person.title || '\u2014'}</td>
                                <td className="px-4 py-2.5 text-[12px] text-slate-600">{person.email || '\u2014'}</td>
                                <td className="px-4 py-2.5 text-[12px] text-slate-600">{person.phone || '\u2014'}</td>
                                <td className="px-4 py-2.5 text-[12px] text-slate-600">{person.role_label || '\u2014'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Organization Modal */}
      {showOrgForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-slate-800">
                {editingOrg ? 'Edit Organization' : 'New Organization'}
              </h3>
              <button onClick={closeOrgForm} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-slate-600">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  placeholder="e.g. ABC Construction"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-medium text-slate-600">Type</label>
                <select
                  value={orgForm.org_type}
                  onChange={(e) => setOrgForm({ ...orgForm, org_type: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="">Select type...</option>
                  {ORG_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">Email</label>
                  <input
                    type="email"
                    value={orgForm.contact_email}
                    onChange={(e) => setOrgForm({ ...orgForm, contact_email: e.target.value })}
                    placeholder="info@example.com"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">Phone</label>
                  <input
                    type="tel"
                    value={orgForm.contact_phone}
                    onChange={(e) => setOrgForm({ ...orgForm, contact_phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-medium text-slate-600">Address</label>
                <input
                  type="text"
                  value={orgForm.address}
                  onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                  placeholder="123 Main St, City, ST"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-medium text-slate-600">Notes</label>
                <textarea
                  value={orgForm.notes}
                  onChange={(e) => setOrgForm({ ...orgForm, notes: e.target.value })}
                  placeholder="Internal notes..."
                  rows={2}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              {orgFormError && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">{orgFormError}</div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSaveOrg}
                  disabled={!orgForm.name.trim() || savingOrg}
                  className="rounded-lg bg-slate-800 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {savingOrg ? 'Saving...' : editingOrg ? 'Update Organization' : 'Create Organization'}
                </button>
                <button
                  onClick={closeOrgForm}
                  className="rounded-lg border border-slate-300 px-5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Person to Organization Modal */}
      {addingPersonToOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-slate-800">
                Add Person to {addingPersonToOrg.name}
              </h3>
              <button onClick={closePersonForm} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
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
                    value={personForm.first_name}
                    onChange={(e) => setPersonForm({ ...personForm, first_name: e.target.value })}
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
                    value={personForm.last_name}
                    onChange={(e) => setPersonForm({ ...personForm, last_name: e.target.value })}
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
                    value={personForm.email}
                    onChange={(e) => setPersonForm({ ...personForm, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">Phone</label>
                  <input
                    type="tel"
                    value={personForm.phone}
                    onChange={(e) => setPersonForm({ ...personForm, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-medium text-slate-600">Title</label>
                <input
                  type="text"
                  value={personForm.title}
                  onChange={(e) => setPersonForm({ ...personForm, title: e.target.value })}
                  placeholder="Project Manager"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">Contact Type</label>
                  <select
                    value={personForm.contact_type}
                    onChange={(e) => setPersonForm({ ...personForm, contact_type: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">Role</label>
                  <select
                    value={personForm.role_category}
                    onChange={(e) => setPersonForm({ ...personForm, role_category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="">Select role...</option>
                    {ROLE_CATEGORIES.map((r) => (
                      <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {personFormError && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">{personFormError}</div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSavePerson}
                  disabled={!personForm.first_name.trim() || !personForm.last_name.trim() || savingPerson}
                  className="rounded-lg bg-slate-800 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {savingPerson ? 'Saving...' : 'Add Person'}
                </button>
                <button
                  onClick={closePersonForm}
                  className="rounded-lg border border-slate-300 px-5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Org Confirmation */}
      {deactivatingOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-[15px] font-semibold text-slate-800">Deactivate Organization</h3>
            <p className="mb-4 text-[13px] text-slate-600">
              Deactivate <span className="font-medium">{deactivatingOrg.name}</span>? It will be hidden from selection lists but can be reactivated later. People under this organization are not affected.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeactivateOrg}
                disabled={deactivating}
                className="rounded-lg bg-amber-600 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-amber-700 disabled:opacity-40"
              >
                {deactivating ? 'Deactivating...' : 'Deactivate'}
              </button>
              <button
                onClick={() => setDeactivatingOrg(null)}
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
