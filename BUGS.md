# BUGS.md — YAJUGÁ: DOMINIO

Lista de bugs y limitaciones conocidas del MVP. Actualizado al cierre de Fases 11-13.

| Severidad | Fase | Descripción | Repro | Estado |
|---|---|---|---|---|
| Baja | 9 | Rascacielos: el set marcado como Monumento aún no triplica la renta cobrada (sólo bloquea ataques y cuenta como 2 sets). | Activar Rascacielos, cobrar renta del Set Monumento → renta es la base, no triple. | Diferido a balance post-MVP. Documentado en `DECISIONS.md`. |
| Baja | 9 | Set Monumento no cuenta como 2 sets para condición de victoria (sólo 1). | Tener 2 sets completos + 1 monumento → no gana automáticamente. | Diferido — el flag `isMonument` está en el state pero `checkVictoryCondition` no lo usa todavía. |
| Baja | 9 | Estafador no tiene su pasiva de "1 mentira sobre la mano" implementada en hot-seat. | Inspeccionar el código — sólo hay un log entry "(UI multijugador)". | Pendiente para Fase 11+ (vista per-player). |
| Baja | 9 | Arquitecto: pasiva "combinar 2 sets cortos como 1" no implementada (definición ambigua del brief). | N/A | Diferido — esperar definición de balance. |
| Baja | 9 | Subasta del Siglo, El Truco, Doble Identidad, Trueque Imperial, Reordenamiento Urbano: UI de selección simplificada en hot-seat. Los inputs llegan en `ExpansionInput` pero la UI no los pide al usuario. | Activar cualquiera de esas Expansiones → modal acepta sin selección visual. | Documentado. UI completa post-MVP. |
| Baja | 7 | Sobrecargo no pasa por el flow de Defense (en hot-seat se aplica directo al mismo target de la última renta). | Jugar Renta → Sobrecargo → no aparece DefenseModal extra. | Documentado. Brief permite simplificación. |
| Baja | 11 | El servidor PeerJS público (cloud) puede tener latencia o estar caído. Si la apertura del peer falla, el `LobbyScreen` cae a hot-seat. | Sin red / firewall PeerJS. | By design fallback documentado. |
| Baja | 11 | Reconexión de peer: si un peer no-host se desconecta, `isConnected=false`. No hay flow de "auto-rejoin" todavía. | Cerrar pestaña de cliente → host marca desconectado. | Pendiente: reintento automático con timeout de 30s antes de marcar AFK. |
| Baja | 11 | Si el host se desconecta, los clientes sólo ven `lastError = "El host se desconectó"`. No hay banner dramático con timer 60s. | Cerrar pestaña del host. | Mejora UX pendiente — la red sigue rota igual. |
| Baja | 12 | Sonidos con Howler.js no implementados. El toggle de sonido existe en `prefsStore` pero ningún efecto se reproduce. | Activar/desactivar sonido — silencio. | Documentado en `DECISIONS.md`. Howler agrega ~30 KB y queda para post-MVP. |
| Baja | 12 | Tooltips enriquecidos (>800ms hover) sólo aparecen en componentes que usan `<Tooltip>` explícitamente. Las cartas en mano no tienen tooltip (el hover abre el menú al click, no muestra preview). | Hover sobre carta de mano → no aparece tooltip. | Pendiente — agregar `<Tooltip>` wrapping `<CardFace>` con descripción + efecto. |

## Limitaciones por diseño (no bugs)

- **Hot-seat vs Multijugador real:** ambos modos coexisten. Hot-seat = todos en la misma pestaña; multijugador = peers conectados por PeerJS. La UI no diferencia visualmente entre los dos modos más allá del banner de status del Lobby.
- **Mobile:** pantallas <768px muestran un gate "YAJUGÁ funciona mejor en pantallas más grandes". Versión móvil real queda para post-MVP (la mesa de juego con 4 jugadores requiere espacio).
- **Persistencia de partida:** las partidas no persisten en localStorage. Si recargás la pestaña, perdés la partida en curso (`gameStore` es in-memory). Esto es intencional según el brief sec 25 ("NO localStorage para estado de partida").
