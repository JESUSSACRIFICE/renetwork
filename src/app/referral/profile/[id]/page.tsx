"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import ReferralHeader from "@/components/referral/ReferralHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  MapPin,
  CheckCircle,
  MessageSquare,
  Award,
  Briefcase,
  Clock,
  DollarSign,
} from "lucide-react";
import { useProfile } from "@/hooks/use-professional-profiles";

export default function ProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  const { data: profileData, isLoading } = useProfile(profileId);

  const profile = profileData
    ? {
        id: profileId,
        name: profileData.full_name,
        avatar: profileData.full_name?.slice(0, 2).toUpperCase() || "??",
        title: profileData.company_name || "Real Estate Professional",
        rating: profileData.reviews?.length
          ? profileData.reviews.reduce((s: number, r: any) => s + r.rating, 0) / profileData.reviews.length
          : 0,
        reviews: profileData.reviews?.length || 0,
        location: profileData.service_areas?.[0]?.zip_code || "Location not specified",
        verified: true,
        joinedDate: "2020",
        about: profileData.bio || "No bio available.",
        services: profileData.psp_labels || [],
        skills: profileData.skills || [],
        stats: {
          completedProjects: 234,
          totalEarnings: "$2.5M",
          responseRate: "98%",
          avgResponseTime: "2 hours",
        },
        recentReviews: (profileData.reviews || []).slice(0, 5).map((r: any) => ({
          name: r.reviewer?.full_name || "Anonymous",
          rating: r.rating,
          comment: r.comment || "",
          date: r.created_at ? new Date(r.created_at).toLocaleDateString() : "",
        })),
      }
    : {
        id: profileId,
        name: "Loading...",
        avatar: "??",
        title: "",
        rating: 0,
        reviews: 0,
        location: "",
        verified: false,
        joinedDate: "",
        about: "",
        services: [],
        skills: [],
        stats: { completedProjects: 0, totalEarnings: "$0", responseRate: "0%", avgResponseTime: "" },
        recentReviews: [],
      };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full">
      <ReferralHeader />
      <main className="flex-1">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">
                  {profile.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {profile.name}
                      </h1>
                      {profile.verified && (
                        <CheckCircle className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                    <p className="text-lg text-gray-600 mb-2">
                      {profile.title}
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{profile.rating}</span>
                        <span className="text-gray-500">
                          ({profile.reviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-5 w-5" />
                        <span>{profile.location}</span>
                      </div>
                      <span className="text-gray-500">
                        Member since {profile.joinedDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/referral/message/${profileId}`}>
                      <Button>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
                        {profile.about}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Skills & Expertise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="services" className="space-y-4">
                  {profile.services.map((service, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{service}</h3>
                            <p className="text-gray-600 text-sm">
                              Starting at $150/hour
                            </p>
                          </div>
                          <Link href={`/referral/service/${index + 1}`}>
                            <Button variant="outline">View Service</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                  {profile.recentReviews.map((review, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{review.name}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-gray-200 text-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {review.date}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <span className="text-gray-600">Projects</span>
                    </div>
                    <span className="font-semibold">
                      {profile.stats.completedProjects}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-gray-600">Earnings</span>
                    </div>
                    <span className="font-semibold">
                      {profile.stats.totalEarnings}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-600" />
                      <span className="text-gray-600">Response Rate</span>
                    </div>
                    <span className="font-semibold">
                      {profile.stats.responseRate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-600">Avg Response</span>
                    </div>
                    <span className="font-semibold">
                      {profile.stats.avgResponseTime}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/referral/message/${profileId}`}>
                    <Button className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </Link>
                  <Link
                    href={`/referral/results?category=${encodeURIComponent(profile.title)}`}
                  >
                    <Button variant="outline" className="w-full">
                      View Services
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <ReferralFooter />
    </div>
  );
}
