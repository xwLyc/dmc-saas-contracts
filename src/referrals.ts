import { z } from 'zod'
import { TenantId, PaginationQuery, PaginationResponse } from './common'

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
