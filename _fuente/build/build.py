import re, shutil, os, json
NZ = r'''<script>(function(){var m=document.querySelector('meta[name=viewport]');if(m)m.setAttribute('content','width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');['gesturestart','gesturechange','gestureend'].forEach(function(t){document.addEventListener(t,function(e){e.preventDefault()},{passive:false})});document.addEventListener('dblclick',function(e){e.preventDefault()},{passive:false});document.addEventListener('touchmove',function(e){if(e.touches&&e.touches.length>1)e.preventDefault()},{passive:false})})()</script>'''+'\n'
P='/home/claude/yajuga/project/'; O='/home/claude/yajuga/site/'; A='/home/claude/assets/'
os.makedirs(O+'assets/pl',exist_ok=True); os.makedirs(O+'jugar',exist_ok=True)
BL={'085201d26777ab811ed1df0f2cfeb94a':'iso.png','ff0c5995bcf7111767ad7ad350e61da1':'titulo.png','94fcbc6316d6d866119c86e8b1f1b4f4':'logo.png','474de129e49f7d967a82451d308cd54e':'dominio.png','2b992e941076a2a0f30bdfcd5f47f9cc':'fav.png',
 'cad08f089868a47db4e9a3ec5f258e33':'banquero.webp','f61cbb366c5e3cdc642f8311e2f570f0':'estafador.webp','1f7b3026e77d307a4cf11fa487a16596':'abogado.webp','75b2b84bcc7a8e87990453f1cb113faf':'corredor.webp','706a83366ca0a571137290d6722750e2':'coleccionista.webp','6da010b56a495d7fbae4056c01a03f7f':'arquitecto.webp','41e3067f4d91198cd23633e28c02063e':'pl/p02.webp','dc4a5e69a9c42687fa3153270715fda0':'ley/alejandro.webp','7884aa0bfd97d8f4544c430597e95a4e':'ley/freud.webp','7f61bb7a125ec86245fac37d64d537fd':'ley/gengis.webp','09f91b7324229aed218c3266614ad24e':'ley/isabel.webp','5fc7c567a75ab5abc854496222093111':'ley/leonardo.webp','5d4c1e8940d639280722e4246fe1b4af':'ley/napoleon.webp','2e492b4bcc24d2f8c097c4433d80b58f':'ley/newton.webp','793455f429d49620677aca864d1ca46d':'ley/tesla.webp','b77ece41d3f85ca014a03948117da605':'ley/mozart.webp','b189d4cc377441075cf738d4c2c48bc0':'ley/juana.webp','a16ea027799a20b0814cdd8b01d10105':'ley/ramses.webp'}
for f in set(BL.values()):
    if not f.startswith('pl/'): os.makedirs(os.path.dirname(O+'assets/'+f),exist_ok=True); shutil.copy(A+f,O+'assets/'+f)
for f in os.listdir(A+'pl2'): shutil.copy(A+'pl2/'+f,O+'assets/pl/'+f)
os.makedirs(O+'assets/lpl',exist_ok=True)
for f in os.listdir(A+'lpl'): shutil.copy(A+'lpl/'+f,O+'assets/lpl/'+f)
def blobs(s):
    s=s.replace("const pic = (k) => '/_blob/' + P[k];","const pic = (k) => (k[0] === 'L' ? '/assets/lpl/' : '/assets/pl/') + k + '.webp';")
    def rep(m):
        k=m.group(1); assert k in BL, k; return '/assets/'+BL[k]
    return re.sub(r'/_blob/([a-f0-9]{32})',rep,s)
def page(src,title,extra_head,extra_js,boot):
    s=blobs(open(P+src).read())
    helmet=s[s.index('<helmet>')+8:s.index('</helmet>')]
    tpl=s[s.index('</helmet>')+9:s.index('</x-dc>')]
    i=s.index('data-dc-script'); i=s.index('>',i)+1; js=s[i:s.index('</script>',i)]
    assert '</script' not in tpl
    return f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="YAJUGÁ Games Vault: juegos de mesa online. Jugá YAJUGÁ Dominio con tus amigos.">
