import type { ReactNode } from 'react';

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
}: SetupLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Logo */}
        <div className="mb-6 text-center">
          <img
            src={`${import.meta.env.BASE_URL}JiTpro.jpg`}
            alt="JiTpro"
            className="mx-auto h-8"
          />
        </div>

        {/* Step indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {steps.map((step, i) => (
              <button
                key={step.key}
                onClick={() => i <= currentStep && onStepClick(i)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  i === currentStep
                    ? 'bg-slate-900 text-white'
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
              className="rounded-md bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              {isLastStep ? 'Complete Setup' : 'Save & Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
