'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  HeartPulse,
  ClipboardList,
  BookOpen,
  Bot,
  Users,
  CalendarCheck,
  AreaChart,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/expression-analysis', icon: HeartPulse, label: 'Expression Analysis' },
  { href: '/dashboard/screening', icon: ClipboardList, label: 'Screening Tests' },
  { href: '/dashboard/relax', icon: Zap, label: 'Relax & Reset' },
  { href: '/dashboard/resources', icon: BookOpen, label: 'Resource Hub' },
  { href: '/dashboard/chatbot', icon: Bot, label: 'AI Chatbot' },
  { href: '/dashboard/peer-support', icon: Users, label: 'Peer Support' },
  { href: '/dashboard/booking', icon: CalendarCheck, label: 'Counselor Booking' },
  { href: '/dashboard/admin', icon: AreaChart, label: 'Admin Analytics' },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
            tooltip={{ children: item.label, side: 'right' }}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
