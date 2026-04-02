// src/pages/app/ProjectTemplates.tsx
import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../../supabase/client';

interface TemplateTask {
  id: string;
  task_name: string;
  default_days: number;
  sort_order: number;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  examples: string | null;
  review_rounds: number | null;
  tasks: TemplateTask[];
}

function TemplateCard({ template }: { template: Template }) {
  const [expanded, setExpanded] = useState(false);
  const totalDays = template.tasks.reduce((sum, t) => sum + (t.default_days ?? 0), 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-[14px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-[12px] font-bold text-slate-900">{template.name}</div>
        {template.review_rounds !== null && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
            {template.review_rounds} review round{template.review_rounds !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {template.description && (
        <p className="text-[11px] text-slate-600">{template.description}</p>
      )}
      {template.examples && (
        <p className="mt-1 text-[11px] italic text-slate-500">{template.examples}</p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-700">
          Total: {totalDays} working day{totalDays !== 1 ? 's' : ''}
        </span>
        {template.tasks.length > 0 && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 transition-colors"
          >
            {expanded ? 'Hide' : 'View'} tasks
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      {expanded && template.tasks.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-3 space-y-1">
          {template.tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600">{task.task_name}</span>
              <span className="font-medium text-slate-900">{task.default_days} days</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectTemplates() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);
      try {
        // Get company_id for this user
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('company_id')
          .eq('auth_id', user!.id)
          .single();

        if (userError || !userData?.company_id) {
          setLoading(false);
          return;
        }

        const companyId = userData.company_id;

        // Fetch templates
        const { data: templateRows, error: templateError } = await supabase
          .from('pcl_templates')
          .select('id, name, description, examples, review_rounds')
          .eq('company_id', companyId)
          .order('name', { ascending: true });

        if (templateError || !templateRows || templateRows.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch all tasks for these templates in one query
        const templateIds = templateRows.map((t) => t.id);
        const { data: taskRows } = await supabase
          .from('pcl_template_tasks')
          .select('id, template_id, task_name, default_days, sort_order')
          .in('template_id', templateIds)
          .order('sort_order', { ascending: true });

        // Group tasks by template_id
        const tasksByTemplate: Record<string, TemplateTask[]> = {};
        for (const task of taskRows ?? []) {
          if (!tasksByTemplate[task.template_id]) {
            tasksByTemplate[task.template_id] = [];
          }
          tasksByTemplate[task.template_id].push(task);
        }

        const combined: Template[] = templateRows.map((t) => ({
          ...t,
          tasks: tasksByTemplate[t.id] ?? [],
        }));

        setTemplates(combined);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const statsText =
    !loading && templates.length > 0
      ? `${templates.length} template${templates.length !== 1 ? 's' : ''}`
      : undefined;

  return (
    <>
      <PageHeader title="Project Templates" stats={statsText} />

      <div className="p-5">
        {loading ? (
          <div className="flex h-32 items-center justify-center rounded-lg border border-slate-200 bg-white">
            <span className="text-[12px] text-slate-400">Loading templates…</span>
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-[14px]">
            <p className="text-[12px] text-slate-500">
              No project templates configured. Set up templates in Company Settings.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
