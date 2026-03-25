import React, { useState, useMemo } from 'react';
import usePlayas from '../hooks/usePlayas';
import useClimaStore from '../store/useClimaStore';
import BeachCard from '../components/BeachCard';
import BeachFilter from '../components/BeachFilter';
import { t } from '../utils/i18n';

export default function BeachListView({ tema }) {
  const [filtroZona, setFiltroZona] = useState(null);
  const [filtroLabel, setFiltroLabel] = useState(null);
  const { playas, loading, error } = usePlayas();
  const zonas = useClimaStore(s => s.zonas);
  const fetchZonas = useClimaStore(s => s.fetchZonas);
  const idioma = useClimaStore(s => s.idioma);

  // Fetch zonas if not loaded (for filter labels)
  React.useEffect(() => {
    if (!zonas.length) fetchZonas();
  }, []);

  const filtered = useMemo(() => {
    let list = playas || [];
    if (filtroZona) list = list.filter(p => p.zona_id === filtroZona);
    if (filtroLabel) list = list.filter(p => p.label === filtroLabel);
    return list;
  }, [playas, filtroZona, filtroLabel]);

  const counts = useMemo(() => {
    if (!playas?.length) return {};
    return {
      Perfect: playas.filter(p => p.label === 'Perfect').length,
      Okay: playas.filter(p => p.label === 'Okay').length,
      Avoid: playas.filter(p => p.label === 'Avoid').length,
    };
  }, [playas]);

  if (loading && !playas.length) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`h-20 rounded-2xl ${tema.cardBg}`} />
        ))}
      </div>
    );
  }

  if (error && !playas.length) {
    return (
      <div className={`rounded-2xl ${tema.cardBg} p-6 text-center`}>
        <p className="text-4xl">😵</p>
        <p className={`mt-2 font-bold ${tema.textPrimary}`}>{t('error', idioma)}</p>
        <p className={`mt-1 text-sm ${tema.textSecondary}`}>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex gap-3 text-center">
        {['Perfect', 'Okay', 'Avoid'].map(label => (
          <div key={label} className={`flex-1 rounded-2xl ${tema.cardBg} ${tema.border} border p-3`}>
            <p className="text-2xl font-extrabold">{counts[label] || 0}</p>
            <p className={`text-xs ${tema.textSecondary}`}>
              {label === 'Perfect' ? '🟢' : label === 'Okay' ? '🟡' : '🔴'} {t(label.toLowerCase(), idioma)}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <BeachFilter
        zonas={zonas}
        filtroZona={filtroZona}
        setFiltroZona={setFiltroZona}
        filtroLabel={filtroLabel}
        setFiltroLabel={setFiltroLabel}
        tema={tema}
      />

      {/* Beach Grid */}
      <div className="grid gap-3">
        {filtered.map(playa => (
          <BeachCard key={playa.id} playa={playa} tema={tema} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className={`text-center text-sm ${tema.textSecondary} py-8`}>
          {idioma === 'es' ? 'No hay playas con estos filtros' : 'No beaches match these filters'}
        </p>
      )}
    </div>
  );
}
