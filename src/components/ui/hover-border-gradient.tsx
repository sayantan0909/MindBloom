'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface HoverBorderGradientProps {
    children: ReactNode;
    className?: string;
    containerClassName?: string;
    as?: 'button' | 'a';
    href?: string;
    onClick?: () => void;
}

export function HoverBorderGradient({
    children,
    className,
    containerClassName,
    as: Component = 'button',
    href,
    onClick,
}: HoverBorderGradientProps) {
    const props = {
        ...(Component === 'a' ? { href } : {}),
        ...(onClick ? { onClick } : {}),
    };

    return (
        <div className={cn('relative group', containerClassName)}>
            <motion.div
                className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-300"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.75 }}
            />
            <Component
                className={cn(
                    'relative px-6 py-3 bg-white dark:bg-black rounded-lg',
                    'text-black dark:text-white font-medium',
                    'transition-all duration-200',
                    'hover:scale-105 cursor-pointer',
                    className
                )}
                {...(props as any)}
            >
                {children}
            </Component>
        </div>
    );
}
