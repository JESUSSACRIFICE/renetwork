import Link from "next/link";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import TalentedFreelancers from "@/components/TalentedFreelancers";
import TopRatedFreelancers from "@/components/TopRatedFreelancers";
import StatsAndAwards from "@/components/StatsAndAwards";
import TrendingServices from "@/components/TrendingServices";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Sponsors from "@/components/Sponsors";
import HotTopics from "@/components/HotTopics";
import Footer from "@/components/Footer";
import NewHero from "@/components/NewHero";
import AppHeader from "@/components/AppHeader";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* <Header /> */}
      <AppHeader />
      <main className="flex-1">
        <NewHero />

        {/* Entry to ALLIN1REALESTATE concept pages */}
        <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200/40 bg-slate-50/80 p-4 sm:p-6 lg:p-8 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  ALLIN1REALESTATE
                </p>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Explore the new faith-based real estate ecosystem prototype
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                  Visit a separate set of pages for Referrals, Crowdfunding, and Networking,
                  kept independent from your current live experience so you can decide later
                  what to adopt.
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                <Link
                  href="/allin1realestate"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
                >
                  Open ALLIN1REALESTATE
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* <He/ro /> */}
        {/* <Categories /> */}
        {/* <TalentedFreelancers /> */}
        {/* <TopRatedFreelancers /> */}
        {/* <TrendingServices /> */}
        {/* <Sponsors /> */}
        {/* <HotTopics /> */}
        {/* <HowItWorks /> */}
        {/* <Features /> */}
        {/* <StatsAndAwards /> */}
        {/* <Testimonials /> */}
      </main>
      <Footer />
    </div>
  );
}

