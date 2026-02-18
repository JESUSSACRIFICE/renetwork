"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  MapPin,
  Share2,
  Heart,
  Flag,
  Mail,
  Phone,
  Download,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Trophy,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useProfile,
  useProfileFavorite,
  useSubmitReview,
  type ProfessionalProfile,
} from "@/hooks/use-professional-profiles";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function ProfileDetail() {
  const params = useParams();
  const router = useRouter();
  const id = (params as { id: string }).id;
  const { user } = useAuth();
  const { data: rawProfile, isLoading, error } = useProfile(id);
  const { isFavorite, toggleFavorite, isToggling } = useProfileFavorite(
    id,
    user?.id ?? null,
  );
  const submitReview = useSubmitReview(id);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const profile = useMemo(() => {
    if (!rawProfile) return null;
    const p = rawProfile as ProfessionalProfile;
    const reviews = p.reviews ?? [];
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
    const location =
      p.service_areas?.length > 0
        ? p.service_areas[0].zip_code
        : "Location not specified";
    const title = p.company_name || p.full_name || "Professional";
    const type = p.psp_labels?.length
      ? p.psp_labels.join(", ")
      : p.user_roles?.length
        ? p.user_roles.map((r) => r.role).join(", ")
        : undefined;

    return {
      id: p.id,
      full_name: p.full_name,
      title,
      rating: parseFloat(avgRating.toFixed(1)),
      reviews: reviews.length,
      location,
      avatar_url: p.avatar_url ?? undefined,
      bio: p.bio ?? "No bio available.",
      skills: p.skills ?? [],
      hourly_rate: p.hourly_rate ?? undefined,
      email: p.email ?? undefined,
      phone: p.phone ?? "Not provided",
      type,
      psp_labels: p.psp_labels ?? [],
      reviewsList: reviews,
      education: [] as Array<{
        period: string;
        institution: string;
        degree: string;
        description: string;
      }>,
      experience: [] as Array<{
        period: string;
        company: string;
        position: string;
        description: string;
      }>,
      experience_level: p.experience_level ?? undefined,
      years_of_experience: p.years_of_experience ?? undefined,
      awards: (p.awards ?? []).map((a) => ({
        year: a.date_awarded ? new Date(a.date_awarded).getFullYear().toString() : "",
        title: a.title,
        description: a.description ?? "",
      })),
      services: (p.services ?? []).map((s) => ({
        id: s.id,
        title: s.title,
        rating: 0,
        reviews: 0,
        price: s.price,
      })),
      relatedProfiles: p.related_profiles ?? [],
      english_level: (p as { english_level?: string }).english_level,
      gender: (p as { gender?: string }).gender,
    };
  }, [rawProfile]);

  console.log("profile", profile);

  const handleSubmitReview = () => {
    if (!reviewRating || !reviewComment || !reviewComment.trim()) {
      toast.error("Please add a rating and comment");
      return;
    }
    submitReview.mutate(
      { rating: reviewRating, comment: reviewComment.trim() },
      {
        onSuccess: () => {
          setReviewRating(0);
          setReviewComment("");
        },
      },
    );
  };

  if (isLoading) {
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

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
            <Link href="/search/profiles">
              <Button>Browse Profiles</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate rating breakdown from actual reviews
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count =
      profile.reviewsList?.filter((r) => Math.round(r.rating) === star)
        .length ?? 0;
    const total = profile.reviewsList?.length ?? 0;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          {/* Breadcrumbs */}
          <div className="mb-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            {" / "}
            <Link href="/search/profiles" className="hover:text-foreground">
              Freelancers
            </Link>
            {" / "}
            <span className="text-foreground">{profile.full_name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
            {/* Main Content */}
            <div className="space-y-8">
              {/* Profile Header */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <Avatar className="h-24 w-24 border-4 border-background">
                      <AvatarImage
                        src={profile.avatar_url}
                        alt={profile.full_name}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {profile.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">
                        {profile.full_name}
                      </h1>
                      <p className="text-lg text-muted-foreground mb-4">
                        {profile.title}
                      </p>
                      <div className="flex items-center gap-6 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-lg">
                            {profile.rating}
                          </span>
                          <span className="text-muted-foreground">
                            ({profile.reviews} Review
                            {profile.reviews !== 1 ? "s" : ""})
                          </span>
                        </div>
                        {profile.location && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {profile.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold mb-1">
                      {profile.reviews > 0
                        ? Math.round((profile.rating / 5) * 100)
                        : 0}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Project Success
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold mb-1">
                      {profile.services?.length ?? 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Service
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold mb-1">
                      {profile.reviews}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Completed Service
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold mb-1">0</div>
                    <div className="text-sm text-muted-foreground">
                      In Queue Service
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* About */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">About Freelancer</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{profile.bio}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Education - only show when data exists */}
              {profile.education && profile.education.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Education</h2>
                  <div className="space-y-6">
                    {profile.education.map((edu, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-primary" />
                          </div>
                          {idx < (profile.education?.length || 0) - 1 && (
                            <div className="w-0.5 h-full bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="font-semibold text-lg mb-1">
                            {edu.period}
                          </div>
                          <div className="font-medium mb-2">
                            {edu.institution}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {edu.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Work & Experience */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Work & Experience</h2>
                  <div className="space-y-6">
                    {(profile.experience_level || profile.years_of_experience != null) && (profile.experience?.length ?? 0) === 0 && (
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium mb-1">
                            {profile.experience_level && (
                              <span>Experience level: {profile.experience_level}</span>
                            )}
                            {profile.experience_level && profile.years_of_experience != null && " · "}
                            {profile.years_of_experience != null && (
                              <span>{profile.years_of_experience} years of experience</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {profile.experience?.map((exp, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Briefcase className="h-6 w-6 text-primary" />
                          </div>
                          {idx < (profile.experience?.length || 0) - 1 && (
                            <div className="w-0.5 h-full bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="font-semibold text-lg mb-1">
                            {exp.period}
                          </div>
                          <div className="font-medium mb-2">
                            {exp.position} ({exp.company})
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {exp.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Awards - only show when data exists */}
              {profile.awards && profile.awards.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Awards</h2>
                  <div className="space-y-6">
                    {profile.awards.map((award, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Trophy className="h-6 w-6 text-primary" />
                          </div>
                          {idx < (profile.awards?.length || 0) - 1 && (
                            <div className="w-0.5 h-full bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="font-semibold text-lg mb-1">
                            {award.year}
                          </div>
                          <div className="font-medium mb-2">{award.title}</div>
                          <p className="text-sm text-muted-foreground">
                            {award.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Services - only show when data exists */}
              {profile.services && profile.services.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.services.map((service) => (
                      <Card key={service.id} className="overflow-hidden">
                        <div className="h-48 bg-primary/5 flex items-center justify-center">
                          <Briefcase className="h-16 w-16 text-primary/20" />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2 line-clamp-2">
                            {service.title}
                          </h3>
                          {(service.reviews > 0 || service.rating > 0) && (
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">
                                {service.rating} ({service.reviews} Reviews)
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary">
                              ${service.price}
                            </span>
                            <Link href={`/services/${service.id}`}>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Link
                    href="/search/services"
                    className="text-primary hover:underline mt-4 inline-block"
                  >
                    Browse Full List
                  </Link>
                </CardContent>
              </Card>
              )}

              {/* Reviews */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">
                    {profile.reviews} Review{profile.reviews !== 1 ? "s" : ""}
                  </h2>

                  {/* Overall Rating */}
                  <div className="bg-primary/5 rounded-lg p-6 mb-6">
                    <div className="text-5xl font-bold mb-2">
                      {profile.rating}
                    </div>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 ${
                            star <= Math.round(profile.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {profile.reviews} rating
                    </div>
                  </div>

                  {/* Rating Breakdown */}
                  <div className="space-y-2 mb-6">
                    {ratingBreakdown.map(({ star, count, percentage }) => (
                      <div key={star} className="flex items-center gap-4">
                        <span className="text-sm w-12">{star} Star</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-6 mb-8">
                    {profile.reviewsList?.map((r, idx) => (
                      <div key={idx} className="flex gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {(r.reviewer?.full_name ?? "A").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">
                              {r.reviewer?.full_name ?? "Anonymous"}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{r.rating}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {r.created_at
                                ? new Date(r.created_at).toLocaleDateString()
                                : ""}
                            </span>
                          </div>
                          <p className="text-muted-foreground">
                            {r.comment ?? ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Review Form */}
                  <div className="border-t pt-6">
                    <h3 className="text-xl font-bold mb-4">Add a review</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Your Rating for this listing</Label>
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  star <= reviewRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="comment">Your Comment</Label>
                        <Textarea
                          id="comment"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="mt-2"
                          rows={4}
                        />
                      </div>
                      <Button
                        onClick={handleSubmitReview}
                        disabled={submitReview.isPending}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Submit Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Freelancers */}
              {profile.relatedProfiles &&
                profile.relatedProfiles.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-6">
                        Related Freelancers
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {profile.relatedProfiles.map((related) => (
                          <Card key={related.id} className="overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex flex-col items-center text-center mb-4">
                                <Avatar className="h-16 w-16 mb-2">
                                  <AvatarImage src={related.avatar_url} alt={related.full_name} />
                                  <AvatarFallback>
                                    {related.full_name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <h3 className="font-semibold">
                                  {related.full_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {related.title}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm">
                                    {related.rating} ({related.reviews} Reviews)
                                  </span>
                                </div>
                                {related.location && (
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {related.location}
                                  </div>
                                )}
                                {related.hourly_rate != null && (
                                  <div className="text-sm font-semibold text-primary mt-1">
                                    ${related.hourly_rate - 7.5} - $
                                    {related.hourly_rate + 7.5} / hr
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1 justify-center mb-3">
                                {related.skills
                                  ?.slice(0, 2)
                                  .map((skill, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                              </div>
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() =>
                                  router.push(`/profiles/${related.id}`)
                                }
                              >
                                View Profile
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Share/Save */}
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="flex-1">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`flex-1 ${isFavorite ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={toggleFavorite}
                  disabled={isToggling}
                >
                  <Heart
                    className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                  />
                </Button>
                <Button variant="outline" size="icon" className="flex-1">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>

              {/* Rate/Pricing */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    {profile.hourly_rate != null && (
                      <div className="text-3xl font-bold text-primary">
                        ${profile.hourly_rate} / hr
                      </div>
                    )}
                    {profile.hourly_rate == null && (
                      <div className="text-muted-foreground">Rate not set</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Buttons */}
              <div className="space-y-3">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Download className="h-4 w-4 mr-2" />
                  Download CV
                </Button>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>

              {/* Freelancer Details */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.type && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.type}</span>
                    </div>
                  )}
                  {profile.english_level && (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.english_level}</span>
                    </div>
                  )}
                  {profile.gender && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">♂</span>
                      <span>{profile.gender}</span>
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm break-all">{profile.email}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">My Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.map((skill, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Me Button */}
              <Button className="w-full bg-primary hover:bg-primary/90">
                Contact Me
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
