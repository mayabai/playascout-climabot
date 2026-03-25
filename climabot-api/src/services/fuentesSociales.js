/**
 * Servicio de fuentes sociales — parsea alertas de Twitter/CONAGUA/Sargazo
 * Recibe datos desde n8n Workflow 6 y los clasifica
 */
const { guardarAlertaSocial, getAlertasRecientes } = require('../db/queries');

// Keywords para clasificar alertas automáticamente
const CLASIFICADORES = {
  norte: ['norte', 'frente frío', 'frente frio', 'vientos fuertes del norte', 'mar cerrado'],
  sargazo: ['sargazo', 'sargassum', 'alga', 'playa limpia', 'playa sucia'],
  bandera_roja: ['bandera roja', 'prohibido nadar', 'mar peligroso', 'corriente de resaca'],
  bandera_amarilla: ['bandera amarilla', 'precaución', 'oleaje moderado'],
  ciclon: ['ciclón', 'huracán', 'tormenta tropical', 'depresión tropical'],
  lluvia: ['lluvias fuertes', 'inundación', 'tormenta eléctrica', 'alerta por lluvia']
};

// Keywords para determinar zona
const ZONAS_KEYWORDS = {
  'cancun-hz': ['zona hotelera', 'cancún playa', 'hotel zone'],
  'cancun-centro': ['cancún centro', 'downtown cancun'],
  'playa-del-carmen': ['playa del carmen', 'playacar', 'quinta avenida'],
  'tulum': ['tulum'],
  'cozumel': ['cozumel'],
  'puerto-morelos': ['puerto morelos'],
  'bacalar': ['bacalar'],
  'merida': ['mérida', 'merida'],
  'valladolid': ['valladolid'],
  'isla-mujeres': ['isla mujeres']
};

/**
 * Clasifica y guarda una alerta proveniente de fuentes sociales
 * @param {object} data - { fuente, contenido, url_fuente }
 * @returns {object|null} Alerta guardada o null si duplicada/irrelevante
 */
function procesarAlerta(data) {
  const texto = data.contenido.toLowerCase();

  // Clasificar tipo
  let tipo = 'otro';
  let relevancia = 2;
  for (const [tipoKey, keywords] of Object.entries(CLASIFICADORES)) {
    if (keywords.some(kw => texto.includes(kw))) {
      tipo = tipoKey;
      relevancia = ['ciclon', 'norte', 'bandera_roja'].includes(tipoKey) ? 5 : 3;
      break;
    }
  }

  // Si no matchea ningún clasificador, ignorar
  if (tipo === 'otro' && !texto.includes('clima') && !texto.includes('weather')) {
    return null;
  }

  // Determinar zona
  let zona = null;
  for (const [zonaId, keywords] of Object.entries(ZONAS_KEYWORDS)) {
    if (keywords.some(kw => texto.includes(kw))) {
      zona = zonaId;
      break;
    }
  }
  // Si menciona Quintana Roo o Riviera Maya genéricamente, es para todas las zonas costeras
  if (!zona && (texto.includes('quintana roo') || texto.includes('riviera maya') || texto.includes('caribe mexicano'))) {
    zona = null; // null = aplica a todas
  }

  return guardarAlertaSocial({
    fuente: data.fuente,
    tipo,
    zona,
    contenido: data.contenido,
    url_fuente: data.url_fuente || null,
    relevancia
  });
}

/**
 * Obtiene alertas recientes para mostrar en la API/PWA
 */
function obtenerAlertas(zona, limite = 5) {
  return getAlertasRecientes(zona, limite);
}

module.exports = { procesarAlerta, obtenerAlertas };
