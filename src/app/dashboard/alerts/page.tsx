"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AlertsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Jobs Alerts</h1>
      <Card>
        <CardHeader>
          <CardTitle>Jobs Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Your job alerts will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
