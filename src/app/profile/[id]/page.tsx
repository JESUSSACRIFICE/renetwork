"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Heart,
  DollarSign,
  Award,
  Briefcase,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ContactForm from "@/components/professional/ContactForm";
import { ReferClientDialog } from "@/components/professional/ReferClientDialog";
import ReviewsList from "@/components/professional/ReviewsList";
import { Separator } from "@/components/ui/separator";
import {
  useProfile,
  useProfileFavorite,
} from "@/hooks/use-professional-profiles";
import { useAuth } from "@/hooks/use-auth";

export default function ProfessionalDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = (params?.id as string) ?? null;
  const referrerCode = searchParams.get("ref");
  const { user } = useAuth();
  const {
    data: professional,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useProfile(id);
  const { isFavorite, toggleFavorite, isToggling } = useProfileFavorite(
    id,
    user?.id ?? null,
  );

  const isOwnProfile = !!id && !!user && user.id === id;

  useEffect(() => {
    if (isError) toast.error("Failed to load professional");
  }, [isError]);

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const avgRating = professional?.reviews?.length
    ? (
        professional.reviews.reduce(
          (sum: number, r: any) => sum + r.rating,
          0,
        ) / professional.reviews.length
      ).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Professional Not Found</h1>
            <Link href="/search/services">
              <Button>Browse Professionals</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/10 to-background border-b">
          <div className="container py-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage
                  src={professional.avatar_url}
                  alt={professional.full_name}
                />
                <AvatarFallback className="text-3xl">
                  {professional.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      {professional.company_name || professional.full_name}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-3">
                      {professional.full_name}
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-warning text-warning" />
                        <span className="font-semibold text-lg">
                          {avgRating}
                        </span>
                        <span className="text-muted-foreground">
                          ({professional.reviews?.length || 0} reviews)
                        </span>
                      </div>
                      {professional.service_areas?.[0] && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {professional.service_areas[0].zip_code} (
                          {professional.service_areas[0].radius_miles} mi)
                        </div>
                      )}
                    </div>
                  </div>
                  {!isOwnProfile && (
                    <Button
                      variant={isFavorite ? "default" : "outline"}
                      size="icon"
                      onClick={() => toggleFavorite()}
                      disabled={isToggling}
                      className="shrink-0"
                    >
                      <Heart className={isFavorite ? "fill-current" : ""} />
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {professional.user_roles?.map((r: any, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-sm">
                      {formatRole(r.role)}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  {professional.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      {professional.phone}
                    </div>
                  )}
                  {professional.website && (
                    <a
                      href={professional.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  )}
                </div>
              </div>

              <Card className="p-6 min-w-[250px]">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {professional.hourly_rate
                        ? "Starting at"
                        : professional.price_per_sqft
                          ? "Price per sqft"
                          : "Referral Fee"}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {professional.hourly_rate
                        ? `$${professional.hourly_rate}/hr`
                        : professional.price_per_sqft
                          ? `$${professional.price_per_sqft}/sqft`
                          : professional.referral_fee_percentage
                            ? `${professional.referral_fee_percentage}%`
                            : "Contact for quote"}
                    </p>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4" />
                    <span>
                      {professional.years_of_experience || 0} years experience
                    </span>
                  </div>
                  {professional.license_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4" />
                      <span>License #{professional.license_number}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="reviews">
                    Reviews ({professional.reviews?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="service-areas">Service Areas</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="mt-6">
                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">About</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {professional.bio || "No bio available."}
                    </p>

                    {professional.languages &&
                      professional.languages.length > 0 && (
                        <div className="mb-4">
                          <h3 className="font-semibold mb-2">Languages</h3>
                          <div className="flex flex-wrap gap-2">
                            {professional.languages.map((lang: string) => (
                              <Badge key={lang} variant="outline">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                    {professional.willing_to_train && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="h-4 w-4" />
                        <span>Willing to train and mentor</span>
                      </div>
                    )}
                  </Card>

                  {professional.payment_preferences && (
                    <Card className="p-6 mt-6">
                      <h2 className="text-xl font-bold mb-4">
                        Payment Options
                      </h2>
                      <div className="space-y-2">
                        {professional.payment_preferences.accepts_cash && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span>Accepts Cash</span>
                          </div>
                        )}
                        {professional.payment_preferences.accepts_credit && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span>Accepts Credit Cards</span>
                          </div>
                        )}
                        {professional.payment_preferences.accepts_financing && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span>Offers Financing</span>
                          </div>
                        )}
                        {professional.payment_preferences.payment_terms && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Terms:{" "}
                            {professional.payment_preferences.payment_terms}
                          </p>
                        )}
                      </div>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  <ReviewsList
                    profileId={id}
                    reviews={professional.reviews || []}
                    onReviewAdded={refetch}
                  />
                </TabsContent>

                <TabsContent value="service-areas" className="mt-6">
                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Service Areas</h2>
                    {professional.service_areas &&
                    professional.service_areas.length > 0 ? (
                      <div className="space-y-3">
                        {professional.service_areas.map(
                          (area: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                            >
                              <MapPin className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">
                                  ZIP Code: {area.zip_code}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Service radius: {area.radius_miles} miles
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No service areas specified
                      </p>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Contact Sidebar */}
            <div className="space-y-6">
              {isOwnProfile ? (
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    You&apos;re viewing your public profile as others see it.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button asChild variant="default">
                      <Link href={`/profile/${id}/edit`}>Edit profile</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {user && (
                    <ReferClientDialog
                      profileId={id}
                      professionalName={professional.full_name}
                      referrerId={user.id}
                    />
                  )}
                  <ContactForm
                    profileId={id}
                    professionalName={professional.full_name}
                    referrerCode={referrerCode}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
