import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/PageHeader';
import { useCompany } from '../../../context/CompanyContext';
import { supabase } from '../../../../supabase/client';
import type { ProcurementItem, CostCode, CostCodeNode } from './scopeBuilderTypes';
import { buildCostCodeTree } from './scopeBuilderTypes';
import { ScopeBuilderCards } from './ScopeBuilderCards';
import { ScopeBuilderSplitPanel } from './ScopeBuilderSplitPanel';

export function ScopeBuilder() {
  const { projectId } = useParams<{ projectId: string }>();
  const { activeCompanyId } = useCompany();

  const [items, setItems] = useState<ProcurementItem[]>([]);
  const [costCodes, setCostCodes] = useState<CostCode[]>([]);
  const [costCodeTree, setCostCodeTree] = useState<CostCodeNode[]>([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cost codes → build tree
  useEffect(() => {
    if (!activeCompanyId) return;

    async function loadCostCodes() {
      const { data, error: err } = await supabase
        .from('cost_codes')
        .select('id, code, title, level, parent_id, sort_order')
        .eq('company_id', activeCompanyId!)
        .order('sort_order');

      if (err) {
        setError('Failed to load cost codes.');
        return;
      }

      const codes: CostCode[] = data ?? [];
      setCostCodes(codes);
      setCostCodeTree(buildCostCodeTree(codes));
    }

    loadCostCodes();
  }, [activeCompanyId]);

  // Fetch procurement items for this project
  const loadItems = useCallback(async () => {
    if (!projectId) return;

    const { data, error: err } = await supabase
      .from('procurement_items')
      .select('id, project_id, name, description, cost_code_id, csi_code, csi_division, csi_label, status, notes, sort_order')
      .eq('project_id', projectId)
      .order('sort_order');

    if (err) {
      setError('Failed to load procurement items.');
      setLoading(false);
      return;
    }

    setItems(data ?? []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Create a new item in Supabase
  const handleCreateItem = useCallback(async (
    newItem: Omit<ProcurementItem, 'id' | 'project_id' | 'sort_order'>
  ) => {
    if (!projectId) return;

    // Validate cost code: must exist, must be real, must not be division level
    if (!newItem.cost_code_id) {
      setError('Cost code is required.');
      return;
    }
    const costCode = costCodes.find((cc) => cc.id === newItem.cost_code_id);
    if (!costCode) {
      setError('Selected cost code is invalid.');
      return;
    }
    if (costCode.level < 2) {
      setError('Cost code must be at least at the section level.');
      return;
    }

    const { data, error: err } = await supabase
      .from('procurement_items')
      .insert({
        project_id: projectId,
        name: newItem.name,
        description: newItem.description || null,
        cost_code_id: newItem.cost_code_id || null,
        csi_code: newItem.csi_code || null,
        csi_division: newItem.csi_division || null,
        csi_label: newItem.csi_label || null,
        status: newItem.status,
        notes: newItem.notes || null,
        sort_order: items.length,
      })
      .select()
      .single();

    if (err) {
      setError('Failed to create item.');
      return;
    }

    setItems((prev) => [...prev, data]);
    setError(null);
  }, [projectId, items.length, costCodes]);

  // Update an existing item in Supabase
  const handleUpdateItem = useCallback(async (
    itemId: string,
    updates: Partial<Pick<ProcurementItem, 'name' | 'description' | 'status' | 'notes'>>
  ) => {
    const { error: err } = await supabase
      .from('procurement_items')
      .update(updates)
      .eq('id', itemId);

    if (err) {
      setError('Failed to update item.');
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
    setError(null);
  }, []);

  if (!projectId || !activeCompanyId) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        No project or company selected.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        Loading scope builder...
      </div>
    );
  }

  const statsText = `${items.length} procurement item${items.length !== 1 ? 's' : ''} across ${costCodeTree.length} divisions`;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader title="Scope Builder" stats={statsText} />

      {error && (
        <div className="mx-6 mt-2 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {selectedDivisionId === null ? (
        <div className="flex-1 overflow-y-auto">
          <ScopeBuilderCards
            tree={costCodeTree}
            items={items}
            onSelectDivision={(id) => setSelectedDivisionId(id)}
          />
        </div>
      ) : (
        <ScopeBuilderSplitPanel
          tree={costCodeTree}
          items={items}
          onCreateItem={handleCreateItem}
          onUpdateItem={handleUpdateItem}
          initialDivisionId={selectedDivisionId}
          onBackToCards={() => setSelectedDivisionId(null)}
        />
      )}
    </div>
  );
}
