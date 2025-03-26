import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Moon, Sun, Smartphone, Monitor, Download, Upload, Trash2 } from "lucide-react";
import { format } from "date-fns";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SettingsData {
  theme: "light" | "dark" | "system";
  notificationsEnabled: boolean;
  reminderTime: string;
  syncData: boolean;
  lastSyncDate: string | null;
}

export default function Settings() {
  const { toast } = useToast();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const { data: settings, isLoading } = useQuery<SettingsData>({
    queryKey: ['/api/settings'],
  });

  const updateSetting = async (key: string, value: any) => {
    try {
      await apiRequest("PATCH", "/api/settings", { [key]: value });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings updated",
        description: "Your settings have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to export data');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habittrack-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Data exported",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetAllData = async () => {
    try {
      await apiRequest("DELETE", "/api/reset", undefined);
      queryClient.invalidateQueries();
      setIsResetDialogOpen(false);
      toast({
        title: "Data reset",
        description: "All your data has been reset successfully.",
      });
    } catch (error) {
      toast({
        title: "Reset failed",
        description: "Failed to reset your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Settings" />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 pb-24 md:pb-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the application looks on your device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sun className="h-5 w-5 text-amber-500" />
                    <Label htmlFor="theme-light">Light Theme</Label>
                  </div>
                  <Switch 
                    id="theme-light" 
                    checked={settings?.theme === 'light'}
                    onCheckedChange={() => updateSetting('theme', 'light')}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Moon className="h-5 w-5 text-indigo-500" />
                    <Label htmlFor="theme-dark">Dark Theme</Label>
                  </div>
                  <Switch 
                    id="theme-dark" 
                    checked={settings?.theme === 'dark'}
                    onCheckedChange={() => updateSetting('theme', 'dark')}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-gray-500" />
                    <Label htmlFor="theme-system">Use System Theme</Label>
                  </div>
                  <Switch 
                    id="theme-system" 
                    checked={settings?.theme === 'system'}
                    onCheckedChange={() => updateSetting('theme', 'system')}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <Switch 
                    id="notifications" 
                    checked={settings?.notificationsEnabled || false}
                    onCheckedChange={(checked) => updateSetting('notificationsEnabled', checked)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminder-time">Default Reminder Time</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      id="reminder-time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      value={settings?.reminderTime || "08:00"}
                      onChange={(e) => updateSetting('reminderTime', e.target.value)}
                      disabled={isLoading || !settings?.notificationsEnabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Manage your habit tracking data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5 text-blue-500" />
                    <Label htmlFor="sync-data">Sync Data Across Devices</Label>
                  </div>
                  <Switch 
                    id="sync-data" 
                    checked={settings?.syncData || false}
                    onCheckedChange={(checked) => updateSetting('syncData', checked)}
                    disabled={isLoading}
                  />
                </div>
                
                {settings?.lastSyncDate && (
                  <p className="text-sm text-gray-500">
                    Last synced: {new Date(settings.lastSyncDate).toLocaleString()}
                  </p>
                )}
                
                <Separator />
                
                <div className="flex flex-col space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center" 
                      onClick={exportData}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Import Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions that will affect your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full flex items-center justify-center"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Reset All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will permanently delete all your habits, completions, and statistics.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={resetAllData}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Reset All Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">
                  Warning: Resetting all data will permanently delete everything and cannot be reversed.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
