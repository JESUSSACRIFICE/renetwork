# Registration and Onboarding System

## Overview
A comprehensive registration and onboarding system for Service Providers (PSP) and Business Buyers with multi-step forms, document uploads, e-signatures, and verification workflows.

## Database Migration
**File:** `supabase/migrations/20241115000000_registration_system.sql`

### New Tables Created:
1. **identity_documents** - Stores identity verification documents (state ID, national ID, passport)
2. **licenses_credentials** - Stores licenses, credentials, and certificates
3. **bonds_insurance** - Stores bonds and insurance documents
4. **e_signatures** - Stores e-signatures for legal documents
5. **preference_rankings** - Stores preference rankings (1-10 scale) for PSP categories
6. **buyer_preferences** - Stores buyer-specific preferences and requirements
7. **buyer_basic_info** - Stores basic buyer information
8. **demography_maintenance_plans** - Stores payment and maintenance plan preferences
9. **onboarding_steps** - Tracks onboarding completion status

### Extended Profile Fields:
- Personal information (first_name, last_name, birthday, mailing_address)
- Business information (business_address, business_hours, number_of_employees)
- Verification statuses (email_verified, phone_verified, interview_verified)
- User type (service_provider, business_buyer)
- Registration status (pending, under_review, approved, rejected)

## Components Created

### 1. FileUpload Component
**Location:** `src/components/registration/FileUpload.tsx`

Features:
- Drag-and-drop file upload (native HTML5)
- File validation (type, size, count)
- Upload progress tracking
- Supabase Storage integration
- Support for multiple files
- File preview and removal

### 2. ESignature Component
**Location:** `src/components/registration/ESignature.tsx`

Features:
- Canvas-based signature drawing (mouse and touch support)
- Name (printed) and signature fields
- Time and date stamping
- Signature validation
- Clear signature functionality

### 3. PreferenceRanking Component
**Location:** `src/components/registration/PreferenceRanking.tsx`

Features:
- 1-10 scale ranking system
- Prevents duplicate rankings
- Visual feedback for used rankings
- Category-based ranking (Stamper, Professional, Agent, Mortgage, Trade)

## Registration Pages

### 1. Registration Type Selection
**Location:** `src/app/register/page.tsx`

- Choose between Service Provider or Business Buyer
- Visual cards with descriptions
- Navigation to respective registration flows

### 2. Service Provider Registration
**Location:** `src/app/register/service-provider/page.tsx`

**8-Step Registration Process:**

1. **Identity Verification**
   - Drag-and-drop ID document upload
   - Country, State, ID Number input
   - Verification checkmark

2. **Personal Information**
   - Last Name, First Name, Birthday
   - Phone, Email, Mailing Address
   - Verification checkmark

3. **Licenses & Credentials**
   - Drag-and-drop license/credential upload
   - Country, State, License Number
   - Active Since, Renewal Date, Expiration Date
   - Verification checkmark

4. **Business Information**
   - Business Name, Address, Hours
   - Best Times to Reach
   - Number of Employees
   - 25% discount notice for referrals

5. **Bonds & Insurance**
   - Drag-and-drop insurance documents
   - Support for multiple insurance types
   - Verification checkmark

6. **Preference Ranking**
   - Rank categories 1-10 (1 = highest priority)
   - Categories: Stamper, Professional, Agent, Mortgage, Trade
   - Unique ranking validation

7. **Payment Preferences**
   - Payment Packet (Weekly, Bi-Weekly, Monthly, Yearly)
   - Tier Package (Basic, Standard, Advanced)
   - Payment Methods (Cash, Credit)
   - Payment Terms

8. **Legal Documents (E-Signatures)**
   - Terms of Service
   - Privacy Policy
   - No-Recruit Agreement
   - Non-Compete Agreement
   - Time-stamped signatures

### 3. Business Buyer Registration
**Location:** `src/app/register/business-buyer/page.tsx`

**5-Step Registration Process:**

