import { z } from 'zod';

// Create Assignment DTO
export const CreateAssignmentDtoSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID format'),
  doctorId: z.string().uuid('Invalid doctor ID format'),
  availabilitySlotId: z.string().uuid('Invalid availability slot ID format'),
  priority: z.enum(['routine', 'urgent', 'emergency']).optional().default('routine'),
  consultationFee: z.number().min(0, 'Consultation fee must be non-negative').optional(),
});

export type CreateAssignmentDto = z.infer<typeof CreateAssignmentDtoSchema>;

