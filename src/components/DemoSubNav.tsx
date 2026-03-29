import { Link, useLocation, useSearchParams } from 'react-router-dom';

const links = [
  { label: 'Demos', path: '/demo' },
  { label: 'Enter Procurement Items', path: '/demo/procurement-timeline' },
  { label: 'View Procurement Timeline', path: '/demo/view-procurement-timeline' },
  { label: 'Procurement Schedule', path: '/demo/procurement-schedule' },
];

const sortOptions = [
  { value: 'delivery_asc', label: 'Delivery Date (Earliest)' },
  { value: 'delivery_desc', label: 'Delivery Date (Latest)' },
  { value: 'start_asc', label: 'Start Buyout (Earliest)' },
  { value: 'start_desc', label: 'Start Buyout (Latest)' },
  { value: 'duration_desc', label: 'Duration (Longest)' },
  { value: 'duration_asc', label: 'Duration (Shortest)' },
  { value: 'status', label: 'Status' },
  { value: 'name_asc', label: 'Name (A–Z)' },
  { value: 'name_desc', label: 'Name (Z–A)' },
];

export function DemoSubNav() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPath = location.pathname;
  const isSchedulePage = currentPath === '/demo/procurement-schedule';
  const currentSort = searchParams.get('sort') || 'delivery_asc';

  const handleSortChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('sort', value);
      return next;
    });
  };

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto py-2">
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          {isSchedulePage && (
            <div className="flex items-center gap-2 ml-4">
              <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Sort by:</label>
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
