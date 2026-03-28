import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  stats?: string;
  filters?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, stats, filters, actions }: PageHeaderProps) {
  const hasSecondRow = filters || actions;

  return (
    <div className="border-b border-slate-200 bg-white px-5 pb-[14px] pt-[18px]">
      <h1 className="text-[20px] font-bold tracking-tight text-slate-950">
        {title}
      </h1>
      {stats && (
        <p className="mt-[3px] text-[11px] text-slate-500">{stats}</p>
      )}
      {hasSecondRow && (
        <div className="mt-[14px] flex items-center justify-between border-t border-slate-50 pt-[14px]">
          <div className="flex items-center gap-2">{filters}</div>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      )}
    </div>
  );
}
