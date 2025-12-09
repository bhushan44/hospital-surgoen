/**
 * Subscription Plan Limits Configuration
 * 
 * This file centralizes all subscription plan limits to ensure consistency
 * across the application. All assignment limits are defined here.
 * 
 * To update limits, modify this file only.
 */

export type PlanTier = 'free' | 'basic' | 'premium' | 'enterprise';

/**
 * Assignment limits per plan tier
 * - free: 5 assignments per month
 * - basic: 20 assignments per month
 * - premium/enterprise: -1 (unlimited)
 */
export const PLAN_ASSIGNMENT_LIMITS: Record<PlanTier, number> = {
  free: 5,
  basic: 20,
  premium: -1, // Unlimited
  enterprise: -1, // Unlimited
};

/**
 * Default assignment limit when no subscription is found
 */
export const DEFAULT_ASSIGNMENT_LIMIT = 5;

/**
 * Get the maximum assignments allowed for a given plan tier
 * 
 * @param tier - The subscription plan tier
 * @returns The maximum assignments allowed (-1 for unlimited)
 */
export function getMaxAssignments(tier: PlanTier | string | null | undefined): number {
  if (!tier) {
    return DEFAULT_ASSIGNMENT_LIMIT;
  }

  const normalizedTier = tier.toLowerCase() as PlanTier;
  
  // Return the limit for the tier, or default if tier is invalid
  return PLAN_ASSIGNMENT_LIMITS[normalizedTier] ?? DEFAULT_ASSIGNMENT_LIMIT;
}

/**
 * Check if a plan tier has unlimited assignments
 * 
 * @param tier - The subscription plan tier
 * @returns true if unlimited, false otherwise
 */
export function isUnlimitedAssignments(tier: PlanTier | string | null | undefined): boolean {
  return getMaxAssignments(tier) === -1;
}

