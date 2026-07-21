const SCORE_MODEL = [
  { id: "stability", label: "稳定性", weight: 25, desc: "成功率、可用性、故障恢复与长时间运行表现" },
  { id: "latency", label: "速度延迟", weight: 20, desc: "P50/P95 延迟、首 Token 延迟(TTFT)、吞吐量(TPS)" },
  { id: "pricing", label: "价格竞争力", weight: 20, desc: "加价幅度、计费透明度、性价比与隐藏费用" },
  { id: "service", label: "服务与退款", weight: 15, desc: "退款政策（可退款加分）、工单响应、公告与停服处理" },
  { id: "purity", label: "不掺水检测", weight: 20, desc: "模型真实性检测、参数一致性、输出质量验证（GitHub 检测工具）" }
];

const GRADE_RULES = [
  { min: 85, grade: "S", label: "优先推荐", color: "#16794d" },
  { min: 75, grade: "A", label: "可以推荐", color: "#175cd3" },
  { min: 65, grade: "B", label: "按场景选择", color: "#6941c6" },
  { min: 55, grade: "C", label: "谨慎试用", color: "#9a6700" },
  { min: 0, grade: "观察", label: "证据不足或风险较高", color: "#b42318" }
];

const HARD_RULES = [
  "运营主体、联系方式或服务条款完全无法核验",
  "存在密钥滥用、转售用户 Key 或诱导上传长期凭证的证据",
  "宣称官方授权但无法提供可核验证据",
  "余额、退款和停服处理规则缺失且拒绝说明",
  "价格、可用性或模型来源存在重大误导",
  "经检测确认模型掺水（以低规格模型冒充高规格模型，如 GPT-4 降级为 GPT-3.5）"
];

