const SCORE_MODEL = [
  { id: "reliability", label: "稳定性", weight: 25, desc: "成功率、P95 延迟、故障与恢复记录" },
  { id: "pricing", label: "价格透明", weight: 20, desc: "加价幅度、计费说明、余额与退款规则" },
  { id: "models", label: "模型覆盖", weight: 15, desc: "主流模型、版本时效与能力完整度" },
  { id: "compatibility", label: "兼容与文档", weight: 15, desc: "OpenAI 兼容、SDK、错误码与迁移成本" },
  { id: "security", label: "安全与主体", weight: 15, desc: "运营主体、密钥策略、日志与数据说明" },
  { id: "support", label: "服务支持", weight: 10, desc: "工单、公告、响应速度与问题处理" }
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
  "价格、可用性或模型来源存在重大误导"
];

const STATIONS = [
  {
    id: "sample-alpha",
    name: "示例中转站 Alpha",
    shortName: "Alpha",
    demo: true,
    score: 87,
    grade: "S",
    summary: "文档、价格与主体信息较完整，适合作为评分卡展示样例。",
    updated: "2026-07-21",
    evidenceStatus: "演示数据",
    tags: ["OpenAI兼容", "开发测试", "按量计费", "文档完整"],
    useCases: ["个人开发", "小团队", "兼容迁移"],
    models: ["对话模型", "推理模型", "Embedding"],
    scores: { reliability: 22, pricing: 18, models: 13, compatibility: 14, security: 12, support: 8 },
    facts: [
      ["接口兼容", "OpenAI 风格请求与错误结构（示例）"],
      ["计费方式", "按量计费，余额与账单可导出（示例）"],
      ["测试范围", "3 个时段、2 个地区、100 次请求（示例）"],
      ["商业关系", "无赞助，示例数据不构成推荐"]
    ],
    strengths: ["价格页面结构清晰", "错误码和限流说明较完整", "常用模型覆盖较全"],
    risks: ["尚未进行长期稳定性测试", "模型版本更新速度需要持续复核"]
  },
  {
    id: "sample-beta",
    name: "示例中转站 Beta",
    shortName: "Beta",
    demo: true,
    score: 78,
    grade: "A",
    summary: "价格较有竞争力，但服务支持和主体信息仍需补充核验。",
    updated: "2026-07-21",
    evidenceStatus: "演示数据",
    tags: ["低成本", "绘图API", "批量任务", "余额预警"],
    useCases: ["内容创作", "批量任务", "预算敏感"],
    models: ["图像生成", "对话模型"],
    scores: { reliability: 19, pricing: 18, models: 12, compatibility: 12, security: 10, support: 7 },
    facts: [
      ["接口兼容", "提供独立 SDK 与 OpenAI 兼容层（示例）"],
      ["计费方式", "按量计费，部分模型阶梯价（示例）"],
      ["测试范围", "单地区 80 次请求（示例）"],
      ["商业关系", "无赞助，示例数据不构成推荐"]
    ],
    strengths: ["常用规格价格较低", "批量任务接口完整", "余额预警可配置"],
    risks: ["主体信息披露不够完整", "客服响应只覆盖工作时段"]
  },
  {
    id: "sample-gamma",
    name: "示例中转站 Gamma",
    shortName: "Gamma",
    demo: true,
    score: 69,
    grade: "B",
    summary: "模型覆盖较多，但价格规则复杂，适合有能力持续核账的团队。",
    updated: "2026-07-21",
    evidenceStatus: "演示数据",
    tags: ["模型较多", "企业场景", "分组密钥", "账单复杂"],
    useCases: ["企业试点", "多模型对比"],
    models: ["对话模型", "图像生成", "语音识别", "Rerank"],
    scores: { reliability: 17, pricing: 11, models: 14, compatibility: 11, security: 10, support: 6 },
    facts: [
      ["接口兼容", "多套端点，兼容程度按模型不同（示例）"],
      ["计费方式", "分模型与渠道计费（示例）"],
      ["测试范围", "2 个时段、60 次请求（示例）"],
      ["商业关系", "无赞助，示例数据不构成推荐"]
    ],
    strengths: ["模型类型较丰富", "支持按项目分组密钥", "提供账单明细"],
    risks: ["渠道价与模型价规则复杂", "故障公告不够及时"]
  },
  {
    id: "sample-delta",
    name: "示例中转站 Delta",
    shortName: "Delta",
    demo: true,
    score: 58,
    grade: "C",
    summary: "价格低，但核验材料和服务记录不足，只适合非关键任务小额试用。",
    updated: "2026-07-21",
    evidenceStatus: "证据待补（演示）",
    tags: ["低价", "新站", "证据待补", "非关键任务"],
    useCases: ["临时测试", "非关键任务"],
    models: ["对话模型"],
    scores: { reliability: 14, pricing: 15, models: 9, compatibility: 9, security: 6, support: 5 },
    facts: [
      ["接口兼容", "基础对话接口（示例）"],
      ["计费方式", "预充值余额（示例）"],
      ["测试范围", "30 次短时请求（示例）"],
      ["商业关系", "无赞助，示例数据不构成推荐"]
    ],
    strengths: ["入门成本较低", "界面简单"],
    risks: ["运营主体证据不足", "长期稳定性未知", "退款规则需要补充"]
  }
];