<meta name="theme-color" content="#14110F">
<link rel="icon" href="/assets/fav.png">
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/icons/apple-180.png">
<script src="/pwa.js" defer></script>
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="YAJUGÁ">
{helmet}
<style>html,body{{margin:0;padding:0}}{extra_head}</style>
</head>
<body>
<div id="root"></div>
<script type="text/x-tpl" id="tpl">{tpl}</script>
<script src="https://cdn.jsdelivr.net/npm/morphdom@2.7.4/dist/morphdom-umd.min.js"></script>
<script src="/dc.js"></script>
<script>(function(){{var v=window.visualViewport;function f(){{var h=v?v.height:innerHeight;document.documentElement.style.setProperty('--vvh',h+'px')}}f();(v||window).addEventListener('resize',f);addEventListener('orientationchange',function(){{setTimeout(f,300)}})}})()</script>
{extra_js}
<script>
{js}
{boot}
</script>
</body>
</html>'''
main=page('Main.dc.html','YAJUGÁ Games Vault — Juegos de mesa online','','',"DCBoot(Component,'tpl');")
jug=page('Jugar.dc.html','Jugar · YAJUGÁ Dominio','html,body{height:100%;overflow:hidden;background:#14110F;overscroll-behavior:none}#root{position:fixed;left:0;right:0;top:0;height:100vh;height:100dvh;height:var(--vvh,100dvh)}#root>*{height:100%}#root .g{height:100% !important;min-height:0 !important}',
 NZ+'<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n<script src="/net.js"></script>\n<script src="/sfx.js"></script>',
 "var __c=DCBoot(Component,'tpl'); if(window.__salaCode){__c.form.code=window.__salaCode; __c.refresh();}")
open(O+'index.html','w').write(main); open(O+'jugar/index.html','w').write(jug)
adv=page('Adivina.dc.html','¿Quién soy? · YAJUGÁ','html,body{background:#14110F}','<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n<script src="/sfx.js"></script>',"window.__comp=DCBoot(Component,'tpl');")
os.makedirs(O+'adivina',exist_ok=True); open(O+'adivina/index.html','w').write(adv)
qh=page('QueHarias.dc.html','¿Qué harías si? · YAJUGÁ','html,body{background:#14110F}','<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n<script src="/sfx.js"></script>',"window.__comp=DCBoot(Component,'tpl');")
os.makedirs(O+'queharias',exist_ok=True); open(O+'queharias/index.html','w').write(qh)
ley=page('Leyendas.dc.html','Jugar · YAJUGÁ Leyendas','html,body{height:100%;overflow:hidden;background:#14110F;overscroll-behavior:none}#root{position:fixed;left:0;right:0;top:0;height:100vh;height:100dvh;height:var(--vvh,100dvh)}#root>*{height:100%}#root .g{height:100% !important;min-height:0 !important}',NZ+'<script>window.YJ_GAME=\'leyendas\'</script>\n<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n<script src="/net.js"></script>\n<script src="/sfx.js"></script>',"var __c=DCBoot(Component,'tpl'); if(window.__salaCode){__c.form.code=window.__salaCode; __c.refresh();}")
os.makedirs(O+'leyendas',exist_ok=True); open(O+'leyendas/index.html','w').write(ley)
shutil.copy('/home/claude/yajuga/build/dc.js',O+'dc.js'); shutil.copy('/home/claude/yajuga/build/net.js',O+'net.js'); shutil.copy('/home/claude/yajuga/build/sfx.js',O+'sfx.js'); shutil.copy('/home/claude/yajuga/build/sw.js',O+'sw.js'); shutil.copy('/home/claude/yajuga/build/pwa.js',O+'pwa.js'); shutil.copytree('/home/claude/yajuga/build/icons',O+'icons',dirs_exist_ok=True); shutil.copytree('/home/claude/yajuga/build/audio',O+'audio',dirs_exist_ok=True); open(O+'CREDITOS.txt','w').write('Música y sonidos (CC0, dominio público):\n- Dominio: "jazz improvisation looped" de Alex McCulloch (Pro Sensory), OpenGameArt.org\n- Leyendas: "Medieval: The Bard\'s Tale" de RandomMind, OpenGameArt.org\n- ¿Quién soy?: "Cozy Puzzle Title" de MintoDog, OpenGameArt.org\n- ¿Qué harías si?: \"Unsolved Investigation\" de isaiah658, OpenGameArt.org\n- Cartas, fichas y dados: "Casino Audio" de Kenney (kenney.nl)\n')
open(O+'vercel.json','w').write(json.dumps({'framework': None, 'buildCommand': '', 'installCommand': '', 'outputDirectory': '.', 'cleanUrls': True, 'trailingSlash': False, 'redirects': [{'source': '/:path*', 'has': [{'type': 'host', 'value': 'yajug-game-vault.vercel.app'}], 'destination': 'https://yajuga.vercel.app/:path*', 'permanent': True}]}))
open(O+'manifest.json','w').write(json.dumps({'id': '/', 'name': 'YAJUGÁ Games Vault', 'short_name': 'YAJUGÁ', 'description': 'Juegos de mesa online: Dominio, Leyendas y ¿Quién soy?', 'lang': 'es', 'start_url': '/?app=1', 'scope': '/', 'display': 'fullscreen', 'display_override': ['fullscreen', 'standalone'], 'orientation': 'any', 'background_color': '#14110F', 'theme_color': '#14110F', 'icons': [{'src': '/icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'}, {'src': '/icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any'}, {'src': '/icons/maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}], 'shortcuts': [{'name': 'Dominio', 'url': '/jugar', 'icons': [{'src': '/icons/icon-192.png', 'sizes': '192x192'}]}, {'name': 'Leyendas', 'url': '/leyendas', 'icons': [{'src': '/icons/icon-192.png', 'sizes': '192x192'}]}, {'name': '¿Quién soy?', 'url': '/adivina', 'icons': [{'src': '/icons/icon-192.png', 'sizes': '192x192'}]}]},ensure_ascii=False))
print('ok', len(main), len(jug))
