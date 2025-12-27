import { Award, TrendingUp, Users, CheckCircle } from "lucide-react";

const StatsAndAwards = () => {
  const stats = [
    { value: "4.9/5", label: "Average Rating", sublabel: "From 50k+ reviews" },
    { value: "98%", label: "Customer Satisfaction", sublabel: "Job success rate" },
    { value: "24/7", label: "Support Available", sublabel: "We're here to help" },
  ];

  const awards = [
    { icon: Award, label: "Best Freelance Platform 2024", org: "Tech Awards" },
    { icon: TrendingUp, label: "Fastest Growing Marketplace", org: "Industry Report" },
    { icon: Users, label: "Most Trusted by Professionals", org: "Customer Choice" },
    { icon: CheckCircle, label: "Excellence in Service", org: "Business Excellence" },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Stats Section */}
          <div className="space-y-8">
            <div>
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-4">
                Trusted by Thousands
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Find The Talent Needed To Get Your{" "}
                <span className="text-primary">Business Growing</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of satisfied customers who have found success through our platform. 
                Our commitment to quality and excellence sets us apart.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-6 bg-card rounded-2xl border hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-300 shrink-0">
                    <span className="text-3xl font-bold text-primary">{stat.value.slice(0, 1)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="font-semibold text-foreground mb-1">{stat.label}</div>
                    <div className="text-sm text-muted-foreground">{stat.sublabel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Awards Section */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-3">Awards & Recognition</h3>
              <p className="text-muted-foreground">
                Our commitment to excellence has been recognized by industry leaders and organizations worldwide.
              </p>
            </div>

            <div className="grid gap-4">
              {awards.map((award, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-5 bg-card rounded-xl border hover:border-primary/50 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-warning/10 group-hover:bg-warning/20 transition-colors">
                    <award.icon className="h-7 w-7 text-warning" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {award.label}
                    </div>
                    <div className="text-sm text-muted-foreground">{award.org}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badge */}
            <div className="p-6 bg-gradient-to-br from-primary to-primary-dark text-primary-foreground rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="h-6 w-6" />
                <span className="font-bold text-lg">Verified & Trusted</span>
              </div>
              <p className="text-primary-foreground/90 text-sm">
                All our professionals go through a rigorous verification process to ensure quality and reliability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsAndAwards;
