'use strict';
var INK = '#0E0F11', INK2 = '#575A62', SIGNAL = '#1F5BFF', LINE = '#E4E4E7', ALERT = '#D92D20', OK = '#12B76A';
var pad = (n) => String(n).padStart(2, '0');
var DOW = ['일', '월', '화', '수', '목', '금', '토'];
var ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
var parseYmd = (s) => { var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
var addDays = (d, n) => { var x = new Date(d); x.setDate(x.getDate() + n); return x; };
var today0 = () => { var d = new Date(); d.setHours(0, 0, 0, 0); return d; };
var TODAY = () => ymd(today0());
var md = (s) => { var d = parseYmd(s); return (d.getMonth() + 1) + '/' + d.getDate() + '(' + DOW[d.getDay()] + ')'; };
var dl = (s) => { var d = parseYmd(s); return DOW[d.getDay()] + ' ' + d.getDate(); };
var hm = (ts) => { var d = new Date(ts); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
var hms = (ts) => { var d = new Date(ts); return hm(ts) + ':' + pad(d.getSeconds()); };
var nowHM = () => hm(Date.now());
var median = (xs) => { if (!xs.length) return null; var s = xs.slice().sort((a, b) => a - b), m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); };

/* Decision templates: each asks only for what changes. The message is the contract with the patient app. */
var DECISIONS = [['more1', '하루 더'], ['more2', '이틀 더'], ['trigger', '트리거'], ['retrieval', '채취 확정'], ['transfer', '이식'], ['lab', '연구실 연락']];
var DLABEL = Object.fromEntries(DECISIONS);
function defaults(dec) {
  var t = today0(), f = { visitDate: '', visitTime: '09:00', visitWhat: '초음파·피검사', dose: '변경 없음', doseTime: '21:00', trigDate: ymd(t), trigTime: '22:00', retDate: '', retTime: '07:30', trDate: '', trTime: '10:00', labDate: '', open: '' };
  if (dec === 'more1' || dec === 'more2') { f.visitDate = ymd(addDays(t, dec === 'more1' ? 1 : 2)); f.open = '채취일 — 다음 검사 뒤 안내'; }
  if (dec === 'trigger') f.retDate = ymd(addDays(t, 2));
  if (dec === 'retrieval') f.retDate = ymd(addDays(t, 1));
  if (dec === 'transfer') f.trDate = ymd(addDays(t, 1));
  if (dec === 'lab') { f.labDate = ymd(addDays(t, 1)); f.open = '이식일 — 배아 상태 보고 안내'; }
  return f;
}
function buildMessage(clinic, dec, f) {
  var L = ['[' + (clinic || '병원') + '] 오늘 진료 뒤 계획'];
  if ((dec === 'more1' || dec === 'more2') && f.visitDate) L.push('다음 내원: ' + md(f.visitDate) + ' ' + f.visitTime + ' ' + f.visitWhat);
  if (dec === 'more1' || dec === 'more2') L.push('주사: ' + (f.dose || '변경 없음') + ' · 매일 ' + f.doseTime);
  if (dec === 'trigger') { L.push('트리거: ' + md(f.trigDate) + ' ' + f.trigTime + ' 정각'); L.push('주사: 오늘로 끝'); }
  if ((dec === 'trigger' || dec === 'retrieval') && f.retDate) L.push('채취: ' + md(f.retDate) + ' ' + f.retTime + ' · 전날 24시부터 금식');
  if (dec === 'transfer' && f.trDate) L.push('이식: ' + md(f.trDate) + ' ' + f.trTime);
  if (dec === 'lab' && f.labDate) L.push('연구실 연락: ' + md(f.labDate) + ' 오전');
  if (f.open) L.push('미정: ' + f.open);
  L.push('Fevio에 붙여 넣으면 일정으로 정리돼요.');
  return L.join('\n');
}
function nextLabel(p) {
  var f = p.f || {};
  if (p.decision === 'more1' || p.decision === 'more2') return f.visitDate ? dl(f.visitDate) + ' ' + f.visitTime + ' 재검사' : '재검사';
  if (p.decision === 'trigger') return '트리거 ' + f.trigTime + ' → 채취 ' + (f.retDate ? dl(f.retDate) + ' ' + f.retTime : '');
  if (p.decision === 'retrieval') return '채취 ' + (f.retDate ? dl(f.retDate) + ' ' + f.retTime : '');
  if (p.decision === 'transfer') return '이식 ' + (f.trDate ? dl(f.trDate) + ' ' + f.trTime : '');
  if (p.decision === 'lab') return '연구실 연락 ' + (f.labDate ? dl(f.labDate) : '');
  return '판독 대기';
}

var D = { ready: false, offline: false, settings: {}, plans: [], patients: [], contacts: {}, last: null };
var db = null, mem = {};
function put(path, data, merge) {
  if (db) return (merge ? db.doc(path).update(data) : db.doc(path).set(data)).catch((e) => merge ? db.doc(path).set(data).catch(fail) : fail(e));
  var p = path.split('/'); mem[p[0]] = mem[p[0]] || {}; mem[p[0]][p[1]] = merge ? Object.assign({}, mem[p[0]][p[1]] || {}, data) : data; applyMem(); return Promise.resolve();
}
function delDoc(path) { if (db) return db.doc(path).delete().catch(fail); var p = path.split('/'); if (mem[p[0]]) delete mem[p[0]][p[1]]; applyMem(); return Promise.resolve(); }
function fail(e) { app.say(e && e.code === 'quota_exceeded' ? '저장 공간이 가득 찼어요' : '저장하지 못했어요 · 잠시 뒤 다시 해 주세요'); }
var COLLS = ['settings', 'plans', 'patients', 'contacts'];
function setColl(c, docs) {
  if (c === 'settings') D.settings = (docs.find((d) => d.id === 'main') || {}).data || {};
  else if (c === 'contacts') { var o = {}; docs.forEach((d) => { o[d.id] = d.data; }); D.contacts = o; }
  else D[c] = docs.map((d) => Object.assign({ id: d.id }, d.data));
  D.last = Date.now();
}
function applyMem() { COLLS.forEach((c) => setColl(c, Object.entries(mem[c] || {}).map((e) => ({ id: e[0], data: e[1] })))); app.render(); }
var S = () => Object.assign({ clinic: '', staff: '', cutoff: '16:00', retCap: 3, trCap: 3, usCap: 24 }, D.settings);
var CT = [['re', '이미 안내한 내용 재확인'], ['chg', '시간 변경 요청'], ['sym', '증상 · 몸 상태'], ['etc', '기타 · 예약 문의']];

class App {
  constructor() { this.u = { drawer: null, open: null, draft: null, code: '', toast: '' }; }
  setState(p) { Object.assign(this.u, p); this.render(); }
  say(t) { this.setState({ toast: t }); clearTimeout(this.tt); this.tt = setTimeout(() => this.setState({ toast: '' }), 2600); }
  render() { scheduleRender(); }
  todays() { var t = TODAY(); return D.plans.filter((p) => p.date === t).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)); }
  draftFrom(p) { return { decision: p.decision || '', f: Object.assign(defaults(p.decision), p.f || {}) }; }
  vals() {
    var self = this, u = this.u, s = S(), list = this.todays(), t = TODAY(), late = nowHM() >= s.cutoff;
    var n = list.length, dec = list.filter((p) => p.decision && p.decidedAt), sent = list.filter((p) => p.sentAt), ok = list.filter((p) => p.confirmedAt);
    var mins = (a, b) => Math.max(0, Math.round((b - a) / 60000));
    var dotOf = (pass, p) => ({ id: p.code, bg: pass ? (p.id === u.open ? SIGNAL : INK) : '#E4E4E7', ring: 'none' });
    var medDec = median(dec.map((p) => mins(p.createdAt, p.decidedAt))), medSent = median(sent.filter((p) => p.decidedAt).map((p) => mins(p.decidedAt, p.sentAt)));
    var slow = sent.filter((p) => p.decidedAt && mins(p.decidedAt, p.sentAt) > 30).length;
    var STG = [
      { k: 'scan', t: '검사 완료', n: n, of: n, pass: () => true, m: n ? '오늘 본 환자 ' + n + '명' : '환자를 추가해 주세요', mInk: INK2 },
      { k: 'decide', t: '판독 · 결정', n: dec.length, of: n, pass: (p) => !!p.decidedAt, m: medDec == null ? '결정 전' : '검사→결정 중앙값 ' + medDec + '분', mInk: INK2 },
      { k: 'notify', t: '계획 안내', n: sent.length, of: dec.length, pass: (p) => !!p.sentAt, m: medSent == null ? '안내 전' : '결정→안내 중앙값 ' + medSent + '분' + (slow ? ' · 30분 넘김 ' + slow : ''), mInk: slow ? ALERT : INK2 },
      { k: 'ack', t: '환자 확인', n: ok.length, of: sent.length, pass: (p) => !!p.confirmedAt, m: sent.length - ok.length ? '확인 표시 없음 ' + (sent.length - ok.length) + ' · 추정 안 함' : '모두 확인', mInk: INK2 }
    ];
    var ex = [];
    list.forEach((p) => {
      if (p.calledAt || p.confirmedAt) return;
      if (p.decidedAt && !p.sentAt) ex.push({ p: p, t: p.code + ' · 결정 뒤 안내 안 됨', s: DLABEL[p.decision] + ' · ' + hm(p.decidedAt) + ' 결정', btn: '열기', dot: ALERT, act: () => self.openPatient(p, 'notify') });
      else if (p.sentAt && late) ex.push({ p: p, t: p.code + ' · ' + s.cutoff + '까지 확인 없음', s: hm(p.sentAt) + ' 안내 · 전화로 확인', btn: '전화함', dot: SIGNAL, act: () => { put('plans/' + p.id, { calledAt: Date.now(), updatedAt: Date.now() }, true); self.say(p.code + ' 전화함으로 표시했어요'); } });
    });
    var c = D.contacts[t] || {}, ctN = CT.reduce((a, x) => a + (c[x[0]] || 0), 0), ctMax = Math.max(1, ...CT.map((x) => c[x[0]] || 0));
    // next working days' load, from each patient's latest decision
    var latest = {};
    D.plans.forEach((p) => { if (!p.decision || !p.decidedAt) return; if (!latest[p.code] || p.date > latest[p.code].date) latest[p.code] = p; });
    var days = [1, 2, 3, 4].map((i) => ymd(addDays(today0(), i)));
    var conf = days.map(() => []), cond = days.map(() => []), trs = days.map(() => []), us = days.map(() => 0), condPeople = new Set(), confPeople = new Set();
    Object.values(latest).forEach((p) => {
      var f = p.f || {}, ix = (d) => days.indexOf(d);
      if ((p.decision === 'trigger' || p.decision === 'retrieval') && f.retDate && ix(f.retDate) >= 0) { conf[ix(f.retDate)].push(p.code); confPeople.add(p.code); }
      if ((p.decision === 'more1' || p.decision === 'more2') && f.visitDate) {
        if (ix(f.visitDate) >= 0) us[ix(f.visitDate)]++;
        for (var k = 2; k <= 4; k++) { var j = ix(ymd(addDays(parseYmd(f.visitDate), k))); if (j >= 0) { cond[j].push(p.code); condPeople.add(p.code); } }
      }
      if (p.decision === 'transfer' && f.trDate && ix(f.trDate) >= 0) trs[ix(f.trDate)].push(p.code);
    });
    var units = (cf, cd, cap) => { var out = cf.map((id) => ({ cls: '', bg: INK, ring: 'none' })).concat(cd.map(() => ({ cls: 'hatch', bg: 'transparent', ring: 'inset 0 0 0 1px rgba(31,91,255,0.5)' }))); var free = Math.max(0, cap - out.length); for (var q = 0; q < free; q++) out.push({ cls: '', bg: '#F4F4F5', ring: 'none' }); return out; };
    var rxRows = [
      { t: '초음파 (오전)', cells: days.map((d, i) => ({ isBar: true, isUnits: false, units: [], w: Math.min(100, Math.round(us[i] / s.usCap * 100)), label: '재검사 ' + us[i] + ' / ' + s.usCap, st: '여유 ' + Math.max(0, s.usCap - us[i]), stInk: INK2, edge: 'inset 0 0 0 1px #E4E4E7', hasDelta: false, delta: '', dBg: SIGNAL })) },
      { t: '채취실', cells: days.map((d, i) => { var over = conf[i].length + cond[i].length - s.retCap; return { isBar: false, isUnits: true, w: 0, units: units(conf[i], cond[i], s.retCap), label: '확정 ' + conf[i].length + ' · 조건부 최대 ' + cond[i].length + ' / ' + s.retCap, st: over > 0 ? '조건부까지면 부족 ' + over : '여유 ' + (s.retCap - conf[i].length - cond[i].length), stInk: over > 0 ? ALERT : INK2, edge: over > 0 ? 'inset 0 0 0 1.5px #D92D20' : 'inset 0 0 0 1px #E4E4E7', hasDelta: false, delta: '', dBg: SIGNAL }; }) },
      { t: '이식', cells: days.map((d, i) => ({ isBar: false, isUnits: true, w: 0, units: units(trs[i], [], s.trCap), label: '확정 ' + trs[i].length + ' / ' + s.trCap, st: '여유 ' + Math.max(0, s.trCap - trs[i].length), stInk: INK2, edge: 'inset 0 0 0 1px #E4E4E7', hasDelta: false, delta: '', dBg: SIGNAL })) }
    ];
    // recent changes, newest first
    var evs = [];
    list.forEach((p) => { if (p.decidedAt) evs.push([p.decidedAt, p.code + ' 결정 · ' + DLABEL[p.decision]]); if (p.sentAt) evs.push([p.sentAt, p.code + ' 안내 보냄']); if (p.confirmedAt) evs.push([p.confirmedAt, p.code + ' 확인']); });
    evs.sort((a, b) => b[0] - a[0]);
    // drawer
    var dr = u.drawer, drRows = [], drTitle = '';
    if (dr === 'settings') drTitle = '설정';
    else if (dr) {
      var pick = { scan: () => true, all: () => true, decide: (p) => !p.decidedAt, notify: (p) => p.decidedAt && !p.sentAt, ack: (p) => p.sentAt && !p.confirmedAt }[dr] || (() => true);
      drTitle = { scan: '오늘 본 환자', all: '오늘 본 환자', decide: '판독 · 결정 대기', notify: '계획 안내 전', ack: '확인 표시 없음 (추정 안 함)' }[dr];
      drRows = list.filter(pick).map((p) => this.drRow(p));
    }
    var connected = !!db && D.ready;
    return {
      accent: '#7A2E8E', clinicName: s.clinic || '병원 이름을 설정해 주세요', clinicInitial: (s.clinic || '병').slice(0, 1),
      staffName: s.staff || '담당자', staffRole: (today0().getMonth() + 1) + '.' + today0().getDate() + ' ' + DOW[today0().getDay()] + ' 오전 모니터링',
      oNav: [['ops', '운영 현황'], ['all', '환자'], ['settings', '설정']].map((x) => { var on = x[0] === 'ops' ? !dr : dr === x[0]; return { t: x[1], bg: on ? '#FFFFFF' : 'transparent', ink: on ? INK : INK2, tap: () => self.setState({ drawer: x[0] === 'ops' ? null : x[0], open: null, draft: null }) }; }),
      todayLabel: (today0().getMonth() + 1) + '.' + today0().getDate() + ' ' + DOW[today0().getDay()], cohortN: n,
      syncBg: connected ? '#F4F4F5' : 'rgba(217,45,32,0.08)', syncInk: connected ? INK2 : ALERT, syncDot: connected ? OK : ALERT,
      syncText: connected ? '연결됨 · 마지막 반영 ' + hms(D.last || Date.now()) : (D.offline ? '이 보기에서는 저장되지 않아요' : '연결 중'), oDim: 1,
      ticker: evs.slice(0, 4).map((e, i) => ({ t: hm(e[0]), text: e[1], bg: i === 0 && Date.now() - e[0] < 8000 ? 'rgba(31,91,255,0.10)' : '#F4F4F5', ink: i === 0 && Date.now() - e[0] < 8000 ? SIGNAL : INK2 })),
      stages: STG.map((g) => ({ t: g.t, n: g.n, of: g.of, m: g.m, mInk: g.mInk, edge: dr === g.k ? 'inset 0 0 0 2px ' + SIGNAL : 'inset 0 0 0 1px #E4E4E7', open: g.k === 'scan' ? '추가 ›' : '환자 보기 ›', dots: list.map((p) => dotOf(g.pass(p), p)), tap: () => self.setState({ drawer: g.k, open: null, draft: null }) })),
      contacts: CT.map((x) => ({ t: x[1], wF: 0, wN: Math.round((c[x[0]] || 0) / ctMax * 100), v: '간호 ' + (c[x[0]] || 0), add: () => put('contacts/' + t, { [x[0]]: (c[x[0]] || 0) + 1, updatedAt: Date.now() }, true) })),
      ctTotal: ctN, ctFevio: 0, ctNurse: ctN, ctMin: ctN * 4,
      exceptions: ex.map((x) => ({ t: x.t, s: x.s, btn: x.btn, dot: x.dot, bg: '#F7F7F8', off: false, o: 1, tap: x.act })), exN: ex.length, exEmpty: ex.length === 0,
      rxDays: days.map(dl), rxRows: rxRows, wkSum: '채취 확정 ' + confPeople.size + ' · 조건부 ' + condPeople.size + '명 (사람 기준)',
      drX: dr ? 0 : 104, drHidden: dr ? 'false' : 'true', drClose: () => self.setState({ drawer: null, open: null, draft: null }),
      drTitle: drTitle, drN: dr === 'settings' ? '' : drRows.length + '명', drRows: drRows, drIsList: dr !== 'settings', drIsSettings: dr === 'settings',
      drHasAdd: dr === 'scan' || dr === 'all', addCode: u.code, addType: (e) => { self.u.code = e.target.value; },
      addSubmit: (e) => { e.preventDefault(); self.addPatient(); },
      setRows: [['clinic', '병원 이름', 'text', '안내문 첫 줄에 들어가요'], ['staff', '담당자', 'text', ''], ['cutoff', '확인 마감', 'time', ''], ['usCap', '초음파 오전 정원', 'number', ''], ['retCap', '채취실 하루 정원', 'number', ''], ['trCap', '이식 하루 정원', 'number', '']]
        .map((r) => ({ id: 'set-' + r[0], label: r[1], type: r[2], value: String(s[r[0]] == null ? '' : s[r[0]]), ph: r[3], set: (e) => put('settings/main', { [r[0]]: r[2] === 'number' ? Math.max(0, Math.min(99, +e.target.value || 0)) : e.target.value.trim().slice(0, 30), updatedAt: Date.now() }, true) })),
      hasToast: !!u.toast, toast: u.toast
    };
  }
  drRow(p) {
    var self = this, u = this.u, open = u.open === p.id, d = open ? u.draft : null;
    var row = { id: p.code, scan: p.createdAt ? hm(p.createdAt) : '—', dec: p.decidedAt ? hm(p.decidedAt) : '대기', via: p.sentAt ? '안내 ' + hm(p.sentAt) : (p.decidedAt ? '안내 전' : '—'),
      viaInk: p.sentAt ? (p.confirmedAt ? OK : SIGNAL) : (p.decidedAt ? ALERT : INK2), next: p.confirmedAt ? nextLabel(p) + ' · 확인' : nextLabel(p), bg: open ? 'rgba(31,91,255,0.05)' : '#FFFFFF',
      tap: () => { if (self.u.open === p.id) self.setState({ open: null, draft: null }); else self.setState({ open: p.id, draft: self.draftFrom(p) }); }, open: open };
    if (!open) return Object.assign(row, { decs: [], fields: [], hasDec: false, msg: '', msgId: '', send: null, sendLabel: '', canConfirm: false, confirm: null, remove: null });
    var f = d.f, inp = (k, type, aria, w) => ({ type: type, value: f[k] || '', aria: aria, w: w, set: (e) => { self.u.draft.f[k] = e.target.value; var box = document.getElementById('msg-' + p.id); if (box) box.value = buildMessage(S().clinic, self.u.draft.decision, self.u.draft.f); }, save: () => put('plans/' + p.id, { f: self.u.draft.f, updatedAt: Date.now() }, true) });
    var fl = [];
    if (d.decision === 'more1' || d.decision === 'more2') { fl.push({ label: '다음 내원', inputs: [inp('visitDate', 'date', '날짜', 136), inp('visitTime', 'time', '시각', 96), inp('visitWhat', 'text', '검사', 120)] }); fl.push({ label: '주사', inputs: [inp('dose', 'text', '주사', 160), inp('doseTime', 'time', '시각', 96)] }); }
    if (d.decision === 'trigger') fl.push({ label: '트리거', inputs: [inp('trigDate', 'date', '날짜', 136), inp('trigTime', 'time', '시각', 96)] });
    if (d.decision === 'trigger' || d.decision === 'retrieval') fl.push({ label: '채취', inputs: [inp('retDate', 'date', '날짜', 136), inp('retTime', 'time', '시각', 96)] });
    if (d.decision === 'transfer') fl.push({ label: '이식', inputs: [inp('trDate', 'date', '날짜', 136), inp('trTime', 'time', '시각', 96)] });
    if (d.decision === 'lab') fl.push({ label: '연락 날짜', inputs: [inp('labDate', 'date', '날짜', 136)] });
    if (d.decision) fl.push({ label: '아직 미정', inputs: [inp('open', 'text', '아직 미정', 230)] });
    var msg = d.decision ? buildMessage(S().clinic, d.decision, f) : '';
    return Object.assign(row, {
      decs: DECISIONS.map((x) => { var on = d.decision === x[0]; return { t: x[1], bg: on ? INK : '#FFFFFF', ink: on ? '#FFFFFF' : INK, edge: on ? 'none' : 'inset 0 0 0 1px ' + LINE,
        tap: () => { var nd = { decision: x[0], f: Object.assign(defaults(x[0]), self.u.draft.decision === x[0] ? self.u.draft.f : {}) }; self.u.draft = nd; put('plans/' + p.id, { decision: x[0], f: nd.f, decidedAt: p.decidedAt || Date.now(), updatedAt: Date.now() }, true); self.render(); } }; }),
      fields: fl, hasDec: !!d.decision, msg: msg, msgId: 'msg-' + p.id,
      sendLabel: p.sentAt ? '다시 복사' : '안내문 복사 · 보냄으로 표시',
      send: () => { var m = buildMessage(S().clinic, self.u.draft.decision, self.u.draft.f), done = () => put('plans/' + p.id, { decision: self.u.draft.decision, f: self.u.draft.f, message: m, decidedAt: p.decidedAt || Date.now(), sentAt: p.sentAt || Date.now(), updatedAt: Date.now() }, true);
        try { navigator.clipboard.writeText(m).then(() => { done(); self.say('안내문을 복사했어요 · 문자·알림톡에 붙여 보내 주세요'); }, () => { done(); var b = document.getElementById('msg-' + p.id); if (b) b.select(); self.say('복사가 막혀 있어요 · 선택된 글을 복사해 주세요'); }); } catch (e) { done(); } },
      canConfirm: !!p.sentAt && !p.confirmedAt, confirm: () => put('plans/' + p.id, { confirmedAt: Date.now(), updatedAt: Date.now() }, true),
      remove: () => { delDoc('plans/' + p.id); self.setState({ open: null, draft: null }); }
    });
  }
  openPatient(p, drawer) { this.setState({ drawer: drawer, open: p.id, draft: this.draftFrom(p) }); }
  addPatient() {
    var code = (this.u.code || '').trim().toUpperCase().replace(/[^A-Z0-9\-]/g, '').slice(0, 16); if (!code) return;
    var t = TODAY(), id = t + '_' + code, ex = D.plans.find((p) => p.id === id);
    if (ex) { this.setState({ open: id, draft: this.draftFrom(ex), code: '' }); return; }
    put('patients/' + code, { code: code, lastSeen: t, createdAt: Date.now() });
    put('plans/' + id, { date: t, code: code, decision: '', f: {}, createdAt: Date.now() });
    this.setState({ code: '', open: id, draft: { decision: '', f: {} } });
  }
}
