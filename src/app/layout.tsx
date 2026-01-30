import './globals.css';
import Script from 'next/script';
import Provider from './provider';

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

        {/* Favicons */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon_io/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon_io/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon_io/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon_io/site.webmanifest" />

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
        <Provider>
          <div className="app-background">
            {children}
          </div>
        </Provider>
      </body>
    </html>
  );
}
