import React from 'react';
import { useNavigate } from 'react-router-dom';
import useClimaStore from '../store/useClimaStore';
import { t, getNombre } from '../utils/i18n';

const labelColors = {
  Perfect: 'bg-green-500',
  Okay: 'bg-yellow-500',
  Avoid: 'bg-red-500',
};

export default function NearbyBeaches({ playas, tema }) {
  const navigate = useNavigate();
  const idioma = useClimaStore(s => s.idioma);

  if (!playas?.length) return null;

  return (
    <div className={`rounded-2xl ${tema.cardBg} ${tema.border} border p-4`}>
      <h3 className={`mb-3 text-sm font-semibold uppercase tracking-wide ${tema.textSecondary}`}>
        {t('cercanas', idioma)}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {playas.map(p => (
          <button
            key={p.id}
            onClick={() => navigate(`/playa/${p.id}`)}
            className={`flex min-w-[8rem] flex-col rounded-xl ${tema.accentBg} p-3 text-left transition-all hover:scale-105 active:scale-95`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${tema.textPrimary} truncate`}>
                {getNombre(p, idioma)}
              </span>
              <span className={`ml-1 h-5 w-5 rounded-full ${labelColors[p.label] || 'bg-gray-400'} flex items-center justify-center text-[10px] font-bold text-white`}>
                {p.score}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
