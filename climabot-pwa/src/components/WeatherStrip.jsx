import React from 'react';

export default function WeatherStrip({ proximas_horas, tema }) {
  if (!proximas_horas?.length) return null;

  return (
    <div className="animate-slide-up">
      <h3 className={`mb-3 text-sm font-semibold uppercase tracking-wide ${tema.textSecondary}`}>
        Próximas horas
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {proximas_horas.slice(0, 12).map((h, i) => (
          <div
            key={i}
            className={`flex min-w-[4.5rem] flex-col items-center rounded-2xl ${tema.cardBg} p-3 shadow-sm ${tema.border} border`}
          >
            <span className={`text-xs font-medium ${tema.textSecondary}`}>{h.hora}</span>
            <span className="my-1 text-xl">{h.icono || '🌤️'}</span>
            <span className={`text-sm font-bold ${tema.textPrimary}`}>{Math.round(h.temperatura)}°</span>
            {h.lluvia_pct > 20 && (
              <span className="mt-1 text-xs text-blue-500">💧{h.lluvia_pct}%</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
