import type { ReactNode } from 'react';
import jitproLogo from '../assets/JiTpro_Amber_white_text.svg';

interface SetupStep {
  key: string;
  label: string;
}

interface SetupLayoutProps {
  children: ReactNode;
  steps: SetupStep[];
  currentStep: number;
  onStepClick: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  saving?: boolean;
}

export function SetupLayout({
  children,
  steps,
  currentStep,
  onStepClick,
  onBack,
  onNext,
  isFirstStep,
  isLastStep,
  saving = false,
}: SetupLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}
      <div className="flex w-full items-center justify-center py-4" style={{ backgroundColor: 'rgb(30, 41, 59)' }}>
        <img
          src={jitproLogo}
          alt="JiTpro - Just in Time Procurement"
          className="h-36"
        />
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">

        {/* Step indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {steps.map((step, i) => (
              <button
                key={step.key}
                onClick={() => i <= currentStep && onStepClick(i)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  i === currentStep
                    ? 'bg-slate-800 text-white'
                    : i < currentStep
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer'
                    : 'bg-slate-50 text-slate-400 cursor-default'
                }`}
              >
                {i + 1}. {step.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content card */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          {children}

          {/* Bottom navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
            <div>
              {!isFirstStep ? (
                <button
                  onClick={onBack}
                  className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Back
                </button>
              ) : (
                <p className="text-xs text-slate-400">* Required fields</p>
              )}
            </div>
            <button
              onClick={onNext}
              disabled={saving}
              className="rounded-md bg-slate-800 px-6 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : isLastStep ? 'Complete Setup' : 'Save & Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
