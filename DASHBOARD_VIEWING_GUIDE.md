# Dashboard Viewing Guide

## How to View Both Employer and Freelancer Dashboards

### Current Logic

The dashboard automatically determines user type based on the database:

- **Freelancer Dashboard**: Users who have entries in the `user_roles` table (service providers)
- **Employer Dashboard**: Users who don't have entries in the `user_roles` table (buyers/clients)

### Method 1: Using URL Parameters (Easiest for Testing)

You can override the automatic detection by adding a `type` parameter to the URL:

#### View Employer Dashboard:
```
http://localhost:3000/dashboard?type=employer
```

#### View Freelancer Dashboard:
```
http://localhost:3000/dashboard?type=freelancer
```

#### Use Auto-Detection (Default):
```
http://localhost:3000/dashboard
```
or
```
http://localhost:3000/dashboard?type=auto
```

### Method 2: Using the Dev Toggle (Development Only)

A toggle button will appear in the bottom-right corner during development that allows you to switch between:
- **Employer** view
- **Freelancer** view  
- **Auto** (database-based detection)

**Note**: This toggle only appears when `NODE_ENV !== "production"` for security.

### Method 3: Database Configuration

#### To View as Employer:
1. Ensure your user account exists in the `profiles` table
2. Make sure there are **NO** entries in the `user_roles` table for your user ID

```sql
-- Check if you have roles
SELECT * FROM user_roles WHERE user_id = 'your-user-id';

-- Remove roles to view as employer (if needed)
DELETE FROM user_roles WHERE user_id = 'your-user-id';
```

#### To View as Freelancer:
1. Ensure your user account exists in the `profiles` table
2. Add at least one entry to the `user_roles` table for your user ID

```sql
-- Add a role to become a freelancer
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id', 'real_estate_agent');
-- Or any other role from the professional_role enum
```

### Available Professional Roles (for Freelancers):

- `real_estate_agent`
- `mortgage_consultant`
- `real_estate_attorney`
- `escrow_officer`
- `property_inspector`
- `appraiser`
- `title_officer`
- `general_contractor`
- `electrician`
- `plumber`
- `hvac_technician`
- `roofer`
- `landscaper`
- `admin`

### Method 4: Create Two Test Accounts

1. **Employer Account**:
   - Sign up with email: `employer@test.com`
   - Don't add any roles to this account
   - Will automatically see Employer dashboard

2. **Freelancer Account**:
   - Sign up with email: `freelancer@test.com`
   - Add a role via SQL or the profile setup page
   - Will automatically see Freelancer dashboard

### Key Differences Between Dashboards:

#### Employer Dashboard Shows:
- Posted Projects
- Completed Projects
- Proposals
- Reviews
- My Jobs
- My Projects
- Jobs Applicants
- Bought Services

#### Freelancer Dashboard Shows:
- Posted Services
- Completed Services
- In Queue Services
- Reviews
- My Services
- Proposals
- Jobs Applied
- Jobs Alerts
- Statements
- Earnings
- Wallet
- Analytics

### Troubleshooting

If the dashboard doesn't switch views:

1. **Clear browser cache** and refresh
2. **Check URL parameters** - make sure `?type=employer` or `?type=freelancer` is in the URL
3. **Check database** - verify your user_roles table entries
4. **Check console** - look for any errors in the browser console

### Quick Test Commands

```bash
# Start your dev server
npm run dev

# Then visit:
# Employer: http://localhost:3000/dashboard?type=employer
# Freelancer: http://localhost:3000/dashboard?type=freelancer
```
