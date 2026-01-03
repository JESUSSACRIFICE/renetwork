import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RE Referral Platform - Real Estate Referral Network",
  description: "Connect, refer, and collaborate with real estate professionals through our referral platform.",
};

export default function ReferralLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

