import { 
  InsertHabit, 
  Habit, 
  InsertCompletion, 
  Completion, 
  UpdateCompletion,
  UpdateSettings,
  Setting
} from "@shared/schema";
import { format, parseISO, subDays } from "date-fns";

// Define the storage interface with all required CRUD methods
export interface IStorage {
  // Habits
  getHabits(): Promise<(Habit & { completions: (Completion & { date: string })[], streak: number })[]>;
  getHabitById(id: number): Promise<(Habit & { completions: (Completion & { date: string })[], streak: number }) | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit & { completions: Completion[], streak: number }>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<(Habit & { completions: Completion[], streak: number }) | undefined>;
  deleteHabit(id: number): Promise<boolean>;
  
  // Completions
  createCompletion(completion: InsertCompletion): Promise<Completion>;
  updateCompletion(id: number, data: UpdateCompletion): Promise<Completion | undefined>;
  
  // Settings
  getSettings(): Promise<Setting>;
  updateSettings(settings: UpdateSettings): Promise<Setting>;
  
  // Data management
  resetAllData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private habits: Map<number, Habit>;
  private completions: Map<number, Completion>;
  private settings: Setting;
  private habitId: number;
  private completionId: number;

  constructor() {
    this.habits = new Map();
    this.completions = new Map();
    this.habitId = 1;
    this.completionId = 1;
    
    // Initialize default settings
    this.settings = {
      id: 1,
      theme: "light",
      notificationsEnabled: false,
      reminderTime: "08:00",
      syncData: true,
      lastSyncDate: null
    };
    
    // Add some initial example habits if needed
    this._populateInitialData();
  }

  private _populateInitialData(): void {
    // This is only used internally to set up the storage
    // You could add sample data here during development
  }

  // Calculate streak for a habit based on its completions
  private _calculateStreak(habitId: number): number {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    // Get all completions for this habit
    const habitCompletions = Array.from(this.completions.values())
      .filter(c => c.habitId === habitId)
      .map(c => ({ ...c, date: c.date.toString() })) // Convert date to string
      .sort((a, b) => {
        // Sort in descending order (newest first)
        return parseISO(b.date).getTime() - parseISO(a.date).getTime();
      });
    
    // Check if there are any completions
    if (habitCompletions.length === 0) {
      return 0;
    }

    let streak = 0;
    let currentDate = today;
    let checkDate = format(currentDate, 'yyyy-MM-dd');
    
    // If today has a completion and it's completed, start streak at 1
    const todayCompletion = habitCompletions.find(c => c.date === todayStr);
    if (todayCompletion && todayCompletion.completed) {
      streak = 1;
      currentDate = subDays(currentDate, 1);
      checkDate = format(currentDate, 'yyyy-MM-dd');
    } else if (!todayCompletion) {
      // If no completion for today, start checking from yesterday
      currentDate = subDays(currentDate, 1);
      checkDate = format(currentDate, 'yyyy-MM-dd');
    } else {
      // Today's completion exists but is not completed, streak is 0
      return 0;
    }
    
    // Continue checking previous days
    while (true) {
      const completion = habitCompletions.find(c => c.date === checkDate);
      
      // If no completion for this date or completion is not completed, break
      if (!completion || !completion.completed) {
        break;
      }
      
      streak++;
      currentDate = subDays(currentDate, 1);
      checkDate = format(currentDate, 'yyyy-MM-dd');
    }
    
    return streak;
  }

  // Habits
  async getHabits(): Promise<(Habit & { completions: (Completion & { date: string })[], streak: number })[]> {
    const habits = Array.from(this.habits.values());
    return Promise.all(habits.map(async habit => {
      const habitCompletions = Array.from(this.completions.values())
        .filter(c => c.habitId === habit.id)
        .map(c => ({ ...c, date: c.date.toString() })); // Convert date to string
      
      return {
        ...habit,
        completions: habitCompletions,
        streak: this._calculateStreak(habit.id)
      };
    }));
  }

  async getHabitById(id: number): Promise<(Habit & { completions: (Completion & { date: string })[], streak: number }) | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;
    
    const habitCompletions = Array.from(this.completions.values())
      .filter(c => c.habitId === id)
      .map(c => ({ ...c, date: c.date.toString() })); // Convert date to string
    
    return {
      ...habit,
      completions: habitCompletions,
      streak: this._calculateStreak(id)
    };
  }

  async createHabit(habit: InsertHabit): Promise<Habit & { completions: Completion[], streak: number }> {
    const id = this.habitId++;
    const now = new Date();
    
    const newHabit: Habit = {
      id,
      ...habit,
      createdAt: now
    };
    
    this.habits.set(id, newHabit);
    
    return {
      ...newHabit,
      completions: [],
      streak: 0
    };
  }

  async updateHabit(id: number, habit: Partial<InsertHabit>): Promise<(Habit & { completions: Completion[], streak: number }) | undefined> {
    const existingHabit = this.habits.get(id);
    if (!existingHabit) return undefined;
    
    const updatedHabit: Habit = {
      ...existingHabit,
      ...habit
    };
    
    this.habits.set(id, updatedHabit);
    
    const habitCompletions = Array.from(this.completions.values())
      .filter(c => c.habitId === id);
    
    return {
      ...updatedHabit,
      completions: habitCompletions,
      streak: this._calculateStreak(id)
    };
  }

  async deleteHabit(id: number): Promise<boolean> {
    if (!this.habits.has(id)) return false;
    
    // Delete the habit
    this.habits.delete(id);
    
    // Delete all related completions
    for (const [completionId, completion] of this.completions.entries()) {
      if (completion.habitId === id) {
        this.completions.delete(completionId);
      }
    }
    
    return true;
  }

  // Completions
  async createCompletion(completion: InsertCompletion): Promise<Completion> {
    const id = this.completionId++;
    
    const newCompletion: Completion = {
      id,
      ...completion,
      date: completion.date instanceof Date ? completion.date : new Date(completion.date)
    };
    
    this.completions.set(id, newCompletion);
    
    return newCompletion;
  }

  async updateCompletion(id: number, data: UpdateCompletion): Promise<Completion | undefined> {
    const existingCompletion = this.completions.get(id);
    if (!existingCompletion) return undefined;
    
    const updatedCompletion: Completion = {
      ...existingCompletion,
      ...data
    };
    
    this.completions.set(id, updatedCompletion);
    
    return updatedCompletion;
  }

  // Settings
  async getSettings(): Promise<Setting> {
    return this.settings;
  }

  async updateSettings(settings: UpdateSettings): Promise<Setting> {
    this.settings = {
      ...this.settings,
      ...settings,
      lastSyncDate: new Date() // Update sync date on settings change
    };
    
    return this.settings;
  }

  // Data management
  async resetAllData(): Promise<void> {
    this.habits.clear();
    this.completions.clear();
    this.habitId = 1;
    this.completionId = 1;
    
    // Reset settings to defaults but keep the ID
    const settingId = this.settings.id;
    this.settings = {
      id: settingId,
      theme: "light",
      notificationsEnabled: false,
      reminderTime: "08:00",
      syncData: true,
      lastSyncDate: null
    };
  }
}

// Export a singleton instance of the storage
export const storage = new MemStorage();
