'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WobbleCardProps {
    children: React.ReactNode;
    containerClassName?: string;
    className?: string;
}

export function WobbleCard({
    children,
    containerClassName,
    className,
}: WobbleCardProps) {
    return (
        <motion.div
            whileHover={{
                scale: 1.02,
                rotate: [0, -1, 1, -1, 0],
                transition: {
                    rotate: {
                        duration: 0.3,
                        ease: 'easeInOut',
                    },
                    scale: {
                        duration: 0.2,
                    },
                },
            }}
            className={cn(
                'relative rounded-2xl overflow-hidden',
                'bg-gradient-to-br from-purple-600/20 to-blue-600/20',
                'backdrop-blur-sm border border-white/10',
                'p-8 group',
                containerClassName
            )}
        >
            <div className={cn('relative z-10', className)}>
                {children}
            </div>

            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>
    );
}
