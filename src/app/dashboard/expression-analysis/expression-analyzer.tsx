'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle, ShieldCheck, Eye, ChevronsUpDown, Zap, BrainCircuit, Activity, Wind, Hand, Sparkles, RefreshCcw, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { GlassCard } from '@/components/dashboard/glass-card';
import { GradientText } from '@/components/ui/gradient-text';
import { cn } from '@/lib/utils';

// Type definitions
type Phase = 'idle' | 'requesting' | 'ready' | 'baseline' | 'analyzing' | 'success' | 'error';
type StressLevel = 'Low' | 'Moderate' | 'High';
type MetricScores = { eye: number; brow: number; jaw: number; head: number; };
type SignalStatus = 'Stable' | 'Minimal' | 'Active';

const recommendationMap = {
  High: {
    title: 'Breathing Bubble',
    description: 'Sync your breath with a calming visual guide to lower stress and find your center.',
    icon: Wind,
    link: '/dashboard/relax?game=breathing',
    color: 'emerald'
  },
  Moderate: {
    title: 'Muscle Release',
    description: 'Follow a simple guide to progressively tense and release facial muscles, melting away physical stress.',
    icon: Hand,
    link: '/dashboard/relax?game=muscle',
    color: 'orange'
  },
  Low: {
    title: 'Dot Focus',
    description: 'Gently guide your eyes to follow a slowly moving dot, helping to quiet a busy mind.',
    icon: Eye,
    link: '/dashboard/relax?game=focus',
    color: 'indigo'
  },
};

// --- Helper Functions ---
const p = (p1: { x: number; y: number }, p2: { x: number; y: number }) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b) / arr.length : 0;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

function analyzeFacialCues(landmarks: any[]) {
  if (!landmarks || landmarks.length === 0) {
    return { ear: 0, brow: 0, jaw: 0, head: { x: 0, y: 0, z: 0 } };
  }
  const earLeft = p(landmarks[386], landmarks[374]) / p(landmarks[362], landmarks[263]);
  const earRight = p(landmarks[159], landmarks[145]) / p(landmarks[33], landmarks[133]);
  const avgEar = (earLeft + earRight) / 2.0;

  const browTensionLeft = Math.abs(landmarks[70].y - landmarks[159].y);
  const browTensionRight = Math.abs(landmarks[300].y - landmarks[386].y);
  const avgBrowTension = (browTensionLeft + browTensionRight) / 2.0;

  const jawOpenness = p(landmarks[13], landmarks[14]);

  return { ear: avgEar, brow: avgBrowTension, jaw: jawOpenness, head: landmarks[1] };
}

