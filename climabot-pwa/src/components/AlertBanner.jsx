import React from 'react';

export default function AlertBanner({ alertas, recomendacion, tema }) {
  const items = [];

  // Alertas del sistema
  if (alertas?.norte) {
    items.push({
      tipo: 'norte',
      emoji: '🌪️',
      titulo: `Norte ${alertas.norte.categoria}`,
      desc: 'Evita actividades acuáticas. Olas peligrosas.',
      color: 'bg-red-50 border-red-300 text-red-800'
    });
  }

  // Alertas sociales
  if (alertas?.sociales?.length > 0) {
    alertas.sociales.forEach(a => {
      items.push({
        tipo: a.tipo,
        emoji: a.tipo === 'bandera_roja' ? '🚩' : '⚠️',
        titulo: a.titulo || a.tipo.replace(/_/g, ' '),
        desc: a.resumen || a.contenido,
        color: 'bg-yellow-50 border-yellow-300 text-yellow-800'
      });
    });
  }

  // Recomendación turística
  if (recomendacion?.texto) {
    items.push({
      tipo: 'recomendacion',
      emoji: '💡',
      titulo: 'Recomendación del día',
      desc: recomendacion.texto,
      color: `${tema.accentBg} ${tema.border} ${tema.textPrimary}`
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="space-y-3 animate-slide-up">
      {items.map((item, i) => (
        <div key={i} className={`rounded-2xl border p-4 ${item.color}`}>
          <p className="text-sm font-bold">
            {item.emoji} {item.titulo}
          </p>
          <p className="mt-1 text-sm opacity-90">{item.desc}</p>
        </div>
      ))}

      {recomendacion?.que_llevar?.length > 0 && (
        <div className={`rounded-2xl ${tema.cardBg} ${tema.border} border p-4`}>
          <p className={`text-sm font-semibold ${tema.textPrimary}`}>🎒 Qué llevar hoy</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recomendacion.que_llevar.map((item, i) => (
              <span
                key={i}
                className={`rounded-full ${tema.accentBg} px-3 py-1 text-xs font-medium ${tema.accent}`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
