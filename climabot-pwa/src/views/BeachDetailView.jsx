import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useClimaStore from '../store/useClimaStore';
import ScoreGauge from '../components/ScoreGauge';
import ScoreBreakdown from '../components/ScoreBreakdown';
import AmenityList from '../components/AmenityList';
import NearbyBeaches from '../components/NearbyBeaches';
import WeatherStrip from '../components/WeatherStrip';
import CTAWhatsApp from '../components/CTAWhatsApp';
import { t, getNombre } from '../utils/i18n';
import { iconoEmoji } from '../utils/iconos';

// Safe string extraction — handles objects like {es, en} and primitives
function str(val, idioma = 'es') {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val[idioma] || val.es || val.en || '';
  return String(val);
}

export default function BeachDetailView({ tema }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const playaActual = useClimaStore(s => s.playaActual);
  const playasLoading = useClimaStore(s => s.playasLoading);
  const playasError = useClimaStore(s => s.playasError);
  const fetchPlaya = useClimaStore(s => s.fetchPlaya);
  const idioma = useClimaStore(s => s.idioma);

  useEffect(() => {
    fetchPlaya(id);
  }, [id]);

  if (playasLoading && !playaActual) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className={`h-40 rounded-3xl bg-gradient-to-br ${tema.heroGradient} opacity-50`} />
        <div className={`h-32 rounded-2xl ${tema.cardBg}`} />
        <div className={`h-48 rounded-2xl ${tema.cardBg}`} />
      </div>
    );
  }

  if (playasError && !playaActual) {
    return (
      <div className={`rounded-2xl ${tema.cardBg} p-6 text-center`}>
        <p className="text-4xl">😵</p>
        <p className={`mt-2 font-bold ${tema.textPrimary}`}>{t('error', idioma)}</p>
        <p className={`mt-1 text-sm ${tema.textSecondary}`}>{playasError}</p>
        <button onClick={() => navigate('/playas')} className={`mt-4 rounded-xl ${tema.accentBg} px-6 py-2 text-sm font-bold ${tema.accent}`}>
          {t('volver', idioma)}
        </button>
      </div>
    );
  }

  if (!playaActual) return null;

  const { playa, score, clima, viento, mar, uv, sargazo, alerta_norte, recomendacion_dia, pronostico_horas, pronostico_dias, playas_cercanas } = playaActual;
  const nombre = getNombre(playa, idioma);

  // Map pronostico_horas to WeatherStrip format
  const proximasHoras = pronostico_horas?.map(h => ({
    hora: h.hora,
    icono: iconoEmoji(h.icono),
    temperatura: h.temp_c,
    lluvia_pct: h.lluvia_pct
  }));

  // Map pronostico_dias
  const pronosticoDias = pronostico_dias?.map(d => ({
    fecha: d.fecha,
    icono: iconoEmoji(d.icono),
    max: d.temp_max,
    min: d.temp_min,
    lluvia_pct: d.lluvia_pct,
    resumen: d.resumen
  }));

  // Extract olas_m safely (mar might be {es, en} string or {olas_m, ...} object)
  const olasM = typeof mar === 'object' && mar?.olas_m != null ? mar.olas_m : null;
  const marDesc = str(mar, idioma);

  // Sargazo label is {es, en, emoji} object
  const sargazoLabel = str(sargazo?.label, idioma);

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className={`flex items-center gap-1 text-sm font-medium ${tema.accent} transition-all hover:gap-2`}
      >
        <span>←</span> {t('volver', idioma)}
      </button>

      {/* Hero */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${tema.heroGradient} p-6 text-white shadow-xl animate-fade-in`}>
        <div className="relative z-10">
          <h1 className="text-xl font-extrabold">{nombre}</h1>
          <p className="text-sm opacity-90">{playa.zona_id} · {t(playa.tipo, idioma)}</p>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <span className="text-5xl font-extrabold">{Math.round(clima.temperatura_c)}°</span>
              <p className="text-sm opacity-90">{clima.descripcion}</p>
            </div>
            <span className="text-4xl">{iconoEmoji(clima.icono)}</span>
          </div>

          <div className="mt-3 flex gap-4 text-sm opacity-90">
            <span>💨 {Math.round(viento.velocidad_kmh)} {t('kmh', idioma)}</span>
            {olasM != null && <span>🌊 {olasM} {t('metros', idioma)}</span>}
            {olasM == null && marDesc && <span>🌊 {marDesc}</span>}
            <span>☀️ UV {uv.indice}</span>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      </div>

      {/* Score */}
      <div className="grid grid-cols-2 gap-3">
        <ScoreGauge score={score.total} label={score.label} tema={tema} />
        <div className={`rounded-2xl ${tema.cardBg} ${tema.border} border p-4 flex flex-col justify-center`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${tema.textSecondary}`}>{t('viento', idioma)}</p>
          <p className={`mt-1 text-sm font-bold ${tema.textPrimary}`}>
            {str(score.interpretacion, idioma)}
          </p>
          <p className={`mt-2 text-xs ${tema.textSecondary}`}>
            {viento.direccion} · {Math.round(viento.velocidad_kmh)} {t('kmh', idioma)}
          </p>
        </div>
      </div>

      {/* Score Breakdown */}
      <ScoreBreakdown breakdown={score.breakdown} viento={viento} mar={mar} tema={tema} />

      {/* Recommendation */}
      {recomendacion_dia?.actividad_ideal && (
        <div className={`rounded-2xl ${tema.cardBg} ${tema.border} border p-4`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${tema.textSecondary}`}>💡 {idioma === 'es' ? 'Recomendacion' : 'Recommendation'}</p>
          <p className={`mt-1 text-sm ${tema.textPrimary}`}>{recomendacion_dia.actividad_ideal}</p>
          {recomendacion_dia.que_llevar?.length > 0 && (
            <p className={`mt-2 text-xs ${tema.textSecondary}`}>
              🎒 {recomendacion_dia.que_llevar.join(' · ')}
            </p>
          )}
        </div>
      )}

      {/* Norte alert */}
      {alerta_norte?.activo && (
        <div className="rounded-2xl bg-red-500/10 border border-red-300 p-4">
          <p className="text-sm font-bold text-red-700">🌪️ Alerta de Norte — {alerta_norte.categoria}</p>
          {alerta_norte.recomendacion && <p className="mt-1 text-xs text-red-600">{alerta_norte.recomendacion}</p>}
        </div>
      )}

      {/* UV detail */}
      <div className={`rounded-2xl ${tema.cardBg} ${tema.border} border p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${tema.textSecondary}`}>UV</p>
            <p className={`text-2xl font-extrabold ${tema.textPrimary}`}>{uv.indice}</p>
            <p className={`text-xs ${tema.textSecondary}`}>{uv.nivel}</p>
          </div>
          <div className="text-right">
            <p className={`text-xs ${tema.textSecondary}`}>{uv.recomendacion}</p>
            {uv.hora_pico && <p className={`text-xs mt-1 ${tema.accent}`}>Pico: {uv.hora_pico}</p>}
          </div>
        </div>
      </div>

      {/* Sargazo */}
      <div className={`rounded-2xl ${tema.cardBg} ${tema.border} border p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${tema.textSecondary}`}>{t('sargazo', idioma)}</p>
            <p className={`text-lg font-extrabold ${tema.textPrimary}`}>{sargazoLabel}</p>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`h-3 w-3 rounded-full ${i <= (sargazo?.escala_0_5 || 0) ? 'bg-amber-600' : 'bg-gray-300/30'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Hourly forecast */}
      {proximasHoras && <WeatherStrip proximas_horas={proximasHoras} tema={tema} />}

      {/* 7-day forecast */}
      {pronosticoDias?.length > 0 && (
        <div className={`rounded-2xl ${tema.cardBg} ${tema.border} border p-4`}>
          <h3 className={`mb-3 text-sm font-semibold uppercase tracking-wide ${tema.textSecondary}`}>
            {t('pronostico', idioma)}
          </h3>
          <div className="space-y-2">
            {pronosticoDias.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className={`text-xs w-20 ${tema.textSecondary}`}>{d.fecha}</span>
                <span className="text-lg">{d.icono}</span>
                <span className={`text-xs font-bold ${tema.textPrimary}`}>{Math.round(d.max)}° / {Math.round(d.min)}°</span>
                <span className={`text-xs ${tema.textSecondary}`}>💧{d.lluvia_pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amenities */}
      <AmenityList amenidades={playa.amenidades} tema={tema} />

      {/* Nearby */}
      <NearbyBeaches playas={playas_cercanas} tema={tema} />

      {/* CTA */}
      <CTAWhatsApp tema={tema} />
    </div>
  );
}
