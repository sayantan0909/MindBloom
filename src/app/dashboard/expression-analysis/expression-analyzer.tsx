'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle, ShieldCheck, Eye, ChevronsUpDown, Zap, BrainCircuit, Activity, Wind, Hand } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

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
  },
  Moderate: {
    title: 'Muscle Release',
    description: 'Follow a simple guide to progressively tense and release facial muscles, melting away physical stress.',
    icon: Hand,
    link: '/dashboard/relax?game=muscle',
  },
  Low: {
    title: 'Dot Focus',
    description: 'Gently guide your eyes to follow a slowly moving dot, helping to quiet a busy mind.',
    icon: Eye,
    link: '/dashboard/relax?game=focus',
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
  const [liveSignals, setLiveSignals] = useState({ eye: 'Stable', brow: 'Stable', jaw: 'Stable', head: 'Stable' });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const faceMeshRef = useRef<any | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const analysisTimers = useRef<NodeJS.Timeout[]>([]);
  const { toast } = useToast();

  const handleResults = useRef<(results: any) => void>(() => {});

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

            const eyeScore  = Math.min(eyeDelta  * 1.8, 1);
            const browScore = Math.min(browDelta * 1.4, 1);
            const jawScore  = Math.min(jawDelta  * 1.2, 1);
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
    <div className='flex items-center gap-3'>
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className='w-28 text-sm'>{label}</span>
         <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.8, ease: 'easeOut' }} className="flex-1">
            <Progress value={score * 100} className='w-full h-3' />
        </motion.div>
        <span className="text-sm font-medium w-20 text-right">{getScoreLabel(score)}</span>
    </div>
  );

  const LiveSignal = ({ label, status }: { label: string; status: SignalStatus }) => {
    const color = status === 'Active' ? 'text-red-500' : status === 'Minimal' ? 'text-yellow-500' : 'text-green-500';
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className={`font-medium ${color}`}>{status}</span>
        </div>
    );
  };
  
  const RecommendedGame = ({ level }: { level: StressLevel }) => {
    const recommendation = recommendationMap[level];
    if (!recommendation) return null;

    const { title, description, icon: Icon, link } = recommendation;
    
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <Card className="mt-6 bg-secondary/30">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Recommended Next Step</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-grow">
                        <h4 className="font-semibold">{title}</h4>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <Button asChild className="w-full sm:w-auto mt-4 sm:mt-0">
                        <Link href={link}>Start Now</Link>
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
  };

  const renderContent = () => {
    switch (phase) {
      case 'idle':
        return (
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">Click the button below to start the on-device analysis.</p>
            <Button onClick={requestPermissions} disabled={!libraryReady}>
              {libraryReady ? 'Enable Camera' : <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Engine...</>}
            </Button>
          </div>
        );
      case 'requesting':
         return (
          <div className="flex items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Requesting camera permission...
          </div>
        );
      case 'ready':
        return (
            <div className="flex flex-col items-center gap-4 text-center">
                <p className="mb-2 text-muted-foreground">Permissions granted. Click "Start Analysis" to begin.</p>
                <Button onClick={startAnalysis} disabled={!libraryReady}>
                  {libraryReady ? 'Start Analysis' : <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Engine...</>}
                </Button>
            </div>
        );
      case 'baseline':
      case 'analyzing':
        return (
          <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            <div className="flex items-center text-primary font-semibold">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {phase === 'baseline' ? 'Calibrating… look naturally' : 'Analyzing stress cues…'}
            </div>
            {phase === 'analyzing' && (
                <div className='w-full mt-4 space-y-4'>
                    <div>
                        <Progress value={instantScore * 50} className="h-4 w-full" />
                        <p className='text-center text-sm mt-2 text-muted-foreground'>Live Stress Meter</p>
                    </div>
                     <Card className="bg-secondary/50">
                        <CardHeader className="p-2 pb-0">
                            <CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" /> Live Signal Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 space-y-1">
                            <LiveSignal label="Eye Activity" status={liveSignals.eye} />
                            <LiveSignal label="Brow Tension" status={liveSignals.brow} />
                            <LiveSignal label="Jaw Clenching" status={liveSignals.jaw} />
                            <LiveSignal label="Head Movement" status={liveSignals.head} />
                        </CardContent>
                    </Card>
                </div>
            )}
          </div>
        );
      case 'success':
        return (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full">
              <Card className="bg-background w-full">
                <CardContent className="p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Here’s What We Observed</h3>
                    <Alert>
                        <AlertTitle className="text-lg">Assessed Stress Level: {result}</AlertTitle>
                        <AlertDescription className="mt-2">
                            {result === 'Low' 
                              ? "Your facial patterns appeared stable, suggesting a calm state. This is a positive sign of well-being."
                              : "This non-medical estimation is based on facial cues processed locally on your device."
                            }
                        </AlertDescription>
                    </Alert>

                     {finalScores && (
                        <Card className="mt-4 text-left">
                            <CardHeader className="p-4">
                                <CardTitle className="text-base">Key Signals</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-3">
                                <ScoreBar label="Eye Activity" score={finalScores.eye} icon={Eye} />
                                <ScoreBar label="Brow Tension" score={finalScores.brow} icon={ChevronsUpDown} />
                                <ScoreBar label="Jaw Clenching" score={finalScores.jaw} icon={Zap} />
                                <ScoreBar label="Head Movement" score={finalScores.head} icon={BrainCircuit} />
                            </CardContent>
                        </Card>
                    )}

                    <Alert variant="default" className="mt-4 text-left">
                        <ShieldCheck className="h-4 w-4" />
                        <AlertTitle>Your Privacy is Guaranteed</AlertTitle>
                        <AlertDescription>
                            Your camera has been turned off. No video data was recorded, stored, or sent from your device.
                        </AlertDescription>
                    </Alert>
                    <Button onClick={requestPermissions} className="w-full mt-6">Run Analysis Again</Button>
                </CardContent>
              </Card>
               {result && <RecommendedGame level={result} />}
            </motion.div>
          </AnimatePresence>
        );
      case 'error':
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                <Button onClick={requestPermissions} variant="secondary" className="mt-4">Try Again</Button>
            </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-6 border rounded-lg p-4 md:p-8 min-h-[450px] flex flex-col items-center justify-center bg-secondary/30">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full max-w-md rounded-xl border mb-4 ${
            ['baseline', 'analyzing', 'ready'].includes(phase) ? 'block' : 'hidden'
          }`}
        />
        <div className='w-full flex items-center justify-center'>
            {renderContent()}
        </div>
    </div>
  );
}
