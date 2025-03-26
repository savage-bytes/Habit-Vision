// Habit frequencies
export const FREQUENCIES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  CUSTOM: "custom",
};

// Habit categories with their corresponding colors
export const CATEGORIES = {
  HEALTH: "health",
  FITNESS: "fitness",
  EDUCATION: "education",
  WELLNESS: "wellness",
  WORK: "work",
  PERSONAL: "personal",
};

// Category colors (matching the getCategoryColor function in utils.ts)
export const CATEGORY_COLORS = {
  [CATEGORIES.HEALTH]: "#10b981", // green-500
  [CATEGORIES.FITNESS]: "#6366f1", // indigo-500
  [CATEGORIES.EDUCATION]: "#8b5cf6", // violet-500
  [CATEGORIES.WELLNESS]: "#ec4899", // pink-500
  [CATEGORIES.WORK]: "#f59e0b", // amber-500
  [CATEGORIES.PERSONAL]: "#3b82f6", // blue-500
};

// Theme options
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

// App routes
export const ROUTES = {
  DASHBOARD: "/",
  CALENDAR: "/calendar",
  STATISTICS: "/statistics",
  SETTINGS: "/settings",
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME_PREFERENCE: "habittrack-theme-preference",
  USER_SETTINGS: "habittrack-user-settings",
};

// Date formats
export const DATE_FORMATS = {
  API_DATE: "yyyy-MM-dd",
  DISPLAY_DATE: "MMM d, yyyy",
  SHORT_DAY: "EEE",
  FULL_DAY: "EEEE",
  MONTH_YEAR: "MMMM yyyy",
};
