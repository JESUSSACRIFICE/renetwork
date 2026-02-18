"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, Clock, BarChart3, Share2, Heart, ChevronLeft, ChevronRight, Plus, Minus, MessageSquare } from "lucide-react";
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
import { useService } from "@/hooks/use-services";
import type { ServiceDetailData } from "@/hooks/use-services";

interface Service extends ServiceDetailData {}

export default function ServiceDetail() {
  const params = useParams();
  const id = (params?.id as string) ?? null;
  const { data: serviceFromHook, isLoading: queryLoading, isSuccess } = useService(id);
  const [fallbackService, setFallbackService] = useState<Service | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (!id || !isSuccess || serviceFromHook != null) return;
    let cancelled = false;
    setFallbackLoading(true);
    (async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();
        if (profileError || !profileData || cancelled) return;
        let companyName: string | null = null;
        const { data: bizRow } = await supabase
          .from("business_info")
          .select("company_name")
          .eq("user_id", id)
          .maybeSingle();
        if (bizRow) companyName = bizRow.company_name;
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("id, rating, comment, created_at, reviewer_id")
          .eq("profile_id", id)
          .order("created_at", { ascending: false });
        const reviewerIds = (reviewsData ?? []).map((r: any) => r.reviewer_id).filter(Boolean);
        let reviewerNames: Record<string, string> = {};
        if (reviewerIds.length > 0) {
          const { data: reviewersData } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", reviewerIds);
          (reviewersData ?? []).forEach((r: any) => { reviewerNames[r.id] = r.full_name; });
        }
        const reviews = (reviewsData ?? []).map((r: any) => ({
          ...r,
          reviewer_name: reviewerNames[r.reviewer_id] || "Anonymous",
        }));
        const avgRating = reviews.length > 0
          ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
          : 0;
        const { data: serviceAreasData } = await supabase
          .from("service_areas")
          .select("zip_code, radius_miles")
          .eq("user_id", id);
        if (cancelled) return;
        const processed: Service = {
          id: profileData.id,
          title: `${companyName || profileData.full_name} – Service`,
          category: "General",
          description: profileData.bio || "Professional service offering.",
          rating: parseFloat(avgRating.toFixed(1)) || 3.0,
          reviews: reviews.length,
          price: profileData.hourly_rate || 79,
          provider_id: profileData.id,
          provider_name: profileData.full_name,
          provider_avatar: profileData.avatar_url,
          provider_title: companyName || "Professional",
          location: serviceAreasData?.[0]?.zip_code ? `${serviceAreasData[0].zip_code}` : "Los Angeles",
          delivery_time: "2 Days",
          english_level: "Native Or Bilingual",
          images: [],
          features: ["Professional service", "Quality assured"],
          app_types: [],
          design_tools: [],
          devices: [],
          packages: [
            { title: "Standard", price: profileData.hourly_rate || 79, delivery_days: 5 },
            { title: "Express", price: (profileData.hourly_rate || 79) * 1.2, delivery_days: 3 },
          ],
          faqs: [
            { question: "What methods of payments are supported?", answer: "Standard payment methods.", isOpen: true },
            { question: "Can I cancel at anytime?", answer: "Yes.", isOpen: false },
          ],
          relatedServices: [],
        };
        setFallbackService(processed);
      } catch (e) {
        if (!cancelled) toast.error("Failed to load service");
      } finally {
        if (!cancelled) setFallbackLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, isSuccess, serviceFromHook]);

  const service = serviceFromHook ?? fallbackService;
  const loading = queryLoading || (isSuccess && serviceFromHook == null && fallbackLoading);

  useEffect(() => {
    if (id) checkSaved();
  }, [id]);

  const checkSaved = async () => {
    // Check if service is saved/favorited
    // Implementation would check favorites table
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit review logic
    toast.success("Review submitted successfully!");
    setReviewRating(0);
    setReviewComment("");
    setReviewName("");
    setReviewEmail("");
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

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Service Not Found</h1>
            <Link href="/search/services">
              <Button>Browse Services</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    // Mock data - in real app, calculate from reviews
    const count = star === 3 ? 1 : 0;
    const percentage = star === 3 ? 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          {/* Breadcrumbs */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Home</Link>
              {" / "}
              <Link href="/search/services" className="hover:text-foreground">Services</Link>
              {" / "}
              <span className="text-foreground">{service.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Service Title and Seller Info */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4">{service.title}</h1>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={service.provider_avatar} alt={service.provider_name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {service.provider_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{service.provider_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span>{service.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({service.reviews} Review{service.reviews !== 1 ? 's' : ''})</span>
              </div>
              <span className="text-muted-foreground">140 Views</span>
            </div>
          </div>

          {/* Key Details */}
          <div className="flex items-center gap-6 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Delivery Time: {service.delivery_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">English level: {service.english_level}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Location: {service.location}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
            {/* Main Content */}
            <div className="space-y-8">
              {/* Image Carousel */}
              <Card>
                <CardContent className="p-0">
                  <div className="relative w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg overflow-hidden">
                    {service.images?.[currentImageIndex] ? (
                      <Image
                        src={service.images[currentImageIndex]}
                        alt={service.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/40">
                        <div className="text-8xl">📦</div>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                      onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : (service.images?.length || 1) - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                      onClick={() => setCurrentImageIndex((prev) => (prev < (service.images?.length || 1) - 1 ? prev + 1 : 0))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  {/* Thumbnails */}
                  <div className="grid grid-cols-4 gap-2 p-4">
                    {(service.images || []).map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative h-20 rounded-lg overflow-hidden cursor-pointer border-2 ${
                          currentImageIndex === idx ? "border-primary" : "border-transparent"
                        }`}
                        onClick={() => setCurrentImageIndex(idx)}
                      >
                        {img ? (
                          <Image src={img} alt={`${service.title} ${idx + 1}`} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Description</h2>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {service.features?.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Technical Specifications */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Technical Specifications</h2>
                  <div className="space-y-4">
                    {service.app_types && service.app_types.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">App Type:</h3>
                        <div className="flex flex-wrap gap-2">
                          {service.app_types.map((type, idx) => (
                            <Badge key={idx} variant="secondary">{type}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {service.design_tools && service.design_tools.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Design tool:</h3>
                        <div className="flex flex-wrap gap-2">
                          {service.design_tools.map((tool, idx) => (
                            <Badge key={idx} variant="secondary">{tool}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {service.devices && service.devices.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Device:</h3>
                        <div className="flex flex-wrap gap-2">
                          {service.devices.map((device, idx) => (
                            <Badge key={idx} variant="secondary">{device}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* FAQs */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {service.faqs?.map((faq, idx) => (
                      <div key={idx} className="border-b last:border-0 pb-4 last:pb-0">
                        <button
                          className="w-full flex items-center justify-between text-left"
                          onClick={() => toggleFaq(idx)}
                        >
                          <h3 className="font-semibold">{faq.question}</h3>
                          {openFaqIndex === idx ? (
                            <Minus className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </button>
                        {openFaqIndex === idx && (
                          <p className="text-muted-foreground mt-2">{faq.answer}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">{service.reviews} Review{service.reviews !== 1 ? 's' : ''}</h2>
                  
                  {/* Rating Overview */}
                  <div className="bg-primary/5 rounded-lg p-6 mb-6">
                    <div className="text-4xl font-bold text-warning mb-2">{service.rating.toFixed(1)}</div>
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(service.rating)
                              ? "fill-warning text-warning"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">{service.reviews} Rating{service.reviews !== 1 ? 's' : ''}</div>
                  </div>

                  {/* Rating Breakdown */}
                  <div className="space-y-2 mb-6">
                    {ratingBreakdown.map(({ star, percentage }) => (
                      <div key={star} className="flex items-center gap-4">
                        <div className="flex items-center gap-1 w-20">
                          <span className="text-sm">{star} Star</span>
                        </div>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-warning"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">{percentage}%</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  {/* Add Review Form */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Add a review</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <Label>Rating</Label>
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
                                    ? "fill-warning text-warning"
                                    : "text-muted-foreground"
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
                        <Label htmlFor="save-info" className="text-sm font-normal">
                          Save my name, email, and website in this browser for the next time I comment.
                        </Label>
                      </div>
                      <Button type="submit" className="bg-primary hover:bg-primary/90">
                        Submit Review
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold mb-4">${service.price}</div>
                  
                  {/* Packages */}
                  {service.packages && service.packages.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {service.packages.map((pkg, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Checkbox id={`package-${idx}`} />
                          <div className="flex-1">
                            <Label htmlFor={`package-${idx}`} className="font-normal cursor-pointer">
                              <div className="font-medium">{pkg.title}</div>
                              <div className="text-sm text-muted-foreground">${pkg.price}</div>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button className="w-full bg-primary hover:bg-primary/90 mb-4">
                    Buy Now ${service.price}
                  </Button>
                </CardContent>
              </Card>

              {/* About The Seller */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">About The Seller</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={service.provider_avatar} alt={service.provider_name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {service.provider_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{service.provider_name}</div>
                      <div className="text-sm text-muted-foreground">{service.provider_title}</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span>{service.rating.toFixed(1)} ({service.reviews} Review{service.reviews !== 1 ? 's' : ''})</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{service.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>Rate: ${service.price - 5} - ${service.price + 5} / Hr</span>
                    </div>
                  </div>
                  <Link href="/dashboard/messages">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Contact Me
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

