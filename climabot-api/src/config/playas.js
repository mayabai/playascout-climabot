/**
 * Configuración estática de 32 playas — Riviera Maya + Yucatán
 * Cada playa enlaza a una zona (weather cluster) via zona_id
 * La orientación en grados y shelter level son clave para el scoring de viento
 */

const PLAYAS = {
  // ═══════════════════════════════════════
  // ZONA 1: CANCÚN (10 playas)
  // ═══════════════════════════════════════
  'playa-delfines': {
    id: 'playa-delfines',
    nombre: { es: 'Playa Delfines (El Mirador)', en: 'Delfines Beach' },
    zona_id: 'cancun-hz',
    lat: 21.0872, lon: -86.7718,
    orientacion_grados: 70,   // Cara al ENE — Caribe abierto
    shelter: 'exposed',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: true,
    amenidades: ['parking', 'mirador', 'letras_cancun']
  },
  'playa-forum': {
    id: 'playa-forum',
    nombre: { es: 'Playa Forum', en: 'Forum Beach' },
    zona_id: 'cancun-hz',
    lat: 21.1326, lon: -86.7516,
    orientacion_grados: 45,   // Cara al NE
    shelter: 'moderate',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: true,
    amenidades: ['bares', 'restaurantes', 'clubs']
  },
  'playa-chac-mool': {
    id: 'playa-chac-mool',
    nombre: { es: 'Playa Chac Mool', en: 'Chac Mool Beach' },
    zona_id: 'cancun-hz',
    lat: 21.1250, lon: -86.7530,
    orientacion_grados: 60,
    shelter: 'exposed',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: true,
    amenidades: ['salvavidas', 'palapas']
  },
  'playa-marlin': {
    id: 'playa-marlin',
    nombre: { es: 'Playa Marlín', en: 'Marlin Beach' },
    zona_id: 'cancun-hz',
    lat: 21.1100, lon: -86.7600,
    orientacion_grados: 65,
    shelter: 'exposed',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: true,
    amenidades: ['salvavidas']
  },
  'playa-ballenas': {
    id: 'playa-ballenas',
    nombre: { es: 'Playa Ballenas', en: 'Ballenas Beach' },
    zona_id: 'cancun-hz',
    lat: 21.1180, lon: -86.7550,
    orientacion_grados: 55,
    shelter: 'exposed',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: true,
    amenidades: ['salvavidas', 'palapas']
  },
  'playa-langosta': {
    id: 'playa-langosta',
    nombre: { es: 'Playa Langosta', en: 'Langosta Beach' },
    zona_id: 'cancun-hz',
    lat: 21.1450, lon: -86.7620,
    orientacion_grados: 350,  // Cara al N — lado norte de la zona hotelera
    shelter: 'moderate',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: false,
    amenidades: ['muelle_ferry', 'restaurantes']
  },
  'playa-tortugas': {
    id: 'playa-tortugas',
    nombre: { es: 'Playa Tortugas', en: 'Tortugas Beach' },
    zona_id: 'cancun-hz',
    lat: 21.1400, lon: -86.7580,
    orientacion_grados: 10,   // Cara al N-NNE
    shelter: 'moderate',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: false,
    amenidades: ['torre_salto', 'watersports', 'restaurantes']
  },
  'playa-caracol': {
    id: 'playa-caracol',
    nombre: { es: 'Playa Caracol', en: 'Caracol Beach' },
    zona_id: 'cancun-hz',
    lat: 21.1480, lon: -86.7700,
    orientacion_grados: 340,  // Cara al NNW — zona calma de laguna
    shelter: 'sheltered',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: false,
    amenidades: ['snorkel', 'kayak']
  },
  'playa-norte-im': {
    id: 'playa-norte-im',
    nombre: { es: 'Playa Norte (Isla Mujeres)', en: 'North Beach (Isla Mujeres)' },
    zona_id: 'isla-mujeres',
    lat: 21.2478, lon: -86.7440,
    orientacion_grados: 350,  // Cara al N — protegida del oleaje del este
    shelter: 'sheltered',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: false,
    amenidades: ['bares_playa', 'snorkel', 'hamacas']
  },
  'playa-centro-im': {
    id: 'playa-centro-im',
    nombre: { es: 'Playa Centro (Isla Mujeres)', en: 'Centro Beach (Isla Mujeres)' },
    zona_id: 'isla-mujeres',
    lat: 21.2350, lon: -86.7350,
    orientacion_grados: 280,  // Cara al W — lado calmo
    shelter: 'moderate',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: false,
    amenidades: ['pueblo', 'restaurantes']
  },

  // ═══════════════════════════════════════
  // ZONA 2: RIVIERA MAYA (10 playas)
  // ═══════════════════════════════════════
  'playa-fundadores': {
    id: 'playa-fundadores',
    nombre: { es: 'Playa Fundadores', en: 'Fundadores Beach' },
    zona_id: 'playa-del-carmen',
    lat: 20.6282, lon: -87.0725,
    orientacion_grados: 80,   // Cara al E
    shelter: 'moderate',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: true,
    amenidades: ['portal_maya', 'ferry_cozumel']
  },
  'playa-mamitas': {
    id: 'playa-mamitas',
    nombre: { es: 'Playa Mamitas', en: 'Mamitas Beach' },
    zona_id: 'playa-del-carmen',
    lat: 20.6350, lon: -87.0700,
    orientacion_grados: 80,
    shelter: 'moderate',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: true,
    amenidades: ['beach_club', 'dj', 'restaurantes']
  },
  'punta-esmeralda': {
    id: 'punta-esmeralda',
    nombre: { es: 'Punta Esmeralda', en: 'Punta Esmeralda' },
    zona_id: 'playa-del-carmen',
    lat: 20.6520, lon: -87.0650,
    orientacion_grados: 75,
    shelter: 'moderate',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: true,
    amenidades: ['cenote_playa', 'familiar', 'parking']
  },
  'puerto-morelos-principal': {
    id: 'puerto-morelos-principal',
    nombre: { es: 'Puerto Morelos — Playa Principal', en: 'Puerto Morelos Main Beach' },
    zona_id: 'puerto-morelos',
    lat: 20.8388, lon: -86.8753,
    orientacion_grados: 80,
    shelter: 'sheltered',     // Arrecife protege
    has_reef: true,
    tipo: 'arena',
    sargazo_susceptible: true,
    amenidades: ['snorkel', 'pueblo_pescadores', 'faro']
  },
  'akumal': {
    id: 'akumal',
    nombre: { es: 'Bahía de Akumal', en: 'Akumal Bay' },
    zona_id: 'playa-del-carmen',  // Usa cluster PDC (más cercano)
    lat: 20.3958, lon: -87.3131,
    orientacion_grados: 85,
    shelter: 'sheltered',     // Bahía cerrada
    has_reef: true,
    tipo: 'arena',
    sargazo_susceptible: true,
    amenidades: ['tortugas', 'snorkel', 'cenotes_cercanos']
  },
  'playa-paraiso': {
    id: 'playa-paraiso',
    nombre: { es: 'Playa Paraíso (Tulum)', en: 'Paradise Beach (Tulum)' },
    zona_id: 'tulum',
    lat: 20.2080, lon: -87.4400,
    orientacion_grados: 80,
    shelter: 'exposed',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: true,
    amenidades: ['beach_clubs', 'vistas_ruinas']
  },
  'playa-ruinas': {
    id: 'playa-ruinas',
    nombre: { es: 'Playa Ruinas (Tulum)', en: 'Ruins Beach (Tulum)' },
    zona_id: 'tulum',
    lat: 20.2150, lon: -87.4290,
    orientacion_grados: 75,
    shelter: 'exposed',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: true,
    amenidades: ['zona_arqueologica', 'acantilado']
  },
  'xcacel': {
    id: 'xcacel',
    nombre: { es: 'Xcacel-Xcacelito', en: 'Xcacel-Xcacelito' },
    zona_id: 'tulum',
    lat: 20.3350, lon: -87.3450,
    orientacion_grados: 80,
    shelter: 'exposed',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: true,
    amenidades: ['tortugas_anidacion', 'cenote', 'virgen']
  },
  'xpu-ha': {
    id: 'xpu-ha',
    nombre: { es: 'Xpu-Há', en: 'Xpu-Há' },
    zona_id: 'playa-del-carmen',
    lat: 20.4650, lon: -87.2650,
    orientacion_grados: 80,
    shelter: 'moderate',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: true,
    amenidades: ['beach_clubs', 'snorkel', 'familiar']
  },
  'puerto-aventuras': {
    id: 'puerto-aventuras',
    nombre: { es: 'Puerto Aventuras', en: 'Puerto Aventuras' },
    zona_id: 'playa-del-carmen',
    lat: 20.4950, lon: -87.2350,
    orientacion_grados: 85,
    shelter: 'sheltered',     // Marina protegida
    has_reef: true,
    tipo: 'arena',
    sargazo_susceptible: false,
    amenidades: ['marina', 'delfines', 'golf']
  },

  // ═══════════════════════════════════════
  // ZONA 3: COZUMEL (5 playas)
  // ═══════════════════════════════════════
  'playa-palancar': {
    id: 'playa-palancar',
    nombre: { es: 'Playa Palancar', en: 'Palancar Beach' },
    zona_id: 'cozumel',
    lat: 20.3500, lon: -87.0200,
    orientacion_grados: 260,  // Cara al W — lado calmo de Cozumel
    shelter: 'sheltered',
    has_reef: true,
    tipo: 'arena',
    sargazo_susceptible: false,
    amenidades: ['snorkel', 'arrecife', 'beach_club']
  },
  'playa-san-francisco': {
    id: 'playa-san-francisco',
    nombre: { es: 'Playa San Francisco', en: 'San Francisco Beach' },
    zona_id: 'cozumel',
    lat: 20.3700, lon: -87.0150,
    orientacion_grados: 260,
    shelter: 'moderate',
    has_reef: true,
    tipo: 'arena',
    sargazo_susceptible: false,
    amenidades: ['beach_club', 'watersports', 'restaurantes']
  },
  'playa-mia': {
    id: 'playa-mia',
    nombre: { es: 'Playa Mía', en: 'Playa Mia' },
    zona_id: 'cozumel',
    lat: 20.3800, lon: -87.0100,
    orientacion_grados: 270,  // Cara al W
    shelter: 'moderate',
    has_reef: true,
    tipo: 'arena',
    sargazo_susceptible: false,
    amenidades: ['parque_acuatico', 'buffet', 'snorkel']
  },
  'chen-rio': {
    id: 'chen-rio',
    nombre: { es: 'Chen Río', en: 'Chen Rio' },
    zona_id: 'cozumel',
    lat: 20.3900, lon: -86.8500,
    orientacion_grados: 80,   // Cara al E — lado salvaje de Cozumel
    shelter: 'moderate',      // Piscina natural protege
    has_reef: false,
    tipo: 'rocosa',
    sargazo_susceptible: true,
    amenidades: ['piscina_natural', 'restaurante', 'salvaje']
  },
  'playa-azul-coz': {
    id: 'playa-azul-coz',
    nombre: { es: 'Playa Azul', en: 'Azul Beach' },
    zona_id: 'cozumel',
    lat: 20.4800, lon: -86.9500,
    orientacion_grados: 300,  // Cara al WNW
    shelter: 'moderate',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: false,
    amenidades: ['hotel', 'snorkel', 'familiar']
  },

  // ═══════════════════════════════════════
  // ZONA 4: COSTA MAYA / BACALAR (3 playas)
  // ═══════════════════════════════════════
  'mahahual': {
    id: 'mahahual',
    nombre: { es: 'Mahahual — Playa Principal', en: 'Mahahual Main Beach' },
    zona_id: 'bacalar',       // Cluster más cercano
    lat: 18.7130, lon: -87.7120,
    orientacion_grados: 85,
    shelter: 'moderate',
    has_reef: true,
    tipo: 'arena',
    sargazo_susceptible: true,
    amenidades: ['malecon', 'buceo', 'cruceros']
  },
  'bacalar-balneario': {
    id: 'bacalar-balneario',
    nombre: { es: 'Bacalar — Balneario Municipal', en: 'Bacalar Public Beach' },
    zona_id: 'bacalar',
    lat: 18.6813, lon: -88.3921,
    orientacion_grados: 90,
    shelter: 'sheltered',     // Laguna
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: false,
    amenidades: ['laguna_7_colores', 'kayak', 'paddleboard']
  },
  'holbox': {
    id: 'holbox',
    nombre: { es: 'Holbox — Playa Principal', en: 'Holbox Main Beach' },
    zona_id: 'isla-mujeres',  // Cluster más cercano con datos costeros
    lat: 21.5233, lon: -87.3792,
    orientacion_grados: 0,    // Cara al N
    shelter: 'sheltered',     // Isla barrera
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: true,
    amenidades: ['bioluminiscencia', 'tiburon_ballena', 'sin_autos']
  },

  // ═══════════════════════════════════════
  // ZONA 5: YUCATÁN (4 playas)
  // ═══════════════════════════════════════
  'progreso': {
    id: 'progreso',
    nombre: { es: 'Progreso — Playa Principal', en: 'Progreso Main Beach' },
    zona_id: 'merida',
    lat: 21.2833, lon: -89.6667,
    orientacion_grados: 0,    // Cara al N — Golfo de México
    shelter: 'exposed',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: false,
    amenidades: ['muelle', 'malecon', 'restaurantes']
  },
  'celestun': {
    id: 'celestun',
    nombre: { es: 'Celestún — Playa', en: 'Celestún Beach' },
    zona_id: 'merida',
    lat: 20.8600, lon: -90.3950,
    orientacion_grados: 315,  // Cara al NW — Golfo
    shelter: 'moderate',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: false,
    amenidades: ['flamingos', 'reserva_biosfera', 'ojo_de_agua']
  },
  'sisal': {
    id: 'sisal',
    nombre: { es: 'Sisal — Playa', en: 'Sisal Beach' },
    zona_id: 'merida',
    lat: 21.1650, lon: -90.0300,
    orientacion_grados: 350,  // Cara al N-NNW
    shelter: 'exposed',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: false,
    amenidades: ['kitesurf', 'pueblo_tranquilo', 'manglares']
  },
  'telchac': {
    id: 'telchac',
    nombre: { es: 'Telchac Puerto', en: 'Telchac Puerto' },
    zona_id: 'merida',
    lat: 21.2900, lon: -89.2600,
    orientacion_grados: 0,    // Cara al N
    shelter: 'exposed',
    has_reef: false,
    tipo: 'arena',
    sargazo_susceptible: false,
    amenidades: ['tranquilo', 'casas_playa', 'local']
  }
};

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function getPlaya(playaId) {
  return PLAYAS[playaId] || null;
}

function getTodasLasPlayas() {
  return PLAYAS;
}

function getPlayaIds() {
  return Object.keys(PLAYAS);
}

function getPlayasPorZona(zonaId) {
  return Object.values(PLAYAS).filter(p => p.zona_id === zonaId);
}

function getZonasConPlayas() {
  const zonas = {};
  for (const playa of Object.values(PLAYAS)) {
    if (!zonas[playa.zona_id]) zonas[playa.zona_id] = [];
    zonas[playa.zona_id].push(playa);
  }
  return zonas;
}

module.exports = { PLAYAS, getPlaya, getTodasLasPlayas, getPlayaIds, getPlayasPorZona, getZonasConPlayas };
