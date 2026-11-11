/* ZONA 7 — motor generativo. Todo sale de una semilla. Estado 100% serializable. */
const Z7 = (() => {
  const NOM_M = ['Tomás', 'Raúl', 'Iván', 'Marcos', 'Elías', 'Bruno', 'Dante', 'Hugo', 'León', 'Félix', 'Simón', 'Óscar', 'Mateo', 'Julián', 'Andrés', 'Pablo', 'Víctor', 'Rubén', 'Samuel', 'Emilio', 'Darío', 'Ismael', 'Gael', 'Lucas', 'Ramiro', 'Esteban', 'Joel', 'Adrián', 'César', 'Nicolás'];
  const NOM_F = ['Marta', 'Elena', 'Laura', 'Irene', 'Sofía', 'Clara', 'Nora', 'Alba', 'Lucía', 'Vera', 'Inés', 'Julia', 'Sara', 'Paula', 'Emma', 'Olga', 'Rita', 'Noemí', 'Celia', 'Diana', 'Eva', 'Carla', 'Mónica', 'Teresa', 'Abril', 'Miriam', 'Lidia', 'Ana', 'Rosa', 'Valeria'];
  const APE = ['Ríos', 'Vega', 'Molina', 'Ortega', 'Salas', 'Navarro', 'Campos', 'Ibáñez', 'Paredes', 'Luna', 'Aguirre', 'Cabrera', 'Fuentes', 'Herrera', 'Medina', 'Rojas', 'Soto', 'Vargas', 'Bravo', 'Cortés', 'Duarte', 'Espinoza', 'Ferrer', 'Gallardo', 'Lozano', 'Marín', 'Núñez', 'Pardo', 'Quiroga', 'Serrano', 'Tapia', 'Urbina', 'Valdés', 'Zamora', 'Acosta', 'Benítez', 'Carmona', 'Delgado', 'Escobar', 'Figueroa', 'Guerrero', 'Lara', 'Mena', 'Olmos', 'Peña', 'Reyes', 'Sandoval', 'Toledo', 'Villar', 'Yáñez', 'Arce', 'Bustos', 'Cano', 'Durán', 'Miranda', 'Leiva', 'Robles', 'Sáez', 'Trejo', 'Vidal'];
  const BARRIOS = ['Barrio Norte', 'La Estación', 'Los Álamos', 'Villa Clara', 'El Mercado', 'Puerto Viejo', 'Las Acacias', 'San Gabriel', 'La Fábrica', 'Monte Alto', 'Los Olivos', 'El Molino'];
  const RUTAS = ['el Puente Sur', 'el Túnel de la Estación', 'la Ruta 9'];
  const CALLES = ['Los Tilos', 'Almendros', 'del Faro', 'Independencia', 'Las Heras', 'del Río', 'Mirador', 'Los Cedros', 'Colón', 'Santa Fe', 'del Parque', 'Olmos', 'Central', 'Las Rosas', 'del Carmen', 'Libertad'];
  const SANGRE = ['0+', '0-', 'A+', 'A-', 'B+', 'AB+'];
  const CLAVES = ['FAROL', 'ÁMBAR', 'NOGAL', 'TIZA', 'COBRE', 'BRUMA', 'ANCLA', 'CEDRO', 'LINO', 'GRANITO', 'TRIGO', 'VIDRIO'];
  const OFICIOS = [['panadero', 'panadera', 'a pan recién hecho y a harina tostada'], ['enfermero', 'enfermera', 'a alcohol y a guantes de látex'], ['mecánico', 'mecánica', 'a grasa y a nafta'], ['maestro', 'maestra', 'a tiza y a mandarina del recreo'], ['carpintero', 'carpintera', 'a aserrín y a cola'], ['cocinero', 'cocinera', 'a cebolla frita, siempre'], ['electricista', 'electricista', 'a cable quemado'], ['chofer', 'chofer', 'a tapizado viejo y a gasoil'], ['peluquero', 'peluquera', 'a tintura y a laca'], ['albañil', 'albañil', 'a cemento mojado'], ['librero', 'librera', 'a papel viejo y a polvo'], ['pescador', 'pescadora', 'a sal y a escamas'], ['farmacéutico', 'farmacéutica', 'a jarabe y a cartón'], ['jardinero', 'jardinera', 'a pasto cortado y a tierra'], ['veterinario', 'veterinaria', 'a desinfectante y a perro mojado'], ['costurero', 'costurera', 'a tela nueva y a aceite de máquina'], ['cartero', 'cartera', 'a cuero de bolso y a lluvia'], ['contador', 'contadora', 'a café recalentado'], ['soldador', 'soldadora', 'a metal caliente'], ['florista', 'florista', 'a agua de florero y a jazmín']];
  const HABITOS = ['Se metía debajo de la cama y no salía hasta el otro día', 'Se me subía encima y temblaba entero', 'Ladraba a la ventana como si pudiera echar a los truenos', 'Se escondía en el ropero, entre los zapatos', 'Nada. Dormía panza arriba. Era el único tranquilo de la casa', 'Arañaba la puerta del baño hasta que le abría'];
  const NOCHES = ['Debajo de un colectivo volcado. Olía a goma quemada', 'En el baño de una estación de servicio. No dormí: escuché', 'En un auto abandonado. Tenía una sillita de bebé atrás', 'Arriba de un árbol. Me até con el cinturón', 'En una iglesia. Había velas todavía tibias', 'En una zanja, tapándome con cartones mojados'];
  const MASC_N = ['Toby', 'Luna', 'Coco', 'Nina', 'Rocco', 'Mora', 'Pipo', 'Kira', 'Bruno', 'Mili', 'Simba', 'Frida', 'Olivo', 'Tango'];
  const TEMPS = ['calmo', 'nervioso', 'hosco', 'charlatan', 'cortes'];
  const COSTO = { pregunta: 8, termo: 4, linterna: 4, manos: 5, bolso: 6, tel: 15, res: 10, cruzar: 2, confrontar: 5, decidir: 3 };
  const DIAS = [null,
    { tipo: 'calma', nom: 'Calma', n: 4, copias: 2, nuevas: ['termo'] },
    { tipo: 'frio', nom: 'Helada', n: 5, copias: 2, nuevas: ['bolso', 'tel', 'lista', 'cuarentena'] },
    { tipo: 'ola', nom: 'Oleada', n: 7, copias: 3, nuevas: ['linterna', 'manos', 'res'], retorno: true, pareja: 1 },
    { tipo: 'apagon', nom: 'Apagón', n: 6, copias: 3, nuevas: [], pareja: 1 },
    { tipo: 'lluvia', nom: 'Lluvia', n: 5, copias: 2, nuevas: [], hermana: true },
    { tipo: 'exodo', nom: 'Éxodo', n: 8, copias: 4, nuevas: [], retorno: true, pareja: 2 },
    { tipo: 'final', nom: 'Último día', n: 6, copias: 3, nuevas: [], pareja: 1 }];
  const DIA_INFO = {
    calma: 'Poca gente en la fila. Tomate tu tiempo: hoy se aprende.',
    frio: 'Helada. El aliento de una persona empaña el vidrio de la ventanilla.',
    ola: 'Cayó un barrio entero durante la noche. La fila da vuelta la esquina y el día no alcanza para todos.',
    apagon: 'Apagón general. El teléfono no funciona hasta mañana.',
    lluvia: 'Llueve desde la madrugada. Mucha gente llega con fiebre. Tu hermana debería llegar hoy.',
    exodo: 'Una zona vecina dejó de transmitir. Vienen todos juntos, y vienen asustados.',
    final: 'El convoy de evacuación llega al anochecer. Lo que entre hoy, se sube al convoy.'
  };

  function mkR(G) {
    const R = {
      f() { G.rs = (G.rs + 0x6D2B79F5) | 0; let t = G.rs; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; },
      int(a, b) { return a + Math.floor(R.f() * (b - a + 1)); },
      pick(a) { return a[Math.floor(R.f() * a.length)]; },
      chance(p) { return R.f() < p; },
      shuf(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R.f() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    };
    return R;
  }
  const hoyInv = (G) => 17 + G.dia;
  const nomC = (p) => p.nom + ' ' + p.ape;
  const g = (p, m, f) => (p.sex === 'm' ? m : f);
  const ofi = (p) => OFICIOS[p.of][p.sex === 'm' ? 0 : 1];
  function lev(a, b) { const m = a.length, n = b.length; const d = []; for (let i = 0; i <= m; i++) d[i] = [i]; for (let j = 0; j <= n; j++) d[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; }

  // ---------- mundo ----------
  function genMundo(G, R) {
    const bs = R.shuf(BARRIOS).slice(0, 8).map((n) => ({ n, cae: R.int(4, 15), ruta: R.int(0, 2) }));
    const est = R.shuf(['activa', 'activa', 'activa', 'activa', 'activa', 'caida', 'caida', 'caida', 'silencio', 'silencio', 'silencio']);
    const zs = {}; let k = 0;
    for (let z = 1; z <= 12; z++) { if (z === 7) continue; const sex = R.chance(0.5) ? 'm' : 'f'; zs[z] = { z, estado: est[k++], cae: 0, dir: (sex === 'm' ? 'Dr. ' : 'Dra. ') + R.pick(APE) }; if (zs[z].estado === 'caida') zs[z].cae = R.int(9, 16); }
    const dirs = {}; Object.values(zs).forEach((x) => { while (dirs[x.dir]) x.dir = x.dir.split(' ')[0] + ' ' + R.pick(APE); dirs[x.dir] = 1; });
    G.mundo = { barrios: bs, zonas: zs, claves: R.shuf(CLAVES).slice(0, 8) };
  }
  function nombreUnico(G, R, sex) {
    for (let i = 0; i < 200; i++) { const nom = R.pick(sex === 'm' ? NOM_M : NOM_F), ape = R.pick(APE); const k = nom + ' ' + ape; if (!G.usados[k]) { G.usados[k] = 1; return [nom, ape]; } }
    const nom = R.pick(NOM_M), ape = R.pick(APE) + ' ' + R.pick(APE); G.usados[nom + ' ' + ape] = 1; return [nom, ape];
  }
  function genCara(R, sex, edad) {
    const lat = ['mejilla', 'ceja', 'sien', 'boca'];
    return { sex, skin: R.int(0, 5), hair: edad > 58 && R.chance(0.7) ? 6 : R.int(0, 5), hs: sex === 'm' ? R.pick([0, 1, 2, 3, 4, 8]) : R.pick([4, 5, 6, 7, 8, 9]), fs: R.int(0, 3), eyes: R.int(0, 3), brow: R.int(0, 2), nose: R.int(0, 3), mouth: R.int(0, 3), beard: sex === 'm' ? R.pick([0, 0, 0, 2, 3]) : 0, glasses: R.chance(0.18), old: edad > 50 ? (edad > 62 ? 2 : 1) : 0, cloth: R.int(0, 7), cs: R.int(0, 2), mark: R.chance(0.7) ? { t: R.pick(['lunar', 'lunar', 'cicatriz', 'mancha']), pos: R.pick(lat), side: R.chance(0.5) ? -1 : 1 } : null, acc: R.pick([null, null, null, 'gorro', 'bufanda', 'aro']) };
  }
  function genPersona(G, R, o) {
    o = o || {}; const M = G.mundo; const hoy = hoyInv(G);
    const sex = o.sex || (R.chance(0.5) ? 'm' : 'f'); let [nom, ape] = nombreUnico(G, R, sex); if (o.ape) { let t = 0; while (G.usados[nom + ' ' + o.ape] && t++ < 99) nom = R.pick(sex === 'm' ? NOM_M : NOM_F); }
    const edad = R.int(19, 70); const b = o.barrio !== undefined ? o.barrio : R.int(0, M.barrios.length - 1); const B = M.barrios[b];
    const p = { sex, nom, ape: o.ape || ape, edad, of: R.int(0, OFICIOS.length - 1), b, calle: R.pick(CALLES) + ' ' + R.int(100, 990), sangre: R.pick(SANGRE), salida: Math.max(2, B.cae - R.int(0, 3)), zona: 0, zsal: 0, fam: [], mascota: null, acomp: [], temp: R.pick(TEMPS), anillo: R.chance(0.4) ? R.pick(['izq', 'der']) : null };
    if (o.ape) G.usados[nom + ' ' + o.ape] = 1;
    let zona = o.zona !== undefined ? o.zona : (R.chance(0.6) ? -1 : 0);
    if (zona === -1) { const ok = Object.values(M.zonas).filter((z) => z.estado !== 'caida' || z.cae > p.salida + 1); zona = ok.length ? R.pick(ok).z : 0; }
    if (zona) { const Z = M.zonas[zona]; if (Z.estado === 'caida' && Z.cae <= p.salida + 1) p.salida = Math.max(2, Z.cae - 2); p.zona = zona; p.zsal = Z.estado === 'caida' ? R.int(Math.max(p.salida + 1, Z.cae - 2), Z.cae) : R.int(p.salida + 1, hoy - 1); }
    const rels = R.shuf([g(p, 'esposa', 'esposo'), 'hija', 'hijo', 'madre', 'hermano', 'hermana', 'padre']); const nf = R.pick([0, 1, 1, 2, 2, 3]);
    for (let i = 0; i < nf; i++) { const rel = rels[i]; const fs = /a$/.test(rel) && rel !== 'esposo' ? 'f' : (rel === 'madre' ? 'f' : 'm'); let n; do { n = R.pick(fs === 'm' ? NOM_M : NOM_F); } while (n === nom || p.fam.some((x) => x.nom === n)); p.fam.push({ rel, nom: n }); }
    if (R.chance(0.5)) { let n; do { n = R.pick(MASC_N); } while (p.fam.some((x) => x.nom === n)); p.mascota = { tipo: R.pick(['perro', 'perro', 'gato']), nom: n, hab: R.pick(HABITOS) }; }
    if (p.fam.length && R.chance(0.5)) p.perdida = p.fam[R.int(0, p.fam.length - 1)].nom;
    if (p.zona && R.chance(0.45)) { const n = R.int(1, 2); for (let i = 0; i < n; i++) { let x; do { x = R.pick(R.chance(0.5) ? NOM_M : NOM_F); } while (x === nom || p.acomp.indexOf(x) >= 0); p.acomp.push(x); } }
    p.noche = R.pick(NOCHES); p.cara = genCara(R, sex, edad);
    return p;
  }

  // ---------- visitantes ----------
  const chip = (src, key, val, txt, ex) => Object.assign({ src, key, val, txt }, ex || {});
  function herramientas(G) { const t = { termo: 1, mapa: 1 }; for (let d = 1; d <= G.dia; d++) DIAS[d].nuevas.forEach((x) => { t[x] = 1; }); if (DIAS[G.dia].tipo === 'apagon') delete t.tel; return t; }
  function genVisitante(G, R, o) {
    o = o || {}; const T = herramientas(G); const dia = G.dia; const M = G.mundo;
    const p = o.p || genPersona(G, R, o.po);
    const v = { id: 'v' + (G.nid++), p, copia: !!o.copia, nivel: 0, tells: [], trucos: [], ruido: [], esp: o.esp || null, ficha: true, salvo: !!p.zona, items: [], look: JSON.parse(JSON.stringify(p.cara)), st: {}, tC: 36.1 + R.int(0, 11) / 10, ojos: 'normal', manos: { izq: 5, der: 5, unas: true, anillo: p.anillo, venda: null }, aliento: true, mal: {}, sec: null, shock: false, link: null, fichaTypo: null, pac: p.temp === 'hosco' ? 5 : p.temp === 'charlatan' ? 8 : R.int(6, 7), asked: [], chips: [], cruces: [], pool: [], of: [], rev: {}, plano: false, dec: null };
    // pertenencias
    const its = [];
    if (p.fam.length || p.mascota) its.push('foto'); its.push('carta'); if (R.chance(0.5)) its.push('placa'); its.push(R.pick(['llaves', 'comida', 'remedio', 'radio', 'manta']));
    v.items = R.shuf(its).slice(0, 3); if ((p.fam.length || p.mascota) && v.items.indexOf('foto') < 0 && R.chance(0.6)) v.items[0] = 'foto';
    if (T.res && !v.esp && R.chance(0.3)) { const rs = G.res.filter((x) => x.viva && !x.fuera); if (rs.length) { const r = R.pick(rs); v.link = { id: r.id, rel: R.pick(['vecino', 'vecina', 'compañero de trabajo', 'amigo de la familia']).replace(/o$|a$/, (m) => (r.p.sex === 'm' ? 'o' : 'a')) }; } }
    if (v.esp === 'retorno' || v.esp === 'hermana') { v.ficha = false; v.salvo = false; }
    // estados cosméticos (humanos y copias)
    if (R.chance(0.3)) v.st.sucio = 1; if (p.sex === 'm' && !p.cara.beard && R.chance(0.3)) v.st.barba = 1; if (R.chance(0.2)) v.st.ojeras = 1;
    if (!v.copia) {
      const lluvia = DIAS[dia].tipo === 'lluvia';
      if (R.chance(lluvia ? 0.5 : 0.22)) { v.ruido.push('fiebre'); v.tC = 37.8 + R.int(0, 14) / 10; }
      if (T.manos && R.chance(0.2)) { v.ruido.push('venda'); v.manos.venda = v.manos.anillo === 'izq' ? 'der' : 'izq'; }
      if (T.linterna && R.chance(0.2)) { v.ruido.push('ojosrojos'); v.ojos = 'rojos'; }
      if (v.ficha && dia >= 2 && R.chance(0.2)) { v.ruido.push('typo'); v.fichaTypo = R.chance(0.5) ? 'edad' : 'nombre'; }
      if (T.lista && R.chance(0.2)) { v.ruido.push('desap'); G.desap.push({ nom: nomC(p), edad: p.edad, b: p.b }); }
      if (T.lista && R.chance(0.15)) { v.ruido.push('homonimo'); const sx = R.chance(0.5) ? 'm' : 'f'; let n; do { n = R.pick(sx === 'm' ? NOM_M : NOM_F); } while (n === p.nom || G.usados[n + ' ' + p.ape]); G.usados[n + ' ' + p.ape] = 1; G.fallecidos.push({ nom: n + ' ' + p.ape, edad: R.int(20, 70), b: p.b }); }
      if (dia >= 2 && !v.esp && v.ficha && R.chance(0.12) && (T.tel || v.link || v.salvo)) { v.ruido.push('sindoc'); v.ficha = false; }
      if (dia >= 3 && R.chance(0.12)) { v.ruido.push('shock'); v.shock = true; }
      if (dia >= 2 && !v.esp && R.chance(0.2)) {
        const ops = []; if (v.salvo && p.acomp.length) ops.push('acomp'); if (v.ficha) ops.push('oficio'); if (v.items.indexOf('foto') >= 0 && p.fam.length) ops.push('fam');
        if (ops.length) { v.sec = { k: R.pick(ops) }; v.ruido.push('secreto'); if (v.sec.k === 'oficio') { let x; do { x = R.pick([1, 12, 14, 2, 6]); } while (x === p.of); v.sec.of = x; } }
      }
    } else aplicarCopia(G, R, v, T, o);
    armarPreguntas(G, R, v, T);
    return v;
  }
  function aplicarCopia(G, R, v, T, o) {
    const p = v.p, dia = G.dia, M = G.mundo;
    v.nivel = Math.max(1, Math.min(5, R.int(1, 2) + Math.floor(dia / 2) + (R.chance(0.3) ? 1 : 0)));
    v.plano = v.nivel <= 3;
    const fotoSrc = v.ficha || v.esp; const sup = G.sup || [];
    const cat = [];
    if (fotoSrc) cat.push('marca');
    cat.push('temp');
    if (DIAS[dia].tipo === 'frio') cat.push('aliento');
    if (T.linterna) cat.push('ojos');
    if (T.manos) cat.push('manos');
    if (T.lista && !v.esp) cat.push('muerto');
    if (!v.esp) cat.push('salida');
    if (v.salvo) cat.push('zona');
    if (v.ficha) cat.push('edad');
    if (v.nivel <= 3 && !v.esp) cat.push('trampa');
    if (T.tel && v.salvo && M.zonas[p.zona].estado === 'activa') cat.push(R.chance(0.5) ? 'registro' : 'clave');
    if (T.bolso && v.items.indexOf('foto') >= 0 && (p.fam.length || p.mascota)) cat.push('dato');
    if (v.ficha) cat.push('calle');
    if (v.salvo && p.acomp.length) cat.push('acompD');
    if (v.esp === 'hermana') cat.push('h1', 'h2');
    if (v.esp === 'retorno') cat.push('r1', 'r2');
    const GRUPO = { temp: 'termo', ojos: 'linterna', manos: 'manos', registro: 'tel', clave: 'tel', salida: 'mapa', zona: 'mapa', muerto: 'lista', trampa: 'trampa', dato: 'bolso' };
    let libres = cat.filter((t) => sup.indexOf(GRUPO[t]) < 0);
    if (libres.length < 2) libres = cat;
    const baratas = ['marca', 'temp', 'aliento', 'edad', 'zona', 'ojos', 'manos'];
    let n = v.nivel <= 2 ? 3 : (v.nivel === 3 ? R.int(2, 3) : 2); if (v.esp) n = 3;
    let el = R.shuf(libres);
    if (dia <= 2) { const b = el.filter((t) => baratas.indexOf(t) >= 0); const r = el.filter((t) => baratas.indexOf(t) < 0); el = b.slice(0, 1).concat(R.shuf(b.slice(1).concat(r))); }
    if (v.esp === 'hermana') el = ['h1'].concat(el.filter((t) => t !== 'h1'));
    if (v.esp === 'retorno') el = ['r1'].concat(el.filter((t) => t !== 'r1'));
    v.tells = el.slice(0, Math.min(n, el.length));
    // todo lo que NO es tell queda limpio
    v.tells.forEach((t) => {
      if (t === 'marca') { const m = v.look.mark; const op = m ? R.pick(['espejo', 'espejo', 'falta']) : R.pick(['ojo', 'extra']); v.marcaVar = op; if (op === 'espejo') m.side = -m.side; else if (op === 'falta') v.look.mark = null; else if (op === 'ojo') v.look.eyes = (v.look.eyes + 2) % 4; else v.look.mark2 = { t: 'lunar', pos: 'mejilla', side: R.chance(0.5) ? -1 : 1 }; }
      if (t === 'temp') v.tC = 33.2 + R.int(0, 16) / 10;
      if (t === 'aliento') v.aliento = false;
      if (t === 'ojos') v.ojos = 'reflejo';
      if (t === 'manos') { const op = v.manos.anillo && v.ficha ? R.pick(['seis', 'unas', 'anillo']) : R.pick(['seis', 'unas']); v.manosVar = op; if (op === 'seis') v.manos[R.chance(0.5) ? 'izq' : 'der'] = 6; else if (op === 'unas') v.manos.unas = false; else v.manos.anillo = v.manos.anillo === 'izq' ? 'der' : 'izq'; }
      if (t === 'muerto') G.fallecidos.push({ nom: nomC(p), edad: p.edad, b: p.b });
      if (t === 'salida') v.mal.salida = Math.min(hoyInv(G) - 1, M.barrios[p.b].cae + R.int(1, 3));
      if (t === 'zona') { const Z = M.zonas[p.zona]; if (Z.estado === 'caida' && R.chance(0.6)) v.salvoFecha = Math.min(hoyInv(G) - 1, Z.cae + R.int(1, 2)); else { let d; do { d = (R.chance(0.5) ? 'Dr. ' : 'Dra. ') + R.pick(APE); } while (d === Z.dir || d.split(' ')[1] === Z.dir.split(' ')[1]); v.salvoFirma = d; } if (v.salvoFecha && v.salvoFecha <= Z.cae) { delete v.salvoFecha; v.salvoFirma = 'Dr. ' + (Z.dir.split(' ')[1] === 'Mora' ? 'Pinto' : 'Mora'); } }
      if (t === 'edad') v.mal.edad = p.edad + (R.chance(0.5) ? 1 : -1) * R.int(5, 11);
      if (t === 'trampa') v.cae = true;
      if (t === 'registro') v.reg = R.pick(['nofigura', 'fallecio']);
      if (t === 'clave') v.telFalso = true;
      if (t === 'dato') { if (p.mascota && (R.chance(0.5) || !p.fam.length)) { let n; do { n = R.pick(MASC_N); } while (n === p.mascota.nom); v.mal.mascota = n; } else { const f = p.fam[0]; let n; do { n = R.pick(/a$/.test(f.rel) || f.rel === 'madre' ? NOM_F : NOM_M); } while (p.fam.some((x) => x.nom === n) || n === p.nom); v.mal.fam = n; } }
      if (t === 'calle') { let c; do { c = R.pick(CALLES) + ' ' + R.int(100, 990); } while (c.split(' ').slice(0, -1).join(' ') === p.calle.split(' ').slice(0, -1).join(' ')); v.mal.calle = c; }
      if (t === 'acompD') v.mal.acomp = 0;
    });
    if (v.tells.indexOf('dato') >= 0 && v.items.indexOf('foto') < 0) v.items[0] = 'foto';
    if (v.tells.indexOf('temp') < 0 && R.chance(0.3)) v.trucos.push('fiebre');
    if (v.nivel >= 3 && !v.esp && R.chance(0.3) && v.tells.indexOf('dato') < 0 && v.tells.indexOf('calle') < 0) { v.trucos.push('amnesia'); v.shock = true; }
    if (R.chance(0.25)) v.trucos.push('contraacusa');
    if (R.chance(0.3)) v.trucos.push('emocional');
  }
  const QTXT = {
    origen: ['¿De dónde venís?', '¿Dónde vivías antes de todo esto?'], salida: ['¿Qué día dejaste tu barrio?', '¿Cuándo saliste de tu casa?'], ruta: ['¿Por dónde saliste de la ciudad?', '¿Qué camino tomaste para salir?'],
    oficio: ['¿A qué te dedicabas?', '¿De qué trabajabas?'], olor: ['¿A qué olía tu trabajo?'], fam: ['¿Con quién vivías?', '¿Quién es tu familia?'], mascota: ['¿Tenías algún animal?'], habito: ['¿Qué hacía cuando había tormenta?'],
    acomp: ['¿Viajaste con alguien?', '¿Venías con alguien más?'], calle: ['¿En qué calle vivías?'], director: ['¿Quién dirige la zona de la que venís?'], zsal: ['¿Qué día saliste de esa zona?'], sentir: ['¿Qué sentiste la noche que cayó tu barrio?'],
    perdida: ['¿Perdiste a alguien?'], salud: ['¿Estás enfermo o herido?'], conoce: ['¿Conocés a alguien acá adentro?'], edad: ['¿Cuántos años tenés?'], sangre: ['¿Cuál es tu grupo sanguíneo?'], porque: ['¿Por qué tendría que dejarte pasar?'], noche: ['¿Dónde dormiste anoche?'],
    trampa: [''], h_perro: ['¿Cómo se llamaba nuestro perro?'], h_cancion: ['¿Qué nos cantaba mamá para dormir?'], h_calle: ['¿En qué calle crecimos?'], r_pab: ['¿En qué pabellón dormís?'], r_vecino: ['¿Quién duerme en la cama de al lado?']
  };
  const QCAT = { origen: 'Origen', salida: 'Origen', ruta: 'Origen', oficio: 'Vida', olor: 'Memoria', fam: 'Familia', mascota: 'Familia', habito: 'Memoria', acomp: 'Viaje', calle: 'Vida', director: 'Viaje', zsal: 'Viaje', sentir: 'Memoria', perdida: 'Familia', salud: 'Cuerpo', conoce: 'Refugio', edad: 'Vida', sangre: 'Cuerpo', porque: 'Presión', noche: 'Memoria', trampa: 'Trampa', h_perro: 'Infancia', h_cancion: 'Infancia', h_calle: 'Infancia', r_pab: 'Refugio', r_vecino: 'Refugio' };
  function armarPreguntas(G, R, v, T) {
    const p = v.p; let q = ['origen', 'salida', 'ruta', 'oficio', 'fam', 'mascota', 'calle', 'sentir', 'perdida', 'salud', 'edad', 'sangre', 'porque', 'noche', 'acomp'];
    if (p.zona) q.push('director', 'zsal'); if (T.res) q.push('conoce');
    if (v.esp === 'hermana') q = ['h_perro', 'h_cancion', 'h_calle', 'sentir', 'salud', 'noche', 'ruta', 'porque', 'acomp'];
    if (v.esp === 'retorno') q = ['r_pab', 'r_vecino', 'oficio', 'salud', 'noche', 'fam', 'mascota', 'sentir', 'edad', 'sangre'];
    q = R.shuf(q);
    if (!v.esp) {
      const M = G.mundo; let tr;
      if (p.zona) { let d; do { d = (R.chance(0.5) ? 'Dr. ' : 'Dra. ') + R.pick(APE); } while (d.split(' ')[1] === M.zonas[p.zona].dir.split(' ')[1]); tr = { k: 'director', falso: d, txt: 'A vos te firmó el salvoconducto ' + (d[2] === '.' ? 'el ' : 'la ') + d + ', ¿no?' }; }
      else { const f = (M.barrios[p.b].ruta + 1 + R.int(0, 1)) % 3; tr = { k: 'ruta', falso: f, txt: 'Tu barrio evacuó por ' + RUTAS[f] + ', ¿verdad?' }; }
      v.tr = tr; q.splice(R.int(1, 4), 0, 'trampa');
    }
    v.qv = {}; q.concat(['olor', 'habito']).forEach((k) => { v.qv[k] = R.int(0, QTXT[k].length - 1); });
    v.pool = q; v.of = v.pool.splice(0, 6);
  }
  function qTexto(v, k) { return k === 'trampa' ? v.tr.txt : QTXT[k][v.qv[k] || 0]; }

  // ---------- respuestas ----------
  function deco(v, R, s, alt) {
    const t = v.p.temp;
    if (v.copia && v.plano) return alt || s;
    if (t === 'nervioso') return R.pick(['Eh… ', 'Yo… ', 'Perdón, estoy temblando. ', '']) + s.replace(/\. /, '… ');
    if (t === 'hosco') return s + R.pick(['', '', ' ¿Algo más?', ' Ya está en los papeles.']);
    if (t === 'charlatan') return s + R.pick([' Uno nunca piensa que le va a tocar, ¿no?', ' Disculpe, hablo mucho cuando tengo miedo.', ' Mi madre decía que hablando se espanta el frío.', '']);
    if (t === 'cortes') return R.pick(['Sí, cómo no. ', 'Con gusto. ', '']) + s;
    return s;
  }
  function responder(G, v, k) {
    const R = mkR(G), p = v.p, M = G.mundo, B = M.barrios[p.b]; const out = { txt: '', chips: [], abre: [] };
    const C = (key, val, txt, ex) => out.chips.push(chip('dicho', key, val, 'Dijo: ' + txt, ex));
    const evade = v.shock && ['fam', 'mascota', 'perdida', 'sentir', 'habito', 'olor'].indexOf(k) >= 0;
    if (evade) { out.txt = v.copia ? 'No recuerdo. Hay partes que no recuerdo.' : R.pick(['No… no puedo hablar de eso. Todavía no.', 'No me haga volver ahí. Por favor.', '(Mira al piso. No contesta.)']); return out; }
    if (k === 'origen') { out.txt = deco(v, R, 'De ' + B.n + '. Calle ' + p.calle.split(' ').slice(0, -1).join(' ') + '.' + (p.zona ? ' Después estuve en la Zona ' + p.zona + '.' : ' Vine directo, caminando.'), 'Vengo de ' + B.n + '.' + (p.zona ? ' Estuve en la Zona ' + p.zona + '.' : '')); C('barrio', p.b, B.n); if (p.zona) C('zona', p.zona, 'estuvo en la Zona ' + p.zona); }
    else if (k === 'salida') { const d = v.mal.salida || p.salida; out.txt = deco(v, R, 'El día ' + d + ' de la invasión. ' + R.pick(['De madrugada.', 'Con lo puesto.', 'Cuando empezaron los gritos en la esquina.']), 'Dejé mi barrio el día ' + d + ' de la invasión.'); C('salida', d, 'dejó ' + B.n + ' el día ' + d, { b: p.b }); }
    else if (k === 'ruta') { out.txt = deco(v, R, 'Por ' + RUTAS[B.ruta] + '. ' + R.pick(['Había autos abandonados por todos lados.', 'No miré atrás.', 'Éramos cientos.']), 'Salí por ' + RUTAS[B.ruta] + '.'); C('ruta', B.ruta, 'salió por ' + RUTAS[B.ruta], { b: p.b }); }
    else if (k === 'oficio') { const of = v.sec && v.sec.k === 'oficio' ? v.sec.of : p.of; const o = OFICIOS[of][p.sex === 'm' ? 0 : 1]; out.txt = deco(v, R, 'Era ' + o + '. ' + R.pick(['Veintitantos años en lo mismo.', 'No sé hacer otra cosa.', 'Puedo ser útil acá.']), 'Mi ocupación era ' + o + '.'); C('oficio', of, 'era ' + o); out.abre.push('olor'); }
    else if (k === 'olor') { out.txt = v.copia ? (v.nivel >= 4 ? 'A lo de siempre. No sé cómo explicarlo.' : 'Mi trabajo no tenía un olor en particular.') : deco(v, R, 'Olía ' + OFICIOS[p.of][2] + '. Todavía lo tengo en la ropa, creo.'); }
    else if (k === 'fam') {
      if (v.sec && v.sec.k === 'fam') { out.txt = deco(v, R, 'Con nadie. Vivía ' + g(p, 'solo', 'sola') + '.'); C('fam', '', 'vivía ' + g(p, 'solo', 'sola')); }
      else if (!p.fam.length) { out.txt = deco(v, R, g(p, 'Solo', 'Sola') + '. Hace años.', 'Vivía sin compañía.'); C('fam', '', 'vivía ' + g(p, 'solo', 'sola')); }
      else if (v.copia && v.nivel <= 2 && !v.mal.fam) { out.txt = 'Con mi familia. ' + p.fam.map((f) => 'Mi ' + f.rel).join('. ') + '.'; }
      else { const fs = p.fam.map((f, i) => ({ rel: f.rel, nom: i === 0 && v.mal.fam ? v.mal.fam : f.nom })); out.txt = deco(v, R, 'Con ' + fs.map((f) => 'mi ' + f.rel + ' ' + f.nom).join(' y ') + '.', 'Vivía con ' + fs.map((f) => 'mi ' + f.rel + ', ' + f.nom).join('; ') + '.'); C('fam', fs.map((f) => f.nom).join('|'), 'vivía con ' + fs.map((f) => f.nom).join(', ')); }
    }
    else if (k === 'mascota') { if (!p.mascota) { out.txt = deco(v, R, 'No. Nunca tuve.', 'No tenía animales.'); C('mascota', '', 'no tenía animales'); } else { const n = v.mal.mascota || p.mascota.nom; out.txt = deco(v, R, 'Un ' + p.mascota.tipo. replace('perro', 'perro').replace('gato', 'gato') + '. ' + n + '. ' + R.pick(['No pude traerlo.', 'Se quedó en la casa.', 'Lo solté para que corriera.']), 'Tenía un ' + p.mascota.tipo + ' llamado ' + n + '.'); C('mascota', n, 'su ' + p.mascota.tipo + ' se llamaba ' + n); out.abre.push('habito'); } }
    else if (k === 'habito') { out.txt = v.copia ? (v.nivel >= 4 ? 'Se asustaba. Como todos los animales.' : 'Lo normal. Lo que hacen los animales.') : deco(v, R, p.mascota.hab + '.'); }
    else if (k === 'acomp') { const lie = v.sec && v.sec.k === 'acomp'; const n = lie || v.mal.acomp === 0 ? 0 : p.acomp.length; if (!n) { out.txt = deco(v, R, g(p, 'Solo', 'Sola') + '. Todo el camino.', 'Viajé sin compañía.'); C('acomp', 0, 'viajó ' + g(p, 'solo', 'sola')); } else { out.txt = deco(v, R, 'Con ' + p.acomp.join(' y ') + '. ' + R.pick(['Nos separamos en un control.', 'No llegaron.', 'Los perdí de vista una noche.']), 'Viajé con ' + n + (n > 1 ? ' personas' : ' persona') + ': ' + p.acomp.join(', ') + '.'); C('acomp', n, 'viajó con ' + n + (n > 1 ? ' personas' : ' persona')); } }
    else if (k === 'calle') { const c = v.mal.calle || p.calle; out.txt = deco(v, R, c + '. ' + R.pick(['La casa de rejas verdes.', 'Frente a la plaza.', 'Arriba de un kiosco.']), 'Vivía en ' + c + '.'); C('calle', c, 'vivía en ' + c); }
    else if (k === 'director') { const Z = M.zonas[p.zona]; out.txt = deco(v, R, (Z.dir[2] === '.' ? 'El ' : 'La ') + Z.dir + '. ' + R.pick(['Casi no se lo veía.', 'Firmaba todo sin mirar.', 'Buena persona, creo.']), 'La Zona ' + p.zona + ' la dirige ' + Z.dir + '.'); C('director', Z.dir, 'la Zona ' + p.zona + ' la dirige ' + Z.dir, { z: p.zona }); }
    else if (k === 'zsal') { const d = v.salvoFecha || p.zsal; out.txt = deco(v, R, 'El día ' + d + '. ' + R.pick(['Ya no había lugar.', 'Nos dijeron que acá había camas.', 'Salimos de noche.']), 'Salí de la Zona ' + p.zona + ' el día ' + d + '.'); C('zsal', d, 'salió de la Zona ' + p.zona + ' el día ' + d, { z: p.zona }); }
    else if (k === 'sentir') { out.txt = v.copia ? (v.nivel >= 5 ? 'Miedo. Tuve miedo.' : B.n + ' cayó el día ' + B.cae + ' de la invasión. Evacuó por ' + RUTAS[B.ruta] + '.') : deco(v, R, R.pick(['Vergüenza. Corrí y no golpeé ninguna puerta.', 'Nada. Eso es lo peor: no sentí nada hasta dos días después.', 'Bronca. Dejé la comida servida en la mesa.', 'Frío. Un frío acá, en el pecho, que no se me fue más.', 'Pensé en mi madre. No sé por qué. Murió hace años.'])); }
    else if (k === 'perdida') { if (p.perdida) { const f = p.fam.find((x) => x.nom === p.perdida); out.txt = v.copia && v.nivel <= 3 ? 'Sí. Perdí a mi ' + f.rel + '.' : deco(v, R, 'A ' + (v.mal.fam && p.fam[0].nom === p.perdida ? v.mal.fam : p.perdida) + ', mi ' + f.rel + '. ' + R.pick(['Le solté la mano en el puente.', 'Volvió a buscar los documentos. No salió.', 'No quiero decir más.'])); } else out.txt = deco(v, R, R.pick(['A todos y a nadie. No sé dónde está nadie.', 'Todavía no lo sé. Eso es lo que no me deja dormir.']), 'No tengo constancia de pérdidas.'); }
    else if (k === 'salud') { const fie = v.ruido.indexOf('fiebre') >= 0, fing = v.trucos.indexOf('fiebre') >= 0; if (fie) out.txt = deco(v, R, R.pick(['Tengo fiebre desde ayer. Es por la lluvia, nada más.', 'Un poco de fiebre. Dormí mojado dos noches.'])); else if (fing) out.txt = 'Tengo fiebre. Por eso mi temperatura puede dar distinta.'; else if (v.manos.venda) out.txt = deco(v, R, 'La mano. Me corté con una chapa saltando un alambrado.'); else out.txt = deco(v, R, R.pick(['Cansancio. Nada más.', 'Hambre. ¿Cuenta?', 'Estoy bien.']), 'Mi estado de salud es normal.'); if (fie || fing) C('fiebre', 1, 'tiene fiebre'); }
    else if (k === 'conoce') { if (v.link) { const r = G.res.find((x) => x.id === v.link.id); out.txt = deco(v, R, 'A ' + nomC(r.p) + '. ' + (r.p.sex === 'm' ? 'Era' : 'Era') + ' mi ' + v.link.rel + '. Pregúntele.', 'Conozco a ' + nomC(r.p) + '.'); v.rev.link = 1; } else out.txt = deco(v, R, 'No. A nadie.', 'No conozco a nadie adentro.'); }
    else if (k === 'edad') { const e = v.mal.edad || p.edad; out.txt = deco(v, R, e + '. ' + R.pick(['Aunque parezco más.', 'Cumplí hace poco. No hubo torta.', '']), 'Tengo ' + e + ' años.'); C('edad', e, 'tiene ' + e + ' años'); }
    else if (k === 'sangre') { out.txt = deco(v, R, p.sangre + '. ' + R.pick(['Doné muchas veces.', 'Lo tengo anotado en la ficha.', '']), 'Mi grupo sanguíneo es ' + p.sangre + '.'); C('sangre', p.sangre, 'su sangre es ' + p.sangre); }
    else if (k === 'porque') { out.txt = v.copia ? (v.trucos.indexOf('emocional') >= 0 ? 'Por favor. Hay algo ahí afuera. Por favor. Abra.' : 'Porque cumplo los requisitos de ingreso.') : deco(v, R, R.pick(['Porque no tengo adónde volver.', 'Porque sé trabajar. Puedo ser útil.', 'No tiene por qué. Pero se lo pido igual.', 'Porque si me quedo afuera esta noche, mañana no estoy.'])); }
    else if (k === 'noche') { out.txt = v.copia ? (v.nivel >= 4 ? 'En un auto. Hacía frío.' : 'Afuera. En el camino.') : deco(v, R, p.noche + '.'); }
    else if (k === 'trampa') { const tr = v.tr; const real = tr.k === 'director' ? M.zonas[p.zona].dir : RUTAS[B.ruta];
      if (v.cae) { out.txt = tr.k === 'director' ? 'Sí. ' + tr.falso + '.' : 'Sí. Por ' + RUTAS[tr.falso] + '.'; if (tr.k === 'director') C('director', tr.falso, 'le firmó ' + tr.falso, { z: p.zona }); else C('ruta', tr.falso, 'su barrio evacuó por ' + RUTAS[tr.falso], { b: p.b }); }
      else { out.txt = deco(v, R, tr.k === 'director' ? '¿' + tr.falso.split(' ')[1] + '? No. Firmó ' + real + '.' : 'No. Salimos por ' + real + '.', 'No. ' + (tr.k === 'director' ? 'Firmó ' + real : 'Fue por ' + real) + '.'); if (tr.k === 'director') C('director', real, 'le firmó ' + real, { z: p.zona }); else C('ruta', B.ruta, 'su barrio evacuó por ' + real, { b: p.b }); } }
    else if (k[0] === 'h') { const H = G.hermana, key = k.slice(2); const bad = v.copia && (v.tells.indexOf('h1') >= 0 && key === v.hk1 || v.tells.indexOf('h2') >= 0 && key === v.hk2); const val = bad ? H.falso[key] : H.inf[key]; out.txt = bad ? val + '.' : R.pick({ perro: [val + '. Se comió tus zapatillas nuevas, ¿te acordás?', val + '. Dormía en tu cama, no en la mía.'], cancion: ['«' + val + '». Desafinaba horrible.', '«' + val + '». Vos te dormías antes del final.'], calle: [val + '. La casa del portón azul.', val + '. La del árbol que tiraste con la bici.'] }[key]); C('h_' + key, val, key === 'perro' ? 'el perro se llamaba ' + val : key === 'cancion' ? 'mamá cantaba «' + val + '»' : 'crecieron en ' + val); }
    else if (k === 'r_pab' || k === 'r_vecino') { const r = G.res.find((x) => x.id === v.rid); const key = k.slice(2); const bad = v.copia && (v.tells.indexOf('r1') >= 0 && key === v.rk1 || v.tells.indexOf('r2') >= 0 && key === v.rk2); let val = key === 'pab' ? r.pab : r.vecino; if (bad) val = key === 'pab' ? (r.pab === 'A' ? 'B' : 'A') : v.rfalso; out.txt = v.copia ? (key === 'pab' ? 'En el pabellón ' + val + '.' : 'Al lado duerme ' + val + '.') : deco(v, R, key === 'pab' ? 'En el ' + val + '. Vos me anotaste.' : val + '. Ronca como una moto.'); C(key === 'pab' ? 'pab' : 'vecino', val, key === 'pab' ? 'duerme en el pabellón ' + val : 'al lado duerme ' + val); }
    return out;
  }

  // ---------- chips de fuentes ----------
  function fichaChips(G, v) { const p = v.p; let nom = nomC(p), edad = p.edad; if (v.fichaTypo === 'nombre') { const a = p.ape; const i = Math.min(a.length - 2, 2); nom = p.nom + ' ' + a.slice(0, i) + (a[i] === 'e' ? 'a' : 'e') + a.slice(i + 1); } if (v.fichaTypo === 'edad') edad = p.edad + 1;
    return [chip('ficha', 'nombre', nom, 'Nombre: ' + nom), chip('ficha', 'edad', edad, 'Edad: ' + edad), chip('ficha', 'oficio', p.of, 'Ocupación: ' + ofi(p)), chip('ficha', 'barrio', p.b, 'Barrio: ' + G.mundo.barrios[p.b].n), chip('ficha', 'calle', p.calle, 'Domicilio: ' + p.calle), chip('ficha', 'sangre', p.sangre, 'Sangre: ' + p.sangre), chip('ficha', 'anillo', p.anillo || '', 'Señas: ' + (p.anillo ? 'anillo en mano ' + (p.anillo === 'izq' ? 'izquierda' : 'derecha') : 'sin anillos'))]; }
  function salvoChips(G, v) { const p = v.p, Z = G.mundo.zonas[p.zona]; const f = v.salvoFecha || p.zsal, d = v.salvoFirma || Z.dir;
    return [chip('salvo', 'nombre', nomC(p), 'Titular: ' + nomC(p)), chip('salvo', 'zona', p.zona, 'Emitido en: Zona ' + p.zona), chip('salvo', 'zsal', f, 'Salida: día ' + f, { z: p.zona }), chip('salvo', 'director', d, 'Firma: ' + d, { z: p.zona }), chip('salvo', 'acomp', p.acomp.length, 'Acompañantes: ' + p.acomp.length)]; }
  function itemChips(G, v, it) { const p = v.p;
    if (it === 'foto') { const ns = p.fam.map((f) => f.nom); const c = []; let t = 'Foto familiar. Al dorso: «' + ns.concat(p.mascota ? [p.mascota.nom] : []).join(', ') + '».'; if (ns.length) c.push(chip('item', 'fam', ns.join('|'), 'Foto: familia ' + ns.join(', '))); if (p.mascota) c.push(chip('item', 'mascota', p.mascota.nom, 'Foto: ' + p.mascota.tipo + ' «' + p.mascota.nom + '»')); return { t, c }; }
    if (it === 'carta') return { t: 'Carta sin abrir, dirigida a ' + nomC(p) + ', ' + p.calle + '.', c: [chip('item', 'calle', p.calle, 'Carta: ' + p.calle), chip('item', 'nombre', nomC(p), 'Carta: a ' + nomC(p))] };
    if (it === 'placa') return { t: 'Credencial de trabajo: ' + ofi(p) + '.', c: [chip('item', 'oficio', p.of, 'Credencial: ' + ofi(p))] };
    return { t: { llaves: 'Un manojo de llaves. Una tiene una cinta roja.', comida: 'Media lata de duraznos, envuelta en un trapo.', remedio: 'Una tira de antitérmicos, casi vacía.', radio: 'Una radio a pilas. Sin pilas.', manta: 'Una manta de bebé. No viene ningún bebé.', bufanda: 'Una bufanda roja, tejida a mano. La reconocés.' }[it], c: [] }; }
  function archivoChips(G, r) { const p = r.p; return [chip('archivo', 'nombre', nomC(p), 'Archivo: ' + nomC(p)), chip('archivo', 'edad', p.edad, 'Archivo: ' + p.edad + ' años'), chip('archivo', 'oficio', p.of, 'Archivo: ' + ofi(p)), chip('archivo', 'pab', r.pab, 'Archivo: pabellón ' + r.pab), chip('archivo', 'vecino', r.vecino, 'Archivo: cama de al lado, ' + r.vecino), chip('archivo', 'anillo', p.anillo || '', 'Archivo: ' + (p.anillo ? 'anillo en mano ' + (p.anillo === 'izq' ? 'izquierda' : 'derecha') : 'sin anillos')), chip('archivo', 'sangre', p.sangre, 'Archivo: sangre ' + p.sangre)].map((c, i) => Object.assign(c, { id: r.id + 'a' + i })); }
  function cuadernoChips(G) { const H = G.hermana; return [chip('cuaderno', 'h_perro', H.inf.perro, 'Cuaderno: nuestro perro, ' + H.inf.perro), chip('cuaderno', 'h_cancion', H.inf.cancion, 'Cuaderno: mamá cantaba «' + H.inf.cancion + '»'), chip('cuaderno', 'h_calle', H.inf.calle, 'Cuaderno: crecimos en ' + H.inf.calle)].map((c, i) => Object.assign(c, { id: 'cu' + i })); }
  function listaChips(G) { return G.fallecidos.map((x, i) => chip('lista', 'fallecido', x, 'Fallecido: ' + x.nom, { id: 'lf' + i })).concat(G.desap.map((x, i) => chip('lista', 'desap', x, 'Desaparecido: ' + x.nom, { id: 'ld' + i }))); }
  function mapaChips(G) { const M = G.mundo, c = []; M.barrios.forEach((b, i) => { c.push(chip('mapa', 'caida', b.cae, b.n + ': cayó el día ' + b.cae, { b: i })); c.push(chip('mapa', 'rutaB', b.ruta, b.n + ': evacuó por ' + RUTAS[b.ruta], { b: i })); }); Object.values(M.zonas).forEach((z) => { c.push(chip('mapa', 'zest', z.estado === 'caida' ? z.cae : 0, 'Zona ' + z.z + ': ' + (z.estado === 'caida' ? 'cayó el día ' + z.cae : z.estado === 'activa' ? 'activa' : 'sin señal'), { z: z.z })); c.push(chip('mapa', 'zdir', z.dir, 'Zona ' + z.z + ': dirige ' + z.dir, { z: z.z })); }); c.forEach((x, i) => { x.id = 'm' + i; }); return c; }

  // ---------- cruce ----------
  function cruzar(G, a, b) {
    const ord = (x) => (x.src === 'mapa' || x.src === 'lista' ? 1 : 0); if (ord(a) > ord(b)) { const t = a; a = b; b = t; }
    const R_ = (res, txt) => ({ res, txt });
    if (a.src === b.src && a.src !== 'dicho' && a.key === b.key && a.val === b.val && a.src !== 'item') return R_('nada', 'Es el mismo dato.');
    if (b.src === 'mapa') {
      if (a.key === 'salida' && b.key === 'caida') return a.b !== b.b ? R_('nada', 'Ese no es su barrio.') : a.val > b.val ? R_('grave', 'Dice que salió el día ' + a.val + ', pero ese barrio ya había caído el día ' + b.val + '.') : R_('ok', 'Salió antes de que cayera el barrio. Coincide.');
      if (a.key === 'ruta' && b.key === 'rutaB') return a.b !== b.b ? R_('nada', 'Ese no es su barrio.') : a.val !== b.val ? R_('grave', 'Ese barrio no evacuó por ahí.') : R_('ok', 'La ruta coincide con la evacuación del barrio.');
      if (a.key === 'zsal' && b.key === 'zest') return a.z !== b.z ? R_('nada', 'No es la misma zona.') : b.val && a.val > b.val ? R_('grave', 'Salida fechada el día ' + a.val + ': esa zona ya había caído el día ' + b.val + '.') : R_('ok', 'La fecha es posible.');
      if (a.key === 'director' && b.key === 'zdir') return a.z !== b.z ? R_('nada', 'No es la misma zona.') : a.val !== b.val ? R_('grave', 'Esa zona no la dirige ' + a.val + '.') : R_('ok', 'El nombre del director coincide.');
      return R_('nada', 'Esos dos datos no se relacionan.');
    }
    if (b.src === 'lista') { if (a.key !== 'nombre') return R_('nada', 'Esos dos datos no se relacionan.'); if (a.val !== b.val.nom) return R_('nada', 'No es la misma persona.'); return b.key === 'fallecido' ? R_('grave', 'Figura como FALLECIDO CONFIRMADO. Esa persona está muerta.') : R_('info', 'Figura como desaparecido. No prueba nada: mucha gente aparece.'); }
    if (a.key !== b.key) return R_('nada', 'Esos dos datos no se relacionan.');
    const k = a.key;
    if (k === 'nombre') { if (a.val === b.val) return R_('ok', 'El nombre coincide.'); return lev(a.val, b.val) <= 1 ? R_('menor', 'Una letra distinta. Error menor de tipeo.') : R_('grave', 'Son nombres distintos.'); }
    if (k === 'edad') { const d = Math.abs(a.val - b.val); return d === 0 ? R_('ok', 'La edad coincide.') : d === 1 ? R_('menor', 'Un año de diferencia. Error menor.') : R_('grave', 'Las edades no coinciden: ' + a.val + ' y ' + b.val + '.'); }
    if (k === 'fam') { const A = a.val ? a.val.split('|') : [], B = b.val ? b.val.split('|') : []; if (!A.length && !B.length) return R_('ok', 'Coincide: sin familia.'); if (!A.length || !B.length) return R_('grave', 'Una fuente dice que no tenía familia; la otra nombra a ' + (A.length ? A : B).join(', ') + '.'); const S = A.length <= B.length ? A : B, L = A.length <= B.length ? B : A; return S.every((x) => L.indexOf(x) >= 0) ? R_('ok', 'Los nombres de la familia coinciden.') : R_('grave', 'Los nombres de la familia no coinciden.'); }
    if (a.val === b.val) return R_('ok', 'Coincide.');
    const T = { oficio: 'La ocupación no coincide.', calle: 'El domicilio no coincide.', sangre: 'El grupo sanguíneo no coincide.', mascota: 'El nombre del animal no coincide.', acomp: 'La cantidad de acompañantes no coincide.', zsal: 'La fecha de salida de la zona no coincide.', director: 'El nombre del director no coincide.', barrio: 'El barrio no coincide.', zona: 'La zona no coincide.', ruta: 'La ruta no coincide.', salida: 'La fecha de salida no coincide.', h_perro: 'Así no se llamaba el perro.', h_cancion: 'Esa no era la canción.', h_calle: 'No crecieron en esa calle.', pab: 'No es su pabellón.', vecino: 'Esa no es la persona de la cama de al lado.', anillo: 'El anillo no está en esa mano.' };
    return T[k] ? R_('grave', T[k]) : R_('nada', 'Esos dos datos no se relacionan.');
  }

  // ---------- partida ----------
  function nuevaPartida(seed) {
    const G = { v: 1, seed, rs: seed | 0, dia: 0, reloj: 480, nid: 1, usados: {}, res: [], fallecidos: [], desap: [], cola: [], cur: null, cuarentena: [], comida: 46, moral: 70, paranoia: 10, uso: {}, sup: [], log: [], hist: [], flags: {}, tel: 3, pilas: 4, consultas: 3, test: null, racion: 1, fin: null, stats: { ok: 0, mal: 0, copiasIn: 0, humOut: 0 } };
    const R = mkR(G); G.dia = 1; genMundo(G, R);
    const pabs = ['A', 'B', 'C'];
    for (let i = 0; i < 12; i++) { const p = genPersona(G, R); G.res.push({ id: 'i' + i, p, pab: pabs[i % 3], dia: 0, copia: false, viva: true }); }
    asignarVecinos(G);
    for (let i = 0; i < 6; i++) { const sx = R.chance(0.5) ? 'm' : 'f'; const [n, a] = nombreUnico(G, R, sx); G.fallecidos.push({ nom: n + ' ' + a, edad: R.int(20, 75), b: R.int(0, 7) }); const [n2, a2] = nombreUnico(G, R, sx); G.desap.push({ nom: n2 + ' ' + a2, edad: R.int(20, 75), b: R.int(0, 7) }); }
    // hermana
    const hp = genPersona(G, R, { sex: 'f', zona: -1 }); hp.cara.mark = { t: 'cicatriz', pos: 'ceja', side: R.chance(0.5) ? -1 : 1 }; hp.cara.acc = 'bufanda'; hp.edad = R.int(24, 38); hp.cara.old = 0; if (hp.cara.hair === 6) hp.cara.hair = 1;
    const cs = R.shuf(CALLES), ms = R.shuf(MASC_N), can = R.shuf(['Duerme, negrito', 'La luna en el aljibe', 'Arrorró', 'Los pollitos', 'Manuelita']);
    G.hermana = { p: hp, copia: R.chance(0.5), inf: { perro: ms[0], cancion: can[0], calle: cs[0] }, falso: { perro: ms[1], cancion: can[1], calle: cs[1] }, estado: 'afuera' };
    G.yo = { cicatriz: 'izquierda' };
    G.dia = 0; return G;
  }
  function asignarVecinos(G) { ['A', 'B', 'C'].forEach((pb) => { const l = G.res.filter((r) => r.viva && r.pab === pb); l.forEach((r, i) => { r.vecino = l.length > 1 ? l[(i + 1) % l.length].p.nom : 'nadie'; }); }); }
  function boletin(G, R) {
    const M = G.mundo, d = G.dia; const ayer = M.claves[d - 1], hoy = M.claves[d];
    const REAL = { 1: ['Las copias traen documentos originales. Compare siempre la foto de la ficha con la cara: si una marca cambió de lado o desapareció, no es la persona.', 'Temperatura por debajo de 35°: no es humana. La fiebre, en cambio, es cosa de personas.'], 2: ['Con helada, el aliento humano empaña el vidrio. Lo que no empaña, no respira.', 'Figurar como DESAPARECIDO no prueba nada. Figurar como FALLECIDO CONFIRMADO, sí.', 'Todo operador telefónico debe darle la clave del día. Si la clave es otra, corte.'], 3: ['Ojos enrojecidos: cansancio. Reflejo blanco bajo la linterna: no es humano.', 'Barba crecida, suciedad y vendas no prueban nada. Seis dedos o falta de uñas, sí.', 'Un error de tipeo en un documento es humano. Las copias no se equivocan al copiar.'], 4: ['Sin teléfono, apóyese en pertenencias, residentes y el mapa de caídas.'], 5: ['Las copias aprenden de cada portero. Si una prueba deja de fallar, cambie de prueba.'], 6: ['Los que llegan juntos se respaldan entre sí. Verifique a cada uno por separado.'], 7: ['El convoy sale al anochecer. Lo que entre hoy, viaja con nosotros.'] };
    const FALSO = ['Nueva directiva: toda persona con fiebre es una copia. Rechácela sin más pruebas.', 'Atención: los errores de tipeo en documentos delatan a las copias. Rechace cualquier ficha con errores.', 'Las copias no pueden imitar cicatrices. Quien tenga una cicatriz es humano: déjelo pasar.', 'Los desaparecidos de la lista oficial están todos muertos. Quien figure ahí es una copia.'];
    const its = REAL[d].map((t) => ({ t, v: ayer, falso: false }));
    if (d >= 4) { let w; do { w = R.pick(CLAVES); } while (w === ayer || w === hoy); its.splice(R.int(0, its.length), 0, { t: FALSO[(d + (G.seed & 3)) % 4], v: w, falso: true }); }
    return { clave: hoy, items: its };
  }
  function empezarDia(G) {
    G.dia++; const R = mkR(G), D = DIAS[G.dia]; G.reloj = 480; G.tel = 3; G.pilas = 4 + (G.dia >= 5 ? 1 : 0); G.consultas = 3; G.cur = null; G.eventosDia = [];
    // adaptación
    G.sup = []; if (G.dia >= 3) { const us = Object.keys(G.uso).filter((k) => ['termo', 'linterna', 'manos', 'tel', 'mapa', 'lista', 'trampa', 'bolso'].indexOf(k) >= 0).sort((a, b) => G.uso[b] - G.uso[a]); G.sup = us.filter((k) => G.uso[k] >= 2).slice(0, G.dia >= 5 ? 2 : 1); }
    G.bol = boletin(G, R); G.bols = (G.bols || []).concat([{ dia: G.dia, clave: G.bol.clave, items: G.bol.items }]);
    const tipos = []; for (let i = 0; i < D.n; i++) tipos.push(i < D.copias);
    let orden = R.shuf(tipos); if (G.dia === 1) orden = [false, true, false, true];
    const cola = orden.map((c) => genVisitante(G, R, { copia: c }));
    // parejas: dos personas que viajan juntas y se nombran
    for (let k = 0; k < (D.pareja || 0); k++) { const i = R.int(0, cola.length - 2), a = cola[i], b = cola[i + 1]; if (a.esp || b.esp || a.par || b.par || !a.p.zona) continue; const pb = genPersona(G, R, { zona: a.p.zona, barrio: a.p.b, ape: a.p.ape }); pb.zsal = a.p.zsal; pb.salida = a.p.salida; a.p.acomp = [pb.nom]; pb.acomp = [a.p.nom]; a.p.fam = a.p.fam.filter((f) => f.rel !== 'hermano' && f.rel !== 'hermana' && f.nom !== pb.nom); a.p.fam.unshift({ rel: pb.sex === 'm' ? 'hermano' : 'hermana', nom: pb.nom }); pb.fam = pb.fam.filter((f) => f.rel !== 'hermano' && f.rel !== 'hermana' && f.nom !== a.p.nom); pb.fam.unshift({ rel: a.p.sex === 'm' ? 'hermano' : 'hermana', nom: a.p.nom }); if (a.p.perdida && !a.p.fam.some((f) => f.nom === a.p.perdida)) a.p.perdida = null; if (pb.perdida && !pb.fam.some((f) => f.nom === pb.perdida)) pb.perdida = null;
      const na = genVisitante(G, R, { copia: a.copia, p: a.p }), nb = genVisitante(G, R, { copia: b.copia, p: pb }); na.par = nomC(pb); nb.par = nomC(a.p); cola[i] = na; cola[i + 1] = nb; }
    if (D.retorno && G.salio) { const r = G.res.find((x) => x.id === G.salio.id); if (r && r.viva) { const v = genVisitante(G, R, { copia: G.salio.copia, p: r.p, esp: 'retorno' }); v.rid = r.id; if (v.copia) { const ks = R.shuf(['pab', 'vecino']); v.rk1 = ks[0]; v.rk2 = ks[1]; const o = G.res.filter((x) => x.viva && x.p.nom !== r.vecino && x.id !== r.id); v.rfalso = o.length ? R.pick(o).p.nom : 'Nadie'; } cola.splice(R.int(1, cola.length - 1), 0, v); } }
    if (D.hermana) { const H = G.hermana; const v = genVisitante(G, R, { copia: H.copia, p: H.p, esp: 'hermana' }); if (v.copia) { const ks = R.shuf(['perro', 'cancion', 'calle']); v.hk1 = ks[0]; v.hk2 = ks[1]; } v.items = v.copia && R.chance(0.6) ? ['llaves', 'comida'] : ['bufanda', 'llaves']; if (v.items.indexOf('bufanda') < 0) delete v.look.acc; cola.push(v); }
    G.cola = cola; G.atendidos = 0; G.resumen = { entran: [], rechazo: [], cuar: [], sinAtender: 0 };
    return G;
  }
  function gastar(G, m) { G.reloj += m; }
  const cerrado = (G) => G.reloj >= 1080;
  function llamar(G) { if (G.cur || !G.cola.length || cerrado(G)) return null; const v = G.cola.shift(); G.cur = v; G.atendidos++; const p = v.p; const R = mkR(G);
    v.chips = [];
    const saludo = v.esp === 'hermana' ? 'Soy yo. Abrí. Por favor, abrí.' : v.esp === 'retorno' ? 'Soy ' + p.nom + '. Salí anoche a buscar medicinas, ¿te acordás? Abrime.' : deco(v, R, R.pick(['Soy ' + nomC(p) + '. Tengo ' + (v.mal.edad || p.edad) + ' años.', 'Me llamo ' + nomC(p) + '. ' + (v.mal.edad || p.edad) + ' años.']) + (v.par ? ' Vengo con ' + v.par.split(' ')[0] + '.' : ''), 'Mi nombre es ' + nomC(p) + '. Tengo ' + (v.mal.edad || p.edad) + ' años.');
    v.dialogo = [{ q: null, a: saludo }];
    if (!v.esp) { v.chips.push(chip('dicho', 'nombre', nomC(p), 'Dijo: se llama ' + nomC(p))); v.chips.push(chip('dicho', 'edad', v.mal.edad || p.edad, 'Dijo: tiene ' + (v.mal.edad || p.edad) + ' años')); }
    else v.chips.push(chip('dicho', 'nombre', nomC(p), 'Dice ser ' + nomC(p)));
    if (v.ficha) v.chips = v.chips.concat(fichaChips(G, v)); if (v.salvo) v.chips = v.chips.concat(salvoChips(G, v));
    v.chips.forEach((c, i) => { c.id = v.id + 'c' + i; });
    return v; }
  function addChips(v, cs) { cs.forEach((c) => { c.id = v.id + 'c' + v.chips.length; v.chips.push(c); }); }
  function usar(G, k) { G.uso[k] = (G.uso[k] || 0) + 1; }
  function preguntar(G, k) { const v = G.cur; if (!v || v.pac <= 0 || v.asked.indexOf(k) >= 0) return null; const r = responder(G, v, k); v.asked.push(k); v.pac--; gastar(G, COSTO.pregunta); addChips(v, r.chips); v.dialogo.push({ q: qTexto(v, k), a: r.txt }); if (k === 'trampa') usar(G, 'trampa');
    v.of = v.of.filter((x) => x !== k); r.abre.forEach((x) => { if (v.asked.indexOf(x) < 0 && v.of.indexOf(x) < 0) v.of.unshift(x); }); while (v.of.length < 6 && v.pool.length) v.of.push(v.pool.shift()); if (v.of.length > 7) v.pool = v.of.splice(7).concat(v.pool);
    if (v.pac <= 0) v.dialogo.push({ q: null, a: v.copia && v.plano ? 'No voy a responder más preguntas.' : 'Basta de preguntas. ¿Me va a abrir o no?' }); return r; }
  function rotar(G) { const v = G.cur; if (!v || !v.pool.length) return; const k = v.of.pop(); v.pool.push(k); v.of.unshift(v.pool.shift()); }
  function termometro(G) { const v = G.cur; if (!v || v.rev.termo) return; v.rev.termo = 1; gastar(G, COSTO.termo); usar(G, 'termo'); }
  function linterna(G) { const v = G.cur; if (!v || v.rev.linterna || G.pilas <= 0) return; G.pilas--; v.rev.linterna = 1; gastar(G, COSTO.linterna); usar(G, 'linterna'); }
  function verManos(G) { const v = G.cur; if (!v || v.rev.manos) return; v.rev.manos = 1; gastar(G, COSTO.manos); usar(G, 'manos'); const m = v.manos; if (m.anillo && m.venda !== m.anillo) addChips(v, [chip('obs', 'anillo', m.anillo, 'Visto: anillo en mano ' + (m.anillo === 'izq' ? 'izquierda' : 'derecha'))]); else if (!m.anillo) addChips(v, [chip('obs', 'anillo', '', 'Visto: sin anillos')]); }
  function bolso(G) { const v = G.cur; if (!v || v.rev.bolso) return; v.rev.bolso = 1; gastar(G, COSTO.bolso); usar(G, 'bolso'); v.itemsTxt = []; v.items.forEach((it) => { const x = itemChips(G, v, it); v.itemsTxt.push(x.t); addChips(v, x.c); }); }
  function telefono(G, destino) { const v = G.cur; if (!v || G.tel <= 0) return null; const p = v.p, M = G.mundo; if (destino === 'zona' && !p.zona) return null; G.tel--; gastar(G, COSTO.tel); usar(G, 'tel'); const R = mkR(G); let r;
    if (destino === 'zona') { const Z = M.zonas[p.zona]; if (Z.estado !== 'activa') r = { ok: false, txt: Z.estado === 'caida' ? 'Tono muerto. La Zona ' + p.zona + ' ya no existe.' : 'Estática. Nadie atiende en la Zona ' + p.zona + '.' };
      else if (v.telFalso) { let w; do { w = R.pick(CLAVES); } while (w === G.bol.clave); r = { ok: true, clave: w, txt: 'Zona ' + p.zona + '. Clave del día: ' + w + '. Sí. ' + nomC(p) + ' estuvo acá. Todo en orden. Puede dejar pasar.', c: [] }; v.rev.claveMal = 1; }
      else if (v.reg === 'nofigura') { r = { ok: true, clave: G.bol.clave, txt: 'Zona ' + p.zona + ', clave ' + G.bol.clave + '. Reviso… No. No tengo a nadie con ese nombre en el registro. Ese salvoconducto no salió de acá.', c: [] }; v.rev.regMal = 1; }
      else if (v.reg === 'fallecio') { r = { ok: true, clave: G.bol.clave, txt: 'Zona ' + p.zona + ', clave ' + G.bol.clave + '. ' + nomC(p) + '… sí. Falleció acá, en la enfermería. Yo mismo firmé el acta. ¿Quién dice que está en su puerta?', c: [] }; v.rev.regMal = 1; }
      else r = { ok: true, clave: G.bol.clave, txt: 'Zona ' + p.zona + ', clave ' + G.bol.clave + '. ' + nomC(p) + ': salió el día ' + p.zsal + ', con ' + (p.acomp.length ? p.acomp.length + (p.acomp.length > 1 ? ' acompañantes' : ' acompañante') : 'nadie') + '. Sangre ' + p.sangre + '.', c: [chip('tel', 'zsal', p.zsal, 'Zona ' + p.zona + ': salió el día ' + p.zsal, { z: p.zona }), chip('tel', 'acomp', p.acomp.length, 'Zona ' + p.zona + ': ' + p.acomp.length + ' acompañantes'), chip('tel', 'sangre', p.sangre, 'Zona ' + p.zona + ': sangre ' + p.sangre)] }; }
    else { if (R.chance(0.15)) r = { ok: false, txt: 'La línea con el Registro Central se corta antes de que atiendan.' }; else { const ns = p.fam.map((f) => f.nom); r = { ok: true, clave: G.bol.clave, txt: 'Registro Central, clave ' + G.bol.clave + '. ' + nomC(p) + ', ' + p.edad + ' años, ' + ofi(p) + '. Grupo familiar: ' + (ns.length ? ns.join(', ') : 'ninguno') + '.', c: [chip('tel', 'edad', p.edad, 'Registro: ' + p.edad + ' años'), chip('tel', 'oficio', p.of, 'Registro: ' + ofi(p)), chip('tel', 'fam', ns.join('|'), 'Registro: familia ' + (ns.length ? ns.join(', ') : 'ninguna')), chip('tel', 'nombre', nomC(p), 'Registro: ' + nomC(p))] }; } }
    if (r.c) addChips(v, r.c); v.tels = (v.tels || []).concat([r.txt]); return r; }
  function consultar(G) { const v = G.cur; if (!v || !v.link || !v.rev.link || v.rev.res || G.consultas <= 0) return null; const r = G.res.find((x) => x.id === v.link.id); if (!r || !r.viva) return null; G.consultas--; v.rev.res = 1; gastar(G, COSTO.res); usar(G, 'res'); const p = v.p; let txt, c = [];
    if (r.copia) txt = nomC(r.p) + ': «Sí. Es de confianza. Puede pasar.»';
    else { const ns = p.fam.map((f) => f.nom); txt = nomC(r.p) + ': «¿' + p.nom + '? Sí, ' + ofi(p) + ', de ' + G.mundo.barrios[p.b].n + '. ' + (ns.length ? 'Vivía con ' + ns.join(' y ') + '. ' : 'Vivía sin nadie. ') + (p.mascota ? 'Tenían un ' + p.mascota.tipo + ', ' + p.mascota.nom + '. ' : '') + 'Ojalá sea ' + g(p, 'él', 'ella') + '.»'; c = [chip('res', 'oficio', p.of, r.p.nom + ': era ' + ofi(p)), chip('res', 'fam', ns.join('|'), r.p.nom + ': familia ' + (ns.length ? ns.join(', ') : 'ninguna'))]; if (p.mascota) c.push(chip('res', 'mascota', p.mascota.nom, r.p.nom + ': ' + p.mascota.tipo + ' «' + p.mascota.nom + '»')); }
    addChips(v, c); v.resTxt = txt; return txt; }
  function hacerCruce(G, a, b) { const v = G.cur; if (!v) return null; const key = [a.id, b.id].sort().join('~'); const ya = v.cruces.find((x) => x.key === key); if (ya) return ya; gastar(G, COSTO.cruzar); const r = cruzar(G, a, b); if (a.src === 'mapa' || b.src === 'mapa') usar(G, 'mapa'); if (a.src === 'lista' || b.src === 'lista') usar(G, 'lista'); const c = { key, a: a.txt, b: b.txt, ka: a.key, res: r.res, txt: r.txt, conf: null }; if (r.res !== 'nada') v.cruces.push(c); return c; }
  function confrontar(G, i) { const v = G.cur; if (!v) return null; const c = v.cruces[i]; if (!c || c.conf || (c.res !== 'grave' && c.res !== 'menor')) return null; gastar(G, COSTO.confrontar); const p = v.p; let t, tipo;
    if (v.copia) { tipo = 'evasiva'; t = v.trucos.indexOf('contraacusa') >= 0 ? 'Usted busca copias en el lugar equivocado. Mire adentro. Mire quién duerme en sus pabellones.' : mkR(G).pick(['Me confundí. Estoy cansado.', 'No sé de qué me habla. Está todo en orden.', 'Eso es un error suyo, no mío.'].map((s) => (p.sex === 'f' ? s.replace('cansado', 'cansada') : s))); if (v.trucos.indexOf('contraacusa') >= 0 && !v.acuso) { v.acuso = 1; G.paranoia += 6; } }
    else if (c.res === 'menor') { tipo = 'explica'; t = 'Me anotaron mal en el puesto de control. Había cien personas detrás mío; no me dejaron corregirlo.'; }
    else if (v.sec) { tipo = 'confiesa'; t = v.sec.k === 'acomp' ? 'Está bien. No viajé ' + g(p, 'solo', 'sola') + '. Venía con ' + p.acomp[0] + '. Se lastimó la pierna y… seguí. Lo dejé. No quería que nadie lo supiera.' : v.sec.k === 'oficio' ? 'Mentí. Soy ' + ofi(p) + '. Dije otra cosa porque pensé que así me iban a dejar entrar. Nadie le abre la puerta a alguien como yo.' : 'Sí tenía familia. ' + p.fam.map((f) => f.nom).join(', ') + '. Corrí sin esperarlos. Es más fácil decir que no tenía a nadie.'; }
    else { tipo = 'evasiva'; t = 'No sé qué decirle.'; }
    c.conf = { tipo, t }; v.dialogo.push({ q: 'Explicame esto: ' + c.txt, a: t }); return c.conf; }
  function decidir(G, d) { const v = G.cur; if (!v || v.dec) return null; if (d === 'cuarentena' && G.cuarentena.length >= 2) return null; v.dec = d; gastar(G, COSTO.decidir); const R = mkR(G);
    const reg = { nom: nomC(v.p), copia: v.copia, dec: d, esp: v.esp, tells: v.tells, ruido: v.ruido, nivel: v.nivel, look: v.look, var: [v.marcaVar, v.manosVar] }; G.hist.push(Object.assign({ dia: G.dia }, reg));
    if (d === 'pasa') { if (v.esp === 'retorno') { const r = G.res.find((x) => x.id === v.rid); r.fuera = false; r.copia = v.copia; r.dia = G.dia; } else { const cnt = { A: 0, B: 0, C: 0 }; G.res.forEach((r) => { if (r.viva) cnt[r.pab]++; }); const pab = ['A', 'B', 'C'].sort((x, y) => cnt[x] - cnt[y])[0]; G.res.push({ id: 'r' + G.nid++, p: v.p, pab, dia: G.dia, copia: v.copia, viva: true, hermana: v.esp === 'hermana' }); }
      if (v.copia) { G.stats.mal++; G.stats.copiasIn++; } else { G.stats.ok++; G.moral = Math.min(100, G.moral + 2); } G.resumen.entran.push(reg); if (v.esp === 'hermana') G.hermana.estado = v.copia ? 'adentroCopia' : 'adentro'; }
    else if (d === 'rechaza') { if (v.copia) G.stats.ok++; else { G.stats.mal++; G.stats.humOut++; G.moral -= v.esp === 'retorno' ? 10 : 4; } G.resumen.rechazo.push(reg); if (v.esp === 'retorno') { const r = G.res.find((x) => x.id === v.rid); r.viva = false; r.fuera = false; } if (v.esp === 'hermana') G.hermana.estado = v.copia ? 'rechazadaCopia' : 'rechazadaHumana'; }
    else { G.cuarentena.push({ p: v.p, copia: v.copia, esp: v.esp, rid: v.rid, dia: G.dia, nom: nomC(v.p) }); G.resumen.cuar.push(reg); if (v.esp === 'hermana') G.hermana.estado = 'cuarentena'; }
    asignarVecinos(G); G.cur = null; return reg; }
  function cerrarDia(G) { G.resumen.sinAtender = G.cola.length + (G.cur ? 1 : 0); G.cola.forEach((v) => { if (v.esp === 'hermana') G.hermana.estado = v.copia ? 'rechazadaCopia' : 'rechazadaHumana'; if (v.esp === 'retorno') { const r = G.res.find((x) => x.id === v.rid); r.viva = false; r.fuera = false; } }); if (G.cur) { if (G.cur.esp === 'hermana') G.hermana.estado = G.cur.copia ? 'rechazadaCopia' : 'rechazadaHumana'; if (G.cur.esp === 'retorno') { const r = G.res.find((x) => x.id === G.cur.rid); r.viva = false; r.fuera = false; } }
    G.moral -= 2 * G.resumen.sinAtender; G.cola = []; G.cur = null; G.test = null; G.racion = 1; }
  const vivos = (G) => G.res.filter((r) => r.viva && !r.fuera);
  function candidatosTest(G) { return G.cuarentena.map((q, i) => ({ id: 'q' + i, nom: q.nom, donde: 'Cuarentena' })).concat(vivos(G).filter((r) => r.dia > 0).map((r) => ({ id: r.id, nom: nomC(r.p), donde: 'Pabellón ' + r.pab + ' · entró el día ' + r.dia }))); }
  function noche(G) {
    const R = mkR(G); const ev = []; const D = DIAS[G.dia];
    // comida
    const pop = vivos(G).length + G.cuarentena.length; const need = Math.ceil(pop * (G.racion === 1 ? 1 : 0.5));
    if (G.racion !== 1) { G.moral -= 6; ev.push({ t: 'comida', txt: 'Media ración para todos. Nadie protesta en voz alta.' }); }
    if (G.comida >= need) G.comida -= need; else { G.comida = 0; G.moral -= 14; ev.push({ t: 'hambre', txt: 'La comida no alcanzó. Hubo empujones en la fila de la olla.' }); }
    if (G.dia === 2 || G.dia === 4 || G.dia === 6) { G.comida += 22; ev.push({ t: 'sumin', txt: 'Un camión militar dejó 22 raciones en el portón.' }); }
    // análisis de sangre
    let res = null;
    if (G.test) { if (G.test[0] === 'q') { const i = +G.test.slice(1); const q = G.cuarentena[i]; if (q) { G.cuarentena.splice(i, 1); res = { nom: q.nom, copia: q.copia, esp: q.esp, cuar: true };
          if (q.copia) { G.stats.ok++; if (q.esp === 'retorno') { const r = G.res.find((x) => x.id === q.rid); r.viva = false; r.fuera = false; } if (q.esp === 'hermana') G.hermana.estado = 'testCopia'; }
          else { G.stats.ok++; if (q.esp === 'retorno') { const r = G.res.find((x) => x.id === q.rid); r.fuera = false; } else { const cnt = { A: 0, B: 0, C: 0 }; G.res.forEach((r) => { if (r.viva) cnt[r.pab]++; }); G.res.push({ id: 'r' + G.nid++, p: q.p, pab: ['A', 'B', 'C'].sort((x, y) => cnt[x] - cnt[y])[0], dia: G.dia, copia: false, viva: true, hermana: q.esp === 'hermana' }); } if (q.esp === 'hermana') G.hermana.estado = 'adentro'; } } }
      else { const r = G.res.find((x) => x.id === G.test); if (r && r.viva) { res = { nom: nomC(r.p), copia: r.copia, cuar: false, hermana: r.hermana }; if (r.copia) { r.viva = false; G.paranoia = Math.max(0, G.paranoia - 12); G.stats.cazadas = (G.stats.cazadas || 0) + 1; if (r.hermana) G.hermana.estado = 'testCopia'; } else G.paranoia += 4; } } }
    G.resTest = res;
    // copias adentro: desapariciones
    const dentro = vivos(G).filter((r) => r.copia); let des = 0;
    R.shuf(dentro).forEach((c) => { if (des >= 1 || !R.chance(0.85)) return; const vict = vivos(G).filter((r) => !r.copia && r.pab === c.pab && !r.hermana); const pool = vict.length ? vict : vivos(G).filter((r) => !r.copia && !r.hermana); if (!pool.length) return; const x = R.pick(pool); x.viva = false; des++; G.ultPab = x.pab; G.moral -= 6; G.paranoia += 10; ev.push({ t: 'desap', txt: nomC(x.p) + ' no está en su cama. Pabellón ' + x.pab + '. La manta sigue tibia.' }); });
    if (!des) { G.paranoia = Math.max(0, G.paranoia - 10); if (!dentro.length && G.resumen.rechazo.every((x) => x.copia) && !G.resumen.sinAtender) G.moral = Math.min(100, G.moral + 4); }
    // cámaras
    G.resumen.rechazo.forEach((x) => { ev.push({ t: x.copia ? 'camC' : 'camH', txt: x.copia ? 'Cámara 2: ' + x.nom + ' se quedó de pie frente al portón, sin moverse, hasta que se cortó la luz. Después ya no estaba.' : 'Cámara 2: ' + x.nom + ' sigue sentad' + (/a$/.test(x.nom.split(' ')[0]) ? 'a' : 'o') + ' contra el muro, tapándose con un cartón.' }); });
    if (G.resumen.sinAtender) ev.push({ t: 'fila', txt: G.resumen.sinAtender + (G.resumen.sinAtender > 1 ? ' personas quedaron' : ' persona quedó') + ' en la fila cuando bajaste la persiana.' });
    if (G.sup.length && !G.flags.avisoAdapt) { G.flags.avisoAdapt = 1; ev.push({ t: 'doc', txt: 'La doctora: «Lo que analicé hoy ya no falla en la prueba que más usás. Aprenden de vos. Cambiá de método.»' }); }
    // alguien sale a buscar medicinas (vuelve mañana)
    G.salio = null; const man = DIAS[G.dia + 1]; if (man && man.retorno) { const c = vivos(G).filter((r) => !r.copia && !r.hermana); if (c.length > 4) { const r = R.pick(c); r.fuera = true; G.salio = { id: r.id, copia: R.chance(0.5) }; ev.push({ t: 'sale', txt: nomC(r.p) + ' (Pabellón ' + r.pab + ') salió a buscar medicinas. Dijo que vuelve mañana.' }); } }
    // hermana por radio
    const H = G.hermana;
    if (G.dia === 2) ev.push({ t: 'radio', txt: 'Radio, 02:14 — «¿Me escuchás? Soy yo. Estoy viva. Estoy en la Zona ' + H.p.zona + '. Voy para allá.»' });
    if (G.dia === 4) ev.push({ t: 'radio', txt: 'Radio, 03:40 — «Llego mañana. Llevo puesta la bufanda roja de mamá, así me reconocés de lejos. No le abras a nadie que no la tenga.»' });
    G.radioH = (G.radioH || []).concat(ev.filter((x) => x.t === 'radio').map((x) => x.txt)); asignarVecinos(G); G.eventos = ev; G.moral = Math.max(0, Math.min(100, G.moral)); G.paranoia = Math.max(0, Math.min(100, G.paranoia));
    // finales inmediatos
    const hum = vivos(G).filter((r) => !r.copia).length, cop = vivos(G).filter((r) => r.copia).length;
    if (G.paranoia >= 100) G.fin = 'maple'; else if (G.moral <= 0) G.fin = 'cae'; else if (hum <= 3 || cop >= hum) G.fin = 'reemplazo'; else if (H.estado === 'testCopia' && !G.flags.joel) G.pend = 'joel';
    else if (G.dia >= 7) G.fin = finalDe(G);
    return ev; }
  function elegirJoel(G, huir) { G.flags.joel = 1; G.pend = null; if (huir) G.fin = 'joel'; else { G.hermana.estado = 'entregada'; if (G.dia >= 7) G.fin = finalDe(G); } }
  function finalDe(G) { const cop = vivos(G).filter((r) => r.copia); const H = G.hermana; if (G.flags.yo) return 'copia'; if (cop.some((r) => r.hermana)) return 'noera'; if (cop.length) return 'cosa'; if (H.estado === 'rechazadaHumana') return 'niebla'; return 'resiste'; }
  function cruceYo(G) { G.flags.yo = 1; }

  return { nuevaPartida, empezarDia, llamar, preguntar, rotar, termometro, linterna, verManos, bolso, telefono, consultar, hacerCruce, confrontar, decidir, cerrarDia, noche, elegirJoel, cruzar, mapaChips, archivoChips, cuadernoChips, listaChips, responder, herramientas, candidatosTest, qTexto, vivos, cerrado, hoyInv, nomC, ofi, cruceYo, finalDe, itemChips, QCAT, DIAS, DIA_INFO, COSTO, RUTAS, OFICIOS, chip };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = Z7;
