# DECISIONS.md — YAJUGÁ: DOMINIO

Registro vivo de decisiones técnicas significativas. Cada entrada lleva fecha, contexto y rationale. Se actualiza en tiempo real.

---

## Fase 1 — Setup del proyecto

### 2026-04-29 — Versiones de stack

**Contexto:** el brief pide React 18+, Vite, Tailwind 3+, Zustand, Framer Motion, PeerJS, Lucide React.

**Decisión:** versiones pinneadas con caret en `package.json`:

| Lib | Versión | Razón |
|---|---|---|
| react / react-dom | ^18.3.1 | React 18 estable. Evito React 19 para esquivar bordes con Framer Motion 11 y otras libs del ecosistema. |
| typescript | ^5.7 | TS 5 moderno. |
| vite | ^6.0 | Última major estable. |
| @vitejs/plugin-react | ^4.3 | Compatible con Vite 6. |
| tailwindcss | ^3.4 | El brief pide Tailwind 3+. Tailwind 4 cambió la sintaxis de config y el bundle del handoff usa CSS vars en formato 3.x. Quedarme en 3.4 minimiza fricción con el handoff. |
| zustand | ^5.0 | Última major. Suficiente para MVP. |
| framer-motion | ^11.18 | Última 11. Soporte sólido para React 18. |
| peerjs | ^1.5 | Estable. |
| lucide-react | ^0.469 | Última al momento del setup. |
| react-router-dom | ^6.28 | El brief pide v6 explícito. |
| @fontsource-variable/geist | ^5.2 | Geist Sans variable (100-900). Ver decisión de swap más abajo. |
| @fontsource-variable/geist-mono | ^5.2 | Geist Mono variable (100-900). |
| @fontsource/inter | ^5.2 | Inter auto-host (400/500/600/700). |
| @types/node | ^25.6 | Necesario para `node:path` y `__dirname` en `vite.config.ts`. |

**Howler.js:** queda fuera de Fase 1. El brief lo marca opcional para Fase 6 (audio). Lo agrego cuando haga falta.

### 2026-04-29 — Swap del paquete `geist` por `@fontsource-variable/geist*`

**Contexto:** el brief recomienda usar el package `geist` para Geist Sans/Mono auto-host. Al instalarlo y hacer `@import 'geist/font/sans'` en CSS, Vite explotó: el paquete `geist` (1.7) está construido exclusivamente para Next.js — sus archivos `dist/sans.js` importan `next/font/local`, no exponen CSS files que un bundler genérico pueda consumir.

**Decisión:** reemplazar `geist` por `@fontsource-variable/geist` y `@fontsource-variable/geist-mono`. Estos paquetes sí son framework-agnósticos: exponen `index.css` con `@font-face` y los archivos WOFF2 listos para que Vite los referencie y bundle.

**Implicancia:** los font-family declarados son `'Geist Variable'` y `'Geist Mono Variable'` (no `'Geist Sans'` / `'Geist Mono'` como el brief sugería). Lo anoté en `tokens.css` con un stack que prioriza el nombre real y deja los nombres "canónicos" como fallback. Para el código de aplicación da igual — todo usa `var(--font-display)` / `var(--font-mono)`.

**Verificado:** `pnpm dev` y `pnpm build` corren sin warnings de tipografía. Los WOFF2 se bundlean en `dist/assets/` con cache busting.

### 2026-04-29 — pnpm como gestor de paquetes

**Contexto:** el brief lo permite y vos confirmaste pnpm.

**Decisión:** pnpm 10.33.2 (instalado global vía npm). Lockfile: `pnpm-lock.yaml`. `packageManager` declarado en `package.json`.

### 2026-04-29 — Dark mode por `[data-theme]` en lugar de Tailwind class

**Contexto:** el brief pide "estrategia `class` de Tailwind" para dark mode. El `tokens.css` del bundle ya usa selector `[data-theme="light"]` para overridear las CSS vars semánticas.

