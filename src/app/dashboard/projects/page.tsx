"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        My Projects
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Your projects will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
