import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Users, ClipboardCheck, MessageSquare, CalendarCheck } from "lucide-react";
import { ScreeningResultsChart, UserActivityChart } from './charts';

const stats = [
  { title: "Total Users", value: "856", icon: Users },
  { title: "Screenings Completed", value: "1,247", icon: ClipboardCheck },
  { title: "Peer Support Posts", value: "128", icon: MessageSquare },
  { title: "Counseling Sessions", value: "342", icon: CalendarCheck },
];

export default function AdminPage() {
  return (
    <div className="space-y-8">
        <div className="text-center">
             <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <AreaChart className="h-10 w-10 text-primary" />
             </div>
            <h1 className="text-3xl md:text-4xl font-bold font-headline">Admin Analytics</h1>
            <p className="text-muted-foreground mt-2 text-lg max-w-3xl mx-auto">
                Anonymous, aggregated data to help recognize trends and plan effective interventions.
            </p>
        </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Screening Results Overview (PHQ-9 & GAD-7)</CardTitle>
          </CardHeader>
          <CardContent>
            <ScreeningResultsChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">User Activity (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <UserActivityChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
