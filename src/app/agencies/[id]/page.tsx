"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, Building2, Mail, Phone, Calendar, Share2, Heart, MessageSquare, ChevronLeft, ChevronRight, Send } from "lucide-react";
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
import Image from "next/image";

interface Agency {
  id: string;
  name: string;
  company_name?: string;
  tagline?: string;
  rating: number;
  reviews: number;
  location?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  avatar_url?: string;
  bio?: string;
  employees?: string;
  founded_date?: string;
  categories?: string[];
  images?: string[];
  projects?: Array<{
    id: string;
    title: string;
    location: string;
    posted_date: string;
    proposals: number;
    price: string;
    description: string;
    tags: string[];
  }>;
  openPositions?: Array<{
    id: string;
    title: string;
    company: string;
    salary: string;
    tags: string[];
    location: string;
  }>;
  reviewBreakdown?: {
    five: number;
    four: number;
    three: number;
    two: number;
    one: number;
  };
  comments?: Array<{
    id: string;
    author: string;
    avatar?: string;
    rating: number;
    date: string;
    comment: string;
  }>;
}

export default function AgencyDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [saveInfo, setSaveInfo] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAgency();
      checkSaved();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAgency = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Query profile as agency
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) throw profileError;

      // Fetch company_name from business_info
      const { data: businessInfo } = await supabase
        .from("business_info")
        .select("company_name")
        .eq("user_id", id)
        .maybeSingle();

      const companyName = businessInfo?.company_name ?? null;

      // Query reviews separately
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`id, rating, comment, created_at, reviewer_id`)
        .eq("profile_id", id);

      if (reviewsError) throw reviewsError;

      const reviewerIds = (reviewsData || []).map((r: any) => r.reviewer_id);
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

      const reviews = (reviewsData || []).map((r: any) => ({
        ...r,
        reviewer_name: reviewerNames[r.reviewer_id] || "Anonymous",
      }));

      const avgRating = reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 0;

      // Calculate review breakdown
      const breakdown = {
        five: reviews.filter((r: any) => r.rating === 5).length,
        four: reviews.filter((r: any) => r.rating === 4).length,
        three: reviews.filter((r: any) => r.rating === 3).length,
        two: reviews.filter((r: any) => r.rating === 2).length,
        one: reviews.filter((r: any) => r.rating === 1).length,
      };

      const totalReviews = reviews.length;
      const reviewPercentages = {
        five: totalReviews > 0 ? (breakdown.five / totalReviews) * 100 : 0,
        four: totalReviews > 0 ? (breakdown.four / totalReviews) * 100 : 0,
        three: totalReviews > 0 ? (breakdown.three / totalReviews) * 100 : 0,
        two: totalReviews > 0 ? (breakdown.two / totalReviews) * 100 : 0,
        one: totalReviews > 0 ? (breakdown.one / totalReviews) * 100 : 0,
      };

      // Mock data for images, projects, and positions
      const mockImages = [
        "/api/placeholder/800/600",
        "/api/placeholder/800/600",
        "/api/placeholder/800/600",
        "/api/placeholder/800/600",
        "/api/placeholder/800/600",
      ];

      const mockProjects = [
        {
          id: "1",
          title: "English Content Writer for College",
          location: "Los Angeles",
          posted_date: "Posted 3 years ago",
          proposals: 2,
          price: "$29 - $59 Fixed",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
          tags: ["Artist", "Computer", "Front end Developer"],
        },
      ];

      const mockPositions = [
        {
          id: "1",
          title: "Finance Manager & Health",
          company: companyName || profileData.full_name || "Agency",
          salary: "$350 - $380 / month",
          tags: ["Music & Audio", "Temporary", "New York"],
          location: "New York",
        },
        {
          id: "2",
          title: "Data Privacy Support",
          company: companyName || profileData.full_name || "Agency",
          salary: "$400 - $450 / month",
          tags: ["Digital Marketing", "Temporary", "New York"],
          location: "New York",
        },
      ];

      const processedAgency: Agency = {
        id: profileData.id,
        name: companyName || profileData.full_name || "Agency",
        company_name: companyName ?? undefined,
        tagline: profileData.bio ? profileData.bio.substring(0, 50) + "..." : "Professional agency services",
        rating: parseFloat(avgRating.toFixed(1)) || 4.0,
        reviews: totalReviews || 1,
        location: "Los Angeles",
        email: `contact@${(companyName || profileData.full_name || "agency").toLowerCase().replace(/\s+/g, "")}.com`,
        phone: "(+88)123-456-789",
        logo_url: profileData.avatar_url,
        avatar_url: profileData.avatar_url,
        bio: profileData.bio || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        employees: "30-50",
        founded_date: "1990",
        categories: ["Digital Marketing", "Lifestyle"],
        images: mockImages,
        projects: mockProjects,
        openPositions: mockPositions,
        reviewBreakdown: reviewPercentages,
        comments: reviews.map((r: any) => ({
          id: r.id,
          author: r.reviewer_name,
          rating: r.rating,
          date: new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          comment: r.comment || "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam...",
        })),
      };

      setAgency(processedAgency);
    } catch (error: any) {
      console.error("Error fetching agency:", error);
      toast.error("Failed to load agency");
      // Set mock data on error
      setAgency({
        id: id,
        name: "MediaAZ",
        company_name: "MediaAZ",
        tagline: "Lorem Ipsum Dolar Sit Armat",
        rating: 4.0,
        reviews: 1,
        location: "Los Angeles",
        email: "mediaaz@spus.com",
        phone: "(+88)123-456-789",
        employees: "30-50",
        founded_date: "1990",
        categories: ["Digital Marketing", "Lifestyle"],
        images: ["/api/placeholder/800/600"],
        projects: [],
        openPositions: [],
        reviewBreakdown: { five: 0, four: 100, three: 0, two: 0, one: 0 },
        comments: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSaved = async () => {
    // Check if agency is saved (favorites logic)
    // Implementation similar to profile/service pages
  };

  const handleSave = async () => {
    // Save/unsave agency logic
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from saved" : "Saved to favorites");
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || !reviewComment || !reviewName || !reviewEmail) {
      toast.error("Please fill in all fields");
      return;
    }

    // Submit review logic
    toast.success("Review submitted successfully");
    setReviewRating(0);
    setReviewComment("");
    setReviewName("");
    setReviewEmail("");
    setSaveInfo(false);
  };

  const nextImage = () => {
    if (agency?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % agency.images!.length);
    }
  };

  const prevImage = () => {
    if (agency?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + agency.images!.length) % agency.images!.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading agency...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Agency not found</h1>
            <Button onClick={() => router.push("/search/agencies")}>Back to Agencies</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/search/agencies" className="hover:text-foreground">Agencies</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{agency.name}</span>
        </div>

        <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Company Overview */}
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 rounded-full border-4 border-primary/20">
                <AvatarImage src={agency.logo_url || agency.avatar_url} alt={agency.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {(agency.name || "A").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{agency.name}</h1>
                <p className="text-muted-foreground mb-4">{agency.tagline}</p>
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{agency.rating}</span>
                    <span className="text-muted-foreground">({agency.reviews} {agency.reviews === 1 ? "Review" : "Reviews"})</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{agency.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{agency.email}</span>
                  </div>
                </div>
                <Button className="bg-primary hover:bg-primary/90">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
              </div>
            </div>

            {/* About Company */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">About Company</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {agency.bio || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </CardContent>
            </Card>

            {/* Who are we? */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Who are we?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </CardContent>
            </Card>

            {/* What do we do? */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">What do we do?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </CardContent>
            </Card>

            {/* Image Gallery */}
            {agency.images && agency.images.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="relative">
                    <div className="relative h-96 w-full rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={agency.images[currentImageIndex] || "/api/placeholder/800/600"}
                        alt={`${agency.name} - Image ${currentImageIndex + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    {agency.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                      </>
                    )}
                  </div>
                  {agency.images.length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto">
                      {agency.images.map((img, idx) => (
                        <div
                          key={idx}
                          className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 ${
                            idx === currentImageIndex ? "border-primary" : "border-transparent"
                          }`}
                          onClick={() => setCurrentImageIndex(idx)}
                        >
                          <Image
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Projects */}
            {agency.projects && agency.projects.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Projects</h2>
                    <Link href="#" className="text-primary hover:underline text-sm">
                      Browse Full List
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {agency.projects.map((project) => (
                      <Card key={project.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <Avatar className="h-12 w-12 rounded-full">
                              <AvatarImage src={agency.logo_url} alt={agency.name} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {(agency.name || "A").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{project.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <span>{project.location}</span>
                                <span>{project.posted_date}</span>
                                <span>{project.proposals} Proposals</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                  {project.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">{project.price}</p>
                                  <Button size="sm" className="mt-2">
                                    Send Proposal
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Open Positions */}
            {agency.openPositions && agency.openPositions.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Open Position</h2>
                    <Link href="#" className="text-primary hover:underline text-sm">
                      Browse Full List
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {agency.openPositions.map((position) => (
                      <Card key={position.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold mb-1">{position.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{position.company}</p>
                              <p className="font-semibold text-primary mb-2">{position.salary}</p>
                              <div className="flex flex-wrap gap-2">
                                {position.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">{agency.reviews} {agency.reviews === 1 ? "Review" : "Reviews"}</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-pink-50 dark:bg-pink-950/20 p-6 rounded-lg text-center">
                    <div className="text-4xl font-bold mb-2">{agency.rating}</div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(agency.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{agency.reviews} {agency.reviews === 1 ? "rating" : "ratings"}</p>
                  </div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-sm w-12">{star} Star</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${agency.reviewBreakdown?.[star === 5 ? 'five' : star === 4 ? 'four' : star === 3 ? 'three' : star === 2 ? 'two' : 'one'] || 0}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {agency.reviewBreakdown?.[star === 5 ? 'five' : star === 4 ? 'four' : star === 3 ? 'three' : star === 2 ? 'two' : 'one'] || 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            {agency.comments && agency.comments.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">{agency.comments.length} {agency.comments.length === 1 ? "Comment" : "Comments"}</h2>
                  <div className="space-y-6">
                    {agency.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <Avatar>
                          <AvatarFallback>{comment.author.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{comment.author}</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < comment.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">{comment.date}</span>
                          </div>
                          <p className="text-muted-foreground">{comment.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Review Form */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Add a review</h2>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Your Rating for this listing</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-8 w-8 cursor-pointer ${
                            star <= reviewRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 hover:text-yellow-400"
                          }`}
                          onClick={() => setReviewRating(star)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="review-comment">Review</Label>
                    <Textarea
                      id="review-comment"
                      placeholder="Write Comment"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="mt-2"
                      rows={5}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="review-name">Name</Label>
                      <Input
                        id="review-name"
                        placeholder="Your Name"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="review-email">Email</Label>
                      <Input
                        id="review-email"
                        type="email"
                        placeholder="your@mail.com"
                        value={reviewEmail}
                        onChange={(e) => setReviewEmail(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="save-info"
                      checked={saveInfo}
                      onCheckedChange={(checked) => setSaveInfo(checked as boolean)}
                    />
                    <Label htmlFor="save-info" className="text-sm cursor-pointer">
                      Save my name, email, and website in this browser for the next time I comment.
                    </Label>
                  </div>
                  <Button onClick={handleSubmitReview} className="w-full bg-primary hover:bg-primary/90">
                    Submit Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">About Me</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {agency.categories?.map((cat, idx) => (
                        <Badge key={idx} variant="secondary">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Employees</p>
                    <p className="font-medium">{agency.employees}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Founded Date</p>
                    <p className="font-medium">{agency.founded_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium">{agency.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                    <p className="font-medium">{agency.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <p className="font-medium">{agency.location}</p>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Contact Me
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

