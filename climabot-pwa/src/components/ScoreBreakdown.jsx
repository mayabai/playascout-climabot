import React from 'react';
import useClimaStore from '../store/useClimaStore';
import { t } from '../utils/i18n';

const dimensions = [
  { key: 'viento', label: 'viento', max: 30, emoji: '💨' },
  { key: 'olas', label: 'oleaje', max: 20, emoji: '🌊' },
  { key: 'lluvia', label: 'lluvia', max: 20, emoji: '🌧️' },
  { key: 'uv', label: 'uv', max: 15, emoji: '☀️' },
  { key: 'sargazo', label: 'sargazo', max: 15, emoji: '🟤' },
];

function barColor(pct) {
  if (pct >= 0.7) return 'bg-green-500';
  if (pct >= 0.4) return 'bg-yellow-500';
  return 'bg-red-500';
}

function qualityLabel(pct, key, idioma) {
  if (key === 'sargazo') {
    if (pct >= 0.8) return idioma === 'es' ? 'Limpia' : 'Clean';
    if (pct >= 0.5) return idioma === 'es' ? 'Algo' : 'Some';
    if (pct >= 0.3) return idioma === 'es' ? 'Moderado' : 'Moderate';
    return idioma === 'es' ? 'Alto' : 'Heavy';
  }
  if (pct >= 0.8) return idioma === 'es' ? 'Excelente' : 'Excellent';
  if (pct >= 0.6) return idioma === 'es' ? 'Bueno' : 'Good';
  if (pct >= 0.4) return idioma === 'es' ? 'Regular' : 'Fair';
  return idioma === 'es' ? 'Malo' : 'Poor';
}

export default function ScoreBreakdown({ breakdown, viento, mar, tema }) {
  const idioma = useClimaStore(s => s.idioma);

  if (!breakdown) return null;

  // Extra data for viento and oleaje
  const extraData = {};
  if (viento?.velocidad_kmh != null) {
    extraData.viento = `${Math.round(viento.velocidad_kmh)} km/h · ${viento.direccion || ''}`;
  }
  if (mar?.olas_m != null) {
    extraData.oleaje = `${mar.olas_m}m`;
    if (mar.periodo_s) extraData.oleaje += ` · ${mar.periodo_s}s`;
  } else if (typeof mar === 'object' && (mar?.es || mar?.en)) {
    extraData.oleaje = idioma === 'es' ? mar.es : mar.en;
  }

  return (
    <div className={`rounded-2xl ${tema.cardBg} ${tema.border} border p-4 space-y-3`}>
      <h3 className={`text-sm font-semibold uppercase tracking-wide ${tema.textSecondary}`}>
        {t('desglose', idioma)}
      </h3>
      {dimensions.map(({ key, label: dimLabel, max, emoji }) => {
        const value = breakdown[key] ?? 0;
        const pct = value / max;
        const qLabel = qualityLabel(pct, key, idioma);
        const extra = extraData[dimLabel] || extraData[key];
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${tema.textSecondary}`}>
                {emoji} {t(dimLabel, idioma)}
              </span>
              <div className="text-right">
                <span className={`text-xs font-bold ${barColor(pct).replace('bg-', 'text-')}`}>
                  {qLabel}
                </span>
                {extra && (
                  <span className={`ml-2 text-[10px] ${tema.textSecondary}`}>
                    ({extra})
                  </span>
                )}
              </div>
            </div>
            <div className="h-2 rounded-full bg-gray-200/30 overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor(pct)} transition-all duration-700`}
                style={{ width: `${pct * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
