'use client'

import { motion } from 'framer-motion'

export function LotusIllustration() {
    return (
        <svg
            viewBox="0 0 200 200"
            className="w-full h-auto drop-shadow-lg"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
        >
            {/* Gradient Definition */}
            <defs>
                <linearGradient id="calmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0.2} />
                </linearGradient>
            </defs>

            {/* Soft Background Circle */}
            <circle cx="100" cy="100" r="80" fill="url(#calmGradient)" />

            {/* Lotus Petal – Left */}
            <motion.path
                d="
          M 100 60
          Q 85 70 85 85
          Q 85 95 100 100
          Q 115 95 115 85
          Q 115 70 100 60
          Z
        "
                fill="#a855f7"
                opacity={0.6}
                animate={{
                    scale: [1, 1.03, 1],
                    y: [0, -2, 0],
                    opacity: [0.55, 0.65, 0.55],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{
                    transformBox: 'fill-box',
                    originX: 0.5,
                    originY: 0.5,
                }}
            />

            {/* Lotus Petal – Right (offset for depth) */}
            <motion.path
                d="
          M 100 60
          Q 115 70 115 85
          Q 115 95 100 100
          Q 85 95 85 85
          Q 85 70 100 60
          Z
        "
                fill="#ec4899"
                opacity={0.5}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                }}
                style={{
                    transformBox: 'fill-box',
                    originX: 0.5,
                    originY: 0.5,
                }}
            />

            {/* Breathing Ring */}
            <motion.circle
                cx="100"
                cy="100"
                r="25"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                opacity={0.4}
                animate={{
                    r: [25, 35, 25],
                    opacity: [0.4, 0.2, 0.4],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                style={{
                    transformBox: 'fill-box',
                    originX: 0.5,
                    originY: 0.5,
                }}
            />

            {/* Center Focus Dot */}
            <circle cx="100" cy="100" r="8" fill="#6366f1" opacity={0.8} />
        </svg>
    )
}
