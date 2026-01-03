import FreeioHeader from "./FreeioHeader";
import NewHero from "../NewHero";
import FreeioHero from "./FreeioHero";
import TrustedBy from "./TrustedBy";
import BrowseTalentCategory from "./BrowseTalentCategory";
import PopularServices from "./PopularServices";
import TalentedFreelancersSection from "./TalentedFreelancersSection";
import HighestRatedFreelancers from "./HighestRatedFreelancers";
import FindTalentSection from "./FindTalentSection";
import TrendingServices from "./TrendingServices";
import PeopleLoveFreeio from "./PeopleLoveFreeio";
import FreeioFooter from "./FreeioFooter";

export default function FreeioLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <FreeioHeader />
      <main className="flex-1 overflow-x-hidden">
        <NewHero />
        <FreeioHero />
        <TrustedBy />
        <BrowseTalentCategory />
        <PopularServices />
        <TalentedFreelancersSection />
        <HighestRatedFreelancers />
        <FindTalentSection />
        <TrendingServices />
        <PeopleLoveFreeio />
      </main>
      <FreeioFooter />
    </div>
  );
}

