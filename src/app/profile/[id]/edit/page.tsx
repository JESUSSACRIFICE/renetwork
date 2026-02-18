"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BasicInfoForm } from "@/components/profiles/BasicInfoForm";
import { ProfessionalRolesForm } from "@/components/profiles/ProfessionalRolesForm";
import { ExperienceForm } from "@/components/profiles/ExperienceForm";
import { PricingForm } from "@/components/profiles/PricingForm";
import { ServiceAreasForm } from "@/components/profiles/ServiceAreasForm";
import { TrainingForm } from "@/components/profiles/TrainingForm";
import { PaymentPrefsForm } from "@/components/profiles/PaymentPrefsForm";
import { LanguagesForm } from "@/components/profiles/LanguagesForm";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-professional-profiles";

export default function ProfileSetup() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) ?? null;
  const { user, isLoading: authLoading } = useAuth();
  const { data: profile } = useProfile(user?.id ?? null);

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    "English",
  ]);
  const [activeSection, setActiveSection] = useState(0);

  // Redirect: must be logged in and only edit own profile
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/auth");
      return;
    }
    if (id && user.id !== id) {
      router.replace(`/profile/${id}`);
    }
  }, [user, id, authLoading, router]);

  useEffect(() => {
    if (profile && "psp_labels" in profile) {
      setSelectedRoles(profile.psp_labels ?? []);
    }
  }, [profile?.psp_labels]);

  const handleSaveSuccess = (nextSection?: number) => {
    if (typeof nextSection === "number") setActiveSection(nextSection);
  };

  if (authLoading || (!user && !id)) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (user && id && user.id !== id) {
    return null; // redirect in progress
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-muted-foreground">
              Fill out your professional profile to start connecting with
              clients and other professionals.
            </p>
          </div>

          <div className="space-y-6">
            <BasicInfoForm
              userId={user!.id}
              userEmail={user?.email ?? undefined}
              isOpen={activeSection === 0}
              onOpenChange={(open) => open && setActiveSection(0)}
              onSaveSuccess={handleSaveSuccess}
            />

            <ProfessionalRolesForm
              userId={user!.id}
              selectedRoles={selectedRoles}
              setSelectedRoles={setSelectedRoles}
              isOpen={activeSection === 1}
              onOpenChange={(open) => open && setActiveSection(1)}
              onSaveSuccess={handleSaveSuccess}
            />

            <ExperienceForm
              userId={user!.id}
              isOpen={activeSection === 2}
              onOpenChange={(open) => open && setActiveSection(2)}
              onSaveSuccess={handleSaveSuccess}
            />

            <PricingForm
              userId={user!.id}
              isOpen={activeSection === 3}
              onOpenChange={(open) => open && setActiveSection(3)}
              onSaveSuccess={handleSaveSuccess}
            />

            <ServiceAreasForm
              userId={user!.id}
              isOpen={activeSection === 4}
              onOpenChange={(open) => open && setActiveSection(4)}
              onSaveSuccess={handleSaveSuccess}
            />

            <TrainingForm
              userId={user!.id}
              isOpen={activeSection === 5}
              onOpenChange={(open) => open && setActiveSection(5)}
              onSaveSuccess={handleSaveSuccess}
            />

            <PaymentPrefsForm
              userId={user!.id}
              isOpen={activeSection === 6}
              onOpenChange={(open) => open && setActiveSection(6)}
              onSaveSuccess={handleSaveSuccess}
            />

            <LanguagesForm
              userId={user!.id}
              selectedLanguages={selectedLanguages}
              setSelectedLanguages={setSelectedLanguages}
              isOpen={activeSection === 7}
              onOpenChange={(open) => open && setActiveSection(7)}
              onSaveSuccess={handleSaveSuccess}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
