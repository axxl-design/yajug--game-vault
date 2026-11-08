/* YAJUGÁ salas online: Supabase Realtime (broadcast + presence) + tabla rooms para que la partida siga aunque la gente salga.
   Un jugador conectado hace de "mesa" (corre la lógica). Si se va, otro toma su lugar con el último estado guardado. */
(function () {
  var URL = 'https://zvmydfzirtvfhbxvhryi.supabase.co';
  var KEY = 'sb_publishable_s0aBPe2GodEt9j3oeSp3jg_iUL9MZBw';
  var GAME = window.YJ_GAME || 'dominio'; var PATH = GAME === 'dominio' ? '/jugar' : '/' + GAME;
  var sb = null;
  function client() { if (!sb) sb = window.supabase.createClient(URL, KEY, { auth: { persistSession: false }, realtime: { params: { eventsPerSecond: 20 } } }); return sb; }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  var myId = store('yj-pid');
  if (!myId) { myId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now(); store('yj-pid', myId); }
  function mkCode() { var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = ''; for (var i = 0; i < 5; i++) s += A[Math.floor(Math.random() * A.length)]; return s; }
  function linkFor(c) { return location.origin + PATH + '?sala=' + c; }
  function setUrl(c) { try { history.replaceState(null, '', c ? PATH + '?sala=' + c : PATH); } catch (e) {} }
  function loadRoom(code) { return client().from('rooms').select('state,seats,ver').eq('code', code).maybeSingle().then(function (r) { return r.data || null; }, function () { return null; }); }

  function open(comp, code, name, creating) {
    setUrl(code);
    comp.lobby = { code: code, link: linkFor(code), host: !!creating, me: myId, players: [], err: '', msg: creating ? 'Compartí el código o el link con tus amigos.' : 'Conectando con la sala…' };
    var ch = client().channel('yj-' + GAME + '-' + code, { config: { broadcast: { self: false, ack: false }, presence: { key: myId } } });
    var net = {
      host: !!creating, ch: ch, code: code, last: 0, timer: null, saveT: null, savedAt: 0, seats: {}, roles: {}, roster: [], present: [], inGame: false, name: name,
      term: 0, hostId: creating ? myId : null, lastBeat: Date.now(), seq: 0, pend: null, absent: {}, helloAt: 0,
      send: function (n, args) {
        var aid = myId.slice(0, 8) + ':' + (++net.seq) + ':' + Date.now() % 100000;
        var payload = { from: myId, name: n, args: args || [], aid: aid };
        var fire = function () { ch.send({ type: 'broadcast', event: 'act', payload: payload }); };
        net.pend = { aid: aid }; fire(); clearInterval(net.pendInt); var tries = 0;
        net.pendInt = setInterval(function () {
          if (!net.pend || net.pend.aid !== aid) { clearInterval(net.pendInt); return; }
          tries += 1; if (tries > 6) { net.pend = null; clearInterval(net.pendInt); comp.toast('No llegó tu jugada. Revisá tu conexión y probá de nuevo.', comp.seat); comp.refresh(); return; }
          fire();
        }, 1300);
        comp.setState({ v: Date.now() });
      },
      push: function (g, now) {
        if (!net.host) return;
        clearTimeout(net.timer);
        var go = function () { if (!net.host) return; net.last = Date.now(); ch.send({ type: 'broadcast', event: 'state', payload: { g: comp.g, term: net.term, hid: myId } }); };
        var wait = now ? 0 : 110 - (Date.now() - net.last);
        if (wait <= 0) go(); else net.timer = setTimeout(go, wait);
        net.save(g);
      },
      save: function (g) {
        if (!net.inGame || !net.host) return;
        clearTimeout(net.saveT);
        var go = function () { if (!net.host) return; net.savedAt = Date.now(); client().from('rooms').upsert({ code: code, state: comp.g, seats: net.seats, ver: (net.term || 0) * 1000000 + (comp.g.ver || 0), updated_at: new Date().toISOString() }).then(function () {}, function () {}); };
        var wait = 1500 - (Date.now() - net.savedAt);
        if (wait <= 0) go(); else net.saveT = setTimeout(go, wait);
      }
    };
    comp.net = net;
    store('yj-last-' + GAME, { code: code, name: name });

    function lobbyOut() {
      var players = net.roster.map(function (x) { return { id: x.id, name: x.name, host: x.id === leaderLobby(), role: net.roles[x.id] || '' }; });
      var hu = players.length; if (net.bots == null) net.bots = Math.max(0, 3 - hu); net.bots = Math.max(Math.max(0, 2 - hu), Math.min(5 - hu, net.bots));
      comp.lobby.players = players; comp.lobby.host = net.host; comp.lobby.bots = net.bots;
      var cfg = comp.cfgNow ? comp.cfgNow() : null; comp.lobby.cfg = cfg;
      ch.send({ type: 'broadcast', event: 'lobby', payload: { players: players, bots: net.bots, cfg: cfg } });
      comp.refresh();
    }
    net.lobbyOut = lobbyOut;
    function leaderLobby() { return net.present.length ? net.present[0].id : myId; }
    function seatOf(id) { return net.seats[id]; }
    function humansHere() {
      return net.present.filter(function (x) { var s = seatOf(x.id); return s !== undefined; }).sort(function (a, b) { return seatOf(a.id) - seatOf(b.id); });
    }
    function stepDown() {
      if (!net.host) return;
      net.host = false; if (comp.lobby) comp.lobby.host = false;
      clearInterval(net.beatInt); clearTimeout(net.timer); clearTimeout(net.saveT);
      comp.clearAll();
    }
    // ¿Este mensaje viene de la mesa vigente? Mesa nueva = término más alto. Empate: gana el id menor.
    function fromCurrent(term, hid) {
      term = term || 0;
      if (term > net.term) return true;
      if (term < net.term) return false;
      if (!net.hostId || hid === net.hostId) return true;
      return hid < net.hostId;
    }
    function adoptHost(term, hid) {
      if (net.host && hid !== myId) stepDown();
      net.term = term || 0; net.hostId = hid; net.lastBeat = Date.now();
    }
    function startBeat() {
      clearInterval(net.beatInt);
      net.beatInt = setInterval(function () {
        if (!net.host) { clearInterval(net.beatInt); return; }
        ch.send({ type: 'broadcast', event: 'beat', payload: { term: net.term, hid: myId, ver: comp.g.ver || 0 } });
        tendAway();
      }, 2000);
    }
    function becomeHost() {
      if (net.host || net.taking) return; net.taking = true;
      loadRoom(code).then(function (row) {
        net.taking = false;
        if (Date.now() - net.lastBeat < 6000 && net.hostId && net.hostId !== myId) return; // la mesa volvió mientras tanto
        if (row && row.state) {
          var rk = row.ver || 0, mk = (net.term || 0) * 1000000 + (comp.g.ver || 0);
          if (rk > mk) comp.g = row.state;
          if (row.seats) net.seats = row.seats;
        }
        var t = Math.max(net.term || 0, comp.g.term || 0, Math.floor((row && row.ver || 0) / 1000000)) + 1;
        net.term = t; net.hostId = myId; net.host = true; net.lastBeat = Date.now();
        if (comp.lobby) comp.lobby.host = true;
        comp.g.term = t; comp.g.hostSeat = comp.seat; net.absent = {};
        comp.resume(); startBeat(); net.push(comp.g, true);
      });
    }
    net.becomeHost = becomeHost; net.startBeat = startBeat;
    // Si alguien se desconecta, la compu juega por él recién después de 25 s (un parpadeo de señal no le roba el turno).
    function tendAway() {
      if (!net.host || !net.inGame || comp.g.screen !== 'game') return;
      var here = {}; net.present.forEach(function (x) { here[x.id] = 1; }); here[myId] = 1;
      var now = Date.now();
      Object.keys(net.seats).forEach(function (id) {
        var s = net.seats[id], p = comp.g.players[s]; if (!p) return;
        if (here[id]) { delete net.absent[id]; if (p.away) comp.comeback(s); return; }
        if (!net.absent[id]) net.absent[id] = now;
        if (!p.bot && now - net.absent[id] > 25000) comp.takeover(s);
      });
    }
    function syncAway() { tendAway(); }
    function watchdog() {
      if (!net.inGame || net.host) return;
      var silent = Date.now() - net.lastBeat;
      if (silent < 9000) return;
      var cand = humansHere().filter(function (x) { return x.id !== net.hostId; });
      var rank = cand.findIndex(function (x) { return x.id === myId; });
      if (rank < 0) return;
      if (silent > 9000 + rank * 4000) becomeHost();
    }
    net.wd = setInterval(watchdog, 1500);
    function askState() { if (Date.now() - net.helloAt < 2500) return; net.helloAt = Date.now(); ch.send({ type: 'broadcast', event: 'hello', payload: { from: myId } }); }
    net.askState = askState;
    net.onVis = function () {
      if (document.visibilityState !== 'visible' || !net.inGame) return;
      if (net.host) { ch.send({ type: 'broadcast', event: 'beat', payload: { term: net.term, hid: myId, ver: comp.g.ver || 0 } }); net.push(comp.g, true); }
      else askState();
    };
    document.addEventListener('visibilitychange', net.onVis);
    ch.on('presence', { event: 'sync' }, function () {
      var st = ch.presenceState();
      net.present = Object.keys(st).map(function (id) { var m = st[id][0] || {}; return { id: id, name: m.name || 'Jugador', t: m.t || 0 }; }).sort(function (a, b) { return a.t - b.t; });
      if (!net.inGame) {
        var wasHost = net.host; net.host = leaderLobby() === myId;
        if (net.host) {
          if (!wasHost) { (comp.lobby.players || []).forEach(function (x) { if (x.role) net.roles[x.id] = x.role; }); }
          net.roster = net.present.slice(0, 4); lobbyOut();
        } else comp.refresh();
      } else {
        syncAway();
      }
    });
    ch.on('broadcast', { event: 'lobby' }, function (m) {
      if (net.host || !comp.lobby || net.inGame) return;
      comp.lobby.players = m.payload.players; comp.lobby.host = false; if (m.payload.bots != null) comp.lobby.bots = m.payload.bots; if (m.payload.cfg) comp.lobby.cfg = m.payload.cfg;
      comp.lobby.msg = m.payload.players.some(function (p) { return p.id === myId; }) ? 'Ya estás en la sala. Elegí tu rol y esperá a que empiece.' : 'La sala está llena (máximo 4).';
      comp.refresh();
    });
    ch.on('broadcast', { event: 'pick' }, function (m) {
      if (!net.host || net.inGame) return; var p = m.payload;
      var taken = Object.keys(net.roles).some(function (id) { return net.roles[id] === p.role && id !== p.from; });
      if (!taken) net.roles[p.from] = p.role; lobbyOut();
    });
    ch.on('broadcast', { event: 'hello' }, function () { if (!net.host) return; if (!net.inGame) lobbyOut(); else { ch.send({ type: 'broadcast', event: 'start', payload: { seats: net.seats, term: net.term, hid: myId } }); net.push(comp.g, true); } });
    ch.on('broadcast', { event: 'start' }, function (m) {
      if (m.payload.term !== undefined && !fromCurrent(m.payload.term, m.payload.hid)) return;
      net.seats = m.payload.seats; net.inGame = true; if (m.payload.hid) adoptHost(m.payload.term || 0, m.payload.hid);
      var s = net.seats[myId];
      if (s === undefined) { comp.lobby.err = 'Esta partida ya empezó sin vos.'; comp.refresh(); return; }
      comp.seat = s; comp.ui.sheet = null;
    });
    ch.on('broadcast', { event: 'state' }, function (m) {
      var P = m.payload; var ng = P.g; if (!ng || !comp.lobby) return;
      if (!fromCurrent(P.term, P.hid)) return;
      var newTerm = (P.term || 0) !== net.term || P.hid !== net.hostId;
      if (!newTerm && !net.host && (ng.ver || 0) < (comp.g.ver || 0) && comp.g.screen === 'game') return;
      adoptHost(P.term, P.hid);
      if (comp.seat === null || comp.seat === undefined) return;
      if (net.pend && ng.aids && ng.aids[comp.seat] === net.pend.aid) { net.pend = null; clearInterval(net.pendInt); }
      var prev = comp.g; comp.g = ng;
      if (prev.phase !== ng.phase && ['rolling', 'moving', 'draw', 'drawing', 'bot'].indexOf(ng.phase) >= 0) { if (!comp.cam.free) { comp.cam.follow = true; comp.cam.px = 0; comp.cam.py = 0; if (!comp.cam.zoomed && comp.cam.s < 0.5) comp.cam.s = comp.mob() ? 0.62 : 1; } }
      comp.refresh();
    });
    ch.on('broadcast', { event: 'beat' }, function (m) {
      var P = m.payload; if (!fromCurrent(P.term, P.hid)) return;
      var wasOther = net.host && P.hid !== myId; adoptHost(P.term, P.hid);
      if (wasOther || (P.ver || 0) > (comp.g.ver || 0) + 2) askState();
    });
    ch.on('broadcast', { event: 'act' }, function (m) {
      if (!net.host) return; var P = m.payload; var seat = net.seats[P.from];
      if (seat === undefined || comp.g.screen !== 'game') return;
      var g = comp.g; g.aids = g.aids || {};
      if (P.aid && g.aids[seat] === P.aid) { net.push(g, true); return; }
      if (P.aid) g.aids[seat] = P.aid;
      comp.doAct(seat, P.name, P.args || []);
      comp.refresh();
    });
    function go() {
      ch.subscribe(function (status) {
        if (status === 'SUBSCRIBED') {
          ch.track({ name: name, t: Date.now() }).then(function () { ch.send({ type: 'broadcast', event: 'hello', payload: {} }); comp.refresh(); });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') { if (comp.lobby) { comp.lobby.err = 'No se pudo conectar. Revisá tu internet y probá de nuevo.'; comp.refresh(); } }
      });
    }
    comp.seat = creating ? 0 : null;
    if (creating) { go(); comp.refresh(); return; }
    loadRoom(code).then(function (row) {
      if (row && row.state && (row.state.game || 'dominio') !== GAME) { comp.lobby.err = 'Ese código es de otro juego de YAJUGÁ.'; comp.refresh(); return; }
      if (row && row.state && row.state.screen === 'game') {
        var s = row.seats ? row.seats[myId] : undefined;
        if (s === undefined) { comp.lobby.err = 'Esta partida ya empezó y no estás en ella.'; comp.refresh(); return; }
        net.inGame = true; net.seats = row.seats; comp.seat = s; comp.g = row.state;
        net.term = Math.floor((row.ver || 0) / 1000000) || row.state.term || 0; net.hostId = null; net.lastBeat = Date.now() - 4000;
        comp.cam.follow = true; comp.refresh(); setTimeout(askState, 600);
      }
      go(); comp.refresh();
    });
  }
  function leave(comp, forget) {
    var net = comp.net; if (!net) return;
    clearTimeout(net.timer); clearTimeout(net.saveT); clearInterval(net.beatInt); clearInterval(net.wd); clearInterval(net.pendInt);
    try { document.removeEventListener('visibilitychange', net.onVis); } catch (e) {}
    try { net.ch.untrack(); } catch (e) {}
    try { client().removeChannel(net.ch); } catch (e) {}
    if (forget || !net.inGame) store('yj-last-' + GAME, null);
    comp.net = null; comp.lobby = null; comp.seat = 0; setUrl(null);
  }
  window.YJNet = {
    create: function (comp, name) { open(comp, mkCode(), name, true); },
    join: function (comp, code, name) { open(comp, code.toUpperCase(), name, false); },
    last: function () { return store('yj-last-' + GAME); },
    pickRole: function (comp, role) {
      var net = comp.net; if (!net) return;
      if (net.host) { var taken = Object.keys(net.roles).some(function (id) { return net.roles[id] === role && id !== myId; }); if (!taken) net.roles[myId] = role; net.lobbyOut(); }
      else net.ch.send({ type: 'broadcast', event: 'pick', payload: { from: myId, role: role } });
    },
    start: function (comp) {
      var net = comp.net; if (!net || !net.host) return;
      var used = [], list = [], seats = {};
      net.roster.forEach(function (x, k) { var r = net.roles[x.id]; used.push(r); seats[x.id] = k; list.push({ name: x.name, roleId: r }); });
      var all = (typeof ROLES !== 'undefined' ? ROLES : []).map(function (r) { return r.id; });
      var ids = all.filter(function (r) { return used.indexOf(r) < 0; }).sort(function () { return Math.random() - 0.5; });
      var nb = net.bots == null ? Math.max(0, 3 - list.length) : net.bots; nb = Math.min(nb, 5 - list.length, ids.length);
      for (var b = 0; b < nb; b++) list.push({ name: 'Compu ' + (b + 1), roleId: ids.shift(), bot: true });
      var T = (net.term || 0) + 1;
      net.seats = seats; net.inGame = true; comp.seat = 0; net.term = T; net.hostId = myId; net.host = true;
      net.ch.send({ type: 'broadcast', event: 'start', payload: { seats: seats, term: T, hid: myId } });
      comp.startMP(list); comp.g.term = T; net.startBeat(); net.push(comp.g, true);
    },
    setBots: function (comp, d) { var net = comp.net; if (!net || !net.host || net.inGame) return; net.bots = (net.bots == null ? 1 : net.bots) + d; net.lobbyOut(); },
    leave: leave
  };
  try {
    var q = new URLSearchParams(location.search).get('sala');
    if (q) window.__salaCode = q.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
  } catch (e) {}
})();
