'use client'

import Link from 'next/link';
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MOODS = [
    { key: 'great', label: 'Great', emoji: '😊', message: 'Love that energy ✨ Keep riding this wave.' },
    { key: 'good', label: 'Good', emoji: '🙂', message: 'Nice. You’re doing better than you think.' },
    { key: 'okay', label: 'Okay', emoji: '😐', message: 'It’s okay to be okay. No pressure.' },
    { key: 'low', label: 'Low', emoji: '😔', message: 'Rough days happen. Be gentle with yourself.' },
    { key: 'struggling', label: 'Struggling', emoji: '😢', message: 'You don’t have to go through this alone 💜' },
]

export function QuickMoodCheckIn() {
    const [selectedMood, setSelectedMood] = useState<null | typeof MOODS[number]>(null)

    return (
        <div className="rounded-3xl bg-white/70 backdrop-blur-xl p-6 shadow-lg max-w-sm">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">
                Quick mood check-in
            </h3>

            {/* Mood buttons */}
            <div className="flex justify-between">
                {MOODS.map((mood) => (
                    <button
                        key={mood.key}
                        onClick={() => setSelectedMood(mood)}
                        className="flex flex-col items-center gap-1 hover:scale-110 transition"
                    >
                        <span className="text-2xl">{mood.emoji}</span>
                        <span className="text-xs text-slate-600">{mood.label}</span>
                    </button>
                ))}
            </div>

            {/* Animated response */}
            <AnimatePresence>
                {selectedMood && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="mt-6 text-center"
                    >
                        <motion.div
                            initial={{ y: 0 }}
                            animate={{ y: -20 }}
                            transition={{ duration: 1.2 }}
                            className="text-4xl mb-2"
                        >
                            {selectedMood.emoji}
                        </motion.div>

                        <p className="text-slate-700 font-medium">
                            {selectedMood.message}
                        </p>

                        {selectedMood.key === 'struggling' && (
                            <Link
                                href="/dashboard/peer-support"
                                className="mt-4 inline-flex items-center justify-center text-indigo-600 font-semibold hover:underline"
                            >
                                Talk to someone →
                            </Link>
                        )}

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
