import re, json, base64
D='/tmp/claude-0/-home-user-fevio/3573a4dc-3a1d-5767-b091-00c7be4cb5b6/scratchpad/'
def block(t, start, tag):
    d = 0
    for m in re.finditer(r'<' + tag + r'[\s>]|</' + tag + '>', t[start:]):
        d += -1 if m.group().startswith('</') else 1
        if d == 0: return start + m.end()
    raise Exception('no match ' + tag)
def rep(t, a, b, n=1):
    assert t.count(a) == n, (a[:80], t.count(a)); return t.replace(a, b)

SB = ('<div class="sb" aria-hidden="true"><span class="sb-t num">{{clock}}</span><span class="sb-i">'
      '<svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="#0E0F11"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="#0E0F11"/><rect x="10" y="3" width="3" height="9" rx="1" fill="#0E0F11"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#0E0F11"/></svg>'
      '<svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5l2.4-2.9a3.6 3.6 0 00-4.8 0z" fill="#0E0F11"/><path d="M2.6 5.3a8 8 0 0110.8 0l-1.5 1.8a5.6 5.6 0 00-7.8 0z" fill="#0E0F11"/><path d="M0 2.4a12 12 0 0116 0l-1.5 1.8a9.6 9.6 0 00-13 0z" fill="#0E0F11"/></svg>'
      '<svg width="27" height="13" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke="#0E0F11" opacity="0.4"/><rect x="2" y="2" width="18" height="9" rx="2.4" fill="#0E0F11"/><path d="M25 4.5v4a2 2 0 000-4z" fill="#0E0F11" opacity="0.45"/></svg>'
      '</span></div><div class="island" aria-hidden="true"></div><div class="homebar" aria-hidden="true"></div>')

