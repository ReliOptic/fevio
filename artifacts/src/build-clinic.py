import re, json, base64
D='/tmp/claude-0/-home-user-fevio/3573a4dc-3a1d-5767-b091-00c7be4cb5b6/scratchpad/'
def block(t, start, tag):
    d = 0
    for m in re.finditer(r'<' + tag + r'[\s>]|</' + tag + '>', t[start:]):
        d += -1 if m.group().startswith('</') else 1
        if d == 0: return start + m.end()
def rep(t, a, b, n=1):
    assert t.count(a) == n, (a[:80], t.count(a)); return t.replace(a, b)
t = open(D + 'apps/t_rest.html').read()
a = t.index('<div style="height: 40px; border-radius: 12px; border: 1.5px dashed'); t = t[:a] + t[block(t, a, 'div'):].lstrip('\n')
t = rep(t, 'position: relative; height: 820px; border-radius: 14px;', 'position: relative; height: max(720px, calc(100dvh - 40px)); min-width: 1100px; border-radius: 14px;')
t = rep(t, 'font-size: 12px; font-weight: 800">서</span>', 'font-size: 12px; font-weight: 800">{{clinicInitial}}</span>')
t = rep(t, '>서울OO난임센터<', '>{{clinicName}}<')
t = rep(t, '>간호 · 박<', '>{{staffName}}<')
t = rep(t, '>토 오전 모니터링 담당<', '>{{staffRole}}<')
t = rep(t, '>토 11.21 · 오전 모니터링 {{cohortN}}명<', '>{{todayLabel}} · 오전 모니터링 {{cohortN}}명<')
t = rep(t, '>08:00부터 · 시연 수치<', '>오늘 · 받은 연락을 +1로 기록<')
t = rep(t, '<span style="height: 34px; padding: 0 10px; border-radius: 8px; display: flex; align-items: center; font-size: 13px; font-weight: 700; background: {{n.bg}}; color: {{n.ink}}">{{n.t}}</span>',
        '<button class="tap" onClick="{{n.tap}}" style="height: 34px; padding: 0 10px; border-radius: 8px; display: flex; align-items: center; font-size: 13px; font-weight: 700; text-align: left; background: {{n.bg}}; color: {{n.ink}}">{{n.t}}</button>')
