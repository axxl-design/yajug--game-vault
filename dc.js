/* YAJUGÁ mini runtime: renders the Design Component templates as a normal web page. */
(function () {
  var HOLE = /\{\{([^}]+)\}\}/g;
  var ONE = /^\s*\{\{([^}]+)\}\}\s*$/;
  var BOOL = { disabled: 1, checked: 1, hidden: 1, selected: 1, readonly: 1, required: 1 };
  var VOID = { area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1, link: 1, meta: 1, source: 1, track: 1, wbr: 1 };
  function look(scope, path) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return +path;
    var v = scope, ks = path.split('.');
    for (var i = 0; i < ks.length; i++) { if (v == null) return undefined; v = v[ks[i]]; }
    return v;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function interp(str, scope) {
    var out = '', last = 0, m; HOLE.lastIndex = 0;
    while ((m = HOLE.exec(str))) { out += esc(str.slice(last, m.index)); var v = look(scope, m[1]); out += v == null ? '' : esc(v); last = HOLE.lastIndex; }
    return out + esc(str.slice(last));
  }
  function kids(node, scope, H) { var o = ''; for (var c = node.firstChild; c; c = c.nextSibling) o += rnd(c, scope, H); return o; }
  function rnd(node, scope, H) {
    if (node.nodeType === 3) return interp(node.nodeValue, scope);
    if (node.nodeType !== 1) return '';
    var tag = node.localName;
    if (tag === 'sc-for') {
      var list = look(scope, (node.getAttribute('list') || '').replace(/[{}]/g, '')) || [];
      var as = node.getAttribute('as') || 'item', o = '';
      for (var i = 0; i < list.length; i++) { var sc = Object.create(scope); sc[as] = list[i]; o += kids(node, sc, H); }
      return o;
    }
    if (tag === 'sc-if') return look(scope, (node.getAttribute('value') || '').replace(/[{}]/g, '')) ? kids(node, scope, H) : '';
    var o2 = '<' + tag;
    for (var a = 0; a < node.attributes.length; a++) {
      var at = node.attributes[a], name = at.name, val = at.value;
      if (name.indexOf('hint-') === 0) continue;
      var one = ONE.exec(val);
      if (/^on[a-z]+$/i.test(name)) {
        if (one) { var fn = look(scope, one[1]); if (typeof fn === 'function') o2 += ' data-on-' + name.slice(2).toLowerCase() + '="' + (H.push(fn) - 1) + '"'; }
        continue;
      }
      if (name === 'href') val = val.replace(/^Main\.dc\.html/, '/').replace(/^Jugar\.dc\.html/, '/jugar').replace(/^Adivina\.dc\.html/, '/adivina');
      if (one) {
        var v = look(scope, one[1]);
        if (v === false || v == null) { if (BOOL[name]) continue; v = ''; }
        if (v === true) { o2 += ' ' + name; continue; }
        o2 += ' ' + name + '="' + esc(v) + '"';
      } else o2 += ' ' + name + '="' + interp(val, scope) + '"';
    }
    o2 += '>';
    if (VOID[tag]) return o2;
    return o2 + kids(node, scope, H) + '</' + tag + '>';
  }
  window.DCLogic = function DCLogic(props) { this.props = props || {}; this.state = {}; };
  window.DCLogic.prototype.setState = function (o) {
    if (typeof o === 'function') o = o(this.state);
    Object.assign(this.state, o || {});
    if (this.__sched) this.__sched();
  };
  window.DCBoot = function (Component, tplId) {
    var root = document.getElementById('root');
    var t = document.createElement('template');
    t.innerHTML = document.getElementById(tplId).textContent;
    var tpl = t.content;
    var comp = new Component({});
    var H = [], queued = false;
    function render() {
      queued = false; H = [];
      var vals = comp.renderVals();
      var html = '<div id="root">' + kids(tpl, vals, H) + '</div>';
      window.morphdom(root, html, {
        onBeforeElUpdated: function (from, to) {
          if (from === document.activeElement && (from.tagName === 'INPUT' || from.tagName === 'TEXTAREA')) {
            for (var i = 0; i < to.attributes.length; i++) { var a = to.attributes[i]; if (a.name !== 'value') from.setAttribute(a.name, a.value); }
            return false;
          }
          return !from.isEqualNode(to);
        }
      });
    }
    comp.__sched = function () { if (!queued) { queued = true; requestAnimationFrame(render); } };
    function hand(type) {
      return function (e) {
        var el = e.target && e.target.closest ? e.target.closest('[data-on-' + type + ']') : null;
        if (!el || !root.contains(el)) return;
        if (type === 'pointerleave' && el !== e.target) return;
        var fn = H[+el.getAttribute('data-on-' + type)];
        if (fn) fn(e);
      };
    }
    ['click', 'input', 'change', 'pointerdown', 'pointermove', 'pointerup', 'keydown'].forEach(function (ty) { root.addEventListener(ty, hand(ty)); });
    root.addEventListener('pointerleave', hand('pointerleave'), true);
    root.addEventListener('wheel', hand('wheel'), { passive: true });
    window.__comp = comp;
    render();
    if (comp.componentDidMount) comp.componentDidMount();
    return comp;
  };
})();
