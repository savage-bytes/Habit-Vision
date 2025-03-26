import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { format } from "date-fns";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNavigation from "@/components/layout/BottomNavigation";
import QuickStats from "@/components/stats/QuickStats";
import HabitItem from "@/components/habits/HabitItem";
import WeeklyCalendar from "@/components/habits/WeeklyCalendar";
import ProgressCharts from "@/components/stats/ProgressCharts";
import HabitForm from "@/components/habits/HabitForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/components/ui/use-toast";

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

export default function Dashboard() {
  const [isHabitFormOpen, setIsHabitFormOpen] = useState(false);
  const [today] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { toast } = useToast();

  const { data: habits, isLoading } = useQuery<Habit[]>({
    queryKey: ['/api/habits'],
  });

  const toggleCompletion = async (habitId: number, date: string, completed: boolean, completionId?: number) => {
    try {
      if (completionId) {
        // Update existing completion
        await apiRequest("PATCH", `/api/completions/${completionId}`, { completed });
      } else {
        // Create new completion
        await apiRequest("POST", "/api/completions", {
          habitId,
          date,
          completed
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/charts'] });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update habit status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate completion stats for today
  const todayStats = habits 
    ? {
        total: habits.length,
        completed: habits.filter(habit => 
          habit.completions.some(c => c.date === today && c.completed)
        ).length
      }
    : { total: 0, completed: 0 };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Dashboard" />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 pb-24 md:pb-6">
          <QuickStats />
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Today's Habits</h2>
              
              <div className="text-sm">
                <span className="font-medium text-gray-800">{format(new Date(), 'MMMM d, yyyy')}</span>
                <span className="text-gray-500 ml-2">
                  {todayStats.completed}/{todayStats.total} completed
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center">
                      <Skeleton className="h-6 w-6 rounded-full mr-3" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </div>
                ))
              ) : habits && habits.length > 0 ? (
                habits.map(habit => (
                  <HabitItem key={habit.id} habit={habit} date={today} />
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-500 mb-4">No habits created yet.</p>
                  <Button onClick={() => setIsHabitFormOpen(true)}>
                    Create Your First Habit
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {habits && (
            <WeeklyCalendar 
              habits={habits} 
              onToggleCompletion={toggleCompletion} 
            />
          )}
          
          <ProgressCharts />
        </div>
      </main>
      
      <div className="fixed bottom-24 right-6 md:bottom-6 md:right-6 z-20">
        <Button
          onClick={() => setIsHabitFormOpen(true)}
          size="icon"
          className="w-14 h-14 rounded-full shadow-lg"
        >
          <PlusIcon className="h-6 w-6" />
        </Button>
      </div>
      
      <BottomNavigation />
      
      <HabitForm
        open={isHabitFormOpen}
        onOpenChange={setIsHabitFormOpen}
      />
    </div>
  );
}