**Decisión:** seguir la convención del bundle (`[data-theme="dark|light"]` en `<html>`) porque las CSS vars ya están atadas a ese selector. Tailwind config queda con `darkMode: ['class', '[data-theme="dark"]']` para que `dark:` siga funcionando si lo necesitamos. Como los colores semánticos viven en CSS vars, el theme switch es visualmente automático sin necesidad del prefijo `dark:` en la mayoría de los casos.

**Rule del brief:** "si hay conflicto entre lo que dice este brief y el bundle, el bundle manda" para colores y componentes visuales. Apliqué esa regla.

### 2026-04-29 — Tailwind config consume CSS vars literales

**Contexto:** el bundle define todos los tokens como CSS variables. Replicarlos como valores hex en `tailwind.config.ts` duplica la fuente de verdad y obliga a recompilar Tailwind para cambiar de tema.

**Decisión:** `tailwind.config.ts` referencia las CSS vars del bundle (`'var(--coral)'`, `'var(--bg-elev-1)'`, etc.). Los valores hex viven exclusivamente en `src/styles/tokens.css` (porte literal del `tokens.css` del bundle). Eso garantiza una sola fuente de verdad y theme-switch instantáneo.

### 2026-04-29 — Iconos: lucide-react reemplaza los inline SVG del bundle

**Contexto:** `primitives.jsx` del bundle define iconos custom inline ("Lucide icon helpers") porque el bundle es HTML estático sin dependencias. El brief pide la librería `lucide-react`.

**Decisión:** uso `lucide-react` real. Los nombres de iconos del bundle (`sun`, `moon`, `x`, `check`, `chevR`, `chevL`, `info`, `alert`, `help`, `copy`, `share`, `vol`, `volX`, `user`, `users`, `crown`, `trophy`, `clock`, `coins`, `arrowR`, `sparkles`, `shield`, `swords`, `lock`, `unlock`, `eye`, `eyeOff`, `set`, `bell`, `plus`, `search`) se mapean a los componentes equivalentes de lucide-react cuando los necesite. Si encuentro un caso donde el bundle usó un icono que Lucide no tiene exacto, pregunto antes de elegir reemplazo.

### 2026-04-29 — Material de referencia bajo `_handoff/`, fuera de git

**Contexto:** el brief, la guía maestra y el zip del handoff vivían en la raíz de la carpeta del proyecto.

**Decisión:** moví `BRIEF_CLAUDE_CODE_v2.md`, `YAJUGA_Guia_Maestra_v2.docx`, `YAJUGÁ Design-handoff.zip` y la carpeta extraída `design-handoff/` a `_handoff/`. Esa carpeta queda en `.gitignore` y nunca se publica al repo. Si necesito leer el bundle desde código (assets, ejemplos) los referencio desde ahí en local pero los assets pixel reales se copian a `src/assets/` cuando vengan.

### 2026-04-29 — Estrategia de placeholders para pixel art

**Contexto:** los assets pixel reales no existen. El usuario los genera y reemplaza después.

**Decisión:** construir un componente `<PixelPlaceholder kind="role|titular|district|action" id="..." size={...} />` (Fase 2/3) que renderiza un cuadrado con outline 1px en el color del set correspondiente y texto centrado en `font-mono` con el id del asset. Cuando lleguen los assets reales, se reemplaza el componente o se le pasa una prop `src` que tome precedencia. Eso aísla el cambio en un solo lugar.

### 2026-04-29 — TypeScript strict + paths

