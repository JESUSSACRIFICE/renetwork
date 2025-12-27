import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const TalentedFreelancers = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-accent/30 via-background to-primary/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm">
              Join Our Network
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Connect With RE Professionals,{" "}
              <span className="text-primary">Grow Your Business</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Access a trusted network of real estate professionals ready to collaborate through referrals. 
              From agents to contractors, mortgage consultants to attorneys - build partnerships that drive success.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl">🏡</span>
                </div>
                <div>
                  <div className="font-semibold">Verified Professionals</div>
                  <div className="text-sm text-muted-foreground">All credentials checked</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <div className="font-semibold">Secure Referral Fees</div>
                  <div className="text-sm text-muted-foreground">Escrow protected</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button size="lg" className="bg-gradient-to-r from-secondary to-secondary-dark hover:shadow-lg transition-all duration-300 group">
                Join Network
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="group">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Right Image - Placeholder for illustration */}
          <div className="relative hidden lg:block">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 p-12 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🏘️</div>
                <div className="text-2xl font-bold">5,000+</div>
                <div className="text-muted-foreground">RE Professionals</div>
              </div>
            </div>
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-secondary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-primary/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TalentedFreelancers;
