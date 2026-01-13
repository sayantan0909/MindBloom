'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Video, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import type { FaceMesh } from '@mediapipe/face_mesh';
import { useToast } from '@/hooks/use-toast';

type Status = 'idle' | 'requesting' | 'ready' | 'baseline' | 'analyzing' | 'success' | 'error';
type StressLevel = 'Low' | 'Moderate' | 'High';

// Helper function to calculate distance between two points
const p = (p1: { x: number; y: number }, p2: { x: number; y: number }) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

// Clamp a value between a min and max
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));


/**
 * Detailed analysis logic based on facial landmarks.
 */
function analyzeFacialCues(landmarks: any[]) {
    // 1. Eye Aspect Ratio (EAR) for blink detection
    const earLeft = p(landmarks[386], landmarks[374]) / p(landmarks[362], landmarks[263]);
    const earRight = p(landmarks[159], landmarks[145]) / p(landmarks[33], landmarks[133]);
    const avgEar = (earLeft + earRight) / 2.0;

    // 2. Brow-to-Eye distance for tension
    const browTensionLeft = Math.abs(landmarks[70].y - landmarks[159].y);
    const browTensionRight = Math.abs(landmarks[300].y - landmarks[386].y);
    const avgBrowTension = (browTensionLeft + browTensionRight) / 2.0;

    // 3. Mouth opening for jaw clenching
    const jawOpenness = p(landmarks[13], landmarks[14]);

    return { ear: avgEar, brow: avgBrowTension, jaw: jawOpenness, head: landmarks[1] };
}


