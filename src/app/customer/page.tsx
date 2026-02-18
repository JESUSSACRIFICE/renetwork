"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  UserCheck,
  MessageSquare,
  FileCheck,
  Shield,
  Users,
  Target,
  Heart,
  ArrowRight,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useServicesList } from "@/hooks/use-services";

const SERVICES_PREVIEW_LIMIT = 6;

export default function CustomerLandingPage() {
  const router = useRouter();
  const { data: services = [], isLoading: servicesLoading } = useServicesList({
    limit: SERVICES_PREVIEW_LIMIT,
  });

  const handleGetStarted = () => {
    router.push("/register/customer");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-b">
          <div className="container relative px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-2 lg:order-1 text-center lg:text-left">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
                  For customers
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                  Find & contact trusted real estate professionals
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                  Browse our vetted network of agents, lenders, contractors, and
                  property managers. No guessing who to trust—connect with the
                  right pro for your project.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="text-base px-8 h-12"
                    onClick={handleGetStarted}
                  >
                    Get started free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base px-8 h-12"
                    asChild
                  >
                    <Link href="/search/profiles">Browse professionals</Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-6">
                  No approval needed • Create account and start browsing in
                  minutes
                </p>
              </div>
              <div className="order-1 lg:order-2 relative aspect-[4/3] lg:aspect-square rounded-2xl overflow-hidden border shadow-xl">
                <Image
                  src={heroImage}
                  alt="Real estate professionals and clients connecting"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services preview */}
        <section className="py-16 sm:py-24 border-b">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Popular services
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  Browse offerings from vetted professionals. Inspections,
                  representation, lending, and more.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="shrink-0 w-full sm:w-auto"
              >
                <Link
                  href="/search/services"
                  className="inline-flex items-center gap-2"
                >
                  View more
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            {servicesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-32 bg-muted animate-pulse" />
                    <CardContent className="p-4">
                      <div className="h-5 bg-muted rounded animate-pulse mb-2 w-3/4" />
                      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="rounded-xl border bg-muted/30 p-12 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No services yet. Check back soon.
                </p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/search/services">Browse all</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Link key={service.id} href={`/services/${service.id}`}>
                    <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 group">
                      <div className="h-36 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <Briefcase className="h-12 w-12 text-primary/40 group-hover:text-primary/60 transition-colors" />
                      </div>
                      <CardContent className="p-4">
                        <Badge variant="secondary" className="mb-2">
                          {service.category}
                        </Badge>
                        <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                          {service.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={service.provider_avatar} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {service.provider_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">
                            {service.provider_name}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            {service.price > 0
                              ? `From $${service.price}`
                              : "Contact for price"}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Why it's better (from requirements: Pre-vetted, no guessing, specialized matching) */}
        <section className="py-16 sm:py-24 border-b bg-muted/30">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 items-center mb-12">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-3">
                  Why RE Network is better
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Built on faith-based values with verified professionals and
                  transparent processes.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: Shield,
                  title: "Pre-vetted experts",
                  text: "No more guessing who to trust. Every professional is verified.",
                },
                {
                  icon: Target,
                  title: "Right pro for your need",
                  text: "Specialized matching: agents, lenders, contractors, and more.",
                },
                {
                  icon: Users,
                  title: "Curated network",
                  text: "Quality connections—targeted, not overwhelming.",
                },
                {
                  icon: Heart,
                  title: "Values-aligned",
                  text: "Faith-based platform where faith, finance, and future connect.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border bg-card p-6 text-center shadow-sm"
                >
                  <item.icon className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works – Customer Journey (from requirements-refined-v2) */}
        <section className="py-16 sm:py-24 border-b">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 items-center mb-12">
              <div className="lg:col-span-7 text-center order-2 lg:order-1">
                <h2 className="text-3xl font-bold text-foreground mb-3">
                  How it works
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Your journey: from signup to connection in four steps.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: "1",
                  icon: Search,
                  title: "Browse & search",
                  text: "Explore our directory of vetted professionals. Filter by service type, location, and more.",
                },
                {
                  step: "2",
                  icon: UserCheck,
                  title: "View PSP profiles",
                  text: "Read verified reviews, see past work, and compare professionals.",
                },
                {
                  step: "3",
                  icon: MessageSquare,
                  title: "Contact or order",
                  text: "Reach out or place an order. We have your back with clear terms and secure process.",
                },
                {
                  step: "4",
                  icon: FileCheck,
                  title: "Confirmation",
                  text: "Get status updates and confirmation. Your connection is initiated.",
                },
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="rounded-xl border bg-card p-6 shadow-sm h-full">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-4">
                      {item.step}
                    </span>
                    <item.icon className="h-9 w-9 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </div>
                  {item.step !== "4" && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t border-dashed border-muted-foreground/30 -translate-y-1/2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What you can do (from requirements.md) */}
        <section className="py-16 sm:py-24 border-b bg-muted/30">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
                  alt="Real estate keys - find your perfect property team"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  What you can do as a customer
                </h2>
                <ul className="space-y-3 text-left inline-block">
                  {[
                    "Find agents, lenders, contractors, and property managers",
                    "Read verified reviews and see past work",
                    "Get matched to the right pro for your specific project",
                    "Contact professionals and place orders with confidence",
                    "Track status and get confirmation—no silent actions",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA – redirect to CustomerSignupPage */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1600&q=60"
              alt=""
              fill
              className="object-cover opacity-15"
              sizes="100vw"
              aria-hidden
            />
          </div>
          <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl rounded-2xl border bg-card/95 backdrop-blur p-8 sm:p-12 text-center shadow-lg">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Find your dream team in minutes, not months
              </h2>
              <p className="text-muted-foreground mb-8">
                Join as a customer and get access to our vetted network. No
                approval needed—sign up and start browsing.
              </p>
              <Button
                size="lg"
                className="text-base px-8 h-12"
                onClick={handleGetStarted}
              >
                Sign up as customer
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link
                  href="/auth"
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