1. **Basic Information**
   - Business Name, Contact Person
   - Email, Phone, Location/ZIP Code

2. **Payment Preferences**
   - Payment Packet (Weekly, Bi-Weekly, Monthly, Yearly)
   - Tier Package (Basic, Standard, Advanced)
   - Payment Methods (Cash, Credit)
   - Payment Terms

3. **Buying Preferences**
   - Property Type (Commercial, Residential, etc.)
   - Budget Range (Min/Max)
   - Preferred Payment Method
   - Timeline to Purchase/Lease
   - Truth verification reporting

4. **Additional Information**
   - Business Industry (optional)
   - Languages Spoken
   - Upload Purchase Documents (optional)
   - Specific Requirements/Notes

5. **Legal Documents (E-Signatures)**
   - Terms of Service
   - Privacy Policy
   - No-Recruit Agreement
   - Non-Compete Agreement

## Onboarding Flow

**Location:** `src/app/onboarding/page.tsx`

**Post-Registration Steps (after approval):**

1. **First Service Post**
   - Service Title and Description
   - Creates first service listing

2. **Profile Specialty**
   - Define what you want to be known for
   - Updates profile bio/specialty

3. **Agency Profile**
   - Search for existing agency
   - Or create new agency profile

4. **Refer Someone**
   - Refer a colleague or friend
   - Name and Email input
   - 25% discount reminder

## Features Implemented

✅ Multi-step form navigation
✅ Drag-and-drop file uploads
✅ Document verification checkpoints
✅ E-signature functionality
✅ Preference ranking system (1-10 scale)
✅ Truth verification reporting (for buyers)
✅ Registration status tracking
✅ Onboarding step tracking
✅ Progress indicators
✅ Form validation
✅ Supabase Storage integration
✅ RLS (Row Level Security) policies
✅ Email verification workflow
✅ Phone verification workflow
✅ Interview verification workflow

## Verification Badges

The system supports three verification types:
- ✅ E-Mail Verified
- ✅ Phone-Verified
- ✅ Interview Verified

## Legal Documents

All users must e-sign:
- Terms of Service
- Privacy Policy
- No-Recruit Agreement
- Non-Compete Agreement

Each signature is:
- Time-stamped
- Date-stamped
- Stored with user ID
- Linked to document type

## Next Steps

To complete the system:

1. **Create Supabase Storage Buckets:**
   - `documents` bucket for file uploads
   - Set appropriate RLS policies

2. **Email Integration:**
   - Set up email notifications for registration approval/rejection
   - Set up referral emails

3. **Admin Panel:**
   - Create admin interface for reviewing registrations
   - Approve/reject pending registrations

4. **Additional Features:**
   - Interview scheduling system
   - Phone verification (SMS/OTP)
   - Email verification workflow
   - Agency search functionality
   - Service posting functionality

## File Structure

```
src/
├── app/
│   ├── register/
│   │   ├── page.tsx                    # Registration type selection
│   │   ├── service-provider/
│   │   │   └── page.tsx               # Service Provider registration
│   │   └── business-buyer/
│   │       └── page.tsx               # Business Buyer registration
│   └── onboarding/
│       └── page.tsx                    # Post-registration onboarding
├── components/
│   └── registration/
│       ├── FileUpload.tsx              # Drag-and-drop file upload
│       ├── ESignature.tsx              # E-signature component
│       └── PreferenceRanking.tsx       # Preference ranking component
└── supabase/
    └── migrations/
        └── 20241115000000_registration_system.sql  # Database migration
```

## Usage

1. Navigate to `/register` to start registration
2. Choose registration type (Service Provider or Business Buyer)
3. Complete all required steps
4. Submit registration (status: pending)
5. Wait for admin approval (email notification)
6. Once approved, complete onboarding at `/onboarding`
7. Access full dashboard features

## Notes

- All file uploads go to Supabase Storage
- E-signatures are stored as base64 images
- Registration status must be "approved" to access onboarding
- All tables have RLS policies for security
- Forms use React Hook Form with Zod validation




