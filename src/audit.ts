import { z } from 'zod'
import { PaginationQuery, PaginationResponse } from './common.js'

/**
 * Admin 操作审计日志 schema(v0.7.0)。
 *
 * 用途:记录我公司管理员对工厂/系统的所有变更动作,事后追溯"谁在什么时候改了什么"。
 *
 * 写入时机(backend services/admin.ts):
 *   - tenant.create               admin 直接建工厂
 *   - tenant.status_change        admin 改工厂状态(trial / active / disabled)
 *   - admin.login                 (可选)admin 登录
 *
 * 审计记录是 append-only,前端只能查询不能修改/删除。
 */

// 当前定义的 action 集合(string union 方便后续扩展不破坏 contracts)
export const AuditAction = z.enum([
  'tenant.create',
  'tenant.status_change',
])
export type AuditAction = z.infer<typeof AuditAction>

export const AuditTargetType = z.enum(['tenant', 'admin'])
export type AuditTargetType = z.infer<typeof AuditTargetType>

// ───── 单条审计记录 ─────

export const AdminAuditLog = z.object({
  id: z.string().uuid(),
  // 谁:adminId + snapshot username(admin 改名后仍能看到当时是哪个用户名)
  adminId: z.string().uuid(),
  adminUsername: z.string(),
  // 操作:action + 目标
  action: AuditAction,
  targetType: AuditTargetType,
  targetId: z.string().uuid(),
  // snapshot:目标名字(如 tenant.name),冗余存避免 join + 删了仍可读
  targetName: z.string().nullable(),
  // 操作详情(JSON):before/after/reason 等
  details: z.unknown(),
  // 上下文
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string().datetime(),
})
export type AdminAuditLog = z.infer<typeof AdminAuditLog>

// ───── GET /admin/audit-logs ─────

export const AdminListAuditLogsQuery = PaginationQuery.extend({
  // 按 admin 筛
  adminId: z.string().uuid().optional(),
  // 按 target 筛(查某个工厂的所有操作记录)
  targetType: AuditTargetType.optional(),
  targetId: z.string().uuid().optional(),
  // 按 action 筛
  action: AuditAction.optional(),
})
export type AdminListAuditLogsQuery = z.infer<typeof AdminListAuditLogsQuery>

export const AdminListAuditLogsResponse = PaginationResponse(AdminAuditLog)
export type AdminListAuditLogsResponse = z.infer<typeof AdminListAuditLogsResponse>
