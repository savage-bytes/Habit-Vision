import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function BottomNavigation() {
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
      icon: "ri-user-line" 
    }
  ];

  return (
    <nav className="md:hidden flex items-center justify-around bg-white border-t border-gray-200 py-3 px-4 fixed bottom-0 left-0 right-0 z-10">
      {navItems.map(item => (
        <Link
          key={item.path}
          href={item.path}
          className={cn(
            "flex flex-col items-center",
            location === item.path ? "text-primary" : "text-gray-500"
          )}
        >
          <i className={`${item.icon} text-xl`}></i>
          <span className="text-xs mt-1">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
