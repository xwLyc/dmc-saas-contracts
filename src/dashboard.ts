import { z } from 'zod'
import { TenantId } from './common.js'

/**
 * Admin Dashboard 数据看板 schema(v0.12.0)。
 *
 * 一次性返回首屏所有数据(KPI + 月度趋势 + 渠道分布 + 转化漏斗 + 即将到期清单),
 * 避免 dashboard 加载时打多个 endpoint。
 *
 * 货币单位:**元**(数字,不是分),小数 2 位。
 * 月份格式:'YYYY-MM' 字符串(前端按需 format)。
 */

// ───── KPI 9 项(Tier 1)─────
// 时间相关字段:
//   *InRange / *ThisMonth → 受 AdminDashboardStatsQuery.from/to 控制
//   其余(累计 / 活跃 / 即将到期等)跟时间段无关,始终全量算

export const DashboardKpi = z.object({
  totalTenants: z.number().int().nonnegative(),            // 累计工厂数
  activeSubscriptions: z.number().int().nonnegative(),     // 活跃订阅(已订阅且未到期)
  trialCount: z.number().int().nonnegative(),              // 试用中(未订阅且未到期)
  expiringIn7Days: z.number().int().nonnegative(),         // 7 天内到期
  expiredCount: z.number().int().nonnegative(),            // 已到期
  newTenantsInRange: z.number().int().nonnegative(),       // 区间内新增工厂(默认本月)
  revenueInRange: z.number().nonnegative(),                // 区间内营收(元,默认本月)
  revenueTotal: z.number().nonnegative(),                  // 累计营收(元)
  totalRewardDays: z.number().int().nonnegative(),         // 累计推荐返佣天数
})
export type DashboardKpi = z.infer<typeof DashboardKpi>

// ───── Query —— GET /admin/dashboard/stats?from=&to= ─────
// 都 optional;不传默认 from=本月 1 日 / to=本月最后一天。
// 影响:KPI 的 *InRange + byMonth 趋势图区间窗口。
// 其他 KPI 时间无关,不受影响。

export const AdminDashboardStatsQuery = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})
export type AdminDashboardStatsQuery = z.infer<typeof AdminDashboardStatsQuery>

// ───── 月度趋势(Tier 2)─────

export const DashboardMonthlyPoint = z.object({
  month: z.string(),       // 'YYYY-MM'
  value: z.number(),
})
export type DashboardMonthlyPoint = z.infer<typeof DashboardMonthlyPoint>

// ───── 渠道分布(Tier 3a)─────

export const DashboardChannelDistribution = z.object({
  company: z.number().int().nonnegative(),
  referral: z.number().int().nonnegative(),
})
export type DashboardChannelDistribution = z.infer<typeof DashboardChannelDistribution>

// ───── 转化漏斗(Tier 3b)─────
// 3 层:总注册 → 曾订阅 → 当前活跃订阅

export const DashboardConversionFunnel = z.object({
  totalRegistered: z.number().int().nonnegative(),
  everSubscribed: z.number().int().nonnegative(),
  activeSubscribed: z.number().int().nonnegative(),
})
export type DashboardConversionFunnel = z.infer<typeof DashboardConversionFunnel>

// ───── 套餐分布(Tier 3c)─────

export const DashboardPlanDistribution = z.object({
  monthly: z.number().int().nonnegative(),
  yearly: z.number().int().nonnegative(),
})
export type DashboardPlanDistribution = z.infer<typeof DashboardPlanDistribution>

// ───── 即将到期清单(Tier 4)─────

export const DashboardExpiringTenant = z.object({
  id: TenantId,
  name: z.string(),
  contactName: z.string(),
  contactPhone: z.string(),
  expiresAt: z.string().datetime(),
  daysLeft: z.number().int(),   // 距到期天数(可负数,表示已过期 X 天)
})
export type DashboardExpiringTenant = z.infer<typeof DashboardExpiringTenant>

// ───── 总响应 ─────

export const AdminDashboardStats = z.object({
  kpi: DashboardKpi,
  // 按 from/to 月份升序;不传 from/to 时返近 12 个月
  revenueByMonth: z.array(DashboardMonthlyPoint),
  newTenantsByMonth: z.array(DashboardMonthlyPoint),
  channelDistribution: DashboardChannelDistribution,
  conversionFunnel: DashboardConversionFunnel,
  planDistribution: DashboardPlanDistribution,
  // 7 天内到期 + 已到期 30 天内,按 expiresAt 升序
  expiringList: z.array(DashboardExpiringTenant),
})
export type AdminDashboardStats = z.infer<typeof AdminDashboardStats>
