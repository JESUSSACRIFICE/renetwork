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

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1">
        <NewHero />
        <Hero />
        <Categories />
        <TalentedFreelancers />
        <TopRatedFreelancers />
        <TrendingServices />
        <Sponsors />
        <HotTopics />
        <HowItWorks />
        <Features />
        <StatsAndAwards />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

