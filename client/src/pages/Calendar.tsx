import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNavigation from "@/components/layout/BottomNavigation";
import HabitItem from "@/components/habits/HabitItem";

interface Habit {
  id: number;
  name: string;
  frequency: string;
  category: string;
  goal?: string;
  reminder?: string;
  streak: number;
  completions: {
    id: number;
    date: string;
    completed: boolean;
  }[];
}

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  const { data: habits, isLoading } = useQuery<Habit[]>({
    queryKey: ['/api/habits'],
  });

  // For the calendar, we need to know which dates have completions
  const getDateCompletions = () => {
    if (!habits) return {};
    
    const currentMonth = new Date(selectedDate);
    const monthDays = eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    });
    
    const dateCompletions: Record<string, { total: number; completed: number }> = {};
    
    monthDays.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const completions = habits.map(habit => {
        const completion = habit.completions.find(c => c.date === dateStr);
        return { habitId: habit.id, completed: completion?.completed || false };
      });
      
      dateCompletions[dateStr] = {
        total: completions.length,
        completed: completions.filter(c => c.completed).length
      };
    });
    
    return dateCompletions;
  };

  const dateCompletions = getDateCompletions();

  // Get habits for the selected date
  const selectedDateHabits = habits?.filter(habit => 
    // For daily habits, always show them
    habit.frequency === 'daily' ||
    // For weekly habits, show on the day they were created (e.g., every Monday)
    (habit.frequency === 'weekly' && 
     format(new Date(habit.completions[0]?.date || new Date()), 'E') === format(selectedDate, 'E'))
  );

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Calendar" />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 pb-24 md:pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                  components={{
                    DayContent: ({ date }) => {
                      const dateString = format(date, 'yyyy-MM-dd');
                      const completions = dateCompletions[dateString];
                      
                      // Only show completion status for current month
                      if (!isSameMonth(date, selectedDate)) {
                        return <span>{format(date, 'd')}</span>;
                      }
                      
                      return (
                        <div className="flex flex-col items-center">
                          <span className={isToday(date) ? "font-bold" : ""}>
                            {format(date, 'd')}
                          </span>
                          {completions && completions.total > 0 && (
                            <Badge
                              variant="secondary"
                              className="mt-1 h-1 w-5 flex items-center justify-center"
                              style={{
                                backgroundColor: completions.completed === completions.total 
                                  ? '#10b981' // success
                                  : completions.completed > 0 
                                    ? '#f59e0b' // partial
                                    : '#ef4444' // none
                              }}
                            >
                              <span className="sr-only">
                                {completions.completed} of {completions.total} completed
                              </span>
                            </Badge>
                          )}
                        </div>
                      );
                    }
                  }}
                />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  Habits for {format(selectedDate, 'MMMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-lg shadow-sm p-4 border">
                        <div className="flex items-center">
                          <Skeleton className="h-6 w-6 rounded-full mr-3" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-48 mb-2" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : selectedDateHabits && selectedDateHabits.length > 0 ? (
                    selectedDateHabits.map(habit => (
                      <HabitItem 
                        key={habit.id} 
                        habit={habit} 
                        date={formattedDate}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No habits for this date.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
