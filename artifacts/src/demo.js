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
  var r = el.getBoundingClientRect(); if (!(r.width > 0 && r.height > 0)) return false;
  var f = el.closest('.frame, .cam-layer'); if (!f) return true; var fr = f.getBoundingClientRect(); var cx = r.left + r.width / 2;
  return cx > fr.left && cx < fr.right;   // inside the phone, not a week scrolled off to the side
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

/* ----- what the demo "photographs": a printed clinic notice and a text-message screenshot (SVG pictures) ----- */
function svgUrl(svg) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }
var FONT = "font-family=\"'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif\"";
function paperSVG(title, lines, foot) {
  var y = 112, body = lines.map((l) => { var o = '<text x="28" y="' + y + '" font-size="15" fill="#2B2D31" ' + FONT + '>' + escH(l) + '</text>'; y += 30; return o; }).join('');
  return svgUrl('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="480" viewBox="0 0 360 480"><rect width="360" height="480" rx="6" fill="#FBFAF6"/>'
    + '<rect x="28" y="30" width="34" height="34" rx="8" fill="#7A2E8E"/><text x="45" y="53" font-size="16" font-weight="700" text-anchor="middle" fill="#fff" ' + FONT + '>서</text>'
    + '<text x="74" y="46" font-size="16" font-weight="700" fill="#0E0F11" ' + FONT + '>서울OO난임센터</text><text x="74" y="64" font-size="11" fill="#8A8D94" ' + FONT + '>' + escH(title) + '</text>'
    + '<line x1="28" y1="82" x2="332" y2="82" stroke="#D9D6CE" stroke-width="1"/>' + body
    + '<line x1="28" y1="' + (y + 6) + '" x2="332" y2="' + (y + 6) + '" stroke="#E8E5DD" stroke-dasharray="3 4"/><text x="28" y="' + (y + 32) + '" font-size="12" fill="#575A62" ' + FONT + '>' + escH(foot) + '</text>'
    + '<text x="28" y="452" font-size="11" fill="#A1A1AA" ' + FONT + '>환자 보관용</text></svg>');
}
function smsSVG(lines) {
  var y = 120, bubble = lines.map((l) => { var o = '<text x="40" y="' + y + '" font-size="15" fill="#0E0F11" ' + FONT + '>' + escH(l) + '</text>'; y += 24; return o; }).join('');
  return svgUrl('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="560" viewBox="0 0 360 560"><rect width="360" height="560" fill="#FFFFFF"/>'
    + '<rect width="360" height="64" fill="#F6F6F8"/><text x="180" y="40" font-size="15" font-weight="700" text-anchor="middle" fill="#0E0F11" ' + FONT + '>서울OO난임센터</text>'
    + '<text x="180" y="88" font-size="11" text-anchor="middle" fill="#8A8D94" ' + FONT + '>오후 1:24</text>'
    + '<rect x="24" y="96" width="300" height="' + (y - 96) + '" rx="18" fill="#E9E9EB"/>' + bubble + '</svg>');
}
var layer = () => document.getElementById('cam-layer');
function showLayer(html) { var l = layer(); l.innerHTML = '<div class="cam-in">' + html + '</div>'; l.hidden = false; requestAnimationFrame(() => l.classList.add('on')); }
async function hideLayer() { var l = layer(); l.classList.remove('on'); await sleep(320); l.hidden = true; l.innerHTML = ''; }
async function cameraShot(paperUrl) {
  showLayer('<div class="cam"><div class="cam-top"><span>⚡︎</span><span class="cam-mode">사진</span><span>⌄</span></div>'
    + '<div class="cam-view"><img class="cam-paper" src="' + paperUrl + '" alt="병원 안내문"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i><span class="cam-hint">안내문이 화면에 들어오게</span></div>'
    + '<div class="cam-bottom"><span class="cam-thumb"></span><button type="button" class="shutter" aria-label="찍기"></button><span class="cam-cancel">취소</span></div><div class="cam-flash"></div></div>');
  await wait(900); layer().querySelector('.cam').classList.add('locked'); await wait(900);
  await tap(layer(), '.shutter'); layer().querySelector('.cam').classList.add('flash'); await sleep(260);
  await hideLayer();
}
var PHOTO_BG = ['linear-gradient(160deg,#9DB7D5,#E9D8C4)', 'linear-gradient(200deg,#7E9C7A,#D7E3C8)', 'linear-gradient(140deg,#E8C9B8,#B48C7A)', 'linear-gradient(180deg,#F1E3C6,#C7A36B)', 'linear-gradient(120deg,#C6CFDA,#6F7F95)', 'linear-gradient(170deg,#E7D3E0,#A98BA6)', 'linear-gradient(150deg,#D9E6EE,#9FB3BF)', 'linear-gradient(190deg,#EAD9B0,#9E8A5E)', 'linear-gradient(130deg,#C9E0D5,#7FA593)', 'linear-gradient(160deg,#F0D4C8,#C98F7C)', 'linear-gradient(200deg,#D5D9E8,#8790B0)'];
async function albumPick(shotUrl, label) {
  var tiles = PHOTO_BG.map((g, i) => i === 1 ? '<button type="button" class="alb-t shot" aria-label="' + label + '"><span class="alb-desk"><img src="' + shotUrl + '" alt=""></span></button>' : '<span class="alb-t" style="background:' + g + '"></span>').join('');
  showLayer('<div class="album"><div class="alb-top"><span class="alb-cancel">취소</span><b>최근 항목</b><span></span></div><div class="alb-grid">' + tiles + '</div></div>');
  await wait(1300); var t = layer().querySelector('.alb-t.shot'); if (t) t.classList.add('pick'); await wait(400);
  await tap(layer(), '.alb-t.shot');
  showLayer('<div class="album"><div class="alb-top"><span class="alb-cancel">취소</span><b>1장 선택</b><span class="alb-done">추가</span></div><div class="alb-preview"><img src="' + shotUrl + '" alt=""></div></div>');
  await wait(1000); await tap(layer(), '.alb-done'); await hideLayer();
}
async function photoFlow(kind, url, lines, meta) {
  DEMO.pick = () => {};
  await tap(PT(), 'button', kind === 'camera' ? '사진 찍기' : '앨범에서');
  if (kind === 'camera') await cameraShot(url); else await albumPick(url, kind === 'album' ? '병원 안내문 사진' : '');
  app.push([{ from: 'u', imgUrl: url }, fv('사진에서 글을 읽고 있어요…')], { conv: 'reading' }); app.scrollThread('f3-thread');
  await wait(1700); app.photoResult(lines, meta || {}); await wait(1500);
}

