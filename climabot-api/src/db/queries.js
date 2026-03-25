/**
 * Queries preparadas para SQLite — performance optimizada
 */
const { getDB } = require('./init');

// === RECOMENDACIONES CAPA 2 ===

// Obtener la variante menos usada para una zona+categoría+período
function getVarianteMenosUsada(zona, categoria, periodo) {
  const db = getDB();
  const row = db.prepare(`
    SELECT id, variantes, usado_count FROM recomendaciones_cache
    WHERE zona = ? AND categoria = ? AND periodo = ?
    ORDER BY usado_count ASC, generado_at DESC
    LIMIT 1
  `).get(zona, categoria, periodo);

  if (row) {
    // Incrementar contador de uso
    db.prepare('UPDATE recomendaciones_cache SET usado_count = usado_count + 1 WHERE id = ?').run(row.id);
    try {
      const variantes = JSON.parse(row.variantes);
      // Rotar: devolver la variante con índice = usado_count % total
      const idx = row.usado_count % variantes.length;
      return variantes[idx];
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Guardar nuevas variantes generadas por Haiku
function guardarVariantes(zona, categoria, periodo, variantes) {
  const db = getDB();
  db.prepare(`
    INSERT INTO recomendaciones_cache (zona, categoria, periodo, variantes)
    VALUES (?, ?, ?, ?)
  `).run(zona, categoria, periodo, JSON.stringify(variantes));
}

// Obtener última categoría generada para una zona
function getUltimaCategoria(zona) {
  const db = getDB();
  return db.prepare(`
    SELECT categoria, periodo FROM recomendaciones_cache
    WHERE zona = ? ORDER BY generado_at DESC LIMIT 1
  `).get(zona);
}

// ¿Necesita regenerar variantes?
function necesitaRegenerar(zona, nuevaCategoria, nuevoPeriodo) {
  const ultima = getUltimaCategoria(zona);
  if (!ultima) return true;
  return ultima.categoria !== nuevaCategoria || ultima.periodo !== nuevoPeriodo;
}

// === ALERTAS SOCIALES ===

function guardarAlertaSocial(alerta) {
  const db = getDB();
  // Verificar que no sea duplicada (misma fuente + contenido en últimas 6h)
  const existe = db.prepare(`
    SELECT id FROM alertas_sociales
    WHERE fuente = ? AND contenido = ? AND creado_at > datetime('now', '-6 hours')
  `).get(alerta.fuente, alerta.contenido);

  if (existe) return null;

  return db.prepare(`
    INSERT INTO alertas_sociales (fuente, tipo, zona, contenido, url_fuente, relevancia)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(alerta.fuente, alerta.tipo, alerta.zona, alerta.contenido, alerta.url_fuente, alerta.relevancia || 3);
}

function getAlertasRecientes(zona, limite = 5) {
  const db = getDB();
  const query = zona
    ? `SELECT * FROM alertas_sociales WHERE (zona = ? OR zona IS NULL) AND creado_at > datetime('now', '-24 hours') ORDER BY creado_at DESC LIMIT ?`
    : `SELECT * FROM alertas_sociales WHERE creado_at > datetime('now', '-24 hours') ORDER BY creado_at DESC LIMIT ?`;
  return zona ? db.prepare(query).all(zona, limite) : db.prepare(query).all(limite);
}

// === MÉTRICAS ===

function incrementarMetrica(zona, tipo) {
  const db = getDB();
  const fecha = new Date().toISOString().slice(0, 10);

  db.prepare(`
    INSERT INTO metricas (fecha, zona, ${tipo})
    VALUES (?, ?, 1)
    ON CONFLICT(fecha, zona)
    DO UPDATE SET ${tipo} = ${tipo} + 1
  `).run(fecha, zona);
}

function getEstadisticasHoy() {
  const db = getDB();
  const fecha = new Date().toISOString().slice(0, 10);
  return db.prepare(`
    SELECT zona, requests, cache_hits, cache_misses FROM metricas WHERE fecha = ? ORDER BY requests DESC
  `).all(fecha);
}

// === NORTES LOG ===

function registrarAlertaNorte(zona, categoria, velocidadKmh) {
  const db = getDB();
  db.prepare(`INSERT INTO alertas_nortes_log (zona, categoria, velocidad_kmh) VALUES (?, ?, ?)`).run(zona, categoria, velocidadKmh);
}

function alertaNorteReciente(zona) {
  const db = getDB();
  const row = db.prepare(`
    SELECT id FROM alertas_nortes_log WHERE zona = ? AND enviado_at > datetime('now', '-6 hours')
  `).get(zona);
  return !!row;
}

// === LOG GENERACIÓN ===

function logGeneracion(data) {
  const db = getDB();
  db.prepare(`
    INSERT INTO log_generacion (zonas_procesadas, zonas_regeneradas, zonas_skip, errores, duracion_ms)
    VALUES (?, ?, ?, ?, ?)
  `).run(data.procesadas, data.regeneradas, data.skip, data.errores || null, data.duracion_ms);
}

module.exports = {
  getVarianteMenosUsada, guardarVariantes, getUltimaCategoria, necesitaRegenerar,
  guardarAlertaSocial, getAlertasRecientes,
  incrementarMetrica, getEstadisticasHoy,
  registrarAlertaNorte, alertaNorteReciente,
  logGeneracion
};
