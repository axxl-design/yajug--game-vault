# YAJUGÁ: DOMINIO

MVP web del juego de cartas multijugador YAJUGÁ: DOMINIO. 2-4 jugadores, modo Mejorado, ciudad Sunhaven. Multijugador online vía servidor WebSocket (Socket.IO) — el host es source of truth del GameState; el server retransmite mensajes.

> **Tagline:** Cada calle tiene dueño. Cada dueño tiene precio.

## Stack

### Frontend (`/`)

- React 18 + TypeScript + Vite 6
- Tailwind CSS 3 (con tokens del handoff bundle de Claude Design)
- Zustand 5 + Immer (estado), Framer Motion 11 (animaciones)
- **socket.io-client 4** (multijugador online)
- React Router 6
- Geist Sans + Inter + Geist Mono (auto-host)
- lucide-react (iconos UI)
- Vitest 4 + @vitest/coverage-v8 (tests)

### Servidor (`/server`)

- Express 4 + Socket.IO 4
- TypeScript + tsx (run/watch sin paso de build en dev)
- Es un **dumb relay**: no procesa lógica de juego, sólo retransmite mensajes y mantiene la membresía de salas.

## Requisitos

- Node.js 20+
- pnpm 10+

## Cómo correrlo en local (frontend + servidor)

Necesitás dos terminales:

**Terminal 1 — Servidor WebSocket** (puerto 3001):

```bash
cd server
pnpm install        # primera vez
pnpm dev            # tsx watch — recompila al guardar
```

Verificá con `curl http://localhost:3001/health` que responde JSON.

**Terminal 2 — Frontend** (puerto 5173):

```bash
pnpm install        # primera vez (raíz del repo)
pnpm dev
```

Por default el frontend lee `VITE_WS_URL` desde el ambiente. Si no está seteado, usa `http://localhost:3001`. Para apuntar a un server remoto creá `.env.local`:

```
VITE_WS_URL=https://yajuga-server-production.up.railway.app
```

### Probar el flujo multijugador localmente

1. Abrir `http://localhost:5173` en una pestaña → escribir nickname → "Crear partida". Aparece código de sala (ej. `K7P2RF`).
2. Copiar el link y abrirlo en otra pestaña / ventana incógnito / otro navegador.
3. La segunda ventana ve un `NicknameGate` → confirma nickname → entra como cliente.
4. La primera ventana (host) ve al cliente aparecer en la lista. Click "Empezar partida".
5. Las dos ventanas pasan por RoleAssignment y entran a la GameScreen sincronizada.

## Scripts

### Frontend

- `pnpm dev` — dev server con HMR.
- `pnpm build` — type-check + build de producción.
- `pnpm preview` — preview del build.
- `pnpm typecheck` — solo type-check, sin build.
- `pnpm test` — Vitest watch mode.
- `pnpm test:run` — Vitest single run.
- `pnpm test:coverage` — tests + reporte de coverage.

### Servidor

```bash
cd server
pnpm dev        # tsx watch
pnpm start      # tsx single run
pnpm build      # tsc → dist/
pnpm start:prod # node dist/index.js (post-build)
```

## Estructura

- `src/screens/` — pantallas completas (HomeScreen, LobbyScreen, GameScreen, etc.).
- `src/components/` — componentes UI (`ui/`), de cartas (`card/`), de partida (`game/`), de lobby (`lobby/`), del tutorial (`tutorial/`).
- `src/game/` — lógica de juego pura sin React (deck, rules, actions, roles, expansiones, titulares).
- `src/stores/` — stores Zustand (game, lobby, prefs).
- `src/multiplayer/` — capa Socket.IO: `socket.ts` (transporte), `sync.ts` (HostSession / ClientSession, dispatchAction).
- `src/styles/` — `tokens.css` (porte literal del bundle) + `globals.css` + `editorial.css` + `cards.css` + `lobby.css` + `roles.css` + `game.css`.
- `src/assets/` — pixel art del juego (cartas, roles, titulares, distritos).
- `server/` — relay WebSocket (Express + Socket.IO). Ver `server/README.md` para detalles del protocolo.

