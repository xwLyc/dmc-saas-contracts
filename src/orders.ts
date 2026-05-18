import { z } from 'zod'
import { OrderId, TenantId, PaginationQuery, PaginationResponse } from './common'
import { PlanId } from './subscriptions'

// ───── 订单状态机 ─────

export const OrderStatus = z.enum(['pending', 'approved', 'rejected', 'cancelled'])
export type OrderStatus = z.infer<typeof OrderStatus>

// ───── 订单实体 ─────

export const Order = z.object({
  id: OrderId,
  tenantId: TenantId,
  plan: PlanId,
  amountYuan: z.number().nonnegative(),
  status: OrderStatus,
  createdAt: z.string().datetime(),
  approvedAt: z.string().datetime().nullable(),
  approvedBy: z.string().nullable(), // admin user id
})
export type Order = z.infer<typeof Order>

// ───── POST /orders ─────

export const CreateOrderRequest = z.object({
  plan: PlanId,
})
export type CreateOrderRequest = z.infer<typeof CreateOrderRequest>

export const CreateOrderResponse = z.object({
  order: Order,
  payQrCodeUrl: z.string().url(), // 微信个人收款码图片地址
})
export type CreateOrderResponse = z.infer<typeof CreateOrderResponse>

// ───── GET /orders ─────

export const OrderListQuery = PaginationQuery.extend({
  status: OrderStatus.optional(),
})
export type OrderListQuery = z.infer<typeof OrderListQuery>

export const OrderListResponse = PaginationResponse(Order)
export type OrderListResponse = z.infer<typeof OrderListResponse>
