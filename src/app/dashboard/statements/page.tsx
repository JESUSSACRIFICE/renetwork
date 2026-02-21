"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatementsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Statements
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Statements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Your financial statements will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
