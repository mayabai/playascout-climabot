/**
 * Motor de recomendaciones — Capa 1 (reglas) + lookup Capa 2 (variantes SQLite)
 * Capa 1: $0, ~0ms — siempre funciona
 * Capa 2: ~0ms en consulta — variantes pre-generadas por Haiku cada 5h
 */
const { getVarianteMenosUsada } = require('../db/queries');

// Reglas determinísticas — se evalúan en orden, la primera que matchea gana
const REGLAS = [
  {
    condicion: (d) => d.norte === true,
    categoria: 'norte_activo',
    fallback: 'Mar cerrado. Pueblos mágicos, cenotes techados, o día de spa'
  },
  {
    condicion: (d) => d.uv > 10 && d.lluvia_pct < 20 && !d.norte,
    categoria: 'sol_extremo_seco',
    fallback: 'Cenotes por la mañana, playa después de 4pm cuando baja el UV'
  },
  {
    condicion: (d) => d.uv > 10 && d.lluvia_pct >= 20 && d.lluvia_pct < 60 && !d.norte,
    categoria: 'sol_extremo_lluvia_probable',
    fallback: 'Playa temprano, cenotes por la tarde si llueve'
  },
  {
    condicion: (d) => d.lluvia_pct >= 70 && !d.norte,
    categoria: 'dia_lluvioso',
    fallback: 'Museos, zona arqueológica temprano, shopping malls con AC'
  },
  {
    condicion: (d) => d.lluvia_pct >= 40 && d.lluvia_pct < 70 && !d.norte,
    categoria: 'lluvia_intermitente',
    fallback: 'Playa por la mañana, ten plan B para la tarde. Cenotes siempre funcionan'
  },
  {
    condicion: (d) => d.viento_kmh > 25 && d.viento_kmh <= 40 && !d.norte,
    categoria: 'viento_moderado',
    fallback: 'Buen día para kitesurf. Snorkel solo en zonas protegidas'
  },
  {
    condicion: (d) => d.temp_c < 22,
    categoria: 'fresco_inusual',
    fallback: 'Temperatura fresca. Lleva suéter, ideal para caminar zonas arqueológicas'
  },
  {
    condicion: (d) => d.uv <= 7 && d.lluvia_pct < 30 && d.viento_kmh <= 25 && !d.norte,
    categoria: 'dia_perfecto',
    fallback: 'Día ideal de playa y actividades al aire libre todo el día'
  }
];

// Fallback final si ninguna regla matchea
const DEFAULT = { categoria: 'normal', fallback: 'Buen día para combinar playa y cenotes' };

/**
 * Determina la categoría del día basado en condiciones
 * @returns {object} { categoria, fallback }
 */
function determinarCategoria(condiciones) {
  for (const regla of REGLAS) {
    if (regla.condicion(condiciones)) {
      return { categoria: regla.categoria, fallback: regla.fallback };
    }
  }
  return DEFAULT;
}

/**
 * Genera recomendación completa — intenta Capa 2, fallback a Capa 1
 */
function generarRecomendacion(condiciones, zona, periodo) {
  const { categoria, fallback } = determinarCategoria(condiciones);

  // Intentar Capa 2 — variante pre-generada por Haiku
  let actividad_ideal;
  try {
    const variante = getVarianteMenosUsada(zona, categoria, periodo);
    actividad_ideal = variante || fallback; // Si no hay variante, usar fallback
  } catch (e) {
    // Si SQLite falla, fallback silencioso a Capa 1
    actividad_ideal = fallback;
  }

  // Qué llevar — basado en condiciones
  const que_llevar = [];
  if (condiciones.uv > 6) que_llevar.push('Bloqueador SPF 50+');
  if (condiciones.uv > 3) que_llevar.push('Sombrero');
  if (condiciones.lluvia_pct > 30) que_llevar.push('Paraguas compacto');
  if (condiciones.temp_c < 22) que_llevar.push('Suéter ligero');
  if (condiciones.viento_kmh > 25) que_llevar.push('Gorra que no vuele');
  if (que_llevar.length === 0) que_llevar.push('Bloqueador SPF 30+', 'Lentes de sol');

  // Alerta turista
  let alerta_turista = null;
  if (condiciones.norte) alerta_turista = '⚠️ Norte activo: evita playas y actividades acuáticas';
  else if (condiciones.sargazo_escala >= 4) alerta_turista = `🟤 Sargazo alto en esta zona. Verifica playas limpias`;
  else if (condiciones.lluvia_pct > 80) alerta_turista = '🌧️ Lluvias fuertes esperadas';

  return { actividad_ideal, que_llevar, alerta_turista, categoria };
}

// Exportar REGLAS para testing
module.exports = { generarRecomendacion, determinarCategoria, REGLAS };
