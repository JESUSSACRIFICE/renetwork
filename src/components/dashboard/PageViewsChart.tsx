"use client";

import { useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageViewsChartProps {
  userType: "service_provider" | "agent";
}

export function PageViewsChart({ userType }: PageViewsChartProps) {
  const [selectedProject, setSelectedProject] = useState(
    userType === "service_provider"
      ? "as das da"
      : "Easy to build your own playlists...",
  );
  const [selectedDays, setSelectedDays] = useState("15 days");

  // Sample data - in a real app, this would come from your API
  const chartData =
    userType === "service_provider"
      ? [
          { date: "Dec 24, 2025", views: 0.1 },
          { date: "Dec 27, 2025", views: 0.1 },
          { date: "Dec 30, 2025", views: 0.1 },
          { date: "Jan 2, 2026", views: 0.1 },
          { date: "Jan 7, 2026", views: 0.1 },
        ]
      : [
          { date: "Dec 24, 2025", views: 1.0 },
          { date: "Dec 27, 2025", views: 2.5 },
          { date: "Dec 30, 2025", views: 2.8 },
          { date: "Jan 2, 2026", views: 1.5 },
          { date: "Jan 4, 2026", views: 2.9 },
          { date: "Jan 7, 2026", views: 1.8 },
        ];

  const chartConfig = {
    views: {
      label: "Page Views",
      color: "hsl(221, 83%, 53%)",
    },
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">
          Page Views
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mb-4">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={
                  userType === "service_provider" ? [-1.0, 1.0] : [0.5, 3.0]
                }
                ticks={
                  userType === "service_provider"
                    ? [-1.0, -0.8, -0.6, -0.4, -0.2, 0.0, 0.2]
                    : [0.5, 1.0, 1.5, 2.0, 2.5, 3.0]
                }
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="views"
                stroke="hsl(221, 83%, 53%)"
                strokeWidth={2}
                dot={{ fill: "hsl(221, 83%, 53%)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              {userType === "service_provider" ? "Projects" : "Projects"}
            </label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={selectedProject}>
                  {selectedProject}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Number Days
            </label>
            <Select value={selectedDays} onValueChange={setSelectedDays}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7 days">7 days</SelectItem>
                <SelectItem value="15 days">15 days</SelectItem>
                <SelectItem value="30 days">30 days</SelectItem>
                <SelectItem value="90 days">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
