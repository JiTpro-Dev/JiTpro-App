# Cost Codes Schema Decision

## Table: cost_codes

Purpose:
Stores the hierarchical cost code library for a company using a self-referencing tree.

### Columns
- id (uuid, pk)
- company_id (uuid, fk -> companies.id)
- parent_id (uuid, nullable, fk -> cost_codes.id)
- level (int: 1=division, 2=section, 3=subsection, 4=paragraph)
- code (text)
- title (text)
- sort_order (int)
- is_custom (boolean, default false)
- source_type (text: imported | custom | system)
- active (boolean, default true)
- created_at
- updated_at

## Hierarchy Rules

### Level mapping
- 1 = division
- 2 = section
- 3 = subsection
- 4 = paragraph

- division has no parent
- section parent must be division
- subsection parent must be section
- paragraph parent must be subsection
- users may not save a procurement item at division level
- minimum valid selection is section
- valid final selectable levels are:
  - section
  - subsection
  - paragraph

## Custom Node Rules
- custom subsection creation is allowed
- custom paragraph creation is allowed
- custom division creation is not allowed
- custom section creation is not allowed for v1

## Project Display Setting
Add to projects:
- cost_code_display_mode (text: code_and_title | title_only)

Display examples:
- code_and_title -> 32 00 00 - Exterior Improvements
- title_only -> Exterior Improvements

## Procurement Item Link
procurement_items.cost_code_id references cost_codes.id
