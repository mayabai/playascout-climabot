/**
 * Servicio de sargazo — datos mock listos para futuro scraping
 * v2: soporta tanto zone-keyed (legacy) como beach-keyed (nuevo)
 */

// ─── Datos por zona (legacy, sigue funcionando para /api/clima/:zona) ───
const sargazoZonaData = {
  'cancun-hz': { nivel: 'moderado', escala_1_5: 3, fuente: 'reporte_comunitario', playas_limpias: ['Playa Delfines', 'Playa Forum'], playas_con_sargazo: ['Playa Marlín', 'Playa Ballenas'] },
  'cancun-centro': { nivel: 'bajo', escala_1_5: 1, fuente: 'reporte_comunitario', playas_limpias: [], playas_con_sargazo: [] },
  'playa-del-carmen': { nivel: 'moderado', escala_1_5: 3, fuente: 'reporte_comunitario', playas_limpias: ['Playa Mamitas', 'Playacar'], playas_con_sargazo: ['Playa 28'] },
  'tulum': { nivel: 'alto', escala_1_5: 4, fuente: 'reporte_comunitario', playas_limpias: ['Playa Paraíso'], playas_con_sargazo: ['Playa Ruinas', 'Playa Santa Fe'] },
  'cozumel': { nivel: 'bajo', escala_1_5: 1, fuente: 'reporte_comunitario', playas_limpias: ['Playa Palancar', 'Money Bar'], playas_con_sargazo: [] },
  'puerto-morelos': { nivel: 'moderado', escala_1_5: 2, fuente: 'reporte_comunitario', playas_limpias: ['Playa del faro'], playas_con_sargazo: ['Playa sur'] },
  'bacalar': { nivel: 'ninguno', escala_1_5: 0, fuente: 'no_aplica', playas_limpias: [], playas_con_sargazo: [], nota: 'Laguna, sin sargazo' },
  'merida': { nivel: 'ninguno', escala_1_5: 0, fuente: 'no_aplica', playas_limpias: [], playas_con_sargazo: [], nota: 'Ciudad interior' },
  'valladolid': { nivel: 'ninguno', escala_1_5: 0, fuente: 'no_aplica', playas_limpias: [], playas_con_sargazo: [], nota: 'Ciudad interior' },
  'isla-mujeres': { nivel: 'bajo', escala_1_5: 1, fuente: 'reporte_comunitario', playas_limpias: ['Playa Norte', 'Playa Centro'], playas_con_sargazo: [] }
};

// ─── Datos por playa (v2 — override granular) ───
// Si una playa tiene dato específico, usa ese. Si no, hereda de su zona.
const sargazoPlayaData = {
  // Cancún — varía mucho por playa
  'playa-delfines': { escala_0_5: 3 },
  'playa-forum': { escala_0_5: 1 },
  'playa-chac-mool': { escala_0_5: 3 },
  'playa-marlin': { escala_0_5: 4 },
  'playa-ballenas': { escala_0_5: 4 },
  'playa-langosta': { escala_0_5: 0 },
  'playa-tortugas': { escala_0_5: 0 },
  'playa-caracol': { escala_0_5: 0 },
  'playa-norte-im': { escala_0_5: 0 },
  'playa-centro-im': { escala_0_5: 0 },
  // Riviera Maya
  'playa-fundadores': { escala_0_5: 3 },
  'playa-mamitas': { escala_0_5: 2 },
  'punta-esmeralda': { escala_0_5: 2 },
  'puerto-morelos-principal': { escala_0_5: 2 },
  'akumal': { escala_0_5: 2 },
  'playa-paraiso': { escala_0_5: 4 },
  'playa-ruinas': { escala_0_5: 4 },
  'xcacel': { escala_0_5: 3 },
  'xpu-ha': { escala_0_5: 2 },
  'puerto-aventuras': { escala_0_5: 0 },
  // Cozumel
  'playa-palancar': { escala_0_5: 0 },
  'playa-san-francisco': { escala_0_5: 0 },
  'playa-mia': { escala_0_5: 0 },
  'chen-rio': { escala_0_5: 1 },
  'playa-azul-coz': { escala_0_5: 0 },
  // Costa Maya / Bacalar
  'mahahual': { escala_0_5: 2 },
  'bacalar-balneario': { escala_0_5: 0 },
  'holbox': { escala_0_5: 2 },
  // Yucatán
  'progreso': { escala_0_5: 0 },
  'celestun': { escala_0_5: 0 },
  'sisal': { escala_0_5: 0 },
  'telchac': { escala_0_5: 0 }
};

const NIVELES = { 0: 'ninguno', 1: 'bajo', 2: 'bajo', 3: 'moderado', 4: 'alto', 5: 'extremo' };

// ─── API zona (legacy — sigue funcionando) ───

function getSargazo(zonaId) {
  const data = sargazoZonaData[zonaId];
  if (!data) return { nivel: 'desconocido', escala_1_5: 0, fuente: 'sin_datos', playas_limpias: [], playas_con_sargazo: [], ultima_actualizacion: null };
  return { ...data, ultima_actualizacion: data._updatedAt || new Date().toISOString() };
}

function actualizarSargazo(zonaId, datos) {
  sargazoZonaData[zonaId] = {
    nivel: datos.nivel || NIVELES[datos.escala_1_5] || 'desconocido',
    escala_1_5: datos.escala_1_5 || 0,
    fuente: datos.fuente || 'admin_manual',
    playas_limpias: datos.playas_limpias || [],
    playas_con_sargazo: datos.playas_con_sargazo || [],
    _updatedAt: new Date().toISOString()
  };
  return getSargazo(zonaId);
}

// ─── API playa (v2) ───

function getSargazoPlaya(playaId, zonaIdFallback) {
  const playaData = sargazoPlayaData[playaId];
  if (playaData) {
    const escala = playaData.escala_0_5;
    return {
      escala_0_5: escala,
      nivel: NIVELES[escala] || 'desconocido',
      fuente: playaData._fuente || 'mock_inicial',
      ultima_actualizacion: playaData._updatedAt || new Date().toISOString()
    };
  }
  // Fallback: hereda de zona
  const zonaData = sargazoZonaData[zonaIdFallback];
  if (zonaData) {
    return {
      escala_0_5: zonaData.escala_1_5,
      nivel: zonaData.nivel,
      fuente: 'heredado_zona',
      ultima_actualizacion: zonaData._updatedAt || new Date().toISOString()
    };
  }
  return { escala_0_5: 0, nivel: 'desconocido', fuente: 'sin_datos', ultima_actualizacion: null };
}

function actualizarSargazoPlaya(playaId, escala_0_5, fuente) {
  sargazoPlayaData[playaId] = {
    escala_0_5: Math.min(5, Math.max(0, escala_0_5)),
    _fuente: fuente || 'admin_manual',
    _updatedAt: new Date().toISOString()
  };
  return getSargazoPlaya(playaId);
}

module.exports = { getSargazo, actualizarSargazo, getSargazoPlaya, actualizarSargazoPlaya };
