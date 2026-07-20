// 此文件由 scripts/build.js 自动生成，请勿手动编辑
// 源文件：site-2.0/content/05-已发布/*.md
// 最后构建：2026-07-20T19:43:42.861Z
// 文章数：10

const BLOG_CATEGORIES = [
  {
    "id": "fundamentals",
    "label": "API 基础"
  },
  {
    "id": "models",
    "label": "模型与接口"
  },
  {
    "id": "practice",
    "label": "实战开发"
  },
  {
    "id": "review",
    "label": "测评对比"
  },
  {
    "id": "troubleshooting",
    "label": "故障排查"
  },
  {
    "id": "industry",
    "label": "行业观察"
  }
];

const CONTENT_SERIES = [
  {
    "index": "01",
    "title": "API从零到生产",
    "category": "fundamentals",
    "description": "从HTTP基础到生产级API设计"
  },
  {
    "index": "02",
    "title": "大模型接口工程",
    "category": "models",
    "description": "LLM API集成与成本优化"
  },
  {
    "index": "03",
    "title": "可靠性与排障",
    "category": "troubleshooting",
    "description": "重试、幂等、限流与熔断"
  },
  {
    "index": "04",
    "title": "API选型与测评",
    "category": "review",
    "description": "实际测试多平台API的差异"
  }
];

