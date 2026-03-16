import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <span className="text-xl font-bold text-slate-900">JiTpro</span>
        <button
          onClick={handleLogout}
          className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}
