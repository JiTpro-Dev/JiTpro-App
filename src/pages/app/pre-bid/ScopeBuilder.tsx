import { useState } from 'react';
import { PageHeader } from '../../../components/PageHeader';
import type { ProcurementItem } from './sampleData';
import { sampleItems, sampleDivisions } from './sampleData';
import { ScopeBuilderCards } from './ScopeBuilderCards';
import { ScopeBuilderSplitPanel } from './ScopeBuilderSplitPanel';

export function ScopeBuilder() {
  const [items, setItems] = useState<ProcurementItem[]>(sampleItems);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);

  const handleSelectDivision = (code: string) => {
    setSelectedDivision(code);
  };

  const handleBackToCards = () => {
    setSelectedDivision(null);
  };

  const statsText = `${items.length} procurement item${items.length !== 1 ? 's' : ''} across ${sampleDivisions.length} divisions`;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        title="Scope Builder"
        stats={statsText}
      />

      {selectedDivision === null ? (
        <div className="flex-1 overflow-y-auto">
          <ScopeBuilderCards
            divisions={sampleDivisions}
            items={items}
            onSelectDivision={handleSelectDivision}
          />
        </div>
      ) : (
        <ScopeBuilderSplitPanel
          divisions={sampleDivisions}
          items={items}
          onItemsChange={setItems}
          initialDivision={selectedDivision}
          onBackToCards={handleBackToCards}
        />
      )}
    </div>
  );
}
