'use strict';
/* ===== Design constants and row helpers (unchanged from the Fevio canvas, F3Loop) ===== */
var NOOP = function () {};
var INK = '#0E0F11', INK2 = '#575A62', INK3 = '#8A8D94', SIGNAL = '#1F5BFF', LINE = '#E4E4E7', ALERT = '#D92D20';
var PEN = 'M4 20l4-1 10-10-3-3L5 16zM14 7l3 3', VIAL = 'M9 3h6M10 3v4l-3 4v8a2 2 0 002 2h6a2 2 0 002-2v-8l-3-4V3M7 14h10';
var IC = {
  search: 'M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4', phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z',
  syringe: 'M4 20l4-1 10-10-3-3L5 16zM14 7l3 3', doc: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5', bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 016 0v2',
  clock: 'M12 7v5l3 2M12 3a9 9 0 110 18 9 9 0 010-18z', eye: 'M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6zM12 9a3 3 0 100 6 3 3 0 000-6z',
  camera: 'M4 8.5A2.5 2.5 0 016.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0120 8.5v8a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 16.5zM12 9a3.5 3.5 0 100 7 3.5 3.5 0 000-7z',
  photo: 'M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9h.01', cal: 'M3.5 5h17v15.5h-17zM3.5 9.5h17M8 3v4M16 3v4',
  today: 'M12 3.5a8.5 8.5 0 110 17 8.5 8.5 0 010-17zM12 12V6.5M12 12l3.5 2.5',
  people: 'M9 11.7a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4zM3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5M16.8 12.1a2.6 2.6 0 100-5.2 2.6 2.6 0 000 5.2zM16.5 14.6c2.4.1 4 1.6 4.5 4.4',
  q: 'M9.5 9a2.5 2.5 0 115 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01M12 3a9 9 0 110 18 9 9 0 010-18z'
};
var ICP = { doc: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5', cold: 'M7 3h10l1 5H6zM6 8h12v13H6zM10 12h4', car: 'M5 16V11l2-5h10l2 5v5M5 16h14M7 19v-3M17 19v-3M7.5 13h.01M16.5 13h.01', bag: IC.bag, cal: IC.cal, clock: IC.clock };
var MARK = {
  msDone: { ms: 22, mr: '11px', rot: 0, mBg: INK, mRing: INK, mt: 6, pulse: '', pad: '6px 0 12px 0', numInk: '#FFFFFF' },
  msNow: { ms: 24, mr: '12px', rot: 0, mBg: SIGNAL, mRing: SIGNAL, mt: 5, pulse: 'pulse', pad: '6px 0 10px 0', numInk: '#FFFFFF' },
  msNext: { ms: 22, mr: '11px', rot: 0, mBg: '#F4F4F5', mRing: '#C7C7CC', mt: 6, pulse: '', pad: '6px 0 12px 0', numInk: '#8A8D94' },
  past: { ms: 8, mr: '4px', rot: 0, mBg: '#A1A1AA', mRing: '#A1A1AA', mt: 11, pulse: '', pad: '6px 0 12px 0' },
  gate: { ms: 14, mr: '3px', rot: 45, mBg: '#FFFFFF', mRing: INK, mt: 13, pulse: '', pad: '8px 0 14px 0' },
  fixed: { ms: 14, mr: '7px', rot: 0, mBg: '#FFFFFF', mRing: INK, mt: 12, pulse: '', pad: '8px 0 14px 0' },
  open: { ms: 10, mr: '5px', rot: 0, mBg: '#FFFFFF', mRing: SIGNAL, mt: 18, pulse: '', pad: '8px 0 14px 0' }
};
var DASH = 'repeating-linear-gradient(#C7C7CC 0 4px, transparent 4px 8px)';
function row(kind, t, d, sub, extra) {
  var m = MARK[kind];
  var r = { num: '', numInk: INK, cardBg: 'transparent', cardM: '0', cardEdge: 'none', anchor: '', tap: NOOP, cursor: 'default', hasRoom: false, room: '', roomTap: NOOP, t: t, d: d || '', sub: sub || '', hasSub: !!sub,
    ts: kind === 'gate' || kind === 'fixed' ? 16 : (kind === 'past' ? 13 : 14), tw: kind === 'past' ? 600 : 800,
    ink: kind === 'past' ? INK2 : INK, dInk: INK2, subInk: INK2,
    line: kind === 'past' ? '#C7C7CC' : DASH,
    hasChip: false, chip: '', chipBg: '#FFFFFF', chipInk: INK, chipEdge: 'none', chipH: 28, chipFs: 13,
    hasRing: false, ringOff: 0, ringSecs: 1, ringLeft: '', ringLabel: '', hasFork: false, lanes: [], hasWin: false, days: [], wl: 0, ww: 0, winBg: '', winCls: '', winNote: '', winNoteInk: INK2, hasFunnel: false, funnel: [] };
  Object.assign(r, m);
  if (kind === 'msNow') r.anchor = 'f3-now';
  if (kind === 'msDone' || kind === 'msNow' || kind === 'msNext') {
    r.ts = kind === 'msNow' ? 18 : 15; r.tw = 800; r.ink = kind === 'msNext' ? '#8A8D94' : (kind === 'msDone' ? INK2 : INK);
    r.dInk = kind === 'msNow' ? SIGNAL : '#8A8D94'; r.subInk = kind === 'msNext' ? '#A1A1AA' : INK2;
    r.line = kind === 'msDone' ? INK : (kind === 'msNow' ? 'linear-gradient(' + INK + ' 0 14px, transparent 14px), ' + DASH : DASH);
  }
  if (kind === 'past' || kind === 'gate' || kind === 'fixed') { r.cardBg = '#FFFFFF'; r.cardM = '0 0 8px 0'; r.pad = '10px 12px'; r.cardEdge = kind === 'past' ? 'none' : 'inset 0 0 0 1px #E4E4E7'; r.mt = kind === 'gate' ? 16 : 17; r.ts = kind === 'past' ? 13 : 15; }
  if (kind === 'open') { r.cardBg = 'transparent'; r.cardM = '0 0 8px 0'; r.pad = '10px 12px'; r.cardEdge = 'inset 0 0 0 1px rgba(31,91,255,0.4)'; r.ink = SIGNAL; r.ts = 14; r.tw = 700; r.mt = 18; }
  return Object.assign(r, extra || {});
}
function tint(hex, al) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + al + ')'; }
function me(t) { return { from: 'u', text: t }; }
function fv(t) { return { from: 'f', text: t }; }
function card(kicker, body, foot, kind, acts) { return { from: 'f', card: { kicker: kicker, body: body, foot: foot, kind: kind, acts: acts || [] } }; }
function splitTimeline(rows, withPlan) {
  var cut = withPlan && rows.planAt != null ? rows.planAt : rows.length;
  var prev = rows[cut - 1];
  return { after: rows.slice(cut).reverse(), before: rows.slice(0, cut).reverse(), line: prev && prev.line.indexOf('gradient') < 0 ? prev.line : DASH };
}
// The fixed IVF path. Every patient sees all seven nodes from the first open; only the position comes from their data.
var MILESTONES = ['주기 시작', '과배란 주사', '트리거', '채취', '수정 · 배양', '이식 또는 동결', '판정 피검사'];
var STAGE_PICK = ['시작 전이에요', '과배란 주사 중', '트리거 맞았어요', '채취 끝났어요', '배양 중이에요', '이식 끝났어요', '판정 기다려요'];
var MS_OF = { dose: 1, trigger: 2, retrieval: 3, call: 4, transfer: 5, test: 6 };
var TABS = [['plan', '일정', IC.cal], ['today', '오늘', IC.today], ['together', '함께', IC.people]];
var AV = ['#7A8BA8', '#A88A7A', '#7AA89A', '#9A7AA8', '#A8A07A', '#7A9AA8'];

/* ===== Clock: real time, or the demo's day when the demo is playing ===== */
var CLOCK = { base: null, set: 0 };
var nowMs = () => CLOCK.base == null ? Date.now() : CLOCK.base + (Date.now() - CLOCK.set);
/* ===== Dates ===== */
var pad = (n) => String(n).padStart(2, '0');
var ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
var parseYmd = (s) => { var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
var addDays = (d, n) => { var x = new Date(d); x.setDate(x.getDate() + n); return x; };
var DOW = ['일', '월', '화', '수', '목', '금', '토'];
var today0 = () => { var d = new Date(nowMs()); d.setHours(0, 0, 0, 0); return d; };
var TODAY = () => ymd(today0());
var mondayOf = (d) => { var x = new Date(d); x.setDate(x.getDate() - (x.getDay() + 6) % 7); x.setHours(0, 0, 0, 0); return x; };
var mdl = (s) => { var d = parseYmd(s); return (d.getMonth() + 1) + '.' + d.getDate(); };
var dmd = (s) => { var d = parseYmd(s); return DOW[d.getDay()] + ' ' + (d.getMonth() + 1) + '.' + d.getDate(); };
var hm = (ts) => { var d = new Date(ts); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
var nowHM = () => { var d = new Date(nowMs()); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
var daysBetween = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 864e5);

/* ===== Clinic text → candidates (deterministic; the user confirms before anything is saved) ===== */
var KINDS = [['visit', '진료·검사'], ['dose', '투약'], ['trigger', '트리거'], ['retrieval', '채취'], ['transfer', '이식'], ['test', '판정'], ['call', '연구실'], ['open', '미정'], ['skip', '빼기']];
var KLABEL = Object.fromEntries(KINDS);
function guessKind(s) {
  if (/^\s*\[[^\]]*\]|진료\s*뒤\s*계획|안내\s*드립니다$|^안녕|붙여\s*넣으면/.test(s)) return 'skip';
  if (/미정|정해지|추후|안내\s*예정|결과\s*(보고|를\s*보고)|나중에/.test(s)) return 'open';
  if (/트리거|hcg|오비드렐|난포\s*터/i.test(s)) return 'trigger';
  if (/채취/.test(s)) return 'retrieval';
  if (/이식/.test(s)) return 'transfer';
  if (/판정|임신\s*검사|베타/.test(s)) return 'test';
  if (/연구실|배아|수정\s*확인|배양/.test(s)) return 'call';
  if (/주사|iu|펜|용량|투약|복용|약\b/i.test(s)) return 'dose';
  if (/초음파|피검사|내원|진료|방문|검사|예약/.test(s)) return 'visit';
  return 'skip';
}
function findDate(s, base) {
  var m = s.match(/(\d{1,2})\s*[\/.월]\s*(\d{1,2})\s*일?/);
  if (m) { var mo = +m[1], da = +m[2]; if (mo >= 1 && mo <= 12 && da >= 1 && da <= 31) { var d = new Date(base.getFullYear(), mo - 1, da); if (d < addDays(base, -60)) d = new Date(base.getFullYear() + 1, mo - 1, da); return ymd(d); } }
  m = s.match(/(?:^|[^\d\/.])(\d{1,2})\s*일(?![가-힣]*간)/);
  if (m && +m[1] >= 1 && +m[1] <= 31) { var d2 = new Date(base.getFullYear(), base.getMonth(), +m[1]); if (d2 < addDays(base, -7)) d2 = new Date(base.getFullYear(), base.getMonth() + 1, +m[1]); return ymd(d2); }
  if (/오늘/.test(s)) return ymd(base);
  if (/내일/.test(s)) return ymd(addDays(base, 1));
  if (/모레/.test(s)) return ymd(addDays(base, 2));
  m = s.match(/(월|화|수|목|금|토|일)요일/);
  if (m) { var want = DOW.indexOf(m[1]), k = (want - base.getDay() + 7) % 7; if (k === 0) k = 7; return ymd(addDays(base, k)); }
  return '';
}
function findTime(s) {
  var m = s.match(/(\d{1,2}):(\d{2})/);
  if (m && +m[1] < 24 && +m[2] < 60) return pad(+m[1]) + ':' + m[2];
  m = s.match(/(오전|오후|밤|저녁|아침)?\s*(\d{1,2})\s*시\s*(?:(\d{1,2})\s*분|반)?/);
  if (m && !/부터\s*금식/.test(s.slice(m.index, m.index + 10))) {
    var h = +m[2], mi = m[3] ? +m[3] : (/반/.test(m[0]) ? 30 : 0);
    if ((m[1] === '오후' || m[1] === '밤' || m[1] === '저녁') && h < 12) h += 12;
    if (h < 24) return pad(h) + ':' + pad(mi);
  }
  return '';
}
function findTo(s, base) {
  var m = s.match(/~\s*(\d{1,2})\s*[\/.]\s*(\d{1,2})|(\d{1,2})\s*[\/.]\s*(\d{1,2})\s*(?:일)?\s*까지/);
  if (!m) return '';
  var mo = +(m[1] || m[3]), da = +(m[2] || m[4]), d = new Date(base.getFullYear(), mo - 1, da);
  if (d < addDays(base, -60)) d = new Date(base.getFullYear() + 1, mo - 1, da);
  return ymd(d);
}
function stripMeta(s) {
  return s.replace(/^[^:：\d]{1,10}[:：]\s*/, '')
    .replace(/\(\s*(월|화|수|목|금|토|일)\s*\)/g, ' ')
    .replace(/(\d{1,2})\s*[\/.월]\s*(\d{1,2})\s*일?/g, ' ').replace(/(\d{1,2})\s*일(?=\D|$)/g, ' ').replace(/~\s*/g, ' ').replace(/까지/g, ' ')
    .replace(/(오전|오후|밤|저녁|아침)?\s*\d{1,2}:\d{2}/g, ' ').replace(/(오늘|내일|모레)/g, ' ')
    .replace(/매일\s*(밤|저녁|아침)?/g, ' ').replace(/(오전|오후|밤|저녁|아침)?\s*\d{1,2}\s*시(\s*\d{1,2}\s*분|반)?(?!\s*부터)/g, ' ')
    .replace(/\s*[·,\-—]\s*(?=[·,\-—]|$)/g, ' ').replace(/^[\s·,\-—]+|[\s·,\-—]+$/g, '').replace(/\s{2,}/g, ' ').trim();
}
function parseClinicText(text, base) {
  // A pasted message may arrive on one line; break it before each known label.
  var t = text.replace(/\s+(?=(다음\s*내원|주사|트리거|채취|이식|판정|연구실\s*연락|미정)\s*[:：])/g, '\n');
  return t.split(/\n+/).map((s) => s.replace(/^[\s\-•*·\d.)]+(?=\D)/, '').trim()).filter((s) => s.length > 1).map((line, i) => {
    var kind = guessKind(line), rest = stripMeta(line);
    var daily = kind === 'dose' && /매일|하루\s*\d\s*회/.test(line);
    var end = kind === 'dose' && /끝|중단|그만/.test(line);
    var date = findDate(line, base) || (daily || end ? ymd(base) : '');
    if (end) return { line: line, kind: kind, date: date, to: '', time: '', daily: false, end: true, title: '주사 끝', detail: '' };
    var lab = (line.match(/^([^:：\d]{1,10})[:：]/) || [])[1], labT = lab && !/다음\s*내원|^내원|^진료|미정/.test(lab.trim()) ? lab.trim() : '';
    var defTitle = { visit: labT ? labT + (rest ? ' · ' + rest : '') : (rest || '진료'), dose: '주사', trigger: '트리거 주사', retrieval: '채취', transfer: '이식', test: '판정 피검사', call: '연구실 연락', open: rest || line, skip: line }[kind];
    var detail = kind === 'visit' || kind === 'open' || kind === 'skip' ? '' : rest.replace(/^(주사|트리거|채취|이식|판정)\s*/, '').replace(/^[\s·,\-—]+/, '');
    return { line: line, kind: kind, date: date, to: daily ? findTo(line, base) : '', time: findTime(line), daily: daily, title: defTitle, detail: detail };
  });
}
var openMs = (t, cur) => /채취/.test(t) ? 3 : (/이식|동결/.test(t) ? 5 : (/판정/.test(t) ? 6 : (/트리거/.test(t) ? 2 : (/배아|수정|배양/.test(t) ? 4 : cur))));

