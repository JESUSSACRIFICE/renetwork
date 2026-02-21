"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApplicantsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Jobs Applicants
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Job Applicants</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Job applicants will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
