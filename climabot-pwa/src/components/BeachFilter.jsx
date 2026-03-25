import React from 'react';
import useClimaStore from '../store/useClimaStore';
import { t } from '../utils/i18n';

const LABELS = ['Perfect', 'Okay', 'Avoid'];
const labelEmoji = { Perfect: '🟢', Okay: '🟡', Avoid: '🔴' };

export default function BeachFilter({ zonas, filtroZona, setFiltroZona, filtroLabel, setFiltroLabel, tema }) {
  const idioma = useClimaStore(s => s.idioma);

  return (
    <div className="space-y-3">
      {/* Zona filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setFiltroZona(null)}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
            !filtroZona ? `${tema.accentBg} ${tema.accent}` : `${tema.cardBg} ${tema.textSecondary} ${tema.border} border`
          }`}
        >
          {t('todas', idioma)}
        </button>
        {zonas.map(z => (
          <button
            key={z.id}
            onClick={() => setFiltroZona(filtroZona === z.id ? null : z.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              filtroZona === z.id ? `${tema.accentBg} ${tema.accent}` : `${tema.cardBg} ${tema.textSecondary} ${tema.border} border`
            }`}
          >
            {z.nombre}
          </button>
        ))}
      </div>

      {/* Label filter */}
      <div className="flex gap-2">
        {LABELS.map(label => (
          <button
            key={label}
            onClick={() => setFiltroLabel(filtroLabel === label ? null : label)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              filtroLabel === label ? `${tema.accentBg} ${tema.accent}` : `${tema.cardBg} ${tema.textSecondary} ${tema.border} border`
            }`}
          >
            {labelEmoji[label]} {t(label.toLowerCase(), idioma)}
          </button>
        ))}
      </div>
    </div>
  );
}
