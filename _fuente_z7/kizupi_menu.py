# Menús de Dominio y Leyendas: misma lógica que la portada (interfaz moderna, pixel art en ilustraciones). Idempotente.
import random
def city(seed):
    random.seed(seed); pal = ['#2A3550', '#2B3E44', '#4A2E33', '#4D3F22', '#35324F', '#26403A', '#3A332B']; r = []; x = 0
    while x < 480:
        w = random.choice([22, 26, 30, 34]); h = random.randint(30, 90); c = random.choice(pal)
        r.append(f'<rect x="{x}" y="{110-h}" width="{w}" height="{h}" fill="{c}"/>')
        for wy in range(110-h+6, 106, 8):
            for wx in range(x+4, x+w-4, 6):
                r.append(f'<rect x="{wx}" y="{wy}" width="3" height="3" fill="{"#F2C46B" if random.random()<.4 else "#151820"}"/>')
        x += w + random.choice([0, 2, 6])
    r.append('<rect x="0" y="110" width="480" height="8" fill="#1E2126"/>')
    for dx in range(4, 480, 16): r.append(f'<rect x="{dx}" y="113" width="8" height="2" fill="#6A6E74"/>')
    return '<svg viewBox="0 0 480 118" preserveAspectRatio="xMidYMax slice" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">' + ''.join(r) + '</svg>'
CSS = r'''
/* KZ-MENU */
.menu{font-family:'Atkinson Hyperlegible','DM Sans',sans-serif;background:linear-gradient(180deg,#0B0F1A 0,#141322 360px,#14110F 620px)}
.menu img{image-rendering:pixelated}
.menu .mcity{position:absolute;left:0;right:0;top:120px;height:260px;opacity:.55;pointer-events:none;z-index:0}
.menu .mcity svg{width:100%;height:100%;display:block}
.menu .mmoon{position:absolute;right:10%;top:70px;width:40px;height:40px;background:#E9E2CC;box-shadow:inset -10px -5px 0 #C9C1A8;z-index:0}
.menu > div{position:relative;z-index:1}
.menu .serif{font-family:'Bricolage Grotesque',sans-serif !important;font-style:normal !important;font-weight:800 !important;letter-spacing:-.04em;color:#14110F !important;background:#E0A33A;padding:0 .14em .02em;border-radius:.14em;display:inline-block;line-height:1.05;font-size:1em !important}
.menu .btn{border-radius:12px;border:0;background:#2B231D;box-shadow:inset 0 0 0 1.5px rgba(239,230,210,.22),0 3px 0 rgba(0,0,0,.5);transition:transform .15s,box-shadow .15s,filter .15s}
.menu .btn:hover{transform:translateY(-2px);filter:brightness(1.1)}
.menu .btn:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,.5)}
.menu .b-rust{background:#C13B1F;box-shadow:0 4px 0 #7A2412}
.menu .online{border-radius:20px;background:#1E1915;box-shadow:0 4px 0 rgba(0,0,0,.45)}
.menu .online::before{content:'';display:block;width:8px;height:8px;background:#E0A33A;box-shadow:8px 8px 0 #EFE6D2;margin-bottom:-6px}
.menu .fld input{border-radius:10px}
.menu .cfgbox{border-radius:16px}
.menu .cfg-tabs button,.menu .cfg-opts button{border-radius:10px !important}
.menu .solosel button{border-radius:10px;box-shadow:0 3px 0 rgba(0,0,0,.5)}
.menu .pxchk{height:16px;margin:8px 0 36px;background:conic-gradient(#2B231D 25%,transparent 0 50%,#2B231D 0 75%,transparent 0) 0 0/16px 16px;opacity:.9}
.menu .pick{border-radius:18px;border:0;box-shadow:inset 0 0 0 1.5px rgba(239,230,210,.14),0 4px 0 rgba(0,0,0,.5);transition:transform .2s,box-shadow .2s}
.menu .pick:hover{transform:translateY(-4px);box-shadow:inset 0 0 0 2px var(--c),0 6px 0 var(--c)}
.menu .pick .ph{border-radius:18px 18px 0 0}
.menu .pick img{object-fit:cover}
@media (max-width:760px){.menu .mcity{top:90px;height:170px}.menu .mmoon{top:60px;width:28px;height:28px}}
'''
for f, seed in [('Jugar.dc.html', 3), ('Leyendas.dc.html', 5)]:
    p = '/home/claude/yajuga/project/' + f; s = open(p).read()
    if '/* KZ-MENU */' in s: print(f, 'ya aplicado'); continue
    s = s.replace('family=Instrument+Serif:ital@0;1&amp;display=swap', 'family=Instrument+Serif:ital@0;1&amp;family=Atkinson+Hyperlegible:wght@400;700&amp;display=swap', 1)
    a = '<!-- PICK -->'; i = s.index(a); m = '<main style="position: absolute; inset: 0; overflow: auto">'; j = s.index(m, i)
    s = s[:j] + '<main class="menu" style="position: absolute; inset: 0; overflow: auto"><div class="mmoon" aria-hidden="true"></div><div class="mcity" aria-hidden="true">' + city(seed) + '</div>' + s[j + len(m):]
    g = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 28px"> <sc-for list="{{roles}}"'
    g2 = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 28px">\n'
    k = s.index('list="{{roles}}"'); k0 = s.rindex('<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 28px">', 0, k)
    s = s[:k0] + '<div class="pxchk" aria-hidden="true"></div>' + s[k0:]
    pk = s.index('<button class="pick {{r.pcls}}"'); im = s.index('<img src="{{r.img}}"', pk)
    s = s[:im] + '<img src="{{r.pimg}}"' + s[im + len('<img src="{{r.img}}"'):]
    x = "const roles = ROLES.map((r) => ({ ...r, img: IMG[r.id],"; assert x in s
    s = s.replace(x, "const roles = ROLES.map((r) => ({ ...r, img: IMG[r.id], pimg: 'assets/px/' + r.id + '.png',")
    i = s.index('</style>'); s = s[:i] + CSS + s[i:]
    open(p, 'w').write(s); print(f, 'ok')

# (v2) la ciudad va en el flujo, entre la presentación y la sala; ver arreglo aplicado en los .dc.html
