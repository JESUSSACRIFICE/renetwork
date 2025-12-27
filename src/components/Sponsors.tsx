'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  is_featured: boolean;
}

const Sponsors = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('display_order')
        .order('name');

      if (error) throw error;
      setSponsors(data || []);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || sponsors.length === 0) {
    return null;
  }

  const featuredSponsors = sponsors.filter(s => s.is_featured);
  const regularSponsors = sponsors.filter(s => !s.is_featured);

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">A Word From Our Sponsors</h2>
        <p className="text-center text-muted-foreground mb-12">
          Supporting our real estate professional network
        </p>

        {featuredSponsors.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-6 text-center">Featured Sponsors</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSponsors.map((sponsor) => (
                <Card
                  key={sponsor.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    {sponsor.website_url ? (
                      <a
                        href={sponsor.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        {sponsor.logo_url ? (
                          <img
                            src={sponsor.logo_url}
                            alt={sponsor.name}
                            className="h-24 w-full object-contain mb-4"
                          />
                        ) : (
                          <div className="h-24 flex items-center justify-center bg-muted rounded-lg mb-4">
                            <span className="text-2xl font-bold">{sponsor.name}</span>
                          </div>
                        )}
                        <h4 className="font-semibold text-center">{sponsor.name}</h4>
                        {sponsor.description && (
                          <p className="text-sm text-muted-foreground text-center mt-2">
                            {sponsor.description}
                          </p>
                        )}
                      </a>
                    ) : (
                      <>
                        {sponsor.logo_url ? (
                          <img
                            src={sponsor.logo_url}
                            alt={sponsor.name}
                            className="h-24 w-full object-contain mb-4"
                          />
                        ) : (
                          <div className="h-24 flex items-center justify-center bg-muted rounded-lg mb-4">
                            <span className="text-2xl font-bold">{sponsor.name}</span>
                          </div>
                        )}
                        <h4 className="font-semibold text-center">{sponsor.name}</h4>
                        {sponsor.description && (
                          <p className="text-sm text-muted-foreground text-center mt-2">
                            {sponsor.description}
                          </p>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {regularSponsors.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-6 text-center">Our Partners</h3>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {regularSponsors.map((sponsor) => (
                <div key={sponsor.id} className="h-16 w-32">
                  {sponsor.website_url ? (
                    <a
                      href={sponsor.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full"
                    >
                      {sponsor.logo_url ? (
                        <img
                          src={sponsor.logo_url}
                          alt={sponsor.name}
                          className="h-full w-full object-contain grayscale hover:grayscale-0 transition-all"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center bg-muted rounded">
                          <span className="font-semibold text-sm">{sponsor.name}</span>
                        </div>
                      )}
                    </a>
                  ) : (
                    <>
                      {sponsor.logo_url ? (
                        <img
                          src={sponsor.logo_url}
                          alt={sponsor.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center bg-muted rounded">
                          <span className="font-semibold text-sm">{sponsor.name}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Sponsors;