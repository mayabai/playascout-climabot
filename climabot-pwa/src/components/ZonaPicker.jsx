import React, { useState } from 'react';
import useClimaStore from '../store/useClimaStore';

export default function ZonaPicker({ zonas, zonaActual, tema }) {
  const [open, setOpen] = useState(false);
  const setZona = useClimaStore(s => s.setZona);

  if (!zonas?.length) return null;

  return (
    <div className="relative animate-slide-up">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full rounded-2xl ${tema.cardBg} ${tema.border} border p-4 text-left shadow-sm transition-all hover:shadow-md`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${tema.textSecondary}`}>
              📍 Ubicación
            </p>
            <p className={`mt-1 text-sm font-bold ${tema.textPrimary}`}>
              {zonas.find(z => z.id === zonaActual)?.nombre || zonaActual}
            </p>
          </div>
          <span className={`text-lg transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {open && (
        <div className={`absolute z-50 mt-2 w-full overflow-hidden rounded-2xl ${tema.cardBg} shadow-2xl ${tema.border} border backdrop-blur-xl`}>
          <div className="max-h-64 overflow-y-auto">
            {zonas.map(z => (
              <button
                key={z.id}
                onClick={() => { setZona(z.id); setOpen(false); }}
                className={`w-full px-4 py-3 text-left transition-colors hover:bg-black/5 ${
                  z.id === zonaActual ? `${tema.accentBg} font-bold` : ''
                }`}
              >
                <p className={`text-sm font-medium ${tema.textPrimary}`}>{z.nombre}</p>
                {z.playas?.length > 0 && (
                  <p className={`text-xs ${tema.textSecondary}`}>
                    🏖️ {z.playas.slice(0, 2).join(', ')}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
