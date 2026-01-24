'use client';

import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, Bot, ClipboardList, BookOpen, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { GradientText } from "@/components/ui/gradient-text";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/dashboard/glass-card";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const { user, loading } = useSupabaseUser();
  const [greeting, setGreeting] = useState("");
  const [affirmation, setAffirmation] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Time-based greeting hook
  useEffect(() => {
    const hour = new Date().getHours();
    const timeGreeting =
      hour < 12 ? "Good morning" :
        hour < 17 ? "Good afternoon" :
          "Good evening";
    setGreeting(timeGreeting);
  }, []);

  // Rotating affirmations system
  useEffect(() => {
    const affirmations = [
      "You don't have to do everything today.",
      "Your progress doesn't need to be perfect.",
      "Taking care of yourself is productive.",
      "You're allowed to take things one step at a time.",
      "Your feelings are valid, and you're not alone.",
      "Small steps forward are still steps forward.",
      "It's okay to not be okay sometimes.",
      "You deserve the same compassion you give others.",
      "Your mental health matters more than your to-do list.",
      "You're doing better than you think you are.",
    ];

    const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    setAffirmation(randomAffirmation);
  }, []);

  // Mood options with emojis
  const moods = [
    { id: 'great', emoji: '😊', label: 'Great' },
    { id: 'good', emoji: '🙂', label: 'Good' },
    { id: 'okay', emoji: '😐', label: 'Okay' },
    { id: 'low', emoji: '😔', label: 'Low' },
    { id: 'struggling', emoji: '😢', label: 'Struggling' },
  ];

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
    return <div className="text-slate-700 font-medium">Unauthorized access. Please sign in.</div>;
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

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || "Student";

  return (
    <div className="space-y-10 min-h-screen">
      {/* Welcome Hero Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <GlassCard
          hover={false}
          className="p-10 relative overflow-hidden group transition-all duration-500 hover:scale-[1.005] hover:shadow-2xl ml-6 md:ml-10 lg:ml-12"
        >
          {/* Atmospheric Glow Effects */}
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-purple-400/15 blur-3xl pointer-events-none" />

          {/* Sparkles Background */}
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
            <Sparkles className="h-48 w-48 text-indigo-600" />
          </div>

          <div className="relative z-10 grid lg:grid-cols-[1fr_auto] gap-8 items-start">
            {/* Left Side: Text Content */}
            <div className="space-y-4">
              {/* Time-based Greeting with Staggered Animation */}
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold font-headline leading-tight"
              >
                <GradientText colors={['#6366f1', '#a855f7', '#ec4899']}>
                  {greeting},{" "}
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    {/* {firstName} */}
                    <span className="inline-flex items-center gap-2">
                      {firstName}

                      {/* Exclamation */}
                      <motion.span
                        aria-hidden
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.85, duration: 0.4, ease: "easeOut" }}
                        className="opacity-80"
                      >
                        !
                      </motion.span>

                      {/* Sparkle */}
                      <motion.span
                        aria-hidden
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.0, duration: 0.6 }}
                        className="opacity-70"
                      >
                        ✨
                      </motion.span>
                    </span>


                  </motion.span>
                </GradientText>
              </motion.h1>

              {/* Supportive Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <p className="text-sm text-indigo-700 font-medium inline-block bg-indigo-50 px-4 py-2 rounded-full">
                  You showed up today — that matters 🤍
                </p>
              </motion.div>

              {/* Dynamic Affirmation */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="text-lg md:text-xl text-slate-700 max-w-2xl leading-relaxed font-medium"
              >
                {affirmation}
              </motion.p>

              {/* Original Supportive Quote */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed italic"
              >
                "Your mental health is a priority. Your happiness is an essential. Your self-care is a necessity."
                We're here to walk this journey with you.
              </motion.p>

              {/* Gentle Call-to-Action */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="pt-4"
              >
                <p className="text-sm text-slate-600 mb-3">
                  How are you feeling right now?
                </p>
                <Button
                  asChild
                  variant="ghost"
                  className="text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
                >
                  <Link href="/dashboard/screening" className="flex items-center gap-2">
                    Check in with yourself
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Right Side: Mood Selector + Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col items-center gap-6 lg:min-w-[280px]"
            >
              {/* Calming Illustration */}
              <div className="relative w-full max-w-[240px]">
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-auto drop-shadow-lg"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Peaceful gradient background */}
                  <defs>
                    <linearGradient id="calmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 0.2 }} />
                    </linearGradient>
                  </defs>

                  {/* Base circle */}
                  <circle cx="100" cy="100" r="80" fill="url(#calmGradient)" />

                  {/* Lotus petals - symbol of growth */}
                  <motion.path
                    d="M 100 60 Q 85 70 85 85 Q 85 95 100 100 Q 115 95 115 85 Q 115 70 100 60 Z"
                    fill="#a855f7"
                    opacity="0.6"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M 100 60 Q 115 70 115 85 Q 115 95 100 100 Q 85 95 85 85 Q 85 70 100 60 Z"
                    fill="#ec4899"
                    opacity="0.5"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  />

                  {/* Breathing circle - meditation symbol */}
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="25"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    opacity="0.4"
                    animate={{ r: [25, 35, 25], opacity: [0.4, 0.2, 0.4] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Center dot */}
                  <circle cx="100" cy="100" r="8" fill="#6366f1" opacity="0.8" />
                </svg>
              </div>

              {/* Mood Selector */}
              <div className="w-full bg-white/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/50">
                <p className="text-sm font-medium text-slate-700 mb-3 text-center">
                  Quick mood check-in
                </p>

                <div className="flex justify-center gap-2 flex-wrap">
                  {moods.map((mood, index) => (
                    <motion.button
                      key={mood.id}
                      onClick={() => setSelectedMood(mood.id)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      whileHover={{ scale: 1.15, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        relative flex flex-col items-center gap-1 p-3 rounded-xl
                        transition-all duration-300
                        ${selectedMood === mood.id
                          ? 'bg-indigo-100 ring-2 ring-indigo-500'
                          : 'bg-slate-50 hover:bg-slate-100'
                        }
                      `}
                      aria-label={`Select ${mood.label} mood`}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className="text-xs font-medium text-slate-700">
                        {mood.label}
                      </span>

                      {/* Selection indicator */}
                      <AnimatePresence>
                        {selectedMood === mood.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center"
                          >
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </div>

                {/* Feedback message when mood is selected */}
                <AnimatePresence mode="wait">
                  {selectedMood && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-xs text-center text-slate-600 mt-3"
                    >
                      Thanks for sharing. We're here for you. 💙
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
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
          <GlassCard className="h-full flex flex-col transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-indigo-100 p-4 rounded-2xl">
                  <ClipboardList className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-2xl font-semibold text-slate-800">Screening</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 leading-relaxed">
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
          <GlassCard className="h-full flex flex-col transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-purple-100 p-4 rounded-2xl">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-2xl font-semibold text-slate-800">Explorer</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 leading-relaxed">
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
          <GlassCard className="h-full flex flex-col transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-pink-100 p-4 rounded-2xl">
                  <Bot className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle className="text-2xl font-semibold text-slate-800">AI Support</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 leading-relaxed">
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
          <GlassCard className="h-full flex flex-col highlight-emerald transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-emerald-100 p-4 rounded-2xl">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle className="text-2xl font-semibold text-slate-800">Community</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 leading-relaxed">
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