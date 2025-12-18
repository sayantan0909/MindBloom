'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeExpression } from '@/ai/flows/ai-expression-analysis';
import type { AiExpressionAnalysisOutput } from '@/ai/flows/ai-expression-analysis';
import { Loader2, Mic, Video, AlertTriangle, CheckCircle } from 'lucide-react';

type Status = 'idle' | 'requesting' | 'ready' | 'recording' | 'processing' | 'success' | 'error';

export function ExpressionAnalyzer() {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<AiExpressionAnalysisOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedVideoChunks = useRef<Blob[]>([]);
  const recordedAudioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  const requestPermissions = async () => {
    setStatus('requesting');
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      setStatus('ready');
    } catch (err) {
      console.error("Error accessing media devices.", err);
      setError("Permission denied. Please allow access to your camera and microphone in your browser settings.");
      setStatus('error');
    }
  };

  const startAnalysis = () => {
    if (!stream) return;
    setStatus('recording');
    setResult(null);
    recordedVideoChunks.current = [];
    recordedAudioChunks.current = [];

    const videoStream = new MediaStream(stream.getVideoTracks());
    const audioStream = new MediaStream(stream.getAudioTracks());

    const videoRecorder = new MediaRecorder(videoStream, { mimeType: 'video/webm' });
    const audioRecorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });

    videoRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedVideoChunks.current.push(event.data);
    };
    audioRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedAudioChunks.current.push(event.data);
    };

    videoRecorder.onstop = () => {
      audioRecorder.stop();
    };
    
    audioRecorder.onstop = async () => {
        setStatus('processing');
        const videoBlob = new Blob(recordedVideoChunks.current, { type: 'video/webm' });
        const audioBlob = new Blob(recordedAudioChunks.current, { type: 'audio/webm' });
        
        const toDataURL = (blob: Blob) => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        try {
            const videoDataUri = await toDataURL(videoBlob);
            const audioDataUri = await toDataURL(audioBlob);
            
            const analysisResult = await analyzeExpression({ videoDataUri, audioDataUri });
            setResult(analysisResult);
            setStatus('success');
        } catch (e) {
            console.error("Analysis failed:", e);
            setError("The analysis could not be completed. Please try again.");
            setStatus('error');
        }
    };

    videoRecorder.start();
    audioRecorder.start();

    setTimeout(() => {
      if (videoRecorder.state === 'recording') {
        videoRecorder.stop();
      }
    }, 5000); // Record for 5 seconds
  };
  
  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <div className="text-center">
            <p className="mb-4">Click the button below to begin.</p>
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
      case 'recording':
      case 'processing':
        return (
          <div className="flex flex-col items-center gap-4">
            <video ref={videoRef} autoPlay muted className="w-full max-w-md rounded-lg aspect-video bg-black" />
            {status === 'ready' && <Button onClick={startAnalysis}>Start Analysis</Button>}
            {status === 'recording' && (
              <div className="flex items-center text-destructive">
                <div className="w-3 h-3 rounded-full bg-destructive animate-pulse mr-2" />
                Recording for 5 seconds...
              </div>
            )}
            {status === 'processing' && (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </div>
            )}
          </div>
        );
      case 'success':
        return (
          <Card className="bg-background">
            <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">Analysis Complete</h3>
                <Alert>
                    <AlertTitle className="text-lg">Assessed Stress Level: {result?.stressLevel}</AlertTitle>
                    <AlertDescription className="mt-2">
                        <strong>Explanation:</strong> {result?.explanation}
                    </AlertDescription>
                </Alert>
                <Button onClick={requestPermissions} className="w-full mt-6">Try Again</Button>
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
    <div className="mt-6 border rounded-lg p-4 md:p-8 min-h-[300px] flex items-center justify-center bg-secondary/30">
        {renderContent()}
    </div>
  );
}
