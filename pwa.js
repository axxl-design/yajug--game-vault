/* YAJUGÁ · instalar como app (Android: botón nativo · iPhone: instrucciones) */
(function () {
  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || (window.matchMedia && matchMedia('(display-mode: fullscreen)').matches) || navigator.standalone;
  if (standalone) { document.documentElement.classList.add('is-app'); return; }
  var ua = navigator.userAgent || ''; var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var mobile = ios || /Android/.test(ua);
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; show(); });
  window.YJApp = { install: install, canShow: function () { return mobile; } };
  var css = '.yjapp{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:9000;display:flex;align-items:center;gap:12px;padding:12px 12px 12px 14px;border-radius:22px;background:#14110F;color:#EFE6D2;box-shadow:0 0 0 1px rgba(239,230,210,.16),0 20px 50px -10px rgba(0,0,0,.7);font:500 14px/1.35 "DM Sans",system-ui,sans-serif;animation:yjin .5s cubic-bezier(.2,.9,.3,1.2) both}'
    + '.yjapp img{width:44px;height:44px;border-radius:12px;flex:none}.yjapp b{display:block;font:800 16px "Bricolage Grotesque",system-ui,sans-serif}.yjapp span{opacity:.7;font-size:12.5px}'
    + '.yjapp .go{margin-left:auto;flex:none;min-height:44px;padding:0 16px;border-radius:999px;border:0;background:#C13B1F;color:#EFE6D2;font:800 14px "DM Sans",system-ui,sans-serif;cursor:pointer}'
    + '.yjapp .x{flex:none;width:36px;height:36px;border-radius:50%;border:0;background:rgba(239,230,210,.08);color:#EFE6D2;font-size:14px;cursor:pointer}'
    + '.yjsheet{position:fixed;inset:0;z-index:9001;background:rgba(10,8,7,.6);display:flex;align-items:flex-end;justify-content:center;animation:yjf .25s both}'
    + '.yjsheet>div{width:min(480px,100%);margin:12px;margin-bottom:calc(12px + env(safe-area-inset-bottom,0px));padding:22px;border-radius:26px;background:#EFE6D2;color:#14110F;font:500 15px/1.5 "DM Sans",system-ui,sans-serif;animation:yjin .45s cubic-bezier(.2,.9,.3,1.2) both}'
    + '.yjsheet h3{margin:0 0 6px;font:800 24px "Bricolage Grotesque",system-ui,sans-serif}.yjsheet ol{margin:14px 0 0;padding:0;list-style:none;counter-reset:s}.yjsheet li{counter-increment:s;display:flex;gap:12px;align-items:center;padding:10px 0;border-top:1px solid rgba(20,17,15,.1)}'
    + '.yjsheet li::before{content:counter(s);flex:none;width:30px;height:30px;border-radius:50%;background:#14110F;color:#E0A33A;display:grid;place-items:center;font-weight:800}.yjsheet .k{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:8px;background:#fff;font-weight:700}'
    + '.yjsheet button{margin-top:16px;width:100%;min-height:48px;border-radius:999px;border:0;background:#14110F;color:#EFE6D2;font:800 15px "DM Sans",system-ui,sans-serif}'
    + '@keyframes yjin{from{opacity:0;transform:translateY(24px)}}@keyframes yjf{from{opacity:0}}';
  function addCss() { if (document.getElementById('yjapp-css')) return; var st = document.createElement('style'); st.id = 'yjapp-css'; st.textContent = css; document.head.appendChild(st); }
  function dismissed() { try { return +localStorage.getItem('yj-app-x') > Date.now(); } catch (e) { return false; } }
  function show() {
    if (!mobile || dismissed() || document.querySelector('.yjapp')) return; if (!/^\/?$/.test(location.pathname)) return; // solo en la portada
    addCss(); var d = document.createElement('div'); d.className = 'yjapp'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Instalar YAJUGÁ');
    d.innerHTML = '<img src="/icons/icon-192.png" alt=""><div><b>YAJUGÁ como app</b><span>Pantalla completa, sin barras del navegador</span></div><button class="go" type="button">Instalar</button><button class="x" type="button" aria-label="Ahora no">✕</button>';
    d.querySelector('.go').onclick = install;
    d.querySelector('.x').onclick = function () { try { localStorage.setItem('yj-app-x', String(Date.now() + 3 * 864e5)); } catch (e) {} d.remove(); };
    document.body.appendChild(d);
  }
  function install() {
    if (deferred) { deferred.prompt(); deferred.userChoice.then(function () { deferred = null; var b = document.querySelector('.yjapp'); if (b) b.remove(); }); return; }
    addCss(); var s = document.createElement('div'); s.className = 'yjsheet';
    var share = '<span class="k"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>Compartir</span>';
    var steps = ios
      ? '<li><div>Abrí esta página en <b>Safari</b> (en Chrome también funciona en iOS 16.4 o más nuevo).</div></li><li><div>Tocá ' + share + ' en la barra del navegador.</div></li><li><div>Elegí <span class="k">Agregar a inicio</span> y confirmá con <b>Agregar</b>.</div></li><li><div>Abrí YAJUGÁ desde el ícono de tu pantalla de inicio.</div></li>'
      : '<li><div>Tocá el menú <span class="k">⋮</span> del navegador.</div></li><li><div>Elegí <span class="k">Instalar app</span> o <span class="k">Agregar a pantalla principal</span>.</div></li><li><div>Abrí YAJUGÁ desde el ícono de tu pantalla de inicio.</div></li>';
    s.innerHTML = '<div role="dialog" aria-label="Cómo instalar"><h3>Instalá YAJUGÁ</h3><div>Queda como una app más: ícono propio y pantalla completa.</div><ol>' + steps + '</ol><button type="button">Listo</button></div>';
    s.onclick = function (e) { if (e.target === s || e.target.tagName === 'BUTTON') s.remove(); };
    document.body.appendChild(s);
  }
  if (ios) window.addEventListener('load', function () { setTimeout(show, 2500); });
})();