export function ExpressionAnalyzer() {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<StressLevel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const analysisTimers = useRef<NodeJS.Timeout[]>([]);
  const { toast } = useToast();

  const stopMediaAndAnalysis = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    analysisTimers.current.forEach(clearTimeout);
    analysisTimers.current = [];
    
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (faceMeshRef.current) {
      faceMeshRef.current.close();
      faceMeshRef.current = null;
    }
  }, []);

  const requestPermissions = async () => {
    setStatus('requesting');
    setError(null);
    stopMediaAndAnalysis();
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setHasCameraPermission(true);
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => setStatus('ready');
        } else {
            setStatus('ready');
        }
    } catch (err) {
        console.error("Error accessing media devices.", err);
        setError("Permission denied. Please allow access to your camera in your browser settings.");
        setHasCameraPermission(false);
        setStatus('error');
        stopMediaAndAnalysis();
        toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions to use this feature.',
        });
    }
  };

  const startAnalysis = useCallback(() => {
    if (!videoRef.current || !(window as any).FaceMesh) {
      setError("Analysis library not loaded. Please refresh and try again.");
      setStatus('error');
      return;
    };
    
    setResult(null);
    setError(null);

    let baseline = { ear: 0, brow: 0, jaw: 0 };
    let baselineSamples = 0;
    let scoresBuffer: number[] = [];
    let lastHeadPos = { x: 0, y: 0, z: 0 };
    
    const faceMesh = new (window as any).FaceMesh({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });
    faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    
    let currentPhase: 'baseline' | 'analyzing' = 'baseline';

    faceMesh.onResults((results: any) => {
        if (!results.multiFaceLandmarks || !results.multiFaceLandmarks[0] || !videoRef.current) return;

        const landmarks = results.multiFaceLandmarks[0];
        const currentMetrics = analyzeFacialCues(landmarks);
        
        if (currentPhase === 'baseline') {
            if (baselineSamples === 0) { // First frame
                lastHeadPos = { x: currentMetrics.head.x, y: currentMetrics.head.y, z: currentMetrics.head.z };
            }
            baseline.ear += currentMetrics.ear;
            baseline.brow += currentMetrics.brow;
            baseline.jaw += currentMetrics.jaw;
            baselineSamples++;
        } else if (currentPhase === 'analyzing') {
            const avgBaseline = {
                ear: baseline.ear / baselineSamples,
                brow: baseline.brow / baselineSamples,
                jaw: baseline.jaw / baselineSamples
            };

            const deltaEye = Math.abs(currentMetrics.ear - avgBaseline.ear) / avgBaseline.ear;
            const deltaBrow = Math.abs(currentMetrics.brow - avgBaseline.brow) / avgBaseline.brow;
            const deltaJaw = Math.abs(currentMetrics.jaw - avgBaseline.jaw) / avgBaseline.jaw;
            const deltaHead = Math.hypot(currentMetrics.head.x - lastHeadPos.x, currentMetrics.head.y - lastHeadPos.y, currentMetrics.head.z - lastHeadPos.z);
            
            const eyeScore = clamp(deltaEye * 1.5, 0, 1);
            const browScore = clamp(deltaBrow * 1.2, 0, 1);
            const jawScore = clamp(deltaJaw * 1.0, 0, 1);
            const headScore = clamp(deltaHead * 0.8, 0, 1);

            let stressScore = 0.4 * eyeScore + 0.3 * browScore + 0.2 * jawScore + 0.1 * headScore;

            // Stress Trigger: High eye deviation combined with brow or jaw tension
            if (deltaEye > 0.25 && (deltaBrow > 0.2 || deltaJaw > 0.2)) {
                stressScore = clamp(stressScore + 0.2, 0, 1);
            }

            scoresBuffer.push(stressScore);
            if (scoresBuffer.length > 6) scoresBuffer.shift(); // Reduced smoothing buffer
            lastHeadPos = { x: currentMetrics.head.x, y: currentMetrics.head.y, z: currentMetrics.head.z };
        }
    });
    faceMeshRef.current = faceMesh;

    const processFrame = async () => {
      if (videoRef.current && faceMeshRef.current && ['baseline', 'analyzing'].includes(status)) {
        await faceMeshRef.current.send({ image: videoRef.current });
        animationFrameId.current = requestAnimationFrame(processFrame);
      }
    };

    setStatus('baseline');
    currentPhase = 'baseline';
    processFrame();

    const baselineTimer = setTimeout(() => {
        setStatus('analyzing');
        currentPhase = 'analyzing';

        const analysisTimer = setTimeout(() => {
            stopMediaAndAnalysis();
            
            const smoothScore = scoresBuffer.reduce((a, b) => a + b, 0) / (scoresBuffer.length || 1);

            let finalResult: StressLevel = 'Low';
            if (smoothScore > 0.55) finalResult = 'High';
            else if (smoothScore > 0.25) finalResult = 'Moderate';

            setResult(finalResult);
            setStatus('success');

        }, 7000); // 7-second analysis period
        analysisTimers.current.push(analysisTimer);

    }, 3000); // 3-second baseline period
    analysisTimers.current.push(baselineTimer);

  }, [stopMediaAndAnalysis, status, toast]);

  useEffect(() => {
    return () => {
        stopMediaAndAnalysis();
    }
  }, [stopMediaAndAnalysis]);
  
  const renderContent = () => {
    switch (status) {
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
                <video ref={videoRef} autoPlay muted playsInline className="w-full max-w-md rounded-lg aspect-video bg-black" />
                <Button onClick={startAnalysis}>Start Analysis</Button>
            </div>
        );
      case 'baseline':
        return (
          <div className="flex flex-col items-center gap-4">
            <video ref={videoRef} autoPlay muted playsInline className="w-full max-w-md rounded-lg aspect-video bg-black" />
            <div className="flex items-center text-primary font-semibold">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Establishing baseline (3s). Please keep a neutral expression.
            </div>
          </div>
        );
      case 'analyzing':
        return (
          <div className="flex flex-col items-center gap-4">
            <video ref={videoRef} autoPlay muted playsInline className="w-full max-w-md rounded-lg aspect-video bg-black" />
            <div className="flex items-center text-primary font-semibold">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing your expression on-device (7s)...
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
        {renderContent()}
    </div>
  );
}
