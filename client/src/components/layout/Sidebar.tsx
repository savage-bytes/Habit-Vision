import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { 
      path: "/", 
      label: "Dashboard", 
      icon: "ri-dashboard-line" 
    },
    { 
      path: "/calendar", 
      label: "Calendar",
      icon: "ri-calendar-line"
    },
    { 
      path: "/statistics", 
      label: "Statistics",
      icon: "ri-bar-chart-2-line" 
    },
    { 
      path: "/settings", 
      label: "Settings",
      icon: "ri-settings-line" 
    }
  ];

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-gray-200 h-full">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">HabitTrack</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map(item => (
          <Link 
            key={item.path}
            href={item.path}
            className={cn(
              "flex items-center px-3 py-2 hover:bg-gray-100 rounded-md",
              location === item.path 
                ? "text-gray-800 active-nav-link pl-2 bg-gray-100" 
                : "text-gray-600"
            )}
          >
            <i className={cn(item.icon, "mr-3", location === item.path ? "text-primary" : "")}></i>
            {item.label}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
            <span>JS</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">John Smith</p>
            <p className="text-xs text-gray-500">john@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
