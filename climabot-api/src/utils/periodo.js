/**
 * Cálculo de período del día — zona horaria Cancún (America/Cancun, UTC-5)
 */

function getPeriodo(hora) {
  if (hora >= 6 && hora < 12) return 'mañana';
  if (hora >= 12 && hora < 18) return 'tarde';
  return 'noche';
}

function getHoraCancun() {
  const ahora = new Date();
  const horaStr = ahora.toLocaleString('en-US', { timeZone: 'America/Cancun', hour: 'numeric', hour12: false });
  return parseInt(horaStr, 10);
}

function getPeriodoActual() {
  return getPeriodo(getHoraCancun());
}

function getTimestampCancun() {
  const ahora = new Date();
  const local = ahora.toLocaleString('sv-SE', { timeZone: 'America/Cancun' });
  return local.replace(' ', 'T') + '-05:00';
}

module.exports = { getPeriodo, getHoraCancun, getPeriodoActual, getTimestampCancun };
