"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Business Buyer registration redirects to Service Provider.
 * Service Providers can invest, refer, and provide services.
 */
export default function BusinessBuyerRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/register/service-provider");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
