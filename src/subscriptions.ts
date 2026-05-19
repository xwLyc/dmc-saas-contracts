import { z } from 'zod'
import { TenantId } from './common.js'

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

// ───── POST /tenants/me/subscribe ─────
// MVP: 工厂自助"我已付款"按钮触发,无实际支付/admin 审批,直接 create subscription。
// 后续接微信收款码 + admin 审批时,改成 POST /orders + admin 审批后才 create subscription。

export const SubscribeRequest = z.object({
  plan: PlanId,
})
export type SubscribeRequest = z.infer<typeof SubscribeRequest>

// 完整订阅记录(create 后返回 + 历史查询用)
export const Subscription = z.object({
  id: z.string().uuid(),
  tenantId: TenantId,
  plan: PlanId,
  priceYuan: z.number().nonnegative(),
  startsAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  status: z.enum(['active', 'expired', 'cancelled']),
  createdAt: z.string().datetime(),
})
export type Subscription = z.infer<typeof Subscription>
