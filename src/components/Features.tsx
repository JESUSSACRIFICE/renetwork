import { Shield, MapPin, TrendingUp, Award, Clock, DollarSign } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "Payment Protection",
      description: "Your funds are held in escrow until work is completed to your satisfaction",
    },
    {
      icon: Award,
      title: "Verified Professionals",
      description: "All providers go through a rigorous vetting process and background checks",
    },
    {
      icon: MapPin,
      title: "Local & Remote",
      description: "Find professionals nearby or work with experts from anywhere in the world",
    },
    {
      icon: TrendingUp,
      title: "Growth Tools",
      description: "PSPs get access to learning resources, analytics, and business tools",
    },
    {
      icon: Clock,
      title: "Fast Response",
      description: "Most professionals respond within 24 hours with detailed proposals",
    },
    {
      icon: DollarSign,
      title: "Transparent Pricing",
      description: "See upfront costs with no hidden fees. Only pay when you're satisfied",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Why Choose RE Network?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with trust and transparency at the core, providing peace of mind for everyone
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group bg-card rounded-2xl p-8 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
