import { Badge } from '@/components/ui/badge';

interface MessageBubbleProps {
    msg: any;
    userId: string | null;
}

export function MessageBubble({ msg, userId }: MessageBubbleProps) {
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
}
