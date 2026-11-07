/* YAJUGÁ salas online: Supabase Realtime (broadcast + presence). El anfitrión corre la partida y los demás la ven en vivo. */
(function () {
  var URL = 'https://zvmydfzirtvfhbxvhryi.supabase.co';
  var KEY = 'sb_publishable_s0aBPe2GodEt9j3oeSp3jg_iUL9MZBw';
  var sb = null;
  function client() { if (!sb) sb = window.supabase.createClient(URL, KEY, { realtime: { params: { eventsPerSecond: 20 } } }); return sb; }
  var myId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now();
  function mkCode() { var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = ''; for (var i = 0; i < 5; i++) s += A[Math.floor(Math.random() * A.length)]; return s; }
  function linkFor(c) { return location.origin + '/jugar?sala=' + c; }

  function open(comp, code, name, host) {
    var ch = client().channel('yj-' + code, { config: { broadcast: { self: false, ack: false }, presence: { key: myId } } });
    comp.lobby = { code: code, link: linkFor(code), host: host, me: myId, players: [], err: '', msg: host ? 'Compartí el código o el link con tus amigos.' : 'Conectando con la sala…', hostSeen: false };
    var net = {
      host: host, ch: ch, code: code, last: 0, timer: null, seats: {}, roles: {}, roster: [],
      send: function (n, args) { ch.send({ type: 'broadcast', event: 'act', payload: { from: myId, name: n, args: args || [] } }); },
      push: function (g) {
        clearTimeout(net.timer);
        var go = function () { net.last = Date.now(); ch.send({ type: 'broadcast', event: 'state', payload: { g: g } }); };
        var wait = 110 - (Date.now() - net.last);
        if (wait <= 0) go(); else net.timer = setTimeout(function () { go(); }, wait);
      }
    };
    comp.net = net;
    function lobbyOut() {
      var players = net.roster.map(function (x) { return { id: x.id, name: x.name, host: x.host, role: net.roles[x.id] || '' }; });
      comp.lobby.players = players;
      ch.send({ type: 'broadcast', event: 'lobby', payload: { players: players } });
      comp.refresh();
    }
    net.lobbyOut = lobbyOut;
    function hostGone() { leave(comp); comp.clearAll(); comp.g = comp.fresh(); comp.toast('El anfitrión cerró la sala'); }
    ch.on('presence', { event: 'sync' }, function () {
      var st = ch.presenceState();
      var list = Object.keys(st).map(function (id) { var m = st[id][0] || {}; return { id: id, name: m.name || 'Jugador', t: m.t || 0, host: !!m.host }; }).sort(function (a, b) { return a.t - b.t; });
      if (host) { if (comp.g.screen === 'pick') { net.roster = list.slice(0, 4); lobbyOut(); } }
      else if (comp.lobby) { var h = list.some(function (x) { return x.host; }); if (h) comp.lobby.hostSeen = true; else if (comp.lobby.hostSeen) hostGone(); }
    });
    ch.on('presence', { event: 'leave' }, function (e) {
      if (!host || comp.g.screen !== 'game') return;
      (e.leftPresences || []).forEach(function () {});
      var seat = net.seats[e.key]; if (seat !== undefined) comp.takeover(seat);
    });
    ch.on('broadcast', { event: 'lobby' }, function (m) {
      if (host || !comp.lobby) return;
      comp.lobby.players = m.payload.players;
      comp.lobby.msg = m.payload.players.some(function (p) { return p.id === myId; }) ? 'Ya estás en la sala. Elegí tu rol y esperá al anfitrión.' : 'La sala está llena (máximo 4).';
      comp.refresh();
    });
    ch.on('broadcast', { event: 'pick' }, function (m) {
      if (!host) return; var p = m.payload;
      var taken = Object.keys(net.roles).some(function (id) { return net.roles[id] === p.role && id !== p.from; });
      if (!taken) net.roles[p.from] = p.role; lobbyOut();
    });
    ch.on('broadcast', { event: 'hello' }, function () { if (!host) return; if (comp.g.screen === 'pick') lobbyOut(); else net.push(comp.g); });
    ch.on('broadcast', { event: 'start' }, function (m) {
      if (host) return; var s = m.payload.seats[myId];
      if (s === undefined) { comp.lobby.err = 'La partida empezó sin vos.'; comp.refresh(); return; }
      comp.seat = s; comp.ui.sheet = null;
    });
    ch.on('broadcast', { event: 'state' }, function (m) {
      if (host || comp.seat === null || comp.seat === undefined || !comp.lobby) return;
      var prev = comp.g; comp.g = m.payload.g;
      if (prev.phase !== comp.g.phase && ['rolling', 'moving', 'draw', 'drawing', 'bot'].indexOf(comp.g.phase) >= 0) { comp.cam.follow = true; comp.cam.px = 0; comp.cam.py = 0; if (comp.cam.s < 0.5) comp.cam.s = comp.mob() ? 0.62 : 1; }
      comp.refresh();
    });
    ch.on('broadcast', { event: 'act' }, function (m) {
      if (!host) return; var seat = net.seats[m.payload.from];
      if (seat !== undefined) comp.doAct(seat, m.payload.name, m.payload.args || []);
    });
    ch.on('broadcast', { event: 'closed' }, function () { if (!host) hostGone(); });
    ch.subscribe(function (status) {
      if (status === 'SUBSCRIBED') {
        ch.track({ name: name, t: Date.now(), host: host }).then(function () {
          if (!host) ch.send({ type: 'broadcast', event: 'hello', payload: {} });
          comp.refresh();
        });
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') { if (comp.lobby) { comp.lobby.err = 'No se pudo conectar. Revisá tu internet y probá de nuevo.'; comp.refresh(); } }
    });
    comp.seat = host ? 0 : null;
    comp.refresh();
  }
  function leave(comp) {
    var net = comp.net; if (!net) return;
    try { if (net.host) net.ch.send({ type: 'broadcast', event: 'closed', payload: {} }); } catch (e) {}
    try { client().removeChannel(net.ch); } catch (e) {}
    comp.net = null; comp.lobby = null; comp.seat = 0;
    try { history.replaceState(null, '', '/jugar'); } catch (e) {}
  }
  window.YJNet = {
    create: function (comp, name) { var c = mkCode(); try { history.replaceState(null, '', '/jugar?sala=' + c); } catch (e) {} open(comp, c, name, true); },
    join: function (comp, code, name) { open(comp, code.toUpperCase(), name, false); },
    pickRole: function (comp, role) {
      var net = comp.net; if (!net) return;
      if (net.host) { var taken = Object.keys(net.roles).some(function (id) { return net.roles[id] === role && id !== myId; }); if (!taken) net.roles[myId] = role; net.lobbyOut(); }
      else net.ch.send({ type: 'broadcast', event: 'pick', payload: { from: myId, role: role } });
    },
    start: function (comp) {
      var net = comp.net; if (!net || !net.host) return;
      var used = [], list = [], seats = {};
      net.roster.forEach(function (x, k) { var r = net.roles[x.id]; used.push(r); seats[x.id] = k; list.push({ name: x.name, roleId: r }); });
      var ids = ['banquero', 'estafador', 'abogado', 'corredor', 'coleccionista', 'arquitecto'].filter(function (r) { return used.indexOf(r) < 0; });
      while (list.length < 3) list.push({ name: 'Compu ' + list.length, roleId: ids.shift(), bot: true });
      net.seats = seats; comp.seat = 0;
      net.ch.send({ type: 'broadcast', event: 'start', payload: { seats: seats } });
      comp.startMP(list);
    },
    leave: leave
  };
  try {
    var q = new URLSearchParams(location.search).get('sala');
    if (q) window.__salaCode = q.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
  } catch (e) {}
})();
