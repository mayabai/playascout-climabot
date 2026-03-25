// Mapea códigos de icono del API a emojis
const iconMap = {
  'sunny': '☀️',
  'mostly_sunny': '🌤️',
  'partly_cloudy': '⛅',
  'cloudy': '☁️',
  'overcast': '🌥️',
  'foggy': '🌫️',
  'rainy': '🌧️',
  'drizzle': '🌦️',
  'thunderstorm': '⛈️',
  'snowy': '❄️',
  'windy': '💨',
  'clear_night': '🌙',
  'partly_cloudy_night': '🌙',
};

export function iconoEmoji(code) {
  if (!code) return '🌤️';
  // Si no esta en el mapa, devolverlo tal cual (puede ser emoji)
  if (!iconMap[code]) return code;
  return iconMap[code] || '🌤️';
}
