'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, MessageSquareWarning, Settings, User as UserIcon, Sparkles } from 'lucide-react';
import { MindBloomLogo } from '@/components/icons';
import { SidebarNav } from '@/components/sidebar-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useMouseTrail } from '@/hooks/use-mouse-trail';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { supabase } from '@/lib/supabaseClient';
import { UserProfileModal } from '@/components/dashboard/user-profile-modal';
import { motion } from 'framer-motion';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();
  const { isEnabled: isTrailEnabled, setIsEnabled: setTrailEnabled } = useMouseTrail();

  // Premium state for hover-controlled sidebar
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center backdrop-blur-xl">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="relative flex min-h-screen w-full overflow-hidden font-sans">
        {/*
          [SPEC] 5. Dashboard Sidebar
          - backdrop-blur-xl
          - bg-white/40 (light) / bg-slate-800/40 (dark)
          - border-r border-white/20
          - shadow-[4px_0_24px_-2px_rgba(0,0,0,0.12)]
        */}
        <Sidebar
          collapsible="icon"
          onMouseEnter={() => !isMobile && setIsHovered(true)}
          onMouseLeave={() => !isMobile && setIsHovered(false)}
          className={`
            transition-all duration-500 ease-in-out border-r border-white/20 shadow-2xl z-50
            backdrop-blur-xl bg-white/40 dark:bg-slate-800/40
            ${isHovered && !isMobile ? 'w-[280px]' : 'w-[75px]'}
          `}
          {...(!isMobile && isHovered ? { 'data-state': 'expanded' } : { 'data-state': 'collapsed' })}
        >
          <SidebarHeader className="p-5 transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
                <MindBloomLogo className="w-8 h-8 text-white shrink-0" />
              </div>
              <div className={`overflow-hidden transition-all duration-500 ${isHovered && !isMobile ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                  MindBloom
                </h1>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 transition-opacity duration-300">
            <SidebarNav />
          </SidebarContent>

          <SidebarFooter className="p-5">
            <Button
              variant="outline"
              className={`
                h-12 border-red-500/50 hover:bg-red-500/10 dark:hover:bg-red-900/20 transition-all duration-300 gap-3 relative overflow-hidden group shadow-lg shadow-red-500/10
                ${isHovered && !isMobile ? 'w-full justify-start rounded-2xl px-5' : 'w-11 h-11 p-0 justify-center rounded-xl'}
              `}
              asChild
            >
              <Link href="#">
                <MessageSquareWarning className="shrink-0 text-red-600 dark:text-red-500 w-5 h-5 transition-transform group-hover:rotate-12 group-hover:scale-110" />
                <span className={`overflow-hidden transition-all duration-500 whitespace-nowrap font-black text-[10px] tracking-[0.2em] text-red-600 dark:text-red-500 ${isHovered && !isMobile ? 'w-auto opacity-100' : 'w-0 opacity-0 invisible'
                  }`}>
                  CRISIS SUPPORT
                </span>
                <span className="absolute inset-0 rounded-xl bg-red-500/20 animate-pulse pointer-events-none group-hover:bg-red-500/30" />
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
              </Link>
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset className="flex-1 flex flex-col min-w-0 transition-all duration-500 bg-transparent">
          <header className={`
            flex h-16 items-center gap-4 border-b border-white/20 backdrop-blur-xl bg-white/30 dark:bg-slate-900/30 px-6 lg:px-8 sticky top-0 z-40
            transition-all duration-500
          `}>
            <SidebarTrigger className="md:hidden hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-xl" />
            <div className="flex-1" />

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-white/40 dark:hover:bg-slate-800/40 relative active:scale-90 transition-all">
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-900" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-11 w-11 rounded-2xl p-0 hover:ring-2 hover:ring-indigo-500/30 transition-all active:scale-95 group overflow-hidden">
                    <Avatar className="h-9 w-9 rounded-xl transition-transform group-hover:scale-105">
                      <AvatarImage src={user.user_metadata?.avatar_url || `https://picsum.photos/seed/${user.id}/100/100`} />
                      <AvatarFallback className="rounded-xl bg-indigo-600 text-white font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 p-2 rounded-3xl shadow-2xl border-white/20 backdrop-blur-3xl bg-white/90 dark:bg-slate-900/95" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-3 mb-1 bg-indigo-500/5 rounded-2xl">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none text-indigo-600 dark:text-indigo-400">{user.user_metadata?.full_name || 'Member'}</p>
                      <p className="text-xs text-muted-foreground truncate italic">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10 my-2" />
                  <DropdownMenuItem className="rounded-xl p-3 focus:bg-indigo-600/10 focus:text-indigo-600 transition-colors cursor-pointer group">
                    <UserIcon className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>View Profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-xl p-3 focus:bg-indigo-600/10 focus:text-indigo-600 cursor-pointer">
                      <Settings className="mr-3 h-4 w-4" />
                      <span>Experience</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="p-2 rounded-2xl shadow-3xl border-white/20 backdrop-blur-3xl bg-white/95 dark:bg-slate-900/95">
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-xl p-3">
                          <div className="flex items-center justify-between w-full gap-5">
                            <Label htmlFor="mouse-trail" className="flex items-center gap-3 cursor-pointer text-xs font-bold uppercase tracking-wider text-indigo-600/70">
                              <Sparkles className="h-4 w-4 transition-pulse" />
                              Mouse Trail
                            </Label>
                            <Switch id="mouse-trail" checked={isTrailEnabled} onCheckedChange={setTrailEnabled} />
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator className="bg-white/10 my-2" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl p-3 text-destructive focus:bg-destructive/10 focus:text-destructive font-bold transition-colors cursor-pointer">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Safe Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-10 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
            <UserProfileModal />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
