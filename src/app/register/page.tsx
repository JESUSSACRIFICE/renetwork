"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { isMockMode } from "@/lib/db-helper";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    const checkConnection = async () => {
      const mockMode = isMockMode();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (mockMode || !supabaseUrl) {
        console.log("🔶 Supabase Status: Mock Mode - Forms will use localStorage");
        return;
      }

      try {
        const { data: authData } = await supabase.auth.getSession();
        const { data, error } = await supabase.from("profiles").select("count").limit(1).maybeSingle();

        if (error) {
          const isTableError = 
            error.code === "PGRST116" || 
            error.message.includes("relation") || 
            error.message.includes("does not exist") ||
            error.message.includes("schema cache") ||
            error.message.includes("Could not find the table");

          if (isTableError) {
            console.log("✅ Supabase Status: Connected");
            console.log("⚠️ Note: 'profiles' table may need to be created. Run migrations if needed.");
          } else {
            console.log("❌ Supabase Status: Connection failed -", error.message);
          }
        } else {
          console.log("✅ Supabase Status: Connected");
          console.log("✅ Forms will submit to Supabase database");
        }
      } catch (err: any) {
        console.log("❌ Supabase Status: Connection error -", err.message || "Failed to connect");
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Join Our Network</h1>
          <p className="text-muted-foreground">
            Select your registration type to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <User className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Service Provider</h2>
              <p className="text-muted-foreground">
                Register as a professional service provider (Agent, Mortgage Consultant, Trade Professional, etc.)
              </p>
              <ul className="text-sm text-left space-y-2 text-muted-foreground">
                <li>• Post your services</li>
                <li>• Connect with buyers</li>
                <li>• Build your network</li>
                <li>• Get referrals</li>
              </ul>
              <Button
                onClick={() => router.push("/register/service-provider")}
                className="w-full mt-4"
                size="lg"
              >
                Register as Service Provider
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Business Buyer</h2>
              <p className="text-muted-foreground">
                Register as a business looking to purchase or lease properties
              </p>
              <ul className="text-sm text-left space-y-2 text-muted-foreground">
                <li>• Find properties</li>
                <li>• Connect with professionals</li>
                <li>• Manage maintenance plans</li>
                <li>• Get expert advice</li>
              </ul>
              <Button
                onClick={() => router.push("/register/business-buyer")}
                className="w-full mt-4"
                size="lg"
                variant="outline"
              >
                Register as Business Buyer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}




