// src/pages/setup/steps/CompanyProfile.tsx

interface CompanyProfileData {
  legalName: string;
  displayName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  licenseNumber: string;
  companyPhone: string;
  timezone: string;
}

interface CompanyProfileProps {
  data: CompanyProfileData;
  onChange: (data: CompanyProfileData) => void;
}

const inputClass = 'w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export type { CompanyProfileData };

export function CompanyProfile({ data, onChange }: CompanyProfileProps) {
  const update = (field: keyof CompanyProfileData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
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
              value={data.legalName}
              onChange={(e) => update('legalName', e.target.value)}
              placeholder="e.g., Kaufman Construction Inc."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Display Name</label>
            <input
              type="text"
              value={data.displayName}
              onChange={(e) => update('displayName', e.target.value)}
              placeholder="e.g., Kaufman Construction"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Street Address *</label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => update('address', e.target.value)}
            placeholder="123 Main Street"
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass}>City *</label>
            <input type="text" value={data.city} onChange={(e) => update('city', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>State *</label>
            <input type="text" value={data.state} onChange={(e) => update('state', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>ZIP Code *</label>
            <input type="text" value={data.zip} onChange={(e) => update('zip', e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>License Number *</label>
            <input
              type="text"
              value={data.licenseNumber}
              onChange={(e) => update('licenseNumber', e.target.value)}
              placeholder="e.g., CA-B-123456"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="tel"
              value={data.companyPhone}
              onChange={(e) => update('companyPhone', e.target.value)}
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
          <select value={data.timezone} onChange={(e) => update('timezone', e.target.value)} className={inputClass}>
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
  );
}
