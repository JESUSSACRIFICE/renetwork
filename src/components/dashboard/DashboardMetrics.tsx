"use client";

import { FileText, CheckCircle2, Hourglass, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardMetricsProps {
  userType: "buyer" | "agent";
  profile?: any;
}

export function DashboardMetrics({ userType, profile }: DashboardMetricsProps) {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userType, profile?.id]);

  const fetchMetrics = async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      // For now, use default metrics until tables are created
      // TODO: Fetch actual metrics from Supabase when tables exist
      if (userType === "agent") {
        setMetrics([
          {
            label: "Posted Services",
            value: "0", // Replace with actual count when services table exists
            icon: FileText,
            color: "bg-blue-100 text-blue-600",
          },
          {
            label: "Completed Services",
            value: "0", // Replace with actual count
            icon: CheckCircle2,
            color: "bg-green-100 text-green-600",
          },
          {
            label: "In Queue Services",
            value: "0", // Replace with actual count
            icon: Hourglass,
            color: "bg-orange-100 text-orange-600",
          },
          {
            label: "Reviews",
            value: "0", // Replace with actual count when reviews table exists
            icon: MessageSquare,
            color: "bg-purple-100 text-purple-600",
          },
        ]);
      } else {
        setMetrics([
          {
            label: "Posted Projects",
            value: "0", // Replace with actual count when projects table exists
            icon: FileText,
            color: "bg-blue-100 text-blue-600",
          },
          {
            label: "Completed Projects",
            value: "0", // Replace with actual count
            icon: CheckCircle2,
            color: "bg-green-100 text-green-600",
          },
          {
            label: "Proposals",
            value: "0", // Replace with actual count
            icon: Hourglass,
            color: "bg-orange-100 text-orange-600",
          },
          {
            label: "Reviews",
            value: "0", // Replace with actual count when reviews table exists
            icon: MessageSquare,
            color: "bg-purple-100 text-purple-600",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
      // Use default metrics on error
      setMetrics(userType === "buyer" ? buyerMetrics : agentMetrics);
    } finally {
      setLoading(false);
    }
  };

  // Fallback metrics if data not loaded yet
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

  const displayMetrics = loading || metrics.length === 0 
    ? (userType === "buyer" ? buyerMetrics : agentMetrics)
    : metrics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayMetrics.map((metric) => (
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
