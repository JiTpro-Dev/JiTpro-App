import { useCallback, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { ContactRow } from '../setupTypes';
import { csvTemplateColumns, validContactTypes, validRoleCategories } from '../setupTypes';

interface CompanyContactsProps {
  contacts: ContactRow[];
  onContactsChange: (contacts: ContactRow[]) => void;
}

function parseCSV(text: string): ContactRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  return lines.slice(1).map((line) => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current.trim());

    const row: ContactRow = {
      first_name: fields[0] || '',
      last_name: fields[1] || '',
      title: fields[2] || '',
      company_organization: fields[3] || '',
      email: fields[4] || '',
      phone: fields[5] || '',
      address: fields[6] || '',
      contact_type: (fields[7] || '').toLowerCase(),
      role_category: (fields[8] || '').toLowerCase(),
      notes: fields[9] || '',
      errors: [],
    };

    if (!row.first_name) row.errors.push('First Name is required');
    if (!row.last_name) row.errors.push('Last Name is required');
    if (!row.email) row.errors.push('Email is required');
    if (row.contact_type && !validContactTypes.includes(row.contact_type)) {
      row.errors.push('Contact Type must be "Internal" or "External"');
    }
    if (row.role_category && !validRoleCategories.includes(row.role_category)) {
      row.errors.push(`Invalid Role Category: "${row.role_category}"`);
    }

    return row;
  });
}

