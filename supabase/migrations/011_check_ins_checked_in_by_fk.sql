-- 011: Give check_ins.checked_in_by a real reference.
--
-- The column was declared as a bare UUID with no foreign key and nothing ever
-- wrote to it: all 25 check-ins recorded between 2025-12-29 and 2026-08-09 had
-- it NULL, so the attendance log showed that a member arrived but never who
-- admitted them.
--
-- It points at auth.users(id) rather than staff(id) because the actor is the
-- authenticated user, which is what the client has on hand and what stays
-- stable if someone's staff row is later moved or recreated. Join through
-- staff on (user_id, organization_id) when a name is needed.
--
-- ON DELETE SET NULL so removing a user preserves the attendance record; the
-- check-in itself is the thing worth keeping.

alter table public.check_ins
  drop constraint if exists check_ins_checked_in_by_fkey;

alter table public.check_ins
  add constraint check_ins_checked_in_by_fkey
  foreign key (checked_in_by) references auth.users(id) on delete set null;
