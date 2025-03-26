import { useQuery } from "@tanstack/react-query";
import { Flame, Percent, ListChecks, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsData {
  currentStreak: number;
  completionRate: number;
  totalHabits: number;
  bestStreak: number;
}

export default function QuickStats() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ['/api/stats'],
  });

  const statsItems = [
    {
      title: "Current Streak",
      value: stats?.currentStreak || 0,
      unit: "days",
      icon: <Flame className="text-xl text-primary" />,
      bgColor: "bg-primary/10",
    },
    {
      title: "Completion Rate",
      value: stats?.completionRate || 0,
      unit: "%",
      icon: <Percent className="text-xl text-success" />,
      bgColor: "bg-success/10",
    },
    {
      title: "Total Habits",
      value: stats?.totalHabits || 0,
      unit: "",
      icon: <ListChecks className="text-xl text-secondary" />,
      bgColor: "bg-secondary/10",
    },
    {
      title: "Best Streak",
      value: stats?.bestStreak || 0,
      unit: "days",
      icon: <Trophy className="text-xl text-accent" />,
      bgColor: "bg-accent/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsItems.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{item.title}</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {item.value}{item.unit && ` ${item.unit}`}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center`}>
                {item.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
