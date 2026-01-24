'use client';

import './globals.css';
import Script from 'next/script';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import MouseTrail from '@/components/ui/mouse-trail';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>MindBloom</title>
        <meta
          name="description"
          content="A Digital Psychological Intervention System"
        />

        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;500;700&display=swap"
          rel="stylesheet"
        />

        {/* MediaPipe FaceMesh */}
        <Script
          src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
          crossOrigin="anonymous"
        />
      </head>

      <body className="font-body antialiased text-foreground transition-colors duration-200">
        <ThemeProvider>
          {/* Global Ambient Background */}
          <div className="app-background">
            <MouseTrail />
            {children}
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}