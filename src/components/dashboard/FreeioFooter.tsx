"use client";

import { ChevronUp } from "lucide-react";

export function FreeioFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 w-full">
      <div className="w-full px-4">
        <div className="flex items-center justify-between max-w-[1920px] mx-auto">
          <p className="text-sm text-gray-600">
            © Freeio. 2022 CreativeLayers. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 text-gray-600">
            <span className="text-sm">English</span>
            <button className="p-1 hover:bg-gray-100 rounded">
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
