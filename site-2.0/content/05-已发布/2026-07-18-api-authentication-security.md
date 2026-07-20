---
title: "API 鉴权不是把 Key 放进请求头：密钥、签名与最小权限设计"
slug: "api-authentication-security"
category: "fundamentals"
status: "published"
author: "APIKnow 编辑部"
published_at: "2026-07-18"
updated_at: "2026-07-19"
reading_time: "16 分钟"
level: "基础进阶"
tags:
  - "鉴权"
  - "API Key"
  - "OAuth"
  - "签名"
  - "安全"
sources_checked_at: "2026-07-18"
commercial_disclosure: "无"
dek: "从静态密钥到短期令牌与请求签名，比较不同鉴权方式的风险边界，并给出开发、测试、生产环境的密钥治理清单。"
sources:
  - "OWASP API Security Top 10"
  - "OAuth 2.0 Security Best Current Practice"
  - "NIST guidance on secrets management"
---

## 1. 先讨论密钥会在哪里泄露

鉴权方案的起点不是选择一个流行协议，而是画出凭证的生命周期：谁创建、在哪里保存、通过什么渠道分发、哪些服务能读取、何时轮换、怎样吊销。浏览器前端、移动端包体、公开代码仓库、CI 日志和错误上报都是常见泄露位置。

静态 API Key 适合简单的服务到服务调用，但它通常同时承担身份和权限，泄露后的影响面取决于 Key 的权限与有效期。越难轮换、权限越大、有效期越长，风险越高。


- 不要把长期 Key 放在浏览器代码或移动端包体。
- 开发、测试、生产使用不同凭证与配额。
- 默认最小权限，并限制可调用的模型、接口、来源网络和预算。

## 2. API Key、短期令牌和请求签名怎么选

API Key 简单，但缺少用户级授权语义；短期令牌适合需要委托授权和明确权限范围的场景；请求签名把方法、路径、时间戳和正文摘要绑定在一起，能降低请求被篡改或重放的风险，但实现复杂度更高。

对外开放平台常常组合使用：客户端先通过身份流程取得短期令牌，关键写操作再配合时间戳、随机数或幂等键。不要自创加密算法，优先使用经过验证的协议与库。


## 3. 密钥管理的工程底线

生产密钥应进入专用密钥管理系统或受控的部署环境变量，而不是配置文件。应用只在运行时读取需要的秘密，日志和异常信息必须经过过滤。轮换流程要能在新旧密钥短暂并存时平滑切换。


- 记录密钥归属、用途、权限、创建时间和最后使用时间。
- 为异常调用量、陌生来源和预算突增设置告警。
- 泄露响应要包含吊销、替换、审计、影响评估和复盘。

> 注意：任何在线“Key 检测”都会扩大凭证暴露面。更安全的默认方式，是让用户在自己的设备执行最小化测试请求。

## 参考资料

1. OWASP API Security Top 10
2. OAuth 2.0 Security Best Current Practice
3. NIST guidance on secrets management
