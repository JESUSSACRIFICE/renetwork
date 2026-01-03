"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import ReferralHeader from "@/components/referral/ReferralHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, CheckCircle, MessageSquare, Award, Briefcase, Clock, DollarSign } from "lucide-react";

export default function ProfilePage() {
  const params = useParams();
  const profileId = params.id;

  // Mock data - replace with actual data fetching
  const profile = {
    id: profileId,
    name: "John Smith",
    avatar: "JS",
    title: "Real Estate Professional",
    rating: 4.8,
    reviews: 127,
    location: "Los Angeles, CA",
    verified: true,
    joinedDate: "2020",
    about: "Experienced real estate professional with over 10 years in the industry. Specializing in residential and commercial properties with a focus on client satisfaction.",
    services: ["Residential Sales", "Commercial Leasing", "Property Consultation"],
    skills: ["Property Valuation", "Market Analysis", "Negotiation", "Contract Management"],
    stats: {
      completedProjects: 234,
      totalEarnings: "$2.5M",
      responseRate: "98%",
      avgResponseTime: "2 hours",
    },
    recentReviews: [
      { name: "Sarah M.", rating: 5, comment: "Excellent service! Very professional.", date: "2 weeks ago" },
      { name: "Mike D.", rating: 5, comment: "Great experience, highly recommend.", date: "1 month ago" },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ReferralHeader />
      <main className="flex-1">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">{profile.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                      {profile.verified && (
                        <CheckCircle className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                    <p className="text-lg text-gray-600 mb-2">{profile.title}</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{profile.rating}</span>
                        <span className="text-gray-500">({profile.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-5 w-5" />
                        <span>{profile.location}</span>
                      </div>
                      <span className="text-gray-500">Member since {profile.joinedDate}</span>
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
                      <p className="text-gray-700 leading-relaxed">{profile.about}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Skills & Expertise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
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
                            <p className="text-gray-600 text-sm">Starting at $150/hour</p>
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
                          <span className="text-sm text-gray-500">{review.date}</span>
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
                    <span className="font-semibold">{profile.stats.completedProjects}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-gray-600">Earnings</span>
                    </div>
                    <span className="font-semibold">{profile.stats.totalEarnings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-600" />
                      <span className="text-gray-600">Response Rate</span>
                    </div>
                    <span className="font-semibold">{profile.stats.responseRate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-600">Avg Response</span>
                    </div>
                    <span className="font-semibold">{profile.stats.avgResponseTime}</span>
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
                  <Link href={`/referral/results?category=${encodeURIComponent(profile.title)}`}>
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

