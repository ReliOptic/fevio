/* ===== Clinic reel: why an IVF center is better off when its patients use Fevio, read as supply-chain operations ===== */
// Figures come from published sources named on screen. Console numbers are marked as examples.
var SERIF = "'Noto Serif KR', 'Nanum Myeongjo', 'Apple SD Gothic Neo', serif", GOLD = '#A8875A', CORAL = '#C4473A', MUTE = '#6B6458';
function ST(x, y, s, size, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" font-family="' + SERIF + '" font-size="' + (size || 24) + '" font-weight="' + (o.w || 500) + '" fill="' + (o.fill || INKC) + '" text-anchor="' + (o.anchor || 'start') + '"' + (o.ls ? ' letter-spacing="' + o.ls + '"' : '') + '>' + escH(s) + '</text>'; }
function src(text, t) { return F(L('M40 516 h60', t, { stroke: GOLD, w: 1.4 }) + ST(40, 540, text, 15, { fill: MUTE, w: 400 }), t + 0.2); }
function head(text, t) { return F(ST(40, 62, text, 30, { w: 700 }), t) + L('M40 80 h80', t + 0.2, { stroke: GOLD, w: 2 }); }
function box(x, y, w, h, t, o) { o = o || {}; return L('M' + (x + 10) + ' ' + y + ' h' + (w - 20) + ' q10 0 10 10 v' + (h - 20) + ' q0 10 -10 10 h' + (-(w - 20)) + ' q-10 0 -10 -10 v' + (-(h - 20)) + ' q0 -10 10 -10 Z', t, { fill: o.fill || '#FFFFFF', stroke: o.stroke || INKC, w: o.sw || 2.4 }); }
function bar(x, base, w, h, t, color) { return '<rect class="grow" style="--d:' + t + 's;transform-origin:' + x + 'px ' + base + 'px" x="' + x + '" y="' + (base - h) + '" width="' + w + '" height="' + h + '" rx="4" fill="' + color + '"/>'; }
function hbar(x, y, w, h, t, color) { return '<rect class="growx" style="--d:' + t + 's;transform-origin:' + x + 'px ' + y + 'px" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="' + color + '"/>'; }
function dot(x, y, r, color, t) { return POP('<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + color + '"/>', t, x, y); }
function mini(x, y, color, t) { return F('<circle cx="' + x + '" cy="' + (y - 26) + '" r="9" fill="none" stroke="' + color + '" stroke-width="2.4"/><path d="M' + (x - 14) + ' ' + y + ' q0 -14 14 -14 q14 0 14 14" fill="none" stroke="' + color + '" stroke-width="2.4" stroke-linecap="round"/>', t); }
function titleCard(eyebrow, title, sub) {
  return svgWrap(F(ST(400, 214, eyebrow, 16, { anchor: 'middle', fill: GOLD, w: 600, ls: 6 }), 0.1)
    + L('M300 238 h200', 0.3, { stroke: GOLD, w: 1.4 }) + F(ST(400, 300, title, 44, { anchor: 'middle', w: 700 }), 0.5)
    + L('M370 330 h60', 0.8, { stroke: GOLD, w: 1.4 }) + F(ST(400, 372, sub, 20, { anchor: 'middle', fill: MUTE, w: 400 }), 1.0), title);
}

Object.assign(ILLOS, {
  titlePatient: () => titleCard('F E V I O', '환자의 하루', '안내문 한 장이 둘의 일정이 되기까지'),
  titleClinic: () => titleCard('F E V I O', '병원 편', '환자가 Fevio를 쓰면 센터의 흐름은 어떻게 달라질까'),
  cDemand: () => svgWrap(head('수요는 늘고, 사람은 그대로', 0.1)
    + L('M120 440 h300', 0.3, { w: 2 }) + bar(160, 440, 80, 180, 0.6, '#D9D2C5') + bar(300, 440, 80, 250, 0.9, INKC)
    + F(ST(200, 470, '2019', 20, { anchor: 'middle', fill: MUTE }) + ST(340, 470, '2023', 20, { anchor: 'middle', w: 700 }), 0.7)
    + F(ST(340, 170, '20만 3천 건', 24, { anchor: 'middle', w: 700 }), 1.3) + F(ST(270, 140, '+38.9%', 30, { anchor: 'middle', w: 700, fill: ACC }), 1.6)
    + person(600, 440, 0.5, { hair: 'long', pose: 'paper' }) + F(L('M540 250 l40 -6 l4 40 l-40 6 Z M650 220 l40 6 l-4 40 l-40 -6 Z M610 190 l36 -10 l8 36 l-36 10 Z', 1.2, { fill: '#FFFFFF' }), 1.2)
    + src('난임 시술 건수 · 건강보험심사평가원 자료 (메디칼타임즈 보도)', 1.8), '난임 시술 건수 증가'),
  cFlow: () => {
    var st = ['과배란', '트리거', '채취', '수정·배양', '이식', '판정'], s = head('한 주기는 단계를 넘겨받는 흐름', 0.1);
    st.forEach((n, i) => { var x = 40 + i * 124; s += box(x, 170, 106, 64, 0.3 + i * 0.15, { fill: i === 2 || i === 3 ? '#FFF4F1' : '#FFFFFF', stroke: i === 2 || i === 3 ? CORAL : INKC }) + F(ST(x + 53, 210, n, 21, { anchor: 'middle', w: 700 }), 0.5 + i * 0.15); if (i < 5) s += L('M' + (x + 108) + ' 202 h14', 0.6 + i * 0.15, { w: 2 }); });
    s += F(ST(102, 290, '초음파실', 18, { anchor: 'middle', fill: MUTE }) + ST(350, 290, '시술실', 18, { anchor: 'middle', fill: CORAL, w: 700 }) + ST(474, 290, '배양실', 18, { anchor: 'middle', fill: CORAL, w: 700 }), 1.4);
    s += L('M226 166 C 250 128, 316 128, 340 166', 1.6, { stroke: ACC, w: 2.4 }) + F(ST(283, 120, '트리거 뒤 약 36시간 안에 채취', 19, { anchor: 'middle', fill: ACC, w: 700 }), 1.9);
    s += F(ST(412, 410, '병목 · 난자와 배아는 기다릴 수 없어요', 22, { anchor: 'middle', fill: CORAL, w: 700 }), 2.3) + L('M300 424 h224', 2.4, { stroke: CORAL, w: 2 });
    return svgWrap(s, '시험관 주기 흐름과 병목');
  },
  cWeekend: () => svgWrap(head('채취 날은 늦게 정해지고, 주말에 몰려요', 0.1)
    + calendar(70, 150, 0.3, false) + F(ST(155, 330, '난포 반응을 보고 정함', 18, { anchor: 'middle', fill: MUTE }), 0.9)
    + L('M90 210 q20 -30 40 0 M150 230 q20 -30 40 0', 1.0, { stroke: CORAL, w: 2.4 }) + F(ST(155, 140, '? ?', 26, { anchor: 'middle', fill: CORAL, w: 700 }), 1.1)
    + L('M400 440 h330', 0.4, { w: 2 }) + bar(450, 440, 90, 120, 0.8, '#D9D2C5') + bar(600, 440, 90, 284, 1.1, CORAL)
    + F(ST(495, 470, '평일', 20, { anchor: 'middle', fill: MUTE }) + ST(645, 470, '주말·공휴일', 20, { anchor: 'middle', w: 700 }), 0.9)
    + F(ST(495, 305, '0.51', 26, { anchor: 'middle', w: 700 }) + ST(645, 140, '1.21', 26, { anchor: 'middle', w: 700, fill: CORAL }), 1.5)
    + F(ST(565, 110, '배양사 1명이 하루에 맡는 채취', 18, { anchor: 'middle', fill: MUTE }), 1.6)
    + src('한 미국 센터 · J Assist Reprod Genet 2023', 1.8), '평일과 주말 채취 부하'),
  cBullwhip: () => svgWrap(head('작은 오해가 큰 흔들림이 돼요', 0.1)
    + person(130, 430, 0.2, { hair: 'long', pose: 'phone', cap: true })
    + F(ST(130, 470, '코디네이터', 18, { anchor: 'middle', fill: MUTE }), 0.6)
    + [0, 1, 2, 3, 4].map((i) => POP(ST(200 + (i % 3) * 30, 230 + Math.floor(i / 3) * 40 - i * 4, '☎', 26, { fill: CORAL }), 0.8 + i * 0.12, 210 + (i % 3) * 30, 220)).join('')
    + L('M300 330 C 330 318, 350 342, 380 330 C 410 310, 440 350, 480 330 C 520 290, 560 370, 600 330 C 640 260, 700 400, 760 330', 1.2, { stroke: CORAL, w: 3.2 })
    + F(ST(320, 390, '안내', 18, { anchor: 'middle' }) + ST(450, 400, '되묻는 전화', 18, { anchor: 'middle' }) + ST(590, 410, '일정 재조정', 18, { anchor: 'middle' }) + ST(720, 430, '시술실·배양실', 18, { anchor: 'middle', w: 700, fill: CORAL }), 1.8)
    + F(ST(530, 200, '공급망의 채찍 효과', 26, { anchor: 'middle', w: 700 }), 2.2), '정보 지연과 채찍 효과'),
  cLoad: () => {
    var s = head('현장에서 생기는 일', 0.1);
    for (var i = 0; i < 4; i++) s += mini(90 + i * 56, 230, i === 3 ? CORAL : INKC, 0.3 + i * 0.12);
    s += F(ST(60, 300, '약 4명 중 1명', 34, { w: 700, fill: CORAL }), 0.9) + F(ST(60, 340, '첫 주기 환자 중 채취 날까지 주사 일정이나', 18, { fill: INKC, w: 400 }) + ST(60, 366, '용량을 지키지 못했거나 확신하지 못했어요', 18, { fill: INKC, w: 400 }), 1.1);
    s += L('M410 150 v300', 0.5, { stroke: GOLD, w: 1.2 });
    s += ring(560, 230, 54, 0.616, '61.6%', 1.0) + F(ST(450, 330, '난임 의료진이 꼽은 스트레스 1위', 18, { w: 400 }) + ST(450, 356, '시간과 업무량', 26, { w: 700 }), 1.4);
    s += src('Barrière 외, RBMS Online 2019 · Boivin 외, Human Reproduction 2017', 1.8);
    return svgWrap(s, '환자 투약 혼동과 의료진 업무량');
  },
  cSource: () => svgWrap(head('기록은 한 장, 보는 곳은 셋', 0.1)
    + box(60, 150, 150, 96, 0.3) + F(ST(135, 192, '안내문 사진', 20, { anchor: 'middle', w: 700 }) + ST(135, 222, '환자가 찍어요', 16, { anchor: 'middle', fill: MUTE }), 0.5)
    + L('M214 198 h46', 0.7, { stroke: ACC, w: 2.4 }) + box(264, 150, 170, 96, 0.8, { stroke: ACC }) + F(ST(349, 192, '환자가 확인', 20, { anchor: 'middle', w: 700, fill: ACC }) + ST(349, 222, '날짜 · 시간 · 담당', 16, { anchor: 'middle', fill: MUTE }), 1.0)
    + L('M349 250 v50', 1.2, { stroke: ACC, w: 2.4 }) + box(214, 304, 270, 70, 1.3, { fill: ACCS, stroke: ACC }) + F(ST(349, 346, '확인된 일정 카드', 22, { anchor: 'middle', w: 700 }), 1.5)
    + L('M260 378 l-60 60 M349 378 v60 M440 378 l60 60', 1.7, { w: 2 })
    + F(ST(190, 466, '환자', 20, { anchor: 'middle', w: 700 }) + ST(349, 466, '배우자', 20, { anchor: 'middle', w: 700 }) + ST(510, 466, '병원 콘솔', 20, { anchor: 'middle', w: 700, fill: ACC }), 1.9)
    + F(ST(349, 500, 'Fevio는 판단하지 않고, 병원이 정한 내용만 정리해요', 16, { anchor: 'middle', fill: MUTE }), 2.2), '한 장의 기록'),
  cOnTime: () => svgWrap(head('정시에, 기록과 함께', 0.1)
    + ring(170, 240, 70, 0.22, '21:00', 0.3) + F(ST(170, 350, '1시간 전부터 차분한 카운트다운', 18, { anchor: 'middle', fill: MUTE }), 0.8)
    + L('M330 240 h300', 0.9, { w: 2 }) + [0, 1, 2, 3, 4].map((i) => dot(350 + i * 64, 240, 12, i < 4 ? INKC : ACC, 1.0 + i * 0.15) + F(ST(350 + i * 64, 280, (i + 1) + '일', 16, { anchor: 'middle', fill: MUTE }), 1.0 + i * 0.15)).join('')
    + F(ST(480, 200, '맞았어요 → 기록', 22, { anchor: 'middle', w: 700 }), 1.8)
    + box(330, 330, 300, 80, 2.0, { stroke: GOLD }) + F(ST(480, 366, '트리거 정각을 놓칠 위험을', 18, { anchor: 'middle' }) + ST(480, 392, '환자 쪽에서 먼저 줄여요', 18, { anchor: 'middle', w: 700 }), 2.2), '정시 투약 기록'),
  cExceptions: () => {
    var s = head('모두가 아니라, 예외만', 0.1) + box(40, 110, 470, 330, 0.2, { stroke: '#CFC6B5' }) + F(ST(64, 148, '오늘 계획 · 보냄 24명', 20, { w: 700 }) + ST(486, 148, '16:00 마감', 16, { anchor: 'end', fill: MUTE }), 0.4);
    for (var i = 0; i < 24; i++) { var c = i === 5 || i === 13 || i === 20 ? CORAL : ACC; s += dot(80 + (i % 8) * 54, 190 + Math.floor(i / 8) * 52, 13, c, 0.6 + i * 0.04); }
    s += F(ST(64, 380, '확인 21', 22, { w: 700, fill: ACC }) + ST(200, 380, '전화할 사람 3', 22, { w: 700, fill: CORAL }), 1.8) + F(ST(64, 418, '예시 수치', 14, { fill: MUTE }), 1.9);
    s += box(540, 110, 220, 90, 1.2) + F(ST(560, 146, '일정 변경 요청', 20, { w: 700 }) + ST(560, 176, '양식으로 들어와요', 16, { fill: MUTE }), 1.4);
    s += box(540, 220, 220, 90, 1.5, { stroke: CORAL }) + F(ST(560, 256, '몸이 불편해요', 20, { w: 700, fill: CORAL }) + ST(560, 286, '119 · 병원 번호로 바로', 16, { fill: MUTE }), 1.7);
    s += box(540, 330, 220, 90, 1.8, { stroke: GOLD }) + F(ST(560, 366, '나머지는 조용히', 20, { w: 700 }) + ST(560, 396, '확인된 카드로 흘러가요', 16, { fill: MUTE }), 2.0);
    return svgWrap(s, '예외 관리 콘솔');
  },
  cForecast: () => {
    var s = head('며칠 뒤 부하가 미리 보여요', 0.1), d = ['수', '목', '금', '토', '일'], v = [3, 4, 6, 9, 5];
    s += L('M80 440 h440', 0.3, { w: 2 }) + L('M80 300 h440', 0.4, { stroke: GOLD, w: 2, dash: 1 }) + F(ST(524, 296, '평소 인력', 16, { fill: GOLD, w: 600 }), 0.6);
    d.forEach((n, i) => { s += bar(100 + i * 84, 440, 56, v[i] * 22, 0.6 + i * 0.15, i === 3 ? CORAL : INKC) + F(ST(128 + i * 84, 470, n, 20, { anchor: 'middle', fill: i === 3 ? CORAL : MUTE, w: i === 3 ? 700 : 500 }), 0.6 + i * 0.15); });
    s += F(ST(128 + 3 * 84, 220, '토요일', 20, { anchor: 'middle', w: 700, fill: CORAL }), 1.6);
    s += box(560, 150, 210, 200, 1.4, { stroke: ACC }) + F(ST(580, 190, '과배란 며칠째인지', 18, { w: 700 }) + ST(580, 216, '환자 수로 2~3일 뒤', 18) + ST(580, 242, '채취·배양 부하를', 18) + ST(580, 268, '가늠해요', 18) + ST(580, 316, '→ 주말 인력 미리', 18, { w: 700, fill: ACC }), 1.7);
    s += F(ST(80, 510, '예시 수치 · 확정은 늘 의료진이 해요', 15, { fill: MUTE }), 2.0);
    return svgWrap(s, '단기 부하 예측');
  },
  cYield: () => {
    var s = head('그만두는 이유, 줄일 수 있는 몫', 0.1), r = [['미룸', 39, 0], ['신체·심리 부담', 19, 1], ['관계·개인 사정', 17, 0], ['조직 문제', 12, 1], ['병원 문제', 8, 1]];
    r.forEach((x, i) => { var y = 140 + i * 62; s += F(ST(40, y + 24, x[0], 19, { w: x[2] ? 700 : 500, fill: x[2] ? INKC : MUTE }), 0.4 + i * 0.15) + hbar(200, y + 4, x[1] * 7.2, 28, 0.5 + i * 0.15, x[2] ? ACC : '#D9D2C5') + F(ST(212 + x[1] * 7.2, y + 26, x[1] + '%', 18, { w: 700 }), 0.9 + i * 0.15); });
    s += F(ST(40, 470, '파란 막대는 안내가 분명하고 둘이 같은 화면을 볼 때 덜 수 있는 몫이에요', 17, { fill: INKC }), 1.8);
    s += src('치료 중단 이유 · Gameiro 외, Human Reproduction Update 2012 (22개 연구)', 2.0);
    return svgWrap(s, '치료 중단 이유');
  },
  cMatch: () => {
    var s = head('한 번의 행동, 양쪽의 불편', 0.1), rows = [
      ['안내를 다시 찾고 묻기', '안내문 사진 → 확인 카드', '되묻는 전화'],
      ['주사 시간 걱정', '카운트다운 · 맞았어요', '투약 확인 전화'],
      ['보호자에게 따로 설명', '배우자 공유 화면', '보호자 응대'],
      ['바꾸려면 전화 대기', '예약하기 요청 양식', '변경 응대 · 재조정'],
      ['몸이 불편할 때 막막함', '119 · 병원 바로 전화', '급한 연락 누락']];
    s += F(ST(150, 116, '환자의 불편', 17, { anchor: 'middle', fill: CORAL, w: 700 }) + ST(400, 116, 'Fevio에서 한 번', 17, { anchor: 'middle', fill: ACC, w: 700 }) + ST(650, 116, '병원의 불편', 17, { anchor: 'middle', fill: CORAL, w: 700 }), 0.3);
    rows.forEach((r, i) => { var y = 132 + i * 72, t = 0.5 + i * 0.35;
      s += box(40, y, 220, 52, t, { stroke: '#D9CFBE' }) + F(ST(150, y + 33, r[0], 17, { anchor: 'middle', fill: MUTE }), t + 0.1)
        + L('M262 ' + (y + 26) + ' h36', t + 0.2, { stroke: ACC, w: 2 })
        + box(300, y, 200, 52, t + 0.25, { fill: ACCS, stroke: ACC }) + F(ST(400, y + 33, r[1], 17, { anchor: 'middle', w: 700 }), t + 0.35)
        + L('M502 ' + (y + 26) + ' h36', t + 0.45, { stroke: ACC, w: 2 })
        + box(540, y, 220, 52, t + 0.5, { stroke: '#D9CFBE' }) + F(ST(650, y + 33, r[2], 17, { anchor: 'middle', fill: MUTE }), t + 0.6)
        + F('<path d="M48 ' + (y + 27) + ' h204 M548 ' + (y + 27) + ' h204" stroke="' + CORAL + '" stroke-width="2" opacity=".55"/>', t + 0.9); });
    return svgWrap(s, '환자와 병원의 불편이 함께 줄어드는 지점');
  },
  cBusiness: () => {
    var s = head('흐름이 고르면, 센터가 좋아져요', 0.1), rows = [['확인 전화', '예외 전화만'], ['주말 몰림', '미리 보이는 부하'], ['지쳐서 중단', '이어지는 주기']];
    rows.forEach((x, i) => { var y = 150 + i * 90; s += box(40, y, 200, 62, 0.3 + i * 0.3, { stroke: '#CFC6B5' }) + F(ST(140, y + 38, x[0], 20, { anchor: 'middle', fill: MUTE }), 0.5 + i * 0.3) + arrow('M250 ' + (y + 31) + ' h70', 0.6 + i * 0.3, { acc: true, head: 'M312 ' + (y + 23) + ' l10 8 l-10 8' }) + box(330, y, 210, 62, 0.8 + i * 0.3, { stroke: ACC }) + F(ST(435, y + 38, x[1], 20, { anchor: 'middle', w: 700 }), 1.0 + i * 0.3); });
    s += L('M560 180 C 600 180, 610 290, 640 290 M560 270 h80 M560 360 C 600 360, 610 290, 640 290', 1.8, { stroke: GOLD, w: 2 });
    s += box(644, 210, 140, 160, 2.0, { fill: '#FBF5E9', stroke: GOLD }) + F(ST(714, 252, '같은 인력', 18, { anchor: 'middle', w: 700 }) + ST(714, 280, '같은 시술실로', 18, { anchor: 'middle' }) + ST(714, 316, '더 많은 주기', 20, { anchor: 'middle', w: 700, fill: ACC }) + ST(714, 346, '재방문 · 소개', 16, { anchor: 'middle', fill: MUTE }), 2.2);
    return svgWrap(s, '운영과 비즈니스 효과');
  },
  cSources: () => {
    var s = head('참고 자료', 0.1), l = [
      '건강보험심사평가원 난임 시술 통계 (메디칼타임즈 보도)',
      'J Assist Reprod Genet 2023 · 주말 채취와 배양실 부하',
      'Barrière 외, Reprod Biomed Soc Online 2019 · 첫 주기 투약 순응',
      'Boivin 외, Human Reproduction 2017 · ESHRE 회원 직무 스트레스',
      'Gameiro 외, Human Reproduction Update 2012 · 치료 중단 이유',
      'Dancet 외, Human Reproduction Update 2010 · 환자가 바라는 난임 진료'];
    l.forEach((x, i) => { s += F(ST(40, 140 + i * 50, (i + 1) + '.', 18, { fill: GOLD, w: 700 }) + ST(70, 140 + i * 50, x, 18), 0.3 + i * 0.15); });
    s += F(ST(40, 470, '콘솔 화면의 수치는 이해를 돕는 예시예요. Fevio는 의학적 판단을 하지 않아요.', 16, { fill: MUTE }), 1.4);
    return svgWrap(s, '참고 자료');
  }
});

function seedClinicReel() {
  var now = nowMs();
  put('settings/main', { accepted: true, acceptedAt: now, stage: 1, stageAt: dayStr(1), share: 2, lab: false, adPers: true, clinic: '서울OO난임센터', phone: '02-1234-5678', updatedAt: now }, true);
  put('rules/r1', { title: '주사', detail: '고나엘에프 150 · 메노푸어 75', time: '21:00', from: dayStr(1), to: '', createdAt: now });
  put('items/i1', { kind: 'visit', date: dayStr(3), time: '08:00', title: '피검사 · 채혈실', detail: '', createdAt: now + 1 });
  put('items/i2', { kind: 'visit', date: dayStr(5), time: '08:30', title: '초음파·피검사', detail: '', createdAt: now + 2 });
  app.render(); app.reanchor(true);
}

var CLINIC_SCENES = [
  { t: '표지', run: async () => {
    caption('병원 편', ''); seedClinicReel(); setClock(3, '09:00');
    await stage('illo', 'titleClinic'); await wait(3400);
  } },
  { t: '늘어나는 수요', run: async () => {
    caption('병원 편 · 수요', '난임 시술은 2023년 20만 3천 건으로, 2019년보다 39% 늘었어요. 같은 인력으로 더 많은 주기를 돌려야 해요.');
    await stage('illo', 'cDemand'); await wait(7000);
  } },
  { t: '흐름과 병목', run: async () => {
    caption('병원 편 · 흐름', '한 주기는 단계마다 넘겨받는 생산 흐름이에요. 시술실과 배양실이 병목이고, 난자와 배아는 기다릴 수 없어요.');
    await stage('illo', 'cFlow'); await wait(7600);
  } },
  { t: '변동성', run: async () => {
    caption('병원 편 · 변동성', '채취 날은 난포 반응을 보고 정해서 미리 알기 어려워요. 한 센터에서는 주말 채취 부담이 평일의 두 배를 넘었어요.');
    await stage('illo', 'cWeekend'); await wait(7600);
  } },
  { t: '정보 지연', run: async () => {
    caption('병원 편 · 정보 지연', '진료 뒤 안내가 전화와 문자로 흩어지면, 작은 오해가 되묻는 전화와 일정 재조정으로 커져요. 공급망의 채찍 효과예요.');
    await stage('illo', 'cBullwhip'); await wait(7600);
  } },
  { t: '현장의 부담', run: async () => {
    caption('병원 편 · 현장', '환자는 용량과 시간을 헷갈리고, 의료진은 같은 확인에 시간을 써요.');
    await stage('illo', 'cLoad'); await wait(7600);
  } },
  { t: '한 장의 기록', run: async () => {
    setClock(3, '11:30'); app.render(); await stage('illo-phone', 'cSource'); await toToday();
    caption('병원 편 · Fevio', '환자가 안내문을 찍고 날짜와 시간을 직접 확인해요. 그 카드 하나를 환자, 배우자, 병원이 같이 봐요.'); await wait(3600);
    app.receivePlan('다음 내원: ' + mmdd(5) + ' 08:30 초음파·피검사\n주사: 변경 없음 · 매일 21:00');
    caption('병원 편 · Fevio', '진료 뒤 계획은 카드로 한 번에 가요. 환자가 확인을 누르면 병원 콘솔에 바로 표시돼요.'); await wait(2400);
    await tap(PT(), null, '확인했어요'); await wait(1800);
  } },
  { t: '정시 투약', run: async () => {
    setClock(3, '20:56'); app.render(); await stage('illo-phone', 'cOnTime');
    caption('병원 편 · 정시', '주사와 트리거 시각이 다가오면 차분한 카운트다운이 뜨고, 맞은 뒤 한 번 눌러 기록해요.'); await wait(3200);
    await tap(PT(), null, '맞았어요'); app.reanchor(true); await wait(2200);
  } },
  { t: '예외 관리', run: async () => {
    caption('병원 편 · 예외', '마감까지 확인하지 않은 사람, 일정 변경 요청, 몸이 불편하다는 알림만 올라와요. 모두에게 전화하지 않고 예외만 다뤄요.');
    await stage('illo', 'cExceptions'); await wait(8000);
  } },
  { t: '부하 예측', run: async () => {
    caption('병원 편 · 예측', '과배란 며칠째인 환자가 몇 명인지 보이면, 2~3일 뒤 채취와 배양 부하를 가늠해 주말 인력을 미리 정할 수 있어요.');
    await stage('illo', 'cForecast'); await wait(8000);
  } },
  { t: '수율', run: async () => {
    caption('병원 편 · 수율', '치료를 그만두는 이유 중 부담과 조직·병원 문제가 39%예요. 둘이 같은 화면을 보고 안내가 분명하면 이 몫을 덜 수 있어요.');
    await stage('illo', 'cYield'); await wait(8000);
  } },
  { t: '양쪽의 불편', run: async () => {
    caption('병원 편 · 플랫폼', '환자가 한 번 누르는 행동이 병원의 전화 한 통, 확인 한 번을 같이 지워요. 한쪽만 편해지는 게 아니에요.');
    await stage('illo', 'cMatch'); await wait(9000);
  } },
  { t: '센터의 이익', run: async () => {
    caption('병원 편 · 결과', '확인 업무가 줄고 부하가 미리 보이면, 같은 인력과 시술실로 더 많은 주기를 차분하게 돌릴 수 있어요.');
    await stage('illo', 'cBusiness'); await wait(8000);
  } },
  { t: '참고 자료', run: async () => {
    caption('병원 편 · 참고 자료', '숫자는 공개된 연구와 자료에서 가져왔어요. 콘솔 수치는 예시예요.');
    await stage('illo', 'cSources'); await wait(6000);
  } }
];
