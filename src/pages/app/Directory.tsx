import { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { ChevronRight, Pencil, EyeOff, Plus, UserPlus, X } from 'lucide-react';
import { ContactDetailModal, type ContactDetailData } from '../../components/ContactDetailModal';
import { useCompany } from '../../context/CompanyContext';
import { supabase } from '../../../supabase/client';
import {
  useDirectoryData,
  COMPANY_TYPES,
  type DirectoryCompany,
  type DirectoryContact,
  type DirectoryGroup,
} from '../../hooks/useDirectoryData';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COMPANY_TYPE_OPTIONS: { value: string; label: string }[] = COMPANY_TYPES.map((t) => ({
  value: t,
  label: t.charAt(0).toUpperCase() + t.slice(1),
}));

const ROLE_CATEGORIES = [
  'owner', 'architect', 'engineer', 'designer', 'consultant',
  'subcontractor', 'supplier', 'principal', 'senior_project_manager',
  'project_manager', 'project_engineer', 'superintendent', 'foreman', 'other',
];

// ---------------------------------------------------------------------------
// Section: one UI group (Owner, Design Team, etc.)
// ---------------------------------------------------------------------------

function GroupSection({
  group,
  expandedIds,
  onToggle,
  onAddContact,
  onEditCompany,
  onDeactivateCompany,
  onViewContact,
  onEditContact,
  onDeactivateContact,
}: {
  group: DirectoryGroup;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onAddContact: (company: DirectoryCompany) => void;
  onEditCompany: (company: DirectoryCompany) => void;
  onDeactivateCompany: (company: DirectoryCompany) => void;
  onViewContact: (contact: DirectoryContact, companyName: string) => void;
  onEditContact: (contact: DirectoryContact) => void;
  onDeactivateContact: (contact: DirectoryContact) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        {group.group}
      </h2>
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-left" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '32px' }} />
            <col style={{ width: '35%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-2 py-2.5" />
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                Company Name
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                Company Type
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                Primary Contact
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                Contacts
              </th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {group.companies.map((company, i) => (
              <CompanyRow
                key={company.id}
                company={company}
                isOpen={expandedIds.has(company.id)}
                onToggle={() => onToggle(company.id)}
                onAddContact={() => onAddContact(company)}
                onEdit={() => onEditCompany(company)}
                onDeactivate={() => onDeactivateCompany(company)}
                onViewContact={(c) => onViewContact(c, company.name)}
                onEditContact={onEditContact}
                onDeactivateContact={onDeactivateContact}
                striped={i % 2 !== 0}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Company row (expandable)
// ---------------------------------------------------------------------------

function CompanyRow({
  company,
  isOpen,
  onToggle,
  onAddContact,
  onEdit,
  onDeactivate,
  onViewContact,
  onEditContact,
  onDeactivateContact,
  striped,
}: {
  company: DirectoryCompany;
  isOpen: boolean;
  onToggle: () => void;
  onAddContact: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
  onViewContact: (contact: DirectoryContact) => void;
  onEditContact: (contact: DirectoryContact) => void;
  onDeactivateContact: (contact: DirectoryContact) => void;
  striped: boolean;
}) {
  return (
    <>
      <tr
        className={`border-b border-slate-100 last:border-0 cursor-pointer ${
          striped ? 'bg-slate-50/50' : 'bg-white'
        }`}
        onClick={onToggle}
      >
        <td className="px-2 py-3 text-center">
          <ChevronRight
            size={14}
            className={`inline-block text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          />
        </td>
        <td className="px-4 py-3 text-[12px] font-medium text-slate-900 truncate">
          {company.name}
        </td>
        <td className="px-4 py-3">
          {company.companyTypeLabel ? (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
              {company.companyTypeLabel}
            </span>
          ) : (
            <span className="text-[12px] text-slate-400">{'\u2014'}</span>
          )}
        </td>
        <td className="px-4 py-3 text-[12px] text-slate-600">
          {company.primaryContact ? company.primaryContact.name : '\u2014'}
        </td>
        <td className="px-4 py-3">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
            {company.contactCount}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onAddContact}
              className="rounded p-1 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
              title="Add contact"
            >
              <UserPlus size={14} />
            </button>
            <button
              onClick={onEdit}
              className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              title="Edit company"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={onDeactivate}
              className="rounded p-1 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
              title="Deactivate"
            >
              <EyeOff size={14} />
            </button>
          </div>
        </td>
      </tr>

      {isOpen && (
        <tr>
          <td colSpan={6} className="bg-slate-50/70 p-0">
            <ContactsSubtable
              contacts={company.contacts}
              onViewContact={onViewContact}
              onEditContact={onEditContact}
              onDeactivateContact={onDeactivateContact}
            />
          </td>
        </tr>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Nested contacts table
// ---------------------------------------------------------------------------

function ContactsSubtable({
  contacts,
  onViewContact,
  onEditContact,
  onDeactivateContact,
}: {
  contacts: DirectoryContact[];
  onViewContact: (contact: DirectoryContact) => void;
  onEditContact: (contact: DirectoryContact) => void;
  onDeactivateContact: (contact: DirectoryContact) => void;
}) {
  if (contacts.length === 0) {
    return (
      <div className="px-8 py-4 text-center text-[12px] text-slate-400">
        No contacts in this company.
      </div>
    );
  }

  return (
    <div className="border-t border-slate-200">
      <table className="w-full text-left" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '32px' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '18%' }} />
          <col style={{ width: '22%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '13%' }} />
        </colgroup>
        <thead>
          <tr className="bg-slate-100/60">
            <th />
            <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">
              Name
            </th>
            <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">
              Title
            </th>
            <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">
              Email
            </th>
            <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">
              Phone
            </th>
            <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">
              Role
            </th>
            <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact, i) => (
            <tr
              key={contact.personId}
              className={`border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
            >
              <td />
              <td className="px-4 py-2.5 text-[12px] font-medium text-slate-900 truncate">
                <button
                  onClick={() => onViewContact(contact)}
                  className="text-left hover:text-amber-600 hover:underline truncate block w-full"
                >
                  {contact.name}
                </button>
              </td>
              <td className="px-4 py-2.5 text-[12px] text-slate-600 truncate">
                {contact.title || '\u2014'}
              </td>
              <td className="px-4 py-2.5 text-[12px] text-slate-600 truncate">
                {contact.email || '\u2014'}
              </td>
              <td className="px-4 py-2.5 text-[12px] text-slate-600 truncate">
                {contact.phone || '\u2014'}
              </td>
              <td className="px-4 py-2.5 text-[12px] text-slate-600 truncate">
                {contact.roleLabel || '\u2014'}
              </td>
              <td className="px-4 py-2.5 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEditContact(contact)}
                    className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    title="Edit contact"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDeactivateContact(contact)}
                    className="rounded p-1 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                    title="Deactivate"
                  >
                    <EyeOff size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Company Modal
// ---------------------------------------------------------------------------

const EMPTY_COMPANY_FORM = {
  name: '',
  company_type: '',
  address: '',
  notes: '',
};

function AddCompanyModal({
  companyId,
  onClose,
  onSaved,
}: {
  companyId: string;
  onClose: () => void;
  onSaved: (newOrgId: string) => void;
}) {
  const [form, setForm] = useState(EMPTY_COMPANY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canSave = form.name.trim() !== '' && form.company_type !== '';

  async function handleSave() {
    if (!canSave) return;

    setSaving(true);
    setFormError(null);

    const { data, error: insertError } = await supabase
      .from('organizations')
      .insert({
        company_id: companyId,
        name: form.name.trim(),
        org_type: form.company_type,
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
      })
      .select('id')
      .single();

    if (insertError) {
      setFormError(
        insertError.message.includes('idx_organizations_company_name')
          ? 'A company with this name already exists.'
          : 'Could not create company.',
      );
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved(data.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-800">New Company</h3>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <CompanyFormFields form={form} setForm={setForm} />

        {formError && (
          <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">{formError}</div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="rounded-lg bg-slate-800 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Create Company'}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit Company Modal
// ---------------------------------------------------------------------------

function EditCompanyModal({
  company,
  onClose,
  onSaved,
}: {
  company: DirectoryCompany;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: company.name,
    company_type: company.companyType ?? '',
    address: company.address,
    notes: company.notes,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canSave = form.name.trim() !== '' && form.company_type !== '';

  async function handleSave() {
    if (!canSave) return;

    setSaving(true);
    setFormError(null);

    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        name: form.name.trim(),
        org_type: form.company_type,
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
      })
      .eq('id', company.id);

    if (updateError) {
      setFormError(
        updateError.message.includes('idx_organizations_company_name')
          ? 'A company with this name already exists.'
          : 'Could not update company.',
      );
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-800">Edit Company</h3>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <CompanyFormFields form={form} setForm={setForm} />

        {formError && (
          <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">{formError}</div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="rounded-lg bg-slate-800 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Update Company'}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared company form fields (used by Add + Edit)
// ---------------------------------------------------------------------------

interface CompanyFormState {
  name: string;
  company_type: string;
  address: string;
  notes: string;
}

function CompanyFormFields({
  form,
  setForm,
}: {
  form: CompanyFormState;
  setForm: (f: CompanyFormState) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-[12px] font-medium text-slate-600">
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. ABC Architecture"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-medium text-slate-600">
          Company Type <span className="text-red-500">*</span>
        </label>
        <select
          value={form.company_type}
          onChange={(e) => setForm({ ...form, company_type: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
        >
          <option value="">Select type...</option>
          {COMPANY_TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-medium text-slate-600">Address</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="123 Main St, City, ST"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-medium text-slate-600">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Internal notes..."
          rows={2}
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Contact Modal
// ---------------------------------------------------------------------------

const EMPTY_CONTACT_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  title: '',
  role_category: '',
};

function AddContactModal({
  companyId,
  preselectedOrg,
  internalCompany,
  allCompanies,
  onClose,
  onSaved,
  onAddCompany,
}: {
  companyId: string;
  preselectedOrg: DirectoryCompany | null;
  internalCompany: DirectoryCompany | null;
  allCompanies: DirectoryCompany[];
  onClose: () => void;
  onSaved: () => void;
  onAddCompany: () => void;
}) {
  const [selectedOrgId, setSelectedOrgId] = useState(preselectedOrg?.id ?? '');
  const [form, setForm] = useState(EMPTY_CONTACT_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Is the selected target the internal (GC) company?
  const isInternal = selectedOrgId === companyId;

  const companySelected = selectedOrgId !== '';
  const canSave = companySelected && form.first_name.trim() !== '' && form.last_name.trim() !== '';

  async function handleSave() {
    if (!canSave) return;

    setSaving(true);
    setFormError(null);

    const { error: insertError } = await supabase
      .from('people')
      .insert({
        company_id: companyId,
        organization_id: isInternal ? null : selectedOrgId,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        title: form.title.trim() || null,
        person_type: 'contact',
        contact_type: isInternal ? 'internal' : 'external',
        role_category: form.role_category || null,
        is_active: true,
      });

    if (insertError) {
      setFormError('Could not create contact.');
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved();
  }

  // Build dropdown options: internal company first, then external sorted
  const externalCompanies = allCompanies.filter((c) => c.id !== companyId);
  const sortedExternal = [...externalCompanies].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-800">New Contact</h3>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Step 1 — Company selection */}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-slate-600">
              Company <span className="text-red-500">*</span>
            </label>
            {preselectedOrg ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-medium text-slate-800">
                {preselectedOrg.name}
                {preselectedOrg.id === companyId && (
                  <span className="ml-2 text-[10px] font-semibold text-slate-400">Internal</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="">Select company...</option>
                  {internalCompany && (
                    <option value={companyId}>{internalCompany.name} (Internal)</option>
                  )}
                  {sortedExternal.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  onClick={onAddCompany}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-[12px] font-medium text-slate-600 transition hover:bg-slate-50 whitespace-nowrap"
                >
                  + New
                </button>
              </div>
            )}
          </div>

          {/* Step 2 — Contact details */}
          <ContactFormFields form={form} setForm={setForm} />

          {formError && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">{formError}</div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={!canSave || saving}
              className="rounded-lg bg-slate-800 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? 'Saving...' : 'Add Contact'}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit Contact Modal
// ---------------------------------------------------------------------------

function EditContactModal({
  contact,
  onClose,
  onSaved,
}: {
  contact: DirectoryContact;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    first_name: contact.firstName,
    last_name: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    title: contact.title,
    role_category: contact.roleLabel,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canSave = form.first_name.trim() !== '' && form.last_name.trim() !== '';

  async function handleSave() {
    if (!canSave) return;

    setSaving(true);
    setFormError(null);

    const { error: updateError } = await supabase
      .from('people')
      .update({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        title: form.title.trim() || null,
        role_category: form.role_category || null,
      })
      .eq('id', contact.personId);

    if (updateError) {
      setFormError('Could not update contact.');
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-800">Edit Contact</h3>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <ContactFormFields form={form} setForm={setForm} />

          {formError && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">{formError}</div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={!canSave || saving}
              className="rounded-lg bg-slate-800 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? 'Saving...' : 'Update Contact'}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared contact form fields (used by Add + Edit)
// ---------------------------------------------------------------------------

interface ContactFormState {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  title: string;
  role_category: string;
}

function ContactFormFields({
  form,
  setForm,
}: {
  form: ContactFormState;
  setForm: (f: ContactFormState) => void;
}) {
  return (
    <>
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
    </>
  );
}

// ---------------------------------------------------------------------------
// Deactivate Confirmation Modal (shared for company + contact)
// ---------------------------------------------------------------------------

function DeactivateModal({
  entityType,
  entityName,
  onClose,
  onConfirm,
}: {
  entityType: 'company' | 'contact';
  entityName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [deactivating, setDeactivating] = useState(false);

  async function handleConfirm() {
    setDeactivating(true);
    await onConfirm();
    setDeactivating(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-2 text-[15px] font-semibold text-slate-800">
          Deactivate {entityType === 'company' ? 'Company' : 'Contact'}
        </h3>
        <p className="mb-4 text-[13px] text-slate-600">
          Deactivate <span className="font-medium">{entityName}</span>?
          {entityType === 'company'
            ? ' It will be hidden from the directory but can be reactivated later. Contacts under this company are not affected.'
            : ' They will be hidden from the directory but can be reactivated later.'}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleConfirm}
            disabled={deactivating}
            className="rounded-lg bg-amber-600 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-amber-700 disabled:opacity-40"
          >
            {deactivating ? 'Deactivating...' : 'Deactivate'}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Directory page
// ---------------------------------------------------------------------------

export function Directory() {
  const { activeCompanyId } = useCompany();
  const { internalCompany, groups, allCompanies, loading, error, refetch } = useDirectoryData();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Add modals
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [addContactTarget, setAddContactTarget] = useState<DirectoryCompany | null | 'global'>(null);
  const [addCompanyFromContact, setAddCompanyFromContact] = useState(false);

  // Edit modals
  const [editingCompany, setEditingCompany] = useState<DirectoryCompany | null>(null);
  const [editingContact, setEditingContact] = useState<DirectoryContact | null>(null);

  // View contact detail
  const [viewingContact, setViewingContact] = useState<{ contact: DirectoryContact; companyName: string } | null>(null);

  // Deactivate modals
  const [deactivatingCompany, setDeactivatingCompany] = useState<DirectoryCompany | null>(null);
  const [deactivatingContact, setDeactivatingContact] = useState<DirectoryContact | null>(null);

  function toggleCompany(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // --- Add Company handlers ---

  function openAddCompany() {
    setShowAddCompany(true);
    setAddCompanyFromContact(false);
  }

  function openAddCompanyFromContact() {
    setAddCompanyFromContact(true);
    setShowAddCompany(true);
  }

  function handleCompanySaved(_newOrgId: string) {
    setShowAddCompany(false);
    refetch();

    if (addCompanyFromContact) {
      setAddCompanyFromContact(false);
      setAddContactTarget('global');
    }
  }

  function closeAddCompany() {
    setShowAddCompany(false);
    if (addCompanyFromContact) {
      setAddCompanyFromContact(false);
      setAddContactTarget('global');
    }
  }

  // --- Add Contact handlers ---

  function openAddContactForCompany(company: DirectoryCompany) {
    setAddContactTarget(company);
  }

  function openAddContactGlobal() {
    setAddContactTarget('global');
  }

  function handleContactSaved() {
    setAddContactTarget(null);
    refetch();
  }

  function closeAddContact() {
    setAddContactTarget(null);
  }

  // --- View Contact handlers ---

  function openViewContact(contact: DirectoryContact, companyName: string) {
    setViewingContact({ contact, companyName });
  }

  function handleViewContactEdit() {
    if (!viewingContact) return;
    setEditingContact(viewingContact.contact);
    setViewingContact(null);
  }

  // --- Edit Company handlers ---

  function handleEditCompanySaved() {
    setEditingCompany(null);
    refetch();
  }

  // --- Deactivate Company handler ---

  async function handleDeactivateCompany() {
    if (!deactivatingCompany) return;

    const { error: updateError } = await supabase
      .from('organizations')
      .update({ is_active: false })
      .eq('id', deactivatingCompany.id);

    if (updateError) return;

    setDeactivatingCompany(null);
    refetch();
  }

  // --- Edit Contact handlers ---

  function handleEditContactSaved() {
    setEditingContact(null);
    refetch();
  }

  // --- Deactivate Contact handler ---

  async function handleDeactivateContact() {
    if (!deactivatingContact) return;

    const { error: updateError } = await supabase
      .from('people')
      .update({ is_active: false })
      .eq('id', deactivatingContact.personId);

    if (updateError) return;

    setDeactivatingContact(null);
    refetch();
  }

  const totalCompanies = allCompanies.length;
  const totalContacts = allCompanies.reduce((sum, c) => sum + c.contactCount, 0);

  return (
    <>
      <PageHeader
        title="Directory"
        stats={
          loading
            ? 'Loading...'
            : `${totalCompanies} ${totalCompanies === 1 ? 'company' : 'companies'} \u00b7 ${totalContacts} ${totalContacts === 1 ? 'contact' : 'contacts'}`
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={openAddContactGlobal}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <UserPlus size={14} />
              Add Contact
            </button>
            <button
              onClick={openAddCompany}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-slate-700"
            >
              <Plus size={14} />
              Add Company
            </button>
          </div>
        }
      />

      <div className="p-5">
        {loading && (
          <div className="flex h-32 items-center justify-center text-[12px] text-slate-400">
            Loading directory...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-[12px] text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && allCompanies.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-center">
            <div className="text-[13px] font-medium text-slate-700">No companies yet</div>
            <div className="text-[11px] text-slate-400">
              Add companies and contacts to your directory.
            </div>
            <button
              onClick={openAddCompany}
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-slate-700"
            >
              <Plus size={14} />
              Add Company
            </button>
          </div>
        )}

        {!loading && !error && allCompanies.length > 0 && (
          <div className="space-y-6">
            {/* Internal Company section */}
            {internalCompany && (
              <div>
                <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Company (Internal)
                </h2>
                <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                  <table className="w-full text-left" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '32px' }} />
                      <col style={{ width: '35%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '15%' }} />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-2 py-2.5" />
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                          Company Name
                        </th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                          Company Type
                        </th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                          Primary Contact
                        </th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                          Contacts
                        </th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        className="border-b border-slate-100 last:border-0 cursor-pointer bg-white"
                        onClick={() => toggleCompany(internalCompany.id)}
                      >
                        <td className="px-2 py-3 text-center">
                          <ChevronRight
                            size={14}
                            className={`inline-block text-slate-400 transition-transform ${expandedIds.has(internalCompany.id) ? 'rotate-90' : ''}`}
                          />
                        </td>
                        <td className="px-4 py-3 text-[12px] font-medium text-slate-900 truncate">
                          {internalCompany.name}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] text-slate-400">{'\u2014'}</span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-slate-600">
                          {internalCompany.primaryContact ? internalCompany.primaryContact.name : '\u2014'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            {internalCompany.contactCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openAddContactForCompany(internalCompany)}
                              className="rounded p-1 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                              title="Add contact"
                            >
                              <UserPlus size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedIds.has(internalCompany.id) && (
                        <tr>
                          <td colSpan={6} className="bg-slate-50/70 p-0">
                            <ContactsSubtable
                              contacts={internalCompany.contacts}
                              onViewContact={(c) => openViewContact(c, internalCompany.name)}
                              onEditContact={setEditingContact}
                              onDeactivateContact={setDeactivatingContact}
                            />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* External company groups */}
            {groups.map((group) => (
              <GroupSection
                key={group.group}
                group={group}
                expandedIds={expandedIds}
                onToggle={toggleCompany}
                onAddContact={openAddContactForCompany}
                onEditCompany={setEditingCompany}
                onDeactivateCompany={setDeactivatingCompany}
                onViewContact={openViewContact}
                onEditContact={setEditingContact}
                onDeactivateContact={setDeactivatingContact}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Company Modal */}
      {showAddCompany && activeCompanyId && (
        <AddCompanyModal
          companyId={activeCompanyId}
          onClose={closeAddCompany}
          onSaved={handleCompanySaved}
        />
      )}

      {/* Add Contact Modal */}
      {addContactTarget !== null && activeCompanyId && (
        <AddContactModal
          companyId={activeCompanyId}
          preselectedOrg={addContactTarget === 'global' ? null : addContactTarget}
          internalCompany={internalCompany}
          allCompanies={allCompanies}
          onClose={closeAddContact}
          onSaved={handleContactSaved}
          onAddCompany={openAddCompanyFromContact}
        />
      )}

      {/* Edit Company Modal */}
      {editingCompany && (
        <EditCompanyModal
          company={editingCompany}
          onClose={() => setEditingCompany(null)}
          onSaved={handleEditCompanySaved}
        />
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <EditContactModal
          contact={editingContact}
          onClose={() => setEditingContact(null)}
          onSaved={handleEditContactSaved}
        />
      )}

      {/* Deactivate Company Confirmation */}
      {deactivatingCompany && (
        <DeactivateModal
          entityType="company"
          entityName={deactivatingCompany.name}
          onClose={() => setDeactivatingCompany(null)}
          onConfirm={handleDeactivateCompany}
        />
      )}

      {/* Deactivate Contact Confirmation */}
      {deactivatingContact && (
        <DeactivateModal
          entityType="contact"
          entityName={deactivatingContact.name}
          onClose={() => setDeactivatingContact(null)}
          onConfirm={handleDeactivateContact}
        />
      )}

      {/* Contact Detail Modal */}
      {viewingContact && (
        <ContactDetailModal
          contact={{
            name: viewingContact.contact.name,
            title: viewingContact.contact.title,
            email: viewingContact.contact.email,
            phone: viewingContact.contact.phone,
            role: viewingContact.contact.roleLabel,
            company: viewingContact.companyName,
          }}
          onClose={() => setViewingContact(null)}
          onEdit={handleViewContactEdit}
        />
      )}
    </>
  );
}