var SCENES = [
  { t: '1일째 · 시작', run: async () => {
    setClock(1, '09:10'); caption('1일째 · ' + mmdd(1) + ' 09:10', '처음 열면 Fevio가 먼저 말을 걸어요. 오늘 화면에는 IVF 일곱 단계가 이미 놓여 있어요.');
    await wait(1600);
    await tap(PT(), null, '동의하고 시작');
    caption('1일째 · ' + mmdd(1) + ' 09:11', '지금 단계를 고르면 일곱 단계 위에 내 위치가 표시돼요.');
    await tap(PT(), null, '시작 전이에요'); await wait(600);
  } },
  { t: '1일째 · 안내문 찍기', run: async () => {
    caption('1일째 · ' + mmdd(1) + ' 09:12', '진료 때 받은 안내문을 찍어 둔 사진이 있으면, 갤러리에서 고르기만 하면 돼요. 입력할 건 없어요.');
    var lines = ['주사  고나엘에프 150 · 메노푸어 75', '매일 저녁 21:00', '피검사  ' + mmdd(3) + ' 08:00 채혈실', '초음파  ' + mmdd(5) + ' 08:30 본관 3층', '채취일은 초음파 보고 안내드립니다'];
    await photoFlow('album', paperSVG('과배란 주사 안내', lines, '문의 02-1234-5678'), ['주사: 고나엘에프 150 · 메노푸어 75 매일 21:00', '피검사: ' + mmdd(3) + ' 08:00 채혈실', '다음 내원: ' + mmdd(5) + ' 08:30 초음파·피검사', '미정: 채취일 — 초음파 보고 안내'], { clinic: '서울OO난임센터', phone: '02-1234-5678' });
    caption('1일째 · ' + mmdd(1) + ' 09:13', 'Fevio가 사진에서 날짜와 시간만 골라 보여 줘요. 맞으면 한 번 누르면 끝이에요.');
    await wait(1200); await tap(PT(), null, '맞아요'); await wait(2200); app.reanchor(true); await wait(1200);
    caption('1일째 · ' + mmdd(1) + ' 09:14', '저장하면 민준 폰에도 같은 흐름이 바로 보여요. 투약까지 보여 줄지는 서연이 정해요.');
    await tap(PT(), 'button[aria-label="나 · 설정"]'); await wait(400);
    await tap(PT(), 'button[role="radio"]', '흐름+투약'); await wait(800);
    await tap(PT(), 'button[aria-label="뒤로"]'); await wait(800);
  } },
  { t: '1일째 · 첫 주사', run: async () => {
    setClock(1, '18:40'); app.render(); app.reanchor(true);
    caption('1일째 · ' + mmdd(1) + ' 18:40', '주사까지 남은 시간은 링이 천천히 줄어들며 보여 줘요. 민준 폰에도 같은 링이 떠요.');
    await wait(2600);
    setClock(1, '20:18'); app.render();
    caption('1일째 · ' + mmdd(1) + ' 20:18', '한 시간 전부터는 투약 화면으로 바뀌어요. 무엇을 얼마나 맞는지 병원 안내 그대로예요.');
    await wait(2600);
    setClock(1, '20:58'); app.render();
    caption('1일째 · ' + mmdd(1) + ' 20:58', '맞고 나서 한 번 누르면 기록돼요.');
    await wait(1600); await tap(PT(), null, '맞았어요'); app.reanchor(true); await wait(1800);
  } },
  { t: '3일째 · 일정과 메모', run: async () => {
    setClock(3, '13:20'); caption('3일째 · ' + mmdd(3) + ' 13:20', '일정 탭은 날짜별 기록이에요. 고른 날이 펼쳐지고, 일정에 맞는 생활 광고가 한 줄 조용히 들어가요.');
    await goTab('일정'); await wait(1400);
    await tap(PT(), 'button', '메모'); await wait(300);
    await type(PT(), '#f3-memo', '오후 반차 냈어');
    caption('3일째 · ' + mmdd(3) + ' 13:21', '메모는 기본으로 나만 봐요. 민준에게 보이게 켜면 바로 떠요.');
    await tap(PT(), 'button[role="switch"]', '에게 보이기');
    await tap(PT(), 'button[type="submit"]', '저장'); await wait(2400);
    caption('3일째 · ' + mmdd(3) + ' 13:22', '민준 폰에 메모가 보이면, 서연 쪽에 "민준 봄"이 붙어요.');
    await wait(2000);
  } },
  { t: '3일째 · 함께', run: async () => {
    setClock(3, '21:40'); caption('3일째 · ' + mmdd(3) + ' 21:40', '함께 탭은 커뮤니티가 먼저예요. 같은 단계 사람들 글 사이에 광고가 글 모양 그대로 들어가요.');
    put('posts/demo-a', { text: '주사 맞고 배 더부룩한 거 다들 그랬나요? 저는 3일째부터 그랬어요', nick: '하늘맘', stage: '과배란 주사', topic: 'all', imgs: [], likes: 12, replies: 4, createdAt: nowMs() - 3600e3 });
    put('posts/demo-b', { text: '반차 두 번째인데 팀장님께 뭐라고 하셨어요?', nick: '봄비', stage: '과배란 주사', topic: 'work', imgs: [], likes: 8, replies: 6, createdAt: nowMs() - 1800e3 });
    await goTab('함께'); await wait(2400);
    caption('3일째 · ' + mmdd(3) + ' 21:41', '지원 탭에는 지원 제도와 이번 주 준비. 준비 목록에도 제휴 한 줄이 들어가요.');
    await tap(PT(), 'button[role="tab"]', '지원'); await wait(2200);
    await tap(PT(), 'button[role="tab"]', '커뮤니티'); await wait(400);
  } },
  { t: '5일째 · 병원이 보낸 계획', run: async () => {
    setClock(5, '10:40'); await toToday();
    caption('5일째 · ' + mmdd(5) + ' 10:40', '초음파 뒤 병원이 계획을 보내면 오늘 화면에 카드로 와요. 서연은 확인만 누르면 돼요.');
    app.receivePlan('다음 내원: ' + mmdd(6) + ' 09:20 초음파·피검사\n주사: 변경 없음 · 매일 21:00\n미정: 채취일 — 다음 검사 뒤 안내');
    await wait(2600); await tap(PT(), null, '확인했어요'); await wait(1200);
    caption('5일째 · ' + mmdd(5) + ' 10:41', '민준 폰의 같은 카드에는 "서연 확인함"이 붙어요.');
    await wait(2200);
  } },
  { t: '6일째 · 예약하기', run: async () => {
    setClock(6, '07:40'); caption('6일째 · ' + mmdd(6) + ' 07:40', '일정 탭에서는 Fevio 버튼이 "예약하기"가 돼요. 시간을 바꾸고 싶으면 병원에 보낼 글을 만들어 줘요.');
    await goTab('일정'); await wait(500);
    await openFevio();
    await tap(PT(), 'button', '진료 시간을 바꾸고 싶어요');
    await tap(PT(), 'button', '더 늦은 시간'); await wait(1000);
    await tap(PT(), 'button', '복사하고 보냄으로 표시'); await wait(900);
    caption('6일째 · ' + mmdd(6) + ' 07:41', '병원이 바꾸기 전까지 지금 시간은 그대로예요. 일정에는 "병원 답 기다림"이 붙어요.');
    await closeCurtain(); await wait(1600);
  } },
  { t: '6일째 · 트리거', run: async () => {
    setClock(6, '11:05'); await toToday();
    caption('6일째 · ' + mmdd(6) + ' 11:05', '오늘 밤 트리거로 정해졌어요. 계획이 오면 지금 위치가 트리거로 넘어가고, 정각까지 링이 줄어들어요.');
    app.receivePlan('트리거: ' + mmdd(6) + ' 22:00 정각\n주사: 오늘로 끝\n채취: ' + mmdd(8) + ' 07:30 · 전날 24시부터 금식 · 보호자 동반');
    await wait(2400); await tap(PT(), null, '확인했어요'); await wait(1600);
    setClock(6, '21:20'); app.render();
    caption('6일째 · ' + mmdd(6) + ' 21:20', '민준도 자기 폰에서 Fevio에게 물어요. 답은 서연이 공유한 일정에서만 나와요.');
    await tap(PR(), 'button[aria-label="Fevio 열기"]'); await wait(400);
    await tap(PR(), 'button', '내가 챙길 건?'); await wait(2400);
    await tap(PR(), 'button[aria-label="Fevio 닫기"]'); await wait(500);
  } },
  { t: '8일째 · 문자 캡처', run: async () => {
    setClock(8, '13:30'); app.render(); app.reanchor(true);
    caption('8일째 · ' + mmdd(8) + ' 13:30', '채취가 끝났어요. 회복실에서 받은 안내문은 그 자리에서 찍으면 돼요.');
    await wait(1000); await openFevio();
    await tap(PT(), 'button[aria-label="사진·파일 넣기"]'); await wait(300);
    var paper = ['수정 결과 연락  ' + mmdd(9) + ' 09:40', '연구실에서 전화드립니다', '이식일은 배아 상태 보고 안내드립니다', '오늘은 무리하지 말고 쉬세요'];
    await photoFlow('camera', paperSVG('채취 후 안내', paper, '연구실 02-1234-5679'), ['연구실 연락: ' + mmdd(9) + ' 09:40 수정 확인', '미정: 이식일 — 배아 상태 보고 안내'], {});
    await tap(PT(), null, '맞아요'); await wait(2200); app.reanchor(true); await wait(1000);
  } },
  { t: '8일째 · 일정 한눈에', run: async () => {
    setClock(8, '13:40'); await goTab('일정'); await wait(600);
    caption('8일째 · ' + mmdd(8) + ' 13:40', '일정은 이번 사이클이 한눈에 보여요. 투약, 검사, 트리거, 채취, 연구실 연락이 날짜별로 쌓여요.');
    await tap(PT(), 'button[aria-label="지난 주"]'); await wait(1800);
    caption('8일째 · ' + mmdd(8) + ' 13:41', '지난 날은 기록이 돼요. 맞은 주사, 남긴 메모, 병원에 보낸 요청이 그날에 남아요.');
    await tap(PT(), 'div[data-on-click]', '피검사'); await wait(2000);
    await tap(PT(), 'button[aria-label="다음 주"]'); await wait(900);
    caption('8일째 · ' + mmdd(8) + ' 13:42', '시술 날을 펼치면 장소와 준비가 같이 보여요. 민준 폰도 같은 날이 열려요.');
    await tap(PT(), 'div[data-on-click]', '채취'); await wait(2600);
    await tap(PT(), 'div[data-on-click]', '연구실'); await wait(2000);
  } },
  { t: '9일째 · 몸이 불편할 때', run: async () => {
    setClock(9, '22:10'); app.render();
    caption('9일째 · ' + mmdd(9) + ' 22:10', '몸이 불편하면 Fevio는 판단하지 않고 병원 번호와 119를 바로 보여 줘요.');
    await openFevio(); await tap(PT(), 'button', '몸이 불편해요');
    await tap(PT(), 'button', '배가 많이 부르고 아파요'); await wait(2400);
    await closeCurtain();
  } },
  { t: '11일째 · 이식과 판정', run: async () => {
    setClock(11, '09:30'); app.render();
    caption('11일째 · ' + mmdd(11) + ' 09:30', '이식 날짜와 판정 날짜가 왔어요. 확인하면 이식 단계로 넘어가요.');
    app.receivePlan('이식: ' + mmdd(11) + ' 14:00\n판정 피검사: ' + mmdd(20) + ' 08:30');
    await wait(2200); await tap(PT(), null, '확인했어요'); await wait(1600);
    caption('11일째 · ' + mmdd(11) + ' 09:31', '판정이 있는 주와 판정 단계에는 광고를 넣지 않아요. 일정은 한 달로도 볼 수 있어요.');
    await goTab('일정'); await tap(PT(), 'button[aria-label="한 달 보기"]'); await wait(2400);
    await tap(PT(), 'button[aria-label="주 단위로 보기"]'); await wait(700);
    await goTab('오늘'); app.reanchor(true); await wait(1200);
  } }
];

