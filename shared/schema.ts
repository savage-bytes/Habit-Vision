import { pgTable, text, serial, integer, boolean, date, time, jsonb, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Habits table
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  frequency: text("frequency").notNull().default("daily"), // daily, weekly, custom
  category: text("category").notNull().default("personal"), // health, fitness, education, wellness, work, personal
  goal: text("goal"),
  reminder: text("reminder"), // time in HH:MM format
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Completions table
export const completions = pgTable("completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  completed: boolean("completed").notNull().default(false),
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  theme: text("theme").notNull().default("light"), // light, dark, system
  notificationsEnabled: boolean("notifications_enabled").notNull().default(false),
  reminderTime: text("reminder_time").notNull().default("08:00"),
  syncData: boolean("sync_data").notNull().default(true),
  lastSyncDate: timestamp("last_sync_date"),
});

// Schema for inserting habits
export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  createdAt: true,
});

// Schema for inserting completions
export const insertCompletionSchema = createInsertSchema(completions).omit({
  id: true,
});

// Schema for updating completions
export const updateCompletionSchema = z.object({
  completed: z.boolean(),
});

// Schema for updating settings
export const updateSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  notificationsEnabled: z.boolean().optional(),
  reminderTime: z.string().optional(),
  syncData: z.boolean().optional(),
});

// Types
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

export type InsertCompletion = z.infer<typeof insertCompletionSchema>;
export type Completion = typeof completions.$inferSelect;

export type UpdateCompletion = z.infer<typeof updateCompletionSchema>;

export type Setting = typeof settings.$inferSelect;
export type UpdateSettings = z.infer<typeof updateSettingsSchema>;
