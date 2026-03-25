import React from 'react';

const UV_COLORS = [
  { max: 2, color: 'text-green-500', bg: 'bg-green-100', label: 'Bajo' },
  { max: 5, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Moderado' },
  { max: 7, color: 'text-orange-500', bg: 'bg-orange-100', label: 'Alto' },
  { max: 10, color: 'text-red-500', bg: 'bg-red-100', label: 'Muy alto' },
  { max: 99, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Extremo' }
];

function getUVInfo(uv) {
  return UV_COLORS.find(c => uv <= c.max) || UV_COLORS[UV_COLORS.length - 1];
}

export default function UVGauge({ uv_data, tema }) {
  if (!uv_data) return null;

  const uv = uv_data.uv_max ?? uv_data.actual ?? 0;
  const info = getUVInfo(uv);
  const percent = Math.min((uv / 14) * 100, 100);

  return (
    <div className={`rounded-2xl ${tema.cardBg} p-4 shadow-sm ${tema.border} border animate-slide-up`}>
      <h3 className={`text-sm font-semibold uppercase tracking-wide ${tema.textSecondary}`}>
        ☀️ Índice UV
      </h3>

      <div className="mt-3 flex items-center gap-4">
        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${info.bg}`}>
          <span className={`text-2xl font-extrabold ${info.color}`}>{Math.round(uv)}</span>
        </div>
        <div>
          <p className={`text-lg font-bold ${info.color}`}>{info.label}</p>
          {uv_data.horas_seguras && (
            <p className={`text-xs ${tema.textSecondary}`}>
              🕐 Horas seguras: {uv_data.horas_seguras}
            </p>
          )}
          {uv_data.pico && (
            <p className={`text-xs ${tema.textSecondary}`}>
              ⚡ Pico UV: {uv_data.pico}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-500 to-red-500 transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
