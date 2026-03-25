/**
 * Tests para ClimaBot API
 * Cubre: endpoints, cache, recomendador, período, alertas
 */
const { getPeriodo } = require('../src/utils/periodo');
const { evaluarNorte } = require('../src/services/alertas');
const { determinarCategoria, REGLAS } = require('../src/services/recomendador');
const { gradosADireccion, nivelUV, descripcionMar } = require('../src/utils/formatters');

// === Tests de período ===
describe('Período del día', () => {
  test('6am-11am es mañana', () => {
    expect(getPeriodo(6)).toBe('mañana');
    expect(getPeriodo(11)).toBe('mañana');
  });
  test('12pm-5pm es tarde', () => {
    expect(getPeriodo(12)).toBe('tarde');
    expect(getPeriodo(17)).toBe('tarde');
  });
  test('6pm-5am es noche', () => {
    expect(getPeriodo(18)).toBe('noche');
    expect(getPeriodo(23)).toBe('noche');
    expect(getPeriodo(0)).toBe('noche');
    expect(getPeriodo(5)).toBe('noche');
  });
});

// === Tests de alertas de norte ===
describe('Detección de nortes', () => {
  test('Viento fuerte del norte activa norte', () => {
    const resultado = evaluarNorte(45, 0);
    expect(resultado.activo).toBe(true);
    expect(resultado.categoria).toBe('moderado');
  });
  test('Viento fuerte del NNE activa norte', () => {
    expect(evaluarNorte(50, 15).activo).toBe(true);
  });
  test('Viento fuerte del este NO activa norte', () => {
    expect(evaluarNorte(50, 90).activo).toBe(false);
  });
  test('Viento débil del norte NO activa norte', () => {
    expect(evaluarNorte(20, 0).activo).toBe(false);
  });
  test('Viento >60 es norte fuerte', () => {
    expect(evaluarNorte(65, 0).categoria).toBe('fuerte');
  });
  test('Viento >80 es norte severo', () => {
    expect(evaluarNorte(85, 350).categoria).toBe('severo');
  });
});

// === Tests de recomendador Capa 1 ===
describe('Recomendador — Capa 1 reglas', () => {
  test('Norte activo prioriza sobre todo', () => {
    const r = determinarCategoria({ uv: 12, lluvia_pct: 10, norte: true, viento_kmh: 50, temp_c: 28 });
    expect(r.categoria).toBe('norte_activo');
  });
  test('UV extremo + seco → sol_extremo_seco', () => {
    const r = determinarCategoria({ uv: 12, lluvia_pct: 10, norte: false, viento_kmh: 15, temp_c: 32 });
    expect(r.categoria).toBe('sol_extremo_seco');
  });
  test('UV extremo + lluvia probable → sol_extremo_lluvia_probable', () => {
    const r = determinarCategoria({ uv: 11, lluvia_pct: 40, norte: false, viento_kmh: 15, temp_c: 30 });
    expect(r.categoria).toBe('sol_extremo_lluvia_probable');
  });
  test('Lluvia > 70% → dia_lluvioso', () => {
    const r = determinarCategoria({ uv: 5, lluvia_pct: 80, norte: false, viento_kmh: 10, temp_c: 26 });
    expect(r.categoria).toBe('dia_lluvioso');
  });
  test('Día perfecto con condiciones ideales', () => {
    const r = determinarCategoria({ uv: 5, lluvia_pct: 10, norte: false, viento_kmh: 10, temp_c: 28 });
    expect(r.categoria).toBe('dia_perfecto');
  });
  test('Temperatura fresca inusual', () => {
    const r = determinarCategoria({ uv: 4, lluvia_pct: 20, norte: false, viento_kmh: 10, temp_c: 19 });
    expect(r.categoria).toBe('fresco_inusual');
  });
  test('Viento moderado sin norte', () => {
    const r = determinarCategoria({ uv: 8, lluvia_pct: 15, norte: false, viento_kmh: 30, temp_c: 28 });
    expect(r.categoria).toBe('viento_moderado');
  });
  test('Todas las reglas tienen fallback', () => {
    REGLAS.forEach(regla => {
      expect(regla.fallback).toBeTruthy();
      expect(typeof regla.fallback).toBe('string');
    });
  });
});

// === Tests de formatters ===
describe('Formatters', () => {
  test('gradosADireccion convierte correctamente', () => {
    expect(gradosADireccion(0)).toBe('N');
    expect(gradosADireccion(90)).toBe('E');
    expect(gradosADireccion(180)).toBe('S');
    expect(gradosADireccion(270)).toBe('W');
  });
  test('nivelUV clasifica correctamente', () => {
    expect(nivelUV(12).nivel).toBe('Extremo');
    expect(nivelUV(9).nivel).toBe('Muy Alto');
    expect(nivelUV(6).nivel).toBe('Alto');
    expect(nivelUV(4).nivel).toBe('Moderado');
    expect(nivelUV(1).nivel).toBe('Bajo');
  });
  test('descripcionMar según viento', () => {
    expect(descripcionMar(5)).toContain('calma');
    expect(descripcionMar(15)).toContain('tranquilo');
    expect(descripcionMar(25)).toContain('moderado');
    expect(descripcionMar(35)).toContain('fuerte');
    expect(descripcionMar(45)).toContain('agitado');
    expect(descripcionMar(55)).toContain('muy agitado');
  });
});
