/* ===== Demo: plays one IVF cycle day by day on both phones, in a sandbox that is thrown away afterwards ===== */
var DEMO = { running: false, paused: false, stop: false, speed: 1, scene: -1, real: null, start: null, caption: '', day: '' };
var PT = () => document.getElementById('ph-patient'), PR = () => document.getElementById('ph-partner');
var sleep = (ms) => new Promise((r) => setTimeout(r, ms / DEMO.speed));
async function gate() { while (DEMO.paused && !DEMO.stop) await new Promise((r) => setTimeout(r, 120)); if (DEMO.stop) throw new Error('demo-stop'); }
async function wait(ms) { await gate(); await sleep(ms); await gate(); }
var dayStr = (n) => ymd(addDays(DEMO.start, n - 1));
var mmdd = (n) => { var d = addDays(DEMO.start, n - 1); return (d.getMonth() + 1) + '/' + d.getDate() + '(' + DOW[d.getDay()] + ')'; };
function setClock(n, hhmm) {
  if (typeof app !== 'undefined') Object.assign(app.u, { wk: null, pWk: null, sel: null, pSel: null }); var d = addDays(DEMO.start, n - 1); d.setHours(+hhmm.slice(0, 2), +hhmm.slice(3), 0, 0); CLOCK.base = d.getTime(); CLOCK.set = Date.now(); }
