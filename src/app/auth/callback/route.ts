import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');

  if (code && SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/auth?error=verification_failed', requestUrl.origin));
    }

    // If we have a session, check if user needs to complete registration
    if (data.session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, user_type, registration_status")
        .eq("id", data.session.user.id)
        .maybeSingle();

      // Check if user has completed their role-specific registration
      // Use type assertion since user_type may not be in TypeScript types yet
      const profileData = profile as any;
      const hasCompletedRegistration = profileData && 
        profileData.user_type && 
        (profileData.user_type === 'service_provider' || profileData.user_type === 'business_buyer');

      if (next) {
        // If next parameter is provided, use it
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      } else if (!hasCompletedRegistration) {
        // User hasn't completed registration, redirect to registration page
        return NextResponse.redirect(new URL('/register', requestUrl.origin));
      } else {
        // User has completed registration, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
      }
    }
  }

  // Default: redirect to login page
  return NextResponse.redirect(new URL('/auth?verified=true', requestUrl.origin));
}

