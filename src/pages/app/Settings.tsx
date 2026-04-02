import { PageHeader } from '../../components/PageHeader';

export function Settings() {
  return (
    <>
      <PageHeader title="Settings" />
      <div className="p-5 space-y-4">
        <SettingsCard
          title="Company Profile"
          description="Edit company name, address, license, phone, email, and website."
          status="Coming soon"
        />
        <SettingsCard
          title="User Management"
          description="Invite users, assign roles, deactivate accounts, and trigger password resets."
          status="Coming soon"
        />
        <SettingsCard
          title="Subscription"
          description="View your current plan and manage Control Tower purchases."
          status="Coming soon"
        />
        <SettingsCard
          title="Notifications"
          description="Configure company-wide notification defaults."
          status="Coming soon"
        />
        <SettingsCard
          title="Integrations"
          description="Connect to external tools like Procore, PlanGrid, and email."
          status="Coming soon"
        />
      </div>
    </>
  );
}

function SettingsCard({ title, description, status }: { title: string; description: string; status: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5">
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-400">
        {status}
      </span>
    </div>
  );
}
