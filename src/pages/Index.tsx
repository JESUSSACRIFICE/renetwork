import AppHeader from "@/components/AppHeader";
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

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1">
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
};

export default Index;
