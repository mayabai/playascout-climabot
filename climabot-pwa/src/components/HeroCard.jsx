import React from 'react';

export default function HeroCard({ clima, tema }) {
  if (!clima?.actual) return null;
  const { actual, zona } = clima;

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${tema.heroGradient} p-6 text-white shadow-xl animate-fade-in`}>
      <div className="relative z-10">
        <p className="text-sm font-medium opacity-90">{tema.emoji} {tema.saludo}</p>
        <h1 className="mt-1 text-lg font-bold">{zona?.nombre || 'Riviera Maya'}</h1>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-6xl font-extrabold tracking-tight">
              {Math.round(actual.temperatura)}°
            </span>
            <p className="mt-1 text-sm opacity-90">
              Sensación {Math.round(actual.sensacion_termica)}°
            </p>
          </div>
          <div className="text-right">
            <span className="text-5xl">{actual.icono || '🌤️'}</span>
            <p className="mt-1 text-sm font-medium">{actual.descripcion}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-4 text-sm opacity-90">
          <span>💧 {actual.humedad}%</span>
          <span>💨 {actual.viento_kmh} km/h</span>
          <span>🌊 {actual.oleaje || 'Tranquilo'}</span>
        </div>
      </div>
      {/* Decorativo */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5" />
    </div>
  );
}
