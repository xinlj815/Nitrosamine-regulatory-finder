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

## 本地开发与验证

使用 Python 3.12，安装 `requirements.txt` 后执行：

```sh
python -m unittest discover -s tests -v
python scripts/validate_data.py
python -m http.server 8000
```

网页无需前端构建。TGA 状态卡片会区分刷新成功与保留旧数据，失败详情可展开查看；数据日期来自官方页面或表格，不使用运行日期冒充更新日期。

TGA 更新优先从官方页面发现当前 CSV 下载链接，CSV 不可用时复用页面表格。页面不可访问时，按新到旧尝试月度 CSV 地址；单个地址超时、404 或返回异常内容不会中断后续搜索，CSV 搜索总预算为 90 秒。所有来源失败时，`--allow-partial` 保留上一次成功的数据。

手动刷新命令如下，会修改 `data/nitrosamine_limits.json` 与 `data/changes.json`：

```sh
python scripts/update_data.py --allow-partial --no-notify
python scripts/validate_data.py
```

`--no-notify` 禁止发送钉钉消息。排查时可通过 `TGA_CSV_PATH`、`TGA_HTML_PATH` 指定本地官方文件，或通过 `TGA_CSV_URL` 指定官方 CSV 下载地址。刷新进程返回成功并不保证所有来源成功；应同时检查 `refresh_errors` 和 TGA 状态。

