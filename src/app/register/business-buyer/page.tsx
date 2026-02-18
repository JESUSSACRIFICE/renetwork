"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { db, isMockMode } from "@/lib/db-helper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/registration/FileUpload";
import { ESignature } from "@/components/registration/ESignature";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const registrationSchema = z.object({
  // Basic Info
  business_name: z.string().min(1, "Business name is required"),
  contact_person: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  location_zip_code: z.string().min(1, "ZIP code is required"),

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

  // Buying Preferences
  property_type: z.string().optional(),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  preferred_payment_method: z.enum(["cash", "credit", "financing"]).optional(),
  timeline_to_purchase: z.string().optional(),

  // Additional Info
  business_industry: z.string().optional(),
  languages_spoken: z.array(z.string()).default(["English"]),
  specific_requirements: z.string().optional(),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

const STEPS = [
  { id: 1, name: "Basic Info", description: "Business information" },
  { id: 2, name: "Payment Preferences", description: "Payment settings" },
  { id: 3, name: "Buying Preferences", description: "Property interests" },
  { id: 4, name: "Additional Info", description: "Extra details" },
  { id: 5, name: "Legal Documents", description: "Sign agreements" },
];

const LANGUAGES = [
  "English",
  "Spanish",
  "Chinese",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Japanese",
];

export default function BusinessBuyerRegistration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    "English",
  ]);
  const [purchaseDocuments, setPurchaseDocuments] = useState<any[]>([]);
  const [eSignatures, setESignatures] = useState<Record<string, any>>({});
  const [truthVerification, setTruthVerification] = useState<
    Record<string, boolean>
  >({});

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      payment_methods: ["cash"], // Default to cash
      languages_spoken: ["English"],
    },
    mode: "onChange", // Validate on change for better UX
  });

  // Ensure payment_methods always has a value on mount
  useEffect(() => {
    const paymentMethods = form.getValues("payment_methods");
    if (!paymentMethods || paymentMethods.length === 0) {
      form.setValue("payment_methods", ["cash"], { shouldValidate: false });
    }
  }, [form, currentStep]);

  const onSubmit = async (values: RegistrationFormValues) => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setLoading(true);
    try {
      let {
        data: { user },
      } = await db.getUser();

      if (!user) {
        if (!isMockMode()) {
          toast.error("Please sign in first");
          router.push("/auth");
          return;
        }
        // In mock mode, create a user automatically
        const { data: mockUser } = await db.getUser();
        if (!mockUser?.user) {
          toast.error("Failed to create mock user");
          return;
        }
        user = mockUser.user;
      }

      // Create/Update profile
      const { error: profileError } = await db.upsert("profiles", {
        id: user.id,
        full_name: values.contact_person,
        company_name: values.business_name,
        email: values.email,
        phone: values.phone,
        user_type: "business_buyer",
        registration_status: "pending",
        tier_package: values.tier_package,
        languages: selectedLanguages,
      });

      if (profileError) throw profileError;

      // Save basic info
      await db.upsert("buyer_basic_info", {
        user_id: user.id,
        business_name: values.business_name,
        contact_person: values.contact_person,
        email: values.email,
        phone: values.phone,
        location_zip_code: values.location_zip_code,
      });

      // Save payment preferences (demography maintenance plans)
      await db.upsert("demography_maintenance_plans", {
        user_id: user.id,
        payment_packet: values.payment_packet,
        tier_package: values.tier_package,
        payment_methods: values.payment_methods,
        payment_terms: values.payment_terms,
      });

      // Save buyer preferences
      await db.upsert("buyer_preferences", {
        user_id: user.id,
        property_type: values.property_type || null,
        budget_min: values.budget_min || null,
        budget_max: values.budget_max || null,
        preferred_payment_method: values.preferred_payment_method || null,
        timeline_to_purchase: values.timeline_to_purchase || null,
        business_industry: values.business_industry || null,
        languages_spoken: selectedLanguages,
        specific_requirements: values.specific_requirements || null,
        purchase_documents_urls: purchaseDocuments
          .map((doc) => doc.url)
          .filter(Boolean),
        truth_verified: Object.values(truthVerification).every((v) => v),
      });

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

      toast.success(
        "Registration submitted successfully! You will be notified via email once approved.",
      );
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit registration");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    // Special handling for step 2 (Payment Preferences)
    if (currentStep === 2) {
      const paymentMethods = form.getValues("payment_methods") || [];
      if (paymentMethods.length === 0) {
        toast.error("Please select at least one payment method");
        return;
      }
      // Trigger validation for payment_methods specifically
      const isValid = await form.trigger("payment_methods");
      if (!isValid) {
        const error = form.formState.errors.payment_methods;
        toast.error(
          error?.message || "Please select at least one payment method",
        );
        return;
      }
    }

    // Validate all fields for current step
    let stepFields: (keyof RegistrationFormValues)[] = [];
    if (currentStep === 1) {
      stepFields = [
        "business_name",
        "contact_person",
        "email",
        "phone",
        "location_zip_code",
      ];
    } else if (currentStep === 2) {
      stepFields = ["payment_methods"];
    }

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

    // For optional steps, just proceed

    // Verify truth for buying preferences step
    if (currentStep === 3) {
      const fieldsToVerify = [
        "property_type",
        "budget_min",
        "budget_max",
        "preferred_payment_method",
        "timeline_to_purchase",
      ];

      const missingFields = fieldsToVerify.filter(
        (field) => !form.getValues(field as any),
      );

      if (missingFields.length > 0) {
        toast.error("Please complete all buying preference fields");
        return;
      }

      // Mark as verified
      fieldsToVerify.forEach((field) => {
        setTruthVerification((prev) => ({ ...prev, [field]: true }));
      });
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
              <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
              <p className="text-muted-foreground">
                Enter your business details
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person *</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" disabled />
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
                name="location_zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location / ZIP Code *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="90210" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 2:
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
                    <div className="flex gap-6 mt-2">
                      {["cash", "credit"].map((method) => (
                        <label
                          key={method}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Checkbox
                            checked={field.value?.includes(method) || false}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              let newValue: string[];
                              if (checked) {
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
                                  // Prevent unchecking if it's the last one
                                  toast.warning(
                                    "At least one payment method is required. Keeping cash.",
                                  );
                                  setTimeout(() => {
                                    field.onChange(newValue);
                                    form.trigger("payment_methods");
                                  }, 0);
                                  return;
                                }
                              }
                              field.onChange(newValue);
                              // Trigger validation after change
                              setTimeout(() => {
                                form.trigger("payment_methods");
                              }, 100);
                            }}
                          />
                          <span className="capitalize font-medium">
                            {method}
                          </span>
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

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Buying Preferences</h2>
              <p className="text-muted-foreground">
                Tell us about your property interests
              </p>
            </div>
            <FormField
              control={form.control}
              name="property_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type Interested In</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="mixed">Mixed Use</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budget_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Range (Min)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Range (Max)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="1000000"
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="preferred_payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Payment Method</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                        <SelectItem value="financing">Financing</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeline_to_purchase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeline to Purchase / Lease</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Within 3 months, 6-12 months, etc."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {Object.keys(truthVerification).length > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">
                    ✅ Truth verification completed for all fields
                  </span>
                </div>
              </div>
            )}
            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Truth Verification</p>
                  <p className="text-muted-foreground">
                    You will be reported if any information provided is found to
                    be false.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Additional Information
              </h2>
              <p className="text-muted-foreground">
                Provide any additional details
              </p>
            </div>
            <FormField
              control={form.control}
              name="business_industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Industry (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Retail, Healthcare, Technology"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Label>Languages Spoken</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {LANGUAGES.map((lang) => (
                  <label key={lang} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedLanguages.includes(lang)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedLanguages([...selectedLanguages, lang]);
                        } else {
                          setSelectedLanguages(
                            selectedLanguages.filter((l) => l !== lang),
                          );
                        }
                      }}
                    />
                    <span className="text-sm">{lang}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Upload Purchase Documents (Optional)</Label>
              <FileUpload
                onFilesChange={setPurchaseDocuments}
                acceptedFileTypes={["image/*", "application/pdf"]}
                maxFiles={5}
                bucket="documents"
                folder="purchase-documents"
                className="mt-2"
              />
            </div>
            <FormField
              control={form.control}
              name="specific_requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Any Specific Requirements / Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Enter any specific requirements or notes..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 5:
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
            Register as Business Buyer
          </h1>
          <p className="text-muted-foreground">
            Complete all steps to register as a business buyer
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
