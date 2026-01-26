'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MindBloomLogo } from '@/components/icons';
import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  Brain,
  Users,
  Activity,
  Wind,
  BookOpen,
} from "lucide-react";

//import { Galaxy } from '@/components/ui/galaxy';
import { GradientText } from '@/components/ui/gradient-text';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
// import { MovingBorder } from '@/components/ui/moving-border';
import { motion } from 'framer-motion';
// import HeroVideo from '@/components/HeroVideo';
import { FeatureCard } from "@/components/ui/FeatureCard";

export default function HomePage() {
  return (
    <div className="min-h-screen relative bg-[#111A14] overflow-hidden">
      {/* Galaxy Background */}
      {/* <Galaxy
          starSpeed={0.5}
          density={1}
          hueShift={140}
          glowIntensity={0.3}
          saturation={0.8}
          mouseRepulsion={true}
          repulsionStrength={2}
          twinkleIntensity={0.3}
        /> */}

      {/* Navigation */}
      <nav className="border-b border-[#2F3E30]/50 sticky top-0 z-50 bg-[#131C16]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <MindBloomLogo className="h-14 w-14 animate-[pulse_6s_ease-in-out_infinite]" />
            <span className="text-2xl font-headline font-bold text-white">MindBloom</span>
          </div>
          <div className="flex gap-4">
            {/* <Link href="/login">
              <MovingBorder as="button">
                Sign In
              </MovingBorder>
            </Link> */}
            <Link href="/login">
              <button className="px-5 py-2 rounded-lg border border-[#6FAF84]/60 text-[#E6F2EA] hover:bg-[#6FAF84]/10 transition-colors">
                Sign In
              </button>
            </Link>

            <Link href="/register">
              <HoverBorderGradient as="button" className="bg-gradient-to-r from-[#556B2F] to-[#2E8B57] !text-white">
                Get Started
              </HoverBorderGradient>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {/* <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl sm:text-7xl font-headline font-bold mb-6">
            <GradientText colors={['#5227FF', '#FF9FFC', '#B19EEF']}>
              Your Mental Health Companion
            </GradientText>
          </h1>
        </motion.div>

        <motion.p
          className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          MindBloom is a digital psychological intervention system designed to support your mental wellbeing with AI-driven insights, peer support, and personalized resources.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link href="/login">
            <HoverBorderGradient as="button" className="bg-gradient-to-r from-purple-600 to-blue-600 !text-white px-8 py-4">
              <span className="flex items-center gap-2">
                Sign In <ArrowRight className="h-5 w-5" />
              </span>
            </HoverBorderGradient>
          </Link>
          <Link href="/register">
            <MovingBorder as="button">
              Create Account
            </MovingBorder>
          </Link>
        </motion.div>
      </section> */}

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">

        {/* Background Video */}
        <video
          // className="absolute inset-0 w-full h-full object-cover"
          className="absolute inset-0 w-full h-full object-cover contrast-105 saturate-105"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />


        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center text-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* <h1 className="text-5xl sm:text-7xl font-headline font-bold mb-6">
              <GradientText colors={['#C1E1C1', '#F9E4B7', '#D4AF37']}>
                Your Mental Health Companion
              </GradientText>
            </h1> */}
            <h1
              className="text-5xl sm:text-7xl font-headline font-bold mb-6"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.35)' }}
            >
              <GradientText colors={['#C1E1C1', '#F9E4B7', '#D4AF37']}>
                Your Mental Health Companion
              </GradientText>
            </h1>

          </motion.div>

          <motion.p
            className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            MindBloom is a digital psychological intervention system designed to support your mental wellbeing with AI-driven insights, peer support, and personalized resources.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/login">
              <HoverBorderGradient
                as="button"
                className="bg-gradient-to-r from-[#556B2F] to-[#2E8B57] !text-white px-8 py-4"
              >
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="h-5 w-5" />
                </span>
              </HoverBorderGradient>
            </Link>

            {/* <Link href="/register">
              <MovingBorder as="button">
                Create Account
              </MovingBorder>
            </Link> */}
            <Link href="/register">
              <button className="px-8 py-4 rounded-xl bg-[#4F8F5F] text-white hover:bg-[#5FA36C] transition-colors">
                Create Account
              </button>
            </Link>

          </motion.div>

        </div>
      </section>


      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.h2
          className="text-4xl font-headline font-bold text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <GradientText>Features</GradientText>
        </motion.h2>

        {/* <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-[#1A2F21]/40 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <Brain className="h-8 w-8 text-[#8FBC8F] mb-2" />
                <CardTitle className="text-white">AI-Driven Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Get personalized recommendations powered by advanced AI analysis.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[#1A2F21]/40 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <Users className="h-8 w-8 text-[#DEB887] mb-2" />
                <CardTitle className="text-white">Peer Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Connect with others on similar mental health journeys and share experiences.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-[#1A2F21]/40 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <Shield className="h-8 w-8 text-[#66CDAA] mb-2" />
                <CardTitle className="text-white">Privacy First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Your data is encrypted and protected with enterprise-grade security.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div> */}
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="AI-Driven Insights"
            description="Get personalized recommendations powered by advanced AI analysis."
            icon={<Brain className="h-8 w-8 text-[#8FBC8F] mb-2" />}
            delay={0.1}
          />

          <FeatureCard
            title="Peer Support"
            description="Connect with others on similar mental health journeys and share experiences."
            icon={<Users className="h-8 w-8 text-[#DEB887] mb-2" />}
            delay={0.2}
          />

          <FeatureCard
            title="Privacy First"
            description="Your data is encrypted and protected with enterprise-grade security."
            icon={<Shield className="h-8 w-8 text-[#66CDAA] mb-2" />}
            delay={0.3}
          />

          <FeatureCard
            title="Expression Analysis"
            description="Understand emotional patterns through AI-powered expression tracking."
            icon={<Activity className="h-8 w-8 text-[#87CEEB] mb-2" />}
            delay={0.4}
          />

          <FeatureCard
            title="Relax & Reset"
            description="Breathing, focus-dot, and muscle relaxation exercises to calm your mind."
            icon={<Wind className="h-8 w-8 text-[#98FB98] mb-2" />}
            delay={0.5}
          />

          <FeatureCard
            title="Resource Hub"
            description="Curated tools, articles, and exercises to support your wellbeing."
            icon={<BookOpen className="h-8 w-8 text-[#DDA0DD] mb-2" />}
            delay={0.6}
          />
        </div>

      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Card className="border-2 border-[#D4AF37]/30 bg-gradient-to-br from-[#2F3E30]/20 to-blue-900/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-4xl text-white">Ready to Start Your Mental Health Journey?</CardTitle>
              <CardDescription className="text-lg text-gray-300">
                Join thousands of users improving their mental wellbeing with MindBloom.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/register">
                <HoverBorderGradient as="button" className="bg-gradient-to-r from-[#556B2F] to-[#2E8B57] !text-white px-8 py-4">
                  <span className="flex items-center gap-2">
                    Sign Up Now <ArrowRight className="h-5 w-5" />
                  </span>
                </HoverBorderGradient>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      {/* <footer className="border-t border-white/10 mt-20 relative z-10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-400">
          <p>&copy; 2026 MindBloom. All rights reserved.</p>
        </div>
      </footer> */}
      {/* Footer */}
      <footer className="border-t border-white/10 mt-20 relative z-10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Footer Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-6">
            {[
              { label: "About Us", href: "/about" },
              { label: "Contact Us", href: "/contact" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Help / Support", href: "/support" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group relative text-sm text-gray-400 transition-colors duration-300 hover:text-white"
              >
                {link.label}

                {/* subtle underline animation */}
                <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-center text-xs text-gray-500">
            © 2026 MindBloom. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}