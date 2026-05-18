import { z } from 'zod'
import { TenantId } from './common.js'

// ───── 公共片段 ─────

const phoneSchema = z.string().regex(/^1[3-9]\d{9}$/, '手机号格式错误')
const codeSchema = z.string().length(6).regex(/^\d{6}$/, '验证码必须为 6 位数字')
const passwordSchema = z
  .string()
  .min(8, '密码至少 8 位')
  .max(64, '密码最多 64 位')

// ───── 短信验证码 ─────

export const SendCodeRequest = z.object({
  phone: phoneSchema,
  // purpose 对齐 docs §6.3 sms_codes.purpose enum
  // - register       注册新工厂
  // - password_reset 找回密码
  // - change_phone   改绑手机号（暂未实现，预留）
  // 登录不发短信（密码 + JWT，避免每次开机付短信钱）
  purpose: z.enum(['register', 'password_reset', 'change_phone']),
})
export type SendCodeRequest = z.infer<typeof SendCodeRequest>

export const SendCodeResponse = z.object({
  cooldownSec: z.number().int().min(0),
})
export type SendCodeResponse = z.infer<typeof SendCodeResponse>

// ───── 登录态信息（注册/登录/刷新 token 都返回这个） ─────

const TenantSummary = z.object({
  id: TenantId,
  name: z.string(),
  phone: phoneSchema,
  trialEndsAt: z.string().datetime().nullable(),
  subscriptionEndsAt: z.string().datetime().nullable(),
})

const SessionTokens = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

// ───── 登录（密码登录，短信不再走登录路径） ─────

export const LoginRequest = z.object({
  phone: phoneSchema,
  // 登录只验非空 — 密码强度规则在注册/改密时校验（passwordSchema），
  // 登录端不复用强度校验以避免规则升级后老密码登不上来
  password: z.string().min(1),
})
export type LoginRequest = z.infer<typeof LoginRequest>

export const LoginResponse = SessionTokens.extend({
  tenant: TenantSummary,
})
export type LoginResponse = z.infer<typeof LoginResponse>

// ───── 注册 ─────

export const RegisterRequest = z.object({
  phone: phoneSchema,
  smsCode: codeSchema,
  password: passwordSchema,
  factoryName: z.string().min(2).max(50),
  // 可选：联系人姓名（不传则后端用 factoryName 截断作占位）
  contactName: z.string().min(1).max(20).optional(),
  invitationCode: z.string().min(6).max(12).optional(),
})
export type RegisterRequest = z.infer<typeof RegisterRequest>

export const RegisterResponse = LoginResponse // 注册成功直接登录态
export type RegisterResponse = z.infer<typeof RegisterResponse>

// ───── 找回密码 ─────

export const ResetPasswordRequest = z.object({
  phone: phoneSchema,
  smsCode: codeSchema,
  newPassword: passwordSchema,
})
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequest>

// ───── 改密码（已登录） ─────

export const ChangePasswordRequest = z.object({
  oldPassword: z.string().min(1),
  newPassword: passwordSchema,
})
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequest>

// ───── 刷新 token ─────

export const RefreshTokenRequest = z.object({
  refreshToken: z.string(),
})
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequest>

export const RefreshTokenResponse = SessionTokens
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponse>

// ───── 退出登录 ─────

export const LogoutRequest = z.object({
  refreshToken: z.string(),
})
export type LogoutRequest = z.infer<typeof LogoutRequest>
