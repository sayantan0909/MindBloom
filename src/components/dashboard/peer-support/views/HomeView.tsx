import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, Sparkles, Heart, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { SUPPORT_ROOMS } from '@/types/peer-support';

interface HomeViewProps {
    userId: string | null;
    isSupportMode: boolean;
    setIsSupportMode: (v: boolean) => void;
    waitingChats: any[];
    isLoadingWaiting: boolean;
    isJoining: boolean;
    onRefresh: () => void;
    onStartConnection: () => void;
    onJoinChat: (chat: any) => void;
    getIconComponent: (id: string) => any;
}

export function HomeView({
    userId,
    isSupportMode,
    setIsSupportMode,
    waitingChats,
    isLoadingWaiting,
    isJoining,
    onRefresh,
    onStartConnection,
    onJoinChat,
    getIconComponent
}: HomeViewProps) {
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
                            onClick={onRefresh}
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
                                    onClick={onStartConnection}
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
                                                onClick={() => onJoinChat(chat)}
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
