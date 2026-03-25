import React from 'react';

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function ForecastWeek({ pronostico, tema }) {
  if (!pronostico?.length) return null;

  return (
    <div className={`rounded-2xl ${tema.cardBg} p-4 shadow-sm ${tema.border} border animate-slide-up`}>
      <h3 className={`mb-3 text-sm font-semibold uppercase tracking-wide ${tema.textSecondary}`}>
        📅 Próximos 7 días
      </h3>

      <div className="space-y-2">
        {pronostico.slice(0, 7).map((dia, i) => {
          const fecha = new Date(dia.fecha);
          const diaNombre = i === 0 ? 'Hoy' : DIAS[fecha.getDay()];

          return (
            <div key={i} className="flex items-center justify-between py-1">
              <span className={`w-12 text-sm font-medium ${tema.textPrimary}`}>
                {diaNombre}
              </span>
              <span className="text-lg">{dia.icono || '🌤️'}</span>
              {dia.lluvia_pct > 0 && (
                <span className="text-xs text-blue-400">💧{dia.lluvia_pct}%</span>
              )}
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${tema.textPrimary}`}>
                  {Math.round(dia.max)}°
                </span>
                <span className={`text-sm ${tema.textSecondary}`}>
                  {Math.round(dia.min)}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
