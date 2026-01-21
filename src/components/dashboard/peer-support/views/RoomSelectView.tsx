import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { SUPPORT_ROOMS } from '@/types/peer-support';

interface RoomSelectViewProps {
    firstMessage: string;
    setFirstMessage: (v: string) => void;
    onBack: () => void;
    onRoomSelect: (room: any) => void;
    getIconComponent: (id: string) => any;
}

export function RoomSelectView({
    firstMessage,
    setFirstMessage,
    onBack,
    onRoomSelect,
    getIconComponent
}: RoomSelectViewProps) {
    return (
        <div className="min-h-screen bg-transparent p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <Button
                    variant="ghost"
                    onClick={onBack}
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
                                onClick={() => onRoomSelect(room)}
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
