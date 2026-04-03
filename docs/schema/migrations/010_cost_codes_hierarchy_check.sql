-- ============================================
-- 010: Enforce cost_codes parent/child hierarchy
-- ============================================
-- Validates that parent_id references the correct level:
--   level 1 (division)    -> parent_id must be null
--   level 2 (section)     -> parent must be level 1
--   level 3 (subsection)  -> parent must be level 2
--   level 4 (paragraph)   -> parent must be level 3
--
-- Implemented as a BEFORE INSERT OR UPDATE trigger.

create or replace function public.check_cost_code_hierarchy()
returns trigger as $$
declare
  v_parent_level int;
begin
  -- Level 1 (division) must have no parent
  if new.level = 1 then
    if new.parent_id is not null then
      raise exception 'Division (level 1) must not have a parent.';
    end if;
    return new;
  end if;

  -- Levels 2-4 must have a parent
  if new.parent_id is null then
    raise exception 'Level % cost code must have a parent.', new.level;
  end if;

  -- Look up parent level
  select level into strict v_parent_level
    from public.cost_codes
    where id = new.parent_id;

  -- Parent must be exactly one level above
  if v_parent_level <> new.level - 1 then
    raise exception 'Level % cost code must have a level % parent, but parent is level %.',
      new.level, new.level - 1, v_parent_level;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists cost_codes_hierarchy_check on public.cost_codes;

create trigger cost_codes_hierarchy_check
  before insert or update on public.cost_codes
  for each row execute function public.check_cost_code_hierarchy();