async function demoStart() {
  if (DEMO.running) return;
  DEMO.real = { D: D, db: db, mem: mem };
  DEMO.running = true; DEMO.paused = false; DEMO.stop = false; DEMO.scene = -1; DEMO.start = mondayOf(today0());   // the demo cycle starts on a Monday so each week is full
  db = null; mem = {};
  D = { ready: true, offline: false, settings: { me: '서연', partner: '민준' }, items: [], rules: [], open: [], plans: [], memos: {}, doses: {}, posts: [], reqs: [], asks: [] };
  mem = { settings: { main: { me: '서연', partner: '민준' } } };   // the couple already has accounts; everything else starts empty
  resetApp(); setClock(1, '09:10'); app.startOnboarding(); drawBar(); window.scrollTo({ top: 0, behavior: 'smooth' });
  try {
    for (var i = 0; i < SCENES.length; i++) { DEMO.scene = i; drawBar(); await SCENES[i].run(); }
    DEMO.scene = SCENES.length; caption('시연 끝', '실제로 쓰실 때는 시연 기록이 남지 않아요. 내 일정으로 시작해 보세요.');
  } catch (e) { if (e.message !== 'demo-stop') { console.error(e); } }
  if (DEMO.stop) demoEnd();
}
function resetApp() { var l = document.getElementById('cam-layer'); if (l) { l.hidden = true; l.innerHTML = ''; l.classList.remove('on'); } DEMO.pick = null; var fresh = new App(); app.u = fresh.u; app.seen = new Set(); app.fitKey = null; app.pFitKey = null; app.render(); }
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
