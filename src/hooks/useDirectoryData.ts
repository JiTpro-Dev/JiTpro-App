import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCompany } from '../context/CompanyContext';
import { supabase } from '../../supabase/client';

// ---------------------------------------------------------------------------
// Company Types (v06 locked)
// ---------------------------------------------------------------------------

export const COMPANY_TYPES = [
  'owner',
  'architect',
  'engineer',
  'designer',
  'consultant',
  'subcontractor',
  'supplier',
  'other',
] as const;

export type CompanyType = (typeof COMPANY_TYPES)[number];

// ---------------------------------------------------------------------------
// UI Group mapping (cd_mapping_v06 §7.2)
// ---------------------------------------------------------------------------

export const UI_GROUPS = [
  'Owner',
  'Design Team',
  'Consultants',
  'Trade Partners',
  'Suppliers',
] as const;

export type UIGroup = (typeof UI_GROUPS)[number];

const COMPANY_TYPE_TO_GROUP: Record<CompanyType, UIGroup> = {
  owner: 'Owner',
  architect: 'Design Team',
  engineer: 'Design Team',
  designer: 'Design Team',
  consultant: 'Consultants',
  other: 'Consultants',
  subcontractor: 'Trade Partners',
  supplier: 'Suppliers',
};

export function companyTypeToGroup(type: CompanyType | string): UIGroup {
  return COMPANY_TYPE_TO_GROUP[type as CompanyType] ?? 'Consultants';
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A contact nested under a company in the directory. */
export interface DirectoryContact {
  personId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  roleLabel: string;
  contactType: string; // 'internal' | 'external'
  personType: string;  // 'user' | 'contact'
  isActive: boolean;
}

/** A company (organization) row in the directory table. */
export interface DirectoryCompany {
  id: string;
  name: string;
  companyType: CompanyType | null;
  companyTypeLabel: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  notes: string;
  isActive: boolean;
  contacts: DirectoryContact[];
  contactCount: number;
  primaryContact: DirectoryContact | null;
}

/** One UI group containing its companies. */
export interface DirectoryGroup {
  group: UIGroup;
  companies: DirectoryCompany[];
}

/** Full return value from useDirectoryData. */
export interface DirectoryData {
  /** The internal GC company with its internal contacts. */
  internalCompany: DirectoryCompany | null;
  groups: DirectoryGroup[];
  allCompanies: DirectoryCompany[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ---------------------------------------------------------------------------
// Raw row shapes from Supabase
// ---------------------------------------------------------------------------

interface OrgRow {
  id: string;
  name: string;
  org_type: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
}

interface PersonRow {
  person_id: string;
  person_type: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  title: string | null;
  role_label: string | null;
  contact_type: string | null;
  organization_id: string | null;
  is_active: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COMPANY_TYPE_LABELS: Record<string, string> = {
  owner: 'Owner',
  architect: 'Architect',
  engineer: 'Engineer',
  designer: 'Designer',
  consultant: 'Consultant',
  subcontractor: 'Subcontractor',
  supplier: 'Supplier',
  other: 'Other',
};

function toContact(p: PersonRow): DirectoryContact {
  const first = p.first_name ?? '';
  const last = p.last_name ?? '';
  return {
    personId: p.person_id,
    firstName: first,
    lastName: last,
    name: [first, last].filter(Boolean).join(' ') || '\u2014',
    email: p.email ?? '',
    phone: p.phone ?? '',
    title: p.title ?? '',
    roleLabel: p.role_label ?? '',
    contactType: p.contact_type ?? '',
    personType: p.person_type ?? '',
    isActive: p.is_active,
  };
}

/**
 * Derive the primary contact for a company.
 * Rule: first active contact sorted by last_name, first_name.
 * Future: support a flagged `is_primary` column if added.
 */
function derivePrimaryContact(contacts: DirectoryContact[]): DirectoryContact | null {
  const active = contacts.filter((c) => c.isActive);
  if (active.length === 0) return null;
  return active.sort((a, b) =>
    (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName),
  )[0];
}

function toCompany(org: OrgRow, contacts: DirectoryContact[]): DirectoryCompany {
  const sorted = [...contacts].sort((a, b) =>
    (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName),
  );
  return {
    id: org.id,
    name: org.name,
    companyType: (org.org_type as CompanyType) ?? null,
    companyTypeLabel: org.org_type ? (COMPANY_TYPE_LABELS[org.org_type] ?? org.org_type) : '',
    contactEmail: org.contact_email ?? '',
    contactPhone: org.contact_phone ?? '',
    address: org.address ?? '',
    notes: org.notes ?? '',
    isActive: org.is_active,
    contacts: sorted,
    contactCount: sorted.length,
    primaryContact: derivePrimaryContact(sorted),
  };
}

function buildGroups(companies: DirectoryCompany[]): DirectoryGroup[] {
  const map = new Map<UIGroup, DirectoryCompany[]>();

  // Seed in display order so empty groups are omitted naturally
  for (const company of companies) {
    const group = company.companyType
      ? companyTypeToGroup(company.companyType)
      : 'Consultants'; // fallback for untyped (shouldn't happen for external)
    if (!map.has(group)) map.set(group, []);
    map.get(group)!.push(company);
  }

  // Sort companies within each group alphabetically
  for (const g of UI_GROUPS) {
    const list = map.get(g);
    if (list) list.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Return groups in v06 display order, skipping empty ones
  return UI_GROUPS
    .filter((g) => map.has(g))
    .map((g) => ({ group: g, companies: map.get(g)! }));
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDirectoryData(): DirectoryData {
  const { activeCompanyId, activeCompany } = useCompany();
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!activeCompanyId) {
      setOrgs([]);
      setPeople([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const [orgsRes, peopleRes] = await Promise.all([
      supabase
        .from('organizations')
        .select('id, name, org_type, contact_email, contact_phone, address, notes, is_active')
        .eq('company_id', activeCompanyId)
        .eq('is_active', true)
        .order('name'),
      supabase
        .from('directory_people')
        .select('person_id, person_type, first_name, last_name, email, phone, title, role_label, contact_type, organization_id, is_active')
        .eq('company_id', activeCompanyId)
        .eq('is_active', true),
    ]);

    if (orgsRes.error || peopleRes.error) {
      setError('Could not load directory data.');
      setLoading(false);
      return;
    }

    setOrgs(orgsRes.data ?? []);
    setPeople((peopleRes.data as PersonRow[]) ?? []);
    setLoading(false);
  }, [activeCompanyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -- Transform raw data into grouped directory structure --

  const { internalCompany, groups, allCompanies } = useMemo(() => {
    // Separate internal people (no org) from external people (has org)
    const internalContacts: DirectoryContact[] = [];
    const peopleByOrg = new Map<string, DirectoryContact[]>();

    for (const p of people) {
      if (!p.organization_id) {
        // Internal: belongs to the GC company directly (no org affiliation)
        internalContacts.push(toContact(p));
      } else {
        if (!peopleByOrg.has(p.organization_id)) peopleByOrg.set(p.organization_id, []);
        peopleByOrg.get(p.organization_id)!.push(toContact(p));
      }
    }

    // Synthesize the internal company from the active company context
    const gcName = activeCompany?.display_name || activeCompany?.legal_name || 'Company';
    const sortedInternal = [...internalContacts].sort((a, b) =>
      (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName),
    );
    const internalCompany: DirectoryCompany = {
      id: activeCompanyId ?? '',
      name: gcName,
      companyType: null,
      companyTypeLabel: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      notes: '',
      isActive: true,
      contacts: sortedInternal,
      contactCount: sortedInternal.length,
      primaryContact: derivePrimaryContact(sortedInternal),
    };

    // Build DirectoryCompany for each external org
    const externalCompanies = orgs.map((org) =>
      toCompany(org, peopleByOrg.get(org.id) ?? []),
    );

    // Group external companies by UI group
    const groups = buildGroups(externalCompanies);

    // allCompanies includes both internal + external for stats
    const allCompanies = [internalCompany, ...externalCompanies];

    return { internalCompany, groups, allCompanies };
  }, [orgs, people, activeCompanyId, activeCompany]);

  return { internalCompany, groups, allCompanies, loading, error, refetch: fetchData };
}