t = rep(t, 'grid-template-columns: 132px 1fr 92px; gap: 10px; align-items: center">', 'grid-template-columns: 132px 1fr 72px 34px; gap: 10px; align-items: center">')
a = t.index('<span class="num" style="font-size: 12px; font-weight: 700; color: #575A62; text-align: right">{{c.v}}</span>'); b = t.index('</span>', a) + 7
t = t[:b] + '\n<button class="tap" aria-label="{{c.t}} 1건 기록" onClick="{{c.add}}" style="height: 24px; border-radius: 12px; font-size: 11px; font-weight: 800; box-shadow: inset 0 0 0 1px #E4E4E7">+1</button>' + t[b:]
# drawer: add patient, decide and send per row, settings
h0 = t.index('<div style="display: grid; grid-template-columns: 64px 48px 48px 60px 1fr; gap: 8px; padding: 8px 16px;')
s0 = t.index('<div class="scroll" style="flex: 1; overflow-y: auto">', h0); s1 = block(t, s0, 'div')
header = t[h0:s0]
DRAWER = ('<sc-if value="{{drIsList}}" hint-placeholder-val="{{ true }}">\n'
 '<sc-if value="{{drHasAdd}}" hint-placeholder-val="{{ true }}"><form onSubmit="{{addSubmit}}" style="flex: none; display: flex; gap: 8px; padding: 10px 16px; border-bottom: 1px solid #F0F0F2">'
 '<label for="add-code" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">환자 번호</label>'
 '<input id="add-code" value="{{addCode}}" onChange="{{addType}}" placeholder="오늘 본 환자 번호 (예: P-0419)" autocomplete="off" style="flex: 1; min-width: 0; height: 34px; border: 0; border-radius: 10px; background: #F4F4F5; padding: 0 10px; font: inherit; font-size: 13px; color: #0E0F11">'
 '<button class="tap" type="submit" style="height: 34px; padding: 0 14px; border-radius: 17px; font-size: 12px; font-weight: 800; background: #0E0F11; color: #FFFFFF">추가</button></form></sc-if>\n'
 + header +
 '<div class="scroll" style="flex: 1; overflow-y: auto">\n<sc-for list="{{drRows}}" as="r" hint-placeholder-count="6">\n'
 '<div onClick="{{r.tap}}" style="cursor: pointer; display: grid; grid-template-columns: 64px 48px 48px 60px 1fr; gap: 8px; align-items: center; padding: 9px 16px; border-bottom: 1px solid #F0F0F2; background: {{r.bg}}">'
 '<span class="num" style="font-size: 12px; font-weight: 800">{{r.id}}</span><span class="num" style="font-size: 12px; font-weight: 600; color: #575A62">{{r.scan}}</span><span class="num" style="font-size: 12px; font-weight: 600; color: #575A62">{{r.dec}}</span>'
 '<span class="num" style="font-size: 12px; font-weight: 700; color: {{r.viaInk}}">{{r.via}}</span><span class="num" style="font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{r.next}}</span></div>\n'
 '<sc-if value="{{r.open}}" hint-placeholder-val="{{ false }}"><div class="in" style="padding: 12px 16px 14px 16px; border-bottom: 1px solid #F0F0F2; background: rgba(31,91,255,0.03); display: flex; flex-direction: column; gap: 10px">'
 '<span role="group" aria-label="오늘 결정" style="display: flex; flex-wrap: wrap; gap: 6px"><sc-for list="{{r.decs}}" as="x" hint-placeholder-count="6"><button class="tap" onClick="{{x.tap}}" style="height: 30px; padding: 0 12px; border-radius: 15px; font-size: 12px; font-weight: 800; background: {{x.bg}}; color: {{x.ink}}; box-shadow: {{x.edge}}">{{x.t}}</button></sc-for></span>'
 '<sc-if value="{{r.hasDec}}" hint-placeholder-val="{{ false }}">'
 '<div style="display: grid; grid-template-columns: 64px 1fr; gap: 6px 10px; align-items: center"><sc-for list="{{r.fields}}" as="f" hint-placeholder-count="2"><span style="font-size: 11px; font-weight: 800; color: #575A62">{{f.label}}</span>'
 '<span style="display: flex; flex-wrap: wrap; gap: 6px"><sc-for list="{{f.inputs}}" as="i" hint-placeholder-count="2"><input type="{{i.type}}" value="{{i.value}}" onChange="{{i.set}}" onBlur="{{i.save}}" aria-label="{{i.aria}}" style="width: {{i.w}}px; max-width: 100%; height: 32px; border: 0; border-radius: 8px; background: #FFFFFF; box-shadow: inset 0 0 0 1px #E4E4E7; padding: 0 8px; font: inherit; font-size: 12px; color: #0E0F11"></sc-for></span></sc-for></div>'
 '<label for="{{r.msgId}}" style="font-size: 11px; font-weight: 800; color: #8A8D94">환자에게 가는 안내문</label>'
 '<textarea id="{{r.msgId}}" readonly style="width: 100%; box-sizing: border-box; min-height: 128px; border: 0; border-radius: 10px; background: #FFFFFF; box-shadow: inset 0 0 0 1px #E4E4E7; padding: 10px; font: inherit; font-size: 12px; line-height: 1.6; resize: vertical; color: #0E0F11">{{r.msg}}</textarea>'
 '<span style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center"><button class="tap" onClick="{{r.send}}" style="height: 32px; padding: 0 14px; border-radius: 16px; font-size: 12px; font-weight: 800; background: #0E0F11; color: #FFFFFF">{{r.sendLabel}}</button>'
 '<sc-if value="{{r.canConfirm}}" hint-placeholder-val="{{ false }}"><button class="tap" onClick="{{r.confirm}}" style="height: 32px; padding: 0 14px; border-radius: 16px; font-size: 12px; font-weight: 800; box-shadow: inset 0 0 0 1.5px #E4E4E7">환자 확인 받음</button></sc-if>'
 '<span style="flex: 1"></span><button class="tap" onClick="{{r.remove}}" style="height: 32px; padding: 0 10px; font-size: 12px; font-weight: 700; color: #8A8D94">목록에서 빼기</button></span>'
 '<span style="font-size: 11px; font-weight: 600; color: #8A8D94">문자·알림톡에 붙여 보내 주세요. 환자는 같은 글을 Fevio에 붙여 넣어 일정으로 받아요.</span>'
 '</sc-if></div></sc-if>\n</sc-for>\n</div>\n</sc-if>\n'
 '<sc-if value="{{drIsSettings}}" hint-placeholder-val="{{ false }}"><div class="scroll" style="flex: 1; overflow-y: auto; padding: 14px 16px; display: flex; flex-direction: column; gap: 12px">'
 '<sc-for list="{{setRows}}" as="r" hint-placeholder-count="6"><label for="{{r.id}}" style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; font-weight: 800; color: #575A62">{{r.label}}<input id="{{r.id}}" type="{{r.type}}" value="{{r.value}}" placeholder="{{r.ph}}" onBlur="{{r.set}}" style="height: 36px; border: 0; border-radius: 10px; background: #F4F4F5; padding: 0 10px; font: inherit; font-size: 14px; color: #0E0F11"></label></sc-for>'
 '<span style="font-size: 12px; font-weight: 600; color: #8A8D94">마감까지 환자 확인이 없으면 사람이 볼 것에 올라와요.</span></div></sc-if>\n')
