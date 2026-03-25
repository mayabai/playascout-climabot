import React from 'react';

export default function WindCard({ clima, tema }) {
  if (!clima?.actual) return null;
  const { actual } = clima;
  const norte = clima.alertas?.norte;

  return (
    <div className={`rounded-2xl ${tema.cardBg} p-4 shadow-sm ${tema.border} border animate-slide-up`}>
      <h3 className={`text-sm font-semibold uppercase tracking-wide ${tema.textSecondary}`}>
        💨 Viento y Mar
      </h3>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="text-center">
          <p className={`text-3xl font-bold ${tema.textPrimary}`}>{actual.viento_kmh}</p>
          <p className={`text-xs ${tema.textSecondary}`}>km/h</p>
          <p className={`mt-1 text-xs font-medium ${tema.accent}`}>{actual.direccion_viento}</p>
        </div>
        <div className="text-center">
          <p className="text-3xl">🌊</p>
          <p className={`text-sm font-medium ${tema.textPrimary}`}>{actual.oleaje || 'Tranquilo'}</p>
        </div>
      </div>

      {norte && (
        <div className="mt-3 rounded-xl bg-red-50 p-3 text-center">
          <p className="text-sm font-bold text-red-700">
            ⚠️ Alerta de Norte: {norte.categoria}
          </p>
          <p className="text-xs text-red-600">
            Vientos de {norte.velocidad_kmh} km/h — Evita actividades acuáticas
          </p>
        </div>
      )}
    </div>
  );
}
