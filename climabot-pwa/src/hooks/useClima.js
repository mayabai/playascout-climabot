import { useEffect } from 'react';
import useClimaStore from '../store/useClimaStore';
import { syncAlMinuto05 } from '../utils/syncTimer';

export default function useClima() {
  const { clima, loading, error, zona, fetchClima, fetchZonas, zonas } = useClimaStore();

  useEffect(() => {
    fetchClima();
    fetchZonas();
    // Auto-refresh sincronizado al minuto :05 de cada hora
    const cleanup = syncAlMinuto05(fetchClima);
    return cleanup;
  }, [zona]);

  return { clima, loading, error, zona, zonas };
}
