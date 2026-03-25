import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import usePlayas from '../hooks/usePlayas';
import useClimaStore from '../store/useClimaStore';
import { getNombre } from '../utils/i18n';
import 'leaflet/dist/leaflet.css';

const labelColors = {
  Perfect: '#22c55e',
  Okay: '#eab308',
  Avoid: '#ef4444',
};

const CENTER = [20.5, -87.2]; // Riviera Maya center
const ZOOM = 8;

export default function MapView({ tema }) {
  const { playas, loading } = usePlayas();
  const navigate = useNavigate();
  const idioma = useClimaStore(s => s.idioma);

  if (loading && !playas.length) {
    return (
      <div className={`h-[70vh] rounded-2xl ${tema.cardBg} animate-pulse flex items-center justify-center`}>
        <span className={`text-sm ${tema.textSecondary}`}>Cargando mapa...</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg" style={{ height: '70vh' }}>
      <MapContainer
        center={CENTER}
        zoom={ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {playas.map(playa => (
          <CircleMarker
            key={playa.id}
            center={[playa.lat, playa.lon]}
            radius={10}
            pathOptions={{
              color: '#fff',
              weight: 2,
              fillColor: labelColors[playa.label] || '#9ca3af',
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="text-center min-w-[120px]">
                <p className="font-bold text-sm">{getNombre(playa, idioma)}</p>
                <p className="text-lg font-extrabold" style={{ color: labelColors[playa.label] }}>
                  {playa.score}
                </p>
                <p className="text-xs text-gray-500">{playa.label}</p>
                <div className="text-xs text-gray-600 mt-1">
                  {playa.temp_c != null && <span>🌡️{Math.round(playa.temp_c)}° </span>}
                  {playa.viento_kmh != null && <span>💨{Math.round(playa.viento_kmh)} </span>}
                </div>
                <button
                  onClick={() => navigate(`/playa/${playa.id}`)}
                  className="mt-2 rounded-lg bg-blue-500 px-3 py-1 text-xs font-bold text-white hover:bg-blue-600"
                >
                  Ver detalle
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
