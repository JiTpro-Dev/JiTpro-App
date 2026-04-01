// src/pages/setup/setupService.ts
// All Supabase calls for the company setup wizard.
// Each function saves one step's data to the database.

import { supabase } from '../../../supabase/client';
import type { CompanyProfileData } from './steps/CompanyProfile';
import type { CompanyAdminData } from './steps/CompanyAdmin';
import type { Holiday, WorkWeek, ContactRow, CostCodeNode, PclTemplate } from './setupTypes';

// Step 1: Create the company and the primary admin user record
export async function saveCompanyProfile(
  data: CompanyProfileData,
  authUserId: string
): Promise<string> {
  // Create company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({
      legal_name: data.legalName,
      display_name: data.displayName || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zip: data.zip || null,
      license_number: data.licenseNumber || null,
      states_licensed_in: data.statesLicensedIn,
      company_phone: data.companyPhone || null,
      company_email: data.companyEmail || null,
      website: data.website || null,
      timezone: data.timezone,
    })
    .select('id')
    .single();

  if (companyError) throw new Error(`Failed to save company: ${companyError.message}`);

  const companyId = company.id;

  // Create the primary admin user record (links auth user to company)
  const { error: userError } = await supabase
    .from('users')
    .insert({
      auth_id: authUserId,
      company_id: companyId,
      first_name: 'Admin',
      last_name: '(Setup)',
      email: 'pending@setup',
      role: 'primary_admin',
    });

  if (userError) throw new Error(`Failed to create user record: ${userError.message}`);

  return companyId;
}

// Step 1 (update): If company already exists, update it
export async function updateCompanyProfile(
  companyId: string,
  data: CompanyProfileData
): Promise<void> {
  const { error } = await supabase
    .from('companies')
    .update({
      legal_name: data.legalName,
      display_name: data.displayName || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zip: data.zip || null,
      license_number: data.licenseNumber || null,
      states_licensed_in: data.statesLicensedIn,
      company_phone: data.companyPhone || null,
      company_email: data.companyEmail || null,
      website: data.website || null,
      timezone: data.timezone,
    })
    .eq('id', companyId);

  if (error) throw new Error(`Failed to update company: ${error.message}`);
}

// Step 2: Save admin info (update the primary admin user record + optional secondary)
export async function saveCompanyAdmin(
  companyId: string,
  authUserId: string,
  data: CompanyAdminData
): Promise<void> {
  // Update the primary admin record created in step 1
  const { error: adminError } = await supabase
    .from('users')
    .update({
      first_name: data.adminFirstName,
      last_name: data.adminLastName,
      title: data.adminTitle || null,
      email: data.adminEmail,
      phone: data.adminPhone || null,
    })
    .eq('auth_id', authUserId);

  if (adminError) throw new Error(`Failed to save admin: ${adminError.message}`);

  // Handle secondary admin
  if (data.addSecondaryAdmin && data.secondaryEmail) {
    // Check if secondary already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('company_id', companyId)
      .eq('role', 'admin')
      .eq('email', data.secondaryEmail)
      .maybeSingle();

    if (existing) {
      // Update existing secondary admin
      await supabase
        .from('users')
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
        .from('users')
        .insert({
          company_id: companyId,
          first_name: data.secondaryFirstName,
          last_name: data.secondaryLastName,
          title: data.secondaryTitle || null,
          email: data.secondaryEmail,
          phone: data.secondaryPhone || null,
          role: 'admin',
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

// Step 4: Save company contacts
export async function saveCompanyContacts(
  companyId: string,
  contacts: ContactRow[]
): Promise<void> {
  // Delete existing and re-insert
  await supabase
    .from('company_contacts')
    .delete()
    .eq('company_id', companyId);

  if (contacts.length > 0) {
    const contactRows = contacts.map((c) => ({
      company_id: companyId,
      first_name: c.first_name,
      last_name: c.last_name,
      title: c.title || null,
      company_organization: c.company_organization || null,
      email: c.email || null,
      phone: c.phone || null,
      address: c.address || null,
      contact_type: c.contact_type || null,
      role_category: c.role_category || null,
      notes: c.notes || null,
    }));

    const { error } = await supabase
      .from('company_contacts')
      .insert(contactRows);

    if (error) throw new Error(`Failed to save contacts: ${error.message}`);
  }
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
