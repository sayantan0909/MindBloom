'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import MouseTrail from '@/components/ui/mouse-trail';

export default function Provider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider>
            <MouseTrail />
            {children}
            <Toaster />
        </ThemeProvider>
    );
}
