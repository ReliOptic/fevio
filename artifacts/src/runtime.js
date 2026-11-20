/* ===== Template runtime: renders the canvas markup ({{holes}}, sc-if, sc-for) and diffs it into the page ===== */
var H = [];
function getv(path, scope) {
  var ps = path.split('.'), b = ps[0] in scope ? scope[ps[0]] : VALS[ps[0]];
  for (var i = 1; i < ps.length; i++) { if (b == null) return undefined; b = b[ps[i]]; }
  return b;
}
var escH = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function subst(text, scope) {
  return text
    .replace(/\bon([A-Z][a-zA-Z]+)="\{\{\s*([\w.]+)\s*\}\}"/g, (m, ev, p) => { var f = getv(p, scope); if (typeof f !== 'function') return ''; H.push(f); return 'data-on-' + ev.toLowerCase() + '="' + (H.length - 1) + '"'; })
    .replace(/\b(disabled|checked|readonly)="\{\{\s*([\w.]+)\s*\}\}"/g, (m, a, p) => { var v = getv(p, scope); return v && v !== 'false' ? a : ''; })
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, p) => { if (p === 'true' || p === 'false') return p; var v = getv(p, scope); return v == null || typeof v === 'function' ? '' : escH(v); });
}
function expand(t, scope) {
  var out = '', i = 0, re = /<sc-(for|if) (?:list|value)="\{\{\s*([\w.]+)\s*\}\}"(?: as="(\w+)")?[^>]*>/g;
  for (;;) {
    re.lastIndex = i; var m = re.exec(t);
    if (!m) { out += subst(t.slice(i), scope); break; }
    out += subst(t.slice(i, m.index), scope);
    var tag = 'sc-' + m[1], depth = 1, j = m.index + m[0].length, r2 = new RegExp('<' + tag + '[\\s>]|</' + tag + '>', 'g'), mm;
    r2.lastIndex = j;
    while ((mm = r2.exec(t))) { if (mm[0][1] === '/') depth--; else depth++; if (!depth) break; }
    var body = t.slice(j, mm.index); i = mm.index + mm[0].length;
    if (m[1] === 'if') { var v = getv(m[2], scope); if (v && v !== 'false') out += expand(body, scope); }
    else (getv(m[2], scope) || []).forEach((it) => { var sc = Object.assign({}, scope); sc[m[3]] = it; out += expand(body, sc); });
  }
  return out;
}
var VALS = {}, rq = 0;
function scheduleRender() { if (rq) return; rq = requestAnimationFrame(doRender); }
function doRender() {
  rq = 0; H = [];
  VALS = app.vals(); VALS.clock = nowHM();
  var opts = { childrenOnly: true, onBeforeElUpdated: (from, to) => {
    // live field values are not part of isEqualNode; sync them from state first
    if ((from.tagName === 'TEXTAREA' || from.tagName === 'INPUT') && from.type !== 'file' && from.value !== to.value) from.value = to.value;
    return !from.isEqualNode(to);
  } };
  morphdom(document.getElementById('ph-patient'), '<div>' + expand(TPL_PATIENT, {}) + '</div>', opts);
  morphdom(document.getElementById('ph-partner'), '<div>' + expand(TPL_PARTNER, {}) + '</div>', opts);
}
function fire(el, kind, e) { var id = el && el.getAttribute('data-on-' + kind); if (id != null && H[+id]) H[+id](e); }
document.addEventListener('click', (e) => { var el = e.target.closest('[data-on-click]'); if (el && !el.disabled) fire(el, 'click', e); });
document.addEventListener('input', (e) => { if (e.target.hasAttribute('data-on-change')) fire(e.target, 'change', e); });
document.addEventListener('submit', (e) => { e.preventDefault(); fire(e.target, 'submit', e); });
document.addEventListener('scroll', (e) => { if (e.target && e.target.hasAttribute && e.target.hasAttribute('data-on-scroll')) fire(e.target, 'scroll', e); }, true);
document.addEventListener('keydown', (e) => {
  // Enter sends from the Fevio box on a keyboard; Shift+Enter keeps a line break for pasted notices.
  if (e.target.id === 'f3ask' && e.key === 'Enter' && !e.shiftKey && !e.isComposing && !('ontouchstart' in window)) { e.preventDefault(); app.submitText(); }
});
function pickFile(kind) { var el = document.getElementById('file-' + kind); if (el) { el.value = ''; el.click(); } }
document.addEventListener('change', (e) => {
  var t = e.target; if (!t.id || t.id.indexOf('file-') !== 0 || !t.files || !t.files.length) return;
  if (t.id === 'file-post') app.setState({ postFiles: app.u.postFiles.concat(Array.from(t.files).slice(0, 4 - app.u.postFiles.length).map((f) => ({ file: f, url: URL.createObjectURL(f) }))) });
  else app.photo(t.files[0]);
});

/* ===== Fit two phones on any screen ===== */
function fitPhones() {
  var w = document.documentElement.clientWidth, h = window.innerHeight, side = w >= 720, s;
  if (side) s = Math.min(1, (w - 56 - 48) / 768, Math.max(0.72, (h - 96) / 824));
  else s = Math.min(1, (w - 32) / 384);
  document.documentElement.style.setProperty('--s', s.toFixed(3));
  document.body.classList.toggle('stacked', !side);
}
window.addEventListener('resize', fitPhones);

/* ===== Boot ===== */
var app = new App();
fitPhones();
scheduleRender();
setInterval(() => { if (!document.hidden) scheduleRender(); }, 30000);
(async () => {
  try { db = window.claude && window.claude.use ? await window.claude.use('db') : null; } catch (e) { db = null; }
  try { assets = window.claude && window.claude.use ? await window.claude.use('assets') : null; } catch (e) { assets = null; }
  var started = false, boot = () => { if (started) return; started = true; D.ready = true; if (app.onboarding()) app.startOnboarding(); app.reanchor(false); };
  if (!db) { D.offline = true; applyMem(); boot(); return; }
  var pending = new Set(COLLS), lastAsk = null;
  COLLS.forEach((c) => db.collection(c).onSnapshot((snap) => {
    setColl(c, snap.docs.map((d) => ({ id: d.id, data: d.data() || {} })));
    if (c === 'asks' && D.asks.length) { var a = D.asks.slice().sort((x, y) => y.createdAt - x.createdAt)[0]; if (lastAsk && a.id !== lastAsk && Date.now() - a.createdAt < 10000) app.say(ptN() + ' 님이 질문을 보냈어요'); lastAsk = a.id; }
    pending.delete(c); if (!pending.size) boot();
    app.render();
  }, () => { pending.delete(c); if (!pending.size) boot(); }));
  setTimeout(boot, 6000);
})();
