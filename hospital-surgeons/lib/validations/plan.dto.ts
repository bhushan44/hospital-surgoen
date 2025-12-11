import { z } from 'zod';

// Doctor plan features schema
const DoctorPlanFeaturesSchema = z.object({
  visibilityWeight: z.number().int().min(1, 'Visibility weight must be at least 1'),
  maxAffiliations: z.number().int().min(1, 'Max affiliations must be at least 1'),
  maxAssignmentsPerMonth: z.union([
    z.number().int(),
    z.literal(-1),
    z.null(),
  ]).optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Hospital plan features schema
const HospitalPlanFeaturesSchema = z.object({
  maxPatientsPerMonth: z.union([
    z.number().int(),
    z.literal(-1),
    z.null(),
  ]).optional().nullable(),
  maxAssignmentsPerMonth: z.union([
    z.number().int(),
    z.literal(-1),
    z.null(),
  ]).optional().nullable(),
  includesPremiumDoctors: z.boolean().optional().default(false),
  notes: z.string().optional().nullable(),
});

// Create/Update Plan DTO Schema
export const CreatePlanDtoSchema = z.object({
  name: z.string().min(1, 'Plan name is required').trim(),
  tier: z.enum(['free', 'basic', 'premium', 'enterprise'], {
    message: 'Tier must be one of: free, basic, premium, enterprise',
  }),
  userRole: z.enum(['doctor', 'hospital'], {
    message: 'User role must be either doctor or hospital',
  }),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.enum(['USD', 'EUR', 'GBP']).optional().default('USD'),
  features: z.union([DoctorPlanFeaturesSchema, HospitalPlanFeaturesSchema]).optional(),
});

// Update Plan DTO Schema (all fields optional except validation)
export const UpdatePlanDtoSchema = z.object({
  name: z.string().min(1, 'Plan name is required').trim().optional(),
  tier: z.enum(['free', 'basic', 'premium', 'enterprise']).optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  currency: z.enum(['USD', 'EUR', 'GBP']).optional(),
  features: z.union([DoctorPlanFeaturesSchema, HospitalPlanFeaturesSchema]).optional(),
});

export type CreatePlanDto = z.infer<typeof CreatePlanDtoSchema>;
export type UpdatePlanDto = z.infer<typeof UpdatePlanDtoSchema>;
export type DoctorPlanFeatures = z.infer<typeof DoctorPlanFeaturesSchema>;
export type HospitalPlanFeatures = z.infer<typeof HospitalPlanFeaturesSchema>;

