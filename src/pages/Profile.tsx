import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, DollarSign, Award, Phone, Globe, Briefcase, Languages, CreditCard, Edit } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  website: string | null;
  license_number: string | null;
  company_name: string | null;
  experience_level: string | null;
  years_of_experience: number | null;
  referral_fee_percentage: number | null;
  hourly_rate: number | null;
  price_per_sqft: number | null;
  willing_to_train: boolean;
  training_details: string | null;
  languages: string[];
}

interface Role {
  role: string;
}

interface ServiceArea {
  zip_code: string;
  radius_miles: number;
  is_primary: boolean;
}

interface PaymentPreference {
  accepts_cash: boolean;
  accepts_credit: boolean;
  accepts_financing: boolean;
  payment_packet: string | null;
  payment_terms: string | null;
}

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [paymentPrefs, setPaymentPrefs] = useState<PaymentPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", id);
        setRoles(rolesData || []);

        const { data: areasData } = await supabase
          .from("service_areas")
          .select("*")
          .eq("user_id", id);
        setServiceAreas(areasData || []);

        const { data: paymentData } = await supabase
          .from("payment_preferences")
          .select("*")
          .eq("user_id", id)
          .maybeSingle();
        setPaymentPrefs(paymentData);
      } catch (error: any) {
        toast.error("Failed to load profile");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <Link to="/browse">
            <Button>Browse Professionals</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUserId === id;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-5xl">
        {/* Header Section */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl font-bold">
                    {profile.full_name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{profile.full_name}</h1>
                    {profile.company_name && (
                      <p className="text-lg text-muted-foreground flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        {profile.company_name}
                      </p>
                    )}
                  </div>
                  {isOwnProfile && (
                    <Link to={`/profile/${id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Roles */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {roles.map((r, idx) => (
                    <Badge key={idx} variant="default" className="text-sm">
                      {formatRole(r.role)}
                    </Badge>
                  ))}
                </div>

                {/* Experience */}
                {profile.experience_level && (
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{profile.experience_level} Level</span>
                    {profile.years_of_experience && (
                      <span className="text-sm text-muted-foreground">
                        • {profile.years_of_experience} years experience
                      </span>
                    )}
                  </div>
                )}

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {profile.phone && (
                    <a href={`tel:${profile.phone}`} className="flex items-center gap-1 hover:text-primary">
                      <Phone className="h-4 w-4" />
                      {profile.phone}
                    </a>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  )}
                </div>

                {profile.license_number && (
                  <p className="text-sm text-muted-foreground mt-2">
                    License: {profile.license_number}
                  </p>
                )}
              </div>
            </div>

            {profile.bio && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pricing */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing & Fees
              </h3>
              <div className="space-y-3">
                {profile.referral_fee_percentage !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Referral Fee</p>
                    <p className="text-2xl font-bold text-primary">{profile.referral_fee_percentage}%</p>
                  </div>
                )}
                {profile.hourly_rate !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Hourly Rate</p>
                    <p className="text-2xl font-bold">${profile.hourly_rate}/hr</p>
                  </div>
                )}
                {profile.price_per_sqft !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Price per Sq Ft</p>
                    <p className="text-2xl font-bold">${profile.price_per_sqft}/sqft</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Areas */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Service Areas
              </h3>
              <div className="space-y-2">
                {serviceAreas.length > 0 ? (
                  serviceAreas.map((area, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="font-medium">{area.zip_code}</span>
                      <span className="text-sm text-muted-foreground">
                        {area.radius_miles} mile radius
                        {area.is_primary && <Badge className="ml-2">Primary</Badge>}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No service areas listed</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Training */}
          {profile.willing_to_train && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Training Available
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  This professional is willing to train referred parties.
                </p>
                {profile.training_details && (
                  <p className="text-sm">{profile.training_details}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Preferences */}
          {paymentPrefs && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Options
                </h3>
                <div className="space-y-2">
                  {paymentPrefs.accepts_cash && (
                    <Badge variant="outline">Cash</Badge>
                  )}
                  {paymentPrefs.accepts_credit && (
                    <Badge variant="outline">Credit Card</Badge>
                  )}
                  {paymentPrefs.accepts_financing && (
                    <Badge variant="outline">Financing</Badge>
                  )}
                  {paymentPrefs.payment_packet && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Payment Schedule: {paymentPrefs.payment_packet}
                    </p>
                  )}
                  {paymentPrefs.payment_terms && (
                    <p className="text-sm mt-2">{paymentPrefs.payment_terms}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {profile.languages && profile.languages.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang, idx) => (
                    <Badge key={idx} variant="secondary">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact CTA */}
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Interested in working with {profile.full_name}?</h3>
            <p className="text-muted-foreground mb-4">
              Connect directly to discuss your project needs and get started.
            </p>
            <div className="flex gap-4 justify-center">
              {profile.phone && (
                <Button size="lg" asChild>
                  <a href={`tel:${profile.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Now
                  </a>
                </Button>
              )}
              <Button size="lg" variant="outline">
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