/* ===== Ads: examples kept in the page; shown only in the patient's 일정 and 함께 ===== */
var CAL_ADS = [
  { id: 'cal-cool-a', ctx: 'dose', brand: '포켓쿨', t: '주사 펜 들고 나가는 날', s: '휴대용 보냉 파우치' },
  { id: 'cal-cool-b', ctx: 'dose', brand: '포켓쿨', t: '냉장 보관 약 챙길 때', s: '보냉 파우치 2개 묶음' },
  { id: 'cal-taxi-a', ctx: 'proc', brand: '새벽콜', t: '시술 날 아침 이동', s: '병원 앞까지 택시 미리 예약' },
  { id: 'cal-taxi-b', ctx: 'proc', brand: '새벽콜', t: '보호자와 함께 귀가', s: '귀가 택시 예약해 두기' },
  { id: 'cal-park-a', ctx: 'visit', brand: '파킹온', t: '병원 가는 날 주차', s: '근처 주차장 미리 결제' },
  { id: 'cal-half-a', ctx: 'visit', brand: '하프데이', t: '반차 쓰는 날이 많을 때', s: '팀 일정 공유 캘린더' }
];
var FEED_ADS = [
  { id: 'feed-half', topic: ['work', 'all'], nick: '하프데이', t: '병원 가는 날 반차, 팀에는 "개인 일정"으로만 보이게.', cta: '팀 캘린더 써 보기' },
  { id: 'feed-meal', topic: ['work', 'all'], nick: 'OO 식탁', t: '병원 다녀온 날 저녁은 데우기만 하면 돼요. 밀키트 첫 주문 20%.', cta: '메뉴 보기' },
  { id: 'feed-couple', topic: ['partner', 'all'], nick: '우리달력', t: '둘이 같이 보는 생활 일정, 장보기 목록까지 한 곳에.', cta: '같이 쓰기' }
];
var PREP_ADS = { proc: ['새벽콜', '귀가 택시 미리 예약', 'car'], dose: ['포켓쿨', '휴대용 보냉 파우치', 'cold'], visit: ['파킹온', '병원 근처 주차 미리 결제', 'car'] };

/* ===== Clinic directory: sample entries exist only while the demo plays ===== */
var DEMO_CLINICS = [
  { name: '서울OO난임센터', area: '서울 마포구', addr: '서울 마포구 OO로 123 · 본관 3층', phone: '02-1234-5678', hours: '평일 08:00–17:00 · 토 08:00–13:00' },
  { name: 'OO여성의원 난임클리닉', area: '서울 강남구', addr: '서울 강남구 OO대로 45 · 5층', phone: '02-555-0101', hours: '평일 08:30–17:30 · 토 08:30–12:30' },
  { name: 'OO대학교병원 난임센터', area: '서울 종로구', addr: '서울 종로구 OO길 7 · 별관 2층', phone: '02-740-0000', hours: '평일 09:00–17:00' },
  { name: '경기OO난임센터', area: '경기 성남시 분당구', addr: '경기 성남시 분당구 OO로 88', phone: '031-700-0000', hours: '평일 08:00–17:00 · 토 08:00–13:00' },
  { name: 'OO산부인과 난임클리닉', area: '경기 고양시 일산동구', addr: '경기 고양시 일산동구 OO로 21', phone: '031-900-0000', hours: '평일 09:00–18:00' }
];
/* ===== Store: the artifact database when served, memory otherwise ===== */
var D = { ready: false, offline: false, settings: {}, items: [], rules: [], open: [], plans: [], memos: {}, doses: {}, posts: [], reqs: [], asks: [] };
var db = null, mem = {}, assets = null;
function put(path, data, merge) {
  if (db) return (merge ? db.doc(path).update(data) : db.doc(path).set(data)).catch((e) => merge ? db.doc(path).set(data).catch(fail) : fail(e));
  var p = path.split('/'); mem[p[0]] = mem[p[0]] || {}; mem[p[0]][p[1]] = merge ? Object.assign({}, mem[p[0]][p[1]] || {}, data) : data; applyMem(); return Promise.resolve();
}
function del(path) {
  if (db) return db.doc(path).delete().catch(fail);
  var p = path.split('/'); if (mem[p[0]]) delete mem[p[0]][p[1]]; applyMem(); return Promise.resolve();
}
function fail(e) { app.say(e && e.code === 'quota_exceeded' ? '저장 공간이 가득 찼어요' : '저장하지 못했어요 · 잠시 뒤 다시 해 주세요'); }
var COLLS = ['settings', 'items', 'rules', 'open', 'plans', 'memos', 'doses', 'posts', 'reqs', 'asks'];
function setColl(c, docs, T) {
  T = T || D;
  if (c === 'settings') T.settings = (docs.find((d) => d.id === 'main') || {}).data || {};
  else if (c === 'memos' || c === 'doses') { var o = {}; docs.forEach((d) => { o[d.id] = d.data; }); T[c] = o; }
  else T[c] = docs.map((d) => Object.assign({ id: d.id }, d.data));
}
function applyMem() { COLLS.forEach((c) => setColl(c, Object.entries(mem[c] || {}).map((e) => ({ id: e[0], data: e[1] })))); app.render(); }
var S = () => Object.assign({ accepted: false, stage: null, share: 1, lab: false, adPers: true, me: '', partner: '', clinic: '', phone: '' }, D.settings);
var meN = () => S().me || '환자';
var ptN = () => S().partner || '배우자';
var clinicN = () => S().clinic || '다니는 병원';
// Korean particle by the last syllable: josa('센터', '을', '를') → '센터를'
var josa = (w, a, b) => { var c = (w || '').charCodeAt((w || '').length - 1) - 0xAC00; return w + (c >= 0 && c <= 11171 && c % 28 ? a : b); };

/* ===== Derived care state ===== */
function ruleFor(day) {
  var c = D.rules.filter((r) => r.from <= day && (!r.to || r.to >= day)).sort((a, b) => (b.from + b.createdAt).localeCompare(a.from + a.createdAt));
  return c[0] || null;
}
function eventsOn(day) {
  var ev = D.items.filter((x) => x.date === day).map((x) => ({ src: 'item', id: x.id, k: x.kind, time: x.time || '', t: x.title, detail: x.detail || '' }));
  var r = ruleFor(day); if (r) ev.push({ src: 'rule', id: r.id, k: 'dose', time: r.time || '', t: r.title || '주사', detail: r.detail || '' });
  return ev.sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
}
var isGone = (day, time) => { var t = TODAY(); if (day < t) return true; if (day > t || !time) return false; return time < nowHM(); };
function currentMs() {
  var t = TODAY(), m = S().stage == null ? null : +S().stage;
  D.items.forEach((x) => { if (x.date <= t && MS_OF[x.kind] != null && (m == null || MS_OF[x.kind] > m)) m = MS_OF[x.kind]; });
  if (D.rules.some((r) => r.from <= t) && (m == null || m < 1)) m = 1;
  return m;
}
function phaseStart(cur) {
  if (cur === 1) { var f = D.rules.map((r) => r.from).sort()[0]; if (f) return f; }
  var x = D.items.filter((i) => MS_OF[i.kind] === cur).map((i) => i.date).sort()[0];
  return x || S().stageAt || null;
}
function nextOf(pred) {
  var t = TODAY(), n = nowHM();
  return D.items.filter((x) => (x.date > t || (x.date === t && (!x.time || x.time >= n))) && pred(x)).sort((a, b) => (a.date + (a.time || '99')).localeCompare(b.date + (b.time || '99')))[0] || null;
}
var doseKey = (day, id) => day + '_' + id;
// Time to a dose in words, never a ticking countdown: coarse far away, plain when close, neutral when late.
var minsTo = (hhmm) => { if (!hhmm) return null; var d = new Date(nowMs()); return (+hhmm.slice(0, 2) * 60 + +hhmm.slice(3)) - (d.getHours() * 60 + d.getMinutes()); };
// A countdown that moves: a ring empties toward the dose time; text changes by the minute only.
var secsTo = (day, hhmm) => { var d = parseYmd(day); d.setHours(+hhmm.slice(0, 2), +hhmm.slice(3), 0, 0); return Math.round((d.getTime() - nowMs()) / 1000); };
var leftText = (sec) => { if (sec <= 30) return '지금'; var m = Math.ceil(sec / 60), h = Math.floor(m / 60); return h ? h + '시간 ' + (m % 60) + '분' : m + '분'; };
function ringFor(sec, windowMin, C) { var frac = Math.max(0, Math.min(1, sec / (windowMin * 60))); return { off: (C * (1 - frac)).toFixed(1), secs: Math.max(1, sec) }; }
function calmLeft(m) {
  if (m == null) return '';
  if (m >= 240) { var h = new Date(nowMs() + m * 60000).getHours(); return h >= 17 ? '오늘 저녁' : (h >= 12 ? '오늘 오후' : '오늘 오전'); }
  if (m >= 150) return Math.round(m / 60) + '시간쯤 뒤';
  if (m >= 75) return '2시간 안';
  if (m >= 45) return '1시간쯤 뒤';
  if (m >= 15) return '곧이에요';
  if (m >= -5) return '지금이에요';
  return '기록 전';
}

