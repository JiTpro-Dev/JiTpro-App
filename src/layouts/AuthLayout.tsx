import type { ReactNode } from 'react';
import jitproLogo from '../assets/JiTpro_Amber_white_text.svg';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center rounded-lg py-6" style={{ backgroundColor: 'rgb(30, 41, 59)' }}>
          <img src={jitproLogo} alt="JiTpro - Just in Time Procurement" className="h-32" />
        </div>
        {children}
      </div>
    </div>
  );
}
