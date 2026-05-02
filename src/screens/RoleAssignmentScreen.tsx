import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { useGameStore } from '@/stores/gameStore';
import { ROLE_DEFINITIONS } from '@/game/roles';
import { EXPANSION_DEFINITIONS } from '@/game/expansions';
import { Sparkles } from 'lucide-react';
import type { RoleId } from '@/types/game';
import { getSession } from '@/multiplayer/sync';

interface Props {
  onContinue: () => void;
}

const ROLE_COLORS: Record<RoleId, string> = {
  abogado:       'var(--indigo)',
  corredor:      'var(--aqua)',
  estafador:     '#6B3D78',
  banquero:      'var(--mostaza)',
  coleccionista: 'var(--rosa)',
  arquitecto:    'var(--oliva)',
};

const ROLE_GLYPH: Record<RoleId, string> = {
  abogado:       '§',
  corredor:      '$',
  estafador:     '?',
  banquero:      '€',
  coleccionista: '◈', // ◈
  arquitecto:    '◰', // ◰
};

// Misma lógica que LobbyScreen: el rol vive en sessionStorage. El host
// es el ÚNICO que puede transicionar de RoleAssignment → GameScreen para
// todos. Si un client clickeara, generaría un estado inconsistente.
function readIsHost(gameId: string | undefined): boolean {
  if (!gameId || typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(`mp_role_${gameId}`) === 'host';
}

export default function RoleAssignmentScreen({ onContinue }: Props) {
  const players = useGameStore((s) => s.gameState?.players ?? []);
  const gameId = useGameStore((s) => s.gameState?.gameId);
  const hostId = useGameStore((s) => s.gameState?.hostId);
  const [revealed, setRevealed] = useState(false);
  const isHost = readIsHost(gameId);
  const hostNick =
    players.find((p) => p.id === hostId)?.nickname ??
    players[0]?.nickname ??
    'el anfitrión';

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleStart = () => {
    // Defensive guard — la UI ya esconde el botón a clients, pero por si
    // acaso (keyboard, devtools), no dejamos que un cliente dispare el
    // start.
    if (!readIsHost(gameId)) {
      // eslint-disable-next-line no-console
      console.warn('[role-assignment] handleStart ignored — not host');
      return;
    }
    // Avisar a todos los clients para que su showAssignment local pase
    // a false. El host también dismissa via onContinue local.
    const session = getSession();
    if (session?.mode === 'host') {
      // eslint-disable-next-line no-console
      console.info('[role-assignment] emit start-game (host)');
      session.socket.emit('start-game');
    }
    onContinue();
  };

  return (
    <main
      className="shell"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--s-8) var(--s-6)',
        gap: 'var(--s-8)',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 880 }}>
        <div className="ed-kicker" style={{ justifyContent: 'center' }}>
          <span className="ed-kicker-num">⚄</span>
          <span>El sorteo</span>
        </div>
        <h1 className="ed-section-title" style={{ fontSize: 'var(--fs-72)' }}>
          Asignación de <em>Roles</em>
        </h1>
        <p className="ed-section-lead" style={{ margin: '0 auto' }}>
          La banca decide quién es quién. Cada rol arranca con su habilidad
          pasiva y dos Expansiones de Dominio cargables. Recordá: tu rol nadie
          lo elige, lo recibís.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'var(--s-4)',
          width: '100%',
          maxWidth: 1100,
        }}
      >
        {players.map((p) => {
          const role = ROLE_DEFINITIONS[p.role];
          const exp = EXPANSION_DEFINITIONS[p.expansion];
          const color = ROLE_COLORS[p.role];
          return (
            <div
              key={p.id}
              className="role-card"
              style={{
                width: '100%',
                height: 'auto',
                ['--role-color' as string]: color,
                ['--role-ink' as string]: 'var(--paper)',
              }}
            >
              <div className="role-card-band">
                <span className="role-card-rarity">Jugador</span>
                <span className="role-card-mark">Y</span>
              </div>
              <div className="role-card-portrait" style={{ height: 140 }}>
                {!revealed ? (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      letterSpacing: '0.20em',
                      color: 'var(--ink-soft)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Cargando…
                  </span>
                ) : (
                  <span className="role-card-portrait-glyph" aria-hidden="true">
                    {ROLE_GLYPH[p.role]}
                  </span>
                )}
              </div>
              <div className="role-card-name">
                <h3>{p.nickname}</h3>
                <span>{revealed ? `El ${role.name}` : '— sorteo en curso —'}</span>
              </div>
              {revealed && (
                <>
                  <div className="role-card-quote">{role.passiveAbility}</div>
                  <div className="role-card-skills">
                    <div className="role-card-skill">
                      <span className="role-card-skill-k">Expansión</span>
                      <span className="role-card-skill-v">
                        <strong style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: 13 }}>
                          {exp.name}
                        </strong>
                        <br />
                        <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', marginTop: 2 }}>
                          <Sparkles size={10} aria-hidden="true" />
                          <span>{exp.description}</span>
                        </span>
                      </span>
                    </div>
                  </div>
                </>
              )}
              <div className="role-card-foot">
                <span>YAJUGÁ : DOMINIO</span>
                <span>jugador</span>
              </div>
            </div>
          );
        })}
      </div>

      {revealed && (
        isHost ? (
          <Button size="lg" onClick={handleStart} variant="primary">
            Empezar partida
          </Button>
        ) : (
          <div
            className="ed-banner"
            data-tone="info"
            style={{
              padding: '14px 20px',
              maxWidth: 480,
              width: '100%',
              justifyContent: 'center',
            }}
            role="status"
            aria-live="polite"
          >
            <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.10em' }}>
              Esperando que <strong>{hostNick}</strong> inicie la partida…
            </span>
          </div>
        )
      )}
    </main>
  );
}
