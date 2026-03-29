interface CompanyAdminData {
  adminFirstName: string;
  adminLastName: string;
  adminTitle: string;
  adminEmail: string;
  adminPhone: string;
  addSecondaryAdmin: boolean;
  secondaryFirstName: string;
  secondaryLastName: string;
  secondaryTitle: string;
  secondaryEmail: string;
  secondaryPhone: string;
}

interface CompanyAdminProps {
  data: CompanyAdminData;
  onChange: (data: CompanyAdminData) => void;
}

const inputClass = 'w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export type { CompanyAdminData };

export function CompanyAdmin({ data, onChange }: CompanyAdminProps) {
  const update = (field: keyof CompanyAdminData, value: string | boolean) => {
    const updated = { ...data, [field]: value };
    // Clear secondary fields when unchecking
    if (field === 'addSecondaryAdmin' && !value) {
      updated.secondaryFirstName = '';
      updated.secondaryLastName = '';
      updated.secondaryTitle = '';
      updated.secondaryEmail = '';
      updated.secondaryPhone = '';
    }
    onChange(updated);
  };

  return (
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
                  value={data.adminFirstName}
                  onChange={(e) => update('adminFirstName', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Last Name *</label>
                <input
                  type="text"
                  value={data.adminLastName}
                  onChange={(e) => update('adminLastName', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={data.adminTitle}
                onChange={(e) => update('adminTitle', e.target.value)}
                placeholder="e.g., President, Owner, Operations Director"
                className={inputClass}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Email *</label>
                <input
                  type="email"
                  value={data.adminEmail}
                  onChange={(e) => update('adminEmail', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  value={data.adminPhone}
                  onChange={(e) => update('adminPhone', e.target.value)}
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
              checked={data.addSecondaryAdmin}
              onChange={(e) => update('addSecondaryAdmin', e.target.checked)}
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
        {data.addSecondaryAdmin && (
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Secondary Admin</h3>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>First Name *</label>
                  <input
                    type="text"
                    value={data.secondaryFirstName}
                    onChange={(e) => update('secondaryFirstName', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name *</label>
                  <input
                    type="text"
                    value={data.secondaryLastName}
                    onChange={(e) => update('secondaryLastName', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Title</label>
                <input
                  type="text"
                  value={data.secondaryTitle}
                  onChange={(e) => update('secondaryTitle', e.target.value)}
                  placeholder="e.g., VP of Operations"
                  className={inputClass}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Email *</label>
                  <input
                    type="email"
                    value={data.secondaryEmail}
                    onChange={(e) => update('secondaryEmail', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    type="tel"
                    value={data.secondaryPhone}
                    onChange={(e) => update('secondaryPhone', e.target.value)}
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
  );
}
