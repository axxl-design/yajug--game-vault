/* ZONA 7 — interfaz */
const FINALES = {
  resiste: ['FINAL · LA ZONA RESISTE', 'Suben todos', ['El convoy llega con las últimas luces. Contás a la gente mientras sube: no falta nadie y no sobra nadie.', 'Nadie te da las gracias. Están vivos, y eso es mejor. Cuando arranca el último camión, apagás la lámpara de la ventanilla por primera vez en siete días.']],
  cosa: ['FINAL · LA COSA', 'Uno de ellos', ['El convoy sale lleno. Vos vas en el último camión, mirando caras. Todas te devuelven la mirada. Todas parpadean.', 'En algún banco, entre toda esa gente que salvaste, hay algo que aprendió a parpadear. Dejaste entrar a una copia y nunca la encontraste. Ahora viaja con ustedes hacia la próxima ciudad.']],
  noera: ['FINAL · NO ERA ELLA', 'La bufanda roja', ['En el camión, tu hermana se duerme contra tu hombro. Respira despacio. Demasiado despacio.', 'Quisiste tanto que fuera ella que no miraste bien. Cuando el convoy entra al túnel y se apaga la luz, sentís que su mano, la que te agarra el brazo, tiene un dedo de más.']],
  niebla: ['FINAL · LA NIEBLA', 'Una noche más', ['El convoy llega al anochecer, puntual. Suben todos. La zona se salvó, y fue por vos.', 'Al salir, los faros alumbran el muro del portón. Hay una bufanda roja en el suelo. Era ella. Era de verdad ella, y la dejaste afuera la última noche antes del rescate.']],
  joel: ['FINAL · A CUALQUIER PRECIO', 'Elegiste', ['Abrís la reja de la cuarentena. Lo que tiene la cara de tu hermana te sonríe con su sonrisa. Caminan juntos hacia el portón.', 'Dejaste la puerta abierta. Sabés perfectamente lo que va a entrar por ahí esta noche. Lo sabías cuando giraste la llave. Hay cosas que uno elige igual.']],
  maple: ['FINAL · LOS MONSTRUOS', 'Se abrieron solos', ['No hizo falta que entrara nadie más. Alguien acusó a alguien en el pabellón B. Después hubo un grito, después un cuchillo de cocina.', 'A la mañana el portón está abierto de par en par, desde adentro. Las copias esperaron sentadas en la vereda de enfrente. No tuvieron que hacer nada.']],
  cae: ['FINAL · LA ZONA CAE', 'El hambre', ['Primero fue la olla vacía. Después las miradas. Después dejaron de hacer fila y empezaron a empujar.', 'Un refugio no se cae cuando entra el enemigo: se cae cuando la gente de adentro deja de creer que vale la pena cuidar la puerta.']],
  reemplazo: ['FINAL · EL GRITO', 'Ya no queda nadie', ['Bajás a los pabellones a contar camas. Están todas ocupadas. Todos duermen boca arriba, con los ojos abiertos.', 'Se dan vuelta al mismo tiempo cuando entrás. Uno levanta el brazo, te señala y abre la boca.']],
  copia: ['FINAL SECRETO · EL PORTERO', 'La cicatriz equivocada', ['El convoy se va. Vos te quedás un rato en la cabina vacía, mirándote la mano. La cicatriz está en la derecha. El archivo dice izquierda. El archivo no se equivoca.', 'No recordás cómo olía la casa donde creciste. Recordás la dirección, el número, el color del portón. Datos. Durante siete días decidiste quién era humano. Nadie te revisó a vos.']]
};
const TELLS = { marca: 'la cara no coincidía con la foto', temp: 'temperatura por debajo de 35°', aliento: 'su aliento no empañaba el vidrio', ojos: 'reflejo blanco en los ojos', manos: 'algo raro en las manos', muerto: 'figuraba como fallecida', salida: 'dijo salir de su barrio después de la caída', zona: 'salvoconducto imposible', edad: 'dijo otra edad que la de su ficha', trampa: 'cayó en la pregunta trampa', registro: 'el registro de su zona la desmentía', clave: 'el operador dio una clave falsa', dato: 'un nombre que no coincidía con su foto familiar', calle: 'dijo otro domicilio que el de su ficha', acompD: 'dijo viajar sola y el salvoconducto decía otra cosa', h1: 'falló un recuerdo de la infancia', h2: 'falló otro recuerdo de la infancia', r1: 'no sabía cuál era su cama', r2: 'no sabía quién dormía al lado' };
const RUIDO = { fiebre: 'tenía fiebre', venda: 'mano vendada', ojosrojos: 'ojos irritados', typo: 'error de tipeo en la ficha', desap: 'figuraba como desaparecida', homonimo: 'un fallecido con su mismo apellido', sindoc: 'sin ficha', shock: 'en shock', secreto: 'mentía por vergüenza' };
const NUEVAS = { termo: 'Termómetro', bolso: 'Revisar pertenencias', tel: 'Teléfono (3 llamadas por día)', lista: 'Listas de fallecidos y desaparecidos', cuarentena: 'Cuarentena (2 camas) y análisis de sangre', linterna: 'Linterna para los ojos (pilas limitadas)', manos: 'Pedir que muestre las manos', res: 'Consultar a un residente que lo conozca' };
class Component extends DCLogic {
  constructor(props) {
    super(props); let save = null, fins = [];
    try { save = JSON.parse(localStorage.getItem('yj-z7') || 'null'); fins = JSON.parse(localStorage.getItem('yj-z7-fin') || '[]'); } catch (e) {}
    if (save && (save.v !== 1 || save.fin || !save.cola)) save = null;
    this.G = null; this.save = save; this.state = { screen: 'title', tab: 'radio', sel: [], n: 0, fins, open: null, side: false };
  }
  bump(o) { this.setState(Object.assign({ n: (this.state.n || 0) + 1 }, o || {})); }
  snd(n) { try { if (window.YJS) window.YJS.play(n); } catch (e) {} }
  persist() { try { localStorage.setItem('yj-z7', JSON.stringify(this.G)); } catch (e) {} }
  nueva(daily) { const d = new Date(); const seed = daily ? d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() : Math.floor(Math.random() * 899999) + 100000; this.G = Z7.nuevaPartida(seed); Z7.empezarDia(this.G); this.persist(); try { if (window.YJS) window.YJS.music('portal'); } catch (e) {} this.snd('shuffle'); this.bump({ screen: 'brief', sel: [], tab: 'radio', toast: null, open: null }); }
  continuar() { this.G = this.save; try { if (window.YJS) window.YJS.music('portal'); } catch (e) {} this.bump({ screen: 'brief', sel: [] }); }
  toast(tit, txt, cls, ms) { clearTimeout(this.tt); this.bump({ toast: { tit, txt, cls } }); this.tt = setTimeout(() => this.bump({ toast: null }), ms || 4200); }
  scrollDlg() { setTimeout(() => { try { const e = document.getElementById('z7dlg'); if (e) e.scrollTop = 99999; } catch (e) {} }, 60); }
  llamar() { const v = Z7.llamar(this.G); if (v) { this.snd('turn'); this.bump({ sel: [], open: v.esp === 'retorno' ? v.rid : null, tab: v.esp === 'hermana' ? 'cuaderno' : v.esp === 'retorno' ? 'archivo' : this.state.tab }); this.scrollDlg(); } }
  preguntar(k) { if (Z7.preguntar(this.G, k)) { this.snd('tap'); this.bump(); this.scrollDlg(); } }
  tool(k, arg) { const G = this.G; if (!G.cur) return; if (k === 'termo') Z7.termometro(G); if (k === 'linterna') Z7.linterna(G); if (k === 'manos') Z7.verManos(G); if (k === 'bolso') Z7.bolso(G); if (k === 'tel') { const r = Z7.telefono(G, arg); if (r && !r.ok) this.toast('TELÉFONO', r.txt, 'info'); } if (k === 'res') Z7.consultar(G); this.snd(k === 'tel' ? 'tick' : k === 'bolso' ? 'card' : 'charge'); this.bump(); }
  pick(c) { let sel = this.state.sel.filter((x) => x.id !== c.id); if (sel.length === this.state.sel.length) sel = sel.concat([c]); if (sel.length > 2) sel = [sel[1], sel[2]]; this.snd('tap'); this.bump({ sel }); }
  cruzar() { const [a, b] = this.state.sel; const G = this.G; if (!a || !b) return; const yo = [a.id, b.id].sort().join() === 'yoA,yoM';
    if (yo) { Z7.cruceYo(G); this.snd('domain'); this.bump({ sel: [] }); return this.toast('NO COINCIDE', 'Mirás el archivo. Mirás tu mano. El archivo dice izquierda. La cicatriz está en la derecha. Cerrás la carpeta despacio. Hay gente esperando.', 'grave', 9000); }
    if (a.id[0] === 'y' || b.id[0] === 'y') { this.bump({ sel: [] }); return this.toast('SIN RELACIÓN', 'Esos dos datos no se relacionan.', 'nada'); }
    if (!G.cur) return this.toast('SIN PERSONA', 'No hay nadie en la ventanilla para cruzar datos.', 'nada');
    const r = Z7.hacerCruce(G, a, b); const T = { grave: 'CONTRADICCIÓN GRAVE', menor: 'ERROR MENOR', ok: 'COINCIDE', info: 'DATO', nada: 'SIN RELACIÓN' }; this.snd(r.res === 'grave' ? 'clue' : r.res === 'ok' ? 'ok' : 'tap'); this.bump({ sel: [] }); this.toast(T[r.res], r.txt, r.res); }
  confrontar(i) { const r = Z7.confrontar(this.G, i); if (r) { this.snd('no'); this.bump(); this.scrollDlg(); } }
  decidir(d) { const G = this.G; if (!G.cur) return; const r = Z7.decidir(G, d); if (!r) return; this.snd('play'); clearTimeout(this.st); this.bump({ sel: [], stamp: { d, look: r.look }, open: null }); this.st = setTimeout(() => this.bump({ stamp: null }), 1100); }
  cerrar() { Z7.cerrarDia(this.G); this.snd('bad'); this.bump({ screen: 'cierre', side: false, toast: null }); }
  dormir() { Z7.noche(this.G); this.snd('turn'); this.bump({ screen: 'parte' }); try { window.scrollTo(0, 0); } catch (e) {} }
  fin() { const G = this.G; const fins = this.state.fins.indexOf(G.fin) >= 0 ? this.state.fins : this.state.fins.concat([G.fin]); try { localStorage.removeItem('yj-z7'); localStorage.setItem('yj-z7-fin', JSON.stringify(fins)); } catch (e) {} this.save = null; this.snd(G.fin === 'resiste' ? 'win' : 'out'); this.bump({ screen: 'end', fins }); }
  seguir() { const G = this.G; if (G.fin) return this.fin(); Z7.empezarDia(G); this.persist(); this.snd('shuffle'); this.bump({ screen: 'brief', sel: [], tab: 'radio' }); }
  joel(huir) { Z7.elegirJoel(this.G, huir); if (this.G.fin) return this.fin(); this.bump(); }
  renderVals() {
    const s = this.state, G = this.G, scr = s.screen; const sel = s.sel || [];
    const base = { isTitle: scr === 'title', isBrief: scr === 'brief', isWork: scr === 'work', isCierre: scr === 'cierre', isParte: scr === 'parte', isEnd: scr === 'end', nueva: () => this.nueva(false), diaria: () => this.nueva(true), continuar: () => this.continuar(), hasSave: !!this.save, saveDia: this.save ? this.save.dia : 0, finCount: s.fins.length };
    if (!G) return base;
    const chipV = (c) => ({ t: c.txt, cls: sel.some((x) => x.id === c.id) ? 'sel' : '', go: () => this.pick(c) });
    const M = G.mundo, D = Z7.DIAS[G.dia] || Z7.DIAS[7], T = Z7.herramientas(G), v = G.cur;
    Object.assign(base, { dia: G.dia, invDia: Z7.hoyInv(G), seedTxt: '#' + G.seed, diaNom: D.nom, diaInfo: Z7.DIA_INFO[D.tipo], claveHoy: G.bol ? G.bol.clave : '', claveAyer: M.claves[G.dia - 1], clave0: M.claves[0], bolItems: G.bol ? G.bol.items : [] });
    if (scr === 'brief') {
      const rt = G.resTest; const nv = D.nuevas.map((k) => NUEVAS[k]);
      Object.assign(base, { hasTest: !!rt, testCls: rt ? (rt.copia ? 'red' : 'grn') : '', testTxt: rt ? (rt.copia ? rt.nom + ': POSITIVO. No era una persona. ' + (rt.cuar ? 'Nunca salió de la cuarentena.' : 'Estaba durmiendo entre los demás. El ejército se la llevó antes del amanecer.') : rt.nom + ': negativo. Es una persona.' + (rt.cuar ? ' Ya está en un pabellón.' : ' La despertaste a las cuatro de la mañana para pincharla; los demás lo vieron.')) : '', hasNuevas: nv.length > 0, nuevasTxt: nv.join(' · '), abrir: () => { this.snd('card'); this.bump({ screen: 'work' }); } });
    }
    if (scr === 'work') {
      const hh = Math.floor(Math.min(G.reloj, 1439) / 60), mm = G.reloj % 60; const cerr = Z7.cerrado(G);
      const by = (src) => (v ? v.chips.filter((c) => c.src === src).map(chipV) : []);
      const mapa = Z7.mapaChips(G); const listas = T.lista ? Z7.listaChips(G) : [];
      const tabsDef = [['radio', 'RADIO'], ['mapa', 'MAPA']].concat(T.lista ? [['listas', 'LISTAS']] : []).concat([['archivo', 'ARCHIVO'], ['cuaderno', 'CUADERNO'], ['manual', 'MANUAL']]);
      const tools = [];
      if (v) {
        tools.push({ n: 'Termómetro', s: '4 min', off: !!v.rev.termo, go: () => this.tool('termo') });
        if (T.bolso) tools.push({ n: 'Pertenencias', s: '6 min', off: !!v.rev.bolso, go: () => this.tool('bolso') });
        if (T.linterna) tools.push({ n: 'Linterna', s: 'pilas: ' + G.pilas, off: !!v.rev.linterna || G.pilas <= 0, go: () => this.tool('linterna') });
        if (T.manos) tools.push({ n: 'Manos', s: '5 min', off: !!v.rev.manos, go: () => this.tool('manos') });
        if (T.tel) { if (v.p.zona && (v.salvo || v.asked.indexOf('origen') >= 0)) tools.push({ n: '☎ Zona ' + v.p.zona, s: 'quedan ' + G.tel, off: G.tel <= 0, go: () => this.tool('tel', 'zona') }); tools.push({ n: '☎ Registro', s: 'quedan ' + G.tel, off: G.tel <= 0, go: () => this.tool('tel', 'central') }); }
        if (T.res && v.link && v.rev.link) tools.push({ n: 'Consultar residente', s: 'quedan ' + G.consultas, off: !!v.rev.res || G.consultas <= 0, go: () => this.tool('res') });
      }
      const TIT = { grave: 'CONTRADICCIÓN GRAVE', menor: 'ERROR MENOR', ok: 'COINCIDE', info: 'DATO' }, CT = { confiesa: 'CONFESIÓN: una mentira humana.', explica: 'EXPLICACIÓN razonable.', evasiva: 'EVASIVA: no lo explica.' };
      const vivos = Z7.vivos(G);
      const resAll = G.res.filter((r) => r.viva);
      const st = s.stamp; const TEMPN = v && v.rev.termo ? v.tC : 0;
      Object.assign(base, {
        hora: String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'), lateCls: cerr ? 'late' : '', fila: G.cola.length, comida: G.comida, moral: G.moral, paranoia: G.paranoia,
        sonIcon: (window.YJS && window.YJS.isOn && !window.YJS.isOn()) ? '🔇' : '🔊', sonido: () => { if (window.YJS) window.YJS.toggle(); this.bump(); },
        winCls: D.tipo, snow: D.tipo === 'frio', rain: D.tipo === 'lluvia', hasV: !!v || !!st, noV: !v && !st, faceUrl: v ? Z7ART.cara(v.look, v.st) : st ? Z7ART.cara(st.look, {}) : '', fog: !!v && D.tipo === 'frio' && v.aliento,
        hasStamp: !!st, stampCls: st ? st.d : '', stampTxt: st ? { pasa: 'ADENTRO', rechaza: 'RECHAZADO', cuarentena: 'CUARENTENA' }[st.d] : '',
        emptyMsg: cerr ? 'Son las 18:00. Hora de cierre.' + (G.cola.length ? ' Quedan ' + G.cola.length + ' en la fila.' : '') : G.cola.length ? (G.atendidos ? 'Ventanilla libre. Quedan ' + G.cola.length + ' en la fila.' : 'Hay ' + G.cola.length + ' personas esperando afuera.') : 'No queda nadie en la fila.',
        canCall: !cerr && G.cola.length > 0, canClose: cerr || !G.cola.length, llamar: () => this.llamar(), cerrar: () => this.cerrar(),
        num: G.atendidos, pips: v ? Array.from({ length: Math.min(8, v.pac + v.asked.length) }, (_, i) => (i < v.pac ? '' : 'off')) : [],
        dialogo: v ? v.dialogo.reduce((a, d) => { if (d.q) a.push({ t: d.q, cls: 'me' }); a.push({ t: d.a, cls: '' }); return a; }, []) : [],
        hasQs: !!v && v.pac > 0 && v.of.length > 0, qs: v ? v.of.map((k) => ({ t: Z7.qTexto(v, k), cat: Z7.QCAT[k], go: () => this.preguntar(k) })) : [], rotar: () => { Z7.rotar(G); this.bump(); },
        showNoDoc: !v || (!v.ficha && !v.salvo), noDocMsg: !v ? 'El escritorio está vacío.' : v.esp === 'hermana' ? 'No trae papeles. Dice que es tu hermana. Abrí tu CUADERNO: ahí está su foto y lo que solo ustedes dos saben.' : v.esp === 'retorno' ? 'No trae papeles: dice que vive acá. Buscá su ficha en el ARCHIVO y comparala.' : 'No trae ningún documento. Dice que los perdió en el camino.',
        hasFicha: !!v && v.ficha, fotoUrl: v && v.ficha ? Z7ART.cara(v.p.cara, {}) : '', fichaChips: by('ficha'), hasSalvo: !!v && v.salvo, salvoChips: by('salvo'), zonaN: v ? v.p.zona : '',
        hasDichos: by('dicho').length > 0, dichoChips: by('dicho'),
        hasTermo: !!v && !!v.rev.termo, termoTxt: TEMPN ? TEMPN.toFixed(1).replace('.', ',') + '°' : '', termoCls: TEMPN && TEMPN < 35 ? 'cold' : TEMPN >= 37.5 ? 'hot' : '', termoNota: !TEMPN ? '' : TEMPN < 35 ? 'Por debajo de 35°. Un cuerpo vivo no marca esto.' : TEMPN >= 37.5 ? 'Fiebre. La fiebre es cosa de personas.' : 'Temperatura normal. No prueba nada.',
        hasOjos: !!v && !!v.rev.linterna, ojosUrl: v && v.rev.linterna ? Z7ART.ojos(v.look, v.ojos) : '', pilas: G.pilas,
        hasManos: !!v && !!v.rev.manos, manosUrl: v && v.rev.manos ? Z7ART.manos(v.look.skin, v.manos) : '', obsChips: by('obs'),
        hasBolso: !!v && !!v.rev.bolso, itemsTxt: v && v.itemsTxt ? v.itemsTxt : [], itemChips: by('item'),
        hasTel: !!v && !!(v.tels && v.tels.length), tels: v && v.tels ? v.tels : [], telChips: by('tel'),
        hasRes: !!v && !!v.rev.res, resTxt: v ? v.resTxt : '', resChips: by('res'),
        hasCruces: !!v && v.cruces.length > 0, cruces: v ? v.cruces.map((c, i) => ({ res: c.res, tit: TIT[c.res], txt: c.txt, a: c.a, b: c.b, conf: c.conf ? c.conf.t : '', confTipo: c.conf ? CT[c.conf.tipo] : '', canConf: !c.conf && (c.res === 'grave' || c.res === 'menor'), go: () => this.confrontar(i) })).reverse() : [],
        sideCls: s.side ? 'open' : '', toggleSide: () => this.bump({ side: !s.side }),
        tabs: tabsDef.map(([id, n]) => ({ n, cls: s.tab === id ? 'on' : '', go: () => this.bump({ tab: id }) })),
        tRadio: s.tab === 'radio', tMapa: s.tab === 'mapa', tListas: s.tab === 'listas' && !!T.lista, tArchivo: s.tab === 'archivo', tCuaderno: s.tab === 'cuaderno', tManual: s.tab === 'manual',
        radioH: G.radioH || [], hasRadioH: !!(G.radioH && G.radioH.length),
        mapaB: s.tab === 'mapa' ? mapa.filter((c) => c.b !== undefined).map(chipV) : [], mapaZ: s.tab === 'mapa' ? mapa.filter((c) => c.z !== undefined).map(chipV) : [],
        listaF: s.tab === 'listas' ? listas.filter((c) => c.key === 'fallecido').map((c) => Object.assign(chipV(c), { t: c.val.nom + ', ' + c.val.edad + ' años · ' + M.barrios[c.val.b].n })) : [], listaD: s.tab === 'listas' ? listas.filter((c) => c.key === 'desap').map((c) => Object.assign(chipV(c), { t: c.val.nom + ', ' + c.val.edad + ' años · ' + M.barrios[c.val.b].n })) : [],
        pobTxt: vivos.length + ' residentes en tres pabellones. Los doce del inicio son de confianza. Tocá uno para abrir su ficha.',
        resList: s.tab === 'archivo' ? resAll.map((r) => ({ nom: Z7.nomC(r.p), sub: 'PAB. ' + r.pab + (r.dia ? ' · ENTRÓ DÍA ' + r.dia : ' · FUNDADOR') + (r.fuera ? ' · SALIÓ ANOCHE' : ''), img: Z7ART.cara(r.p.cara, {}), cls: s.open === r.id ? 'on' : '', open: s.open === r.id, go: () => this.bump({ open: s.open === r.id ? null : r.id }), chips: s.open === r.id ? Z7.archivoChips(G, r).map(chipV) : [] })) : [],
        yoA: chipV({ id: 'yoA', txt: 'Archivo: portero, cicatriz en la mano izquierda' }), yoM: chipV({ id: 'yoM', txt: 'Tus manos, ahora' }),
        hNom: G.hermana.p.nom, hImg: s.tab === 'cuaderno' ? Z7ART.cara(G.hermana.p.cara, {}) : '', hChips: s.tab === 'cuaderno' ? Z7.cuadernoChips(G).map(chipV) : [], misManos: s.tab === 'cuaderno' ? Z7ART.manos(1, { izq: 5, der: 5, unas: true, anillo: null, venda: null }, 'der') : '',
        slotA: sel[0] ? { t: sel[0].txt, cls: 'on' } : { t: 'Tocá un dato…', cls: '' }, slotB: sel[1] ? { t: sel[1].txt, cls: 'on' } : { t: '…y otro para cruzarlos', cls: '' }, noCruzar: sel.length < 2, noSel: !sel.length, cruzar: () => this.cruzar(), limpiar: () => this.bump({ sel: [] }),
        tools, noDec: !v, rechazar: () => this.decidir('rechaza'), pasar: () => this.decidir('pasa'), cuarentena: () => this.decidir('cuarentena'), tCuar: !!T.cuarentena, noCuar: !v || G.cuarentena.length >= 2, cuarTxt: 'camas: ' + (2 - G.cuarentena.length),
        hasToast: !!s.toast, toastTit: s.toast ? s.toast.tit : '', toastTxt: s.toast ? s.toast.txt : '', toastCls: s.toast ? s.toast.cls : ''
      });
    }
    if (scr === 'cierre') {
      const R = G.resumen, pop = Z7.vivos(G).length + G.cuarentena.length; const cands = Z7.candidatosTest(G);
      Object.assign(base, { cEntran: R.entran.length, cRech: R.rechazo.length, cCuar: G.cuarentena.length,
        refTxt: pop + ' bocas para alimentar. Quedan ' + G.comida + ' raciones.' + (R.sinAtender ? ' ' + R.sinAtender + ' quedaron en la fila sin atender.' : '') + (G.dia % 2 === 0 ? ' Esta noche llega un camión con provisiones.' : ''),
        raciones: [{ t: 'Ración completa', s: '−' + pop + ' RACIONES', v: 1 }, { t: 'Media ración', s: '−' + Math.ceil(pop / 2) + ' RACIONES · BAJA LA MORAL', v: 0.5 }].map((o) => Object.assign(o, { cls: G.racion === o.v ? 'on' : '', go: () => { G.racion = o.v; this.snd('tap'); this.bump(); } })),
        hasCand: cands.length > 0 && !!T.cuarentena, cands: [{ id: null, nom: 'A nadie', donde: '' }].concat(cands).map((c) => ({ t: c.nom, s: c.donde.toUpperCase(), cls: G.test === c.id ? 'on' : '', go: () => { G.test = c.id; this.snd('tap'); this.bump(); } })), dormir: () => this.dormir() });
    }
    if (scr === 'parte') {
      const TT = { comida: ['LA OLLA', 'am'], hambre: ['HAMBRE', 'red'], sumin: ['PROVISIONES', 'grn'], desap: ['FALTA ALGUIEN', 'red'], camC: ['CÁMARA DEL PORTÓN', 'grn'], camH: ['CÁMARA DEL PORTÓN', 'red'], fila: ['LA FILA', 'am'], doc: ['ENFERMERÍA', 'am'], sale: ['SALIDA NOCTURNA', ''], radio: ['RADIO', 'am'] };
      Object.assign(base, { eventos: (G.eventos || []).map((e) => ({ tit: TT[e.t][0], cls: TT[e.t][1], txt: e.txt })), sinEventos: !(G.eventos || []).length, joel: G.pend === 'joel', noJoel: G.pend !== 'joel', entregar: () => this.joel(false), huir: () => this.joel(true), seguir: () => this.seguir(), seguirTxt: G.fin ? 'Ver el final' : 'Amanece · Día ' + (G.dia + 1) });
    }
    if (scr === 'end') {
      const F = FINALES[G.fin] || FINALES.cosa; const DEC = { pasa: 'ENTRÓ', rechaza: 'RECHAZADA', cuarentena: 'CUARENTENA' };
      Object.assign(base, { finTag: F[0], finTit: F[1], finTxt: F[2], fOk: G.stats.ok, fMal: G.stats.mal, fPob: Z7.vivos(G).filter((r) => !r.copia).length,
        reveal: G.hist.map((h) => { const bien = h.dec === 'cuarentena' || (h.copia ? h.dec === 'rechaza' : h.dec === 'pasa'); return { dia: h.dia, nom: h.nom + (h.esp === 'hermana' ? ' (tu hermana)' : h.esp === 'retorno' ? ' (residente que volvía)' : ''), era: h.copia ? 'COPIA' : 'HUMANA', dec: DEC[h.dec], cls: bien ? 'okk' : 'bad', img: Z7ART.cara(h.look, {}), pistas: h.copia ? 'Se delataba por: ' + h.tells.map((t) => TELLS[t]).join('; ') + '.' : (h.ruido.length ? 'Parecía sospechosa: ' + h.ruido.map((t) => RUIDO[t]).join('; ') + '.' : 'Sin nada raro.') }; }) });
    }
    return base;
  }
}
