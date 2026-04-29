# BRIEF TÉCNICO EXHAUSTIVO — YAJUGÁ: DOMINIO (MVP web)

**Versión:** 3.0 — Paleta refinada
**Destinatario:** Claude Code
**Propósito:** este documento es la especificación técnico-funcional completa para construir el MVP web de YAJUGÁ: DOMINIO. Es la fuente única de verdad técnica. Si algo no está acá, preguntá antes de inventarlo.

**Cambios respecto a v2:** ajuste de paleta de acentos. Coral pasa de `#E54B2C` a `#FF5722` (más cálido, más vivo). Ámbar pasa de `#D4A52A` a `#FFB627` (más saturado, más dorado). Se agrega un nuevo acento violeta `#7A5FFF` reservado exclusivamente para momentos cinematográficos del juego (Expansiones de Dominio activadas, halos de carga, banners de Tiempo Extra). Negro tinta, blanco hueso y grises permanecen iguales. El sistema visual general no cambia — sigue siendo minimalismo épico contemporáneo con pixel art solo en contenido temático del juego.

**Cambios respecto a v1:** dirección visual completamente actualizada. Tipografía pixel art eliminada. Tipografías modernas (Geist + Inter). Iconos Lucide React. Pixel art reservado solo para contenido temático del juego (retratos de roles, ilustraciones de Titulares y propiedades). UI completamente moderna y minimalista. Sin emojis.

---

## CÓMO USAR ESTE DOCUMENTO

1. **Leelo entero antes de empezar a construir.** No saltees secciones — la lógica condicional y los edge cases están distribuidos.
2. **Implementá por fases** según el plan al final del documento. No saltees fases.
3. **Cuando termines cada fase, pausá y verificá criterios de aceptación.** No avances si la fase anterior tiene bugs conocidos.
4. **Si algo es ambiguo, preguntá.** Es mejor pausar 30 segundos que asumir mal y construir 2 horas en la dirección equivocada.
5. **Documentá las decisiones técnicas que tomes** en un archivo `DECISIONS.md` en la raíz del proyecto.

---

## 1. CONTEXTO DEL PROYECTO

YAJUGÁ: DOMINIO es un juego de cartas digital multijugador (2-4 jugadores) inspirado en Monopoly Deal pero con mecánicas y narrativa originales. La marca paraguas es YAJUGÁ. Este es el primer juego de la plataforma.

**Estado actual:** existe una **Guía Maestra del proyecto** (documento Word separado) que define toda la dimensión conceptual. Existe también un **handoff bundle de Claude Design** (archivo `.tar`) que contiene el sistema de diseño visual. Si hay conflicto entre la guía y este brief, **este brief manda**.

**Objetivo del MVP:** validar la mecánica del juego con amigos lo antes posible. NO es el producto final. NO incluye monetización, perfiles, ranking, modos extra, ni segundo mapa.

---

## 2. STACK TÉCNICO

### Stack recomendado

- **Framework:** React 18+ con TypeScript.
- **Bundler:** Vite.
- **Estilos:** Tailwind CSS 3+ con configuración custom basada en design tokens del bundle.
- **Estado:** Zustand.
- **Animaciones:** Framer Motion.
- **Multijugador:** PeerJS (peer-to-peer sobre WebRTC). Si NAT traversal es problemático, fallback a `socket.io` deployado en Railway.
- **Persistencia local:** localStorage solo para preferencias (modo oscuro, último nickname). NO para estado de partida.
- **Routing:** React Router v6.
- **Iconos UI:** **Lucide React** (line icons modernos). Para iconos del juego (en cartas) usar assets pixel art del bundle.
- **Tipografías:** auto-host de Geist Sans, Inter, Geist Mono via @fontsource o archivos directos en `/public/fonts/`.
- **Audio (opcional):** Howler.js si se incluyen efectos.

### Lo que NO usar

- NO Next.js (innecesario para SPA).
- NO Redux (overkill).
- NO styled-components (Tailwind es mejor para este caso).
- NO fuentes desde CDN externos (auto-host).
- NO localStorage para estado de partida.
- NO emojis en ningún lugar de la UI.

### Versiones mínimas

- Node.js 20+
- npm 10+ (o pnpm 8+).

---

## 3. ARQUITECTURA DE CARPETAS

```
yajuga-dominio/
├── public/
│   ├── fonts/                    # Geist Sans, Inter, Geist Mono auto-hosted
│   ├── audio/                    # Efectos de sonido (opcional)
│   └── favicon.ico
├── src/
│   ├── assets/                   # Pixel art del bundle
│   │   ├── cards/                # Ilustraciones de cartas
│   │   ├── roles/                # Retratos pixel de los 6 roles
│   │   ├── titulares/            # Ilustraciones pixel de los 8 Titulares
│   │   ├── districts/            # Ilustraciones pixel de distritos de Sunhaven
│   │   └── icons-game/           # Iconos pixel para acciones (en cartas)
│   ├── components/
│   │   ├── ui/                   # Componentes base modernos (Button, Modal, Tooltip, etc.)
│   │   ├── card/                 # Componentes de cartas (con pixel art adentro)
│   │   ├── game/                 # Componentes específicos de partida
│   │   ├── lobby/                # Componentes de lobby
│   │   └── tutorial/             # Componentes del tutorial
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── LobbyScreen.tsx
│   │   ├── GameScreen.tsx
│   │   ├── GameOverScreen.tsx
│   │   └── TutorialScreen.tsx
│   ├── game/                     # Lógica pura sin React
│   │   ├── deck.ts
│   │   ├── cards.ts
│   │   ├── rules.ts
│   │   ├── actions.ts
│   │   ├── roles.ts
│   │   ├── expansions.ts
│   │   ├── titulares.ts
│   │   └── turn.ts
│   ├── stores/
│   │   ├── gameStore.ts
│   │   ├── lobbyStore.ts
│   │   └── prefsStore.ts
│   ├── multiplayer/
│   │   ├── peer.ts
│   │   ├── sync.ts
│   │   └── messages.ts
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── DECISIONS.md
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── .gitignore
```

**Principio:** la lógica de juego pura vive en `src/game/` sin dependencias de React. Eso facilita testing y permite reutilizar la lógica si en el futuro se hace versión móvil nativa.

---

## 4. SISTEMA DE DISEÑO Y DESIGN TOKENS

### Origen y prioridad

El sistema de diseño viene del handoff bundle de Claude Design. **Si hay conflicto entre lo que dice este brief y el bundle, el bundle manda** para colores, espaciados y componentes visuales. Este brief da fallbacks por si el bundle está incompleto.

### Principio fundamental: separación entre UI y contenido

- **UI (botones, navegación, settings, toggles, tooltips, modales, layout):** moderna, limpia, minimalista. **CERO pixel art.** Tipografía contemporánea. Iconos line modernos (Lucide).
- **Contenido del juego (cartas, retratos de roles, ilustraciones temáticas):** pixel art deliberado y autoral. Es el corazón visual del juego.

Esa separación es la clave. El pixel art destaca porque está rodeado de UI moderna y limpia.

### Paleta YAJUGÁ (fallback si el bundle no la incluye)

```ts
// src/styles/tokens.ts
export const colors = {
  // Marca
  ink: '#0E0E0E',         // Negro tinta - fondos modo oscuro, texto modo claro
  bone: '#F8F5EE',        // Blanco hueso - fondos modo claro, texto modo oscuro
  coral: '#FF5722',       // Acento principal - usar con moderación
  amber: '#FFB627',       // Acento premium - momentos especiales
  violet: '#7A5FFF',      // Acento cinematográfico - Expansiones de Dominio (NUEVO en v3)
  charcoal: '#2A2A28',    // Gris carbón - paneles modo oscuro
  fog: '#ADA89E',         // Gris niebla - texto secundario, divisores

  // Estados
  success: '#3D8B5A',
  warning: '#FFB627',
  danger: '#FF5722',
  info: '#5B7AB0',

  // Variaciones
  inkLight: '#1A1A1A',
  boneDark: '#E8E4DA',
  coralDark: '#C8410D',
  amberDark: '#D89008',
  violetDark: '#5840D9',
  violetLight: '#9B85FF',
};
```

### Reglas de uso de la paleta

- **Coral**: color de marca. Aparece en botones primarios, indicadores críticos, acentos importantes. **NO** se usa para fondos amplios ni decoración.
- **Ámbar**: reservado para elementos premium: medallas, indicador de Expansión cargada al 100%, momentos cinematográficos comunes.
- **Violeta**: NUEVO. Reservado exclusivamente para momentos cinematográficos del juego — específicamente: animación de activación de Expansión de Dominio, indicador de medidor de Expansión cuando llega a 100%, halo de carga de Expansión, banner de Tiempo Extra. Es el color "wow" del juego, no se usa para UI cotidiana.
- **Grises**: sostienen la jerarquía visual.
- Mucho espacio en `bone` (modo claro) o `ink` (modo oscuro).

### Tipografía

```ts
// tailwind.config.ts
fontFamily: {
  display: ['Geist Sans', 'system-ui', 'sans-serif'],
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['Geist Mono', 'ui-monospace', 'monospace'],
},
```

**Configuración de fuentes:**

```css
/* globals.css */
@font-face {
  font-family: 'Geist Sans';
  src: url('/fonts/Geist-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'Geist Sans';
  src: url('/fonts/Geist-Medium.woff2') format('woff2');
  font-weight: 500;
  font-display: swap;
}
@font-face {
  font-family: 'Geist Sans';
  src: url('/fonts/Geist-SemiBold.woff2') format('woff2');
  font-weight: 600;
  font-display: swap;
}
@font-face {
  font-family: 'Geist Sans';
  src: url('/fonts/Geist-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}

/* Inter via @fontsource/inter */

@font-face {
  font-family: 'Geist Mono';
  src: url('/fonts/GeistMono-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
```

**Reglas de uso tipográfico:**

- **font-display (Geist Sans):** logo, títulos de pantalla, nombres de cartas, headers de modal.
- **font-sans (Inter):** texto de descripción, párrafos, tooltips, labels, contenido general.
- **font-mono (Geist Mono):** valores numéricos en cartas, contadores, timers, debug.

**Ningún texto debe ser pixel art.** Toda la tipografía es moderna, limpia, contemporánea.

### Iconos

- **Iconos UI:** Lucide React, peso 1.5-2px stroke, tamaño base 20px. Para todo: botones, navegación, settings, toggles, indicadores de estado.
- **Iconos del juego:** pixel art custom dentro de las cartas. NO confundir con iconos UI. Son contenido temático.

**Sin emojis en ningún lugar de la aplicación.**

### Escala de espaciado

Tailwind default. Para alineación con elementos pixel art, usar múltiplos de 4 cuando sea relevante.

### Border radius

- **UI estructural** (botones, cards de UI, inputs): 4-8px. Mantener sobriedad.
- **Cartas del juego** (Card component): 12-16px. Diferenciarlas como objetos.
- **Modales:** 12px.
- **Avatares circulares:** full (rounded-full).

### Sombras

Mínimas. Usar `shadow-sm` o `shadow-md` cuando sea estrictamente necesario. Para modales, usar `shadow-2xl` con opacidad reducida. Evitar sombras pesadas tipo Material Design.

### Animaciones — duraciones estándar

```ts
export const durations = {
  instant: 80,        // Hover feedback
  fast: 150,          // Click feedback, button states
  base: 250,          // Modals, transiciones de pantalla
  slow: 400,          // Cartas siendo jugadas
  cinematic: 1500,    // Activación de Expansión de Dominio
  dramatic: 800,      // Tiempo Extra
};
```

### Easings

```ts
export const easings = {
  out: [0.16, 1, 0.3, 1],         // ease-out-expo - default para entradas
  in: [0.7, 0, 0.84, 0],           // ease-in-expo - para salidas
  inOut: [0.83, 0, 0.17, 1],       // ease-in-out-expo - transiciones
  bouncy: [0.68, -0.55, 0.265, 1.55], // back - para elementos lúdicos
};
```

### Modo oscuro / modo claro

**Default: modo oscuro.**

- Modo oscuro: `bg-ink`, superficies en `charcoal`, texto en `bone`.
- Modo claro: `bg-bone`, superficies en `white`, texto en `ink`.

Implementar con estrategia `class` de Tailwind. Toggle visible en el header con icono Sun/Moon (Lucide). Persistir en localStorage.

### Pixel art — especificaciones

Aparece SOLO en:
- Retratos de los 6 roles (64x64 o 96x96 px).
- Ilustraciones de las 8 cartas de Titulares.
- Ilustraciones temáticas en cartas de propiedades.
- Iconos pequeños DENTRO de cartas de acción (NO como UI).

