'use client';

import { CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/dashboard/glass-card";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface StressGameCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function StressGameCard({ title, description, icon: Icon, onClick }: StressGameCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <GlassCard className="h-full flex flex-col group overflow-hidden border-white/40 dark:border-slate-700/40">
        <div className="p-8 flex-grow space-y-6">
          <div className="flex items-center justify-between">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-2xl shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-500">
              <Icon className="h-7 w-7 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle className="font-headline text-2xl font-bold tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {title}
            </CardTitle>
            <CardDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              {description}
            </CardDescription>
          </div>
        </div>

        <div className="px-8 pb-8">
          <Button
            onClick={onClick}
            className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all group/btn flex items-center justify-center gap-2"
          >
            Begin Exercise <Sparkles className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
