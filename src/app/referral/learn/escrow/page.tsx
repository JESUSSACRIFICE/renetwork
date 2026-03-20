"use client";

import ReferralHeader from "@/components/referral/ReferralHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, CheckCircle, Clock } from "lucide-react";

export default function EscrowPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ReferralHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Escrow — When You Get Paid
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your funds are protected. We hold payments securely until work is
              completed to your satisfaction.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>We Have Your Back</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Before payment, you agree to Terms of Service and Legal
                    Disclosures. Prior to payment, ensure all details are
                    correct. Your payment is processed securely.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Lock className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Secure Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    All payments are processed through secure systems. Fees are
                    clearly disclosed before transactions. Your funds are
                    protected until the service is delivered.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-6 w-6" />
                  How Escrow Works
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                      1
                    </span>
                    Order & Payment
                  </h2>
                  <p className="text-gray-700">
                    When you place an order or accept an offer, you pay through
                    the platform. Your payment is held securely—not released to
                    the provider until the work is complete.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                      2
                    </span>
                    Work in Progress
                  </h2>
                  <p className="text-gray-700">
                    The professional completes the service. You can communicate
                    via the platform and track progress. Funds remain in escrow
                    during this time.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                      3
                    </span>
                    Review & Release
                  </h2>
                  <p className="text-gray-700">
                    When work is completed to your satisfaction, you confirm. The
                    platform releases payment to the provider. If there are
                    issues, you can raise a dispute before release.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    Disputes
                  </h2>
                  <p className="text-gray-700">
                    If the work does not meet expectations, raise a dispute before
                    confirming completion. Admin will review and help resolve.
                    See{" "}
                    <a
                      href="/referral/learn/legal"
                      className="text-primary hover:underline"
                    >
                      Legal Disclosures
                    </a>{" "}
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
