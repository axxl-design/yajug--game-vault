import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import LobbyScreen from './screens/LobbyScreen';
import TutorialScreen from './screens/TutorialScreen';
import { ToastProvider } from './components/ui';
import { useApplyTheme } from './hooks/useApplyTheme';

// La galería /dev solo se compila en desarrollo. En prod, la condición
// queda como `false` y Rollup tree-shakea el chunk completo.
const DevScreen = import.meta.env.DEV
  ? lazy(() => import('./screens/DevScreen'))
  : null;

export default function App() {
  useApplyTheme();
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/tutorial" element={<TutorialScreen />} />
        <Route path="/game/:gameId" element={<LobbyScreen />} />
        {DevScreen && (
          <Route
            path="/dev"
            element={
              <Suspense fallback={null}>
                <DevScreen />
              </Suspense>
            }
          />
        )}
      </Routes>
    </ToastProvider>
  );
}
