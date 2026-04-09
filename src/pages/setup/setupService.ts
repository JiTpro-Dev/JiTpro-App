// src/pages/setup/setupService.ts
// All Supabase calls for the company setup wizard.
// Each function saves one step's data to the database.

import { supabase } from '../../../supabase/client';
import type { CompanyProfileData } from './steps/CompanyProfile';
import type { CompanyAdminData } from './steps/CompanyAdmin';
import type { Holiday, WorkWeek, ContactRow, CostCodeNode, PclTemplate } from './setupTypes';

// Step 1: Create or update the company using the security definer function.
// This bypasses RLS for the initial setup (chicken-and-egg problem).
// The function also creates the primary admin user record if it doesn't exist.
export async function saveCompanyProfile(
  data: CompanyProfileData,
  existingCompanyId?: string | null
): Promise<string> {
  const params: Record<string, unknown> = {
    p_legal_name: data.legalName,
    p_display_name: data.displayName || null,
    p_address: data.address || null,
    p_city: data.city || null,
    p_state: data.state || null,
    p_zip: data.zip || null,
    p_license_number: data.licenseNumber || null,
    p_states_licensed_in: data.statesLicensedIn,
    p_company_phone: data.companyPhone || null,
    p_company_email: data.companyEmail || null,
    p_website: data.website || null,
    p_timezone: data.timezone,
  };

  if (existingCompanyId) {
    params.p_company_id = existingCompanyId;
  }

  const { data: companyId, error } = await supabase.rpc('setup_company', params);

  if (error) throw new Error(`Failed to save company: ${error.message}`);
  return companyId;
}

// Step 2: Save admin info (update the primary admin user record + optional secondary)
export async function saveCompanyAdmin(
  companyId: string,
  authUserId: string,
  data: CompanyAdminData
): Promise<void> {
  // Update the primary admin record created in step 1 (scoped to this company)
  const { error: adminError } = await supabase
    .from('people')
    .update({
      first_name: data.adminFirstName,
      last_name: data.adminLastName,
      title: data.adminTitle || null,
      email: data.adminEmail,
      phone: data.adminPhone || null,
    })
    .eq('auth_id', authUserId)
    .eq('company_id', companyId)
    .eq('person_type', 'user');

  if (adminError) throw new Error(`Failed to save admin: ${adminError.message}`);

  // Handle secondary admin
  if (data.addSecondaryAdmin && data.secondaryEmail) {
    // Check if secondary already exists
    const { data: existing } = await supabase
      .from('people')
      .select('id')
      .eq('company_id', companyId)
      .eq('person_type', 'user')
      .eq('role', 'admin')
      .eq('email', data.secondaryEmail)
      .maybeSingle();

    if (existing) {
      // Update existing secondary admin
      await supabase
        .from('people')
        .update({
          first_name: data.secondaryFirstName,
          last_name: data.secondaryLastName,
          title: data.secondaryTitle || null,
          phone: data.secondaryPhone || null,
        })
        .eq('id', existing.id);
    } else {
      // Insert new secondary admin (no auth_id yet — they'll get an invite)
      await supabase
        .from('people')
        .insert({
          company_id: companyId,
          first_name: data.secondaryFirstName,
          last_name: data.secondaryLastName,
          title: data.secondaryTitle || null,
          email: data.secondaryEmail,
          phone: data.secondaryPhone || null,
          person_type: 'user',
          contact_type: 'internal',
          role: 'admin',
          is_active: true,
        });
    }
  }
}

// Step 3: Save work week and holidays
export async function saveCompanyCalendar(
  companyId: string,
  workWeek: WorkWeek,
  holidays: Holiday[]
): Promise<void> {
  // Upsert work week (one row per company)
  const { error: wwError } = await supabase
    .from('company_work_weeks')
    .upsert({
      company_id: companyId,
      monday: workWeek.monday,
      tuesday: workWeek.tuesday,
      wednesday: workWeek.wednesday,
      thursday: workWeek.thursday,
      friday: workWeek.friday,
      saturday: workWeek.saturday,
      sunday: workWeek.sunday,
    }, { onConflict: 'company_id' });

  if (wwError) throw new Error(`Failed to save work week: ${wwError.message}`);

  // Delete existing holidays for this company and re-insert
  await supabase
    .from('company_holidays')
    .delete()
    .eq('company_id', companyId);

  if (holidays.length > 0) {
    const holidayRows = holidays.map((h, i) => ({
      company_id: companyId,
      name: h.name,
      date_description: h.dateDescription,
      is_recurring: h.isRecurring,
      is_active: h.isActive,
      is_default: h.isDefault,
      sort_order: i,
    }));

    const { error: hError } = await supabase
      .from('company_holidays')
      .insert(holidayRows);

    if (hError) throw new Error(`Failed to save holidays: ${hError.message}`);
  }
}

