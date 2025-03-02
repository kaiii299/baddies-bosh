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
  AreaChart,
  Area,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { ToolData } from "@/types/tool";

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
  // const statusCounts = tools.reduce((acc, tool) => {
  //   const status = tool.inUse || 'Unknown';
  //   acc[status] = (acc[status] || 0) + 1;
  //   return acc;
  // }, {} as Record<string, number>);

  // const statusData = Object.entries(statusCounts)
  //   .map(([name, value]) => ({ name, value }));

  // Process calibrator data
  const calibratorCounts = tools.reduce((acc, tool) => {
    // Use a sensible default for categorization
    const calibrator = tool.calibrator || (tool.standard || 'Other');
    if (calibrator.trim()) {
      acc[calibrator] = (acc[calibrator] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Convert calibrator data for area chart
  const calibratorData = Object.entries(calibratorCounts)
    .filter(([name]) => name !== 'Uncategorized') // Remove uncategorized from display
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Show top 8 calibrators

  // Process calibration interval data
  const intervalCounts = tools.reduce((acc, tool) => {
    const interval = tool.calibrationInterval || 'Unspecified';
    acc[interval] = (acc[interval] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const intervalData = Object.entries(intervalCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Process calibration status data
  const getCalibrationStatus = (tool: ToolData) => {
    if (!tool.remainingMonths) return 'Unknown';
    
    const months = parseInt(tool.remainingMonths);
    if (isNaN(months)) return 'Unknown';
    
    if (months < 0) return 'Overdue';
    if (months <= 2) return 'Drifting';
    return 'Optimal';
  };
  
  const calibrationStatusCounts = tools.reduce((acc, tool) => {
    const status = getCalibrationStatus(tool);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate percentages for progress bars
  const totalToolsWithStatus = 
    (calibrationStatusCounts['Optimal'] || 0) + 
    (calibrationStatusCounts['Drifting'] || 0) + 
    (calibrationStatusCounts['Overdue'] || 0);
  
  const percentOptimal = totalToolsWithStatus ? Math.round((calibrationStatusCounts['Optimal'] || 0) / totalToolsWithStatus * 100) : 0;
  const percentDrifting = totalToolsWithStatus ? Math.round((calibrationStatusCounts['Drifting'] || 0) / totalToolsWithStatus * 100) : 0;
  const percentOverdue = totalToolsWithStatus ? Math.round((calibrationStatusCounts['Overdue'] || 0) / totalToolsWithStatus * 100) : 0;

  // Custom colors for charts
  const COLORS = ['#db2777', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#0ea5e9', '#14b8a6'];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Your Tools Card with Progress Bars */}
      <Card>
        <CardHeader>
          <CardTitle>Calibration status breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                <span className="text-sm font-medium">Optimal</span>
              </div>
              <span className="text-sm">{calibrationStatusCounts['Optimal'] || 0} tools ({percentOptimal}%)</span>
            </div>
            <Progress value={percentOptimal} className="h-2 bg-muted" indicatorColor="#10b981" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                <span className="text-sm font-medium">Due soon</span>
              </div>
              <span className="text-sm">{calibrationStatusCounts['Drifting'] || 0} tools ({percentDrifting}%)</span>
            </div>
            <Progress value={percentDrifting} className="h-2 bg-muted" indicatorColor="#f59e0b" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                <span className="text-sm font-medium">Overdue</span>
              </div>
              <span className="text-sm">{calibrationStatusCounts['Overdue'] || 0} tools ({percentOverdue}%)</span>
            </div>
            <Progress value={percentOverdue} className="h-2 bg-muted" indicatorColor="#ef4444" />
          </div>
          
          <div className="mt-6 pt-4 border-t border-muted">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total tools with known status</span>
              <span className="text-sm font-medium">{totalToolsWithStatus}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {calibrationStatusCounts['Unknown'] || 0} tools with unknown status
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Calibrator Chart - CHANGED TO AREA CHART */}
      <Card>
        <CardHeader>
          <CardTitle>Tools by Calibrator</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={calibratorData} 
              margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
            >
              <defs>
                <linearGradient id="colorCalibrator" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end"
                height={70}
                tick={{ fontSize: 11 }}
              />
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
                formatter={(value) => [`${value} tools`, 'Count']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#8b5cf6" 
                fillOpacity={1}
                fill="url(#colorCalibrator)" 
              />
            </AreaChart>
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
          <div className="text-sm text-muted-foreground mt-4 pt-4 border-t border-muted">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span> {calibrationStatusCounts['Optimal'] || 0} Optimal
            <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mx-1 ml-3"></span> {calibrationStatusCounts['Drifting'] || 0} Drifting
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mx-1 ml-3"></span> {calibrationStatusCounts['Overdue'] || 0} Overdue
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
