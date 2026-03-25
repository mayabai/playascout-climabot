/**
 * Detección de nortes (frentes fríos)
 * Norte = viento > 40 km/h desde N/NNE/NNW (337.5° - 22.5°)
 */

function evaluarNorte(velocidadKmh, direccionGrados) {
  const esNorte = (direccionGrados >= 337.5 || direccionGrados <= 22.5);
  const vientoFuerte = velocidadKmh > 40;

  if (esNorte && vientoFuerte) {
    let categoria = 'moderado';
    if (velocidadKmh > 80) categoria = 'severo';
    else if (velocidadKmh > 60) categoria = 'fuerte';

    const recomendaciones = {
      moderado: 'Norte moderado. Mar agitado. Ideal para cenotes, pueblos mágicos o zona arqueológica.',
      fuerte: 'Norte fuerte. Mar cerrado. Día perfecto para Chichén Itzá, cenotes o museos.',
      severo: 'Norte severo. Quédate en zona segura. Cenotes techados o actividades indoor.'
    };

    return {
      activo: true,
      categoria,
      velocidad_kmh: velocidadKmh,
      direccion_grados: direccionGrados,
      recomendacion: recomendaciones[categoria]
    };
  }

  if (velocidadKmh > 50) {
    return { activo: false, categoria: null, aviso_precautorio: true, recomendacion: 'Vientos fuertes. Precaución en actividades acuáticas.' };
  }

  return { activo: false, categoria: null, proxima_fecha: null, recomendacion: null };
}

module.exports = { evaluarNorte };
