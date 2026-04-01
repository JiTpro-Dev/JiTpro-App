import { useState, useEffect } from 'react';
import type { CsiDivision, ProcurementItem } from './sampleData';
import { CsiTree } from './CsiTree';
import { ItemList } from './ItemList';
import { AddItemForm } from './AddItemForm';

interface ScopeBuilderSplitPanelProps {
  divisions: CsiDivision[];
  items: ProcurementItem[];
  onItemsChange: (items: ProcurementItem[]) => void;
  initialDivision: string;
  onBackToCards: () => void;
}

export function ScopeBuilderSplitPanel({
  divisions,
  items,
  onItemsChange,
  initialDivision,
  onBackToCards,
}: ScopeBuilderSplitPanelProps) {
  const [activeDivision, setActiveDivision] = useState(initialDivision);
  const [activeSubdivision, setActiveSubdivision] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Auto-select first subdivision when division changes
  useEffect(() => {
    const division = divisions.find((d) => d.code === activeDivision);
    if (division && division.subdivisions.length > 0) {
      setActiveSubdivision(division.subdivisions[0].code);
    } else {
      setActiveSubdivision('');
    }
    setShowAddForm(false);
  }, [activeDivision, divisions]);

  const handleSelectDivision = (code: string) => {
    setActiveDivision(code);
  };

  const handleSelectSubdivision = (code: string) => {
    setActiveSubdivision(code);
    setShowAddForm(false);
  };

  const handleAddItem = (newItem: ProcurementItem) => {
    onItemsChange([...items, newItem]);
    setShowAddForm(false);
  };

  // Items for the active subdivision
  const filteredItems = items.filter((item) => item.csiCode === activeSubdivision);

  // Resolve subdivision name for display
  const activeDivisionObj = divisions.find((d) => d.code === activeDivision);
  const activeSubdivisionObj = activeDivisionObj?.subdivisions.find(
    (s) => s.code === activeSubdivision
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left sidebar: CSI tree */}
      <CsiTree
        divisions={divisions}
        activeDivision={activeDivision}
        activeSubdivision={activeSubdivision}
        onSelectDivision={handleSelectDivision}
        onSelectSubdivision={handleSelectSubdivision}
        onBackToCards={onBackToCards}
      />

      {/* Right panel */}
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
        {activeSubdivisionObj ? (
          <>
            <ItemList
              items={filteredItems}
              subdivisionCode={activeSubdivisionObj.code}
              subdivisionName={activeSubdivisionObj.name}
              onAddItem={() => setShowAddForm(true)}
            />
            {showAddForm && (
              <AddItemForm
                csiCode={activeSubdivision}
                csiDivision={activeDivision}
                csiLabel={activeSubdivisionObj.name}
                onSave={handleAddItem}
                onCancel={() => setShowAddForm(false)}
              />
            )}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-[14px] text-slate-400">
            Select a subdivision from the left.
          </div>
        )}
      </div>
    </div>
  );
}
