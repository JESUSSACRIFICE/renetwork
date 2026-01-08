# Testing Registration Flows Without Supabase

This guide explains how to test the registration and onboarding flows without having access to Supabase.

## Quick Start

### Option 1: Enable Mock Mode via Environment Variable

Create a `.env.local` file in your project root (if it doesn't exist) and add:

```env
NEXT_PUBLIC_USE_MOCK_MODE=true
```

Or simply don't set `NEXT_PUBLIC_SUPABASE_URL` - the system will automatically use mock mode.

### Option 2: Temporary Supabase URL Removal

Remove or comment out the Supabase URL in your `.env.local`:

```env
# NEXT_PUBLIC_SUPABASE_URL=your-url-here
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-key-here
```

## What Gets Mocked

### ✅ Mock Authentication
- Automatic mock user creation
- No login required for testing
- Mock user ID stored in localStorage

### ✅ Mock File Upload
- Files stored in browser localStorage
- Base64 encoding for file data
- No bucket setup required

### ✅ Mock Database
- All data stored in browser localStorage
- Tables: profiles, identity_documents, licenses_credentials, etc.
- Data persists across page refreshes

### ✅ Features That Work in Mock Mode
- ✅ Service Provider Registration (all 8 steps)
- ✅ Business Buyer Registration (all 5 steps)
- ✅ File uploads (drag & drop)
- ✅ E-signatures
- ✅ Preference rankings
- ✅ Form validation
- ✅ Multi-step navigation
- ✅ Onboarding flow

## Testing the Flows

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Navigate to Registration

- **Service Provider:** http://localhost:3000/register/service-provider
- **Business Buyer:** http://localhost:3000/register/business-buyer

### 3. Test Without Authentication

The mock mode will automatically create a test user, so you can:
- Skip the auth page
- Go directly to registration
- Test all form steps

### 4. View Mock Data

Open browser DevTools (F12) → Console:
- All database operations are logged with `[MOCK DB]` prefix
- Check localStorage to see stored data
- Run `localStorage.getItem('mock_database')` to see all stored data

## Clearing Mock Data

To clear all mock data and start fresh:

```javascript
// In browser console:
localStorage.clear();
location.reload();
```

Or use the mockDB helper:

```javascript
import { mockDB } from '@/lib/mock-db';
mockDB.clearAll();
```

## Mock Data Structure

All data is stored in localStorage under `mock_database`:

```json
{
  "profiles": [...],
  "identity_documents": [...],
  "licenses_credentials": [...],
  "bonds_insurance": [...],
  "e_signatures": [...],
  "preference_rankings": [...],
  "buyer_preferences": [...],
  "buyer_basic_info": [...],
  "demography_maintenance_plans": [...],
  "onboarding_steps": [...],
  "payment_preferences": [...]
}
```

## Limitations of Mock Mode

### ⚠️ What Doesn't Work
- ❌ Real authentication (uses mock user)
- ❌ Email notifications
- ❌ Real file storage (files stored in localStorage)
- ❌ Data persistence across browsers/devices
- ❌ Admin review/approval workflow

### ✅ What Still Works
- All UI/UX flows
- Form validation
- File upload interface
- E-signature drawing
- Multi-step navigation
- Data structure validation

## Switching Back to Real Supabase

When you're ready to use real Supabase:

1. Add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

2. Remove or set `NEXT_PUBLIC_USE_MOCK_MODE=false`

3. Clear mock data:
```javascript
localStorage.clear();
```

4. Restart the dev server

## Troubleshooting

### Mock mode not activating?
- Check that `NEXT_PUBLIC_SUPABASE_URL` is not set or empty
- Check browser console for `[MOCK DB]` logs
- Verify `.env.local` file exists and is loaded

### Files not uploading?
- Check browser console for errors
- Verify localStorage has space (files are base64 encoded)
- Try smaller files if localStorage quota is exceeded

### Form validation not working?
- Mock mode uses the same validation as real mode
- Check browser console for validation errors
- Ensure all required fields are filled

## Example Test Flow

1. **Enable mock mode** (set env variable or remove Supabase URL)

2. **Navigate to registration:**
   ```
   http://localhost:3000/register
   ```

3. **Select Service Provider** and complete all 8 steps:
   - Identity Verification (upload files)
   - Personal Information
   - Licenses & Credentials
   - Business Information
   - Bonds & Insurance
   - Preference Ranking
   - Payment Preferences
   - Legal Documents (e-sign)

4. **Submit registration** - data saved to localStorage

5. **Check stored data:**
   ```javascript
   console.log(JSON.parse(localStorage.getItem('mock_database')));
   ```

6. **Test onboarding flow:**
   ```
   http://localhost:3000/onboarding
   ```

This allows you to fully test all registration and onboarding flows without needing Supabase access!

