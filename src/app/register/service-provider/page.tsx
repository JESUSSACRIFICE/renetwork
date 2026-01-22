"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db-helper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  payment_packet: z.enum(["weekly", "bi-weekly", "monthly", "yearly"]).optional(),
  tier_package: z.enum(["basic", "standard", "advanced"]).optional(),
  payment_methods: z.array(z.string()).min(1, "Please select at least one payment method").default(["cash"]),
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
  { id: 3, name: "Licenses & Credentials", description: "Professional credentials" },
  { id: 4, name: "Business Information", description: "Business details" },
  { id: 5, name: "Bonds & Insurance", description: "Insurance documents" },
  { id: 6, name: "Preference Ranking", description: "Rank your categories" },
  { id: 7, name: "Payment Preferences", description: "Payment settings" },
  { id: 8, name: "Legal Documents", description: "Sign agreements" },
];

export default function ServiceProviderRegistration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [identityFiles, setIdentityFiles] = useState<any[]>([]);
  const [licenseFiles, setLicenseFiles] = useState<any[]>([]);
  const [insuranceFiles, setInsuranceFiles] = useState<any[]>([]);
  const [preferenceRankings, setPreferenceRankings] = useState<Record<string, number>>({});
  const [eSignatures, setESignatures] = useState<Record<string, any>>({});
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      payment_methods: ["cash"], // Default to cash
      languages_spoken: ["English"],
    },
    mode: "onChange", // Validate on change for better UX
  });

  // Ensure payment_methods always has a value on mount and when navigating to step 7
  useEffect(() => {
    if (currentStep === 7) {
      const paymentMethods = form.getValues("payment_methods");
      if (!paymentMethods || paymentMethods.length === 0) {
        form.setValue("payment_methods", ["cash"], { shouldValidate: false });
      }
    }
  }, [form, currentStep]);

  const onSubmit = async (values: RegistrationFormValues) => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await db.getUser();

      if (!user) {
        toast.error("Please sign in first");
        router.push("/auth");
        return;
      }

      // Create/Update profile
      const { error: profileError } = await db.upsert("profiles", {
        id: user.id,
        first_name: values.first_name,
        last_name: values.last_name,
        full_name: `${values.first_name} ${values.last_name}`,
        email: values.email,
        phone: values.phone,
        mailing_address: values.mailing_address,
        birthday: values.birthday,
        business_name: values.business_name,
        business_address: values.business_address,
        business_hours: values.business_hours,
        best_times_to_reach: values.best_times_to_reach,
        number_of_employees: values.number_of_employees,
        user_type: "service_provider",
        registration_status: "pending",
        tier_package: values.tier_package,
        languages: selectedLanguages,
        tools_technologies: selectedTools,
        service_radius: values.service_radius,
        years_of_experience: values.years_of_experience,
      });

      if (profileError) throw profileError;

      // Save identity documents
      for (const file of identityFiles) {
        if (file.url) {
          await db.insert("identity_documents", {
            user_id: user.id,
            document_type: "state_id",
            country: values.id_country,
            state: values.id_state,
            number: values.id_number,
            file_url: file.url,
          });
        }
      }

      // Save licenses/credentials
      for (const file of licenseFiles) {
        if (file.url) {
          await db.insert("licenses_credentials", {
            user_id: user.id,
            document_type: "license",
            country: values.license_country,
            state: values.license_state,
            number: values.license_number,
            active_since: values.active_since || null,
            renewal_date: values.renewal_date || null,
            expiration_date: values.expiration_date || null,
            file_url: file.url,
          });
        }
      }

      // Save bonds/insurance
      for (const file of insuranceFiles) {
        if (file.url) {
          await db.insert("bonds_insurance", {
            user_id: user.id,
            document_type: "insurance_eo",
            file_url: file.url,
          });
        }
      }

      // Save preference rankings
      for (const [category, ranking] of Object.entries(preferenceRankings)) {
        await db.upsert("preference_rankings", {
          user_id: user.id,
          category,
          ranking,
        });
      }

      // Save e-signatures
      for (const [docType, signature] of Object.entries(eSignatures)) {
        await db.insert("e_signatures", {
          user_id: user.id,
          document_type: docType,
          signature_data: signature.signatureData,
          name_printed: signature.namePrinted,
          name_signed: signature.nameSigned,
          signed_at: signature.signedAt,
        });
      }

      // Save payment preferences
      await db.upsert("payment_preferences", {
        user_id: user.id,
        payment_packet: values.payment_packet,
        accepts_cash: values.payment_methods.includes("cash"),
        accepts_credit: values.payment_methods.includes("credit"),
        payment_terms: values.payment_terms,
      });

      toast.success("Registration submitted successfully! You will be notified via email once approved.");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit registration");
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
      stepFields = ["last_name", "first_name", "birthday", "phone", "email", "mailing_address"];
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
          .map(field => errors[field]?.message)
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
    
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
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
                <span className="text-sm font-medium">✅ VETTED; VERIFIED, CHECK.</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">My Information</h2>
              <p className="text-muted-foreground">Enter your personal details</p>
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
                      <Input {...field} type="email" />
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
                <span className="text-sm font-medium">✅ VETTED; VERIFIED, CHECK.</span>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Licenses / Credentials / Certificates</h2>
              <p className="text-muted-foreground">Upload your professional licenses and credentials</p>
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
                <span className="text-sm font-medium">✅ VETTED; VERIFIED, CHECK.</span>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Business Information</h2>
              <p className="text-muted-foreground">Enter your business details</p>
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
                      <Input {...field} placeholder="Morning, Afternoon, Evening" />
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
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                <span className="text-sm font-medium">✅ VETTED; VERIFIED, CHECK.</span>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Bonds, Insurance, Policies</h2>
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
                <span className="text-sm font-medium">✅ VETTED; VERIFIED, CHECK.</span>
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
                Rank each category from 1-10 (1 = highest priority for recognition)
              </p>
            </div>
            <PreferenceRanking
              categories={PSP_CATEGORIES}
              onRankingsChange={setPreferenceRankings}
              initialRankings={preferenceRankings}
            />
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Info:</strong> Rank each category based on how you want to be recognized
                within the network. 1 is your first priority (highest level), 10 is least priority.
              </p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Payment Preferences</h2>
              <p className="text-muted-foreground">Set your payment preferences</p>
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
                        <label key={method} className="flex items-center gap-2 cursor-pointer">
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
                                newValue = current.filter((m: string) => m !== method);
                                // If removing would make it empty, keep at least cash
                                if (newValue.length === 0) {
                                  newValue = ["cash"];
                                  toast.warning("At least one payment method is required. Keeping cash.");
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
                onSignatureComplete={(sig) =>
                  setESignatures((prev) => ({ ...prev, terms_of_service: sig }))
                }
              />
              <ESignature
                documentType="privacy_policy"
                documentTitle="Privacy Policy"
                onSignatureComplete={(sig) =>
                  setESignatures((prev) => ({ ...prev, privacy_policy: sig }))
                }
              />
              <ESignature
                documentType="no_recruit"
                documentTitle="No-Recruit Agreement"
                onSignatureComplete={(sig) =>
                  setESignatures((prev) => ({ ...prev, no_recruit: sig }))
                }
              />
              <ESignature
                documentType="non_compete"
                documentTitle="Non-Compete Agreement"
                onSignatureComplete={(sig) =>
                  setESignatures((prev) => ({ ...prev, non_compete: sig }))
                }
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> All documents are time-stamped and will be recorded when you
                sign. You will be notified via email once your registration is reviewed and
                approved.
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
          <h1 className="text-3xl font-bold mb-2">Register as Service Provider</h1>
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
                        : "bg-muted text-muted-foreground"
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
                        currentStep === step.id ? "text-foreground" : "text-muted-foreground"
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
                      currentStep > step.id ? "bg-green-500" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="p-6 mb-6">
              <CardContent className="pt-6">{renderStepContent()}</CardContent>
            </Card>

            <div className="flex justify-between">
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
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
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

