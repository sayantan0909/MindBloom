'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface MovingBorderProps {
    children: ReactNode;
    borderRadius?: string;
    className?: string;
    onClick?: () => void;
    as?: 'button' | 'a';
    href?: string;
}

export function MovingBorder({
    children,
    borderRadius = '0.5rem',
    className,
    onClick,
    as: Component = 'button',
    href,
}: MovingBorderProps) {
    const props = {
        ...(Component === 'a' ? { href } : {}),
        ...(onClick ? { onClick } : {}),
    };

    return (
        <Component
            className={cn(
                'relative p-[2px] overflow-hidden cursor-pointer',
                'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500',
                'hover:shadow-lg hover:shadow-purple-500/50 transition-shadow duration-300',
                className
            )}
            style={{ borderRadius }}
            {...(props as any)}
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
                animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                }}
                style={{
                    backgroundSize: '200% 200%',
                }}
            />
            <div
                className={cn(
                    'relative bg-black px-6 py-3',
                    'text-white font-medium',
                    'hover:bg-transparent hover:text-white',
                    'transition-all duration-300'
                )}
                style={{ borderRadius }}
            >
                {children}
            </div>
        </Component>
    );
}
