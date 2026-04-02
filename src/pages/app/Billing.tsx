import { PageHeader } from '../../components/PageHeader';

export function Billing() {
  return (
    <>
      <PageHeader title="Billing" stats="Subscription management" />
      <div className="p-5">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <div className="text-lg font-semibold text-slate-900">Billing & Subscription</div>
          <p className="mt-2 text-sm text-slate-500">
            Manage your JiTpro Core subscription and Control Tower project purchases.
          </p>
          <p className="mt-4 text-xs text-slate-400">Coming soon</p>
        </div>
      </div>
    </>
  );
}
