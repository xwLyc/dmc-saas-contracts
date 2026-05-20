import { z } from 'zod'
import { PaginationQuery, PaginationResponse } from './common.js'

/**
 * 统一审计日志 schema(v0.9.0 起 actor 模型,替代 v0.7.0 admin-only)。
 *
 * 用途:记录"谁(admin 或 tenant 或 system)在什么时候改了什么"。
 *
 * 写入时机:
 *   admin 操作(backend services/admin.ts):
 *     - admin.login                 admin 登录
 *     - tenant.create               admin 直接建工厂
 *     - tenant.status_change        admin 改工厂状态
 *   tenant 操作(backend services/tenant.ts / subscription.ts):
 *     - tenant.password_change      工厂自己改密码
 *     - tenant.profile_update       工厂自己改资料(PATCH /tenants/me)
 *     - tenant.subscribe            工厂订阅
 *   不记录(太频繁,会爆表):
 *     - tenant.login / tenant.logout / token refresh / 普通 GET
 *
 * 审计记录是 append-only,前端只能查询不能修改/删除。
 */

// actor 类型:谁触发了这次操作
export const AuditActorType = z.enum(['admin', 'tenant', 'system'])
export type AuditActorType = z.infer<typeof AuditActorType>

// action 集合(string enum,方便扩展;按 actor 归类便于阅读)
export const AuditAction = z.enum([
  // admin 操作
  'admin.login',
  'tenant.create',
  'tenant.status_change',
  // tenant 自己的操作
  'tenant.password_change',
  'tenant.profile_update',
  'tenant.subscribe',
])
export type AuditAction = z.infer<typeof AuditAction>

export const AuditTargetType = z.enum(['tenant', 'admin'])
export type AuditTargetType = z.infer<typeof AuditTargetType>

// ───── 单条审计记录 ─────

export const AuditLog = z.object({
  id: z.string().uuid(),
  // actor:谁触发的(admin / tenant / system)
  actorType: AuditActorType,
  actorId: z.string().uuid(),
  // snapshot:actor 显示名(admin.username 或 tenant.name),actor 改名后仍可读
  actorName: z.string(),
  // 操作:action + 目标
  action: AuditAction,
  targetType: AuditTargetType,
  targetId: z.string().uuid(),
  // snapshot:目标名(冗余存避免 join + 目标删了仍可读)
  targetName: z.string().nullable(),
  // 操作详情(JSON):before/after/reason 等
  details: z.unknown(),
  // 上下文
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string().datetime(),
})
export type AuditLog = z.infer<typeof AuditLog>

/** @deprecated v0.9.0 起改用 AuditLog,保留 alias 防止旧代码炸 */
export const AdminAuditLog = AuditLog
export type AdminAuditLog = AuditLog

// ───── GET /admin/audit-logs ─────

export const AdminListAuditLogsQuery = PaginationQuery.extend({
  // actor 筛
  actorType: AuditActorType.optional(),
  actorId: z.string().uuid().optional(),
  // target 筛(查某个工厂的所有操作记录)
  targetType: AuditTargetType.optional(),
  targetId: z.string().uuid().optional(),
  // action 筛
  action: AuditAction.optional(),
})
export type AdminListAuditLogsQuery = z.infer<typeof AdminListAuditLogsQuery>

export const AdminListAuditLogsResponse = PaginationResponse(AuditLog)
export type AdminListAuditLogsResponse = z.infer<typeof AdminListAuditLogsResponse>
