PHASE-1 ARCHITECTURE ADDENDUM
RE-Network Platform (Career + Referral + Networking MVP)
Purpose
This addendum defines the rules, flows, boundaries, and success criteria of Phase-1 so
development is deterministic, not assumption-driven. Cursor AI is expected to execute this
architecture, not invent it.
1. PLATFORM INTENT (PHASE-1 ONLY)
Phase-1 is designed to:
● Validate referral-based economic activity
● Enable career / professional discovery
● Establish trust via visibility + admin oversight
● Prove role-based value delivery
Phase-1 is NOT designed to:
● Optimize referrals
● Automate payouts
● Apply AI intelligence
● Scale to mass usage
2. USER ROLES & PRIMARY SUCCESS STATE
1️⃣Investor
Purpose: Generate value via referrals
Activation: First referral submitted
Success State: Referral tracked with visible status
Return Trigger: Earnings or referral progress update
2️⃣PSP (Professional Service Provider)
Purpose: Receive leads / career exposure
Activation: Profile approved & listed
Success State: Contacted via platform
Return Trigger: New referral / message / visibility
3️⃣Passive Investor
Purpose: Observe ecosystem & opportunities
Activation: Profile created + directory access
Success State: Saved professional / viewed opportunity
Return Trigger: Platform activity updates
4️⃣Customer
Purpose: Find & contact professionals
Activation: Professional viewed + contacted
Success State: Connection initiated
Return Trigger: Follow-up / response
3. CORE USER JOURNEYS (LOCKED)
Investor Journey
Landing → Signup → Profile → Directory → Submit Referral → Referral Status → Dashboard
PSP Journey
Landing → Signup → Profile → Admin Approval → Directory Visibility → Contact / Referral
Customer Journey
Landing → Browse/Search → View PSP → Contact / Order → Confirmation
Admin Journey
Dashboard → Approvals → Moderation → Analytics → Dispute Resolution
4. CORE DATA OBJECTS (PHASE-1)
Object Owner Notes
User Platform Role-based
Profile User Approval required for PSP
Referral Investor Status-driven
Transactio
n
Platform Read-only for users
Message Platform Permission-bound
Post User Moderated
Lifecycle Rules
● Referrals: Created → Pending → Active → Closed → Archived
● Transactions: Created → Pending → Completed → Locked
● Messages: Stored, not deletable by users
5. PERMISSIONS MATRIX (SUMMARY)
Action Investor PSP Customer Admin
Submit referral ✅ ❌ ❌ ✅
View earnings ✅ ❌ ❌ ✅
Edit PSP profile ❌ ✅ ❌ ✅
Message users Limited Limited Limited Full
Approve profiles ❌ ❌ ❌ ✅
6. REFERRAL & PAYMENT LOGIC (PHASE-1)
Phase-1 Rule:
Payments are tracked, not optimized.
● Platform records referral value
● Earnings may be:
○ Pending
○ Approved
○ Completed
● No automated payouts required
● Admin can override status manually
This ensures:
● Legal safety
● Accounting clarity
● Future Phase-2 extensibility
7. FEEDBACK & CONFIRMATION (MANDATORY)
Every action must return:
● Visual confirmation
● Status indicator
● Dashboard reflection
Examples:
● “Referral submitted – pending”
● “Profile awaiting approval”
● “Earnings pending review”
No silent actions.
8. EMPTY STATES (REQUIRED)
When data = 0, UI must guide:
● “Submit your first referral”
● “Complete your profile to appear”
● “Browse professionals to get started”
Empty ≠ blank.
9. METRICS (PHASE-1 DEFINITION)
Required Tracking
● Signup → Activation conversion
● Referral submission count
● Profile approval completion
● 7–14 day return rate
Advanced analytics explicitly excluded.
10. PHASE-1 HARD BOUNDARIES
Explicitly out of scope:
● AI matching
● Automated payouts
● Scaling guarantees
● Advanced moderation
● Recommendation engines
● Financial forecasting
Any inclusion requires Phase-2 agreement.
11. CURSOR AI USAGE REQUIREMENT
Cursor AI is approved for:
● UI scaffolding
● CRUD generation
● Dashboard wiring
● Form & state logic
Cursor AI must not:
● Define business rules
● Invent permissions
● Redesign flows
● Modify data ownership
12. SUCCESS DEFINITION (PHASE-1 COMPLETE)
Phase-1 is complete when:
● All roles can activate successfully
● Referrals are trackable end-to-end
● PSPs can be discovered & contacted
● Admin can fully manage the system
● Platform is live-ready (not scaled)
WHY THIS DOCUMENT MUST BE READ (FOR
DEVELOPER)
This addendum freezes system rules so development is execution-focused, not
assumption-based.
Cursor AI accelerates implementation, but architecture must be human-defined.
This protects delivery timelines, prevents rework, and ensures Phase-1 success is
measurable.