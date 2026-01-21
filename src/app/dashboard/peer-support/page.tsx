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
      <div className="min-h-screen bg-transparent p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4 py-8">
            <div className="mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-3xl w-fit shadow-lg">
              <Users className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Peer Support
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto font-medium">
              A anonymous space to connect, share, and support fellow students.
            </p>
          </div>

          <div className="flex justify-center items-center mb-8 gap-4">
            <div className="bg-slate-200/50 dark:bg-gray-800/50 p-1 rounded-2xl flex gap-1 backdrop-blur-sm border border-slate-300/50 dark:border-gray-700/50">
              <Button
                variant={!isSupportMode ? "default" : "ghost"}
                onClick={() => setIsSupportMode(false)}
                className={`rounded-xl px-8 ${!isSupportMode ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md' : ''}`}
              >
                Get Support
              </Button>
              <Button
                variant={isSupportMode ? "default" : "ghost"}
                onClick={() => setIsSupportMode(true)}
                className={`rounded-xl px-8 ${isSupportMode ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-md' : ''}`}
              >
                Support Others
                {waitingChats.length > 0 && (
                  <Badge className="ml-2 bg-emerald-500 animate-pulse">{waitingChats.length}</Badge>
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
            <div className="max-w-md mx-auto">
              <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/50 hover:shadow-2xl transition-all duration-300 overflow-hidden backdrop-blur-sm">
                <CardHeader className="relative space-y-3 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-md">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl dark:text-white font-headline">Talk to a Peer</CardTitle>
                      <CardDescription className="text-base dark:text-slate-300">Safe, anonymous student support</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-1">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Live peer listeners available across 5 distinct rooms.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Immediate AI-assisted chat while you wait for a peer.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0 mt-1">
                        <Users className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Completely anonymous. No names, only empathy.</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setCurrentView('room-select')}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg h-14 text-xl font-bold rounded-2xl group"
                  >
                    Start Connection
                    <ArrowLeft className="ml-2 h-5 w-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <Card key={chat.id} className="border-2 hover:border-emerald-500 dark:hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm group">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl bg-gradient-to-br ${room?.color || 'from-slate-500 to-slate-600'}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg dark:text-white">{room?.name || 'General Support'}</CardTitle>
                            <CardDescription className="text-xs">Waiting for {Math.floor((Date.now() - new Date(chat.created_at).getTime()) / 60000)}m</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic line-clamp-2">
                          "{chat.first_message || 'Feeling overwhelmed and looking for someone to talk to...'}"
                        </p>
                        <Button
                          disabled={isJoining}
                          onClick={() => handleJoinChat(chat)}
                          className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all"
                        >
                          {isJoining ? 'Joining...' : 'Accept & Listen'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
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
      <div className="min-h-screen bg-transparent p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('home')}
            className="mb-4 dark:text-white dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white font-headline">What's on your mind?</h2>
            <div className="max-w-xl mx-auto space-y-4">
              <Input
                value={firstMessage}
                onChange={(e) => setFirstMessage(e.target.value)}
                placeholder="Optional: Tell your peer a bit about how you're feeling..."
                className="h-14 px-6 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-900 rounded-2xl text-lg font-medium shadow-sm transition-all focus:border-blue-500"
              />
              <p className="text-slate-600 dark:text-slate-300">Choose a room to find a peer listener</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {SUPPORT_ROOMS.map((room) => {
              const Icon = getIconComponent(room.id);
              return (
                <Card
                  key={room.id}
                  className={`cursor-pointer border-2 ${room.borderColor} dark:border-opacity-50 bg-gradient-to-br ${room.color} dark:bg-opacity-20 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm group relative overflow-hidden`}
                  onClick={() => handleRoomSelect(room)}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icon className="h-24 w-24" />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-sm group-hover:shadow-md transition-shadow">
                          <Icon className="h-6 w-6 dark:text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl dark:text-white font-headline">{room.name}</CardTitle>
                          <CardDescription className="mt-1 dark:text-slate-300 font-medium">{room.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-green-500 dark:bg-green-600 border-none">
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          Online
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'matching') {
    return (
      <div className="min-h-screen bg-transparent p-6">
        <div className="max-w-2xl mx-auto space-y-6 pt-24 text-center">
          <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <div className="h-2 w-full bg-slate-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500 animate-[loading_2s_ease-in-out_infinite]" />
            </div>
            <CardContent className="pt-16 pb-16 space-y-8">
              <div className="relative">
                <div className="absolute inset-0 animate-ping bg-blue-400/20 rounded-full h-20 w-20 mx-auto" />
                <Loader2 className="h-20 w-20 text-blue-600 dark:text-blue-400 animate-spin mx-auto relative z-10" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white font-headline">Matching You...</h3>
                <p className="text-slate-600 dark:text-slate-300 max-w-sm mx-auto text-lg leading-relaxed">
                  We're finding a peer listener in the <span className="text-blue-600 font-semibold">{selectedRoom?.name}</span> room.
                </p>
              </div>
              <div className="pt-4 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 px-6 py-2 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-sm font-semibold border border-pink-100 dark:border-pink-800">
                  <Sparkles className="h-4 w-4" />
                  AI Responder will join if no peer is free
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const displayMessages = isAiMode ? chatHistory : messages;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-white/80 dark:bg-gray-900/80 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-gray-800 shadow-2xl backdrop-blur-xl relative">
      {/* Background Peer Notification */}
      {showPeerNotification && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4 duration-500 px-4 w-full max-w-md">
          <Card className="border-2 border-emerald-500 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-gray-800 p-5 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-1">
              <Button variant="ghost" size="icon" onClick={() => setShowPeerNotification(false)} className="h-6 w-6 rounded-full opacity-50 hover:opacity-100">×</Button>
            </div>
            <div className="flex items-center gap-5">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                <Heart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-lg font-bold dark:text-white">A Peer Listener is Here!</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">A real student has joined the room. Would you like to switch?</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={switchToPeer} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-emerald-600/20">Connect with Peer</Button>
              <Button variant="outline" onClick={() => setShowPeerNotification(false)} className="flex-1 font-bold h-12 rounded-xl border-2">Stay with AI</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Chat Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-slate-200 dark:border-gray-700 p-5 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEndSession}
              className="dark:text-white dark:hover:bg-gray-700 rounded-xl"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl shadow-lg ${isAiMode ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600 animate-pulse'}`}>
                {isAiMode ? <Brain className="h-6 w-6 text-white" /> : <Users className="h-6 w-6 text-white" />}
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-800 dark:text-white font-headline">
                  {isAiMode ? 'AI Support Assistant' : 'Peer Listener'}
                </h3>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isAiMode ? 'bg-blue-400' : 'bg-green-400'} animate-pulse`} />
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {isAiMode
                      ? 'Powered by Gemini • Private & Safe'
                      : `Live Session • ${formatTime(sessionTime)} active`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
          {!isAiMode && (
            <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1.5 text-sm font-bold rounded-full">
              SECURE CONECTION
            </Badge>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 dark:bg-gray-900/30">
        {displayMessages.map((msg: any) => {
          const isUser = msg.sender === 'user' || msg.sender_id === userId;
          const isSystem = msg.sender === 'system' || msg.sender_type === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center flex-col items-center gap-2 py-4">
                <Badge className="bg-slate-200 dark:bg-gray-800 text-slate-500 border-none">{msg.content}</Badge>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-[80%] ${isUser ? 'order-1' : 'order-2'}`}>
                <div className={`rounded-[1.5rem] p-5 shadow-sm transition-all hover:shadow-md ${isUser
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none'
                  : 'bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-tl-none'
                  }`}>
                  <p className={`text-base leading-relaxed ${isUser ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                    {msg.content}
                  </p>
                </div>
                <div className={`flex items-center gap-1 mt-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {!isUser && msg.sender_type === 'ai' && <Badge className="ml-2 scale-75 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-none">AI LOG</Badge>}
                </div>
              </div>
            </div>
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

      {/* Input Area */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-slate-200 dark:border-gray-700 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex gap-4">
          <div className="relative flex-1 group">
            <Input
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message with empathy..."
              className="h-14 px-6 bg-slate-100/50 dark:bg-gray-900/50 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500/50 rounded-2xl text-base ring-0 transition-all font-medium pr-12 dark:text-white"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="h-14 w-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-600/20 active:scale-95 transition-all p-0"
          >
            <Send className="h-6 w-6" />
          </Button>
        </div>
        <p className="text-center mt-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
          MindBloom Anonymous Secure Channel
        </p>
      </div>
    </div>
  );
}
