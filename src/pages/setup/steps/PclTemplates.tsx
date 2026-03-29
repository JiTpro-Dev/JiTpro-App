// src/pages/setup/steps/PclTemplates.tsx
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { PclTemplate } from '../setupTypes';

interface PclTemplatesProps {
  templates: PclTemplate[];
}

function getBadgeColor(name: string): string {
  if (name === 'Simple') return 'bg-green-100 text-green-700';
  if (name === 'Standard') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function TemplateCard({ template }: { template: PclTemplate }) {
  const [expanded, setExpanded] = useState(false);
  const totalDays = template.tasks.reduce((sum, t) => sum + t.days, 0);

  return (
    <div className="rounded-lg border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-bold text-slate-900">{template.name}</h3>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getBadgeColor(template.name)}`}>
          {template.reviewRounds} review round{template.reviewRounds !== 1 ? 's' : ''}
        </span>
      </div>
      <p className="text-xs text-slate-600">{template.description}</p>
      <p className="mt-1 text-xs italic text-slate-500">{template.examples}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-700">Total: {totalDays} working days</span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          {expanded ? 'Hide' : 'View'} durations
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>
      {expanded && (
        <div className="mt-3 border-t border-slate-100 pt-3 space-y-1">
          {template.tasks.map((task) => (
            <div key={task.name} className="flex items-center justify-between text-xs">
              <span className="text-slate-600">{task.name}</span>
              <span className="text-slate-900 font-medium">{task.days} days</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PclTemplates({ templates }: PclTemplatesProps) {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Procurement Templates</h2>
        <p className="mt-1 text-sm text-slate-600">
          JiTpro includes default procurement templates based on complexity level. You can customize these later from Company Settings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard key={template.name} template={template} />
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        These templates are starting points. You can customize durations, add templates, or modify tasks later from Company Settings.
      </p>
    </>
  );
}
