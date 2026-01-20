"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isMockMode } from "@/lib/db-helper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export function VerifySupabaseConnection() {
  const [status, setStatus] = useState<{
    mode: "supabase" | "mock" | "checking";
    connected: boolean;
    error?: string;
    url?: string;
  }>({
    mode: "checking",
    connected: false,
  });

  useEffect(() => {
    const checkConnection = async () => {
      const mockMode = isMockMode();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (mockMode || !supabaseUrl) {
        setStatus({
          mode: "mock",
          connected: false,
          error: mockMode
            ? "Running in mock mode (Supabase not configured)"
            : "NEXT_PUBLIC_SUPABASE_URL not set",
        });
        return;
      }

      try {
        // Try to connect to Supabase - use a simple query that works even without tables
        // First try to get the current user/auth to verify connection
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        // If auth works, connection is good. Then check if profiles table exists
        const { data, error } = await supabase.from("profiles").select("count").limit(1).maybeSingle();

        if (error) {
          // Check for table/schema cache errors - these indicate table doesn't exist, not connection failure
          const isTableError = 
            error.code === "PGRST116" || 
            error.message.includes("relation") || 
            error.message.includes("does not exist") ||
            error.message.includes("schema cache") ||
            error.message.includes("Could not find the table");

          if (isTableError) {
            // Connection works, but table doesn't exist - still consider it connected
            // The table will be created when migrations run
            setStatus({
              mode: "supabase",
              connected: true,
              url: supabaseUrl,
              error: "Connected to Supabase, but 'profiles' table may need to be created. Run migrations if needed.",
            });
          } else {
            // Other errors might be connection issues
            setStatus({
              mode: "supabase",
              connected: false,
              error: error.message,
              url: supabaseUrl,
            });
          }
        } else {
          // Table exists and query worked
          setStatus({
            mode: "supabase",
            connected: true,
            url: supabaseUrl,
          });
        }
      } catch (err: any) {
        setStatus({
          mode: "supabase",
          connected: false,
          error: err.message || "Failed to connect",
          url: supabaseUrl,
        });
      }
    };

    checkConnection();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Supabase Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {status.mode === "checking" && (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />
              <span>Checking connection...</span>
            </>
          )}
          {status.mode === "supabase" && status.connected && (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-green-700 dark:text-green-400 font-medium">
                Connected to Supabase
              </span>
            </>
          )}
          {status.mode === "supabase" && !status.connected && (
            <>
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 dark:text-red-400 font-medium">
                Supabase connection failed
              </span>
            </>
          )}
          {status.mode === "mock" && (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-yellow-700 dark:text-yellow-400 font-medium">
                Running in Mock Mode
              </span>
            </>
          )}
        </div>

        {status.url && (
          <div className="text-sm text-muted-foreground">
            <strong>URL:</strong> {status.url}
          </div>
        )}

        {status.error && (
          <div className={`text-sm p-3 rounded ${
            status.connected 
              ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950" 
              : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950"
          }`}>
            <strong>{status.connected ? "Note:" : "Error:"}</strong> {status.error}
            {status.error?.includes("schema cache") || status.error?.includes("table may need to be created") ? (
              <div className="mt-2 text-xs">
                <p><strong>Solution:</strong> Run your Supabase migrations to create the required tables.</p>
                <p className="mt-1">Check the <code>supabase/migrations</code> folder and apply migrations in your Supabase dashboard.</p>
              </div>
            ) : null}
          </div>
        )}

        {status.mode === "supabase" && status.connected && (
          <div className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950 p-3 rounded">
            <strong>✓ Forms will submit to Supabase</strong>
            <p className="mt-1">
              Your registration forms are configured to save data to your Supabase database.
            </p>
          </div>
        )}

        {status.mode === "mock" && (
          <div className="text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 p-3 rounded">
            <strong>⚠ Forms are using Mock Mode</strong>
            <p className="mt-1">
              Data will be stored in browser localStorage, not in Supabase. To use Supabase, ensure
              NEXT_PUBLIC_SUPABASE_URL is set in your .env.local file.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



