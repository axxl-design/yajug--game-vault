# YAJUGÁ Games Vault

Web de YAJUGÁ con el primer juego, **YAJUGÁ Dominio** (Monopoly con roles, cartas tipo Monopoly Deal y dominios).

- `/` — landing de la bóveda de juegos.
- `/jugar` — el juego: solo contra la computadora o en salas online con amigos (2 a 4 jugadores).

Sitio estático (sin build). Las salas usan Supabase Realtime (broadcast + presence): el anfitrión corre la partida y los demás la ven y juegan en vivo.

Diseñado en el canvas de Claude Design; `dc.js` renderiza esos mismos templates como página normal.
