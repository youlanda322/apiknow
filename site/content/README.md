# APIKnow 文章工作区

本站以深度文章为核心。文章从选题进入草稿，经过事实核验和技术审核后发布；资料、图片和测评数据与正文分开保存。

## 目录规则

- `00-编辑策略`：栏目定义、写作标准、发布流程。
- `01-选题池`：候选题目、目标读者、问题和优先级。
- `02-文章模板`：深度解析、实战教程、测评对比模板。
- `03-草稿`：正在写作，文件名使用 `YYYY-MM-DD-slug.md`。
- `04-审核中`：已完成初稿，等待事实、技术和文字审核。
- `05-已发布`：与线上内容一致的 Markdown 定稿。
- `06-资料证据`：官方文档、测试记录、截图说明和来源清单。
- `07-文章图片`：文章主图、截图、图表和图片授权记录。
- `08-测评数据`：CSV、JSON、测试脚本输出与数据字典。
- `09-归档`：废弃选题、旧版本和已下线内容。

## 发布门槛

1. 文章回答一个明确问题，并定义适用读者和边界。
2. 关键概念有解释，结论有推导、代码、数据或来源支持。
3. 产品价格、配额和能力带核验日期，不使用无条件绝对化表述。
4. 测评公开环境、参数、样本量、失败定义和限制。
5. 赞助、联盟链接、商家供稿和赠送额度已显著披露。
6. 完成事实核验、技术审核、链接检查和移动端预览。

## Front Matter

```yaml
---
title: "文章标题"
slug: "english-slug"
category: "fundamentals | models | practice | review | troubleshooting | industry"
status: "draft | review | published | archived"
author: "作者"
reviewer: "审核人"
published_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
reading_time: "15 分钟"
level: "入门 | 基础进阶 | 实战 | 决策指南"
tags: ["标签一", "标签二"]
sources_checked_at: "YYYY-MM-DD"
commercial_disclosure: "无 | 联盟链接 | 赞助 | 商家供稿"
---
```
