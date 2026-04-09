import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useCompany } from '../../context/CompanyContext';
import { useProject } from '../../context/ProjectContext';
import { supabase } from '../../../supabase/client';
import { Plus, X, EyeOff, Eye, UserCog, ChevronRight, Building2, Users } from 'lucide-react';
import { ContactDetailModal } from '../../components/ContactDetailModal';

// A project team member — references a person in the unified people table
interface TeamMember {
  id: string; // project_members.id
  person_id: string;
  person_name: string;
  email: string;
  phone: string;
  title: string;
  organization: string;
  person_type: 'Internal' | 'External';
  role_label: string;
  project_role: string | null;
  is_active: boolean;
}

// A directory person available for assignment
interface DirectoryPerson {
  id: string;
  source: 'user' | 'contact';
  name: string;
  email: string;
  organization: string;
  person_type: 'Internal' | 'External';
  role_label: string;
}

type SortKey = 'person_name' | 'organization' | 'person_type' | 'role_label' | 'project_role';
type SortDir = 'asc' | 'desc';
type ViewMode = 'contact' | 'company';

const PROJECT_ROLES = [
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'project_engineer', label: 'Project Engineer' },
  { value: 'superintendent', label: 'Superintendent' },
  { value: 'foreman', label: 'Foreman' },
  { value: 'read_only', label: 'Read Only' },
];

