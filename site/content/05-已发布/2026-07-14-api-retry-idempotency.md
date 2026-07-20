---
title: "重试为什么会造成重复扣费：幂等键、退避与错误分类"
slug: "api-retry-idempotency"
category: "practice"
status: "published"
author: "APIKnow 编辑部"
published_at: "2026-07-14"
updated_at: "2026-07-14"
reading_time: "15 分钟"
level: "实战"
tags:
  - "重试"
  - "幂等"
  - "退避"
  - "429"
  - "可靠性"
sources_checked_at: "2026-07-14"
commercial_disclosure: "无"
dek: "重试不是 catch 后再调用一次。本文从故障语义出发，说明哪些请求能重试、等待多久、怎样避免重复创建和请求风暴。"
sources:
  - "RFC 9110: Idempotent Methods"
  - "AWS Architecture Blog: Exponential Backoff and Jitter"
---

## 1. 先判断失败是不是暂时的

连接重置、部分 5xx 和明确的限流响应可能是暂时故障；参数错误、鉴权失败和权限不足通常不会因为等待而恢复。盲目重试 4xx 只会增加压力并延迟真正的错误处理。


- 网络错误：结合请求是否可能已送达，判断写操作风险。
- 429：优先遵守 Retry-After 或服务端退避提示。
- 5xx：设置最大次数、总时间预算和熔断阈值。
- 400/401/403：修正请求或权限，不自动重试。

## 2. 指数退避需要随机抖动

大量客户端在相同时间失败，如果都按固定间隔重试，会在下一秒再次形成流量尖峰。指数退避拉开尝试间隔，随机抖动进一步打散客户端。重试还必须受总时间预算限制，不能无限延长用户请求。


```javascript
const base = 250;
const cap = 8000;
const delay = Math.random() * Math.min(cap, base * 2 ** attempt);
await new Promise(resolve => setTimeout(resolve, delay));
```

## 3. 用业务唯一性保证幂等

客户端为一次业务操作生成稳定的幂等键，服务端把键、请求摘要与最终结果持久化。相同键和相同请求再次到达时返回原结果；相同键却携带不同请求时应拒绝。数据库唯一约束是最后一道防线。


> 注意：幂等键的保存时间必须覆盖客户端可能重试的窗口。只在进程内缓存，无法跨实例或跨重启保证幂等。

## 参考资料

1. RFC 9110: Idempotent Methods
2. AWS Architecture Blog: Exponential Backoff and Jitter
