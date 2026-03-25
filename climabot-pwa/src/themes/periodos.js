// Temas visuales por período del día
export const TEMAS = {
  manana: {
    nombre: 'Mañana',
    gradient: 'from-amber-50 via-orange-50 to-yellow-50',
    cardBg: 'bg-white/80',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    accent: 'text-orange-600',
    accentBg: 'bg-orange-100',
    heroGradient: 'from-amber-400 to-orange-500',
    iconColor: 'text-orange-500',
    border: 'border-orange-200',
    emoji: '🌅',
    saludo: '¡Buenos días!'
  },
  tarde: {
    nombre: 'Tarde',
    gradient: 'from-blue-50 via-sky-50 to-cyan-50',
    cardBg: 'bg-white/80',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    accent: 'text-blue-600',
    accentBg: 'bg-blue-100',
    heroGradient: 'from-blue-400 to-cyan-500',
    iconColor: 'text-blue-500',
    border: 'border-blue-200',
    emoji: '☀️',
    saludo: '¡Buenas tardes!'
  },
  noche: {
    nombre: 'Noche',
    gradient: 'from-indigo-950 via-blue-950 to-slate-900',
    cardBg: 'bg-white/10 backdrop-blur-md',
    textPrimary: 'text-white',
    textSecondary: 'text-blue-200',
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-900/50',
    heroGradient: 'from-indigo-600 to-blue-800',
    iconColor: 'text-cyan-400',
    border: 'border-blue-800',
    emoji: '🌙',
    saludo: '¡Buenas noches!'
  }
};

export function getTema(periodo) {
  return TEMAS[periodo] || TEMAS.tarde;
}