## Documentación viva

- `DECISIONS.md` — decisiones técnicas tomadas a medida que avanza el proyecto.
- `BUGS.md` — bugs conocidos pendientes.
- `_handoff/` — material de referencia (brief, guía conceptual, design bundle). No se publica.

## Plan por fases

**Estado actual:** MVP completo (Fases 1-13) + hardening multiplayer (Fases 14-17). 4 jugadores en dispositivos distintos pueden jugar una partida completa vía link compartido. 201 tests pasando, frontend y servidor compilan limpio.

## Cómo deployar

### Frontend → Vercel

1. `git push` a un repo conectado a Vercel.
2. Vercel detecta `vercel.json` (framework=vite, build=`pnpm build`).
3. Settear variable `VITE_WS_URL` en Vercel apuntando al server público (ver siguiente punto).
4. El rewrite `/(.*)` → `/` resuelve rutas client-side.

### Servidor → Railway (free tier)

1. Crear proyecto en Railway, conectarlo al repo.
2. **Root Directory** del servicio: `server/`.
3. Build command: `pnpm install && pnpm build`. Start command: `pnpm start:prod`.
4. Variables:
   - `CORS_ORIGINS=https://<tu-app>.vercel.app` (CSV, podés agregar staging).
   - `PORT` lo setea Railway automáticamente.
5. Railway expone una URL pública (`https://yajuga-server-production.up.railway.app`). Copiala a `VITE_WS_URL` en Vercel y redeployá el frontend.

Más detalles del servidor en `server/README.md`.

## Cómo se juega online

1. Un jugador entra a la app, escribe nickname, click "Crear partida". Recibe un código de 6 chars (ej. `K7P2RF`) y queda como **host**.
2. El host comparte el link `https://app.com/game/K7P2RF` (botón "Copiar link" en el lobby).
3. Otros jugadores abren el link → ven el `NicknameGate` para confirmar/cambiar su nickname → se conectan al servidor y aparecen en la sala del host.
4. El host ve los slots llenarse en tiempo real. Cuando hay 2-4 jugadores → click "Empezar partida".
5. Todos pasan por la pantalla de asignación de roles (ruleta + reveal) y arrancan la partida.
6. Cada jugador, en su turno, juega cartas, defiende ataques, activa Expansiones, etc. Las acciones de los clients viajan al host vía servidor; el host las valida, aplica al GameState y broadcastea el nuevo estado a todos.
7. Cuando alguien cumple condición de victoria → Tiempo Extra (1 turno por jugador para romperlo) → ganador → GameOverScreen.

Si el servidor está caído o no se puede conectar (sin red, CORS mal seteado, server frío), el frontend cae automático a **modo hot-seat** (todos juegan en la misma pestaña con "Agregar jugador").

### Tests

```bash
pnpm test           # watch mode
pnpm test:run       # single run
pnpm test:coverage  # con reporte de coverage
```

Los 201 tests cubren la lógica de juego pura (`src/game/`) y los stores (`src/stores/`). La capa Socket.IO no tiene tests de integración (es la red — se prueba manual con dos pestañas).

### Rutas

- `/` — HomeScreen (logo, tagline, nickname, crear/unirme).
- `/tutorial` — TutorialScreen (accordion con 10 secciones).
- `/game/:gameId` — LobbyScreen + GameScreen (host vs cliente decidido por sessionStorage; `NicknameGate` intermedio si llegás vía link compartido sin pasar por HomeScreen).
- `/dev` — galería de componentes (solo en desarrollo).

### Atajos de teclado en GameScreen

- `T` — terminar turno.
- `E` — abrir modal de Expansión (si medidor está al 100%).
- `L` — toggle del log de partida.
- `H` — abrir tutorial.
- `Esc` — cerrar modales en orden (expansión → log → menú de carta).

### Galería de componentes

En desarrollo, la ruta `/dev` (`http://localhost:5173/dev`) muestra todos los componentes UI en sus variants y estados, con toggle de tema en el header. La página queda fuera del build de producción (cargada vía `React.lazy` condicional a `import.meta.env.DEV`).
