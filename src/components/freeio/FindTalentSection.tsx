"use client";

import { Button } from "@/components/ui/button";

export default function FindTalentSection() {
  return (
    <section className="w-full bg-gradient-to-br from-amber-50 to-orange-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Find the talent needed to get your business growing.
            </h2>
            <p className="text-lg text-gray-700">
              Advertise your jobs to millions of monthly users, hire 2 million CVs.
            </p>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-lg">
              Get Started!
            </Button>
          </div>

          {/* Right Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="text-3xl font-bold text-gray-900 mb-2">4.9/5</div>
              <div className="text-sm text-gray-600">Overall rating</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="text-3xl font-bold text-gray-900 mb-2">Award</div>
              <div className="text-sm text-gray-600">Q3 2023 Best Software Awards</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-sm text-gray-600">Customer satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

