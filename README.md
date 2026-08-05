# 亚硝胺限度查询

一个可直接输入 CAS、英文名、缩写、中文别名或相关药物名称，汇总显示 FDA、EMA、Health Canada、TGA 的亚硝胺每日可接受摄入量（AI），并根据最大日剂量（MDD）自动换算 ppm。

## 已实现功能

* 按 CAS、名称、缩写、中文别名查询。

* 按相关药物名称检索对应 NDSRI。

* 对比 FDA、EMA、Health Canada、TGA。

* EMA Appendix 1 同时导入 `N-nitrosamines` 与 `Other N-nitroso-structures` 两个工作表。

* FDA 同时导入 Table 1、Table 2 常规AI和 Table 3 产品特异性临时AI。

* 输入 MDD 后自动换算 ppm：

  `限度（ppm） = AI（ng/day） ÷ MDD（mg/day）`

* 复制查询结果，适合粘贴到钉钉。

* 导出当前查询结果为 CSV。

* 每天自动抓取监管机构官方数据。

* 自动比较前后版本并生成 `data/changes.json`。

* 发生变化时，可通过现有 Cloudflare Worker 中转发送钉钉通知。

* 首次把 FDA/TGA 启动数据扩展为完整表时视为初始化，不发送大量“新增记录”通知。

* 某一监管网站临时不可用时，保留该机构上一次成功数据，不会把数据整列清空。

## 目录

```text
.
├─ index.html
├─ app.js
├─ styles.css
├─ data/
│  ├─ nitrosamine_limits.json
│  ├─ changes.json
│  └─ manual_aliases.json
├─ scripts/
│  └─ update_data.py
├─ .github/workflows/
│  └─ pages.yml
├─ requirements.txt
└─ README.md
```
V3:
1. 支持常见NDSRI相关药物的中/英文通用名查询
2. 修改表格格式

