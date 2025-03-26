import { useState } from "react";
import { format, startOfWeek, addDays, isBefore, isToday, parseISO } from "date-fns";
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitCompletion {
  id: number;
  date: string;
  completed: boolean;
}

interface Habit {
  id: number;
  name: string;
  frequency: string;
  category: string;
  completions: HabitCompletion[];
}

interface WeeklyCalendarProps {
  habits: Habit[];
  onToggleCompletion: (habitId: number, date: string, completed: boolean, completionId?: number) => void;
}

export default function WeeklyCalendar({ habits, onToggleCompletion }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(startDate, i);
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      isoDate: format(date, 'yyyy-MM-dd')
    };
  });

  const endDate = weekDays[6].date;
  
  const previousWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };
  
  const nextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const getCompletionStatus = (habit: Habit, dateString: string) => {
    const completion = habit.completions.find(c => c.date === dateString);
    
    // For future dates, return undefined (not yet available)
    if (isBefore(new Date(), parseISO(dateString)) && !isToday(parseISO(dateString))) {
      return { status: 'future', completionId: undefined };
    }
    
    // If completion exists, return its status
    if (completion) {
      return { 
        status: completion.completed ? 'completed' : 'failed',
        completionId: completion.id 
      };
    }
    
    // If no completion for today or past dates, return 'pending'
    return { status: 'pending', completionId: undefined };
  };

  const handleToggleClick = (habit: Habit, dateString: string) => {
    const { status, completionId } = getCompletionStatus(habit, dateString);
    
    // Only allow toggling for today or past dates
    if (status !== 'future') {
      onToggleCompletion(
        habit.id,
        dateString,
        status !== 'completed', // Toggle to completed if not already completed
        completionId
      );
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Weekly Overview</h2>
        
        <div className="flex space-x-2 items-center">
          <button 
            onClick={previousWeek}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-gray-800">
            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
          </span>
          <button 
            onClick={nextWeek}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map(day => (
            <div 
              key={day.isoDate}
              className={cn(
                "text-center py-2 border-r border-gray-200 last:border-r-0",
                isToday(day.date) && "bg-primary/10"
              )}
            >
              <p className="text-xs text-gray-500 uppercase">{day.dayName}</p>
              <p className="text-sm font-medium">{day.dayNumber}</p>
            </div>
          ))}
        </div>
        
        {habits.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No habits to display.</p>
            <p className="text-sm mt-2">Create a habit to see it in the weekly view.</p>
          </div>
        ) : (
          habits.map(habit => (
            <div key={habit.id} className="border-b border-gray-200 last:border-b-0">
              <div className="flex items-center px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-800">{habit.name}</h3>
                <span 
                  className={cn(
                    "ml-2 px-2 py-0.5 text-xs font-medium rounded-full",
                    habit.frequency === 'daily' 
                      ? "bg-green-100 text-green-800" 
                      : "bg-blue-100 text-blue-800"
                  )}
                >
                  {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-7">
                {weekDays.map(day => {
                  const { status } = getCompletionStatus(habit, day.isoDate);
                  return (
                    <div 
                      key={day.isoDate}
                      className={cn(
                        "flex items-center justify-center p-3 border-r border-gray-200 last:border-r-0",
                        isToday(day.date) && "bg-primary/5"
                      )}
                    >
                      <button 
                        onClick={() => handleToggleClick(habit, day.isoDate)}
                        disabled={status === 'future'}
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center",
                          status === 'completed' && "bg-success text-white",
                          status === 'failed' && "bg-error text-white",
                          status === 'pending' && "bg-gray-200",
                          status === 'future' && "bg-gray-100 cursor-not-allowed"
                        )}
                      >
                        {status === 'completed' && <Check className="h-4 w-4" />}
                        {status === 'failed' && <X className="h-4 w-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
