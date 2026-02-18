"use client";

/**
 * Barrel file: re-exports professional and customer profile hooks.
 * Import from here for backward compatibility, or import directly from
 * use-professional-profiles / use-customer-profiles for clarity.
 */

// Professional profiles (service providers, business buyers)
export {
  profileKeys,
  useBrowseProfiles,
  useSearchProfiles,
  usePspTypes,
  useProfile,
  useProfileFavorite,
  useSubmitReview,
  useProfileUpdate,
  useProfileBasicInfoUpdate,
  useProfilePspTypesUpdate,
  useProfileRolesUpdate,
  useProfileExperienceUpdate,
  useProfilePricingUpdate,
  useProfileServiceAreasUpdate,
  useProfileTrainingUpdate,
  useProfileLanguagesUpdate,
  useProfilePaymentPrefsUpdate,
  type BrowseProfilesFilters,
  type SearchProfilesFilters,
  type SearchProfileListing,
  type BrowseProfileListing,
  type ProfileReview,
  type ProfessionalProfile,
  type SubmitReviewPayload,
  type ProfileUpdatePayload,
  type ProfileBasicInfoPayload,
  type ProfileRolesPayload,
  type ProfilePspTypesPayload,
  type ProfileExperiencePayload,
  type ProfilePricingPayload,
  type ProfileServiceAreasPayload,
  type ProfileTrainingPayload,
  type ProfilePaymentPrefsPayload,
  type ProfileLanguagesPayload,
} from "./use-professional-profiles";

// Customer profiles
export {
  customerProfileKeys,
  useCustomerProfile,
  useCustomerProfileUpdate,
  type CustomerProfile,
  type CustomerProfileUpdatePayload,
} from "./use-customer-profiles";
