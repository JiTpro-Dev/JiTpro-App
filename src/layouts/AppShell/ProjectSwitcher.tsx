import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface ProjectSwitcherProps {
  projectName: string;
  isCollapsed: boolean;
}

export function ProjectSwitcher({ projectName, isCollapsed }: ProjectSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mx-auto mt-2 flex h-8 w-9 items-center justify-center rounded-md bg-slate-950 border border-slate-700 text-slate-200"
        title={projectName}
      >
        <span className="text-[10px] font-bold">{projectName.charAt(0)}</span>
      </button>
    );
  }

  return (
    <div className="mx-2 mt-2 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-2 text-left"
      >
        <div className="text-[9px] text-slate-500">Current Project</div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-slate-200 truncate">{projectName}</span>
          <ChevronDown size={12} className="text-slate-500 flex-shrink-0" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-md border border-slate-700 bg-slate-900 py-1 shadow-lg">
          <button
            onClick={() => { navigate('/app/home'); setIsOpen(false); }}
            className="block w-full px-3 py-2 text-left text-[10px] text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            ← Back to Company Home
          </button>
        </div>
      )}
    </div>
  );
}
