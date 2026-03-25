/**
 * Tests para el motor de scoring por playa
 */
const { scoreBeach, calcularAnguloViento } = require('../src/services/beachScorer');

// Mock de datos de clima (estructura de openMeteo.parsearRespuesta)
function mockWeather(overrides = {}) {
  return {
    actual: { temperatura_c: 30, sensacion_termica_c: 32, humedad_pct: 70, weather_code: 0, precipitacion_actual_mm: 0 },
    viento: { velocidad_kmh: 15, rafagas_kmh: 20, direccion_grados: 90, ...overrides.viento },
    uv: { indice: 6, hora_pico: '12:30', hora_segura: '16:00', ...overrides.uv },
    precipitacion: { probabilidad_pct: 10, proxima_lluvia: null, volumen_mm: 0, ...overrides.precipitacion },
    diario: { temp_min_c: 25, temp_max_c: 33 },
    pronostico_horas: [],
    pronostico_dias: []
  };
}

// Mock de datos marinos
function mockMarine(overrides = {}) {
  return {
    actual: { olas_m: 0.4, periodo_s: 6, dir_olas_grados: 90, ...overrides },
    pronostico_olas: [],
    diario: []
  };
}

// Mock de config de playa
function mockPlaya(overrides = {}) {
  return {
    id: 'test-playa',
    orientacion_grados: 80,
    shelter: 'exposed',
    has_reef: false,
    tipo: 'arena',
    ...overrides
  };
}

// === Tests de ángulo de viento ===
describe('calcularAnguloViento', () => {
  test('Viento de la misma dirección que la playa = onshore (0°)', () => {
    expect(calcularAnguloViento(80, 80)).toBe(0);
  });

  test('Viento opuesto = offshore (180°)', () => {
    expect(calcularAnguloViento(260, 80)).toBe(180);
  });

  test('Viento perpendicular = crosswind (90°)', () => {
    expect(calcularAnguloViento(170, 80)).toBe(90);
  });

  test('Maneja wrap-around de 360°', () => {
    expect(calcularAnguloViento(350, 10)).toBe(20);
    expect(calcularAnguloViento(10, 350)).toBe(20);
  });
});

// === Tests de scoring ===
describe('scoreBeach', () => {
  test('Condiciones perfectas → score alto (Perfect)', () => {
    // Offshore wind (260° vs 80° = 180° offshore), calm sea, no rain, good UV, no sargazo
    const weather = mockWeather({ viento: { velocidad_kmh: 10, direccion_grados: 260 } });
    const marine = mockMarine({ olas_m: 0.2 });
    const playa = mockPlaya();

    const result = scoreBeach(weather, marine, playa, 0);
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.label).toBe('Perfect');
  });

  test('Onshore fuerte → score bajo (Avoid)', () => {
    // Onshore directo (80° vs 80°) + viento fuerte + olas altas + lluvia + sargazo
    const weather = mockWeather({
      viento: { velocidad_kmh: 30, direccion_grados: 80 },
      precipitacion: { probabilidad_pct: 80 }
    });
    const marine = mockMarine({ olas_m: 2.0 });
    const playa = mockPlaya();

    const result = scoreBeach(weather, marine, playa, 4);
    expect(result.score).toBeLessThan(40);
    expect(result.label).toBe('Avoid');
  });

  test('Mismo viento, playa sheltered vs exposed → scores diferentes', () => {
    const weather = mockWeather({ viento: { velocidad_kmh: 20, direccion_grados: 80 } });
    const marine = mockMarine({ olas_m: 1.0 });

    const exposed = scoreBeach(weather, marine, mockPlaya({ shelter: 'exposed' }), 0);
    const sheltered = scoreBeach(weather, marine, mockPlaya({ shelter: 'sheltered' }), 0);

    expect(sheltered.score).toBeGreaterThan(exposed.score);
  });

  test('Sargazo alto es deal breaker', () => {
    const weather = mockWeather({ viento: { velocidad_kmh: 5, direccion_grados: 260 } });
    const marine = mockMarine({ olas_m: 0.2 });
    const playa = mockPlaya();

    const sinSargazo = scoreBeach(weather, marine, playa, 0);
    const conSargazo = scoreBeach(weather, marine, playa, 5);

    expect(sinSargazo.score - conSargazo.score).toBe(15); // 15 puntos de diferencia
    expect(sinSargazo.score).toBeGreaterThanOrEqual(70);
  });

  test('Marine data null → scoring funciona (score neutro para olas)', () => {
    const weather = mockWeather({ viento: { velocidad_kmh: 10, direccion_grados: 260 } });
    const playa = mockPlaya();

    const result = scoreBeach(weather, null, playa, 0);
    expect(result.score).toBeGreaterThan(0);
    expect(result.breakdown.olas).toBe(12); // Score neutro sin marine data
    expect(result.label).toBeDefined();
  });

  test('Reef bonus reduce penalización de olas', () => {
    const weather = mockWeather();
    const marine = mockMarine({ olas_m: 1.0 });

    const sinReef = scoreBeach(weather, marine, mockPlaya({ has_reef: false }), 0);
    const conReef = scoreBeach(weather, marine, mockPlaya({ has_reef: true }), 0);

    expect(conReef.breakdown.olas).toBeGreaterThan(sinReef.breakdown.olas);
  });

  test('Interpretación de viento es bilingüe', () => {
    const weather = mockWeather({ viento: { velocidad_kmh: 15, direccion_grados: 260 } });
    const marine = mockMarine();
    const playa = mockPlaya();

    const result = scoreBeach(weather, marine, playa, 0);
    expect(result.interpretacion).toHaveProperty('es');
    expect(result.interpretacion).toHaveProperty('en');
    expect(typeof result.interpretacion.es).toBe('string');
    expect(typeof result.interpretacion.en).toBe('string');
  });

  test('Score siempre está entre 0 y 100', () => {
    // Peor caso posible
    const worst = scoreBeach(
      mockWeather({ viento: { velocidad_kmh: 50, direccion_grados: 80 }, precipitacion: { probabilidad_pct: 100 }, uv: { indice: 12 } }),
      mockMarine({ olas_m: 3.0 }),
      mockPlaya(),
      5
    );
    expect(worst.score).toBeGreaterThanOrEqual(0);

    // Mejor caso posible
    const best = scoreBeach(
      mockWeather({ viento: { velocidad_kmh: 5, direccion_grados: 260 }, precipitacion: { probabilidad_pct: 0 }, uv: { indice: 5 } }),
      mockMarine({ olas_m: 0.1 }),
      mockPlaya({ shelter: 'sheltered' }),
      0
    );
    expect(best.score).toBeLessThanOrEqual(100);
  });
});
