/**
 * ClimaBot API — Servidor Express
 * Clima hiperlocal para turistas en la Riviera Maya
 * Roma Tecnología × CancunBot
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initDB } = require('./db/init');
const { getZona, getTodasLasZonas, getZonaIds } = require('./config/zonas');
const { getPlaya, getTodasLasPlayas, getPlayaIds, getPlayasPorZona } = require('./config/playas');
const { fetchClima, fetchClimaConMarine } = require('./services/openMeteo');
const { getSargazo, actualizarSargazo, getSargazoPlaya, actualizarSargazoPlaya } = require('./services/sargazo');
const { scoreBeach } = require('./services/beachScorer');
const { evaluarNorte } = require('./services/alertas');
const { generarRecomendacion, determinarCategoria } = require('./services/recomendador');
const { generarVariantesHaiku } = require('./services/generadorVariantes');
const { procesarAlerta, obtenerAlertas } = require('./services/fuentesSociales');
const climaCache = require('./cache/climaCache');
const { getPeriodoActual, getTimestampCancun } = require('./utils/periodo');
const { gradosADireccion, descripcionMar, nivelUV, weatherCodeAIcono, resumenDia, formatSeaConditions, formatSargazoLabel, formatScoreLabel } = require('./utils/formatters');
const queries = require('./db/queries');

const app = express();
const PORT = process.env.PORT || 3500;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Inicializar DB
initDB();

// === Middleware de autenticación ===
function authAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: 'Token admin inválido' });
  next();
}

function authInternal(req, res, next) {
  const token = req.headers['x-internal-token'] || req.query.token;
  if (token !== process.env.INTERNAL_TOKEN) return res.status(401).json({ error: 'Token interno inválido' });
  next();
}

// ========================================
// ENDPOINT PRINCIPAL: GET /api/clima/:zona
// ========================================
app.get('/api/clima/:zona', async (req, res) => {
  const { zona: zonaId } = req.params;
  const zonaConfig = getZona(zonaId);

  if (!zonaConfig) {
    return res.status(404).json({ error: 'Zona no encontrada', zonas_disponibles: getZonaIds() });
  }

  // Métricas
  queries.incrementarMetrica(zonaId, 'requests');

  // Intentar cache fresco
  let datos = climaCache.get(zonaId);
  let esStale = false;

  if (datos) {
    queries.incrementarMetrica(zonaId, 'cache_hits');
  } else {
    queries.incrementarMetrica(zonaId, 'cache_misses');

    // Fetch de Open-Meteo
    try {
      datos = await fetchClima(zonaConfig.lat, zonaConfig.lon);
      climaCache.set(zonaId, datos);
    } catch (error) {
      console.error(`❌ Open-Meteo falló para ${zonaId}: ${error.message}`);

      // Fallback a cache stale
      datos = climaCache.getStale(zonaId);
      if (datos) {
        esStale = true;
      } else {
        return res.status(503).json({
          error: 'Servicio de clima no disponible temporalmente',
          retry_after_seconds: 60
        });
      }
    }
  }

  const periodo = getPeriodoActual();
  const sargazo = getSargazo(zonaId);
  const alertaNorte = evaluarNorte(datos.viento.velocidad_kmh, datos.viento.direccion_grados);
  const uvInfo = nivelUV(datos.uv.indice);
  const weatherInfo = weatherCodeAIcono(datos.actual.weather_code);

  // Generar recomendación (Capa 1 + Capa 2)
  const condicionesRecomendacion = {
    uv: datos.uv.indice,
    lluvia_pct: datos.precipitacion.probabilidad_pct,
    norte: alertaNorte.activo,
    viento_kmh: datos.viento.velocidad_kmh,
    temp_c: datos.actual.temperatura_c,
    sargazo_escala: sargazo.escala_1_5
  };
  const recomendacion = generarRecomendacion(condicionesRecomendacion, zonaId, periodo);

  // Alertas sociales recientes
  const alertasSociales = obtenerAlertas(zonaId, 3);

  // Formatear pronóstico por hora con iconos
  const pronosticoHoras = datos.pronostico_horas.map(h => ({
    hora: h.hora,
    temp_c: h.temp_c,
    lluvia_pct: h.lluvia_pct,
    icono: weatherCodeAIcono(h.weather_code).icono
  }));

  // Formatear pronóstico diario
  const pronosticoDias = datos.pronostico_dias.map(d => ({
    fecha: d.fecha,
    temp_min: d.temp_min,
    temp_max: d.temp_max,
    lluvia_pct: d.lluvia_pct,
    icono: weatherCodeAIcono(d.weather_code).icono,
    resumen: resumenDia(d.weather_code, d.lluvia_pct, d.viento_max_kmh)
  }));

  // Descripción de precipitación contextual
  let precipDescripcion = 'Sin lluvia esperada';
  if (datos.precipitacion.probabilidad_pct > 70) precipDescripcion = 'Lluvias probables, lleva paraguas';
  else if (datos.precipitacion.probabilidad_pct > 40) precipDescripcion = 'Lluvia posible por la tarde, típica de temporada';
  else if (datos.precipitacion.probabilidad_pct > 20) precipDescripcion = 'Baja probabilidad de lluvia ligera';

  // Respuesta final
  const respuesta = {
    zona: zonaId,
    nombre: zonaConfig.nombre,
    timestamp: getTimestampCancun(),
    periodo,
    ...(esStale && { _stale: true, _nota: 'Datos de cache. Servicio de clima temporalmente no disponible.' }),
    clima: {
      temperatura_c: datos.actual.temperatura_c,
      sensacion_termica_c: datos.actual.sensacion_termica_c,
      temp_min_c: datos.diario.temp_min_c,
      temp_max_c: datos.diario.temp_max_c,
      humedad_pct: datos.actual.humedad_pct,
      descripcion: weatherInfo.descripcion,
      icono: weatherInfo.icono
    },
    viento: {
      velocidad_kmh: datos.viento.velocidad_kmh,
      rafagas_kmh: datos.viento.rafagas_kmh,
      direccion: gradosADireccion(datos.viento.direccion_grados),
      descripcion_mar: descripcionMar(datos.viento.velocidad_kmh)
    },
    uv: {
      indice: datos.uv.indice,
      nivel: uvInfo.nivel,
      recomendacion: uvInfo.recomendacion,
      hora_pico: datos.uv.hora_pico,
      hora_segura: datos.uv.hora_segura
    },
    precipitacion: {
      probabilidad_pct: datos.precipitacion.probabilidad_pct,
      proxima_lluvia: datos.precipitacion.proxima_lluvia,
      volumen_mm: datos.precipitacion.volumen_mm,
      descripcion: precipDescripcion
    },
    sargazo,
    alerta_norte: {
      activo: alertaNorte.activo,
      categoria: alertaNorte.categoria || null,
      recomendacion: alertaNorte.recomendacion || null
    },
    recomendacion_dia: {
      actividad_ideal: recomendacion.actividad_ideal,
      que_llevar: recomendacion.que_llevar,
      alerta_turista: recomendacion.alerta_turista
    },
    alertas_sociales: alertasSociales.map(a => ({
      tipo: a.tipo,
      fuente: a.fuente,
      contenido: a.contenido,
      url: a.url_fuente,
      hace: tiempoRelativo(a.creado_at)
    })),
    pronostico_horas: pronosticoHoras,
    pronostico_dias: pronosticoDias
  };

  res.json(respuesta);
});

// === GET /api/zonas — lista de zonas disponibles ===
app.get('/api/zonas', (req, res) => {
  const zonas = getTodasLasZonas();
  const lista = Object.values(zonas).map(z => ({
    id: z.id,
    nombre: z.nombre,
    descripcion: z.descripcion
  }));
  res.json({ zonas: lista });
});

// ========================================
// ENDPOINTS v2: PLAYAS CON SCORING
// ========================================

// Helper: obtener clima + marine de una zona (con cache)
async function getClimaZona(zonaId) {
  let datos = climaCache.get(zonaId);
  if (datos) return datos;

  const zona = getZona(zonaId);
  if (!zona) return null;

  try {
    datos = await fetchClimaConMarine(zona.lat, zona.lon, zona.is_coastal);
    climaCache.set(zonaId, datos);
    return datos;
  } catch (e) {
    return climaCache.getStale(zonaId) || null;
  }
}

// GET /api/playas — Todas las playas con scores (ranking)
app.get('/api/playas', async (req, res) => {
  const { zona: filtroZona } = req.query;
  const todasPlayas = filtroZona ? getPlayasPorZona(filtroZona) : Object.values(getTodasLasPlayas());

  if (todasPlayas.length === 0) {
    return res.status(404).json({ error: 'No se encontraron playas', zona_filtro: filtroZona || null });
  }

  // Agrupar playas por zona para minimizar fetches
  const playasPorZona = {};
  for (const playa of todasPlayas) {
    if (!playasPorZona[playa.zona_id]) playasPorZona[playa.zona_id] = [];
    playasPorZona[playa.zona_id].push(playa);
  }

  // Fetch clima por zona (en paralelo)
  const zonaIds = Object.keys(playasPorZona);
  const climaPromises = zonaIds.map(zid => getClimaZona(zid).then(d => [zid, d]));
  const climaResults = await Promise.all(climaPromises);
  const climaPorZona = Object.fromEntries(climaResults);

  // Calcular scores
  const playasConScore = [];
  for (const playa of todasPlayas) {
    const clima = climaPorZona[playa.zona_id];
    if (!clima) continue;

    const sargazo = getSargazoPlaya(playa.id, playa.zona_id);
    const result = scoreBeach(clima, clima.marino, playa, sargazo.escala_0_5);

    playasConScore.push({
      id: playa.id,
      nombre: playa.nombre,
      zona_id: playa.zona_id,
      lat: playa.lat,
      lon: playa.lon,
      score: result.score,
      label: result.label,
      color: result.color,
      interpretacion: result.interpretacion,
      temp_c: clima.actual.temperatura_c,
      viento_kmh: clima.viento.velocidad_kmh,
      sargazo: formatSargazoLabel(sargazo.escala_0_5),
      olas_m: clima.marino?.actual?.olas_m ?? null
    });
  }

  // Ordenar por score descendente
  playasConScore.sort((a, b) => b.score - a.score);

  res.json({
    timestamp: getTimestampCancun(),
    periodo: getPeriodoActual(),
    total: playasConScore.length,
    playas: playasConScore
  });
});

// GET /api/playa/:playaId — Detalle completo de una playa
app.get('/api/playa/:playaId', async (req, res) => {
  const playa = getPlaya(req.params.playaId);
  if (!playa) {
    return res.status(404).json({ error: 'Playa no encontrada', playas_disponibles: getPlayaIds().slice(0, 10) });
  }

  const clima = await getClimaZona(playa.zona_id);
  if (!clima) {
    return res.status(503).json({ error: 'Datos de clima no disponibles' });
  }

  const sargazo = getSargazoPlaya(playa.id, playa.zona_id);
  const resultado = scoreBeach(clima, clima.marino, playa, sargazo.escala_0_5);
  const periodo = getPeriodoActual();
  const alertaNorte = evaluarNorte(clima.viento.velocidad_kmh, clima.viento.direccion_grados);
  const uvInfo = nivelUV(clima.uv.indice);
  const weatherInfo = weatherCodeAIcono(clima.actual.weather_code);
  const seaInfo = formatSeaConditions(clima.marino);

  // Recomendación del motor Capa 1+2
  const condiciones = {
    uv: clima.uv.indice,
    lluvia_pct: clima.precipitacion.probabilidad_pct,
    norte: alertaNorte.activo,
    viento_kmh: clima.viento.velocidad_kmh,
    temp_c: clima.actual.temperatura_c,
    sargazo_escala: sargazo.escala_0_5
  };
  const recomendacion = generarRecomendacion(condiciones, playa.zona_id, periodo);

  // Playas cercanas (misma zona, sin la actual)
  const cercanas = getPlayasPorZona(playa.zona_id)
    .filter(p => p.id !== playa.id)
    .map(p => {
      const sarz = getSargazoPlaya(p.id, p.zona_id);
      const sc = scoreBeach(clima, clima.marino, p, sarz.escala_0_5);
      return { id: p.id, nombre: p.nombre, score: sc.score, label: sc.label, color: sc.color };
    })
    .sort((a, b) => b.score - a.score);

  res.json({
    playa: {
      id: playa.id,
      nombre: playa.nombre,
      zona_id: playa.zona_id,
      lat: playa.lat,
      lon: playa.lon,
      orientacion_grados: playa.orientacion_grados,
      shelter: playa.shelter,
      has_reef: playa.has_reef,
      tipo: playa.tipo,
      amenidades: playa.amenidades
    },
    timestamp: getTimestampCancun(),
    periodo,
    score: {
      total: resultado.score,
      label: resultado.label,
      color: resultado.color,
      breakdown: resultado.breakdown,
      interpretacion: resultado.interpretacion
    },
    clima: {
      temperatura_c: clima.actual.temperatura_c,
      sensacion_termica_c: clima.actual.sensacion_termica_c,
      temp_min_c: clima.diario.temp_min_c,
      temp_max_c: clima.diario.temp_max_c,
      humedad_pct: clima.actual.humedad_pct,
      descripcion: weatherInfo.descripcion,
      icono: weatherInfo.icono
    },
    viento: {
      velocidad_kmh: clima.viento.velocidad_kmh,
      rafagas_kmh: clima.viento.rafagas_kmh,
      direccion: gradosADireccion(clima.viento.direccion_grados),
      direccion_grados: clima.viento.direccion_grados
    },
    mar: seaInfo,
    uv: {
      indice: clima.uv.indice,
      nivel: uvInfo.nivel,
      recomendacion: uvInfo.recomendacion,
      hora_pico: clima.uv.hora_pico,
      hora_segura: clima.uv.hora_segura
    },
    sargazo: {
      ...sargazo,
      label: formatSargazoLabel(sargazo.escala_0_5)
    },
    alerta_norte: {
      activo: alertaNorte.activo,
      categoria: alertaNorte.categoria || null,
      recomendacion: alertaNorte.recomendacion || null
    },
    recomendacion_dia: {
      actividad_ideal: recomendacion.actividad_ideal,
      que_llevar: recomendacion.que_llevar,
      alerta_turista: recomendacion.alerta_turista
    },
    pronostico_horas: clima.pronostico_horas.map(h => ({
      hora: h.hora,
      temp_c: h.temp_c,
      lluvia_pct: h.lluvia_pct,
      icono: weatherCodeAIcono(h.weather_code).icono
    })),
    pronostico_dias: clima.pronostico_dias.map(d => ({
      fecha: d.fecha,
      temp_min: d.temp_min,
      temp_max: d.temp_max,
      lluvia_pct: d.lluvia_pct,
      icono: weatherCodeAIcono(d.weather_code).icono,
      resumen: resumenDia(d.weather_code, d.lluvia_pct, d.viento_max_kmh)
    })),
    playas_cercanas: cercanas
  });
});

// Admin: actualizar sargazo por playa
app.post('/api/admin/sargazo/playa/:playaId', authAdmin, (req, res) => {
  const playa = getPlaya(req.params.playaId);
  if (!playa) return res.status(404).json({ error: 'Playa no encontrada' });
  const { escala_0_5, fuente } = req.body;
  const resultado = actualizarSargazoPlaya(req.params.playaId, escala_0_5, fuente);
  res.json({ ok: true, playa: req.params.playaId, sargazo: resultado });
});

// === ENDPOINTS ADMIN ===
app.post('/api/admin/sargazo/:zona', authAdmin, (req, res) => {
  const zonaConfig = getZona(req.params.zona);
  if (!zonaConfig) return res.status(404).json({ error: 'Zona no encontrada' });
  const resultado = actualizarSargazo(req.params.zona, req.body);
  res.json({ ok: true, sargazo: resultado });
});

app.get('/api/admin/stats', authAdmin, (req, res) => {
  const stats = queries.getEstadisticasHoy();
  const cacheStats = climaCache.getStats();
  res.json({ fecha: new Date().toISOString().slice(0, 10), zonas: stats, cache: cacheStats });
});

// === ENDPOINTS INTERNOS (n8n) ===
app.post('/api/internal/alertas-sociales', authInternal, (req, res) => {
  const alertas = Array.isArray(req.body) ? req.body : [req.body];
  const resultados = alertas.map(a => procesarAlerta(a)).filter(Boolean);
  res.json({ ok: true, procesadas: resultados.length, total_recibidas: alertas.length });
});

app.get('/api/internal/ultima-categoria/:zona', authInternal, (req, res) => {
  const ultima = queries.getUltimaCategoria(req.params.zona);
  res.json(ultima || { categoria: null, periodo: null });
});

app.post('/api/internal/variantes/:zona', authInternal, async (req, res) => {
  const { zona } = req.params;
  const { categoria, periodo, variantes } = req.body;
  if (!variantes || !Array.isArray(variantes)) {
    return res.status(400).json({ error: 'variantes debe ser un array de strings' });
  }
  queries.guardarVariantes(zona, categoria, periodo, variantes);
  res.json({ ok: true, zona, categoria, periodo, total_variantes: variantes.length });
});

// Endpoint para precargar cache (Workflow 1)
app.post('/api/internal/cache-update', authInternal, async (req, res) => {
  const zonaIds = getZonaIds();
  const resultados = { ok: 0, error: 0, errores: [] };

  for (const zonaId of zonaIds) {
    try {
      const zona = getZona(zonaId);
      const datos = await fetchClima(zona.lat, zona.lon);
      climaCache.set(zonaId, datos);
      resultados.ok++;
    } catch (e) {
      resultados.error++;
      resultados.errores.push(`${zonaId}: ${e.message}`);
    }
  }

  res.json({ ...resultados, total: zonaIds.length });
});

// Endpoint para generar variantes (Workflow 5)
app.post('/api/internal/generar-variantes', authInternal, async (req, res) => {
  const inicio = Date.now();
  const zonaIds = getZonaIds();
  let regeneradas = 0, skip = 0, errores = [];

  for (const zonaId of zonaIds) {
    try {
      const zona = getZona(zonaId);
      const datos = climaCache.get(zonaId) || climaCache.getStale(zonaId);
      if (!datos) { skip++; continue; }

      const periodo = getPeriodoActual();
      const condiciones = {
        uv: datos.uv.indice,
        lluvia_pct: datos.precipitacion.probabilidad_pct,
        norte: evaluarNorte(datos.viento.velocidad_kmh, datos.viento.direccion_grados).activo,
        viento_kmh: datos.viento.velocidad_kmh,
        temp_c: datos.actual.temperatura_c
      };
      const { categoria } = determinarCategoria(condiciones);

      if (!queries.necesitaRegenerar(zonaId, categoria, periodo)) {
        skip++;
        continue;
      }

      // Preparar condiciones para Haiku
      const condHaiku = {
        temp_c: datos.actual.temperatura_c,
        sensacion_c: datos.actual.sensacion_termica_c,
        uv: datos.uv.indice,
        nivel_uv: nivelUV(datos.uv.indice).nivel,
        lluvia_pct: datos.precipitacion.probabilidad_pct,
        viento_kmh: datos.viento.velocidad_kmh,
        direccion_viento: gradosADireccion(datos.viento.direccion_grados),
        estado_mar: descripcionMar(datos.viento.velocidad_kmh),
        nivel_sargazo: getSargazo(zonaId).nivel,
        norte: condiciones.norte
      };

      const variantes = await generarVariantesHaiku(zona.nombre, condHaiku, periodo);
      if (variantes) {
        queries.guardarVariantes(zonaId, categoria, periodo, variantes);
        regeneradas++;
      } else {
        skip++;
      }
    } catch (e) {
      errores.push(`${zonaId}: ${e.message}`);
    }
  }

  const duracion = Date.now() - inicio;
  queries.logGeneracion({ procesadas: zonaIds.length, regeneradas, skip, errores: errores.join('; '), duracion_ms: duracion });

  res.json({ total: zonaIds.length, regeneradas, skip, errores, duracion_ms: duracion });
});

app.get('/api/internal/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: getTimestampCancun(),
    cache: climaCache.getStats(),
    version: '2.0.0'
  });
});

// === Utilidad ===
function tiempoRelativo(fecha) {
  const diff = Date.now() - new Date(fecha).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

// === Iniciar servidor ===
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`ClimaBot API v2 corriendo en puerto ${PORT}`);
    console.log(`Zonas: ${getZonaIds().length} | Playas: ${getPlayaIds().length}`);
  });
}

module.exports = app; // Para testing con supertest
