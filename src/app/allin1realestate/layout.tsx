import React from "react";
import NewHeader from "@/components/NewHeader";
import Footer from "@/components/Footer";

export default function AllIn1RealEstateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <NewHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}


