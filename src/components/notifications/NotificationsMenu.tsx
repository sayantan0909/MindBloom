'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, MessageCircle, Users, CheckCircle, Info, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

/* ---------------- TYPES ---------------- */

type NotificationType = 'user_waiting' | 'peer_joined' | 'new_message';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    is_read: boolean;
    link: string;
    created_at?: string;
}

interface NotificationsMenuProps {
    userId: string | null; // auth.users.id
}

/* ---------------- ICON MAPPER ---------------- */

const getIcon = (type: NotificationType) => {
    switch (type) {
        case 'user_waiting':
            return <Users className="h-4 w-4 text-emerald-500" />;
        case 'peer_joined':
            return <CheckCircle className="h-4 w-4 text-blue-500" />;
        case 'new_message':
            return <MessageCircle className="h-4 w-4 text-indigo-500" />;
        default:
            return <Info className="h-4 w-4 text-slate-500" />;
    }
};

/* ---------------- COMPONENT ---------------- */

export function NotificationsMenu({ userId }: NotificationsMenuProps) {
    const supabase = createClient();
    const router = useRouter();

    const [profileId, setProfileId] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    /* ---------------- FETCH PROFILE ID ---------------- */

    useEffect(() => {
        if (!userId) return;

        const fetchProfileId = async () => {
            // Note: In our system profile.id IS the auth_user_id, but checking the profiles table ensures the profile exists
            const { data, error } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', userId) // Assuming id is the primary key and matches auth.uid
                .single<{ id: string }>();

            if (error || !data) {
                console.error('❌ Failed to fetch profile:', error);
                return;
            }

            // console.log('✅ PROFILE ID:', data.id);
            setProfileId(data.id);
        };

        fetchProfileId();
    }, [userId, supabase]);

    /* ---------------- FETCH + REALTIME NOTIFICATIONS ---------------- */

    useEffect(() => {
        if (!profileId) return;

        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', profileId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) {
                console.error('❌ Failed to fetch notifications:', error);
                return;
            }

            if (data) {
                const notifs = data as Notification[];
                setNotifications(notifs);
                setUnreadCount(notifs.filter(n => !n.is_read).length);
            }
        };

        fetchNotifications();

        const channel = supabase
            .channel('notifications-bell')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${profileId}`,
                },
                payload => {
                    const newNotif = payload.new as Notification;
                    setNotifications(prev => [newNotif, ...prev]);

                    if (!newNotif.is_read) {
                        setUnreadCount(prev => prev + 1);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profileId, supabase]);

    /* ---------------- CLICK HANDLERS ---------------- */

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notification.id ? { ...n, is_read: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));

            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notification.id);
        }

        if (notification.link) {
            router.push(notification.link);
        }
    };

    const handleClearNotification = async (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation(); // Prevent navigation

        // Optimistic UI update
        setNotifications(prev =>
            prev.map(n =>
                n.id === notificationId ? { ...n, is_read: true } : n
            )
        );

        // Update unread count
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        // Update in database
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
    };

    const handleClearAll = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);

        if (unreadIds.length === 0) return;

        // Optimistic UI update
        setNotifications(prev =>
            prev.map(n => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);

        // Update all unread in database
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds);
    };

    /* ---------------- UI ---------------- */

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-2xl">
                    <Bell className="h-5 w-5 text-slate-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-80 p-0 rounded-2xl bg-white/90 backdrop-blur-3xl border-indigo-100 shadow-xl"
            >
                <div className="p-4 border-b bg-indigo-50/50 flex justify-between items-center">
                    <h4 className="font-semibold text-indigo-900">Notifications</h4>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <>
                                <Badge className="bg-indigo-100 text-indigo-600">
                                    {unreadCount} New
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearAll}
                                    className="h-7 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100"
                                >
                                    Clear All
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map(n => (
                            <DropdownMenuItem
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={`flex gap-3 p-4 cursor-pointer group ${!n.is_read ? 'bg-indigo-50/30' : ''
                                    }`}
                            >
                                {getIcon(n.type)}
                                <div className="flex-1">
                                    <p className={`text-sm ${!n.is_read ? 'font-semibold' : ''}`}>
                                        {n.title}
                                    </p>
                                    <p className="text-xs text-slate-500">{n.message}</p>
                                </div>
                                <button
                                    onClick={(e) => handleClearNotification(e, n.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded-full"
                                    aria-label="Clear notification"
                                >
                                    <X className="h-3 w-3 text-slate-400" />
                                </button>
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
