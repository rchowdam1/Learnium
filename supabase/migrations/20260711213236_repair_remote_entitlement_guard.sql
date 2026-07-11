-- Remote history recorded the earlier guard fix, but the deployed function
-- still used auth.uid() and blocked trusted quota RPCs. Reassert the intended
-- role-based guard in a new migration so schema and history converge.
create or replace function public.protect_profile_entitlements()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user = 'authenticated' and
     (new.is_subscribed is distinct from old.is_subscribed or
      new.sets_remaining is distinct from old.sets_remaining or
      new.chats_remaining is distinct from old.chats_remaining or
      new.sets_refresh_at is distinct from old.sets_refresh_at) then
    raise exception 'Entitlements may only be changed by the billing service';
  end if;
  return new;
end;
$$;
