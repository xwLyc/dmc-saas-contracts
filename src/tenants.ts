import { z } from 'zod'
import { TenantId } from './common.js'

// ───── 工厂租户完整 profile ─────
// GET /tenants/me 返回这个，hydrate / refreshMe 用。
// LoginResponse / RegisterResponse 里的 tenant 是精简 TenantSummary（auth.ts 内）。

export const TenantProfile = z.object({
  id: TenantId,
  name: z.string(),
  contactName: z.string(),
  phone: z.string(),
  exportCategory: z.string().nullable(),
  region: z.string().nullable(),
  // 工厂自己的推荐码（注册时自动生成）
  referralCode: z.string(),
  // 谁推荐我的（null = 我公司直接邀请进来的种子工厂）
  referredByTenantId: TenantId.nullable(),
  invitedBy: z.enum(['company', 'referral']),
  status: z.enum(['trial', 'active', 'expired', 'disabled']),
  // 唯一到期时间——不区分 trial / sub,推荐返佣和订阅续费都改这一个字段
  expiresAt: z.string().datetime(),
  // 首次订阅时间;null = 从未订阅 = trial 工厂。
  // 用于派生 status:firstSubscribedAt 非空且未到期 → active;null 且未到期 → trial
  firstSubscribedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
})
export type TenantProfile = z.infer<typeof TenantProfile>

// ───── GET /tenants/me ─────

export const MeResponse = z.object({
  tenant: TenantProfile,
})
export type MeResponse = z.infer<typeof MeResponse>

// ───── PATCH /tenants/me ─────

export const UpdateTenantRequest = z.object({
  name: z.string().min(2).max(50).optional(),
  contactName: z.string().max(20).optional(),
  region: z.string().max(50).optional(),
  // null 显式清空,undefined 不改;前端"不填" 走 undefined
  exportCategory: z.string().max(50).nullable().optional(),
})
export type UpdateTenantRequest = z.infer<typeof UpdateTenantRequest>

export const UpdateTenantResponse = TenantProfile
export type UpdateTenantResponse = z.infer<typeof UpdateTenantResponse>
