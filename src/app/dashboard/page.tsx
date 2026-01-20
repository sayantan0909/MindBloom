'use client';

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Bot, ClipboardList, BookOpen } from "lucide-react";
import Link from "next/link";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { WobbleCard } from "@/components/ui/wobble-card";
import { GradientText } from "@/components/ui/gradient-text";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user, loading } = useSupabaseUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950">
        <motion.div
          className="w-16 h-16 border-4 border-purple-500 dark:border-purple-400 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!user) {
    return <div className="dark:text-white">Unauthorized</div>;
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950 min-h-screen p-6 lg:p-8 transition-colors duration-200">
      {/* Welcome Card */}
      <motion.div
        className="rounded-3xl bg-gradient-to-r from-purple-100/90 via-blue-100/90 to-cyan-100/90 dark:from-purple-900/40 dark:via-blue-900/40 dark:to-cyan-900/40 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 p-8 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          <GradientText colors={['#7c3aed', '#ec4899', '#3b82f6']}>
            Welcome back, {user?.user_metadata?.name || user?.email || "Student"}
          </GradientText>
        </h1>

        <p className="text-lg text-gray-700 dark:text-gray-200">
          Remember, taking care of your mind is a journey, not a destination. We're here to support you every step of the way.
        </p>
      </motion.div>

      {/* Dashboard Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <WobbleCard containerClassName="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 min-h-[300px] border border-purple-200 dark:border-purple-700/50 shadow-xl hover:shadow-2xl backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-purple-300/60 dark:bg-purple-700 p-3 rounded-full">
                  <ClipboardList className="h-6 w-6 text-purple-700 dark:text-purple-200" />
                </div>
                <CardTitle className="font-headline text-2xl text-purple-900 dark:text-purple-100">Mental Health Screening</CardTitle>
              </div>
              <CardDescription className="pt-2 text-purple-800 dark:text-purple-200">
                Check in with yourself. Take a confidential screening test for anxiety or depression.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end mt-4">
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white shadow-lg">
                <Link href="/dashboard/screening">
                  Start a Screening <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </WobbleCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <WobbleCard containerClassName="bg-gradient-to-br from-blue-100 to-cyan-200 dark:from-blue-900/50 dark:to-cyan-800/50 min-h-[300px] border border-blue-200 dark:border-blue-700/50 shadow-xl hover:shadow-2xl backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-blue-300/60 dark:bg-blue-700 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-blue-700 dark:text-blue-200" />
                </div>
                <CardTitle className="font-headline text-2xl text-blue-900 dark:text-blue-100">Resource Hub</CardTitle>
              </div>
              <CardDescription className="pt-2 text-blue-800 dark:text-blue-200">
                Explore a curated library of articles, videos, audios, and games for your well-being.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end mt-4">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-lg">
                <Link href="/dashboard/resources">
                  Explore Resources <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </WobbleCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <WobbleCard containerClassName="bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900/50 dark:to-rose-800/50 min-h-[300px] border border-pink-200 dark:border-pink-700/50 shadow-xl hover:shadow-2xl backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-pink-300/60 dark:bg-pink-700 p-3 rounded-full">
                  <Bot className="h-6 w-6 text-pink-700 dark:text-pink-200" />
                </div>
                <CardTitle className="font-headline text-2xl text-pink-900 dark:text-pink-100">AI-Powered Chatbot</CardTitle>
              </div>
              <CardDescription className="pt-2 text-pink-800 dark:text-pink-200">
                Need to talk? Our friendly chatbot is here to listen and provide support 24/7.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end mt-4">
              <Button asChild className="w-full bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 text-white shadow-lg">
                <Link href="/dashboard/chatbot">
                  Start Chatting <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </WobbleCard>
        </motion.div>
      </div>
    </div>
  );
}