def common(t, role):
    lines = t.split('\n')
    assert lines[0].startswith('<div style="display: flex; flex-direction: column; gap: 8px">') and lines[1].startswith('<span style="font-size: 12px')
    t = '\n'.join(['<div class="device">'] + lines[2:])
    t = rep(t, '<div style="position: relative; height: 800px; border-radius: 44px; background: #0E0F11; overflow: hidden; box-shadow: inset 0 0 0 1px #E4E4E7">',
            '<div class="screen" style="position: relative; height: 800px; border-radius: 50px; background: #FFFFFF; overflow: hidden">' + SB)
    # memo: lock icon -> share state; edit form gets the share switch; partner sees shared memos
    lock_start = t.index('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A1')
    lock_end = t.index('</svg>', lock_start) + 6
    t = t[:lock_start] + '<span class="num" style="flex: none; font-size: 11px; font-weight: 800; color: {{d.memoTagInk}}">{{d.memoTag}}</span>' + t[lock_end:]
    f0 = t.index('<form onSubmit="{{d.memoSave}}"'); f1 = block(t, f0, 'form')
    t = t[:f1] + ('\n<button class="tap" type="button" role="switch" aria-checked="{{d.memoShareOn}}" onClick="{{d.toggleMemoShare}}" style="align-self: flex-start; display: flex; align-items: center; gap: 8px; height: 30px; font-size: 12px; font-weight: 700; color: #575A62">'
                  '<span style="width: 34px; height: 20px; border-radius: 10px; position: relative; flex: none; background: {{d.memoShareTrack}}; transition: background-color 180ms ease"><span style="position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 8px; background: #FFFFFF; transform: translateX({{d.memoShareX}}px); transition: transform 200ms ease; box-shadow: 0 1px 2px rgba(0,0,0,0.2)"></span></span>{{d.memoShareLabel}}</button>') + t[f1:]
    c0 = t.index('<sc-if value="{{d.canMemo}}"'); c1 = block(t, c0, 'sc-if')
    t = t[:c1] + ('\n<sc-if value="{{d.pMemo}}" hint-placeholder-val="{{ false }}"><span class="in" style="display: flex; align-items: flex-start; gap: 8px; padding: 8px 10px; border-radius: 10px; background: #F4F4F5; font-size: 13px; line-height: 18px; font-weight: 600; color: #575A62">'
                  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A8D94" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none; margin-top: 2px"><path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"></path></svg>'
                  '<span><span style="font-weight: 800; color: #0E0F11">{{d.pMemoWho}}</span> {{d.pMemoText}}</span></span></sc-if>') + t[c1:]
    chip = '<sc-if value="{{r.hasChip}}" hint-placeholder-val="{{ false }}">'
    ring = ('\n<sc-if value="{{r.hasRing}}" hint-placeholder-val="{{ false }}"><span class="in" style="align-self: flex-start; display: flex; align-items: center; gap: 12px; padding: 8px 14px 8px 8px; border-radius: 18px; background: #FFFFFF; box-shadow: inset 0 0 0 1px #E4E4E7">'
            '<svg class="ring-breathe" width="44" height="44" viewBox="0 0 44 44" aria-hidden="true" style="flex: none"><circle cx="22" cy="22" r="18" fill="none" stroke="#EEF0F3" stroke-width="5"></circle>'
            '<circle cx="22" cy="22" r="18" fill="none" stroke="#1F5BFF" stroke-width="5" stroke-linecap="round" transform="rotate(-90 22 22)" style="stroke-dasharray: 113.1; stroke-dashoffset: {{r.ringOff}}; --c: 113.1; animation: ringgo {{r.ringSecs}}s linear forwards"></circle></svg>'
            '<span style="display: flex; flex-direction: column; gap: 1px"><span class="num" style="font-size: 18px; line-height: 22px; font-weight: 800; letter-spacing: -0.02em">{{r.ringLeft}}</span><span class="num" style="font-size: 12px; font-weight: 700; color: #575A62">{{r.ringLabel}}</span></span></span></sc-if>')
    pos = 0
    while True:
        i = t.find(chip, pos)
        if i < 0: break
        j = block(t, i, 'sc-if'); t = t[:j] + ring + t[j:]; pos = j + len(ring)
    # 정부지원 rows open to steps, papers and actions; official sites are real links
    row0 = '<div style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-top: {{g.divider}}; opacity: {{g.o}}">'
    if row0 in t:
        i = t.index(row0); j = block(t, i, 'div'); inner = t[i + len(row0):j - len('</div>')]
        new = ('<div onClick="{{g.tap}}" style="cursor: pointer; display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-top: {{g.divider}}; opacity: {{g.o}}">' + inner
               + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none; transform: rotate({{g.chev}}deg); transition: transform 200ms ease"><path d="M9 5l7 7-7 7"></path></svg></div>'
               '\n<sc-if value="{{g.open}}" hint-placeholder-val="{{ false }}"><div class="in" style="padding: 0 14px 14px 60px; display: flex; flex-direction: column; gap: 9px">'
               '<sc-for list="{{g.steps}}" as="x" hint-placeholder-count="3"><span style="display: flex; gap: 8px; font-size: 13px; line-height: 18px; font-weight: 600; color: #2B2D31"><span class="num" style="width: 18px; height: 18px; border-radius: 9px; flex: none; display: grid; place-items: center; font-size: 11px; font-weight: 800; background: #F4F4F5">{{x.n}}</span>{{x.t}}</span></sc-for>'
               '<sc-if value="{{g.hasDocs}}" hint-placeholder-val="{{ false }}"><span style="display: flex; flex-wrap: wrap; gap: 6px"><sc-for list="{{g.docs}}" as="x" hint-placeholder-count="2"><span style="height: 26px; padding: 0 10px; border-radius: 13px; display: flex; align-items: center; font-size: 12px; font-weight: 700; background: #F4F4F5; color: #575A62">{{x}}</span></sc-for></span></sc-if>'
               '<sc-if value="{{g.hasActs}}" hint-placeholder-val="{{ false }}"><span style="display: flex; flex-wrap: wrap; gap: 6px"><sc-for list="{{g.acts}}" as="a" hint-placeholder-count="2">'
               '<sc-if value="{{a.hasHref}}" hint-placeholder-val="{{ false }}"><a class="tap" href="{{a.href}}" target="_blank" rel="noopener" style="height: 34px; padding: 0 14px; border-radius: 17px; display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; text-decoration: none; background: {{a.bg}}; color: {{a.ink}}; box-shadow: {{a.edge}}">{{a.t}}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"></path></svg></a></sc-if>'
               '<sc-if value="{{a.noHref}}" hint-placeholder-val="{{ true }}"><button class="tap" onClick="{{a.tap}}" style="height: 34px; padding: 0 14px; border-radius: 17px; font-size: 12px; font-weight: 800; background: {{a.bg}}; color: {{a.ink}}; box-shadow: {{a.edge}}">{{a.t}}</button></sc-if>'
               '</sc-for></span></sc-if></div></sc-if>')
        t = t[:i] + new + t[j:]
    t = t.replace('padding: 8px 4px 0 4px">지원 제도</span>', 'padding: 8px 4px 0 4px">이번 주기에 챙길 지원</span>')
    # one native ad row under the day it fits (values are empty for the partner)
    w0 = t.index('<sc-for list="{{wk.days}}"'); d0 = t.index('<div onClick="{{d.tap}}"', w0); d1 = block(t, d0, 'div')
    t = t[:d1] + ('\n<sc-if value="{{d.hasAd}}" hint-placeholder-val="{{ false }}"><div class="in" style="flex: none; display: flex; align-items: center; gap: 12px; padding: 6px 12px 8px 12px">'
                  '<span style="width: 34px; flex: none; text-align: center; font-size: 10px; font-weight: 800; color: #A1A1AA">광고</span>'
                  '<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px"><span style="font-size: 13px; font-weight: 700; color: #0E0F11">{{d.adT}}</span><span style="font-size: 12px; font-weight: 600; color: #8A8D94">{{d.adS}}</span></span>'
                  '<button class="tap" aria-label="이 광고 숨기기" onClick="{{d.adHide}}" style="width: 28px; height: 28px; border-radius: 14px; flex: none; display: grid; place-items: center; color: #A1A1AA"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></button></div></sc-if>') + t[d1:]
    # short timelines start at the top of the screen (column-reverse puts the first child at the bottom)
    for tid in ('f3-tl', 'f3-ptl'):
        if ('id="' + tid + '"') in t:
            i0 = t.index('id="' + tid + '"'); i1 = t.index('>', i0) + 1
            t = t[:i1] + '\n<div aria-hidden="true" style="flex: 1 0 0"></div>' + t[i1:]
    return t

