"use client";

import ReferralHeader from "@/components/referral/ReferralHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LegalPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ReferralHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Legal Disclosures</h1>
            <Card>
              <CardHeader>
                <CardTitle>Important Legal Information</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Transaction Disclosures</h2>
                  <p className="text-gray-700">
                    All transactions on the platform are subject to applicable laws and regulations. 
                    Users are responsible for compliance with local, state, and federal requirements.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Professional Licensing</h2>
                  <p className="text-gray-700">
                    Professional service providers must maintain valid licenses and certifications. 
                    The platform is not responsible for verifying all professional credentials.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
                  <p className="text-gray-700">
                    The platform provides a marketplace for connections. We are not party to transactions 
                    between users and are not liable for outcomes of services provided.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Dispute Resolution</h2>
                  <p className="text-gray-700">
                    Users agree to resolve disputes through our internal processes. Legal action 
                    may be pursued if internal resolution fails.
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

