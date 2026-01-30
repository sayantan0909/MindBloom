import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

interface MatchingViewProps {
    onCancel: () => void;
}

export function MatchingView({ onCancel }: MatchingViewProps) {
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
                                We're finding a peer listener for you.
                            </p>
                        </div>
                        <div className="pt-4 flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2 px-6 py-2 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-sm font-semibold border border-pink-100 dark:border-pink-800">
                                <Sparkles className="h-4 w-4" />
                                AI Responder will join if no peer is free
                            </div>
                            <Button
                                variant="outline"
                                onClick={onCancel}
                                className="mt-4 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full px-8"
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
