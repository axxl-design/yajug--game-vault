import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import { ToastProvider } from './components/ui';
import { useApplyTheme } from './hooks/useApplyTheme';

// Code-split: las pantallas de partida (incluyen PeerJS, framer-motion pesado)
// se cargan bajo demanda. La HomeScreen sí queda en el chunk inicial para
// que el time-to-first-paint sea rápido.
const LobbyScreen = lazy(() => import('./screens/LobbyScreen'));
const TutorialScreen = lazy(() => import('./screens/TutorialScreen'));
const DevScreen = import.meta.env.DEV
  ? lazy(() => import('./screens/DevScreen'))
  : null;

function ScreenFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg text-text">
      <div
        className="h-8 w-8 rounded-full border-2 border-coral border-t-transparent animate-spin"
        aria-label="Cargando…"
      />
    </main>
  );
}

export default function App() {
  useApplyTheme();
  return (
    <ToastProvider>
      <Suspense fallback={<ScreenFallback />}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/tutorial" element={<TutorialScreen />} />
          <Route path="/game/:gameId" element={<LobbyScreen />} />
          {DevScreen && <Route path="/dev" element={<DevScreen />} />}
        </Routes>
      </Suspense>
    </ToastProvider>
  );
}
