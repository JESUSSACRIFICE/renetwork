"use client";

import ReferralHeader from "@/components/referral/ReferralHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdvertisePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ReferralHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Advertise on Our Platform</h1>
              <p className="text-xl text-gray-600">
                Reach thousands of real estate professionals and customers
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Advertising Information</CardTitle>
                <CardDescription>Get your business in front of our audience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Advertising Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Banner Ads</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 mb-4">Display ads on landing pages and results pages</p>
                          <p className="font-semibold text-2xl">Starting at $500/month</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Featured Listings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 mb-4">Get featured placement in search results</p>
                          <p className="font-semibold text-2xl">Starting at $300/month</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                    <p className="text-gray-700 mb-4">
                      Interested in advertising? Contact our advertising team to discuss options and pricing.
                    </p>
                    <a href="/referral/contact">
                      <Button>Contact Advertising Team</Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <ReferralFooter />
    </div>
  );
}

