const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3500';

async function fetchJSON(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function getClima(zona) {
  return fetchJSON(`/api/clima/${zona}`);
}

export async function getZonas() {
  return fetchJSON('/api/zonas');
}

export async function getPlayas(zona) {
  const query = zona ? `?zona=${zona}` : '';
  return fetchJSON(`/api/playas${query}`);
}

export async function getPlaya(playaId) {
  return fetchJSON(`/api/playa/${playaId}`);
}
