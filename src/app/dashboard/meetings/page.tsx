"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MeetingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Meetings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Your meetings will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
