const Z = require('./engine.js');
let fails = 0, nV = 0, nC = 0, ends = {}, minT = 99, sumT = 0;
const FAIL = (seed, v, m) => { if (fails < 15) console.log('FAIL seed', seed, 'dia', v && v._d, v && Z.nomC(v.p), v && (v.copia ? 'COPIA ' + v.tells : 'HUMANO ' + v.ruido), m); fails++; };
function auditar(G, v, seed) {
  const T = Z.herramientas(G); v._d = G.dia; nV++;
  G.tel = 99; G.pilas = 99; G.consultas = 99; v.pac = 99;
  let guard = 0; while ((v.of.length || v.pool.length) && guard++ < 80) { const k = v.of[0]; if (!k) break; Z.preguntar(G, k); }
  const todas = v.asked.length; if (v.pool.length || v.of.length) FAIL(seed, v, 'quedaron preguntas ' + v.of + v.pool);
  Z.termometro(G); if (T.linterna) Z.linterna(G); if (T.manos) Z.verManos(G); if (T.bolso) Z.bolso(G);
  if (T.tel) { if (v.p.zona) Z.telefono(G, 'zona'); Z.telefono(G, 'central'); Z.telefono(G, 'central'); }
  if (T.res && v.link) Z.consultar(G);
  let chips = v.chips.concat(Z.mapaChips(G)); if (T.lista) chips = chips.concat(Z.listaChips(G));
  if (v.esp === 'retorno') chips = chips.concat(Z.archivoChips(G, G.res.find((r) => r.id === v.rid)));
  if (v.esp === 'hermana') chips = chips.concat(Z.cuadernoChips(G));
  const graves = [], menores = [];
  for (let i = 0; i < chips.length; i++) for (let j = i + 1; j < chips.length; j++) { const r = Z.cruzar(G, chips[i], chips[j]); if (r.res === 'grave') graves.push([chips[i], chips[j], r.txt]); if (r.res === 'menor') menores.push([chips[i], chips[j]]); }
  const fis = [];
  if (v.tC < 35) fis.push('temp'); if (T.linterna && v.ojos === 'reflejo') fis.push('ojos'); if (T.manos && (v.manos.izq !== 5 || v.manos.der !== 5 || !v.manos.unas)) fis.push('manos');
  if (Z.DIAS[G.dia].tipo === 'frio' && !v.aliento) fis.push('aliento');
  const foto = v.ficha || v.esp; if (foto && JSON.stringify(v.look.mark) + v.look.eyes + JSON.stringify(v.look.mark2 || 0) !== JSON.stringify(v.p.cara.mark) + v.p.cara.eyes + '0') fis.push('marca');
  if (v.rev.regMal) fis.push('registro'); if (v.rev.claveMal) fis.push('clave');
  if (!v.copia) {
    if (fis.length) FAIL(seed, v, 'humano con falla física ' + fis);
    graves.forEach((gx) => { const ks = [gx[0].key, gx[1].key]; const sk = v.sec ? { acomp: 'acomp', oficio: 'oficio', fam: 'fam' }[v.sec.k] : null; if (!sk || ks.indexOf(sk) < 0 || (gx[0].src !== 'dicho' && gx[1].src !== 'dicho')) FAIL(seed, v, 'humano con contradicción grave: ' + gx[0].txt + ' × ' + gx[1].txt + ' → ' + gx[2]); });
    if (v.tC >= 35 && v.tC < 36) FAIL(seed, v, 'temp ambigua');
  } else {
    nC++; const tipos = new Set(fis); graves.forEach((gx) => tipos.add('x:' + [gx[0].key, gx[1].key].sort().join('+')));
    if (tipos.size < 2) FAIL(seed, v, 'copia con <2 evidencias: ' + [...tipos] + ' | graves ' + graves.length);
    minT = Math.min(minT, tipos.size); sumT += tipos.size;
    // cada tell declarado debe ser detectable
    v.tells.forEach((t) => { const ok = { marca: fis.includes('marca'), temp: fis.includes('temp'), aliento: fis.includes('aliento'), ojos: fis.includes('ojos'), manos: fis.includes('manos') || graves.some((x) => x[0].key === 'anillo'), registro: fis.includes('registro'), clave: fis.includes('clave') }[t]; if (ok === false) FAIL(seed, v, 'tell no detectable: ' + t); if (ok === undefined && !graves.length) FAIL(seed, v, 'tell verbal sin contradicción: ' + t); });
  }
  // confrontaciones no deben romper
  graves.concat(menores).slice(0, 6).forEach((gx) => { const c = Z.hacerCruce(G, gx[0], gx[1]); const i = v.cruces.indexOf(c); if (i >= 0) { const r = Z.confrontar(G, i); if (!v.copia && r && r.tipo === 'evasiva') FAIL(seed, v, 'humano evasivo al confrontar'); } });
}
const N = +process.argv[2] || 300; const st = { c: 0, m: 0, p: 0, n: 0 };
for (let seed = 1; seed <= N; seed++) {
  let rr = seed * 7919; const rnd = () => { rr = (rr * 1103515245 + 12345) & 0x7fffffff; return rr / 0x7fffffff; };
  const pol = seed % 5; // 0 perfecto, 1 azar, 2 deja pasar todo, 3 rechaza todo
  const G = Z.nuevaPartida(seed);
  try {
    while (!G.fin && G.dia < 7) {
      Z.empezarDia(G); JSON.parse(JSON.stringify(G));
      while (G.cola.length) { const v = Z.llamar(G); if (!v) { G.reloj = 480; continue; } auditar(G, v, seed); G.reloj = 500;
        let d = pol === 0 ? (v.copia ? 'rechaza' : 'pasa') : pol === 1 ? (rnd() < 0.5 ? 'pasa' : rnd() < 0.7 ? 'rechaza' : 'cuarentena') : pol === 2 ? 'pasa' : pol === 4 ? (rnd() < 0.82 ? (v.copia ? 'rechaza' : 'pasa') : (v.copia ? 'pasa' : 'rechaza')) : 'rechaza'; if (d === 'cuarentena' && G.cuarentena.length >= 2) d = 'pasa'; Z.decidir(G, d); }
      Z.cerrarDia(G); const c = Z.candidatosTest(G); if (c.length && pol !== 2) { const sos = pol === 4 && G.ultPab ? c.filter((x) => x.donde.indexOf('Pabellón ' + G.ultPab) === 0) : []; const q = c.filter((x) => x.donde === 'Cuarentena'); const l = sos.length ? sos : q.length ? q : c; G.test = l[Math.floor(rnd() * l.length)].id; } G.racion = rnd() < 0.3 ? 0.5 : 1; Z.noche(G); if (G.pend === 'joel') Z.elegirJoel(G, rnd() < 0.5);
      const s2 = JSON.stringify(G); if (s2.indexOf('undefined') >= 0 || s2.indexOf('NaN') >= 0) FAIL(seed, null, 'undefined/NaN en estado');
      (G.eventos || []).forEach((e) => { if (/undefined|NaN|null/.test(e.txt)) FAIL(seed, null, 'evento roto: ' + e.txt); });
    }
    ends[pol + ':' + G.fin] = (ends[pol + ':' + G.fin] || 0) + 1; if (pol === 0) { st.c += G.comida; st.m += G.moral; st.p += Z.vivos(G).length; st.n++; }
  } catch (e) { FAIL(seed, G.cur, 'EXCEPCIÓN ' + e.stack.split('\n').slice(0, 3).join(' | ')); }
}
console.log('visitantes', nV, 'copias', nC, 'fallas', fails, 'min evidencias', minT, 'prom', (sumT / nC).toFixed(2)); console.log(ends);

console.log('perfecto: comida', (st.c/st.n).toFixed(1), 'moral', (st.m/st.n).toFixed(1), 'pob', (st.p/st.n).toFixed(1));
