/**
 * Placeholder de Fase 1 — solo verifica que el setup funciona.
 * La HomeScreen real se construye en Fase 3 según sec. 15.1 del brief.
 */
export default function HomeScreen() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
      <h1 className="font-display text-64 font-bold tracking-tight text-text">
        Hello YAJUGÁ
      </h1>
      <p className="font-sans text-text-muted">
        Setup de Fase 1 funcionando. La HomeScreen real llega en Fase 3.
      </p>
      <code className="font-mono text-13 text-text-subtle">
        Geist Sans · Inter · Geist Mono
      </code>
    </main>
  );
}
