import React from 'react';

const NIVELES = {
  ninguno: { color: 'bg-green-500', label: 'Sin sargazo', emoji: '✅', width: 'w-1/6' },
  bajo: { color: 'bg-green-400', label: 'Bajo', emoji: '🟢', width: 'w-2/6' },
  moderado: { color: 'bg-yellow-400', label: 'Moderado', emoji: '🟡', width: 'w-3/6' },
  alto: { color: 'bg-orange-500', label: 'Alto', emoji: '🟠', width: 'w-4/6' },
  extremo: { color: 'bg-red-500', label: 'Extremo', emoji: '🔴', width: 'w-full' }
};

export default function SargazoIndicator({ sargazo, tema }) {
  if (!sargazo || sargazo.nivel === 'no_aplica') return null;

  const info = NIVELES[sargazo.nivel] || NIVELES.ninguno;

  return (
    <div className={`rounded-2xl ${tema.cardBg} p-4 shadow-sm ${tema.border} border animate-slide-up`}>
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-semibold uppercase tracking-wide ${tema.textSecondary}`}>
          🌿 Sargazo
        </h3>
        <span className={`text-sm font-bold ${tema.textPrimary}`}>
          {info.emoji} {info.label}
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div className={`h-full rounded-full ${info.color} ${info.width} transition-all duration-700`} />
      </div>

      {sargazo.playas_limpias?.length > 0 && (
        <p className={`mt-2 text-xs ${tema.textSecondary}`}>
          🏖️ Playas limpias: {sargazo.playas_limpias.join(', ')}
        </p>
      )}

      {sargazo.actualizado && (
        <p className={`mt-1 text-xs ${tema.textSecondary} opacity-60`}>
          Actualizado: {new Date(sargazo.actualizado).toLocaleDateString('es-MX')}
        </p>
      )}
    </div>
  );
}
