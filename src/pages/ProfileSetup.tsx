import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  license_number: z.string().optional(),
  company_name: z.string().optional(),
  experience_level: z.enum(["expert", "mature", "seasonal", "new"]).optional(),
  years_of_experience: z.number().min(0).optional(),
  referral_fee_percentage: z.number().min(0).max(100).optional(),
  hourly_rate: z.number().min(0).optional(),
  price_per_sqft: z.number().min(0).optional(),
  willing_to_train: z.boolean().default(false),
  training_details: z.string().optional(),
});

const AVAILABLE_ROLES = [
  "real_estate_agent",
  "mortgage_consultant",
  "real_estate_attorney",
  "escrow_officer",
  "property_inspector",
  "appraiser",
  "title_officer",
  "general_contractor",
  "electrician",
  "plumber",
  "hvac_technician",
  "roofer",
  "landscaper",
];

const LANGUAGES = ["English", "Spanish", "Chinese", "French", "German", "Italian", "Portuguese", "Japanese"];

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileSetup = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);
  const [serviceAreas, setServiceAreas] = useState<Array<{ zip_code: string; radius_miles: number }>>([
    { zip_code: "", radius_miles: 25 },
  ]);
  const [paymentPrefs, setPaymentPrefs] = useState({
    accepts_cash: true,
    accepts_credit: true,
    accepts_financing: false,
    payment_packet: "",
    payment_terms: "",
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      bio: "",
      phone: "",
      website: "",
      license_number: "",
      company_name: "",
      experience_level: "new",
      years_of_experience: 0,
      referral_fee_percentage: 30,
      willing_to_train: false,
    },
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);

      // Load existing profile if exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        form.reset({
          full_name: profile.full_name,
          bio: profile.bio || "",
          phone: profile.phone || "",
          website: profile.website || "",
          license_number: profile.license_number || "",
          company_name: profile.company_name || "",
          experience_level: profile.experience_level as any,
          years_of_experience: profile.years_of_experience || 0,
          referral_fee_percentage: profile.referral_fee_percentage || 30,
          hourly_rate: profile.hourly_rate || 0,
          price_per_sqft: profile.price_per_sqft || 0,
          willing_to_train: profile.willing_to_train,
          training_details: profile.training_details || "",
        });
        setSelectedLanguages(profile.languages || ["English"]);

        // Load roles
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        setSelectedRoles(roles?.map((r) => r.role) || []);

        // Load service areas
        const { data: areas } = await supabase
          .from("service_areas")
          .select("*")
          .eq("user_id", user.id);
        if (areas && areas.length > 0) {
          setServiceAreas(areas.map((a) => ({ zip_code: a.zip_code, radius_miles: a.radius_miles })));
        }

        // Load payment preferences
        const { data: payment } = await supabase
          .from("payment_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (payment) {
          setPaymentPrefs({
            accepts_cash: payment.accepts_cash,
            accepts_credit: payment.accepts_credit,
            accepts_financing: payment.accepts_financing,
            payment_packet: payment.payment_packet || "",
            payment_terms: payment.payment_terms || "",
          });
        }
      }
    };
    getUser();
  }, [router, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!userId) return;

    if (selectedRoles.length === 0) {
      toast.error("Please select at least one professional role");
      return;
    }

    setLoading(true);

    try {
      // Upsert profile - try update first
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          ...values,
          languages: selectedLanguages,
        })
        .eq("id", userId);

      if (profileError?.code === 'PGRST116') {
        // Profile doesn't exist, insert it
        const profileData: any = {
          id: userId,
          full_name: values.full_name,
          bio: values.bio,
          phone: values.phone,
          website: values.website,
          license_number: values.license_number,
          company_name: values.company_name,
          experience_level: values.experience_level,
          years_of_experience: values.years_of_experience,
          referral_fee_percentage: values.referral_fee_percentage,
          hourly_rate: values.hourly_rate,
          price_per_sqft: values.price_per_sqft,
          willing_to_train: values.willing_to_train,
          training_details: values.training_details,
          languages: selectedLanguages,
        };
        const { error: insertError } = await supabase
          .from("profiles")
          .insert(profileData);
        if (insertError) throw insertError;
      } else if (profileError) {
        throw profileError;
      }

      // Delete existing roles and insert new ones
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const roleInserts = selectedRoles.map((role) => ({
        user_id: userId,
        role: role as any,
      }));
      const { error: rolesError } = await supabase.from("user_roles").insert(roleInserts);
      if (rolesError) throw rolesError;

      // Update service areas
      await supabase.from("service_areas").delete().eq("user_id", userId);
      const areaInserts = serviceAreas
        .filter((area) => area.zip_code.trim() !== "")
        .map((area, idx) => ({
          user_id: userId,
          zip_code: area.zip_code,
          radius_miles: area.radius_miles,
          is_primary: idx === 0,
        }));
      if (areaInserts.length > 0) {
        const { error: areasError } = await supabase.from("service_areas").insert(areaInserts);
        if (areasError) throw areasError;
      }

      // Upsert payment preferences
      const { error: paymentError } = await supabase.from("payment_preferences").upsert({
        user_id: userId,
        ...paymentPrefs,
      });
      if (paymentError) throw paymentError;

      toast.success("Profile updated successfully!");
      router.push(`/profile/${userId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const addServiceArea = () => {
    setServiceAreas([...serviceAreas, { zip_code: "", radius_miles: 25 }]);
  };

  const removeServiceArea = (index: number) => {
    setServiceAreas(serviceAreas.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Fill out your professional profile to start connecting with clients and other professionals.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} placeholder="Tell us about yourself..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} type="url" placeholder="https://" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>License Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Roles */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Roles *</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AVAILABLE_ROLES.map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={role}
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={(checked) => {
                          setSelectedRoles(
                            checked
                              ? [...selectedRoles, role]
                              : selectedRoles.filter((r) => r !== role)
                          );
                        }}
                      />
                      <label
                        htmlFor={role}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {formatRole(role)}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="experience_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="seasonal">Seasonal</SelectItem>
                            <SelectItem value="mature">Mature</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="years_of_experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="referral_fee_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referral Fee %</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            max="100"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hourly_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate ($)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="0.01"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price_per_sqft"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Sq Ft ($)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="0.01"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Service Areas */}
            <Card>
              <CardHeader>
                <CardTitle>Service Areas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {serviceAreas.map((area, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="text-sm font-medium">ZIP Code</label>
                      <Input
                        value={area.zip_code}
                        onChange={(e) => {
                          const newAreas = [...serviceAreas];
                          newAreas[index].zip_code = e.target.value;
                          setServiceAreas(newAreas);
                        }}
                        placeholder="90210"
                      />
                    </div>
                    <div className="w-32">
                      <label className="text-sm font-medium">Radius (mi)</label>
                      <Input
                        type="number"
                        min="1"
                        value={area.radius_miles}
                        onChange={(e) => {
                          const newAreas = [...serviceAreas];
                          newAreas[index].radius_miles = parseInt(e.target.value) || 25;
                          setServiceAreas(newAreas);
                        }}
                      />
                    </div>
                    {serviceAreas.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeServiceArea(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addServiceArea} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service Area
                </Button>
              </CardContent>
            </Card>

            {/* Training */}
            <Card>
              <CardHeader>
                <CardTitle>Training & Mentorship</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="willing_to_train"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Willing to train referred parties</FormLabel>
                        <FormDescription>
                          Indicate if you&apos;re willing to provide training to professionals you refer or receive
                          referrals from.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("willing_to_train") && (
                  <FormField
                    control={form.control}
                    name="training_details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Training Details</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Describe what type of training you offer..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Payment Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cash"
                      checked={paymentPrefs.accepts_cash}
                      onCheckedChange={(checked) =>
                        setPaymentPrefs({ ...paymentPrefs, accepts_cash: checked as boolean })
                      }
                    />
                    <label htmlFor="cash" className="text-sm font-medium">
                      Accept Cash
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="credit"
                      checked={paymentPrefs.accepts_credit}
                      onCheckedChange={(checked) =>
                        setPaymentPrefs({ ...paymentPrefs, accepts_credit: checked as boolean })
                      }
                    />
                    <label htmlFor="credit" className="text-sm font-medium">
                      Accept Credit Card
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="financing"
                      checked={paymentPrefs.accepts_financing}
                      onCheckedChange={(checked) =>
                        setPaymentPrefs({ ...paymentPrefs, accepts_financing: checked as boolean })
                      }
                    />
                    <label htmlFor="financing" className="text-sm font-medium">
                      Accept Financing
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Payment Schedule</label>
                    <Select
                      value={paymentPrefs.payment_packet}
                      onValueChange={(value) => setPaymentPrefs({ ...paymentPrefs, payment_packet: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Payment Terms</label>
                    <Input
                      value={paymentPrefs.payment_terms}
                      onChange={(e) => setPaymentPrefs({ ...paymentPrefs, payment_terms: e.target.value })}
                      placeholder="e.g., 50% upfront, 50% on completion"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {LANGUAGES.map((lang) => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        id={lang}
                        checked={selectedLanguages.includes(lang)}
                        onCheckedChange={(checked) => {
                          setSelectedLanguages(
                            checked
                              ? [...selectedLanguages, lang]
                              : selectedLanguages.filter((l) => l !== lang)
                          );
                        }}
                      />
                      <label htmlFor={lang} className="text-sm font-medium">
                        {lang}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ProfileSetup;
