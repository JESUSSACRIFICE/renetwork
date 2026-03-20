"use client";

import ReferralHeader from "@/components/referral/ReferralHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function RecipientContractPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ReferralHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/referral/learn/collaboration"
              className="text-sm text-primary hover:underline mb-6 inline-block"
            >
              ← Back to Collaboration Agreement
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Recipient Contract
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Terms for referral recipients (PSPs who receive referrals and
              provide services to referred clients).
            </p>

            <Card>
              <CardHeader>
                <CardTitle>Referral Recipient Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Profile Approval</h2>
                  <p className="text-gray-700">
                    Your profile must be approved by the platform before you
                    appear in search and can receive referrals. You agree to
                    maintain valid licenses and certifications.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">2. Referral Fee Obligations</h2>
                  <p className="text-gray-700">
                    You agree to pay the referral fee percentage specified in
                    your profile when a referred lead converts. Fees are
                    typically paid to the platform or directly to the sender as
                    configured.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">3. Service Delivery</h2>
                  <p className="text-gray-700">
                    You agree to provide timely, professional service to referred
                    clients. You will respond to referral requests promptly and
                    in good faith.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Training Commitments</h2>
                  <p className="text-gray-700">
                    If you indicate you are willing to train referrals, you agree
                    to the terms specified (e.g., recorded, live call, demographic
                    scope). Training terms are recorded and contract-documented.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Exclusivity</h2>
                  <p className="text-gray-700">
                    You agree not to bypass the platform for direct transactions
                    on referred clients. You will not recruit or solicit platform
                    members for services outside the platform for the specified
                    period.
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
