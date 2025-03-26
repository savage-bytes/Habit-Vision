import { useState } from "react";
import { Check, MoreVertical } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import HabitForm from "./HabitForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HabitItemProps {
  habit: {
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
  };
  date: string;
}

export default function HabitItem({ habit, date }: HabitItemProps) {
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const todayCompletion = habit.completions.find(
    c => c.date === date
  );
  
  const isCompleted = todayCompletion?.completed || false;

  const toggleCompletion = async () => {
    setIsUpdating(true);
    try {
      if (todayCompletion) {
        // Update existing completion
        await apiRequest("PATCH", `/api/completions/${todayCompletion.id}`, {
          completed: !isCompleted
        });
      } else {
        // Create new completion
        await apiRequest("POST", "/api/completions", {
          habitId: habit.id,
          date,
          completed: true
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: isCompleted ? "Habit marked as incomplete" : "Habit completed",
        description: `${habit.name} ${isCompleted ? "unmarked" : "marked"} for ${date}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update habit status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteHabit = async () => {
    try {
      await apiRequest("DELETE", `/api/habits/${habit.id}`, undefined);
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Habit deleted",
        description: `${habit.name} was successfully deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete habit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteOpen(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center">
          <div className="mr-3">
            <button 
              onClick={toggleCompletion}
              disabled={isUpdating}
              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                isCompleted 
                  ? "border-success bg-success text-white" 
                  : "border-gray-300"
              }`}
            >
              {isCompleted && <Check className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">{habit.name}</h3>
                <p className="text-sm text-gray-500">
                  {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)} • {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                </p>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-3">
                  {habit.streak} day streak
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setIsDeleteOpen(true)}
                      className="text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HabitForm 
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialData={{
          id: habit.id,
          name: habit.name,
          frequency: habit.frequency,
          category: habit.category,
          goal: habit.goal || "",
          reminder: habit.reminder || "",
        }}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {habit.name} and all of its tracking data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteHabit} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
