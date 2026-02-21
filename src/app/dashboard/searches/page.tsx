"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function SavedSearches() {
  const router = useRouter();
  const { user } = useAuth();
  const [searches, setSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchSearches = async () => {
      try {
        const { data, error } = await supabase
          .from("saved_searches")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setSearches(data || []);
      } catch (error: any) {
        toast.error("Failed to load searches");
      } finally {
        setLoading(false);
      }
    };
    fetchSearches();
  }, [user?.id]);

  const deleteSearch = async (id: string) => {
    try {
      await supabase.from("saved_searches").delete().eq("id", id);
      setSearches(searches.filter((s) => s.id !== id));
      toast.success("Search deleted");
    } catch (error: any) {
      toast.error("Failed to delete search");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Saved Searches</h1>
        <p className="text-muted-foreground">
          Your saved search filters
        </p>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading...</p>
      ) : searches.length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            No saved searches yet
          </p>
          <Button onClick={() => router.push("/search/services")}>
            Start Searching
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {searches.map((search) => (
            <Card key={search.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-2">{search.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {Object.keys(search.search_params).length} filters
                    applied
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const params = new URLSearchParams(
                        search.search_params,
                      );
                      router.push(
                        `/search/services?${params.toString()}`,
                      );
                    }}
                  >
                    Apply Search
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSearch(search.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
