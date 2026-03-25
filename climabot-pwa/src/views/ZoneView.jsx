import React from 'react';
import useClima from '../hooks/useClima';
import HeroCard from '../components/HeroCard';
import WeatherStrip from '../components/WeatherStrip';
import SargazoIndicator from '../components/SargazoIndicator';
import WindCard from '../components/WindCard';
import UVGauge from '../components/UVGauge';
import AlertBanner from '../components/AlertBanner';
import ForecastWeek from '../components/ForecastWeek';
import ZonaPicker from '../components/ZonaPicker';
import CTAWhatsApp from '../components/CTAWhatsApp';

function LoadingSkeleton({ tema }) {
  return (
    <div className="space-y-4 animate-pulse">
      <div className={`h-48 rounded-3xl bg-gradient-to-br ${tema.heroGradient} opacity-50`} />
      <div className={`h-24 rounded-2xl ${tema.cardBg}`} />
      <div className={`h-32 rounded-2xl ${tema.cardBg}`} />
    </div>
  );
}

function ErrorState({ error, onRetry, tema }) {
  return (
    <div className={`rounded-2xl ${tema.cardBg} p-6 text-center`}>
      <p className="text-4xl">😵</p>
      <p className={`mt-2 font-bold ${tema.textPrimary}`}>Oops, algo fallo</p>
      <p className={`mt-1 text-sm ${tema.textSecondary}`}>{error}</p>
      <button
        onClick={onRetry}
        className={`mt-4 rounded-xl ${tema.accentBg} px-6 py-2 text-sm font-bold ${tema.accent}`}
      >
        Reintentar
      </button>
    </div>
  );
}

export default function ZoneView({ tema }) {
  const { clima, loading, error, zona, zonas } = useClima();
  const refresh = () => window.location.reload();

  return (
    <>
      <div className="mb-4">
        <ZonaPicker zonas={zonas} zonaActual={zona} tema={tema} />
      </div>

      {loading && !clima ? (
        <LoadingSkeleton tema={tema} />
      ) : error && !clima ? (
        <ErrorState error={error} onRetry={refresh} tema={tema} />
      ) : clima ? (
        <div className="space-y-4">
          <HeroCard clima={clima} tema={tema} />
          <AlertBanner alertas={clima.alertas} recomendacion={clima.recomendacion} tema={tema} />
          <WeatherStrip proximas_horas={clima.proximas_horas} tema={tema} />
          <div className="grid grid-cols-2 gap-3">
            <WindCard clima={clima} tema={tema} />
            <UVGauge uv_data={clima.uv} tema={tema} />
          </div>
          <SargazoIndicator sargazo={clima.sargazo} tema={tema} />
          <ForecastWeek pronostico={clima.pronostico_7dias} tema={tema} />
          <CTAWhatsApp tema={tema} />
        </div>
      ) : null}
    </>
  );
}
