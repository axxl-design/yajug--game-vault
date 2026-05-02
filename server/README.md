# yajuga-server

Relay WebSocket para multijugador de **YAJUGÁ : DOMINIO**. Reemplaza la capa P2P PeerJS anterior.

## Modelo

- Servidor Express + Socket.IO. Es **dumb relay**: no procesa lógica de juego.
- El primer cliente que envía `join-room` con `isHost=true` se queda con el slot de host de esa sala (`gameId`). Los demás se unen como clients.
- El host sigue siendo source of truth del `GameState`. Los clients le mandan `player-action` al host vía servidor; el host responde con `state-update` que el servidor retransmite a todos.

## Eventos

| Evento | Origen | Destino | Payload |
| --- | --- | --- | --- |
| `join-room` | client / host | server (con ack) | `{ gameId, playerId, nickname, isHost }` |
| `lobby-update` | host | clients | `{ players: LobbyPlayer[] }` |
| `state-update` | host | clients | `{ state: GameState }` |
| `start-game` | host | clients | (sin payload) |
| `player-action` | client | host | `{ action, playerId }` |
| `peer-joined` | server | host | `{ playerId, nickname, isHost }` |
| `peer-disconnected` | server | host | `{ playerId }` |
| `host-disconnected` | server | todos | (sin payload) |

## Variables de entorno

| Var | Default | Descripción |
| --- | --- | --- |
| `PORT` | `3001` | Puerto en el que escucha el servidor. Railway/Fly setean `PORT` automático. |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:4173` | Lista CSV de orígenes permitidos para CORS y Socket.IO. En producción, agregar la URL de Vercel. |

## Levantarlo localmente

```bash
cd server
pnpm install
pnpm dev   # tsx watch — recompila al guardar
# o
pnpm start # tsx una vez
```

Por default escucha en `http://localhost:3001`. Verificar con `curl http://localhost:3001/health`.

## Deploy a Railway

1. Crear proyecto en Railway, conectarlo a este repo.
2. Configurar **Root Directory** del servicio en `server/`.
3. Build command: `pnpm install && pnpm build`. Start command: `pnpm start:prod`.
4. Settear variable `CORS_ORIGINS` con la URL completa de Vercel (ej. `https://yajuga-dominio.vercel.app`).
5. Tomar la URL pública del servicio (ej. `https://yajuga-server-production.up.railway.app`) y settearla en Vercel como `VITE_WS_URL`.

## Health check

`GET /` y `GET /health` devuelven JSON con el conteo de salas activas. Útil para monitoreo y para mantener la instancia despierta en plans gratuitos.
