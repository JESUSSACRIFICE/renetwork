"use client";

import ReferralHeader from "@/components/referral/ReferralHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FileText, UserPlus, UserCheck } from "lucide-react";

export default function CollaborationAgreementPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ReferralHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Collaboration Agreement
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              When you refer or receive referrals on the platform, you enter into
              a collaboration agreement. Review the contracts below to understand
              your rights and obligations.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Link href="/referral/learn/sender-contract">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
                  <CardHeader>
                    <UserPlus className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>Sender Contract</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      For referral senders (investors, agents, or anyone who
                      refers clients). Covers commission structure, exclusivity,
                      and reporting obligations.
                    </p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/referral/learn/recipient-contract">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
                  <CardHeader>
                    <UserCheck className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>Recipient Contract</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      For referral recipients (PSPs who receive referrals).
                      Covers service delivery, referral fee obligations, and
                      training commitments.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Collaboration Agreement Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-3">Referral Splitting</h2>
                  <p className="text-gray-700">
                    All parties agree to the platform&apos;s referral fee
                    structure. Referral fees are typically split between sender,
                    recipient, and platform as specified in your profile settings
                    and the order terms.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">Teaching & Training</h2>
                  <p className="text-gray-700">
                    Recipients who indicate they are willing to train may offer
                    training to referred parties. Training terms (recorded, live
                    call, demographic scope) are documented and contract-bound.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">Expectations</h2>
                  <p className="text-gray-700">
                    Both parties agree to act in good faith, respond promptly to
                    referrals, and comply with platform policies. Referrals
                    submitted through the platform must be tracked and reported
                    via the platform.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">Platform Exclusivity</h2>
                  <p className="text-gray-700">
                    Referrals made through the platform are subject to
                    exclusivity and no-recruit terms. See{" "}
                    <Link
                      href="/referral/learn/exclusivity"
                      className="text-primary hover:underline"
                    >
                      Platform Exclusivity
                    </Link>{" "}
                    for details.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">Escrow</h2>
                  <p className="text-gray-700">
                    Payments are held in escrow until work is completed. See{" "}
                    <Link
                      href="/referral/learn/escrow"
                      className="text-primary hover:underline"
                    >
                      Escrow (When You Get Paid)
                    </Link>{" "}
                    for how funds are protected.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">Disputes</h2>
                  <p className="text-gray-700">
                    Disputes may be raised through the platform. Admin will
                    review and resolve disputes. See{" "}
                    <Link
                      href="/referral/learn/legal"
                      className="text-primary hover:underline"
                    >
                      Legal Disclosures
                    </Link>{" "}
                    for dispute resolution.
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
