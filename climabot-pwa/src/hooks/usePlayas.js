import { useEffect } from 'react';
import useClimaStore from '../store/useClimaStore';
import { syncAlMinuto05 } from '../utils/syncTimer';

export default function usePlayas(zona) {
  const { playas, playasLoading, playasError, fetchPlayas } = useClimaStore();

  useEffect(() => {
    fetchPlayas(zona);
    // Auto-refresh sincronizado al minuto :05 de cada hora
    const cleanup = syncAlMinuto05(() => fetchPlayas(zona));
    return cleanup;
  }, [zona]);

  return { playas, loading: playasLoading, error: playasError };
}
