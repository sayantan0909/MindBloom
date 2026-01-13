'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Dynamically import FaceMesh
let FaceMesh: any;

// Type definitions
type Phase = 'idle' | 'requesting' | 'ready' | 'baseline' | 'analyzing' | 'success' | 'error';
type StressLevel = 'Low' | 'Moderate' | 'High';

// --- Helper Functions ---
const p = (p1: { x: number; y: number }, p2: { x: number; y: number }) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b) / arr.length : 0;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

function analyzeFacialCues(landmarks: any[]) {
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceMeshRef = useRef<any | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const analysisTimers = useRef<NodeJS.Timeout[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Dynamically import the FaceMesh module on component mount
    (async () => {
      try {
        const module = await import('@mediapipe/face_mesh');
        FaceMesh = module.FaceMesh;
      } catch (e) {
        console.error("Failed to load MediaPipe FaceMesh module", e);
        setError("Failed to load analysis library. Please check your network connection and try again.");
        setPhase('error');
      }
    })();

    // Cleanup on unmount
    return () => {
        stopMediaAndAnalysis();
    }
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

    if (faceMeshRef.current) {
      faceMeshRef.current.close();
      faceMeshRef.current = null;
    }
  }, []);

  const requestPermissions = async () => {
    setPhase('requesting');
    setError(null);
    
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
    if (!videoRef.current || !FaceMesh) {
      setError("Analysis library not loaded. Please refresh and try again.");
      setPhase('error');
      return;
    };
    
    setResult(null);
    setError(null);

    let baseline = { ear: 0, brow: 0, jaw: 0, head: { x: 0, y: 0, z: 0 } };
    let baselineSamples = { ear: [] as number[], brow: [] as number[], jaw: [] as number[], headX: [] as number[], headY: [] as number[] };
    let baselineLocked = false;
    
    let scoresBuffer: number[] = [];
    
    const faceMesh = new FaceMesh({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });
    faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    
    faceMesh.onResults((results: any) => {
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

            scoresBuffer.push(clamp(stressScore, 0, 2)); // Clamp to a reasonable max
            if (scoresBuffer.length > 6) scoresBuffer.shift(); 
        }
    });
    faceMeshRef.current = faceMesh;

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
            setPhase('success');
            stopMediaAndAnalysis();

        }, 7000); // 7-second analysis period
        analysisTimers.current.push(analysisTimer);

    }, 3000); // 3-second baseline period
    analysisTimers.current.push(baselineTimer);

  }, [stopMediaAndAnalysis, phase, toast]);

  const renderContent = () => {
    switch (phase) {
      case 'idle':
        return (
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">Click the button below to start the on-device analysis.</p>
            <Button onClick={requestPermissions}>Enable Camera</Button>
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
                <Button onClick={startAnalysis}>Start Analysis</Button>
            </div>
        );
      case 'baseline':
      case 'analyzing':
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center text-primary font-semibold">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {phase === 'baseline' ? 'Calibrating… look naturally' : 'Analyzing stress cues…'}
            </div>
          </div>
        );
      case 'success':
        return (
          <Card className="bg-background w-full">
            <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analysis Complete</h3>
                <Alert>
                    <AlertTitle className="text-lg">Assessed Stress Level: {result}</AlertTitle>
                    <AlertDescription className="mt-2">
                        This is a non-medical estimation based on facial cues processed locally on your device.
                    </AlertDescription>
                </Alert>
                <Alert variant="default" className="mt-4 text-left">
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>Privacy Guaranteed</AlertTitle>
                    <AlertDescription>
                        Your camera has been turned off. No video data was recorded, stored, or sent from your device.
                    </AlertDescription>
                </Alert>
                <Button onClick={requestPermissions} className="w-full mt-6">Run Analysis Again</Button>
            </CardContent>
          </Card>
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
    <div className="mt-6 border rounded-lg p-4 md:p-8 min-h-[450px] flex items-center justify-center bg-secondary/30">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full max-w-md rounded-xl border ${
            ['baseline', 'analyzing', 'ready'].includes(phase) ? 'block' : 'hidden'
          }`}
        />
        {renderContent()}
    </div>
  );
}
