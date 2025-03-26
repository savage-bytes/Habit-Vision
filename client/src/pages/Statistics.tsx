import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { getCategoryColor } from "@/lib/utils";

interface Habit {
  id: number;
  name: string;
  category: string;
  streak: number;
  frequency: string;
  completionRate: number;
}

interface CategoryData {
  category: string;
  count: number;
  completionRate: number;
}

interface StreakHistory {
  date: string;
  streak: number;
}

interface CompletionHistory {
  date: string;
  rate: number;
}

interface StatisticsData {
  habits: Habit[];
  categoryData: CategoryData[];
  streakHistory: StreakHistory[];
  completionHistory: CompletionHistory[];
}

export default function Statistics() {
  const { data, isLoading } = useQuery<StatisticsData>({
    queryKey: ['/api/statistics'],
  });

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Statistics" />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 pb-24 md:pb-6">
          <Tabs defaultValue="overview" className="mb-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="habits">Habits</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Completion Rate by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Skeleton className="h-[250px] w-full" />
                      </div>
                    ) : data?.categoryData && data.categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.categoryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="category" 
                            tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                          />
                          <YAxis tickFormatter={(value) => `${value}%`} />
                          <Tooltip 
                            formatter={(value) => [`${value}%`, 'Completion Rate']}
                            labelFormatter={(label) => label.charAt(0).toUpperCase() + label.slice(1)}
                          />
                          <Bar 
                            dataKey="completionRate" 
                            name="Completion Rate" 
                            fill="#6366f1" 
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                          >
                            {data.categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center">
                        <p className="text-gray-500">No data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Habit Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Skeleton className="h-[250px] w-full" />
                      </div>
                    ) : data?.categoryData && data.categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={data.categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="category"
                            label={({ name, percent }) => 
                              `${name.charAt(0).toUpperCase() + name.slice(1)}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {data.categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [value, 'Habits']}
                            labelFormatter={(label) => label.charAt(0).toUpperCase() + label.slice(1)}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center">
                        <p className="text-gray-500">No data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="habits" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Habit Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[400px] flex items-center justify-center">
                      <Skeleton className="h-[350px] w-full" />
                    </div>
                  ) : data?.habits && data.habits.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart 
                        data={data.habits}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={90}
                          tickFormatter={(value) => 
                            value.length > 15 ? value.substring(0, 15) + '...' : value
                          }
                        />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Completion Rate']}
                        />
                        <Bar 
                          dataKey="completionRate" 
                          name="Completion Rate" 
                          fill="#6366f1" 
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                        >
                          {data.habits.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center">
                      <p className="text-gray-500">No habit data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trends" className="mt-4">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Streak History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Skeleton className="h-[250px] w-full" />
                      </div>
                    ) : data?.streakHistory && data.streakHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.streakHistory}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            }}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(label) => 
                              new Date(label).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })
                            }
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="streak" 
                            name="Streak" 
                            stroke="#6366f1" 
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center">
                        <p className="text-gray-500">No streak history available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Completion Rate Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Skeleton className="h-[250px] w-full" />
                      </div>
                    ) : data?.completionHistory && data.completionHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.completionHistory}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            }}
                          />
                          <YAxis tickFormatter={(value) => `${value}%`} />
                          <Tooltip 
                            formatter={(value) => [`${value}%`, 'Completion Rate']}
                            labelFormatter={(label) => 
                              new Date(label).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })
                            }
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="rate" 
                            name="Completion Rate" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center">
                        <p className="text-gray-500">No completion history available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
