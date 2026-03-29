import { useCallback, useRef, useState } from 'react';
import { AppLayout } from '../layouts/AppLayout';

const steps = [
  { key: 'profile', label: 'Company Profile' },
  { key: 'admin', label: 'Company Admin' },
  { key: 'calendar', label: 'Holiday Calendar' },
  { key: 'users', label: 'Internal Users' },
  { key: 'contacts', label: 'Company Contacts' },
  { key: 'costcodes', label: 'Cost Codes' },
  { key: 'pcl', label: 'PCL Templates' },
];

const inputClass = 'w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export function CompanySetup() {
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1: Company Profile
  const [legalName, setLegalName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [timezone, setTimezone] = useState('America/Los_Angeles');

  // Step 2: Company Admin
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminTitle, setAdminTitle] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [addSecondaryAdmin, setAddSecondaryAdmin] = useState(false);
  const [secondaryFirstName, setSecondaryFirstName] = useState('');
  const [secondaryLastName, setSecondaryLastName] = useState('');
  const [secondaryTitle, setSecondaryTitle] = useState('');
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');

  // Step 5: Company Contacts (CSV import)
  interface ContactRow {
    first_name: string;
    last_name: string;
    title: string;
    company_organization: string;
    email: string;
    phone: string;
    address: string;
    contact_type: string;
    role_category: string;
    notes: string;
    errors: string[];
  }

  const csvTemplateColumns = [
    'First Name',
    'Last Name',
    'Title',
    'Company/Organization',
    'Email',
    'Phone',
    'Address',
    'Contact Type',
    'Role Category',
    'Notes',
  ];

  const validContactTypes = ['internal', 'external'];
  const validRoleCategories = [
    'principal', 'senior_project_manager', 'project_manager', 'project_engineer',
    'project_administrator', 'superintendent', 'foreman',
    'owner', 'architect', 'engineer', 'designer', 'consultant',
    'subcontractor', 'supplier', 'other',
  ];

  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [contactsConfirmed, setContactsConfirmed] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const parseCSV = useCallback((text: string): ContactRow[] => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) return [];

    // Skip header row
    return lines.slice(1).map((line) => {
      // Simple CSV parse (handles quoted fields with commas)
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

      // Validate
      if (!row.first_name) row.errors.push('First Name is required');
      if (!row.last_name) row.errors.push('Last Name is required');
      if (!row.email) row.errors.push('Email is required');
      if (row.contact_type && !validContactTypes.includes(row.contact_type)) {
        row.errors.push(`Contact Type must be "Internal" or "External"`);
      }
      if (row.role_category && !validRoleCategories.includes(row.role_category)) {
        row.errors.push(`Invalid Role Category: "${row.role_category}"`);
      }

      return row;
    });
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError(null);
    setContactsConfirmed(false);

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
      setContacts(parsed);
    };
    reader.readAsText(file);
  }, [parseCSV]);

  const errorCount = contacts.filter((c) => c.errors.length > 0).length;
  const duplicateEmails = contacts
    .map((c) => c.email.toLowerCase())
    .filter((email, i, arr) => email && arr.indexOf(email) !== i);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AppLayout pageTitle="Company Setup">
      <div className="mx-auto max-w-3xl">
        {/* Step indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {steps.map((step, i) => (
              <button
                key={step.key}
                onClick={() => setCurrentStep(i)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  i === currentStep
                    ? 'bg-slate-900 text-white'
                    : i < currentStep
                    ? 'bg-slate-200 text-slate-700'
                    : 'text-slate-400 bg-slate-50'
                }`}
              >
                {i + 1}. {step.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200">
          {/* Step 1: Company Profile */}
          {currentStep === 0 && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Company Profile</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Enter your company information to get started.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Legal Company Name *</label>
                    <input
                      type="text"
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      placeholder="e.g., Kaufman Construction Inc."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g., Kaufman Construction"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Street Address *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main Street"
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className={labelClass}>City *</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>State *</label>
                    <input type="text" value={state} onChange={(e) => setState(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>ZIP Code *</label>
                    <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>License Number *</label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="e.g., CA-B-123456"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      type="tel"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="(555) 555-5555"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Company Logo</label>
                  <div className="flex items-center justify-center w-full h-32 rounded-md border-2 border-dashed border-slate-200 bg-slate-50">
                    <p className="text-sm text-slate-400">Logo upload coming soon</p>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Timezone</label>
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass}>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Anchorage">Alaska Time (AKT)</option>
                    <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Company Admin */}
          {currentStep === 1 && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Company Admin</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Set up the primary company administrator. This person will manage billing, user roles, and company settings.
                </p>
              </div>

              <div className="space-y-6">
                {/* Primary Admin */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Primary Admin *</h3>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>First Name *</label>
                        <input
                          type="text"
                          value={adminFirstName}
                          onChange={(e) => setAdminFirstName(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Last Name *</label>
                        <input
                          type="text"
                          value={adminLastName}
                          onChange={(e) => setAdminLastName(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Title</label>
                      <input
                        type="text"
                        value={adminTitle}
                        onChange={(e) => setAdminTitle(e.target.value)}
                        placeholder="e.g., President, Owner, Operations Director"
                        className={inputClass}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>Email *</label>
                        <input
                          type="email"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Phone</label>
                        <input
                          type="tel"
                          value={adminPhone}
                          onChange={(e) => setAdminPhone(e.target.value)}
                          placeholder="(555) 555-5555"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Role</label>
                      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        Company Admin — Full access to billing, users, settings, and all projects
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary Admin toggle */}
                <div className="border-t border-slate-200 pt-6">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="addSecondary"
                      checked={addSecondaryAdmin}
                      onChange={(e) => {
                        setAddSecondaryAdmin(e.target.checked);
                        if (!e.target.checked) {
                          setSecondaryFirstName('');
                          setSecondaryLastName('');
                          setSecondaryTitle('');
                          setSecondaryEmail('');
                          setSecondaryPhone('');
                        }
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                    />
                    <label htmlFor="addSecondary" className="text-sm font-medium text-slate-700">
                      Add a secondary admin (optional)
                    </label>
                  </div>
                  <p className="mt-1 ml-7 text-xs text-slate-500">
                    A secondary admin will have the same access as the primary admin. You can also add this later.
                  </p>
                </div>

                {/* Secondary Admin fields */}
                {addSecondaryAdmin && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">Secondary Admin</h3>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className={labelClass}>First Name *</label>
                          <input
                            type="text"
                            value={secondaryFirstName}
                            onChange={(e) => setSecondaryFirstName(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Last Name *</label>
                          <input
                            type="text"
                            value={secondaryLastName}
                            onChange={(e) => setSecondaryLastName(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Title</label>
                        <input
                          type="text"
                          value={secondaryTitle}
                          onChange={(e) => setSecondaryTitle(e.target.value)}
                          placeholder="e.g., VP of Operations"
                          className={inputClass}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className={labelClass}>Email *</label>
                          <input
                            type="email"
                            value={secondaryEmail}
                            onChange={(e) => setSecondaryEmail(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Phone</label>
                          <input
                            type="tel"
                            value={secondaryPhone}
                            onChange={(e) => setSecondaryPhone(e.target.value)}
                            placeholder="(555) 555-5555"
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Role</label>
                        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                          Company Admin — Full access to billing, users, settings, and all projects
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Step 3–7: Placeholder screens */}
          {currentStep === 2 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Holiday Calendar</h2>
              <p className="mt-1 text-sm text-slate-600">
                Customize your company's non-working days and holidays.
              </p>
              <div className="mt-8 flex items-center justify-center h-48 rounded-md border-2 border-dashed border-slate-200 bg-slate-50">
                <p className="text-sm text-slate-400">Holiday calendar setup coming next</p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Internal Users</h2>
              <p className="mt-1 text-sm text-slate-600">
                Invite team members to your company workspace.
              </p>
              <div className="mt-8 flex items-center justify-center h-48 rounded-md border-2 border-dashed border-slate-200 bg-slate-50">
                <p className="text-sm text-slate-400">Internal user setup coming soon</p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Company Contacts</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Import your company directory from a CSV file. This will include all internal team members and external contacts.
                </p>
              </div>

              {/* Download template + Upload */}
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
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

                {csvError && (
                  <p className="text-sm text-red-600">{csvError}</p>
                )}
              </div>

              {/* Preview table */}
              {contacts.length > 0 && !contactsConfirmed && (
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Preview: {contacts.length} contact{contacts.length !== 1 ? 's' : ''} found
                      </h3>
                      {errorCount > 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          {errorCount} row{errorCount !== 1 ? 's' : ''} with errors — fix and re-upload, or confirm to skip them
                        </p>
                      )}
                      {duplicateEmails.length > 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          Duplicate emails detected: {[...new Set(duplicateEmails)].join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setContacts([]); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setContactsConfirmed(true)}
                        className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
                      >
                        Confirm Import
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-md border border-slate-200">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="py-2 px-3 text-left font-medium text-slate-600">#</th>
                          <th className="py-2 px-3 text-left font-medium text-slate-600">First Name</th>
                          <th className="py-2 px-3 text-left font-medium text-slate-600">Last Name</th>
                          <th className="py-2 px-3 text-left font-medium text-slate-600">Title</th>
                          <th className="py-2 px-3 text-left font-medium text-slate-600">Company</th>
                          <th className="py-2 px-3 text-left font-medium text-slate-600">Email</th>
                          <th className="py-2 px-3 text-left font-medium text-slate-600">Phone</th>
                          <th className="py-2 px-3 text-left font-medium text-slate-600">Type</th>
                          <th className="py-2 px-3 text-left font-medium text-slate-600">Role</th>
                          <th className="py-2 px-3 text-left font-medium text-slate-600">Issues</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((contact, i) => (
                          <tr
                            key={i}
                            className={`border-b border-slate-100 ${contact.errors.length > 0 ? 'bg-red-50' : ''}`}
                          >
                            <td className="py-1.5 px-3 text-slate-400">{i + 1}</td>
                            <td className="py-1.5 px-3 text-slate-900">{contact.first_name || '—'}</td>
                            <td className="py-1.5 px-3 text-slate-900">{contact.last_name || '—'}</td>
                            <td className="py-1.5 px-3 text-slate-600">{contact.title || '—'}</td>
                            <td className="py-1.5 px-3 text-slate-600">{contact.company_organization || '—'}</td>
                            <td className="py-1.5 px-3 text-slate-600">{contact.email || '—'}</td>
                            <td className="py-1.5 px-3 text-slate-600">{contact.phone || '—'}</td>
                            <td className="py-1.5 px-3 text-slate-600">{contact.contact_type || '—'}</td>
                            <td className="py-1.5 px-3 text-slate-600">{contact.role_category || '—'}</td>
                            <td className="py-1.5 px-3">
                              {contact.errors.length > 0 ? (
                                <span className="text-red-600">{contact.errors.join('; ')}</span>
                              ) : (
                                <span className="text-green-600">OK</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Confirmed state */}
              {contactsConfirmed && (
                <div className="mt-6 rounded-md bg-green-50 border border-green-200 px-4 py-3">
                  <p className="text-sm font-medium text-green-800">
                    {contacts.filter((c) => c.errors.length === 0).length} contact{contacts.filter((c) => c.errors.length === 0).length !== 1 ? 's' : ''} imported successfully.
                    {errorCount > 0 && ` ${errorCount} row${errorCount !== 1 ? 's' : ''} skipped due to errors.`}
                  </p>
                  <button
                    onClick={() => { setContactsConfirmed(false); setContacts([]); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="mt-2 text-xs text-green-700 underline hover:text-green-900"
                  >
                    Upload a different file
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Cost Code Library</h2>
              <p className="mt-1 text-sm text-slate-600">
                Set up your company's cost code structure.
              </p>
              <div className="mt-8 flex items-center justify-center h-48 rounded-md border-2 border-dashed border-slate-200 bg-slate-50">
                <p className="text-sm text-slate-400">Cost code setup coming soon</p>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">PCL Templates</h2>
              <p className="mt-1 text-sm text-slate-600">
                Review and customize your company's procurement complexity level templates.
              </p>
              <div className="mt-8 flex items-center justify-center h-48 rounded-md border-2 border-dashed border-slate-200 bg-slate-50">
                <p className="text-sm text-slate-400">PCL template setup coming soon</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
            <div>
              {currentStep > 0 ? (
                <button
                  onClick={handleBack}
                  className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Back
                </button>
              ) : (
                <p className="text-xs text-slate-400">* Required fields</p>
              )}
            </div>
            <button
              onClick={handleNext}
              className="rounded-md bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Save & Continue'}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
