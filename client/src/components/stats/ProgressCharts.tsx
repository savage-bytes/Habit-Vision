import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryColor } from "@/lib/utils";

interface CategoryCompletion {
  category: string;
  completionRate: number;
  count: number;
}

interface MonthlyProgress {
  date: string;
  completionRate: number;
}

interface ChartData {
  categoryCompletions: CategoryCompletion[];
  monthlyProgress: MonthlyProgress[];
  overallCompletionRate: number;
}

export default function ProgressCharts() {
  const { data, isLoading } = useQuery<ChartData>({
    queryKey: ['/api/charts'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <div className="h-[180px] w-full flex items-center justify-center">
                <Skeleton className="h-[150px] w-[150px] rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Handle case when data is not available
  if (!data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px] flex items-center justify-center">
              <p className="text-gray-500">No data available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px] flex items-center justify-center">
              <p className="text-gray-500">No data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Completion Rate by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={data.categoryCompletions}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="completionRate"
                  nameKey="category"
                >
                  {data.categoryCompletions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Completion Rate']}
                  labelFormatter={(label) => label.charAt(0).toUpperCase() + label.slice(1)}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="flex flex-wrap justify-center mt-4 gap-3">
              {data.categoryCompletions.map((category, index) => (
                <div key={index} className="flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: getCategoryColor(category.category) }}
                  ></span>
                  <span className="text-xs">
                    {category.category.charAt(0).toUpperCase() + category.category.slice(1)} ({category.completionRate}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                  tickMargin={5}
                  tick={{fontSize: 12}}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tickFormatter={(value) => `${value}%`}
                  tick={{fontSize: 12}}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Completion Rate']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                />
                <Line 
                  type="monotone" 
                  dataKey="completionRate" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#6366f1", strokeWidth: 1 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
