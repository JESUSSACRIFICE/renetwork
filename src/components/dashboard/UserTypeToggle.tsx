"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Users, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";

export function UserTypeToggle() {
  const router = useRouter();
  const [currentType, setCurrentType] = useState("auto");

  useEffect(() => {
    const updateType = () => {
      const params = new URLSearchParams(window.location.search);
      setCurrentType(params.get("type") || "auto");
    };
    
    updateType();
    // Listen for navigation changes
    window.addEventListener("popstate", updateType);
    return () => window.removeEventListener("popstate", updateType);
  }, []);

  const switchToBuyer = () => {
    const params = new URLSearchParams(window.location.search);
    params.set("type", "buyer");
    router.push(`/dashboard?${params.toString()}`);
  };

  const switchToAgent = () => {
    const params = new URLSearchParams(window.location.search);
    params.set("type", "agent");
    router.push(`/dashboard?${params.toString()}`);
  };

  const useAuto = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("type");
    router.push(`/dashboard?${params.toString()}`);
  };

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border-2 border-primary rounded-lg shadow-lg p-3">
      <div className="text-xs font-semibold text-gray-700 mb-2">Dev Mode: Switch User Type</div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={currentType === "buyer" ? "default" : "outline"}
          onClick={switchToBuyer}
          className="text-xs"
        >
          <Briefcase className="w-3 h-3 mr-1" />
          Buyer
        </Button>
        <Button
          size="sm"
          variant={currentType === "agent" ? "default" : "outline"}
          onClick={switchToAgent}
          className="text-xs"
        >
          <Users className="w-3 h-3 mr-1" />
          Agent
        </Button>
        <Button
          size="sm"
          variant={currentType === "auto" ? "default" : "outline"}
          onClick={useAuto}
          className="text-xs"
        >
          Auto
        </Button>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Current: {currentType === "auto" ? "Auto-detect" : currentType}
      </div>
    </div>
  );
}
