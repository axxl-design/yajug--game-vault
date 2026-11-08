/* YAJUGÁ · música y efectos generados en el navegador (Web Audio). Sin archivos. */
(function () {
  var AC = window.AudioContext || window.webkitAudioContext;
  var S = { ctx: null, master: null, mus: null, fx: null, on: true, theme: null, timer: null, nextT: 0, step: 0, verb: null };
  try { S.on = localStorage.getItem('yj-sound') !== 'off'; } catch (e) {}

  function init() {
    if (S.ctx || !AC) return S.ctx;
    var c = new AC(); S.ctx = c;
    S.master = c.createGain(); S.master.gain.value = S.on ? 1 : 0; S.master.connect(c.destination);
    var comp = c.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 4; comp.knee.value = 10; var mk = c.createGain(); mk.gain.value = 2.6; comp.connect(mk); mk.connect(S.master);
    S.mus = c.createGain(); S.mus.gain.value = 0.5; S.mus.connect(comp);
    S.fx = c.createGain(); S.fx.gain.value = 1; S.fx.connect(comp);
    // reverb suave para la música
    var len = c.sampleRate * 1.8, buf = c.createBuffer(2, len, c.sampleRate);
    for (var ch = 0; ch < 2; ch++) { var d = buf.getChannelData(ch); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    S.verb = c.createConvolver(); S.verb.buffer = buf; var vg = c.createGain(); vg.gain.value = 0.28; S.verb.connect(vg); vg.connect(S.mus);
    return c;
  }
  var SILENT = 'data:audio/wav;base64,UklGRqQMAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YYAMAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';
  function unlock() {
    // iPhone: pasar la sesión de audio a "reproducción" para que suene aunque esté en modo silencio
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    if (!S.tag) { try { var a = document.createElement('audio'); a.setAttribute('playsinline', ''); a.setAttribute('x-webkit-airplay', 'deny'); a.preload = 'auto'; a.loop = true; a.src = SILENT; S.tag = a; } catch (e) {} }
    if (S.on && S.tag && S.tag.paused) { try { var pr = S.tag.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {} }
    var c = init(); if (!c) return;
    if (c.state !== 'running') { try { c.resume(); } catch (e) {} }
    try { var b = c.createBuffer(1, 1, 22050), src = c.createBufferSource(); src.buffer = b; src.connect(c.destination); src.start(0); } catch (e) {}
    if (S.theme && !S.timer && S.on) startLoop();
  }
  ['touchend', 'click', 'pointerup', 'keydown'].forEach(function (t) { window.addEventListener(t, unlock, { passive: true, capture: true }); document.addEventListener(t, unlock, { passive: true, capture: true }); });
  document.addEventListener('visibilitychange', function () { if (!S.ctx) return; if (document.hidden) { S.ctx.suspend(); if (S.tag) try { S.tag.pause(); } catch (e) {} } else if (S.on) { S.ctx.resume(); } });

  var mtof = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
  function env(g, t, a, peak, dec, sus) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sus || 0.0001), t + a + dec); }
  function tone(o) { // {f, t, d, type, vol, a, out, cut, q, glide, verb}
    var c = S.ctx, t = o.t || c.currentTime, osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(o.f, t); if (o.glide) osc.frequency.exponentialRampToValueAtTime(o.glide, t + (o.d || 0.2));
    if (o.det) osc.detune.value = o.det;
    var last = osc;
    if (o.cut) { var fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(o.cut, t); if (o.cutEnd) fl.frequency.exponentialRampToValueAtTime(o.cutEnd, t + (o.d || 0.2)); fl.Q.value = o.q || 0.7; osc.connect(fl); last = fl; }
    last.connect(g); env(g, t, o.a || 0.005, o.vol || 0.3, o.d || 0.2);
    g.connect(o.out || S.fx); if (o.verb && S.verb) g.connect(S.verb);
    osc.start(t); osc.stop(t + (o.a || 0.005) + (o.d || 0.2) + 0.05);
  }
  function noise(o) { // {t, d, vol, f, type, q, out}
    var c = S.ctx, t = o.t || c.currentTime, n = Math.floor(c.sampleRate * (o.d || 0.1)), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var src = c.createBufferSource(); src.buffer = b; var fl = c.createBiquadFilter(); fl.type = o.type || 'bandpass'; fl.frequency.value = o.f || 3000; fl.Q.value = o.q || 1;
    var g = c.createGain(); env(g, t, o.a || 0.002, o.vol || 0.2, o.d || 0.1); src.connect(fl); fl.connect(g); g.connect(o.out || S.fx); src.start(t);
  }

  // ---------- efectos ----------
  var FX = {
    tap: function () { tone({ f: 880, d: 0.05, type: 'triangle', vol: 0.12 }); },
    dice: function () { var c = S.ctx, t = c.currentTime; for (var i = 0; i < 9; i++) { var tt = t + i * 0.07 + Math.random() * 0.03; noise({ t: tt, d: 0.04, vol: 0.35 - i * 0.025, f: 1800 + Math.random() * 1800, q: 4 }); tone({ t: tt, f: 300 + Math.random() * 200, d: 0.03, type: 'square', vol: 0.04, cut: 1500 }); } },
    diceLand: function () { noise({ d: 0.08, vol: 0.4, f: 900, q: 2 }); tone({ f: 140, d: 0.12, vol: 0.3, glide: 70 }); },
    step: function () { tone({ f: 660 + Math.random() * 60, d: 0.05, type: 'triangle', vol: 0.1 }); noise({ d: 0.03, vol: 0.08, f: 4000, q: 2 }); },
    card: function () { noise({ d: 0.16, vol: 0.22, f: 2600, q: 0.6, type: 'highpass' }); tone({ f: 520, glide: 900, d: 0.12, type: 'sine', vol: 0.06 }); },
    play: function () { noise({ d: 0.12, vol: 0.2, f: 2000, q: 0.7 }); var t = S.ctx.currentTime; tone({ t: t + 0.06, f: 392, d: 0.18, type: 'triangle', vol: 0.18 }); tone({ t: t + 0.12, f: 587, d: 0.25, type: 'triangle', vol: 0.16 }); },
    coin: function () { var t = S.ctx.currentTime; tone({ t: t, f: 1568, d: 0.08, type: 'square', vol: 0.06, cut: 5000 }); tone({ t: t + 0.07, f: 2093, d: 0.25, type: 'square', vol: 0.06, cut: 5000 }); },
    pay: function () { var t = S.ctx.currentTime; tone({ t: t, f: 700, glide: 380, d: 0.22, type: 'triangle', vol: 0.14 }); },
    buy: function () { var t = S.ctx.currentTime; noise({ t: t, d: 0.06, vol: 0.25, f: 5000, q: 3 }); [784, 988, 1175].forEach(function (f, i) { tone({ t: t + 0.05 + i * 0.07, f: f, d: 0.22, type: 'triangle', vol: 0.15 }); }); },
    build: function () { var t = S.ctx.currentTime; [0, 0.12, 0.24].forEach(function (d) { noise({ t: t + d, d: 0.06, vol: 0.3, f: 1200, q: 3 }); tone({ t: t + d, f: 220, d: 0.08, type: 'square', vol: 0.05, cut: 900 }); }); tone({ t: t + 0.36, f: 523, d: 0.3, type: 'triangle', vol: 0.15 }); },
    turn: function () { var t = S.ctx.currentTime; tone({ t: t, f: 659, d: 0.25, vol: 0.12, verb: 1 }); tone({ t: t + 0.12, f: 880, d: 0.4, vol: 0.12, verb: 1 }); },
    myTurn: function () { var t = S.ctx.currentTime; [523, 659, 784, 1047].forEach(function (f, i) { tone({ t: t + i * 0.09, f: f, d: 0.35, type: 'triangle', vol: 0.15, verb: 1 }); }); },
    charge: function () { tone({ f: 600, glide: 1200, d: 0.25, type: 'sine', vol: 0.07 }); },
    ready: function () { var t = S.ctx.currentTime; [587, 740, 880, 1175].forEach(function (f, i) { tone({ t: t + i * 0.07, f: f, d: 0.5, type: 'triangle', vol: 0.12, verb: 1 }); }); noise({ t: t + 0.25, d: 0.6, vol: 0.06, f: 7000, q: 0.5, type: 'highpass' }); },
    domain: function () { var c = S.ctx, t = c.currentTime;
      tone({ t: t, f: 55, glide: 30, d: 2.2, type: 'sawtooth', vol: 0.35, cut: 400, cutEnd: 80 }); noise({ t: t, d: 1.2, vol: 0.25, f: 300, q: 0.5, type: 'lowpass' });
      tone({ t: t + 1.1, f: 110, d: 1.4, type: 'sawtooth', vol: 0.22, cut: 1800, cutEnd: 200 }); noise({ t: t + 1.15, d: 0.5, vol: 0.4, f: 900, q: 0.4 });
      [0, 3, 7, 12].forEach(function (s, i) { tone({ t: t + 1.2 + i * 0.05, f: mtof(62 + s), d: 2.2, type: 'sawtooth', vol: 0.06, cut: 2400, a: 0.08, verb: 1 }); }); },
    no: function () { tone({ f: 220, glide: 150, d: 0.25, type: 'square', vol: 0.08, cut: 1200 }); },
    ok: function () { var t = S.ctx.currentTime; tone({ t: t, f: 784, d: 0.12, type: 'triangle', vol: 0.16 }); tone({ t: t + 0.1, f: 1175, d: 0.3, type: 'triangle', vol: 0.16 }); },
    bad: function () { var t = S.ctx.currentTime; tone({ t: t, f: 311, d: 0.18, type: 'sawtooth', vol: 0.08, cut: 900 }); tone({ t: t + 0.16, f: 233, d: 0.35, type: 'sawtooth', vol: 0.08, cut: 700 }); },
    tick: function () { tone({ f: 1400, d: 0.03, type: 'square', vol: 0.05, cut: 3000 }); },
    clue: function () { var t = S.ctx.currentTime; tone({ t: t, f: 988, d: 0.1, type: 'sine', vol: 0.1 }); tone({ t: t + 0.08, f: 1319, d: 0.2, type: 'sine', vol: 0.1 }); },
    win: function () { var t = S.ctx.currentTime; [[523, 0], [659, 0.15], [784, 0.3], [1047, 0.45], [784, 0.65], [1047, 0.8]].forEach(function (x) { tone({ t: t + x[1], f: x[0], d: 0.4, type: 'triangle', vol: 0.18, verb: 1 }); tone({ t: t + x[1], f: x[0] / 2, d: 0.4, type: 'square', vol: 0.04, cut: 1500 }); }); },
    out: function () { var t = S.ctx.currentTime; [392, 370, 349, 262].forEach(function (f, i) { tone({ t: t + i * 0.22, f: f, d: 0.35, type: 'triangle', vol: 0.14 }); }); }
  };

  // ---------- música: secuenciador simple ----------
  // Cada tema: bpm, pasos por compás (16), y función voice(step, t, bar) que agenda notas.
  function pad(f, t, d, v) { [0, -7, 7].forEach(function (det) { tone({ t: t, f: f, d: d, type: 'triangle', vol: v, a: 0.25, det: det, out: S.mus, verb: 1, cut: 1800 }); }); }
  function ep(f, t, d, v) { tone({ t: t, f: f, d: d, type: 'sine', vol: v, a: 0.01, out: S.mus, verb: 1 }); tone({ t: t, f: f * 2, d: d * 0.5, type: 'sine', vol: v * 0.25, a: 0.005, out: S.mus }); }
  function hat(t, v) { noise({ t: t, d: 0.05, vol: v, f: 8000, q: 1, type: 'highpass', out: S.mus }); }
  function kick(t, v) { tone({ t: t, f: 120, glide: 45, d: 0.25, type: 'sine', vol: v, out: S.mus }); }
  function drum(t, v, f) { tone({ t: t, f: f || 90, glide: (f || 90) * 0.6, d: 0.35, type: 'sine', vol: v, out: S.mus }); noise({ t: t, d: 0.08, vol: v * 0.4, f: 600, q: 1, out: S.mus }); }
  function tak(t, v) { noise({ t: t, d: 0.05, vol: v, f: 2500, q: 3, out: S.mus }); }
  function pluck(f, t, v, cut) { tone({ t: t, f: f, d: 0.5, type: 'sawtooth', vol: v, cut: cut || 2600, cutEnd: 300, out: S.mus, verb: 1 }); }
  function bass(f, t, d, v) { tone({ t: t, f: f, d: d, type: 'triangle', vol: v, a: 0.01, out: S.mus, cut: 700 }); }

  var THEMES = {
    // Dominio: lounge de jazz (ii–V–I–VI), swing suave
    dominio: { bpm: 92, swing: 0.16, bars: 4, voice: function (st, t, bar, spb) {
      var CH = [[50, [62, 65, 69, 72]], [43, [59, 62, 65, 69]], [48, [60, 64, 67, 71]], [45, [61, 64, 67, 70]]];
      var ch = CH[bar % 4];
      if (st === 0) ch[1].forEach(function (m, i) { ep(mtof(m), t + i * 0.012, spb * 7, 0.05); });
      if (st === 10) ch[1].slice(1).forEach(function (m) { ep(mtof(m), t, spb * 3, 0.03); });
      if (st % 4 === 0) { var walk = [0, 3, 5, 7]; bass(mtof(ch[0] + walk[st / 4]), t, spb * 3.2, 0.2); }
      if (st % 2 === 0) hat(t, st % 4 === 2 ? 0.05 : 0.025);
      if (st === 0 || st === 8) kick(t, 0.12);
      if (bar % 2 === 1 && st === 12) { tone({ t: t, f: mtof(ch[1][3] + 12), d: spb * 3, type: 'sine', vol: 0.035, out: S.mus, verb: 1 }); }
    } },
    // Leyendas: épica antigua (re dórico), tambores de marco y laúd
    leyendas: { bpm: 84, swing: 0, bars: 4, voice: function (st, t, bar, spb) {
      var ROOT = [50, 48, 46, 48][bar % 4], SC = [0, 2, 3, 5, 7, 9, 10, 12];
      if (st === 0) { pad(mtof(ROOT - 12), t, spb * 15, 0.03); pad(mtof(ROOT - 5), t, spb * 15, 0.02); }
      if ([0, 6, 8, 14].indexOf(st) >= 0) drum(t, st === 0 ? 0.22 : 0.13, st === 0 ? 70 : 95);
      if ([3, 11].indexOf(st) >= 0) tak(t, 0.08);
      if (st % 2 === 0) { var pat = [0, 4, 7, 4, 2, 4, 7, 9]; var m = ROOT + 12 + SC[pat[(st / 2 + bar) % 8] % 8]; pluck(mtof(m), t, 0.045, 2200); }
      if (bar % 4 === 3 && st === 8) tone({ t: t, f: mtof(ROOT + 24), d: spb * 7, type: 'sawtooth', vol: 0.025, a: 0.4, out: S.mus, verb: 1, cut: 1400 });
    } },
    // ¿Quién soy?: concurso alegre (I–vi–IV–V)
    quien: { bpm: 118, swing: 0, bars: 4, voice: function (st, t, bar, spb) {
      var CH = [[48, [60, 64, 67]], [45, [57, 60, 64]], [41, [57, 60, 65]], [43, [59, 62, 67]]][bar % 4];
      if (st % 2 === 0) { var arp = CH[1][(st / 2) % 3] + 12; tone({ t: t, f: mtof(arp), d: spb * 0.8, type: 'square', vol: 0.025, cut: 2400, out: S.mus }); }
      if (st % 4 === 0) bass(mtof(CH[0]), t, spb * 1.5, 0.18);
      if (st === 4 || st === 12) { noise({ t: t, d: 0.09, vol: 0.09, f: 1500, q: 0.8, out: S.mus }); }
      if (st === 0 || st === 8) kick(t, 0.13);
      if (st % 2 === 1) hat(t, 0.025);
      if (st === 0) CH[1].forEach(function (m) { tone({ t: t, f: mtof(m), d: spb * 14, type: 'triangle', vol: 0.02, a: 0.2, out: S.mus, verb: 1 }); });
    } }
  };
  function startLoop() {
    var c = S.ctx; if (!c || !S.theme || S.timer) return;
    var th = THEMES[S.theme]; var spb = 60 / th.bpm / 4; S.nextT = c.currentTime + 0.1; S.step = 0;
    S.mus.gain.cancelScheduledValues(c.currentTime); S.mus.gain.setValueAtTime(0.0001, c.currentTime); S.mus.gain.exponentialRampToValueAtTime(0.5, c.currentTime + 1.5);
    S.timer = setInterval(function () {
      if (!S.ctx || S.ctx.state !== 'running') return;
      while (S.nextT < S.ctx.currentTime + 0.25) {
        var st = S.step % 16, bar = Math.floor(S.step / 16);
        var t = S.nextT + (st % 2 === 1 ? th.swing * spb * 2 : 0);
        try { th.voice(st, t, bar, spb); } catch (e) {}
        S.nextT += spb; S.step += 1;
      }
    }, 60);
  }
  function stopLoop() { clearInterval(S.timer); S.timer = null; }

  window.YJS = { _s: S,
    play: function (n) { if (!S.on) return; var c = init(); if (!c || !FX[n]) return; if (c.state !== 'running') { try { c.resume(); } catch (e) {} return; } try { FX[n](); } catch (e) {} },
    music: function (theme) { if (S.theme === theme) return; stopLoop(); S.theme = theme; if (S.on && S.ctx && S.ctx.state === 'running') startLoop(); },
    stopMusic: function () { stopLoop(); S.theme = null; },
    isOn: function () { return S.on; },
    toggle: function () { S.on = !S.on; try { localStorage.setItem('yj-sound', S.on ? 'on' : 'off'); } catch (e) {} var c = init(); if (c) { S.master.gain.setTargetAtTime(S.on ? 1 : 0, c.currentTime, 0.05); if (S.on) { c.resume(); if (S.theme && !S.timer) startLoop(); } } if (S.tag) { try { if (S.on) S.tag.play().catch(function () {}); else S.tag.pause(); } catch (e) {} } if (S.on) { var me = this; setTimeout(function () { me.play('ok'); }, 120); } return S.on; }
  };
})();
