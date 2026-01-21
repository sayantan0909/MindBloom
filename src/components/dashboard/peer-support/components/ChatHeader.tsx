import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Brain, Users } from 'lucide-react';

interface ChatHeaderProps {
    isAiMode: boolean;
    sessionTime: number;
    formatTime: (s: number) => string;
    onEndSession: () => void;
}

export function ChatHeader({ isAiMode, sessionTime, formatTime, onEndSession }: ChatHeaderProps) {
    return (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-slate-200 dark:border-gray-700 p-5 z-10 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onEndSession}
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
    );
}
