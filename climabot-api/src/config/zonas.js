/**
 * Configuración de zonas turísticas con coordenadas GPS
 * Cada zona tiene: id, nombre, coordenadas, y metadata turística
 */
const ZONAS = {
  'cancun-hz': {
    id: 'cancun-hz',
    nombre: 'Cancún Zona Hotelera',
    lat: 21.1326, lon: -86.7516,
    is_coastal: true,
    descripcion: 'Zona hotelera de Cancún, playas principales',
    playas: ['Playa Delfines', 'Playa Forum', 'Playa Marlín', 'Playa Ballenas', 'Playa Chac Mool'],
    cenotes_cercanos: ['Cenote Azul (30 min)', 'Cenote Verde Lucero (40 min)'],
    arqueologia: ['El Rey (en zona hotelera)', 'El Meco (20 min)']
  },
  'cancun-centro': {
    id: 'cancun-centro',
    nombre: 'Cancún Centro',
    lat: 21.1619, lon: -86.8515,
    is_coastal: false,
    descripcion: 'Centro de Cancún, mercados y vida local',
    playas: [],
    cenotes_cercanos: ['Cenote Azul (25 min)', 'Cenote Verde Lucero (35 min)'],
    arqueologia: ['El Meco (15 min)']
  },
  'playa-del-carmen': {
    id: 'playa-del-carmen',
    nombre: 'Playa del Carmen',
    lat: 20.6296, lon: -87.0739,
    is_coastal: true,
    descripcion: 'Quinta Avenida, playas y vida nocturna',
    playas: ['Playa Mamitas', 'Playacar', 'Playa 28', 'Punta Esmeralda'],
    cenotes_cercanos: ['Cenote Azul (15 min)', 'Cenote Cristalino (20 min)', 'Río Secreto (15 min)'],
    arqueologia: ['Xcaret (10 min)']
  },
  'tulum': {
    id: 'tulum',
    nombre: 'Tulum',
    lat: 20.2114, lon: -87.4654,
    is_coastal: true,
    descripcion: 'Zona arqueológica, playas y cenotes',
    playas: ['Playa Paraíso', 'Playa Ruinas', 'Playa Santa Fe'],
    cenotes_cercanos: ['Gran Cenote (5 min)', 'Cenote Dos Ojos (15 min)', 'Cenote Ik Kil (1.5h)'],
    arqueologia: ['Tulum (zona arqueológica)', 'Cobá (40 min)']
  },
  'cozumel': {
    id: 'cozumel',
    nombre: 'Cozumel',
    lat: 20.4318, lon: -86.9223,
    is_coastal: true,
    descripcion: 'Isla de Cozumel, arrecifes de clase mundial',
    playas: ['Playa Palancar', 'Playa San Francisco', 'Money Bar', 'El Cielo'],
    cenotes_cercanos: [],
    arqueologia: ['San Gervasio']
  },
  'puerto-morelos': {
    id: 'puerto-morelos',
    nombre: 'Puerto Morelos',
    lat: 20.8388, lon: -86.8753,
    is_coastal: true,
    descripcion: 'Pueblo tranquilo, arrecife protegido, snorkel',
    playas: ['Playa del faro', 'Playa Ojo de Agua'],
    cenotes_cercanos: ['Ruta de los Cenotes (10 min)', 'Cenote Siete Bocas (15 min)'],
    arqueologia: []
  },
  'bacalar': {
    id: 'bacalar',
    nombre: 'Bacalar',
    lat: 18.6813, lon: -88.3921,
    is_coastal: false,
    descripcion: 'Laguna de los 7 colores',
    playas: ['Balneario Ejidal', 'Cocalitos'],
    cenotes_cercanos: ['Cenote Azul Bacalar (5 min)', 'Cenote Cocalitos'],
    arqueologia: ['Fuerte de San Felipe']
  },
  'merida': {
    id: 'merida',
    nombre: 'Mérida',
    lat: 20.9674, lon: -89.5926,
    is_coastal: false,
    descripcion: 'Capital de Yucatán, cultura y gastronomía',
    playas: ['Progreso (30 min)'],
    cenotes_cercanos: ['Cenote Xlacah (15 min)', 'Cenotes de Homún (1h)', 'Cenote Suytun (1.5h)'],
    arqueologia: ['Dzibilchaltún (15 min)', 'Uxmal (1h)', 'Chichén Itzá (1.5h)']
  },
  'valladolid': {
    id: 'valladolid',
    nombre: 'Valladolid',
    lat: 20.6894, lon: -88.2017,
    is_coastal: false,
    descripcion: 'Pueblo mágico, cenotes, artesanías',
    playas: [],
    cenotes_cercanos: ['Cenote Zací (en la ciudad)', 'Cenote Ik Kil (30 min)', 'Cenote Suytun (20 min)'],
    arqueologia: ['Chichén Itzá (40 min)', 'Ek Balam (25 min)']
  },
  'isla-mujeres': {
    id: 'isla-mujeres',
    nombre: 'Isla Mujeres',
    lat: 21.2328, lon: -86.7311,
    is_coastal: true,
    descripcion: 'Playa Norte, snorkel con tiburón ballena',
    playas: ['Playa Norte', 'Playa Centro', 'Playa Sur (Garrafón)'],
    cenotes_cercanos: [],
    arqueologia: ['Templo de Ixchel (Punta Sur)']
  }
};

function getZona(zonaId) { return ZONAS[zonaId] || null; }
function getTodasLasZonas() { return ZONAS; }
function getZonaIds() { return Object.keys(ZONAS); }

module.exports = { ZONAS, getZona, getTodasLasZonas, getZonaIds };
