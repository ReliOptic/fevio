/* ===== Film score: a quiet, original score made in the browser and driven by the film itself =====
   Each scene sets a mood (chords, how busy the plucked line is). Chords change on the bar after a scene starts,
   and a tap on the phone answers with one soft note on the next beat. No recording is played. */
var SCORE = { ctx: null, out: null, verb: null, timer: null, on: true, playing: false, bpm: 84, step: 0, next: 0, mood: 'title', want: 'title', ci: 0, accents: 0 };
var MOODS = {
  //        chords as MIDI notes (low to high)                                   pluck density per 8th (8 steps), shaker, bars per chord
  title: { chords: [[45, 57, 64, 67, 71]], mask: [0, 0, 0, 0, 0, 0, 0, 0], shake: 0, bars: 4 },
  open:  { chords: [[45, 57, 60, 64, 67], [41, 53, 57, 60, 64], [38, 50, 57, 60, 65], [40, 52, 55, 59, 62]], mask: [1, 0, 0, 1, 0, 0, 1, 0], shake: 0, bars: 2 },
  calm:  { chords: [[48, 55, 64, 67, 71], [45, 57, 60, 64, 67], [41, 53, 57, 60, 64], [43, 55, 59, 62, 69]], mask: [1, 0, 1, 1, 0, 1, 1, 0], shake: 1, bars: 2 },
  lift:  { chords: [[41, 53, 57, 60, 64], [43, 55, 59, 62, 67], [40, 52, 55, 59, 64], [45, 57, 60, 64, 69]], mask: [1, 1, 1, 1, 1, 1, 1, 1], shake: 1, bars: 2 },
  night: { chords: [[38, 50, 57, 60, 65], [43, 50, 55, 59, 62]], mask: [1, 0, 0, 0, 1, 0, 0, 0], shake: 0, bars: 2 },
  quiet: { chords: [[38, 50, 57, 64, 65]], mask: [0, 0, 0, 0, 0, 0, 0, 0], shake: 0, bars: 4 },
  end:   { chords: [[41, 53, 57, 60, 64], [43, 55, 59, 62, 67], [48, 55, 64, 67, 72]], mask: [1, 0, 1, 0, 1, 0, 0, 0], shake: 0, bars: 2, hold: true }
};
var ARP = [1, 3, 2, 4, 3, 2, 4, 3];
var hz = (n) => 440 * Math.pow(2, (n - 69) / 12);
function scoreInit() {
  if (SCORE.ctx) return true;
  var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
  var c = new AC(), out = c.createGain(); out.gain.value = 0; out.connect(c.destination);
  // a short soft room so notes don't sound dry
  var len = Math.round(c.sampleRate * 2.2), ir = c.createBuffer(2, len, c.sampleRate);
  for (var ch = 0; ch < 2; ch++) { var d = ir.getChannelData(ch); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  var verb = c.createConvolver(); verb.buffer = ir; var wet = c.createGain(); wet.gain.value = 0.28; verb.connect(wet); wet.connect(out);
  SCORE.ctx = c; SCORE.out = out; SCORE.verb = verb; return true;
}
function voiceOut(g) { g.connect(SCORE.out); g.connect(SCORE.verb); }
function pad(notes, t, dur) {
  var c = SCORE.ctx, lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 820; lp.Q.value = 0.4;
  var g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.035, t + 1.4); g.gain.setValueAtTime(0.035, t + dur - 0.2); g.gain.linearRampToValueAtTime(0, t + dur + 1.6);
  lp.connect(g); voiceOut(g);
  notes.slice(1).forEach((n) => [-6, 6].forEach((det) => { var o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(n); o.detune.value = det; o.connect(lp); o.start(t); o.stop(t + dur + 1.8); }));
  var b = c.createOscillator(), bg = c.createGain(); b.type = 'sine'; b.frequency.value = hz(notes[0]);
  bg.gain.setValueAtTime(0, t); bg.gain.linearRampToValueAtTime(0.09, t + 0.08); bg.gain.exponentialRampToValueAtTime(0.02, t + dur); bg.gain.linearRampToValueAtTime(0, t + dur + 0.6);
  b.connect(bg); bg.connect(SCORE.out); b.start(t); b.stop(t + dur + 0.7);
}
function pluck(n, t, level) {
  var c = SCORE.ctx, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
  o.type = 'triangle'; o.frequency.value = hz(n); o2.type = 'sine'; o2.frequency.value = hz(n + 12);
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(900, t + 0.5);
  var lv = level || 0.05; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lv, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.9);
  var g2 = c.createGain(); g2.gain.value = 0.25; o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); voiceOut(g);
  o.start(t); o2.start(t); o.stop(t + 1); o2.stop(t + 1);
}
function shaker(t, lv) {
  var c = SCORE.ctx, n = Math.round(c.sampleRate * 0.05), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
  for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  var s = c.createBufferSource(), hp = c.createBiquadFilter(), g = c.createGain(); s.buffer = buf; hp.type = 'highpass'; hp.frequency.value = 7000; g.gain.value = lv;
  s.connect(hp); hp.connect(g); g.connect(SCORE.out); s.start(t);
}
function scoreTick() {
  var c = SCORE.ctx, eighth = 60 / SCORE.bpm / 2;
  while (SCORE.next < c.currentTime + 0.12) {
    var t = SCORE.next, st = SCORE.step % 8, bar = Math.floor(SCORE.step / 8);
    if (st === 0) {
      var m;
      if (SCORE.step === 0 || SCORE.want !== SCORE.mood) { SCORE.mood = SCORE.want; SCORE.ci = 0; SCORE.chordBar = bar; m = MOODS[SCORE.mood]; pad(m.chords[0], t, eighth * 8 * m.bars); }
      else { m = MOODS[SCORE.mood]; if ((bar - SCORE.chordBar) % m.bars === 0) { SCORE.ci = m.hold ? Math.min(SCORE.ci + 1, m.chords.length - 1) : (SCORE.ci + 1) % m.chords.length; pad(m.chords[SCORE.ci], t, eighth * 8 * m.bars); } }
    }
    var mm = MOODS[SCORE.mood], ch = mm.chords[SCORE.ci];
    if (mm.mask[st]) pluck(ch[ARP[st]] + 12, t + (st % 2 ? 0.012 : 0), st === 0 ? 0.05 : 0.036);
    if (mm.shake && st % 2 === 1) shaker(t, 0.012);
    if (SCORE.accents > 0) { SCORE.accents--; pluck(ch[ch.length - 1] + 12, t, 0.045); }
    SCORE.next += eighth; SCORE.step++;
  }
}
function scoreLevel(to, sec) { if (!SCORE.ctx) return; var g = SCORE.out.gain, t = SCORE.ctx.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(to, t + sec); }
function scoreStart(mood) {
  if (!SCORE.on || !scoreInit()) return;
  var c = SCORE.ctx; if (c.state === 'suspended') c.resume();
  if (mood) SCORE.want = mood;
  if (!SCORE.playing) { SCORE.playing = true; SCORE.step = 0; SCORE.mood = SCORE.want; SCORE.ci = 0; SCORE.next = c.currentTime + 0.1; clearInterval(SCORE.timer); SCORE.timer = setInterval(scoreTick, 25); }
  scoreLevel(0.9, 1.6);
}
function scoreMood(m) { if (MOODS[m]) SCORE.want = m; }
function scoreAccent() { if (SCORE.playing) SCORE.accents = Math.min(1, SCORE.accents + 1); }
function scorePause() { if (!SCORE.ctx) return; scoreLevel(0, 0.5); setTimeout(() => { if (DEMO.paused || !SCORE.on) SCORE.ctx.suspend(); }, 560); }
function scoreResume() { if (!SCORE.on || !SCORE.playing) return scoreStart(); SCORE.ctx.resume(); scoreLevel(0.9, 0.8); }
function scoreStop(sec) { if (!SCORE.ctx || !SCORE.playing) return; scoreLevel(0, sec || 1.5); setTimeout(() => { clearInterval(SCORE.timer); SCORE.playing = false; }, (sec || 1.5) * 1000 + 100); }
