// Visit booking against a real Postgres: one booking, two people, separate connections.
// Runs only when FEVIO_TEST_DATABASE_URL points at a Postgres server where this user may create databases.
// Example: FEVIO_TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres npm run test:db
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const ADMIN_URL = process.env.FEVIO_TEST_DATABASE_URL;
const DB_NAME = 'fevio_visit_booking_test';
const root = join(__dirname, '..', '..');

const CLINIC = '00000000-0000-4000-8000-0000000000c1';
const STAFF = '00000000-0000-4000-8000-00000000057a';
const SEOYEON = '00000000-0000-4000-8000-000000000419';
const OTHER = '00000000-0000-4000-8000-000000000402';
const THIRD = '00000000-0000-4000-8000-000000000451';
const FOURTH = '00000000-0000-4000-8000-000000000447';

// Monday 2026-11-23, Asia/Seoul. Ultrasound slots every 20 minutes, 2 rooms.
const at = (hhmm: string) => `2026-11-23T${hhmm}:00+09:00`;
const SLOT_TIMES = ['08:00', '08:20', '08:40', '09:00', '09:20', '09:40', '10:00', '10:20', '10:40', '11:00', '11:20', '11:40'];
const PREBOOKED: Record<string, number> = { '09:00': 2, '09:20': 1, '09:40': 2, '10:20': 1, '11:00': 1 };

function dbUrl(name: string) {
  const u = new URL(ADMIN_URL as string);
  u.pathname = `/${name}`;
  return u.toString();
}

async function connectAs(userId: string | null) {
  const c = new Client({ connectionString: dbUrl(DB_NAME) });
  await c.connect();
  await c.query(userId ? 'set role authenticated' : 'set role anon');
  if (userId) await c.query(`select set_config('request.jwt.claim.sub', $1, false)`, [userId]);
  return c;
}

// One short-lived session per call: open, act, close. A new call is a fresh login/refresh.
async function as<T>(userId: string | null, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await connectAs(userId);
  try {
    return await fn(c);
  } finally {
    await c.end();
  }
}

let admin: Client;
const slotId: Record<string, string> = {};

async function readRequest(userId: string, requestId: string) {
  return as(userId, async (c) => {
    const r = await c.query(
      `select r.status, r.version, r.hope_start, r.hope_end,
              (select b.starts_at from visit_bookings b where b.request_id = r.id and b.status = 'active') as booked_at,
              (select p.starts_at from visit_proposals p where p.request_id = r.id and p.status = 'open') as proposed_at,
              (select count(*)::int from visit_bookings b where b.request_id = r.id and b.status = 'active') as active_bookings
         from visit_requests r where r.id = $1`,
      [requestId],
    );
    return r.rows[0];
  });
}

async function slotUsage(time: string) {
  return as(STAFF, async (c) => (await c.query('select booked, proposed_open, capacity from clinic_slot_usage where slot_id = $1', [slotId[time]])).rows[0]);
}

async function demandIds() {
  return as(STAFF, async (c) =>
    (await c.query('select request_id from visit_unconfirmed_demand where clinic_id = $1', [CLINIC])).rows.map((r) => r.request_id as string),
  );
}

async function offer(patient: string, purpose = '월 오전 추가 초음파 · 피검사', kind = 'visit') {
  return as(STAFF, async (c) =>
    (await c.query(`select * from visit_offer_window($1, $2, $3, $4, $5, $6)`, [CLINIC, patient, purpose, at('08:00'), at('12:00'), kind])).rows[0],
  );
}

