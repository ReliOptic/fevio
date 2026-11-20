-- Visit booking: one negotiated visit between a patient and a clinic.
--
-- Flow: clinic offers a window -> patient sends the times they can come -> clinic proposes a slot
-- (or assigns one inside the patient's own times) -> patient accepts -> booking.
-- A proposal never consumes capacity. Only an accepted proposal or an in-hope assignment
-- creates a booking, and both re-check capacity under a row lock on the slot.
-- During a change request the existing booking stays active until the new time is booked.
-- Procedures (retrieval, transfer) are clinic-decided and cannot be negotiated here.
--
-- All writes go through security definer functions. Tables are read-only to authenticated
-- users through RLS (patient: own rows, staff: own clinic rows). anon has no access.

create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.clinic_staff (
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('coordinator', 'nurse', 'physician', 'lab', 'admin')),
  primary key (clinic_id, user_id)
);

create table if not exists public.clinic_patients (
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  user_id uuid not null,
  primary key (clinic_id, user_id)
);

create table if not exists public.clinic_resource_slots (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  resource text not null check (resource in ('ultrasound', 'retrieval_room', 'embryology')),
  starts_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes > 0),
  capacity integer not null check (capacity > 0),
  unique (clinic_id, resource, starts_at)
);

create table if not exists public.visit_requests (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_user_id uuid not null,
  purpose text not null,
  kind text not null default 'visit' check (kind in ('visit', 'procedure')),
  resource text not null default 'ultrasound' check (resource in ('ultrasound', 'retrieval_room', 'embryology')),
  window_start timestamptz not null,
  window_end timestamptz not null,
  status text not null default 'needs_time'
    check (status in ('needs_time', 'assign_needed', 'patient_reply', 'confirmed')),
  hope_start timestamptz,
  hope_end timestamptz,
  hope_sent_at timestamptz,
  version integer not null default 1,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (window_end > window_start),
  check ((hope_start is null) = (hope_end is null)),
  check (hope_end is null or hope_end > hope_start)
);

create table if not exists public.visit_proposals (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.visit_requests(id) on delete cascade,
  slot_id uuid not null references public.clinic_resource_slots(id),
  starts_at timestamptz not null, -- copied from the slot so the patient can read the time without slot access
  proposed_by uuid not null,
  proposed_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'open' check (status in ('open', 'accepted', 'expired', 'superseded', 'conflict')),
  resolved_at timestamptz
);

create unique index if not exists visit_proposals_one_open
  on public.visit_proposals (request_id) where status = 'open';

