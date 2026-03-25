/**
 * Funciones de formateo para respuestas de clima
 */

function gradosADireccion(grados) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(grados / 22.5) % 16];
}

function descripcionMar(velocidadKmh) {
  if (velocidadKmh > 50) return 'Mar muy agitado, no apto para actividades acuáticas';
  if (velocidadKmh > 40) return 'Mar agitado, evitar actividades acuáticas';
  if (velocidadKmh > 30) return 'Oleaje fuerte, no recomendable para nado';
  if (velocidadKmh > 20) return 'Oleaje moderado, apto para nado con precaución';
  if (velocidadKmh > 10) return 'Mar tranquilo, excelente para snorkel y nado';
  return 'Mar en calma, condiciones ideales';
}

function nivelUV(uv) {
  if (uv >= 11) return { nivel: 'Extremo', recomendacion: 'Evita exposición directa 11am-3pm. SPF 50+ obligatorio.' };
  if (uv >= 8) return { nivel: 'Muy Alto', recomendacion: 'SPF 50+, sombrero y sombra entre 11am-3pm.' };
  if (uv >= 6) return { nivel: 'Alto', recomendacion: 'SPF 30+ recomendado. Usa gorra o sombrero.' };
  if (uv >= 3) return { nivel: 'Moderado', recomendacion: 'SPF 30 si estarás al aire libre.' };
  return { nivel: 'Bajo', recomendacion: 'Sin riesgo significativo.' };
}

function weatherCodeAIcono(code) {
  const map = {
    0: { icono: 'sunny', descripcion: 'Despejado' },
    1: { icono: 'mostly_sunny', descripcion: 'Mayormente despejado' },
    2: { icono: 'partly_cloudy', descripcion: 'Parcialmente nublado' },
    3: { icono: 'cloudy', descripcion: 'Nublado' },
    45: { icono: 'foggy', descripcion: 'Neblina' },
    48: { icono: 'foggy', descripcion: 'Neblina densa' },
    51: { icono: 'light_rain', descripcion: 'Llovizna ligera' },
    53: { icono: 'light_rain', descripcion: 'Llovizna moderada' },
    55: { icono: 'rain', descripcion: 'Llovizna intensa' },
    61: { icono: 'light_rain', descripcion: 'Lluvia ligera' },
    63: { icono: 'rain', descripcion: 'Lluvia moderada' },
    65: { icono: 'heavy_rain', descripcion: 'Lluvia intensa' },
    80: { icono: 'rainy', descripcion: 'Chubascos ligeros' },
    81: { icono: 'rainy', descripcion: 'Chubascos moderados' },
    82: { icono: 'heavy_rain', descripcion: 'Chubascos fuertes' },
    95: { icono: 'thunderstorm', descripcion: 'Tormenta eléctrica' },
    96: { icono: 'thunderstorm', descripcion: 'Tormenta con granizo' },
    99: { icono: 'thunderstorm', descripcion: 'Tormenta severa' }
  };
  return map[code] || { icono: 'partly_cloudy', descripcion: 'Parcialmente nublado' };
}

// Resumen corto para pronóstico diario
function resumenDia(weatherCode, lluviaPct, vientoMax) {
  if (vientoMax > 40) return 'Norte / vientos fuertes';
  if (lluviaPct > 70) return 'Lluvias probables';
  if (lluviaPct > 40) return 'Lluvias intermitentes';
  const { descripcion } = weatherCodeAIcono(weatherCode);
  return descripcion;
}

// ─── Formatters para datos marinos (v2) ───

function formatSeaConditions(marineData) {
  if (!marineData) return { es: 'Sin datos de oleaje', en: 'No wave data available' };

  const olas = marineData.actual.olas_m;
  const periodo = marineData.actual.periodo_s;

  let estadoEs, estadoEn;
  if (olas < 0.3) {
    estadoEs = 'Mar en calma — agua cristalina';
    estadoEn = 'Calm — glassy water';
  } else if (olas < 0.5) {
    estadoEs = 'Mar tranquilo — pequeñas ondulaciones';
    estadoEn = 'Smooth — small ripples';
  } else if (olas < 1.0) {
    estadoEs = 'Oleaje suave — apto para nado';
    estadoEn = 'Slight — gentle waves';
  } else if (olas < 1.5) {
    estadoEs = 'Oleaje moderado — precaución al nadar';
    estadoEn = 'Moderate — swim with caution';
  } else if (olas < 2.5) {
    estadoEs = 'Oleaje fuerte — no recomendable para nado';
    estadoEn = 'Rough — not recommended for swimming';
  } else {
    estadoEs = 'Mar muy agitado — peligroso';
    estadoEn = 'Very rough — dangerous conditions';
  }

  return {
    es: estadoEs,
    en: estadoEn,
    olas_m: olas,
    periodo_s: periodo,
    temp_mar_c: marineData.actual.temp_mar_c || null
  };
}

function formatSargazoLabel(escala_0_5) {
  const labels = {
    0: { es: 'Limpia', en: 'Clean', emoji: '🟢' },
    1: { es: 'Mínimo', en: 'Minimal', emoji: '🟢' },
    2: { es: 'Algo', en: 'Some', emoji: '🟡' },
    3: { es: 'Moderado', en: 'Moderate', emoji: '🟡' },
    4: { es: 'Alto', en: 'Heavy', emoji: '🔴' },
    5: { es: 'Extremo', en: 'Extreme', emoji: '🔴' }
  };
  return labels[Math.min(escala_0_5, 5)] || labels[0];
}

function formatScoreLabel(label) {
  const labels = {
    'Perfect': { es: 'Perfecto', en: 'Perfect', emoji: '🟢' },
    'Okay': { es: 'Aceptable', en: 'Okay', emoji: '🟡' },
    'Avoid': { es: 'Evitar', en: 'Avoid', emoji: '🔴' }
  };
  return labels[label] || labels['Okay'];
}

module.exports = {
  gradosADireccion, descripcionMar, nivelUV, weatherCodeAIcono, resumenDia,
  formatSeaConditions, formatSargazoLabel, formatScoreLabel
};