/* ===== App ===== */
class App {
  constructor() {
    this.u = { tab: 'today', pTab: 'today', curtain: false, pCurtain: false, thread: [], pThread: [], conv: 'menu', text: '', attach: false, settings: false,
      togSeg: 'road', pSeg: 'road', topic: 'all', pTopic: 'all', calMode: 'week', pCalMode: 'week', wk: null, pWk: null, sel: null, pSel: null,
      memoEdit: null, memoDraft: '', memoShare: false, postText: '', postFiles: [], nudge: false, toast: '', pToast: '', away: false, pAway: false,
      cands: null, capId: null, curFrom: 'today', fit: null, pfit: null, adTick: 0, adsHidden: {}, onboard: null };
    try { this.u.adsHidden = JSON.parse(localStorage.getItem('fevio.adsHidden') || '{}'); } catch (e) {}
    this.seen = new Set();
  }
  setState(p) { Object.assign(this.u, p); this.render(); }
  say(t) { this.setState({ toast: t }); clearTimeout(this.tt); this.tt = setTimeout(() => this.setState({ toast: '' }), 2600); }
  pSay(t) { this.setState({ pToast: t }); clearTimeout(this.tpt); this.tpt = setTimeout(() => this.setState({ pToast: '' }), 2600); }
  push(msgs, patch) { this.setState(Object.assign({ thread: this.u.thread.concat(msgs), attach: false }, patch || {})); this.scrollThread('f3-thread'); }
  scrollThread(id) { setTimeout(() => { var t = document.getElementById(id); if (t) t.scrollTop = t.scrollHeight; }, 60); }
  anchor(smooth) {
    var go = (cid, nid) => {
      var c = document.getElementById(cid), n = document.getElementById(nid); if (!c || !n) return null;
      var cr = c.getBoundingClientRect(), nr = n.getBoundingClientRect(), scale = c.offsetHeight ? cr.height / c.offsetHeight : 1;
      var top = c.scrollTop + (nr.top - cr.top) / (scale || 1) - 70;
      c.scrollTo ? c.scrollTo({ top: top, behavior: smooth ? 'smooth' : 'auto' }) : (c.scrollTop = top); return top;
    };
    this.pNowTop = go('f3-ptl', 'f3-pnow'); this.nowTop = go('f3-tl', 'f3-now');
    if (this.u.away || this.u.pAway) this.setState({ away: false, pAway: false });
  }
  reanchor(smooth) { clearTimeout(this.t1); this.t1 = setTimeout(() => this.anchor(smooth), 120); }
  weeksTo(i, smooth, id) { var el = document.getElementById(id || 'f3-weeks'); if (el && el.scrollTo) el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' }); }

  /* ----- curtain ----- */
  open(patch) {
    var from = (patch && patch.curFrom) || (this.u.tab === 'plan' ? 'plan' : 'today');
    var p = { curtain: true, settings: false, curFrom: from, attach: false };
    if (from !== this.u.curFrom && !this.onboarding()) { p.thread = []; p.conv = 'menu'; }
    this.setState(Object.assign(p, patch || {})); this.scrollThread('f3-thread');
  }
  closeCurtain() {
    this.setState({ curtain: false, attach: false });
    // a finished conversation does not come back; the next open starts from the question grid
    if (this.u.conv === 'menu' && !this.onboarding()) { clearTimeout(this.tcl); this.tcl = setTimeout(() => { if (!this.u.curtain) this.setState({ thread: [], fit: null }); }, 560); }
  }
  onboarding() { var s = S(); return !s.accepted || s.stage == null; }
  startOnboarding() {
    if (this.u.onboard) return; this.u.onboard = true;
    var s = S();
    if (!s.accepted) this.u.thread = [card('Fevio를 시작하기 전에', 'Fevio는 병원이 알려 준 일정과 투약을 정리해 보여 줘요.\n진단, 약 용량, 치료 방법은 판단하지 않아요.\n몸이 불편하면 앱이 아니라 병원에 바로 연락해 주세요.', '배우자에게는 내가 켠 것만 보여요', 'read', [{ t: '동의하고 시작', tap: () => this.accept(), bg: INK, ink: '#FFFFFF', edge: 'none' }])];
    else if (s.stage == null) { this.u.thread = [fv('지금 어느 단계예요?\n오늘 화면의 길에서 지금 위치를 표시해 드릴게요.')]; this.u.conv = 'stage'; }
    this.u.curtain = true; this.render();
  }
  accept() {
    put('settings/main', Object.assign({}, D.settings, { accepted: true, acceptedAt: nowMs(), share: 1, lab: false, adPers: true, updatedAt: nowMs() }));
    this.push([me('동의해요'), fv('지금 어느 단계예요?\n오늘 화면의 길에서 지금 위치를 표시해 드릴게요.')], { conv: 'stage' });
  }
  chipsFor() {
    var self = this, u = this.u, s = S();
    var Q = (label, act, primary) => ({ label: label, act: act, primary: primary });
    if (!s.accepted) return [];
    if (u.conv === 'stage') return STAGE_PICK.map((t, i) => Q(t, () => {
      put('settings/main', { stage: i, stageAt: TODAY(), updatedAt: nowMs() }, true);
      self.push([me(t), fv('표시했어요.\n병원에서 받은 안내문을 찍어 주세요. 날짜와 시간만 골라 정리하고, 확인받은 것만 넣을게요.')], { conv: 'menu' }); self.setState({ attach: true }); self.reanchor(true);
    }));
    if (u.conv === 'clinic' || u.conv === 'phone' || u.conv === 'meName' || u.conv === 'ptName' || u.conv === 'region') return [Q('건너뛰기', () => self.answerSetup(''))];
    if (u.conv === 'confirm') return [Q('맞아요', () => self.saveCands(), true), Q('고칠 게 있어요', () => self.fixCands())];
    if (u.conv === 'fix') return [Q('다 됐어요', () => self.saveCands(), true), Q('그만둘게요', () => self.push([me('그만둘게요'), fv('저장하지 않았어요.')], { conv: 'menu', cands: null }))];
    if (u.conv === 'sym') return ['배가 많이 부르고 아파요', '숨이 차요', '출혈이 있어요', '열이 나요', '주사 부위가 부었어요', '다른 증상이에요'].map((t) => Q(t, () => self.symCard(t)));
    if (u.conv === 'newreq') return ['상담 예약', '서류 발급', '다음 진료 시간 문의'].map((t) => Q(t, () => self.draftReq(t, null)));
    if (u.conv === 'resched') return ['더 이른 시간', '더 늦은 시간', '다른 날', '사정만 전할게요'].map((t) => Q(t, () => self.draftReq((u.resEv ? u.resEv.t + ' · ' : '') + t, u.resEv && u.resEv.key)));
    if (u.thread.length) return this.prompts().slice(0, 2).map((p) => Q(p.t, p.act));
    return [];
  }
  answerSetup(text) {
    var u = this.u, t = text.trim(), next = ['menu', t ? '바꿨어요.' : '그대로 둘게요.'];
    var key = { clinic: 'clinic', phone: 'phone', meName: 'me', ptName: 'partner', region: 'region' }[u.conv];
    if (t) put('settings/main', { [key]: t.slice(0, 30), updatedAt: nowMs() }, true);
    this.push([me(t || '건너뛰기'), fv(next[1])], { conv: next[0], text: '' });
  }
  prompts() {
    var self = this, u = this.u, s = S(), t = TODAY();
    var Q = (q, icon, msgs, patch) => ({ t: q, icon: icon, act: () => self.push([me(q)].concat(typeof msgs === 'function' ? msgs() : msgs), patch) });
    var src = clinicN() + ' 안내 · 저장된 일정';
    if (u.curFrom === 'plan') {
      var nv = nextOf((x) => x.kind === 'visit');
      return [
        Q('예약 문의할게요', IC.doc, [fv('어떤 일정이 필요하세요?')], { conv: 'newreq' }),
        Q('다음에 병원 가는 날은요?', IC.clock, () => { var n = nextOf((x) => x.kind !== 'dose'); return [n ? card(src, dmd(n.date) + (n.time ? ' ' + n.time : '') + ' · ' + n.title, '병원 안내에서 저장한 일정이에요', 'clinic') : fv('저장된 다음 일정이 없어요. 병원 안내를 붙여 넣어 주세요.')]; }),
        nv ? { t: '진료 시간을 바꾸고 싶어요', icon: IC.cal, act: () => self.startResched(nv) } : Q('시술 시간도 바꿀 수 있어요?', IC.cal, [fv('트리거·채취와 투약 시각은 병원이 정해요.\n사정이 있으면 병원에 전할 글을 만들어 드릴게요.')], { conv: 'newreq' }),
        Q('이번 주 일정 정리해 줘', IC.search, () => { var mon = mondayOf(today0()), lines = []; for (var i = 0; i < 7; i++) { var d = ymd(addDays(mon, i)); eventsOn(d).forEach((e) => lines.push(dmd(d) + ' ' + (e.time || '') + ' ' + e.t)); } return [lines.length ? card('이번 주', lines.join('\n'), src, 'read') : fv('이번 주에 저장된 일정이 없어요.')]; })
      ];
    }
    if (!D.items.length && !D.rules.length) return [
      Q('어떤 안내를 넣으면 돼요?', IC.doc, [fv('병원에서 받은 문자나 메모를 그대로 붙여 넣으면 돼요.\n예) 다음 내원 11/23 09:20 초음파 · 주사 매일 21:00')]),
      Q('지금 단계를 바꿀래요', IC.today, [fv('지금 어느 단계예요?')], { conv: 'stage' }),
      Q(ptN() + '에게는 뭐가 보여요?', IC.eye, () => [self.shareCard()]),
      Q('사진으로 넣어도 돼요?', IC.camera, [fv('사진은 받아 두지만, 사진 속 글은 아직 읽지 못해요.\n글로 붙여 넣어 주시면 바로 나눠 드려요.')])
    ];
    var r = ruleFor(t), nv2 = nextOf((x) => x.kind !== 'dose'), proc = nextOf((x) => ['trigger', 'retrieval', 'transfer'].includes(x.kind)), op = D.open.filter((o) => !o.done)[0];
    var list = [];
    if (r) list.push(Q('오늘 주사, 뭘 얼마나 맞아요?', IC.syringe, [card(src, (r.time || '') + ' · ' + (r.title || '주사') + (r.detail ? '\n' + r.detail : ''), '병원 안내에서 저장한 내용이에요', 'clinic')]));
    if (nv2) list.push(Q('다음에 병원 가는 날은요?', IC.cal, [card(src, dmd(nv2.date) + (nv2.time ? ' ' + nv2.time : '') + ' · ' + nv2.title + (nv2.detail ? '\n' + nv2.detail : ''), '병원 안내에서 저장한 일정이에요', 'clinic')]));
    list.push(Q(proc ? { trigger: '트리거는', retrieval: '채취는', transfer: '이식은' }[proc.kind] + ' 언제예요?' : '채취는 언제쯤일까요?', IC.search, [proc ? card(src, dmd(proc.date) + (proc.time ? ' ' + proc.time : '') + ' · ' + proc.title + (proc.detail ? '\n' + proc.detail : ''), '병원 안내에서 저장한 일정이에요', 'clinic') : fv(op ? '아직 정해지지 않았어요.\n' + op.title : '아직 병원 안내에 없어요. 정해지면 붙여 넣어 주세요.')]));
    list.push(Q(ptN() + '에게 어떻게 설명하죠?', IC.people, () => [self.shareCard()]));
    return list.slice(0, 4);
  }
  shareCard() {
    var s = S();
    if (!s.share) return fv('지금은 공유가 꺼져 있어요. 나 · 설정에서 켜면 ' + ptN() + '님도 같은 흐름을 봐요.');
    return card(ptN() + ' 님 화면', '오늘 · 일정 · 함께를 같이 봐요\n' + (s.share >= 2 ? '투약 시각과 내용도 보여요' : '투약은 보이지 않아요') + '\n메모는 켠 것만 보여요', '설명 대신 ' + ptN() + ' 님 화면에 이미 보이고 있어요', 'read');
  }
  startSym() { this.open({ conv: 'sym', curFrom: this.u.curFrom }); this.push([fv('어떤 게 불편하세요?')], { conv: 'sym' }); }
  symCard(t) {
    var s = S();
    this.push([me(t), card('병원에 바로 알려 주세요', clinicN() + (s.phone ? '\n' + s.phone : '\n병원 전화번호를 나 · 설정에 넣어 두면 여기서 바로 보여요') + '\n숨이 많이 차거나 의식이 흐려지면 119', 'Fevio는 증상을 판단하지 않아요', 'alert', s.phone ? [this.copyAct('번호 복사', s.phone)] : [])], { conv: 'menu' });
  }
  copyAct(label, text) {
    var self = this;
    return { t: label, bg: '#FFFFFF', ink: INK, edge: 'inset 0 0 0 1.5px ' + LINE, tap: () => { try { navigator.clipboard.writeText(text).then(() => self.say('복사했어요'), () => self.say('복사가 막혀 있어요 · 길게 눌러 복사해 주세요')).catch(() => {}); } catch (e) { self.say('복사가 막혀 있어요'); } } };
  }
  startResched(item) {
    var label = dmd(item.date) + (item.time ? ' ' + item.time : '') + ' ' + item.title;
    this.open({ conv: 'resched', resEv: { key: item.id, t: label }, curFrom: 'plan' });
    this.push([fv(label + ' 일정을 조율할게요.\n어떻게 바꾸고 싶으세요?')], { conv: 'resched' });
  }
  draftReq(what, itemId) {
    if (typeof DEMO !== 'undefined' && DEMO.running) { put('reqs/q' + Date.now().toString(36), { t: what, item: itemId || '', status: 'sent', sentAt: nowMs(), createdAt: nowMs() }); this.push([me(what), fv(clinicN() + ' 코디네이터에게 보냈어요.\n바뀌기 전까지 지금 시간은 그대로예요.')], { conv: 'menu' }); return; }
    var s = S(), msg = '[예약 문의] ' + (s.me ? s.me + ' · ' : '') + what + '\n가능한 시간을 알려 주세요.';
    var id = 'q' + Date.now().toString(36);
    put('reqs/' + id, { t: what, item: itemId || '', status: 'draft', createdAt: nowMs() });
    this.push([me(what), card(clinicN() + '에 보낼 글', msg, '복사해서 병원 문자·카톡으로 보내 주세요 · 바뀌기 전까지 지금 일정은 그대로예요', 'clinic', [Object.assign(this.copyAct('복사하고 보냄으로 표시', msg), { tap: () => { try { navigator.clipboard.writeText(msg).catch(() => {}); } catch (e) {} put('reqs/' + id, { status: 'sent', sentAt: nowMs() }, true); this.say('보냄으로 표시했어요 · 병원 답 기다림'); } })])], { conv: 'menu' });
  }
  submitText() {
    var u = this.u, t = u.text.trim(); if (!t) return;
    if (['clinic', 'phone', 'meName', 'ptName', 'region'].includes(u.conv)) return this.answerSetup(t);
    var cands = parseClinicText(t, today0()), useful = cands.filter((c) => c.kind !== 'skip');
    if (useful.length && (useful.some((c) => c.date || c.time || c.daily || c.end) || useful.length > 1)) {
      var capId = 'cap' + Date.now().toString(36);
      put('captures/' + capId, { text: t.slice(0, 4000), status: 'draft', createdAt: nowMs() });   // raw input first; nothing is classified yet
      this.push([me(t), this.readCard(cands)], { conv: 'confirm', cands: cands, capId: capId, text: '' });
      return;
    }
    var hit = this.prompts().find((p) => t.replace(/\s/g, '').indexOf(p.t.replace(/[\s?,]/g, '').slice(0, 4)) >= 0);
    if (hit) { this.setState({ text: '' }); hit.act(); return; }
    this.push([me(t), fv('저장된 병원 안내에서는 찾지 못했어요.\n병원에 직접 물어보시는 게 정확해요.' + (S().phone ? '\n' + clinicN() + ' ' + S().phone : ''))], { text: '' });
  }
  ask(conv, q) { this.open({ curFrom: 'today', conv: conv }); this.push([fv(q)], { conv: conv }); }
  readCard(cands, fromPhoto) {
    var lines = cands.filter((c) => c.kind !== 'skip').map((c) => {
      if (c.kind === 'open') return '미정 · ' + c.title;
      if (c.end) return (c.date ? dmd(c.date) : '오늘') + ' · 매일 주사 끝';
      if (c.daily) return '매일 ' + (c.time || '') + ' · ' + c.title + (c.detail ? ' ' + c.detail : '') + (c.to ? ' (~' + mdl(c.to) + ')' : '');
      return (c.date ? dmd(c.date) : '날짜 없음') + (c.time ? ' ' + c.time : '') + ' · ' + c.title + (c.detail ? ' · ' + c.detail : '');
    });
    var skipped = cands.filter((c) => c.kind === 'skip').length;
    return card((fromPhoto ? '사진에서' : '병원 안내에서') + ' 읽었어요 · 확인해 주세요', lines.join('\n'), skipped ? '안내가 아닌 줄 ' + skipped + '개는 넣지 않아요' : '확인한 것만 일정에 들어가요', 'read');
  }
  fixCands() {
    var self = this;
    var cardsFor = () => this.u.cands.map((c, i) => ({ from: 'f', candIdx: i }));
    this.push([me('고칠 게 있어요'), fv('줄마다 종류를 골라 주세요. 날짜가 없는 줄은 미정으로 넣어요.')].concat(cardsFor()), { conv: 'fix' });
  }
  saveCands(fromClinic) {
    var u = this.u, now = nowMs(), n = 0, rows = [], itemRows = [], first = null;
    if (!u.cands) return;
    u.cands.forEach((x, i) => {
      if (x.kind === 'skip') return;
      var id = u.capId + '-' + i;
      if (x.kind === 'dose' && x.end) { D.rules.filter((r) => !r.to || r.to > x.date).forEach((r) => put('rules/' + r.id, { to: x.date, updatedAt: now }, true)); rows.push(['그때까지', '주사 · ' + dmd(x.date) + '까지', 'pen', false]); n++; return; }
      var needsDate = !['open'].includes(x.kind) && !x.daily && !x.date;
      if (x.kind === 'open' || needsDate) { var oms = openMs(x.line, currentMs() || 0); D.open.filter((o) => !o.done && o.ms === oms).forEach((o) => put('open/' + o.id, { done: true, updatedAt: now }, true)); put('open/' + id, { title: (x.kind === 'open' ? x.title : x.line).slice(0, 80), ms: oms, done: false, createdAt: now + i }); rows.push(['아직 안 정해짐', (x.kind === 'open' ? x.title : x.line).slice(0, 40), 'q', true]); n++; return; }
      if (x.kind === 'dose' && x.daily) { var prevR = ruleFor(x.date || TODAY()), keep = /변경\s*없|그대로/.test(x.detail || '') && prevR && prevR.detail; if (keep) x.detail = prevR.detail; put('rules/' + id, { title: '주사', detail: (x.detail || '').slice(0, 60), time: x.time, from: x.date, to: x.to || '', createdAt: now + i }); rows.push(['그때까지', ((x.detail || '주사') + ' · 매일 ' + (x.time || '')).trim(), 'pen', false]); n++; return; }
      if (MS_OF[x.kind] != null) D.open.filter((o) => !o.done && o.ms === MS_OF[x.kind]).forEach((o) => put('open/' + o.id, { done: true, updatedAt: now }, true));   // a fixed date closes its 'not decided yet'
      put('items/' + id, { kind: x.kind, date: x.date, time: x.time || '', title: x.title.slice(0, 40), detail: (x.detail || '').slice(0, 60), createdAt: now + i });
      if (!first && x.kind !== 'dose') first = x;
      itemRows.push([x.date + (x.time || ''), [x.kind === 'visit' ? '다음 내원' : KLABEL[x.kind], dmd(x.date) + (x.time ? ' ' + x.time : '') + ' · ' + x.title, 'cal', false]]); n++;
    });
    rows = itemRows.sort((a, b) => a[0].localeCompare(b[0])).map((r) => r[1]).concat(rows);
    if (u.capMeta) { var sm = S(), up = {}; if (u.capMeta.clinic && !sm.clinic) up.clinic = u.capMeta.clinic.slice(0, 30); if (u.capMeta.phone && !sm.phone) up.phone = u.capMeta.phone.slice(0, 20); if (Object.keys(up).length) put('settings/main', Object.assign(up, { updatedAt: now }), true); }
    put('captures/' + u.capId, { status: 'confirmed', confirmedAt: now, count: n }, true);
    if (rows.length) put('plans/' + u.capId, { date: TODAY(), at: now, rows: rows.slice(0, 4), short: first ? mdl(first.date) + (first.time ? ' ' + first.time : '') : rows[0][1].slice(0, 12), acked: !fromClinic, from: fromClinic ? 'clinic' : 'patient', createdAt: now });
    if (fromClinic) { this.u.cands = null; this.say(josa(clinicN(), '이', '가') + ' 오늘 계획을 보냈어요'); this.reanchor(true); return; }
    var s = S();
    this.push([me(u.conv === 'fix' ? '다 됐어요' : '맞아요'), fv('저장했어요. 오늘과 일정에 들어갔어요.' + (s.share ? '\n' + ptN() + ' 님 화면에도 바로 보여요.' : ''))], { conv: 'menu', cands: null });
    clearTimeout(this.tc); this.tc = setTimeout(() => { if (this.u.curtain && !this.u.text) { this.closeCurtain(); this.reanchor(true); } }, 1600);
  }
  // Photo of a clinic notice → lines (AI reads only; the user confirms before anything is saved; any failure falls back to text)
  async photo(file) {
    var url = URL.createObjectURL(file);
    this.push([{ from: 'u', imgUrl: url }, fv('사진에서 글을 읽고 있어요…')], { conv: 'reading' });
    var res = null;
    try {
      var sample = window.claude && window.claude.use ? await window.claude.use('sample') : null;
      var caps = sample ? await sample.limits().catch(() => null) : null;
      if (sample && caps && caps.images) res = await sample.json('이 사진은 난임 병원이 환자에게 준 안내문(종이 안내문이나 문자 캡처)입니다. 보이는 글을 줄 단위로 그대로 옮겨 적으세요. 해석, 요약, 추가, 의학적 판단은 하지 마세요. 날짜, 시각, 약 이름, 용량은 보이는 그대로 적으세요. 병원 이름과 전화번호가 보이면 따로 적으세요. JSON 하나로만 답하세요: {"lines": ["..."], "clinic": "", "phone": ""}. 병원 안내문이 아니면 lines는 빈 배열입니다.', { images: file, modelTier: 'default' });
    } catch (e) { res = null; }
    this.photoResult(res && Array.isArray(res.lines) ? res.lines.map(String) : null, res || {});
  }
  receivePlan(text) { this.u.cands = parseClinicText(text, today0()); this.u.capId = 'cap' + Date.now().toString(36); this.u.capMeta = null; this.saveCands(true); }
  photoResult(lines, meta) {
    var th = this.u.thread.slice(), i = th.map((m) => m.text).lastIndexOf('사진에서 글을 읽고 있어요…'); if (i >= 0) th.splice(i, 1);
    var cands = lines && lines.length ? parseClinicText(lines.join('\n'), today0()) : [];
    if (!cands.some((c) => c.kind !== 'skip')) { this.setState({ thread: th.concat([fv('사진에서 일정 글을 찾지 못했어요.\n안내문 글을 붙여 넣어 주시면 바로 나눠 드릴게요.')]), conv: 'menu' }); this.scrollThread('f3-thread'); return; }
    var capId = 'cap' + Date.now().toString(36);
    put('captures/' + capId, { text: lines.join('\n').slice(0, 4000), source: 'photo', status: 'draft', createdAt: nowMs() });
    this.setState({ thread: th.concat([this.readCard(cands, true)]), conv: 'confirm', cands: cands, capId: capId, capMeta: { clinic: meta.clinic || '', phone: meta.phone || '' } }); this.scrollThread('f3-thread');
  }

  /* ----- timeline from data (same rows as the design; only the source changed) ----- */
  buildTimeline(role) {
    var s = S(), t = TODAY(), cur = currentMs(), rows = [], partner = role === 'partner';
    var showDose = !partner || s.share >= 2;
    var detailOk = (d) => !partner || s.lab || !/\d/.test(d || '');
    if (cur == null) cur = -1;
    var start = cur >= 0 ? phaseStart(cur) : null;
    var future = (x) => x.date > t || (x.date === t && x.time && x.time >= nowHM());
    var gateItem = nextOf((x) => ['visit', 'call', 'test'].includes(x.kind) && (MS_OF[x.kind] == null || MS_OF[x.kind] <= cur));
    var self = this;
    MILESTONES.forEach((name, i) => {
      var num = String(i + 1);
      if (i < cur) {
        var ds = D.items.filter((x) => MS_OF[x.kind] === i).map((x) => x.date).sort();
        var span = i === 1 ? (() => { var f = D.rules.map((r) => r.from).sort()[0], e = D.rules.map((r) => r.to || t).sort().pop(); return f ? mdl(f) + (e && e !== f ? '–' + mdl(e > t ? t : e) : '') : ''; })() : (ds[0] ? mdl(ds[0]) : '');
        rows.push(row('msDone', name, span, '', { num: num })); return;
      }
      if (i === cur) {
        var r = ruleFor(t), dk = r ? doseKey(t, r.id) : null, done = dk && D.doses[dk];
        var dayN = start ? daysBetween(start, t) + 1 : 0;
        var extra = { num: num };
        var trig = D.items.find((x) => x.kind === 'trigger' && x.date === t);
        var ringAt = trig && trig.time ? trig.time : (r && showDose && !done && r.time ? r.time : null), rsec = ringAt ? secsTo(t, ringAt) : -1;
        if (ringAt && rsec > 0) { var rg = ringFor(rsec, 720, 113.1); Object.assign(extra, { hasRing: true, ringOff: rg.off, ringSecs: rg.secs, ringLeft: leftText(rsec), ringLabel: (partner ? meN() + ' ' : '') + ringAt + (trig ? ' 트리거 정각까지' : ' ' + (r.title || '주사') + '까지') }); }
        if (ringAt && rsec > 0) {} else if (trig) Object.assign(extra, { hasChip: true, chip: (partner ? meN() + ' ' : '') + (trig.time || '') + ' 정각' + (trig.time && trig.time > nowHM() ? '' : ' · 지남'), chipBg: SIGNAL, chipInk: '#FFFFFF', chipEdge: 'none' });
        else if (r && showDose && (done || rsec <= 0)) Object.assign(extra, { hasChip: true, chip: (partner ? meN() + ' ' : '') + (r.time || '') + ' · ' + (r.title || '주사') + (done ? ' · 맞음 ' + hm(done.at) : (r.time ? ' · ' + calmLeft(minsTo(r.time)) : '')), chipBg: done ? INK : '#FFFFFF', chipInk: done ? '#FFFFFF' : INK, chipEdge: done ? 'none' : 'inset 0 0 0 1px #E4E4E7' });
        rows.push(row('msNow', cur === 1 && D.rules.length ? '과배란 주사' : name, dayN > 0 && dayN < 60 ? dayN + '일째' : '지금', '', extra));
        D.items.filter((x) => !future(x) && x.kind !== 'dose' && (!start || x.date >= start) && MS_OF[x.kind] == null).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
          .forEach((x) => rows.push(row('past', x.title, mdl(x.date), detailOk(x.detail) ? x.detail : '')));
        rows.planAt = rows.length;
        if (gateItem) rows.push(row('gate', gateItem.title, dmd(gateItem.date) + (gateItem.time ? ' ' + gateItem.time : ''), detailOk(gateItem.detail) ? gateItem.detail : '', { tap: () => self.goDay(gateItem.date, role), cursor: 'pointer' }));
        D.items.filter((x) => future(x) && ['visit', 'call', 'test'].includes(x.kind) && x !== gateItem && (MS_OF[x.kind] == null || MS_OF[x.kind] <= cur)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
          .forEach((x) => rows.push(row('fixed', x.title, dmd(x.date) + (x.time ? ' ' + x.time : ''), detailOk(x.detail) ? x.detail : '', { tap: () => self.goDay(x.date, role), cursor: 'pointer' })));
        D.open.filter((o) => !o.done && (o.ms == null || o.ms <= cur)).forEach((o) => rows.push(row('open', o.title, '', '')));
        return;
      }
      var fx = D.items.filter((x) => MS_OF[x.kind] === i && future(x)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      var ops = D.open.filter((o) => !o.done && o.ms === i);
      rows.push(row('msNext', name, fx.length || ops.length ? '' : (cur < 0 ? '' : '날짜 미정'), '', { num: num }));
      fx.forEach((x) => rows.push(row('fixed', x.title, dmd(x.date) + (x.time ? ' ' + x.time : ''), detailOk(x.detail) ? x.detail : '', { tap: () => self.goDay(x.date, role), cursor: 'pointer' })));
      ops.forEach((o) => rows.push(row('open', o.title, '', '')));
    });
    if (rows.planAt == null) rows.planAt = rows.length;
    rows[rows.length - 1].line = 'transparent';
    if (partner) rows.forEach((r) => { if (r.anchor) r.anchor = 'f3-pnow'; });
    return rows;
  }
  goDay(day, role) {
    var wi = this.weekIndex(day);
    if (role === 'partner') { this.setState({ pTab: 'plan', pCalMode: 'week', pWk: wi, pSel: day }); setTimeout(() => this.weeksTo(wi, false, 'f3-pweeks'), 90); return; }
    this.setState({ tab: 'plan', pTab: 'plan', calMode: 'week', wk: wi, sel: day, pWk: wi, pSel: day }); setTimeout(() => { this.weeksTo(wi, false); this.weeksTo(wi, false, 'f3-pweeks'); }, 90);
  }
  weekStarts() { var m0 = addDays(mondayOf(today0()), -14); return Array.from({ length: 12 }, (_, i) => addDays(m0, i * 7)); }
  weekIndex(day) { var ws = this.weekStarts(), d = parseYmd(day); for (var i = ws.length - 1; i >= 0; i--) if (d >= ws[i]) return i; return 0; }

  /* ----- 일정 (same builder serves patient and partner) ----- */
  buildCal(o) {
    var self = this, s = S(), u = this.u, t = TODAY(), ws = this.weekStarts(), curWk = this.weekIndex(t);
    var mode = o.mode || 'week', wkI = o.wk == null ? curWk : o.wk, sel = o.sel || t;
    var EVS = { done: ['#F4F4F5', '#8A8D94', 'none', ''], dose: ['#F4F4F5', INK, 'none', ''], visit: [INK, '#FFFFFF', 'none', ''], test: [INK, '#FFFFFF', 'none', ''], trigger: [SIGNAL, '#FFFFFF', 'none', ''], retrieval: [SIGNAL, '#FFFFFF', 'none', ''], transfer: [SIGNAL, '#FFFFFF', 'none', ''], call: ['#FFFFFF', INK, 'inset 0 0 0 1.5px ' + INK, ''] };
    var reqs = o.patient ? D.reqs : [];
    var adOn = o.patient && s.adPers && currentMs() !== 6;
    var weeks = ws.map((st, wIdx) => {
      var days = Array.from({ length: 7 }, (_, i) => ymd(addDays(st, i)));
      var evs = days.map((d) => eventsOn(d).filter((e) => o.patient || e.k !== 'dose' || s.share >= 2));
      // one native row per week, under the first day whose schedule it fits; none in a week with a result test
      var ad = null, adAt = -1;
      if (adOn && !evs.some((l) => l.some((e) => e.k === 'test'))) {
        var ctx = evs.some((l) => l.some((e) => ['trigger', 'retrieval', 'transfer'].includes(e.k))) ? 'proc' : (evs.some((l) => l.some((e) => e.k === 'dose')) ? 'dose' : (evs.some((l) => l.some((e) => e.k === 'visit')) ? 'visit' : null));
        var pool = ctx ? CAL_ADS.filter((a) => a.ctx === ctx && !u.adsHidden[a.id]) : [];
        if (pool.length) { ad = pool[(u.adTick + wIdx) % pool.length]; adAt = evs.findIndex((l) => l.some((e) => ctx === 'proc' ? ['trigger', 'retrieval', 'transfer'].includes(e.k) : e.k === ctx)); }
      }
      return { days: days.map((day, i) => {
        var d = parseYmd(day), isToday = day === t, past = day < t, isOpen = day === sel, src = evs[i];
        var mk = (e) => { var g = isGone(day, e.time), k = g ? 'done' : e.k, st2 = EVS[k] || EVS.dose, rq = reqs.find((r) => r.item === e.id && r.status !== 'done');
          var rqDone = reqs.find((r) => r.item === e.id && r.status === 'done');
          var badge = rq ? ['병원 답 기다림', 'rgba(31,91,255,0.12)', SIGNAL] : (rqDone && !g ? ['변경됨', 'rgba(31,91,255,0.12)', SIGNAL] : (e.k === 'visit' && !g ? ['확정', '#F4F4F5', INK] : null));
          return { time: e.time, t: e.t, bg: st2[0], ink: st2[1], edge: st2[2], cls: st2[3], hasBadge: !!badge, badge: badge ? badge[0] : '', bBg: badge ? badge[1] : '', bInk: badge ? badge[2] : '', g: g, e: e, rq: rq }; };
        var ev = src.map(mk);
        var lines = ev.map((x) => { var e = x.e, dkey = doseKey(day, e.id), dn = e.k === 'dose' && D.doses[dkey];
          var m = e.detail && (o.patient || s.lab || !/\d/.test(e.detail)) ? e.detail : (e.k === 'dose' ? (dn ? '맞음 ' + hm(dn.at) : '') : '');
          if (e.k === 'dose' && dn && o.patient) m = (m ? m + ' · ' : '') + '맞음 ' + hm(dn.at);
          return Object.assign({}, x, { m: m, tInk: x.g ? '#8A8D94' : INK, ink: x.g ? INK2 : INK,
            dot: e.k === 'call' ? '#FFFFFF' : (x.g || e.k === 'dose' ? '#C7C7CC' : x.bg), dotEdge: e.k === 'call' ? 'inset 0 0 0 1.5px ' + INK : 'none',
            canR: !!o.patient && e.k === 'visit' && !x.g && !x.rq, resched: () => self.startResched(D.items.find((it) => it.id === e.id)) }); });
        var mm = D.memos[day], editing = !!o.patient && isOpen && u.memoEdit === day;
        var showShared = !o.patient && mm && mm.shared && mm.text;
        if (showShared && isOpen && (wide() || true)) self.markSeen(day, mm);
        var tag = mm && mm.text ? (mm.shared ? (mm.seenAt ? ptN() + ' 봄 ' + hm(mm.seenAt) : ptN() + '에게 보임') : '나만') : '';
        return { dow: DOW[d.getDay()], n: d.getDate(), ev: ev, lines: lines, o: past && !isOpen ? 0.6 : 1, open: isOpen, closed: !isOpen,
          edge: isToday ? 'inset 0 0 0 2px #0E0F11' : (isOpen ? 'inset 0 0 0 2px ' + SIGNAL : 'inset 0 0 0 1px #EDEDF0'),
          nBg: isToday ? INK : 'transparent', nInk: isToday ? '#FFFFFF' : (d.getDay() === 0 || d.getDay() === 6 ? INK2 : INK), dowInk: isToday ? INK : '#8A8D94',
          tap: () => { if (!isOpen) o.set({ sel: day }); },
          hasMemo: !!(mm && mm.text && (o.patient || mm.shared)), canMemo: !!o.patient, memoView: !editing, memoEditing: editing,
          memoText: mm && mm.text ? mm.text : '메모', memoInk: mm && mm.text ? INK2 : '#A1A1AA', memoTag: tag, memoTagInk: mm && mm.seenAt ? SIGNAL : '#A1A1AA',
          memoEdit: () => self.setState({ memoEdit: day, memoDraft: mm ? mm.text : '', memoShare: mm ? !!mm.shared : false }),
          memoDraft: u.memoDraft, memoType: (ev2) => { self.u.memoDraft = ev2.target.value; },
          memoShareOn: u.memoShare ? 'true' : 'false', memoShareTrack: u.memoShare ? SIGNAL : '#D4D4D8', memoShareX: u.memoShare ? 16 : 0, memoShareLabel: ptN() + '에게 보이기',
          toggleMemoShare: () => self.setState({ memoShare: !self.u.memoShare }),
          memoSave: (ev2) => { if (ev2 && ev2.preventDefault) ev2.preventDefault(); var txt = (self.u.memoDraft || '').trim().slice(0, 500); if (txt) put('memos/' + day, { text: txt, shared: self.u.memoShare, updatedAt: nowMs(), seenAt: null }); else del('memos/' + day); self.setState({ memoEdit: null, memoDraft: '' }); },
          pMemo: !!showShared, pMemoWho: meN(), pMemoText: showShared ? mm.text : '',
          hasAd: i === adAt && !!ad, adT: ad ? ad.t : '', adS: ad ? ad.s + ' · ' + ad.brand : '', adHide: () => { if (ad) self.hideAd(ad.id); } };
      }) };
    });
    var mon = ws[wkI], sun = addDays(mon, 6);
    var label = mode === 'week' ? (mon.getMonth() + 1) + '월 ' + mon.getDate() + ' – ' + (sun.getMonth() !== mon.getMonth() ? (sun.getMonth() + 1) + '월 ' : '') + sun.getDate() : mon.getFullYear() + '년 ' + (mon.getMonth() + 1) + '월';
    var first = new Date(mon.getFullYear(), mon.getMonth(), 1), gridStart = mondayOf(first), cells = [];
    for (var c = 0; c < 42; c++) {
      var dd = addDays(gridStart, c), day = ymd(dd), inM = dd.getMonth() === first.getMonth();
      if (c >= 35 && !inM) break;
      var ev = eventsOn(day).filter((e) => o.patient || e.k !== 'dose' || s.share >= 2);
      var bars = ev.filter((e) => e.k !== 'dose').slice(0, 2).map((e) => { var g = isGone(day, e.time), st2 = EVS[g ? 'done' : e.k] || EVS.visit; return { bg: e.k === 'call' ? INK2 : st2[0], edge: st2[2], cls: st2[3] }; });
      if (!bars.length && ev.length) bars = [{ bg: '#E4E4E7', edge: 'none', cls: '' }];
      (function (day2) { cells.push({ n: inM ? dd.getDate() : '', off: !inM, o: inM && day2 < t ? 0.55 : 1, nBg: day2 === t ? INK : 'transparent', nInk: day2 === t ? '#FFFFFF' : INK, bars: bars,
        tap: () => { var wi = self.weekIndex(day2); o.set({ mode: 'week', wk: wi, sel: day2 }); setTimeout(() => self.weeksTo(wi, false, o.weeksId), 90); } }); })(day);
    }
    return {
      isWeek: mode === 'week', isMonth: mode === 'month', calLabel: label,
      calOpen: mode === 'month' ? 'true' : 'false', calToggleLabel: mode === 'week' ? '한 달 보기' : '주 단위로 보기', calChev: mode === 'month' ? 180 : 0,
      calToggle: () => { if (mode === 'week') { o.set({ mode: 'month' }); return; } o.set({ mode: 'week' }); setTimeout(() => self.weeksTo(wkI, false, o.weeksId), 90); },
      wkAway: mode === 'week' && wkI !== curWk, wkThis: () => { o.set({ wk: curWk }); self.weeksTo(curWk, true, o.weeksId); },
      wkPrev: () => { var i = Math.max(0, wkI - 1); o.set({ wk: i }); self.weeksTo(i, true, o.weeksId); },
      wkNext: () => { var i = Math.min(ws.length - 1, wkI + 1); o.set({ wk: i }); self.weeksTo(i, true, o.weeksId); },
      onWeeks: (e) => { var el = e.target; if (!el.clientWidth || el.id !== o.weeksId) return; var i = Math.round(el.scrollLeft / el.clientWidth); if (i !== wkI) { o.set({ wk: i }); self.u.adTick++; } },
      weeks: weeks, month: cells,
      hasReqs: reqs.length > 0,
      reqChips: reqs.slice(-3).map((r) => ({ t: r.t, s: r.status === 'sent' ? '병원 답 기다림' : '보내기 전', bg: r.status === 'sent' ? 'rgba(31,91,255,0.12)' : '#F4F4F5', ink: r.status === 'sent' ? SIGNAL : INK2 }))
    };
  }
  markSeen(day, mm) {
    var k = day + ':' + mm.updatedAt;
    if (this.seen.has(k) || mm.seenAt) return; this.seen.add(k);
    setTimeout(() => put('memos/' + day, { seenAt: nowMs() }, true), 1200);
  }
  hideAd(id) { var h = Object.assign({}, this.u.adsHidden); h[id] = Date.now(); try { localStorage.setItem('fevio.adsHidden', JSON.stringify(h)); } catch (e) {} this.setState({ adsHidden: h }); }

  /* ----- 함께 ----- */
  feed(role) {
    var u = this.u, s = S(), topic = role === 'partner' ? u.pTopic : u.topic, cur = currentMs();
    var stage = cur == null ? '' : MILESTONES[cur];
    var list = D.posts.filter((p) => topic === 'all' || p.topic === topic || (topic === 'live' && p.stage === stage)).sort((a, b) => b.createdAt - a.createdAt);
    var posts = list.map((p, i) => ({ isAd: false, isPost: true, nick: p.nick || '익명', meta: (p.stage ? p.stage + ' · ' : '') + rel(p.createdAt), t: p.text, like: p.likes || 0, re: p.replies || 0,
      av: (p.nick || '익').slice(0, 1), avBg: AV[((p.nick || '익').charCodeAt(0) + i) % AV.length], avR: '15px', cta: '', edge: 'none',
      hasImgs: !!(p.imgs && p.imgs.length), cols: p.imgs && p.imgs.length > 1 ? '1fr 1fr' : '1fr', imgs: (p.imgs || []).map((url) => ({ h: p.imgs.length > 1 ? 110 : 180, bg: '#E4E4E7 url(' + url + ') center / cover no-repeat', icon: '', ic: 0, pii: false, label: '', cap: false })) }));
    if (role === 'patient' && s.adPers && topic !== 'live' && cur !== 6) {
      var pool = FEED_ADS.filter((a) => a.topic.includes(topic) && !u.adsHidden[a.id]), out = [];
      posts.forEach((p, i) => { out.push(p); var slot = i === 1 ? 0 : (i > 1 && (i - 1) % 5 === 0 ? (i - 1) / 5 : -1); if (slot >= 0 && pool.length) { var a = pool[(slot + u.adTick) % pool.length]; out.push({ isAd: true, isPost: false, nick: a.nick, meta: '제휴', t: a.t, like: 0, re: 0, av: a.nick.slice(0, 1), avBg: '#C7C7CC', avR: '8px', cta: a.cta, edge: 'none', hasImgs: false, cols: '1fr', imgs: [] }); } });
      posts = out;
    }
    return posts;
  }
  prep(role) {
    var t = TODAY(), out = [], s = S(), u = this.u, ctx = null;
    for (var i = 0; i < 7; i++) { var d = ymd(addDays(today0(), i)); eventsOn(d).forEach((e) => {
      if (e.k === 'dose') { if (!ctx) ctx = 'dose'; return; }
      if (['trigger', 'retrieval', 'transfer'].includes(e.k)) ctx = 'proc'; else if (!ctx && e.k === 'visit') ctx = 'visit';
      if (role === 'partner' && !s.lab && /\d/.test(e.detail)) e = Object.assign({}, e, { detail: '' });
      out.push([dmd(d) + (e.time ? ' ' + e.time : '') + ' · ' + e.t, e.detail || (e.k === 'visit' ? '병원 가는 날' : ''), e.k === 'visit' ? 'cal' : (e.k === 'call' ? 'clock' : 'bag'), '']);
    }); }
    if (role === 'patient' && ctx && s.adPers && !u.adsHidden['prep-' + ctx] && currentMs() !== 6) { var a = PREP_ADS[ctx]; out.splice(Math.min(1, out.length), 0, [a[1], a[0], a[2], 'ad', 'prep-' + ctx]); }
    var self = this;
    return out.slice(0, 6).map((p, i) => ({ t: p[0], s: p[1], icon: ICP[p[2]] || ICP.doc, isAd: p[3] === 'ad', bg: '#FFFFFF', divider: i ? '1px solid ' + LINE : '0', hide: () => self.hideAd(p[4]) }));
  }
  // 정부지원: each program opens to steps, papers and actions tied to this cycle. Links go to the official sites.
  support(role) {
    var self = this, s = S(), gov = s.gov || {}, cur = currentMs(), t = TODAY(), partner = role === 'partner', open = partner ? this.u.pGovOpen : this.u.govOpen;
    var days = []; for (var i = 0; i < 7; i++) { var d = ymd(addDays(today0(), i)); if (eventsOn(d).some((e) => e.k !== 'dose' && e.k !== 'call')) days.push(d); }
    var mark = (k, label) => ({ t: gov[k] ? label + ' ✓' : label, bg: gov[k] ? INK : '#FFFFFF', ink: gov[k] ? '#FFFFFF' : INK, edge: gov[k] ? 'none' : 'inset 0 0 0 1.5px ' + LINE, href: '', tap: () => { var g = Object.assign({}, S().gov || {}); g[k] = !g[k]; put('settings/main', { gov: g, updatedAt: nowMs() }, true); } });
    var link = (label, href) => ({ t: label, bg: INK, ink: '#FFFFFF', edge: 'none', href: href, tap: NOOP });
    var act = (label, fn) => ({ t: label, bg: '#FFFFFF', ink: INK, edge: 'inset 0 0 0 1.5px ' + LINE, href: '', tap: fn });
    var before = cur == null || cur < 3;
    var list = [
      { k: 'fee', who: '국가', icon: 'M4 21V9l8-5 8 5v12M9 21v-6h6v6M12 8v4M10 10h4', t: '난임부부 시술비 지원', sub: before ? '시술 전에 보건소 지원결정통지서가 있어야 해요' : '통지서를 병원에 냈는지 확인해 두세요', s: gov.fee ? '신청함' : (before ? '시술 전 필요' : '확인'), hot: !gov.fee && before,
        steps: ['보건소에 신청해요 (온라인 신청도 돼요)', '지원결정통지서를 받아요', '시술 전에 병원에 통지서를 내요'], docs: ['난임진단서 (병원)', '신분증', '보건소마다 추가 서류가 달라요'],
        acts: [link('정부24에서 신청', 'https://www.gov.kr'), mark('fee', '신청했어요')] },
      { k: 'local', who: '지자체', icon: 'M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z', t: '사는 곳 추가 지원', sub: s.region ? s.region + ' 지원을 찾아볼 수 있어요' : '사는 곳을 넣으면 맞는 지원을 찾아요', s: gov.local ? '확인함' : '찾아보기', hot: false,
        steps: ['보조금24에서 사는 곳으로 검색해요', '난임·임신 지원 항목을 확인해요'], docs: [],
        acts: [link('보조금 찾아보기', 'https://www.gov.kr/portal/rcvfvrSvc/main'), act(s.region ? '사는 곳 바꾸기' : '사는 곳 넣기', () => self.ask('region', '사는 곳(시·군·구)을 알려 주세요. 지원 찾기에만 써요.')), mark('local', '확인했어요')] },
      { k: 'leave', who: '직장', icon: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16', t: '난임치료휴가', sub: '연 6일 · 그중 2일 유급', s: days.length ? '이번 주 병원 ' + days.length + '일' : '회사 신청', hot: days.length > 0,
        steps: ['병원 가는 날을 회사에 미리 신청해요', '병원 이름이나 시술 내용은 쓰지 않아도 돼요'], docs: ['진료 확인서 (회사가 요청할 때)'],
        acts: partner ? [] : [act('휴가 신청 글 만들기', () => self.leaveDraft(days)), mark('leave', '신청했어요')] },
      { k: 'tax', who: '세금', icon: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6', t: '난임시술비 의료비 공제', sub: '병원 영수증과 진료비 세부내역서를 모아 두세요', s: gov.tax ? '모으는 중' : '모아 두기', hot: false,
        steps: ['시술비는 일반 의료비보다 공제율이 높아요', '병원에서 진료비 세부내역서를 받아 두세요'], docs: ['영수증', '진료비 세부내역서'], acts: [mark('tax', '모으고 있어요')] }
    ];
    return list.map((g, i) => Object.assign(g, { divider: i ? '1px solid ' + LINE : '0', o: 1,
      sBg: g.hot ? 'rgba(31,91,255,0.12)' : (gov[g.k] ? INK : '#F4F4F5'), sInk: g.hot ? SIGNAL : (gov[g.k] ? '#FFFFFF' : INK2),
      open: open === g.k, chev: open === g.k ? 90 : 0, tap: () => self.setState(partner ? { pGovOpen: open === g.k ? null : g.k } : { govOpen: open === g.k ? null : g.k }),
      steps: g.steps.map((x, j) => ({ n: j + 1, t: x })), hasDocs: g.docs.length > 0,
      acts: (partner ? g.acts.filter((a) => a.href) : g.acts).map((a) => Object.assign(a, { hasHref: !!a.href, noHref: !a.href })), hasActs: (partner ? g.acts.filter((a) => a.href) : g.acts).length > 0 }));
  }
  leaveDraft(days) {
    var lst = days.length ? days : []; for (var i = 7; i < 21 && lst.length < 3; i++) { var d = ymd(addDays(today0(), i)); if (eventsOn(d).some((e) => e.k !== 'dose' && e.k !== 'call')) lst.push(d); }
    var msg = '안녕하세요. 아래 날짜에 난임치료휴가를 신청합니다.\n' + (lst.length ? lst.map((d) => '· ' + dmd(d)).join('\n') : '· (날짜)') + '\n일정이 바뀌면 다시 말씀드리겠습니다.';
    this.open({ curFrom: 'today' });
    this.push([card('회사에 보낼 글', msg, '병원 이름과 시술 내용은 넣지 않았어요', 'read', [this.copyAct('복사하기', msg)])]);
  }

  /* ----- values for both phone templates ----- */
  vals() {
    var self = this, u = this.u, s = S(), t = TODAY(), accent = '#7A2E8E', cur = currentMs();
    var dateLabel = (today0().getMonth() + 1) + '.' + today0().getDate() + ' ' + DOW[today0().getDay()];
    var tab = u.tab, pTab = u.pTab;
    // timeline
    var plan = D.plans.filter((p) => p.date === t).sort((a, b) => b.createdAt - a.createdAt)[0] || null;
    var tl = splitTimeline(this.buildTimeline('patient'), !!plan);
    var ptl = splitTimeline(this.buildTimeline('partner'), !!plan && s.share > 0);
    var planRows = (rows) => rows.map((r) => ({ k: r[0], v: r[1], icon: { cal: IC.cal, pen: IC.syringe, q: IC.q }[r[2]] || IC.cal, cls: r[3] ? 'hatch' : '', bg: r[3] ? 'transparent' : '#F4F4F5', ink: r[3] ? SIGNAL : INK }));
    // dose screen: from 30 min before to 90 min after a dose that is not recorded yet
    var rule = ruleFor(t), dk = rule ? doseKey(t, rule.id) : null, doneDose = dk && D.doses[dk];
    var mins = rule && rule.time ? (+rule.time.slice(0, 2) * 60 + +rule.time.slice(3)) - (new Date(nowMs()).getHours() * 60 + new Date(nowMs()).getMinutes()) : null;
    var trigToday = D.items.some((x) => x.kind === 'trigger' && x.date === t);
    var isDoseNow = tab === 'today' && rule && !trigToday && mins != null && mins <= 60 && mins >= -90 && !doneDose;
    var doseItems = rule ? (rule.detail || '').split(/\s*[·,]\s*/).filter(Boolean).map((p, i) => { var m = p.match(/^(.*?)\s*([\d.]+\s*(IU|iu|mg|ml|단위|개)?)$/); return { name: m ? (m[1] || ('주사 ' + (i + 1))) : p, form: '', dose: m ? m[2] : '', icon: i % 2 ? VIAL : PEN }; }) : [];
    // curtain
    var prompts = this.prompts().map((p) => ({ t: p.t, act: p.act, icon: p.icon }));
    var thread = u.thread.map((m) => {
      if (m.candIdx != null) {
        var c = u.cands && u.cands[m.candIdx]; if (!c) return null;
        var head = c.kind === 'skip' ? '넣지 않음' : (c.end ? '매일 주사 끝' : (c.date ? dmd(c.date) : (c.daily ? '매일' : '날짜 없음')) + (c.time ? ' ' + c.time : ''));
        return { hasImg: false, imgs: [], align: 'flex-start', hasWho: false, who: '', hasText: false, text: '', radius: '', bg: '', ink: INK, hasCard: true, kicker: head, body: c.line, foot: '', edge: c.kind === 'skip' ? LINE : INK,
          hasActs: true, acts: KINDS.map((k) => ({ t: k[1], bg: c.kind === k[0] ? INK : '#FFFFFF', ink: c.kind === k[0] ? '#FFFFFF' : INK, edge: c.kind === k[0] ? 'none' : 'inset 0 0 0 1.5px ' + LINE, tap: () => { c.kind = k[0]; if (k[0] === 'open') c.title = c.line; self.render(); } })) };
      }
      var c2 = m.card, mine = m.from === 'u';
      var edge = c2 ? (c2.kind === 'alert' ? ALERT : (c2.kind === 'read' ? INK : accent)) : INK;
      return { hasImg: !!m.imgUrl, imgs: m.imgUrl ? [{ h: 150, bg: '#E4E4E7 url(' + m.imgUrl + ') center / cover no-repeat', icon: '', ic: 0, pii: false, label: '', cap: false }] : [], align: mine ? 'flex-end' : 'flex-start', hasWho: false, who: '', hasText: !!m.text, text: m.text || '',
        radius: mine ? '18px 18px 6px 18px' : '18px 18px 18px 6px', bg: mine ? INK : '#F4F4F5', ink: mine ? '#FFFFFF' : INK,
        hasCard: !!c2, kicker: c2 ? c2.kicker : '', body: c2 ? c2.body : '', foot: c2 ? c2.foot : '', edge: edge, hasActs: !!(c2 && c2.acts.length), acts: c2 ? c2.acts : [] };
    }).filter(Boolean);
    var chips = u.curtain ? this.chipsFor().map((c) => ({ label: c.label, act: c.act, bg: c.primary ? INK : '#FFFFFF', ink: c.primary ? '#FFFFFF' : INK, edge: c.primary ? 'none' : 'inset 0 0 0 1.5px ' + LINE })) : [];
    var tEmpty = u.thread.length === 0;
    var gridH = (ps) => { var h = 0; for (var i = 0; i < ps.length; i += 2) h += (i ? 8 : 0) + Math.max.apply(null, ps.slice(i, i + 2).map((p) => p.t.length > 11 ? 78 : 64)); return h; };
    var fitKey = [cur, u.curFrom, u.tab, !!u.attach, prompts.map((p) => p.t).join()].join('|');
    var curFit = u.fit && u.fit.k === fitKey ? u.fit.h : 162 + gridH(prompts) + 8 + (u.attach ? 64 : 62) + 80;
    var curH = u.curtain ? (tEmpty ? curFit : 548) : 0;
    if (u.curtain && tEmpty && this.fitKey !== fitKey) { this.fitKey = fitKey; setTimeout(() => self.measureFit('f3-cur', 'f3-thread', 'f3-cur-empty', 'fit', fitKey), 40); }
    // calendars
    var curWkI = this.weekIndex(t); this.wkExpect = { 'f3-weeks': u.wk == null ? curWkI : u.wk, 'f3-pweeks': u.pWk == null ? curWkI : u.pWk };
    var calP = this.buildCal({ patient: true, mode: u.calMode, wk: u.wk, sel: u.sel, weeksId: 'f3-weeks',
      set: (p) => { var q = {}; if ('mode' in p) { q.calMode = p.mode; q.pCalMode = p.mode; } if ('wk' in p) { q.wk = p.wk; q.pWk = p.wk; } if ('sel' in p) { q.sel = p.sel; q.pSel = p.sel; q.memoEdit = null; } self.setState(q); if ('wk' in p) setTimeout(() => self.weeksTo(p.wk, true, 'f3-pweeks'), 30); } });
    var calM = this.buildCal({ patient: false, mode: u.pCalMode, wk: u.pWk, sel: u.pSel, weeksId: 'f3-pweeks',
      set: (p) => { var q = {}; if ('mode' in p) q.pCalMode = p.mode; if ('wk' in p) q.pWk = p.wk; if ('sel' in p) q.pSel = p.sel; self.setState(q); } });
    var calMp = {}; Object.keys(calM).forEach((k) => { calMp['p' + k[0].toUpperCase() + k.slice(1)] = calM[k]; });
    // partner curtain
    var shareOn = s.share > 0;
    var pAsk = (q, msgs) => ({ t: q, act: () => { self.setState({ pThread: (self.u.pThread || []).concat([me(q)]).concat(typeof msgs === 'function' ? msgs() : msgs) }); self.scrollThread('f3-pthread'); } });
    var nvP = nextOf((x) => x.kind !== 'dose');
    var pPromptList = (u.pTab === 'plan' ? [
      pAsk('다음에 병원 가는 날은요?', () => [nvP ? card(meN() + ' 님이 공유한 일정', dmd(nvP.date) + (nvP.time ? ' ' + nvP.time : '') + ' · ' + nvP.title, '병원 안내에서 저장한 일정', 'clinic') : fv('공유된 다음 일정이 없어요.')]),
      pAsk('시간을 바꿔야 하면요?', [fv('시간 조율은 ' + meN() + ' 님이 Fevio로 병원에 전해요.\n' + ptN() + ' 님 쪽에서 병원에 따로 보내지는 않아요.')])
    ] : [
      pAsk('오늘 ' + meN() + ' 님 일정은?', () => { var l = eventsOn(t).filter((e) => e.k !== 'dose' || s.share >= 2); return [l.length ? card('오늘', l.map((e) => (e.time || '') + ' ' + e.t).join('\n'), meN() + ' 님이 공유한 범위', 'clinic') : fv('오늘은 공유된 병원 일정이 없어요.')]; }),
      pAsk('다음에 정해지는 건?', () => { var op = D.open.filter((x) => !x.done)[0]; return [fv(op ? op.title : (nvP ? '다음 일정은 ' + dmd(nvP.date) + ' ' + nvP.title + '이에요.' : '아직 공유된 일정이 없어요.'))]; }),
      pAsk('내가 챙길 건?', () => { var p = D.items.filter((x) => x.date >= t && /보호자|동반|함께|배우자|정액/.test(x.detail + x.title))[0]; return [fv(p ? dmd(p.date) + ' ' + p.title + '\n' + p.detail : '병원 안내에 ' + ptN() + ' 님이 챙길 건 아직 없어요.')]; })
    ]).concat([pAsk(meN() + '에게 물어보기', () => { put('asks/a' + Date.now().toString(36), { q: '질문이 있어요', createdAt: nowMs() }); if (!db) self.say(ptN() + ' 님이 질문을 보냈어요'); return [fv(meN() + ' 님께 보낼게요.\n병원에는 따로 보내지 않아요.')]; })]);
    var pThreadV = (u.pThread || []).map((m) => { var c = m.card, mine2 = m.from === 'u'; return { align: mine2 ? 'flex-end' : 'flex-start', hasText: !!m.text, text: m.text || '', radius: mine2 ? '18px 18px 6px 18px' : '18px 18px 18px 6px', bg: mine2 ? INK : '#F4F4F5', ink: mine2 ? '#FFFFFF' : INK, hasCard: !!c, kicker: c ? c.kicker : '', body: c ? c.body : '', foot: c ? c.foot : '', edge: c ? accent : INK }; });
    var pEmpty = !(u.pThread || []).length;
    var pFitKey = [u.pTab, s.share, pPromptList.length].join('|');
    var pCurH = !u.pCurtain ? 0 : (pEmpty ? (u.pfit && u.pfit.k === pFitKey ? u.pfit.h : 126 + gridH(pPromptList)) : 470);
    if (u.pCurtain && pEmpty && this.pFitKey !== pFitKey) { this.pFitKey = pFitKey; setTimeout(() => self.measureFit('f3-pcur', 'f3-pthread', 'f3-pcur-empty', 'pfit', pFitKey), 40); }
    var topicsFor = (role) => [['live', '같은 단계'], ['all', '전체'], ['money', '지원금·서류'], ['work', '일과 병행'], ['partner', '배우자']].filter((o) => role === 'patient' || o[0] !== 'money').map((o) => {
      var on = (role === 'patient' ? u.topic : u.pTopic) === o[0], n = D.posts.filter((p) => o[0] === 'all' || p.topic === o[0] || (o[0] === 'live' && cur != null && p.stage === MILESTONES[cur])).length;
      return { t: o[1], n: n ? String(n) : '', live: o[0] === 'live', on: on ? 'true' : 'false', tap: () => self.setState(role === 'patient' ? { topic: o[0], nudge: false, adTick: self.u.adTick + 1 } : { pTopic: o[0] }), bg: on ? INK : '#FFFFFF', ink: on ? '#FFFFFF' : INK, edge: on ? 'none' : 'inset 0 0 0 1px #E4E4E7' }; });
    var tabsFor = (role) => TABS.map((b) => { var cur2 = role === 'patient' ? tab : pTab, on = b[0] === cur2, mid = b[0] === 'today';
      return { t: b[1], icon: b[2], cur: on ? 'page' : 'false', minW: mid ? 80 : 0, bg: mid ? (on ? INK : '#F4F4F5') : 'transparent', ink: mid ? (on ? '#FFFFFF' : INK) : (on ? SIGNAL : INK2),
        go: () => { if (role === 'patient') { self.setState({ tab: b[0], pTab: b[0], settings: false, memoEdit: null }); if (b[0] === 'today') self.reanchor(false); if (b[0] === 'plan') setTimeout(() => { self.weeksTo(self.u.wk == null ? self.weekIndex(t) : self.u.wk, false); self.weeksTo(self.u.pWk == null ? self.weekIndex(t) : self.u.pWk, false, 'f3-pweeks'); }, 90); }
          else { self.setState({ pTab: b[0] }); if (b[0] === 'plan') setTimeout(() => self.weeksTo(self.u.pWk == null ? self.weekIndex(t) : self.u.pWk, false, 'f3-pweeks'), 90); if (b[0] === 'today') self.reanchor(false); } } }; });
    var postHas = !!(u.postText.trim() || u.postFiles.length);
    this.lastHas = !!u.text.trim(); this.lastPost = postHas;
    var numericQ = (x) => /[0-9]{3,}|수치|E2|AMH|hCG|난포 크기|괜찮은 건가/i.test(x);
    var addPost = async () => {
      var txt = self.u.postText.trim().slice(0, 1000), imgs = [];
      if (self.u.postFiles.length && assets) { for (var f of self.u.postFiles.slice(0, 4)) { try { var r = await assets.upload(f.file); imgs.push(r.url); } catch (e) { self.say('사진을 올리지 못했어요'); } } }
      else if (self.u.postFiles.length && typeof DEMO !== 'undefined' && DEMO.running) imgs = self.u.postFiles.map((f) => f.url);
      else if (self.u.postFiles.length) self.say('이 보기에서는 사진을 올릴 수 없어요 · 글만 올렸어요');
      put('posts/p' + Date.now().toString(36), { text: txt, nick: s.nick || (s.me ? s.me.slice(0, 1) + '**' : '익명'), stage: cur == null ? '' : MILESTONES[cur], topic: self.u.topic === 'live' || self.u.topic === 'all' ? 'all' : self.u.topic, imgs: imgs, likes: 0, replies: 0, createdAt: nowMs() });
      self.setState({ postText: '', postFiles: [], nudge: false });
    };
    var links = [['hs', '병원', s.clinic || '등록하기', ''], ['hs', '병원 전화', s.phone || '아직 없음', ''], ['meName', '내 이름', s.me || '환자', '배우자 화면에 내 이름은 뭐라고 보일까요?'], ['ptName', '배우자', s.partner || '배우자', '배우자는 뭐라고 부를까요?']]
      .map((k, i) => ({ t: k[1], v: k[2], ink: k[0] === 'hs' && !s.clinic ? SIGNAL : INK2, divider: i ? '1px solid ' + LINE : '0', tap: () => k[0] === 'hs' ? self.setState({ hs: true, hsQ: '', hsOpen: null }) : self.ask(k[0], k[3]) }));
    // 병원 등록: search, check details, register. Outside the demo the list is what Fevio has seen on your notices; anything else is entered directly.
    var dir = (typeof DEMO !== 'undefined' && DEMO.running) ? DEMO_CLINICS : (s.clinic ? [{ name: s.clinic, area: s.region || '', addr: s.clinicAddr || '', phone: s.phone || '', hours: '' }] : []);
    var q = (u.hsQ || '').replace(/\s/g, '');
    var hsList = dir.filter((c) => !q || (c.name + c.area).replace(/\s/g, '').indexOf(q) >= 0);
    var hsResults = hsList.map((c, i) => { var reg = s.clinic === c.name, open = u.hsOpen === c.name;
      return { name: c.name, sub: [c.area, c.phone].filter(Boolean).join(' · '), av: c.name.slice(0, 1), avBg: reg ? INK : '#7A8BA8', bg: open ? 'rgba(31,91,255,0.04)' : '#FFFFFF', divider: i ? '1px solid ' + LINE : '0', on: reg, open: open,
        info: [['주소', c.addr], ['전화', c.phone], ['진료', c.hours]].filter((x) => x[1]).map((x) => ({ k: x[0], v: x[1] })),
        regLabel: reg ? '등록된 병원이에요' : '이 병원으로 등록', tap: () => self.setState({ hsOpen: open ? null : c.name }),
        reg: () => { if (reg) return; put('settings/main', { clinic: c.name, phone: c.phone, clinicAddr: c.addr, updatedAt: nowMs() }, true); self.setState({ hs: false, hsOpen: null }); self.say(josa(c.name, '을', '를') + ' 등록했어요'); } }; });
    return Object.assign({
      accent: accent, dateLabel: dateLabel, meInitial: meN().slice(0, 1), ptName: ptN(), ptInitial: ptN().slice(0, 1), pMeInitial: ptN().slice(0, 1),
      // curtain
      curH: curH, appR: 0, curtainOn: u.curtain,
      openCurtain: () => self.open(), closeCurtain: () => self.closeCurtain(),
      fevioLabel: tab === 'plan' ? '예약하기' : 'Fevio', fevioAria: tab === 'plan' ? '예약하기 · Fevio 열기' : 'Fevio 열기',
      coName: s.clinic ? s.clinic + ' 코디네이터' : '병원 코디네이터', coSub: s.clinic ? (s.phone ? '병원 ' + s.phone : '연결됨') : '나에서 병원을 등록하면 연결돼요', coBg: tint(accent, 0.07),
      callClinic: () => { if (s.phone) { try { navigator.clipboard.writeText(s.phone).catch(() => {}); } catch (e) {} self.say(clinicN() + ' ' + s.phone + ' · 번호를 복사했어요'); } else self.say('병원 전화번호가 아직 없어요'); },
      threadEmpty: tEmpty, prompts: prompts, thread: thread, chips: chips, startSym: () => self.startSym(),
      attach: u.attach && tEmpty, showSym: !u.attach, attachInThread: u.attach && !tEmpty,
      toggleAttach: () => self.setState({ attach: !self.u.attach }), plusRot: u.attach ? 45 : 0,
      attachOpts: [{ t: '사진 찍기', icon: IC.camera, act: () => pickFile('camera') }, { t: '앨범에서', icon: IC.photo, act: () => pickFile('album') }],
      listening: false, notListening: true, hasText: !!u.text.trim(), wave: [],
      micLabel: '말하기', micBg: INK, toggleMic: () => self.say('이 화면에서는 마이크를 쓸 수 없어요 · 글로 적어 주세요'),
      draftText: u.text, type: (e) => { self.u.text = e.target.value; var h = !!e.target.value.trim(); if (h !== self.lastHas) { self.lastHas = h; self.render(); } },
      submit: (e) => { e.preventDefault(); self.submitText(); },
      // header, tabs, settings
      tabTitle: { today: '오늘', plan: '일정', together: '함께' }[tab], tabSub: tab === 'today' ? dateLabel : '', tabs: tabsFor('patient'),
      openSettings: () => self.setState({ settings: true }), closeSettings: () => self.setState({ settings: false }),
      setX: u.settings ? 0 : 104, setHidden: u.settings ? 'false' : 'true',
      hsX: u.hs ? 0 : 104, hsHidden: u.hs ? 'false' : 'true', hsClose: () => self.setState({ hs: false }), hsQ: u.hsQ || '',
      hsType: (e) => { self.u.hsQ = e.target.value; self.render(); }, hsResults: hsResults, hsEmpty: hsResults.length === 0,
      hsEmptyText: q ? '찾는 병원이 없어요. 직접 입력해 주세요.' : '병원 이름이나 동네로 찾아요. 안내문을 넣으면 거기 적힌 병원이 먼저 떠요.',
      hsManual: () => { self.setState({ hs: false, settings: false }); self.ask('clinic', '다니는 병원 이름을 알려 주세요.'); },
      shareSub: ['공유 꺼짐', '흐름과 다음 일정만 보여요', '흐름과 투약 시각까지 보여요'][s.share],
      shareOpts: ['끔', '흐름만', '흐름+투약'].map((x, i) => ({ t: x, on: i === s.share ? 'true' : 'false', pick: () => put('settings/main', { share: i, updatedAt: nowMs() }, true), bg: i === s.share ? '#FFFFFF' : 'transparent', ink: i === s.share ? INK : INK2, edge: i === s.share ? '0 1px 3px rgba(14,15,17,0.12)' : 'none' })),
      labOn: s.lab ? 'true' : 'false', toggleLab: () => { if (s.share > 0) put('settings/main', { lab: !s.lab, updatedAt: nowMs() }, true); },
      labTrack: s.lab && s.share > 0 ? INK : '#D4D4D8', labX: s.lab && s.share > 0 ? 16 : 0, labO: s.share > 0 ? 1 : 0.4,
      adPersStr: s.adPers ? 'true' : 'false', toggleAdPers: () => put('settings/main', { adPers: !s.adPers, updatedAt: nowMs() }, true), adPersTrack: s.adPers ? INK : '#D4D4D8', adPersX: s.adPers ? 16 : 0,
      links: links,
      // today
      isDose: !!isDoseNow, isFlow: tab === 'today' && !isDoseNow, isPlan: tab === 'plan', isTogether: tab === 'together',
      doseNote: (cur != null ? MILESTONES[cur] : '') + ' · ' + clinicN() + ' 안내', doseTime: rule ? rule.time : '', doseLeft: mins == null ? '' : (mins >= 45 ? '1시간쯤 뒤예요 · 천천히 준비해도 돼요' : (mins >= 15 ? '곧이에요 · 미리 꺼내 두면 돼요' : (mins >= -5 ? '지금 맞으면 돼요' : '시간이 지났어요 · 맞았다면 기록만 해 주세요'))), doseLeftInk: mins != null && mins < -5 ? INK2 : SIGNAL, doseCount: rule && rule.time ? (secsTo(t, rule.time) > 0 ? leftText(secsTo(t, rule.time)) : '지났어요') : '', doseRingOff: rule && rule.time ? ringFor(secsTo(t, rule.time), 60, 326.7).off : 326.7, doseRingSecs: rule && rule.time ? Math.max(1, secsTo(t, rule.time)) : 1, doseTrackW: mins == null ? 0 : Math.max(4, Math.min(100, Math.round((60 - mins) / 60 * 100))), doseTrackFrom: rule && rule.time ? pad((+rule.time.slice(0, 2) + 23) % 24) + ':' + rule.time.slice(3) : '',
      doseItems: doseItems, doseDone: () => { put('doses/' + dk, { at: nowMs(), createdAt: nowMs() }); self.say('기록했어요' + (s.share >= 2 ? ' · ' + ptN() + ' 님 화면에도 보여요' : '')); },
      doseLabel: '맞았어요', doseBg: INK, doseInk: '#FFFFFF',
      hasNews: false, news: '', newsTime: '', tlTop: 92,
      flow: tl.after, flowPast: tl.before, planAnchor: '', planLine: tl.line,
      onTl: (e) => { var away = self.nowTop != null && Math.abs(e.target.scrollTop - self.nowTop) > 120; if (away !== self.u.away) self.setState({ away: away }); },
      showNowBtn: tab === 'today' && u.away && !u.curtain && !u.settings, toNow: () => self.anchor(true),
      hasPlan: tab === 'today' && !!plan, planOpen: !!plan && !plan.acked, planClosed: !!plan && !!plan.acked,
      planAt: plan && !plan.acked ? hm(plan.at) : '', planShort: plan ? plan.short : '', planCardRows: plan ? planRows(plan.rows) : [],
      planAck: () => { if (plan) put('plans/' + plan.id, { acked: true, ackedAt: nowMs() }, true); },
      // together
      togSegs: [['road', '커뮤니티'], ['us', '정부지원']].map((g) => ({ t: g[1], n: '', on: u.togSeg === g[0] ? 'true' : 'false', tap: () => self.setState({ togSeg: g[0] }), bg: u.togSeg === g[0] ? '#FFFFFF' : 'transparent', ink: u.togSeg === g[0] ? INK : INK2, edge: u.togSeg === g[0] ? '0 1px 3px rgba(14,15,17,0.12)' : 'none' })),
      togUs: u.togSeg === 'us', togRoad: u.togSeg === 'road', support: this.support('patient'), prep: this.prep('patient'),
      topics: topicsFor('patient'), posts: this.feed('patient'),
      postText: u.postText, postType: (e) => { self.u.postText = e.target.value; var h = !!(e.target.value.trim() || self.u.postFiles.length); if (h !== self.lastPost) { self.lastPost = h; self.render(); } },
      postOff: !postHas, postBg: postHas ? INK : '#F4F4F5', postInk: postHas ? '#FFFFFF' : INK2,
      hasPostImgs: u.postFiles.length > 0, postImgs: u.postFiles.map((f, i) => ({ h: 72, bg: '#E4E4E7 url(' + f.url + ') center / cover no-repeat', icon: '', ic: 0, pii: false, label: '', cap: false, remove: () => self.setState({ postFiles: self.u.postFiles.filter((_, j) => j !== i) }) })),
      photoBtnBg: '#F4F4F5', photoBtnInk: '#575A62', togglePhotoPick: () => pickFile('post'),
      postSubmit: (e) => { e.preventDefault(); if (!postHas) return; if (numericQ(self.u.postText) && !self.u.nudge) { self.setState({ nudge: true }); return; } addPost(); },
      hasNudge: u.nudge, nudgeText: '검사 수치는 병원마다 보는 기준이 달라요. 병원에도 같이 물어볼까요?',
      nudgePost: () => addPost(), nudgeAsk: () => { var q = self.u.postText.trim(); self.setState({ nudge: false, postText: '' }); self.open({ curFrom: 'today' }); self.push([me(q), card(clinicN() + '에 물어보기', q + (s.phone ? '\n병원 ' + s.phone : ''), '수치의 뜻은 병원이 답해요 · Fevio는 판단하지 않아요', 'clinic', s.phone ? [self.copyAct('번호 복사', s.phone)] : [])]); },
      hasToast: !!u.toast, toast: u.toast,
      // partner
      pCurH: pCurH, pAppR: 0, pCurtainOn: !!u.pCurtain,
      pOpenCurtain: () => self.setState({ pCurtain: true }), pCloseCurtain: () => self.setState({ pCurtain: false }),
      pThreadEmpty: pEmpty, pPrompts: pPromptList.map((p, i) => ({ t: p.t, act: p.act, icon: [IC.cal, IC.search, IC.people, IC.phone][i] || IC.search })), pThread: pThreadV,
      pHasChips: !pEmpty, pPromptChips: pPromptList.slice(0, 2).map((p) => ({ t: p.t, act: p.act })),
      pTabTitle: { today: '오늘', plan: '일정', together: '함께' }[pTab], pTabSub: pTab === 'today' ? dateLabel : '',
      pOpenSettings: () => self.pSay('공유 범위는 ' + meN() + ' 님이 정해요'), pTabs: tabsFor('partner'),
      pOff: !shareOn, pOffText: meN() + ' 님이 공유를 잠시 멈췄어요',
      pIsFlow: pTab === 'today' && shareOn, pFlow: ptl.after, pFlowPast: ptl.before, pPlanAnchor: '', pPlanLine: ptl.line, pTlTop: 92, pOnTl: NOOP,
      pHasPlan: pTab === 'today' && shareOn && !!plan, pPlanRows: plan ? planRows(plan.rows.filter((r) => s.share >= 2 || r[0] !== '그때까지')) : [],
      pAckT: plan && plan.acked ? meN() + ' 확인함' : meN() + ' 확인 전', pAckBg: plan && plan.acked ? INK : '#F4F4F5', pAckInk: plan && plan.acked ? '#FFFFFF' : INK2,
      pIsPlan: pTab === 'plan' && shareOn, pIsTogether: pTab === 'together' && shareOn,
      pTopics: topicsFor('partner'), pPosts: this.feed('partner'),
      pSegs: [['road', '커뮤니티'], ['us', '정부지원']].map((g) => { var on = u.pSeg === g[0]; return { t: g[1], on: on ? 'true' : 'false', tap: () => self.setState({ pSeg: g[0] }), bg: on ? '#FFFFFF' : 'transparent', ink: on ? INK : INK2, edge: on ? '0 1px 3px rgba(14,15,17,0.12)' : 'none' }; }),
      pSegUs: u.pSeg === 'us', pSegRoad: u.pSeg === 'road', pSupport: this.support('partner'), pPrep: this.prep('partner'),
      pHasToast: !!u.pToast, pToast: u.pToast
    }, calP, calMp);
  }
  measureFit(cid, tid, eid, slot, k) {
    var c = document.getElementById(cid), t = document.getElementById(tid), e = document.getElementById(eid); if (!c || !t || !e) return;
    var px = (el, p) => parseFloat(getComputedStyle(el)[p]) || 0;
    var h = px(c, 'paddingTop') + px(t, 'paddingTop') + px(t, 'paddingBottom') + e.offsetHeight;
    Array.prototype.forEach.call(c.children, (ch) => { if (ch !== t) h += ch.offsetHeight + px(ch, 'marginTop') + px(ch, 'marginBottom'); });
    h = Math.round(h); var cur = this.u[slot];
    if (!cur || cur.k !== k || Math.abs(cur.h - h) > 2) { var p = {}; p[slot] = { k: k, h: h }; this.setState(p); }
  }
  render() { scheduleRender(); }
}
function rel(ts) { var s = Math.max(0, (nowMs() - ts) / 1000); if (s < 60) return '방금'; if (s < 3600) return Math.floor(s / 60) + '분 전'; if (s < 86400) return Math.floor(s / 3600) + '시간 전'; return mdl(ymd(new Date(ts))); }
var wide = () => true;
