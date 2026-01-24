'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export const GlassCard = ({ children, className = "", hover = true, onClick }: GlassCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={hover ? {
                y: -4,
                transition: { duration: 0.2 }
            } : {}}
            onClick={onClick}
            className={`
                backdrop-blur-xl
                bg-white/70
                border border-white/80
                rounded-2xl
                shadow-[0_8px_32px_rgba(156,100,250,0.12)]
                hover:shadow-[0_12px_48px_0_rgba(31,38,135,0.25)]
                transition-all duration-300
                overflow-hidden
                focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-4
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
            style={{
                willChange: hover ? 'transform' : 'auto'
            }}
        >
            {children}
        </motion.div>
    );
};
