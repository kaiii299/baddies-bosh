"use client";

import { useState, useEffect } from "react";
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
import { Grip, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ChartProps {
  tools: ToolData[];
}

// Define each card type for the dashboard
type CardType = 
  | "calibration-status"
  | "division-chart"
  | "brand-chart"
  | "calibrator-chart"
  | "interval-chart"
  | "tools-summary";

// Card component that can be dragged
function DraggableCard({ id, children }: { id: CardType; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="h-full">
      <Card className="h-full">
        <CardHeader className="cursor-move" {...attributes} {...listeners}>
          <div className="flex items-center gap-2">
            <Grip className="h-4 w-4 text-muted-foreground" />
            {typeof children === 'object' && 'title' in children ? children.title : null}
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100%-70px)] overflow-hidden">
          {typeof children === 'object' && 'content' in children ? children.content : children}
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardCharts({ tools }: ChartProps) {
  // Default order of cards
  const defaultCards: CardType[] = [
    "calibration-status",
    "division-chart",
    "brand-chart",
    "calibrator-chart",
    "interval-chart",
    "tools-summary",
  ];

  // State for card order
  const [cards, setCards] = useState<CardType[]>(defaultCards);
  const [activeId, setActiveId] = useState<CardType | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Setup drag sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Load saved card order from localStorage on component mount
  useEffect(() => {
    setIsMounted(true);
    const savedCards = localStorage.getItem('dashboard-cards');
    if (savedCards) {
      try {
        setCards(JSON.parse(savedCards));
      } catch (e) {
        console.error("Failed to parse saved card order", e);
      }
    }
  }, []);

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

  // Define card contents
  const cardContents: Record<CardType, { title: React.ReactNode; content: React.ReactNode }> = {
    "calibration-status": {
      title: <CardTitle>Calibration Status</CardTitle>,
      content: (
        <div className="space-y-8 overflow-auto h-full">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span className="text-sm font-medium">Optimal</span>
              </div>
              <span className="text-sm">{calibrationStatusCounts['Optimal'] || 0} tools ({percentOptimal}%)</span>
            </div>
            <Progress value={percentOptimal} indicatorColor="#10b981" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                <span className="text-sm font-medium">Drifting (due soon)</span>
              </div>
              <span className="text-sm">{calibrationStatusCounts['Drifting'] || 0} tools ({percentDrifting}%)</span>
            </div>
            <Progress value={percentDrifting} indicatorColor="#f59e0b" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                <span className="text-sm font-medium">Overdue</span>
              </div>
              <span className="text-sm">{calibrationStatusCounts['Overdue'] || 0} tools ({percentOverdue}%)</span>
            </div>
            <Progress value={percentOverdue} indicatorColor="#ef4444" />
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
        </div>
      )
    },
    "division-chart": {
      title: <CardTitle>Tools by Division</CardTitle>,
      content: (
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
      )
    },
    "brand-chart": {
      title: <CardTitle>Tools by Brand</CardTitle>,
      content: (
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
      )
    },
    "calibrator-chart": {
      title: <CardTitle>Tools by Calibrator</CardTitle>,
      content: (
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
      )
    },
    "interval-chart": {
      title: <CardTitle>Calibration Intervals</CardTitle>,
      content: (
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
      )
    },
    "tools-summary": {
      title: <CardTitle>Tools Summary</CardTitle>,
      content: (
        <div className="h-full flex flex-col justify-center items-center text-center">
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
        </div>
      )
    }
  };

  // Handle drag start
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as CardType);
  }

  // Handle drag end
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex(id => id === active.id);
        const newIndex = items.findIndex(id => id === over.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem('dashboard-cards', JSON.stringify(newOrder));
        return newOrder;
      });
    }
    
    setActiveId(null);
  }

  // Reset layout function
  const resetLayout = () => {
    setCards(defaultCards);
    localStorage.removeItem('dashboard-cards');
  };

  // Only render the grid on the client side to avoid hydration issues
  if (!isMounted) {
    return <div className="py-12 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Grip className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Drag cards to reorganize your dashboard</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetLayout}
          className="flex items-center gap-1"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Layout
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cards} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((id) => (
              <DraggableCard key={id} id={id}>
                {cardContents[id]}
              </DraggableCard>
            ))}
          </div>
        </SortableContext>
        
        <DragOverlay>
          {activeId ? (
            <div className="h-[360px] w-full opacity-80 pointer-events-none">
              <Card className="h-full">
                <CardHeader>
                  {cardContents[activeId].title}
                </CardHeader>
                <CardContent className="h-[calc(100%-70px)]">
                  {cardContents[activeId].content}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
