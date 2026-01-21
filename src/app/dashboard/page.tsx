'use client';

import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, Bot, ClipboardList, BookOpen, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { GradientText } from "@/components/ui/gradient-text";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/dashboard/glass-card";

export default function DashboardPage() {
  const { user, loading } = useSupabaseUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!user) {
    return <div className="text-slate-600 dark:text-slate-300 font-medium">Unauthorized access. Please sign in.</div>;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10 min-h-screen">
      {/* Welcome Hero Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <GlassCard hover={false} className="p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles className="h-48 w-48 text-indigo-600" />
          </div>
          <div className="relative z-10 space-y-4">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold font-headline leading-tight"
            >
              <GradientText colors={['#6366f1', '#a855f7', '#ec4899']}>
                Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || "Student"}
              </GradientText>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed"
            >
              "Your mental health is a priority. Your happiness is an essential. Your self-care is a necessity."
              We're here to walk this journey with you.
            </motion.p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Feature Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4"
      >
        {/* Screening Card */}
        <motion.div variants={item}>
          <GlassCard className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-2xl">
                  <ClipboardList className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Screening</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                Take a confidential check-in for anxiety or depression with immediate results.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-4">
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 text-md font-bold shadow-lg shadow-indigo-600/20 group">
                <Link href="/dashboard/screening" className="flex items-center justify-center gap-2">
                  Check In <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </GlassCard>
        </motion.div>

        {/* Resource Hub Card */}
        <motion.div variants={item}>
          <GlassCard className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-purple-100 dark:bg-purple-900/50 p-4 rounded-2xl">
                  <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Explorer</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                A library of high-fidelity articles, videos, and audios tailored for your growth.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-4">
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 text-md font-bold shadow-lg shadow-purple-600/20 group">
                <Link href="/dashboard/resources" className="flex items-center justify-center gap-2">
                  Learn More <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </GlassCard>
        </motion.div>

        {/* AI Companion Card */}
        <motion.div variants={item}>
          <GlassCard className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-pink-100 dark:bg-pink-900/50 p-4 rounded-2xl">
                  <Bot className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-100">AI Support</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                Always available, empathetic AI listens and provides support whenever you need.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-4">
              <Button asChild className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl h-12 text-md font-bold shadow-lg shadow-pink-600/20 group">
                <Link href="/dashboard/chatbot" className="flex items-center justify-center gap-2">
                  Talk to AI <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </GlassCard>
        </motion.div>

        {/* Peer Support Card */}
        <motion.div variants={item}>
          <GlassCard className="h-full flex flex-col highlight-emerald">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-2xl">
                  <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Community</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                Join anonymous safe-spaces to connect with other students on similar journeys.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-4">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 text-md font-bold shadow-lg shadow-emerald-600/20 group">
                <Link href="/dashboard/peer-support" className="flex items-center justify-center gap-2">
                  Find Peers <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
