import { z } from 'zod'
import { TenantId } from './common'

// ───── GET /tenants/me ─────

export const TenantProfile = z.object({
  id: TenantId,
  name: z.string(),
  phone: z.string(),
  contactName: z.string().nullable(),
  region: z.string().nullable(),
  trialEndsAt: z.string().datetime().nullable(),
  subscriptionEndsAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
})
export type TenantProfile = z.infer<typeof TenantProfile>

// ───── PATCH /tenants/me ─────

export const UpdateTenantRequest = z.object({
  name: z.string().min(2).max(50).optional(),
  contactName: z.string().max(20).optional(),
  region: z.string().max(50).optional(),
})
export type UpdateTenantRequest = z.infer<typeof UpdateTenantRequest>

export const UpdateTenantResponse = TenantProfile
export type UpdateTenantResponse = z.infer<typeof UpdateTenantResponse>
