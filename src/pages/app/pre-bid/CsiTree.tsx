import { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import type { CostCodeNode } from './scopeBuilderTypes';

interface CsiTreeProps {
  tree: CostCodeNode[];
  selectedNodeId: string | null;
  onSelectNode: (node: CostCodeNode) => void;
  onBackToCards: () => void;
}

const INDENT: Record<number, string> = {
  1: 'pl-4',
  2: 'pl-5',
  3: 'pl-7',
  4: 'pl-9',
};

function TreeNode({
  node,
  selectedNodeId,
  expandedIds,
  onToggleExpand,
  onSelectNode,
}: {
  node: CostCodeNode;
  selectedNodeId: string | null;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelectNode: (node: CostCodeNode) => void;
}) {
  const isSelected = node.id === selectedNodeId;
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children.length > 0;
  const isSelectable = node.level >= 2;
  const indent = INDENT[node.level] ?? 'pl-4';

  const handleClick = () => {
    if (hasChildren) {
      onToggleExpand(node.id);
    }
    if (isSelectable) {
      onSelectNode(node);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex w-full items-center justify-between pr-3 py-2 text-left transition focus:outline-none ${indent} ${
          isSelected
            ? 'border-l-2 border-amber-500 bg-slate-700/60 text-white'
            : node.level === 1
              ? isExpanded
                ? 'border-l-2 border-transparent bg-slate-700 text-white'
                : 'border-l-2 border-transparent text-slate-300 hover:bg-slate-700/50 hover:text-white'
              : 'border-l-2 border-transparent text-slate-400 hover:bg-slate-700/40 hover:text-slate-200'
        }`}
      >
        <div className="flex flex-col min-w-0">
          {node.level >= 2 && (
            <span className="text-[11px] font-mono text-slate-500">{node.code}</span>
          )}
          <span className={`leading-snug truncate ${node.level === 1 ? 'text-[13px] font-medium' : 'text-[12px]'}`}>
            {node.title}
          </span>
        </div>
        {hasChildren && (
          isExpanded
            ? <ChevronDown size={14} className="flex-shrink-0 text-slate-400" />
            : <ChevronRight size={14} className="flex-shrink-0 text-slate-500" />
        )}
      </button>

      {isExpanded && hasChildren && (
        <div className={node.level === 1 ? 'bg-slate-900/40' : ''}>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedNodeId={selectedNodeId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelectNode={onSelectNode}
            />
          ))}
        </div>
      )}
    </>
  );
}

export function CsiTree({
  tree,
  selectedNodeId,
  onSelectNode,
  onBackToCards,
}: CsiTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Auto-expand the first division on mount
    const initial = new Set<string>();
    if (tree.length > 0) {
      initial.add(tree[0].id);
    }
    return initial;
  });

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <nav className="flex h-full w-56 flex-shrink-0 flex-col bg-slate-800 text-sm">
      <button
        onClick={onBackToCards}
        className="flex items-center gap-2 px-4 py-3 text-slate-300 transition hover:text-white focus:outline-none"
      >
        <ArrowLeft size={14} />
        <span className="text-xs font-medium uppercase tracking-wide">Back to Divisions</span>
      </button>

      <div className="h-px bg-slate-700" />

      <div className="flex-1 overflow-y-auto py-2">
        {tree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            selectedNodeId={selectedNodeId}
            expandedIds={expandedIds}
            onToggleExpand={handleToggleExpand}
            onSelectNode={onSelectNode}
          />
        ))}
      </div>
    </nav>
  );
}
