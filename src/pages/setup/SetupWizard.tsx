// src/pages/setup/SetupWizard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SetupLayout } from '../../layouts/SetupLayout';
import { CompanyProfile } from './steps/CompanyProfile';
import { CompanyAdmin } from './steps/CompanyAdmin';
import { HolidayCalendar } from './steps/HolidayCalendar';
import { CompanyContacts } from './steps/CompanyContacts';
import { CostCodes } from './steps/CostCodes';
import { PclTemplates } from './steps/PclTemplates';
import type { CompanyProfileData } from './steps/CompanyProfile';
import type { CompanyAdminData } from './steps/CompanyAdmin';
import type { Holiday, ContactRow, CostCodeNode } from './setupTypes';
import { defaultHolidays, defaultPclTemplates } from './setupTypes';

const steps = [
  { key: 'profile', label: 'Company Profile' },
  { key: 'admin', label: 'Company Admin' },
  { key: 'calendar', label: 'Holiday Calendar' },
  { key: 'contacts', label: 'Company Contacts' },
  { key: 'costcodes', label: 'Cost Codes' },
  { key: 'pcl', label: 'PCL Templates' },
];

export function SetupWizard() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);

  // Step 1: Company Profile state
  const [profileData, setProfileData] = useState<CompanyProfileData>({
    legalName: '', displayName: '', address: '', city: '', state: '',
    zip: '', licenseNumber: '', companyPhone: '', timezone: 'America/Los_Angeles',
  });

  // Step 2: Company Admin state
  const [adminData, setAdminData] = useState<CompanyAdminData>({
    adminFirstName: '', adminLastName: '', adminTitle: '', adminEmail: '', adminPhone: '',
    addSecondaryAdmin: false, secondaryFirstName: '', secondaryLastName: '',
    secondaryTitle: '', secondaryEmail: '', secondaryPhone: '',
  });

  // Step 3: Holiday Calendar state
  const [holidays, setHolidays] = useState<Holiday[]>([...defaultHolidays]);

  // Step 4: Company Contacts state
  const [contacts, setContacts] = useState<ContactRow[]>([]);

  // Step 5: Cost Codes state
  const [costCodes, setCostCodes] = useState<CostCodeNode[]>([]);
  const [showCostCodeNumbers, setShowCostCodeNumbers] = useState(true);

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      navigate('/app/home');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepClick = (index: number) => {
    if (index <= currentStep) {
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
    >
      {currentStep === 0 && (
        <CompanyProfile data={profileData} onChange={setProfileData} />
      )}
      {currentStep === 1 && (
        <CompanyAdmin data={adminData} onChange={setAdminData} />
      )}
      {currentStep === 2 && (
        <HolidayCalendar holidays={holidays} onHolidaysChange={setHolidays} />
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
