import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import jitproLogo from '../assets/jitpro_amber_stripped.svg';

export function Navbar({ pageTitle }: { pageTitle?: string }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  const handleLogout = async () => {
    await logout();
  };

  const navButtonClass =
    'rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors';

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <img src={jitproLogo} alt="JiTpro" className="h-12" />
          {pageTitle && (
            <span className="text-lg font-semibold text-slate-900">{pageTitle}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user?.email && (
            <span className="text-sm text-slate-600">
              Welcome {user.email}
            </span>
          )}
          {isDashboard && (
            <Link to="/demo" className={navButtonClass}>
              View Demo
            </Link>
          )}
          {!isDashboard && (
            <Link to="/dashboard" className={navButtonClass}>
              Dashboard
            </Link>
          )}
          <button
            onClick={handleLogout}
            className={navButtonClass}
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}
