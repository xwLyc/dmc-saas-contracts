# @dmc/contracts

DMC SaaS API 契约 — 三端共享的 Zod schema 单一来源。

被三个 repo 消费：
- `dmc-saas-backend` — 路由 schema validate + 类型推导
- `dmc-scan-system` — 桌面端 fetch 请求/响应 parse
- `dmc-saas-admin` — 后管 fetch 请求/响应 parse

> ⚠ 修改 schema 前先看 [`CLAUDE.md`](./CLAUDE.md) — 命名约定、版本号规则、发版流程。

## 快速开始

```bash
npm install
npm run typecheck
npm run build
```

## 文件组织

```
src/
  common.ts          通用(分页/错误/ID brand)
  auth.ts            登录/注册/短信/找回密码/改密
  tenants.ts         工厂租户 me/update
  subscriptions.ts   套餐/订阅状态
  orders.ts          订单
  referrals.ts       邀请码/返佣
  index.ts           re-export
```

## 在消费端怎么装

**本地开发期**（推荐，改了立刻三端可见）：
```json
"@dmc/contracts": "file:../dmc-saas-contracts"
```

**锁版本**：
```json
"@dmc/contracts": "git+ssh://git@github.com:lyc/dmc-saas-contracts.git#v0.1.0"
```
