"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription className="text-base mt-2">
            We&apos;ve sent a verification email to your inbox
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              Please check your email inbox (and spam folder) for a verification link.
            </p>
            <p className="text-sm text-muted-foreground">
              Click the link in the email to verify your account, then come back here to log in.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">What&apos;s next?</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-300">
                  <li>Check your email for the verification link</li>
                  <li>Click the link to verify your account</li>
                  <li>Return here and log in</li>
                  <li>Complete your profile registration</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push("/auth")}
              className="w-full"
              variant="default"
            >
              Go to Login Page
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => router.push("/")}
              className="w-full"
              variant="outline"
            >
              Back to Home
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <Link href="/auth" className="text-primary hover:underline">
                try logging in again
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

