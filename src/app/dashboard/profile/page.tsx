"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { FreeioDashboardHeader } from "@/components/dashboard/FreeioDashboardHeader";
import { FreeioFooter } from "@/components/dashboard/FreeioFooter";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Mail, Phone, MapPin, Briefcase, Award, FileText, 
  CreditCard, Globe, Calendar, CheckCircle2, Edit 
} from "lucide-react";
import { toast } from "sonner";

type UserType = "buyer" | "agent";

export default function DashboardProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userType, setUserType] = useState<UserType>("agent");
  const [loading, setLoading] = useState(true);
  const [registrationData, setRegistrationData] = useState<any>({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      router.push("/auth");
      return;
    }

    setUser(currentUser);
    await fetchProfile(currentUser.id);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Profile error:", profileError);
        toast.error("Failed to load profile");
        return;
      }

      if (!profileData) {
        router.push("/register");
        return;
      }

      setProfile(profileData);
      const profileInfo = profileData as any;

      // Determine user type
      if (profileInfo.user_type === "service_provider") {
        setUserType("agent");
      } else if (profileInfo.user_type === "business_buyer") {
        setUserType("buyer");
      }

      // Fetch additional registration data based on user type
      const supabaseClient = supabase as any;
      const additionalData: any = {};

      if (profileInfo.user_type === "service_provider") {
        // Fetch service provider specific data
        const [
          { data: paymentPrefs },
          { data: preferenceRankings },
          { data: licenses },
          { data: identityDocs },
          { data: bondsInsurance },
          { data: eSignatures },
          { data: serviceAreas },
        ] = await Promise.all([
          supabaseClient.from("payment_preferences").select("*").eq("user_id", userId).maybeSingle(),
          supabaseClient.from("preference_rankings").select("*").eq("user_id", userId),
          supabaseClient.from("licenses_credentials").select("*").eq("user_id", userId),
          supabaseClient.from("identity_documents").select("*").eq("user_id", userId),
          supabaseClient.from("bonds_insurance").select("*").eq("user_id", userId),
          supabaseClient.from("e_signatures").select("*").eq("user_id", userId),
          supabaseClient.from("service_areas").select("*").eq("user_id", userId),
        ]);

        additionalData.paymentPreferences = paymentPrefs;
        additionalData.preferenceRankings = preferenceRankings || [];
        additionalData.licenses = licenses || [];
        additionalData.identityDocuments = identityDocs || [];
        additionalData.bondsInsurance = bondsInsurance || [];
        additionalData.eSignatures = eSignatures || [];
        additionalData.serviceAreas = serviceAreas || [];
      } else if (profileInfo.user_type === "business_buyer") {
        // Fetch business buyer specific data
        const [
          { data: buyerBasicInfo },
          { data: buyerPreferences },
          { data: maintenancePlans },
          { data: eSignatures },
        ] = await Promise.all([
          supabaseClient.from("buyer_basic_info").select("*").eq("user_id", userId).maybeSingle(),
          supabaseClient.from("buyer_preferences").select("*").eq("user_id", userId).maybeSingle(),
          supabaseClient.from("demography_maintenance_plans").select("*").eq("user_id", userId).maybeSingle(),
          supabaseClient.from("e_signatures").select("*").eq("user_id", userId),
        ]);

        additionalData.buyerBasicInfo = buyerBasicInfo;
        additionalData.buyerPreferences = buyerPreferences;
        additionalData.maintenancePlans = maintenancePlans;
        additionalData.eSignatures = eSignatures || [];
      }

      setRegistrationData(additionalData);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const profileInfo = profile as any;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 w-full">
        <FreeioDashboardHeader user={user} profile={profile} userType={userType} />
        <div className="flex flex-1 w-full">
          <DashboardSidebar userType={userType} profile={profile} />
          <main className="flex-1 p-8 bg-gray-50 w-full max-w-full overflow-x-hidden">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                  <p className="text-muted-foreground mt-1">
                    View and manage your profile information
                  </p>
                </div>
                <Button onClick={() => router.push("/dashboard/profile/edit")}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              {/* Profile Overview Card */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profileInfo.avatar_url} />
                      <AvatarFallback className="bg-primary text-white text-2xl">
                        {profileInfo.full_name?.charAt(0) || profileInfo.first_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {profileInfo.full_name || `${profileInfo.first_name} ${profileInfo.last_name}`}
                        </h2>
                        <Badge variant={profileInfo.registration_status === "approved" ? "default" : "secondary"}>
                          {profileInfo.registration_status || "Pending"}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{profileInfo.bio || "No bio available"}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {profileInfo.email && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{profileInfo.email}</span>
                          </div>
                        )}
                        {profileInfo.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{profileInfo.phone}</span>
                          </div>
                        )}
                        {profileInfo.business_name && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Briefcase className="h-4 w-4" />
                            <span>{profileInfo.business_name}</span>
                          </div>
                        )}
                        {profileInfo.website && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Globe className="h-4 w-4" />
                            <a href={profileInfo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs for different sections */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="registration">Registration Details</TabsTrigger>
                  {userType === "agent" && <TabsTrigger value="services">Services</TabsTrigger>}
                  {userType === "buyer" && <TabsTrigger value="preferences">Preferences</TabsTrigger>}
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <User className="h-5 w-5" />
                          <span>Personal Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium">{profileInfo.full_name || `${profileInfo.first_name} ${profileInfo.last_name}`}</p>
                        </div>
                        {profileInfo.birthday && (
                          <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="font-medium">{new Date(profileInfo.birthday).toLocaleDateString()}</p>
                          </div>
                        )}
                        {profileInfo.mailing_address && (
                          <div>
                            <p className="text-sm text-gray-500">Mailing Address</p>
                            <p className="font-medium">{profileInfo.mailing_address}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Briefcase className="h-5 w-5" />
                          <span>Business Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {profileInfo.business_name && (
                          <div>
                            <p className="text-sm text-gray-500">Business Name</p>
                            <p className="font-medium">{profileInfo.business_name}</p>
                          </div>
                        )}
                        {profileInfo.business_address && (
                          <div>
                            <p className="text-sm text-gray-500">Business Address</p>
                            <p className="font-medium">{profileInfo.business_address}</p>
                          </div>
                        )}
                        {profileInfo.number_of_employees && (
                          <div>
                            <p className="text-sm text-gray-500">Number of Employees</p>
                            <p className="font-medium">{profileInfo.number_of_employees}</p>
                          </div>
                        )}
                        {profileInfo.years_of_experience && (
                          <div>
                            <p className="text-sm text-gray-500">Years of Experience</p>
                            <p className="font-medium">{profileInfo.years_of_experience}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {profileInfo.languages && profileInfo.languages.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Languages</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {profileInfo.languages.map((lang: string, idx: number) => (
                            <Badge key={idx} variant="outline">{lang}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Registration Details Tab */}
                <TabsContent value="registration" className="space-y-6">
                  {userType === "agent" ? (
                    <>
                      {registrationData.paymentPreferences && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <CreditCard className="h-5 w-5" />
                              <span>Payment Preferences</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Accepts Cash</p>
                                <p className="font-medium">{registrationData.paymentPreferences.accepts_cash ? "Yes" : "No"}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Accepts Credit</p>
                                <p className="font-medium">{registrationData.paymentPreferences.accepts_credit ? "Yes" : "No"}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Accepts Financing</p>
                                <p className="font-medium">{registrationData.paymentPreferences.accepts_financing ? "Yes" : "No"}</p>
                              </div>
                              {registrationData.paymentPreferences.payment_packet && (
                                <div>
                                  <p className="text-sm text-gray-500">Payment Packet</p>
                                  <p className="font-medium">{registrationData.paymentPreferences.payment_packet}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {registrationData.serviceAreas && registrationData.serviceAreas.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <MapPin className="h-5 w-5" />
                              <span>Service Areas</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {registrationData.serviceAreas.map((area: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <span className="font-medium">ZIP: {area.zip_code}</span>
                                  <span className="text-sm text-gray-500">Radius: {area.radius_miles} miles</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {registrationData.licenses && registrationData.licenses.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Award className="h-5 w-5" />
                              <span>Licenses & Credentials</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {registrationData.licenses.map((license: any, idx: number) => (
                                <div key={idx} className="p-3 bg-gray-50 rounded">
                                  <p className="font-medium">{license.license_type || "License"}</p>
                                  {license.license_number && <p className="text-sm text-gray-600">Number: {license.license_number}</p>}
                                  {license.expiration_date && (
                                    <p className="text-sm text-gray-600">
                                      Expires: {new Date(license.expiration_date).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  ) : (
                    <>
                      {registrationData.buyerBasicInfo && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Business Buyer Information</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              {registrationData.buyerBasicInfo.company_name && (
                                <div>
                                  <p className="text-sm text-gray-500">Company Name</p>
                                  <p className="font-medium">{registrationData.buyerBasicInfo.company_name}</p>
                                </div>
                              )}
                              {registrationData.buyerBasicInfo.location_zip_code && (
                                <div>
                                  <p className="text-sm text-gray-500">Location ZIP Code</p>
                                  <p className="font-medium">{registrationData.buyerBasicInfo.location_zip_code}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {registrationData.maintenancePlans && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Maintenance Plans</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {registrationData.maintenancePlans.payment_frequency && (
                                <div>
                                  <p className="text-sm text-gray-500">Payment Frequency</p>
                                  <p className="font-medium">{registrationData.maintenancePlans.payment_frequency}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}

                  {registrationData.eSignatures && registrationData.eSignatures.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="h-5 w-5" />
                          <span>E-Signatures</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {registrationData.eSignatures.map((sig: any, idx: number) => (
                            <div key={idx} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm">
                                Signed: {sig.document_name || "Document"} on {new Date(sig.signed_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Services Tab (Agent only) */}
                {userType === "agent" && (
                  <TabsContent value="services" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Service Information</CardTitle>
                        <CardDescription>Your service offerings and capabilities</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {registrationData.preferenceRankings && registrationData.preferenceRankings.length > 0 ? (
                          <div className="space-y-4">
                            {registrationData.preferenceRankings.map((ranking: any, idx: number) => (
                              <div key={idx} className="p-4 border rounded-lg">
                                <p className="font-medium mb-2">{ranking.category || "Category"}</p>
                                <p className="text-sm text-gray-600">Rank: {ranking.rank || "N/A"}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No service preferences configured yet.</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {/* Preferences Tab (Buyer only) */}
                {userType === "buyer" && (
                  <TabsContent value="preferences" className="space-y-6">
                    {registrationData.buyerPreferences && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Property Preferences</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            {registrationData.buyerPreferences.property_type && (
                              <div>
                                <p className="text-sm text-gray-500">Property Type</p>
                                <p className="font-medium">{registrationData.buyerPreferences.property_type}</p>
                              </div>
                            )}
                            {registrationData.buyerPreferences.budget_range && (
                              <div>
                                <p className="text-sm text-gray-500">Budget Range</p>
                                <p className="font-medium">{registrationData.buyerPreferences.budget_range}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </main>
        </div>
        <FreeioFooter />
      </div>
    </SidebarProvider>
  );
}

