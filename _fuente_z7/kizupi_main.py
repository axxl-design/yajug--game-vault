# Portada: estructura y animaciones originales + estilo "interfaz moderna, pixel art solo en ilustraciones" (ref. kizupi.com)
import re, subprocess, random
src = open('/home/claude/yajuga/build/pixelize_main.py').read()
# reutiliza: carga del original, imágenes pixel y cambios de contenido (todo lo anterior a la capa pixel)
cut = src.index("# --- fuentes:")
exec(src[:cut])  # deja `s` con contenido actualizado e imágenes pixel
def rep(a, b):
    global s
    assert a in s, a[:70]; s = s.replace(a, b)
rep('family=Instrument+Serif:ital@0;1&amp;display=swap', 'family=Instrument+Serif:ital@0;1&amp;family=Atkinson+Hyperlegible:wght@400;700&amp;display=swap')

# ---------- ciudad pixel del hero ----------
random.seed(11)
def city(dark):
    pal = ['#9BB7E0', '#A8C9D6', '#E8A7A0', '#F2C14E', '#B9B3E6', '#8FB8A8', '#D9CBB0'] if not dark else ['#2A3550', '#2B3E44', '#4A2E33', '#4D3F22', '#35324F', '#26403A', '#3A332B']
    win = '#FFF6D8' if not dark else '#F2C46B'; wd = '#5A6A8A' if not dark else '#151820'
    r = []; x = 0
    while x < 480:
        w = random.choice([22, 26, 30, 34, 38]); h = random.randint(40, 120); c = random.choice(pal)
        r.append(f'<rect x="{x}" y="{150-h}" width="{w}" height="{h}" fill="{c}"/>')
        r.append(f'<rect x="{x}" y="{150-h}" width="{w}" height="3" fill="#ffffff" opacity=".35"/>')
        for wy in range(150-h+7, 146, 8):
            for wx in range(x+4, x+w-4, 6):
                lit = random.random() < (0.55 if not dark else 0.4)
                r.append(f'<rect x="{wx}" y="{wy}" width="3" height="3" fill="{win if lit else wd}"/>')
        x += w + random.choice([0, 2, 4, 8])
    # calle
    r.append(f'<rect x="0" y="150" width="480" height="12" fill="{"#8A8F96" if not dark else "#1E2126"}"/>')
    for dx in range(4, 480, 16): r.append(f'<rect x="{dx}" y="155" width="8" height="2" fill="{"#F3EFE2" if not dark else "#6A6E74"}"/>')
    # autitos
    for cx, cc in [(70, '#C13B1F'), (300, '#E0A33A')]:
        r.append(f'<rect x="{cx}" y="146" width="16" height="6" fill="{cc}"/><rect x="{cx+3}" y="142" width="9" height="4" fill="{cc}"/><rect x="{cx+4}" y="143" width="3" height="2" fill="#DDEAF5"/><rect x="{cx+2}" y="152" width="3" height="2" fill="#222"/><rect x="{cx+11}" y="152" width="3" height="2" fill="#222"/>')
    return f'<svg viewBox="0 0 480 162" preserveAspectRatio="xMidYMax slice" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">{"".join(r)}</svg>'
CITY = '<div class="pxcity pxl" aria-hidden="true">' + city(False) + '</div><div class="pxcity pxd" aria-hidden="true">' + city(True) + '</div>'
SUN = '<div class="pxsun" aria-hidden="true"></div><div class="pxcloud c1" aria-hidden="true"></div><div class="pxcloud c2" aria-hidden="true"></div>'
m = re.search(r'<section id="inicio" class="hero"[^>]*>', s); assert m
s = s.replace(m.group(0), m.group(0) + SUN + CITY, 1)

# globos de diálogo sobre el abanico de cartas
fan = re.search(r'<div class="fan[^"]*"[^>]*>', s)
if fan:
    s = s.replace(fan.group(0), fan.group(0) + '<div class="pxbub b1" aria-hidden="true">¡Te toca!</div><div class="pxbub b2" aria-hidden="true">Tirá el dado</div>', 1)