Reglas:
- Outline 1px en `ink` (#0E0E0E).
- Cel-shading 2 tonos máximo.
- Hue-shifting en sombras.
- Cero anti-aliasing.
- Paleta restringida a 4-6 colores de la paleta de marca por ilustración.

### Pixel art — dónde NO aparece

- Tipografía (cero excepciones).
- Iconos de UI.
- Bordes y elementos estructurales.
- Logo.
- Modales, tooltips, toasts.
- Layout y grids.

### Logo

- Tipografía: Geist Sans, peso Bold (700), letter-spacing levemente abierto.
- Tilde sobre la Á: presente, parte distintiva.
- Color: `ink` (modo claro) / `bone` (modo oscuro). `coral` solo cuando la composición lo requiera.
- Versión completa: "YAJUGÁ" grande + "DOMINIO" debajo (más pequeño, peso medium).
- Versión reducida: solo "YAJUGÁ" o solo "Y" estilizada.

---

## 5. MODELO DE DATOS

### Tipos base

```ts
// src/types/game.ts

export type CardColor =
  | 'rojo' | 'naranja' | 'amarillo' | 'verde' | 'turquesa'
  | 'azul' | 'morado' | 'rosa' | 'marron' | 'gris' | 'comodin';

export type CardType =
  | 'property'
  | 'money'
  | 'action'
  | 'rent'
  | 'building'
  | 'wildcard'
  | 'event';

export type ActionCardName =
  | 'bloqueo' | 'confiscacion' | 'trato_sucio' | 'trueque_forzado'
  | 'factura' | 'cuota' | 'movida_extra' | 'sobrecargo'
  | 'edificio' | 'torre';

export interface Card {
  id: string;
  type: CardType;
  name: string;
  description?: string;
  value: number;
  color?: CardColor;
  colors?: CardColor[];
  actionName?: ActionCardName;
  imageKey: string;  // Para asset pixel art
}

export type RoleId =
  | 'abogado' | 'corredor' | 'estafador'
  | 'banquero' | 'coleccionista' | 'arquitecto';

export type ExpansionId =
  | 'tribunal_dominio' | 'inmunidad_diplomatica'
  | 'subasta_siglo' | 'pacto_comercial'
  | 'el_truco' | 'doble_identidad'
  | 'auditoria_forzada' | 'prestamo_forzado'
  | 'trueque_imperial' | 'camara_archivo'
  | 'rascacielos' | 'reordenamiento_urbano';

export interface Role {
  id: RoleId;
  name: string;
  description: string;
  passiveAbility: string;
  expansions: [ExpansionId, ExpansionId];
  imageKey: string;  // Asset pixel del retrato
}

export interface Expansion {
  id: ExpansionId;
  roleId: RoleId;
  name: string;
  description: string;
  chargeCondition: string;
  chargeRule: ChargeRule;
  effect: string;
  exitCost: string;
  duration: 'one_round' | 'instant';
}

export interface ChargeRule {
  trigger: 'attacked' | 'rent_collected' | 'card_discarded'
         | 'money_received' | 'property_added' | 'building_played';
  amount: number;
}

export interface Player {
  id: string;
  nickname: string;
  role: RoleId;
  expansion: ExpansionId;
  expansionCharge: number;       // 0-100
  expansionUsed: boolean;
  passiveUsed: boolean;
  hand: Card[];
  bank: Card[];
  sets: PropertySet[];
  hasFinishedTurn: boolean;
  isConnected: boolean;
  hasPlayedCardsThisTurn: number;  // 0-3
  effects: ActiveEffect[];
}

export interface PropertySet {
  color: CardColor;
  properties: Card[];
  buildings: Card[];
  isComplete: boolean;
  requiredCount: number;
  isMonument: boolean;
}

export interface ActiveEffect {
  id: string;
  type: 'inmunidad' | 'pacto_comercial' | 'doble_identidad'
      | 'prestamo_forzado' | 'audit_freeze' | 'rentas_canceladas'
      | 'rentas_dobles' | 'rentas_triples' | 'mano_publica';
  sourcePlayerId: string;
  durationRounds: number;
  data?: any;
}

export type GamePhase =
  | 'lobby' | 'role_assignment' | 'playing'
  | 'defense_pending' | 'expansion_active'
  | 'tiempo_extra' | 'titular_active' | 'game_over';

export interface GameState {
  gameId: string;
  hostId: string;
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  turnsPlayed: number;
  deck: Card[];
  discardPile: Card[];
  marketCards: Card[];
  marketDeck: Card[];
  titularDeck: Card[];
  activeTitular: Card | null;
  pendingDefense: PendingDefense | null;
  activeExpansion: ActiveExpansion | null;
  tiempoExtraState: TiempoExtraState | null;
  winner: string | null;
  log: GameLogEntry[];
  prefs: GamePreferences;
}

export interface PendingDefense {
  attackerId: string;
  defenderId: string;
  cardPlayed: Card;
  context: any;
  timeoutAt: number;
}

export interface ActiveExpansion {
  playerId: string;
  expansionId: ExpansionId;
  state: any;
  endsAtTurn: number;
}

export interface TiempoExtraState {
  triggeringPlayerId: string;
  remainingPlayers: string[];
  turnsRemaining: number;
}

export interface GameLogEntry {
  timestamp: number;
  type: string;
  playerId?: string;
  data: any;
  humanReadable: string;
}

export interface GamePreferences {
  enableTitulares: boolean;
  enableSounds: boolean;
  enableAnimations: boolean;
}
```

### Constantes

```ts
// src/game/constants.ts

export const GAME_CONFIG = {
  STARTING_HAND_SIZE: 5,
  CARDS_DRAWN_PER_TURN: 2,
  CARDS_DRAWN_IF_EMPTY_HAND: 5,
  MAX_HAND_SIZE: 7,
  MAX_PLAYS_PER_TURN: 3,
  SETS_NEEDED_TO_WIN: 3,
  DEFENSE_TIMEOUT_MS: 8000,
  MARKET_SIZE: 3,
  TITULAR_INTERVAL: 5,
  MAX_PLAYERS: 4,
  MIN_PLAYERS: 2,
};

export const PROPERTY_REQUIREMENTS: Record<CardColor, number> = {
  rojo: 3, naranja: 3, amarillo: 3, verde: 3, turquesa: 3,
  azul: 2, morado: 3, rosa: 3, marron: 2, gris: 4, comodin: 0,
};

export const PROPERTY_RENT_VALUES: Record<CardColor, number[]> = {
  rojo: [3, 6, 8], naranja: [1, 3, 5], amarillo: [2, 4, 6],
  verde: [2, 4, 7], turquesa: [1, 2, 3], azul: [3, 8],
  morado: [1, 2, 4], rosa: [1, 2, 3], marron: [1, 2],
  gris: [1, 2, 3, 4], comodin: [],
};
```

---

# BRIEF TÉCNICO EXHAUSTIVO — YAJUGÁ: DOMINIO (MVP web)

**Versión:** 2.0 (dirección visual revisada)
**Destinatario:** Claude Code
**Propósito:** este documento es la especificación técnico-funcional completa para construir el MVP web de YAJUGÁ: DOMINIO. Es la fuente única de verdad técnica. Si algo no está acá, preguntá antes de inventarlo.

---

## CÓMO USAR ESTE DOCUMENTO

1. **Leelo entero antes de empezar a construir.** No saltees secciones — la lógica condicional y los edge cases están distribuidos.
2. **Implementá por fases** según el plan al final del documento. No saltees fases.
3. **Cuando termines cada fase, pausá y verificá criterios de aceptación.** No avances si la fase anterior tiene bugs conocidos.
4. **Si algo es ambiguo, preguntá.** Es mejor pausar 30 segundos que asumir mal y construir 2 horas en la dirección equivocada.
5. **Documentá las decisiones técnicas que tomes** en un archivo `DECISIONS.md` en la raíz del proyecto.

---

## 1. CONTEXTO DEL PROYECTO

YAJUGÁ: DOMINIO es un juego de cartas digital multijugador (2-4 jugadores) inspirado en Monopoly Deal pero con mecánicas y narrativa originales. La marca paraguas es YAJUGÁ. Este es el primer juego de la plataforma.

**Estado actual:** existe una **Guía Maestra del proyecto** (documento Word separado) que define toda la dimensión conceptual: marca, universo, mecánica, modos, roles, expansiones, identidad visual. Este brief técnico se basa en esa guía y la traduce a especificaciones implementables. Si hay conflicto entre la guía y este brief, **este brief manda** porque está más cercano a la implementación.

**Existe también un handoff bundle de Claude Design** (archivo `.tar`) que contiene el sistema de diseño visual (colores, tipografías, componentes UI, mockups). El sistema de diseño de ese bundle es **autoritativo para la capa visual**. Este brief especifica la lógica funcional, la guía visual viene del bundle.

**Objetivo del MVP:** validar la mecánica del juego con amigos lo antes posible. NO es el producto final. NO incluye monetización, perfiles, ranking, modos extra, ni segundo mapa. Es la versión más reducida posible que es jugable de inicio a fin.

---

## 2. STACK TÉCNICO

### Stack recomendado y justificación

- **Framework frontend:** React 18+ con TypeScript. Razón: ecosistema maduro, fácil de mantener, Claude Design exporta componentes React por default.
- **Bundler:** Vite. Razón: muy rápido en desarrollo, excelente DX, build de producción optimizado.
- **Estilos:** Tailwind CSS 3+ con configuración custom basada en los design tokens del bundle. Razón: rápido para iterar, encaja con el flujo de Claude Design, fácil de mantener responsive.
- **Estado del juego:** Zustand. Razón: es más simple que Redux, suficiente para el alcance del MVP, fácil de razonar.
- **Animaciones:** Framer Motion. Razón: animaciones declarativas, excelente para transiciones de cartas, soportado por React.
- **Multijugador:** PeerJS (peer-to-peer sobre WebRTC) para el MVP. Razón: no requiere servidor backend, deploy en Vercel sin complicaciones, suficiente para 2-4 jugadores. **Si esto presenta limitaciones (ej: NAT traversal poco confiable), evaluar fallback a un backend WebSocket simple con `socket.io` deployado en Railway.** Documentar la decisión en DECISIONS.md.
- **Persistencia local:** localStorage para preferencias (modo oscuro, último nickname, sonido on/off). NO usar localStorage para estado de partida — todo el estado de partida vive en memoria.
- **Routing:** React Router v6 si se necesitan rutas (lobby, sala, partida, fin). Mantener las rutas mínimas.
- **Iconos UI:** **Lucide React** para todos los iconos de interfaz (botones, navegación, settings, toggles). Sin emojis bajo ningún concepto.
- **Iconos pixel del juego:** assets pixel art del bundle, usados solo dentro de cartas y elementos temáticos del juego.
- **Fuentes:** **Geist Sans** + **Inter** + **Geist Mono**. Auto-host las tres usando los packages npm `geist` y `@fontsource/inter`. NO usar Google Fonts CDN para evitar layout shift y dependencias externas.
- **Audio (opcional):** Howler.js si se incluyen efectos de sonido. Audio es opcional en el MVP — se puede dejar para fase 6.

### Lo que NO usar

- NO usar Next.js para el MVP — innecesario para una SPA simple.
- NO usar Redux — overkill.
- NO usar styled-components — peor DX que Tailwind para este caso.
- **NO usar tipografías pixel art bajo ningún concepto.** La identidad visual es minimalista contemporánea, no retro.
- **NO usar emojis en ningún elemento de UI.** Iconos vienen de Lucide React.
- NO usar fuentes desde CDN para tipografías custom.
- NO usar localStorage para estado de partida.
- NO crear un backend completo si PeerJS funciona — agrega complejidad innecesaria.

### Versiones mínimas

- Node.js 20+
- npm 10+ (o pnpm 8+, si preferís)

---

## 3. ARQUITECTURA DE CARPETAS

```
yajuga-dominio/
├── public/
│   ├── audio/                    # Efectos de sonido (opcional)
│   └── favicon.ico
├── src/
│   ├── assets/                   # Imágenes pixel art del bundle
│   │   ├── cards/                # Ilustraciones de cartas
│   │   ├── roles/                # Retratos pixel de los 6 roles
│   │   ├── titulares/            # Ilustraciones pixel de los 8 Titulares
│   │   ├── districts/            # Iconos pixel de distritos
│   │   └── action-icons/         # Iconos pixel de cartas de acción
│   ├── components/
│   │   ├── ui/                   # Componentes base (Button, Modal, Toast, Tooltip)
│   │   ├── card/                 # Componentes de cartas del juego
│   │   ├── game/                 # Componentes específicos de partida
│   │   ├── lobby/                # Componentes de lobby
│   │   └── tutorial/             # Componentes del tutorial
│   ├── screens/                  # Pantallas completas
│   │   ├── HomeScreen.tsx
│   │   ├── LobbyScreen.tsx
│   │   ├── GameScreen.tsx
│   │   ├── GameOverScreen.tsx
│   │   └── TutorialScreen.tsx
│   ├── game/                     # Lógica de juego pura (sin React)
│   │   ├── deck.ts               # Construcción del mazo
│   │   ├── cards.ts              # Definición de todas las cartas
│   │   ├── rules.ts              # Reglas y validaciones
│   │   ├── actions.ts            # Acciones del juego
│   │   ├── roles.ts              # Definición de los 6 roles
│   │   ├── expansions.ts         # Las 12 Expansiones de Dominio
│   │   ├── titulares.ts          # Los 8 Titulares
│   │   └── turn.ts               # Lógica de turnos
│   ├── stores/                   # Zustand stores
│   │   ├── gameStore.ts          # Estado de la partida
│   │   ├── lobbyStore.ts         # Estado del lobby
│   │   └── prefsStore.ts         # Preferencias del usuario
│   ├── multiplayer/              # Lógica de multijugador
│   │   ├── peer.ts               # Setup de PeerJS
│   │   ├── sync.ts               # Sincronización de estado
│   │   └── messages.ts           # Tipos de mensajes
│   ├── hooks/                    # Custom hooks
│   ├── utils/                    # Utilidades genéricas
│   ├── types/                    # Tipos TypeScript globales
│   ├── styles/                   # Estilos globales
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── DECISIONS.md                  # Decisiones técnicas tomadas
├── BUGS.md                       # Bugs conocidos
├── README.md                     # Cómo correr el proyecto
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── .gitignore
```

**Principio de organización:** la lógica de juego pura vive en `src/game/` sin dependencias de React. Eso facilita testing y permite reutilizar la lógica si en el futuro se hace una versión móvil nativa.

---

## 4. SISTEMA DE DISEÑO Y DESIGN TOKENS

### Filosofía visual

**Concepto:** "Marca tech contemporánea con alma de juego de cartas." Minimalismo épico, sobrio, premium. La tipografía y la UI son completamente modernas — sin pixel art, sin nostalgia retro. El pixel art aparece como elemento gráfico autoral exclusivamente en contenido temático del juego: retratos de roles, ilustraciones de cartas y de Titulares.

**Referencias:** Linear, Vercel, Stripe (sobriedad premium tipográfica). Cult of the Lamb, Death's Door, Citizen Sleeper (combinación de pixel art en contenido con UI moderna).

**Lo que NO se hace bajo ningún concepto:**
- Tipografía pixel art en cualquier texto del producto.
- Emojis en cualquier elemento de UI.
- UI con apariencia retro o nostálgica.
- Saturación de color o decoración innecesaria.

### Origen del sistema

El sistema de diseño viene del handoff bundle de Claude Design. **Si hay conflicto entre lo que dice este brief y el bundle, el bundle manda** para colores específicos, espaciados finos y componentes visuales. Este brief da los fallbacks autoritativos.

### Paleta YAJUGÁ

```ts
// src/styles/tokens.ts

export const colors = {
  // Colores base (en uso continuo)
  ink: '#0E0E0E',           // Negro tinta - fondos en modo oscuro, texto en modo claro
  bone: '#F8F5EE',          // Blanco hueso - fondos en modo claro, texto en modo oscuro

  // Acentos de marca (usados con MODERACIÓN)
  coral: '#FF5722',         // Acento principal - botones primarios, indicadores críticos
  amber: '#FFB627',         // Acento premium - momentos especiales, ganador
  violet: '#7A5FFF',        // Acento cinematográfico - Expansiones de Dominio (NUEVO en v3)

  // Grises (jerarquía y elementos secundarios)
  charcoal: '#2A2A28',      // Superficies elevadas en modo oscuro
  fog: '#ADA89E',           // Texto secundario, deshabilitado, bordes sutiles

  // Estados UI (heredan de la paleta)
  primary: '#FF5722',       // = coral
  premium: '#FFB627',       // = amber
  cinematic: '#7A5FFF',     // = violet (para Expansiones)
  danger: '#FF5722',        // = coral
  warning: '#FFB627',       // = amber

  // Variantes adicionales para hover/active
  coralHover: '#FF7A4D',
  coralActive: '#E04515',
  amberHover: '#FFC754',
  amberActive: '#E69E15',
  violetHover: '#9B85FF',
  violetActive: '#5840D9',
};
```

### Reglas de uso de la paleta

- **Coral:** acento principal de marca. Solo para botones primarios, indicadores críticos, alertas importantes. NO se usa como color de fondo masivo, NO aparece en bordes de cartas, NO en texto de cuerpo.
- **Ámbar dorado:** se reserva para momentos especiales del juego: ganador de partida, medallas, indicador de "premium". Nunca para UI cotidiana.
- **Violeta cinematográfico (NUEVO):** se reserva exclusivamente para los momentos más dramáticos del juego: animación de activación de Expansión de Dominio (background del modal cinematográfico, halo del personaje), indicador del medidor de Expansión cuando llega al 100% (la barra cambia a violeta pulsante), banner gigante de "TIEMPO EXTRA". El violeta es el color que dice "algo épico está pasando ahora". No se usa en HomeScreen, ni en Lobby, ni en UI cotidiana de partida.
- **Grises:** son la mayor parte de la UI. La interfaz vive en negros, blancos y grises. Los acentos aparecen puntualmente.
- **Espacio negativo:** mucha respiración. Si una pantalla parece "vacía", probablemente está bien.

### Variantes por mapa (para fase 6+, no MVP)

```ts
// Sunhaven (cálido, tropical) - para fase 6
export const sunhavenAccents = {
  primary: colors.coral,
  premium: colors.amber,
};

// Crestwood Bay (frío, postcorporativo) - para fase 6
export const crestwoodAccents = {
  primary: colors.amber,    // El ámbar protagoniza
  premium: colors.coral,    // Coral como acento secundario
};
```

Para el MVP solo se usa la paleta de marca base.

### Tipografía

```css
/* En globals.css */

/* Geist Sans - Display (logo, títulos, nombres de cartas, headers) */
@import 'geist/font/sans';

/* Geist Mono - Números (valores en cartas, contadores, timers) */
@import 'geist/font/mono';

/* Inter - Texto (descripciones, párrafos, tooltips, labels) */
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/inter/700.css';
```

```ts
// tailwind.config.ts
fontFamily: {
  display: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['var(--font-geist-mono)', 'monospace'],
},
```

**Reglas de uso tipográfico:**

- Títulos de pantalla, nombres de cartas, headers de modal, logo: `font-display` (Geist Sans).
- Texto de descripción, párrafos, tooltips, labels, instrucciones: `font-sans` (Inter).
- Valores numéricos en cartas, contadores, timers: `font-mono` (Geist Mono).
- **Ningún texto del juego usa pixel font, en ningún lugar.**

### Escala tipográfica

```ts
// Escala recomendada (modular, basada en sistema 8px)
const fontSizes = {
  xs: '0.75rem',     // 12px - micro labels, captions
  sm: '0.875rem',    // 14px - texto secundario, descripciones cortas
  base: '1rem',      // 16px - texto base
  lg: '1.125rem',    // 18px - subtítulos
  xl: '1.5rem',      // 24px - headers
  '2xl': '2rem',     // 32px - títulos de pantalla
  '3xl': '3rem',     // 48px - hero (logo home)
  '4xl': '4.5rem',   // 72px - cinematic (Expansión activada, Game Over)
};
```

**Pesos:**
- 400 (regular): texto cotidiano.
- 500 (medium): énfasis sutil.
- 600 (semibold): subtítulos, labels destacados.
- 700 (bold): títulos, nombres de cartas, botones.

### Iconografía de UI

- **Librería:** Lucide React (`npm install lucide-react`).
- **Tamaño base:** 20px o 24px según contexto.
- **Stroke:** 1.5px (default de Lucide).
- **Color:** hereda del texto (`currentColor`).
- **Reglas:**
  - Todos los iconos de UI vienen de Lucide.
  - Ningún emoji bajo ninguna circunstancia.
  - Si necesitás un símbolo no disponible en Lucide, usar SVG custom diseñado intencionalmente.

### Pixel art — alcance y especificaciones

El pixel art se usa exclusivamente para contenido temático del juego. Aparece en:

- **Retratos de los 6 roles** (64×64 o 96×96 px, paleta limitada al subset de marca).
- **Ilustraciones de las 8 cartas de Titulares** (128×128 px aprox).
- **Iconos pixel dentro de cartas de propiedades** (32×32 px representando el distrito).
- **Iconos pixel dentro de cartas de acción** (32×32 px representando la acción).

**Especificaciones técnicas:**
- Outline: 1px en negro tinta (#0E0E0E).
- Sombreado: cel-shading 2-tonos máximo. Hue-shifting permitido (sombras de coral van hacia rojo más profundo, no a negro).
- Anti-aliasing: nulo. Pixel-perfect.
- Paleta: subset de la paleta de marca, no agrega colores externos.
- Renderizado en navegador: usar `image-rendering: pixelated` en CSS para evitar interpolación borrosa.

```css
/* Para imágenes pixel art */
.pixel-art {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
```

### Espaciado

```ts
// Sistema de espaciado base 8px
const spacing = {
  '0': '0',
  '1': '0.25rem',  // 4px
  '2': '0.5rem',   // 8px
  '3': '0.75rem',  // 12px
  '4': '1rem',     // 16px
  '6': '1.5rem',   // 24px
  '8': '2rem',     // 32px
  '12': '3rem',    // 48px
  '16': '4rem',    // 64px
  '24': '6rem',    // 96px
};
```

Todo el espaciado debe ser múltiplo de 4px (preferentemente 8px). Esto da consistencia visual y facilita el alineamiento con elementos pixel art.

### Border radius

```ts
const borderRadius = {
  none: '0',
  sm: '4px',     // Botones pequeños, badges
  base: '8px',   // Cartas, modales, botones estándar
  lg: '12px',    // Contenedores grandes
  full: '9999px', // Pills, avatares
};
```

Bordes con radius leve. NO blob shapes. Geometría limpia.

### Sombras

Sombras sutiles, casi inexistentes. La jerarquía se construye con espaciado y color, no con sombras dramáticas.

```ts
const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 2px 4px 0 rgb(0 0 0 / 0.08)',
  lg: '0 4px 8px 0 rgb(0 0 0 / 0.1)',
};
```

### Animaciones — duraciones estándar

```ts
export const durations = {
  instant: 80,        // Hover feedback
  fast: 150,          // Click feedback, button states
  base: 250,          // Modals, transiciones de pantalla
  slow: 400,          // Cartas siendo jugadas
  cinematic: 800,     // Activación de Expansión de Dominio (intro)
  dramatic: 1500,     // Expansión completa, Tiempo Extra
};
```

### Easings

```ts
export const easings = {
  out: [0.16, 1, 0.3, 1],         // easeOutExpo - para entradas
  in: [0.7, 0, 0.84, 0],           // easeInExpo - para salidas
  inOut: [0.83, 0, 0.17, 1],       // easeInOutExpo - para transiciones
  bouncy: [0.68, -0.55, 0.265, 1.55], // easeOutBack - para elementos lúdicos
};
```

### Modo oscuro / modo claro

El MVP debe soportar ambos modos. **Default: modo oscuro** (más coherente con la estética premium-épica). Persistir preferencia en localStorage.

```ts
// Modo oscuro (default)
// Background: ink (#0E0E0E)
// Texto: bone (#F8F5EE)
// Superficies elevadas: charcoal (#2A2A28)

// Modo claro
// Background: bone (#F8F5EE)
// Texto: ink (#0E0E0E)
// Superficies elevadas: blanco puro o levemente más claro que bone
```

Implementar con la estrategia `class` de Tailwind y un toggle persistente en la UI.

**Cumplimiento WCAG AA:**
- Texto sobre fondo: contraste mínimo 4.5:1.
- Texto grande (18px+) sobre fondo: contraste mínimo 3:1.
- Verificar en ambos modos.

---

## 5. MODELO DE DATOS

### Tipos base

```ts
// src/types/game.ts

export type CardColor =
  | 'rojo'
  | 'naranja'
  | 'amarillo'
  | 'verde'
  | 'turquesa'
  | 'azul'
  | 'morado'
  | 'rosa'
  | 'marron'
  | 'gris'
  | 'comodin';

export type CardType =
  | 'property'
  | 'money'
  | 'action'
  | 'rent'
  | 'building'
  | 'wildcard'
  | 'event';

export type ActionCardName =
  | 'bloqueo'
  | 'confiscacion'
  | 'trato_sucio'
  | 'trueque_forzado'
  | 'factura'
  | 'cuota'
  | 'movida_extra'
  | 'sobrecargo'
  | 'edificio'
  | 'torre';

export interface Card {
  id: string;
  type: CardType;
  name: string;
  description?: string;
  value: number;
  color?: CardColor;
  colors?: CardColor[];
  actionName?: ActionCardName;
  imageKey: string;
}

export type RoleId =
  | 'abogado'
  | 'corredor'
  | 'estafador'
  | 'banquero'
  | 'coleccionista'
  | 'arquitecto';

export type ExpansionId =
  | 'tribunal_dominio'
  | 'inmunidad_diplomatica'
  | 'subasta_siglo'
  | 'pacto_comercial'
  | 'el_truco'
  | 'doble_identidad'
  | 'auditoria_forzada'
  | 'prestamo_forzado'
  | 'trueque_imperial'
  | 'camara_archivo'
  | 'rascacielos'
  | 'reordenamiento_urbano';

export interface Role {
  id: RoleId;
  name: string;
  description: string;
  passiveAbility: string;
  expansions: [ExpansionId, ExpansionId];
  imageKey: string;
}

export interface Expansion {
  id: ExpansionId;
  roleId: RoleId;
  name: string;
  description: string;
  chargeCondition: string;
  chargeRule: ChargeRule;
  effect: string;
  exitCost: string;
  duration: 'one_round' | 'instant' | 'permanent';
}

export interface ChargeRule {
  trigger: 'attacked' | 'rent_collected' | 'card_discarded' | 'money_received' | 'property_added' | 'building_played';
  amount: number;
}

export interface Player {
  id: string;
  nickname: string;
  role: RoleId;
  expansion: ExpansionId;
  expansionCharge: number;
  expansionUsed: boolean;
  passiveUsed: boolean;
  hand: Card[];
  bank: Card[];
  sets: PropertySet[];
  hasFinishedTurn: boolean;
  isConnected: boolean;
  hasPlayedCardsThisTurn: number;
  effects: ActiveEffect[];
}

export interface PropertySet {
  color: CardColor;
  properties: Card[];
  buildings: Card[];
  isComplete: boolean;
  requiredCount: number;
  isMonument: boolean;
}

export interface ActiveEffect {
  id: string;
  type: 'inmunidad' | 'pacto_comercial' | 'doble_identidad' | 'prestamo_forzado' | 'audit_freeze' | 'rentas_canceladas' | 'rentas_dobles' | 'rentas_triples' | 'mano_publica';
  sourcePlayerId: string;
  durationRounds: number;
  data?: any;
}

export type GamePhase =
  | 'lobby'
  | 'role_assignment'
  | 'playing'
  | 'defense_pending'
  | 'expansion_active'
  | 'tiempo_extra'
  | 'titular_active'
  | 'game_over';

export interface GameState {
  gameId: string;
  hostId: string;
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  turnsPlayed: number;
  deck: Card[];
  discardPile: Card[];
  marketCards: Card[];
  marketDeck: Card[];
  titularDeck: Card[];
  activeTitular: Card | null;
  pendingDefense: PendingDefense | null;
  activeExpansion: ActiveExpansion | null;
  tiempoExtraState: TiempoExtraState | null;
  winner: string | null;
  log: GameLogEntry[];
  prefs: GamePreferences;
}

export interface PendingDefense {
  attackerId: string;
  defenderId: string;
  cardPlayed: Card;
  context: any;
  timeoutAt: number;
}

export interface ActiveExpansion {
  playerId: string;
  expansionId: ExpansionId;
  state: any;
  endsAtTurn: number;
}

export interface TiempoExtraState {
  triggeringPlayerId: string;
  remainingPlayers: string[];
  turnsRemaining: number;
}

export interface GameLogEntry {
  timestamp: number;
  type: string;
  playerId?: string;
  data: any;
  humanReadable: string;
}

export interface GamePreferences {
  enableTitulares: boolean;
  enableSounds: boolean;
  enableAnimations: boolean;
}
```

### Constantes del juego

```ts
// src/game/constants.ts

export const GAME_CONFIG = {
  STARTING_HAND_SIZE: 5,
  CARDS_DRAWN_PER_TURN: 2,
  CARDS_DRAWN_IF_EMPTY_HAND: 5,
  MAX_HAND_SIZE: 7,
  MAX_PLAYS_PER_TURN: 3,
  SETS_NEEDED_TO_WIN: 3,
  DEFENSE_TIMEOUT_MS: 8000,
  MARKET_SIZE: 3,
  TITULAR_INTERVAL: 5,
  MAX_PLAYERS: 4,
  MIN_PLAYERS: 2,
  DISCONNECT_GRACE_MS: 30000,
  HOST_DISCONNECT_GRACE_MS: 60000,
  PEER_HEARTBEAT_INTERVAL_MS: 5000,
  PEER_HEARTBEAT_TIMEOUT_MS: 10000,
};

export const PROPERTY_REQUIREMENTS: Record<CardColor, number> = {
  rojo: 3,
  naranja: 3,
  amarillo: 3,
  verde: 3,
  turquesa: 3,
  azul: 2,
  morado: 3,
  rosa: 3,
  marron: 2,
  gris: 4,
  comodin: 0,
};

export const PROPERTY_RENT_VALUES: Record<CardColor, number[]> = {
  rojo: [3, 6, 8],
  naranja: [1, 3, 5],
  amarillo: [2, 4, 6],
  verde: [2, 4, 7],
  turquesa: [1, 2, 3],
  azul: [3, 8],
  morado: [1, 2, 4],
  rosa: [1, 2, 3],
  marron: [1, 2],
  gris: [1, 2, 3, 4],
  comodin: [],
};
```

(Los valores exactos pueden ajustarse según balanceo. Lo importante es la estructura.)

---

## 6. ESTADO GLOBAL DEL JUEGO Y FLUJO DE ACTUALIZACIONES

### Principios

1. **Single source of truth.** El `GameState` completo vive en un único Zustand store (`gameStore`). Todo componente lee de ahí.
2. **Inmutabilidad.** Cada actualización del estado produce un nuevo objeto. Usar `immer` integrado en Zustand para escrituras tipo mutación que en realidad son inmutables.
3. **Acciones puras.** La lógica de juego en `src/game/` recibe el estado actual y un payload, devuelve el nuevo estado. NO modifica nada directamente. Esto facilita testing y rollback.
4. **Sincronización multijugador.** Solo el host computa los cambios autoritativos. Los demás envían "intenciones" al host, el host valida, computa el nuevo estado, y broadcastea el estado autoritativo a todos.

### Flujo de una acción típica (multijugador)

```
1. Jugador no-host clickea "jugar carta X como propiedad".
2. Cliente envía mensaje { type: 'PLAY_CARD', cardId: 'xxx', as: 'property' } al host vía PeerJS.
3. Host recibe mensaje, valida que el jugador esté en su turno, que tenga la carta, que no haya jugado 3 cartas ya.
4. Host computa nuevo GameState aplicando la acción.
5. Host broadcastea { type: 'STATE_UPDATE', state: newState } a todos los peers.
6. Todos los clientes (incluido el host) actualizan su gameStore con el nuevo estado.
7. UI re-renderiza con el nuevo estado.
8. Animaciones de transición se disparan en respuesta al cambio de estado.
```

### Flujo en single-player (vs IA — fase posterior, no MVP)

Mismo flujo pero el "host" es el navegador local y los "peers" son los bots controlados por el AI module. Para el MVP no hay IA — solo multijugador entre humanos.

### Acciones del jugador (eventos de input)

```ts
export type PlayerAction =
  | { type: 'PLAY_CARD'; cardId: string; as: 'property' | 'money' | 'action' }
  | { type: 'PLAY_PROPERTY_TO_SET'; cardId: string; setColor: CardColor }
  | { type: 'PLAY_RENT'; rentCardId: string; targetSetColor: CardColor; targetPlayerId?: string }
  | { type: 'PLAY_BUILDING'; buildingCardId: string; targetSetColor: CardColor }
  | { type: 'PLAY_WILDCARD_TO_SET'; cardId: string; setColor: CardColor; chosenColor: CardColor }
  | { type: 'CONFISCATE'; targetPlayerId: string; setColor: CardColor }
  | { type: 'STEAL_PROPERTY'; targetPlayerId: string; cardId: string }
  | { type: 'FORCE_TRADE'; ownCardId: string; targetPlayerId: string; targetCardId: string }
  | { type: 'COLLECT_DEBT'; targetPlayerId: string }
  | { type: 'COLLECT_TRIBUTE' }  // Cuota: todos pagan
  | { type: 'DRAW_EXTRA' }       // Movida Extra
  | { type: 'DOUBLE_RENT'; pendingRentId: string }  // Sobrecargo
  | { type: 'DEFEND'; defenseType: 'block' | 'negotiate' | 'counter'; data?: any }
  | { type: 'BUY_FROM_MARKET'; cardId: string }
  | { type: 'ACTIVATE_EXPANSION'; targetData?: any }
  | { type: 'PAY_RENT'; payments: PaymentDetail[] }  // Detalle de qué cartas usás para pagar
  | { type: 'END_TURN' }
  | { type: 'DISCARD'; cardIds: string[] };  // Si se pasó del límite

export interface PaymentDetail {
  cardId: string;
  fromBank: boolean;             // True si viene del banco, false si es propiedad
}
```

### Mensajes multijugador

```ts
export type MultiplayerMessage =
  | { type: 'JOIN_REQUEST'; nickname: string }
  | { type: 'JOIN_ACCEPTED'; gameState: GameState }
  | { type: 'JOIN_REJECTED'; reason: string }
  | { type: 'PLAYER_ACTION'; action: PlayerAction; playerId: string }
  | { type: 'STATE_UPDATE'; state: GameState }
  | { type: 'PLAYER_DISCONNECTED'; playerId: string }
  | { type: 'CHAT'; playerId: string; message: string }   // Opcional para MVP
  | { type: 'PING' }                                       // Heartbeat
  | { type: 'PONG' };
```

---

## 7. LÓGICA DE JUEGO COMPLETA

### Inicio de partida

```
1. Host crea sala. Recibe gameId.
2. Host comparte link con jugadores. URL: /game/[gameId]
3. Jugadores entran a la URL, ingresan nickname.
4. Cada jugador se conecta al peer del host vía PeerJS usando gameId.
5. Host valida (max 4 jugadores, sala no en partida).
6. Cuando hay entre 2 y 4 jugadores, host puede clickear "Empezar partida".
7. Sistema asigna roles aleatoriamente (1 rol por jugador, sin repeticiones).
8. Sistema asigna 1 de las 2 Expansiones de cada rol aleatoriamente.
9. Roles y Expansiones son visibles para todos.
10. Sistema construye el mazo (110 cartas + cartas de Titulares aparte).
11. Sistema mezcla mazo y Titulares.
12. Sistema reparte 5 cartas a cada jugador.
13. Sistema coloca 3 cartas iniciales en el Mercado.
14. Phase = 'playing'. Turno empieza con el host.
15. Animación de inicio (cartas volando a las manos, etc.)
```

### Estructura de un turno

```
TURNO DEL JUGADOR ACTIVO:

1. INICIO DE TURNO
   - Si es el primer turno del jugador: NO roba cartas (ya tiene 5).
   - Si NO es el primer turno: roba 2 cartas del mazo (5 si su mano está vacía).
   - Si el contador global de turnos jugados es múltiplo de 5: voltear Titular.
     - Mostrar modal con la nueva carta de Titular.
     - Aplicar su efecto (con duración de 1 ronda).
     - Cerrar modal después de 4 segundos o al clickear "OK".

2. FASE DE JUEGO
   - El jugador puede jugar hasta 3 cartas (cualquier combinación).
   - Después de cada carta jugada, validar:
     - ¿Causó algún ataque? Si sí → activar Defense del defensor.
     - ¿Activó alguna Expansión? Si sí → activar el flujo de Expansión.
     - ¿Alguien completó 3 sets? Si sí → activar Tiempo Extra.
   - El jugador puede comprar del Mercado en cualquier momento de su turno (no cuenta como carta jugada).
   - El jugador puede activar su Expansión de Dominio en su turno si está cargada al 100%.
   - El jugador puede terminar su turno antes de jugar 3 cartas (clickea "Terminar turno").

3. FIN DE TURNO
   - Si su mano tiene > 7 cartas: forzar descarte hasta llegar a 7.
   - Decrementar duración de efectos activos (los que duren 1 ronda → expiran al final de la ronda completa, no del turno).
   - Pasar al siguiente jugador (currentPlayerIndex + 1, módulo cantidad de jugadores).
   - turnsPlayed++.
```

### Finalización del juego

```
1. Cuando un jugador completa su tercer set válido:
   - Si su rol NO es Coleccionista, condición es 3 sets completos.
   - Si su rol ES Coleccionista, condición es 2 sets completos + 1 propiedad suelta.
   - Si tiene un Set Monumento (Arquitecto Rascacielos), cuenta como 2 sets.

2. Sistema dispara TIEMPO EXTRA:
   - phase = 'tiempo_extra'
   - Cada otro jugador (en orden de turno) tiene 1 turno completo para intentar romper sets del ganador potencial.
   - Las cartas que pueden romper sets brillan visualmente.
   - Si en algún momento durante Tiempo Extra el jugador potencial-ganador deja de tener 3 sets → cancela Tiempo Extra y el juego continúa normalmente desde donde quedó.
   - Si todos los oponentes terminan su turno sin romper sets → ganador confirmado.

3. Phase = 'game_over'. Mostrar pantalla de fin de partida.
```

### Validaciones críticas en cada acción

Antes de aplicar cualquier acción, validar:

- ¿Es el turno del jugador?
- ¿No se pasó del límite de 3 cartas jugadas?
- ¿La carta existe en su mano?
- ¿Hay un Defense pendiente que bloquea otras acciones?
- ¿Hay una Expansión activa que limita lo que se puede hacer?
- ¿El target del ataque tiene la carta o el set que se pretende afectar?
- ¿Hay un efecto activo (Inmunidad, etc.) que cancela esta acción?

Si alguna validación falla, NO aplicar la acción, NO actualizar estado. Si el host detecta una acción inválida de un peer, ignorar (puede ser desincronización), y enviar STATE_UPDATE para forzar re-sincronización.

---

## 8. LAS 110 CARTAS DETALLADAS

### Composición del mazo

```
PROPIEDADES (28 cartas)
- Rojo: 3 cartas (set de 3)
- Naranja: 3 cartas (set de 3)
- Amarillo: 3 cartas (set de 3)
- Verde: 3 cartas (set de 3)
- Turquesa: 3 cartas (set de 3)
- Azul: 2 cartas (set de 2)
- Morado: 3 cartas (set de 3)
- Rosa: 3 cartas (set de 3)
- Marrón: 2 cartas (set de 2)
- Gris: 4 cartas (set de 4)
- Total: 29 cartas. Ajustar a 28 redistribuyendo o quedará en 29.

COMODINES MULTICOLOR (11 cartas)
- 2 cartas comodín bicolor de cada combinación común
- 1 comodín multicolor universal (cuenta como cualquier color)

DINERO (20 cartas)
- 6 cartas de $1M
- 5 cartas de $2M
- 3 cartas de $3M
- 3 cartas de $4M
- 2 cartas de $5M
- 1 carta de $10M

CARTAS DE RENTA (13 cartas)
- 3 rentas multicolor (cualquier color, valor menor)
- 10 rentas específicas por par de colores (2 colores cada una)

CARTAS DE ACCIÓN (28 cartas)
- Bloqueo: 3 cartas
- Confiscación: 2 cartas
- Trato Sucio: 3 cartas
- Trueque Forzado: 3 cartas
- Factura: 3 cartas
- Cuota: 3 cartas
- Movida Extra: 10 cartas
- Sobrecargo: 1 carta

EDIFICIOS Y TORRES (10 cartas)
- Edificio: 5 cartas
- Torre: 5 cartas

TOTAL: 110 cartas (ajustar +/- 1 según necesidad)

MAZO DE TITULARES (separado, 8 cartas)
- Boom Inmobiliario
- Recesión
- Auditoría
- Especulación Salvaje
- Crisis Bancaria
- Reforma Urbana
- Filtración
- Noche de Gala
```

### Función de generación del mazo

```ts
// src/game/deck.ts

export function buildMainDeck(): Card[] {
  const deck: Card[] = [];

  // Helper para crear N cartas iguales con IDs únicos
  const addCards = (template: Omit<Card, 'id'>, count: number) => {
    for (let i = 0; i < count; i++) {
      deck.push({ ...template, id: nanoid() });
    }
  };

  // Propiedades
  PROPERTY_DEFINITIONS.forEach(prop => {
    addCards(prop, prop.count);
  });

  // Comodines, dinero, rentas, acciones, edificios...
  // (implementar similarmente)

  return shuffle(deck);
}

export function buildTitularDeck(): Card[] {
  return TITULAR_DEFINITIONS.map(t => ({
    ...t,
    id: nanoid(),
  }));
}

function shuffle<T>(arr: T[]): T[] {
  // Fisher-Yates shuffle
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```

---

## 9. LÓGICA CONDICIONAL DE CADA TIPO DE ACCIÓN

Cada carta de acción tiene reglas precisas. Esta sección detalla qué pasa al jugar cada una, incluyendo edge cases.

### 9.1 Bloqueo

**Función:** cancela una acción enemiga.
**Cómo se juega:** automáticamente disponible cuando hay un Defense pendiente. Aparece como uno de los 3 botones del modal de Defense.
**No se puede jugar:** fuera de un Defense pendiente. NO ocupa una de las 3 cartas del turno.

**Edge cases:**
- Si el atacante usa Sobrecargo encima de una renta, el defensor puede bloquear la renta original o el sobrecargo (no ambos con un solo Bloqueo).
- Si el defensor usa Bloqueo, el atacante recupera la carta del ataque a su mano (Bloqueo cancela, no destruye).
- Bloqueo NO se puede usar contra Cuota (Cuota afecta a todos, no es ataque dirigido). En MVP, sí permitir Bloqueo contra Cuota individualmente — cada jugador puede bloquear su propia parte.

### 9.2 Confiscación (roba un set completo)

**Función:** robás un set completo de propiedades de otro jugador.
**Cómo se juega:** seleccionás un jugador objetivo y un set completo del oponente. El set entero pasa a tu zona.
**Validaciones:**
- El set objetivo debe estar completo.
- No se puede confiscar Set Monumento (Rascacielos) sin pagar 5M al Arquitecto.
- El defensor puede activar Defense.

**Edge cases:**
- Si el set tiene Edificios o Torres, también se confiscan.
- Si el set tenía un comodín, también se confisca.
- Si después de la confiscación el atacante tiene ahora ese set repetido (ya tenía uno completo del mismo color), se computa: el atacante ahora tiene 2 sets de ese color (no se acumulan, son dos sets separados, lo cual no aporta para victoria — necesita 3 sets de COLORES DISTINTOS).
- En realidad, en Monopoly Deal solo se computa 1 set por color. Si confiscás un set de un color que ya tenés completo, el set adicional cuenta como propiedades extra que pueden venderse o moverse, pero no como un segundo set válido para victoria. Implementar esta regla.

### 9.3 Trato Sucio (roba una propiedad individual)

**Función:** robás una propiedad suelta de otro jugador.
**Cómo se juega:** seleccionás un jugador y una propiedad suya que NO esté en un set completo.
**Validaciones:**
- La propiedad debe estar suelta (en un set incompleto). NO se pueden robar propiedades de sets completos.
- El defensor puede activar Defense.

**Edge cases:**
- Si la propiedad robada completa un set tuyo, se asigna directamente a ese set.
- Si el oponente solo tiene propiedades en sets completos, no podés usar Trato Sucio contra él.

### 9.4 Trueque Forzado (intercambio obligado)

**Función:** intercambiás una propiedad tuya por una del oponente.
**Cómo se juega:** seleccionás una propiedad propia, un jugador objetivo, y una propiedad del oponente. Se intercambian.
**Validaciones:**
- Ambas propiedades deben estar sueltas (no en sets completos).
- El defensor puede activar Defense.

**Edge cases:**
- Si el intercambio rompe un set incompleto del oponente y completa uno tuyo (o viceversa), aplicar después del intercambio.

### 9.5 Factura (cobrás $5M a un jugador)

**Función:** un jugador específico te paga $5M.
**Cómo se juega:** seleccionás un jugador objetivo. El sistema le pide pagar $5M.
**Pago:**
- El jugador paga con cartas de dinero del banco y/o propiedades sueltas.
- Si no tiene suficiente, paga lo que pueda. No se queda debiendo.
- El defensor puede activar Defense.

**Edge cases:**
- Si el target tiene $0 en banco y 0 propiedades sueltas, no paga nada.
- Las cartas pagadas van al banco del atacante.

### 9.6 Cuota (todos pagan $2M)

**Función:** todos los jugadores te pagan $2M cada uno.
**Cómo se juega:** clickeás la carta. Aparece un modal donde cada otro jugador debe seleccionar cómo pagar.
**Cada otro jugador puede:**
- Activar Defense (Bloquear, Negociar, Contraatacar) individualmente.
- Pagar normalmente.

**Edge cases:**
- Procesar el cobro jugador por jugador, no simultáneamente. Esto evita confusión y permite Defense individual.

### 9.7 Movida Extra (robás 2 cartas extra del mazo)

**Función:** robás 2 cartas adicionales del mazo.
**Cómo se juega:** clickeás la carta. Inmediatamente robás 2 cartas. Cuenta como 1 de las 3 cartas jugadas en el turno.
**Edge cases:**
- Si el mazo tiene menos de 2 cartas, mezclás el descarte y formás un nuevo mazo.
- Si después de robar la mano supera 7, NO se descarta inmediatamente — se descarta al final del turno.

### 9.8 Sobrecargo (duplica una renta)

**Función:** duplica el monto de una renta que estás cobrando.
**Cómo se juega:** se juega INMEDIATAMENTE DESPUÉS de jugar una carta de Renta. El monto se duplica.
**Validaciones:**
- Solo puede jugarse encadenada con una Renta del mismo turno.
- Cuenta como una segunda carta jugada.
- El defensor puede bloquear el Sobrecargo (la renta original no se bloquea con eso, solo el sobrecargo).

### 9.9 Renta (cobrás renta por un set)

**Función:** obligás a uno (o todos) los jugadores a pagar renta por un set tuyo.
**Cómo se juega:**
- Si la carta de Renta es de UN color: todos los jugadores te pagan según el set de ese color que tengas.
- Si la carta de Renta es de DOS colores: elegís cuál de los dos cobrás. Solo afecta a UN jugador a tu elección.
- Si la carta de Renta es multicolor: elegís cuál set cobrás. Solo afecta a UN jugador.
**Cálculo del monto:** según `PROPERTY_RENT_VALUES[color][properties.length - 1]`. Si hay Edificios/Torres en el set, sumar sus bonus.
**Validaciones:**
- Debés tener al menos 1 propiedad del color para cobrar renta.
- Cada target puede activar Defense.

**Edge cases:**
- Si tenés un Set Monumento (Rascacielos), la renta de ese set se triplica.
- Si hay un Titular activo "Recesión", las rentas de la ronda se cancelan.
- Si hay un Titular activo "Boom Inmobiliario", las rentas suman +1M.
- Si hay un Titular activo "Especulación Salvaje", las rentas se duplican.
- Si el cobrador tiene activa "Burbuja Especulativa" (Corredor), aplicar sus reglas.

### 9.10 Edificio / Torre

**Función:** suben el valor de renta de un set completo.
**Cómo se juega:** se coloca encima de un set propio que esté completo.
**Validaciones:**
- El set objetivo debe estar completo.
- Solo se puede colocar 1 Edificio Y 1 Torre por set (Torre se coloca encima del Edificio).
- No se puede colocar Torre sin haber colocado primero Edificio.

**Edge cases:**
- Edificio agrega +3M al valor de renta de ese set.
- Torre agrega +4M más al valor (+7M total).
- Si una Confiscación se lleva el set, también se llevan los Edificios/Torres.

### 9.11 Comodín

**Función:** funciona como una propiedad de los colores que indica.
**Cómo se juega:** lo colocás en un set y elegís cuál de los colores que ofrece tomar.
**Reglas:**
- Cuenta como una propiedad de ese color para completar el set.
- Se puede mover a otro color en tu turno (sin gastar carta jugada — es una acción libre).
- El comodín multicolor universal puede ser cualquier color y se mueve libremente.

**Edge cases:**
- Si el comodín completa el set, gana los efectos de set completo.
- Si lo movés y rompés un set, las cartas vuelven a estar "sueltas" hasta que lo recompletes.

### 9.12 Acción libre: jugar carta como dinero

**Función:** cualquier carta puede jugarse al banco como dinero por su valor monetario.
**Cómo se juega:** clickeás la carta y elegís "Al banco".
**Reglas:**
- Cuenta como 1 de las 3 cartas jugadas del turno.
- Las cartas en el banco no pueden volver a la mano.
- Al pagar rentas/facturas, las cartas del banco son las primeras opciones.

---

## 10. SISTEMA DE DEFENSA (REACCIONES)

### Disparo

Cuando se juega una carta que ataca a un jugador específico (Confiscación, Trato Sucio, Trueque Forzado, Factura, Renta, Sobrecargo), o cuando se juega Cuota (cada jugador individualmente), se dispara el modal de Defensa.

### Estados del modal

```ts
interface DefenseModalState {
  attacker: Player;
  defender: Player;
  cardPlayed: Card;
  context: any;  // Detalles del ataque
  timeRemaining: number;  // ms hasta timeout
  selectedOption: 'block' | 'negotiate' | 'counter' | null;
}
```

### Flujo del modal

```
1. APARICIÓN DEL MODAL
   - Animación: el modal aparece desde abajo con bouncy easing.
   - Audio: sonido de alerta sutil.
   - Visualmente, la mesa se oscurece detrás (overlay 60% opacity).
   - Aparecen 3 botones grandes: BLOQUEAR, NEGOCIAR, CONTRAATACAR.
   - Aparece un timer circular con cuenta regresiva de 8 segundos.

2. INTERACCIÓN
   Si el defensor clickea BLOQUEAR:
     - Validar que tenga carta de Bloqueo en la mano. Si no, deshabilitar el botón con tooltip explicativo.
     - Confirmar selección (un click extra para evitar errores accidentales).
     - Se anula la acción del atacante. Se descarta la carta de Bloqueo del defensor.
     - El atacante recupera su carta de ataque a la mano.
     - Cerrar modal con animación de fade out.
     - Mostrar log: "[Defensor] bloqueó el ataque de [Atacante]".

   Si el defensor clickea NEGOCIAR:
     - Aparece submodal de negociación.
     - El defensor propone: cantidad de dinero alternativa, propiedad alternativa, o algún cambio.
     - El atacante recibe modal de "El defensor propone X. ¿Aceptás?".
     - Si acepta: se aplica el acuerdo, se cancela el ataque original.
     - Si rechaza: el ataque original se aplica completo.
     - El atacante también tiene timer de 8 segundos para responder. Si no responde: rechaza por default.

   Si el defensor clickea CONTRAATACAR:
     - El ataque se aplica COMPLETAMENTE.
     - PERO el atacante también recibe un castigo: pierde 1 carta al azar de su mano (que va al defensor).
     - Cerrar modal.
     - Mostrar log: "[Defensor] sufrió el ataque pero le robó una carta a [Atacante]".

3. TIMEOUT (8 SEGUNDOS SIN RESPUESTA)
   - El ataque se aplica completo, sin Defense.
   - Mostrar log: "[Defensor] no respondió a tiempo".

4. CIERRE
   - Modal se cierra con animación.
   - El estado vuelve a 'playing'.
   - Si el atacante todavía puede jugar más cartas, sigue su turno.
```

### Edge cases

- Si el defensor está afectado por "Inmunidad Diplomática" (Abogado), el ataque NO se aplica nunca, no aparece el modal — el efecto se cancela automáticamente. Mostrar notificación "[Defender] está protegido por Inmunidad Diplomática".
- Si el defensor está afectado por "Pacto Comercial" del Corredor, los ataques entre jugadores están suspendidos — el ataque se cancela y el atacante pierde 5M y todas sus rentas del turno.
- Si la conexión del defensor falla durante el modal, asumir timeout (ataque se aplica).

---

## 11. SISTEMA DE MERCADO

### Estructura

El Mercado es una zona visible en la mesa con 3 cartas boca arriba. Existe un mazo de cartas para reponer ("market deck") que en el MVP comparte con el mazo principal — cada vez que una carta se compra, se repone con la primera carta del mazo principal.

### Flujo de compra

```
1. El jugador puede comprar en cualquier momento de su turno.
2. La compra NO cuenta como carta jugada (es una acción adicional libre).
3. Click en una carta del Mercado:
   - Sistema valida que el jugador tiene suficiente dinero en el banco.
   - Si no tiene, deshabilitar la carta con tooltip "No tenés suficiente dinero ($X)".
   - Si sí tiene, mostrar modal de confirmación: "Comprar [Nombre Carta] por $X. Confirmar".
4. Al confirmar:
   - Sistema descuenta dinero del banco del jugador.
   - La carta se transfiere a la mano del jugador.
   - Una nueva carta se voltea del mazo principal y entra al Mercado.
   - Animación: la carta se mueve del Mercado a la mano. Otra carta vuela del mazo al Mercado.
5. Limit:
   - Un jugador puede comprar máximo 1 carta por turno del Mercado (para evitar abuso de jugadores con bancos enormes).
```

### Precios

Cada carta del Mercado cuesta lo siguiente (puede ajustarse):

- Carta de propiedad: $2M.
- Carta de acción: $3M.
- Carta de comodín: $4M.
- Carta de Edificio o Torre: $4M.

(Los precios están en una constante editable y se ajustan según balanceo.)

### Edge cases

- Si el mazo principal se agota mientras hay cartas en el Mercado: las cartas del Mercado se quedan ahí, no se reponen hasta que el mazo se reconstituya con el descarte.
- Si todos los jugadores compraron del Mercado y nadie más puede pagar: simplemente nadie compra. No hay rotación forzada en el MVP.

---

## 12. SISTEMA DE TITULARES

### Disparo

Cada vez que `gameState.turnsPlayed` es múltiplo de 5 y hay cartas en el `titularDeck`, se dispara el flujo de Titular ANTES de que empiece el turno del jugador (al inicio del turno).

### Flujo

```
1. INICIO DEL TURNO QUE DISPARA TITULAR
   - Sistema saca la primera carta del titularDeck.
   - phase = 'titular_active'.
   - Animación: la carta se levanta dramáticamente del centro de la mesa.
   - Sonido: efecto sutil tipo "campana de noticias".
   - Modal aparece con:
     - Imagen pixel art del Titular.
     - Nombre del Titular (font-display).
     - Descripción del efecto (font-sans).
     - Botón "Continuar".
   - Si el jugador no clickea, el modal se cierra automáticamente después de 5 segundos.

2. EFECTO APLICADO
   - El efecto del Titular se registra como ActiveEffect con duration de 1 ronda.
   - Una "ronda" = todos los jugadores jugaron su turno una vez después del Titular.
   - El estado del Titular activo es visible en la UI (banner sutil arriba) durante toda la ronda.

3. EXPIRACIÓN
   - Cuando todos los jugadores completaron su turno → expira el efecto.
   - phase vuelve a 'playing'.
   - Mostrar log: "[Titular] expiró".
```

### Catálogo de los 8 Titulares

```ts
export const TITULARES: Record<string, TitularEffect> = {
  boom_inmobiliario: {
    name: 'Boom Inmobiliario',
    description: 'Todas las rentas valen +1M esta ronda',
    apply: (state) => addEffect(state, { type: 'rent_modifier', amount: +1, duration: 1 }),
  },
  recesion: {
    name: 'Recesión',
    description: 'Las rentas se cancelan esta ronda',
    apply: (state) => addEffect(state, { type: 'rent_canceled', duration: 1 }),
  },
  auditoria: {
    name: 'Auditoría',
    description: 'Todos muestran sus manos',
    apply: (state) => state.players.forEach(p => p.handRevealed = true),
    // Después de 1 ronda, se oculta de nuevo.
  },
  especulacion_salvaje: {
    name: 'Especulación Salvaje',
    description: 'Las rentas se duplican esta ronda',
    apply: (state) => addEffect(state, { type: 'rent_multiplier', amount: 2, duration: 1 }),
  },
  crisis_bancaria: {
    name: 'Crisis Bancaria',
    description: 'Cada jugador descarta 1M del banco',
    apply: (state) => state.players.forEach(p => removeOneMillion(p)),
  },
  reforma_urbana: {
    name: 'Reforma Urbana',
    description: 'Cada jugador puede mover 1 propiedad entre sets esta ronda',
    apply: (state) => state.players.forEach(p => p.canMoveProperty = true),
  },
  filtracion: {
    name: 'Filtración',
    description: 'Cada jugador muestra 2 cartas a su izquierda',
    apply: (state) => revealCardsToLeft(state),
  },
  noche_de_gala: {
    name: 'Noche de Gala',
    description: 'Todos roban 2 cartas extra esta ronda',
    apply: (state) => state.players.forEach(p => p.bonusDraws = 2),
  },
};
```

### Edge cases

- Si un jugador es el único que sabía de la Auditoría y se desconecta, las cartas se ocultan automáticamente al retomar.
- Si Crisis Bancaria afecta a alguien con $0 banco, no descarta nada (no se le exige).
- Si un Titular afecta a un jugador que está en medio de un Defense, aplicar el Titular DESPUÉS de resolver el Defense.


## 13. SISTEMA DE ROLES Y EXPANSIONES DE DOMINIO

### Asignación de roles

```ts
function assignRolesAndExpansions(players: Player[]): Player[] {
  const allRoles: RoleId[] = ['abogado', 'corredor', 'estafador', 'banquero', 'coleccionista', 'arquitecto'];
  const shuffledRoles = shuffle(allRoles);

  return players.map((player, i) => {
    const roleId = shuffledRoles[i];
    const expansions = ROLE_DEFINITIONS[roleId].expansions;
    const expansionId = expansions[Math.floor(Math.random() * 2)]; // 0 o 1

    return {
      ...player,
      role: roleId,
      expansion: expansionId,
      expansionCharge: 0,
      expansionUsed: false,
      passiveUsed: false,
    };
  });
}
```

**Reglas:**
- Roles únicos por partida (no se repiten).
- Si hay 2-3 jugadores, los roles no usados quedan fuera (no se asignan).
- La asignación es visible para todos antes de empezar.
- Animación: cada jugador ve girar las opciones de role en una "ruleta" durante 2 segundos antes de revelar el suyo.

### Carga del medidor de Expansión

```ts
function updateExpansionCharge(player: Player, trigger: ChargeRule['trigger'], state: GameState): Player {
  const expansion = EXPANSION_DEFINITIONS[player.expansion];
  if (expansion.chargeRule.trigger !== trigger) return player;

  const newCharge = Math.min(100, player.expansionCharge + expansion.chargeRule.amount);
  return { ...player, expansionCharge: newCharge };
}
```

Triggers según rol:

| Rol | Trigger | Cantidad por trigger |
|---|---|---|
| Abogado | `attacked` | +25% |
| Corredor | `rent_collected` | +20% |
| Estafador | `card_discarded` | +15% |
| Banquero | `money_received` | +10% |
| Coleccionista | `property_added` | +20% |
| Arquitecto | `building_played` | +33% |

### Activación de Expansión

```
1. El jugador cuyo medidor está al 100% ve el botón "ACTIVAR EXPANSIÓN" iluminado y pulsante.
2. El botón solo está disponible en SU turno y antes de jugar 3 cartas.
3. Click en el botón → modal de confirmación con:
   - Nombre de la Expansión.
   - Descripción del efecto.
   - Aviso de costo de salida.
   - Botones: "Activar" / "Cancelar".
4. Si confirma:
   - phase = 'expansion_active'.
   - Animación cinematográfica (1.5s):
     - La mesa se oscurece dramáticamente.
     - Aparece el nombre de la Expansión en pantalla completa con efecto de "shockwave".
     - Sonido épico (subtle, no excesivo).
   - Se aplica la lógica específica de la Expansión.
5. La Expansión dura según su definición:
   - Mayoría: 1 ronda (hasta el siguiente turno del activante).
   - Algunas son instant (efecto inmediato sin duración).
6. Al final de la duración:
   - Se aplica el costo de salida.
   - phase vuelve a 'playing'.
   - El medidor se queda en 100% pero `expansionUsed = true`. NO se puede activar de nuevo en la partida.
```

### Lógica específica de cada Expansión

#### Tribunal del Dominio (Abogado A)

```
INPUT REQUERIDO:
- El Abogado selecciona un acusado (otro jugador).
- El Abogado selecciona un acusador (otro jugador, distinto del acusado).

EFECTO:
- El acusador descarta hasta 3 cartas de su mano (a su elección).
- Por cada carta descartada, el acusado entrega al Abogado: 1 propiedad suelta, 2M, o 1 carta (acusado elige).
- Si el acusado no puede pagar lo demandado: pierde 1 propiedad de un set completo (Abogado elige cuál).
- El acusador no recibe nada.

UI:
- Modal de "Tribunal" con imagen del Abogado y un fondo de sala de juicio.
- Selección de acusado (cards de jugadores clickeables).
- Selección de acusador (después de elegir acusado, opciones se filtran).
- Una vez seleccionados, el acusador recibe modal "Sos acusador. Descartá hasta 3 cartas".
- Por cada carta descartada, el acusado recibe modal "Sos acusado. ¿Qué entregás? [propiedad / 2M / carta]".

COSTO DE SALIDA:
- En el siguiente turno del Abogado, no puede jugar cartas de acción (solo dinero o propiedades).
- Indicar visualmente: las cartas de acción aparecen "grises" en la mano.
```

#### Inmunidad Diplomática (Abogado B)

```
INPUT REQUERIDO:
- El Abogado selecciona un jugador a proteger.

EFECTO (1 RONDA):
- El protegido es invulnerable a Confiscación, Trato Sucio, Trueque Forzado, Factura, Renta dirigida.
- Cada vez que el protegido cobra renta o recibe ganancia, el 30% va al Abogado.
- Si el protegido se rehúsa al pacto: pierde 2 propiedades sueltas a elección del Abogado.

INTERACCIÓN POSIBLE:
- Cualquier otro jugador puede pagar 5M al Abogado para romper la protección antes de que termine.

UI:
- Modal de selección de protegido.
- Banner persistente durante la ronda: "Inmunidad: [Protegido] protegido por [Abogado]".
- Botón visible para cualquier jugador: "Romper protección (5M)".

COSTO DE SALIDA:
- En el siguiente turno del Abogado, no puede atacar a nadie.
```

#### Subasta del Siglo (Corredor A)

```
INPUT REQUERIDO:
- El Corredor selecciona 3 propiedades (de cualquier jugador, incluyéndose).

EFECTO:
- Las 3 propiedades se ponen al centro como subasta.
- Cada otro jugador puja en secreto (modal con input numérico, validar que tenga el dinero).
- Después de que todos pujen (o timeout 15 seg), las pujas se revelan.
- El Corredor asigna cada propiedad a su criterio (elige a quién dársela, no obligado a vender al mejor postor).
- Todo el dinero pujado va al Corredor (incluyendo de los que no recibieron propiedad).

UI:
- Modal "Subasta del Siglo" con las 3 propiedades visibles.
- Cada otro jugador ve modal "Pujá secreto. ¿Cuánto ofrecés por cada una?". Inputs numéricos limitados al dinero disponible.
- Después de las pujas, el Corredor ve un "panel de pujas reveladas" y asigna.

COSTO DE SALIDA:
- En el siguiente turno del Corredor, no puede cobrar rentas.
```

#### Pacto Comercial (Corredor B)

```
INPUT REQUERIDO: Ninguno (efecto global).

EFECTO (1 RONDA):
- Ningún jugador puede atacarse entre sí.
- Todas las rentas cobradas se duplican.
- El Corredor cobra 25% de cada renta cobrada por cualquier jugador.
- Si alguien intenta romper el pacto (jugar carta de ataque): pierde 5M y todas las rentas del turno.

UI:
- Banner persistente: "Pacto Comercial activo. Sin ataques. Rentas dobles. Corredor cobra 25%".
- Si alguien clickea una carta de ataque, mostrar modal "Romper pacto cuesta 5M y todas tus rentas. ¿Continuar?".

COSTO DE SALIDA:
- En la ronda siguiente, nadie puede cobrar rentas (mercado enfriado).
```

#### El Truco (Estafador A)

```
EFECTO AUTOMÁTICO:
- El Estafador roba secretamente 1 propiedad de cada otro jugador (suma a un "pool" temporal).
- Sistema mezcla esas propiedades con cartas-trampa generadas (1 propiedad-falsa por cada otro jugador).
- Las cartas se ponen boca abajo en el centro.
- Cada otro jugador, en orden, elige 1 carta:
  - Si elige una propiedad real: se la queda.
  - Si elige una trampa: pierde 3M (o si no tiene, 1 propiedad suelta).
- Las propiedades reales no elegidas vuelven a sus dueños originales — EXCEPTO las que el Estafador no asignó (se las queda).

UI:
- Modal "El Truco" con animación de cartas mezcladas.
- Cada jugador ve "Elegí una carta" con 3 cartas visibles boca abajo.
- Reveal animado de la elección.

COSTO DE SALIDA:
- En el siguiente turno del Estafador, su mano es pública (todos pueden verla).
```

#### Doble Identidad (Estafador B)

```
INPUT REQUERIDO:
- El Estafador selecciona a otro jugador (el "suplantado").

EFECTO (1 RONDA):
- Todas las acciones del Estafador se atribuyen al suplantado en el log y notificaciones visibles a otros jugadores.
- Si el Estafador ataca a alguien, el target ve "Te atacó [Suplantado]".
- Si el Estafador cobra renta, el target ve "Te cobró [Suplantado]".
- En el panel de turno, el Estafador aparece con el nombre del suplantado.
- El Estafador conserva todas las ganancias.

NOTA TÉCNICA: el suplantado SÍ ve la verdad (sabe que el Estafador está suplantándolo). Solo los demás jugadores son engañados.

UI:
- El Estafador ve "Sos vos pero parecés [Suplantado]".
- Los demás jugadores ven al Estafador con el avatar y nombre del suplantado.
- El suplantado ve "[Estafador] te está suplantando" como notificación privada.

COSTO DE SALIDA:
- Cuando termina la Expansión, todos los demás jugadores ven una notificación: "[Suplantado] no te atacó. Fue [Estafador]".
- El suplantado puede usar esta info para venganza.
```

#### Auditoría Forzada (Banquero A)

```
EFECTO (1 RONDA):
- Cada otro jugador entrega la mitad de su banco al Banquero (redondeo hacia arriba).
- El Banquero ve las manos de todos los demás jugadores.
- Ningún jugador puede recibir dinero de ninguna fuente esa ronda — todo se desvía al Banquero.

UI:
- Modal "Auditoría Forzada Activa" con efecto visual de bóveda.
- Cada otro jugador ve animación de cartas saliendo de su banco hacia el Banquero.
- El Banquero ve un panel especial con las manos visibles de todos.
- Banner persistente: "Auditoría: el dinero está congelado para todos excepto [Banquero]".

COSTO DE SALIDA:
- En la ronda siguiente, el Banquero no puede cobrar rentas (sus propiedades están "congeladas").
```

#### Préstamo Forzado (Banquero B)

```
EFECTO PERMANENTE:
- El Banquero entrega 5M a cada otro jugador (sale de su banco, si no tiene 5M por jugador, entrega lo que pueda).
- Cada jugador que recibió préstamo le debe 10M al Banquero.
- Hasta que paguen su deuda, NO pueden ganar la partida (aunque tengan los 3 sets).
- Pueden pagar cuando quieran (acción libre en su turno).

UI:
- Modal "Préstamo Forzado" con animación de dinero saliendo del Banquero hacia los demás.
- Indicador permanente de deuda en cada jugador endeudado: "Debe 10M al Banquero".
- En el modal de fin de partida, si un jugador con deuda intentaría ganar, se muestra "No podés ganar con deuda activa".
- Botón "Pagar deuda" visible permanentemente para jugadores con deuda en su turno.

COSTO DE SALIDA:
- El Banquero pierde 5M cada turno hasta que TODAS las deudas sean pagadas.
- Si el Banquero llega a 0M de banco mientras tiene deudas pendientes: pierde 1 propiedad suelta por turno hasta que se paguen las deudas.
```

#### Trueque Imperial (Coleccionista A)

```
INPUT REQUERIDO:
- El Coleccionista elige 1 propiedad de cada otro jugador (las propiedades pueden estar sueltas o en sets, pero NO de sets completos).
- El Coleccionista elige qué propiedad propia da a cambio a cada otro jugador.

EFECTO:
- Los intercambios se ejecutan automáticamente.
- Los jugadores no pueden rechazar.

UI:
- Modal "Trueque Imperial".
- Vista de las propiedades de cada otro jugador, el Coleccionista clickea las que quiere.
- Selecciona qué da a cambio.
- Animación de intercambio simultáneo.

COSTO DE SALIDA:
- En la ronda siguiente, el Coleccionista no puede atacar a nadie.
```

#### Cámara del Archivo (Coleccionista B)

```
INPUT REQUERIDO:
- El Coleccionista selecciona una propiedad específica como "Pieza de Colección" (puede ser de cualquier jugador, incluyéndose).

EFECTO (1 RONDA):
- Todas las cartas del mismo color que la Pieza de Colección, durante esa ronda, se entregan temporalmente al Coleccionista.
- Cuentan como propiedades suyas para rentas y condición de victoria durante la ronda.
- Cuando termina la ronda, vuelven a sus dueños originales — EXCEPTO la Pieza de Colección original, que el Coleccionista conserva permanentemente.

UI:
- Modal de selección de Pieza.
- Animación de propiedades del color volando hacia la zona del Coleccionista.
- Banner persistente: "Cámara Activa: [color] está en posesión de [Coleccionista]".
- Animación de retorno cuando termina (excepto la Pieza original).

COSTO DE SALIDA:
- En el siguiente turno del Coleccionista, no puede recibir nuevas propiedades de ninguna fuente.
```

#### Rascacielos (Arquitecto A)

```
INPUT REQUERIDO:
- El Arquitecto selecciona uno de SUS sets completos como "Set Monumento".

EFECTO PERMANENTE:
- El Set Monumento triplica el valor de sus rentas.
- No puede ser objetivo de Confiscación, Trato Sucio, Trueque Forzado.
- Cuenta como 2 sets para la condición de victoria.
- Si alguien quiere atacarlo de cualquier forma, debe pagar 5M al Arquitecto SOLO PARA INTENTAR (y si tiene Defense aplicable, igual puede fallar).

UI:
- Animación cinematográfica del rascacielos creciendo sobre el set elegido.
- Indicador visual permanente del Monumento (corona, brillo, marco especial).

COSTO DE SALIDA:
- El Arquitecto NO puede construir más Monumentos en la partida.
- En la ronda siguiente, el Arquitecto no puede recibir cartas nuevas.
```

#### Reordenamiento Urbano (Arquitecto B)

```
INPUT REQUERIDO:
- Durante 1 ronda, el Arquitecto puede:
  - Tomar 2 propiedades de un jugador y darlas a otro.
  - Mover propiedades del Mercado a manos de jugadores específicos.
  - Intercambiar 1 propiedad propia con cualquier otra de la mesa.

EFECTO:
- El Arquitecto puede ejecutar las 3 acciones en cualquier orden durante la duración.
- Cada acción es libre (no cuenta como carta jugada).

UI:
- Modo especial "Reordenamiento" con UI distinta:
  - Vista global de todas las propiedades de la mesa.
  - Click+drag para mover.
  - Confirmación antes de aplicar cada movimiento.

COSTO DE SALIDA:
- En la ronda siguiente, el Arquitecto no puede modificar sus propios sets.
```

---

## 14. SISTEMA DE TIEMPO EXTRA

### Disparo

Cuando un jugador completa la condición de victoria (3 sets completos, o 2 sets + 1 propiedad si es Coleccionista, o 2 sets contando un Monumento como 2):

```
1. phase = 'tiempo_extra'.
2. Sistema identifica el jugador "potencial ganador" (triggeringPlayerId).
3. Sistema arma la lista de jugadores en orden de turno desde el siguiente al potencial ganador.
4. Animación dramática:
   - Fondo se oscurece.
   - Aparece banner gigante "TIEMPO EXTRA" con efecto moderno con typografía bold.
   - Sonido épico de tensión.
5. Banner persistente durante toda la fase: "TIEMPO EXTRA - [Jugador potencial ganador] está a 1 turno de ganar".
```

### Flujo

```
6. Cada jugador en orden tiene 1 turno completo donde:
   - Las cartas que pueden romper sets brillan visualmente en su mano (Confiscación, Trato Sucio, Trueque Forzado, etc.).
   - El jugador puede jugar normalmente sus 3 cartas.
   - Si en algún momento durante el turno el "potencial ganador" deja de cumplir la condición de victoria → SE CANCELA TIEMPO EXTRA.
     - phase vuelve a 'playing'.
     - El juego continúa normalmente desde el turno actual.
     - Mostrar log: "[Jugador X] rompió el set de [Potencial Ganador]. Tiempo Extra cancelado".
7. Si todos los jugadores completan su turno sin romper la condición:
   - phase = 'game_over'.
   - winner = potential ganador.
   - Mostrar pantalla de fin de partida.
```

### Edge cases

- Si durante Tiempo Extra alguien activa una Expansión de Dominio, la Expansión se aplica normalmente (puede usarse para romper el set).
- Si durante Tiempo Extra alguien gana también la condición de victoria (poco probable pero posible), Tiempo Extra continúa con AMBOS jugadores como potenciales ganadores. Si los dos sobreviven hasta el final, gana el que la activó primero.
- Si la condición se rompe y luego se recompletea durante el mismo Tiempo Extra: dispara de nuevo Tiempo Extra desde el principio (los jugadores tienen otra oportunidad).

---

## 15. LAS 9 PANTALLAS COMPLETAS

### 15.1 HomeScreen — pantalla inicial

**Ruta:** `/`

**Contenido:**
- Logo YAJUGÁ centrado, grande, en font-display con la paleta de marca.
- Subtítulo: "DOMINIO" en font-display más pequeño.
- Tagline animado: "Cada calle tiene dueño. Cada dueño tiene precio." (typewriter effect, sutil).
- Input de texto: "Tu nickname" (max 20 caracteres, validación de no estar vacío).
- 2 botones grandes:
  - "CREAR PARTIDA" (botón primario, paleta YAJUGÁ).
  - "UNIRME A PARTIDA" (botón secundario, outline).
- Link al pie: "¿Cómo se juega?" → abre TutorialScreen.
- Toggle de modo oscuro/claro en la esquina superior derecha (icono sol/luna).
- Toggle de sonido on/off (icono speaker).

**Estados de los botones:**
- Default: opacity 100%, cursor pointer.
- Hover: scale-105, brightness +10%.
- Active (clicked): scale-95.
- Disabled (nickname vacío): opacity 50%, cursor not-allowed, tooltip "Necesitás un nickname para continuar".
- Focus (keyboard): outline visible con color mustard.

**Comportamientos:**
- Click en "CREAR PARTIDA":
  - Validar nickname.
  - Crear nuevo gameId (uuid).
  - Inicializar el peer del host.
  - Navegar a `/game/[gameId]` como host.
- Click en "UNIRME A PARTIDA":
  - Mostrar modal con input "Pegá el código de partida".
  - Validar formato.
  - Navegar a `/game/[gameId]` como peer no-host.

**Animaciones:**
- Logo: leve "respiración" (scale 1.0 ↔ 1.02 cada 4 segundos).
- Tagline: typewriter effect al cargar la pantalla (1.5 segundos).
- Botones al aparecer: stagger entrance (botones aparecen con 100ms de diferencia).

### 15.2 LobbyScreen / Sala de espera

**Ruta:** `/game/[gameId]` (cuando phase = 'lobby')

**Contenido:**
- Header con código de partida grande para compartir.
- Botón "Copiar link" al lado del código.
- Lista de jugadores conectados (avatar placeholder con iniciales + nickname + indicador de conexión).
- Slots vacíos visibles (hasta 4): "Esperando jugador..." con animación pulsante.
- Si sos el host:
  - Botón "EMPEZAR PARTIDA" (deshabilitado si menos de 2 jugadores).
  - Botón "Cancelar partida".
- Si NO sos el host:
  - Texto "Esperando que [Host] empiece la partida...".
  - Botón "Salir".

**Estados:**
- Si la partida está llena (4/4): los slots de espera desaparecen.
- Si un jugador se desconecta: su slot pasa a "Desconectado" (gris, animación de desvanecimiento).

**Comportamientos:**
- Click en "Copiar link": copia al clipboard la URL completa, muestra toast "Link copiado".
- Click en "EMPEZAR PARTIDA":
  - Validar 2-4 jugadores conectados.
  - Iniciar `assignRolesAndExpansions()`.
  - phase = 'role_assignment' (transición animada).
  - Después de la animación, phase = 'playing'.

### 15.3 Pantalla de Asignación de Roles

**Ruta:** misma `/game/[gameId]`, phase 'role_assignment'.

**Contenido:**
- Animación cinematográfica: cada jugador ve una "ruleta" girando con todos los roles posibles.
- Sound: efecto de ruleta girando (opcional).
- Después de 2 segundos, la ruleta se detiene y revela el rol asignado.
- Bajo el rol, animación similar para la Expansión asignada.
- Una vez todos los jugadores tienen su rol y Expansión revelados, botón "ENTENDIDO" para continuar.
- Cuando todos clickean "ENTENDIDO", phase = 'playing'.

**Display del rol asignado:**
- Retrato pixel grande del rol.
- Nombre en font-display.
- Descripción de habilidad pasiva.
- Nombre de la Expansión asignada con descripción.
- Visual: color de la paleta asociado al rol.

### 15.4 GameScreen — la mesa de juego

**Ruta:** `/game/[gameId]` (phase = 'playing')

**Layout (desktop, 1280x720+):**

```
+--------------------------------------------------------------+
| HEADER: Logo YAJUGÁ pequeño | Turno actual | Timer | Settings |
+--------------------------------------------------------------+
|                                                              |
|  [Oponente 2]                              [Oponente 3]      |
|  - Sets, Banco, Mano (cantidad)            - Sets, Banco...  |
|                                                              |
|                                                              |
|         +-------- MAZO --------+    +-- DESCARTE --+         |
|         |                      |    |              |         |
|         +----------------------+    +--------------+         |
|                                                              |
|         +---------- MERCADO (3 cartas) ----------+           |
|         |   [Carta1]   [Carta2]   [Carta3]      |            |
|         +----------------------------------------+           |
|                                                              |
|                  [Banner de Titular activo]                  |
|                                                              |
|                                                              |
|                  [Oponente 1 enfrente]                       |
|                                                              |
|                                                              |
|  [TUS SETS]              [TU BANCO]              [INFO]      |
|                                                              |
|  +-------------- TU MANO (cartas) ----------------+          |
|  | [Carta] [Carta] [Carta] [Carta] [Carta]        |          |
|  +-------------------------------------------------+          |
|                                                              |
|  [TERMINAR TURNO]   [EXPANSIÓN]   [LOG]   [AYUDA]            |
+--------------------------------------------------------------+
```

**Zonas detalladas:**

**HEADER:**
- Logo YAJUGÁ (pequeño, link a confirmar salida si se clickea).
- Turno actual: "Turno de [Jugador]" con avatar pequeño.
- Timer del turno (opcional, no estricto en MVP).
- Botón Settings (engranaje): abre modal con toggles (modo oscuro, sonido, animaciones).

**OPONENTES (2-3 oponentes en MVP):**
- Avatar pixel + nickname.
- Indicador de turno actual (highlight si es su turno).
- Sets visibles (cartas reducidas, click para ver detalle).
- Banco con monto total (no detalle de cartas).
- Cantidad de cartas en mano (no contenido, salvo si Auditoría está activa).
- Indicador de medidor de Expansión (barra pequeña con porcentaje).
- Indicador de rol con icono.
- Click en avatar de oponente: muestra detalle de su zona (modal o panel lateral).

**MAZO:**
- Reverso de carta (logo YAJUGÁ).
- Counter visual de cartas restantes (ej: "62").
- No clickeable.

**DESCARTE:**
- Última carta descartada visible.
- Click: muestra modal con todas las cartas descartadas (orden inverso).

**MERCADO:**
- 3 slots con cartas boca arriba.
- Hover sobre una carta: tooltip con precio.
- Click: modal de confirmación de compra (si tiene dinero).
- Si no tiene dinero: tooltip "Necesitás $X" y carta gris.

**TU ZONA (jugador local):**
- Tus sets: cartas agrupadas por color, visibles, clickeables para reorganizar.
- Tu banco: cartas de dinero apiladas, click para ver detalle.
- Tu mano: cartas en línea, click+arrastre o click+click para jugar.
- Info: muestra tu rol, tu expansión, descripción.

**MANO:**
- Cartas visibles boca arriba.
- Hover: la carta se eleva ligeramente.
- Click: aparece menú contextual con opciones según el tipo de carta:
  - Propiedad: "A un set" / "Al banco".
  - Comodín: "A un set" (selección de color) / "Al banco".
  - Acción: "Jugar acción" / "Al banco".
  - Renta: "Cobrar renta" / "Al banco".
  - Edificio/Torre: "Mejorar set" / "Al banco".
  - Dinero: "Al banco" (única opción).

**Botones inferiores:**
- TERMINAR TURNO: solo habilitado si jugó al menos 0 cartas (puede pasar sin jugar). Si tiene >7 cartas en mano, primero modal de descarte.
- EXPANSIÓN: visible siempre, deshabilitado hasta que el medidor llegue a 100%. Al activarse, modal de confirmación.
- LOG: abre panel lateral con historial de la partida (cada acción ocurrida con timestamp).
- AYUDA: abre tutorial integrado contextual.

### 15.5 Modal de Defensa

(Detallado en sección 10)

### 15.6 Modal de Activación de Expansión

(Detallado en sección 13)

### 15.7 Modal de Tiempo Extra

(Detallado en sección 14)

### 15.8 GameOverScreen — fin de partida

**Ruta:** `/game/[gameId]` (phase = 'game_over')

**Contenido:**
- Header dramático: "FIN DE PARTIDA" en font-display gigante.
- Avatar y nombre del ganador en grande, con animación de "trofeo" (icono Trophy de Lucide ampliado).
- Estadísticas de la partida:
  - Duración total.
  - Cantidad de turnos.
  - Cartas jugadas por cada jugador.
  - Expansiones activadas.
  - MVP del juego (jugador con más rentas cobradas).
- Lista de los demás jugadores en orden con sus stats.
- Botones:
  - "REVANCHA" (mismo grupo, nueva partida con la misma sala).
  - "VOLVER AL INICIO".
  - "COPIAR RESUMEN" (genera texto formateado para compartir en WhatsApp/redes).

### 15.9 TutorialScreen — cómo jugar

**Ruta:** `/tutorial`

**Contenido:**
- Pantalla de tutorial con secciones expandibles (accordion):

  1. **Objetivo del juego** — completar 3 sets de propiedades.
  2. **Tu turno** — robar 2 cartas, jugar hasta 3.
  3. **Tipos de cartas** — propiedades, dinero, acciones, comodines, rentas, edificios.
  4. **Cobrar rentas** — cómo funciona.
  5. **Defensa** — los 3 tipos de respuesta.
  6. **Mercado** — cómo comprar cartas extra.
  7. **Titulares** — los eventos globales.
  8. **Roles y Expansiones** — la mecánica firma.
  9. **Tiempo Extra** — la última vuelta.
  10. **Final del juego** — cómo se gana.

- Cada sección con ilustraciones pixel art mostrando el concepto.
- Botón "Volver al juego" si está en el contexto de una partida (minimiza el modal).
- Botón "Volver al inicio" si está en /tutorial directamente.

**Comportamiento:**
- Si se accede desde la GameScreen (botón AYUDA), se abre como modal sobre la mesa (no navegación, pausa visual).
- Si se accede desde HomeScreen, es pantalla completa.


## 16. CADA BOTÓN: ESTADOS Y COMPORTAMIENTOS

Esta sección establece el contrato de comportamiento estándar para todos los botones del juego. Cualquier desviación debe documentarse.

### Estados estándar de un botón

```
DEFAULT
- Color de fondo según variant (primary, secondary, danger, ghost).
- Cursor: pointer.
- Sombra sutil moderna (shadow-sm).

HOVER
- Sombra aumenta (offset 4px).
- Brillo +10%.
- Transición: 80ms.
- Cursor: pointer.

ACTIVE (mientras está clickeado)
- Sombra desaparece (botón parece "presionado").
- Movimiento: scale-95 con transición fast.
- Transición: instant.

DISABLED
- Opacity 50%.
- Cursor: not-allowed.
- Sin hover effect.
- Tooltip al hover explicando por qué está deshabilitado.

FOCUS (keyboard)
- Outline visible: 2px solid color mustard.
- Outline-offset: 2px.

LOADING (cuando una acción está en progreso)
- Texto reemplazado por spinner moderno (Lucide Loader2).
- Disabled mientras carga.
```

### Variants de botones

```
PRIMARY (acciones principales: Empezar, Confirmar, Activar)
- Background: coral (`#FF5722`).
- Texto: bone (`#F8F5EE`).
- Border: 1px solid ink.

SECONDARY (acciones secundarias: Volver, Cancelar)
- Background: bone (`#F8F5EE`).
- Texto: ink.
- Border: 1px solid ink.

DANGER (acciones destructivas: Salir, Romper)
- Background: coralActive (`#E04515`).
- Texto: bone (`#F8F5EE`).
- Border: 1px solid ink.

GHOST (acciones terciarias: Tooltip, Info)
- Background: transparent.
- Texto: ink (modo claro) / bone (modo oscuro).
- Sin outline visible hasta hover.
```

### Comportamientos post-click específicos

| Botón | Comportamiento al clickear |
|---|---|
| Crear partida | Loading spinner por 500ms, navegación a /game/[id] |
| Unirme a partida | Modal de input, validación, navegación |
| Empezar partida | Animación de role assignment (3 segundos), luego phase 'playing' |
| Carta de la mano | Animación de elevación, menú contextual aparece |
| Carta del mercado | Modal de confirmación de compra |
| Bloquear (defense) | Animación de cancelación, modal cierra |
| Negociar | Submodal con input de propuesta |
| Contraataque | Aplicación inmediata, animación de carta robada |
| Activar Expansión | Modal de confirmación, después animación cinematográfica |
| Terminar turno | Modal de confirmación si quedan jugadas pendientes |
| Confirmar descarte | Animación de cartas descartadas |
| Pagar deuda (Préstamo Forzado) | Modal de selección de cartas para pagar |
| Romper protección (Inmunidad) | Modal de confirmación + descuento de 5M |

---

## 17. ANIMACIONES — CATÁLOGO COMPLETO

### Principios de animación

1. **Pixel-perfect snapping.** Las animaciones que mueven elementos pixel art deben snappear a la grilla pixel (no movimientos sub-pixel que generen blur).
2. **Duración corta.** El MVP es para validar gameplay, no para deslumbrar. Animaciones cortas (80-400ms para casi todo).
3. **Easing apropiado.** Easings declarados en sección 4. Usar consistentemente.
4. **Respetar `prefers-reduced-motion`.** Si el usuario tiene esa preferencia activada, reducir o eliminar animaciones no esenciales.
5. **No bloquear el juego.** Las animaciones largas (cinematic, dramatic) son SKIPPABLES con click o tecla espacio.

### Catálogo de animaciones

| Evento | Duración | Easing | Descripción |
|---|---|---|---|
| Carta robada del mazo | 250ms | out | Carta vuela del mazo a la mano del jugador |
| Carta jugada de la mano | 400ms | out | Carta vuela de la mano al destino (set, banco, descarte) |
| Carta a propiedad | 300ms | out | Carta se asienta en el set con bounce sutil |
| Carta al banco | 250ms | inOut | Carta gira y se apila |
| Cobro de renta | 600ms | out | Las cartas de pago vuelan del defensor al atacante |
| Compra del mercado | 350ms | out | Carta vuela del mercado a la mano + nueva carta llega al mercado |
| Modal de Defensa aparece | 250ms | bouncy | Modal entra desde abajo con bounce |
| Modal cierra | 150ms | in | Fade out + slide down |
| Activación de Expansión | 1500ms | inOut | Mesa oscurece + nombre aparece + shockwave + sonido |
| Aplicación de Expansión específica | varía | varía | Cada Expansión tiene su animación firma (definir por separado) |
| Tiempo Extra dispara | 800ms | bouncy | Banner aparece desde arriba con bounce dramático |
| Titular aparece | 400ms | out | Carta se levanta del centro + flash sutil |
| Asignación de rol | 2000ms | inOut | Ruleta gira y se detiene |
| Set se completa | 500ms | bouncy | Las propiedades se reagrupan con efecto de "completion" + brillo |
| Game over | 1000ms | out | Confetti sutil + zoom al ganador |

### Animaciones específicas de Expansiones

Cada Expansión tiene su propia animación cinematográfica al activarse. Estilo general: 1.5s, oscurecer mesa, mostrar nombre con efecto firma, luego transitar al efecto.

- **Tribunal del Dominio:** martillo de juez golpea, ondas expansivas sutiles.
- **Inmunidad Diplomática:** sello de cera apareciendo con texto "INMUNE".
- **Subasta del Siglo:** martillo de subasta golpeando con "VENDIDO".
- **Pacto Comercial:** apretón de manos animado + papel firmado.
- **El Truco:** cartas mezclándose rápidamente, manos apareciendo y desapareciendo.
- **Doble Identidad:** silueta del Estafador transformándose en silueta del suplantado.
- **Auditoría Forzada:** bóveda abriendo, dinero volando hacia el Banquero.
- **Préstamo Forzado:** contratos firmándose en cadena, cadenas animadas.
- **Trueque Imperial:** corona apareciendo sobre el Coleccionista, propiedades intercambiándose.
- **Cámara del Archivo:** vitrinas apareciendo, propiedades del color flotando hacia ahí.
- **Rascacielos:** edificio creciendo en time-lapse.
- **Reordenamiento Urbano:** mapa siendo redibujado.

---

## 18. NOTIFICACIONES Y FEEDBACK AL USUARIO

### Toasts (notificaciones flotantes)

Aparecen en la esquina inferior derecha, persisten 3-5 segundos, dismissibles por click.

**Tipos:**
- `info` (gris carbón): información neutral.
- `success` (ámbar dorado): acción exitosa.
- `warning` (mostaza): advertencia.
- `error` (coral): error.

**Eventos que disparan toasts:**
- Conexión exitosa.
- Conexión perdida.
- Carta jugada (opcional, puede ser ruido).
- Movimiento ilegal intentado.
- Compra del mercado exitosa.
- Errores de validación.

### Banners persistentes

En el header de la GameScreen, banners que persisten mientras un efecto está activo:

- "Titular activo: [Nombre]" (con icono).
- "Expansión activa: [Nombre]" (con timer si aplica).
- "Tiempo Extra".
- "Sos el acusado/acusador en el Tribunal".

### Modal vs toast vs banner

- **Modal:** decisiones que requieren input del usuario (Defensa, confirmación, etc.).
- **Toast:** información rápida que NO requiere acción.
- **Banner:** estado persistente importante (efecto activo, fase especial).

### Sonidos (opcional pero recomendado)

Si el usuario tiene sonidos activados:
- Tu turno: campanita sutil.
- Carta jugada: "click" sutil.
- Renta cobrada: "ka-ching" sutil.
- Defensa activada: alerta sutil.
- Expansión activada: efecto épico dramático.
- Tiempo Extra: tensión.
- Victoria: fanfarria sutil.

Todos los sonidos deben tener volumen razonable y opción de mute. Usar Howler.js si se implementan.

---

## 19. TUTORIAL INTEGRADO Y BOTÓN DE INFO

### Botón de AYUDA (en GameScreen)

- Posición: esquina inferior derecha o en el footer del juego.
- Icono: HelpCircle de Lucide.
- Click: abre modal de tutorial **contextual**.

### Tutorial contextual

El tutorial detecta en qué fase del juego está el usuario y muestra la información más relevante:
- Si está en su turno → "Cómo se juega un turno".
- Si recibió un Defense → "Cómo defenderte".
- Si tiene Expansión cargada → "Cómo activar tu Expansión".
- Si está en Tiempo Extra → "Qué es Tiempo Extra".

El tutorial completo está disponible en `/tutorial` desde el menú principal.

### Onboarding primera vez

La primera vez que un jugador inicia su primera partida, mostrar un onboarding rápido:
- 4 pasos con tooltips:
  1. "Esta es tu mano. Click en una carta para jugarla."
  2. "Estos son tus sets. Necesitás 3 sets completos para ganar."
  3. "Este es el Mercado. Podés comprar cartas con el dinero de tu banco."
  4. "Cuando termines, click en TERMINAR TURNO."
- Si el jugador clickea "Saltear", no se muestra de nuevo (persistir en localStorage).

### Tooltips

Hover sobre cualquier elemento del juego durante >800ms muestra tooltip explicativo:
- Cartas en mano: nombre + descripción + efecto.
- Cartas en sets ajenos: nombre + valor de renta del set.
- Iconos de oponentes: rol + estado de medidor.
- Mercado: precio + descripción.
- Botones: explicación de la acción.

---

## 20. MODO OSCURO / MODO CLARO

### Implementación

```ts
// src/stores/prefsStore.ts
interface PrefsState {
  theme: 'light' | 'dark';
  sound: boolean;
  animations: boolean;
  toggleTheme: () => void;
  toggleSound: () => void;
  toggleAnimations: () => void;
}

// Persistir en localStorage al cambiar.
// Aplicar clase 'dark' al <html> según preferencia.
```

### Default

- Default: modo oscuro (más coherente con el tono épico premium).
- Toggle visible siempre en el header (icono sol ↔ luna).
- Cambio de modo: animación de transición de 300ms en colores de fondo (no abrupto).

### Reglas de contraste

- Modo claro: fondo bone, texto ink. Cartas con sus colores normales.
- Modo oscuro: fondo ink, texto bone. Cartas mantienen su identidad de color pero con ligero ajuste de luminosidad para mantener contraste.
- Outlines siempre visibles en ambos modos.
- Cumplir WCAG AA para contraste de texto (4.5:1 mínimo).

---

## 21. MULTIJUGADOR — ARQUITECTURA Y EDGE CASES

### Stack de multijugador

PeerJS sobre WebRTC para comunicación P2P entre 2-4 jugadores. El host es el primer jugador (el que crea la sala) y mantiene la fuente de verdad del estado.

### Setup

```ts
// src/multiplayer/peer.ts
import Peer from 'peerjs';

export function initHostPeer(gameId: string): Peer {
  const peer = new Peer(gameId);
  peer.on('connection', handleNewConnection);
  return peer;
}

export function joinPeer(gameId: string): Peer {
  const peer = new Peer();
  const conn = peer.connect(gameId);
  conn.on('open', () => {
    conn.send({ type: 'JOIN_REQUEST', nickname: getCurrentNickname() });
  });
  return peer;
}
```

### Sincronización del estado

El host mantiene la verdad del `gameState`. Cada vez que se aplica una acción:
1. Host computa nuevo estado.
2. Host envía `STATE_UPDATE` con el estado completo a todos los peers.
3. Peers reciben y reemplazan su `gameState` local.

**Optimización futura (no MVP):** delta updates en lugar de estado completo. Para el MVP, mandar el estado completo es más simple y robusto.

### Manejo de desconexiones

```
SI UN PEER (NO-HOST) SE DESCONECTA:
1. Host detecta disconnect (PeerJS dispara 'close' o 'error').
2. Host marca al jugador como `isConnected: false`.
3. Si la partida no está en curso (lobby): elimina al jugador de la lista.
4. Si la partida está en curso:
   - Si era el turno del jugador desconectado: el host avanza al siguiente jugador después de 30 segundos de espera.
   - Si vuelve a conectarse en 30 segundos: continúa normalmente.
   - Si no vuelve en 30 segundos: el jugador queda como AFK (sus cartas no se juegan, simplemente pasa su turno cada vez).

SI EL HOST SE DESCONECTA:
1. Los peers detectan disconnect.
2. La partida se "congela".
3. Mostrar pantalla "El host se desconectó. Esperando..." con timer de 60 segundos.
4. Si el host vuelve en 60 segundos: la partida continúa.
5. Si no vuelve: la partida termina, todos vuelven al inicio.

   FUTURE: implementar "host migration" donde otro peer puede tomar el rol de host. NO en MVP.
```

### Latencia y experiencia

- Para acciones del jugador local: aplicar OPTIMÍSTICAMENTE el cambio en la UI antes de que el host confirme. Si el host rechaza, revertir.
- Para acciones de otros jugadores: aplicar SOLO al recibir `STATE_UPDATE` del host.

### Heartbeat

Cada 5 segundos, host envía `PING` a todos los peers. Si un peer no responde con `PONG` en 10 segundos, se considera desconectado.

### Edge cases

- Dos jugadores con el mismo nickname: agregar sufijo " (2)" al segundo.
- Jugador intenta unirse a partida ya iniciada: rechazar con mensaje.
- Jugador intenta unirse a partida llena: rechazar con mensaje.
- gameId inválido: mostrar "Partida no encontrada" y volver al inicio.

---

## 22. EDGE CASES EXTENSIVOS

Lista de situaciones a manejar explícitamente:

### Mazo y cartas

- **Mazo vacío:** mezclar el descarte (sin la última carta) y crear nuevo mazo.
- **Descarte vacío Y mazo vacío:** continuar la partida con las cartas en juego, no se roban más cartas hasta que algo se descarte.
- **Mano vacía al inicio del turno:** robar 5 cartas en lugar de 2.
- **Mano > 7 al final del turno:** forzar descarte.
- **Mano = 0 después de jugar todo:** continuar normalmente.
- **Carta inválida en mano:** ignorar (no debería pasar, pero si pasa, log de error).

### Sets y propiedades

- **Set completado por confiscación:** aplicar bonus de set completo.
- **Set roto por trato sucio:** las propiedades vuelven a estar sueltas.
- **Comodín en set incompleto:** sigue funcionando.
- **Comodín movido a otro set durante el turno:** sin costo de carta jugada, ilimitado en el turno.
- **Set Monumento atacado:** atacante debe pagar 5M antes de intentar; el ataque puede igual fallar por Defense.
- **Múltiples Set Monumentos:** NO permitido (cada Arquitecto solo puede declarar 1).
- **Coleccionista con condición de victoria especial:** verificar 2 sets + 1 propiedad suelta.

### Turnos y fases

- **Jugador activa Expansión y se desconecta:** la Expansión se cancela al detectar desconexión, sin aplicar costo de salida (porque no llegó a beneficiarse).
- **Defensa pendiente y atacante se desconecta:** asumir timeout, ataque NO se aplica.
- **Tiempo Extra y jugador potencial-ganador se desconecta:** se cancela Tiempo Extra; si vuelve a conectarse, recomputar condición de victoria.
- **Jugador termina turno sin jugar cartas:** permitido, su turno termina y pasa al siguiente.

### Dinero y pagos

- **Jugador debe pagar más de lo que tiene:** paga lo que tiene, no se queda debiendo (excepción: Préstamo Forzado).
- **Pago con propiedad: la propiedad va al banco del cobrador, no a sus sets.**
- **Pago con propiedad de set completo:** rompe el set.
- **No tiene cartas para pagar:** acción se cancela, atacante no recibe nada.

### Defensas

- **Bloqueo intentado sin tener carta:** el botón está deshabilitado, no es posible.
- **Múltiples ataques simultáneos (Cuota):** procesar uno por uno, secuencialmente.
- **Defensa exitosa: la carta atacante vuelve a la mano del atacante o al descarte?** → A la mano (decisión de balance).

### Expansiones

- **Activar Expansión cuando no es tu turno:** botón deshabilitado.
- **Activar Expansión con medidor < 100%:** botón deshabilitado.
- **Activar Expansión ya usada:** botón deshabilitado (`expansionUsed = true`).
- **Tribunal: Abogado solo tiene 1 oponente:** ese oponente debe ser tanto acusado como acusador, simplificación.
- **Inmunidad: el protegido es el Abogado:** permitir, es válido auto-protegerse.
- **Pacto Comercial: alguien intenta romperlo:** descontar 5M y todas las rentas del turno.
- **Auditoría Forzada: jugador no tiene banco:** no entrega nada.
- **Préstamo Forzado: el Banquero no tiene dinero para prestar a todos:** presta lo que pueda, los que recibieron deben (si recibió 0, no debe nada).
- **El Truco: solo hay 2 jugadores:** el Estafador no puede ejecutarlo bien (no hay suficientes cartas para mezclar). Permitir solo con 3+ jugadores; con 2 jugadores, deshabilitar esa Expansión.
- **Doble Identidad: el suplantado se desconecta durante:** mantener el efecto, las acciones se atribuyen al suplantado igual.
- **Cámara del Archivo: nadie tiene propiedades del color elegido:** Expansión se ejecuta pero sin efecto, no se aplica costo de salida.
- **Rascacielos: el set elegido pierde una propiedad después:** el Set Monumento deja de aplicar inmediatamente (pierde inmunidad a robos también).

### Multijugador

- **Mensaje fuera de orden:** ignorar mensajes con `version` o `seq` menor que el último procesado.
- **Re-envío de mensaje:** detectar duplicados con ID único de mensaje.
- **Conexión inestable:** reintentar automáticamente hasta 3 veces, luego marcar como desconectado.

---

## 23. ACCESIBILIDAD

### Keyboard navigation

- Tab para navegar entre elementos interactivos.
- Enter / Space para activar botones.
- Esc para cerrar modales.
- Arrow keys en menús de selección.
- Atajos:
  - `T` para terminar turno.
  - `E` para activar Expansión (si está cargada).
  - `H` para abrir ayuda.
  - `L` para abrir log.

### Screen readers

- Cada botón tiene `aria-label` descriptivo.
- Modales tienen `role="dialog"` y `aria-labelledby`.
- Cambios importantes (turno, Expansión, Tiempo Extra) anunciados con `aria-live="polite"`.
- Cambios críticos (Defensa pendiente) con `aria-live="assertive"`.

### Contraste

- Mínimo WCAG AA (4.5:1 para texto normal, 3:1 para texto grande).
- Verificar en ambos modos (claro/oscuro).

### Motion

- Respetar `prefers-reduced-motion`. Si está activado:
  - Reducir todas las animaciones a fade in/out de 100ms.
  - Eliminar animaciones cinematográficas largas (saltar al estado final).

### Tamaños mínimos

- Botones: mínimo 44x44 px (touch target accesible).
- Texto: mínimo 14px para texto secundario, 16px para texto principal.
- Cartas: tamaño visible aún en pantallas pequeñas.

---

## 24. RESPONSIVE — DESKTOP, TABLET, MÓVIL

### Breakpoints

```ts
// tailwind.config.ts
screens: {
  sm: '640px',    // Móvil grande
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop pequeño
  xl: '1280px',   // Desktop estándar
  '2xl': '1536px' // Desktop grande
}
```

### Targets por breakpoint

**Desktop (xl+):** experiencia completa, layout horizontal con todas las zonas visibles.

**Tablet (md-lg):** layout adaptado, oponentes en panel lateral colapsable, mesa en centro.

**Móvil (sm):** layout vertical, una zona visible a la vez con tabs (Mi mano | Sets | Mercado | Oponentes), gestos de swipe entre tabs.

**Móvil pequeño (<sm):** **NO soportado en MVP.** Mostrar mensaje "YAJUGÁ funciona mejor en pantallas más grandes. Probá en tu compu o tablet."

### Tamaño mínimo recomendado

768px de ancho. El MVP prioriza desktop y tablet. Móvil es secundario y se puede mejorar en fase 6.

---

## 25. PERSISTENCIA LOCAL

### Qué se guarda en localStorage

```ts
// Preferencias del usuario
{
  theme: 'dark' | 'light',
  sound: boolean,
  animations: boolean,
  lastNickname: string,
  hasSeenOnboarding: boolean,
}
```

### Qué NO se guarda

- Estado de partida en curso (vive solo en memoria).
- Información de oponentes.
- Cualquier dato sensible.

### Cookies

NO usar cookies. Si se necesitan en el futuro (analytics, etc.), implementar banner de consentimiento.

---

## 26. ERRORES Y RECUPERACIÓN

### Manejo global de errores

```ts
// src/utils/errorBoundary.tsx
// React Error Boundary que captura errores de UI.
// Muestra pantalla de error con botón "Volver al inicio" y "Reportar bug".
```

### Errores de red

- Conexión perdida: toast persistente "Conexión perdida. Reintentando..." con animación.
- Timeout de mensaje: reintentar 3 veces, luego mostrar error.
- Estado desincronizado: forzar `STATE_UPDATE` desde el host.

### Errores de juego

- Acción inválida (validación falla): mostrar toast de error, no aplicar acción.
- Estado inconsistente detectado: log de error en consola, intentar recuperar desde el host.

### Logging para debugging

- Cada acción del jugador se loggea en `gameState.log`.
- Cada error se loggea en consola con contexto.
- En desarrollo: panel de debug visible (toggle con tecla `D`).

---

## 27. PLAN DE IMPLEMENTACIÓN POR FASES

**IMPORTANTE:** seguí estrictamente este orden. No saltees fases. Pausá al final de cada fase para verificar criterios de aceptación.

### Fase 1: Setup del proyecto (1 día)

**Tareas:**
- Inicializar Vite + React + TypeScript.
- Configurar Tailwind con design tokens del bundle.
- Configurar Zustand, Framer Motion, PeerJS, Lucide.
- Setup de carpetas según sección 3.
- Configurar fuentes (auto-host Geist Sans, Inter, Geist Mono mediante npm packages `geist` y `@fontsource/inter`).
- Crear `App.tsx` con routing básico.
- Crear `globals.css` con estilos base.

**Criterios de aceptación:**
- `npm run dev` corre sin errores.
- Todas las dependencias instaladas.
- Estructura de carpetas creada.
- Una página de "Hello YAJUGÁ" se renderiza.

### Fase 2: Componentes UI base (1-2 días)

**Tareas:**
- Implementar `<Button>` con todas las variants y estados.
- Implementar `<Modal>` reutilizable.
- Implementar `<Toast>` (con context provider).
- Implementar `<Tooltip>`.
- Implementar `<Card>` (componente visual de carta, no la lógica de juego).
- Implementar toggle de modo oscuro/claro.
- Implementar `<NicknameInput>`.

**Criterios de aceptación:**
- Storybook (opcional) o página de demos con todos los componentes en sus estados.
- Tests visuales manuales aprobados.

### Fase 3: Pantallas básicas (2 días)

**Tareas:**
- Implementar `HomeScreen` completa.
- Implementar `LobbyScreen` con jugadores hardcoded primero.
- Implementar `TutorialScreen` con contenido placeholder.
- Routing entre pantallas funcionando.
- Toggle de modo oscuro persistido.

**Criterios de aceptación:**
- Navegación entre pantallas funciona.
- Diseño visual coincide con los mockups.
- Modo oscuro/claro funciona.

### Fase 4: Lógica de juego pura (3 días)

**Tareas:**
- Implementar `src/game/cards.ts`: definiciones de las 110 cartas + 8 Titulares.
- Implementar `src/game/deck.ts`: construcción y shuffle.
- Implementar `src/game/rules.ts`: validaciones (¿es turno de X?, ¿puede jugar Y carta?, etc.).
- Implementar `src/game/actions.ts`: aplicación de cada acción.
- Implementar `src/game/turn.ts`: lógica de turnos.
- Tests unitarios de cada función.

**Criterios de aceptación:**
- Tests pasan al 100%.
- Una partida puede simularse mediante código sin UI (input → estado → input → estado).

### Fase 5: GameStore y estado (1 día)

**Tareas:**
- Implementar `gameStore` de Zustand.
- Conectar acciones del juego al store.
- Implementar mutaciones inmutables.

**Criterios de aceptación:**
- Estado se actualiza correctamente con cada acción.
- DevTools muestran cambios.

### Fase 6: GameScreen y UI de partida (3-4 días)

**Tareas:**
- Implementar layout de GameScreen.
- Conectar visualmente el `gameStore` a los componentes.
- Implementar interacciones: click en cartas, drag opcional, menús contextuales.
- Implementar visualización de sets, banco, mano, mercado, mazo, descarte.
- Implementar animaciones básicas (carta robada, jugada, etc.).

**Criterios de aceptación:**
- Una partida completa puede jugarse en single-player local (todos los jugadores en el mismo navegador).
- Las 10 cartas de acción funcionan correctamente.
- Sets se completan y dan victoria.

### Fase 7: Sistema de Defensa (1-2 días)

**Tareas:**
- Implementar `<DefenseModal>` con los 3 botones.
- Implementar timer de 8 segundos.
- Implementar las 3 lógicas: bloquear, negociar, contraatacar.
- Implementar submodal de negociación.

**Criterios de aceptación:**
- Defensa funciona para todos los tipos de ataque.
- Timeout funciona.

### Fase 8: Mercado y Titulares (1-2 días)

**Tareas:**
- Implementar zona del Mercado.
- Implementar lógica de compra.
- Implementar reposición.
- Implementar el mazo de Titulares.
- Implementar el flujo de Titular cada 5 turnos.
- Implementar los 8 efectos de Titulares.

**Criterios de aceptación:**
- Mercado funciona.
- Titulares aparecen y aplican efectos.

### Fase 9: Roles y Expansiones de Dominio (3-4 días)

**Tareas:**
- Implementar definiciones de los 6 roles.
- Implementar definiciones de las 12 Expansiones.
- Implementar asignación aleatoria.
- Implementar medidor de carga.
- Implementar activación con animación cinematográfica.
- Implementar lógica específica de cada Expansión.
- Implementar costos de salida.

**Criterios de aceptación:**
- Los 6 roles + 12 Expansiones funcionan correctamente.
- Animaciones lucen bien.
- Costos de salida se aplican.

### Fase 10: Tiempo Extra (1 día)

**Tareas:**
- Implementar disparo de Tiempo Extra al completar condición de victoria.
- Implementar flujo de "última vuelta" para cada oponente.
- Implementar cancelación si el set se rompe.
- Implementar UI dramática de Tiempo Extra.

**Criterios de aceptación:**
- Tiempo Extra funciona en single-player local.

### Fase 11: Multijugador (3-4 días)

**Tareas:**
- Setup de PeerJS.
- Implementar host: crear sala, recibir conexiones, broadcastear estado.
- Implementar peer no-host: unirse a sala, enviar acciones, recibir estado.
- Implementar manejo de desconexiones.
- Implementar heartbeat.
- Testing extenso con 2, 3, 4 jugadores.

**Criterios de aceptación:**
- 4 jugadores pueden jugar una partida completa.
- Desconexiones se manejan correctamente.

### Fase 12: Polish, accesibilidad, responsive (2-3 días)

**Tareas:**
- Refinar todas las animaciones.
- Implementar responsive (al menos desktop y tablet).
- Implementar accesibilidad (keyboard, ARIA).
- Implementar tutorial integrado y onboarding.
- Implementar `prefers-reduced-motion`.
- Pulir todos los toasts y feedback visual.

**Criterios de aceptación:**
- Una persona nueva puede jugar sin explicaciones (gracias al tutorial).
- Funciona en tablet.
- Keyboard navigation funciona.

### Fase 13: Bug fixes y release (2 días)

**Tareas:**
- Lista de bugs conocidos: arreglar todos los críticos y altos.
- Optimización de performance (sin animaciones que tarteen, lazy loading donde aplique).
- Build de producción con `npm run build`.
- Deploy a Vercel.
- Smoke test post-deploy.

**Criterios de aceptación:**
- URL pública funcionando.
- Smoke test: 4 jugadores conectados desde dispositivos distintos pueden jugar.

---

## 28. CRITERIOS DE ACEPTACIÓN GLOBALES

El MVP se considera entregado cuando:

1. **Funcionalidad:**
   - 2-4 jugadores pueden jugar una partida completa de inicio a fin.
   - Todas las 10 cartas de acción funcionan correctamente.
   - Las 5 mejoras (Defensa, Tiempo Extra, Mercado, Titulares, Roles+Expansiones) están implementadas y funcionan.
   - El juego puede ganarse según las reglas.
   - No hay crashes ni estados inconsistentes en uso normal.

2. **Multijugador:**
   - URL compartible funciona para invitar jugadores.
   - Desconexiones no rompen la partida.
   - Estado se sincroniza entre todos los jugadores.

3. **UX:**
   - Un nuevo jugador puede entender el juego con el tutorial integrado.
   - Las animaciones son fluidas (no laggean).
   - Modo oscuro/claro funciona.
   - Accesibilidad básica cumplida (keyboard, contraste).

4. **Deploy:**
   - URL pública accesible.
   - Funciona en Chrome, Firefox, Safari (versiones recientes).
   - Funciona en desktop y tablet.

---

## 29. NOTAS FINALES

### Si algo es ambiguo

Detenete y preguntá. Es mejor pausar 5 minutos que construir 5 horas en la dirección equivocada. Las preguntas más comunes que pueden surgir:

- "¿Cómo se ve exactamente esta animación?" → Si el bundle de Claude Design no lo especifica, usar tu mejor juicio respetando los principios visuales (pixel-perfect, snappy, no más de 400ms).
- "¿Qué carta exactamente cuesta cuánto en el Mercado?" → Sección 11. Si necesita ajuste, documentarlo en DECISIONS.md.
- "¿Cómo balanceo este efecto?" → Implementar con los números actuales del brief. El balanceo final se ajusta post-validación con datos reales.
- "¿Esto necesita test?" → Lógica de juego pura: sí. UI: tests manuales OK.

### Lo que NO está en este MVP

Recordatorio de lo que se posterga para después:

- Modo Clásico (sin las 5 mejoras).
- Modo Historia (single-player narrativo).
- Modo Alianzas (4 jugadores en parejas).
- Modo Torneo.
- Segundo mapa (Crestwood Bay).
- Sistema de cuentas, perfiles, ranking.
- Logros y colecciones.
- Replays compartibles.
- Pase de temporada.
- Monetización.
- App móvil nativa.
- Bots de IA para single-player.

### Filosofía de implementación

> "Hacé lo mínimo necesario para que sea jugable, divertido, y no se rompa. Todo lo demás es para después."

Este MVP es la versión 0.1 del producto. La versión 1.0 vendrá después de validar con amigos reales. No optimices prematuramente. No agregues features no especificadas. No "mejores" la mecánica sin consultar.

### Documentación

Mantené dos documentos vivos durante el desarrollo:

- `DECISIONS.md`: cada decisión técnica que tomes (especialmente cuando este brief no especifica). Una línea por decisión.
- `BUGS.md`: bugs conocidos que no pudiste arreglar inmediatamente, con prioridad.

### Comunicación

Cuando termines cada fase, escribí un mensaje breve indicando:
- Fase completada.
- Criterios de aceptación verificados.
- Decisiones tomadas (link a DECISIONS.md).
- Bugs conocidos (link a BUGS.md).
- Pregunta o blocker, si tenés alguno.

---

**FIN DEL BRIEF**

Buena construcción. Cuando esté lista, YAJUGÁ: DOMINIO va a ser el primer juego de una marca paraguaya con identidad propia. El MVP es solo el punto de partida.

