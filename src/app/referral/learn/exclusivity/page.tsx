"use client";

import ReferralHeader from "@/components/referral/ReferralHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExclusivityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ReferralHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Platform Exclusivity</h1>
            <Card>
              <CardHeader>
                <CardTitle>Exclusivity Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Referral Exclusivity</h2>
                  <p className="text-gray-700">
                    Referrals made through the platform are subject to exclusivity terms. 
                    Users agree not to bypass the platform for direct transactions on referred clients.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">No Recruit Policy</h2>
                  <p className="text-gray-700">
                    Users agree not to recruit or solicit platform members for services outside the platform 
                    for a specified period after initial contact.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Non-Compete</h2>
                  <p className="text-gray-700">
                    Certain exclusivity agreements may apply to prevent conflicts of interest 
                    and protect the platform&apos;s referral network.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Compliance</h2>
                  <p className="text-gray-700">
                    Violation of exclusivity terms may result in account suspension or termination. 
                    All users must comply with platform exclusivity policies.
                  </p>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <ReferralFooter />
    </div>
  );
}

