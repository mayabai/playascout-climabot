import React from 'react';
import useClimaStore from '../store/useClimaStore';

export default function LangToggle({ tema }) {
  const idioma = useClimaStore(s => s.idioma);
  const toggleIdioma = useClimaStore(s => s.toggleIdioma);

  return (
    <button
      onClick={toggleIdioma}
      className={`rounded-full ${tema.accentBg} px-3 py-1 text-xs font-bold ${tema.accent} transition-transform hover:scale-105 active:scale-95`}
      aria-label="Toggle language"
    >
      {idioma === 'es' ? 'EN' : 'ES'}
    </button>
  );
}
