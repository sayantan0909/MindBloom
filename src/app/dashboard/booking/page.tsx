'use client';

import { useState } from 'react';
import { mentalHealthData, Counselor } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarCheck, Languages, Sparkles, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/dashboard/glass-card';
import { GradientText } from '@/components/ui/gradient-text';
import { cn } from '@/lib/utils';

export default function BookingPage() {
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const handleBooking = (counselor: Counselor) => {
    if (counselor.available) {
      setSelectedCounselor(counselor);
    }
  };

  const confirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Appointment confirmed with ${selectedCounselor?.name}! (This is a demo)`);
    setSelectedCounselor(null);
  };

  const getAvatar = (counselor: Counselor) => {
    const img = PlaceHolderImages.find(p => p.id === `avatar${counselor.id}`);
    return img || PlaceHolderImages[0];
  }

  return (
    <div className="min-h-screen py-6 px-4 md:px-8 space-y-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-[2rem] w-fit shadow-2xl shadow-indigo-500/20"
          >
            <CalendarCheck className="h-12 w-12 text-white" />
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
            <GradientText colors={['#6366f1', '#8b5cf6', '#3b82f6']}>
              Personal Guidance
            </GradientText>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Schedule a confidential appointment with one of our trusted on-campus counselors. <span className="font-bold text-indigo-600 dark:text-indigo-400">Taking the first step is a sign of strength.</span>
          </p>
        </motion.div>

        {/* Counselors Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {mentalHealthData.counselors.map((counselor, idx) => {
            const avatar = getAvatar(counselor);
            return (
              <motion.div
                key={counselor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCard className="h-full flex flex-col group overflow-hidden border-white/40 dark:border-slate-700/40">
                  <div className="p-8 flex-grow space-y-6">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <Avatar className="h-20 w-20 border-4 border-white/60 dark:border-slate-800/60 shadow-xl">
                          <Image src={avatar.imageUrl} alt={counselor.name} width={100} height={100} data-ai-hint={avatar.imageHint} className="object-cover" />
                          <AvatarFallback>{counselor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {counselor.available && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full shadow-lg" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-bold font-headline tracking-tight leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {counselor.name}
                        </h3>
                        <p className="text-indigo-600/70 dark:text-indigo-400/70 font-bold text-xs uppercase tracking-[0.2em]">
                          {counselor.specialty}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <Languages className="h-4 w-4 text-indigo-500" />
                        <span className="font-medium">{counselor.languages.join(' • ')}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <MapPin className="h-4 w-4 text-indigo-500" />
                        <span className="font-medium">Student Wellness Center</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <Clock className="h-4 w-4 text-indigo-500" />
                        <span className="font-medium">Mon - Fri • 9AM - 5PM</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-8 pb-8">
                    <Button
                      onClick={() => handleBooking(counselor)}
                      disabled={!counselor.available}
                      className={cn(
                        "w-full h-12 rounded-xl font-bold shadow-lg transition-all group/btn flex items-center justify-center gap-2",
                        counselor.available
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      {counselor.available ? (
                        <>Book Session <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" /></>
                      ) : 'Not Available'}
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>

        <Dialog open={!!selectedCounselor} onOpenChange={() => setSelectedCounselor(null)}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-transparent">
            <GlassCard className="border-white/60 dark:border-slate-700/60 shadow-2xl" hover={false}>
              <div className="p-8 space-y-8">
                <DialogHeader>
                  <DialogTitle className="font-headline text-3xl font-black text-center mb-2">Book Your Session</DialogTitle>
                  <DialogDescription className="text-center text-slate-500 text-base">
                    Select a preferred date and time for your meeting with <span className="font-bold text-indigo-600">{selectedCounselor?.name}</span>.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={confirmBooking} className="space-y-6">
                  <div className="space-y-6">
                    <div className="bg-white/40 dark:bg-slate-900/40 rounded-3xl p-4 border border-white/20 dark:border-slate-800 flex justify-center shadow-inner">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                        className="rounded-md p-0"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <Select required>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-white/40 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 font-bold">
                          <SelectValue placeholder="Select a time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00">9:00 AM - 9:50 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM - 10:50 AM</SelectItem>
                          <SelectItem value="11:00">11:00 AM - 11:50 AM</SelectItem>
                          <SelectItem value="14:00">2:00 PM - 2:50 PM</SelectItem>
                          <SelectItem value="15:00">3:00 PM - 3:50 PM</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        placeholder="Reason for booking (optional)"
                        className="h-12 rounded-xl border-2 border-white/40 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 font-medium"
                      />
                    </div>
                  </div>

                  <DialogFooter className="flex gap-3 sm:gap-2">
                    <Button type="button" variant="ghost" className="flex-1 font-bold h-12 rounded-xl hover:bg-slate-100/50" onClick={() => setSelectedCounselor(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 font-bold h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25">
                      Confirm <Sparkles className="ml-2 h-4 w-4" />
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            </GlassCard>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