pat = open(D + 'apps/t_patient.html').read(); par = open(D + 'apps/t_partner.html').read()
pat = common(pat, 'patient'); par = common(par, 'partner')
pat = rep(pat, 'font-size: 13px; font-weight: 800">서</button>', 'font-size: 13px; font-weight: 800">{{meInitial}}</button>')
pat = rep(pat, 'font-size: 14px; font-weight: 800">민</span>', 'font-size: 14px; font-weight: 800">{{ptInitial}}</span>')
pat = rep(pat, 'font-size: 15px; font-weight: 800">민준</span>', 'font-size: 15px; font-weight: 800">{{ptName}}</span>')
pat = rep(pat, 'aria-label="민준에게 보이는 범위"', 'aria-label="{{ptName}}에게 보이는 범위"')
pat = rep(pat, '</span>주사로 키우는 중 · 다음 결정 토 오후</div>', '</span>{{doseNote}}</div>')
pat = rep(pat, 'letter-spacing: -0.04em">21:00</span>', 'letter-spacing: -0.04em">{{doseTime}}</span>')
pat = rep(pat, '<span class="num" style="font-size: 15px; font-weight: 800; color: #1F5BFF; margin-top: 4px">2분 남음 · 병원이 정한 시각</span>',
  '<div style="display: flex; align-items: center; gap: 16px; margin-top: 4px">'
  '<svg class="ring-breathe" width="112" height="112" viewBox="0 0 120 120" aria-hidden="true" style="flex: none"><circle cx="60" cy="60" r="52" fill="none" stroke="#EEF0F3" stroke-width="10"></circle>'
  '<circle cx="60" cy="60" r="52" fill="none" stroke="#1F5BFF" stroke-width="10" stroke-linecap="round" transform="rotate(-90 60 60)" style="stroke-dasharray: 326.7; stroke-dashoffset: {{doseRingOff}}; --c: 326.7; animation: ringgo {{doseRingSecs}}s linear forwards"></circle></svg>'
  '<span style="display: flex; flex-direction: column; gap: 4px; min-width: 0"><span class="num" style="font-size: 34px; line-height: 38px; font-weight: 800; letter-spacing: -0.03em">{{doseCount}}</span>'
  '<span style="font-size: 13px; font-weight: 700; color: {{doseLeftInk}}">{{doseLeft}}</span></span></div>')
