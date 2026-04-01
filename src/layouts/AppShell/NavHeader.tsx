import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import jitproLogo from '../../assets/jitpro_amber_stripped.svg';

interface NavHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  companyName: string;
}

export function NavHeader({ isCollapsed, onToggleCollapse, companyName }: NavHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-700 px-4 py-[14px]">
      {isCollapsed ? (
        <img src={jitproLogo} alt="JiTpro" className="mx-auto h-6" />
      ) : (
        <div>
          <img src={jitproLogo} alt="JiTpro" className="h-20" />
          {companyName && <div className="mt-[2px] text-[9px] text-slate-500">{companyName}</div>}
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
