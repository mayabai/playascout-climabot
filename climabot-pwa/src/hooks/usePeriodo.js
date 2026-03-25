import { useState, useEffect } from 'react';
import { getTema } from '../themes/periodos';

function calcularPeriodo() {
  const hora = new Date().toLocaleString('en-US', {
    timeZone: 'America/Cancun',
    hour: 'numeric',
    hour12: false
  });
  const h = parseInt(hora, 10);
  if (h >= 6 && h < 12) return 'manana';
  if (h >= 12 && h < 19) return 'tarde';
  return 'noche';
}

export default function usePeriodo() {
  const [periodo, setPeriodo] = useState(calcularPeriodo);

  useEffect(() => {
    const interval = setInterval(() => {
      setPeriodo(calcularPeriodo());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return { periodo, tema: getTema(periodo) };
}
