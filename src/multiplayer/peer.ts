import Peer, { DataConnection } from 'peerjs';

/**
 * Wrapper bajo nivel sobre PeerJS. La capa `sync.ts` se encarga del
 * protocolo (mensajes, lobby, broadcast); acá sólo manejamos sockets.
 *
 * Notas:
 * - Forzamos `serialization: 'json'` en las conexiones cliente. PeerJS por
 *   default usa BinaryPack que ha demostrado ser frágil con objetos
 *   anidados generados por immer (frozen). JSON añade ~10% de overhead pero
 *   es radicalmente más confiable para nuestro `GameState` serializado.
 */

export interface OpenPeerResult {
  peer: Peer;
  myId: string;
}

/**
 * Intenta abrir un Peer con el id dado. Si el id ya está en uso,
 * la promesa rechaza con `'unavailable-id'`.
 */
export function openPeer(desiredId?: string, timeoutMs = 8000): Promise<OpenPeerResult> {
  return new Promise((resolve, reject) => {
    const peer = desiredId ? new Peer(desiredId) : new Peer();
    let settled = false;

    const finalize = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
    };

    const t = setTimeout(() => {
      finalize(() => {
        peer.destroy();
        reject(new Error('peer-timeout'));
      });
    }, timeoutMs);

    peer.on('open', (id) => {
      finalize(() => {
        clearTimeout(t);
        // eslint-disable-next-line no-console
        console.info('[peer] open', { peerId: id, requested: desiredId });
        resolve({ peer, myId: id });
      });
    });

    peer.on('error', (err) => {
      const code = (err as Error & { type?: string }).type ?? 'unknown';
      // eslint-disable-next-line no-console
      console.error('[peer] error', { code, err });
      finalize(() => {
        clearTimeout(t);
        peer.destroy();
        reject(new Error(code));
      });
    });
  });
}

/** Conecta como cliente a un host PeerJS con id `targetId`. */
export function connectToHost(peer: Peer, targetId: string, timeoutMs = 8000): Promise<DataConnection> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-console
    console.info('[peer] connectToHost', { targetId });
    const conn = peer.connect(targetId, { reliable: true, serialization: 'json' });
    let settled = false;
    const finalize = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
    };
    const t = setTimeout(() => {
      finalize(() => {
        // eslint-disable-next-line no-console
        console.error('[peer] connectToHost timeout', { targetId });
        conn.close();
        reject(new Error('connect-timeout'));
      });
    }, timeoutMs);
    conn.on('open', () => finalize(() => {
      clearTimeout(t);
      // eslint-disable-next-line no-console
      console.info('[peer] connectToHost open', { targetId });
      resolve(conn);
    }));
    conn.on('error', (err) => finalize(() => {
      clearTimeout(t);
      // eslint-disable-next-line no-console
      console.error('[peer] connectToHost error', { targetId, err });
      reject(err);
    }));
  });
}

export type { Peer, DataConnection };
