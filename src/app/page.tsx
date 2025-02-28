"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const cardData = [
  { title: "Metric 1", description: "Some description", value: "100%" },
  { title: "Metric 2", description: "Some description", value: "75%" },
  { title: "Metric 3", description: "Some description", value: "90%" },
  { title: "Metric 4", description: "Some description", value: "90%" },
]

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 190, fill: "var(--color-other)" },
]

const barChartData = [
  { month: "Jan", value: 30 },
  { month: "Feb", value: 60 },
  { month: "Mar", value: 80 },
  { month: "Apr", value: 45 },
  { month: "May", value: 95 },
]

const chartConfig = {
  visitors: { label: "Visitors" },
  chrome: { label: "Chrome", color: "hsl(var(--chart-1))" },
  safari: { label: "Safari", color: "hsl(var(--chart-2))" },
  firefox: { label: "Firefox", color: "hsl(var(--chart-3))" },
  edge: { label: "Edge", color: "hsl(var(--chart-4))" },
  other: { label: "Other", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig

export default function Dashboard() {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  }, [])

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {cardData.map((card, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center">
              <h2 className="text-4xl font-bold">{card.value}</h2>
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
              <CardTitle>Pie Chart - Visitors by Browser</CardTitle>
              <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[300px]"
              >
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie data={chartData} dataKey="visitors" nameKey="browser" innerRadius={60} strokeWidth={5}>
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
                                {totalVisitors.toLocaleString()}
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                Visitors
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
                Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Showing total visitors for the last 6 months
              </div>
            </CardFooter>
          </Card>

          {/* Bar Chart Card */}
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Bar Chart - Monthly Performance</CardTitle>
              <CardDescription>January - May 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex items-center justify-between text-sm">
              <span>Data from internal metrics</span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}