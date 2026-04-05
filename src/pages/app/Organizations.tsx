import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useCompany } from '../../context/CompanyContext';
import { supabase } from '../../../supabase/client';

interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  organization: string;
}

interface OrgGroup {
  name: string;
  contacts: Contact[];
}

export function Organizations() {
  const { activeCompanyId } = useCompany();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!activeCompanyId) return;

    async function fetchContacts() {
      setLoading(true);
      setError(null);

      const { data, error: contactsError } = await supabase
        .from('company_contacts')
        .select('id, first_name, last_name, title, email, phone, company_organization')
        .eq('company_id', activeCompanyId!)
        .order('last_name');

      if (contactsError) {
        setError('Could not load contacts.');
        setLoading(false);
        return;
      }

      const mapped: Contact[] = (data ?? []).map((c) => ({
        id: c.id,
        name: [c.first_name, c.last_name].filter(Boolean).join(' ') || '—',
        title: c.title ?? '',
        email: c.email ?? '',
        phone: c.phone ?? '',
        organization: c.company_organization?.trim() || '',
      }));

      setContacts(mapped);
      setLoading(false);
    }

    fetchContacts();
  }, [activeCompanyId]);

  // Group contacts by organization; blanks go under "Unaffiliated"
  const orgGroups = useMemo<OrgGroup[]>(() => {
    const map = new Map<string, Contact[]>();

    for (const contact of contacts) {
      const key = contact.organization || 'Unaffiliated';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(contact);
    }

    // Sort: named orgs alphabetically, "Unaffiliated" last
    const entries = Array.from(map.entries());
    entries.sort(([a], [b]) => {
      if (a === 'Unaffiliated') return 1;
      if (b === 'Unaffiliated') return -1;
      return a.localeCompare(b);
    });

    return entries.map(([name, orgContacts]) => ({ name, contacts: orgContacts }));
  }, [contacts]);

  function toggleOrg(name: string) {
    setExpandedOrgs((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  const namedOrgCount = orgGroups.filter((g) => g.name !== 'Unaffiliated').length;

  return (
    <>
      <PageHeader
        title="Organizations"
        stats={
          loading
            ? 'Loading...'
            : `${namedOrgCount} organization${namedOrgCount !== 1 ? 's' : ''} · ${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`
        }
      />

      <div className="p-5">
        {loading && (
          <div className="flex h-32 items-center justify-center text-[12px] text-slate-400">
            Loading organizations...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-[12px] text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && orgGroups.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-center">
            <div className="text-[13px] font-medium text-slate-700">No organizations yet</div>
            <div className="text-[11px] text-slate-400">Organizations are derived from your contacts.</div>
          </div>
        )}

        {!loading && !error && orgGroups.length > 0 && (
          <div className="space-y-2">
            {orgGroups.map((org) => {
              const isOpen = expandedOrgs.has(org.name);
              return (
                <div
                  key={org.name}
                  className="rounded-lg border border-slate-200 bg-white overflow-hidden"
                >
                  {/* Org header — clickable to expand/collapse */}
                  <button
                    onClick={() => toggleOrg(org.name)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[11px] text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                      >
                        ▶
                      </span>
                      <span className="text-[13px] font-semibold text-slate-900">{org.name}</span>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                      {org.contacts.length} {org.contacts.length === 1 ? 'contact' : 'contacts'}
                    </span>
                  </button>

                  {/* Expanded people list */}
                  {isOpen && (
                    <div className="border-t border-slate-100">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">Name</th>
                            <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">Title</th>
                            <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">Email</th>
                            <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400">Phone</th>
                          </tr>
                        </thead>
                        <tbody>
                          {org.contacts.map((contact, i) => (
                            <tr
                              key={contact.id}
                              className={`border-t border-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                            >
                              <td className="px-4 py-2.5 text-[12px] font-medium text-slate-900">{contact.name}</td>
                              <td className="px-4 py-2.5 text-[12px] text-slate-600">{contact.title || '—'}</td>
                              <td className="px-4 py-2.5 text-[12px] text-slate-600">{contact.email || '—'}</td>
                              <td className="px-4 py-2.5 text-[12px] text-slate-600">{contact.phone || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
