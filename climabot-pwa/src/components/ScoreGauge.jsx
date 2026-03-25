import React from 'react';

function getScoreColor(score) {
  if (score >= 70) return { ring: 'text-green-500', bg: 'bg-green-500/10' };
  if (score >= 40) return { ring: 'text-yellow-500', bg: 'bg-yellow-500/10' };
  return { ring: 'text-red-500', bg: 'bg-red-500/10' };
}

export default function ScoreGauge({ score, label, tema }) {
  const { ring, bg } = getScoreColor(score);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`flex flex-col items-center rounded-3xl ${bg} p-6`}>
      <div className="relative h-28 w-28">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor"
            className="text-gray-200/30" strokeWidth="8" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor"
            className={ring} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-extrabold ${tema.textPrimary}`}>{score}</span>
        </div>
      </div>
      <span className={`mt-2 text-sm font-bold ${ring}`}>{label}</span>
    </div>
  );
}
