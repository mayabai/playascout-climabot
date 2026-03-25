// Calcula ms hasta el proximo minuto :05 de la hora
// Si ya pasaron las :05, espera a la siguiente hora
export function msHastaProximo05() {
  const ahora = new Date();
  const target = new Date(ahora);
  target.setMinutes(5, 0, 0); // :05:00 de esta hora

  if (ahora >= target) {
    // Ya pasaron las :05, apuntar a la siguiente hora
    target.setHours(target.getHours() + 1);
  }

  return target.getTime() - ahora.getTime();
}

// Programa un callback al minuto :05 de cada hora
// Retorna funcion de cleanup
export function syncAlMinuto05(callback) {
  let timeout;
  let interval;

  function programar() {
    const espera = msHastaProximo05();
    timeout = setTimeout(() => {
      callback();
      // Despues del primer disparo, repetir cada hora exacta
      interval = setInterval(callback, 60 * 60 * 1000);
    }, espera);
  }

  programar();

  return () => {
    clearTimeout(timeout);
    clearInterval(interval);
  };
}
