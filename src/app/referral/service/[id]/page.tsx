"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import ReferralHeader from "@/components/referral/ReferralHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MapPin, Clock, CheckCircle, Share2, Heart, MessageSquare, Calendar } from "lucide-react";

export default function ServicePage() {
  const params = useParams();
  const serviceId = params.id;

  // Mock data - replace with actual data fetching
  const service = {
    id: serviceId,
    title: "Professional Real Estate Consultation Services",
    description: "Comprehensive real estate services including property evaluation, market analysis, investment consulting, and transaction management. Specializing in residential and commercial properties.",
    provider: {
      name: "John Smith",
      avatar: "JS",
      rating: 4.8,
      reviews: 127,
      location: "Los Angeles, CA",
      verified: true,
    },
    pricing: {
      base: 150,
      unit: "hour",
      referralFee: "15%",
    },
    features: [
      "Property evaluation and assessment",
      "Market analysis and trends",
      "Investment consulting",
      "Transaction management",
      "Legal document review",
      "Negotiation support",
    ],
    deliveryTime: "3-5 business days",
    category: "Real Estate Agent",
    tags: ["Residential", "Commercial", "Investment", "Consultation"],
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ReferralHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.title}</h1>
                    <div className="flex items-center gap-4 flex-wrap">
                      <Link href={`/referral/profile/${service.provider.name.toLowerCase().replace(' ', '-')}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{service.provider.avatar}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{service.provider.name}</span>
                        {service.provider.verified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </Link>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{service.provider.rating}</span>
                        <span className="text-gray-500">({service.provider.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{service.provider.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Image/Visual */}
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center mb-6">
                  <div className="text-8xl">🛠️</div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">About This Service</h2>
                    <p className="text-gray-700 leading-relaxed">{service.description}</p>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">What&apos;s Included</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {service.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">Reviewer {review}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">2 weeks ago</span>
                      </div>
                      <p className="text-gray-700">Great service! Professional and knowledgeable. Highly recommend.</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-1">${service.pricing.base}</div>
                  <div className="text-gray-600">per {service.pricing.unit}</div>
                  {service.pricing.referralFee && (
                    <div className="text-sm text-gray-500 mt-2">
                      Referral Fee: {service.pricing.referralFee}
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Delivery: {service.deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Escrow Protection</span>
                  </div>
                </div>

                <Link href={`/referral/order/${serviceId}`}>
                  <Button className="w-full mb-3" size="lg">
                    Order Now
                  </Button>
                </Link>
                <Link href={`/referral/message/${service.provider.name.toLowerCase().replace(' ', '-')}`}>
                  <Button variant="outline" className="w-full" size="lg">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Provider
                  </Button>
                </Link>
              </div>

              {/* Provider Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Provider</h3>
                <Link href={`/referral/profile/${service.provider.name.toLowerCase().replace(' ', '-')}`} className="flex items-center gap-3 mb-4 hover:text-primary transition-colors">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{service.provider.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{service.provider.name}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{service.provider.rating}</span>
                      <span className="text-gray-500">({service.provider.reviews})</span>
                    </div>
                  </div>
                </Link>
                <Link href={`/referral/profile/${service.provider.name.toLowerCase().replace(' ', '-')}`}>
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ReferralFooter />
    </div>
  );
}

