import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';
import { supabase } from '../../../supabase/client';

const inputClass =
  'w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export function CreateProject() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeCompanyId } = useCompany();

  const [name, setName] = useState('');
  const [projectNumber, setProjectNumber] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    if (!user || !activeCompanyId) {
      setError('Missing user or company context.');
      return;
    }

    setSaving(true);
    setError(null);

    // Insert the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        company_id: activeCompanyId,
        name: name.trim(),
        project_number: projectNumber.trim() || null,
        description: description.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        zip: zip.trim() || null,
        status: 'active',
      })
      .select('id')
      .single();

    if (projectError || !project) {
      setError(projectError?.message ?? 'Failed to create project.');
      setSaving(false);
      return;
    }

    // Add current user as project manager
    // Look up the app-level user record scoped to this company
    const { data: appUser } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .eq('company_id', activeCompanyId)
      .maybeSingle();

    if (appUser) {
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: project.id,
          user_id: appUser.id,
          project_role: 'project_manager',
        });

      if (memberError) {
        console.error('Failed to add project member:', memberError.message);
      }
    }

    // Navigate into the project workspace
    navigate(`/app/project/${project.id}/home`);
  }

  return (
    <>
      <PageHeader
        title="Create New Project"
        actions={
          <button
            onClick={() => navigate('/app/projects')}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={14} />
            Back to Projects
          </button>
        }
      />

      <div className="p-5">
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-[12px] text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className={labelClass}>Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Downtown Office Tower"
              className={inputClass}
              autoFocus
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Project Number</label>
              <input
                type="text"
                value={projectNumber}
                onChange={(e) => setProjectNumber(e.target.value)}
                placeholder="e.g., PRJ-2026-001"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief project description"
              rows={3}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Street Address</label>
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
              <label className={labelClass}>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>ZIP Code</label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/app/projects')}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
