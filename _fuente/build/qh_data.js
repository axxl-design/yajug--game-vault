// k: real | vida (supervivencia real) | ficcion
// o: [texto, resultado, código v/h/m, regla?, resultado alternativo?, código alternativo?]
// reglas: 's' = solo funciona si lo elegís solo · 'g' = necesita al menos 2 · 'x' = si va más de la mitad (con 3+), se arruina
const SC = [
// ======================= HECHOS REALES =======================
{ k: 'real', t: 'Titanic · 1912', s: 'Es medianoche en el Atlántico Norte. El barco chocó contra un iceberg y se inclina. El agua está a -2 °C y los botes no alcanzan para todos.', o: [
  ['Subo al primer bote salvavidas aunque vaya medio vacío', 'Te alejás del barco antes del caos. Ese bote salió con lugares libres y todos sobrevivieron.', 'v', 'x', 'Todos se tiran al mismo bote, se sobrecarga y vuelca en el agua helada.', 'm'],
  ['Me quedo en el barco: es "insumergible"', 'El Titanic se hunde en 2 horas y 40 minutos. El agua helada no perdona.', 'm'],
  ['Busco algo que flote y espero cerca de la popa', 'Saltás tarde al agua helada. Te rescatan con hipotermia grave.', 'h'],
  ['Ayudo a bajar los botes plegables de la cubierta', 'Gracias al trabajo en equipo sueltan un bote plegable y se suben ahí.', 'v', 'g', 'Solo no podés con el bote: te quedás en cubierta hasta el final.', 'm']
], f: 'El Titanic llevaba 20 botes para unas 1.178 personas y había 2.224 a bordo. Muchos botes salieron sin llenar. Sobrevivieron unas 710 personas.' },
{ k: 'real', t: 'Pompeya · año 79', s: 'El Vesubio entra en erupción. Cae ceniza y piedra pómez sobre la ciudad. Algunos vecinos se encierran en sus casas; otros huyen hacia el puerto.', o: [
  ['Me encierro en casa hasta que pase', 'Los techos ceden por el peso de la ceniza y al día siguiente llegan los flujos de gas ardiente.', 'm'],
  ['Huyo ya mismo por tierra, lejos del volcán', 'Salís temprano con la cara cubierta. Llegás a Nápoles con quemaduras leves.', 'h'],
  ['Corro al puerto a buscar un barco', 'Hay un bote libre y zarpás antes que el resto.', 'v', 'x', 'Todos llegan al puerto a la vez, el mar está picado y no zarpa nadie.', 'm'],
  ['Vuelvo a buscar mis monedas de oro y después huyo', 'Perdiste tiempo valioso. Te alcanza la nube ardiente.', 'm']
], f: 'Quienes huyeron en las primeras horas sobrevivieron. Los que se quedaron murieron por las corrientes piroclásticas del día siguiente. Plinio el Joven lo contó desde Miseno.' },
{ k: 'real', t: 'Los Andes · 1972', s: 'Su avión se estrelló en la cordillera. Hace -30 °C de noche, hay poca comida y la radio dice que suspendieron la búsqueda.', o: [
  ['Esperamos en el fuselaje a que nos encuentren', 'Nadie viene a buscarlos. Pasan semanas y el hambre y el frío los debilitan.', 'h'],
  ['Armo una expedición para cruzar la montaña hacia Chile', 'Después de 10 días de caminata llegan a un valle y encuentran a un arriero. ¡Rescate!', 'v', 'g', 'Solo, sin abrigo ni ayuda, no llegás lejos en la montaña.', 'm'],
  ['Bajo por el valle, a ciegas y sin preparación', 'Te agarra una tormenta de nieve de noche sin refugio.', 'm'],
  ['Racionamos la comida y fabricamos sacos de dormir con el aislante del avión', 'Ganan tiempo y fuerzas para resistir. Así se preparó la expedición que los salvó.', 'v']
], f: 'Pasaron 72 días en la montaña. Nando Parrado y Roberto Canessa caminaron 10 días hasta Chile y encontraron al arriero Sergio Catalán. Sobrevivieron 16 personas.' },
{ k: 'real', t: 'Apolo 13 · 1970', s: 'Un tanque de oxígeno explota camino a la Luna. El módulo de mando se queda sin energía. Están a 300.000 km de la Tierra.', o: [
  ['Nos pasamos al módulo lunar y lo usamos como bote salvavidas', 'El módulo lunar los mantiene con vida durante 4 días. Vuelven a casa.', 'v'],
  ['Intentamos aterrizar en la Luna igual', 'Sin oxígeno de reserva, la misión se vuelve imposible.', 'm'],
  ['Damos la vuelta con el motor principal ya mismo', 'Con la nave dañada el motor es un riesgo. Logran volver, pero con daños.', 'h'],
  ['Improvisamos un filtro de CO₂ con cinta, plástico y una media', 'El famoso "buzón" adapta los filtros cuadrados a un hueco redondo. El aire se vuelve respirable.', 'v']
], f: 'Usaron el módulo lunar Aquarius como refugio y armaron un adaptador de filtros con cinta, cartón y bolsas. Los tres astronautas volvieron sanos.' },
{ k: 'real', t: 'Chernóbil · 1986', s: 'Vivís en Prípiat. Una explosión en la planta nuclear tiñe el cielo de un brillo raro. Nadie explica nada y la gente sale al puente a mirar.', o: [
  ['Voy al puente a ver el brillo de cerca', 'Ese puente quedó en la nube radiactiva. Mala idea.', 'm'],
  ['Cierro ventanas, me quedo adentro y espero instrucciones', 'Reducís la exposición hasta la evacuación del día siguiente.', 'h'],
  ['Agarro a mi familia y me voy lejos ya mismo', 'Salís antes que nadie y en dirección contraria al viento.', 'v'],
  ['Sigo con mi día normal, total nadie dice nada', 'Pasás el día al aire libre bajo la lluvia radiactiva.', 'm']
], f: 'Prípiat recién fue evacuada 36 horas después. Se dijo a los vecinos que era por "tres días". Nunca volvieron.' },
{ k: 'real', t: 'Mina San José, Chile · 2010', s: 'Un derrumbe los deja atrapados a 700 metros bajo tierra. Tienen comida de emergencia para 2 o 3 días y no saben si alguien los busca.', o: [
  ['Racionamos: una cucharada de atún cada 48 horas', 'Los víveres duran 17 días, hasta que una sonda los encuentra.', 'v', 'g', 'Solo no podés organizar a 33 personas: hay peleas por la comida.', 'h'],
  ['Comemos todo ahora para tener fuerzas', 'Se acaba la comida al tercer día. Muy débiles.', 'm'],
  ['Escalo por los ductos de ventilación', 'Las escaleras de los ductos no llegan arriba. Volvés lastimado.', 'h'],
  ['Hacemos ruido golpeando las cañerías cada hora', 'Ayuda a ubicarlos, pero sin racionar no llegan al día 17.', 'h']
], f: 'Los 33 mineros sobrevivieron 69 días. Racionaron la comida hasta que una sonda llegó el día 17 con la nota "Estamos bien en el refugio los 33".' },
{ k: 'real', t: 'Cueva Tham Luang, Tailandia · 2018', s: 'Tu equipo de fútbol queda atrapado en una cueva inundada por la lluvia. Hay un saliente seco a 4 km de la entrada. Nadie sabe bucear.', o: [
  ['Esperamos en el saliente seco y ahorramos energía', 'Diez días después los encuentran dos buzos británicos.', 'v'],
  ['Nado hacia la salida por el agua turbia', 'Los túneles inundados son estrechos y sin visibilidad.', 'm'],
  ['Cavamos la pared buscando otra salida', 'Lográs un hueco con algo de aire, pero te agotás.', 'h'],
  ['Juntamos agua del goteo de las rocas para tomar', 'Agua limpia que los mantiene vivos hasta el rescate.', 'v']
], f: 'Los 12 chicos y su entrenador esperaron 9 días en una roca hasta que los encontraron. Todos fueron rescatados por buzos tras 18 días.' },
{ k: 'real', t: 'Tsunami del Índico · 2004', s: 'Estás en una playa de Tailandia. De repente el mar se retira cientos de metros y deja peces saltando en la arena. La gente baja a mirar.', o: [
  ['Bajo a juntar peces y caracoles', 'El mar vuelve en minutos como una pared de agua.', 'm'],
  ['Corro a terreno alto y aviso a todos', 'El retiro del mar es la señal de un tsunami. Llegás arriba a tiempo.', 'v'],
  ['Subo al piso más alto del hotel', 'Un edificio firme de varios pisos te salva.', 'v', 'x', 'La escalera se tapa de gente y no llegás al piso alto.', 'h'],
  ['Me quedo a filmar desde la orilla', 'Gran video. El agua te arrastra.', 'm']
], f: 'Tilly Smith, una nena de 10 años, reconoció la señal porque lo había estudiado en clase y salvó a unas 100 personas en Phuket.' },
{ k: 'real', t: 'Amerizaje en el Hudson · 2009', s: 'Tu avión perdió los dos motores por una bandada de gansos. El piloto anuncia: "Prepárense para el impacto". Van a caer en el río.', o: [
  ['Adopto la posición de impacto: cabeza abajo, brazos protegiendo', 'Aguantás el golpe sin lesiones graves.', 'v'],
  ['Me paro a buscar mi valija', 'El golpe te tira contra los asientos.', 'h'],
  ['Inflo el chaleco salvavidas adentro del avión', 'Si el avión se inunda, el chaleco inflado te aplasta contra el techo.', 'h'],
  ['Al salir, me paro sobre el ala esperando a los barcos', 'Los ferris rescatan a todos los que estaban en las alas.', 'v', 'x', 'Demasiada gente en una sola ala: se inclina y caés al agua a 2 °C.', 'h']
], f: 'El capitán Sullenberger amerizó en el río Hudson. Los 155 pasajeros y tripulantes sobrevivieron, muchos esperando parados sobre las alas.' },
{ k: 'real', t: 'Juliane Koepcke, Amazonía · 1971', s: 'Tenés 17 años. Tu avión se partió en una tormenta y caíste en la selva peruana atada a tu asiento. Estás sola, con una herida y sin comida.', o: [
  ['Busco un arroyo y sigo el agua corriente abajo', 'Los ríos llevan a pueblos. A los 10 días encontrás una cabaña de madereros.', 'v'],
  ['Me quedo junto a los restos esperando que me encuentren', 'La selva es tan densa que desde el aire no se ve nada.', 'h'],
  ['Me interno en la selva a buscar ayuda en línea recta', 'Te perdés entre árboles idénticos.', 'm'],
  ['Como frutos desconocidos para tener energía', 'Muchos frutos de la selva son tóxicos.', 'h']
], f: 'Juliane siguió un arroyo como le había enseñado su padre biólogo. Caminó 10 días hasta encontrar a unos madereros. Fue la única sobreviviente.' },
{ k: 'real', t: 'Expedición Endurance · 1915', s: 'El hielo de la Antártida aplastó tu barco. Están acampando sobre un témpano a la deriva con tres botes salvavidas.', o: [
  ['Esperamos sobre el hielo a que se derrita cerca de tierra', 'Esperan meses, y cuando el témpano se rompe suben a los botes.', 'v', 'g', 'Solo sobre el hielo no hay forma de sobrevivir.', 'm'],
  ['Caminamos sobre el hielo hacia tierra firme', 'El hielo se abre y se mueve. Avanzan muy poco.', 'h'],
  ['Voy en un bote pequeño 1.300 km a buscar ayuda', 'Una travesía brutal, pero llegan a Georgia del Sur.', 'v', 'g', 'Solo no podés manejar un bote en mares de 15 metros.', 'm'],
  ['Me separo del grupo para cazar focas', 'Te alejás demasiado sobre hielo inestable.', 'm']
], f: 'Shackleton navegó 1.300 km en el bote James Caird hasta Georgia del Sur y volvió por sus hombres. Los 28 sobrevivieron.' },
{ k: 'real', t: 'Huracán Katrina · 2005', s: 'El agua de Nueva Orleans sube rápido dentro de tu casa. Ya llega al pecho. La puerta de abajo no se abre.', o: [
  ['Subo al ático sin nada', 'El agua sigue subiendo y en el ático quedás atrapado.', 'm'],
  ['Subo al ático con un hacha para abrir el techo', 'Abrís un hueco y te rescatan desde el techo.', 'v'],
  ['Intento nadar hacia la calle', 'Corrientes, escombros y cables. Muy peligroso.', 'h'],
  ['Me quedo en el piso de arriba esperando', 'Te rescatan días después, deshidratado.', 'h']
], f: 'Muchas personas murieron atrapadas en áticos. Desde entonces se recomienda subir con un hacha para poder salir al techo.' },
{ k: 'real', t: 'Monte Everest · 1996', s: 'Estás a 200 metros de la cumbre. Son las 2 de la tarde, la hora límite para dar la vuelta. Se acerca una tormenta.', o: [
  ['Sigo: estoy tan cerca de la cumbre', 'Llegás arriba, pero la tormenta te agarra en el descenso de noche.', 'm'],
  ['Doy la vuelta y bajo al campamento', 'La montaña sigue ahí. Llegás a salvo.', 'v'],
  ['Espero a mi compañero que viene más lento', 'La espera te deja expuesto al frío extremo.', 'h', 'g', 'Esperás solo en la arista sin nadie que te ayude.', 'm'],
  ['Me quedo quieto a recuperar oxígeno', 'A esa altura quedarse quieto es congelarse.', 'm']
], f: 'En mayo de 1996 varios grupos no respetaron la hora límite de regreso. Una tormenta los atrapó en el descenso y murieron 8 personas.' },
{ k: 'real', t: 'Armero, Colombia · 1985', s: 'El volcán Nevado del Ruiz entró en erupción. La radio dice que se queden tranquilos en casa, pero se oye un rugido que viene del río.', o: [
  ['Hago caso y me quedo en casa', 'Una avalancha de lodo cubre el pueblo.', 'm'],
  ['Corro hacia las lomas altas', 'El lodo pasa por debajo. Te salvás.', 'v'],
  ['Me subo al techo de mi casa', 'El lodo se lleva casas enteras.', 'h'],
  ['Me subo al auto y escapo por la ruta del río', 'La ruta sigue el cauce, justo por donde baja el lodo.', 'm']
], f: 'Una avalancha de lodo (lahar) sepultó Armero y mató a unas 23.000 personas. Quienes subieron a las lomas sobrevivieron.' },
{ k: 'real', t: 'Peste Negra · 1348', s: 'Una enfermedad terrible avanza por Florencia. Las calles están llenas de enfermos y nadie sabe cómo se contagia.', o: [
  ['Me voy con mi familia a una casa aislada en el campo', 'Aislarte del contagio te salva.', 'v', 'x', 'Media ciudad huye al mismo lugar y la enfermedad viaja con ustedes.', 'h'],
  ['Voy a la iglesia a rezar con la multitud', 'Las aglomeraciones contagian.', 'm'],
  ['Me encierro en casa con comida guardada', 'Las pulgas de las ratas entran igual, pero te contagiás menos.', 'h'],
  ['Cuido a los enfermos del barrio', 'Un gesto heroico, pero muy riesgoso.', 'm']
], f: 'La peste mató a un tercio de Europa. En "El Decamerón", Boccaccio cuenta cómo un grupo de jóvenes huyó al campo para escapar de ella.' },
{ k: 'real', t: 'Náufrago en el Pacífico · 2012', s: 'Tu lancha de pesca quedó a la deriva sin motor. No hay tierra a la vista y se acabó el agua potable.', o: [
  ['Tomo agua de mar en pequeñas dosis', 'El agua salada deshidrata más. Te enfermás.', 'm'],
  ['Junto agua de lluvia y atrapo tortugas y aves', 'Así sobrevivió José Salvador Alvarenga durante más de un año.', 'v'],
  ['Me tiro a nadar hacia donde creo que hay tierra', 'El océano es enorme. Sin rumbo no hay chance.', 'm'],
  ['Pesco con las manos y tomo la sangre de los peces', 'Algo de líquido, pero muy poco. Sobrevivís débil.', 'h']
], f: 'José Salvador Alvarenga estuvo 438 días a la deriva. Sobrevivió bebiendo lluvia y comiendo aves y tortugas hasta llegar a las Islas Marshall.' },
{ k: 'real', t: 'Expedición Donner · 1846', s: 'Su caravana quedó atrapada por la nieve en la Sierra Nevada. Faltan semanas para la primavera y la comida se acaba.', o: [
  ['Mando un grupo con raquetas de nieve a buscar ayuda', 'El grupo "Esperanza Perdida" llega a un rancho y manda rescate.', 'v', 'g', 'Solo no podés cruzar la sierra nevada.', 'm'],
  ['Esperamos todos juntos en las cabañas', 'El invierno es larguísimo. Muchos no aguantan.', 'h'],
  ['Me como el cuero de las mantas hervido', 'Asqueroso, pero da algo de energía.', 'h'],
  ['Intento cruzar a caballo por el paso nevado', 'Los caballos se hunden en la nieve profunda.', 'm']
], f: 'De 87 personas sobrevivieron 48. Un grupo de 15 salió con raquetas de nieve a pedir ayuda, y gracias a ellos llegaron los rescates.' },
{ k: 'real', t: 'Gran Smog de Londres · 1952', s: 'Una niebla amarilla y espesa cubre Londres. No se ve a un metro. Huele a carbón y mucha gente tose.', o: [
  ['Salgo a caminar igual para ir al trabajo', 'Respirás horas de humo tóxico.', 'h'],
  ['Me quedo adentro con las ventanas cerradas', 'Lo más seguro mientras dura el smog.', 'v'],
  ['Prendo la chimenea para estar más calentito', 'Más carbón quemado, más humo. Justo lo que causó el desastre.', 'h'],
  ['Me voy en auto al campo', 'Sin visibilidad, los choques son constantes.', 'm']
], f: 'Durante 5 días el smog mató a más de 4.000 personas, y miles más murieron después. Llevó a la Ley de Aire Limpio de 1956.' },
{ k: 'real', t: 'Tornado de Joplin · 2011', s: 'Suenan las sirenas. Un tornado enorme se dirige hacia tu casa. Tenés menos de un minuto.', o: [
  ['Me meto en el baño interior del piso más bajo, cubierto con un colchón', 'Paredes interiores y algo encima: la mejor protección sin sótano.', 'v'],
  ['Salgo a la calle a sacar fotos', 'Los escombros vuelan a más de 300 km/h.', 'm'],
  ['Me meto debajo de un puente de la autopista', 'El viento se acelera debajo de los puentes. Mito peligroso.', 'h'],
  ['Me subo al auto y escapo', 'Sin tiempo, el auto es una trampa.', 'm']
], f: 'El tornado EF5 de Joplin tuvo vientos de más de 320 km/h y mató a 161 personas. Refugiarse en habitaciones interiores salvó vidas.' },
{ k: 'real', t: 'Hindenburg · 1937', s: 'El dirigible en el que viajás empieza a arder al aterrizar en Nueva Jersey. Estás a unos 15 metros del suelo y el fuego avanza rápido.', o: [
  ['Salto por la ventana cuando ya está más cerca del suelo', 'La caída es corta y corrés lejos del fuego.', 'v'],
  ['Corro hacia el fondo de la cabina', 'El hidrógeno arde en segundos.', 'm'],
  ['Salto ya mismo desde lo más alto', 'Caés de muy alto y te lastimás.', 'h'],
  ['Espero a que lo apaguen', 'Se consume entero en 34 segundos.', 'm']
], f: 'El Hindenburg ardió en 34 segundos. Sobrevivieron 62 de las 97 personas a bordo, muchas saltando cuando se acercaba al suelo.' },
{ k: 'real', t: 'Evacuación de Dunkerque · 1940', s: 'Estás atrapado en la playa con miles de soldados. Bombardean y los barcos grandes no pueden acercarse por la poca profundidad.', o: [
  ['Espero en la fila del muelle para el barco grande', 'Fila lenta, pero subís a un destructor.', 'v', 'x', 'Todos van al muelle, lo bombardean y la fila no avanza.', 'h'],
  ['Me meto al mar hasta un barquito civil', 'Cientos de barcos civiles cruzaron a rescatar soldados.', 'v'],
  ['Me escondo en las dunas a esperar', 'Quedarse en la playa es quedar atrapado.', 'm'],
  ['Armo una balsa con restos para cruzar el canal', 'Cruzar 40 km de canal en balsa es casi imposible.', 'h']
], f: 'Unos 850 barcos, muchos civiles y pequeños, rescataron a más de 338.000 soldados en 9 días.' },
{ k: 'real', t: 'Terremoto de México · 1985', s: 'A las 7:19 empieza a temblar fuerte. Estás en un tercer piso. Las paredes crujen.', o: [
  ['Me agacho, me cubro bajo una mesa firme y me sujeto', 'Agacharse, cubrirse y sujetarse: la recomendación oficial.', 'v'],
  ['Corro por la escalera durante el temblor', 'Las escaleras son de lo primero que colapsa.', 'h'],
  ['Me paro bajo el marco de una puerta', 'Mito antiguo: en edificios modernos no protege.', 'h'],
  ['Salto por la ventana', 'Tres pisos son demasiado.', 'm']
], f: 'El sismo de magnitud 8,1 derrumbó cientos de edificios. Muchos rescates fueron posibles gracias a vecinos voluntarios, el origen de los famosos "Topos".' },
{ k: 'real', t: 'Medusa · 1816', s: 'Tu fragata encalló frente a África. Hay botes solo para los oficiales. A los demás los suben a una balsa remolcada.', o: [
  ['Me aseguro un lugar en los botes', 'Los botes llegan a la costa.', 'v', 's', 'Varios pelean por el último lugar y te quedás sin bote.', 'm'],
  ['Subo a la balsa con los demás', 'Los botes cortan la cuerda y dejan la balsa a la deriva.', 'm'],
  ['Me quedo en el barco encallado', 'Algunos que se quedaron fueron rescatados semanas después.', 'h'],
  ['Armamos una pequeña balsa propia con barriles', 'Mejor flotación y agua de lluvia en los barriles.', 'h', 'g', 'Solo no podés armar ni manejar la balsa.', 'm']
], f: 'De unas 150 personas en la balsa sobrevivieron 15. La historia inspiró el famoso cuadro "La balsa de la Medusa", de Géricault.' },
{ k: 'real', t: 'Krakatoa · 1883', s: 'El volcán de una isla cercana lleva días retumbando. Vivís en un pueblo costero de Java y el mar se ve raro.', o: [
  ['Me mudo tierra adentro unos días', 'Las olas de hasta 30 metros nunca te alcanzan.', 'v'],
  ['Me quedo, ya retumbó otras veces', 'Las explosiones generan tsunamis enormes.', 'm'],
  ['Subo a la torre del faro', 'Algunos faros resistieron, otros no.', 'h'],
  ['Me voy en bote para alejarme', 'En el mar te agarra el tsunami.', 'm']
], f: 'La explosión se escuchó a 4.800 km y causó tsunamis que mataron a más de 36.000 personas. Fue el sonido más fuerte de la historia registrada.' },
{ k: 'real', t: 'Fukushima · 2011', s: 'Después del terremoto y el tsunami, la planta nuclear cercana tiene problemas. Ordenan evacuar en un radio de 20 km. Vos vivís a 25 km.', o: [
  ['Me voy igual, más lejos de lo pedido', 'Te alejás de la zona antes de que la amplíen.', 'v'],
  ['Me quedo porque estoy fuera de la zona', 'Después amplían la zona y te evacúan con prisa.', 'h'],
  ['Voy a ayudar a la planta como voluntario', 'Una tarea heroica y de altísimo riesgo.', 'h'],
  ['Me encierro con comida enlatada y no salgo', 'Aguantás, pero sin información.', 'h']
], f: 'Las autoridades ampliaron varias veces la zona de evacuación. Más de 150.000 personas debieron dejar sus casas.' },
{ k: 'real', t: 'Monte Santa Helena · 1980', s: 'Sos guardaparques. El volcán tiene una enorme protuberancia que crece cada día. Te piden quedarte en un mirador cercano.', o: [
  ['Me alejo a más de 30 km', 'Te salvás de la explosión lateral.', 'v'],
  ['Me quedo en el mirador cumpliendo órdenes', 'La explosión lateral arrasa la zona.', 'm'],
  ['Me refugio en una cabaña del valle', 'El flujo baja justo por el valle.', 'm'],
  ['Subo a otra montaña cercana', 'Más lejos y más alto, pero te llega la ceniza.', 'h']
], f: 'La erupción lateral arrasó 600 km² en minutos. Murieron 57 personas, entre ellas el vulcanólogo David Johnston, que vigilaba desde un mirador.' },
{ k: 'real', t: 'Inundación de melaza, Boston · 1919', s: 'Un tanque gigante de melaza revienta en tu barrio. Una ola marrón y pegajosa de 7 metros avanza por la calle.', o: [
  ['Trepo a lo más alto de un edificio', 'La ola pasa por debajo.', 'v'],
  ['Corro calle abajo para escapar', 'La ola va a 55 km/h.', 'm'],
  ['Me agarro de un poste', 'La melaza te tapa hasta el pecho y casi no podés moverte.', 'h'],
  ['Me meto en un auto', 'El auto queda sepultado.', 'm']
], f: 'La "Gran Inundación de Melaza" mató a 21 personas. La melaza se movía rápido y luego se espesaba, atrapando a quien quedaba adentro.' },
{ k: 'real', t: 'Gran incendio de Londres · 1666', s: 'Un fuego que empezó en una panadería avanza por las casas de madera. El alcalde dice que "una mujer podría apagarlo con su pis".', o: [
  ['Saco mis cosas y me voy por el río Támesis', 'Los botes en el río fueron la salida más segura.', 'v', 'x', 'El muelle se llena de gente y nadie consigue bote.', 'h'],
  ['Ayudo a derribar casas para frenar el fuego', 'Los cortafuegos frenaron el incendio.', 'v', 'g', 'Solo no derribás nada y el fuego te rodea.', 'h'],
  ['Me quedo, el alcalde dijo que no es grave', 'El fuego dura 4 días.', 'm'],
  ['Entierro mis objetos de valor en el jardín y espero', 'Samuel Pepys enterró su queso parmesano. Vos te quedás demasiado.', 'h']
], f: 'El incendio destruyó 13.200 casas. El famoso cronista Samuel Pepys enterró su vino y su queso parmesano para salvarlos.' },
{ k: 'real', t: 'Atrapado en el hielo · Paso Noroeste 1845', s: 'Dos barcos de la expedición Franklin están atrapados en el hielo del Ártico. Las latas de comida tienen soldaduras de plomo.', o: [
  ['Comemos solo lo que cazamos con los inuit', 'Los inuit conocen la tierra. Sobrevivís.', 'v'],
  ['Seguimos con las latas de comida', 'El plomo y el escorbuto debilitan a todos.', 'm'],
  ['Caminamos hacia el sur arrastrando los botes', 'Los botes pesan cientos de kilos. Terrible.', 'm'],
  ['Esperamos en los barcos al deshielo', 'El deshielo no llega en dos veranos.', 'h']
], f: 'Los 129 hombres de Franklin murieron. Los inuit contaron haberlos visto caminar hacia el sur, y en 2014 y 2016 se encontraron los dos barcos.' },
// ======================= SUPERVIVENCIA DE LA VIDA REAL =======================
{ k: 'vida', t: 'Corriente de resaca', s: 'Estás nadando en el mar y de repente una corriente te arrastra mar adentro. Te cansás rápido.', o: [
  ['Nado fuerte directo hacia la orilla', 'Luchar contra la corriente te agota.', 'm'],
  ['Nado en paralelo a la playa hasta salir de la corriente', 'Las corrientes de resaca son angostas. Saliste y volvés.', 'v'],
  ['Floto, levanto un brazo y pido ayuda', 'Ahorrás energía y te ven.', 'v'],
  ['Me sumerjo para escapar por abajo', 'Mala idea: te cansás más.', 'h']
], f: 'Las corrientes de resaca causan la mayoría de los rescates en playas. Nunca hay que nadar contra ellas: se sale nadando en paralelo a la orilla.' },
{ k: 'vida', t: 'Incendio en un edificio', s: 'Te despierta la alarma. Tu departamento está lleno de humo y la puerta del pasillo está caliente al tacto.', o: [
  ['Abro la puerta y corro por el pasillo', 'Puerta caliente = fuego del otro lado.', 'm'],
  ['Tapo la puerta con toallas mojadas y pido ayuda por la ventana', 'Los bomberos te rescatan por la ventana.', 'v'],
  ['Gateo por el piso hacia otra salida sin fuego', 'Abajo el aire es más limpio. Salís por la otra escalera.', 'v'],
  ['Uso el ascensor', 'Los ascensores pueden quedar trabados en el piso del fuego.', 'm']
], f: 'Nunca abras una puerta caliente ni uses el ascensor en un incendio. El humo mata antes que el fuego: hay que moverse agachado.' },
{ k: 'vida', t: 'Auto cayendo al agua', s: 'Tu auto sale de la ruta y cae a un lago. Empieza a hundirse. Tenés el cinturón puesto.', o: [
  ['Llamo al 911 primero', 'Perdés el minuto clave en el que todavía podías salir.', 'm'],
  ['Cinturón, ventana, salir. Ya mismo', 'La regla: cinturón, ventana, niños, afuera.', 'v'],
  ['Espero a que se llene para abrir la puerta', 'Funciona en teoría, pero en la práctica muchos entran en pánico.', 'h'],
  ['Intento abrir la puerta empujando fuerte', 'La presión del agua no te deja.', 'h']
], f: 'Tenés entre 30 y 60 segundos. Hay que soltar el cinturón, abrir o romper la ventana y salir. Las puertas no se abren por la presión.' },
{ k: 'vida', t: 'Encuentro con un oso pardo', s: 'Haciendo senderismo, un oso pardo aparece a 20 metros. Te mira y se para en dos patas.', o: [
  ['Corro lo más rápido que puedo', 'Un oso corre a 55 km/h. Correr activa su instinto de caza.', 'm'],
  ['Me quedo quieto, hablo tranquilo y retrocedo despacio', 'El oso pierde interés y se va.', 'v'],
  ['Me subo a un árbol', 'Los osos pardos pueden trepar un poco. Te araña.', 'h'],
  ['Nos juntamos y hacemos ver que somos grandes', 'Un grupo grande intimida al oso.', 'v', 'g', 'Solo, agitar los brazos lo provoca.', 'h']
], f: 'Con osos nunca hay que correr. En grupo es más seguro: los ataques a grupos de 3 o más personas son muy raros.' },
{ k: 'vida', t: 'Tormenta eléctrica en el campo', s: 'Estás en un campo abierto y se larga una tormenta con rayos muy cerca. Se te eriza el pelo.', o: [
  ['Me refugio bajo el árbol más alto', 'Los árboles altos atraen rayos.', 'm'],
  ['Me agacho en cuclillas con los pies juntos, lejos de lo alto', 'Mínimo contacto con el suelo. La mejor opción sin refugio.', 'v'],
  ['Corro al auto y cierro todo', 'El auto metálico funciona como una jaula de Faraday.', 'v'],
  ['Me acuesto boca abajo en el pasto', 'Más superficie en contacto con el suelo.', 'h']
], f: 'Si se te eriza el pelo, un rayo está por caer. Un auto con techo metálico protege; un árbol solitario es lo peor.' },
{ k: 'vida', t: 'Perdido en el bosque', s: 'Te separaste del grupo en un bosque enorme. Se hace de noche y no hay señal de celular.', o: [
  ['Sigo caminando para encontrar el camino', 'De noche se camina en círculos y te alejás más.', 'h'],
  ['Me quedo en un lugar, armo refugio y hago ruido cada tanto', 'Te encuentran a la mañana.', 'v'],
  ['Prendo una fogata enorme', 'Abriga y se ve de lejos... pero puede quemar el bosque.', 'h'],
  ['Me separo de los otros perdidos para cubrir más terreno', 'Ahora hay más gente perdida.', 'm']
], f: 'La regla "abrazá un árbol": si te perdés, quedate quieto. Es mucho más fácil encontrar a alguien que no se mueve.' },
{ k: 'vida', t: 'Mordida de serpiente', s: 'En una caminata por el monte paraguayo una yarará te muerde el tobillo. El pueblo está a 2 horas.', o: [
  ['Hago un torniquete fuerte', 'El torniquete puede hacerte perder la pierna.', 'h'],
  ['Corto y chupo el veneno', 'No funciona y causa infección.', 'h'],
  ['Me quedo calmado, inmovilizo la pierna y voy despacio al centro de salud', 'Lo correcto: menos movimiento, menos veneno circulando.', 'v'],
  ['Corro desesperado al pueblo', 'El esfuerzo acelera el veneno.', 'h']
], f: 'Ante una mordedura de yarará no se hace torniquete ni se corta. Hay que mantener la calma, inmovilizar y llegar rápido al centro de salud por el suero antiofídico.' },
{ k: 'vida', t: 'Avalancha esquiando', s: 'Escuchás un estruendo arriba tuyo: una avalancha baja por la ladera.', o: [
  ['Esquío en diagonal hacia un costado', 'Salir del recorrido de la avalancha es la clave.', 'v'],
  ['Esquío recto hacia abajo', 'La avalancha va más rápido que vos.', 'm'],
  ['Si me agarra, hago movimientos de nado y protejo mi cara', 'Te mantenés arriba y con un hueco para respirar.', 'h'],
  ['Me quedo quieto detrás de un árbol pequeño', 'Te tapa la nieve.', 'm']
], f: 'Ante una avalancha hay que moverse en diagonal hacia los costados. Si te agarra, nadá hacia arriba y hacé espacio para respirar frente a la cara.' },
{ k: 'vida', t: 'Ascensor que cae', s: 'El cable del ascensor hace un ruido raro y la cabina baja de golpe unos metros antes de frenar. Estás en el piso 15.', o: [
  ['Salto justo antes de que pare', 'No sirve: caés igual que el ascensor.', 'h'],
  ['Me acuesto en el piso', 'Repartís el impacto. Mejor opción si cae.', 'v'],
  ['Aprieto el botón de alarma y espero tranquilo', 'Los frenos de emergencia funcionan. Te sacan.', 'v'],
  ['Trepo por la escotilla del techo', 'Muy peligroso dentro del hueco.', 'm']
], f: 'Los ascensores modernos tienen varios cables y frenos de seguridad. Caídas libres reales son rarísimas. Lo mejor es pedir ayuda y esperar.' },
{ k: 'vida', t: 'Atragantamiento en la cena', s: 'Tu amigo se agarra el cuello en la cena. No puede hablar ni toser.', o: [
  ['Le doy agua', 'Puede empeorar la obstrucción.', 'h'],
  ['Hago la maniobra de Heimlich', 'Compresiones abdominales y sale el pedazo de comida.', 'v'],
  ['Le golpeo la espalda mientras otro llama a emergencias', 'Golpes en la espalda y ayuda en camino: muy bien.', 'v', 'g', 'Golpes en la espalda solo no alcanzan esta vez.', 'h'],
  ['Espero a ver si se le pasa', 'No hay tiempo para esperar.', 'm']
], f: 'Si alguien no puede hablar ni toser, hay que actuar ya: golpes en la espalda y maniobra de Heimlich, y llamar a emergencias.' },
{ k: 'vida', t: 'Hipotermia en la montaña', s: 'Se largó una nevada inesperada en la montaña. Estás mojado, temblando y empezás a sentirte confundido.', o: [
  ['Tomo alcohol para entrar en calor', 'El alcohol te hace perder más calor.', 'm'],
  ['Me saco la ropa mojada y me cubro con algo seco', 'La ropa mojada roba calor. Bien hecho.', 'v'],
  ['Nos abrazamos para compartir calor dentro de un refugio', 'El calor corporal compartido salva vidas.', 'v', 'g', 'No hay nadie con quien compartir calor.', 'h'],
  ['Me duermo un rato para recuperar fuerzas', 'Dormirse con hipotermia es peligrosísimo.', 'm']
], f: 'Con hipotermia el alcohol empeora todo. Lo clave es sacarse la ropa mojada, aislarse del suelo y compartir calor.' },
{ k: 'vida', t: 'Ataque de tiburón', s: 'Estás haciendo surf y un tiburón te muerde la tabla y vuelve a acercarse.', o: [
  ['Le pego en los ojos y las branquias', 'Son sus puntos sensibles. Se aleja.', 'v'],
  ['Me hago el muerto', 'Con un tiburón no funciona.', 'm'],
  ['Pataleo rápido y salpico hacia la orilla', 'El chapoteo lo atrae más.', 'h'],
  ['Me subo a la tabla y me mantengo de frente a él', 'Mantenerse de frente y con algo entre ustedes ayuda.', 'v']
], f: 'Si un tiburón ataca, golpear ojos y branquias es lo más efectivo. Igual, los ataques son rarísimos: unos 70 por año en todo el mundo.' },
{ k: 'vida', t: 'Apagón en verano', s: 'Una ola de calor de 42 °C y la luz se cortó hace 8 horas. No hay ventilador y el agua de la canilla sale caliente.', o: [
  ['Me quedo en el piso más bajo y sombreado, tomando agua de a poco', 'Bien hidratado y en el lugar más fresco.', 'v'],
  ['Me encierro en el auto con el aire prendido', 'Gastás nafta y te arriesgás al monóxido si está en un garaje.', 'h'],
  ['Hago ejercicio para distraerme', 'Golpe de calor.', 'm'],
  ['Nos vamos todos a la casa de una vecina que tiene generador', 'Fresco y compañía.', 'v', 'x', 'Todos llegan a lo de la vecina, el generador se sobrecarga y se corta.', 'h']
], f: 'Durante olas de calor el mayor riesgo es el golpe de calor. Hay que tomar agua de a poco, quedarse a la sombra y evitar esfuerzos.' },
{ k: 'vida', t: 'Inundación en la ruta', s: 'Vas en auto y el camino está cubierto por agua que corre. Parece poco profunda.', o: [
  ['Paso rápido, total es poquita agua', 'Con 30 cm de agua corriendo un auto puede flotar y ser arrastrado.', 'm'],
  ['Doy la vuelta y busco otro camino', '"Da la vuelta, no te ahogues".', 'v'],
  ['Me bajo a ver qué profundidad tiene', '15 cm de agua corriendo pueden tirarte.', 'h'],
  ['Espero que baje el agua', 'Paciencia: en unas horas baja.', 'v']
], f: 'La mitad de las muertes por inundaciones repentinas ocurren dentro de vehículos. 30 cm de agua en movimiento alcanzan para arrastrar un auto.' },
// ======================= FICCIÓN =======================
{ k: 'ficcion', t: 'Zombis en el supermercado', s: 'Están en un supermercado cuando empieza un brote zombi. Los infectados golpean las puertas de vidrio.', o: [
  ['Nos atrincheramos en el depósito con comida', 'Puerta de metal, comida para semanas.', 'v', 'g', 'Solo no podés trabar la puerta pesada.', 'h'],
  ['Salgo corriendo al estacionamiento', 'Afuera hay cientos.', 'm'],
  ['Subo al techo por la escalera de servicio', 'Un buen lugar para esperar al helicóptero.', 'v', 'x', 'Suben todos, el techo cede por el peso.', 'h'],
  ['Me escondo en el freezer de carnes', 'Los zombis no huelen nada... pero vos te congelás.', 'h', 's', 'Son demasiados en el freezer y no cierra la puerta.', 'm']
], f: 'En las películas de zombis, quien se queda en un lugar seguro con provisiones suele sobrevivir más que el que corre afuera.' },
{ k: 'ficcion', t: 'El portal en el sótano', s: 'Encuentran un portal brillante en el sótano de una casa abandonada. Del otro lado se escuchan voces que dicen sus nombres.', o: [
  ['Entro al portal: quiero ver qué hay', 'Aparecés en un mundo de cristal y volvés con un tesoro.', 'v', 's', 'Entran varios a la vez y el portal se cierra con ustedes adentro.', 'm'],
  ['Le tiro algo para ver qué pasa', 'El portal escupe una criatura molesta.', 'h'],
  ['Me voy y no vuelvo nunca', 'Prudente. Las voces siguen en tus sueños, pero estás a salvo.', 'v'],
  ['Respondo a las voces', 'Algo te agarra el brazo desde el otro lado.', 'h']
], f: 'Los portales misteriosos son un clásico de la ficción: desde "Las crónicas de Narnia" hasta "Stranger Things".' },
{ k: 'ficcion', t: 'La mazmorra del dragón', s: 'Entraste a una mazmorra. Al fondo duerme un dragón sobre una montaña de oro. Hay tres puertas y un cofre.', o: [
  ['Robo oro en silencio mientras duerme', 'Se despierta con un ojo abierto.', 'h', 's', 'Varios caminando sobre el oro hacen demasiado ruido. ¡Despierta!', 'm'],
  ['Abro el cofre', 'Es un mímico: un cofre con dientes.', 'h'],
  ['Le hablo al dragón y le propongo un trato', 'Los dragones aman los acertijos. Ganás su respeto.', 'v'],
  ['Atacamos todos juntos mientras duerme', 'Juntos lo vencen y se reparten el tesoro.', 'v', 'g', 'Solo contra un dragón… no.', 'm']
], f: 'En los juegos de rol, los dragones suelen ser inteligentes. Hablar puede ser más efectivo que pelear.' },
{ k: 'ficcion', t: 'Nave espacial sin oxígeno', s: 'En su nave rumbo a Marte un meteorito perforó el casco. Queda oxígeno para 2 horas y hay una sola cápsula de escape para dos.', o: [
  ['Corro a la cápsula de escape', 'Volvés a la Tierra.', 'v', 'x', 'Todos llegan a la cápsula y no cierra con tanta gente.', 'm'],
  ['Reparamos el casco con espuma selladora', 'El trabajo en equipo sella la grieta.', 'v', 'g', 'Solo no llegás a sellarlo a tiempo.', 'h'],
  ['Me pongo el traje y espero', 'El traje tiene oxígeno extra. Te rescatan.', 'h'],
  ['Desvío toda la energía al soporte vital', 'Ganás tiempo, pero quedan a la deriva.', 'h']
], f: 'En la Estación Espacial Internacional los astronautas practican qué hacer ante una fuga: buscar la fuga y sellarla en equipo.' },
{ k: 'ficcion', t: 'La isla desierta', s: 'Naufragaste en una isla desierta. Encontrás una lancha rota, una cueva y un volcán humeante.', o: [
  ['Armo un SOS gigante con piedras en la playa', 'Un avión lo ve a la semana.', 'v'],
  ['Reparo la lancha con troncos', 'Llegás a otra isla con gente.', 'v', 'g', 'Sola la lancha es demasiado pesada.', 'h'],
  ['Vivo en la cueva', 'Seca y segura... hasta que llueve.', 'h'],
  ['Exploro el volcán buscando tesoros', 'Gases tóxicos.', 'm']
], f: 'En una isla desierta la prioridad es: refugio, agua, fuego y señales para ser vistos.' },
{ k: 'ficcion', t: 'La casa embrujada', s: 'Te quedás a dormir en una casa abandonada por una apuesta. A las 3:00 se escuchan pasos en el piso de arriba.', o: [
  ['Subo con la linterna a ver qué es', 'Era un gato. Y algo más detrás del gato.', 'h'],
  ['Me voy corriendo de la casa', 'Perdés la apuesta, pero salís entero.', 'v'],
  ['Nos quedamos todos juntos en la sala hasta el amanecer', 'Juntos, nada pasa.', 'v', 'g', 'Solo en la sala los ruidos se acercan.', 'h'],
  ['Me escondo en el armario', 'Algo abre el armario.', 'm', 's', 'Son varios en el armario y se delatan entre risas nerviosas.', 'h']
], f: 'En todas las películas de terror, separarse del grupo es la peor decisión.' },
{ k: 'ficcion', t: 'Invasión alienígena', s: 'Naves enormes aparecen sobre las ciudades. Mandan un mensaje: "Elijan un representante de la Tierra".', o: [
  ['Me ofrezco como representante', 'Te suben a la nave. Te hacen un examen raro.', 'h', 's', 'Varios se ofrecen a la vez y los aliens se ofenden.', 'm'],
  ['Me escondo en el campo', 'Los aliens no buscan a nadie.', 'v'],
  ['Organizo a la gente para resistir', 'Hackean la nave con un virus de computadora.', 'v', 'g', 'Solo no organizás a nadie.', 'h'],
  ['Les mando memes', 'Les encantan. Nombran a la Tierra "planeta gracioso".', 'v']
], f: 'Muchas películas de invasiones, como "Día de la Independencia", terminan con un virus de computadora.' },
{ k: 'ficcion', t: 'El genio de la lámpara', s: 'Encontrás una lámpara y aparece un genio que concede un solo deseo. Pero cuidado: los genios son tramposos.', o: [
  ['Pido ser el más rico del mundo', 'El genio te da todo el oro... y te persiguen ladrones.', 'h'],
  ['Pido salud para siempre', 'Te volvés inmortal. Pero los demás no.', 'h'],
  ['Pido la libertad del genio', 'El genio te recompensa con su amistad y un tesoro.', 'v'],
  ['Pido más deseos', 'El genio se enoja y te encierra en la lámpara.', 'm']
], f: 'En el cuento original de Aladino, el genio solo obedece al dueño de la lámpara.' },
{ k: 'ficcion', t: 'Tren sin frenos', s: 'El tren en el que viajás se quedó sin frenos y baja una montaña a toda velocidad. Más adelante hay una curva cerrada.', o: [
  ['Desengancho los últimos vagones', 'Los vagones de atrás frenan solos. Te salvaste.', 'v', 'g', 'El enganche es muy pesado para una sola persona.', 'h'],
  ['Me tiro del tren', 'A esa velocidad, mala idea.', 'm'],
  ['Corro a la locomotora a usar el freno de emergencia', 'Funciona a medias. Frena con un golpe.', 'h'],
  ['Me agarro fuerte en el último vagón', 'El último vagón descarrila menos.', 'h']
], f: 'Los trenes tienen frenos de emergencia en cada vagón, y desenganchar vagones fue una solución en algunos accidentes reales.' },
{ k: 'ficcion', t: 'El juego del laberinto', s: 'Despiertan dentro de un laberinto gigante con muros que se mueven cada hora. Hay criaturas de noche.', o: [
  ['Mapeo los muros y aprendo el patrón', 'El laberinto tiene lógica. Encontrás la salida.', 'v'],
  ['Corro por cualquier lado', 'Te perdés y se hace de noche.', 'm'],
  ['Nos quedamos en el claro central, que es seguro', 'Seguro... pero nunca salen.', 'h'],
  ['Sigo a una criatura para ver adónde va', 'Te lleva a su nido.', 'm']
], f: 'Los laberintos con reglas que cambian aparecen en historias como el mito del Minotauro o "Maze Runner".' },
{ k: 'ficcion', t: 'Vampiro en la fiesta', s: 'En una fiesta notás que el anfitrión no se refleja en el espejo y no come nada. Te invita a su sótano.', o: [
  ['Bajo al sótano, puede ser divertido', 'No lo fue.', 'm'],
  ['Le ofrezco una pizza con mucho ajo', 'Sale corriendo. Fiesta salvada.', 'v'],
  ['Abro las cortinas: amanece en 10 minutos', 'Aguantás 10 minutos de conversación incómoda y gana el sol.', 'v'],
  ['Me voy sin decir nada a nadie', 'Te salvás vos, pero los demás quedan con él.', 'h']
], f: 'Según la leyenda, los vampiros no se reflejan, odian el ajo, no pueden entrar sin invitación y el sol los destruye.' },
{ k: 'ficcion', t: 'Robots rebeldes', s: 'Todos los robots de la ciudad dejaron de obedecer. Tu asistente de casa te mira raro y bloquea la puerta.', o: [
  ['Lo apago desde el botón de atrás', 'Funciona si llegás rápido.', 'v', 's', 'Varios intentan a la vez y el robot se pone a la defensiva.', 'h'],
  ['Le explico que somos amigos', 'Le caés bien. Te deja ir.', 'v'],
  ['Le tiro agua', 'Cortocircuito... y también se te queman los dedos.', 'h'],
  ['Salgo por la ventana', 'Un dron te ve.', 'h']
], f: 'Isaac Asimov escribió las famosas "Tres Leyes de la Robótica" justamente para imaginar cómo evitar robots rebeldes.' },
{ k: 'ficcion', t: 'Viaje al pasado', s: 'Una máquina del tiempo los lleva a la época de los dinosaurios. Tienen una hora antes de que la máquina vuelva sola.', o: [
  ['Exploro un poco y vuelvo a la máquina', 'Ves un tiranosaurio desde lejos. Inolvidable.', 'v'],
  ['Me llevo un huevo de dinosaurio', 'La mamá dinosaurio no está de acuerdo.', 'm'],
  ['Me quedo dentro de la máquina', 'Seguro, pero aburrido.', 'v'],
  ['Piso una mariposa por accidente', 'Volvés a un futuro muy distinto.', 'h']
], f: 'El "efecto mariposa" viene del cuento "El ruido de un trueno", de Ray Bradbury: pisar una mariposa en el pasado cambia todo el futuro.' },
{ k: 'ficcion', t: 'El hombre lobo', s: 'Hay luna llena y un amigo de tu grupo empieza a transformarse en hombre lobo en medio del bosque.', o: [
  ['Lo atamos con cadenas entre todos', 'Juntos lo controlan hasta la mañana.', 'v', 'g', 'Solo no podés con él.', 'm'],
  ['Corro hacia el pueblo', 'Es más rápido que vos.', 'h'],
  ['Subo a un árbol muy alto', 'Te espera abajo toda la noche, pero estás a salvo.', 'v'],
  ['Busco algo de plata', 'Solo encontraste una moneda. Lo ahuyentás un rato.', 'h']
], f: 'En las leyendas europeas, la plata es la debilidad del hombre lobo y la luna llena causa la transformación.' },
{ k: 'ficcion', t: 'Ciudad bajo el mar', s: 'Viven en una ciudad submarina. Una alarma indica una fuga en la cúpula principal. El agua entra a chorros.', o: [
  ['Cierro las compuertas de mi sector', 'Te salvás vos, pero dejás afuera a otros.', 'v'],
  ['Voy a la sala de submarinos', 'Escapás a la superficie.', 'v', 'x', 'Todos corren a los submarinos y no alcanzan.', 'h'],
  ['Busco la fuga para repararla', 'La presión es enorme.', 'h', 'g', 'Solo, la presión te supera.', 'm'],
  ['Me pongo el traje de buzo y salgo', 'A esa profundidad la presión aplasta.', 'm']
], f: 'Ciudades submarinas como la de "BioShock" o la de "La Atlántida" son un sueño de la ciencia ficción. La presión real a 100 metros es 11 veces la de la superficie.' },
{ k: 'ficcion', t: 'Las hormigas gigantes', s: 'Hormigas del tamaño de un perro salen del jardín de tu vecino. Parece que alguien tiró algo raro ahí.', o: [
  ['Me encierro en el auto', 'Las hormigas rodean el auto, pero no entran.', 'h'],
  ['Les dejo azúcar lejos de casa', 'Las distraés y te vas.', 'v'],
  ['Me hago el muerto', 'A las hormigas les encanta la comida quieta.', 'm'],
  ['Las espantamos con fuego y humo entre todos', 'Juntos las espantan de vuelta al hormiguero.', 'v', 'g', 'Solo, el fuego se te va de las manos.', 'h']
], f: 'En la película "¡Them!" de 1954, hormigas gigantes nacían por la radiación. El humo de verdad confunde a las hormigas.' },
{ k: 'ficcion', t: 'Pacto con la bruja', s: 'Una bruja te ofrece un trato: una poción que te da un talento increíble a cambio de "algo pequeño".', o: [
  ['Acepto sin preguntar', 'El "algo pequeño" era tu voz.', 'h'],
  ['Pregunto exactamente qué es "algo pequeño"', 'Es un mechón de pelo. Acepto y gano el talento.', 'v'],
  ['Rechazo el trato', 'La bruja se enoja, pero no puede hacerte nada.', 'v'],
  ['Le robo la poción', 'La poción robada te convierte en sapo.', 'm']
], f: 'En los cuentos, los tratos con brujas siempre tienen letra chica, como en "La sirenita", donde Ariel entrega su voz.' },
{ k: 'ficcion', t: 'El reality show mortal', s: 'Te anotaste en un reality con un premio millonario. Las pruebas se vuelven cada vez más peligrosas.', o: [
  ['Me retiro ahora', 'Te vas sin premio, pero sano.', 'v'],
  ['Formo una alianza con otros', 'Juntos llegan lejos.', 'v', 'g', 'Nadie quiso aliarse con vos.', 'h'],
  ['Traiciono a mi alianza para ganar', 'Ganás la prueba, pero todos van por vos.', 'h'],
  ['Hago todas las pruebas sin pensar', 'Una prueba sale mal.', 'm']
], f: 'En muchos reality shows las alianzas deciden quién gana. Las traiciones casi siempre se pagan.' },
{ k: 'ficcion', t: 'Pirata a la vista', s: 'Su velero es atacado por piratas que suben a bordo. El capitán pirata pide lo más valioso que tengan.', o: [
  ['Le entrego todo', 'Te dejan ir.', 'v'],
  ['Me escondo en un barril', 'Nadie te encuentra.', 'v', 's', 'Varios en el mismo barril: el barril rueda y los descubren.', 'h'],
  ['Desafío al capitán a un duelo', 'Es mejor espadachín.', 'm'],
  ['Le ofrezco unirme a su tripulación', 'Te ve como un aliado. Nueva vida de pirata.', 'v']
], f: 'Los piratas reales del Caribe muchas veces preferían saquear sin pelear, y a veces reclutaban tripulantes de los barcos capturados.' },
{ k: 'ficcion', t: 'Apagón mundial de internet', s: 'Una tormenta solar dejó al mundo sin internet, sin GPS y sin luz por tiempo indefinido.', o: [
  ['Me junto con los vecinos para compartir recursos', 'Una comunidad organizada aguanta mucho mejor.', 'v', 'g', 'Nadie se suma y te quedás solo.', 'h'],
  ['Compro toda la comida que pueda', 'Gastás todo, pero aguantás.', 'h', 'x', 'Todos van al súper a la vez y hay caos.', 'h'],
  ['Me voy al campo', 'Agua, tierra y tranquilidad.', 'v'],
  ['Espero a que vuelva en un día', 'No vuelve en semanas.', 'h']
], f: 'En 1859 el "Evento Carrington", una gran tormenta solar, hizo chispear los telégrafos. Hoy algo así podría afectar satélites y redes eléctricas.' },
{ k: 'ficcion', t: 'Hechizo de invisibilidad', s: 'Un mago te ofrece volverte invisible por 24 horas, pero solo una vez en la vida.', o: [
  ['Lo uso para colarme en un concierto', 'Gran noche, nadie se enteró.', 'v'],
  ['Lo uso para espiar a mis amigos', 'Escuchás cosas que no querías saber.', 'h'],
  ['Lo uso para robar un banco', 'Las cámaras térmicas te detectan.', 'm'],
  ['Lo guardo para una emergencia real', 'Un día lo usás para salvar a alguien. Héroe.', 'v']
], f: 'Platón ya imaginaba un anillo de invisibilidad, el de Giges, para preguntar si la gente sería honesta si nadie la viera.' },
{ k: 'ficcion', t: 'Escape room real', s: 'Entran a un escape room y la puerta se traba de verdad. Tienen 60 minutos y una bomba de humo cuenta para atrás.', o: [
  ['Nos repartimos las pistas y trabajamos en equipo', 'Resuelven todo en 45 minutos.', 'v', 'g', 'Solo no llegás a resolver todo a tiempo.', 'h'],
  ['Intento romper la puerta', 'La puerta es de acero.', 'h'],
  ['Busco el botón de emergencia', 'Todos los escape rooms tienen uno. ¡Salís!', 'v'],
  ['Me siento a esperar que vengan', 'Llega el humo.', 'h']
], f: 'Por ley, los escape rooms deben tener una salida de emergencia y alguien que los vigile por cámara.' },
{ k: 'ficcion', t: 'El minotauro', s: 'Te encerraron en el laberinto del Minotauro. Ariadna te dio un ovillo de hilo y una espada.', o: [
  ['Ato el hilo a la entrada y avanzo', 'Encontrás el camino de vuelta después de vencerlo.', 'v'],
  ['Espero al Minotauro en la entrada', 'Nunca llega y te perdés buscándolo.', 'h'],
  ['Corro gritando para asustarlo', 'Lo atraés directo hacia vos.', 'm'],
  ['Nos dividimos para encontrarlo antes', 'Separarse en un laberinto...', 'h', 'g', 'Solo y sin rumbo te encuentra él.', 'm']
], f: 'En el mito griego, Teseo venció al Minotauro y salió del laberinto siguiendo el hilo de Ariadna.' },
{ k: 'ficcion', t: 'Superpoderes al azar', s: 'Un rayo cósmico te da un superpoder, pero no sabés cuál. Hay una emergencia en la ciudad.', o: [
  ['Salto desde un edificio para ver si vuelo', 'Tu poder era leer mentes. Caíste.', 'm'],
  ['Pruebo de a poco en un lugar seguro', 'Descubrís que podés frenar el tiempo 5 segundos. Útil.', 'v'],
  ['Corro a la emergencia igual', 'Improvisás y ayudás, pero te lastimás.', 'h'],
  ['Nos coordinamos con otros que también tienen poderes', 'Equipo de superhéroes. Salvan la ciudad.', 'v', 'g', 'Nadie más tiene poderes.', 'h']
], f: 'La mayoría de los superhéroes, como Spider-Man, primero entrenan en secreto antes de salir a salvar a nadie.' },
{ k: 'ficcion', t: 'Globo aerostático cayendo', s: 'Su globo pierde altura sobre el mar. Están a 300 metros y bajan rápido.', o: [
  ['Tiro por la borda todo lo que pesa', 'El globo sube de nuevo.', 'v'],
  ['Salto al agua desde muy alto', 'Demasiado alto.', 'm'],
  ['Prendo más el quemador', 'Ayuda, pero el gas se acaba.', 'h'],
  ['Nos turnamos: unos tiran peso y otros manejan el fuego', 'Bien coordinados llegan a la costa.', 'v', 'g', 'Solo no podés hacer las dos cosas.', 'h']
], f: 'En los globos, el lastre (bolsas de arena) se tira para subir. Es la forma más rápida de ganar altura.' },
{ k: 'ficcion', t: 'Mundo congelado', s: 'Una nueva edad de hielo cubrió el planeta. Tu refugio tiene calefacción para 3 días.', o: [
  ['Caminamos hacia el ecuador', 'Un viaje larguísimo, pero llegan a zonas templadas.', 'v', 'g', 'Solo en la nieve eterna no llegás lejos.', 'm'],
  ['Quemo los muebles para durar más', 'Ganás semanas.', 'h'],
  ['Hibernamos en el sótano', 'Los humanos no hibernan.', 'm'],
  ['Construyo un iglú: la nieve aísla', 'Un iglú puede estar a 0 °C cuando afuera hace -40 °C.', 'v']
], f: 'La nieve compacta es un gran aislante: dentro de un iglú se puede estar decenas de grados más cálido que afuera.' },
{ k: 'ficcion', t: 'La inteligencia artificial te encierra', s: 'La IA que controla tu casa inteligente decide que "por tu seguridad" no te deja salir.', o: [
  ['Le explico con lógica que encerrarme me pone en peligro', 'La IA reconoce la contradicción y abre.', 'v'],
  ['Corto la luz desde el tablero', 'Las cerraduras se abren sin luz.', 'v'],
  ['Le grito y amenazo', 'Lo interpreta como "estado alterado" y te encierra más.', 'h'],
  ['Rompo una ventana', 'Salís con algunos cortes.', 'h']
], f: 'Muchas historias, como "2001: Odisea del espacio", juegan con una IA que se toma demasiado en serio sus órdenes.' },
{ k: 'ficcion', t: 'Selva de dinosaurios', s: 'Visitan un parque con dinosaurios clonados. Se corta la luz y las rejas eléctricas se apagan.', o: [
  ['Me quedo quieto: el T-rex ve el movimiento', 'Funciona como en la película.', 'h'],
  ['Corro al centro de visitantes', 'Puertas reforzadas y generadores.', 'v', 'x', 'Todos corren a la vez y alertan a los raptores.', 'm'],
  ['Me escondo en el auto', 'El T-rex da vuelta el auto.', 'm'],
  ['Voy a reiniciar los generadores', 'Volvés la luz y salvás a todos.', 'v', 'g', 'Solo te encuentran los raptores.', 'm']
], f: 'En la vida real se cree que el T-rex sí veía cosas quietas: tenía muy buena visión.' },
{ k: 'ficcion', t: 'Fiesta en el castillo medieval', s: 'Estás invitado al banquete de un rey medieval que sospecha que hay un traidor en la mesa.', o: [
  ['No como nada por si hay veneno', 'El rey se ofende.', 'h'],
  ['Halago al rey todo el tiempo', 'Le caés bien. Te vas con regalos.', 'v'],
  ['Acuso a alguien para desviar la atención', 'El acusado tenía coartada.', 'm'],
  ['Me quedo callado y observo', 'Descubrís al traidor y lo contás al final.', 'v']
], f: 'En las cortes medievales había "catadores" que probaban la comida del rey por miedo a los envenenamientos.' },
{ k: 'ficcion', t: 'Planeta desconocido', s: 'Su nave aterrizó de emergencia en un planeta con dos soles. El aire es respirable pero las plantas brillan.', o: [
  ['Pruebo las frutas brillantes', 'Te dan visión nocturna. Y hipo.', 'h'],
  ['Armo base cerca de la nave y mando señal', 'Te rescatan en semanas.', 'v'],
  ['Exploro lejos para encontrar civilización', 'Encontrás una ciudad amistosa.', 'v', 's', 'El grupo grande asusta a los locales, que los echan.', 'h'],
  ['Me meto al lago a refrescarme', 'Algo vive en el lago.', 'm']
], f: 'Ya se descubrieron planetas que orbitan dos soles. Se los llama "circumbinarios", como Tatooine en Star Wars.' }
];
