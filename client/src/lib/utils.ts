import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatString: string = "PPP") {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatString);
}

export function calculateStreak(completions: { date: string; completed: boolean }[]): number {
  if (!completions.length) return 0;
  
  // Sort completions by date in descending order (newest first)
  const sortedCompletions = [...completions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  for (const completion of sortedCompletions) {
    if (completion.completed) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export function calculateCompletionRate(completions: { completed: boolean }[]): number {
  if (!completions.length) return 0;
  
  const completedCount = completions.filter(c => c.completed).length;
  return Math.round((completedCount / completions.length) * 100);
}

export function getCategoryColor(category: string): string {
  const categoryColors: Record<string, string> = {
    health: "#10b981",     // green-500
    fitness: "#6366f1",    // indigo-500
    education: "#8b5cf6",  // violet-500
    wellness: "#ec4899",   // pink-500
    work: "#f59e0b",       // amber-500
    personal: "#3b82f6"    // blue-500
  };
  
  return categoryColors[category.toLowerCase()] || "#6b7280"; // gray-500 as default
}

export function formatDateForDisplay(date: Date): string {
  return format(date, "MMM d, yyyy");
}

export function getDayName(date: Date, short: boolean = false): string {
  return format(date, short ? "EEE" : "EEEE");
}

export function isDateToday(date: Date): boolean {
  return isToday(date);
}
