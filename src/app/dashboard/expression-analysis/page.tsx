'use client';

import { HeartPulse } from "lucide-react";
import { ExpressionAnalyzer } from './expression-analyzer';
import { motion } from 'framer-motion';
import { GradientText } from '@/components/ui/gradient-text';
import { GlassCard } from '@/components/dashboard/glass-card';

export default function ExpressionAnalysisPage() {
  return (
    <div className="min-h-screen py-6 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="mx-auto bg-gradient-to-br from-rose-500 to-orange-500 p-6 rounded-[2rem] w-fit shadow-2xl shadow-rose-500/20"
          >
            <HeartPulse className="h-12 w-12 text-white" />
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
            <GradientText colors={['#f43f5e', '#f97316', '#fbbf24']}>
              AI Expression Analysis
            </GradientText>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Let's check your current stress level. This tool uses on-device AI to analyze facial cues in real-time.
            <span className="block mt-2 font-medium text-indigo-600 dark:text-indigo-400">Your privacy is guaranteed—no data is recorded or stored.</span>
          </p>
        </motion.div>

        <ExpressionAnalyzer />
      </div>
    </div>
  );
}
