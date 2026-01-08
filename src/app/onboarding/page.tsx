"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { db, isMockMode } from "@/lib/db-helper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ChevronRight, Loader2, Plus, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ONBOARDING_STEPS = [
  {
    id: "first_service_post",
    name: "First Service Post",
    description: "Post the first service you'll offer",
    icon: Plus,
  },
  {
    id: "profile_specialty",
    name: "Profile Specialty",
    description: "What you want to be known for within the network",
    icon: UserPlus,
  },
  {
    id: "agency_setup",
    name: "Agency Profile",
    description: "Find or create agency profile you work for",
    icon: Search,
  },
  {
    id: "refer_someone",
    name: "Refer Someone",
    description: "Refer someone to join the network",
    icon: UserPlus,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Form states
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [specialtyDescription, setSpecialtyDescription] = useState("");
  const [agencySearch, setAgencySearch] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [referralEmail, setReferralEmail] = useState("");
  const [referralName, setReferralName] = useState("");

  useEffect(() => {
    checkAuth();
    loadOnboardingSteps();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await db.getUser();
    
    if (!user) {
      if (!isMockMode()) {
        router.push("/auth");
        return;
      }
      // In mock mode, auto-create user
      const { data: mockUser } = await db.getUser();
      if (!mockUser?.user) return;
    }

    // Check registration status (skip in mock mode for testing)
    if (!isMockMode()) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("registration_status")
        .eq("id", user?.id || "")
        .maybeSingle();

      if (profile && (profile as any).registration_status && (profile as any).registration_status !== "approved") {
        toast.info("Your registration is pending approval. You&apos;ll be notified via email once approved.");
        router.push("/dashboard");
        return;
      }
    }
  };

  const loadOnboardingSteps = async () => {
    const {
      data: { user },
    } = await db.getUser();
    if (!user) return;

    const result = await db.select("onboarding_steps", { field: "user_id", value: user.id });
    
    if (result.data) {
      const completed = result.data
        .filter((s: any) => s.completed)
        .map((s: any) => s.step_name);
      setCompletedSteps(completed);
    }
  };

  const markStepComplete = async (stepName: string, data?: any) => {
    const {
      data: { user },
    } = await db.getUser();
    if (!user) return;

    await db.upsert("onboarding_steps", {
      user_id: user.id,
      step_name: stepName,
      completed: true,
      completed_at: new Date().toISOString(),
      data: data || {},
    });

    setCompletedSteps((prev) => [...prev, stepName]);
    toast.success("Step completed!");
  };

  const handleFirstServicePost = async () => {
    if (!serviceTitle || !serviceDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await markStepComplete("first_service_post", {
        title: serviceTitle,
        description: serviceDescription,
      });

      toast.success("Service post created successfully!");
      setCurrentStep(1);
    } catch (error: any) {
      toast.error(error.message || "Failed to create service post");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSpecialty = async () => {
    if (!specialtyDescription) {
      toast.error("Please enter what you want to be known for");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await db.getUser();
      if (!user) return;

      await db.upsert("profiles", {
        id: user.id,
        bio: specialtyDescription,
      });

      await markStepComplete("profile_specialty", {
        specialty: specialtyDescription,
      });

      toast.success("Profile specialty saved!");
      setCurrentStep(2);
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile specialty");
    } finally {
      setLoading(false);
    }
  };

  const handleAgencySetup = async () => {
    if (!agencySearch && !agencyName) {
      toast.error("Please search for an agency or create a new one");
      return;
    }

    setLoading(true);
    try {
      await markStepComplete("agency_setup", {
        agency_name: agencyName || agencySearch,
        action: agencyName ? "created" : "found",
      });

      toast.success(agencyName ? "Agency created!" : "Agency linked!");
      setCurrentStep(3);
    } catch (error: any) {
      toast.error(error.message || "Failed to set up agency");
    } finally {
      setLoading(false);
    }
  };

  const handleReferSomeone = async () => {
    if (!referralEmail || !referralName) {
      toast.error("Please enter referral details");
      return;
    }

    setLoading(true);
    try {
      await markStepComplete("refer_someone", {
        email: referralEmail,
        name: referralName,
      });

      toast.success("Referral sent successfully!");

      const allComplete = [...completedSteps, "refer_someone"].length === ONBOARDING_STEPS.length;
      if (allComplete) {
        toast.success("Onboarding complete! Welcome to the network!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setCurrentStep(0);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send referral");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = ONBOARDING_STEPS[currentStep];
    const isCompleted = completedSteps.includes(step.id);

    if (isCompleted) {
      return (
        <div className="text-center py-12">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Step Completed!</h3>
          <p className="text-muted-foreground mb-4">{step.description}</p>
          <Button
            onClick={() => {
              if (currentStep < ONBOARDING_STEPS.length - 1) {
                setCurrentStep(currentStep + 1);
              } else {
                router.push("/dashboard");
              }
            }}
          >
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    }

    switch (step.id) {
      case "first_service_post":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Post Your First Service</h3>
              <p className="text-muted-foreground">
                Create your first service listing to start connecting with clients
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="service-title">
                  Service Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="service-title"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  placeholder="e.g., Real Estate Consulting"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="service-description">
                  Service Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="service-description"
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Describe your service in detail..."
                  rows={6}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleFirstServicePost} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Service
              </Button>
            </div>
          </div>
        );

      case "profile_specialty":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Define Your Specialty</h3>
              <p className="text-muted-foreground">
                What do you want to be known for within the network?
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="specialty">
                  Your Specialty / What You Want to Be Known For{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="specialty"
                  value={specialtyDescription}
                  onChange={(e) => setSpecialtyDescription(e.target.value)}
                  placeholder="e.g., Commercial real estate specialist with 10+ years of experience in retail properties..."
                  rows={6}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleProfileSpecialty} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Specialty
              </Button>
            </div>
          </div>
        );

      case "agency_setup":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Find or Create Agency Profile</h3>
              <p className="text-muted-foreground">
                Link to your agency or create a new agency profile
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="agency-search">Search for Existing Agency</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="agency-search"
                    value={agencySearch}
                    onChange={(e) => setAgencySearch(e.target.value)}
                    placeholder="Search by name..."
                  />
                  <Button type="button" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Search for your agency if it already exists in the network
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <div>
                <Label htmlFor="agency-name">Create New Agency Profile</Label>
                <Input
                  id="agency-name"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Enter agency name..."
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Create a new agency profile if your agency doesn&apos;t exist yet
                </p>
              </div>
              <Button onClick={handleAgencySetup} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {agencyName ? "Create Agency" : "Link Agency"}
              </Button>
            </div>
          </div>
        );

      case "refer_someone":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Refer Someone</h3>
              <p className="text-muted-foreground">
                Help grow the network by referring a colleague or friend
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg mb-4">
              <p className="text-sm font-medium">
                💰 Remember: 25% DISCOUNT FOR EVERY MEMBER YOU BRING ON-BOARD
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="referral-name">
                  Referral Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="referral-name"
                  value={referralName}
                  onChange={(e) => setReferralName(e.target.value)}
                  placeholder="Enter their full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="referral-email">
                  Referral Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="referral-email"
                  value={referralEmail}
                  onChange={(e) => setReferralEmail(e.target.value)}
                  type="email"
                  placeholder="Enter their email address"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleReferSomeone} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Referral
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const allStepsComplete = completedSteps.length === ONBOARDING_STEPS.length;

  if (allStepsComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Onboarding Complete!</h1>
            <p className="text-muted-foreground mb-8">
              You&apos;ve completed all onboarding steps. Welcome to the network!
            </p>
            <Button onClick={() => router.push("/dashboard")} size="lg">
              Go to Dashboard
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Onboarding</h1>
          <p className="text-muted-foreground">
            Finish these steps to fully activate your account
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                      completedSteps.includes(step.id)
                        ? "bg-green-500 text-white"
                        : currentStep === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={cn(
                        "text-xs font-medium",
                        currentStep === index ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.name}
                    </p>
                  </div>
                </div>
                {index < ONBOARDING_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-1 flex-1 mx-2 transition-colors",
                      completedSteps.includes(step.id) ? "bg-green-500" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="p-6">
          <CardContent className="pt-6">{renderStepContent()}</CardContent>
        </Card>
      </div>
    </div>
  );
}

