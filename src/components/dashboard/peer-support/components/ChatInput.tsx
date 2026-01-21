import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Sparkles } from 'lucide-react';

interface ChatInputProps {
    inputValue: string;
    onInputChange: (val: string) => void;
    onSendMessage: () => void;
    disabled: boolean;
}

export function ChatInput({ inputValue, onInputChange, onSendMessage, disabled }: ChatInputProps) {
    return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-slate-200 dark:border-gray-700 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="max-w-4xl mx-auto flex gap-4">
                <div className="relative flex-1 group">
                    <Input
                        value={inputValue}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                        placeholder="Type your message with empathy..."
                        className="h-14 px-6 bg-slate-100/50 dark:bg-gray-900/50 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500/50 rounded-2xl text-base ring-0 transition-all font-medium pr-12 dark:text-white"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
                        <Sparkles className="h-5 w-5" />
                    </div>
                </div>
                <Button
                    onClick={onSendMessage}
                    disabled={disabled || !inputValue.trim()}
                    className="h-14 w-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-600/20 active:scale-95 transition-all p-0"
                >
                    <Send className="h-6 w-6" />
                </Button>
            </div>
            <p className="text-center mt-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                MindBloom Anonymous Secure Channel
            </p>
        </div>
    );
}
