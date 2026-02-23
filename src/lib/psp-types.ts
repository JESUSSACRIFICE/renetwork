/**
 * PSP (Professional Service Provider) types - shared between SearchForm, Browse, and DB.
 * PSP options by letter are fetched from psp_types table via usePspOptionsByLetter().
 */

// Agent nested options (updated with all options)
export const agentOptions = [
  "Escrow",
  "Insurance",
  "Real Estate",
  "Selling",
  "Sell-to-Buy",
  "Buying",
  "Buy-to-Sell",
  "Leasing",
  "Consulting",
  "All",
];

// Real Estate nested options (under Agent > Real Estate)
export const realEstateOptions = ["Selling", "Buying", "Leasing", "All"];

// Crowdfunding nested options
export const crowdfundingOptions = [
  "Accreditation",
  "Accredited",
  "Non Accredited",
];

// Flooring nested options
export const flooringIndoorOptions = ["Asphalt", "Tile"];
export const flooringOutdoorOptions = [
  "Asphalt",
  "Concrete",
  "Gravel",
  "Rock",
  "Stone",
];
