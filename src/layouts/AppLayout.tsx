import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { DemoSubNav } from '../components/DemoSubNav';

export function AppLayout({ children, pageTitle, fullWidth }: { children: ReactNode; pageTitle?: string; fullWidth?: boolean }) {
  const location = useLocation();
  const isDemoPage = location.pathname.startsWith('/demo');

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar pageTitle={pageTitle} />
      {isDemoPage && <DemoSubNav />}
      <main className={fullWidth ? 'px-4 py-4 sm:px-6 lg:px-8' : 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'}>
        {children}
      </main>
    </div>
  );
}
