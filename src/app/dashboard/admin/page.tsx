'use client';

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Users, ClipboardCheck, MessageSquare, CalendarCheck, Sparkles, TrendingUp, Activity } from "lucide-react";
import { ScreeningResultsChart, UserActivityChart } from './charts';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/dashboard/glass-card';
import { GradientText } from '@/components/ui/gradient-text';

const stats = [
  { title: "Total Users", value: "856", icon: Users, trend: "+12%", color: "#6366f1" },
  { title: "Screenings", value: "1,247", icon: ClipboardCheck, trend: "+5%", color: "#ec4899" },
  { title: "Peer Support", value: "128", icon: MessageSquare, trend: "+18%", color: "#10b981" },
  { title: "Counseling", value: "342", icon: CalendarCheck, trend: "+3%", color: "#f59e0b" },
];

export default function AdminPage() {
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
            className="mx-auto bg-gradient-to-br from-slate-700 to-slate-900 p-6 rounded-[2rem] w-fit shadow-2xl shadow-indigo-500/20"
          >
            <Activity className="h-12 w-12 text-white" />
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
            <GradientText colors={['#334155', '#475569', '#64748b']}>
              Platform Analytics
            </GradientText>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Anonymous, aggregated data to help recognize mental health trends and plan <span className="text-indigo-600 dark:text-indigo-400 font-bold">effective interventions</span>.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <GlassCard className="border-white/40 dark:border-slate-700/40">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </CardTitle>
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
                    <stat.icon className="h-4 w-4 text-slate-600" />
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-4xl font-black font-headline tracking-tighter mb-2">
                    {stat.value}
                  </div>
                  <p className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {stat.trend} <span className="text-slate-400 font-medium ml-1">vs last month</span>
                  </p>
                </CardContent>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="border-white/40 dark:border-slate-700/40" hover={false}>
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Clinical Data</span>
                </div>
                <CardTitle className="text-2xl font-black font-headline tracking-tight">Screening Overview</CardTitle>
                <p className="text-sm text-slate-500">Aggregated results for PHQ-9 & GAD-7 assessments.</p>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="h-[300px] w-full mt-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <ScreeningResultsChart />
                </div>
              </CardContent>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="border-white/40 dark:border-slate-700/40" hover={false}>
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-rose-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">User Engagement</span>
                </div>
                <CardTitle className="text-2xl font-black font-headline tracking-tight">Active Engagement</CardTitle>
                <p className="text-sm text-slate-500">User activity trends over the last 6 months.</p>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="h-[300px] w-full mt-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <UserActivityChart />
                </div>
              </CardContent>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
