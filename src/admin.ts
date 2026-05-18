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
  // 登录只验非空 — 密码强度规则在 seed 时由我公司把控,不在 schema 层强制
  password: z.string().min(1),
})
export type AdminLoginRequest = z.infer<typeof AdminLoginRequest>

export const AdminLoginResponse = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  admin: AdminUser,
})
export type AdminLoginResponse = z.infer<typeof AdminLoginResponse>

// ───── 工厂状态（admin 视角，等同 tenant.status） ─────

export const TenantStatus = z.enum(['trial', 'active', 'expired', 'disabled'])
export type TenantStatus = z.infer<typeof TenantStatus>

// ───── 工厂列表行（admin 视角的工厂概要） ─────
// docs §2.1 工厂列表字段精简版

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

// ───── GET /admin/tenants ─────
// 分页 + 模糊搜索(name/phone) + status 筛选

export const AdminListTenantsQuery = PaginationQuery.extend({
  // 搜索关键字（匹配工厂名 / 联系人 / 手机号 三字段任一）
  search: z.string().optional(),
  status: TenantStatus.optional(),
})
export type AdminListTenantsQuery = z.infer<typeof AdminListTenantsQuery>

export const AdminListTenantsResponse = PaginationResponse(AdminTenantRow)
export type AdminListTenantsResponse = z.infer<typeof AdminListTenantsResponse>
