'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { MouseTrail } from '@/components/ui/mouse-trail';
import Script from 'next/script';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>MindBloom</title>
        <meta name="description" content="A Digital Psychological Intervention System"/>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;500;700&display=swap" rel="stylesheet" />
        <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js" crossOrigin="anonymous" />
      </head>
      <body className="font-body antialiased">
        <MouseTrail />
        <button
          onClick={() => {
            const a = new Audio('/sounds/calm.mp3');
            a.loop = true;
            a.volume = 0.25;
            a.play();
          }}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            padding: '10px 14px',
            background: '#000',
            color: '#fff',
            borderRadius: '8px',
          }}
        >
          TEST SOUND
        </button>
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