const ARTICLES = [
  {
    "slug": "api-request-lifecycle",
    "category": "fundamentals",
    "title": "一次 API 请求到底经历了什么：从 DNS、TLS 到网关与业务处理",
    "dek": "把“发一个 HTTP 请求”拆成可观测、可定位、可优化的完整链路。理解每一层的失败方式，才能真正解释超时、偶发 502 和首包延迟。",
    "date": "2026-07-20",
    "updated": "2026-07-20",
    "readTime": "18 分钟",
    "level": "基础进阶",
    "author": "APIKnow 编辑部",
    "tags": [
      "HTTP",
      "DNS",
      "TLS",
      "网关",
      "可观测性"
    ],
    "featured": true,
    "points": [
      [
        "建立链路模型",
        "把客户端、网络、网关和应用拆开观察"
      ],
      [
        "读懂时间指标",
        "区分 DNS、连接、TLS、TTFB 与总耗时"
      ],
      [
        "形成排障顺序",
        "先证据后结论，避免凭感觉调超时"
      ]
    ],
    "bodyHtml": "<h2>1. 先建立一条可解释的请求链路</h2>\n<p>调用方看到的通常只有一个 URL 和一个响应码，但请求实际要穿过多个边界：域名解析、TCP 或 QUIC 建连、TLS 握手、边缘节点、负载均衡、API 网关、鉴权、限流、业务服务、缓存和下游依赖。任何一层都可能增加延迟或返回错误。</p>\n<p>排障的关键不是记住所有协议细节，而是为每一层保留能证明它是否正常的信号。客户端需要分阶段计时，网关需要请求 ID，应用需要结构化日志，下游调用需要独立超时。这样一次失败才不是孤立的“请求失败”，而是一条可以回放的证据链。</p>\n<ul>\n<li>客户端：请求构造、连接复用、超时、重试和取消。</li>\n<li>网络层：DNS、路由、丢包、握手和跨地域链路。</li>\n<li>入口层：CDN、WAF、负载均衡、API 网关与鉴权。</li>\n<li>应用层：业务处理、缓存、数据库、消息队列和第三方 API。</li>\n</ul>\n<h2>2. 总耗时不是一个指标，而是一组阶段时间</h2>\n<p>只记录总耗时会掩盖问题位置。DNS 时间异常通常指向解析器或域名配置；连接时间上升可能来自网络质量或连接池耗尽；TLS 时间异常要检查证书链、协议协商和是否复用会话；TTFB 高而下载时间正常，往往说明服务端处理或排队更慢。</p>\n<p>对于流式 API，还要单独记录首事件时间和流完成时间。首事件决定交互感受，完成时间决定吞吐与成本，两者不能互相替代。</p>\n<pre><code class=\"language-bash\">curl -sS -o /dev/null \\\n+  -w &#39;dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total}\\n&#39; \\\n+  https://api.example.com/health\n</code></pre>\n<blockquote>\n<p>注意：一次 curl 结果只能证明一次样本。至少结合不同时间、不同出口和服务端请求 ID，才能判断是持续问题还是偶发抖动。</p>\n</blockquote>\n<h2>3. 网关做了什么，以及它为什么经常被误判</h2>\n<p>API 网关通常承担路由、鉴权、限流、配额、请求变换和日志记录。网关返回 401 或 429 时，请求可能根本没有进入业务服务；网关返回 502 或 504，则要继续区分是无法连接上游、上游主动断开，还是网关等待超时。</p>\n<p>因此错误处理不能只看状态码。响应中的错误代码、请求 ID、重试提示和限流头字段，往往比状态码更接近根因。调用方应把这些字段写入结构化日志，但必须对令牌、Cookie 和请求正文中的敏感数据做脱敏。</p>\n<ul>\n<li>401：检查凭证格式、签名时间、受众和权限范围。</li>\n<li>403：凭证可能有效，但资源策略或网络策略不允许访问。</li>\n<li>429：读取服务端给出的等待时间；不要立即并发重试。</li>\n<li>502/504：关联上游耗时、连接错误和网关超时配置。</li>\n</ul>\n<h2>4. 超时、取消与重试必须一起设计</h2>\n<p>超时不是越长越稳。过长的超时会让失败请求占用连接、线程和并发配额，最终把局部故障放大成级联故障。更合理的做法是从用户端到下游逐层分配时间预算，越靠近下游，允许使用的时间越短。</p>\n<p>客户端取消后，服务端不一定会自动停止计算。对于成本较高的生成任务，应设计可取消的任务状态，或使用异步作业接口。重试前还要判断操作是否幂等，否则网络超时可能把一次创建变成两次扣费。</p>\n<pre><code class=\"language-javascript\">const controller = new AbortController();\nconst timer = setTimeout(() =&gt; controller.abort(), 8000);\n\ntry {\n  const response = await fetch(url, {\n    method: &#39;POST&#39;,\n    headers: { &#39;Idempotency-Key&#39;: requestId },\n    body: JSON.stringify(payload),\n    signal: controller.signal\n  });\n  if (!response.ok) throw new Error(`HTTP ${response.status}`);\n  return await response.json();\n} finally {\n  clearTimeout(timer);\n}\n</code></pre>\n<h2>5. 最小可观测性：让一次失败可以被复盘</h2>\n<p>最小记录集应包含：调用方生成的请求 ID、服务端返回的请求 ID、目标服务、接口名、阶段耗时、最终状态、重试次数、错误分类和时间戳。不要记录完整 API Key，也不要默认记录包含个人信息的正文。</p>\n<p>指标要看分位数而不是只看平均值。P50 描述典型请求，P95/P99 暴露尾部延迟；错误率还要按状态码、接口、区域和依赖拆分。没有这些维度，团队只能知道“今天变慢了”，却不知道哪里、何时、影响谁。</p>\n<h2>6. 生产环境检查清单</h2>\n<p>把下面的检查项放进接入评审，而不是等故障发生后补齐。</p>\n<ul>\n<li>是否分别设置连接、读取、总请求和下游超时？</li>\n<li>是否只对可重试错误重试，并使用指数退避与随机抖动？</li>\n<li>写操作是否有幂等键或业务唯一约束？</li>\n<li>日志是否包含请求 ID、阶段耗时和错误分类，同时完成敏感字段脱敏？</li>\n<li>是否监控 P50/P95/P99、错误率、限流率和并发使用量？</li>\n<li>是否有降级、熔断、缓存或异步队列来隔离依赖故障？</li>\n</ul>\n<h2>参考资料</h2>\n<ol>\n<li>RFC 9110: HTTP Semantics</li>\n<li>RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3</li>\n<li>OpenTelemetry: Trace and semantic convention documentation</li>\n</ol>\n",
    "sources": [
      "RFC 9110: HTTP Semantics",
      "RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3",
      "OpenTelemetry: Trace and semantic convention documentation"
    ]
  },
  {
    "slug": "api-request-lifecycle",
    "category": "fundamentals",
    "title": "一次 API 请求到底经历了什么：从 DNS、TLS 到网关与业务处理",
    "dek": "",
    "date": "2026-07-20",
    "updated": "2026-07-20",
    "readTime": "18 分钟",
    "level": "基础进阶",
    "author": "APIKnow 编辑部",
    "tags": [
      "HTTP",
      "DNS",
      "TLS",
      "网关",
      "可观测性"
    ],
    "featured": false,
    "points": null,
    "bodyHtml": "<h1>一次 API 请求到底经历了什么：从 DNS、TLS 到网关与业务处理</h1>\n<p>把“发一个 HTTP 请求”拆成可观测、可定位、可优化的完整链路。理解每一层的失败方式，才能真正解释超时、偶发 502 和首包延迟。</p>\n<h2>1. 先建立一条可解释的请求链路</h2>\n<p>调用方看到的通常只有一个 URL 和一个响应码，但请求实际要穿过多个边界：域名解析、TCP 或 QUIC 建连、TLS 握手、边缘节点、负载均衡、API 网关、鉴权、限流、业务服务、缓存和下游依赖。任何一层都可能增加延迟或返回错误。</p>\n<p>排障的关键不是记住所有协议细节，而是为每一层保留能证明它是否正常的信号。客户端需要分阶段计时，网关需要请求 ID，应用需要结构化日志，下游调用需要独立超时。</p>\n<h2>2. 总耗时不是一个指标</h2>\n<p>只记录总耗时会掩盖问题位置。DNS 时间、连接时间、TLS 时间、首字节时间和下载时间分别对应不同的问题方向。对于流式 API，还要单独记录首事件时间和流完成时间。</p>\n<pre><code class=\"language-bash\">curl -sS -o /dev/null \\\n  -w &#39;dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total}\\n&#39; \\\n  https://api.example.com/health\n</code></pre>\n<p>一次结果只能证明一次样本。至少结合不同时间、不同出口和服务端请求 ID，才能判断是持续问题还是偶发抖动。</p>\n<h2>3. 网关错误需要继续拆分</h2>\n<p>API 网关通常承担路由、鉴权、限流、配额和日志。401 或 429 可能表示请求没有进入业务服务；502 或 504 还要区分无法连接上游、上游主动断开和等待超时。</p>\n<h2>4. 超时、取消与重试必须一起设计</h2>\n<p>过长的超时会占用连接和并发配额。更合理的做法是逐层分配时间预算，并只对暂时性错误重试。写操作在重试前必须确认幂等，否则一次网络超时可能变成两次创建或两次扣费。</p>\n<h2>5. 最小可观测性</h2>\n<p>最小记录集包括调用方请求 ID、服务端请求 ID、接口名、阶段耗时、状态、重试次数、错误分类和时间戳。日志不应包含完整 API Key 或默认记录个人数据。</p>\n<h2>6. 生产检查清单</h2>\n<ul>\n<li>分别设置连接、读取、总请求和下游超时。</li>\n<li>只对可重试错误重试，并使用指数退避与随机抖动。</li>\n<li>写操作使用幂等键或业务唯一约束。</li>\n<li>记录请求 ID、阶段耗时和错误分类，并完成敏感字段脱敏。</li>\n<li>监控 P50/P95/P99、错误率、限流率和并发使用量。</li>\n</ul>\n<h2>参考资料</h2>\n<ol>\n<li>RFC 9110: HTTP Semantics。</li>\n<li>RFC 8446: TLS 1.3。</li>\n<li>OpenTelemetry trace 与语义约定文档。</li>\n</ol>\n",
    "sources": []
  },
  {
    "slug": "api-authentication-security",
    "category": "fundamentals",
    "title": "API 鉴权不是把 Key 放进请求头：密钥、签名与最小权限设计",
    "dek": "从静态密钥到短期令牌与请求签名，比较不同鉴权方式的风险边界，并给出开发、测试、生产环境的密钥治理清单。",
    "date": "2026-07-18",
    "updated": "2026-07-19",
    "readTime": "16 分钟",
    "level": "基础进阶",
    "author": "APIKnow 编辑部",
    "tags": [
      "鉴权",
      "API Key",
      "OAuth",
      "签名",
      "安全"
    ],
    "featured": false,
    "points": null,
    "bodyHtml": "<h2>1. 先讨论密钥会在哪里泄露</h2>\n<p>鉴权方案的起点不是选择一个流行协议，而是画出凭证的生命周期：谁创建、在哪里保存、通过什么渠道分发、哪些服务能读取、何时轮换、怎样吊销。浏览器前端、移动端包体、公开代码仓库、CI 日志和错误上报都是常见泄露位置。</p>\n<p>静态 API Key 适合简单的服务到服务调用，但它通常同时承担身份和权限，泄露后的影响面取决于 Key 的权限与有效期。越难轮换、权限越大、有效期越长，风险越高。</p>\n<ul>\n<li>不要把长期 Key 放在浏览器代码或移动端包体。</li>\n<li>开发、测试、生产使用不同凭证与配额。</li>\n<li>默认最小权限，并限制可调用的模型、接口、来源网络和预算。</li>\n</ul>\n<h2>2. API Key、短期令牌和请求签名怎么选</h2>\n<p>API Key 简单，但缺少用户级授权语义；短期令牌适合需要委托授权和明确权限范围的场景；请求签名把方法、路径、时间戳和正文摘要绑定在一起，能降低请求被篡改或重放的风险，但实现复杂度更高。</p>\n<p>对外开放平台常常组合使用：客户端先通过身份流程取得短期令牌，关键写操作再配合时间戳、随机数或幂等键。不要自创加密算法，优先使用经过验证的协议与库。</p>\n<h2>3. 密钥管理的工程底线</h2>\n<p>生产密钥应进入专用密钥管理系统或受控的部署环境变量，而不是配置文件。应用只在运行时读取需要的秘密，日志和异常信息必须经过过滤。轮换流程要能在新旧密钥短暂并存时平滑切换。</p>\n<ul>\n<li>记录密钥归属、用途、权限、创建时间和最后使用时间。</li>\n<li>为异常调用量、陌生来源和预算突增设置告警。</li>\n<li>泄露响应要包含吊销、替换、审计、影响评估和复盘。</li>\n</ul>\n<blockquote>\n<p>注意：任何在线“Key 检测”都会扩大凭证暴露面。更安全的默认方式，是让用户在自己的设备执行最小化测试请求。</p>\n</blockquote>\n<h2>参考资料</h2>\n<ol>\n<li>OWASP API Security Top 10</li>\n<li>OAuth 2.0 Security Best Current Practice</li>\n<li>NIST guidance on secrets management</li>\n</ol>\n",
    "sources": [
      "OWASP API Security Top 10",
      "OAuth 2.0 Security Best Current Practice",
      "NIST guidance on secrets management"
    ]
  },
  {
    "slug": "llm-api-cost-model",
    "category": "models",
    "title": "大模型 API 成本怎么估：Token 之外还有缓存、重试与长上下文",
    "dek": "建立可复用的成本模型，拆开输入、输出、缓存、工具调用、失败重试和峰值并发，避免只比较厂商首页的单价。",
    "date": "2026-07-16",
    "updated": "2026-07-18",
    "readTime": "14 分钟",
    "level": "实战",
    "author": "APIKnow 编辑部",
    "tags": [
      "LLM",
      "成本",
      "Token",
      "缓存",
      "预算"
    ],
    "featured": false,
    "points": null,
    "bodyHtml": "<h2>1. 从单次请求成本开始</h2>\n<p>最小模型是：输入 Token × 输入单价 + 输出 Token × 输出单价。但真实账单还可能包含缓存写入/读取、向量检索、工具调用、图像输入和批处理折扣。所有单价必须转换到同一币种、同一计费单位和同一时间快照后再比较。</p>\n<p>不要用平均输出长度替代分布。客服问答可能多数很短，但少数长回答会显著抬高 P95 成本；长上下文任务还可能因重复发送历史消息造成输入成本随轮次增长。</p>\n<pre><code class=\"language-text\">月成本 = 请求量 × 成功请求平均成本\n       + 可重试失败量 × 重试后平均成本\n       + 不可重试失败量 × 已消耗成本\n       + 相关存储、检索与网络费用\n</code></pre>\n<h2>2. 最容易漏掉的四类成本</h2>\n<p>成本比较必须和质量、延迟、成功率一起看。单价低但失败率高、输出不可用率高的方案，最终单位有效结果成本可能更高。</p>\n<ul>\n<li>失败重试：超时不代表服务端没有完成计算。</li>\n<li>上下文膨胀：每轮重复传输历史消息。</li>\n<li>质量返工：便宜模型需要更多次调用或人工校对。</li>\n<li>峰值容量：并发限制导致排队、超时或购买更高等级套餐。</li>\n</ul>\n<h2>3. 把预算控制写进系统</h2>\n<p>在请求前估算最大输入和最大输出，给任务设置预算上限；按产品、团队和环境分配凭证与配额；对单日费用、异常增长和重试率设置告警。对可缓存的稳定前缀，评估服务端缓存或应用侧摘要是否能降低重复输入。</p>\n<ul>\n<li>记录每个业务动作消耗的 Token 与最终是否成功。</li>\n<li>按模型、版本、场景和用户层级拆分成本。</li>\n<li>用小流量影子测试评估替代模型，不直接全量切换。</li>\n</ul>\n<h2>参考资料</h2>\n<ol>\n<li>各模型服务商公开计费文档（使用时应记录核验日期）</li>\n<li>内部请求日志与账单对账数据</li>\n</ol>\n",
    "sources": [
      "各模型服务商公开计费文档（使用时应记录核验日期）",
      "内部请求日志与账单对账数据"
    ]
  },
  {
    "slug": "api-retry-idempotency",
    "category": "practice",
    "title": "重试为什么会造成重复扣费：幂等键、退避与错误分类",
    "dek": "重试不是 catch 后再调用一次。本文从故障语义出发，说明哪些请求能重试、等待多久、怎样避免重复创建和请求风暴。",
    "date": "2026-07-14",
    "updated": "2026-07-14",
    "readTime": "15 分钟",
    "level": "实战",
    "author": "APIKnow 编辑部",
    "tags": [
      "重试",
      "幂等",
      "退避",
      "429",
      "可靠性"
    ],
    "featured": false,
    "points": null,
    "bodyHtml": "<h2>1. 先判断失败是不是暂时的</h2>\n<p>连接重置、部分 5xx 和明确的限流响应可能是暂时故障；参数错误、鉴权失败和权限不足通常不会因为等待而恢复。盲目重试 4xx 只会增加压力并延迟真正的错误处理。</p>\n<ul>\n<li>网络错误：结合请求是否可能已送达，判断写操作风险。</li>\n<li>429：优先遵守 Retry-After 或服务端退避提示。</li>\n<li>5xx：设置最大次数、总时间预算和熔断阈值。</li>\n<li>400/401/403：修正请求或权限，不自动重试。</li>\n</ul>\n<h2>2. 指数退避需要随机抖动</h2>\n<p>大量客户端在相同时间失败，如果都按固定间隔重试，会在下一秒再次形成流量尖峰。指数退避拉开尝试间隔，随机抖动进一步打散客户端。重试还必须受总时间预算限制，不能无限延长用户请求。</p>\n<pre><code class=\"language-javascript\">const base = 250;\nconst cap = 8000;\nconst delay = Math.random() * Math.min(cap, base * 2 ** attempt);\nawait new Promise(resolve =&gt; setTimeout(resolve, delay));\n</code></pre>\n<h2>3. 用业务唯一性保证幂等</h2>\n<p>客户端为一次业务操作生成稳定的幂等键，服务端把键、请求摘要与最终结果持久化。相同键和相同请求再次到达时返回原结果；相同键却携带不同请求时应拒绝。数据库唯一约束是最后一道防线。</p>\n<blockquote>\n<p>注意：幂等键的保存时间必须覆盖客户端可能重试的窗口。只在进程内缓存，无法跨实例或跨重启保证幂等。</p>\n</blockquote>\n<h2>参考资料</h2>\n<ol>\n<li>RFC 9110: Idempotent Methods</li>\n<li>AWS Architecture Blog: Exponential Backoff and Jitter</li>\n</ol>\n",
    "sources": [
      "RFC 9110: Idempotent Methods",
      "AWS Architecture Blog: Exponential Backoff and Jitter"
    ]
  },
  {
    "slug": "streaming-sse-guide",
    "category": "practice",
    "title": "流式 API 的正确打开方式：SSE、断线恢复与背压",
    "dek": "从协议帧、代理缓冲到客户端取消，梳理流式输出在本地可用、上线后却卡顿的常见原因。",
    "date": "2026-07-12",
    "updated": "2026-07-13",
    "readTime": "13 分钟",
    "level": "实战",
    "author": "APIKnow 编辑部",
    "tags": [
      "SSE",
      "流式输出",
      "代理",
      "背压"
    ],
    "featured": false,
    "points": null,
    "bodyHtml": "<h2>1. SSE 不是把 JSON 切成很多段</h2>\n<p>SSE 使用文本事件流，每个事件由字段行组成并以空行结束。客户端必须按事件边界解析，不能假设一次网络读取就是一个完整 JSON。UTF-8 多字节字符也可能跨数据块。</p>\n<pre><code class=\"language-text\">event: message\nid: 42\ndata: {&quot;delta&quot;:&quot;hello&quot;}\n\n</code></pre>\n<h2>2. 首包慢可能是代理在缓冲</h2>\n<p>反向代理、压缩中间件和平台网关可能等待积累更多数据后再发送，导致服务端明明持续写入，浏览器却长时间看不到内容。需要检查响应类型、禁用不适合的缓冲，并定期发送心跳避免空闲连接被回收。</p>\n<h2>3. 把连接生命周期设计完整</h2>\n<p>浏览器的消费速度可能低于服务端生产速度。服务端要尊重写入背压，避免无界缓存；客户端也要限制渲染频率，避免每个 Token 都触发昂贵的界面更新。</p>\n<ul>\n<li>定义完成、错误、取消和超时事件。</li>\n<li>客户端断开后尽快取消下游生成任务。</li>\n<li>记录首事件时间、完成时间和中断位置。</li>\n<li>对无法恢复的生成流，不要伪装成自动续传。</li>\n</ul>\n<h2>参考资料</h2>\n<ol>\n<li>WHATWG HTML: Server-sent events</li>\n<li>MDN: Using server-sent events</li>\n</ol>\n",
    "sources": [
      "WHATWG HTML: Server-sent events",
      "MDN: Using server-sent events"
    ]
  },
  {
    "slug": "api-observability-baseline",
    "category": "troubleshooting",
    "title": "API 可观测性最小集：日志、指标和链路追踪分别回答什么",
    "dek": "不追求一次性搭建复杂平台，先用最小信号集回答：哪里错了、影响多大、从什么时候开始、是否与一次发布有关。",
    "date": "2026-07-10",
    "updated": "2026-07-10",
    "readTime": "12 分钟",
    "level": "实战",
    "author": "APIKnow 编辑部",
    "tags": [
      "日志",
      "指标",
      "Tracing",
      "SLO"
    ],
    "featured": false,
    "points": null,
    "bodyHtml": "<h2>1. 三类信号不要互相替代</h2>\n<p>指标适合发现趋势和告警，日志适合查看离散事件的上下文，链路追踪适合解释一次请求跨服务的路径与耗时。只保留日志会让聚合分析昂贵；只有指标又无法还原个别失败；没有追踪则很难定位多服务链路的尾延迟。</p>\n<h2>2. 从 RED 指标开始</h2>\n<p>再补充饱和度：连接池、线程池、队列、并发和配额使用量。错误率与延迟必须按版本、区域和依赖拆分，才能与变更关联。</p>\n<ul>\n<li>Rate：按接口和状态统计请求速率。</li>\n<li>Errors：区分调用方错误、服务端错误、限流与超时。</li>\n<li>Duration：观察 P50、P95、P99，不只看平均值。</li>\n</ul>\n<h2>3. 可观测性不能成为数据泄露通道</h2>\n<p>默认不记录 Authorization、Cookie、完整请求正文和个人数据。为日志定义字段白名单、保存期限和访问权限。调试采样需要审批和自动过期，不能把临时开关变成永久风险。</p>\n<blockquote>\n<p>注意：请求 ID 用于关联，不应包含用户身份、邮箱或其他业务含义。</p>\n</blockquote>\n<h2>参考资料</h2>\n<ol>\n<li>OpenTelemetry documentation</li>\n<li>Google SRE Workbook: Monitoring</li>\n</ol>\n",
    "sources": [
      "OpenTelemetry documentation",
      "Google SRE Workbook: Monitoring"
    ]
  },
  {
    "slug": "api-selection-framework",
    "category": "review",
    "title": "选 API 不要只看单价：一套可复核的七维评估框架",
    "dek": "把能力、质量、可靠性、成本、兼容性、安全合规和退出成本放进同一张决策表，让“推荐”有清楚的适用条件。",
    "date": "2026-07-08",
    "updated": "2026-07-09",
    "readTime": "17 分钟",
    "level": "决策指南",
    "author": "APIKnow 编辑部",
    "tags": [
      "选型",
      "测评",
      "成本",
      "可靠性"
    ],
    "featured": false,
    "points": null,
    "bodyHtml": "<h2>1. 七个维度缺一不可</h2>\n<ul>\n<li>能力：接口是否真正覆盖业务任务。</li>\n<li>质量：输出可用率和失败类型。</li>\n<li>可靠性：延迟分布、成功率、限流与事件记录。</li>\n<li>成本：单位有效结果成本，而非首页单价。</li>\n<li>兼容性：SDK、协议、工具链和迁移难度。</li>\n<li>安全合规：数据用途、保存、地域和审计能力。</li>\n<li>退出成本：替代方案、数据可迁移性和供应商锁定。</li>\n</ul>\n<h2>2. 权重必须来自业务风险</h2>\n<p>内部原型可以更看重速度和成本，面向客户的核心流程则应提高可靠性、安全与退出成本的权重。不要用一套总分覆盖所有场景，也不要把不可接受的红线平均掉。先设门槛，再在通过门槛的方案中评分。</p>\n<h2>3. 用小规模真实流量验证</h2>\n<p>离线测试集用于稳定比较，影子流量用于观察真实分布，小比例灰度用于验证系统集成。记录输入版本、参数、时间、地区和失败样本，保留可以复算的原始数据。</p>\n<blockquote>\n<p>注意：“最推荐”必须带适用条件、测试日期和证据。供应商赞助或联盟关系应与编辑结论分开披露。</p>\n</blockquote>\n<h2>参考资料</h2>\n<ol>\n<li>APIKnow 编辑方法：能力、质量、可靠性、成本、兼容性、安全合规、退出成本</li>\n</ol>\n",
    "sources": [
      "APIKnow 编辑方法：能力、质量、可靠性、成本、兼容性、安全合规、退出成本"
    ]
  },
  {
    "slug": "image-api-production-checklist",
    "category": "models",
    "title": "图像生成 API 上生产前：队列、回调、内容安全与成本控制",
    "dek": "图像任务通常比文本请求更慢、更贵、结果更大。本文给出异步任务、对象存储、回调验签和失败补偿的上线框架。",
    "date": "2026-07-06",
    "updated": "2026-07-07",
    "readTime": "15 分钟",
    "level": "实战",
    "author": "APIKnow 编辑部",
    "tags": [
      "图像 API",
      "异步任务",
      "回调",
      "内容安全"
    ],
    "featured": false,
    "points": null,
    "bodyHtml": "<h2>1. 长任务优先使用异步作业模型</h2>\n<p>客户端提交任务后获得作业 ID，服务端通过轮询或回调更新状态。业务系统需要定义 pending、running、succeeded、failed、cancelled 等状态，以及每个状态允许的转换。不要把一个可能运行数十秒的任务绑在同步 Web 请求上。</p>\n<h2>2. 回调必须可验证、可重放、可幂等</h2>\n<p>校验回调签名和时间戳，限制允许的时间窗口；使用事件 ID 去重；先持久化事件再异步处理。回调响应应快速返回，业务逻辑失败由内部队列重试，而不是让供应商无限重发。</p>\n<h2>3. 结果存储和安全策略要提前定义</h2>\n<ul>\n<li>把生成结果转存到自有对象存储，设置生命周期。</li>\n<li>记录模型、参数、提示词版本和安全审核结果。</li>\n<li>限制公开 URL 的有效期，避免永久暴露。</li>\n<li>按成功结果、失败重试和高清放大分别核算成本。</li>\n</ul>\n<h2>参考资料</h2>\n<ol>\n<li>通用异步作业与 Webhook 安全实践</li>\n<li>对象存储生命周期与签名 URL 文档</li>\n</ol>\n",
    "sources": [
      "通用异步作业与 Webhook 安全实践",
      "对象存储生命周期与签名 URL 文档"
    ]
  },
  {
    "slug": "api-change-management",
    "category": "industry",
    "title": "当模型版本频繁变化：API 变更管理和回归测试怎么做",
    "dek": "模型名没变，输出行为也可能变化。建立版本快照、契约测试和灰度机制，避免供应商升级直接影响线上结果。",
    "date": "2026-07-04",
    "updated": "2026-07-05",
    "readTime": "11 分钟",
    "level": "工程管理",
    "author": "APIKnow 编辑部",
    "tags": [
      "版本",
      "回归测试",
      "灰度",
      "变更管理"
    ],
    "featured": false,
    "points": null,
    "bodyHtml": "<h2>1. 把接口契约和模型行为分开测试</h2>\n<p>契约测试验证字段、状态码、类型和兼容性；行为测试验证任务质量、拒答模式、格式遵循和成本。前者可以自动化得更稳定，后者需要固定数据集、人工规则与统计指标共同判断。</p>\n<h2>2. 每次发布保留可复现快照</h2>\n<ul>\n<li>记录模型标识、供应商版本、参数、系统提示和测试集版本。</li>\n<li>保留原始响应、耗时、Token 和错误信息。</li>\n<li>对关键任务设不可退化门槛，而不是只看平均分。</li>\n</ul>\n<h2>3. 灰度、对照和回滚</h2>\n<p>新版本先走影子流量，再小比例灰度。对照组和实验组必须在相同业务分布下比较。系统要能快速切回旧版本或备用供应商，并把变更记录与异常指标关联。</p>\n<h2>参考资料</h2>\n<ol>\n<li>契约测试、灰度发布与模型评估通用工程实践</li>\n</ol>\n",
    "sources": [
      "契约测试、灰度发布与模型评估通用工程实践"
    ]
  }
];
