import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { LeftNav } from './LeftNav';
import { TopBar } from './TopBar';
import { useCompany } from '../../context/CompanyContext';

const COLLAPSE_KEY = 'jitpro_nav_collapsed';

export function AppShell() {
  const { activeCompany, loading } = useCompany();

  // Wait for company context to finish loading from localStorage
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  // Redirect to dashboard if no company selected
  if (!activeCompany) {
    return <Navigate to="/dashboard" replace />;
  }

  const companyName = activeCompany?.display_name || activeCompany?.legal_name || '';

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem(COLLAPSE_KEY) === 'true';
  });

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <LeftNav isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} companyName={companyName} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar companyName={companyName} />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
