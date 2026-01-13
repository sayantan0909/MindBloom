'use client';

import { useState, useEffect, useRef } from 'react';
import { FloatingSoundControl } from './FloatingSoundControl';

type Phase = 'inhale' | 'hold' | 'exhale';

const breathingCycle: { phase: Phase; text: string; duration: number }[] = [
  { phase: 'inhale', text: 'Breathe in...', duration: 4000 },
  { phase: 'hold', text: 'Hold', duration: 4000 },
  { phase: 'exhale', text: 'Breathe out...', duration: 4000 },
];

const phaseStyles: Record<Phase, string> = {
  inhale: 'from-sky-400 via-cyan-300 to-teal-300',
  hold: 'from-purple-300 via-indigo-300 to-blue-300',
  exhale: 'from-emerald-300 via-green-300 to-lime-200',
};

const bubbleSize = {
  inhale: 420,
  hold: 420,
  exhale: 260,
};

const SESSION_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds
const finalSize = 320;

export function BreathingBubble() {
  const [cycleIndex, setCycleIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [count, setCount] = useState(1);
  const [completed, setCompleted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);

  const toggleSound = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/calm.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.25;
    }

    try {
      if (soundOn) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setSoundOn(!soundOn);
    } catch (e) {
      console.error('Audio blocked:', e);
    }
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // stop previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;   // slower, calming
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    window.speechSynthesis.speak(utterance);
  };
  
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  const currentPhase = breathingCycle[cycleIndex];
  const phase: Phase = currentPhase.phase;

  useEffect(() => {
    if (!isSessionActive || completed) return;

    const cycleTimer = setTimeout(() => {
      setCycleIndex((prevIndex) => (prevIndex + 1) % breathingCycle.length);
    }, breathingCycle[cycleIndex].duration);

    return () => clearTimeout(cycleTimer);
  }, [cycleIndex, isSessionActive, completed]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSessionActive) {
      timer = setInterval(() => {
        setCount((prev) => (prev === 4 ? 1 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSessionActive, phase]);

  useEffect(() => {
    if (!isSessionActive) return;
    const sessionTimer = setTimeout(() => {
      setIsSessionActive(false);
      setCompleted(true);
    }, SESSION_DURATION);

    return () => clearTimeout(sessionTimer);
  }, [isSessionActive]);

  useEffect(() => {
    if (!voiceOn || completed) return;

    if (phase === 'inhale') speak('Breathe in');
    if (phase === 'hold') speak('Hold');
    if (phase === 'exhale') speak('Breathe out');
  }, [phase, voiceOn, completed]);
  
  const handleRestart = () => {
    setCycleIndex(0);
    setIsSessionActive(true);
    setCompleted(false);
  };
  
  return (
    <div className="relative flex flex-col items-center justify-center h-[60vh] bg-background overflow-hidden">
        <div
            className={`absolute inset-0 transition-colors duration-[4000ms] ${
                completed ? 'bg-emerald-50' : 'bg-background'
            }`}
        />
      <FloatingSoundControl soundOn={soundOn} toggle={toggleSound} />
      <button
        onClick={() => setVoiceOn(!voiceOn)}
        className="fixed bottom-20 right-6 z-50 rounded-full
                    bg-white/90 px-4 py-2 shadow backdrop-blur"
        >
        {voiceOn ? '🗣️ Voice On' : '🔇 Voice Off'}
        </button>
        <div className="relative flex flex-col items-center justify-center">
            <div className="w-[420px] h-[420px] flex items-center justify-center relative">
                <div
                    className={`relative rounded-full transition-all duration-[3000ms] ease-out
                        ${!completed ? `bg-gradient-to-br ${phaseStyles[phase]}` : 'bg-gradient-to-br from-emerald-300 to-teal-200'}
                        ${!completed && phase !== 'hold' ? 'animate-[float_6s_ease-in-out_infinite]' : ''}
                        ${completed ? 'shadow-[0_0_120px_rgba(120,255,200,0.7)]' : 'shadow-lg'}
                    `}
                    style={{
                        width: completed ? finalSize : bubbleSize[phase],
                        height: completed ? finalSize : bubbleSize[phase],
                    }}
                >
                    {!completed && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                            <div className="text-5xl text-white/90">
                                {phase === 'inhale' && '↑'}
                                {phase === 'hold' && '•'}
                                {phase === 'exhale' && '↓'}
                            </div>

                            <div className="text-6xl font-light text-white/90">
                                {count}
                            </div>

                            <div className="text-lg text-white/80 tracking-wide">
                                {phase === 'inhale' && 'Breathe in'}
                                {phase === 'hold' && 'Hold'}
                                {phase === 'exhale' && 'Breathe out'}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {completed && (
                <div className="mt-8 text-center animate-fade-in z-10">
                    <p className="text-xl font-medium text-emerald-700">
                        Breathing session complete
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Your body is now in a calmer state
                    </p>
                    <button
                        onClick={handleRestart}
                        className="mt-6 rounded-full px-6 py-2 bg-emerald-600 text-white
                                hover:bg-emerald-500 transition"
                    >
                        Restart breathing
                    </button>
                </div>
            )}
        </div>
    </div>
  );
}
