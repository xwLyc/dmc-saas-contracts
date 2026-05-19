import { z } from 'zod'
import { TenantId, PaginationQuery, PaginationResponse } from './common.js'

// ───── 邀请码 ─────

export const InvitationCode = z.string().regex(/^[A-Z0-9]{6,12}$/, '邀请码格式错误')

// ───── POST /referrals/invite-code ─────
// 当前工厂生成自己的推荐码（渠道 B）

export const GenerateInviteCodeResponse = z.object({
  code: InvitationCode,
  qrCodeUrl: z.string().url(),
  expiresAt: z.string().datetime().nullable(), // null = 永不过期
})
export type GenerateInviteCodeResponse = z.infer<typeof GenerateInviteCodeResponse>

// ───── GET /referrals/rewards ─────
// 返佣流水（被邀请的工厂注册/订阅，触发的奖励）

export const RewardItem = z.object({
  id: z.string().uuid(),
  invitedTenantId: TenantId,
  invitedTenantName: z.string(),
  rewardDays: z.number().int().positive(),
  triggeredAt: z.string().datetime(),
  triggerType: z.enum(['registered', 'subscribed']),
})
export type RewardItem = z.infer<typeof RewardItem>

export const RewardListQuery = PaginationQuery
export type RewardListQuery = z.infer<typeof RewardListQuery>

export const RewardListResponse = PaginationResponse(RewardItem)
export type RewardListResponse = z.infer<typeof RewardListResponse>

// ───── GET /referral/me ─────
// 工厂自己的推荐总览(邀请好友页):
//   - referralCode  自己的推荐码(分享给同行用)
//   - records       推荐了哪些工厂的列表(含状态 + 已得天数)
//   - summary       累计统计

export const ReferralRecord = z.object({
  id: TenantId,
  referredTenantName: z.string(),
  referredAt: z.string().datetime(),
  // 被推荐工厂状态:trial=试用中 / paid=已订阅 / voided=已停用 / expired=已到期
  status: z.enum(['trial', 'paid', 'voided', 'expired']),
  // 已生效的延长天数;null = 还没生效(被推荐工厂未订阅)
  rewardDays: z.number().int().nullable(),
  appliedAt: z.string().datetime().nullable(),
})
export type ReferralRecord = z.infer<typeof ReferralRecord>

export const ReferralSummary = z.object({
  totalReferred: z.number().int().nonnegative(),
  totalPaid: z.number().int().nonnegative(),
  totalPending: z.number().int().nonnegative(),
  totalRewardDays: z.number().int().nonnegative(),
})
export type ReferralSummary = z.infer<typeof ReferralSummary>

export const MyReferralsResponse = z.object({
  referralCode: z.string(),
  records: z.array(ReferralRecord),
  summary: ReferralSummary,
})
export type MyReferralsResponse = z.infer<typeof MyReferralsResponse>
