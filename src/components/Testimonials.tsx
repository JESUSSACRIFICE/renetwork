import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Jennifer Adams",
      role: "Marketing Director",
      company: "TechCorp Inc.",
      content: "RE Network helped us find the perfect developer for our project. The quality of work exceeded our expectations, and the process was incredibly smooth from start to finish.",
      rating: 5,
      avatar: "👩",
    },
    {
      name: "Robert Martinez",
      role: "Startup Founder",
      company: "InnovateLab",
      content: "As a startup, finding affordable yet skilled professionals was crucial. RE Network delivered on both fronts. We've completed 15+ projects through the platform with great success.",
      rating: 5,
      avatar: "👨",
    },
    {
      name: "Lisa Thompson",
      role: "Creative Director",
      company: "Brand Studios",
      content: "The freelancers on RE Network are top-notch. We've found designers and writers who truly understand our brand. The escrow system gives us peace of mind with every project.",
      rating: 5,
      avatar: "👩‍💼",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/10 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container relative">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm">
            Testimonials
          </div>
          <h2 className="text-3xl md:text-5xl font-bold">
            People Love To Learn <span className="text-primary">With RE Network</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from businesses and freelancers who have found success on our platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 relative group"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Quote className="h-8 w-8 text-primary-foreground" />
              </div>

              {/* Content */}
              <div className="space-y-6 pt-6">
                {/* Rating */}
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-foreground leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-3xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-xs text-primary">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-16 border-t">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">4.9k</div>
            <div className="text-sm text-muted-foreground">Jobs Posted</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">95%</div>
            <div className="text-sm text-muted-foreground">Satisfied Clients</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">2.4k</div>
            <div className="text-sm text-muted-foreground">Active Freelancers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">Award Winner</div>
            <div className="text-sm text-muted-foreground">Best Platform 2024</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
