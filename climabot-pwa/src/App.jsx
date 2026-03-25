import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import usePeriodo from './hooks/usePeriodo';
import BottomNav from './components/BottomNav';
import LangToggle from './components/LangToggle';
import ZoneView from './views/ZoneView';
import BeachListView from './views/BeachListView';
import BeachDetailView from './views/BeachDetailView';
import MapView from './views/MapView';

export default function App() {
  const { tema } = usePeriodo();

  return (
    <BrowserRouter>
      <div className={`min-h-screen bg-gradient-to-b ${tema.gradient} transition-colors duration-700`}>
        <div className="mx-auto max-w-md px-4 py-6 pb-24">
          {/* Header */}
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className={`text-lg font-extrabold ${tema.textPrimary}`}>
                🌴 ClimaBot
              </h1>
              <p className={`text-xs ${tema.textSecondary}`}>Riviera Maya</p>
            </div>
            <div className="flex items-center gap-2">
              <LangToggle tema={tema} />
            </div>
          </header>

          {/* Routes */}
          <Routes>
            <Route path="/" element={<ZoneView tema={tema} />} />
            <Route path="/playas" element={<BeachListView tema={tema} />} />
            <Route path="/playa/:id" element={<BeachDetailView tema={tema} />} />
            <Route path="/mapa" element={<MapView tema={tema} />} />
          </Routes>

          {/* Footer */}
          <footer className={`mt-8 text-center text-xs ${tema.textSecondary} opacity-50`}>
            <p>ClimaBot © {new Date().getFullYear()} · Roma Tecnologia</p>
          </footer>
        </div>

        {/* Bottom Navigation */}
        <BottomNav tema={tema} />
      </div>
    </BrowserRouter>
  );
}
