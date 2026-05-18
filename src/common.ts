import { z } from 'zod'

// ───── Branded ID ─────
// 用 brand 避免 tenantId / orderId 互传 — 编译期就报错

export const TenantId = z.string().uuid().brand('TenantId')
export type TenantId = z.infer<typeof TenantId>

export const OrderId = z.string().uuid().brand('OrderId')
export type OrderId = z.infer<typeof OrderId>

export const InvitationId = z.string().uuid().brand('InvitationId')
export type InvitationId = z.infer<typeof InvitationId>

// ───── 分页 ─────

export const PaginationQuery = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
})
export type PaginationQuery = z.infer<typeof PaginationQuery>

export function PaginationResponse<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item),
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
  })
}

// ───── 错误响应 ─────

export const ApiError = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
})
export type ApiError = z.infer<typeof ApiError>
