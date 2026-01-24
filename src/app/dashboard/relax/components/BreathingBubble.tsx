'use client';

import { useState, useEffect, useRef } from 'react';
import { FloatingSoundControl } from './FloatingSoundControl';
import { Button } from '@/components/ui/button';

type Phase = 'inhale' | 'hold' | 'exhale';

const bubbleSize = {
  inhale: 420,
  hold: 420,
  exhale: 260,
};

const SESSION_DURATION = 2 * 60 * 1000;
const finalSize = 320;

export function BreathingBubble() {
  const [phase, setPhase] = useState<Phase>('inhale');
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [count, setCount] = useState(1);
  const [completed, setCompleted] = useState(false);

  /* ---------------- SOUND ---------------- */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  const toggleSound = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/calm.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.25;
    }

    try {
      soundOn ? audioRef.current.pause() : await audioRef.current.play();
      setSoundOn(!soundOn);
    } catch (e) {
      console.error('Audio blocked:', e);
    }
  };

  /* ---------------- VOICE ---------------- */
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);

  const enableVoice = () => {
    if (!('speechSynthesis' in window)) return;
    const unlock = new SpeechSynthesisUtterance('Voice enabled');
    unlock.volume = 0;
    window.speechSynthesis.speak(unlock);
    setVoiceEnabled(true);
    setVoiceOn(true);
  };

  const speak = (text: string) => {
    if (!voiceEnabled || !voiceOn) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  };

  /* ---------------- CLEANUP ---------------- */
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      window.speechSynthesis.cancel();
    };
  }, []);

  /* ---------------- BREATHING LOGIC ---------------- */
  useEffect(() => {
    if (!isSessionActive || completed) return;
    const timer = setTimeout(() => {
      setPhase(p => (p === 'inhale' ? 'hold' : p === 'hold' ? 'exhale' : 'inhale'));
    }, 4000);
    return () => clearTimeout(timer);
  }, [phase, completed, isSessionActive]);

  useEffect(() => {
    if (!isSessionActive || completed) return;
    const interval = setInterval(() => {
      setCount(c => (c === 4 ? 1 : c + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, completed, isSessionActive]);

  useEffect(() => {
    if (!isSessionActive) return;
    const timer = setTimeout(() => {
      setCompleted(true);
      setIsSessionActive(false);
    }, SESSION_DURATION);
    return () => clearTimeout(timer);
  }, [isSessionActive]);

  useEffect(() => {
    if (completed) return;
    if (phase === 'inhale') speak('Breathe in');
    if (phase === 'hold') speak('Hold');
    if (phase === 'exhale') speak('Breathe out');
  }, [phase, completed]);

  const handleRestart = () => {
    setPhase('inhale');
    setCompleted(false);
    setIsSessionActive(true);
    setCount(1);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="relative flex flex-col items-center justify-center h-[60vh] overflow-visible">

      <FloatingSoundControl soundOn={soundOn} toggle={toggleSound} />

      {/* VOICE */}
      {!voiceEnabled ? (
        <button
          onClick={enableVoice}
          className="fixed bottom-20 right-6 z-50 rounded-full
                     px-4 py-2 backdrop-blur-xl bg-white/60 shadow-lg"
        >
          🗣 Enable Voice
        </button>
      ) : (
        <button
          onClick={() => setVoiceOn(!voiceOn)}
          className="fixed bottom-20 right-6 z-50 rounded-full
                     px-4 py-2 backdrop-blur-xl bg-white/60 shadow-lg"
        >
          {voiceOn ? '🗣 Voice On' : '🔇 Voice Off'}
        </button>
      )}

      {/* CRYSTAL BUBBLE */}
      <div className="relative flex items-center justify-center">
        <div
          className="
            relative rounded-full
            backdrop-blur-3xl
            bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.85),rgba(230,245,255,0.55)_45%,rgba(210,235,245,0.45)_70%)]
            border border-white/40
            shadow-[inset_0_0_25px_rgba(255,255,255,0.35),0_0_120px_rgba(120,255,220,0.45)]
            transition-all duration-[4000ms] ease-in-out
          "
          style={{
            width: completed ? finalSize : bubbleSize[phase],
            height: completed ? finalSize : bubbleSize[phase],
          }}
        >
          {/* 💧 GLASS HIGHLIGHT */}
          <div className="absolute inset-0 rounded-full
            bg-[linear-gradient(135deg,rgba(255,255,255,0.45),transparent_60%)]" />

          {/* 🌊 BREATH WAVE */}
          {!completed && phase !== 'hold' && (
            <div className="absolute inset-0 rounded-full
              bg-[radial-gradient(circle,rgba(120,255,220,0.35)_0%,transparent_70%)]
              animate-[wave_8s_ease-in-out_infinite]" />
          )}

          {!completed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
              <div className="text-5xl text-gray-700/70">
                {phase === 'inhale' && '↑'}
                {phase === 'hold' && '•'}
                {phase === 'exhale' && '↓'}
              </div>
              <div className="text-6xl font-light text-gray-800">{count}</div>
              <div className="text-lg text-gray-700">
                {phase === 'inhale' && 'Breathe in'}
                {phase === 'hold' && 'Hold'}
                {phase === 'exhale' && 'Breathe out'}
              </div>
            </div>
          )}
        </div>
      </div>

      {completed && (
        <div className="mt-10 text-center animate-fade-in">
          <p className="text-xl font-medium text-emerald-700">
            Breathing session complete
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your body is now in a calmer state
          </p>
          <p className="mt-2 text-sm italic text-emerald-600">
            Thank yourself for this moment 🌿
          </p>
          <div className="mt-6">
            <Button onClick={handleRestart}>Restart</Button>
          </div>
        </div>
      )}
    </div>
  );
}
