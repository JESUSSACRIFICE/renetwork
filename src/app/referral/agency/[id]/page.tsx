"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import ReferralHeader from "@/components/referral/ReferralHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, CheckCircle, MessageSquare, Building2, Users, Briefcase } from "lucide-react";

export default function AgencyPage() {
  const params = useParams();
  const agencyId = params.id;

  // Mock data
  const agency = {
    id: agencyId,
    name: "Elite Properties Inc",
    logo: "EP",
    rating: 4.6,
    reviews: 342,
    location: "San Francisco, CA",
    verified: true,
    established: "2015",
    about: "Premier real estate agency specializing in luxury properties, commercial real estate, and investment opportunities. With over 50 experienced agents, we provide comprehensive real estate services.",
    services: ["Luxury Residential", "Commercial Real Estate", "Property Management", "Investment Consulting"],
    teamSize: 50,
    completedProjects: 1200,
    activeListings: 89,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ReferralHeader />
      <main className="flex-1">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="h-24 w-24 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-3xl font-bold text-white">
                {agency.logo}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{agency.name}</h1>
                      {agency.verified && (
                        <CheckCircle className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 flex-wrap mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{agency.rating}</span>
                        <span className="text-gray-500">({agency.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-5 w-5" />
                        <span>{agency.location}</span>
                      </div>
                      <span className="text-gray-500">Est. {agency.established}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/referral/message/${agencyId}`}>
                      <Button>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Agency
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
                  <TabsTrigger value="team">Team</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About the Agency</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{agency.about}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Services Offered</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {agency.services.map((service, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                            <span className="text-gray-700">{service}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="services" className="space-y-4">
                  {agency.services.map((service, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{service}</h3>
                            <p className="text-gray-600 text-sm">Comprehensive agency services</p>
                          </div>
                          <Link href={`/referral/results?category=${encodeURIComponent(service)}`}>
                            <Button variant="outline">View Details</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="team">
                  <Card>
                    <CardHeader>
                      <CardTitle>Our Team</CardTitle>
                      <CardDescription>Professional agents and specialists</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">
                        Our agency employs {agency.teamSize} experienced professionals dedicated to providing 
                        exceptional real estate services. Each team member is verified and brings expertise 
                        in their respective areas.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Agency Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="text-gray-600">Team Size</span>
                    </div>
                    <span className="font-semibold">{agency.teamSize} agents</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-green-600" />
                      <span className="text-gray-600">Completed</span>
                    </div>
                    <span className="font-semibold">{agency.completedProjects}+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-600">Active Listings</span>
                    </div>
                    <span className="font-semibold">{agency.activeListings}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Agency</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/referral/message/${agencyId}`}>
                    <Button className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </Link>
                  <Link href={`/referral/results?type=agency&category=${encodeURIComponent(agency.name)}`}>
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

