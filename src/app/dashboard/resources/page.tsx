'use client';

import { useState } from 'react';
import { mentalHealthData, Resource } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { BookOpen, Gamepad2, Headphones, Newspaper, PlaySquare, BookHeart, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/dashboard/glass-card';
import { GradientText } from '@/components/ui/gradient-text';
import { cn } from '@/lib/utils';

const categories = ['All', 'Depression', 'Anxiety', 'Stress', 'Sleep', 'Games', 'Crisis'];

const typeIcons = {
  article: <Newspaper className="h-4 w-4" />,
  video: <PlaySquare className="h-4 w-4" />,
  audio: <Headphones className="h-4 w-4" />,
  guide: <BookHeart className="h-4 w-4" />,
  game: <Gamepad2 className="h-4 w-4" />,
};

const categoryColors = {
  All: "indigo",
  Depression: "purple",
  Anxiety: "blue",
  Stress: "rose",
  Sleep: "emerald",
  Games: "amber",
  Crisis: "red",
};

export default function ResourcesPage() {
  const [filter, setFilter] = useState('All');

  const filteredResources = filter === 'All'
    ? mentalHealthData.resources
    : mentalHealthData.resources.filter(r => r.category === filter);

  const getImage = (resource: Resource) => {
    const img = PlaceHolderImages.find(p => p.id === resource.image);
    return img || PlaceHolderImages[0];
  };

  return (
    <div className="min-h-screen py-6 px-4 md:px-8 space-y-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="mx-auto bg-gradient-to-br from-indigo-500 to-emerald-600 p-6 rounded-[2rem] w-fit shadow-2xl shadow-indigo-500/20"
          >
            <BookOpen className="h-12 w-12 text-white" />
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
            <GradientText colors={['#6366f1', '#10b981', '#3b82f6']}>
              Resource Hub
            </GradientText>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Explore a curated collection of videos, articles, relaxation audios, and games to support your mental wellness journey.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center flex-wrap gap-3"
        >
          {categories.map((category, idx) => {
            const isActive = filter === category;
            return (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border-2",
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25 scale-105"
                    : "bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-white/20 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-700/60"
                )}
              >
                {category}
              </button>
            );
          })}
        </motion.div>

        {/* Resources Grid */}
        <motion.div
          layout
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredResources.map((resource, idx) => {
              const placeholder = getImage(resource);
              return (
                <motion.div
                  layout
                  key={resource.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <GlassCard className="h-full group flex flex-col border-white/40 dark:border-slate-700/40">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={placeholder.imageUrl}
                        alt={resource.title}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        data-ai-hint={placeholder.imageHint}
                      />
                      <div className="absolute top-3 left-3">
                        <div className="px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                          {resource.category}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow space-y-3">
                      <h3 className="text-lg font-bold font-headline leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                        {resource.description}
                      </p>
                    </div>

                    <div className="p-6 mt-auto pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 text-xs font-bold text-slate-600 dark:text-slate-400">
                          {typeIcons[resource.type]}
                          <span className="capitalize">{resource.type}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group/btn rounded-xl">
                          Explore <Sparkles className="ml-2 h-3.5 w-3.5 group-hover/btn:scale-125 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {filteredResources.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="bg-slate-100 dark:bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No resources found</h3>
            <p className="text-slate-500">Try selecting a different category or search term.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
