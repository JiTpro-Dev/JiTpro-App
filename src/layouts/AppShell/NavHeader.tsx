import { ChevronsLeft, ChevronsRight } from 'lucide-react';

interface NavHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function NavHeader({ isCollapsed, onToggleCollapse }: NavHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-700 px-4 py-[14px]">
      {isCollapsed ? (
        <span className="mx-auto text-[14px] font-bold text-amber-500">J</span>
      ) : (
        <div>
          <div className="text-[14px] font-bold tracking-tight text-amber-500">JiTpro</div>
          <div className="mt-[2px] text-[9px] text-slate-500">Kaufman Construction</div>
        </div>
      )}
      <button
        onClick={onToggleCollapse}
        className={`text-slate-600 hover:text-slate-400 transition-colors ${isCollapsed ? 'mx-auto mt-2' : ''}`}
        aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
      >
        {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
      </button>
    </div>
  );
}
