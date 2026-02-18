"use client";

import { FileText, CheckCircle2, Hourglass, MessageSquare } from "lucide-react";

interface DashboardMetricsProps {
  userType: "service_provider" | "agent";
}

export function DashboardMetrics({ userType }: DashboardMetricsProps) {
  // These would typically come from your API/database
  const buyerMetrics = [
    {
      label: "Posted Projects",
      value: "1",
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Completed Projects",
      value: "1",
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Proposals",
      value: "0",
      icon: Hourglass,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Reviews",
      value: "1",
      icon: MessageSquare,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const agentMetrics = [
    {
      label: "Posted Services",
      value: "2",
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Completed Services",
      value: "2",
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "In Queue Services",
      value: "5",
      icon: Hourglass,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Reviews",
      value: "1",
      icon: MessageSquare,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const metrics = userType === "buyer" ? buyerMetrics : agentMetrics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
            </div>
            <div className={`${metric.color} p-3 rounded-full`}>
              <metric.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
