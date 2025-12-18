'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';

const screeningData = [
  { level: 'Minimal', depression: 450, anxiety: 520 },
  { level: 'Mild', depression: 380, anxiety: 350 },
  { level: 'Moderate', depression: 250, anxiety: 210 },
  { level: 'Severe', depression: 167, anxiety: 167 },
];

const activityData = [
    { month: 'Jan', users: 150 },
    { month: 'Feb', users: 210 },
    { month: 'Mar', users: 250 },
    { month: 'Apr', users: 320 },
    { month: 'May', users: 280 },
    { month: 'Jun', users: 410 },
];

export function ScreeningResultsChart() {
  return (
    <div className="h-[350px]">
        <ChartContainer config={{}} className="w-full h-full">
            <BarChart data={screeningData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="level" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                <Bar dataKey="depression" fill="hsl(var(--primary))" radius={4} name="Depression (PHQ-9)" />
                <Bar dataKey="anxiety" fill="hsl(var(--accent))" radius={4} name="Anxiety (GAD-7)" />
            </BarChart>
        </ChartContainer>
    </div>
  );
}

export function UserActivityChart() {
    return (
        <div className="h-[350px]">
            <ChartContainer config={{}} className="w-full h-full">
                <AreaChart data={activityData} margin={{ left: -20, right: 10 }}>
                    <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis />
                    <Tooltip cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }} content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
            </ChartContainer>
        </div>
    )
}
