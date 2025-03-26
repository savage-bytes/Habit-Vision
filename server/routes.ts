import express from 'express';
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertHabitSchema, 
  insertCompletionSchema, 
  updateCompletionSchema,
  updateSettingsSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { format, subDays, startOfDay, parseISO, isWithinInterval, addDays } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // Error handler for validation errors
  const handleValidation = (schema: z.ZodSchema<any>, body: any) => {
    try {
      return schema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        throw new Error(validationError.message);
      }
      throw error;
    }
  };

  // Habits endpoints
  apiRouter.get('/habits', async (req, res) => {
    try {
      const habits = await storage.getHabits();
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: `Error fetching habits: ${error}` });
    }
  });

  apiRouter.post('/habits', async (req, res) => {
    try {
      const habitData = handleValidation(insertHabitSchema, req.body);
      const newHabit = await storage.createHabit(habitData);
      res.status(201).json(newHabit);
    } catch (error) {
      res.status(400).json({ message: `Error creating habit: ${error}` });
    }
  });

  apiRouter.get('/habits/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const habit = await storage.getHabitById(id);
      
      if (!habit) {
        return res.status(404).json({ message: 'Habit not found' });
      }
      
      res.json(habit);
    } catch (error) {
      res.status(500).json({ message: `Error fetching habit: ${error}` });
    }
  });

  apiRouter.patch('/habits/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const habitData = handleValidation(insertHabitSchema.partial(), req.body);
      
      const updatedHabit = await storage.updateHabit(id, habitData);
      
      if (!updatedHabit) {
        return res.status(404).json({ message: 'Habit not found' });
      }
      
      res.json(updatedHabit);
    } catch (error) {
      res.status(400).json({ message: `Error updating habit: ${error}` });
    }
  });

  apiRouter.delete('/habits/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteHabit(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Habit not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: `Error deleting habit: ${error}` });
    }
  });

  // Completions endpoints
  apiRouter.post('/completions', async (req, res) => {
    try {
      const completionData = handleValidation(insertCompletionSchema, req.body);
      const newCompletion = await storage.createCompletion(completionData);
      res.status(201).json(newCompletion);
    } catch (error) {
      res.status(400).json({ message: `Error creating completion: ${error}` });
    }
  });

  apiRouter.patch('/completions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const completionData = handleValidation(updateCompletionSchema, req.body);
      
      const updatedCompletion = await storage.updateCompletion(id, completionData);
      
      if (!updatedCompletion) {
        return res.status(404).json({ message: 'Completion not found' });
      }
      
      res.json(updatedCompletion);
    } catch (error) {
      res.status(400).json({ message: `Error updating completion: ${error}` });
    }
  });

  // Stats endpoints
  apiRouter.get('/stats', async (req, res) => {
    try {
      const habits = await storage.getHabits();
      const today = new Date();
      
      // Calculate current streak
      let currentStreak = 0;
      const daysToCheck = 30; // Check last 30 days
      
      // Start with yesterday and go backwards
      for (let i = 1; i <= daysToCheck; i++) {
        const checkDate = format(subDays(today, i), 'yyyy-MM-dd');
        
        // Get all completions for this date
        const dayCompletions = habits.flatMap(habit => 
          habit.completions.filter(c => c.date === checkDate)
        );
        
        // If no completions or any incomplete habit, break the streak
        if (dayCompletions.length === 0 || dayCompletions.some(c => !c.completed)) {
          break;
        }
        
        currentStreak++;
      }
      
      // Calculate best streak (simple implementation)
      let bestStreak = currentStreak;
      
      // Calculate completion rate
      const recentCompletions = habits.flatMap(habit => 
        habit.completions.filter(c => {
          const completionDate = parseISO(c.date);
          const thirtyDaysAgo = subDays(today, 30);
          return isWithinInterval(completionDate, { start: thirtyDaysAgo, end: today });
        })
      );
      
      const completionRate = recentCompletions.length > 0
        ? Math.round((recentCompletions.filter(c => c.completed).length / recentCompletions.length) * 100)
        : 0;
      
      res.json({
        currentStreak,
        completionRate,
        totalHabits: habits.length,
        bestStreak: bestStreak > 0 ? bestStreak : 0
      });
    } catch (error) {
      res.status(500).json({ message: `Error fetching stats: ${error}` });
    }
  });

  // Charts data endpoint
  apiRouter.get('/charts', async (req, res) => {
    try {
      const habits = await storage.getHabits();
      const today = new Date();
      
      // Group habits by category to calculate category completion rates
      const categoriesMap = new Map<string, { completions: { completed: boolean }[], count: number }>();
      
      habits.forEach(habit => {
        if (!categoriesMap.has(habit.category)) {
          categoriesMap.set(habit.category, { completions: [], count: 0 });
        }
        
        const categoryData = categoriesMap.get(habit.category)!;
        categoryData.count++;
        categoryData.completions.push(...habit.completions);
      });
      
      const categoryCompletions = Array.from(categoriesMap.entries()).map(([category, data]) => {
        const completedCount = data.completions.filter(c => c.completed).length;
        const completionRate = data.completions.length > 0
          ? Math.round((completedCount / data.completions.length) * 100)
          : 0;
        
        return {
          category,
          completionRate,
          count: data.count
        };
      });
      
      // Calculate monthly progress (completion rate for each day of last 30 days)
      const days = 30;
      const monthlyProgress = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = format(subDays(today, i), 'yyyy-MM-dd');
        
        // Get all completions for this date
        const dayCompletions = habits.flatMap(habit => 
          habit.completions.filter(c => c.date === date)
        );
        
        const completionRate = dayCompletions.length > 0
          ? Math.round((dayCompletions.filter(c => c.completed).length / dayCompletions.length) * 100)
          : 0;
        
        monthlyProgress.push({
          date,
          completionRate
        });
      }
      
      // Calculate overall completion rate
      const allCompletions = habits.flatMap(habit => habit.completions);
      const overallCompletionRate = allCompletions.length > 0
        ? Math.round((allCompletions.filter(c => c.completed).length / allCompletions.length) * 100)
        : 0;
      
      res.json({
        categoryCompletions,
        monthlyProgress,
        overallCompletionRate
      });
    } catch (error) {
      res.status(500).json({ message: `Error fetching chart data: ${error}` });
    }
  });

  // Statistics endpoint for detailed stats
  apiRouter.get('/statistics', async (req, res) => {
    try {
      const habits = await storage.getHabits();
      const today = new Date();
      
      // Calculate habit-specific stats
      const habitStats = habits.map(habit => {
        const completions = habit.completions;
        const completedCount = completions.filter(c => c.completed).length;
        const completionRate = completions.length > 0
          ? Math.round((completedCount / completions.length) * 100)
          : 0;
        
        return {
          id: habit.id,
          name: habit.name,
          category: habit.category,
          frequency: habit.frequency,
          streak: habit.streak,
          completionRate
        };
      });
      
      // Category data
      const categoriesMap = new Map<string, { completions: { completed: boolean }[], count: number }>();
      
      habits.forEach(habit => {
        if (!categoriesMap.has(habit.category)) {
          categoriesMap.set(habit.category, { completions: [], count: 0 });
        }
        
        const categoryData = categoriesMap.get(habit.category)!;
        categoryData.count++;
        categoryData.completions.push(...habit.completions);
      });
      
      const categoryData = Array.from(categoriesMap.entries()).map(([category, data]) => {
        const completedCount = data.completions.filter(c => c.completed).length;
        const completionRate = data.completions.length > 0
          ? Math.round((completedCount / data.completions.length) * 100)
          : 0;
        
        return {
          category,
          completionRate,
          count: data.count
        };
      });
      
      // Generate streak history (simple mock data for now)
      const streakHistory = Array.from({ length: 30 }).map((_, i) => {
        const date = format(subDays(today, 29 - i), 'yyyy-MM-dd');
        // Simple algorithm to generate a plausible streak value
        const streak = Math.max(0, 
          Math.min(30, Math.floor(i / 3) + Math.floor(Math.random() * 3))
        );
        
        return { date, streak };
      });
      
      // Generate completion history
      const completionHistory = Array.from({ length: 30 }).map((_, i) => {
        const date = format(subDays(today, 29 - i), 'yyyy-MM-dd');
        
        // Get all completions for this date
        const dayCompletions = habits.flatMap(habit => 
          habit.completions.filter(c => c.date === date)
        );
        
        const rate = dayCompletions.length > 0
          ? Math.round((dayCompletions.filter(c => c.completed).length / dayCompletions.length) * 100)
          : 0;
        
        return { date, rate };
      });
      
      res.json({
        habits: habitStats,
        categoryData,
        streakHistory,
        completionHistory
      });
    } catch (error) {
      res.status(500).json({ message: `Error fetching statistics: ${error}` });
    }
  });

  // Settings endpoints
  apiRouter.get('/settings', async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: `Error fetching settings: ${error}` });
    }
  });

  apiRouter.patch('/settings', async (req, res) => {
    try {
      const settingsData = handleValidation(updateSettingsSchema, req.body);
      const updatedSettings = await storage.updateSettings(settingsData);
      res.json(updatedSettings);
    } catch (error) {
      res.status(400).json({ message: `Error updating settings: ${error}` });
    }
  });

  // Export data endpoint
  apiRouter.get('/export', async (req, res) => {
    try {
      const data = {
        habits: await storage.getHabits(),
        settings: await storage.getSettings()
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=habittrack-export-${format(new Date(), 'yyyy-MM-dd')}.json`);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: `Error exporting data: ${error}` });
    }
  });

  // Reset all data endpoint
  apiRouter.delete('/reset', async (req, res) => {
    try {
      await storage.resetAllData();
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: `Error resetting data: ${error}` });
    }
  });

  // Mount API routes under /api prefix
  app.use('/api', apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
