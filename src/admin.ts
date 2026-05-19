import { z } from 'zod'
import { TenantId, PaginationQuery, PaginationResponse } from './common.js'

// ───── admin 账号 ─────
// MVP 单一 admin 账号(docs §7.1 v2.0),不做注册端点。
// admin 通过 username 登录,跟工厂 tenant(手机号登录)物理隔离不混淆。

export const AdminUser = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(32),
  name: z.string(),
  createdAt: z.string().datetime(),
})
export type AdminUser = z.infer<typeof AdminUser>

// ───── admin 登录 ─────

export const AdminLoginRequest = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(1),
})
export type AdminLoginRequest = z.infer<typeof AdminLoginRequest>

export const AdminLoginResponse = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  admin: AdminUser,
})
export type AdminLoginResponse = z.infer<typeof AdminLoginResponse>

// ───── admin refresh token ─────

export const AdminRefreshRequest = z.object({
  refreshToken: z.string(),
})
export type AdminRefreshRequest = z.infer<typeof AdminRefreshRequest>

export const AdminRefreshResponse = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})
export type AdminRefreshResponse = z.infer<typeof AdminRefreshResponse>

// ───── admin 退出登录 ─────

export const AdminLogoutRequest = z.object({
  refreshToken: z.string(),
})
export type AdminLogoutRequest = z.infer<typeof AdminLogoutRequest>

// ───── 工厂状态 ─────

export const TenantStatus = z.enum(['trial', 'active', 'expired', 'disabled'])
export type TenantStatus = z.infer<typeof TenantStatus>

// ───── 工厂列表行(精简,列表用) ─────

export const AdminTenantRow = z.object({
  id: TenantId,
  name: z.string(),
  contactName: z.string(),
  contactPhone: z.string(),
  region: z.string().nullable(),
  status: TenantStatus,
  invitedBy: z.enum(['company', 'referral']),
  referralCode: z.string(),
  createdAt: z.string().datetime(),
})
export type AdminTenantRow = z.infer<typeof AdminTenantRow>

// ───── 工厂详情(完整,详情页用) ─────

export const AdminTenantDetail = z.object({
  id: TenantId,
  name: z.string(),
  contactName: z.string(),
  contactPhone: z.string(),
  region: z.string().nullable(),
  exportCategory: z.string().nullable(),
  licenseNo: z.string().nullable(),
  invoiceEmail: z.string().nullable(),
  referralCode: z.string(),
  referredByTenantId: TenantId.nullable(),
  invitedBy: z.enum(['company', 'referral']),
  status: TenantStatus,
  // v0.6.0:trialEndsAt/subscriptionEndsAt 合并为 expiresAt + firstSubscribedAt
  expiresAt: z.string().datetime(),
  firstSubscribedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type AdminTenantDetail = z.infer<typeof AdminTenantDetail>

// ───── GET /admin/tenants 列表查询 ─────

export const AdminListTenantsQuery = PaginationQuery.extend({
  search: z.string().optional(),
  status: TenantStatus.optional(),
})
export type AdminListTenantsQuery = z.infer<typeof AdminListTenantsQuery>

export const AdminListTenantsResponse = PaginationResponse(AdminTenantRow)
export type AdminListTenantsResponse = z.infer<typeof AdminListTenantsResponse>

// ───── PATCH /admin/tenants/:id/status (admin 改状态) ─────

export const AdminUpdateTenantStatusRequest = z.object({
  status: TenantStatus,
  // 改成 disabled 时建议写原因(用于 audit log,后续 phase 落地)
  reason: z.string().max(200).optional(),
})
export type AdminUpdateTenantStatusRequest = z.infer<
  typeof AdminUpdateTenantStatusRequest
>

// ───── POST /admin/tenants (admin 直接创建工厂,不走邀请码) ─────

export const AdminCreateTenantRequest = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式错误'),
  // admin 创建时直接设初始密码,工厂老板可以用"忘记密码"自助改
  password: z.string().min(6).max(64),
  factoryName: z.string().min(2).max(50),
  contactName: z.string().min(1).max(20).optional(),
  region: z.string().max(50).optional(),
  exportCategory: z.string().max(50).optional(),
})
export type AdminCreateTenantRequest = z.infer<typeof AdminCreateTenantRequest>
