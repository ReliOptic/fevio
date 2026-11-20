/* ===== Demo stage: moves the live phones between layouts and shows pen-drawn scenes between them ===== */
var STAGE = { mode: 'duo', illo: null };
var INKC = '#1B1B1B', ACC = '#1F5BFF', ACCS = '#E8EEFF';
// The demo plays in a fixed frame: 16:9 on wide screens, 9:16 on phones, with subtitles inside the frame.
function stageBox() {
  var bar = document.getElementById('demo-bar'), bh = bar ? bar.getBoundingClientRect().height : 0;
  var vw = document.documentElement.clientWidth, vh = window.innerHeight, W, H, portrait = vw < 760;
  if (!portrait) { W = Math.min(vw - 32, 1280); H = Math.round(W * 9 / 16); var maxH = vh - bh - 36; if (H > maxH) { H = Math.max(440, maxH); W = Math.round(H * 16 / 9); } }
  else { W = vw - 20; H = Math.min(vh - bh - 24, Math.round(W * 16 / 9)); }
  var sub = portrait ? 74 : 64, pad = portrait ? 10 : 22;
  return { W: W, H: H, portrait: portrait, ix: pad, iy: pad, iw: W - pad * 2, ih: H - pad - sub };
}
function placements(mode, b) {
  var W = b.iw, H = b.ih, PW = 384, PH = 824, g = 24, P = {}, I = null, k;
  var put = (key, x, y, s, o) => { P[key] = { x: x, y: y, k: s, o: o == null ? 1 : o }; };
  var hide = (key, x, y, s) => put(key, x, y, s, 0);
  if (!b.portrait) {
    if (mode === 'duo') { k = Math.min(H / PH, (W - g * 3) / (PW * 2 + g)); var tw = (PW * 2 + g) * k, x0 = (W - tw) / 2; put('pt', x0, (H - PH * k) / 2, k); put('pr', x0 + (PW + g) * k, (H - PH * k) / 2, k); }
    else if (mode === 'solo' || mode === 'partner') { k = Math.min(H / PH, W / PW); var a = mode === 'solo' ? 'pt' : 'pr', z = mode === 'solo' ? 'pr' : 'pt'; put(a, (W - PW * k) / 2, (H - PH * k) / 2, k); hide(z, mode === 'solo' ? W : -PW * k, (H - PH * k) / 2, k * 0.9); }
    else if (mode === 'illo-phone') { k = H / PH; var px = W - PW * k - W * 0.03; put('pt', px, 0, k); hide('pr', W + 40, 0, k); I = { x: W * 0.02, y: H * 0.06, w: px - W * 0.05, h: H * 0.88 }; }
    else if (mode === 'illo-duo') { k = Math.min(H / PH, (W * 0.56) / (PW * 2 + g)); var tw2 = (PW * 2 + g) * k, x1 = W - tw2 - W * 0.02; put('pt', x1, (H - PH * k) / 2, k); put('pr', x1 + (PW + g) * k, (H - PH * k) / 2, k); I = { x: W * 0.02, y: H * 0.08, w: x1 - W * 0.05, h: H * 0.84 }; }
    else { k = H / PH * 0.8; hide('pt', W * 0.3, H * 0.2, k * 0.8); hide('pr', W * 0.5, H * 0.2, k * 0.8); I = { x: W * 0.06, y: 0, w: W * 0.88, h: H }; }
  } else {
    if (mode === 'duo') { k = Math.min((W - 12) / (PW * 2), H / PH); var y0 = (H - PH * k) / 2; put('pt', (W - (PW * 2 * k + 12)) / 2, y0, k); put('pr', (W + 12) / 2, y0, k); }
    else if (mode === 'solo' || mode === 'partner') { k = Math.min((W - 24) / PW, H / PH); var a2 = mode === 'solo' ? 'pt' : 'pr', z2 = mode === 'solo' ? 'pr' : 'pt'; put(a2, (W - PW * k) / 2, (H - PH * k) / 2, k); hide(z2, W, 0, k * 0.9); }
    else if (mode === 'illo-phone') { var ih = H * 0.38; k = Math.min((H - ih - 12) / PH, (W - 24) / PW); put('pt', (W - PW * k) / 2, ih + 12, k); hide('pr', W, ih + 12, k); I = { x: 0, y: 0, w: W, h: ih }; }
    else if (mode === 'illo-duo') { var ih2 = H * 0.34; k = Math.min((H - ih2 - 12) / PH, (W - 12) / (PW * 2)); var y2 = ih2 + 12; put('pt', (W - (PW * 2 * k + 12)) / 2, y2, k); put('pr', (W + 12) / 2, y2, k); I = { x: 0, y: 0, w: W, h: ih2 }; }
    else { k = 0.3; hide('pt', W * 0.2, H, k); hide('pr', W * 0.5, H, k); I = { x: 0, y: H * 0.1, w: W, h: H * 0.8 }; }
  }
  return { P: P, I: I };
}
function applyStage() {
  if (!document.body.classList.contains('demo-stage')) return;
  var b = stageBox(), wrap = document.querySelector('.phones'); wrap.style.width = b.W + 'px'; wrap.style.height = b.H + 'px';
  var L = placements(STAGE.mode, b), ox = b.ix, oy = b.iy, slots = { pt: document.querySelector('.slot[data-who="pt"]'), pr: document.querySelector('.slot[data-who="pr"]') };
  Object.keys(slots).forEach((key) => { var s = slots[key], p = L.P[key]; if (!s || !p) return; s.style.transform = 'translate(' + (p.x + ox).toFixed(1) + 'px,' + (p.y + oy).toFixed(1) + 'px) scale(' + p.k.toFixed(4) + ')'; s.style.opacity = p.o; s.style.pointerEvents = p.o ? '' : 'none'; });
  var il = document.getElementById('illo');
  if (L.I) { il.style.left = (L.I.x + ox) + 'px'; il.style.top = (L.I.y + oy) + 'px'; il.style.width = L.I.w + 'px'; il.style.height = L.I.h + 'px'; il.classList.add('on'); }
  else il.classList.remove('on');
}
async function stage(mode, illoKey) {
  STAGE.mode = mode;
  var il = document.getElementById('illo');
  if (illoKey && illoKey !== STAGE.illo) { STAGE.illo = illoKey; il.style.setProperty('--ts', (0.65 / DEMO.speed).toFixed(3)); il.innerHTML = ILLOS[illoKey](); }
  if (!illoKey) STAGE.illo = null;
  applyStage(); await sleep(820);
}
function stageOn() { document.body.classList.add('demo-stage'); STAGE.mode = 'duo'; STAGE.illo = null; applyStage(); }
function stageOff() {
  document.body.classList.remove('demo-stage');
  var wrap = document.querySelector('.phones'); wrap.style.width = ''; wrap.style.height = '';
  document.querySelectorAll('.slot').forEach((s) => { s.style.transform = ''; s.style.opacity = ''; s.style.pointerEvents = ''; });
  var il = document.getElementById('illo'); il.classList.remove('on'); il.innerHTML = ''; fitPhones();
}
window.addEventListener('resize', () => applyStage());

