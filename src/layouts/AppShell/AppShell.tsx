import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LeftNav } from './LeftNav';
import { TopBar } from './TopBar';

const COLLAPSE_KEY = 'jitpro_nav_collapsed';

export function AppShell() {
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
      <LeftNav isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
