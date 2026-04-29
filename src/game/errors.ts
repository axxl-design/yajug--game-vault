/**
 * Error de validación de jugada. Se lanza cuando una acción no cumple
 * pre-condiciones (ej. no es turno del jugador, carta no en mano,
 * jugador objetivo inexistente, etc.).
 */
export class GameError extends Error {
  constructor(public reason: string) {
    super(reason);
    this.name = 'GameError';
  }
}