describe.skipIf(!ADMIN_URL)('visit booking (Postgres)', () => {
  beforeAll(async () => {
    const boot = new Client({ connectionString: ADMIN_URL });
    await boot.connect();
    await boot.query(`drop database if exists ${DB_NAME} with (force)`);
    await boot.query(`create database ${DB_NAME}`);
    await boot.end();

    admin = new Client({ connectionString: dbUrl(DB_NAME) });
    await admin.connect();
    await admin.query(readFileSync(join(root, 'tests/db/supabase-auth-stub.sql'), 'utf8'));
    await admin.query(readFileSync(join(root, 'supabase/migrations/202611200001_visit_booking.sql'), 'utf8'));

    await admin.query(`insert into clinics (id, name) values ($1, '서울OO난임센터')`, [CLINIC]);
    await admin.query(`insert into clinic_staff (clinic_id, user_id, role) values ($1, $2, 'coordinator')`, [CLINIC, STAFF]);
    for (const p of [SEOYEON, OTHER, THIRD, FOURTH]) {
      await admin.query('insert into clinic_patients (clinic_id, user_id) values ($1, $2)', [CLINIC, p]);
    }
    for (const t of SLOT_TIMES) {
      const r = await admin.query(
        `insert into clinic_resource_slots (clinic_id, resource, starts_at, duration_minutes, capacity)
         values ($1, 'ultrasound', $2, 20, 2) returning id`,
        [CLINIC, at(t)],
      );
      slotId[t] = r.rows[0].id;
    }
    // Existing confirmed bookings from other patients.
    for (const [t, n] of Object.entries(PREBOOKED)) {
      for (let i = 0; i < n; i++) {
        const req = await admin.query(
          `insert into visit_requests (clinic_id, patient_user_id, purpose, window_start, window_end, status, created_by)
           values ($1, gen_random_uuid(), '기존 예약', $2, $3, 'confirmed', $4) returning id`,
          [CLINIC, at('08:00'), at('12:00'), STAFF],
        );
        await admin.query(`insert into visit_bookings (request_id, slot_id, starts_at, confirmed_by) values ($1, $2, $3, 'clinic_seed')`, [req.rows[0].id, slotId[t], at(t)]);
      }
    }
  });

  afterAll(async () => {
    await admin?.end();
  });

  let req: { id: string; version: number };
  let proposalId: string;

  it('환자가 보낸 희망 시간이 저장되고, 병원이 따로 접속해도 같은 상태를 본다', async () => {
    req = await offer(SEOYEON);
    expect(req).toMatchObject({ status: 'needs_time', version: 1 });

    const sent = await as(SEOYEON, async (c) =>
      (await c.query('select * from visit_send_hope($1, $2, $3, $4)', [req.id, at('09:00'), at('10:00'), 1])).rows[0],
    );
    expect(sent).toMatchObject({ status: 'assign_needed', version: 2 });

    const clinicView = await readRequest(STAFF, req.id);
    const patientView = await readRequest(SEOYEON, req.id);
    expect(clinicView).toEqual(patientView);
    expect(clinicView.status).toBe('assign_needed');
    expect(new Date(clinicView.hope_start).toISOString()).toBe(new Date(at('09:00')).toISOString());
  });

  it('새로고침(새 연결) 뒤에도 같은 한 건이 그대로 있다', async () => {
    const again = await readRequest(SEOYEON, req.id);
    expect(again).toMatchObject({ status: 'assign_needed', version: 2, active_bookings: 0 });
  });

  it('병원이 제안하면 환자 회신 대기로 옮기지만, 미확정 수요에서는 빠지지 않고 자원도 쓰지 않는다', async () => {
    const before = await slotUsage('10:40');
    const p = await as(STAFF, async (c) =>
      (await c.query(`select * from visit_propose($1, $2, now() + interval '2 hours', $3)`, [req.id, slotId['10:40'], 2])).rows[0],
    );
    proposalId = p.id;

    const view = await readRequest(SEOYEON, req.id);
    expect(view).toMatchObject({ status: 'patient_reply', active_bookings: 0 });
    expect(new Date(view.proposed_at).toISOString()).toBe(new Date(at('10:40')).toISOString());
    expect(await readRequest(STAFF, req.id)).toEqual(view);
    // 환자는 병원 자원(정원)을 직접 볼 수 없다
    expect((await as(SEOYEON, (c) => c.query('select id from clinic_resource_slots'))).rowCount).toBe(0);
    expect(await demandIds()).toContain(req.id);
    expect(await slotUsage('10:40')).toEqual({ ...before, proposed_open: before.proposed_open + 1 });
  });

  it('열어 둔 화면이 오래되면(버전이 다르면) 병원의 다음 조작이 거절된다', async () => {
    await expect(
      as(STAFF, (c) => c.query(`select visit_propose($1, $2, now() + interval '2 hours', $3)`, [req.id, slotId['11:20'], 2])),
    ).rejects.toThrow(/stale_version/);
  });

  it('환자가 수락했을 때만 예약과 자원 배정이 확정된다', async () => {
    const res = await as(SEOYEON, async (c) => (await c.query('select visit_accept_proposal($1) as r', [proposalId])).rows[0].r);
    expect(res.ok).toBe(true);

    const clinicView = await readRequest(STAFF, req.id);
    expect(clinicView.status).toBe('confirmed');
    expect(new Date(clinicView.booked_at).toISOString()).toBe(new Date(at('10:40')).toISOString());
    expect(await slotUsage('10:40')).toMatchObject({ booked: 1, proposed_open: 0 });
    expect(await demandIds()).not.toContain(req.id);
    expect(await readRequest(SEOYEON, req.id)).toEqual(clinicView);
  });

  it('같은 제안을 두 번 수락해도 예약은 하나다', async () => {
    const res = await as(SEOYEON, async (c) => (await c.query('select visit_accept_proposal($1) as r', [proposalId])).rows[0].r);
    expect(res).toMatchObject({ ok: false, reason: 'proposal_not_open' });
    expect((await readRequest(SEOYEON, req.id)).active_bookings).toBe(1);
  });

  it('변경 요청 중에는 기존 예약이 유지되고, 새 시간을 수락하는 순간에만 바뀐다', async () => {
    const v = (await readRequest(SEOYEON, req.id)).version;
    await as(SEOYEON, (c) => c.query('select visit_send_hope($1, $2, $3, $4)', [req.id, at('11:00'), at('12:00'), v]));

    let view = await readRequest(STAFF, req.id);
    expect(view.status).toBe('assign_needed');
    expect(new Date(view.booked_at).toISOString()).toBe(new Date(at('10:40')).toISOString());
    expect(await demandIds()).toContain(req.id);

    const p = await as(STAFF, async (c) =>
      (await c.query(`select * from visit_propose($1, $2, now() + interval '2 hours')`, [req.id, slotId['11:20']])).rows[0],
    );
    view = await readRequest(SEOYEON, req.id);
    expect(view.status).toBe('patient_reply');
    expect(new Date(view.booked_at).toISOString()).toBe(new Date(at('10:40')).toISOString());

    const res = await as(SEOYEON, async (c) => (await c.query('select visit_accept_proposal($1) as r', [p.id])).rows[0].r);
    expect(res.ok).toBe(true);
    view = await readRequest(STAFF, req.id);
    expect(new Date(view.booked_at).toISOString()).toBe(new Date(at('11:20')).toISOString());
    expect(view.active_bookings).toBe(1);
    expect((await slotUsage('10:40')).booked).toBe(0);
  });

  it('제안 뒤 같은 자리가 다른 환자에게 먼저 배정되면, 수락은 거절되고 기존 예약은 그대로다', async () => {
    // 서연은 11:20 예약을 가진 채 다시 변경 요청 → 병원이 10:20(남은 자리 1) 제안
    const v = (await readRequest(SEOYEON, req.id)).version;
    await as(SEOYEON, (c) => c.query('select visit_send_hope($1, $2, $3, $4)', [req.id, at('10:00'), at('10:40'), v]));
    const p = await as(STAFF, async (c) =>
      (await c.query(`select * from visit_propose($1, $2, now() + interval '2 hours')`, [req.id, slotId['10:20']])).rows[0],
    );

    // 그사이 다른 환자가 10:00–10:40을 보냈고, 코디네이터가 그 희망 안의 10:20을 배정
    const other = await offer(OTHER);
    await as(OTHER, (c) => c.query('select visit_send_hope($1, $2, $3)', [other.id, at('10:00'), at('10:40')]));
    const assigned = await as(STAFF, async (c) => (await c.query('select visit_assign_in_hope($1, $2) as r', [other.id, slotId['10:20']])).rows[0].r);
    expect(assigned.ok).toBe(true);
    expect((await slotUsage('10:20')).booked).toBe(2);

    const res = await as(SEOYEON, async (c) => (await c.query('select visit_accept_proposal($1) as r', [p.id])).rows[0].r);
    expect(res).toMatchObject({ ok: false, reason: 'slot_taken' });

    const view = await readRequest(STAFF, req.id);
    expect(view.status).toBe('assign_needed');
    expect(new Date(view.booked_at).toISOString()).toBe(new Date(at('11:20')).toISOString());
    expect((await slotUsage('10:20')).booked).toBe(2);
    const events = await as(STAFF, async (c) => (await c.query('select type from visit_booking_events where request_id = $1 order by id', [req.id])).rows.map((r) => r.type));
    expect(events.at(-1)).toBe('accept_rejected_slot_taken');
  });

  it('만료된 제안은 수락해도 확정되지 않는다', async () => {
    const r3 = await offer(THIRD);
    await as(THIRD, (c) => c.query('select visit_send_hope($1, $2, $3)', [r3.id, at('08:00'), at('09:00')]));
    const p = await as(STAFF, async (c) =>
      (await c.query(`select * from visit_propose($1, $2, now() + interval '1 second')`, [r3.id, slotId['08:40']])).rows[0],
    );
    await new Promise((resolve) => setTimeout(resolve, 1300));
    const res = await as(THIRD, async (c) => (await c.query('select visit_accept_proposal($1) as r', [p.id])).rows[0].r);
    expect(res).toMatchObject({ ok: false, reason: 'proposal_expired' });
    expect(await readRequest(STAFF, r3.id)).toMatchObject({ status: 'assign_needed', active_bookings: 0 });
    expect((await slotUsage('08:40')).booked).toBe(0);
    expect(await demandIds()).toContain(r3.id);
  });

  it('마지막 한 자리를 두 환자가 동시에 수락하면 한 명만 확정된다', async () => {
    // 11:00: 기존 예약 1, 남은 자리 1
    const a = await offer(THIRD, '월 오전 초음파');
    const b = await offer(FOURTH, '월 오전 초음파');
    await as(THIRD, (c) => c.query('select visit_send_hope($1, $2, $3)', [a.id, at('10:40'), at('11:40')]));
    await as(FOURTH, (c) => c.query('select visit_send_hope($1, $2, $3)', [b.id, at('10:40'), at('11:40')]));
    const pa = await as(STAFF, async (c) => (await c.query(`select * from visit_propose($1, $2, now() + interval '1 hour')`, [a.id, slotId['11:00']])).rows[0]);
    const pb = await as(STAFF, async (c) => (await c.query(`select * from visit_propose($1, $2, now() + interval '1 hour')`, [b.id, slotId['11:00']])).rows[0]);

    const [ca, cb] = await Promise.all([connectAs(THIRD), connectAs(FOURTH)]);
    try {
      const [ra, rb] = await Promise.all([
        ca.query('select visit_accept_proposal($1) as r', [pa.id]),
        cb.query('select visit_accept_proposal($1) as r', [pb.id]),
      ]);
      const results = [ra.rows[0].r, rb.rows[0].r];
      expect(results.filter((r) => r.ok)).toHaveLength(1);
      expect(results.filter((r) => !r.ok)[0].reason).toBe('slot_taken');
    } finally {
      await Promise.all([ca.end(), cb.end()]);
    }
    expect((await slotUsage('11:00')).booked).toBe(2);
  });

  it('다른 환자는 이 예약을 볼 수 없고, 누구도 표를 직접 고칠 수 없다', async () => {
    expect((await as(OTHER, (c) => c.query('select id from visit_requests where id = $1', [req.id]))).rowCount).toBe(0);
    expect((await as(OTHER, (c) => c.query('select id from visit_bookings b where b.request_id = $1', [req.id]))).rowCount).toBe(0);
    await expect(as(null, (c) => c.query('select id from visit_requests'))).rejects.toThrow(/permission denied/);
    await expect(
      as(SEOYEON, (c) => c.query(`insert into visit_bookings (request_id, slot_id, starts_at, confirmed_by) values ($1, $2, $3, 'patient_accept')`, [req.id, slotId['08:00'], at('08:00')])),
    ).rejects.toThrow(/permission denied/);
    await expect(
      as(SEOYEON, (c) => c.query(`update visit_requests set status = 'confirmed' where id = $1`, [req.id])),
    ).rejects.toThrow(/permission denied/);
  });

  it('환자는 제안·배정을 할 수 없고, 시술 날짜는 협의 대상이 아니다', async () => {
    await expect(
      as(SEOYEON, (c) => c.query(`select visit_propose($1, $2, now() + interval '1 hour')`, [req.id, slotId['08:00']])),
    ).rejects.toThrow(/visit_staff_only/);
    const proc = await offer(SEOYEON, '채취', 'procedure');
    await expect(
      as(SEOYEON, (c) => c.query('select visit_send_hope($1, $2, $3)', [proc.id, at('08:00'), at('09:00')])),
    ).rejects.toThrow(/visit_procedure_not_negotiable/);
  });
});
