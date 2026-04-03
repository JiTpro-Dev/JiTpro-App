import { useState, useEffect, useMemo } from 'react';
import type { CostCodeNode, ProcurementItem } from './scopeBuilderTypes';
import { getDescendantIds } from './scopeBuilderTypes';
import { CsiTree } from './CsiTree';
import { ItemList } from './ItemList';
import { AddItemForm } from './AddItemForm';

/** Find the level-1 ancestor of a node by searching the tree. */
function findDivisionAncestor(roots: CostCodeNode[], targetId: string): CostCodeNode | null {
  for (const root of roots) {
    if (root.id === targetId) return root.level === 1 ? root : null;
    const found = findInSubtree(root, targetId);
    if (found) return root.level === 1 ? root : null;
  }
  return null;
}

function findInSubtree(node: CostCodeNode, targetId: string): boolean {
  for (const child of node.children) {
    if (child.id === targetId) return true;
    if (findInSubtree(child, targetId)) return true;
  }
  return false;
}

/** Find the first level-2 descendant in a tree (depth-first). */
function findFirstSelectableChild(node: CostCodeNode): CostCodeNode | null {
  for (const child of node.children) {
    if (child.level >= 2) return child;
    const found = findFirstSelectableChild(child);
    if (found) return found;
  }
  return null;
}

interface ScopeBuilderSplitPanelProps {
  tree: CostCodeNode[];
  items: ProcurementItem[];
  onCreateItem: (item: Omit<ProcurementItem, 'id' | 'project_id' | 'sort_order'>) => Promise<void>;
  onUpdateItem: (itemId: string, updates: Partial<Pick<ProcurementItem, 'name' | 'description' | 'status' | 'notes'>>) => Promise<void>;
  initialDivisionId: string;
  onBackToCards: () => void;
}

export function ScopeBuilderSplitPanel({
  tree,
  items,
  onCreateItem,
  onUpdateItem,
  initialDivisionId,
  onBackToCards,
}: ScopeBuilderSplitPanelProps) {
  const [selectedNode, setSelectedNode] = useState<CostCodeNode | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Auto-select first level-2 child of the initial division on mount
  useEffect(() => {
    const division = tree.find((d) => d.id === initialDivisionId);
    if (division) {
      const firstChild = findFirstSelectableChild(division);
      setSelectedNode(firstChild);
    }
  }, [initialDivisionId, tree]);

  const handleSelectNode = (node: CostCodeNode) => {
    setSelectedNode(node);
    setShowAddForm(false);
  };

  const handleAddItem = async (newItem: Omit<ProcurementItem, 'id' | 'project_id' | 'sort_order'>) => {
    await onCreateItem(newItem);
    setShowAddForm(false);
  };

  // Filter items: show items whose cost_code_id is the selected node or any descendant
  const descendantIds = useMemo(
    () => (selectedNode ? new Set(getDescendantIds(selectedNode)) : new Set<string>()),
    [selectedNode]
  );
  const filteredItems = items.filter((item) => item.cost_code_id && descendantIds.has(item.cost_code_id));

  // Resolve the division code by walking up the tree to the level-1 ancestor
  const selectedDivisionCode = useMemo(() => {
    if (!selectedNode) return '';
    if (selectedNode.level === 1) return selectedNode.code;
    const division = findDivisionAncestor(tree, selectedNode.id);
    return division?.code ?? '';
  }, [selectedNode, tree]);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left sidebar: CSI tree */}
      <CsiTree
        tree={tree}
        selectedNodeId={selectedNode?.id ?? null}
        onSelectNode={handleSelectNode}
        onBackToCards={onBackToCards}
      />

      {/* Right panel */}
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
        {selectedNode ? (
          <>
            <ItemList
              items={filteredItems}
              subdivisionCode={selectedNode.code}
              subdivisionName={selectedNode.title}
              onAddItem={() => setShowAddForm(true)}
              onUpdateItem={onUpdateItem}
            />
            {showAddForm && (
              <AddItemForm
                csiCode={selectedNode.code}
                csiDivision={selectedDivisionCode}
                csiLabel={selectedNode.title}
                costCodeId={selectedNode.id}
                onSave={handleAddItem}
                onCancel={() => setShowAddForm(false)}
              />
            )}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-[14px] text-slate-400">
            Select a cost code from the left.
          </div>
        )}
      </div>
    </div>
  );
}
