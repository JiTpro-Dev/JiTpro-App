import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function ProfileMenu() {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // TODO: get initials from user profile
  const initials = 'JK';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { label: 'My Profile', action: () => {} },
    { label: 'Notification Preferences', action: () => {} },
    { label: 'Company Settings', action: () => {} },
    { label: 'Help / Support', action: () => {} },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-amber-500 hover:bg-slate-700 transition-colors"
        aria-label="Profile menu"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg z-50">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => { item.action(); setIsOpen(false); }}
              className="block w-full px-4 py-2 text-left text-[12px] text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              {item.label}
            </button>
          ))}
          <div className="my-1 border-t border-slate-100" />
          <button
            onClick={logout}
            className="block w-full px-4 py-2 text-left text-[12px] text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
