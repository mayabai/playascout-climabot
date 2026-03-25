import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useClimaStore from '../store/useClimaStore';
import { t } from '../utils/i18n';

const tabs = [
  { path: '/playas', icon: '🏖️', key: 'playas' },
  { path: '/mapa', icon: '🗺️', key: 'mapa' },
  { path: '/', icon: '🌤️', key: 'zonas' },
];

export default function BottomNav({ tema }) {
  const location = useLocation();
  const navigate = useNavigate();
  const idioma = useClimaStore(s => s.idioma);

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t ${tema.border} ${tema.cardBg} backdrop-blur-xl`}>
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {tabs.map(tab => {
          const active = tab.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center px-4 py-1 transition-all ${
                active ? 'scale-110' : 'opacity-60 hover:opacity-80'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className={`text-[10px] font-semibold ${active ? tema.accent : tema.textSecondary}`}>
                {t(tab.key, idioma)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
