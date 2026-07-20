---
title: "API 可观测性最小集：日志、指标和链路追踪分别回答什么"
slug: "api-observability-baseline"
category: "troubleshooting"
status: "published"
author: "APIKnow 编辑部"
published_at: "2026-07-10"
updated_at: "2026-07-10"
reading_time: "12 分钟"
level: "实战"
tags:
  - "日志"
  - "指标"
  - "Tracing"
  - "SLO"
sources_checked_at: "2026-07-10"
commercial_disclosure: "无"
dek: "不追求一次性搭建复杂平台，先用最小信号集回答：哪里错了、影响多大、从什么时候开始、是否与一次发布有关。"
sources:
  - "OpenTelemetry documentation"
  - "Google SRE Workbook: Monitoring"
---

## 1. 三类信号不要互相替代

指标适合发现趋势和告警，日志适合查看离散事件的上下文，链路追踪适合解释一次请求跨服务的路径与耗时。只保留日志会让聚合分析昂贵；只有指标又无法还原个别失败；没有追踪则很难定位多服务链路的尾延迟。


## 2. 从 RED 指标开始

再补充饱和度：连接池、线程池、队列、并发和配额使用量。错误率与延迟必须按版本、区域和依赖拆分，才能与变更关联。


- Rate：按接口和状态统计请求速率。
- Errors：区分调用方错误、服务端错误、限流与超时。
- Duration：观察 P50、P95、P99，不只看平均值。

## 3. 可观测性不能成为数据泄露通道

默认不记录 Authorization、Cookie、完整请求正文和个人数据。为日志定义字段白名单、保存期限和访问权限。调试采样需要审批和自动过期，不能把临时开关变成永久风险。


> 注意：请求 ID 用于关联，不应包含用户身份、邮箱或其他业务含义。

## 参考资料

1. OpenTelemetry documentation
2. Google SRE Workbook: Monitoring
