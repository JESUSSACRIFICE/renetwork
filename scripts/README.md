# Scripts

## Seed Referral Test Data

Creates 3 test accounts for testing the referral flow:

| Email | Role | Purpose |
|-------|------|---------|
| customer@referral-test.local | Customer | Messages Provider A (becomes referrable) |
| provider-a@referral-test.local | Service Provider | Referrer - receives message from customer |
| provider-b@referral-test.local | Service Provider | Recipient of referrals |

**Password for all:** `TestPass123!`

Also creates: 1 message (customer → provider-a).

### Run

```bash
# Load env from .env.local if present
npm run seed:referral
```

Or with env vars:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key npm run seed:referral
```

### Test Flow

1. Log in as **provider-a@referral-test.local**
2. Go to Provider B's profile: `/profile/[provider-b-id]`
3. Click **Refer a Client** → Test Customer should appear
4. Select customer, add context, submit
5. Log in as **provider-b@referral-test.local**
6. Go to `/dashboard/referrals-in` → Accept referral
7. Click **Create Engagement** → commission triggers
8. Log in as **provider-a** → `/referral/dashboard` to see commission
