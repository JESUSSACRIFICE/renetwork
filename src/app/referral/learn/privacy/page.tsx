"use client";

import ReferralHeader from "@/components/referral/ReferralHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ReferralHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            <Card>
              <CardHeader>
                <CardTitle>Last Updated: {new Date().toLocaleDateString()}</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                  <p className="text-gray-700">
                    We collect information you provide directly, including account information, profile data, 
                    and transaction details. We also collect usage data and cookies.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                  <p className="text-gray-700">
                    We use collected information to provide services, process transactions, communicate with users, 
                    and improve our platform.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
                  <p className="text-gray-700">
                    We do not sell personal information. We may share information with service providers, 
                    legal authorities when required, or with your consent.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                  <p className="text-gray-700">
                    We implement industry-standard security measures to protect your information. 
                    However, no system is completely secure.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                  <p className="text-gray-700">
                    You have the right to access, update, or delete your personal information. 
                    Contact us to exercise these rights.
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

