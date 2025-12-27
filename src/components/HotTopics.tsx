'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, Users, Building, DollarSign, FileText } from "lucide-react";

interface HotTopic {
  id: string;
  title: string;
  description: string | null;
  icon_url: string | null;
  category: string | null;
}

const iconMap: { [key: string]: any } = {
  lightbulb: Lightbulb,
  trending: TrendingUp,
  users: Users,
  building: Building,
  dollar: DollarSign,
  file: FileText
};

const HotTopics = () => {
  const [topics, setTopics] = useState<HotTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('hot_topics')
        .select('*')
        .order('display_order')
        .order('title');

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching hot topics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || topics.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Hot Topics & Helpful Considerations</h2>
        <p className="text-center text-muted-foreground mb-12">
          Explore key insights and strategies for real estate professionals
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topics.map((topic) => {
            const IconComponent = topic.icon_url && iconMap[topic.icon_url] 
              ? iconMap[topic.icon_url] 
              : Lightbulb;

            return (
              <Card
                key={topic.id}
                className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{topic.title}</CardTitle>
                  {topic.category && (
                    <CardDescription className="capitalize">{topic.category}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {topic.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HotTopics;