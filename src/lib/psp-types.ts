/**
 * PSP (Professional Service Provider) types - shared between SearchForm, Browse, and DB.
 * Keep in sync with psp_types table in Supabase.
 */

export const PSP_OPTIONS_BY_LETTER: Record<string, string[]> = {
  A: [
    "Accountant",
    "Agent",
    "Appraiser",
    "Architect",
    "Asbesto's",
    "Attorney's",
    "RE Attorney's",
    "Worker's Comp",
  ],
  B: ["Bookkeeper", "Broker", "Builder"],
  C: [
    "Cleaner",
    "Concrete",
    "Contractor",
    "Construction",
    "Consultant",
    "Consultant's",
    "Crowdfunding",
  ],
  D: ["Developer"],
  E: ["Electrician", "Escrow"],
  F: ["Flooring", "Framer"],
  G: ["Gardening"],
  H: ["HVAC"],
  I: ["Investor"],
  J: ["Janitorial"],
  L: [
    "Landscaper",
    "Loan",
    "Loan Executive",
    "Loan Originator",
    "Loan Processor",
  ],
  M: ["Mortgage", "Mover's"],
  P: [
    "Painter",
    "Pavement",
    "Pest",
    "Professional's",
    "Plumber",
    "Pool",
    "Pressure Washer",
  ],
  R: ["Real Estate", "Roofing"],
  S: ["Sand-Blasting", "Solar", "Squat-Removal"],
  T: ["Taxes", "Transaction Coordinator", "Trash Bin Cleaner"],
  W: ["Wholesaler", "Welder", "Window Cleaner"],
};