**Decisión:** `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. Alias `@/*` → `src/*` en `tsconfig.app.json` y `vite.config.ts`. Usar imports absolutos desde `@/` para todo lo que cruce más de 2 niveles.

---

## Fase 2 — Componentes UI base

### 2026-04-29 — Galería `/dev` interna en vez de Storybook

**Contexto:** la sección 27 del brief deja la galería como opcional. Para un MVP con superficie chica, Storybook sería overkill (config, deps extra, ritual de stories).

**Decisión:** ruta `/dev` interna que renderiza todos los componentes en sus estados, montada solo en desarrollo (`import.meta.env.DEV`). En `App.tsx` el componente se carga vía `React.lazy` condicional — en build de prod la condición queda en `false` y Rollup tree-shakea el módulo. Verificado: `grep "galería\|DevScreen" dist/assets/index-*.js` da 0 matches.

### 2026-04-29 — `prefsStore` con `zustand/middleware/persist`

**Contexto:** el toggle de tema y el último nickname tienen que persistir entre sesiones (sección 25 del brief). Hacerlo con `localStorage` directo y refactorizar después es churn innecesario.

**Decisión:** `src/stores/prefsStore.ts` con shape mínimo (`theme: 'light'|'dark'`, `lastNickname: string`, `hasSeenOnboarding: boolean`) + setters dedicados + `toggleTheme`. Persistencia automática con `persist({ name: 'yajuga-prefs', version: 1 })`. Default `theme: 'dark'` alineado con el brief. Campos futuros (sound, density) quedan listados como comentario para descomentar cuando hagan falta.

### 2026-04-29 — Aplicar tema vía `data-theme` en `<html>` desde un hook

**Contexto:** los tokens semánticos están atados a `[data-theme="light"]` (decisión Fase 1). Necesito un punto de aplicación que escuche el store y mantenga el atributo sincronizado.

**Decisión:** `src/hooks/useApplyTheme.ts` se llama una sola vez en `App.tsx` y escribe `document.documentElement.setAttribute('data-theme', theme)` cada vez que cambia. Sin código de bootstrap en `main.tsx` para evitar flash en doble lectura.

### 2026-04-29 — Variants de Button consumen brand colors literales (no semantic)

**Contexto:** la sección 16 del brief especifica las 4 variants con colores fijos: PRIMARY=coral/bone, SECONDARY=bone/ink, DANGER=coral-700/bone, GHOST=transparent. Hay tentación de "tematizar" SECONDARY para que en dark mode use surface en lugar de bone (más legible visualmente), pero eso desviaría del brief.

**Decisión:** seguir el brief literalmente. SECONDARY es bone-sobre-cualquier-fondo intencionalmente — es un botón de "salir/cancelar" pensado para destacar contra dark mode con su contraste alto. Hover/active resueltos con `brightness-95`/`brightness-90` para no inventar tokens nuevos. Focus ring usa `outline-amber` (el "mustard" del brief mapea a nuestro token `amber`).

### 2026-04-29 — Toast con context provider + hook (no global singleton)

**Contexto:** la sección 18 del brief pide toasts disparables desde cualquier lugar. Dos caminos: (a) singleton global tipo `toast.success(...)` con instancia mutable a nivel módulo, (b) Context Provider + `useToast()` hook.

**Decisión:** Context Provider en `App.tsx` con `useToast()` hook. Razón: deja los toasts atados al árbol de React (re-renders, clean-up de timers en unmount) y evita estado global mutable que rompería Strict Mode. El callsite queda casi igual: `const toast = useToast(); toast.success("…")`. Auto-dismiss 4s, click para cerrar antes, stack vertical en `bottom-6 right-6` con animación de slide+fade desde la derecha (más nuevo arriba). Cuatro tipos con icono Lucide cada uno.

### 2026-04-29 — Tooltip con portal + smart positioning ligero

**Contexto:** los tooltips tienen que aparecer encima de cualquier capa (cartas, modales con z bajo) y no quedar clipped por overflow. El brief pide delay 800ms, fade 150ms, smart positioning.

**Decisión:** render via `createPortal` a `document.body`. Posicionamiento `fixed` calculado a partir de `getBoundingClientRect` del trigger, con `transform: translate(-50%, -100%)` (etc. según side) para anclar sin medir el tooltip. Smart positioning = "flip si el lado preferido tiene menos de 48px hasta el borde", más clamp horizontal/vertical de 8px de padding. No es full Floating UI pero cubre el 95% de casos del MVP. Cierra automático en scroll/resize para evitar quedar desalineado.

### 2026-04-29 — `cn` util casero, sin clsx ni tailwind-merge

**Contexto:** componer clases Tailwind condicionales necesita un join helper. Las opciones populares son `clsx` + `tailwind-merge`.

**Decisión:** `src/utils/cn.ts` con `(...parts) => parts.filter(Boolean).join(' ')` — 3 líneas, cero deps. No hay merge de clases conflictivas (Tailwind última-gana funciona porque la regla de specificity en CSS lo resuelve), y para casos donde sí hace falta override explícito, paso `className` al final del cn() y listo. Si en una fase futura aparecen casos donde el merge inteligente importa, se evalúa sumar `tailwind-merge` (4kb gzip) entonces.

---

## Fase 3 — Pantallas básicas

### 2026-04-29 — Códigos de partida de 6 chars con alfabeto sin O/0/I/1

**Contexto:** la URL `/game/:gameId` necesita un identificador shareable. Los UUID v4 son largos y feos para dictar por voz o WhatsApp. Tampoco quiero generar números enteros porque colisiones son más probables y no se ve "premium".

**Decisión:** `src/utils/gameCode.ts` genera códigos de 6 chars del alfabeto `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (32 chars, sin O/0/I/1 para evitar confusiones al compartir verbalmente). Son `32^6 ≈ 1B` combinaciones — colisión despreciable para un MVP. La función `normalizeGameCode` limpia input pegado (uppercase + filtra chars inválidos) y `isValidGameCode` valida formato. El generador usa `crypto.getRandomValues` (no `Math.random`) por costumbre, no porque sea security-sensitive.

### 2026-04-29 — Lobby hardcodea host + 1 mock peer en Fase 3

**Contexto:** Phase 3 pide jugadores hardcoded para validar el layout antes de tener PeerJS funcionando. Necesitaba decidir cuántos jugadores y en qué estados.

**Decisión:** dos jugadores conectados (el local con su nickname de prefsStore, marcado como host con la corona; un mock "Invitado") + 2 slots vacíos animados (pulse). `isHost = true` hardcoded — la rama no-host del UI quedó codeada pero no es alcanzable por ahora. Esto deja "EMPEZAR PARTIDA" habilitado (canStart requiere ≥2 conectados) y muestra el banner de código real, suficiente para QA visual del flujo del host. Fase 11 reemplaza el array por `lobbyStore` real con peers conectados.

### 2026-04-29 — "Empezar partida" muestra toast informativo en Fase 3

**Contexto:** el botón "EMPEZAR PARTIDA" tiene comportamiento detallado en sec 15.2 (assignRolesAndExpansions, transición de phase, etc.) pero ese código vive en Fase 4-5.

**Decisión:** en Fase 3 el click muestra `toast.info('Inicio de partida queda para Fase 4-5 (lógica de juego).')`. Razón: dejar el botón clickeable + dar feedback explícito de que el control funciona y la lógica de gameplay todavía no, en lugar de un click silencioso o un botón muerto. Cuando llegue Fase 4-5 se reemplaza por el handler real.

### 2026-04-29 — `/game/:gameId` valida formato y muestra error explícito

**Contexto:** un usuario tipea `/game/foo` o llega con un código mal pegado. Sin guarda, la sala renderiza con un código basura mostrado como banner.

**Decisión:** `LobbyScreen` valida `isValidGameCode(gameId)` arriba de todo y, si falla, renderiza un `<InvalidCode>` con icono + explicación + botón "Volver al inicio". Sin redirect automático — el redirect borra contexto sin avisarle al usuario qué pasó.

### 2026-04-29 — Tagline typewriter + logo respiración respetan `prefers-reduced-motion`

**Contexto:** sec 17 del brief pide respetar reduced-motion. La HomeScreen tiene 2 animaciones potencialmente molestas: typewriter del tagline y "respiración" del logo (scale 1↔1.02 cada 4s, infinita).

**Decisión:** uso `useReducedMotion()` de framer-motion en ambas. Si es true: typewriter muestra el texto completo de inmediato y el logo se renderiza sin la animación de scale. Las animaciones de stagger de los botones (entrada one-shot de 320ms) las dejo activas — son cortas y no repiten.

### 2026-04-29 — JoinModal con input de código separado, no `<NicknameInput>`

**Contexto:** podría reusar `NicknameInput` para el código de partida, pero el código tiene reglas distintas: alfabeto restringido, uppercase forzado, exactamente 6 chars, font-mono visualmente espaciada para que se lea claro.

**Decisión:** `JoinModal` usa un `<input>` propio inline, con normalización al tipear (`normalizeGameCode` rechaza chars inválidos al vuelo, no espera al submit) y display en font-mono con `tracking-[0.3em]`. No vale extraer un `<TextInput>` genérico todavía — sólo lo necesitamos en este lugar.

### 2026-04-29 — Tutorial accordion con uno-abierto-a-la-vez (no múltiple)

**Contexto:** el accordion del tutorial tiene 10 secciones. Dos opciones UX: (a) varias abiertas simultáneamente, (b) sólo una a la vez con auto-cierre del resto.

**Decisión:** uno a la vez. Razón: 10 secciones + scroll vertical + leer cada una requiere foco; tener varias abiertas alarga la lista y obliga al usuario a decidir cuál cerrar. La primera arranca abierta (`useState(0)`) para que la pantalla no se vea vacía. Animación de altura con framer-motion (`height: auto` ↔ `height: 0`, 220ms ease-out-expo).

---

## Fase 3.5 — Refinamiento de paleta (brief v3)

### 2026-04-29 — v3 brief: paleta refinada, nuevo acento violet para momentos cinematográficos

**Contexto:** el brief técnico se actualizó a v3 (`_handoff/BRIEF_CLAUDE_CODE_v3.md`, la v2 quedó archivada). El cambio relevante para implementación es la paleta de acentos. Ink, bone, grises y set colors no cambian.

**Decisión:** actualizar `src/styles/tokens.css` con los nuevos valores HEX y agregar la familia violet completa. Como toda la app consume las CSS vars (decisión Fase 1), los componentes existentes no se tocan — el cambio se propaga solo.

**Valores actualizados:**

| Token | v2 | v3 | Notas |
|---|---|---|---|
| `--coral` | `#E54B2C` | `#FF5722` | Más cálido y vivo. |
| `--coral-700` | `#C13D22` | `#D9421C` | Re-derivado para mantener proporción de luminancia con el nuevo base. |
| `--coral-300` | `#F08068` | `#FF8266` | Idem, hover más peachy. |
| `--amber` | `#D4A52A` | `#FFB627` | Más saturado, más dorado. |
| `--amber-700` | `#A8821C` | `#D69416` | Re-derivado. |

**Variantes nuevas — familia violet (v3):**

| Token | Valor | Uso permitido |
|---|---|---|
| `--violet` | `#7A5FFF` | Base. Cinematic moments only. |
| `--violet-hover` | `#9683FF` | Hover en CTAs cinematográficos (futuro modal de Expansión). |
| `--violet-active` | `#5C45D9` | Pressed state. |
| `--violet-dark` | `#4A35B8` | Bordes y sombras profundas. |
| `--violet-light` | `#C7B8FF` | Halos, glows, fondos a baja opacidad. |

**Restricción de uso del violet:** explícita en el brief y comentada en `tokens.css` y `tailwind.config.ts` — NO se usa en HomeScreen, Lobby, Tutorial ni UI cotidiana. Reservado exclusivamente para:
- Activación de Expansión de Dominio (sec 13).
- Halo del medidor cuando llega a 100%.
- Banner de Tiempo Extra (sec 14).

**Las variantes derivadas (coral-700, coral-300, amber-700, todas las violet*) las elegí yo a partir del HEX base que dio el brief v3.** El brief sólo especifica los 3 valores base. Si alguno de los hover/active/light se ve raro en QA, son los primeros candidatos a ajustar — los HEX base no se tocan sin cambiar el brief.

**Verificado:** `pnpm typecheck` y `pnpm build` pasan limpio. `grep -rn "violet" src/` solo aparece en `tokens.css` (cero usos en componentes), tal como pide la consigna.

---

## Pendiente de decidir

- Howler.js para audio (Fase 6+).
- ¿Tests unitarios con Vitest o Jest? Preliminar: Vitest (encaja con Vite, Fase 4).
- Fallback a `socket.io` + Railway si PeerJS NAT traversal falla (Fase 11).
