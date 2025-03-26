import { useLocation } from "wouter";
import { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { X, Menu } from "lucide-react";

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <header className="bg-white border-b border-gray-200 md:py-2 md:px-6 shadow-sm z-10">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4">
        <h1 className="text-xl font-bold">HabitTrack</h1>
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <button className="p-1">
              <i className="ri-menu-line text-2xl"></i>
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-800">HabitTrack</h1>
                <button onClick={() => setIsMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navItems.map(item => (
                  <a 
                    key={item.path}
                    href={item.path}
                    className={`flex items-center px-3 py-2 hover:bg-gray-100 rounded-md ${
                      location === item.path ? "text-gray-800 bg-gray-100" : "text-gray-600"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className={`${item.icon} mr-3 ${location === item.path ? "text-primary" : ""}`}></i>
                    {item.label}
                  </a>
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
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search habits..." 
            className="bg-gray-100 py-2 px-4 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white w-64"
          />
          <i className="ri-search-line absolute right-3 top-2.5 text-gray-400"></i>
        </div>
      </div>
    </header>
  );
}
