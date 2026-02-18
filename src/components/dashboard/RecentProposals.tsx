"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar } from "lucide-react";

interface RecentProposalsProps {
  userType: "service_provider" | "agent";
}

export function RecentProposals({ userType }: RecentProposalsProps) {
  // Sample data - in a real app, this would come from your API
  const proposals =
    userType === "service_provider"
      ? [] // Empty for employer (shows "No proposals found")
      : [
          {
            id: 1,
            title: "I will design website UI UX in adobe xd or figma #11055",
            description: "Professional UI/UX design services",
            location: "Los Angeles",
            date: "February 5, 2025",
            cost: "$219",
            status: "Hired",
            statusColor: "bg-blue-500",
          },
          {
            id: 2,
            title: "I will design website UI UX in adobe xd or figma #11054",
            description: "Professional UI/UX design services",
            location: "Los Angeles",
            date: "February 4, 2025",
            cost: "$238",
            status: "Hired",
            statusColor: "bg-blue-500",
          },
          {
            id: 3,
            title: "I will design website UI UX in adobe xd or figma #11053",
            description: "Professional UI/UX design services",
            location: "Los Angeles",
            date: "February 3, 2025",
            cost: "$185",
            status: "Hired",
            statusColor: "bg-blue-500",
          },
          {
            id: 4,
            title: "I will design website UI UX in adobe xd or figma #11052",
            description: "Professional UI/UX design services",
            location: "Los Angeles",
            date: "February 2, 2025",
            cost: "$29",
            status: "Hired",
            statusColor: "bg-blue-500",
          },
          {
            id: 5,
            title: "Easy to build your own playlists...",
            description: "Playlist creation service",
            location: "Los Angeles",
            date: "January 15, 2025",
            cost: "$85",
            status: "Completed",
            statusColor: "bg-blue-500",
          },
        ];

  if (userType === "service_provider") {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            Recent Proposals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">No proposals found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">
          Recent Service Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Title
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Cost/Time
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr
                  key={proposal.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {proposal.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {proposal.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {proposal.location}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {proposal.date}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-900">
                      {proposal.cost}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${proposal.statusColor}`}
                    >
                      {proposal.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Button
                      variant="outline"
                      className="bg-green-500 text-white border-green-500 hover:bg-green-600 hover:text-white"
                      size="sm"
                    >
                      View History
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
