/**
 * Cliente Open-Meteo Marine API — datos de oleaje y temperatura del mar
 * Gratis, sin API key. Solo para zonas costeras.
 */

const MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine';

async function fetchMarine(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'wave_height', 'wave_period', 'wave_direction'
    ].join(','),
    hourly: [
      'wave_height', 'wave_period', 'wave_direction'
    ].join(','),
    daily: [
      'wave_height_max', 'wave_period_max'
    ].join(','),
    timezone: 'America/Cancun',
    forecast_days: 3
  });

  const response = await fetch(`${MARINE_URL}?${params}`, {
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo Marine status ${response.status}`);
  }

  return parsearMarino(await response.json());
}

function parsearMarino(raw) {
  const { current, hourly, daily } = raw;

  // Hora actual Cancún
  const ahora = new Date();
  const horaActualStr = ahora.toLocaleString('sv-SE', { timeZone: 'America/Cancun' }).slice(0, 13) + ':00';

  // Próximas 12 horas de oleaje
  const idxHora = hourly.time.findIndex(t => t >= horaActualStr);
  const pronosticoOlas = [];
  if (idxHora >= 0) {
    for (let i = idxHora; i < Math.min(idxHora + 12, hourly.time.length); i++) {
      pronosticoOlas.push({
        hora: hourly.time[i].slice(11, 16),
        olas_m: hourly.wave_height[i] || 0,
        periodo_s: hourly.wave_period[i] || 0,
        dir_olas: hourly.wave_direction[i] || 0
      });
    }
  }

  return {
    actual: {
      olas_m: current.wave_height || 0,
      periodo_s: current.wave_period || 0,
      dir_olas_grados: current.wave_direction || 0
    },
    pronostico_olas: pronosticoOlas,
    diario: daily.time.map((fecha, i) => ({
      fecha,
      olas_max_m: daily.wave_height_max[i] || 0,
      periodo_max_s: daily.wave_period_max[i] || 0
    }))
  };
}

/**
 * Fetch seguro — si falla, retorna null (el scorer funciona sin datos marinos)
 */
async function fetchMarineSafe(lat, lon) {
  try {
    return await fetchMarine(lat, lon);
  } catch (err) {
    console.warn(`[Marine API] Error para ${lat},${lon}: ${err.message}`);
    return null;
  }
}

module.exports = { fetchMarine, fetchMarineSafe };
