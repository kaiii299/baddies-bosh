"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Updated to match your actual schema
type ToolData = {
  serialIdNo: string;
  div?: string;
  description: string;
  standard?: string;
  category?: string;
  brand: string;
  tag?: string;
  modelPartNo?: string;
  range?: string;
  inUse: string;
  calibrationInterval?: string;
  lastCalibration?: string;
  calibrationDue?: string;
  remainingMonths?: string;
};

interface ChartProps {
  tools: ToolData[];
}

export function DashboardCharts({ tools }: ChartProps) {
  // Process division data
  const divisionCounts = tools.reduce((acc, tool) => {
    const div = tool.div || 'Unspecified';
    acc[div] = (acc[div] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const divisionData = Object.entries(divisionCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7); // Limit to top 7 for readability

  // Process brand data
  const brandCounts = tools.reduce((acc, tool) => {
    const brand = tool.brand || 'Unspecified';
    acc[brand] = (acc[brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const brandData = Object.entries(brandCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 brands

  // Process usage status data
  const statusCounts = tools.reduce((acc, tool) => {
    const status = tool.inUse || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCounts)
    .map(([name, value]) => ({ name, value }));

  // Process category data
  const categoryCounts = tools.reduce((acc, tool) => {
    const category = tool.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // Top 6 categories

  // Process calibration interval data
  const intervalCounts = tools.reduce((acc, tool) => {
    const interval = tool.calibrationInterval || 'Unspecified';
    acc[interval] = (acc[interval] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const intervalData = Object.entries(intervalCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Custom colors for charts
  const COLORS = ['#db2777', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#0ea5e9', '#14b8a6'];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Division Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tools by Division</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={divisionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                itemStyle={{
                  color: "hsl(var(--foreground))"
                }}
              />
              <Bar dataKey="value" fill="#db2777" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Brand Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tools by Brand</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={brandData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {brandData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                itemStyle={{
                  color: "hsl(var(--foreground))"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Usage Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tool Status (In Use)</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name.toLowerCase() === 'yes' ? '#10b981' : 
                          entry.name.toLowerCase() === 'no' ? '#ef4444' : 
                          COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                itemStyle={{
                  color: "hsl(var(--foreground))"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tools by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                itemStyle={{
                  color: "hsl(var(--foreground))"
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Calibration Interval Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Calibration Intervals</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={intervalData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {intervalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                itemStyle={{
                  color: "hsl(var(--foreground))"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tools Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center h-[300px] text-center">
          <div className="text-5xl font-bold mb-4 text-pink-600">{tools.length}</div>
          <div className="text-xl mb-2">Total Tools</div>
          <div className="text-sm text-muted-foreground">
            {tools.filter(t => t.inUse?.toLowerCase() === 'yes').length} tools currently in use
          </div>
          <div className="text-sm text-muted-foreground">
            {brandData.length} different brands
          </div>
          <div className="text-sm text-muted-foreground">
            {divisionData.length} divisions
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 