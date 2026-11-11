# Arma project/Zona7.dc.html a partir de build/z7/*
D='/home/claude/yajuga/build/z7/'
css=open(D+'ui.css').read(); html=open(D+'ui.html').read(); eng=open(D+'engine.js').read(); art=open(D+'art.js').read(); ui=open(D+'ui.js').read()
for s in (eng,art,ui): assert '</script' not in s
out=f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>YAJUGÁ Zona 7</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&amp;family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&amp;family=Silkscreen:wght@400;700&amp;display=swap" rel="stylesheet">
<style>
{css}
</style>
</helmet>
{html}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":1440,"height":900}}}}'>
{eng}
{art}
{ui}
</script>
</body>
</html>
'''
open('/home/claude/yajuga/project/Zona7.dc.html','w').write(out); print('ok',len(out))