function visible(el) {
  if (!el || !el.getClientRects().length) return false;
  if (el.closest('[aria-hidden="true"]')) return false;
  var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0;
}
function find(root, sel, text) {
  var els = Array.from(root.querySelectorAll(sel || 'button, [data-on-click]'));
  return els.find((e) => visible(e) && (!text || e.textContent.replace(/\s+/g, ' ').trim().indexOf(text) >= 0)) || null;
}
async function waitFor(fn, ms) { var t0 = Date.now(); for (;;) { var el = fn(); if (el) return el; if (Date.now() - t0 > (ms || 4000)) return null; await new Promise((r) => setTimeout(r, 80)); } }
function bringIntoView(el) {
  if (!document.body.classList.contains('stacked')) return;
  var phone = el.closest('.frame'); if (phone) phone.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
async function tap(root, sel, text) {
  await gate();
  var el = await waitFor(() => find(root, sel, text));
  if (!el) return false;
  bringIntoView(el); await sleep(160);
  var r = el.getBoundingClientRect(), fx = document.createElement('div');
  fx.className = 'tapfx'; fx.style.left = (r.left + r.width / 2 + window.scrollX) + 'px'; fx.style.top = (r.top + r.height / 2 + window.scrollY) + 'px';
  document.body.appendChild(fx); setTimeout(() => fx.remove(), 700);
  await sleep(240); el.click(); await wait(520);
  return true;
}
async function type(root, sel, text) {
  await gate();
  var el = await waitFor(() => find(root, sel)); if (!el) return;
  bringIntoView(el);
  var chunk = Math.max(1, Math.round(text.length / 60));
  for (var i = chunk; i <= text.length + chunk - 1; i += chunk) {
    await gate();
    el = find(root, sel) || el;
    el.value = text.slice(0, Math.min(i, text.length)); el.dispatchEvent(new Event('input', { bubbles: true }));
    if (el.tagName === 'TEXTAREA') el.scrollTop = el.scrollHeight;
    await sleep(22);
  }
  await wait(320);
}
async function say(fevioText) { await type(PT(), '#f3ask', fevioText); await tap(PT(), 'button[aria-label="보내기"]'); }
function caption(day, text) { DEMO.day = day; DEMO.caption = text; drawBar(); }
async function goTab(name) { await tap(PT(), 'div[style*="1fr auto 1fr"] button', name); await wait(300); }
async function closeCurtain() { if (app.u.curtain) { await tap(PT(), 'button[aria-label="Fevio 닫기"]'); await wait(500); } }
async function openFevio() { await tap(PT(), 'button[aria-label="Fevio 열기"], button[aria-label="예약하기 · Fevio 열기"]'); await wait(400); }
async function toToday() { if (app.u.tab !== 'today') await goTab('오늘'); app.reanchor(true); await wait(500); }

var SCENES = [
  { t: '1일째 · 시작', run: async () => {
    setClock(1, '09:10'); caption('1일째 · ' + mmdd(1) + ' 09:10', '처음 열면 Fevio가 먼저 말을 걸어요. 오늘 화면에는 IVF 일곱 단계가 이미 놓여 있어요.');
    await wait(1600);
    await tap(PT(), null, '동의하고 시작');
    caption('1일째 · ' + mmdd(1) + ' 09:11', '지금 단계를 고르면 일곱 단계 위에 내 위치가 표시돼요.');
    await tap(PT(), null, '시작 전이에요');
    caption('1일째 · ' + mmdd(1) + ' 09:12', '병원 이름과 번호, 서로 부를 이름만 받아요. 화면에 바로 쓰이는 것만 물어요.');
    await say('서울OO난임센터'); await say('02-1234-5678'); await say('서연'); await say('민준');
  } },
  { t: '1일째 · 병원 안내 넣기', run: async () => {
    caption('1일째 · ' + mmdd(1) + ' 09:14', '병원 문자를 그대로 붙여 넣으면 Fevio가 날짜·시간별로 나눠서 확인받아요.');
    await say('[서울OO난임센터] 시술 안내\n주사: 고나엘에프 150 · 메노푸어 75 매일 21:00\n다음 내원: ' + mmdd(5) + ' 08:30 초음파·피검사\n미정: 채취일 — 초음파 보고 안내');
    await wait(1400);
    caption('1일째 · ' + mmdd(1) + ' 09:15', '확인한 것만 일정이 돼요. 저장하면 민준 폰에도 같은 흐름이 바로 보여요.');
    await tap(PT(), null, '맞아요'); await wait(2200); app.reanchor(true); await wait(1400);
    caption('1일째 · ' + mmdd(1) + ' 09:16', '무엇까지 보여 줄지는 서연이 정해요. 투약 시각까지 공유해 볼게요.');
    await tap(PT(), 'button[aria-label="나 · 설정"]'); await wait(500);
    await tap(PT(), 'button[role="radio"]', '흐름+투약'); await wait(900);
    await tap(PT(), 'button[aria-label="뒤로"]'); await wait(900);
  } },
  { t: '1일째 · 첫 주사', run: async () => {
    setClock(1, '20:56'); app.render(); caption('1일째 · ' + mmdd(1) + ' 20:56', '주사 시각이 가까워지면 오늘 화면이 투약 화면으로 바뀌어요.');
    await wait(2200);
    await tap(PT(), null, '맞았어요'); app.reanchor(true);
    caption('1일째 · ' + mmdd(1) + ' 21:01', '기록하면 민준 폰의 오늘 칩도 "맞음"으로 바뀌어요.');
    await wait(2000);
  } },
  { t: '3일째 · 일정과 메모', run: async () => {
    setClock(3, '13:20'); caption('3일째 · ' + mmdd(3) + ' 13:20', '일정 탭은 날짜별 기록이에요. 고른 날이 펼쳐지고, 일정에 맞는 생활 광고가 한 줄 조용히 들어가요.');
    await goTab('일정'); await wait(1400);
    await tap(PT(), 'button', '메모'); await wait(300);
    await type(PT(), '#f3-memo', '오후 반차 냈어 · 배가 살짝 더부룩');
    caption('3일째 · ' + mmdd(3) + ' 13:22', '메모는 기본으로 나만 봐요. 민준에게 보이게 켜면 바로 떠요.');
    await tap(PT(), 'button[role="switch"]', '에게 보이기');
    await tap(PT(), 'button[type="submit"]', '저장'); await wait(2400);
    caption('3일째 · ' + mmdd(3) + ' 13:23', '민준 폰에 메모가 보이면, 서연 쪽에 "민준 봄"이 붙어요.');
    await wait(2200);
  } },
  { t: '3일째 · 함께', run: async () => {
    setClock(3, '21:40'); caption('3일째 · ' + mmdd(3) + ' 21:40', '함께 탭은 커뮤니티가 먼저예요. 글 사이에 광고가 글 모양 그대로 들어가요.');
    await goTab('함께');
    await type(PT(), '#f3post', '반차 두 번째인데 팀장님께 뭐라고 말하세요?'); await tap(PT(), 'button[type="submit"]', '올리기');
    await type(PT(), '#f3post', '주사 맞고 배 더부룩한 거 다들 그랬나요?'); await tap(PT(), 'button[type="submit"]', '올리기');
    await wait(1600);
    caption('3일째 · ' + mmdd(3) + ' 21:42', '지원 탭에는 지원 제도와 이번 주 준비. 준비 목록에도 제휴 한 줄이 들어가요.');
    await tap(PT(), 'button[role="tab"]', '지원'); await wait(2200);
    await tap(PT(), 'button[role="tab"]', '커뮤니티'); await wait(500);
  } },
  { t: '5일째 · 진료 뒤 계획', run: async () => {
    setClock(5, '10:40'); await toToday();
    caption('5일째 · ' + mmdd(5) + ' 10:40', '초음파 뒤 병원이 보낸 계획을 넣으면, 계획 카드가 타임라인 안에 들어가요.');
    await openFevio();
    await say('[서울OO난임센터] 오늘 진료 뒤 계획\n다음 내원: ' + mmdd(6) + ' 09:20 초음파·피검사\n주사: 변경 없음 · 매일 21:00\n미정: 채취일 — 다음 검사 뒤 안내');
    await wait(1000); await tap(PT(), null, '맞아요'); await wait(2400); app.reanchor(true);
    caption('5일째 · ' + mmdd(5) + ' 10:42', '민준 폰에는 같은 계획이 "서연 확인함"과 함께 보여요.');
    await wait(2400);
  } },
  { t: '6일째 · 예약하기', run: async () => {
    setClock(6, '07:40'); caption('6일째 · ' + mmdd(6) + ' 07:40', '일정 탭에서는 Fevio 버튼이 "예약하기"가 돼요. 시간을 바꾸고 싶으면 병원에 보낼 글을 만들어 줘요.');
    await goTab('일정'); await wait(600);
    await openFevio();
    await tap(PT(), 'button', '진료 시간을 바꾸고 싶어요');
    await tap(PT(), 'button', '더 늦은 시간'); await wait(1200);
    await tap(PT(), 'button', '복사하고 보냄으로 표시'); await wait(1000);
    caption('6일째 · ' + mmdd(6) + ' 07:41', '병원이 바꾸기 전까지 지금 시간은 그대로예요. 일정에는 "병원 답 기다림"이 붙어요.');
    await closeCurtain(); await wait(1800);
  } },
  { t: '6일째 · 트리거', run: async () => {
    setClock(6, '11:05'); await toToday();
    caption('6일째 · ' + mmdd(6) + ' 11:05', '오늘 밤 트리거로 정해졌어요. 계획을 넣으면 지금 위치가 트리거로 넘어가요.');
    await openFevio();
    await say('[서울OO난임센터] 오늘 진료 뒤 계획\n트리거: ' + mmdd(6) + ' 22:00 정각\n주사: 오늘로 끝\n채취: ' + mmdd(8) + ' 07:30 · 전날 24시부터 금식 · 보호자 동반');
    await wait(1000); await tap(PT(), null, '맞아요'); await wait(2400); app.reanchor(true); await wait(1600);
    setClock(6, '21:40'); app.render();
    caption('6일째 · ' + mmdd(6) + ' 21:40', '민준도 자기 폰에서 Fevio에게 물어요. 답은 서연이 공유한 일정에서만 나와요.');
    await tap(PR(), 'button[aria-label="Fevio 열기"]'); await wait(500);
    await tap(PR(), 'button', '내가 챙길 건?'); await wait(2400);
    await tap(PR(), 'button[aria-label="Fevio 닫기"]'); await wait(600);
  } },
  { t: '8일째 · 채취 뒤', run: async () => {
    setClock(8, '13:30'); app.render(); app.reanchor(true);
    caption('8일째 · ' + mmdd(8) + ' 13:30', '채취가 끝나 지금 위치가 채취로 넘어갔어요. 연구실 연락은 수정·배양 아래에 놓여요.');
    await wait(1200); await openFevio();
    await say('연구실 연락: ' + mmdd(9) + ' 09:40 수정 확인\n미정: 이식일 — 배아 상태 보고 안내');
    await wait(900); await tap(PT(), null, '맞아요'); await wait(2400); app.reanchor(true); await wait(1200);
  } },
  { t: '9일째 · 몸이 불편할 때', run: async () => {
    setClock(9, '22:10'); app.render();
    caption('9일째 · ' + mmdd(9) + ' 22:10', '몸이 불편하면 Fevio는 판단하지 않고 병원 번호와 119를 바로 보여 줘요.');
    await openFevio(); await tap(PT(), 'button', '몸이 불편해요');
    await tap(PT(), 'button', '배가 많이 부르고 아파요'); await wait(2600);
    await closeCurtain();
  } },
  { t: '11일째 · 이식과 판정', run: async () => {
    setClock(11, '11:30'); app.render();
    caption('11일째 · ' + mmdd(11) + ' 11:30', '이식과 판정 날짜가 정해졌어요. 판정이 있는 주와 판정 단계에는 광고를 넣지 않아요.');
    await openFevio();
    await say('이식: ' + mmdd(11) + ' 14:00\n판정 피검사: ' + mmdd(20) + ' 08:30');
    await wait(900); await tap(PT(), null, '맞아요'); await wait(2400); app.reanchor(true); await wait(1400);
    caption('11일째 · ' + mmdd(11) + ' 11:32', '일정은 한 달로도 볼 수 있어요.');
    await goTab('일정'); await tap(PT(), 'button[aria-label="한 달 보기"]'); await wait(2400);
    await tap(PT(), 'button[aria-label="주 단위로 보기"]'); await wait(800);
    await goTab('오늘'); app.reanchor(true); await wait(1200);
  } }
];

async function demoStart() {
  if (DEMO.running) return;
  DEMO.real = { D: D, db: db, mem: mem };
  DEMO.running = true; DEMO.paused = false; DEMO.stop = false; DEMO.scene = -1; DEMO.start = today0();
  db = null; mem = {};
  D = { ready: true, offline: false, settings: {}, items: [], rules: [], open: [], plans: [], memos: {}, doses: {}, posts: [], reqs: [], asks: [] };
  resetApp(); setClock(1, '09:10'); app.startOnboarding(); drawBar(); window.scrollTo({ top: 0, behavior: 'smooth' });
  try {
    for (var i = 0; i < SCENES.length; i++) { DEMO.scene = i; drawBar(); await SCENES[i].run(); }
    DEMO.scene = SCENES.length; caption('시연 끝', '실제로 쓰실 때는 시연 기록이 남지 않아요. 내 일정으로 시작해 보세요.');
  } catch (e) { if (e.message !== 'demo-stop') { console.error(e); } }
  if (DEMO.stop) demoEnd();
}
function resetApp() { var fresh = new App(); app.u = fresh.u; app.seen = new Set(); app.fitKey = null; app.pFitKey = null; app.render(); }
function demoEnd() {
  if (!DEMO.real) return;
  DEMO.stop = true; DEMO.running = false; DEMO.paused = false;
  D = DEMO.real.D; db = DEMO.real.db; mem = DEMO.real.mem; DEMO.real = null; CLOCK.base = null;
  resetApp(); drawBar();
  if (app.onboarding()) app.startOnboarding(); app.reanchor(false);
}
function drawBar() {
  var bar = document.getElementById('demo-bar'); if (!bar) return;
  if (!DEMO.running) { bar.innerHTML = '<button class="demo-start" id="demo-play" type="button"><span class="dot"></span>데모 시연하기</button>'; bar.className = 'demo-bar idle'; return; }
  var done = DEMO.scene >= SCENES.length;
  bar.className = 'demo-bar on';
  bar.innerHTML = '<div class="demo-top"><span class="demo-day num">' + escH(DEMO.day) + '</span><span class="demo-steps">' + SCENES.map((s, i) => '<i class="' + (i < DEMO.scene ? 'd' : (i === DEMO.scene ? 'c' : '')) + '" title="' + escH(s.t) + '"></i>').join('') + '</span>'
    + '<span class="demo-ctl">' + (done ? '' : '<button type="button" id="demo-pause">' + (DEMO.paused ? '계속' : '일시정지') + '</button><button type="button" id="demo-speed" class="num">' + DEMO.speed + 'x</button>')
    + '<button type="button" id="demo-end">' + (done ? '내 일정으로 시작' : '끝내기') + '</button></span></div>'
    + '<p class="demo-cap" aria-live="polite">' + escH(DEMO.caption) + '</p>';
}
document.addEventListener('click', (e) => {
  var t = e.target.closest('button'); if (!t || !t.id || t.id.indexOf('demo-') !== 0) return;
  if (t.id === 'demo-play') demoStart();
  if (t.id === 'demo-pause') { DEMO.paused = !DEMO.paused; drawBar(); }
  if (t.id === 'demo-speed') { DEMO.speed = DEMO.speed === 1 ? 2 : 1; drawBar(); }
  if (t.id === 'demo-end') { if (DEMO.scene >= SCENES.length) demoEnd(); else { DEMO.stop = true; DEMO.paused = false; } }
});

drawBar();
