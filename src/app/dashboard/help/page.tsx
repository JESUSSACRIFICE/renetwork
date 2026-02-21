"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Help & Support
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Help & Support</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Help and support resources will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
