"use client";

import ReferralHeader from "@/components/referral/ReferralHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import { ReferralVerticalMenu } from "@/components/referral/ReferralVerticalMenu";
import AdSpace from "@/components/referral/AdSpace";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Users, Handshake, Shield, Target, BookOpen, MapPin, Gift } from "lucide-react";
import Link from "next/link";
import NewHeader from "@/components/NewHeader";
import { SearchForm } from "@/components/hero/SearchForm";

export default function ReferralLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* <ReferralHeader /> */}
      <NewHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#DEB887] py-12 sm:py-16 lg:py-8 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Ad Space - Desktop Only */}
              <div className="hidden lg:flex flex-col space-y-4 w-[180px] shrink-0">
                <AdSpace />
                <AdSpace />
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col lg:flex-row gap-6">
                {/* Vertical Menu */}
                <div>
                  {/* <ReferralVerticalMenu /> */}
                  <SearchForm />
                </div>

                {/* Hero Content */}
                <div className="flex-1 text-white space-y-10 lg:pl-8">
                  <div className="space-y-10">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                      Real Estate Referral Platform
                    </h1>
                    <p className="text-lg sm:text-xl text-white/90 max-w-2xl">
                      Connect, refer, and collaborate with verified real estate professionals. 
                      Secure payments, referral splitting, and comprehensive support.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link href="/referral/register">
                      <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/referral/about">
                      <Button size="lg" variant="outline" className="border-white text-black bg-white hover:text-white hover:bg-white/10">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Ad Space - Desktop Only */}
              <div className="hidden lg:flex flex-col space-y-4 w-[180px] shrink-0">
                <AdSpace />
                <AdSpace />
              </div>
            </div>
          </div>
        </section>

        {/* Body Sections */}
        <section className="w-full bg-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Introduction */}
            <div className="mb-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Welcome to the Referral Platform
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our platform connects real estate professionals, customers, and agencies through a trusted referral network. 
                Whether you&apos;re looking for services, referring clients, or building your business, we provide the tools and support you need.
              </p>
            </div>

            {/* How It Works */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 rounded-lg bg-gray-50">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">1. Connect</h3>
                  <p className="text-gray-600">Join our network of verified professionals and customers</p>
                </div>
                <div className="text-center p-6 rounded-lg bg-gray-50">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Handshake className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">2. Refer</h3>
                  <p className="text-gray-600">Make referrals and collaborate with trusted partners</p>
                </div>
                <div className="text-center p-6 rounded-lg bg-gray-50">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">3. Secure</h3>
                  <p className="text-gray-600">Protected payments and escrow for peace of mind</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <Target className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Referral Splitting</h3>
                  <p className="text-gray-600 text-sm">Fair and transparent referral fee distribution</p>
                </div>
                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <BookOpen className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Teaching & Learning</h3>
                  <p className="text-gray-600 text-sm">Educational resources and collaboration tools</p>
                </div>
                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <MapPin className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">GPS Integration</h3>
                  <p className="text-gray-600 text-sm">Location-based search and matching</p>
                </div>
                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <Gift className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Benefits Program</h3>
                  <p className="text-gray-600 text-sm">Rewards for senders, recipients, and customers</p>
                </div>
              </div>
            </div>

            {/* Refer Section */}
            <div className="mb-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 lg:p-12">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Referring Today</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Join thousands of professionals who trust our platform for referrals, collaboration, and business growth.
                </p>
                <Link href="/referral/register">
                  <Button size="lg" className="bg-primary hover:bg-primary-dark">
                    Register Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Benefits Preview */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits for Everyone</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">For Senders</h3>
                  <p className="text-gray-600 mb-4">Earn rewards and commissions for successful referrals</p>
                  <Link href="/referral/benefits#sender">
                    <Button variant="outline">Learn More</Button>
                  </Link>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <Handshake className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">For Recipients</h3>
                  <p className="text-gray-600 mb-4">Receive quality referrals and grow your business</p>
                  <Link href="/referral/benefits#recipient">
                    <Button variant="outline">Learn More</Button>
                  </Link>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">For Customers</h3>
                  <p className="text-gray-600 mb-4">Access trusted professionals with secure transactions</p>
                  <Link href="/referral/benefits#customer">
                    <Button variant="outline">Learn More</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <ReferralFooter />
    </div>
  );
}