CSS = r'''
/* ===== Estilo kizupi: interfaz moderna, pixel art en las ilustraciones ===== */
.yj{font-family:'Atkinson Hyperlegible','DM Sans',system-ui,sans-serif}
.yj img{image-rendering:pixelated}
/* palabra destacada: caja de color en vez de cursiva */
.yj .serif{font-family:'Bricolage Grotesque',sans-serif !important;font-style:normal !important;font-weight:800 !important;letter-spacing:-.04em !important;color:#14110F !important;background:#E0A33A;padding:0 .14em .02em;border-radius:.14em;box-decoration-break:clone;-webkit-box-decoration-break:clone;display:inline-block;line-height:1.05;font-size:1em !important}
.yj #jugar .serif{background:#14110F;color:#EFE6D2 !important}
/* botones: redondeo chico y sombra sólida abajo */
.yj .btn{border-radius:12px !important;border:0 !important;min-height:54px;transition:transform .15s,box-shadow .15s,filter .15s !important}
.yj .btn-rust{background:#C13B1F;box-shadow:0 4px 0 #7A2412 !important}
.yj .btn-rust:hover{transform:translateY(-2px) !important;box-shadow:0 6px 0 #7A2412 !important}
.yj .btn:active{transform:translateY(3px) !important;box-shadow:0 1px 0 rgba(0,0,0,.4) !important}
.yj .btn-ghost{background:var(--surface) !important;color:var(--text) !important;box-shadow:inset 0 0 0 1.5px var(--line2),0 3px 0 var(--line2) !important}
.yj .btn-ink{box-shadow:0 4px 0 #000 !important}
.yj .btn-primary{box-shadow:0 4px 0 rgba(0,0,0,.35) !important}
.yj .navbar{border-radius:16px !important}
.yj .icon-btn{border-radius:10px !important}
/* tarjetas: redondeo medio, borde suave y sombra sólida */
.yj .gx,.yj .mech,.yj .lock{border-radius:20px !important}
.yj .lift:hover{transform:translateY(-4px) !important;box-shadow:0 6px 0 var(--line2) !important}
.yj .gx-tags span,.yj .tag{border-radius:8px !important}
/* hero: cielo, sol, nubes y ciudad pixel */
.yj .hero{background:linear-gradient(180deg,#DCE8F2 0%,#E9EEE8 60%,var(--bg) 100%) !important}
.yj:not(.light) .hero{background:linear-gradient(180deg,#0B0F1A 0%,#141826 60%,var(--bg) 100%) !important}
.pxcity{position:absolute;left:0;right:0;bottom:170px;height:clamp(170px,19vw,270px);z-index:0;pointer-events:none;opacity:.6}
.yj:not(.light) .pxcity{opacity:.75}
.pxcity svg{width:100%;height:100%;display:block}
.pxd{display:none}.yj:not(.light) .pxl{display:none}.yj:not(.light) .pxd{display:block}
.pxsun{position:absolute;left:5%;top:390px;width:56px;height:56px;background:#F6D36B;z-index:0;box-shadow:0 -8px 0 -4px #F6D36B,0 8px 0 -4px #F6D36B,-8px 0 0 -4px #F6D36B,8px 0 0 -4px #F6D36B,0 0 0 12px rgba(246,211,107,.18)}
.yj:not(.light) .pxsun{background:#E9E2CC;box-shadow:inset -14px -6px 0 #C9C1A8,0 0 0 12px rgba(233,226,204,.06)}
.pxcloud{position:absolute;z-index:0;height:16px;background:#fff;opacity:.85;animation:cloud 60s linear infinite}
.pxcloud::before{content:'';position:absolute;left:16px;top:-12px;width:40px;height:12px;background:inherit}
.pxcloud.c1{width:96px;top:200px;left:-120px}.pxcloud.c2{width:72px;top:290px;left:-120px;animation-duration:85s;animation-delay:-40s}
.yj:not(.light) .pxcloud{opacity:.08}
@keyframes cloud{to{transform:translateX(calc(100vw + 240px))}}
.pxbub{position:absolute;z-index:6;font:700 15px/1 'Atkinson Hyperlegible',sans-serif;color:#14110F;background:#fff;padding:10px 14px;border-radius:10px;box-shadow:0 0 0 2.5px #14110F,0 4px 0 2.5px #14110F;white-space:nowrap;animation:bub 4s ease-in-out infinite}
.pxbub::after{content:'';position:absolute;left:18px;bottom:-11px;width:10px;height:10px;background:#fff;box-shadow:2.5px 0 0 #14110F,0 2.5px 0 #14110F,2.5px 2.5px 0 #14110F;clip-path:polygon(0 0,100% 0,0 100%)}
.pxbub.b1{left:-470px;top:-345px}.pxbub.b2{left:330px;top:-315px;animation-delay:-2s}
@keyframes bub{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
/* bordes a cuadritos entre secciones */
.yj .sec,.yj .domsec,.yj #jugar{position:relative}
.yj #mecanicas::before,.yj #salas::before,.yj #pronto::before,.yj #jugar::before{content:'';position:absolute;left:0;right:0;top:0;height:16px;z-index:2;pointer-events:none;
 background:conic-gradient(var(--chk,var(--surface2)) 25%,transparent 0 50%,var(--chk,var(--surface2)) 0 75%,transparent 0) 0 0/16px 16px}
.yj #jugar::before{--chk:var(--bg)}
.yj #salas::before{--chk:var(--bg)}
/* íconos de pixel en las tarjetas de próximos juegos */
.yj .lock h3::before{content:'';display:block;width:8px;height:8px;margin:0 0 14px;background:#E0A33A;box-shadow:8px 8px 0 #EFE6D2}
@media (max-width:760px){.pxbub{display:none}.pxcity{bottom:190px;height:150px}.pxbub{font-size:12px;padding:8px 10px}.pxsun{top:110px;width:40px;height:40px}}
@media (prefers-reduced-motion:reduce){.pxcloud,.pxbub{animation:none}}
'''
i = s.index('</style>'); s = s[:i] + CSS + s[i:]
open('/home/claude/yajuga/project/Main.dc.html', 'w').write(s); print('ok', len(s), 'fan' if fan else 'NOFAN')
