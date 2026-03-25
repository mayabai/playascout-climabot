import React from 'react';
import { useNavigate } from 'react-router-dom';
import useClimaStore from '../store/useClimaStore';
import { getNombre } from '../utils/i18n';

const labelColors = {
  Perfect: 'bg-green-500',
  Okay: 'bg-yellow-500',
  Avoid: 'bg-red-500',
};

export default function BeachCard({ playa, tema }) {
  const navigate = useNavigate();
  const idioma = useClimaStore(s => s.idioma);

  const nombre = getNombre(playa, idioma);
  const color = labelColors[playa.label] || 'bg-gray-400';

  return (
    <button
      onClick={() => navigate(`/playa/${playa.id}`)}
      className={`w-full rounded-2xl ${tema.cardBg} ${tema.border} border p-4 text-left shadow-sm transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${tema.textPrimary} truncate`}>{nombre}</p>
          <p className={`text-xs ${tema.textSecondary} mt-0.5`}>{playa.zona_id}</p>
        </div>
        <div className={`ml-2 flex items-center gap-1.5 rounded-full ${color} px-2.5 py-1`}>
          <span className="text-xs font-extrabold text-white">{playa.score}</span>
        </div>
      </div>

      <div className={`mt-3 flex gap-3 text-xs ${tema.textSecondary}`}>
        {playa.temp_c != null && <span>🌡️ {Math.round(playa.temp_c)}°</span>}
        {playa.viento_kmh != null && <span>💨 {Math.round(playa.viento_kmh)}</span>}
        {playa.olas_m != null && <span>🌊 {playa.olas_m}m</span>}
      </div>
    </button>
  );
}
