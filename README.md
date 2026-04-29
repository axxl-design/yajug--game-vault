# YAJUGÁ: DOMINIO

MVP web del juego de cartas multijugador YAJUGÁ: DOMINIO. 2-4 jugadores, modo Mejorado, ciudad Sunhaven, multiplayer P2P sobre PeerJS.

> **Tagline:** Cada calle tiene dueño. Cada dueño tiene precio.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS 3 (con tokens del handoff bundle de Claude Design)
- Zustand (estado), Framer Motion (animaciones)
- PeerJS (multiplayer P2P)
- React Router 6
- Geist Sans + Inter + Geist Mono (auto-host)
- lucide-react (iconos UI)

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

## Estructura

Ver el brief técnico (`_handoff/BRIEF_CLAUDE_CODE_v2.md` sección 3) para la convención de carpetas. Resumen:

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

Ver `_handoff/BRIEF_CLAUDE_CODE_v2.md` sección 27. 13 fases secuenciales con criterios de aceptación.

**Estado actual:** Fase 3 completada (HomeScreen + LobbyScreen + TutorialScreen + routing). Pendiente verificación humana antes de pasar a Fase 4.

### Rutas

- `/` — HomeScreen (logo, tagline, nickname, crear/unirme).
- `/tutorial` — TutorialScreen (accordion con 10 secciones, copy placeholder).
- `/game/:gameId` — LobbyScreen (código compartible, lista de jugadores, empezar/cancelar).
- `/dev` — galería de componentes (solo en desarrollo).

### Galería de componentes

En desarrollo, la ruta `/dev` (`http://localhost:5173/dev`) muestra todos los componentes UI en sus variants y estados, con toggle de tema en el header. La página queda fuera del build de producción (cargada vía `React.lazy` condicional a `import.meta.env.DEV`).
