# Cost Code Import Strategy — Decision Doc

## Canonical Hierarchy

- JiTpro uses one canonical internal `cost_codes` hierarchy regardless of source format
- Runtime app behavior must use stored `level` and `parent_id` — never source-specific numbering patterns

## Import Mapping Profiles

- Different uploaded cost code styles are handled through import mapping profiles
- Import logic may parse source-specific numbering patterns to determine `level` and `parent_id` during import
- CSI-style import is the first supported import profile
- Additional custom import profiles may be added later

## Constraints

- JiTpro must not create separate runtime tables or separate runtime logic per cost code style
- All imported cost codes land in the same `cost_codes` table with the same structure
