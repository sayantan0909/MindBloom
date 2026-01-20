'use client';

import { cn } from '@/lib/utils';

interface GradientTextProps {
    children: React.ReactNode;
    className?: string;
    colors?: string[];
    animationSpeed?: number;
}

export function GradientText({
    children,
    className,
    colors = ['#5227FF', '#FF9FFC', '#B19EEF'],
    animationSpeed = 8,
}: GradientTextProps) {
    const gradientStyle = {
        backgroundImage: `linear-gradient(90deg, ${colors.join(', ')}, ${colors[0]})`,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: `gradient-x ${animationSpeed}s linear infinite`,
    };

    return (
        <>
            <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
            <span
                className={cn('inline-block', className)}
                style={gradientStyle}
            >
                {children}
            </span>
        </>
    );
}
