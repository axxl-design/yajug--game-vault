/* ZONA 7 — retratos pixel art por capas (96×112), ojos y manos en primer plano. */
const Z7ART = (() => {
  const SKIN = [['#f3cfb0', '#d9a586', '#fbe3cc'], ['#e6b48c', '#c48d66', '#f3cda9'], ['#d09a6c', '#a97448', '#e2b58a'], ['#b0774a', '#8a5732', '#c79062'], ['#8a5a3a', '#663f26', '#a4724e'], ['#63412c', '#48301f', '#7d573d']];
  const HAIR = [['#1d1a20', '#0f0d12', '#3a3540'], ['#3b2617', '#24160c', '#5a3d27'], ['#6b4423', '#4a2d15', '#8d6238'], ['#8c3b1c', '#63260f', '#b25a30'], ['#c9a24e', '#9a7730', '#e6c676'], ['#54301f', '#371d11', '#754a33'], ['#a9a7a3', '#7c7a78', '#d2d0cb']];
  const EYES = ['#5a3418', '#4d6b2e', '#3f6fa0', '#22201c'];
  const CLOTH = [['#5d6b4e', '#434f38'], ['#6e3b33', '#4f2822'], ['#3f4f6e', '#2c3950'], ['#7a6a52', '#5a4d3a'], ['#3d3a44', '#28262e'], ['#8a7340', '#665428'], ['#4f6a6a', '#374c4c'], ['#75526b', '#553a4d']];
  const INK = [22, 16, 26];
  const hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  function B(w, h) { return { w, h, d: new Uint8ClampedArray(w * h * 4), p: new Uint8Array(w * h) }; }
  function set(b, x, y, c, part, only) { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= b.w || y >= b.h) return; const k = y * b.w + x; if (only !== undefined && b.p[k] !== only) return; const i = k * 4; b.d[i] = c[0]; b.d[i + 1] = c[1]; b.d[i + 2] = c[2]; b.d[i + 3] = 255; if (part !== undefined) b.p[k] = part; }
  function ell(b, cx, cy, rx, ry, c, part, only, y0, y1) { for (let y = Math.floor(cy - ry); y <= cy + ry; y++) { if (y0 !== undefined && y < y0) continue; if (y1 !== undefined && y > y1) continue; for (let x = Math.floor(cx - rx); x <= cx + rx; x++) { const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; if (dx * dx + dy * dy <= 1) set(b, x, y, c, part, only); } } }
  function rect(b, x, y, w, h, c, part, only) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(b, x + i, y + j, c, part, only); }
  function line(b, x0, y0, x1, y1, c, part, only) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let i = 0; i <= n; i++) set(b, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, c, part, only); }
  function outline(b) { const o = []; for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) { if (b.d[(y * b.w + x) * 4 + 3]) continue; const n = (xx, yy) => xx >= 0 && yy >= 0 && xx < b.w && yy < b.h && b.d[(yy * b.w + xx) * 4 + 3]; if (n(x - 1, y) || n(x + 1, y) || n(x, y - 1) || n(x, y + 1)) o.push([x, y]); } o.forEach(([x, y]) => set(b, x, y, INK, 9)); }
  function url(b, key) { if (typeof document === 'undefined') return ''; const c = document.createElement('canvas'); c.width = b.w; c.height = b.h; const g = c.getContext('2d'); g.putImageData(new ImageData(b.d, b.w, b.h), 0, 0); return c.toDataURL(); }
  const cache = {};
  const RX = [21, 22, 20, 23], EXP = [2.3, 4, 1.7, 3];
  function markAt(b, m, sk, hairD) { if (!m) return; const s = m.side; const sh = hx(sk[1]);
    const P = { mejilla: [48 + s * 13, 65], ceja: [48 + s * 9, 46], sien: [48 + s * 17, 51], boca: [48 + s * 8, 70] }[m.pos]; const x = P[0], y = P[1];
    if (m.t === 'lunar') { const c = [50, 30, 22]; rect(b, x - 1, y - 1, 3, 3, c, 4); set(b, x - 1, y - 1, mix(c, sh, 0.6), 4); set(b, x + 1, y + 1, mix(c, sh, 0.6), 4); }
    else if (m.t === 'mancha') { const c = mix(hx(sk[0]), [140, 50, 40], 0.55); ell(b, x, y, 3.4, 2.6, c, 4); set(b, x + 2, y - 2, c, 4); set(b, x - 3, y + 1, c, 4); }
    else { const c = mix(hx(sk[2]), [255, 190, 190], 0.5), d = mix(sh, [90, 30, 30], 0.4); if (m.pos === 'ceja') { line(b, x - s * 1, y - 4, x + s * 2, y + 5, c, 4); line(b, x - s * 1 + 1, y - 4, x + s * 2 + 1, y + 5, d, 4); } else if (m.pos === 'mejilla') { line(b, x - 3, y - 3, x + 3, y + 3, c, 4); line(b, x - 3, y - 2, x + 2, y + 3, d, 4); set(b, x - 1, y + 1, c, 4); set(b, x + 1, y - 1, c, 4); } else if (m.pos === 'sien') { line(b, x, y - 4, x, y + 3, c, 4); line(b, x + 1, y - 4, x + 1, y + 3, d, 4); } else { line(b, x - 2, y - 2, x + 2, y + 3, c, 4); line(b, x - 1, y - 2, x + 3, y + 3, d, 4); } } }
  function cara(f, st) {
    st = st || {}; const key = JSON.stringify([f, st]); if (cache[key]) return cache[key];
    const b = B(96, 112), sk = SKIN[f.skin], S = hx(sk[0]), SD = hx(sk[1]), SL = hx(sk[2]); const hr = HAIR[f.hair], HC = hx(hr[0]), HD = hx(hr[1]), HL = hx(hr[2]); const rx = RX[f.fs], ex = EXP[f.fs]; const cl = CLOTH[f.cloth], CC = hx(cl[0]), CD = hx(cl[1]);
    const hw = (y) => (y <= 50 ? rx * Math.sqrt(Math.max(0, 1 - Math.pow((50 - y) / 28, 2))) : rx * Math.sqrt(Math.max(0, 1 - Math.pow((y - 50) / 32, ex))));
    const hs = f.hs, gor = f.acc === 'gorro';
    // pelo de atrás
    if (!gor || hs >= 4) {
      if (hs === 4) rect(b, 48 - rx - 3, 36, rx * 2 + 6, 30, HD, 2);
      if (hs === 5) ell(b, 48, 62, rx + 7, 42, HD, 2, undefined, 28, 104);
      if (hs === 7) { for (let a = 0; a < 40; a++) { const an = a / 40 * Math.PI * 2; ell(b, 48 + Math.cos(an) * (rx + 5), 46 + Math.sin(an) * 26, 6, 6, a % 2 ? HD : HC, 2); } ell(b, 48, 46, rx + 6, 28, HD, 2); }
      if (hs === 8) { ell(b, 48 + rx + 3, 72, 6, 20, HD, 2); ell(b, 48 + rx + 4, 74, 3, 16, HC, 2); }
      if (hs === 9) ell(b, 48, 56, rx + 6, 27, HD, 2, undefined, 30, 78);
      if (hs === 6) { ell(b, 48, 17, 9, 8, HC, 2); ell(b, 50, 18, 5, 4, HD, 2); }
    }
    // hombros y ropa
    for (let y = 90; y < 112; y++) { const w = Math.min(45, 19 + (y - 90) * 2.1); for (let x = Math.round(48 - w); x < 48 + w; x++) set(b, x, y, (x > 64 || (x > 60 && (x + y) % 2)) ? CD : CC, 3); }
    // cuello
    rect(b, 40, 74, 16, 22, SD, 1); rect(b, 40, 80, 9, 16, mix(S, SD, 0.5), 1);
    if (f.cs === 0) ell(b, 48, 93, 11, 6, mix(S, SD, 0.5), 1); else if (f.cs === 1) { for (let i = 0; i < 12; i++) rect(b, 48 - (12 - i) * 0.9, 90 + i, (12 - i) * 1.8, 1, mix(S, SD, 0.5), 1); } else { for (let i = 0; i < 9; i++) { rect(b, 48 - (9 - i), 90 + i, (9 - i) * 2, 1, mix(S, SD, 0.5), 1); } for (let i = 0; i < 10; i++) { rect(b, 36 + i * 0.6, 88 + i, 6, 1, mix(CC, [255, 255, 255], 0.25), 3); rect(b, 54 - i * 0.6, 88 + i, 6, 1, mix(CC, [255, 255, 255], 0.12), 3); } rect(b, 47, 102, 2, 2, CD, 3); rect(b, 47, 108, 2, 2, CD, 3); }
    // orejas
    ell(b, 48 - rx - 1, 55, 3.5, 5.5, SD, 1); ell(b, 48 + rx + 1, 55, 3.5, 5.5, SD, 1); set(b, 48 - rx - 1, 55, mix(SD, INK, 0.3), 1); set(b, 48 + rx + 1, 55, mix(SD, INK, 0.3), 1);
    // cabeza
    for (let y = 22; y <= 82; y++) { const w = hw(y); for (let x = Math.round(48 - w); x < Math.round(48 + w); x++) set(b, x, y, S, 1); }
    // sombreado de piel
    for (let y = 22; y <= 96; y++) for (let x = 20; x < 76; x++) { const k = y * 96 + x; if (b.p[k] !== 1 || y > 82) continue; const w = hw(y) || 1, nx = (x - 48) / w; if (nx > 0.62 || (nx > 0.46 && (x + y) % 2)) set(b, x, y, SD, 1); if (y > 78 && (x + y) % 2 && nx > -0.5) set(b, x, y, SD, 1); }
    rect(b, 41, 83, 15, 3, mix(SD, INK, 0.25), 1, 1);
    // vejez
    if (f.old) { line(b, 34, 61, 41, 62, SD, 4, 1); line(b, 55, 62, 62, 61, SD, 4, 1); line(b, 40, 67, 38, 73, SD, 4, 1); line(b, 56, 67, 58, 73, SD, 4, 1); if (f.old > 1) { for (let x = 41; x < 56; x++) { if (x % 4) set(b, x, 42, SD, 4, 1); } } }
    if (st.ojeras) { rect(b, 35, 59, 8, 2, mix(SD, [80, 50, 90], 0.3), 4, 1); rect(b, 53, 59, 8, 2, mix(SD, [80, 50, 90], 0.3), 4, 1); }
    // nariz
    const ny = f.nose === 2 ? 64 : 66; line(b, 50, 57, 51, ny, SD, 4); if (f.nose === 3) line(b, 47, 57, 47, ny - 2, SL, 4); const nw = f.nose === 1 ? 5 : 4; rect(b, 48 - nw + 1, ny + 2, nw * 2 - 1, 1, SD, 4); set(b, 48 - nw, ny + 1, mix(SD, INK, 0.45), 4); set(b, 48 + nw, ny + 1, mix(SD, INK, 0.45), 4); set(b, 48 - nw, ny, SD, 4); set(b, 48 + nw, ny, SD, 4);
    // boca
    const lip = mix(S, [170, 60, 60], f.sex === 'f' ? 0.5 : 0.28), ld = mix(SD, [70, 20, 25], 0.6), my = 74;
    if (f.mouth === 0) { rect(b, 43, my, 11, 1, ld, 4); rect(b, 45, my + 1, 7, 2, lip, 4); }
    else if (f.mouth === 1) { rect(b, 44, my - 1, 9, 1, lip, 4); rect(b, 43, my, 11, 1, ld, 4); rect(b, 44, my + 1, 9, 2, lip, 4); set(b, 48, my - 1, S, 4); }
    else if (f.mouth === 2) { rect(b, 44, my, 9, 1, ld, 4); set(b, 43, my + 1, ld, 4); set(b, 53, my + 1, ld, 4); rect(b, 46, my + 1, 5, 1, lip, 4); }
    else { rect(b, 44, my, 9, 1, ld, 4); set(b, 43, my - 1, ld, 4); set(b, 53, my - 1, ld, 4); rect(b, 45, my + 1, 7, 2, lip, 4); }
    // ojos
    const ec = hx(EYES[f.eyes]);
    [39, 57].forEach((cx, i) => { ell(b, cx, 55.5, 5, 3, [236, 231, 220], 4); ell(b, cx + (i ? -0.5 : 0.5), 55.5, 2.6, 2.6, ec, 4); rect(b, cx - 1 + (i ? 0 : 0), 55, 2, 2, [14, 12, 14], 4); set(b, cx - 1, 54, [255, 255, 255], 4); line(b, cx - 5, 53, cx + 4, 53, mix(SD, INK, 0.75), 4); set(b, cx - 5, 54, mix(SD, INK, 0.6), 4); set(b, cx + 5, 54, mix(SD, INK, 0.6), 4); if (f.sex === 'f') { set(b, cx + (i ? 6 : -6), 53, mix(SD, INK, 0.75), 4); set(b, cx + (i ? 7 : -7), 52, mix(SD, INK, 0.75), 4); } line(b, cx - 3, 59, cx + 3, 59, SD, 4, 1); });
    // cejas
    const bc = f.hair === 6 ? hx('#8b8986') : mix(HD, HC, 0.4);
    [39, 57].forEach((cx, i) => { const sg = i ? 1 : -1; for (let t = -6; t <= 5; t++) { const xx = cx + t; const inner = sg * t < 0 ? 1 : 0; let yy = 48; if (f.brow === 1) yy = 47 + Math.round((sg * t + 6) / -5) + 2; if (f.brow === 2) yy = 48 - (Math.abs(t) < 3 ? 1 : 0); set(b, xx, yy, bc, 4); if (f.brow === 2 || f.sex === 'm') set(b, xx, yy + 1, bc, 4); } });
    // barba
    const beard = f.beard || (st.barba ? 1 : 0);
    if (beard === 1) { for (let y = 64; y <= 82; y++) for (let x = 26; x < 70; x++) { if (b.p[y * 96 + x] === 1 && (x + y) % 2 === 0 && !(y < 70 && Math.abs(x - 48) < 5)) set(b, x, y, mix(hx(sk[1]), HD, 0.45), 1); } }
    if (beard === 2) { for (let y = 62; y <= 84; y++) for (let x = 24; x < 72; x++) { const k = y * 96 + x; if (b.p[k] !== 1 && b.p[k] !== 4) continue; const w = hw(Math.min(y, 82)) || 1; const edge = Math.abs(x - 48) / w; if (y < 70 && edge < 0.72 && !(y >= 69 && Math.abs(x - 48) < 8)) continue; if (y >= 72 && y <= 77 && Math.abs(x - 48) < 6) continue; if (y > 82 && Math.abs(x - 48) > 9) continue; set(b, x, y, (x > 58 || (x + y) % 3 === 0) ? HD : HC, 2); } rect(b, 41, 70, 15, 2, HC, 2); }
    if (beard === 3) { rect(b, 41, 70, 15, 2, HC, 2); rect(b, 40, 71, 2, 2, HD, 2); rect(b, 55, 71, 2, 2, HD, 2); }
    // marcas
    markAt(b, f.mark, sk); markAt(b, f.mark2, sk);
    if (st.sucio) { const c = mix(SD, [40, 34, 30], 0.5); [[60, 68], [61, 70], [36, 69], [52, 44]].forEach(([x, y]) => { set(b, x, y, c, 4, 1); set(b, x + 1, y + 1, c, 4, 1); set(b, x + 2, y, c, 4, 1); }); }
    // pelo de adelante
    if (!gor) {
      const cap = (yMax, fn) => { for (let y = 18; y <= yMax; y++) for (let x = 20; x < 76; x++) { const dx = (x + 0.5 - 48) / (rx + 2), dy = (y + 0.5 - 38) / 19; if (dx * dx + dy * dy <= 1 && fn(x, y)) set(b, x, y, (x < 44 && y < 30 && (x + y) % 3 === 0) ? HL : (x > 58 || (y > 36 && (x + y) % 2)) ? HD : HC, 2); } };
      if (hs === 0) { cap(41, (x, y) => y < 37 + Math.abs(x - 48) / 5); rect(b, 48 - rx, 40, 2, 9, HD, 2); rect(b, 48 + rx - 2, 40, 2, 9, HD, 2); }
      if (hs === 1) { cap(46, (x, y) => y < 36 + (x < 52 ? (52 - x) / 3.2 : (x - 52) / 6)); rect(b, 48 - rx, 40, 2, 10, HD, 2); rect(b, 48 + rx - 2, 40, 2, 8, HD, 2); }
      if (hs === 2) { rect(b, 48 - rx, 38, 3, 14, HC, 2); rect(b, 48 + rx - 3, 38, 3, 14, HD, 2); for (let x = 36; x < 60; x++) if (x % 2) set(b, x, 24 + Math.round(Math.abs(x - 48) / 6), HD, 2); }
      if (hs === 3) { cap(38, (x, y) => (x + y) % 2 === 0 || y < 30); }
      if (hs === 4) { cap(44, (x, y) => y < 34 + Math.abs(x - 46) / 2.2); rect(b, 48 - rx - 2, 40, 4, 26, HC, 2); rect(b, 48 + rx - 2, 40, 4, 26, HD, 2); }
      if (hs === 5) { cap(46, (x, y) => y < 43 - (Math.abs(x - 48) < 3 ? 6 - Math.abs(x - 48) * 2 : 0) + Math.abs(x - 48) / 3); rect(b, 48 - rx - 3, 40, 5, 52, HC, 2); rect(b, 48 + rx - 2, 40, 5, 52, HD, 2); for (let y = 50; y < 92; y += 2) { set(b, 48 - rx - 1, y, HD, 2); set(b, 48 + rx + 1, y, HC, 2); } }
      if (hs === 6) { cap(40, (x, y) => y < 35 + Math.abs(x - 48) / 3.5); rect(b, 48 - rx, 40, 2, 8, HD, 2); rect(b, 48 + rx - 2, 40, 2, 8, HD, 2); }
      if (hs === 7) { cap(44, (x, y) => y < 38 + 3 * Math.sin(x * 0.9) + Math.abs(x - 48) / 4); for (let y = 40; y < 70; y += 3) { ell(b, 48 - rx - 2, y, 4, 3, y % 2 ? HC : HD, 2); ell(b, 48 + rx + 2, y, 4, 3, y % 2 ? HD : HC, 2); } }
      if (hs === 8) { cap(41, (x, y) => y < 36 + Math.abs(x - 48) / 4); rect(b, 48 - rx, 40, 2, 8, HD, 2); rect(b, 48 + rx - 2, 40, 3, 12, HD, 2); }
      if (hs === 9) { cap(44, (x, y) => y < 43); rect(b, 48 - rx - 3, 40, 5, 36, HC, 2); rect(b, 48 + rx - 2, 40, 5, 36, HD, 2); for (let x = 30; x < 66; x += 3) set(b, x, 43, HD, 2); }
    } else { const g1 = hx(CLOTH[(f.cloth + 3) % 8][0]), g2 = hx(CLOTH[(f.cloth + 3) % 8][1]); for (let y = 16; y <= 43; y++) for (let x = 18; x < 78; x++) { const dx = (x + 0.5 - 48) / (rx + 4), dy = (y + 0.5 - 38) / 21; if (dx * dx + dy * dy <= 1) set(b, x, y, y > 37 ? (x % 3 ? g2 : g1) : (x > 58 ? g2 : g1), 2); } if (hs >= 4) { rect(b, 48 - rx - 2, 44, 3, 14, HC, 2); rect(b, 48 + rx - 1, 44, 3, 14, HD, 2); } }
    // anteojos
    if (f.glasses) { const gc = [30, 26, 34]; [39, 57].forEach((cx) => { for (let x = cx - 7; x <= cx + 6; x++) { set(b, x, 50, gc, 4); set(b, x, 60, gc, 4); } for (let y = 50; y <= 60; y++) { set(b, cx - 7, y, gc, 4); set(b, cx + 6, y, gc, 4); } set(b, cx - 5, 52, [255, 255, 255], 4); set(b, cx - 4, 51, [255, 255, 255], 4); }); rect(b, 46, 54, 4, 1, gc, 4); line(b, 32, 53, 48 - rx - 1, 52, gc, 4); line(b, 63, 53, 48 + rx + 1, 52, gc, 4); }
    if (f.acc === 'aro') { rect(b, 48 - rx - 2, 60, 2, 3, [226, 184, 60], 4); }
    if (f.acc === 'bufanda') { const r1 = [176, 44, 40], r2 = [128, 28, 30]; for (let y = 82; y < 97; y++) for (let x = 28; x < 68; x++) { const w = 15 + (y - 82) * 0.7; if (Math.abs(x - 48) < w) set(b, x, y, (y % 4 === 0 || x > 60) ? r2 : r1, 3); } rect(b, 52, 94, 9, 16, r1, 3); rect(b, 58, 94, 3, 16, r2, 3); for (let x = 52; x < 61; x += 2) set(b, x, 110, r2, 3); }
    outline(b); const u = url(b); cache[key] = u; return u;
  }
  function ojos(f, tipo) {
    const key = 'o' + JSON.stringify([f.skin, f.eyes, f.sex, tipo]); if (cache[key]) return cache[key];
    const b = B(96, 44), sk = SKIN[f.skin], S = hx(sk[0]), SD = hx(sk[1]); rect(b, 0, 0, 96, 44, S, 1); for (let y = 0; y < 44; y++) for (let x = 0; x < 96; x++) if ((y < 6 || y > 36) && (x + y) % 2) set(b, x, y, SD, 1); rect(b, 44, 8, 8, 30, mix(S, SD, 0.5), 1);
    const ec = hx(EYES[f.eyes]);
    [24, 72].forEach((cx) => { const wh = tipo === 'rojos' ? [240, 214, 208] : [238, 234, 224]; ell(b, cx, 22, 16, 9, wh, 4); if (tipo === 'rojos') { [[-13, -1, -7, 1], [-12, 3, -6, 2], [12, -2, 7, 0], [13, 3, 8, 2], [-9, -5, -5, -2]].forEach(([x0, y0, x1, y1]) => line(b, cx + x0, 22 + y0, cx + x1, 22 + y1, [196, 70, 70], 4, 4)); }
      ell(b, cx, 22, 7.5, 7.5, tipo === 'reflejo' ? mix(ec, [150, 160, 150], 0.5) : ec, 4); ell(b, cx, 22, 5, 5, mix(ec, [0, 0, 0], 0.25), 4);
      if (tipo === 'reflejo') { ell(b, cx, 22, 4.5, 4.5, [200, 255, 214], 4); ell(b, cx, 22, 3, 3, [246, 255, 240], 4); for (let a = 0; a < 8; a++) set(b, cx + Math.cos(a * 0.785) * 6.5, 22 + Math.sin(a * 0.785) * 6.5, [200, 255, 214], 4); }
      else { ell(b, cx, 22, 3.2, 3.2, [12, 10, 12], 4); rect(b, cx - 3, 18, 2, 2, [255, 255, 255], 4); }
      for (let x = cx - 16; x <= cx + 16; x++) { const yy = 22 - Math.sqrt(Math.max(0, 1 - Math.pow((x - cx) / 16.5, 2))) * 9.5; set(b, x, yy, mix(SD, INK, 0.8), 4); set(b, x, yy - 1, mix(SD, INK, 0.5), 4); const y2 = 22 + Math.sqrt(Math.max(0, 1 - Math.pow((x - cx) / 16.5, 2))) * 9.5; set(b, x, y2, SD, 4); } });
    const u = url(b); cache[key] = u; return u;
  }
  function manos(skin, m, cicatriz) {
    const key = 'm' + JSON.stringify([skin, m, cicatriz]); if (cache[key]) return cache[key];
    const b = B(96, 64), sk = SKIN[skin], S = hx(sk[0]), SD = hx(sk[1]), SL = hx(sk[2]);
    const mano = (ox, lado, n, venda, anillo) => { const mir = lado === 'der' ? 1 : -1; // pulgar hacia el centro
      rect(b, ox - 12, 34, 24, 22, S, 1); ell(b, ox, 56, 12, 5, S, 1); rect(b, ox - 9, 58, 18, 6, SD, 1);
      const hs = n === 6 ? [15, 20, 22, 21, 18, 12] : [15, 21, 23, 20, 14]; const fw = n === 6 ? 3 : 4; const gap = n === 6 ? 4 : 5; const x0 = ox - (n * gap) / 2 + 0.5;
      // dedos (sin pulgar: n-1), el pulgar va al costado
      const dn = n - 1; for (let i = 0; i < dn; i++) { const fx = Math.round(ox - mir * (dn * gap) / 2 + mir * (i * gap) + (mir < 0 ? -fw + gap : 0)); const h = hs[i + 1] || 16; const xx = mir > 0 ? fx : fx; rect(b, xx, 36 - h, fw, h + 2, S, 1); rect(b, xx + fw - 1, 36 - h, 1, h, SD, 1); set(b, xx, 36 - h, SD, 1); if (m.unas && !venda) { rect(b, xx + 1, 37 - h, fw - 2, 3, SL, 4); set(b, xx + 1, 37 - h, [255, 255, 255], 4); } rect(b, xx, 36 - Math.round(h * 0.45), fw, 1, SD, 1); if (anillo && i === (n === 6 ? 2 : 2)) rect(b, xx - 1, 36 - 7, fw + 2, 3, [240, 196, 50], 4); }
      // pulgar
      const tx = ox + mir * 12; for (let i = 0; i < 12; i++) rect(b, tx + mir * Math.round(i * 0.45) - (mir < 0 ? 4 : 0), 46 - i, 5, 1, S, 1); if (m.unas && !venda) rect(b, tx + mir * 5 - (mir < 0 ? 3 : -1), 35, 3, 3, SL, 4);
      for (let y = 34; y < 58; y++) for (let x = ox - 12; x < ox + 12; x++) if ((x - ox) * 1 > 7 && (x + y) % 2) set(b, x, y, SD, 1, 1);
      rect(b, ox - 6, 40, 1, 1, SD, 1); rect(b, ox - 1, 39, 1, 1, SD, 1); rect(b, ox + 4, 40, 1, 1, SD, 1);
      if (venda) { for (let y = 20; y < 60; y++) for (let x = ox - 15; x < ox + 16; x++) { const k = y * 96 + x; if (b.p[k]) set(b, x, y, ((x + y * 2) % 7 < 1) ? [176, 170, 158] : [226, 221, 208], 5); } rect(b, ox - 4, 44, 5, 4, [150, 50, 44], 5); set(b, ox - 5, 46, [150, 50, 44], 5); }
    };
    mano(26, 'der', m.der, m.venda === 'der', m.anillo === 'der'); mano(70, 'izq', m.izq, m.venda === 'izq', m.anillo === 'izq');
    if (cicatriz) { const ox = cicatriz === 'der' ? 26 : 70; line(b, ox - 6, 44, ox + 5, 52, [250, 200, 196], 4); line(b, ox - 6, 45, ox + 4, 52, mix(SD, [90, 30, 30], 0.4), 4); }
    outline(b); const u = url(b); cache[key] = u; return u;
  }
  return { cara, ojos, manos };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = Z7ART;
