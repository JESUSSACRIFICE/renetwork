# Password Reset URL Fix

## Issue
Password reset emails are showing `localhost` in the URL even when requesting from production.

## Root Cause
Supabase uses the **Site URL** configured in your Supabase Dashboard settings. Even if you pass a `redirectTo` parameter, Supabase may override it with the configured Site URL if the redirect URL doesn't match allowed redirect URLs.

## Solution

### Step 1: Update Supabase Dashboard Settings

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Update the following settings:

   **Site URL:**
   - Set this to your production URL (e.g., `https://yourdomain.com`)
   - This is the base URL Supabase will use for redirects

   **Redirect URLs:**
   - Add your production URL: `https://yourdomain.com/reset-password`
   - Add your development URL: `http://localhost:3000/reset-password`
   - This allows both production and development to work

### Step 2: Set Environment Variable (Optional but Recommended)

Add to your production environment variables:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

This ensures the code uses the correct URL when generating reset links.

### Step 3: Verify the Fix

1. Request a password reset from your production URL
2. Check the email - the reset link should now show your production URL instead of localhost
3. The link should look like:
   ```
   https://gqfrsptqctkxbrttyrxc.supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=https://yourdomain.com/reset-password
   ```

## Important Notes

- The `redirectTo` parameter in code will work, but Supabase validates it against the allowed Redirect URLs list
- If your production URL is not in the Redirect URLs list, Supabase will fall back to the Site URL
- Always ensure both Site URL and Redirect URLs are configured correctly in Supabase Dashboard

## Current Code Implementation

The code now:
1. Checks for `NEXT_PUBLIC_SITE_URL` environment variable first
2. Falls back to `window.location.origin` (current page URL)
3. This ensures production uses the production URL automatically

However, **you must still configure Supabase Dashboard settings** for the redirect to work properly.

