/**
 * Códigos de partida — 6 caracteres, alfabeto sin O/0/I/1 para evitar
 * confusiones cuando se comparten por voz o WhatsApp.
 *
 * El código vive como path param en `/game/:gameId` y también es lo que
 * el host le pasa al peer para unirse en Fase 11 (señalización PeerJS).
 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const VALID_CHARS = new Set(ALPHABET);
const CODE_LENGTH = 6;

export function generateGameCode(): string {
  const buf = new Uint32Array(CODE_LENGTH);
  crypto.getRandomValues(buf);
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += ALPHABET[buf[i] % ALPHABET.length];
  }
  return out;
}

export function isValidGameCode(code: string): boolean {
  if (code.length !== CODE_LENGTH) return false;
  for (const ch of code) {
    if (!VALID_CHARS.has(ch)) return false;
  }
  return true;
}

/** Limpia un código pegado por el usuario: uppercase + sólo chars válidos. */
export function normalizeGameCode(input: string): string {
  const upper = input.toUpperCase();
  let out = '';
  for (const ch of upper) {
    if (VALID_CHARS.has(ch) && out.length < CODE_LENGTH) out += ch;
  }
  return out;
}

export const GAME_CODE_LENGTH = CODE_LENGTH;
