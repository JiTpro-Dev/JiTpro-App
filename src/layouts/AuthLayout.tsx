import type { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src={`${import.meta.env.BASE_URL}JiTpro.jpg`} alt="JiTpro" className="h-16 mx-auto" />
        </div>
        {children}
      </div>
    </div>
  );
}
