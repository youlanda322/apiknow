---
title: "流式 API 的正确打开方式：SSE、断线恢复与背压"
slug: "streaming-sse-guide"
category: "practice"
status: "published"
author: "APIKnow 编辑部"
published_at: "2026-07-12"
updated_at: "2026-07-13"
reading_time: "13 分钟"
level: "实战"
tags:
  - "SSE"
  - "流式输出"
  - "代理"
  - "背压"
sources_checked_at: "2026-07-12"
commercial_disclosure: "无"
dek: "从协议帧、代理缓冲到客户端取消，梳理流式输出在本地可用、上线后却卡顿的常见原因。"
sources:
  - "WHATWG HTML: Server-sent events"
  - "MDN: Using server-sent events"
---

## 1. SSE 不是把 JSON 切成很多段

SSE 使用文本事件流，每个事件由字段行组成并以空行结束。客户端必须按事件边界解析，不能假设一次网络读取就是一个完整 JSON。UTF-8 多字节字符也可能跨数据块。


```text
event: message
id: 42
data: {"delta":"hello"}


```

## 2. 首包慢可能是代理在缓冲

反向代理、压缩中间件和平台网关可能等待积累更多数据后再发送，导致服务端明明持续写入，浏览器却长时间看不到内容。需要检查响应类型、禁用不适合的缓冲，并定期发送心跳避免空闲连接被回收。


## 3. 把连接生命周期设计完整

浏览器的消费速度可能低于服务端生产速度。服务端要尊重写入背压，避免无界缓存；客户端也要限制渲染频率，避免每个 Token 都触发昂贵的界面更新。


- 定义完成、错误、取消和超时事件。
- 客户端断开后尽快取消下游生成任务。
- 记录首事件时间、完成时间和中断位置。
- 对无法恢复的生成流，不要伪装成自动续传。

## 参考资料

1. WHATWG HTML: Server-sent events
2. MDN: Using server-sent events
