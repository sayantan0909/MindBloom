'use client';

import { useState } from 'react';
import { mentalHealthData, Counselor } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarCheck, Languages } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

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
    <div className="space-y-8">
      <div className="text-center">
             <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <CalendarCheck className="h-10 w-10 text-primary" />
             </div>
        <h1 className="text-3xl md:text-4xl font-bold font-headline">Book a Counselor</h1>
        <p className="text-muted-foreground mt-2 text-lg max-w-3xl mx-auto">
          Schedule a confidential appointment with one of our on-campus counselors. Taking the first step is a sign of strength.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mentalHealthData.counselors.map(counselor => {
            const avatar = getAvatar(counselor);
            return (
          <Card key={counselor.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <Image src={avatar.imageUrl} alt={counselor.name} width={100} height={100} data-ai-hint={avatar.imageHint} />
                  <AvatarFallback>{counselor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl font-headline">{counselor.name}</CardTitle>
                  <CardDescription>{counselor.specialty}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Languages className="h-4 w-4" />
                <span>{counselor.languages.join(', ')}</span>
              </div>
              <div className={`text-sm font-medium flex items-center gap-2 ${counselor.available ? 'text-green-600' : 'text-red-600'}`}>
                <span className={`h-2 w-2 rounded-full ${counselor.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {counselor.available ? 'Available for booking' : 'Currently unavailable'}
              </div>
            </CardContent>
            <CardContent>
              <Button onClick={() => handleBooking(counselor)} disabled={!counselor.available} className="w-full">
                {counselor.available ? 'Book Session' : 'Unavailable'}
              </Button>
            </CardContent>
          </Card>
        )})}
      </div>

      <Dialog open={!!selectedCounselor} onOpenChange={() => setSelectedCounselor(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-center">Book a session with {selectedCounselor?.name}</DialogTitle>
            <DialogDescription className="text-center">
              Select a date and time for your confidential appointment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={confirmBooking}>
            <div className="p-4 space-y-4">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                    className="rounded-md border p-0"
                />
              <Select required>
                <SelectTrigger>
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
              <Input placeholder="Reason for booking (optional)" />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setSelectedCounselor(null)}>Cancel</Button>
              <Button type="submit">Confirm Booking</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