export function Team() {
  const { activeCompanyId, activeCompany } = useCompany();
  const { projectId } = useProject();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('person_name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showInactive, setShowInactive] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'Internal' | 'External'>('all');
  const [filterOrg, setFilterOrg] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('contact');
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

  // Add member modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [directory, setDirectory] = useState<DirectoryPerson[]>([]);
  const [dirSearch, setDirSearch] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<DirectoryPerson | null>(null);
  const [selectedRole, setSelectedRole] = useState('project_engineer');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // View contact detail
  const [viewingMember, setViewingMember] = useState<TeamMember | null>(null);

  // Deactivate confirmation
  const [deactivatingMember, setDeactivatingMember] = useState<TeamMember | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  async function fetchMembers() {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    // Fetch project_members with person_id
    const { data: memberRows, error: fetchError } = await supabase
      .from('project_members')
      .select('id, person_id, project_role, is_active')
      .eq('project_id', projectId);

    if (fetchError) {
      setError('Could not load team members.');
      setLoading(false);
      return;
    }

    const rows = memberRows ?? [];
    const personIds = rows.filter((r) => r.person_id).map((r) => r.person_id!);

    // Fetch person details from unified directory view (includes company name)
    const { data: peopleData } = personIds.length > 0
      ? await supabase
          .from('directory_people')
          .select('person_id, first_name, last_name, email, phone, title, person_type, contact_type, role_label, organization_name')
          .in('person_id', personIds)
      : { data: [] as any[] };

    const peopleMap = new Map((peopleData ?? []).map((p: any) => [p.person_id, p]));

    const gcName = activeCompany?.display_name || activeCompany?.legal_name || '';
    const mapped: TeamMember[] = rows.map((row) => {
      const person = row.person_id ? peopleMap.get(row.person_id) : null;
      const isInternal = !person?.organization_name;

      return {
        id: row.id,
        person_id: row.person_id,
        person_name: person
          ? [person.first_name, person.last_name].filter(Boolean).join(' ')
          : '(Unknown)',
        email: person?.email ?? '',
        phone: person?.phone ?? '',
        title: person?.title ?? '',
        organization: person?.organization_name ?? gcName,
        person_type: isInternal ? 'Internal' : 'External',
        role_label: person?.role_label ?? '',
        project_role: row.project_role,
        is_active: row.is_active,
      };
    });

    setMembers(mapped);
    setLoading(false);
  }

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  // Unique companies for filter dropdown
  const organizations = useMemo(() => {
    const orgs = new Set(members.map((m) => m.organization).filter(Boolean));
    return Array.from(orgs).sort();
  }, [members]);

  // Filter and sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return members
      .filter((m) => showInactive || m.is_active)
      .filter((m) => filterType === 'all' || m.person_type === filterType)
      .filter((m) => filterOrg === 'all' || m.organization === filterOrg)
      .filter(
        (m) =>
          m.person_name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.organization.toLowerCase().includes(q),
      );
  }, [members, search, showInactive, filterType, filterOrg]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // Grouped by company (for company view)
  const groupedByCompany = useMemo(() => {
    const map = new Map<string, TeamMember[]>();
    for (const m of filtered) {
      const key = m.organization || '(Unknown)';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    // Sort members within each group by name
    const entries = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    for (const [, members] of entries) {
      members.sort((a, b) => a.person_name.localeCompare(b.person_name));
    }
    return entries;
  }, [filtered]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function SortIndicator({ col }: { col: SortKey }) {
    if (col !== sortKey) return <span className="ml-1 text-slate-300">{'\u2195'}</span>;
    return <span className="ml-1 text-slate-600">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>;
  }

  function toggleCompanyGroup(companyName: string) {
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(companyName)) next.delete(companyName);
      else next.add(companyName);
      return next;
    });
  }

  // --- Add member ---

  async function openAddModal() {
    if (!activeCompanyId) return;
    setShowAddModal(true);
    setDirSearch('');
    setSelectedPerson(null);
    setSelectedRole('project_engineer');
    setAddError(null);

    // Fetch all active people from company directory (unified view)
    const { data, error: dirError } = await supabase
      .from('directory_people')
      .select('person_id, person_type, first_name, last_name, email, phone, title, role_label, contact_type, organization_name')
      .eq('company_id', activeCompanyId)
      .eq('is_active', true)
      .order('last_name', { ascending: true });

    if (dirError) {
      setAddError('Could not load directory.');
      setDirectory([]);
      return;
    }

    const companyName = activeCompany?.display_name || activeCompany?.legal_name || '';
    const allPeople: DirectoryPerson[] = (data ?? []).map((p) => ({
      id: p.person_id,
      source: p.person_type as 'user' | 'contact',
      name: [p.first_name, p.last_name].filter(Boolean).join(' '),
      email: p.email ?? '',
      organization: p.organization_name ?? companyName,
      person_type: !p.organization_name ? 'Internal' : 'External',
      role_label: p.role_label ?? '',
    }));

    // Exclude people already on the project (active or inactive)
    const existingPersonIds = new Set(members.map((m) => m.person_id));

    const available = allPeople.filter((p) => !existingPersonIds.has(p.id));

    setDirectory(available);
  }

  const filteredDirectory = useMemo(() => {
    const q = dirSearch.toLowerCase();
    if (!q) return directory;
    return directory.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.organization.toLowerCase().includes(q),
    );
  }, [directory, dirSearch]);

  async function handleAddMember() {
    if (!selectedPerson || !projectId) return;
    setAdding(true);
    setAddError(null);

    const payload: Record<string, unknown> = {
      project_id: projectId,
      project_role: selectedRole,
      is_active: true,
      person_id: selectedPerson.id,
    };

    const { error: insertError } = await supabase
      .from('project_members')
      .insert(payload);

    if (insertError) {
      setAddError('Could not add team member.');
      setAdding(false);
      return;
    }

    setAdding(false);
    setShowAddModal(false);
    fetchMembers();
  }

  // --- Deactivate / Reactivate ---

  async function handleDeactivate() {
    if (!deactivatingMember) return;
    setDeactivating(true);

    const { error: updateError } = await supabase
      .from('project_members')
      .update({ is_active: false })
      .eq('id', deactivatingMember.id);

    if (updateError) {
      setError('Could not deactivate team member.');
    }

    setDeactivating(false);
    setDeactivatingMember(null);
    fetchMembers();
  }

  async function handleReactivate(member: TeamMember) {
    const { error: updateError } = await supabase
      .from('project_members')
      .update({ is_active: true })
      .eq('id', member.id);

    if (updateError) {
      setError('Could not reactivate team member.');
      return;
    }

    fetchMembers();
  }

  // --- Role change ---

  async function handleRoleChange(memberId: string, newRole: string) {
    const { error: updateError } = await supabase
      .from('project_members')
      .update({ project_role: newRole })
      .eq('id', memberId);

    if (updateError) {
      setError('Could not update role.');
      return;
    }

    fetchMembers();
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: 'person_name', label: 'Name' },
    { key: 'organization', label: 'Company' },
    { key: 'person_type', label: 'Type' },
    { key: 'role_label', label: 'Directory Role' },
    { key: 'project_role', label: 'Project Role' },
  ];

  const activeCount = members.filter((m) => m.is_active).length;
  const inactiveCount = members.filter((m) => !m.is_active).length;

  // --- Render helpers ---

  function MemberActions({ member }: { member: TeamMember }) {
    return member.is_active ? (
      <button
        onClick={() => setDeactivatingMember(member)}
        className="rounded p-1 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
        title="Deactivate"
      >
        <EyeOff size={14} />
      </button>
    ) : (
      <button
        onClick={() => handleReactivate(member)}
        className="rounded p-1 text-slate-400 transition hover:bg-green-50 hover:text-green-600"
        title="Reactivate"
      >
        <Eye size={14} />
      </button>
    );
  }

  function ProjectRoleSelect({ member }: { member: TeamMember }) {
    return (
      <select
        value={member.project_role ?? ''}
        onChange={(e) => handleRoleChange(member.id, e.target.value)}
        className="rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-700 focus:border-slate-400 focus:outline-none"
      >
        <option value="">— None —</option>
        {PROJECT_ROLES.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
    );
  }

  return (
    <>
      <PageHeader
        title="Team"
        stats={
          loading
            ? 'Loading...'
            : `${activeCount} active member${activeCount !== 1 ? 's' : ''}${inactiveCount > 0 ? ` \u00b7 ${inactiveCount} inactive` : ''}`
        }
        filters={
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex rounded-md border border-slate-200">
              <button
                onClick={() => setViewMode('contact')}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium transition ${
                  viewMode === 'contact'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:text-slate-700'
                } rounded-l-md`}
                title="View by contact"
              >
                <Users size={12} />
                Contact
              </button>
              <button
                onClick={() => setViewMode('company')}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium transition ${
                  viewMode === 'company'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:text-slate-700'
                } rounded-r-md`}
                title="View by company"
              >
                <Building2 size={12} />
                Company
              </button>
            </div>
            <input
              type="text"
              placeholder="Search name, email, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-[12px] text-slate-700 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="rounded-md border border-slate-200 px-2 py-1.5 text-[12px] text-slate-700 focus:border-slate-400 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="Internal">Internal</option>
              <option value="External">External</option>
            </select>
            {organizations.length > 0 && (
              <select
                value={filterOrg}
                onChange={(e) => setFilterOrg(e.target.value)}
                className="rounded-md border border-slate-200 px-2 py-1.5 text-[12px] text-slate-700 focus:border-slate-400 focus:outline-none"
              >
                <option value="all">All Companies</option>
                {organizations.map((org) => (
                  <option key={org} value={org}>{org}</option>
                ))}
              </select>
            )}
            {inactiveCount > 0 && (
              <button
                onClick={() => setShowInactive(!showInactive)}
                className={`flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition ${
                  showInactive
                    ? 'border-slate-400 bg-slate-100 text-slate-700'
                    : 'border-slate-200 text-slate-400 hover:text-slate-600'
                }`}
              >
                {showInactive ? <Eye size={12} /> : <EyeOff size={12} />}
                {showInactive ? 'Showing inactive' : 'Show inactive'}
              </button>
            )}
          </div>
        }
        actions={
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-slate-700"
          >
            <Plus size={14} />
            Add Member
          </button>
        }
      />

      <div className="p-5">
        {loading && (
          <div className="flex h-32 items-center justify-center text-[12px] text-slate-400">
            Loading team...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-[12px] text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && members.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-center">
            <UserCog size={24} className="text-slate-300" />
            <div className="text-[13px] font-medium text-slate-700">No team members yet</div>
            <div className="text-[11px] text-slate-400">Add people from your company directory to this project.</div>
            <button
              onClick={openAddModal}
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-slate-700"
            >
              <Plus size={14} />
              Add Member
            </button>
          </div>
        )}

        {/* Contact view — flat table */}
        {!loading && !error && members.length > 0 && viewMode === 'contact' && (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="cursor-pointer select-none px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500 hover:text-slate-700"
                    >
                      {col.label}
                      <SortIndicator col={col.key} />
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[12px] text-slate-400">
                      No results match your filters.
                    </td>
                  </tr>
                ) : (
                  sorted.map((member, i) => (
                    <tr
                      key={member.id}
                      className={`border-b border-slate-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                    >
                      <td className="px-4 py-3 text-[12px] font-medium text-slate-900">
                        <button
                          onClick={() => setViewingMember(member)}
                          className="text-left hover:text-amber-600 hover:underline"
                        >
                          {member.person_name}
                        </button>
                        {!member.is_active && (
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{member.organization}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            member.person_type === 'Internal'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {member.person_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{member.role_label || '\u2014'}</td>
                      <td className="px-4 py-3">
                        <ProjectRoleSelect member={member} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <MemberActions member={member} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Company view — grouped by company */}
        {!loading && !error && members.length > 0 && viewMode === 'company' && (
          <div className="space-y-3">
            {groupedByCompany.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-[12px] text-slate-400">
                No results match your filters.
              </div>
            ) : (
              groupedByCompany.map(([companyName, companyMembers]) => {
                const isOpen = expandedCompanies.has(companyName);
                return (
                  <div key={companyName} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                    {/* Company header row */}
                    <button
                      onClick={() => toggleCompanyGroup(companyName)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <ChevronRight
                          size={14}
                          className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                        />
                        <span className="text-[13px] font-semibold text-slate-900">{companyName}</span>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        {companyMembers.length} {companyMembers.length === 1 ? 'member' : 'members'}
                      </span>
                    </button>

                    {/* Expanded member list */}
                    {isOpen && (
                      <div className="border-t border-slate-100">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50">
                              <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">Name</th>
                              <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">Type</th>
                              <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">Directory Role</th>
                              <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">Project Role</th>
                              <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {companyMembers.map((member, i) => (
                              <tr
                                key={member.id}
                                className={`border-t border-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                              >
                                <td className="px-4 py-2.5 text-[12px] font-medium text-slate-900">
                                  <button
                                    onClick={() => setViewingMember(member)}
                                    className="text-left hover:text-amber-600 hover:underline"
                                  >
                                    {member.person_name}
                                  </button>
                                  {!member.is_active && (
                                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                                      Inactive
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5">
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                      member.person_type === 'Internal'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}
                                  >
                                    {member.person_type}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-[12px] text-slate-600">{member.role_label || '\u2014'}</td>
                                <td className="px-4 py-2.5">
                                  <ProjectRoleSelect member={member} />
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  <MemberActions member={member} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-slate-800">Add Team Member</h3>
              <button onClick={() => setShowAddModal(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            {/* Search directory */}
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={dirSearch}
              onChange={(e) => setDirSearch(e.target.value)}
              className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />

            {/* Directory list */}
            <div className="mb-4 max-h-56 overflow-y-auto rounded-lg border border-slate-200">
              {filteredDirectory.length === 0 ? (
                <div className="px-4 py-6 text-center text-[12px] text-slate-400">
                  {directory.length === 0 ? 'All directory members are already on this project.' : 'No results match your search.'}
                </div>
              ) : (
                filteredDirectory.map((person) => (
                  <button
                    key={`${person.source}-${person.id}`}
                    onClick={() => setSelectedPerson(person)}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition border-b border-slate-100 last:border-0 ${
                      selectedPerson?.id === person.id && selectedPerson?.source === person.source
                        ? 'bg-amber-50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-[12px] font-medium text-slate-900">{person.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {[person.organization, person.email].filter(Boolean).join(' \u00b7 ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {person.role_label && (
                        <span className="text-[10px] text-slate-400">{person.role_label}</span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          person.person_type === 'Internal'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {person.person_type}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Project role selector */}
            {selectedPerson && (
              <div className="mb-4">
                <label className="mb-1 block text-[12px] font-medium text-slate-600">
                  Project Role for {selectedPerson.name}
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  {PROJECT_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            )}

            {addError && (
              <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">
                {addError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleAddMember}
                disabled={!selectedPerson || adding}
                className="rounded-lg bg-slate-800 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {adding ? 'Adding...' : 'Add to Project'}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-slate-300 px-5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {deactivatingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-[15px] font-semibold text-slate-800">Deactivate Team Member</h3>
            <p className="mb-4 text-[13px] text-slate-600">
              Remove <span className="font-medium">{deactivatingMember.person_name}</span> from the active project team? They can be reactivated later.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeactivate}
                disabled={deactivating}
                className="rounded-lg bg-amber-600 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-amber-700 disabled:opacity-40"
              >
                {deactivating ? 'Deactivating...' : 'Deactivate'}
              </button>
              <button
                onClick={() => setDeactivatingMember(null)}
                className="rounded-lg border border-slate-300 px-5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Detail Modal (read-only at project level) */}
      {viewingMember && (
        <ContactDetailModal
          contact={{
            name: viewingMember.person_name,
            title: viewingMember.title,
            email: viewingMember.email,
            phone: viewingMember.phone,
            role: viewingMember.role_label,
            company: viewingMember.organization,
          }}
          onClose={() => setViewingMember(null)}
        />
      )}
    </>
  );
}
