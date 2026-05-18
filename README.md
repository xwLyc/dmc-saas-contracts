# @dmc/contracts

DMC SaaS API 契约 — 三端共享的 Zod schema 单一来源。

被三个 repo 消费：
- `dmc-saas-backend` — 路由 schema validate + 类型推导
- `dmc-scan-system` — 桌面端 fetch 请求/响应 parse
- `dmc-saas-admin` — 后管 fetch 请求/响应 parse

> ⚠ 修改 schema 前先看 [`CLAUDE.md`](./CLAUDE.md) — 命名约定、版本号规则、发版流程、消费端装包约定。

## 快速开始

```bash
npm install     # 装依赖 + prepare 自动 build
npm run typecheck
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

**默认（commit 进 git 的版本）**：
```json
"@dmc/contracts": "git+https://github.com/xwLyc/dmc-saas-contracts.git#vX.Y.Z"
```
锁版本，CI / 别人 clone 都能装。`npm install` 时本包的 `prepare` 脚本会自动 `npm run build` 生成 `dist/`。

**本机临时联调** → `npm link`（不动 package.json）：
```bash
cd dmc-saas-contracts && npm link
cd ../dmc-saas-backend && npm link @dmc/contracts
# 改完还原: cd ../dmc-saas-backend && npm unlink @dmc/contracts && npm install
```

> 最新可用 tag 见 [Releases](https://github.com/xwLyc/dmc-saas-contracts/tags)。
