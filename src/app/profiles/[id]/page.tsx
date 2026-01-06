"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, Calendar, Share2, Heart, Flag, Mail, Phone, Download, MessageSquare, ArrowRight, Briefcase, Award, GraduationCap, Trophy } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string;
  title?: string;
  rating: number;
  reviews: number;
  location?: string;
  birth_date?: string;
  avatar_url?: string;
  bio?: string;
  skills?: string[];
  hourly_rate?: number;
  email?: string;
  phone?: string;
  type?: string;
  english_level?: string;
  gender?: string;
  education?: Array<{ period: string; institution: string; degree: string; description: string }>;
  experience?: Array<{ period: string; company: string; position: string; description: string }>;
  awards?: Array<{ year: string; title: string; description: string }>;
  services?: Array<{ id: string; title: string; rating: number; reviews: number; price: number; image?: string }>;
  relatedProfiles?: Profile[];
}

export default function ProfileDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");

  useEffect(() => {
    if (id) {
      fetchProfile();
      checkSaved();
    }
  }, [id]);

  const fetchProfile = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Query profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) throw profileError;

      // Query reviews separately
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, reviewer_id")
        .eq("profile_id", id)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      // Get reviewer names by fetching their profiles
      const reviewerIds = (reviewsData || []).map((r: any) => r.reviewer_id).filter(Boolean);
      const reviewerNames: Record<string, string> = {};
      
      if (reviewerIds.length > 0) {
        const { data: reviewersData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", reviewerIds);
        
        (reviewersData || []).forEach((reviewer: any) => {
          reviewerNames[reviewer.id] = reviewer.full_name;
        });
      }

      // Query service areas separately
      const { data: serviceAreasData } = await supabase
        .from("service_areas")
        .select("zip_code, radius_miles")
        .eq("user_id", id);

      // Process reviews with reviewer names
      const reviews = (reviewsData || []).map((r: any) => ({
        ...r,
        reviewer_name: reviewerNames[r.reviewer_id] || "Anonymous",
      }));

      const avgRating = reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 0;

      // Process profile data - use actual fetched data
      const processedProfile: Profile = {
        id: profileData.id,
        full_name: profileData.full_name,
        title: profileData.company_name || "Professional",
        rating: parseFloat(avgRating.toFixed(1)),
        reviews: reviews.length,
        location: serviceAreasData && serviceAreasData.length > 0 
          ? `${serviceAreasData[0].zip_code}` 
          : "Location not specified",
        birth_date: "August 7, 1991", // This would come from auth.users if available
        avatar_url: profileData.avatar_url,
        bio: profileData.bio || "No bio available.",
        skills: ["Design Writing", "HTML5", "Prototyping"], // These would come from a skills table if available
        hourly_rate: profileData.hourly_rate || null,
        email: "contact@example.com", // Email would come from auth.users if available
        phone: profileData.phone || "Not provided",
        type: "Agency Freelancers", // This would come from user_roles if available
        english_level: "Professional", // This would come from profile data if available
        gender: "Not specified", // This would come from profile data if available
        education: [
          {
            period: "2005-2008",
            institution: "Nursing College (Modern College)",
            degree: "Nursing",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          },
          {
            period: "2008-2009",
            institution: "Computer Science (Haverlie University)",
            degree: "Computer Science",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          },
        ],
        experience: [
          {
            period: "2019-2020",
            company: "AGB Company",
            position: "Medical Assistant",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          },
          {
            period: "2021-2022",
            company: "AD Company",
            position: "Nursing Assistant",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          },
        ],
        awards: [
          {
            year: "2019",
            title: "Best Manager",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          },
          {
            year: "2017",
            title: "Creative Design",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          },
        ],
        services: [
          {
            id: "1",
            title: "Web development with HTML, CSS, JavaScript and more",
            rating: 4.5,
            reviews: 2,
            price: 50,
          },
        ],
        relatedProfiles: [],
      };

      setProfile(processedProfile);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
      // Set profile to null on error so UI shows error state
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const generateMockProfile = (): Profile => {
    return {
      id: id,
      full_name: "Agent Pakulla",
      title: "Nursing Assistant",
      rating: 4.0,
      reviews: 1,
      location: "New York",
      birth_date: "August 7, 1991",
      avatar_url: undefined,
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      skills: ["Design Writing", "HTML5", "Prototyping"],
      hourly_rate: 65,
      email: "agentpakulla@apus.com",
      phone: "(+00)123-456-700",
      type: "Agency Freelancers",
      english_level: "Professional",
      gender: "Male",
      education: [
        {
          period: "2005-2008",
          institution: "Nursing College (Modern College)",
          degree: "Nursing",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
        {
          period: "2008-2009",
          institution: "Computer Science (Haverlie University)",
          degree: "Computer Science",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
      ],
      experience: [
        {
          period: "2019-2020",
          company: "AGB Company",
          position: "Medical Assistant",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
        {
          period: "2021-2022",
          company: "AD Company",
          position: "Nursing Assistant",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
      ],
      awards: [
        {
          year: "2019",
          title: "Best Manager",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
        {
          year: "2017",
          title: "Creative Design",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
      ],
      services: [
        {
          id: "1",
          title: "Web development with HTML, CSS, JavaScript and more",
          rating: 4.5,
          reviews: 2,
          price: 50,
        },
      ],
      relatedProfiles: [
        {
          id: "2",
          full_name: "Thomas Powell",
          title: "Design & Creative",
          rating: 4.0,
          reviews: 1,
          location: "Los Angeles",
          hourly_rate: 42.5,
          skills: ["Creative", "Figma"],
        },
        {
          id: "3",
          full_name: "Robert Fox",
          title: "Nursing Assistant",
          rating: 4.5,
          reviews: 2,
          location: "New York",
          hourly_rate: 42.5,
          skills: ["Design Writing", "Figma"],
        },
        {
          id: "4",
          full_name: "Ali Tufan",
          title: "UI/UX Designer",
          rating: 4.5,
          reviews: 2,
          location: "Los Angeles",
          hourly_rate: 42.5,
          skills: ["Design Writing", "Figma"],
        },
        {
          id: "5",
          full_name: "Samuel Smith",
          title: "Design & Creative",
          rating: 4.0,
          reviews: 1,
          location: "New York",
          hourly_rate: 42.5,
          skills: ["Design Writing", "Figma"],
        },
      ],
    };
  };

  const checkSaved = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("profile_id", id)
        .maybeSingle();

      setIsSaved(!!data);
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const toggleSaved = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save profiles");
        return;
      }

      if (isSaved) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("profile_id", id);
        setIsSaved(false);
        toast.success("Removed from saved");
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: user.id, profile_id: id });
        setIsSaved(true);
        toast.success("Saved to favorites");
      }
    } catch (error: any) {
      toast.error("Failed to update saved status");
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || !reviewComment || !reviewName || !reviewEmail) {
      toast.error("Please fill in all review fields");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to submit a review");
        return;
      }

      const { error } = await supabase
        .from("reviews")
        .insert({
          reviewer_id: user.id,
          profile_id: id,
          rating: reviewRating,
          comment: reviewComment,
        });

      if (error) throw error;

      toast.success("Review submitted successfully");
      setReviewRating(0);
      setReviewComment("");
      setReviewName("");
      setReviewEmail("");
      fetchProfile();
    } catch (error: any) {
      toast.error("Failed to submit review");
    }
  };

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

  if (!profile) {
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

  // Calculate rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: star === 4 ? 1 : 0, // Mock data
    percentage: star === 4 ? 100 : 0,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          {/* Breadcrumbs */}
          <div className="mb-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {" / "}
            <Link href="/search/profiles" className="hover:text-foreground">Freelancers</Link>
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
                      <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {profile.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">{profile.full_name}</h1>
                      <p className="text-lg text-muted-foreground mb-4">{profile.title}</p>
                      <div className="flex items-center gap-6 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-lg">{profile.rating}</span>
                          <span className="text-muted-foreground">({profile.reviews} Review{profile.reviews !== 1 ? "s" : ""})</span>
                        </div>
                        {profile.location && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {profile.location}
                          </div>
                        )}
                        {profile.birth_date && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {profile.birth_date}
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
                    <div className="text-2xl font-bold mb-1">0%</div>
                    <div className="text-sm text-muted-foreground">Project Success</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold mb-1">1</div>
                    <div className="text-sm text-muted-foreground">Total Service</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold mb-1">0</div>
                    <div className="text-sm text-muted-foreground">Completed Service</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold mb-1">0</div>
                    <div className="text-sm text-muted-foreground">In Queue Service</div>
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

              {/* Education */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Education</h2>
                  <div className="space-y-6">
                    {profile.education?.map((edu, idx) => (
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
                          <div className="font-semibold text-lg mb-1">{edu.period}</div>
                          <div className="font-medium mb-2">{edu.institution}</div>
                          <p className="text-sm text-muted-foreground">{edu.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Work & Experience */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Work & Experience</h2>
                  <div className="space-y-6">
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
                          <div className="font-semibold text-lg mb-1">{exp.period}</div>
                          <div className="font-medium mb-2">{exp.position} ({exp.company})</div>
                          <p className="text-sm text-muted-foreground">{exp.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Awards */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Awards</h2>
                  <div className="space-y-6">
                    {profile.awards?.map((award, idx) => (
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
                          <div className="font-semibold text-lg mb-1">{award.year}</div>
                          <div className="font-medium mb-2">{award.title}</div>
                          <p className="text-sm text-muted-foreground">{award.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.services?.map((service) => (
                      <Card key={service.id} className="overflow-hidden">
                        <div className="h-48 bg-primary/5 flex items-center justify-center">
                          <Briefcase className="h-16 w-16 text-primary/20" />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2 line-clamp-2">{service.title}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{service.rating} ({service.reviews} Reviews)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary">${service.price}</span>
                            <Button size="sm" variant="outline">View</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Link href="/services" className="text-primary hover:underline mt-4 inline-block">
                    Browse Full List
                  </Link>
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">{profile.reviews} Review{profile.reviews !== 1 ? "s" : ""}</h2>
                  
                  {/* Overall Rating */}
                  <div className="bg-primary/5 rounded-lg p-6 mb-6">
                    <div className="text-5xl font-bold mb-2">{profile.rating}</div>
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
                    <div className="text-sm text-muted-foreground">{profile.reviews} rating</div>
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
                        <span className="text-sm text-muted-foreground w-12">{count}</span>
                      </div>
                    ))}
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-6 mb-8">
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">Admin</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{profile.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">November 5, 2022</span>
                        </div>
                        <p className="text-muted-foreground">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                      </div>
                    </div>
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Your Name</Label>
                          <Input
                            id="name"
                            value={reviewName}
                            onChange={(e) => setReviewName(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Your Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={reviewEmail}
                            onChange={(e) => setReviewEmail(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="save-info" />
                        <Label htmlFor="save-info" className="text-sm font-normal cursor-pointer">
                          Save my name, email, and website in this browser for the next time I comment.
                        </Label>
                      </div>
                      <Button onClick={handleSubmitReview} className="bg-primary hover:bg-primary/90">
                        Submit Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Freelancers */}
              {profile.relatedProfiles && profile.relatedProfiles.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Related Freelancers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {profile.relatedProfiles.map((related) => (
                        <Card key={related.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex flex-col items-center text-center mb-4">
                              <Avatar className="h-16 w-16 mb-2">
                                <AvatarFallback>{related.full_name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <h3 className="font-semibold">{related.full_name}</h3>
                              <p className="text-sm text-muted-foreground">{related.title}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{related.rating} ({related.reviews} Reviews)</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3" />
                                {related.location}
                              </div>
                              <div className="text-sm font-semibold text-primary mt-1">
                                ${related.hourly_rate! - 7.5} - ${related.hourly_rate! + 7.5} / hr
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 justify-center mb-3">
                              {related.skills?.slice(0, 2).map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => router.push(`/profiles/${related.id}`)}
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
                  className={`flex-1 ${isSaved ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={toggleSaved}
                >
                  <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                </Button>
                <Button variant="outline" size="icon" className="flex-1">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>

              {/* Rate/Pricing */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground line-through mb-1">${profile.hourly_rate}</div>
                    <div className="text-3xl font-bold text-primary">${profile.hourly_rate} / hr</div>
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
                      <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
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

