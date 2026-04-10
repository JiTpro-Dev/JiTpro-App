import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import jitproLogo from '../assets/jitpro_amber_stripped.svg';

export function Navbar({ pageTitle }: { pageTitle?: string }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isDemoPage = location.pathname.startsWith('/demo');
  const isDarkTheme = isDashboard || isDemoPage;

  const handleLogout = async () => {
    await logout();
  };

  const navButtonClass = isDarkTheme
    ? 'rounded-md px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors'
    : 'rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors';

  return (
    <nav className={isDarkTheme ? 'border-b border-slate-700 bg-slate-800' : 'border-b border-slate-200 bg-white'}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <img src={jitproLogo} alt="JiTpro" className={isDarkTheme ? 'h-16 -translate-y-1' : 'h-12'} />
          {pageTitle && (
            <span className={isDarkTheme ? 'text-lg font-semibold text-white' : 'text-lg font-semibold text-slate-900'}>{pageTitle}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user?.email && (
            <span className={isDarkTheme ? 'text-sm text-slate-300' : 'text-sm text-slate-600'}>
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
