/**
 * Generador de variantes Capa 2 — llama a Claude Haiku
 * Se ejecuta desde n8n Workflow 5 cada 5 horas
 * Solo genera si la categoría cambió — ~$0.60 USD/mes
 */

const HAIKU_MODEL = process.env.HAIKU_MODEL || 'claude-haiku-4-5-20251001';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * Genera 5 variantes de recomendación usando Claude Haiku
 * @param {string} zonaNombre - Nombre legible de la zona
 * @param {object} condiciones - Condiciones actuales
 * @param {string} periodo - mañana/tarde/noche
 * @returns {string[]} Array de 5 variantes o null si falla
 */
async function generarVariantesHaiku(zonaNombre, condiciones, periodo) {
  if (!ANTHROPIC_API_KEY) {
    console.warn('⚠️ ANTHROPIC_API_KEY no configurada, saltando generación de variantes');
    return null;
  }

  const prompt = `Eres el asistente de clima de CancunBot para turistas en la Riviera Maya.

Zona: ${zonaNombre}
Condiciones actuales:
- Temperatura: ${condiciones.temp_c}°C (sensación ${condiciones.sensacion_c}°C)
- UV: ${condiciones.uv} (${condiciones.nivel_uv})
- Lluvia: ${condiciones.lluvia_pct}% probabilidad
- Viento: ${condiciones.viento_kmh} km/h del ${condiciones.direccion_viento}
- Mar: ${condiciones.estado_mar}
- Sargazo: ${condiciones.nivel_sargazo}
- Norte: ${condiciones.norte ? 'SÍ — mar cerrado' : 'No'}
- Período: ${periodo}

Genera exactamente 5 recomendaciones de actividad distintas para un turista hoy.
Cada recomendación debe:
- Ser específica a esta zona (usa nombres reales de playas, cenotes, restaurantes, zonas arqueológicas cercanas)
- Incluir horario sugerido ("mañana temprano", "después de las 4pm")
- Mencionar qué llevar (bloqueador, paraguas, suéter)
- Tener tono amigable de guía local, no de robot
- Máximo 2 oraciones por recomendación

Responde SOLO con un JSON array de 5 strings. Sin markdown, sin explicación.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: HAIKU_MODEL,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      }),
      signal: AbortSignal.timeout(30000) // 30s timeout
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`❌ Haiku API error ${response.status}: ${err}`);
      return null;
    }

    const data = await response.json();
    const texto = data.content[0]?.text;

    if (!texto) return null;

    // Parsear JSON — Haiku a veces envuelve en ```json
    const limpio = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const variantes = JSON.parse(limpio);

    if (!Array.isArray(variantes) || variantes.length < 3) {
      console.error('❌ Haiku devolvió formato inesperado:', texto);
      return null;
    }

    return variantes.slice(0, 5); // Máximo 5
  } catch (error) {
    console.error('❌ Error generando variantes:', error.message);
    return null; // Fallback silencioso a Capa 1
  }
}

module.exports = { generarVariantesHaiku };
