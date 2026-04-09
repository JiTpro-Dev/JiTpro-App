// src/pages/setup/SetupWizard.tsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SetupLayout } from '../../layouts/SetupLayout';
import { CompanyProfile } from './steps/CompanyProfile';
import { CompanyAdmin } from './steps/CompanyAdmin';
import { CompanyCalendar } from './steps/CompanyCalendar';
import { CompanyContacts } from './steps/CompanyContacts';
import { CostCodes } from './steps/CostCodes';
import { PclTemplates } from './steps/PclTemplates';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';
import {
  saveCompanyProfile,
  saveCompanyAdmin,
  saveCompanyCalendar,
  saveCompanyContacts,
  saveCostCodes,
  savePclTemplatesAndComplete,
} from './setupService';
import type { CompanyProfileData } from './steps/CompanyProfile';
import type { CompanyAdminData } from './steps/CompanyAdmin';
import type { Holiday, WorkWeek, ContactRow, CostCodeNode } from './setupTypes';
import { defaultHolidays, defaultWorkWeek, defaultPclTemplates } from './setupTypes';

const steps = [
  { key: 'profile', label: 'Company Profile' },
  { key: 'admin', label: 'Company Admin' },
  { key: 'calendar', label: 'Company Calendar' },
  { key: 'contacts', label: 'Company Contacts' },
  { key: 'costcodes', label: 'Cost Codes' },
  { key: 'pcl', label: 'PCL Templates' },
];

export function SetupWizard() {
  const navigate = useNavigate();
  const { companyId: routeCompanyId } = useParams<{ companyId?: string }>();
  const { user } = useAuth();
  const { setActiveCompany } = useCompany();

  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(routeCompanyId ?? null);

  // Step 1: Company Profile state
  const [profileData, setProfileData] = useState<CompanyProfileData>({
    legalName: '', displayName: '', address: '', city: '', state: '',
    zip: '', licenseNumber: '', statesLicensedIn: [], companyPhone: '',
    companyEmail: '', website: '', timezone: 'America/Los_Angeles',
  });

  // Step 2: Company Admin state
  const [adminData, setAdminData] = useState<CompanyAdminData>({
    adminFirstName: '', adminLastName: '', adminTitle: '', adminEmail: '', adminPhone: '',
    addSecondaryAdmin: false, secondaryFirstName: '', secondaryLastName: '',
    secondaryTitle: '', secondaryEmail: '', secondaryPhone: '',
  });

  // Step 3: Company Calendar state
  const [workWeek, setWorkWeek] = useState<WorkWeek>({ ...defaultWorkWeek });
  const [holidays, setHolidays] = useState<Holiday[]>([...defaultHolidays]);

  // Step 4: Company Contacts state
  const [contacts, setContacts] = useState<ContactRow[]>([]);

  // Step 5: Cost Codes state
  const [costCodes, setCostCodes] = useState<CostCodeNode[]>([]);
  const [showCostCodeNumbers, setShowCostCodeNumbers] = useState(true);

  const handleNext = async () => {
    if (!user) return;

    setSaving(true);
    setSaveError(null);

    try {
      switch (currentStep) {
        case 0: {
          // Step 1: Company Profile (uses security definer function)
          // Handles both create and update — if user already has a company, it updates
          const id = await saveCompanyProfile(profileData, companyId);
          setCompanyId(id);
          break;
        }
        case 1: {
          // Step 2: Company Admin
          if (!companyId) throw new Error('Company not created yet');
          await saveCompanyAdmin(companyId, user.id, adminData);
          break;
        }
        case 2: {
          // Step 3: Company Calendar
          if (!companyId) throw new Error('Company not created yet');
          await saveCompanyCalendar(companyId, workWeek, holidays);
          break;
        }
        case 3: {
          // Step 4: Company Contacts
          if (!companyId) throw new Error('Company not created yet');
          const { warnings } = await saveCompanyContacts(companyId, contacts);
          if (warnings.length > 0) {
            console.warn('Contact import warnings:', warnings);
          }
          break;
        }
        case 4: {
          // Step 5: Cost Codes
          if (!companyId) throw new Error('Company not created yet');
          await saveCostCodes(companyId, costCodes, showCostCodeNumbers);
          break;
        }
        case 5: {
          // Step 6: PCL Templates + Complete Setup
          if (!companyId) throw new Error('Company not created yet');
          await savePclTemplatesAndComplete(companyId, defaultPclTemplates);

          // Switch active company to the newly set up company
          setActiveCompany({
            id: companyId,
            display_name: profileData.displayName || null,
            legal_name: profileData.legalName,
            setup_completed: true,
          });

          navigate('/app/home');
          return;
        }
      }

      // Advance to next step
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    setSaveError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepClick = (index: number) => {
    if (index <= currentStep) {
      setSaveError(null);
      setCurrentStep(index);
    }
  };

  return (
    <SetupLayout
      steps={steps}
      currentStep={currentStep}
      onStepClick={handleStepClick}
      onBack={handleBack}
      onNext={handleNext}
      isFirstStep={currentStep === 0}
      isLastStep={currentStep === steps.length - 1}
      saving={saving}
    >
      {saveError && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {saveError}
        </div>
      )}
      {currentStep === 0 && (
        <CompanyProfile data={profileData} onChange={setProfileData} />
      )}
      {currentStep === 1 && (
        <CompanyAdmin data={adminData} onChange={setAdminData} />
      )}
      {currentStep === 2 && (
        <CompanyCalendar workWeek={workWeek} onWorkWeekChange={setWorkWeek} holidays={holidays} onHolidaysChange={setHolidays} />
      )}
      {currentStep === 3 && (
        <CompanyContacts contacts={contacts} onContactsChange={setContacts} />
      )}
      {currentStep === 4 && (
        <CostCodes
          costCodes={costCodes}
          onCostCodesChange={setCostCodes}
          showNumbers={showCostCodeNumbers}
          onShowNumbersChange={setShowCostCodeNumbers}
        />
      )}
      {currentStep === 5 && (
        <PclTemplates templates={defaultPclTemplates} />
      )}
    </SetupLayout>
  );
}
