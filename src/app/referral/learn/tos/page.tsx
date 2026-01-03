"use client";

import ReferralHeader from "@/components/referral/ReferralHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TOSPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ReferralHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            <Card>
              <CardHeader>
                <CardTitle>Last Updated: {new Date().toLocaleDateString()}</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                  <p className="text-gray-700">
                    By accessing and using the Referral Platform, you accept and agree to be bound by these Terms of Service.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. Platform Usage</h2>
                  <p className="text-gray-700">
                    Users agree to use the platform in accordance with all applicable laws and regulations. 
                    Prohibited activities include fraud, misrepresentation, and violation of intellectual property rights.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
                  <p className="text-gray-700">
                    Users are responsible for maintaining the accuracy of their information, safeguarding their accounts, 
                    and ensuring compliance with all platform policies.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Payment and Fees</h2>
                  <p className="text-gray-700">
                    All payments are processed through secure escrow systems. Fees are clearly disclosed before transactions. 
                    Refund policies apply as specified in individual service agreements.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Dispute Resolution</h2>
                  <p className="text-gray-700">
                    Disputes are resolved through our internal dispute resolution process. Users agree to participate 
                    in good faith in the resolution process.
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