const STATIONS = [
  {
    id: "sample-alpha",
    name: "示例中转站 Alpha",
    shortName: "Alpha",
    demo: true,
    score: 87,
    grade: "S",
    summary: "稳定性与价格表现优秀，支持退款，不掺水检测通过，适合作为评分卡展示样例。",
    updated: "2026-07-21",
    evidenceStatus: "演示数据",
    tags: ["OpenAI兼容", "开发测试", "按量计费", "文档完整"],
    useCases: ["个人开发", "小团队", "兼容迁移"],
    models: ["对话模型", "推理模型", "Embedding"],
    scores: { stability: 22, latency: 17, pricing: 18, service: 13, purity: 17 },
    refundPolicy: "支持退款",
    purityTest: "已检测·未掺水",
    latencyData: "P50: 120ms / P95: 350ms / TTFT: 0.8s",
    facts: [
      ["接口兼容", "OpenAI 风格请求与错误结构（示例）"],
      ["计费方式", "按量计费，余额与账单可导出（示例）"],
      ["退款政策", "支持未使用余额退款，3 个工作日内到账（示例）"],
      ["延迟测试", "P50: 120ms / P95: 350ms / TTFT: 0.8s（示例）"],
      ["掺水检测", "使用 GitHub 检测工具验证，模型参数一致（示例）"],
      ["测试范围", "3 个时段、2 个地区、100 次请求（示例）"],
      ["商业关系", "无赞助，示例数据不构成推荐"]
    ],
    strengths: ["稳定性高，成功率 99.2%", "价格页面结构清晰，无隐藏费用", "支持退款，退出成本低", "不掺水检测通过，模型真实性已验证"],
    risks: ["尚未进行长期稳定性测试", "模型版本更新速度需要持续复核"]
  },
  {
    id: "sample-beta",
    name: "示例中转站 Beta",
    shortName: "Beta",
    demo: true,
    score: 78,
    grade: "A",
    summary: "价格有竞争力，延迟表现尚可，部分退款，但服务支持仍需补充核验。",
    updated: "2026-07-21",
    evidenceStatus: "演示数据",
    tags: ["低成本", "绘图API", "批量任务", "余额预警"],
    useCases: ["内容创作", "批量任务", "预算敏感"],
    models: ["图像生成", "对话模型"],
    scores: { stability: 19, latency: 15, pricing: 18, service: 10, purity: 16 },
    refundPolicy: "部分退款",
    purityTest: "已检测·未掺水",
    latencyData: "P50: 180ms / P95: 520ms / TTFT: 1.2s",
    facts: [
      ["接口兼容", "提供独立 SDK 与 OpenAI 兼容层（示例）"],
      ["计费方式", "按量计费，部分模型阶梯价（示例）"],
      ["退款政策", "仅支持充值 7 天内未使用部分退款（示例）"],
      ["延迟测试", "P50: 180ms / P95: 520ms / TTFT: 1.2s（示例）"],
      ["掺水检测", "使用 GitHub 检测工具验证，模型参数一致（示例）"],
      ["测试范围", "单地区 80 次请求（示例）"],
      ["商业关系", "无赞助，示例数据不构成推荐"]
    ],
    strengths: ["常用规格价格较低", "批量任务接口完整", "余额预警可配置", "不掺水检测通过"],
    risks: ["主体信息披露不够完整", "客服响应只覆盖工作时段", "退款条件较严格"]
  },
  {
    id: "sample-gamma",
    name: "示例中转站 Gamma",
    shortName: "Gamma",
    demo: true,
    score: 69,
    grade: "B",
    summary: "模型覆盖较多且不掺水检测通过，但延迟偏高、价格规则复杂，适合有能力持续核账的团队。",
    updated: "2026-07-21",
    evidenceStatus: "演示数据",
    tags: ["模型较多", "企业场景", "分组密钥", "账单复杂"],
    useCases: ["企业试点", "多模型对比"],
    models: ["对话模型", "图像生成", "语音识别", "Rerank"],
    scores: { stability: 17, latency: 13, pricing: 11, service: 11, purity: 17 },
    refundPolicy: "支持退款",
    purityTest: "已检测·待复核",
    latencyData: "P50: 250ms / P95: 680ms / TTFT: 1.5s",
    facts: [
      ["接口兼容", "多套端点，兼容程度按模型不同（示例）"],
      ["计费方式", "分模型与渠道计费（示例）"],
      ["退款政策", "支持未使用余额退款，需申请审核（示例）"],
      ["延迟测试", "P50: 250ms / P95: 680ms / TTFT: 1.5s（示例）"],
      ["掺水检测", "初步检测未发现掺水，部分模型待复核（示例）"],
      ["测试范围", "2 个时段、60 次请求（示例）"],
      ["商业关系", "无赞助，示例数据不构成推荐"]
    ],
    strengths: ["模型类型较丰富", "支持按项目分组密钥", "提供账单明细", "支持退款"],
    risks: ["渠道价与模型价规则复杂", "故障公告不够及时", "P95 延迟偏高"]
  },
  {
    id: "sample-delta",
    name: "示例中转站 Delta",
    shortName: "Delta",
    demo: true,
    score: 58,
    grade: "C",
    summary: "价格低，但不支持退款、未完成掺水检测、延迟不稳定，只适合非关键任务小额试用。",
    updated: "2026-07-21",
    evidenceStatus: "证据待补（演示）",
    tags: ["低价", "新站", "证据待补", "非关键任务"],
    useCases: ["临时测试", "非关键任务"],
    models: ["对话模型"],
    scores: { stability: 14, latency: 12, pricing: 15, service: 6, purity: 11 },
    refundPolicy: "不支持退款",
    purityTest: "未检测",
    latencyData: "P50: 320ms / P95: 1200ms / TTFT: 2.1s",
    facts: [
      ["接口兼容", "基础对话接口（示例）"],
      ["计费方式", "预充值余额（示例）"],
      ["退款政策", "不支持退款，充值前需谨慎（示例）"],
      ["延迟测试", "P50: 320ms / P95: 1200ms / TTFT: 2.1s（示例）"],
      ["掺水检测", "尚未进行检测，模型真实性未知（示例）"],
      ["测试范围", "30 次短时请求（示例）"],
      ["商业关系", "无赞助，示例数据不构成推荐"]
    ],
    strengths: ["入门成本较低", "界面简单"],
    risks: ["运营主体证据不足", "长期稳定性未知", "不支持退款，退出成本高", "未进行掺水检测", "P95 延迟波动大"]
  }
];
