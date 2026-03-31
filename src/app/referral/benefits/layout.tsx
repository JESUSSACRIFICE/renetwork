import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Benefits — RE Referral",
  description:
    "Rewards and advantages for customers, referral senders, and receivers on the RE Network referral platform.",
};

export default function ReferralBenefitsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
