"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DebugRegistrationPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkRegistration();
  }, []);

  const checkRegistration = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      setProfile(profileData);

      const profileInfo = profileData as any;
      const supabaseClient = supabase as any;
      const info: any = {
        userId: currentUser.id,
        userEmail: currentUser.email,
        hasProfile: !!profileData,
        userType: profileInfo?.user_type || "NOT SET",
        registrationStatus: profileInfo?.registration_status || "NOT SET",
        hasFirstName: !!profileInfo?.first_name,
        hasLastName: !!profileInfo?.last_name,
        hasFullName: !!profileInfo?.full_name,
        firstName: profileInfo?.first_name || "NOT SET",
        lastName: profileInfo?.last_name || "NOT SET",
        fullName: profileInfo?.full_name || "NOT SET",
        email: profileInfo?.email || "NOT SET",
        phone: profileInfo?.phone || "NOT SET",
      };

      // Check service provider data
      if (profileInfo?.user_type === "service_provider") {
        const { data: paymentPrefs } = await supabaseClient
          .from("payment_preferences")
          .select("id")
          .eq("user_id", currentUser.id)
          .limit(1)
          .maybeSingle();
        
        const { data: rankings } = await supabaseClient
          .from("preference_rankings")
          .select("id")
          .eq("user_id", currentUser.id)
          .limit(1)
          .maybeSingle();
        
        const { data: eSignatures } = await supabaseClient
          .from("e_signatures")
          .select("id")
          .eq("user_id", currentUser.id)
          .limit(1)
          .maybeSingle();
        
        const { data: identityDocs } = await supabaseClient
          .from("identity_documents")
          .select("id")
          .eq("user_id", currentUser.id)
          .limit(1)
          .maybeSingle();

        info.serviceProvider = {
          hasPaymentPreferences: !!paymentPrefs,
          hasPreferenceRankings: !!rankings,
          hasESignatures: !!eSignatures,
          hasIdentityDocuments: !!identityDocs,
        };
      }

      // Check business buyer data
      if (profileInfo?.user_type === "business_buyer") {
        const { data: buyerInfo } = await supabaseClient
          .from("buyer_basic_info")
          .select("id")
          .eq("user_id", currentUser.id)
          .limit(1)
          .maybeSingle();
        
        const { data: maintenancePlans } = await supabaseClient
          .from("demography_maintenance_plans")
          .select("id")
          .eq("user_id", currentUser.id)
          .limit(1)
          .maybeSingle();

        info.businessBuyer = {
          hasBuyerBasicInfo: !!buyerInfo,
          hasMaintenancePlans: !!maintenancePlans,
        };
      }

      setDebugInfo(info);
    } catch (error: any) {
      console.error("Debug error:", error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading debug information...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Please log in first to check your registration status.</p>
            <Button onClick={() => router.push("/auth")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Registration Debug Information</h1>
          <Button onClick={() => router.push("/dashboard")} variant="outline">
            Try Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <p><strong>User ID:</strong> {debugInfo.userId}</p>
              <p><strong>Email:</strong> {debugInfo.userEmail}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <p><strong>Has Profile:</strong> {debugInfo.hasProfile ? "✅ YES" : "❌ NO"}</p>
              <p><strong>User Type:</strong> {debugInfo.userType}</p>
              <p><strong>Registration Status:</strong> {debugInfo.registrationStatus}</p>
              <p><strong>First Name:</strong> {debugInfo.firstName}</p>
              <p><strong>Last Name:</strong> {debugInfo.lastName}</p>
              <p><strong>Full Name:</strong> {debugInfo.fullName}</p>
              <p><strong>Email:</strong> {debugInfo.email}</p>
              <p><strong>Phone:</strong> {debugInfo.phone}</p>
            </div>
          </CardContent>
        </Card>

        {debugInfo.serviceProvider && (
          <Card>
            <CardHeader>
              <CardTitle>Service Provider Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                <p><strong>Payment Preferences:</strong> {debugInfo.serviceProvider.hasPaymentPreferences ? "✅ YES" : "❌ NO"}</p>
                <p><strong>Preference Rankings:</strong> {debugInfo.serviceProvider.hasPreferenceRankings ? "✅ YES" : "❌ NO"}</p>
                <p><strong>E-Signatures:</strong> {debugInfo.serviceProvider.hasESignatures ? "✅ YES" : "❌ NO"}</p>
                <p><strong>Identity Documents:</strong> {debugInfo.serviceProvider.hasIdentityDocuments ? "✅ YES" : "❌ NO"}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {debugInfo.businessBuyer && (
          <Card>
            <CardHeader>
              <CardTitle>Business Buyer Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                <p><strong>Buyer Basic Info:</strong> {debugInfo.businessBuyer.hasBuyerBasicInfo ? "✅ YES" : "❌ NO"}</p>
                <p><strong>Maintenance Plans:</strong> {debugInfo.businessBuyer.hasMaintenancePlans ? "✅ YES" : "❌ NO"}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Validation Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(() => {
                const shouldAllow = 
                  debugInfo.hasProfile &&
                  debugInfo.userType !== "NOT SET" &&
                  (debugInfo.registrationStatus !== "NOT SET" ||
                   (debugInfo.userType === "service_provider" && debugInfo.hasFirstName && debugInfo.hasLastName) ||
                   (debugInfo.userType === "business_buyer" && debugInfo.hasFullName));
                
                return (
                  <div className={`p-4 rounded-lg ${shouldAllow ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                    <p className={`font-bold ${shouldAllow ? "text-green-800" : "text-red-800"}`}>
                      {shouldAllow ? "✅ SHOULD HAVE ACCESS" : "❌ NO ACCESS - Missing Required Data"}
                    </p>
                    {!shouldAllow && (
                      <div className="mt-2 text-sm text-red-700">
                        <p>Missing:</p>
                        <ul className="list-disc list-inside mt-1">
                          {!debugInfo.hasProfile && <li>Profile record</li>}
                          {debugInfo.userType === "NOT SET" && <li>User type</li>}
                          {debugInfo.registrationStatus === "NOT SET" && <li>Registration status</li>}
                          {debugInfo.userType === "service_provider" && (!debugInfo.hasFirstName || !debugInfo.hasLastName) && (
                            <li>First name or last name</li>
                          )}
                          {debugInfo.userType === "business_buyer" && !debugInfo.hasFullName && (
                            <li>Full name</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={checkRegistration}>Refresh Data</Button>
          <Button onClick={() => router.push("/register")} variant="outline">
            Go to Registration
          </Button>
        </div>
      </div>
    </div>
  );
}

