import { z } from 'zod'
import { TenantId, PaginationQuery, PaginationResponse } from './common.js'

/**
 * Admin 操作审计日志 schema(v0.10.0 起严格 admin-only)。
 *
 * 用途:记录我公司管理员对工厂/系统的所有变更动作,事后追溯"谁在什么时候改了什么"。
 * 工厂自己的操作日志在独立的 TenantActivityLog(给桌面端工厂自己看),
 * 不混到 admin audit 里。
 *
 * 写入时机(backend services/admin.ts):
 *   - admin.login                 admin 登录
 *   - tenant.create               admin 直接建工厂
 *   - tenant.status_change        admin 改工厂状态
 *
 * 审计记录是 append-only,前端只能查询不能修改/删除。
 */

export const AuditAction = z.enum([
  'admin.login',
  'tenant.create',
  'tenant.status_change',
])
export type AuditAction = z.infer<typeof AuditAction>

export const AuditTargetType = z.enum(['tenant', 'admin'])
export type AuditTargetType = z.infer<typeof AuditTargetType>

export const AdminAuditLog = z.object({
  id: z.string().uuid(),
  // admin 触发者:adminId + snapshot username
  adminId: z.string().uuid(),
  adminUsername: z.string(),
  action: AuditAction,
  targetType: AuditTargetType,
  targetId: z.string().uuid(),
  targetName: z.string().nullable(),
  details: z.unknown(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string().datetime(),
})
export type AdminAuditLog = z.infer<typeof AdminAuditLog>

// ───── GET /admin/audit-logs ─────

export const AdminListAuditLogsQuery = PaginationQuery.extend({
  adminId: z.string().uuid().optional(),
  targetType: AuditTargetType.optional(),
  targetId: z.string().uuid().optional(),
  action: AuditAction.optional(),
})
export type AdminListAuditLogsQuery = z.infer<typeof AdminListAuditLogsQuery>

export const AdminListAuditLogsResponse = PaginationResponse(AdminAuditLog)
export type AdminListAuditLogsResponse = z.infer<typeof AdminListAuditLogsResponse>

// ─────────────────────────────────────────────────────────
// TenantActivityLog —— 工厂自己的操作历史(给桌面端工厂看)
// ─────────────────────────────────────────────────────────
/**
 * 写入时机(backend):
 *   - password_change   tenant 改密码(POST /tenants/me/password 成功后)
 *   - profile_update    tenant 改资料(PATCH /tenants/me)
 *   - subscribe         tenant 订阅(POST /tenants/me/subscribe)
 *
 * 不记录(太频繁/无意义):
 *   - tenant.login / logout / token refresh / 普通 GET
 *
 * 查询入口:桌面端 GET /tenants/me/activity(只能看自己的)。
 * admin 端不查这个表(admin 想看 tenant 历史可走"工厂详情→活动" tab,
 * 但目前 admin UI 不展示——保持职责分离)。
 */

export const TenantActivityAction = z.enum([
  'password_change',
  'profile_update',
  'subscribe',
])
export type TenantActivityAction = z.infer<typeof TenantActivityAction>

export const TenantActivityLog = z.object({
  id: z.string().uuid(),
  tenantId: TenantId,
  action: TenantActivityAction,
  details: z.unknown(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string().datetime(),
})
export type TenantActivityLog = z.infer<typeof TenantActivityLog>

// ───── GET /tenants/me/activity ─────

export const ListTenantActivityQuery = PaginationQuery.extend({
  action: TenantActivityAction.optional(),
})
export type ListTenantActivityQuery = z.infer<typeof ListTenantActivityQuery>

export const ListTenantActivityResponse = PaginationResponse(TenantActivityLog)
export type ListTenantActivityResponse = z.infer<typeof ListTenantActivityResponse>
