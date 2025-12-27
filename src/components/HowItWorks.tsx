import { Search, UserCheck, Briefcase, CheckCircle2 } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Find a Professional",
      description: "Browse thousands of verified experts or post your project requirements",
    },
    {
      icon: UserCheck,
      title: "Compare & Match",
      description: "Review profiles, portfolios, and ratings to find the perfect fit",
    },
    {
      icon: Briefcase,
      title: "Collaborate Securely",
      description: "Work together with built-in tools and escrow payment protection",
    },
    {
      icon: CheckCircle2,
      title: "Complete & Review",
      description: "Approve work, release payment, and leave a review for others",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-accent/30 to-background">
      <div className="container">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">How RE Network Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes and connect with the right professional for your needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-10 w-10 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-border -translate-x-1/2" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
