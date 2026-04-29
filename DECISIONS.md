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

## Pendiente de decidir

- Howler.js para audio (Fase 6+).
- Storybook vs página `/dev` interna para galería de componentes (Fase 2). Decisión preliminar: `/dev` interna, sin Storybook.
- ¿Tests unitarios con Vitest o Jest? Preliminar: Vitest (encaja con Vite, Fase 4).
- Fallback a `socket.io` + Railway si PeerJS NAT traversal falla (Fase 11).
