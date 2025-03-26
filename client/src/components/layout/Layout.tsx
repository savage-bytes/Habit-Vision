import React from "react";
import { useLocation } from "wouter";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNavigation from "./BottomNavigation";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  
  // Get the title based on the current path
  const getTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/calendar":
        return "Calendar";
      case "/statistics":
        return "Statistics";
      case "/settings":
        return "Settings";
      default:
        return "HabitTrack";
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={getTitle()} />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 pb-24 md:pb-6">
          {children}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
