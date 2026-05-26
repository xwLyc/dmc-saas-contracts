/**
 * 订单与支付 schema —— 03-支付方案.md v1.0 落地。
 *
 * 设计要点:
 *   - 金额用 fen (int) 避免浮点精度
 *   - out_trade_no = order.id (UUID),不另生成
 *   - 支持微信(MVP)+ 支付宝(后期扩展,channel 字段已预留)
 *   - 状态机 pending → paid → expired | cancelled | refunded
 */

import { z } from 'zod'
import { OrderId, TenantId, PaginationQuery, PaginationResponse } from './common.js'
import { PlanId } from './subscriptions.js'

// ───── 状态机 ─────

export const OrderStatus = z.enum(['pending', 'paid', 'expired', 'cancelled', 'refunded'])
export type OrderStatus = z.infer<typeof OrderStatus>

// ───── 支付渠道 ─────
// MVP 只做 wechat;支付宝后期补,数据模型预留

export const PaymentChannel = z.enum(['wechat', 'alipay'])
export type PaymentChannel = z.infer<typeof PaymentChannel>

// ───── 工厂自看:Order ─────

export const Order = z.object({
  id: OrderId,
  tenantId: TenantId,
  plan: PlanId,
  amountFen: z.number().int().nonnegative(),
  status: OrderStatus,
  channel: PaymentChannel,
  /** 工厂端轮询 / 渲染 QR 用;mock 模式返伪造 URL */
  codeUrl: z.string().nullable(),
  paidAt: z.string().datetime().nullable(),
  expiredAt: z.string().datetime().nullable(),
  cancelledAt: z.string().datetime().nullable(),
  refundedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
})
export type Order = z.infer<typeof Order>

// ───── POST /orders ─────

export const CreateOrderRequest = z.object({
  plan: PlanId,
  channel: PaymentChannel,
})
export type CreateOrderRequest = z.infer<typeof CreateOrderRequest>

export const CreateOrderResponse = z.object({
  orderId: OrderId,
  codeUrl: z.string(),
  /** 订单 24h 后自动过期,前端可用来显示倒计时 */
  expiresAt: z.string().datetime(),
})
export type CreateOrderResponse = z.infer<typeof CreateOrderResponse>

// ───── GET /orders/:id/status ─────
// 工厂端 polling 用,精简字段;详情走 Order

export const OrderStatusResponse = z.object({
  status: OrderStatus,
  paidAt: z.string().datetime().nullable(),
})
export type OrderStatusResponse = z.infer<typeof OrderStatusResponse>

// ───── GET /tenants/me/orders ─────

export const OrderListQuery = PaginationQuery.extend({
  status: OrderStatus.optional(),
})
export type OrderListQuery = z.infer<typeof OrderListQuery>

export const OrderListResponse = PaginationResponse(Order)
export type OrderListResponse = z.infer<typeof OrderListResponse>

// ───── Payment(回调成功留痕,工厂自看不暴露;admin 详情用) ─────

export const PaymentRow = z.object({
  id: z.string().uuid(),
  orderId: OrderId,
  channel: PaymentChannel,
  transactionId: z.string(),
  amountFen: z.number().int().nonnegative(),
  receivedAt: z.string().datetime(),
})
export type PaymentRow = z.infer<typeof PaymentRow>

// ───── Refund ─────

export const RefundStatus = z.enum(['pending', 'succeeded', 'failed'])
export type RefundStatus = z.infer<typeof RefundStatus>

export const RefundRow = z.object({
  id: z.string().uuid(),
  orderId: OrderId,
  amountFen: z.number().int().nonnegative(),
  status: RefundStatus,
  reason: z.string(),
  initiatedByAdmin: z.string(),
  refundTradeNo: z.string(),
  channelRefundId: z.string().nullable(),
  failReason: z.string().nullable(),
  createdAt: z.string().datetime(),
  succeededAt: z.string().datetime().nullable(),
  failedAt: z.string().datetime().nullable(),
})
export type RefundRow = z.infer<typeof RefundRow>

// ───── Admin: GET /admin/orders ─────

export const AdminOrderRow = z.object({
  id: OrderId,
  tenantId: TenantId,
  tenantName: z.string(),
  plan: PlanId,
  amountFen: z.number().int().nonnegative(),
  status: OrderStatus,
  channel: PaymentChannel,
  /** 微信流水号(paid 后才有) */
  transactionId: z.string().nullable(),
  paidAt: z.string().datetime().nullable(),
  refundedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
})
export type AdminOrderRow = z.infer<typeof AdminOrderRow>

export const AdminListOrdersQuery = PaginationQuery.extend({
  search: z.string().optional(),     // 模糊匹配 tenant.name
  status: OrderStatus.optional(),
  channel: PaymentChannel.optional(),
  tenantId: TenantId.optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})
export type AdminListOrdersQuery = z.infer<typeof AdminListOrdersQuery>

export const AdminListOrdersResponse = PaginationResponse(AdminOrderRow)
export type AdminListOrdersResponse = z.infer<typeof AdminListOrdersResponse>

// ───── Admin: GET /admin/orders/:id (含 payments + refunds) ─────

export const AdminOrderDetail = AdminOrderRow.extend({
  payments: z.array(PaymentRow),
  refunds: z.array(RefundRow),
  /** 工厂额外信息,详情侧栏展示 */
  tenantContactPhone: z.string(),
})
export type AdminOrderDetail = z.infer<typeof AdminOrderDetail>

// ───── Admin: POST /admin/orders/:id/refund ─────

export const AdminCreateRefundRequest = z.object({
  /** 不传默认全退 */
  amountFen: z.number().int().positive().optional(),
  reason: z.string().min(1).max(500),
})
export type AdminCreateRefundRequest = z.infer<typeof AdminCreateRefundRequest>

export const AdminCreateRefundResponse = z.object({
  refundId: z.string().uuid(),
  status: RefundStatus,
})
export type AdminCreateRefundResponse = z.infer<typeof AdminCreateRefundResponse>
