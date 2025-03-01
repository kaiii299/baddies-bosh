"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Pie, PieChart, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Label } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import CountUp from "@/components/countup"
import { DashboardCharts } from '@/components/dashboard/charts';
import { Tools } from "@prisma/client"
// Fetch data from the API
async function getToolsData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/tools`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch tools');
    }

    return res.json();
  } catch (error) {
    console.error('Error loading tools:', error);
    return [];
  }
}

export default async function Dashboard() {
  // Get the actual tools data
  const tools = await getToolsData();

  // Calculate metrics
  const totalTools = tools.length;

  // Tools in use count
  const toolsInUse = tools.filter((tool: Tools) => tool.inUse?.toLowerCase() === 'yes').length;
  const inUsePercentage = totalTools > 0 ? Math.round((toolsInUse / totalTools) * 100) : 0;

  // Count unique brands
  const uniqueBrands = new Set(tools.map((tool: Tools) => tool.brand)).size;

  // Count tools needing calibration soon (within 3 months)
  const toolsNeedingCalibration = tools.filter((tool: Tools) => {
    const months = parseInt(tool.remainingMonths || '999');
    return !isNaN(months) && months <= 3 && months >= 0;
  }).length;

  // Real dynamic card data
  const cardData = [
    {
      title: "Total Tools",
      description: "Total inventory count",
      value: totalTools
    },
    {
      title: "Tools In Use",
      description: `${inUsePercentage}% of inventory`,
      value: toolsInUse
    },
    {
      title: "Unique Brands",
      description: "Different manufacturers",
      value: uniqueBrands
    },
    {
      title: "Need Calibration",
      description: "Within next 3 months",
      value: toolsNeedingCalibration
    },
  ]

  // Process brand data for pie chart
  const brandCounts = tools.reduce((acc: Record<string, number>, tool: Tools) => {
    const brand = tool.brand || 'Other';
    acc[brand] = (acc[brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convert to chart data format and get top 5 brands
  interface BrandChartItem {
    browser: string;
    visitors: number;
    fill: string;
  }

  const brandChartData = Object.entries(brandCounts)
    .map(([browser, visitors]) => ({
      browser,
      visitors,
      fill: `var(--color-${browser.toLowerCase().replace(/\s+/g, '-')})`
    } as BrandChartItem))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 5);

  // Process division data for bar chart
  const divisionCounts = tools.reduce((acc: Record<string, number>, tool: Tools) => {
    const division = tool.div || 'Unspecified';
    acc[division] = (acc[division] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convert to chart data format for bar chart
  interface DivisionChartItem {
    month: string;
    value: number;
  }

  const divisionChartData = Object.entries(divisionCounts)
    .map(([month, value]) => ({ month, value } as DivisionChartItem))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Calculate total for pie chart
  const totalItems = brandChartData.reduce((acc: number, curr) => acc + curr.visitors, 0);

  // Chart colors
  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
    'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  // Chart config
  const chartConfig = {
    visitors: { label: "Tools" },
    chrome: { label: brandChartData[0]?.browser || "Brand 1", color: "hsl(var(--chart-1))" },
    safari: { label: brandChartData[1]?.browser || "Brand 2", color: "hsl(var(--chart-2))" },
    firefox: { label: brandChartData[2]?.browser || "Brand 3", color: "hsl(var(--chart-3))" },
    edge: { label: brandChartData[3]?.browser || "Brand 4", color: "hsl(var(--chart-4))" },
    other: { label: brandChartData[4]?.browser || "Other", color: "hsl(var(--chart-5))" },
  } satisfies ChartConfig;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {cardData.map((card, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center">
              <h2 className="text-4xl font-bold">
                <CountUp
                  from={0}
                  to={card.value}
                  separator=","
                  direction="up"
                  duration={1}
                  className="count-up-text"
                />
              </h2>
            </CardContent>
            <CardFooter className="flex justify-between"></CardFooter>
          </Card>
        ))}
      </div>

      <div className="w-full my-7 space-y-8">
        {/* Charts Section - Side by Side (Pie + Bar) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Pie Chart Card */}
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Top Tool Brands</CardTitle>
              <CardDescription>Inventory Distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[300px]"
              >
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={brandChartData}
                    dataKey="visitors"
                    nameKey="browser"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {brandChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                {totalItems.toLocaleString()}
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                Tools
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                {brandChartData[0]?.browser} is most common
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Showing distribution of top {brandChartData.length} brands
              </div>
            </CardFooter>
          </Card>

          {/* Bar Chart Card */}
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Tools by Division</CardTitle>
              <CardDescription>Department Distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={divisionChartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex items-center justify-between text-sm">
              <span>Division with most tools: {divisionChartData[0]?.month}</span>
            </CardFooter>
          </Card>
        </div>

        {/* Add the DashboardCharts component below the original charts */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Tool Analytics <span className="text-sm text-slate-400">(using AI)</span></h2>
          <DashboardCharts tools={tools} />
        </div>
      </div>
    </div>
  )
}

