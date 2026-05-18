# DMC SaaS 契约 repo — Claude 指引

## 这个 repo 是什么

`@dmc/contracts` 是三端共享的 **HTTP API Zod schema 单一来源**：
- `dmc-saas-backend` — Fastify 路由用它做 validate + 类型推导
- `dmc-scan-system` — 桌面端 fetch 请求/响应用它 parse
- `dmc-saas-admin` — 后管 fetch 请求/响应用它 parse

**任何 API 变更必须从这里发起**。三端不许私自定义请求/响应 schema。

## 不允许

- ❌ 引入除 `zod` 之外的运行时依赖（保持包小）
- ❌ 把业务逻辑写进 schema（schema 只描述"线上 JSON 长什么样"）
- ❌ 把 DB 内部表结构（auth_sessions、sms_codes 等）放进来 — 本 repo 只描述 **HTTP 边界**
- ❌ breaking change 不 bump major
- ❌ 同一文件同时定义 schema 和 type 而不同名 — 必须同名，方便 import 一次双用

## 强约定

### 命名

Schema 名 = `<动作或实体><Request|Response>`。
- ✅ `LoginRequest`, `LoginResponse`, `TenantProfile`, `OrderListResponse`
- ❌ `loginReq`, `loginDto`, `LoginInputType`

同名 export schema 和 type：

```ts
export const LoginRequest = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/),
  code: z.string().length(6),
})
export type LoginRequest = z.infer<typeof LoginRequest>
```

消费端一次 import 就能同时拿到运行时校验器和编译时类型：

```ts
import { LoginRequest } from '@dmc/contracts'

function login(body: LoginRequest) {  // type
  return LoginRequest.parse(body)     // runtime
}
```

### 文件组织

按 API 域分，不按 HTTP 方法分：

| 文件 | 内容 |
|---|---|
| `src/auth.ts` | 登录 / 注册 / 找回密码 / 短信验证码 / 刷新 token |
| `src/tenants.ts` | 工厂租户 me / update |
| `src/subscriptions.ts` | 套餐 / 订阅状态 |
| `src/orders.ts` | 订单创建 / 列表 / 状态 |
| `src/referrals.ts` | 邀请码 / 返佣流水 |
| `src/common.ts` | 通用（分页 / 错误响应 / ID brand 等） |
| `src/index.ts` | 全部 re-export |

新增第 7 个域时，先开 issue / 在这里登记，再加文件。

### Cross-file import 必须带 `.js` 后缀

src/ 内部的相对 import 必须带 `.js` 后缀（不是 `.ts`，即使源文件是 .ts）：

```ts
// ✅ 正确
import { TenantId } from './common.js'
export * from './auth.js'

// ❌ 错误 — tsc 能编过，但 Node ESM 运行时报 ERR_MODULE_NOT_FOUND
import { TenantId } from './common'
export * from './auth'
```

**理由**：本包是 ESM（`"type": "module"`），Node ESM 解析器不会自动补扩展名。tsc + `moduleResolution: Bundler` 允许省略后缀（用于 bundler 场景），但消费端（backend/desktop/admin）用 native Node ESM 加载本包的 `dist/*.js`，必须看到完整路径才能 resolve。曾在 v0.1.0 因此报错。

### ID 类型用 branded type

```ts
export const TenantId = z.string().uuid().brand('TenantId')
export type TenantId = z.infer<typeof TenantId>
```

避免 `tenantId` 和 `orderId` 互传 — 编译期就报错。

## 版本号规则（严格 semver）

bump 标准按 **"对消费端的影响"** 判断，不按"改了多少代码"：

| bump | 触发场景 |
|---|---|
| patch (0.1.0 → 0.1.1) | 加可选字段 / 改 description / 补 doc / 内部重构 |
| minor (0.1.0 → 0.2.0) | 加必填字段 / 加新 schema / 加新文件 / 可选改必填 |
| major (0.1.0 → 1.0.0) | 删字段 / 重命名字段 / 改字段类型 / 删 schema / 改枚举值 |

`v0.x` 阶段允许 minor 包含 breaking（按 semver 早期惯例），到 `v1.0` 后严格执行。

## 发版流程

```bash
# 1. 改 schema
vim src/auth.ts

# 2. 本地校验
npm run typecheck

# 3. bump + tag（npm version 会自动 commit + tag）
npm version patch   # 或 minor / major

# 4. 推送（带 tag）
git push --follow-tags

# 5. 通知三端升级
cd ../dmc-saas-backend && npm update @dmc/contracts
cd ../dmc-scan-system  && npm update @dmc/contracts
cd ../dmc-saas-admin   && npm update @dmc/contracts

# 6. 三端 typecheck，TypeScript 会精确告诉你哪里跟不上
npm run typecheck
```

## 给 Claude 的 do/don't

- **修改 schema 前**：先确认这是 HTTP 边界的事，不是 DB 内部表的事
- **加新 schema**：放对域文件，同名 export schema + type
- **改字段**：先想这是 patch/minor/major 哪种，bump 错版本号会让消费端意外升级炸掉
- **不要**写 fetch 工具函数、不要写 axios 封装、不要写错误处理 — 那些是消费端的事
- **不要**在 schema 里依赖任何业务常量（除非该常量也在本 repo 定义并 export）
