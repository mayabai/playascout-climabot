import { create } from 'zustand';
import { getClima, getZonas, getPlayas, getPlaya } from '../utils/api';

const useClimaStore = create((set, get) => ({
  // Estado — Zonas
  zona: localStorage.getItem('climabot_zona') || 'cancun-hz',
  clima: null,
  zonas: [],
  loading: false,
  error: null,
  lastUpdate: null,

  // Estado — Playas
  playas: [],
  playaActual: null,
  playasLoading: false,
  playasError: null,

  // Estado — Idioma
  idioma: localStorage.getItem('climabot_idioma') || 'es',

  // Acciones — Zonas
  setZona: (zona) => {
    localStorage.setItem('climabot_zona', zona);
    set({ zona, clima: null });
    get().fetchClima();
  },

  fetchClima: async () => {
    const { zona } = get();
    set({ loading: true, error: null });
    try {
      const data = await getClima(zona);
      set({ clima: data, loading: false, lastUpdate: Date.now() });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchZonas: async () => {
    try {
      const data = await getZonas();
      set({ zonas: data.zonas || data });
    } catch (err) {
      console.warn('Error cargando zonas:', err.message);
    }
  },

  refresh: () => get().fetchClima(),

  // Acciones — Playas
  fetchPlayas: async (zona) => {
    set({ playasLoading: true, playasError: null });
    try {
      const data = await getPlayas(zona);
      set({ playas: data.playas || data, playasLoading: false });
    } catch (err) {
      set({ playasError: err.message, playasLoading: false });
    }
  },

  fetchPlaya: async (playaId) => {
    set({ playasLoading: true, playasError: null, playaActual: null });
    try {
      const data = await getPlaya(playaId);
      set({ playaActual: data, playasLoading: false });
    } catch (err) {
      set({ playasError: err.message, playasLoading: false });
    }
  },

  // Acciones — Idioma
  toggleIdioma: () => {
    const nuevo = get().idioma === 'es' ? 'en' : 'es';
    localStorage.setItem('climabot_idioma', nuevo);
    set({ idioma: nuevo });
  }
}));

export default useClimaStore;
