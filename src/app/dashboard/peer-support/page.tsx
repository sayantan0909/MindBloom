'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Brain,
  BookOpen,
  Users,
  Heart,
  Moon,
  Sparkles,
  Send,
  ArrowLeft,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { SUPPORT_ROOMS } from '@/types/peer-support';
import type { PeerSupportMessage } from '@/types/peer-support';
import { motion, AnimatePresence } from 'framer-motion';
import { GradientText } from '@/components/ui/gradient-text';
import { GlassCard } from '@/components/dashboard/glass-card';

const supabase: any = createClient();

type ViewType = 'home' | 'room-select' | 'matching' | 'ai-chat' | 'live-chat';
type SupportRoom = typeof SUPPORT_ROOMS[number];

export default function PeerSupportPage() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedRoom, setSelectedRoom] = useState<SupportRoom | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<PeerSupportMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAiMode, setIsAiMode] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [showPeerNotification, setShowPeerNotification] = useState(false);
  const [waitingChats, setWaitingChats] = useState<any[]>([]);
  const [isSupportMode, setIsSupportMode] = useState(false);
  const [isLoadingWaiting, setIsLoadingWaiting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [sessionTime, setSessionTime] = useState(1500);
  const [firstMessage, setFirstMessage] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      console.log('Fetching Supabase user...');
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        console.log('Supabase user loaded:', user?.id);
        setUserId(user?.id || null);
      }
    };
    getUser();
  }, []);

  // Fetch waiting chats for "Support Others" dashboard
  useEffect(() => {
    const fetchWaiting = async () => {
      if (currentView !== 'home' || !userId) return;

      setIsLoadingWaiting(true);
      console.log('--- Fetching Waiting Peers ---', { userId });

      try {
        const { data, error } = await supabase
          .from('peer_support_chats')
          .select('*')
          .eq('status', 'waiting')
          .neq('initiator_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching waiting chats:', error);
        } else {
          console.log('Successfully fetched waiting chats:', data?.length);
          setWaitingChats(data || []);
        }
      } catch (err) {
        console.error('Unexpected error in fetchWaiting:', err);
      } finally {
        setIsLoadingWaiting(false);
      }
    };

    if (currentView === 'home' && userId) {
      fetchWaiting();

      // Subscribe to new waiting chats
      const channel = supabase
        .channel('waiting-chats-home')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'peer_support_chats'
        }, (payload: any) => {
          console.log('Realtime update for waiting chats:', payload.eventType);
          fetchWaiting();
        })
        .subscribe((status: string) => {
          console.log('Realtime status (home):', status);
        });

      return () => {
        console.log('Cleaning up home channel');
        supabase.removeChannel(channel);
      };
    }
  }, [currentView, userId]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatHistory, isTyping]);

  // Timer for live chat
  useEffect(() => {
    if (currentView === 'live-chat' && sessionTime > 0) {
      const timer = setInterval(() => {
        setSessionTime(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentView, sessionTime]);

  // Real-time message & typing subscription
  useEffect(() => {
    if (!chatId || !userId) return;

    const channel = supabase.channel(`chat:${chatId}`);

    // Listen for messages
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'peer_support_messages',
        filter: `chat_id=eq.${chatId}`
      },
      (payload: { new: PeerSupportMessage }) => {
        const newMessage = payload.new;
        if (newMessage.sender_id !== userId) {
          // If we're in AI mode but receive a message from a real user, it's a peer!
          if (isAiMode && newMessage.sender_type === 'user') {
            setShowPeerNotification(true);
          }
          setMessages(prev => [...prev, newMessage]);
        }
      }
    );

    // Listen for typing events (Broadcast)
    channel.on('broadcast', { event: 'typing' }, ({ payload }: { payload: any }) => {
      if (payload.userId !== userId) {
        setIsTyping(payload.isTyping);
      }
    });

    // Background matching: Listen for chat status changes
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'peer_support_chats',
        filter: `id=eq.${chatId}`
      },
      (payload: any) => {
        if (payload.new.status === 'active' && isAiMode && payload.new.recipient_id !== userId) {
          setShowPeerNotification(true);
        }
      }
    );

    // Live matching: Listen for chat status changes if we are waiting
    if (currentView === 'matching' && chatId) {
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'peer_support_chats',
          filter: `id=eq.${chatId}`
        },
        (payload: any) => {
          if (payload.new.status === 'active') {
            setCurrentView('live-chat');
            setIsAiMode(false);
            // Fetch messages to get the join message
            supabase.from('peer_support_messages')
              .select('*')
              .eq('chat_id', chatId)
              .order('created_at', { ascending: true })
              .then(({ data }: any) => {
                setMessages(data || []);
              });
          }
        }
      );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, userId, isAiMode, currentView]);

  // Handle typing indicator sends
  const handleInputChange = (val: string) => {
    setInputValue(val);

    if (chatId) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      const channel = supabase.channel(`chat:${chatId}`);
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping: true },
      });

      typingTimeoutRef.current = setTimeout(() => {
        channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId, isTyping: false },
        });
      }, 3000);
    }
  };

  const switchToPeer = async () => {
    setIsAiMode(false);
    setShowPeerNotification(false);
    setCurrentView('live-chat');

    // Load all messages for this chat (including AI ones)
    const { data: msgs } = await supabase
      .from('peer_support_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    setMessages(msgs || []);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIconComponent = (roomId: string) => {
    if (roomId.includes('academic')) return BookOpen;
    if (roomId.includes('anxiety')) return Brain;
    if (roomId.includes('loneliness')) return Heart;
    if (roomId.includes('sleep')) return Moon;
    return Sparkles;
  };

  const handleRoomSelect = async (room: SupportRoom) => {
    setSelectedRoom(room);
    setCurrentView('matching');

    try {
      console.log('--- Starting Match Request ---', { room_id: room.id, first_message: firstMessage });
      // Try to match with a peer
      const response = await fetch('/api/peer-support/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: room.id,
          first_message: firstMessage.trim() || null
        })
      });

      const data = await response.json();
      console.log('Match response:', data);

      if (data.matched) {
        // Peer found!
        setChatId(data.chat_id);
        setIsAiMode(false);

        // Load existing messages
        const { data: msgs } = await supabase
          .from('peer_support_messages')
          .select('*')
          .eq('chat_id', data.chat_id)
          .order('created_at', { ascending: true });

        setMessages(msgs || []);
        setCurrentView('live-chat');
      } else {
        // No peer available - wait 3 seconds then offer AI
        setChatId(data.chat_id); // The waiting chat ID

        setTimeout(async () => {
          // Double check if we were matched in the background first
          const { data: latestChat } = await supabase
            .from('peer_support_chats')
            .select('status')
            .eq('id', data.chat_id)
            .single();

          if (latestChat?.status === 'active') {
            // Already matched! The listener will catch it, or we switch now
            return;
          }

          setCurrentView('ai-chat');
          setIsAiMode(true);

          const welcomeMsg = "No peers are available right now, but I'm here to listen. What's on your mind?";
          setChatHistory([{
            id: 'welcome',
            sender: 'ai',
            content: welcomeMsg
          }]);

          // Persist welcome message to DB
          if (data.chat_id) {
            console.log('Persisting welcome message...', data.chat_id);
            const { error: welcomeError } = await supabase.from('peer_support_messages').insert({
              chat_id: data.chat_id,
              sender_type: 'ai',
              content: welcomeMsg
            });
            if (welcomeError) console.error('Error persisting welcome message:', welcomeError);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Matching error:', error);
      setCurrentView('ai-chat');
      setIsAiMode(true);
      setChatHistory([{
        id: 'welcome',
        sender: 'ai',
        content: "I'm here to listen. What's on your mind?"
      }]);
    }
  };

  const handleJoinChat = async (chat: any) => {
    setIsJoining(true);
    try {
      console.log('--- Attempting to Join Chat ---', chat.id);
      // Use the match API for race-safe joining
      const response = await fetch('/api/peer-support/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: chat.room_id,
          target_chat_id: chat.id
        })
      });

      const data = await response.json();
      console.log('Join response:', data);

      if (response.status === 410) {
        alert('This peer was already matched or the request expired.');
        return;
      }

      if (data.matched) {
        setChatId(data.chat_id);
        setIsAiMode(false);
        setSelectedRoom(SUPPORT_ROOMS.find(r => r.id === chat.room_id) || null);

        // Load existing messages
        const { data: msgs } = await supabase
          .from('peer_support_messages')
          .select('*')
          .eq('chat_id', data.chat_id)
          .order('created_at', { ascending: true });

        setMessages(msgs || []);
        setCurrentView('live-chat');
      } else {
        alert(data.error || 'Failed to join chat.');
      }
    } catch (err) {
      console.error('Join error:', err);
      alert('Failed to join chat. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Local update for immediate feedback
    const userMsgContent = inputValue;
    const localUserMsg = { id: Date.now().toString(), sender: 'user', sender_id: userId, content: userMsgContent, created_at: new Date().toISOString() };

    if (isAiMode) {
      setChatHistory(prev => [...prev, localUserMsg]);
      setInputValue('');
      setIsTyping(true);

      // Persist user message to DB
      if (chatId) {
        console.log('Persisting AI message to DB...', { chatId, userId });
        const { error: msgInsertError } = await supabase.from('peer_support_messages').insert({
          chat_id: chatId,
          sender_id: userId,
          sender_type: 'user',
          content: userMsgContent
        });
        if (msgInsertError) console.error('Error persisting user message:', msgInsertError);
      }

      try {
        const response = await fetch('/api/peer-support/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMsgContent,
            room_id: selectedRoom?.id,
            history: chatHistory
          })
        });

        const data = await response.json();
        setIsTyping(false);

        const aiMsgContent = data.response || data.fallback;
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: aiMsgContent
        };
        setChatHistory(prev => [...prev, aiMessage]);

        // Persist AI response to DB
        if (chatId) {
          await supabase.from('peer_support_messages').insert({
            chat_id: chatId,
            sender_type: 'ai',
            content: aiMsgContent
          });
        }
      } catch (error) {
        setIsTyping(false);
        setChatHistory(prev => [...prev, { id: 'err', sender: 'ai', content: "I'm still here." }]);
      }
    } else {
      if (!chatId || !userId) return;
      setInputValue('');
      setMessages(prev => [...prev, localUserMsg as any]);

      const { data: newMessage, error } = await supabase
        .from('peer_support_messages')
        .insert({
          chat_id: chatId,
          sender_id: userId,
          sender_type: 'user',
          content: userMsgContent
        })
        .select()
        .single();

      if (error) {
        console.error('Send error:', error);
      }
    }
  };

  const handleEndSession = async () => {
    if (confirm('Are you sure you want to end this session?')) {
      if (chatId) {
        await supabase.from('peer_support_chats').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', chatId);
      }
      setCurrentView('home');
      setMessages([]);
      setChatHistory([]);
      setChatId(null);
      setIsAiMode(false);
      setSelectedRoom(null);
      setSessionTime(1500);
      setFirstMessage('');
    }
  };

  // HOME VIEW
  if (currentView === 'home') {
    return (
      <div className="min-h-screen py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 py-12"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-[2rem] w-fit shadow-2xl shadow-indigo-500/20"
            >
              <Users className="h-12 w-12 text-white" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold font-headline tracking-tight">
              <GradientText colors={['#6366f1', '#a855f7', '#ec4899']}>
                Peer Support
              </GradientText>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Safe, anonymous, and empathetic. Connect with fellow students who truly understand your journey.
            </p>
          </motion.div>

          <div className="flex justify-center items-center mb-12">
            <div className="bg-white/40 dark:bg-slate-800/40 p-1.5 rounded-[1.5rem] flex gap-2 backdrop-blur-xl border border-white/20 shadow-xl">
              <Button
                variant={!isSupportMode ? "default" : "ghost"}
                onClick={() => setIsSupportMode(false)}
                className={`rounded-2xl px-10 h-12 text-md font-bold transition-all duration-300 ${!isSupportMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-600 dark:text-slate-300 hover:bg-white/40'}`}
              >
                Get Support
              </Button>
              <Button
                variant={isSupportMode ? "default" : "ghost"}
                onClick={() => setIsSupportMode(true)}
                className={`rounded-2xl px-10 h-12 text-md font-bold transition-all duration-300 relative ${isSupportMode ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-600 dark:text-slate-300 hover:bg-white/40'}`}
              >
                Support Others
                {waitingChats.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-pink-500 text-white border-2 border-white dark:border-slate-900 animate-bounce">
                    {waitingChats.length}
                  </Badge>
                )}
              </Button>
            </div>

            {isSupportMode && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setUserId(null); // Force reload user and then chats
                  supabase.auth.getUser().then(({ data }: any) => setUserId(data.user?.id || null));
                }}
                className="rounded-xl border-slate-300 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-800 transition-all"
                disabled={isLoadingWaiting}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingWaiting ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>

          {!isSupportMode ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto"
            >
              <GlassCard className="p-10 border-indigo-200/50 dark:border-indigo-800/50">
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.5rem] shadow-xl shadow-indigo-500/20">
                      <MessageCircle className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold dark:text-white font-headline">Talk to a Peer</h3>
                      <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Safe, anonymous student-to-student support</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    {[
                      { icon: Sparkles, text: "Instant AI help while you wait for a human peer", color: "text-blue-500" },
                      { icon: Users, text: "Completely anonymous. No identity shared.", color: "text-purple-500" },
                      { icon: Heart, text: "Empathetic listeners who understand student life", color: "text-pink-500" }
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors group-hover:bg-white dark:group-hover:bg-slate-700`}>
                          <feature.icon className={`h-5 w-5 ${feature.color}`} />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-medium">{feature.text}</p>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => setCurrentView('room-select')}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-2xl shadow-indigo-600/20 h-16 text-xl font-bold rounded-2xl group transition-all"
                  >
                    Start Connection
                    <ArrowLeft className="ml-2 h-6 w-6 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {isLoadingWaiting ? (
                <div className="col-span-full py-20 text-center space-y-4">
                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
                  <p className="text-slate-500">Checking for available peers...</p>
                </div>
              ) : waitingChats.length === 0 ? (
                <div className="col-span-full py-20 text-center space-y-4">
                  <div className="mx-auto bg-slate-100 dark:bg-gray-800 p-6 rounded-full w-fit">
                    <Users className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-white">All caught up!</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">No one is currently waiting for a peer. Check back later to support your community.</p>
                  <p className="text-xs text-slate-400">Current ID: {userId || 'Loading...'}</p>
                </div>
              ) : (
                waitingChats.map(chat => {
                  const room = SUPPORT_ROOMS.find(r => r.id === chat.room_id);
                  const Icon = getIconComponent(chat.room_id);
                  return (
                    <motion.div
                      key={chat.id}
                      variants={{
                        hidden: { opacity: 0, scale: 0.9 },
                        show: { opacity: 1, scale: 1 }
                      }}
                    >
                      <GlassCard className="h-full flex flex-col hover:border-emerald-500/50 transition-colors">
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${room?.color || 'from-slate-500 to-slate-600'} shadow-lg`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold dark:text-white">{room?.name || 'General Support'}</CardTitle>
                              <CardDescription className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                Waiting for {Math.floor((Date.now() - new Date(chat.created_at).getTime()) / 60000)}m
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between">
                          <div className="bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <p className="text-sm text-slate-600 dark:text-slate-300 italic line-clamp-3 leading-relaxed">
                              "{chat.first_message || 'Feeling overwhelmed and looking for someone to talk to...'}"
                            </p>
                          </div>
                          <Button
                            disabled={isJoining}
                            onClick={() => handleJoinChat(chat)}
                            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 text-md font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                          >
                            {isJoining ? 'Joining...' : 'Accept & Listen'}
                          </Button>
                        </CardContent>
                      </GlassCard>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // ROOM SELECTION VIEW (Keep same but add a step to get a first message)
  // [Omitted similar views for brevity but ensure they are included in full implementation]
  // Since I am inside a replace_file_content tool, I should provide the FULL content of the block I am replacing.
  // Actually, I am replacing from line 36 to 472, which is almost the whole file.

  // [REMAINING VIEWS - CONTINUING FULL REPLACEMENT]
  if (currentView === 'room-select') {
    return (
      <div className="min-h-screen py-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('home')}
            className="mb-4 text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-xl transition-all"
          >
            <ArrowLeft className="h-5 w-5 mr-3" />
            Back to Dashboard
          </Button>

          <div className="text-center space-y-6">
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white font-headline">What's on your mind?</h2>
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="relative group">
                <Input
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  placeholder="Tell your peer a bit about how you're feeling..."
                  className="h-16 px-8 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-2 border-indigo-200/50 dark:border-indigo-900/50 rounded-2xl text-lg font-medium shadow-xl transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400"
                />
                <Sparkles className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-indigo-400 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">Select a focused room to begin</p>
            </div>
          </div>

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4"
          >
            {SUPPORT_ROOMS.map((room) => {
              const Icon = getIconComponent(room.id);
              return (
                <motion.div
                  key={room.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                >
                  <GlassCard
                    className={`cursor-pointer h-full border-opacity-50 hover:border-opacity-100 transition-all duration-500 relative overflow-hidden group`}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${room.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity -rotate-12 translate-x-4 -translate-y-4">
                      <Icon className="h-32 w-32" />
                    </div>
                    <CardHeader className="relative z-10 p-8">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-6">
                          <div className={`p-5 bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-xl shadow-black/5 group-hover:scale-110 transition-transform duration-500`}>
                            <Icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold dark:text-white font-headline">{room.name}</CardTitle>
                            <CardDescription className="text-md dark:text-slate-300 font-medium leading-tight">
                              {room.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/90 dark:bg-emerald-600/90 text-white border-none py-1.5 px-3 rounded-full shadow-lg backdrop-blur-sm self-start">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                            Active
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    );
  }

  if (currentView === 'matching') {
    return (
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <GlassCard hover={false} className="rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="h-3 w-full bg-slate-100/50 dark:bg-slate-900/50 relative overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
              />
            </div>
            <CardContent className="pt-20 pb-20 space-y-12">
              <div className="relative h-32 w-32 mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl"
                />
                <Loader2 className="h-full w-full text-indigo-600 dark:text-indigo-400 animate-spin-slow relative z-10" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-4 bg-indigo-500/10 rounded-full"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-4xl font-bold dark:text-white font-headline">Matching You...</h3>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  We're finding an empathetic peer in the <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedRoom?.name}</span> room.
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 px-8 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-2xl text-md font-bold border border-indigo-100 dark:border-indigo-800 shadow-sm"
                >
                  <Sparkles className="h-5 w-5 animate-pulse" />
                  AI Support will join if no peer is available
                </motion.div>
              </div>
            </CardContent>
          </GlassCard>
        </div>
      </div>
    );
  }

  const displayMessages = isAiMode ? chatHistory : messages;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white/40 dark:bg-slate-900/40 rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl backdrop-blur-xl relative">
      <AnimatePresence>
        {showPeerNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="absolute top-24 left-1/2 z-[60] px-4 w-full max-w-md"
          >
            <GlassCard className="border-2 border-emerald-500 shadow-2xl p-6 relative group bg-white dark:bg-slate-900">
              <div className="absolute top-0 right-0 p-2">
                <Button variant="ghost" size="icon" onClick={() => setShowPeerNotification(false)} className="h-8 w-8 rounded-full opacity-50 hover:opacity-100">×</Button>
              </div>
              <div className="flex items-center gap-6">
                <div className="bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Heart className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-xl font-bold dark:text-white">A Peer is Online!</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">A real student is available to listen. Switch to live chat?</p>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <Button onClick={switchToPeer} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">Yes, Connect</Button>
                <Button variant="outline" onClick={() => setShowPeerNotification(false)} className="flex-1 font-bold h-12 rounded-xl border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Stay with AI</Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-b border-white/20 p-6 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEndSession}
              className="text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-700/40 rounded-2xl h-11 w-11 transition-all active:scale-90"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl shadow-2xl ${isAiMode ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-emerald-500 to-teal-500 animate-pulse-slow shadow-emerald-500/30'}`}>
                {isAiMode ? <Brain className="h-7 w-7 text-white" /> : <Users className="h-7 w-7 text-white" />}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-2xl text-slate-800 dark:text-white font-headline leading-none">
                  {isAiMode ? 'AI Care Companion' : 'Live Peer Listener'}
                </h3>
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${isAiMode ? 'bg-indigo-400' : 'bg-emerald-400'} animate-pulse`} />
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    {isAiMode
                      ? 'Private Chat • Powered by Gemini'
                      : `Live Session • ${formatTime(sessionTime)} active`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
          {!isAiMode && (
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-5 py-2 text-xs font-black rounded-full shadow-sm">
              SECURE ANONYMOUS CHANNEL
            </Badge>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30 dark:bg-slate-900/30 backdrop-blur-sm">
        {displayMessages.map((msg: any) => {
          const isUser = msg.sender === 'user' || msg.sender_id === userId;
          const isSystem = msg.sender === 'system' || msg.sender_type === 'system';

          if (isSystem) {
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center py-6"
              >
                <Badge className="bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-none px-6 py-1.5 rounded-full font-bold text-[10px] tracking-widest uppercase">
                  {msg.content}
                </Badge>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] lg:max-w-[60%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-[2rem] px-6 py-4 shadow-xl transition-all duration-300 hover:shadow-2xl ${isUser
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-none'
                  : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/20 dark:border-slate-700/20 rounded-tl-none text-slate-800 dark:text-slate-100'
                  }`}>
                  <p className="text-base md:text-lg leading-relaxed font-medium">
                    {msg.content}
                  </p>
                </div>
                <div className={`flex items-center gap-2 mt-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 ${isUser ? 'flex-row' : 'flex-row-reverse'}`}>
                  {!isUser && msg.sender_type === 'ai' && (
                    <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none h-5 px-2 rounded-md">AI COMPANION</Badge>
                  )}
                  <span>{new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </motion.div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      <footer className="p-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-t border-white/20">
        <div className="max-w-4xl mx-auto flex gap-6 items-end">
          <div className="relative flex-1 group">
            <Input
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Share your thoughts with empathy..."
              className="h-16 px-8 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-2 border-transparent focus:border-indigo-500/50 rounded-[2rem] text-lg font-medium shadow-2xl transition-all pr-16 dark:text-white placeholder:text-slate-400"
            />
            <div className="absolute right-6 bottom-5 text-indigo-400 opacity-50 group-hover:opacity-100 transition-opacity">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="h-16 w-16 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-2xl shadow-indigo-600/30 active:scale-90 transition-all p-0 flex-shrink-0"
          >
            <Send className="h-7 w-7" />
          </Button>
        </div>
        <div className="text-center mt-6">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] leading-none opacity-50">
            MindBloom Encrypted Anonymous Channel
          </p>
        </div>
      </footer>
    </div>
  );
}