// Step 4: Save company contacts (writes to people + organizations tables)
export async function saveCompanyContacts(
  companyId: string,
  contacts: ContactRow[]
): Promise<{ warnings: string[] }> {
  const warnings: string[] = [];
  const validContacts = contacts.filter((c) => c.first_name && c.last_name);

  // --- 1. Build organization map from contacts ---
  // Collect unique org names from external contacts
  const orgNames = new Map<string, string>(); // normalized name → org_type
  for (const c of validContacts) {
    if (!c.company_organization || c.contact_type === 'internal') continue;
    const name = c.company_organization.trim();
    if (!name) continue;
    const normalizedName = name.toLowerCase();
    if (!orgNames.has(normalizedName)) {
      orgNames.set(normalizedName, c.org_type || 'subcontractor');
    }
  }

  // --- 2. Fetch existing organizations for this company ---
  const { data: existingOrgs } = await supabase
    .from('organizations')
    .select('id, name, org_type')
    .eq('company_id', companyId);

  const existingOrgMap = new Map<string, { id: string; name: string; org_type: string | null }>();
  for (const org of existingOrgs ?? []) {
    existingOrgMap.set(org.name.toLowerCase(), org);
  }

  // --- 3. Create or match organizations ---
  // Maps normalized org name → organization id
  const orgIdMap = new Map<string, string>();

  for (const [normalizedName, importedOrgType] of orgNames) {
    const existing = existingOrgMap.get(normalizedName);

    if (existing) {
      orgIdMap.set(normalizedName, existing.id);

      // Update org_type if currently NULL
      if (!existing.org_type && importedOrgType) {
        await supabase
          .from('organizations')
          .update({ org_type: importedOrgType })
          .eq('id', existing.id);
      } else if (existing.org_type && importedOrgType && existing.org_type !== importedOrgType) {
        // Conflict: existing org_type differs from imported — surface warning
        warnings.push(
          `"${existing.name}" already has type "${existing.org_type}" — imported type "${importedOrgType}" was ignored.`
        );
      }
    } else {
      // Find the original-case name from contacts
      const originalName = validContacts.find(
        (c) => c.company_organization.trim().toLowerCase() === normalizedName
      )?.company_organization.trim() || normalizedName;

      const { data: inserted, error: insertError } = await supabase
        .from('organizations')
        .insert({
          company_id: companyId,
          name: originalName,
          org_type: importedOrgType || null,
          is_active: true,
        })
        .select('id')
        .single();

      if (insertError) {
        warnings.push(`Could not create organization "${originalName}": ${insertError.message}`);
      } else {
        orgIdMap.set(normalizedName, inserted.id);
      }
    }
  }

  // --- 4. Delete existing contact-type people and re-insert ---
  await supabase
    .from('people')
    .delete()
    .eq('company_id', companyId)
    .eq('person_type', 'contact');

  if (validContacts.length > 0) {
    const contactRows = validContacts.map((c) => {
      // Resolve organization_id by matching org name
      let organizationId: string | null = null;
      if (c.company_organization && c.contact_type !== 'internal') {
        const normalizedName = c.company_organization.trim().toLowerCase();
        organizationId = orgIdMap.get(normalizedName) ?? null;
      }

      return {
        company_id: companyId,
        first_name: c.first_name,
        last_name: c.last_name,
        title: c.title || null,
        company_organization: c.company_organization || null,
        email: c.email || null,
        phone: c.phone || null,
        address: c.address || null,
        person_type: 'contact' as const,
        contact_type: c.contact_type || null,
        role_category: c.role_category || null,
        notes: c.notes || null,
        organization_id: organizationId,
        is_active: true,
      };
    });

    const { error } = await supabase
      .from('people')
      .insert(contactRows);

    if (error) throw new Error(`Failed to save contacts: ${error.message}`);
  }

  return { warnings };
}

// Step 5: Save cost codes and preferences
export async function saveCostCodes(
  companyId: string,
  costCodes: CostCodeNode[],
  showNumbers: boolean
): Promise<void> {
  // Update company preferences
  await supabase
    .from('companies')
    .update({ show_cost_code_numbers: showNumbers })
    .eq('id', companyId);

  // Delete existing cost codes and re-insert
  await supabase
    .from('cost_codes')
    .delete()
    .eq('company_id', companyId);

  if (costCodes.length > 0) {
    // Cost codes have parent references, so we need to insert in order
    // and map old IDs to new UUIDs
    const idMap = new Map<string, string>();

    for (const cc of costCodes) {
      const parentId = cc.parentId ? idMap.get(cc.parentId) ?? null : null;

      const { data: inserted, error } = await supabase
        .from('cost_codes')
        .insert({
          company_id: companyId,
          code: cc.code,
          title: cc.title,
          level: cc.level,
          parent_id: parentId,
          sort_order: cc.sortOrder,
        })
        .select('id')
        .single();

      if (error) throw new Error(`Failed to save cost code ${cc.code}: ${error.message}`);
      idMap.set(cc.id, inserted.id);
    }
  }
}

// Step 6: Save PCL templates and mark setup complete
export async function savePclTemplatesAndComplete(
  companyId: string,
  templates: PclTemplate[]
): Promise<void> {
  // Delete existing templates and re-insert
  await supabase
    .from('pcl_templates')
    .delete()
    .eq('company_id', companyId);

  for (let i = 0; i < templates.length; i++) {
    const t = templates[i];

    const { data: inserted, error: tError } = await supabase
      .from('pcl_templates')
      .insert({
        company_id: companyId,
        name: t.name,
        description: t.description || null,
        examples: t.examples || null,
        review_rounds: t.reviewRounds,
        sort_order: i,
      })
      .select('id')
      .single();

    if (tError) throw new Error(`Failed to save template ${t.name}: ${tError.message}`);

    if (t.tasks.length > 0) {
      const taskRows = t.tasks.map((task, j) => ({
        template_id: inserted.id,
        name: task.name,
        default_days: task.days,
        sort_order: j,
      }));

      const { error: taskError } = await supabase
        .from('pcl_template_tasks')
        .insert(taskRows);

      if (taskError) throw new Error(`Failed to save template tasks: ${taskError.message}`);
    }
  }

  // Mark setup as complete
  await supabase
    .from('companies')
    .update({
      setup_completed: true,
      setup_completed_at: new Date().toISOString(),
    })
    .eq('id', companyId);
}
