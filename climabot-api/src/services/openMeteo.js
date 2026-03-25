/**
 * Cliente Open-Meteo API — fuente principal de datos meteorológicos
 * Gratis, sin API key, ~10,000 requests/día
 * v2: incluye fetch de datos marinos para zonas costeras
 */

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const { fetchMarineSafe } = require('./openMeteoMarine');

async function fetchClima(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
      'precipitation', 'weather_code', 'wind_speed_10m',
      'wind_direction_10m', 'wind_gusts_10m', 'uv_index'
    ].join(','),
    hourly: [
      'temperature_2m', 'relative_humidity_2m', 'precipitation_probability',
      'precipitation', 'weather_code', 'uv_index',
      'wind_speed_10m', 'wind_direction_10m'
    ].join(','),
    daily: [
      'temperature_2m_max', 'temperature_2m_min', 'precipitation_probability_max',
      'precipitation_sum', 'uv_index_max', 'weather_code',
      'wind_speed_10m_max', 'wind_direction_10m_dominant'
    ].join(','),
    timezone: 'America/Cancun',
    forecast_days: 7
  });

  const response = await fetch(`${BASE_URL}?${params}`, {
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo status ${response.status}`);
  }

  return parsearRespuesta(await response.json());
}

function parsearRespuesta(raw) {
  const { current, hourly, daily } = raw;

  // Hora actual en formato de Open-Meteo
  const ahora = new Date();
  const hoyStr = ahora.toLocaleString('sv-SE', { timeZone: 'America/Cancun' }).slice(0, 10);
  const horaActualStr = ahora.toLocaleString('sv-SE', { timeZone: 'America/Cancun' }).slice(0, 13) + ':00';

  // Pronóstico por hora — próximas 12h
  const idxHora = hourly.time.findIndex(t => t >= horaActualStr);
  const pronosticoHoras = [];
  if (idxHora >= 0) {
    for (let i = idxHora; i < Math.min(idxHora + 12, hourly.time.length); i++) {
      pronosticoHoras.push({
        hora: hourly.time[i].slice(11, 16),
        temp_c: Math.round(hourly.temperature_2m[i]),
        humedad_pct: hourly.relative_humidity_2m[i],
        lluvia_pct: hourly.precipitation_probability[i] || 0,
        precipitacion_mm: hourly.precipitation[i] || 0,
        uv: hourly.uv_index[i] || 0,
        viento_kmh: Math.round(hourly.wind_speed_10m[i]),
        weather_code: hourly.weather_code[i]
      });
    }
  }

  // Próxima lluvia (>40% probabilidad)
  let proximaLluvia = null;
  if (idxHora >= 0) {
    for (let i = idxHora; i < Math.min(idxHora + 24, hourly.time.length); i++) {
      if ((hourly.precipitation_probability[i] || 0) > 40) {
        proximaLluvia = hourly.time[i].slice(11, 16);
        break;
      }
    }
  }

  // Hora pico UV y hora segura
  let uvMax = 0, horaPicoUV = '12:30', horaSeguraUV = '16:00';
  for (let i = 0; i < hourly.time.length; i++) {
    if (hourly.time[i].startsWith(hoyStr) && (hourly.uv_index[i] || 0) > uvMax) {
      uvMax = hourly.uv_index[i];
      horaPicoUV = hourly.time[i].slice(11, 16);
    }
  }
  for (let i = 0; i < hourly.time.length; i++) {
    if (hourly.time[i].startsWith(hoyStr) && hourly.time[i].slice(11, 13) >= '14' && (hourly.uv_index[i] || 0) < 6) {
      horaSeguraUV = hourly.time[i].slice(11, 16);
      break;
    }
  }

  // Pronóstico diario (7 días)
  const pronosticoDias = daily.time.map((fecha, i) => ({
    fecha,
    temp_min: Math.round(daily.temperature_2m_min[i]),
    temp_max: Math.round(daily.temperature_2m_max[i]),
    lluvia_pct: daily.precipitation_probability_max[i] || 0,
    precipitacion_mm: daily.precipitation_sum[i] || 0,
    uv_max: daily.uv_index_max[i] || 0,
    viento_max_kmh: Math.round(daily.wind_speed_10m_max[i]),
    weather_code: daily.weather_code[i]
  }));

  // Volumen de precipitación restante hoy
  let volumenHoy = 0;
  if (idxHora >= 0) {
    for (let i = idxHora; i < hourly.time.length && hourly.time[i].startsWith(hoyStr); i++) {
      volumenHoy += hourly.precipitation[i] || 0;
    }
  }

  return {
    actual: {
      temperatura_c: Math.round(current.temperature_2m),
      sensacion_termica_c: Math.round(current.apparent_temperature),
      humedad_pct: current.relative_humidity_2m,
      weather_code: current.weather_code,
      precipitacion_actual_mm: current.precipitation || 0
    },
    viento: {
      velocidad_kmh: Math.round(current.wind_speed_10m),
      rafagas_kmh: Math.round(current.wind_gusts_10m),
      direccion_grados: current.wind_direction_10m
    },
    uv: {
      indice: Math.round(current.uv_index || 0),
      hora_pico: horaPicoUV,
      hora_segura: horaSeguraUV
    },
    precipitacion: {
      probabilidad_pct: pronosticoHoras[0]?.lluvia_pct || 0,
      proxima_lluvia: proximaLluvia,
      volumen_mm: Math.round(volumenHoy * 10) / 10
    },
    diario: {
      temp_min_c: pronosticoDias[0]?.temp_min || 0,
      temp_max_c: pronosticoDias[0]?.temp_max || 0
    },
    pronostico_horas: pronosticoHoras,
    pronostico_dias: pronosticoDias
  };
}

/**
 * Fetch combinado: clima + marine (para zonas costeras)
 * Si marine falla, retorna marino: null
 */
async function fetchClimaConMarine(lat, lon, isCostal = true) {
  if (!isCostal) {
    const clima = await fetchClima(lat, lon);
    return { ...clima, marino: null };
  }

  const [clima, marino] = await Promise.all([
    fetchClima(lat, lon),
    fetchMarineSafe(lat, lon)
  ]);

  return { ...clima, marino };
}

module.exports = { fetchClima, fetchClimaConMarine };