export function CompanyContacts({ contacts, onContactsChange }: CompanyContactsProps) {
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvImported, setCsvImported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showManualForm, setShowManualForm] = useState(false);
  const [manualFirst, setManualFirst] = useState('');
  const [manualLast, setManualLast] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualType, setManualType] = useState('');
  const [manualRole, setManualRole] = useState('');

  const handleDownloadTemplate = useCallback(() => {
    const header = csvTemplateColumns.join(',');
    const exampleRow = [
      'John', 'Smith', 'Project Manager', 'Smith Construction', 'john@example.com',
      '555-555-5555', '123 Main St', 'Internal', 'project_manager', '',
    ].join(',');
    const csv = header + '\n' + exampleRow + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jitpro_contacts_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError(null);
    setCsvImported(false);

    if (!file.name.endsWith('.csv')) {
      setCsvError('Please upload a .csv file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setCsvError('No data rows found in the file. Make sure the first row is the header.');
        return;
      }
      onContactsChange([...contacts, ...parsed]);
      setCsvImported(true);
    };
    reader.readAsText(file);
  }, [contacts, onContactsChange]);

  const removeContact = (index: number) => {
    onContactsChange(contacts.filter((_, i) => i !== index));
  };

  const resetManualForm = () => {
    setManualFirst(''); setManualLast(''); setManualTitle('');
    setManualCompany(''); setManualEmail(''); setManualPhone('');
    setManualType(''); setManualRole('');
  };

  const addManualContact = () => {
    const errors: string[] = [];
    if (!manualFirst.trim()) errors.push('First Name is required');
    if (!manualLast.trim()) errors.push('Last Name is required');
    if (!manualEmail.trim()) errors.push('Email is required');

    const row: ContactRow = {
      first_name: manualFirst.trim(),
      last_name: manualLast.trim(),
      title: manualTitle.trim(),
      company_organization: manualCompany.trim(),
      email: manualEmail.trim(),
      phone: manualPhone.trim(),
      address: '',
      contact_type: manualType,
      role_category: manualRole,
      notes: '',
      errors,
    };

    onContactsChange([...contacts, row]);
    resetManualForm();
    setShowManualForm(false);
  };

  const hasUnsavedFormData = showManualForm && (manualFirst.trim() || manualLast.trim() || manualEmail.trim());

  const errorCount = contacts.filter((c) => c.errors.length > 0).length;
  const validCount = contacts.filter((c) => c.errors.length === 0).length;
  const duplicateEmails = contacts
    .map((c) => c.email.toLowerCase())
    .filter((email, i, arr) => email && arr.indexOf(email) !== i);

  const inputClass = 'w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Company Contacts</h2>
        <p className="mt-1 text-sm text-slate-600">
          Import your company directory from a CSV file or add contacts manually. This includes both internal team members and external contacts.
        </p>
      </div>

      {/* CSV Import */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleDownloadTemplate}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Download CSV Template
          </button>
          <span className="text-xs text-slate-400">Download the template, fill it in, then upload below</span>
        </div>

        <div>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-full h-32 rounded-md border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:border-slate-300 hover:bg-slate-100 transition-colors"
          >
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">Click to upload CSV file</p>
              <p className="text-xs text-slate-400 mt-1">or drag and drop</p>
            </div>
          </div>
        </div>

        {csvError && <p className="text-sm text-red-600">{csvError}</p>}

        {csvImported && (
          <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3">
            <p className="text-sm font-medium text-green-800">
              {validCount} contact{validCount !== 1 ? 's' : ''} imported.
              {errorCount > 0 && ` ${errorCount} row${errorCount !== 1 ? 's' : ''} had errors.`}
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 border-t border-slate-200" />
        <span className="text-xs text-slate-400">or add contacts individually</span>
        <div className="flex-1 border-t border-slate-200" />
      </div>

      {/* Unsaved contact warning */}
      {hasUnsavedFormData && (
        <div className="mb-4 rounded-md bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-sm text-amber-700">
            You have an unsaved contact below. Click <strong>Add Contact</strong> before clicking Save & Continue, or your entry will be lost.
          </p>
        </div>
      )}

      {/* Manual Add */}
      {!showManualForm ? (
        <button
          onClick={() => setShowManualForm(true)}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          + Add Contact
        </button>
      ) : (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelClass}>First Name *</label>
                <input type="text" value={manualFirst} onChange={(e) => setManualFirst(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last Name *</label>
                <input type="text" value={manualLast} onChange={(e) => setManualLast(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelClass}>Title</label>
                <input type="text" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Company / Organization</label>
                <input type="text" value={manualCompany} onChange={(e) => setManualCompany(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" value={manualEmail} onChange={(e) => setManualEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input type="tel" value={manualPhone} onChange={(e) => setManualPhone(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelClass}>Contact Type</label>
                <select value={manualType} onChange={(e) => setManualType(e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Role Category</label>
                <select value={manualRole} onChange={(e) => setManualRole(e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  {validRoleCategories.map((role) => (
                    <option key={role} value={role}>
                      {role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={addManualContact}
              className="rounded-md bg-slate-800 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition-colors"
            >
              Add Contact
            </button>
            <button
              onClick={() => { setShowManualForm(false); resetManualForm(); }}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Contact summary table */}
      {contacts.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
            {errorCount > 0 && <span className="text-red-600 font-normal ml-2">({errorCount} with errors)</span>}
          </h3>
          {duplicateEmails.length > 0 && (
            <p className="text-xs text-amber-600 mb-2">
              Duplicate emails: {[...new Set(duplicateEmails)].join(', ')}
            </p>
          )}
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-2 px-3 text-left font-medium text-slate-600">Name</th>
                  <th className="py-2 px-3 text-left font-medium text-slate-600">Company</th>
                  <th className="py-2 px-3 text-left font-medium text-slate-600">Email</th>
                  <th className="py-2 px-3 text-left font-medium text-slate-600">Type</th>
                  <th className="py-2 px-3 text-left font-medium text-slate-600">Role</th>
                  <th className="py-2 px-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, i) => (
                  <tr key={i} className={`border-b border-slate-100 ${c.errors.length > 0 ? 'bg-red-50' : ''}`}>
                    <td className="py-1.5 px-3 text-slate-900">{c.first_name} {c.last_name}</td>
                    <td className="py-1.5 px-3 text-slate-600">{c.company_organization || '—'}</td>
                    <td className="py-1.5 px-3 text-slate-600">{c.email || '—'}</td>
                    <td className="py-1.5 px-3 text-slate-600">{c.contact_type || '—'}</td>
                    <td className="py-1.5 px-3 text-slate-600">{c.role_category ? c.role_category.replace(/_/g, ' ') : '—'}</td>
                    <td className="py-1.5 px-3">
                      <button onClick={() => removeContact(i)} className="text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
