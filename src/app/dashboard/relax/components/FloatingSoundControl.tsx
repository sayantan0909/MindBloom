'use client';

import { Volume2, VolumeX } from 'lucide-react';

interface FloatingSoundControlProps {
  soundOn: boolean;
  toggle: () => void;
}

export function FloatingSoundControl({ soundOn, toggle }: FloatingSoundControlProps) {
  return (
    <button
      onClick={toggle}
      type="button"
      aria-label="Toggle calm sound"
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center gap-3 px-4 py-3 rounded-full
        backdrop-blur-xl
        transition-all duration-300 ease-out
        shadow-[0_12px_40px_rgba(0,0,0,0.18)]
        ${soundOn
          ? 'bg-emerald-200/70 ring-2 ring-emerald-300/60 scale-105'
          : 'bg-white/60 opacity-80 hover:opacity-100 hover:scale-105'}
      `}
    >
      {soundOn ? (
        <Volume2 className="w-5 h-5 text-emerald-700" />
      ) : (
        <VolumeX className="w-5 h-5 text-gray-600" />
      )}

      <span className="text-sm font-medium text-gray-800">
        {soundOn ? 'Calm sound on' : 'Calm sound off'}
      </span>
    </button>
  );
}
