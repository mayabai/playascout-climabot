import React from 'react';
import useClimaStore from '../store/useClimaStore';
import { t } from '../utils/i18n';

const amenityIcons = {
  parking: '🅿️',
  salvavidas: '🛟',
  snorkel: '🤿',
  restaurantes: '🍽️',
  banos: '🚻',
  camastros: '🏖️',
  buceo: '🤿',
  kayak: '🛶',
  cenote: '💎',
  lanchas: '🚤',
  club_playa: '🏝️',
  muelle: '⚓',
};

export default function AmenityList({ amenidades, tema }) {
  const idioma = useClimaStore(s => s.idioma);

  if (!amenidades?.length) return null;

  return (
    <div className={`rounded-2xl ${tema.cardBg} ${tema.border} border p-4`}>
      <h3 className={`mb-3 text-sm font-semibold uppercase tracking-wide ${tema.textSecondary}`}>
        {t('amenidades', idioma)}
      </h3>
      <div className="flex flex-wrap gap-2">
        {amenidades.map(a => (
          <span
            key={a}
            className={`inline-flex items-center gap-1 rounded-full ${tema.accentBg} px-3 py-1.5 text-xs font-medium ${tema.textPrimary}`}
          >
            {amenityIcons[a] || '✨'} {t(a, idioma)}
          </span>
        ))}
      </div>
    </div>
  );
}
