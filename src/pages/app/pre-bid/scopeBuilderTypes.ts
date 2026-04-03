// Shared types for Scope Builder and related components.
// These map to the production database schema.

export type ItemStatus = 'ready' | 'pending_selection' | 'missing_design';

export interface ProcurementItem {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  cost_code_id: string | null;
  csi_code: string | null;
  csi_division: string | null;
  csi_label: string | null;
  status: ItemStatus;
  notes: string | null;
  sort_order: number;
}

/** Raw cost_code row from Supabase. */
export interface CostCode {
  id: string;
  code: string;
  title: string;
  level: number;
  parent_id: string | null;
  sort_order: number;
}

/** Recursive tree node built from flat cost_codes rows. */
export interface CostCodeNode {
  id: string;
  code: string;
  title: string;
  level: number;
  icon?: string;
  children: CostCodeNode[];
}

export const statusConfig: Record<ItemStatus, { label: string; badgeClass: string; rowClass: string }> = {
  ready: {
    label: 'Ready',
    badgeClass: 'bg-green-100 text-green-700',
    rowClass: '',
  },
  pending_selection: {
    label: 'Pending Selection',
    badgeClass: 'bg-amber-100 text-amber-700',
    rowClass: 'bg-amber-50',
  },
  missing_design: {
    label: 'Missing Design',
    badgeClass: 'bg-red-100 text-red-700',
    rowClass: 'bg-red-50',
  },
};

// Map division codes to Lucide icon names
const DIVISION_ICONS: Record<string, string> = {
  '03': 'Blocks',
  '05': 'Wrench',
  '06': 'TreePine',
  '08': 'DoorOpen',
  '09': 'PaintBucket',
  '10': 'Signpost',
  '11': 'Refrigerator',
  '12': 'Armchair',
};

/**
 * Compare two cost code strings by splitting on non-alphanumeric delimiters
 * and comparing each segment numerically when possible, lexically otherwise.
 * Works for CSI-style ("03 30 00"), dash-delimited ("01-40-00"), or plain codes.
 */
function compareCodeSegments(a: string, b: string): number {
  const segsA = a.split(/[\s\-_.]+/);
  const segsB = b.split(/[\s\-_.]+/);
  const len = Math.max(segsA.length, segsB.length);
  for (let i = 0; i < len; i++) {
    const sa = segsA[i] ?? '';
    const sb = segsB[i] ?? '';
    const na = Number(sa);
    const nb = Number(sb);
    if (!isNaN(na) && !isNaN(nb)) {
      if (na !== nb) return na - nb;
    } else {
      if (sa < sb) return -1;
      if (sa > sb) return 1;
    }
  }
  return 0;
}

/** Sort nodes: sort_order first, then normalized code comparison as fallback. */
function sortNodes(nodes: CostCodeNode[], sortOrderMap: Map<string, number>) {
  nodes.sort((a, b) => {
    const orderA = sortOrderMap.get(a.id) ?? 0;
    const orderB = sortOrderMap.get(b.id) ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return compareCodeSegments(a.code, b.code);
  });
}

/**
 * Build a recursive CostCodeNode tree from flat cost_codes rows.
 * Returns only level-1 root nodes. All 4 levels are represented.
 * Sorted by sort_order primary, normalized code segments fallback.
 */
export function buildCostCodeTree(costCodes: CostCode[]): CostCodeNode[] {
  // Build a sort_order lookup from the raw data
  const sortOrderMap = new Map<string, number>();
  for (const cc of costCodes) {
    sortOrderMap.set(cc.id, cc.sort_order);
  }

  // Create a node for every cost code
  const nodeMap = new Map<string, CostCodeNode>();
  for (const cc of costCodes) {
    const divCode = cc.code.substring(0, 2);
    nodeMap.set(cc.id, {
      id: cc.id,
      code: cc.code,
      title: cc.title,
      level: cc.level,
      icon: cc.level === 1 ? (DIVISION_ICONS[divCode] ?? 'Blocks') : undefined,
      children: [],
    });
  }

  // Attach children to parents
  const roots: CostCodeNode[] = [];
  for (const cc of costCodes) {
    const node = nodeMap.get(cc.id)!;
    if (cc.parent_id) {
      const parent = nodeMap.get(cc.parent_id);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  // Sort at every level: sort_order primary, normalized code fallback
  function sortTree(nodes: CostCodeNode[]) {
    sortNodes(nodes, sortOrderMap);
    for (const node of nodes) {
      sortTree(node.children);
    }
  }
  sortTree(roots);

  return roots;
}

/**
 * Collect the id of a node and all its descendants.
 * Used to filter procurement items that belong to a node or any child below it.
 */
export function getDescendantIds(node: CostCodeNode): string[] {
  const ids: string[] = [node.id];
  for (const child of node.children) {
    ids.push(...getDescendantIds(child));
  }
  return ids;
}
