// src/pages/setup/SetupWizard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SetupLayout } from '../../layouts/SetupLayout';
import { HolidayCalendar } from './steps/HolidayCalendar';
import { CompanyContacts } from './steps/CompanyContacts';
import { CostCodes } from './steps/CostCodes';
import { PclTemplates } from './steps/PclTemplates';
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

  // Start at step 2 (index 2) since steps 0 and 1 are already built
  const [currentStep, setCurrentStep] = useState(2);

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
    setCurrentStep((prev) => Math.max(prev - 1, 2));
  };

  const handleStepClick = (index: number) => {
    if (index >= 2 && index <= currentStep) {
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
      isFirstStep={currentStep === 2}
      isLastStep={currentStep === steps.length - 1}
    >
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
