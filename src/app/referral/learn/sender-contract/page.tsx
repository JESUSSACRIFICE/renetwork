"use client";

import ReferralHeader from "@/components/referral/ReferralHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SenderContractPage() {
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
              Sender Contract
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Terms for referral senders (investors, agents, or anyone who refers
              clients to professionals on the platform).
            </p>

            <Card>
              <CardHeader>
                <CardTitle>Referral Sender Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Eligibility</h2>
                  <p className="text-gray-700">
                    You must be a registered user in good standing to submit
                    referrals. Referrals must be submitted through the platform
                    for commission tracking.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">2. Commission Structure</h2>
                  <p className="text-gray-700">
                    Commission rates are determined by the recipient&apos;s
                    profile settings and the order terms. You receive payment
                    when the referral converts and the commission is approved by
                    the platform.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">3. Reporting Obligations</h2>
                  <p className="text-gray-700">
                    All referrals must be reported through the platform. You
                    agree not to bypass the platform for direct transactions on
                    referred clients. Referrals must include accurate lead
                    information.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Exclusivity</h2>
                  <p className="text-gray-700">
                    Referrals made through the platform are subject to platform
                    exclusivity and no-recruit terms. You agree not to solicit
                    referred clients or recipients outside the platform for the
                    specified period.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Good Faith</h2>
                  <p className="text-gray-700">
                    You agree to refer qualified leads only and to provide
                    accurate information. Misrepresentation may result in
                    commission forfeiture and account action.
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
