import { z } from 'zod'
import { TenantId } from './common'

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
  scene: z.enum(['register', 'login', 'reset_password']),
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
  token: z.string(),
  refreshToken: z.string(),
})

// ───── 登录 ─────

export const LoginRequest = z.object({
  phone: phoneSchema,
  code: codeSchema,
})
export type LoginRequest = z.infer<typeof LoginRequest>

export const LoginResponse = SessionTokens.extend({
  tenant: TenantSummary,
})
export type LoginResponse = z.infer<typeof LoginResponse>

// ───── 注册 ─────

export const RegisterRequest = z.object({
  phone: phoneSchema,
  code: codeSchema,
  password: passwordSchema,
  factoryName: z.string().min(2).max(50),
  invitationCode: z.string().min(6).max(12).optional(), // 渠道 A 邀请码 / 渠道 B 推荐码
})
export type RegisterRequest = z.infer<typeof RegisterRequest>

export const RegisterResponse = LoginResponse // 注册成功直接登录态
export type RegisterResponse = z.infer<typeof RegisterResponse>

// ───── 找回密码 ─────

export const ResetPasswordRequest = z.object({
  phone: phoneSchema,
  code: codeSchema,
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
