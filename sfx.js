/* YAJUGÁ · música y efectos generados en el navegador (Web Audio). Sin archivos. */
(function () {
  var AC = window.AudioContext || window.webkitAudioContext;
  var S = { ctx: null, master: null, mus: null, fx: null, on: true, theme: null, timer: null, nextT: 0, step: 0, verb: null };
  try { S.on = localStorage.getItem('yj-sound') !== 'off'; } catch (e) {}

  function init() {
    if (S.ctx || !AC) return S.ctx;
    var c = new AC(); S.ctx = c;
    S.master = c.createGain(); S.master.gain.value = S.on ? 1 : 0; var lim = c.createDynamicsCompressor(); lim.threshold.value = -4; lim.knee.value = 2; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.15; S.master.connect(lim); lim.connect(c.destination);
    S.smp = c.createGain(); S.smp.gain.value = 0.9; S.smp.connect(S.master);
    var comp = c.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 4; comp.knee.value = 10; var mk = c.createGain(); mk.gain.value = 2.6; comp.connect(mk); mk.connect(S.master);
    S.mus = c.createGain(); S.mus.gain.value = 0.0001; S.mus.connect(S.master);
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
    preload(); if (S.theme && !S.src && S.on) startLoop();
  }
  ['touchend', 'click', 'pointerup', 'keydown'].forEach(function (t) { window.addEventListener(t, unlock, { passive: true, capture: true }); document.addEventListener(t, unlock, { passive: true, capture: true }); });
  document.addEventListener('visibilitychange', function () { if (!S.ctx) return; if (document.hidden) { S.ctx.suspend(); if (S.tag) try { S.tag.pause(); } catch (e) {} } else if (S.on) { S.ctx.resume(); } });

  var BUF = {};
  function load(url) { if (BUF[url]) return BUF[url]; BUF[url] = fetch(url).then(function (r) { return r.arrayBuffer(); }).then(function (ab) { return new Promise(function (res, rej) { S.ctx.decodeAudioData(ab, res, rej); }); }).catch(function () { BUF[url] = null; return null; }); return BUF[url]; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function sample(name, vol, rate, delay) { var url = '/audio/sfx/' + name + '.mp3'; var c = S.ctx; load(url).then(function (b) { if (!b || !S.on) return; var src = c.createBufferSource(); src.buffer = b; src.playbackRate.value = rate || (0.96 + Math.random() * 0.08); var g = c.createGain(); g.gain.value = vol || 0.6; src.connect(g); g.connect(S.smp); src.start(c.currentTime + (delay || 0)); }); }
  var SFXN = ['card-slide-1', 'card-slide-2', 'card-slide-3', 'card-slide-4', 'card-place-1', 'card-place-2', 'card-place-3', 'card-shuffle', 'card-fan-1', 'chips-collide-1', 'chips-collide-2', 'chip-lay-1', 'chip-lay-2', 'chips-handle-1', 'chips-stack-1', 'chips-stack-2', 'dice-shake-1', 'die-throw-1', 'die-throw-2'];
  function preload() { if (S.pre) return; S.pre = true; SFXN.forEach(function (n) { load('/audio/sfx/' + n + '.mp3'); }); }
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
    dice: function () { sample('dice-shake-1', 0.55); sample(pick(['die-throw-1', 'die-throw-2']), 0.7, 0, 0.55); },
    diceSynth: function () { var c = S.ctx, t = c.currentTime; for (var i = 0; i < 9; i++) { var tt = t + i * 0.07 + Math.random() * 0.03; noise({ t: tt, d: 0.04, vol: 0.35 - i * 0.025, f: 1800 + Math.random() * 1800, q: 4 }); tone({ t: tt, f: 300 + Math.random() * 200, d: 0.03, type: 'square', vol: 0.04, cut: 1500 }); } },
    diceLand: function () { noise({ d: 0.08, vol: 0.4, f: 900, q: 2 }); tone({ f: 140, d: 0.12, vol: 0.3, glide: 70 }); },
    step: function () { noise({ d: 0.035, vol: 0.18, f: 1400, q: 3 }); tone({ f: 330 + Math.random() * 40, d: 0.05, type: 'triangle', vol: 0.05 }); },
    card: function () { sample(pick(['card-slide-1', 'card-slide-2', 'card-slide-3', 'card-slide-4']), 0.7); },
    shuffle: function () { sample('card-shuffle', 0.6); },
    fan: function () { sample('card-fan-1', 0.6); },
    cardSynth: function () { noise({ d: 0.16, vol: 0.22, f: 2600, q: 0.6, type: 'highpass' }); tone({ f: 520, glide: 900, d: 0.12, type: 'sine', vol: 0.06 }); },
    play: function () { sample(pick(['card-place-1', 'card-place-2', 'card-place-3']), 0.75); },
    playSynth: function () { noise({ d: 0.12, vol: 0.2, f: 2000, q: 0.7 }); var t = S.ctx.currentTime; tone({ t: t + 0.06, f: 392, d: 0.18, type: 'triangle', vol: 0.18 }); tone({ t: t + 0.12, f: 587, d: 0.25, type: 'triangle', vol: 0.16 }); },
    coin: function () { sample(pick(['chip-lay-1', 'chip-lay-2', 'chips-collide-1', 'chips-collide-2']), 0.55); },
    coinSynth: function () { var t = S.ctx.currentTime; tone({ t: t, f: 1568, d: 0.08, type: 'square', vol: 0.06, cut: 5000 }); tone({ t: t + 0.07, f: 2093, d: 0.25, type: 'square', vol: 0.06, cut: 5000 }); },
    pay: function () { sample('chips-handle-1', 0.5); },
    paySynth: function () { var t = S.ctx.currentTime; tone({ t: t, f: 700, glide: 380, d: 0.22, type: 'triangle', vol: 0.14 }); },
    buy: function () { sample(pick(['chips-stack-1', 'chips-stack-2']), 0.6); var t = S.ctx.currentTime + 0.25; noise({ t: t, d: 0.06, vol: 0.25, f: 5000, q: 3 }); [784, 988, 1175].forEach(function (f, i) { tone({ t: t + 0.05 + i * 0.07, f: f, d: 0.22, type: 'triangle', vol: 0.15 }); }); },
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

  // ---------- música: temas CC0 de OpenGameArt, en bucle ----------
  var MUSIC = { dominio: '/audio/music/jazz.mp3', leyendas: '/audio/music/bard.mp3', quien: '/audio/music/cozy.mp3' };
  var MVOL = { dominio: 1.4, leyendas: 0.95, quien: 0.9 };
  function startLoop() {
    var c = S.ctx; if (!c || !S.theme || S.src || S.loading === S.theme) return;
    var th = S.theme; S.loading = th;
    load(MUSIC[th]).then(function (b) {
      S.loading = null; if (!b || S.src || S.theme !== th || !S.on) return;
      var src = c.createBufferSource(); src.buffer = b; src.loop = true; src.connect(S.mus);
      S.mus.gain.cancelScheduledValues(c.currentTime); S.mus.gain.setValueAtTime(0.0001, c.currentTime); S.mus.gain.exponentialRampToValueAtTime(MVOL[th] || 0.5, c.currentTime + 2.5);
      src.start(); S.src = src;
    });
  }
  function stopLoop() { if (S.src) { try { S.src.stop(); } catch (e) {} S.src = null; } S.loading = null; }
  S.timer = null;

  window.YJS = { _s: S,
    play: function (n) { if (!S.on) return; var c = init(); if (!c || !FX[n]) return; if (c.state !== 'running') { try { c.resume(); } catch (e) {} return; } try { FX[n](); } catch (e) {} },
    music: function (theme) { if (S.theme === theme) return; stopLoop(); S.theme = theme; if (S.on && S.ctx && S.ctx.state === 'running') startLoop(); },
    stopMusic: function () { stopLoop(); S.theme = null; },
    isOn: function () { return S.on; },
    toggle: function () { S.on = !S.on; try { localStorage.setItem('yj-sound', S.on ? 'on' : 'off'); } catch (e) {} var c = init(); if (c) { S.master.gain.setTargetAtTime(S.on ? 1 : 0, c.currentTime, 0.05); if (S.on) { c.resume(); if (S.theme && !S.src) startLoop(); } } if (S.tag) { try { if (S.on) S.tag.play().catch(function () {}); else S.tag.pause(); } catch (e) {} } if (!S.on) stopLoop(); if (S.on) { var me = this; setTimeout(function () { me.play('ok'); }, 120); } return S.on; }
  };
})();
