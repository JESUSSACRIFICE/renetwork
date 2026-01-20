"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { FreeioDashboardHeader } from "@/components/dashboard/FreeioDashboardHeader";
import { FreeioFooter } from "@/components/dashboard/FreeioFooter";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

type UserType = "buyer" | "agent";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userType, setUserType] = useState<"buyer" | "agent">("agent");
  const [loading, setLoading] = useState(true);
  const [resendingEmail, setResendingEmail] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }
    setUser(user);
    await fetchProfile(user.id);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*, user_roles(role)")
      .eq("id", userId)
      .maybeSingle();
    setProfile(data);
    const hasRoles = data?.user_roles && data.user_roles.length > 0;
    setUserType((hasRoles ? "agent" : "buyer") as UserType);
  };

  const resendVerificationEmail = async () => {
    if (!user?.email) {
      toast.error("No email address found");
      return;
    }

    setResendingEmail(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      // Use Supabase's resend method for verification emails
      // Note: This requires the user's email and will send a new confirmation email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        // If resend fails, it might be because the method signature changed
        // Try alternative approach: trigger via API
        console.warn("Resend method failed, trying alternative:", error);
        throw error;
      }

      toast.success("Verification email sent! Please check your inbox (and spam folder).");
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      
      // Provide helpful error message
      if (error.message?.includes("rate limit") || error.message?.includes("too many")) {
        toast.error("Too many requests. Please wait a few minutes before trying again.");
      } else {
        toast.error(
          error.message || 
          "Failed to send verification email. Please check your Supabase email settings or try again later."
        );
      }
    } finally {
      setResendingEmail(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <FreeioDashboardHeader user={user} profile={profile} userType={userType} />
        <div className="flex flex-1">
          <DashboardSidebar userType={userType} profile={profile} />
          <main className="flex-1 p-8 bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
            
            {/* Email Verification Status */}
            {user && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Email Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user.email_confirmed_at ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-gray-900">Email Verified</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">
                              Verified on {new Date(user.email_confirmed_at).toLocaleDateString()}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-yellow-600" />
                          <div>
                            <p className="font-medium text-gray-900">Email Not Verified</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">
                              Please verify your email to access all features
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    {!user.email_confirmed_at && (
                      <Button
                        onClick={resendVerificationEmail}
                        disabled={resendingEmail}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        {resendingEmail ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4" />
                            Resend Verification Email
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {!user.email_confirmed_at && (
                    <Alert>
                      <AlertTitle>Email Verification Required</AlertTitle>
                      <AlertDescription>
                        Your email address has not been verified yet. Please check your inbox for the verification email.
                        If you didn&apos;t receive it, click the button above to resend it.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">More settings will appear here.</p>
              </CardContent>
            </Card>
          </main>
        </div>
        <FreeioFooter />
      </div>
    </SidebarProvider>
  );
}