create table if not exists public.visit_bookings (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.visit_requests(id) on delete cascade,
  slot_id uuid not null references public.clinic_resource_slots(id),
  starts_at timestamptz not null, -- copied from the slot; patients cannot read clinic_resource_slots
  status text not null default 'active' check (status in ('active', 'replaced', 'cancelled')),
  confirmed_by text not null check (confirmed_by in ('patient_accept', 'staff_assign_in_hope', 'clinic_seed')),
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create unique index if not exists visit_bookings_one_active
  on public.visit_bookings (request_id) where status = 'active';
create index if not exists visit_bookings_slot_active
  on public.visit_bookings (slot_id) where status = 'active';

create table if not exists public.visit_booking_events (
  id bigserial primary key,
  request_id uuid not null references public.visit_requests(id) on delete cascade,
  type text not null,
  actor_user_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default clock_timestamp()
);

-- Access helpers ---------------------------------------------------------------------------

create or replace function public.is_clinic_staff(p_clinic_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.clinic_staff s
    where s.clinic_id = p_clinic_id and s.user_id = auth.uid()
  );
$$;

-- RLS --------------------------------------------------------------------------------------

alter table public.clinics enable row level security;
alter table public.clinic_staff enable row level security;
alter table public.clinic_patients enable row level security;
alter table public.clinic_resource_slots enable row level security;
alter table public.visit_requests enable row level security;
alter table public.visit_proposals enable row level security;
alter table public.visit_bookings enable row level security;
alter table public.visit_booking_events enable row level security;

revoke all on public.clinics, public.clinic_staff, public.clinic_patients, public.clinic_resource_slots,
  public.visit_requests, public.visit_proposals, public.visit_bookings, public.visit_booking_events from anon;
revoke insert, update, delete on public.clinics, public.clinic_staff, public.clinic_patients, public.clinic_resource_slots,
  public.visit_requests, public.visit_proposals, public.visit_bookings, public.visit_booking_events from authenticated;
grant select on public.clinics, public.clinic_staff, public.clinic_patients, public.clinic_resource_slots,
  public.visit_requests, public.visit_proposals, public.visit_bookings, public.visit_booking_events to authenticated;

drop policy if exists clinics_member_read on public.clinics;
create policy clinics_member_read on public.clinics for select to authenticated
  using (public.is_clinic_staff(id) or exists (select 1 from public.clinic_patients p where p.clinic_id = id and p.user_id = auth.uid()));

drop policy if exists clinic_staff_read on public.clinic_staff;
create policy clinic_staff_read on public.clinic_staff for select to authenticated
  using (user_id = auth.uid() or public.is_clinic_staff(clinic_id));

drop policy if exists clinic_patients_read on public.clinic_patients;
create policy clinic_patients_read on public.clinic_patients for select to authenticated
  using (user_id = auth.uid() or public.is_clinic_staff(clinic_id));

drop policy if exists clinic_slots_staff_read on public.clinic_resource_slots;
create policy clinic_slots_staff_read on public.clinic_resource_slots for select to authenticated
  using (public.is_clinic_staff(clinic_id));

drop policy if exists visit_requests_read on public.visit_requests;
create policy visit_requests_read on public.visit_requests for select to authenticated
  using (patient_user_id = auth.uid() or public.is_clinic_staff(clinic_id));

drop policy if exists visit_proposals_read on public.visit_proposals;
create policy visit_proposals_read on public.visit_proposals for select to authenticated
  using (exists (select 1 from public.visit_requests r where r.id = request_id
                 and (r.patient_user_id = auth.uid() or public.is_clinic_staff(r.clinic_id))));

drop policy if exists visit_bookings_read on public.visit_bookings;
create policy visit_bookings_read on public.visit_bookings for select to authenticated
  using (exists (select 1 from public.visit_requests r where r.id = request_id
                 and (r.patient_user_id = auth.uid() or public.is_clinic_staff(r.clinic_id))));

drop policy if exists visit_booking_events_read on public.visit_booking_events;
create policy visit_booking_events_read on public.visit_booking_events for select to authenticated
  using (exists (select 1 from public.visit_requests r where r.id = request_id
                 and (r.patient_user_id = auth.uid() or public.is_clinic_staff(r.clinic_id))));

-- Read models ------------------------------------------------------------------------------

-- Unconfirmed demand: one row per request (never one per possible time). A request waiting
-- for the patient's reply to a proposal is still unconfirmed demand.
create or replace view public.visit_unconfirmed_demand
with (security_invoker = true) as
select r.id as request_id, r.clinic_id, r.resource, r.status, r.hope_start, r.hope_end,
       (select b.slot_id from public.visit_bookings b where b.request_id = r.id and b.status = 'active') as kept_slot_id
from public.visit_requests r
where r.kind = 'visit' and r.status in ('needs_time', 'assign_needed', 'patient_reply');

-- Slot usage: only active bookings consume capacity. Open proposals are shown separately.
create or replace view public.clinic_slot_usage
with (security_invoker = true) as
select s.id as slot_id, s.clinic_id, s.resource, s.starts_at, s.capacity,
       (select count(*) from public.visit_bookings b where b.slot_id = s.id and b.status = 'active')::int as booked,
       (select count(*) from public.visit_proposals p where p.slot_id = s.id and p.status = 'open')::int as proposed_open
from public.clinic_resource_slots s;

grant select on public.visit_unconfirmed_demand, public.clinic_slot_usage to authenticated;
revoke all on public.visit_unconfirmed_demand, public.clinic_slot_usage from anon;

-- Internal helpers -------------------------------------------------------------------------

create or replace function public.visit__event(p_request_id uuid, p_type text, p_payload jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.visit_booking_events (request_id, type, actor_user_id, payload)
  values (p_request_id, p_type, auth.uid(), coalesce(p_payload, '{}'::jsonb));
$$;

create or replace function public.visit__check_version(p_request public.visit_requests, p_expected integer)
returns void
language plpgsql
as $$
begin
  if p_expected is not null and p_expected <> p_request.version then
    raise exception 'visit_request_stale_version: expected %, current %', p_expected, p_request.version using errcode = '40001';
  end if;
end;
$$;

-- Book a slot for a request under a row lock on the slot. Returns null when the slot is full.
-- Replaces the request's existing active booking only when the new booking succeeds.
create or replace function public.visit__book(p_request_id uuid, p_slot_id uuid, p_confirmed_by text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot public.clinic_resource_slots;
  v_booked integer;
  v_booking_id uuid;
begin
  select * into v_slot from public.clinic_resource_slots where id = p_slot_id for update;
  select count(*) into v_booked from public.visit_bookings
    where slot_id = p_slot_id and status = 'active' and request_id <> p_request_id;
  if v_booked >= v_slot.capacity then
    return null;
  end if;
  update public.visit_bookings set status = 'replaced', ended_at = now()
    where request_id = p_request_id and status = 'active';
  insert into public.visit_bookings (request_id, slot_id, starts_at, confirmed_by)
    values (p_request_id, p_slot_id, v_slot.starts_at, p_confirmed_by)
    returning id into v_booking_id;
  return v_booking_id;
end;
$$;

-- Public RPCs ------------------------------------------------------------------------------

-- Clinic offers a visit window that the patient can negotiate within.
create or replace function public.visit_offer_window(
  p_clinic_id uuid, p_patient_user_id uuid, p_purpose text,
  p_window_start timestamptz, p_window_end timestamptz, p_kind text default 'visit', p_resource text default 'ultrasound'
)
returns public.visit_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.visit_requests;
begin
  if auth.uid() is null or not public.is_clinic_staff(p_clinic_id) then
    raise exception 'visit_staff_only' using errcode = '42501';
  end if;
  if not exists (select 1 from public.clinic_patients where clinic_id = p_clinic_id and user_id = p_patient_user_id) then
    raise exception 'visit_patient_not_in_clinic' using errcode = '42501';
  end if;
  insert into public.visit_requests (clinic_id, patient_user_id, purpose, kind, resource, window_start, window_end, created_by)
    values (p_clinic_id, p_patient_user_id, p_purpose, p_kind, p_resource, p_window_start, p_window_end, auth.uid())
    returning * into v_request;
  perform public.visit__event(v_request.id, 'window_offered',
    jsonb_build_object('window_start', p_window_start, 'window_end', p_window_end, 'kind', p_kind));
  return v_request;
end;
$$;

-- Patient sends the times they can come. On a confirmed request this is a change request:
-- the active booking stays until a new time is booked.
create or replace function public.visit_send_hope(
  p_request_id uuid, p_hope_start timestamptz, p_hope_end timestamptz, p_expected_version integer default null
)
returns public.visit_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.visit_requests;
  v_is_change boolean;
begin
  select * into v_request from public.visit_requests where id = p_request_id for update;
  if v_request.id is null or v_request.patient_user_id is distinct from auth.uid() then
    raise exception 'visit_request_not_found' using errcode = 'P0002';
  end if;
  if v_request.kind <> 'visit' then
    raise exception 'visit_procedure_not_negotiable' using errcode = '42501';
  end if;
  perform public.visit__check_version(v_request, p_expected_version);
  if p_hope_end <= p_hope_start or p_hope_start < v_request.window_start or p_hope_end > v_request.window_end then
    raise exception 'visit_hope_outside_window' using errcode = '22023';
  end if;

  v_is_change := v_request.status = 'confirmed';
  update public.visit_proposals set status = 'superseded', resolved_at = now()
    where request_id = p_request_id and status = 'open';
  update public.visit_requests
    set status = 'assign_needed', hope_start = p_hope_start, hope_end = p_hope_end, hope_sent_at = now(),
        version = version + 1, updated_at = now()
    where id = p_request_id
    returning * into v_request;
  perform public.visit__event(p_request_id, case when v_is_change then 'change_requested' else 'hope_sent' end,
    jsonb_build_object('hope_start', p_hope_start, 'hope_end', p_hope_end));
  return v_request;
end;
$$;

-- Clinic proposes a slot. Moves the request to patient_reply; consumes no capacity.
create or replace function public.visit_propose(
  p_request_id uuid, p_slot_id uuid, p_expires_at timestamptz, p_expected_version integer default null
)
returns public.visit_proposals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.visit_requests;
  v_slot public.clinic_resource_slots;
  v_booked integer;
  v_proposal public.visit_proposals;
begin
  select * into v_request from public.visit_requests where id = p_request_id for update;
  if v_request.id is null or not public.is_clinic_staff(v_request.clinic_id) then
    raise exception 'visit_staff_only' using errcode = '42501';
  end if;
  perform public.visit__check_version(v_request, p_expected_version);
  select * into v_slot from public.clinic_resource_slots where id = p_slot_id;
  if v_slot.id is null or v_slot.clinic_id <> v_request.clinic_id or v_slot.resource <> v_request.resource
     or v_slot.starts_at < v_request.window_start or v_slot.starts_at >= v_request.window_end then
    raise exception 'visit_slot_outside_window' using errcode = '22023';
  end if;
  if p_expires_at <= now() then
    raise exception 'visit_proposal_expiry_in_past' using errcode = '22023';
  end if;
  select count(*) into v_booked from public.visit_bookings where slot_id = p_slot_id and status = 'active';
  if v_booked >= v_slot.capacity then
    raise exception 'visit_slot_full' using errcode = '23P01';
  end if;

  update public.visit_proposals set status = 'superseded', resolved_at = now()
    where request_id = p_request_id and status = 'open';
  insert into public.visit_proposals (request_id, slot_id, starts_at, proposed_by, expires_at)
    values (p_request_id, p_slot_id, v_slot.starts_at, auth.uid(), p_expires_at)
    returning * into v_proposal;
  update public.visit_requests set status = 'patient_reply', version = version + 1, updated_at = now()
    where id = p_request_id;
  perform public.visit__event(p_request_id, 'proposed',
    jsonb_build_object('proposal_id', v_proposal.id, 'slot_id', p_slot_id, 'expires_at', p_expires_at));
  return v_proposal;
end;
$$;

-- Clinic assigns a slot that lies inside the times the patient sent. The patient already
-- consented to that range, so this books immediately (with the same capacity lock).
create or replace function public.visit_assign_in_hope(
  p_request_id uuid, p_slot_id uuid, p_expected_version integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.visit_requests;
  v_slot public.clinic_resource_slots;
  v_booking_id uuid;
begin
  select * into v_request from public.visit_requests where id = p_request_id for update;
  if v_request.id is null or not public.is_clinic_staff(v_request.clinic_id) then
    raise exception 'visit_staff_only' using errcode = '42501';
  end if;
  perform public.visit__check_version(v_request, p_expected_version);
  select * into v_slot from public.clinic_resource_slots where id = p_slot_id;
  if v_request.hope_start is null or v_slot.starts_at < v_request.hope_start or v_slot.starts_at >= v_request.hope_end
     or v_slot.clinic_id <> v_request.clinic_id or v_slot.resource <> v_request.resource then
    raise exception 'visit_slot_outside_hope' using errcode = '22023';
  end if;

  v_booking_id := public.visit__book(p_request_id, p_slot_id, 'staff_assign_in_hope');
  if v_booking_id is null then
    perform public.visit__event(p_request_id, 'assign_rejected_slot_full', jsonb_build_object('slot_id', p_slot_id));
    return jsonb_build_object('ok', false, 'reason', 'slot_full');
  end if;
  update public.visit_proposals set status = 'superseded', resolved_at = now()
    where request_id = p_request_id and status = 'open';
  update public.visit_requests set status = 'confirmed', version = version + 1, updated_at = now()
    where id = p_request_id;
  perform public.visit__event(p_request_id, 'booked',
    jsonb_build_object('booking_id', v_booking_id, 'slot_id', p_slot_id, 'by', 'staff_assign_in_hope'));
  return jsonb_build_object('ok', true, 'booking_id', v_booking_id);
end;
$$;

-- Patient accepts a proposal. This is the only point where a proposal becomes a booking.
-- Returns {ok:false, reason} instead of raising, so the rejection itself is recorded:
--   proposal_not_open  the proposal was superseded or already resolved
--   proposal_expired   the proposal passed its expiry; the request goes back to assign_needed
--   slot_taken         the slot filled up meanwhile; the request goes back to assign_needed
-- In every rejection an existing active booking (change request) is left untouched.
create or replace function public.visit_accept_proposal(p_proposal_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proposal public.visit_proposals;
  v_request public.visit_requests;
  v_booking_id uuid;
begin
  select * into v_proposal from public.visit_proposals where id = p_proposal_id;
  if v_proposal.id is null then
    raise exception 'visit_proposal_not_found' using errcode = 'P0002';
  end if;
  select * into v_request from public.visit_requests where id = v_proposal.request_id for update;
  if v_request.patient_user_id is distinct from auth.uid() then
    raise exception 'visit_proposal_not_found' using errcode = 'P0002';
  end if;
  select * into v_proposal from public.visit_proposals where id = p_proposal_id for update;

  if v_proposal.status <> 'open' then
    return jsonb_build_object('ok', false, 'reason', 'proposal_not_open', 'proposal_status', v_proposal.status);
  end if;

  if v_proposal.expires_at <= now() then
    update public.visit_proposals set status = 'expired', resolved_at = now() where id = p_proposal_id;
    update public.visit_requests set status = 'assign_needed', version = version + 1, updated_at = now()
      where id = v_request.id;
    perform public.visit__event(v_request.id, 'accept_rejected_expired', jsonb_build_object('proposal_id', p_proposal_id));
    return jsonb_build_object('ok', false, 'reason', 'proposal_expired');
  end if;

  v_booking_id := public.visit__book(v_request.id, v_proposal.slot_id, 'patient_accept');
  if v_booking_id is null then
    update public.visit_proposals set status = 'conflict', resolved_at = now() where id = p_proposal_id;
    update public.visit_requests set status = 'assign_needed', version = version + 1, updated_at = now()
      where id = v_request.id;
    perform public.visit__event(v_request.id, 'accept_rejected_slot_taken',
      jsonb_build_object('proposal_id', p_proposal_id, 'slot_id', v_proposal.slot_id));
    return jsonb_build_object('ok', false, 'reason', 'slot_taken');
  end if;

  update public.visit_proposals set status = 'accepted', resolved_at = now() where id = p_proposal_id;
  update public.visit_requests set status = 'confirmed', version = version + 1, updated_at = now()
    where id = v_request.id;
  perform public.visit__event(v_request.id, 'booked',
    jsonb_build_object('booking_id', v_booking_id, 'slot_id', v_proposal.slot_id, 'by', 'patient_accept'));
  return jsonb_build_object('ok', true, 'booking_id', v_booking_id);
end;
$$;

revoke all on function public.visit__event(uuid, text, jsonb) from public, anon, authenticated;
revoke all on function public.visit__check_version(public.visit_requests, integer) from public, anon, authenticated;
revoke all on function public.visit__book(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.is_clinic_staff(uuid) from public, anon;
grant execute on function public.is_clinic_staff(uuid) to authenticated;

revoke all on function public.visit_offer_window(uuid, uuid, text, timestamptz, timestamptz, text, text) from public, anon;
revoke all on function public.visit_send_hope(uuid, timestamptz, timestamptz, integer) from public, anon;
revoke all on function public.visit_propose(uuid, uuid, timestamptz, integer) from public, anon;
revoke all on function public.visit_assign_in_hope(uuid, uuid, integer) from public, anon;
revoke all on function public.visit_accept_proposal(uuid) from public, anon;
grant execute on function public.visit_offer_window(uuid, uuid, text, timestamptz, timestamptz, text, text) to authenticated;
grant execute on function public.visit_send_hope(uuid, timestamptz, timestamptz, integer) to authenticated;
grant execute on function public.visit_propose(uuid, uuid, timestamptz, integer) to authenticated;
grant execute on function public.visit_assign_in_hope(uuid, uuid, integer) to authenticated;
grant execute on function public.visit_accept_proposal(uuid) to authenticated;
