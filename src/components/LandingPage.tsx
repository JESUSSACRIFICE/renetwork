import Link from "next/link";
// import AppHeader from "@/components/AppHeader";
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
import HighestRatedFreelancers from "./freeio/HighestRatedFreelancers";
import BrowseTalentCategory from "./freeio/BrowseTalentCategory";
import AwardsSection from "@/components/AwardsSection";
import EngagementCards from "@/components/EngagementCards";
import CrowdfundingSection from "@/components/CrowdfundingSection";
import NetworkingSection from "@/components/NetworkingSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* <AppHeader /> */}
      <AppHeader />
      <main className="flex-1">
        <NewHero />

        {/* Entry to ALLIN1REALESTATE concept pages */}
        {/* <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
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
        </section> */}
        {/* <He/ro /> */}
        <section
          className="border-t border-border/70 bg-blue-900"
          aria-label="Outreach — discover professionals and fields"
        >
          <div className="container pt-14 pb-6 md:pt-16 md:pb-8">
            <h2 className="text-3xl font-bold tracking-tight text-white underline md:text-4xl">
              <span className="mr-2" aria-hidden>
                🤝
              </span>
              Outreach
            </h2>
            <p className="mt-2 max-w-3xl text-lg text-white">
              One flow in three beats: who you need&nbsp;
              <span className="font-semibold text-white">1A</span>, which fields
              fit your deal&nbsp;
              <span className="font-semibold text-white">1B</span>, and rated
              PSPs to shortlist&nbsp;
              <span className="font-semibold text-white">1C</span>.
            </p>
          </div>
          <div className="container pb-16 md:pb-20">
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/45 shadow-sm ring-1 ring-border/30">
              <BrowseTalentCategory />
              <EngagementCards />
              <Categories />
              <HighestRatedFreelancers />
              <AwardsSection />
            </div>
          </div>
        </section>

        <CrowdfundingSection />

        <NetworkingSection />

        {/* <TalentedFreelancers /> */}
        {/* <TopRatedFreelancers /> */}
        {/* <TrendingServices /> */}
        {/* <Sponsors /> */}
        {/* <HotTopics /> */}
        {/* <HowItWorks /> */}
        <Features />
        <StatsAndAwards />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
