# Quick Start: Testing Without Supabase

## 🚀 Enable Mock Mode (No Supabase Required!)

### Step 1: Remove or Comment Out Supabase Credentials

Edit `.env.local` (or create it if it doesn't exist):

```env
# Comment out or remove these lines:
# NEXT_PUBLIC_SUPABASE_URL=your-url-here
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-key-here
```

**OR** add this to force mock mode:

```env
NEXT_PUBLIC_USE_MOCK_MODE=true
```

### Step 2: Start the Development Server

```bash
npm run dev
```

### Step 3: Test the Registration Flows!

Navigate directly to:
- **Service Provider Registration:** http://localhost:3000/register/service-provider
- **Business Buyer Registration:** http://localhost:3000/register/business-buyer

**No login required!** Mock mode automatically creates a test user.

## ✅ What Works in Mock Mode

- ✅ All form validation
- ✅ File uploads (stored in browser localStorage)
- ✅ Drag & drop file uploads
- ✅ E-signatures
- ✅ Preference rankings
- ✅ Multi-step navigation
- ✅ Data persistence (stored in localStorage)
- ✅ Onboarding flow

## 📊 View Your Test Data

Open browser console (F12) and run:

```javascript
// View all stored data
console.log(JSON.parse(localStorage.getItem('mock_database')));

// View uploaded files
Object.keys(localStorage).filter(k => k.startsWith('mock_storage'))
```

## 🧹 Clear Test Data

To start fresh:

```javascript
// In browser console:
localStorage.clear();
location.reload();
```

## 🎯 Test Checklist

### Service Provider Registration:
- [ ] Step 1: Identity Verification (upload files)
- [ ] Step 2: Personal Information
- [ ] Step 3: Licenses & Credentials (upload files)
- [ ] Step 4: Business Information
- [ ] Step 5: Bonds & Insurance (upload files)
- [ ] Step 6: Preference Ranking (1-10 scale)
- [ ] Step 7: Payment Preferences
- [ ] Step 8: Legal Documents (e-signatures)
- [ ] Submit registration

### Business Buyer Registration:
- [ ] Step 1: Basic Information
- [ ] Step 2: Payment Preferences (check payment methods!)
- [ ] Step 3: Buying Preferences
- [ ] Step 4: Additional Information
- [ ] Step 5: Legal Documents (e-signatures)
- [ ] Submit registration

### Onboarding Flow:
- [ ] Navigate to `/onboarding`
- [ ] Complete all 4 onboarding steps
- [ ] Verify completion

## 🔄 Switch Back to Real Supabase

When ready:
1. Add Supabase credentials back to `.env.local`
2. Remove `NEXT_PUBLIC_USE_MOCK_MODE=true` if added
3. Clear localStorage: `localStorage.clear()`
4. Restart dev server

That's it! You can now fully test all registration flows without Supabase! 🎉

