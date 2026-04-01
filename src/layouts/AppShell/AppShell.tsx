import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LeftNav } from './LeftNav';
import { TopBar } from './TopBar';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../../supabase/client';

const COLLAPSE_KEY = 'jitpro_nav_collapsed';

export function AppShell() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    async function loadCompanyName() {
      const { data } = await supabase
        .from('users')
        .select('company_id')
        .eq('auth_id', user!.id)
        .maybeSingle();
      if (data?.company_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('display_name')
          .eq('id', data.company_id)
          .maybeSingle();
        if (company?.display_name) setCompanyName(company.display_name);
      }
    }
    loadCompanyName();
  }, [user]);

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
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
