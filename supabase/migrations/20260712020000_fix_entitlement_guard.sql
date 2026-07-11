-- Fix: the entitlement guard blocked the atomic quota RPCs.
--
-- protect_profile_entitlements() gated on `auth.uid() is not null` on the
-- assumption that SECURITY DEFINER functions run without a JWT identity. They
-- do not: auth.uid() reads the request JWT claim and stays populated inside a
-- SECURITY DEFINER function (only the executing *role* changes). As written the
-- guard therefore fired on create_set_graph_with_quota()'s and
-- consume_set_quota()'s own sets_remaining/sets_refresh_at updates and aborted
-- the whole transaction — surfacing to users as "Failed to save generated set".
--
-- Correct discriminator: the executing role. A direct PostgREST write from the
-- client runs as `authenticated`; the trusted paths (SECURITY DEFINER quota
-- RPCs, owned by postgres, and the Stripe webhook via service_role) do not.

create or replace function public.protect_profile_entitlements()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  -- Only reject direct writes from the authenticated client role. SECURITY
  -- DEFINER quota RPCs (executing as the function owner) and the billing
  -- service (service_role) are trusted to adjust entitlements/quota.
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
