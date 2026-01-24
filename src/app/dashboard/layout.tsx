'use client';

import { Button } from '@/components/ui/button';
import {
  Bell,
  LogOut,
  Home,
  Smile,
  ClipboardList,
  Wind,
  BookOpen,
  Sparkles,
  MessageCircle,
  Calendar,
  Settings,
} from 'lucide-react';
import { MindBloomLogo } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { supabase } from '@/lib/supabaseClient';
import { UserProfileModal } from '@/components/dashboard/user-profile-modal';
import { FloatingDock } from '@/components/ui/floating-dock';
import { motion } from 'framer-motion';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();

  /* ---------- Dock Visibility State ---------- */
  const [dockVisible, setDockVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  /* ---------- Auth Guard ---------- */
  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  /* ---------- Scroll Logic for Dock ---------- */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // scrolling down
        setDockVisible(false);
      } else {
        // scrolling up
        setDockVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  /* ---------- Logout ---------- */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  /* ---------- Floating Dock Items ---------- */
  const dockItems = [
    { title: 'Dashboard', icon: <Home className="w-full h-full text-indigo-600" />, href: '/dashboard' },
    { title: 'Expression Analysis', icon: <Smile className="w-full h-full text-purple-600" />, href: '/dashboard/expression-analysis' },
    { title: 'Screening Test', icon: <ClipboardList className="w-full h-full text-pink-600" />, href: '/dashboard/screening' },
    { title: 'Relax & Reset', icon: <Wind className="w-full h-full text-cyan-600" />, href: '/dashboard/relax' },
    { title: 'Resource Hub', icon: <BookOpen className="w-full h-full text-amber-600" />, href: '/dashboard/resources' },
    { title: 'AI Chatbot', icon: <Sparkles className="w-full h-full text-violet-600" />, href: '/dashboard/chatbot' },
    { title: 'Peer Support', icon: <MessageCircle className="w-full h-full text-blue-600" />, href: '/dashboard/peer-support' },
    { title: 'Counsellor Booking', icon: <Calendar className="w-full h-full text-emerald-600" />, href: '/dashboard/booking' },
    { title: 'Settings', icon: <Settings className="w-full h-full text-slate-600" />, href: '/dashboard/settings' },
  ];

  /* ---------- Loader ---------- */
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center backdrop-blur-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden font-sans bg-gradient-to-br from-indigo-50/30 via-purple-50/30 to-pink-50/30">

      {/* FLOATING DOCK — DESKTOP ONLY */}
      <motion.div
        className="hidden md:block fixed left-0 top-24 z-50 w-20"
        onMouseEnter={() => setDockVisible(true)}
      >
        <motion.div
          className="ml-6"
          initial={{ opacity: 1, x: 0 }}
          animate={{
            opacity: dockVisible ? 1 : 0,
            x: dockVisible ? 0 : -40,
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <FloatingDock
            items={dockItems}
            desktopClassName="
              flex-col gap-4 py-5 px-3 rounded-[28px]
              bg-[rgba(255,255,255,0.65)]
              backdrop-blur-[20px]
              border border-white/40
              shadow-[0_20px_60px_rgba(120,90,255,0.25)]
              opacity-90 hover:opacity-100
              transition-all duration-300
            "
          />
        </motion.div>
      </motion.div>

      {/* CONTENT */}
      <div className="flex flex-col min-h-screen w-full">

        {/* HEADER */}
        <header className="sticky top-0 z-40 h-16 px-6 flex items-center backdrop-blur-xl bg-white/60 border-b border-indigo-100/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
              <MindBloomLogo className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              MindBloom
            </h1>
          </div>

          <div className="flex-1" />

          <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-indigo-50">
            <Bell className="h-5 w-5 text-slate-600" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 w-11 rounded-2xl p-0 hover:bg-indigo-50">
                <Avatar className="h-9 w-9 rounded-xl">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-indigo-600 text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 p-2 rounded-3xl backdrop-blur-3xl bg-white/90 border-indigo-100">
              <DropdownMenuItem
                onClick={handleLogout}
                className="font-bold text-destructive rounded-2xl cursor-pointer"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Safe Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 pl-20 md:pl-24 p-4 sm:p-6 lg:p-10">
          {children}
          <UserProfileModal />
        </main>

      </div>
    </div>
  );
}
