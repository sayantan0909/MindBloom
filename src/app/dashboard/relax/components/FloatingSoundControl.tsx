'use client';

interface FloatingSoundControlProps {
  soundOn: boolean;
  toggle: () => void;
}

export function FloatingSoundControl({ soundOn, toggle }: FloatingSoundControlProps) {
  return (
    <button
      onClick={toggle}
      type="button"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full 
                 bg-white/90 px-4 py-2 shadow-lg backdrop-blur 
                 hover:scale-105 transition"
    >
      <span className="text-lg">{soundOn ? '🔊' : '🔈'}</span>
      <span className="text-sm font-medium">
        {soundOn ? 'Calm sound on' : 'Calm sound off'}
      </span>
    </button>
  );
}