export function ExpressionAnalyzer() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<StressLevel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [libraryReady, setLibraryReady] = useState(false);
  const [instantScore, setInstantScore] = useState(0);
  const [finalScores, setFinalScores] = useState<MetricScores | null>(null);
  const [liveSignals, setLiveSignals] = useState<{ eye: SignalStatus; brow: SignalStatus; jaw: SignalStatus; head: SignalStatus }>({ eye: 'Stable', brow: 'Stable', jaw: 'Stable', head: 'Stable' });

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const faceMeshRef = useRef<any | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const analysisTimers = useRef<NodeJS.Timeout[]>([]);
  const { toast } = useToast();

  const handleResults = useRef<(results: any) => void>(() => { });

  useEffect(() => {
    let cancelled = false;

    async function loadFaceMesh() {
      // Load script dynamically from CDN
      await new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        document.body.appendChild(script);
      });

      if (cancelled) return;

      // @ts-ignore
      const mesh = new window.FaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      mesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      mesh.onResults((results: any) => handleResults.current(results));

      faceMeshRef.current = mesh;
      setLibraryReady(true);
    }

    loadFaceMesh();

    return () => {
      cancelled = true;
      faceMeshRef.current?.close?.();
      stopMediaAndAnalysis();
    };
  }, []);

  const stopMediaAndAnalysis = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    analysisTimers.current.forEach(clearTimeout);
    analysisTimers.current = [];

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const requestPermissions = async () => {
    setPhase('requesting');
    setError(null);
    setResult(null);
    setFinalScores(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      mediaStreamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        setError('Video element not found.');
        setPhase('error');
        return;
      }

      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        setPhase('ready');
      };
    } catch (err) {
      console.error("Error accessing media devices.", err);
      setError("Permission denied. Please allow access to your camera in your browser settings.");
      setPhase('error');
      stopMediaAndAnalysis();
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions to use this feature.',
      });
    }
  };

  const startAnalysis = useCallback(() => {
    if (!libraryReady || !videoRef.current || !faceMeshRef.current) return;

    setResult(null);
    setError(null);
    setInstantScore(0);
    setFinalScores(null);
    setLiveSignals({ eye: 'Stable', brow: 'Stable', jaw: 'Stable', head: 'Stable' });

    let baseline = { ear: 0, brow: 0, jaw: 0, head: { x: 0, y: 0, z: 0 } };
    let baselineSamples = { ear: [] as number[], brow: [] as number[], jaw: [] as number[], headX: [] as number[], headY: [] as number[] };
    let baselineLocked = false;

    let scoresBuffer: number[] = [];

    handleResults.current = (results: any) => {
      if (!results.multiFaceLandmarks || !results.multiFaceLandmarks[0] || !videoRef.current) return;

      const landmarks = results.multiFaceLandmarks[0];
      const currentMetrics = analyzeFacialCues(landmarks);

      if (phase === 'baseline') {
        baselineSamples.ear.push(currentMetrics.ear);
        baselineSamples.brow.push(currentMetrics.brow);
        baselineSamples.jaw.push(currentMetrics.jaw);
        baselineSamples.headX.push(currentMetrics.head.x);
        baselineSamples.headY.push(currentMetrics.head.y);
        return;
      }

      if (phase === 'analyzing') {
        if (!baselineLocked) {
          baseline = {
            ear: avg(baselineSamples.ear),
            brow: avg(baselineSamples.brow),
            jaw: avg(baselineSamples.jaw),
            head: { x: avg(baselineSamples.headX), y: avg(baselineSamples.headY), z: 0 }
          };
          baselineLocked = true;
        }

        const eyeDelta = baseline.ear > 0.01 ? Math.abs(currentMetrics.ear - baseline.ear) / baseline.ear : 0;
        const browDelta = baseline.brow > 0.01 ? Math.abs(currentMetrics.brow - baseline.brow) / baseline.brow : 0;
        const jawDelta = baseline.jaw > 0.01 ? Math.abs(currentMetrics.jaw - baseline.jaw) / baseline.jaw : 0;
        const headDelta = Math.hypot(currentMetrics.head.x - baseline.head.x, currentMetrics.head.y - baseline.head.y);

        const eyeScore = Math.min(eyeDelta * 1.8, 1);
        const browScore = Math.min(browDelta * 1.4, 1);
        const jawScore = Math.min(jawDelta * 1.2, 1);
        const headScore = Math.min(headDelta * 1.0, 1);

        let stressScore = eyeScore + browScore + jawScore + headScore;

        if (eyeDelta > 0.3) {
          stressScore += 0.25;
        }

        const clampedScore = clamp(stressScore, 0, 2);
        scoresBuffer.push(clampedScore);
        if (scoresBuffer.length > 6) scoresBuffer.shift();

        setInstantScore(avg(scoresBuffer));

        setLiveSignals({
          eye: eyeDelta > 0.25 ? 'Active' : (eyeDelta > 0.1 ? 'Minimal' : 'Stable'),
          brow: browDelta > 0.2 ? 'Active' : (browDelta > 0.08 ? 'Minimal' : 'Stable'),
          jaw: jawDelta > 0.2 ? 'Active' : (jawDelta > 0.08 ? 'Minimal' : 'Stable'),
          head: headDelta > 0.15 ? 'Active' : (headDelta > 0.05 ? 'Minimal' : 'Stable'),
        });
      }
    };

    const processFrame = async () => {
      if (videoRef.current && faceMeshRef.current && ['baseline', 'analyzing'].includes(phase)) {
        await faceMeshRef.current.send({ image: videoRef.current });
        animationFrameId.current = requestAnimationFrame(processFrame);
      }
    };

    setPhase('baseline');
    processFrame();

    const baselineTimer = setTimeout(() => {
      setPhase('analyzing');

      const analysisTimer = setTimeout(() => {
        const finalScore = avg(scoresBuffer);

        let finalResult: StressLevel;
        if (finalScore < 0.25) finalResult = 'Low';
        else if (finalScore < 0.55) finalResult = 'Moderate';
        else finalResult = 'High';

        setResult(finalResult);
        const total = finalScore > 0 ? finalScore : 1;
        setFinalScores({
          eye: clamp(avg(scoresBuffer.slice(-3)) * 1.8 / total, 0, 1),
          brow: clamp(avg(scoresBuffer.slice(-3)) * 1.4 / total, 0, 1),
          jaw: clamp(avg(scoresBuffer.slice(-3)) * 1.2 / total, 0, 1),
          head: clamp(avg(scoresBuffer.slice(-3)) * 1.0 / total, 0, 1),
        });

        setPhase('success');
        stopMediaAndAnalysis();

      }, 7000);
      analysisTimers.current.push(analysisTimer);

    }, 3000);
    analysisTimers.current.push(baselineTimer);

  }, [libraryReady, phase, stopMediaAndAnalysis]);

  const getScoreLabel = (score: number): StressLevel => {
    if (score < 0.33) return 'Low';
    if (score < 0.66) return 'Moderate';
    return 'High';
  };

  const ScoreBar = ({ label, score, icon: Icon }: { label: string; score: number; icon: React.ElementType }) => (
    <div className='flex items-center gap-4'>
      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
        <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>{label}</span>
          <span>{getScoreLabel(score)}</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={cn(
              "h-full rounded-full",
              score < 0.33 ? "bg-emerald-500" : score < 0.66 ? "bg-amber-500" : "bg-rose-500"
            )}
          />
        </div>
      </div>
    </div>
  );

  const LiveSignal = ({ label, status }: { label: string; status: SignalStatus }) => {
    const color = status === 'Active' ? 'text-rose-500' : status === 'Minimal' ? 'text-amber-500' : 'text-emerald-500';
    const bg = status === 'Active' ? 'bg-rose-500/10' : status === 'Minimal' ? 'bg-amber-500/10' : 'bg-emerald-500/10';
    return (
      <div className={cn("flex items-center justify-between px-3 py-2 rounded-xl transition-colors", bg)}>
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">{label}</span>
        <span className={cn("text-xs font-black uppercase tracking-widest", color)}>{status}</span>
      </div>
    );
  };

  const RecommendedGame = ({ level }: { level: StressLevel }) => {
    const recommendation = recommendationMap[level];
    if (!recommendation) return null;

    const { title, description, icon: Icon, link } = recommendation;

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
        <GlassCard className="mt-8 overflow-hidden group">
          <div className="p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-[1.5rem] shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div className="flex-grow text-center sm:text-left space-y-2">
              <h4 className="text-xl font-bold font-headline">{title}</h4>
              <p className="text-slate-600 dark:text-slate-400">{description}</p>
            </div>
            <Button asChild className="w-full sm:w-auto mt-2 sm:mt-0 h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25">
              <Link href={link}>Start Now <Sparkles className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  const renderContent = () => {
    switch (phase) {
      case 'idle':
        return (
          <div className="text-center space-y-8 py-12">
            <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-pulse" />
              <div className="absolute inset-4 bg-indigo-500/40 rounded-full animate-ping" />
              <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-full shadow-2xl">
                <Camera className="h-10 w-10 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Click the button below to enable your camera for on-device stress analysis.</p>
              <Button
                onClick={requestPermissions}
                disabled={!libraryReady}
                className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-500/25 transition-all active:scale-95"
              >
                {libraryReady ? 'Enable Camera' : <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Preparing Engine...</>}
              </Button>
            </div>
          </div>
        );
      case 'requesting':
        return (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
              <div className="absolute inset-0 blur-xl bg-indigo-500/30 animate-pulse" />
            </div>
            <p className="font-bold text-slate-500 animate-pulse uppercase tracking-widest text-sm">Requesting Permissions...</p>
          </div>
        );
      case 'ready':
        return (
          <div className="flex flex-col items-center gap-8 text-center py-12">
            <div className="bg-emerald-500/10 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
            </div>
            <div className="space-y-4">
              <p className="text-slate-500 dark:text-slate-400">Permissions granted. Position yourself in a well-lit area.</p>
              <Button
                onClick={startAnalysis}
                disabled={!libraryReady}
                className="h-14 px-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-lg shadow-xl shadow-emerald-500/25 transition-all active:scale-95"
              >
                Start Analysis <Activity className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        );
      case 'baseline':
      case 'analyzing':
        return (
          <div className="flex flex-col items-center gap-8 w-full max-w-sm py-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Activity className="h-8 w-8 text-indigo-500 animate-bounce" />
                <div className="absolute inset-0 blur-lg bg-indigo-500/40 animate-pulse" />
              </div>
              <span className="font-black text-xs uppercase tracking-[0.2em] text-indigo-600/70 dark:text-indigo-400">
                {phase === 'baseline' ? 'Calibrating Baseline...' : 'Processing Signals...'}
              </span>
            </div>

            {phase === 'analyzing' && (
              <div className='w-full space-y-8'>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Signal Intensity</span>
                    <span className={cn(
                      "text-lg font-black font-headline tabular-nums",
                      instantScore < 0.25 ? "text-emerald-500" : instantScore < 0.55 ? "text-amber-500" : "text-rose-500"
                    )}>
                      {Math.round(instantScore * 100)}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        instantScore < 0.25 ? "bg-emerald-500" : instantScore < 0.55 ? "bg-amber-500" : "bg-rose-500"
                      )}
                      animate={{ width: `${Math.min(instantScore * 50, 100)}%` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  </div>
                </div>

                <div className="bg-white/40 dark:bg-slate-900/40 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Telemetry</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <LiveSignal label="Eye Activity" status={liveSignals.eye} />
                    <LiveSignal label="Brow Tension" status={liveSignals.brow} />
                    <LiveSignal label="Jaw Clenching" status={liveSignals.jaw} />
                    <LiveSignal label="Head Tracking" status={liveSignals.head} />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'success':
        return (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full space-y-6"
            >
              <div className="text-center space-y-6">
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-pulse" />
                  <CheckCircle className="h-12 w-12 text-emerald-500 z-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-bold font-headline">Analysis Complete</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium italic">"Your face tells a story of your inner state."</p>
                </div>

                <div className={cn(
                  "inline-block px-10 py-6 rounded-[2.5rem] border-2 text-center space-y-2",
                  result === 'Low' ? "bg-emerald-500/10 border-emerald-500/20" : result === 'Moderate' ? "bg-amber-500/10 border-amber-500/20" : "bg-rose-500/10 border-rose-500/20"
                )}>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Estimated Stress Level</p>
                  <GradientText colors={
                    result === 'Low' ? ['#10b981', '#059669'] : result === 'Moderate' ? ['#f59e0b', '#d97706'] : ['#f43f5e', '#e11d48']
                  }>
                    <span className="text-5xl font-black font-headline uppercase tracking-tight">{result}</span>
                  </GradientText>
                </div>
              </div>

              <Alert className="bg-white/40 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 rounded-2xl py-6">
                <AlertDescription className="text-slate-600 dark:text-slate-300 text-center leading-relaxed italic">
                  {result === 'Low'
                    ? "Your facial patterns appeared stable and relaxed, characterizing a state of calm and composure."
                    : "Micro-movements in your brow and jaw suggest some active tension. It might be a good time for a short break."
                  }
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/40 dark:bg-slate-900/40 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Metric Breakdown</span>
                  </div>
                  <div className="space-y-6">
                    {finalScores && (
                      <>
                        <ScoreBar label="Eye Activity" score={finalScores.eye} icon={Eye} />
                        <ScoreBar label="Brow Tension" score={finalScores.brow} icon={ChevronsUpDown} />
                        <ScoreBar label="Jaw Clenching" score={finalScores.jaw} icon={Zap} />
                        <ScoreBar label="Head Movement" score={finalScores.head} icon={BrainCircuit} />
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-white/40 dark:bg-slate-900/40 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Privacy Status</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                    Analysis complete. Your camera has been disconnected. No video data ever left your hardware.
                  </p>
                  <Button
                    onClick={requestPermissions}
                    variant="outline"
                    className="h-12 w-full rounded-xl border-2 font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" /> Run New Scan
                  </Button>
                </div>
              </div>

              {result && <RecommendedGame level={result} />}
            </motion.div>
          </AnimatePresence>
        );
      case 'error':
        return (
          <div className="w-full max-w-md mx-auto">
            <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/20 text-rose-600 rounded-2xl p-6">
              <div className="flex flex-col items-center text-center gap-4">
                <AlertTriangle className="h-10 w-10" />
                <div>
                  <AlertTitle className="text-lg font-black uppercase tracking-widest mb-2">Technical Error</AlertTitle>
                  <AlertDescription className="text-rose-500/80 font-medium">
                    {error}
                  </AlertDescription>
                </div>
                <Button
                  onClick={requestPermissions}
                  variant="destructive"
                  className="mt-2 w-full h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg"
                >
                  Try Initializing Again
                </Button>
              </div>
            </Alert>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <GlassCard className="mt-6 flex flex-col items-center justify-center bg-white/40 border-white/60 dark:border-slate-700/40 min-h-[500px]" hover={false}>
      <div className="p-8 md:p-12 w-full flex flex-col items-center">
        <div className={cn(
          "relative w-full max-w-md aspect-video mb-8 transition-all duration-700",
          ['baseline', 'analyzing', 'ready'].includes(phase) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 h-0 mb-0 overflow-hidden'
        )}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-[2rem] border-4 border-white/60 dark:border-slate-800/60 shadow-2xl"
          />

          {/* Overlay for Scanning Effect */}
          {phase === 'analyzing' && (
            <motion.div
              className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_20px_2px_rgba(79,70,229,0.8)] z-20"
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          )}

          {/* Vignette Overlay */}
          <div className="absolute inset-0 rounded-[2rem] shadow-[inset_0_0_80px_rgba(0,0,0,0.4)] pointer-events-none" />

          {/* Viewfinder Corners */}
          <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/80 rounded-tl-lg" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white/80 rounded-tr-lg" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-white/80 rounded-bl-lg" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white/80 rounded-br-lg" />
        </div>

        <div className='w-full flex items-center justify-center'>
          {renderContent()}
        </div>
      </div>
    </GlassCard>
  );
}
