# Scope Builder Cost Code Tree — Decision Doc

## Navigation

- Scope Builder cost code navigation must support all 4 levels of the hierarchy
- Level 1 (division) is navigable but not a valid final selection
- Levels 2 (section), 3 (subsection), and 4 (paragraph) are valid final selections

## Data Structure

- The current 2-level flat structure (`CsiDivision` + `CsiSubdivision`) must be replaced with a single recursive tree node model
- Replace `buildDivisionsFromCostCodes()` with a recursive `buildCostCodeTree()` approach
- Each node carries: id, code, title, level, icon (level 1 only), children

## Item Display

- Selecting a node shows items assigned to that node and all descendant nodes
- Adding a procurement item assigns it to the currently selected node's `cost_code_id`

## Custom Node Creation (Future)

- Add subsection: allowed under level 2 (section)
- Add paragraph: allowed under level 3 (subsection)
- No custom creation at level 1 (division) or level 2 (section) itself