pat = rep(pat, 'border-radius: 28px; background: #FFFFFF; box-shadow: inset 0 0 0 2px #1F5BFF;', 'border-radius: 28px; background: #FFFFFF; box-shadow: inset 0 0 0 1.5px rgba(31,91,255,0.35);')
HS = ('<div aria-hidden="{{hsHidden}}" style="position: absolute; inset: 0; z-index: 3; background: #F4F4F5; transform: translateX({{hsX}}%); transition: transform 420ms cubic-bezier(0.32,0.72,0,1); box-shadow: -12px 0 30px rgba(14,15,17,0.10)">'
  '<div style="position: absolute; left: 0; right: 0; top: 48px; height: 44px; padding: 0 12px; display: flex; align-items: center; gap: 10px">'
  '<button class="tap" aria-label="뒤로" onClick="{{hsClose}}" style="width: 38px; height: 38px; border-radius: 19px; display: grid; place-items: center; background: #FFFFFF; box-shadow: inset 0 0 0 1px #E4E4E7"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E0F11" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg></button>'
  '<span style="font-size: 22px; font-weight: 800">병원 등록</span></div>'
  '<div class="scroll" style="position: absolute; left: 0; right: 0; top: 100px; bottom: 0; overflow-y: auto; padding: 0 16px 40px 16px; display: flex; flex-direction: column; gap: 10px">'
  '<label for="f3-hs" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">병원 검색</label>'
  '<span style="display: flex; align-items: center; gap: 8px; height: 46px; padding: 0 14px; border-radius: 23px; background: #FFFFFF; box-shadow: inset 0 0 0 1px #E4E4E7"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8D94" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4"></path></svg>'
  '<input id="f3-hs" value="{{hsQ}}" onChange="{{hsType}}" placeholder="병원 이름이나 동네" autocomplete="off" style="flex: 1; min-width: 0; height: 40px; border: 0; background: transparent; font: inherit; font-size: 15px; color: #0E0F11"></span>'
  '<div style="border-radius: 20px; background: #FFFFFF; box-shadow: inset 0 0 0 1px #E4E4E7; overflow: hidden">'
  '<sc-for list="{{hsResults}}" as="h" hint-placeholder-count="3"><div onClick="{{h.tap}}" style="cursor: pointer; display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-top: {{h.divider}}; background: {{h.bg}}">'
  '<span style="width: 34px; height: 34px; border-radius: 10px; flex: none; display: grid; place-items: center; font-size: 13px; font-weight: 800; background: {{h.avBg}}; color: #FFFFFF">{{h.av}}</span>'
  '<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 14px; font-weight: 800">{{h.name}}</span><span class="num" style="font-size: 12px; font-weight: 600; color: #575A62">{{h.sub}}</span></span>'
  '<sc-if value="{{h.on}}" hint-placeholder-val="{{ false }}"><span style="height: 22px; padding: 0 8px; border-radius: 11px; display: grid; place-items: center; font-size: 11px; font-weight: 800; background: #0E0F11; color: #FFFFFF">등록됨</span></sc-if></div>'
  '<sc-if value="{{h.open}}" hint-placeholder-val="{{ false }}"><div class="in" style="padding: 0 14px 14px 60px; display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #2B2D31"><sc-for list="{{h.info}}" as="x" hint-placeholder-count="3"><span style="display: flex; gap: 8px"><span style="width: 34px; flex: none; color: #8A8D94; font-weight: 700">{{x.k}}</span><span class="num" style="font-weight: 600">{{x.v}}</span></span></sc-for>'
  '<button class="tap" onClick="{{h.reg}}" style="align-self: flex-start; margin-top: 4px; height: 36px; padding: 0 16px; border-radius: 18px; font-size: 13px; font-weight: 800; background: #0E0F11; color: #FFFFFF">{{h.regLabel}}</button></div></sc-if></sc-for>'
  '<sc-if value="{{hsEmpty}}" hint-placeholder-val="{{ false }}"><span style="display: block; padding: 14px; font-size: 13px; line-height: 19px; font-weight: 600; color: #8A8D94">{{hsEmptyText}}</span></sc-if></div>'
  '<button class="tap" onClick="{{hsManual}}" style="align-self: flex-start; height: 34px; padding: 0 4px; font-size: 13px; font-weight: 700; color: #575A62">목록에 없어요 · 직접 입력</button></div></div>')
a0 = pat.index('<div aria-hidden="{{setHidden}}"'); a1 = block(pat, a0, 'div')
pat = pat[:a1 - 6] + HS + pat[a1 - 6:]
pat = rep(pat, '<div style="display: flex; align-items: center; gap: 10px; height: 50px; padding: 0 14px; border-top: {{k.divider}}">', '<div onClick="{{k.tap}}" style="cursor: pointer; display: flex; align-items: center; gap: 10px; height: 50px; padding: 0 14px; border-top: {{k.divider}}">')
# Fevio box takes a multi-line paste
a = pat.index('<input id="f3ask"'); b = pat.index('>', a) + 1
inp = pat[a:b]
pat = pat[:a] + inp.replace('<input id="f3ask" value="{{draftText}}"', '<textarea id="f3ask" rows="1"').replace('height: 38px;', 'height: 38px; resize: none; padding: 9px 0 0 0; line-height: 20px;')[:-1] + '>{{draftText}}</textarea>' + pat[b:]
# community photos come from the phone's album (file picker), not a sample grid
a = pat.index('<sc-if value="{{photoPick}}"'); b = block(pat, a, 'sc-if'); pat = pat[:a] + pat[b:].lstrip('\n')
par = rep(par, 'font-size: 13px; font-weight: 800">민</button>', 'font-size: 13px; font-weight: 800">{{pMeInitial}}</button>')
par = rep(par, '>서연이 공유를 잠시 멈췄어요<', '>{{pOffText}}<')
for t, n in ((pat, 'patient'), (par, 'partner')):
    left = [x for x in re.findall(r'>[^<{]*[가-힣][^<{]*<', t) if re.search('서연|민준|서울', x)]
    assert not left, (n, left)