t = t[:h0] + DRAWER + t[s1:]
t = rep(t, '<div aria-hidden="{{drHidden}}" style="position: absolute; top: 52px; right: 0; bottom: 0; width: 420px;', '<div aria-hidden="{{drHidden}}" style="position: absolute; top: 52px; right: 0; bottom: 0; width: 460px;')
left = [x for x in re.findall(r'>[^<{]*[가-힣][^<{]*<', t) if re.search('서울|시연|간호 · 박', x)]
assert not left, left
font = base64.b64encode(open(D + 'font/Pretendard-KS.woff2', 'rb').read()).decode()
css = re.search(r'<style>([\s\S]*?)</style>', open(D + 'fevio-canvas/project/F3Loop.dc.html').read()).group(1)
css = re.sub(r"@font-face\{[^}]*\}", "@font-face{font-family:'Pretendard';src:url(data:font/woff2;base64," + font + ") format('woff2');font-weight:45 920;font-style:normal;font-display:swap}", css, count=1)
page = '''
:root{--page:#E9EBEF}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--page:#111214;color-scheme:dark}}
:root[data-theme="dark"]{--page:#111214;color-scheme:dark}
body{margin:0;background:var(--page)}
.wrap{padding-block:20px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.wide{overflow-x:auto;max-width:1600px;margin:0 auto;border-radius:14px}
.toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:20;height:40px;padding:0 16px;border-radius:20px;display:flex;align-items:center;background:#0E0F11;color:#FFFFFF;font-size:13px;font-weight:700;white-space:nowrap}
'''
TOAST = '<sc-if value="{{hasToast}}" hint-placeholder-val="{{ false }}"><div class="toast" role="status">{{toast}}</div></sc-if>'
logic = open(D + 'apps/clinic_logic.js').read()
rt = open(D + 'apps/runtime.js').read()
core = rt[:rt.index('function fire(')]
core = core.replace("  morphdom(document.getElementById('ph-patient'), '<div>' + expand(TPL_PATIENT, {}) + '</div>', opts);\n  morphdom(document.getElementById('ph-partner'), '<div>' + expand(TPL_PARTNER, {}) + '</div>', opts);",
                    "  morphdom(document.getElementById('console'), '<div>' + expand(TPL, {}) + '</div>', opts);")
assert "expand(TPL, {})" in core
boot = r'''
function fire(el, kind, e) { var id = el && el.getAttribute('data-on-' + kind); if (id != null && H[+id]) H[+id](e); }
document.addEventListener('click', (e) => { var el = e.target.closest('[data-on-click]'); if (el && !el.disabled) fire(el, 'click', e); });
document.addEventListener('input', (e) => { if (e.target.hasAttribute('data-on-change')) fire(e.target, 'change', e); });
document.addEventListener('focusout', (e) => { if (e.target.hasAttribute && e.target.hasAttribute('data-on-blur')) fire(e.target, 'blur', e); });
document.addEventListener('submit', (e) => { e.preventDefault(); fire(e.target, 'submit', e); });
var app = new App();
scheduleRender();
setInterval(() => { if (!document.hidden && !(document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName))) scheduleRender(); }, 30000);
(async () => {
  try { db = window.claude && window.claude.use ? await window.claude.use('db') : null; } catch (e) { db = null; }
  if (!db) { D.offline = true; D.ready = true; applyMem(); return; }
  var pending = new Set(COLLS);
  COLLS.forEach((c) => db.collection(c).onSnapshot((snap) => { setColl(c, snap.docs.map((d) => ({ id: d.id, data: d.data() || {} }))); pending.delete(c); if (!pending.size) D.ready = true; app.render(); }, () => { pending.delete(c); if (!pending.size) D.ready = true; app.render(); }));
  setTimeout(() => { D.ready = true; app.render(); }, 6000);
})();
'''
html = ('<title>Fevio 병원 운영</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<style>' + css + page + '</style>\n'
        '<main class="wrap q"><div class="wide" id="console"></div></main>\n'
        '<script src="https://cdn.jsdelivr.net/npm/morphdom@2.7.4/dist/morphdom-umd.min.js"></script>\n<script>\n' + logic +
        '\nvar TPL = ' + json.dumps(t + TOAST, ensure_ascii=False) + ';\n' + core + boot + '\n</script>\n')
open(D + 'apps/fevio-clinic.html', 'w').write(html)
print('bytes', len(html.encode()))
