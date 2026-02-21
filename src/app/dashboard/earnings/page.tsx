"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EarningsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Earnings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Your earnings will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