font = base64.b64encode(open(D + 'font/Pretendard-KS.woff2', 'rb').read()).decode()
helmet = open(D + 'fevio-canvas/project/F3Loop.dc.html').read()
css = re.search(r'<style>([\s\S]*?)</style>', helmet).group(1)
css = re.sub(r"@font-face\{[^}]*\}", "@font-face{font-family:'Pretendard';src:url(data:font/woff2;base64," + font + ") format('woff2');font-weight:45 920;font-style:normal;font-display:swap}", css, count=1)
page_css = '''
:root{--page:#E9EBEF;--cap:#575A62;--s:1}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--page:#111214;--cap:#A1A4AB;color-scheme:dark}}
:root[data-theme="dark"]{--page:#111214;--cap:#A1A4AB;color-scheme:dark}
html,body{height:100%}
body{margin:0;background:var(--page)}
.stage{min-height:100%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding-block:28px 32px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.phones{display:flex;gap:56px;align-items:flex-start;justify-content:center}
body.stacked .phones{flex-direction:column;align-items:center;gap:28px}
.slot{display:flex;flex-direction:column;align-items:center;gap:14px}
.frame{position:relative;width:calc(384px * var(--s));height:calc(824px * var(--s))}
.device{position:absolute;left:0;top:0;width:384px;height:824px;box-sizing:border-box;padding:12px;border-radius:62px;transform:scale(var(--s));transform-origin:0 0;
  background:linear-gradient(145deg,#5b5d62 0%,#2a2b2f 18%,#1a1b1e 50%,#2a2b2f 82%,#5b5d62 100%);
  box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.18),inset 0 0 0 5px #0b0b0c,0 2px 0 rgba(255,255,255,.06),0 40px 70px -30px rgba(14,15,17,.55),0 18px 36px -12px rgba(14,15,17,.28)}
.device::before{content:"";position:absolute;left:-3px;top:150px;width:4px;height:34px;border-radius:2px 0 0 2px;background:#2b2c30;box-shadow:0 56px 0 #2b2c30,0 120px 0 #2b2c30}
.device::after{content:"";position:absolute;right:-3px;top:210px;width:4px;height:90px;border-radius:0 2px 2px 0;background:#2b2c30}
.screen{isolation:isolate;transform:translateZ(0)}
.screen div[aria-hidden="true"]{visibility:hidden!important}
.sb{position:absolute;left:0;right:0;top:0;height:46px;z-index:60;display:flex;align-items:center;justify-content:space-between;padding:4px 30px 0 40px;box-sizing:border-box;pointer-events:none}
.sb-t{font-size:15px;font-weight:700;color:#0E0F11;letter-spacing:-.01em}
.sb-i{display:flex;align-items:center;gap:6px}
.ring-breathe{animation:breathe 3.6s ease-in-out infinite}
@keyframes breathe{0%,100%{opacity:1}50%{opacity:.78}}
@keyframes ringgo{to{stroke-dashoffset:var(--c)}}
@media (prefers-reduced-motion:reduce){.ring-breathe{animation:none}}
.frame-wrap{position:relative}
body.demo-stage .phones{position:relative;display:block;margin:0 auto;--s:1}
body.demo-stage .slot{position:absolute;left:0;top:0;transform-origin:0 0;transition:transform 820ms cubic-bezier(.65,0,.35,1),opacity 520ms ease;will-change:transform}
body.demo-stage .slot .cap{display:none}
.illo{position:absolute;left:0;top:0;width:0;height:0;opacity:0;pointer-events:none;border-radius:28px;background:#FBF8F1;box-shadow:0 0 0 1px rgba(27,27,27,.08),0 24px 60px -24px rgba(14,15,17,.3);overflow:hidden;transition:left 820ms cubic-bezier(.65,0,.35,1),top 820ms cubic-bezier(.65,0,.35,1),width 820ms cubic-bezier(.65,0,.35,1),height 820ms cubic-bezier(.65,0,.35,1),opacity 500ms ease}
.illo.on{opacity:1}
.illo svg{display:block;width:100%;height:100%}
.illo .dr{stroke-dasharray:1;stroke-dashoffset:1;animation:dr 900ms ease forwards;animation-delay:var(--d,0s)}
@keyframes dr{to{stroke-dashoffset:0}}
.illo .pp{transform:scale(0);animation:pp 460ms cubic-bezier(.34,1.56,.64,1) forwards;animation-delay:var(--d,0s)}
@keyframes pp{to{transform:scale(1)}}
.illo .fd{opacity:0;animation:fd 500ms ease forwards;animation-delay:var(--d,0s)}
@keyframes fd{to{opacity:1}}
@media (prefers-reduced-motion:reduce){.illo .dr,.illo .pp,.illo .fd{animation:none;stroke-dashoffset:0;transform:none;opacity:1}}

.cam-layer{position:absolute;left:calc(12px * var(--s));top:calc(12px * var(--s));width:calc(360px * var(--s));height:calc(800px * var(--s));border-radius:calc(50px * var(--s));overflow:hidden;z-index:5;transform:translateY(8%);opacity:0;transition:transform 320ms cubic-bezier(.32,.72,0,1),opacity 220ms ease}
.cam-layer.on{transform:none;opacity:1}
.cam-in{position:absolute;left:0;top:0;width:360px;height:800px;transform:scale(var(--s));transform-origin:0 0;font-family:'Pretendard',-apple-system,system-ui,sans-serif}
.cam{position:absolute;inset:0;background:#000;color:#fff;display:flex;flex-direction:column}
.cam-top{height:96px;display:flex;align-items:flex-end;justify-content:space-between;padding:0 26px 12px;font-size:15px;font-weight:700;color:#FFD60A}
.cam-mode{color:#fff;font-size:13px;letter-spacing:.08em}
.cam-view{position:relative;flex:1;background:radial-gradient(ellipse at 50% 40%,#3a342c,#151311 75%);overflow:hidden;display:grid;place-items:center}
.cam-paper{width:236px;transform:rotate(-7deg) scale(1.18);filter:blur(2px) brightness(.92);transition:transform 900ms cubic-bezier(.22,1,.36,1),filter 900ms ease;box-shadow:0 18px 40px rgba(0,0,0,.45)}
.cam.locked .cam-paper{transform:rotate(-2deg) scale(1);filter:none}
.cam-view i{position:absolute;width:30px;height:30px;border:3px solid #FFD60A;opacity:0;transition:opacity 300ms ease 400ms}
.cam.locked .cam-view i{opacity:1}
.cam-view .c1{left:40px;top:60px;border-right:0;border-bottom:0}.cam-view .c2{right:40px;top:60px;border-left:0;border-bottom:0}.cam-view .c3{left:40px;bottom:60px;border-right:0;border-top:0}.cam-view .c4{right:40px;bottom:60px;border-left:0;border-top:0}
.cam-hint{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);font-size:12px;font-weight:700;background:rgba(0,0,0,.55);padding:6px 10px;border-radius:10px;white-space:nowrap}
.cam-bottom{height:170px;display:flex;align-items:center;justify-content:space-between;padding:0 34px 40px}
.cam-thumb{width:44px;height:44px;border-radius:8px;background:#2a2a2c}
.shutter{width:72px;height:72px;border-radius:36px;border:0;background:#fff;box-shadow:0 0 0 4px #000,0 0 0 7px #fff;cursor:pointer}
.cam-cancel{font-size:16px;font-weight:600;width:44px;text-align:right}
.cam-flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
.cam.flash .cam-flash{animation:camflash 300ms ease-out}
@keyframes camflash{0%{opacity:.95}100%{opacity:0}}
.album{position:absolute;inset:0;background:#fff;color:#0E0F11;display:flex;flex-direction:column}
.alb-top{height:100px;display:grid;grid-template-columns:60px 1fr 60px;align-items:end;padding:0 16px 12px;font-size:16px;text-align:center}
.alb-cancel{color:#1F5BFF;text-align:left;font-weight:600}
.alb-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}
.alb-t{display:block;aspect-ratio:1/1;border:0;padding:0;overflow:hidden;background:#eee}
.alb-t img{width:100%;height:100%;object-fit:cover;object-position:top}
.alb-desk{display:grid;place-items:center;width:100%;height:100%;background:linear-gradient(160deg,#8C7A66,#5E5044)}
.alb-desk img{width:78%;height:auto;transform:rotate(-4deg);box-shadow:0 4px 10px rgba(0,0,0,.35)}
.alb-preview.photo img{width:100%;transform:none;box-shadow:none}
.ly-sb{position:absolute;left:0;right:0;top:0;height:46px;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:4px 30px 0 40px;font-size:15px;font-weight:700;color:#0E0F11;pointer-events:none}
.ly-sb.dark{color:#FFFFFF}
.ly-sb span:last-child{font-size:10px;letter-spacing:1px}
.ly-island{position:absolute;top:11px;left:50%;transform:translateX(-50%);width:112px;height:33px;border-radius:17px;background:#000;z-index:21;pointer-events:none}
.cam-in:has(.br) .ly-sb span:first-child{visibility:hidden}
.br-back{top:15px!important;left:26px!important;z-index:25!important}
.br{position:absolute;inset:0;background:#F2F2F7;transform:scale(.94);opacity:.4;transition:transform 380ms cubic-bezier(.32,.72,0,1),opacity 260ms ease;display:flex;flex-direction:column}
.cam-layer.on .br{transform:none;opacity:1}
.br-back{position:absolute;top:16px;left:30px;z-index:3;font-size:12px;font-weight:700;color:#1F5BFF;cursor:pointer;padding:4px 6px}
.br-page{flex:1;margin-top:52px;background:#fff;position:relative;overflow:hidden}
.br-progress{position:absolute;left:0;top:0;height:3px;width:0;background:#1F5BFF;transition:width 700ms ease}
.br.loaded .br-progress{width:100%;opacity:0;transition:width 1200ms ease,opacity 300ms ease 1200ms}
.br-body{padding:22px 20px;display:flex;flex-direction:column;gap:12px;opacity:0;transform:translateY(8px);transition:opacity 350ms ease 450ms,transform 350ms ease 450ms;color:#1B1C1F}
.br.loaded .br-body{opacity:1;transform:none}
.br-kick{font-size:12px;font-weight:700;color:#6B7280}
.br-body h3{margin:0;font-size:20px;line-height:1.3}
.br-steps{display:flex;gap:6px;font-size:11px}.br-steps b,.br-steps span{padding:5px 9px;border-radius:12px;background:#EEF0F3;color:#6B7280}.br-steps b{background:#1B1C1F;color:#fff}
.bf{display:flex;flex-direction:column;gap:4px;padding:10px 12px;border-radius:10px;border:1px solid #DADDE3;position:relative}
.bf span{font-size:11px;color:#6B7280;font-weight:700}.bf b{font-size:14px}
.bf i{position:absolute;right:10px;top:10px;font-style:normal;font-size:10px;font-weight:800;color:#1F5BFF;background:rgba(31,91,255,.1);padding:2px 6px;border-radius:6px}
.bf em{position:absolute;right:10px;top:16px;font-style:normal;font-size:11px;font-weight:700;color:#1B1C1F;border:1px solid #DADDE3;border-radius:6px;padding:3px 8px}
.br-btn{margin-top:4px;height:46px;border-radius:10px;background:#1B1C1F;color:#fff;display:grid;place-items:center;font-weight:800;font-size:15px}
.br-bar{height:50px;margin:8px 12px 0;border-radius:14px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.08);display:flex;align-items:center;justify-content:space-between;padding:0 14px;font-size:13px}
.br-url{display:flex;align-items:center;gap:5px;font-weight:600}
.br-aa{color:#575A62;font-size:12px}
.br-tools{height:78px;display:flex;justify-content:space-around;align-items:flex-start;padding-top:12px;font-size:20px;color:#1F5BFF}
.alb-t.pick{outline:3px solid #1F5BFF;outline-offset:-3px}
.alb-done{color:#1F5BFF;font-weight:800;text-align:right;cursor:pointer}
.alb-preview{flex:1;display:grid;place-items:center;background:linear-gradient(160deg,#8C7A66,#5E5044)}
.alb-preview img{width:76%;transform:rotate(-3deg);box-shadow:0 18px 40px rgba(0,0,0,.4)}
.island{position:absolute;top:11px;left:50%;transform:translateX(-50%);width:112px;height:33px;border-radius:17px;background:#000;z-index:61;pointer-events:none}
.homebar{position:absolute;left:50%;bottom:7px;transform:translateX(-50%);width:128px;height:5px;border-radius:3px;background:#0E0F11;opacity:.85;z-index:61;pointer-events:none}
.cap{font:600 13px/1.3 'Pretendard',-apple-system,system-ui,sans-serif;color:var(--cap);letter-spacing:-.01em}
.cap b{font-weight:800}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
#f3ask{font-family:inherit}
.demo-bar{width:min(100%,840px);box-sizing:border-box}
.demo-bar.idle{display:flex;justify-content:center}
.q .demo-start{height:44px;padding:0 20px;border-radius:22px;border:0;cursor:pointer;background:#0E0F11;color:#FFFFFF;font:800 15px/1 'Pretendard',-apple-system,system-ui,sans-serif;display:inline-flex;align-items:center;gap:9px;box-shadow:0 8px 20px rgba(14,15,17,.18)}
.q .demo-start .dot{width:8px;height:8px;border-radius:4px;background:#1F5BFF}
.demo-bar.on{position:sticky;top:calc(8px + env(safe-area-inset-top,0px));z-index:30;background:rgba(255,255,255,.94);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-radius:20px;padding:12px 16px;box-shadow:0 0 0 1px rgba(14,15,17,.06),0 10px 30px rgba(14,15,17,.12);color:#0E0F11;font-family:'Pretendard',-apple-system,system-ui,sans-serif}
.demo-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.demo-day{font-size:15px;font-weight:800;white-space:nowrap}
.demo-steps{display:flex;gap:4px;flex:1;min-width:110px}
.demo-steps i{flex:1;height:4px;border-radius:2px;background:#E4E4E7}
.demo-steps i.d{background:#0E0F11}
.demo-steps i.c{background:#1F5BFF}
.demo-ctl{display:flex;gap:6px}
.demo-ctl button{height:32px;padding:0 12px;border-radius:16px;border:0;cursor:pointer;background:#F4F4F5;color:#0E0F11;font:700 13px/1 'Pretendard',-apple-system,system-ui,sans-serif}
.demo-ctl button:focus-visible,.demo-start:focus-visible{outline:2px solid #1F5BFF;outline-offset:2px}
.demo-cap{margin:8px 0 0 0;font-size:15px;line-height:1.5;font-weight:600;color:#2B2D31;text-wrap:balance}
.tapfx{position:absolute;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:rgba(31,91,255,.35);box-shadow:0 0 0 2px rgba(31,91,255,.5);pointer-events:none;z-index:100;animation:tapfx .7s ease-out forwards}
@keyframes tapfx{0%{transform:scale(.45);opacity:1}100%{transform:scale(1.6);opacity:0}}
@media (prefers-reduced-motion:reduce){.tapfx{animation:none;opacity:.6}}
'''
logic = open(D + 'apps/logic.js').read(); runtime = open(D + 'apps/runtime.js').read()
html = ('<title>Fevio 환자 앱</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&display=swap">\n<style>' + css + page_css + '</style>\n'
        '<main class="stage q"><div class="demo-bar idle" id="demo-bar"></div><div class="phones">'
        '<section class="slot" data-who="pt" aria-label="환자 아이폰"><div class="frame-wrap"><div class="frame" id="ph-patient"></div><div class="cam-layer" id="cam-layer" hidden></div></div><span class="cap" id="cap-patient"><b>환자</b></span></section>'
        '<section class="slot" data-who="pr" aria-label="배우자 아이폰"><div class="frame" id="ph-partner"></div><span class="cap" id="cap-partner"><b>배우자</b> · 같은 앱, 공유받은 것만</span></section>'
        '<div class="illo" id="illo" aria-live="polite"></div></div></main>\n'
        '<input id="file-camera" class="sr" type="file" accept="image/*" capture="environment" aria-label="사진 찍기">'
        '<input id="file-album" class="sr" type="file" accept="image/*" aria-label="앨범에서 고르기">'
        '<input id="file-post" class="sr" type="file" accept="image/*" multiple aria-label="글에 넣을 사진">\n'
        '<script src="https://cdn.jsdelivr.net/npm/morphdom@2.7.4/dist/morphdom-umd.min.js"></script>\n'
        '<script>\n' + logic + '\nvar TPL_PATIENT = ' + json.dumps(pat, ensure_ascii=False) + ';\nvar TPL_PARTNER = ' + json.dumps(par, ensure_ascii=False) + ';\n' + runtime + '\n' + open(D + 'apps/stage.js').read() + '\n' + open(D + 'apps/demo.js').read() + '\n</script>\n')
open(D + 'apps/fevio-app.html', 'w').write(html)
print('bytes', len(html.encode()))
