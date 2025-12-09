/**
 * Hospital Subscription Plan Limits Configuration
 * 
 * This file centralizes all hospital subscription plan limits to ensure consistency
 * across the application. All hospital limits (patients & assignments) are defined here.
 * 
 * To update limits, modify this file only.
 */

export type HospitalPlanTier = 'free' | 'basic' | 'premium' | 'enterprise';

/**
 * Patient creation limits per plan tier
 * - free: 10 patients per month
 * - basic: 50 patients per month
 * - premium/enterprise: -1 (unlimited)
 */
export const HOSPITAL_PATIENT_LIMITS: Record<HospitalPlanTier, number> = {
  free: 10,
  basic: 50,
  premium: -1, // Unlimited
  enterprise: -1, // Unlimited
};

/**
 * Assignment creation limits per plan tier
 * - free: 20 assignments per month
 * - basic: 100 assignments per month
 * - premium/enterprise: -1 (unlimited)
 */
export const HOSPITAL_ASSIGNMENT_LIMITS: Record<HospitalPlanTier, number> = {
  free: 20,
  basic: 100,
  premium: -1, // Unlimited
  enterprise: -1, // Unlimited
};

/**
 * Default patient limit when no subscription is found
 */
export const DEFAULT_HOSPITAL_PATIENT_LIMIT = 10;

/**
 * Default assignment limit when no subscription is found
 */
export const DEFAULT_HOSPITAL_ASSIGNMENT_LIMIT = 20;

/**
 * Get the maximum patients allowed for a given plan tier
 * 
 * @param tier - The subscription plan tier
 * @returns The maximum patients allowed (-1 for unlimited)
 */
export function getMaxPatients(tier: HospitalPlanTier | string | null | undefined): number {
  if (!tier) {
    return DEFAULT_HOSPITAL_PATIENT_LIMIT;
  }

  const normalizedTier = tier.toLowerCase() as HospitalPlanTier;
  
  // Return the limit for the tier, or default if tier is invalid
  return HOSPITAL_PATIENT_LIMITS[normalizedTier] ?? DEFAULT_HOSPITAL_PATIENT_LIMIT;
}

/**
 * Get the maximum assignments allowed for a given plan tier
 * 
 * @param tier - The subscription plan tier
 * @returns The maximum assignments allowed (-1 for unlimited)
 */
export function getMaxAssignmentsForHospital(tier: HospitalPlanTier | string | null | undefined): number {
  if (!tier) {
    return DEFAULT_HOSPITAL_ASSIGNMENT_LIMIT;
  }

  const normalizedTier = tier.toLowerCase() as HospitalPlanTier;
  
  // Return the limit for the tier, or default if tier is invalid
  return HOSPITAL_ASSIGNMENT_LIMITS[normalizedTier] ?? DEFAULT_HOSPITAL_ASSIGNMENT_LIMIT;
}

/**
 * Check if a plan tier has unlimited patients
 * 
 * @param tier - The subscription plan tier
 * @returns true if unlimited, false otherwise
 */
export function isUnlimitedPatients(tier: HospitalPlanTier | string | null | undefined): boolean {
  return getMaxPatients(tier) === -1;
}

/**
 * Check if a plan tier has unlimited assignments
 * 
 * @param tier - The subscription plan tier
 * @returns true if unlimited, false otherwise
 */
export function isUnlimitedAssignmentsForHospital(tier: HospitalPlanTier | string | null | undefined): boolean {
  return getMaxAssignmentsForHospital(tier) === -1;
}

