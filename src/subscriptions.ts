import { z } from 'zod'

// ───── 套餐 ─────

export const PlanId = z.enum(['monthly', 'yearly'])
export type PlanId = z.infer<typeof PlanId>

export const Plan = z.object({
  id: PlanId,
  name: z.string(),
  priceYuan: z.number().nonnegative(),
  durationDays: z.number().int().positive(),
})
export type Plan = z.infer<typeof Plan>

// ───── GET /subscriptions/plans ─────

export const PlanListResponse = z.object({
  plans: z.array(Plan),
})
export type PlanListResponse = z.infer<typeof PlanListResponse>

// ───── GET /subscriptions/current ─────

export const SubscriptionStatus = z.object({
  status: z.enum(['trial', 'active', 'expired']),
  endsAt: z.string().datetime().nullable(),
  daysRemaining: z.number().int(),
})
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>
