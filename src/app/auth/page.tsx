"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { z } from "zod";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export default function Auth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      // Handle email not confirmed error - allow login anyway
      if (error) {
        // Check if error is about email confirmation
        if (error.message?.includes("Email not confirmed") || 
            error.message?.includes("email_not_confirmed") ||
            error.message?.toLowerCase().includes("email") && error.message?.toLowerCase().includes("confirm")) {
          
          // Try to sign in anyway by using a workaround
          // First, try to get user by email to verify credentials
          try {
            // Attempt to create a session by signing in again with a different approach
            // Or redirect to dashboard where they can resend verification
            toast.warning("Email not verified. Redirecting to dashboard where you can verify your email.");
            
            // Try to get user info if possible
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData?.user?.id;
            
            if (userId) {
              // Check if profile exists to determine redirect
              const { data: profile } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", userId)
                .maybeSingle();

              if (!profile) {
                router.push("/register");
              } else {
                router.push("/dashboard/settings");
              }
            } else {
              // No user session, show resend option on auth page
              setUnverifiedEmail(loginData.email);
            }
            return;
          } catch (innerError) {
            // If we can't get user, show resend option on auth page
            console.error("Error handling unverified email:", innerError);
            setUnverifiedEmail(loginData.email);
            toast.warning("Email not verified. Please verify your email to continue.");
            return;
          }
        }
        throw error;
      }

      toast.success("Welcome back!");
      
      // Check if email is verified
      if (data.user && !data.user.email_confirmed_at) {
        toast.info("Your email is not yet verified. You can verify it later from your dashboard.");
      }
      
      // Check if profile exists, if not redirect to setup
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!profile) {
        router.push("/register");
      } else {
        router.push(`/profile/${data.user.id}`);
      }
    } catch (error: any) {
      // If it's still an email confirmation error, show resend option on this page
      if (error.message?.includes("Email not confirmed") || 
          error.message?.includes("email_not_confirmed") ||
          (error.message?.toLowerCase().includes("email") && error.message?.toLowerCase().includes("confirm"))) {
        setUnverifiedEmail(loginData.email);
        toast.warning("Email not verified. Please verify your email to continue.");
      } else {
        toast.error(error.message || "Failed to sign in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    
    setIsResendingVerification(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unverifiedEmail,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      toast.success("Verification email sent! Please check your inbox (and spam folder).");
      setUnverifiedEmail(null);
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/dashboard/reset-password`,
      });

      if (error) throw error;

      toast.success("Password reset email sent! Check your inbox.");
      setIsResetDialogOpen(false);
      setResetEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsResetting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const passwordValidation = passwordSchema.safeParse(registerData.password);
    if (!passwordValidation.success) {
      toast.error(passwordValidation.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: registerData.firstName,
            last_name: registerData.lastName,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }

      console.log('Sign up response:', { 
        user: data.user?.id, 
        emailConfirmed: data.user?.email_confirmed_at,
        session: data.session 
      });

      // If session was created, user is logged in
      if (data.session) {
        toast.success("Account created! You can verify your email later from your dashboard.");
        router.push("/register");
        return;
      }

      // If no session but user exists, email confirmation might be required
      if (data.user) {
        if (!data.user.email_confirmed_at) {
          toast.success("Account created! A verification email has been sent. You can verify it later - continuing to registration now.");
          console.log('Verification email should have been sent to:', registerData.email);
          console.log('Redirect URL configured:', redirectUrl);
        } else {
          toast.success("Account created! Please choose your registration type.");
        }
        
        // Try to sign in automatically to create a session
        // This works if email confirmation is disabled in Supabase settings
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: registerData.email,
            password: registerData.password,
          });
          
          if (!signInError && signInData.session) {
            console.log('Auto sign-in successful, session created');
          }
        } catch (autoSignInError) {
          console.log('Auto sign-in failed (email confirmation may be required):', autoSignInError);
          // Continue anyway - user can verify email later
        }
        
        router.push("/register");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">
              RE
            </div>
            <span className="font-bold text-2xl">RE Network</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Welcome</h1>
          <p className="text-muted-foreground">
            Sign in to your account or create a new one
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <div className="bg-card rounded-2xl p-8 border shadow-lg">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="w-full text-sm text-muted-foreground">
                      Forgot your password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription>
                        Enter your email address and we&apos;ll send you a link to reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="you@example.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isResetting}>
                        {isResetting ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                
                {/* Email Verification Alert */}
                {unverifiedEmail && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Email Not Verified
                        </h3>
                        <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                          Your email address ({unverifiedEmail}) has not been verified yet. Please check your inbox for the verification email.
                        </p>
                        <div className="mt-3">
                          <Button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={isResendingVerification}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            {isResendingVerification ? "Sending..." : "Resend Verification Email"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </TabsContent>

          <TabsContent value="register">
            <div className="bg-card rounded-2xl p-8 border shadow-lg">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      placeholder="John"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      placeholder="Doe"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}






