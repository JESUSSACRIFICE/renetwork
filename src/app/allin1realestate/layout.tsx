import React from "react";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";

export default function AllIn1RealEstateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}


