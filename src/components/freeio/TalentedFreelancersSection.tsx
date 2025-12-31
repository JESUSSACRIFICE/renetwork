"use client";

import { Button } from "@/components/ui/button";

export default function TalentedFreelancersSection() {
  return (
    <section className="w-full py-16 overflow-x-hidden">
      <div className="grid lg:grid-cols-2 gap-0 max-w-full">
        {/* Left Side - Light Pink/Peach Background */}
        <div className="bg-gradient-to-br from-pink-50 to-orange-50 py-16 px-4 sm:px-6 lg:px-12 flex items-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              With talented freelancers do more work.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-lg">
                Find Work
              </Button>
              <Button variant="outline" className="px-8 py-6 text-lg border-2">
                Find Talent
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - White Background with Image */}
        <div className="bg-white py-16 px-4 sm:px-6 lg:px-12 flex items-center justify-end">
          <div className="relative w-full max-w-md h-96">
            {/* Placeholder for woman image */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="w-32 h-32 mx-auto mb-4 bg-white/50 rounded-full flex items-center justify-center">
                  <span className="text-4xl">👩</span>
                </div>
                <p className="text-sm">Woman image</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