/* ----- pen-drawn pieces (viewBox 800×560). Lines draw in, bubbles pop, arrows sweep. ----- */
function L(d, t, o) { o = o || {}; if (o.dash) return '<path class="fd" style="--d:' + t + 's" d="' + d + '" fill="none" stroke="' + (o.stroke || INKC) + '" stroke-width="' + (o.w || 2.6) + '" stroke-linecap="round" stroke-dasharray="6 8"/>'; return '<path pathLength="1" class="dr" style="--d:' + t + 's" d="' + d + '" fill="' + (o.fill || 'none') + '" stroke="' + (o.stroke || INKC) + '" stroke-width="' + (o.w || 3.2) + '" stroke-linecap="round" stroke-linejoin="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>'; }
function F(inner, t) { return '<g class="fd" style="--d:' + t + 's">' + inner + '</g>'; }
function POP(inner, t, cx, cy) { return '<g class="pp" style="--d:' + t + 's;transform-origin:' + cx + 'px ' + cy + 'px">' + inner + '</g>'; }
function T(x, y, s, size, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" font-family="Gaegu, \'Nanum Pen Script\', cursive" font-size="' + (size || 24) + '" font-weight="' + (o.bold ? 700 : 400) + '" fill="' + (o.fill || INKC) + '" text-anchor="' + (o.anchor || 'start') + '">' + escH(s) + '</text>'; }
function person(x, y, t, o) {
  // (x, y) = feet on the ground. o.hair: 'long' | 'short'; o.pose: 'phone' | 'paper' | 'down' | 'sit' | 'pen' | 'belly'
  o = o || {}; var hy = y - 172, s = '';
  var hair = o.hair === 'long' ? 'M' + (x - 22) + ' ' + (hy + 4) + ' C' + (x - 26) + ' ' + (hy - 30) + ' ' + (x + 26) + ' ' + (hy - 30) + ' ' + (x + 22) + ' ' + (hy + 4) + ' C' + (x + 26) + ' ' + (hy + 26) + ' ' + (x + 28) + ' ' + (hy + 36) + ' ' + (x + 20) + ' ' + (hy + 42) + ' M' + (x - 22) + ' ' + (hy + 4) + ' C' + (x - 26) + ' ' + (hy + 26) + ' ' + (x - 28) + ' ' + (hy + 36) + ' ' + (x - 20) + ' ' + (hy + 42)
    : 'M' + (x - 21) + ' ' + (hy - 2) + ' C' + (x - 18) + ' ' + (hy - 26) + ' ' + (x + 18) + ' ' + (hy - 28) + ' ' + (x + 22) + ' ' + (hy - 4) + ' M' + (x - 14) + ' ' + (hy - 16) + ' l6 -8 M' + (x - 2) + ' ' + (hy - 20) + ' l6 -8 M' + (x + 10) + ' ' + (hy - 18) + ' l5 -7';
  s += '<circle pathLength="1" class="dr" style="--d:' + t + 's" cx="' + x + '" cy="' + hy + '" r="20" fill="#FFFFFF" stroke="' + INKC + '" stroke-width="2.6"/>';
  s += L(hair, t + 0.15, { w: 3 });
  s += F('<circle cx="' + (x - 7) + '" cy="' + (hy + 2) + '" r="1.8" fill="' + INKC + '"/><circle cx="' + (x + 7) + '" cy="' + (hy + 2) + '" r="1.8" fill="' + INKC + '"/>', t + 0.4);
  var sit = o.pose === 'sit' || o.pose === 'pen';
  var by = sit ? y - 40 : y - 70;
  s += L('M' + (x - 24) + ' ' + (hy + 26) + ' Q' + x + ' ' + (hy + 18) + ' ' + (x + 24) + ' ' + (hy + 26) + ' L' + (x + 30) + ' ' + by + ' L' + (x - 30) + ' ' + by + ' Z', t + 0.2, { fill: o.shirt || '#FFFFFF' });
  if (sit) s += L('M' + (x - 22) + ' ' + by + ' L' + (x + 34) + ' ' + (by + 2) + ' L' + (x + 36) + ' ' + (y + 4) + ' M' + (x + 4) + ' ' + by + ' L' + (x + 52) + ' ' + (by + 4) + ' L' + (x + 54) + ' ' + (y + 4), t + 0.35);
  else s += L('M' + (x - 13) + ' ' + by + ' L' + (x - 15) + ' ' + y + ' l-10 0 M' + (x + 13) + ' ' + by + ' L' + (x + 15) + ' ' + y + ' l10 0', t + 0.35);
  var sy = hy + 30;
  if (o.pose === 'phone') s += L('M' + (x - 24) + ' ' + sy + ' Q' + (x - 38) + ' ' + (sy + 34) + ' ' + (x - 34) + ' ' + (sy + 66) + ' M' + (x + 24) + ' ' + sy + ' Q' + (x + 46) + ' ' + (sy + 30) + ' ' + (x + 18) + ' ' + (sy + 40), t + 0.45) + L('M' + (x + 2) + ' ' + (sy + 22) + ' h18 v30 h-18 Z', t + 0.6, { fill: ACCS });
  else if (o.pose === 'paper') s += L('M' + (x - 24) + ' ' + sy + ' Q' + (x - 30) + ' ' + (sy + 30) + ' ' + (x + 4) + ' ' + (sy + 40) + ' M' + (x + 24) + ' ' + sy + ' Q' + (x + 40) + ' ' + (sy + 28) + ' ' + (x + 50) + ' ' + (sy + 34), t + 0.45) + L('M' + (x + 4) + ' ' + (sy + 18) + ' l46 -4 l4 44 l-46 4 Z M' + (x + 12) + ' ' + (sy + 30) + ' l28 -2 M' + (x + 13) + ' ' + (sy + 40) + ' l28 -2', t + 0.6, { fill: '#FFFFFF' });
  else if (o.pose === 'pen') s += L('M' + (x - 24) + ' ' + sy + ' Q' + (x - 8) + ' ' + (sy + 36) + ' ' + (x + 18) + ' ' + (sy + 34) + ' M' + (x + 24) + ' ' + sy + ' Q' + (x + 34) + ' ' + (sy + 30) + ' ' + (x + 22) + ' ' + (sy + 38), t + 0.45) + L('M' + (x + 12) + ' ' + (sy + 26) + ' l30 -22', t + 0.6, { stroke: ACC, w: 5 });
  else if (o.pose === 'belly') s += L('M' + (x - 24) + ' ' + sy + ' Q' + (x - 30) + ' ' + (sy + 40) + ' ' + (x + 2) + ' ' + (sy + 48) + ' M' + (x + 24) + ' ' + sy + ' Q' + (x + 30) + ' ' + (sy + 40) + ' ' + (x - 2) + ' ' + (sy + 52), t + 0.45);
  else s += L('M' + (x - 24) + ' ' + sy + ' Q' + (x - 36) + ' ' + (sy + 34) + ' ' + (x - 32) + ' ' + (sy + 66) + ' M' + (x + 24) + ' ' + sy + ' Q' + (x + 36) + ' ' + (sy + 34) + ' ' + (x + 32) + ' ' + (sy + 66), t + 0.45);
  if (o.cap) s += L('M' + (x - 16) + ' ' + (hy - 16) + ' h32 l-4 -12 h-24 Z M' + x + ' ' + (hy - 25) + ' v8 M' + (x - 4) + ' ' + (hy - 21) + ' h8', t + 0.2, { fill: '#FFFFFF', w: 2.2 });
  return s;
}
function textW(str, fz) { var n = 0; for (var ch of str) n += /[가-힣]/.test(ch) ? 0.92 : (ch === ' ' ? 0.3 : 0.56); return n * fz; }
function bubble(x, y, w, h, text, t, o) {
  o = o || {}; var fs = o.size || 32; w = Math.max(w, Math.round(textW(text, fs)) + 44); h = Math.max(h, fs + 34); x = Math.max(10, Math.min(x, 790 - w)); var tail = o.tail === 'r' ? 'M' + (x + w - 30) + ' ' + (y + h) + ' l14 16 l2 -16' : 'M' + (x + 26) + ' ' + (y + h) + ' l-6 16 l18 -16';
  var fill = o.acc ? ACC : '#FFFFFF', ink = o.acc ? '#FFFFFF' : INKC;
  return POP('<path d="M' + (x + 14) + ' ' + y + ' h' + (w - 28) + ' q14 0 14 14 v' + (h - 28) + ' q0 14 -14 14 h' + (-(w - 28)) + ' q-14 0 -14 -14 v' + (-(h - 28)) + ' q0 -14 14 -14 Z ' + tail + '" fill="' + fill + '" stroke="' + INKC + '" stroke-width="2.4" stroke-linejoin="round"/>' + T(x + w / 2, y + h / 2 + fs * 0.34, text, fs, { anchor: 'middle', fill: ink, bold: true }), t, x + w / 2, y + h);
}
function arrow(d, t, o) { o = o || {}; return L(d, t, { stroke: o.acc ? ACC : INKC, w: o.w || 3, dash: o.dashed ? 1 : 0 }) + F('<path d="' + o.head + '" fill="none" stroke="' + (o.acc ? ACC : INKC) + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>', t + 0.7); }
function phoneDoodle(x, y, w, h, t, inner) { return L('M' + (x + 12) + ' ' + y + ' h' + (w - 24) + ' q12 0 12 12 v' + (h - 24) + ' q0 12 -12 12 h' + (-(w - 24)) + ' q-12 0 -12 -12 v' + (-(h - 24)) + ' q0 -12 12 -12 Z M' + (x + w / 2 - 12) + ' ' + (y + 8) + ' h24', t, { fill: '#FFFFFF' }) + (inner || ''); }
function cardDoodle(x, y, w, h, t, lines, o) { o = o || {}; var fz0 = Math.max(o.size || 22, 22); (lines || []).forEach((ln) => { w = Math.max(w, Math.round(textW(ln, fz0)) + 30); }); h = Math.max(h, (lines || []).length * (fz0 + 8) + 22); if (!o.fixed) x = Math.max(10, Math.min(x, 790 - w)); var s = L('M' + (x + 10) + ' ' + y + ' h' + (w - 20) + ' q10 0 10 10 v' + (h - 20) + ' q0 10 -10 10 h' + (-(w - 20)) + ' q-10 0 -10 -10 v' + (-(h - 20)) + ' q0 -10 10 -10 Z', t, { fill: o.fill || '#FFFFFF', stroke: o.stroke || INKC }); var fz = Math.max(o.size || 22, 22); (lines || []).forEach((ln, i) => { s += F(T(x + 14, y + 34 + i * (fz + 8), ln, fz, { fill: o.ink || INKC, bold: i === 0 }), t + 0.3 + i * 0.12); }); return s; }
function clock(x, y, r, label, t) { return L('M' + (x + r) + ' ' + y + ' A' + r + ' ' + r + ' 0 1 1 ' + (x + r - 0.1) + ' ' + (y - 0.5), t, { fill: '#FFFFFF' }) + L('M' + x + ' ' + y + ' L' + x + ' ' + (y - r * 0.6) + ' M' + x + ' ' + y + ' L' + (x + r * 0.45) + ' ' + (y + r * 0.2), t + 0.3, { w: 3.2 }) + (label ? F(T(x, y + r + 34, label, 30, { anchor: 'middle', bold: true }), t + 0.4) : ''); }
function ring(x, y, r, frac, label, t) { var c = 2 * Math.PI * r; return F('<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="#E4E4E7" stroke-width="8"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="' + ACC + '" stroke-width="8" stroke-linecap="round" transform="rotate(-90 ' + x + ' ' + y + ')" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - frac)).toFixed(1) + '" class="ringsweep" style="--c:' + c.toFixed(1) + '"/>' + T(x, y + 10, label, 28, { anchor: 'middle', bold: true }), t); }
function desk(x, y, t) { return L('M' + (x - 90) + ' ' + y + ' h180 M' + (x - 80) + ' ' + y + ' v70 M' + (x + 80) + ' ' + y + ' v70', t); }
function laptop(x, y, t) { return L('M' + (x - 34) + ' ' + y + ' l8 -46 h52 l8 46 Z M' + (x - 44) + ' ' + y + ' h88', t, { fill: '#FFFFFF' }); }
function monitor(x, y, t, inner) { return L('M' + (x - 50) + ' ' + (y - 80) + ' h100 v66 h-100 Z M' + x + ' ' + (y - 14) + ' v14 M' + (x - 20) + ' ' + y + ' h40', t, { fill: '#FFFFFF' }) + (inner || ''); }
function sofa(x, y, w, t) { return L('M' + x + ' ' + (y - 60) + ' q0 -20 20 -20 h' + (w - 40) + ' q20 0 20 20 v60 h' + (-w) + ' Z M' + (x - 10) + ' ' + (y - 40) + ' v50 M' + (x + w + 10) + ' ' + (y - 40) + ' v50 M' + (x + 10) + ' ' + y + ' v12 M' + (x + w - 10) + ' ' + y + ' v12', t, { fill: '#F4F1EA' }); }
function moon(x, y, t) { return L('M' + x + ' ' + (y - 24) + ' a24 24 0 1 0 20 36 a20 20 0 1 1 -20 -36 Z', t, { fill: '#FFF6D6' }) + F(T(x + 60, y - 10, '✦', 20) + T(x - 50, y + 30, '✦', 14), t + 0.3); }
function calendar(x, y, t, mark) { var s = L('M' + x + ' ' + y + ' h170 v130 h-170 Z M' + x + ' ' + (y + 30) + ' h170 M' + (x + 30) + ' ' + (y - 10) + ' v20 M' + (x + 140) + ' ' + (y - 10) + ' v20', t, { fill: '#FFFFFF' }); for (var r = 0; r < 3; r++) for (var c = 0; c < 5; c++) s += F('<rect x="' + (x + 14 + c * 31) + '" y="' + (y + 42 + r * 28) + '" width="20" height="16" rx="3" fill="' + (r === 2 && c === 3 ? ACC : '#E4E4E7') + '"/>', t + 0.3 + (r * 5 + c) * 0.02); if (mark) s += L('M' + (x + 116) + ' ' + (y + 108) + ' a22 18 0 1 0 1 -1', t + 0.9, { stroke: ACC, w: 3 }); return s; }
function svgWrap(inner, caption) {
  return '<svg viewBox="0 0 800 560" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + escH(caption || '') + '"><defs><filter id="wob"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter></defs>'
    + '<g filter="url(#wob)">' + inner + '</g></svg>';
}
var ILLOS = {
  scatter: () => svgWrap(
    person(200, 420, 0.1, { hair: 'long', pose: 'paper' }) + bubble(110, 120, 210, 56, '주사가 몇 시였지?', 1.2)
    + F(L('M90 300 l40 -6 l4 50 l-40 6 Z', 0.9, { fill: '#FFFFFF' }) + L('M300 200 l44 8 l-6 50 l-44 -8 Z', 1.0, { fill: '#FFFFFF' }) + L('M120 470 l52 -10 l8 40 l-52 10 Z', 1.1, { fill: '#FFFFFF' }), 0.8)
    + desk(590, 380, 0.4) + laptop(590, 380, 0.6) + person(590, 380, 0.5, { hair: 'short', pose: 'sit' }) + bubble(480, 150, 230, 56, '토요일에 뭐 한댔지?', 1.6, { tail: 'r' })
    + L('M300 330 C 380 300, 440 360, 500 320', 1.9, { dash: 1, w: 2.4 }) + F(T(400, 300, '?', 46, { anchor: 'middle', bold: true, fill: ACC }), 2.3), '병원 안내는 종이·문자·전화로 흩어져요'),
  clinic: () => svgWrap(
    desk(250, 400, 0.1) + person(250, 400, 0.2, { hair: 'short', pose: 'paper', cap: true }) + monitor(180, 400, 0.4)
    + person(520, 470, 0.5, { hair: 'long', pose: 'phone' }) + arrow('M330 300 C 380 280, 420 290, 470 320', 1.1, { head: 'M458 306 l14 14 l-18 4' })
    + bubble(90, 110, 290, 58, '매일 21시, 금요일 초음파예요', 1.4) + POP('<path d="M560 250 l12 -10 l4 14 l14 -6 l-6 14" fill="none" stroke="' + ACC + '" stroke-width="3" stroke-linecap="round"/>', 2.0, 570, 250)
    + bubble(560, 150, 170, 56, '찰칵, 찍어 둬야지', 2.2, { tail: 'l' }), '진료실에서 받은 안내문을 찍어 둬요'),
  evening: () => svgWrap(
    sofa(180, 450, 420, 0.1) + person(300, 452, 0.3, { hair: 'long', pose: 'pen' }) + person(480, 452, 0.5, { hair: 'short', pose: 'phone' })
    + clock(660, 140, 46, '20:40', 0.8) + ring(380, 150, 46, 0.32, '20분', 1.2)
    + bubble(480, 220, 210, 56, '이제 20분 남았네', 1.7, { tail: 'l' }), '저녁 9시 주사, 둘이 같은 링을 봐요'),
  office: () => svgWrap(
    desk(200, 380, 0.1) + person(200, 380, 0.2, { hair: 'long', pose: 'sit' }) + phoneDoodle(250, 250, 50, 86, 0.6, F(T(275, 300, '반차', 16, { anchor: 'middle', bold: true }), 0.9))
    + desk(600, 380, 0.3) + laptop(600, 380, 0.5) + person(600, 380, 0.4, { hair: 'short', pose: 'sit' })
    + arrow('M320 260 C 420 200, 500 210, 560 240', 1.2, { acc: true, dashed: true, head: 'M548 226 l14 14 l-18 4' })
    + cardDoodle(520, 120, 220, 76, 1.8, ['서연 · 메모', '오전 반차, 피검사 다녀옴'], { size: 19 }) + POP(T(700, 230, '봤어요 ✓', 22, { bold: true, fill: ACC }), 2.4, 700, 230), '메모를 켜 두면 민준 폰에 바로 떠요'),
  plan: () => svgWrap(
    desk(220, 400, 0.1) + monitor(220, 400, 0.3) + person(320, 400, 0.2, { hair: 'short', cap: true, pose: 'sit' })
    + arrow('M300 250 C 380 180, 470 180, 540 230', 1.0, { acc: true, head: 'M528 216 l14 14 l-18 4' })
    + phoneDoodle(520, 150, 210, 300, 1.2, cardDoodle(532, 186, 186, 110, 1.6, ['오늘 계획', '내일 09:20', '주사 그대로'], { size: 16 }) + POP('<rect x="560" y="380" width="130" height="44" rx="22" fill="' + INKC + '"/>' + T(625, 410, '확인했어요', 22, { anchor: 'middle', fill: '#FFFFFF', bold: true }), 2.2, 625, 402))
    + bubble(80, 120, 250, 56, '오늘 계획 보냈어요', 1.4), '병원이 정하면 카드로 오고, 확인만 누르면 돼요'),
  night: () => svgWrap(
    moon(640, 110, 0.1) + clock(140, 140, 44, '22:00', 0.3)
    + person(330, 470, 0.4, { hair: 'long', pose: 'pen' }) + person(500, 470, 0.6, { hair: 'short', pose: 'phone' })
    + bubble(520, 200, 200, 56, '내가 챙길 건?', 1.3, { tail: 'l' }) + cardDoodle(520, 280, 220, 80, 1.9, ['월 07:30 채취', '보호자 함께 도착'], { size: 19, stroke: ACC }), '트리거 밤, 민준도 자기 폰으로 물어요'),
  recovery: () => svgWrap(
    L('M120 360 h340 v40 h-340 Z M140 400 v60 M440 400 v60 M120 360 q0 -50 60 -40', 0.1, { fill: '#FFFFFF' }) + L('M200 330 q60 -40 130 -10 q60 20 120 0', 0.4)
    + F('<circle cx="170" cy="330" r="20" fill="#FFFFFF" stroke="' + INKC + '" stroke-width="2.6"/>', 0.3)
    + person(600, 470, 0.5, { hair: 'short', pose: 'phone' }) + L('M640 360 l30 0 l6 60 l-42 0 Z M646 360 q8 -18 18 0', 0.9, { fill: '#F4F1EA' })
    + POP(T(560, 250, '찰칵', 26, { bold: true, fill: ACC }), 1.5, 560, 250) + cardDoodle(260, 120, 230, 76, 1.6, ['채취 후 안내', '내일 09:40 연구실 전화'], { size: 18 }), '회복실 안내문도 그 자리에서 찍어요'),
  symptom: () => svgWrap(
    moon(660, 100, 0.1) + person(260, 470, 0.2, { hair: 'long', pose: 'belly' }) + F(T(300, 260, '!', 40, { bold: true }), 0.9)
    + phoneDoodle(420, 150, 200, 300, 0.8, cardDoodle(432, 190, 176, 120, 1.2, ['병원에 바로', '02-1234-5678', '응급하면 119'], { size: 16, stroke: '#D92D20' }))
    + arrow('M630 300 C 680 300, 700 330, 710 370', 1.6, { head: 'M696 360 l14 12 l6 -16' }) + POP(T(720, 420, '☎', 44, { anchor: 'middle' }), 2.2, 720, 410), '판단 대신, 연락할 곳을 바로 보여 줘요'),
  together: () => svgWrap(
    sofa(150, 470, 500, 0.1) + person(320, 472, 0.3, { hair: 'long', pose: 'phone' }) + person(470, 472, 0.4, { hair: 'short', pose: 'phone' })
    + calendar(310, 90, 0.8, true) + POP(T(560, 120, '판정 날', 26, { bold: true, fill: ACC }), 1.8, 560, 112)
    + POP('<path d="M400 300 c-10 -14 -30 -6 -26 8 c3 12 26 26 26 26 s23 -14 26 -26 c4 -14 -16 -22 -26 -8 Z" fill="' + ACC + '" stroke="' + INKC + '" stroke-width="2"/>', 2.2, 400, 316), '여기까지 둘이 같은 화면을 보며 왔어요')
};
