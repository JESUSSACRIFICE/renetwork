"use client";

import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, profileKeys, type ProfessionalProfile } from "@/hooks/use-professional-profiles";
import {
  registrationKeys,
  useIdentityDocuments,
  useLicenseDocs,
  useBusinessInfo,
  useBondsInsuranceDocs,
  usePreferenceRankings,
  useESignatures,
} from "@/hooks/use-service-provider-registration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/registration/FileUpload";
import { PreferenceRanking } from "@/components/registration/PreferenceRanking";
import { ESignature } from "@/components/registration/ESignature";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PSP_CATEGORIES = [
  { id: "stamper", label: "Stamper" },
  { id: "professional", label: "Professional" },
  { id: "agent", label: "Agent" },
  { id: "mortgage", label: "Mortgage" },
  { id: "trade", label: "Trade" },
];

const registrationSchema = z.object({
  // Identity
  id_country: z.string().min(1, "Country is required"),
  id_state: z.string().optional(),
  id_number: z.string().min(1, "ID Number is required"),

  // Personal Info
  last_name: z.string().min(1, "Last name is required"),
  first_name: z.string().min(1, "First name is required"),
  birthday: z.string().min(1, "Birthday is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email"),
  mailing_address: z.string().min(1, "Mailing address is required"),

  // License/Credential
  license_country: z.string().min(1, "Country is required"),
  license_state: z.string().optional(),
  license_number: z.string().min(1, "License number is required"),
  active_since: z.string().optional(),
  renewal_date: z.string().optional(),
  expiration_date: z.string().optional(),

  // Business Info
  business_name: z.string().optional(),
  business_address: z.string().optional(),
  business_hours: z.string().optional(),
  best_times_to_reach: z.string().optional(),
  number_of_employees: z.number().optional(),

  // Payment Preferences
  payment_packet: z
    .enum(["weekly", "bi-weekly", "monthly", "yearly"])
    .optional(),
  tier_package: z.enum(["basic", "standard", "advanced"]).optional(),
  payment_methods: z
    .array(z.string())
    .min(1, "Please select at least one payment method")
    .default(["cash"]),
  payment_terms: z.string().optional(),

  // Additional
  languages_spoken: z.array(z.string()).default(["English"]),
  tools_technologies: z.array(z.string()).optional(),
  service_radius: z.number().optional(),
  years_of_experience: z.number().optional(),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

const STEPS = [
  { id: 1, name: "Identity Verification", description: "Upload ID documents" },
  { id: 2, name: "Personal Information", description: "Your basic details" },
  {
    id: 3,
    name: "Licenses & Credentials",
    description: "Professional credentials",
  },
  { id: 4, name: "Business Information", description: "Business details" },
  { id: 5, name: "Bonds & Insurance", description: "Insurance documents" },
  { id: 6, name: "Preference Ranking", description: "Rank your categories" },
  { id: 7, name: "Payment Preferences", description: "Payment settings" },
  { id: 8, name: "Legal Documents", description: "Sign agreements" },
];

export default function ServiceProviderRegistration() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? null;
  const { data: profile, isSuccess: profileLoaded } = useProfile(userId);
  const { data: identityDocs = [], isFetched: identityDocsFetched } = useIdentityDocuments(userId);
  const { data: licenseDocs = [] } = useLicenseDocs(userId);
  const { data: businessInfo = null, isFetched: businessInfoFetched } = useBusinessInfo(userId);
  const { data: bondsInsuranceDocs = [], isFetched: bondsInsuranceFetched } = useBondsInsuranceDocs(userId);
  const { data: preferenceRankingRows = [], isFetched: preferenceRankingsFetched } = usePreferenceRankings(userId);
  const { data: eSignatureRows = [] } = useESignatures(userId);
  const hasPrepopulated = useRef(false);
  const hasPrepopulatedIdentity = useRef(false);
  const hasPrepopulatedLicenses = useRef(false);
  const hasPrepopulatedBusiness = useRef(false);
  const hasPrepopulatedBondsInsurance = useRef(false);
  const hasPrepopulatedPreferenceRankings = useRef(false);
  const hasSetInitialStep = useRef(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [identityFiles, setIdentityFiles] = useState<any[]>([]);
  const [licenseFiles, setLicenseFiles] = useState<any[]>([]);
  const [insuranceFiles, setInsuranceFiles] = useState<any[]>([]);
  const [preferenceRankings, setPreferenceRankings] = useState<
    Record<string, number>
  >({});
  const [eSignatures, setESignatures] = useState<Record<string, any>>({});
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    "English",
  ]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      payment_methods: ["cash"], // Default to cash
      languages_spoken: ["English"],
    },
    mode: "onChange", // Validate on change for better UX
  });

  // Prepopulate form from profile when data exists (useProfile from use-professional-profiles)
  useEffect(() => {
    if (authLoading || !user || hasPrepopulated.current) return;
    if (!profileLoaded) return;

    hasPrepopulated.current = true;
    const p: Partial<ProfessionalProfile> = profile ?? {};
    const email = p.email ?? user.email ?? "";
    const fullName = (p.full_name ?? "").trim();
    const parts = fullName ? fullName.split(/\s+/) : [];
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ") ?? "";

    const paymentPrefs = profile?.payment_preferences;
    const paymentMethods: string[] = [];
    if (paymentPrefs?.accepts_cash) paymentMethods.push("cash");
    if (paymentPrefs?.accepts_credit) paymentMethods.push("credit");
    if (paymentMethods.length === 0) paymentMethods.push("cash");

    const firstIdDoc = identityDocs[0];
    form.reset({
      ...form.getValues(),
      id_country: firstIdDoc?.country ?? form.getValues("id_country"),
      id_state: firstIdDoc?.state ?? form.getValues("id_state"),
      id_number: firstIdDoc?.number ?? form.getValues("id_number"),
      first_name: firstName || form.getValues("first_name"),
      last_name: lastName || form.getValues("last_name"),
      email: email || form.getValues("email"),
      phone: p.phone ?? form.getValues("phone"),
      business_name: p.company_name ?? form.getValues("business_name"),
      license_number: p.license_number ?? form.getValues("license_number"),
      languages_spoken:
        Array.isArray(p.languages) && p.languages.length > 0
          ? p.languages
          : form.getValues("languages_spoken"),
      years_of_experience:
        p.years_of_experience ?? form.getValues("years_of_experience"),
      payment_methods: paymentMethods,
      payment_terms:
        paymentPrefs?.payment_terms ?? form.getValues("payment_terms"),
    });
    if (Array.isArray(p.languages) && p.languages.length > 0) {
      setSelectedLanguages(p.languages);
    }
  }, [user, authLoading, profile, profileLoaded, identityDocs, form]);

  // Prepopulate identity step (step 1) when identity_documents load after profile
  useEffect(() => {
    if (identityDocs.length === 0 || hasPrepopulatedIdentity.current) return;
    hasPrepopulatedIdentity.current = true;
    const first = identityDocs[0];
    form.setValue("id_country", first.country);
    form.setValue("id_state", first.state ?? "");
    form.setValue("id_number", first.number);
    setIdentityFiles(identityDocs.map((d) => ({ url: d.file_url })));
  }, [identityDocs, form]);

  // Prepopulate licenses step (step 3) when licenses_credentials load
  useEffect(() => {
    if (licenseDocs.length === 0 || hasPrepopulatedLicenses.current) return;
    hasPrepopulatedLicenses.current = true;
    const first = licenseDocs[0] as {
      country: string;
      state: string | null;
      number: string;
      active_since: string | null;
      renewal_date: string | null;
      expiration_date: string | null;
      file_url: string;
    };
    form.setValue("license_country", first.country);
    form.setValue("license_state", first.state ?? "");
    form.setValue("license_number", first.number);
    form.setValue("active_since", first.active_since ?? "");
    form.setValue("renewal_date", first.renewal_date ?? "");
    form.setValue("expiration_date", first.expiration_date ?? "");
    setLicenseFiles(licenseDocs.map((d) => ({ url: (d as { file_url: string }).file_url })));
  }, [licenseDocs, form]);

  // Prepopulate bonds/insurance step (step 5) when bonds_insurance loads
  useEffect(() => {
    if (bondsInsuranceDocs.length === 0 || hasPrepopulatedBondsInsurance.current) return;
    hasPrepopulatedBondsInsurance.current = true;
    setInsuranceFiles(bondsInsuranceDocs.map((d) => ({ url: d.file_url })));
  }, [bondsInsuranceDocs]);

  // Prepopulate preference ranking step (step 6) when preference_rankings loads
  useEffect(() => {
    if (preferenceRankingRows.length === 0 || hasPrepopulatedPreferenceRankings.current) return;
    hasPrepopulatedPreferenceRankings.current = true;
    const record: Record<string, number> = {};
    preferenceRankingRows.forEach((r: { category: string; ranking: number }) => {
      record[r.category] = r.ranking;
    });
    setPreferenceRankings(record);
  }, [preferenceRankingRows]);

  // Prepopulate e-signatures step (step 8) when e_signatures load or when navigating to step 8
  useEffect(() => {
    if (currentStep !== 8 || eSignatureRows.length === 0) return;
    const record: Record<string, { signatureData: string; namePrinted: string; nameSigned: string; signedAt: Date }> = {};
    eSignatureRows.forEach((row: { document_type: string; signature_data: string; name_printed: string; name_signed: string; signed_at: string }) => {
      record[row.document_type] = {
        signatureData: row.signature_data,
        namePrinted: row.name_printed,
        nameSigned: row.name_signed,
        signedAt: new Date(row.signed_at),
      };
    });
    setESignatures(record);
  }, [eSignatureRows, currentStep]);

  // Prepopulate business step (step 4) when business_info loads
  useEffect(() => {
    if (!businessInfo || hasPrepopulatedBusiness.current) return;
    hasPrepopulatedBusiness.current = true;
    form.setValue("business_name", (businessInfo as { company_name?: string | null }).company_name ?? "");
    form.setValue("years_of_experience", (businessInfo as { years_of_experience?: number | null }).years_of_experience ?? 0);
    form.setValue("business_address", businessInfo.business_address ?? "");
    form.setValue("business_hours", businessInfo.business_hours ?? "");
    form.setValue("best_times_to_reach", businessInfo.best_times_to_reach ?? "");
    form.setValue("number_of_employees", businessInfo.number_of_employees ?? 0);
  }, [businessInfo, form]);

  // Start from the first incomplete step when user returns to the page
  useEffect(() => {
    if (
      !user ||
      !profileLoaded ||
      !identityDocsFetched ||
      !businessInfoFetched ||
      !bondsInsuranceFetched ||
      !preferenceRankingsFetched ||
      hasSetInitialStep.current
    )
      return;
    hasSetInitialStep.current = true;
    const p: Partial<ProfessionalProfile> = profile ?? {};
    const step1Done = identityDocs.length >= 1;
    const step2Done =
      (p as { user_type?: string }).user_type === "service_provider" &&
      !!p.full_name &&
      !!p.email &&
      !!p.phone;
    const step3Done = !!p.license_number;
    const step4Done = !!p.company_name || !!businessInfo;
    const step5Done = bondsInsuranceDocs.length >= 1;
    const step6Done = preferenceRankingRows.length >= 1;
    const step7Done = !!profile?.payment_preferences;
    let firstIncomplete = 1;
    if (!step1Done) firstIncomplete = 1;
    else if (!step2Done) firstIncomplete = 2;
    else if (!step3Done) firstIncomplete = 3;
    else if (!step4Done) firstIncomplete = 4;
    else if (!step5Done) firstIncomplete = 5;
    else if (!step6Done) firstIncomplete = 6;
    else if (!step7Done) firstIncomplete = 7;
    else firstIncomplete = 8;
    setCurrentStep(firstIncomplete);
  }, [user, profileLoaded, identityDocsFetched, businessInfoFetched, bondsInsuranceFetched, preferenceRankingsFetched, profile, identityDocs.length, businessInfo, bondsInsuranceDocs.length, preferenceRankingRows.length]);

  // Ensure payment_methods always has a value on mount and when navigating to step 7
  useEffect(() => {
    if (currentStep === 7) {
      const paymentMethods = form.getValues("payment_methods");
      if (!paymentMethods || paymentMethods.length === 0) {
        form.setValue("payment_methods", ["cash"], { shouldValidate: false });
      }
    }
  }, [form, currentStep]);

  /** Save current step data to Supabase (profiles, user_roles, payment_preferences only). */
  const saveStepData = async (step: number): Promise<void> => {
    if (!user?.id) {
        toast.error("Please sign in first");
      throw new Error("Not authenticated");
    }
    const values = form.getValues();
    const userId = user.id;

    if (step === 1) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          { id: userId, full_name: user.email ?? "User" },
          { onConflict: "id" },
        );
      if (profileError) throw profileError;
      await supabase
        .from("identity_documents")
        .delete()
        .eq("user_id", userId)
        .eq("document_type", "state_id");
      for (const file of identityFiles) {
        if (file?.url && values.id_country && values.id_number) {
          const { error: docError } = await supabase
            .from("identity_documents")
            .insert({
              user_id: userId,
            document_type: "state_id",
            country: values.id_country,
              state: values.id_state || null,
            number: values.id_number,
            file_url: file.url,
          });
          if (docError) throw docError;
        }
      }
      await queryClient.invalidateQueries({
        queryKey: registrationKeys.identityDocuments(userId),
      });
    } else if (step === 2) {
      const full_name =
        [values.first_name, values.last_name].filter(Boolean).join(" ") ||
        (user.email ?? "User");
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          full_name,
          email: values.email,
          phone: values.phone,
          birthday: values.birthday || null,
          mailing_address: values.mailing_address || null,
          user_type: "service_provider",
          languages: selectedLanguages.length ? selectedLanguages : ["English"],
        },
        { onConflict: "id" },
      );
      if (profileError) throw profileError;
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "professional_service_provider");
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "professional_service_provider" });
      if (roleError) throw roleError;
    } else if (step === 3) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ license_number: values.license_number })
        .eq("id", userId);
      if (profileError) throw profileError;
      await supabase
        .from("licenses_credentials")
        .delete()
        .eq("user_id", userId)
        .eq("document_type", "license");
      for (const file of licenseFiles) {
        if (file?.url && values.license_country && values.license_number) {
          const { error: docError } = await supabase
            .from("licenses_credentials")
            .insert({
              user_id: userId,
            document_type: "license",
            country: values.license_country,
              state: values.license_state || null,
            number: values.license_number,
              active_since: values.active_since?.trim() || null,
              renewal_date: values.renewal_date?.trim() || null,
              expiration_date: values.expiration_date?.trim() || null,
            file_url: file.url,
          });
          if (docError) throw docError;
        }
      }
      await queryClient.invalidateQueries({ queryKey: registrationKeys.licensesCredentials(userId) });
    } else if (step === 4) {
      const now = new Date().toISOString();
      const { error: bizError } = await supabase.from("business_info").upsert(
        {
          user_id: userId,
          company_name: values.business_name?.trim() || null,
          years_of_experience: values.years_of_experience ?? null,
          business_address: values.business_address?.trim() || null,
          business_hours: values.business_hours?.trim() || null,
          best_times_to_reach: values.best_times_to_reach?.trim() || null,
          number_of_employees: values.number_of_employees ?? null,
          updated_at: now,
        },
        { onConflict: "user_id" },
      );
      if (bizError) throw bizError;
      await queryClient.invalidateQueries({ queryKey: registrationKeys.businessInfo(userId) });
    } else if (step === 5) {
      await supabase.from("bonds_insurance").delete().eq("user_id", userId);
      for (const file of insuranceFiles) {
        if (file?.url) {
          const { error: docError } = await supabase.from("bonds_insurance").insert({
            user_id: userId,
            document_type: "insurance",
            file_url: file.url,
          });
          if (docError) throw docError;
        }
      }
      await queryClient.invalidateQueries({ queryKey: registrationKeys.bondsInsurance(userId) });
    } else if (step === 6) {
      await supabase.from("preference_rankings").delete().eq("user_id", userId);
      for (const [categoryId, rank] of Object.entries(preferenceRankings)) {
        const r = Number(rank);
        if (!Number.isNaN(r) && categoryId) {
          const ranking = Math.min(10, Math.max(1, r));
          const { error: rankError } = await supabase.from("preference_rankings").insert({
            user_id: userId,
            category: categoryId,
          ranking,
        });
          if (rankError) throw rankError;
        }
      }
      await queryClient.invalidateQueries({ queryKey: registrationKeys.preferenceRankings(userId) });
    } else if (step === 7) {
      const paymentMethods = form.getValues("payment_methods") || [];
      const { error } = await supabase.from("payment_preferences").upsert(
        {
          user_id: userId,
          payment_packet: values.payment_packet ?? null,
          payment_terms: values.payment_terms || null,
          accepts_cash: paymentMethods.includes("cash"),
          accepts_credit: paymentMethods.includes("credit"),
          accepts_financing: false,
        },
        { onConflict: "user_id" },
      );
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
    } else if (step === 8) {
      const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : null;
      const docTypes = ["terms_of_service", "privacy_policy", "no_recruit", "non_compete"] as const;
      for (const documentType of docTypes) {
        const sig = eSignatures[documentType] as
          | { signatureData: string; namePrinted: string; nameSigned: string; signedAt: Date }
          | undefined;
        if (!sig?.signatureData || !sig?.namePrinted || !sig?.nameSigned) continue;
        const { error: sigError } = await supabase.from("e_signatures").upsert(
          {
            user_id: userId,
            document_type: documentType,
            signature_data: sig.signatureData,
            name_printed: sig.namePrinted,
            name_signed: sig.nameSigned,
            signed_at: sig.signedAt instanceof Date ? sig.signedAt.toISOString() : new Date().toISOString(),
            ip_address: null,
            user_agent: userAgent,
          },
          { onConflict: "user_id,document_type" },
        );
        if (sigError) throw sigError;
      }
      await queryClient.invalidateQueries({ queryKey: registrationKeys.eSignatures(userId) });
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        toast.error("Please sign in first");
        router.push("/auth");
        return;
      }
      await saveStepData(8);
      toast.success(
        "Registration submitted successfully! You will be notified via email once approved.",
      );
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to submit registration");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    // Validate only fields for the current step
    let stepFields: (keyof RegistrationFormValues)[] = [];

    if (currentStep === 1) {
      // Identity Verification: id_country and id_number are required
      stepFields = ["id_country", "id_number"];
    } else if (currentStep === 2) {
      // Personal Information: all fields required
      stepFields = [
        "last_name",
        "first_name",
        "birthday",
        "phone",
        "email",
        "mailing_address",
      ];
    } else if (currentStep === 3) {
      // Licenses & Credentials: license_country and license_number are required
      stepFields = ["license_country", "license_number"];
    } else if (currentStep === 4) {
      // Business Information: all optional
      stepFields = [];
    } else if (currentStep === 5) {
      // Bonds & Insurance: all optional (just file uploads)
      stepFields = [];
    } else if (currentStep === 6) {
      // Preference Ranking: all optional
      stepFields = [];
    } else if (currentStep === 7) {
      // Payment Preferences: payment_methods should have at least one
      stepFields = ["payment_methods"];
    } else if (currentStep === 8) {
      // Legal Documents: all optional (e-signatures handled separately)
      stepFields = [];
    }

    // Validate only if there are required fields for this step
    if (stepFields.length > 0) {
      const isValid = await form.trigger(stepFields);
      if (!isValid) {
        const errors = form.formState.errors;
        const errorMessages = stepFields
          .map((field) => errors[field]?.message)
          .filter(Boolean);
        if (errorMessages.length > 0) {
          toast.error(errorMessages[0] || "Please fill in all required fields");
        } else {
          toast.error("Please fill in all required fields");
        }
        return;
      }
    }

    // Additional validation for step 1: ensure at least one file is uploaded
    if (currentStep === 1 && identityFiles.length === 0) {
      toast.error("Please upload at least one identity document");
      return;
    }

    // Additional validation for step 7: ensure at least one payment method is selected
    if (currentStep === 7) {
      const paymentMethods = form.getValues("payment_methods") || [];
      if (paymentMethods.length === 0) {
        toast.error("Please select at least one payment method");
        return;
      }
    }

    setLoading(true);
    try {
      await saveStepData(currentStep);
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save step");
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Identity Verification</h2>
              <p className="text-muted-foreground">
                Upload valid state, national, or identification documents
              </p>
            </div>
            <FileUpload
              onFilesChange={setIdentityFiles}
              acceptedFileTypes={["image/*", "application/pdf"]}
              maxFiles={3}
              bucket="documents"
              folder="identity"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="id_country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="USA" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="id_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="CA" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="id_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Number *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">
                  ✅ VETTED; VERIFIED, CHECK.
                </span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">My Information</h2>
              <p className="text-muted-foreground">
                Enter your personal details
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birthday *</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail *</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mailing_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mailing Address *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">
                  ✅ VETTED; VERIFIED, CHECK.
                </span>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Licenses / Credentials / Certificates
              </h2>
              <p className="text-muted-foreground">
                Upload your professional licenses and credentials
              </p>
            </div>
            <FileUpload
              onFilesChange={setLicenseFiles}
              acceptedFileTypes={["image/*", "application/pdf"]}
              maxFiles={5}
              bucket="documents"
              folder="licenses"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="license_country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="USA" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="license_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="CA" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="license_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="active_since"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Active Since</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="renewal_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Renewal Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiration_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">
                  ✅ VETTED; VERIFIED, CHECK.
                </span>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Business Information</h2>
              <p className="text-muted-foreground">
                Enter your business details
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="business_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="business_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Hours</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Mon-Fri 9AM-5PM" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="best_times_to_reach"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Best Times to Reach You</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Morning, Afternoon, Evening"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="number_of_employees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Employees</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm font-medium">
                💰 25% DISCOUNT FOR EVERY MEMBER YOU BRING ON-BOARD
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">
                  ✅ VETTED; VERIFIED, CHECK.
                </span>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Bonds, Insurance, Policies
              </h2>
              <p className="text-muted-foreground">
                Upload proof of insurance (E&O, liability, etc.) and bonds
              </p>
            </div>
            <FileUpload
              onFilesChange={setInsuranceFiles}
              acceptedFileTypes={["image/*", "application/pdf"]}
              maxFiles={10}
              bucket="documents"
              folder="insurance"
            />
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">
                  ✅ VETTED; VERIFIED, CHECK.
                </span>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Preference Ranking</h2>
              <p className="text-muted-foreground">
                Rank each category from 1-10 (1 = highest priority for
                recognition)
              </p>
            </div>
            <PreferenceRanking
              categories={PSP_CATEGORIES}
              onRankingsChange={setPreferenceRankings}
              initialRankings={preferenceRankings}
            />
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Info:</strong> Rank each category based on how you want
                to be recognized within the network. 1 is your first priority
                (highest level), 10 is least priority.
              </p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Payment Preferences</h2>
              <p className="text-muted-foreground">
                Set your payment preferences
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment_packet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Packet</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment packet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tier_package"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tier Package</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="payment_methods"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Methods *</FormLabel>
                  <FormControl>
                    <div className="flex gap-4 mt-2">
                      {["cash", "credit"].map((method) => (
                        <label
                          key={method}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={field.value?.includes(method) || false}
                            onChange={(e) => {
                              const current = field.value || [];
                              let newValue: string[];
                              if (e.target.checked) {
                                // Add method if not already present
                                newValue = current.includes(method)
                                  ? current
                                  : [...current, method];
                              } else {
                                // Remove method, but ensure at least one remains
                                newValue = current.filter(
                                  (m: string) => m !== method,
                                );
                                // If removing would make it empty, keep at least cash
                                if (newValue.length === 0) {
                                  newValue = ["cash"];
                                  toast.warning(
                                    "At least one payment method is required. Keeping cash.",
                                  );
                                }
                              }
                              field.onChange(newValue);
                              // Trigger validation after change
                              setTimeout(() => {
                                form.trigger("payment_methods");
                              }, 100);
                            }}
                          />
                          <span className="capitalize">{method}</span>
                        </label>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                  {field.value && field.value.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Selected: {field.value.join(", ")}
                    </p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Half now, half after service completion"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Legal Documents</h2>
              <p className="text-muted-foreground">
                Please review and sign the following documents
              </p>
            </div>
            <div className="space-y-6">
              <ESignature
                documentType="terms_of_service"
                documentTitle="Terms of Service"
                initialSignature={eSignatures.terms_of_service}
                onSignatureComplete={(sig) =>
                  setESignatures((prev) => ({ ...prev, terms_of_service: sig }))
                }
              />
              <ESignature
                documentType="privacy_policy"
                documentTitle="Privacy Policy"
                initialSignature={eSignatures.privacy_policy}
                onSignatureComplete={(sig) =>
                  setESignatures((prev) => ({ ...prev, privacy_policy: sig }))
                }
              />
              <ESignature
                documentType="no_recruit"
                documentTitle="No-Recruit Agreement"
                initialSignature={eSignatures.no_recruit}
                onSignatureComplete={(sig) =>
                  setESignatures((prev) => ({ ...prev, no_recruit: sig }))
                }
              />
              <ESignature
                documentType="non_compete"
                documentTitle="Non-Compete Agreement"
                initialSignature={eSignatures.non_compete}
                onSignatureComplete={(sig) =>
                  setESignatures((prev) => ({ ...prev, non_compete: sig }))
                }
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> All documents are time-stamped and will
                be recorded when you sign. You will be notified via email once
                your registration is reviewed and approved.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Register as Service Provider
          </h1>
          <p className="text-muted-foreground">
            Complete all steps to register as a service provider
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                      currentStep > step.id
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={cn(
                        "text-xs font-medium",
                        currentStep === step.id
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {step.name}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-1 flex-1 mx-2 transition-colors",
                      currentStep > step.id ? "bg-green-500" : "bg-muted",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (currentStep < STEPS.length) {
                nextStep();
              } else {
                handleFinalSubmit();
              }
            }}
          >
            <Card className="p-6 mb-6">
              <CardContent className="pt-6">{renderStepContent()}</CardContent>
            </Card>

            <div className="flex justify-between items-center gap-4 sticky bottom-4 py-4 bg-background/95 backdrop-blur z-10 rounded-md border border-border/50 px-4 -mx-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              {currentStep < STEPS.length ? (
                <Button type="submit">
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Registration
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
