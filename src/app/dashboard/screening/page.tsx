"use client";

import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";
import { ScreeningTest } from "./screening-test";

export default function ScreeningPage() {
  return (
    <div className="min-h-screen py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 mb-12"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-[2rem] w-fit shadow-2xl shadow-indigo-500/20"
          >
            <ClipboardList className="h-12 w-12 text-white" />
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
            <GradientText colors={["#7c3aed", "#6366f1", "#ec4899"]}>
              Mental Health Screening
            </GradientText>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            These brief, confidential screenings are tools to help you understand
            your emotional well-being. They are not a diagnosis but can be a helpful
            first step.
          </p>
        </motion.div>

        <ScreeningTest />
      </div>
    </div>
  );
}
