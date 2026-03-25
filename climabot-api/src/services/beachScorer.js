/**
 * Motor de scoring por playa — Perfect / Okay / Avoid
 * Función pura: recibe datos de clima + marine + config de playa → score 0-100
 * Costo: $0, ejecución <1ms
 */

/**
 * Calcula el ángulo relativo entre viento y orientación de playa
 * Resultado: 0° = onshore directo, 180° = offshore perfecto
 */
function calcularAnguloViento(windDir, beachOrientation) {
  // El viento "viene de" windDir grados. La playa "mira hacia" beachOrientation.
  // Onshore = viento viene de la misma dirección que la playa mira
  // Offshore = viento viene del lado opuesto (desde tierra)
  let diff = Math.abs(windDir - beachOrientation);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

/**
 * Score de viento (0-30 puntos)
 * Offshore = agua plana = máximo score
 * Onshore fuerte = chop = mínimo score
 */
function scoreViento(windDir, windSpeed, beachOrientation, shelter) {
  const angulo = calcularAnguloViento(windDir, beachOrientation);
  let score = 0;

  if (angulo > 150) {
    // Offshore — viento de tierra, agua plana
    score = 30;
    if (windSpeed > 30) score = 25; // Offshore muy fuerte aún puede molestar
  } else if (angulo > 90) {
    // Crosswind parcial, algo de chop
    if (windSpeed <= 10) score = 25;
    else if (windSpeed <= 20) score = 18;
    else if (windSpeed <= 30) score = 12;
    else score = 5;
  } else if (angulo > 45) {
    // Crosswind directo
    if (windSpeed <= 10) score = 20;
    else if (windSpeed <= 20) score = 12;
    else if (windSpeed <= 30) score = 6;
    else score = 2;
  } else {
    // Onshore — viento del mar
    if (windSpeed <= 8) score = 18;
    else if (windSpeed <= 15) score = 10;
    else if (windSpeed <= 25) score = 4;
    else score = 0;
  }

  // Shelter bonus
  if (shelter === 'sheltered') score = Math.min(30, score + 10);
  else if (shelter === 'moderate') score = Math.min(30, score + 5);

  return score;
}

/**
 * Score de olas (0-20 puntos)
 * Mar calmo = máximo, mar bravo = mínimo
 */
function scoreOlas(marineData, hasReef) {
  if (!marineData) return 12; // Sin datos marinos → score neutro

  const olas = marineData.actual.olas_m;
  let score;

  if (olas < 0.3) score = 20;       // Cristalino
  else if (olas < 0.5) score = 18;   // Casi plano
  else if (olas < 0.8) score = 15;   // Oleaje suave
  else if (olas < 1.2) score = 10;   // Moderado
  else if (olas < 1.8) score = 5;    // Fuerte
  else score = 0;                     // Peligroso

  // Reef bonus — arrecife frena oleaje
  if (hasReef && olas >= 0.5) score = Math.min(20, score + 5);

  return score;
}

/**
 * Score de lluvia (0-20 puntos)
 */
function scoreLluvia(probabilidadPct) {
  if (probabilidadPct <= 10) return 20;
  if (probabilidadPct <= 25) return 17;
  if (probabilidadPct <= 40) return 13;
  if (probabilidadPct <= 60) return 8;
  if (probabilidadPct <= 80) return 4;
  return 0;
}

/**
 * Score de UV (0-15 puntos)
 * UV moderado = ideal para playa, UV extremo = peligroso
 */
function scoreUV(uvIndex) {
  if (uvIndex >= 3 && uvIndex <= 7) return 15;  // Ideal beach UV
  if (uvIndex >= 8 && uvIndex <= 10) return 10;  // Alto pero manejable
  if (uvIndex >= 11) return 5;                    // Extremo
  return 10;                                       // Bajo (nublado)
}

/**
 * Score de sargazo (0-15 puntos)
 */
function scoreSargazo(escala_0_5) {
  const scores = [15, 12, 9, 6, 3, 0];
  return scores[Math.min(escala_0_5, 5)] ?? 15;
}

/**
 * Genera interpretación contextual del viento tipo BeachCast
 */
function interpretarViento(windDir, windSpeed, beachOrientation, shelter) {
  const angulo = calcularAnguloViento(windDir, beachOrientation);

  if (windSpeed <= 8) {
    return { es: 'Brisa ligera — agua en calma', en: 'Light breeze — calm water' };
  }

  if (angulo > 150) {
    // Offshore
    if (shelter === 'sheltered') {
      return { es: 'Bahía protegida con brisa de tierra — agua cristalina', en: 'Sheltered bay with offshore breeze — crystal-clear water' };
    }
    return { es: 'Viento de tierra — agua plana como espejo', en: 'Offshore wind — glassy, flat water' };
  }

  if (angulo > 90) {
    if (windSpeed > 25) {
      return { es: 'Viento lateral fuerte — oleaje cruzado', en: 'Strong crosswind — choppy conditions' };
    }
    return { es: 'Viento lateral — algo de oleaje', en: 'Crosswind — some chop along the shoreline' };
  }

  if (angulo > 45) {
    if (shelter === 'sheltered') {
      return { es: 'Bahía protegida mantiene el agua calma', en: 'Sheltered bay keeps the water calm' };
    }
    if (windSpeed > 20) {
      return { es: 'Viento cruzado empujando olas — precaución', en: 'Crosswind building waves — use caution' };
    }
    return { es: 'Viento cruzado ligero — condiciones aceptables', en: 'Light crosswind — acceptable conditions' };
  }

  // Onshore
  if (windSpeed > 25) {
    return { es: 'Viento fuerte del mar — oleaje alto, no recomendable para nado', en: 'Strong onshore wind — high waves, not recommended for swimming' };
  }
  if (windSpeed > 15) {
    return { es: 'Viento del mar empujando olas hacia la orilla', en: 'Onshore wind building waves toward shore' };
  }
  return { es: 'Brisa del mar — oleaje suave', en: 'Sea breeze — gentle waves' };
}

/**
 * Función principal de scoring
 * @param {Object} weatherData — datos de openMeteo.fetchClima()
 * @param {Object|null} marineData — datos de openMeteoMarine.fetchMarine() o null
 * @param {Object} beachConfig — config estática de playas.js
 * @param {number} sargazoEscala — escala 0-5
 * @returns {{ score: number, label: string, color: string, breakdown: Object, interpretacion: Object }}
 */
function scoreBeach(weatherData, marineData, beachConfig, sargazoEscala = 0) {
  const windDir = weatherData.viento.direccion_grados;
  const windSpeed = weatherData.viento.velocidad_kmh;
  const rainPct = weatherData.precipitacion.probabilidad_pct;
  const uvIndex = weatherData.uv.indice;

  const breakdown = {
    viento: scoreViento(windDir, windSpeed, beachConfig.orientacion_grados, beachConfig.shelter),
    olas: scoreOlas(marineData, beachConfig.has_reef),
    lluvia: scoreLluvia(rainPct),
    uv: scoreUV(uvIndex),
    sargazo: scoreSargazo(sargazoEscala)
  };

  const score = breakdown.viento + breakdown.olas + breakdown.lluvia + breakdown.uv + breakdown.sargazo;

  let label, color;
  if (score >= 70) { label = 'Perfect'; color = 'green'; }
  else if (score >= 40) { label = 'Okay'; color = 'yellow'; }
  else { label = 'Avoid'; color = 'red'; }

  const interpretacion = interpretarViento(windDir, windSpeed, beachConfig.orientacion_grados, beachConfig.shelter);

  return { score, label, color, breakdown, interpretacion };
}

/**
 * Scoring por hora — para WhenToGo (futuro)
 */
function scoreBeachHourly(pronosticoHoras, marineData, beachConfig, sargazoEscala = 0) {
  return pronosticoHoras.map(hora => {
    const mockWeather = {
      viento: { direccion_grados: 0, velocidad_kmh: hora.viento_kmh },
      precipitacion: { probabilidad_pct: hora.lluvia_pct },
      uv: { indice: hora.uv || 0 }
    };
    // Para hourly no tenemos dirección de viento por hora en el formato actual
    // Usamos la dirección actual como aproximación
    const result = scoreBeach(mockWeather, marineData, beachConfig, sargazoEscala);
    return { hora: hora.hora, ...result };
  });
}

module.exports = { scoreBeach, scoreBeachHourly, calcularAnguloViento, interpretarViento };
