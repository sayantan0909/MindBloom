'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Video, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import { FaceMesh, FACEMESH_TESSELATION } from '@mediapipe/face_mesh';
import * as CameraUtils from '@mediapipe/camera_utils';

type Status = 'idle' | 'requesting' | 'ready' | 'analyzing' | 'success' | 'error';
type StressLevel = 'Low' | 'Moderate' | 'High';

// --- Client-Side Analysis Logic ---
// This section contains the logic for analyzing video and audio streams directly in the browser.
// No data is sent to any server.

/**
 * Analyzes facial landmarks to infer stress cues.
 * A simplified model for demonstration purposes.
 * @param landmarks The detected face landmarks from MediaPipe.
 * @returns A numeric stress score based on facial cues.
 */
function analyzeFacialCues(landmarks: any[]): number {
  if (!landmarks || landmarks.length === 0) return 0;

  // Eye Aspect Ratio (EAR) for blink detection (simplified)
  const leftEye = [33, 160, 158, 133, 153, 144];
  const rightEye = [362, 385, 387, 263, 373, 380];
  const p = (p1: number, p2: number) => Math.hypot(landmarks[p1].x - landmarks[p2].x, landmarks[p1].y - landmarks[p2].y);
  
  const earLeft = (p(160, 144) + p(158, 153)) / (2 * p(33, 133));
  const earRight = (p(385, 380) + p(387, 373)) / (2 * p(362, 263));
  const avgEar = (earLeft + earRight) / 2;

  // Eyebrow-to-eye distance (simplified)
  const leftBrowDist = p(105, 159);
  const rightBrowDist = p(334, 386);
  const avgBrowDist = (leftBrowDist + rightBrowDist) / 2;

  let score = 0;
  // Lower EAR can indicate squinting or rapid blinking under stress.
  if (avgEar < 0.25) score += 1;
  // Lowered brows can indicate tension.
  if (avgBrowDist < 0.06) score += 1;

  return score;
}

export function ExpressionAnalyzer() {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<StressLevel | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameId = useRef<number | null>(null);

  /**
   * Stops all media tracks (camera and microphone) and releases resources.
   * This is a critical privacy and performance function.
   */
  const stopMedia = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (faceMeshRef.current) {
      faceMeshRef.current.close();
      faceMeshRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  /**
   * Requests camera and microphone permissions from the user.
   */
  const requestPermissions = async () => {
    setStatus('requesting');
    setError(null);
    try {
      // Get user media stream for both video and audio.
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStatus('ready');
    } catch (err) {
      console.error("Error accessing media devices.", err);
      setError("Permission denied. Please allow access to your camera and microphone in your browser settings.");
      setStatus('error');
      stopMedia();
    }
  };

  /**
   * Starts the analysis process, initializing FaceMesh and Web Audio API.
   * The analysis runs for a short duration (5 seconds).
   */
  const startAnalysis = useCallback(() => {
    if (!streamRef.current || !videoRef.current) return;
    
    setStatus('analyzing');
    setResult(null);
    setError(null);

    const scores = { facial: [] as number[], audio: [] as number[] };

    // --- Face Analysis Setup ---
    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    faceMesh.onResults((results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
        const facialScore = analyzeFacialCues(results.multiFaceLandmarks[0]);
        scores.facial.push(facialScore);
      }
    });
    faceMeshRef.current = faceMesh;

    // --- Audio Analysis Setup ---
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(streamRef.current);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    analyserRef.current = analyser;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const analyzeAudio = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      const avgEnergy = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
      // High energy can indicate a strained or louder voice under stress.
      if (avgEnergy > 50) scores.audio.push(1);
      else scores.audio.push(0);
    };

    // --- Connect Camera to FaceMesh ---
    const camera = new CameraUtils.Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await faceMesh.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });
    camera.start();

    // Run analysis for 5 seconds
    const analysisInterval = setInterval(analyzeAudio, 500);
    setTimeout(() => {
      clearInterval(analysisInterval);
      
      // Stop all media and processing
      stopMedia();
      camera.stop();

      // --- Final Stress Calculation ---
      const avgFacialScore = scores.facial.reduce((a, b) => a + b, 0) / (scores.facial.length || 1);
      const avgAudioScore = scores.audio.reduce((a, b) => a + b, 0) / (scores.audio.length || 1);
      const totalScore = avgFacialScore + avgAudioScore;
      
      let finalResult: StressLevel = 'Low';
      if (totalScore > 1.5) {
        finalResult = 'High';
      } else if (totalScore > 0.5) {
        finalResult = 'Moderate';
      }

      setResult(finalResult);
      setStatus('success');

    }, 5000);

  }, [stopMedia]);

  // Cleanup effect to stop media when the component unmounts.
  useEffect(() => {
    return () => stopMedia();
  }, [stopMedia]);
  
  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">Click the button below to start the on-device analysis.</p>
            <Button onClick={requestPermissions}>Enable Camera & Mic</Button>
          </div>
        );
      case 'requesting':
         return (
          <div className="flex items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Requesting permissions...
          </div>
        );
      case 'ready':
        return (
            <div className="flex flex-col items-center gap-4 text-center">
                <p className="mb-2 text-muted-foreground">Permissions granted. Click "Start Analysis" to begin.</p>
                <video ref={videoRef} autoPlay muted playsInline className="w-full max-w-md rounded-lg aspect-video bg-black" />
                <Button onClick={startAnalysis}>Start Analysis (5 seconds)</Button>
            </div>
        );
      case 'analyzing':
        return (
          <div className="flex flex-col items-center gap-4">
            <video ref={videoRef} autoPlay muted playsInline className="w-full max-w-md rounded-lg aspect-video bg-black" />
            <div className="flex items-center text-primary font-semibold">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing your expression on-device for 5 seconds...
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
                        This is a non-medical estimation based on facial and vocal cues processed locally on your device.
                    </AlertDescription>
                </Alert>
                <Alert variant="default" className="mt-4 text-left">
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>Privacy Guaranteed</AlertTitle>
                    <AlertDescription>
                        Your camera and microphone have been turned off. No audio or video data was recorded, stored, or sent from your device.
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
