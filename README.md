# YAJUGÁ: DOMINIO

MVP web del juego de cartas multijugador YAJUGÁ: DOMINIO. 2-4 jugadores, modo Mejorado, ciudad Sunhaven, multiplayer P2P sobre PeerJS.

> **Tagline:** Cada calle tiene dueño. Cada dueño tiene precio.

## Stack

- React 18 + TypeScript + Vite 6
- Tailwind CSS 3 (con tokens del handoff bundle de Claude Design)
- Zustand 5 + Immer (estado), Framer Motion 11 (animaciones)
- PeerJS 1.5 (multiplayer P2P sobre WebRTC, cloud público por default)
- React Router 6
- Geist Sans + Inter + Geist Mono (auto-host)
- lucide-react (iconos UI)
- Vitest 4 + @vitest/coverage-v8 (tests)

## Requisitos

- Node.js 20+ (probado con v24.15.0)
- pnpm 10+

## Cómo correrlo

```bash
pnpm install
pnpm dev
```

El servidor corre en `http://localhost:5173`.

## Scripts

- `pnpm dev` — dev server con HMR.
- `pnpm build` — type-check + build de producción.
- `pnpm preview` — preview del build.
- `pnpm typecheck` — solo type-check, sin build.
- `pnpm test` — Vitest watch mode.
- `pnpm test:run` — Vitest single run.
- `pnpm test:coverage` — tests + reporte de coverage.

## Estructura

Ver el brief técnico (`_handoff/BRIEF_CLAUDE_CODE_v3.md` sección 3) para la convención de carpetas. Resumen:

- `src/screens/` — pantallas completas (HomeScreen, LobbyScreen, GameScreen, etc.).
- `src/components/` — componentes UI (`ui/`), de cartas (`card/`), de partida (`game/`), de lobby (`lobby/`), del tutorial (`tutorial/`).
- `src/game/` — lógica de juego pura sin React (deck, rules, actions, roles, expansiones, titulares).
- `src/stores/` — stores Zustand (game, lobby, prefs).
- `src/multiplayer/` — capa PeerJS (peer setup, sync, mensajes).
- `src/styles/` — `tokens.css` (porte literal del bundle) + `globals.css`.
- `src/assets/` — pixel art del juego (cartas, roles, titulares, distritos).

## Documentación viva

- `DECISIONS.md` — decisiones técnicas tomadas a medida que avanza el proyecto.
- `BUGS.md` — bugs conocidos pendientes.
- `_handoff/` — material de referencia (brief, guía conceptual, design bundle). No se publica.

## Plan por fases

Ver `_handoff/BRIEF_CLAUDE_CODE_v3.md` sección 27. 13 fases secuenciales con criterios de aceptación.

**Estado actual:** **MVP completo (Fases 1-13)**. 4 jugadores en dispositivos distintos pueden jugar una partida completa por un link compartido (PeerJS). 201 tests pasando, build limpio, Vercel-ready.

## Cómo deployar

1. **Vercel zero-config** (recomendado):
   - `git push` a un repo conectado a Vercel.
   - El proyecto detecta `vercel.json` (framework=vite, build=`pnpm build`).
   - El rewrite `/(.*)` → `/` resuelve las rutas client-side.
2. **Manual** (cualquier host estático):
   - `pnpm build` genera `dist/`.
   - Servir `dist/` con cualquier server estático con SPA fallback (todas las rutas no-encontradas sirven `index.html`).

## Cómo se juega online

1. Un jugador entra a la app, escribe nickname, click "Crear partida". Recibe un código de 6 chars (ej. `K7P2RF`) y queda como **host**.
2. El host comparte el link `https://app.com/game/K7P2RF` (botón "Copiar link" en el lobby).
3. Otros jugadores abren el link → entran a la sala como **clientes** (PeerJS los conecta al peer del host).
4. El host ve los slots llenarse en tiempo real. Cuando hay 2-4 jugadores → click "Empezar partida".
5. Todos pasan por la pantalla de asignación de roles (ruleta + reveal) y arrancan la partida.
6. Cada jugador, en su turno, juega cartas, defiende ataques, activa Expansiones, etc.
7. Cuando alguien cumple condición de victoria → Tiempo Extra (1 turno por jugador para romperlo) → ganador → GameOverScreen.

Si PeerJS falla (firewall, NAT, server caído), el host cae automático a **modo hot-seat** (todos en la misma pestaña con "Agregar jugador").

### Tests

```bash
pnpm test           # watch mode
pnpm test:run       # single run
pnpm test:coverage  # con reporte de coverage
```

### Rutas

- `/` — HomeScreen (logo, tagline, nickname, crear/unirme).
- `/tutorial` — TutorialScreen (accordion con 10 secciones).
- `/game/:gameId` — LobbyScreen + GameScreen (host vs cliente decidido por sessionStorage, fallback a hot-seat si PeerJS falla).
- `/dev` — galería de componentes (solo en desarrollo).

### Atajos de teclado en GameScreen

- `T` — terminar turno.
- `E` — abrir modal de Expansión (si medidor está al 100%).
- `L` — toggle del log de partida.
- `H` — abrir tutorial.
- `Esc` — cerrar modales en orden (expansión → log → menú de carta).

### Galería de componentes

En desarrollo, la ruta `/dev` (`http://localhost:5173/dev`) muestra todos los componentes UI en sus variants y estados, con toggle de tema en el header. La página queda fuera del build de producción (cargada vía `React.lazy` condicional a `import.meta.env.DEV`).
