const state = {
  data: null,
  matches: [],
  query: "",
  mdd: 1000
};

const el = (id) => document.getElementById(id);

function normalize(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "");
}

function formatNumber(value, digits = 6) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString("zh-CN", { maximumFractionDigits: digits });
}

function formatPpm(ai, mdd) {
  if (ai === null || ai === undefined || !Number.isFinite(mdd) || mdd <= 0) return "—";
  const ppm = Number(ai) / mdd;
  return `${formatNumber(ppm, ppm < 0.001 ? 8 : 6)} ppm`;
}

function scoreRecord(record, q) {
  if (!q) return 0;
  const nq = normalize(q);
  const cas = normalize(record.cas);
  const name = normalize(record.name);
  const aliases = record.aliases.map(normalize);
  const related = record.related_substances.map(normalize);
  const iupac = normalize(record.iupac);
  const smiles = normalize(record.smiles);

  if (cas && cas === nq) return 1000;
  if (name === nq) return 950;
  if (aliases.includes(nq)) return 920;
  if (related.includes(nq)) return 870;
  if (name.startsWith(nq)) return 800;
  if (aliases.some(x => x.startsWith(nq))) return 770;
  if (cas.includes(nq)) return 730;
  if (name.includes(nq)) return 700;
  if (aliases.some(x => x.includes(nq))) return 670;
  if (related.some(x => x.includes(nq))) return 620;
  if (iupac.includes(nq)) return 580;
  if (smiles && smiles === nq) return 560;
  return 0;
}

function search() {
  const query = el("query").value.trim();
  const mdd = Number(el("mdd").value);
  state.query = query;
  if (!Number.isFinite(mdd) || mdd <= 0) {
    el("mdd").focus();
    renderEmpty("最大日剂量 MDD 必须是大于 0 的数值，单位为 mg/day。");
    return;
  }
  state.mdd = mdd;

  const url = new URL(window.location.href);
  if (query) url.searchParams.set("q", query); else url.searchParams.delete("q");
  if (Number.isFinite(mdd) && mdd > 0) url.searchParams.set("mdd", String(mdd));
  history.replaceState({}, "", url);

  if (!query) {
    state.matches = [];
    renderEmpty("请输入 CAS、名称、缩写或相关药物名称。");
    return;
  }

  const ranked = state.data.records
    .map(record => ({ record, score: scoreRecord(record, query) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.record.name.localeCompare(b.record.name))
    .slice(0, 30);

  state.matches = ranked.map(item => item.record);
  renderResults();
}

function renderEmpty(message) {
  el("results").classList.add("hidden");
  el("emptyState").classList.remove("hidden");
  el("emptyState").querySelector("h2").textContent = "未显示结果";
  el("emptyState").querySelector("p").textContent = message;
}

function sourceLabel(status) {
  if (status === "reference") return "参考值";
  if (status === "nmi") return "非致突变控制";
  if (status === "other") return "非数值结论";
  return "已建立AI";
}

function makeCell(text, className = "") {
  const td = document.createElement("td");
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function renderResults() {
  const container = el("resultCards");
  container.innerHTML = "";

  if (!state.matches.length) {
    renderEmpty("没有找到匹配项。建议改用 CAS、英文缩写或相关药物名称；也可检查拼写。");
    return;
  }

  el("emptyState").classList.add("hidden");
  el("results").classList.remove("hidden");
  el("resultsSummary").textContent = `共找到 ${state.matches.length} 条；MDD = ${formatNumber(state.mdd)} mg/day。`;

  state.matches.forEach((record, index) => {
    const fragment = el("cardTemplate").content.cloneNode(true);
    const card = fragment.querySelector(".result-card");
    fragment.querySelector(".compound-kicker").textContent = record.cas ? `CAS ${record.cas}` : "CAS 未收录";
    fragment.querySelector(".compound-name").textContent = record.name;

    const metaBits = [];
    if (record.iupac && normalize(record.iupac) !== normalize(record.name)) metaBits.push(`IUPAC：${record.iupac}`);
    if (record.related_substances.length) metaBits.push(`相关药物：${record.related_substances.slice(0, 8).join("、")}${record.related_substances.length > 8 ? "…" : ""}`);
    fragment.querySelector(".compound-meta").textContent = metaBits.join("；") || "监管限度记录";

    const regulators = Object.entries(record.regulators);
    fragment.querySelector(".record-badge").textContent = `${regulators.length} 个监管来源`;

    if (record.aliases.length) {
      const aliasBlock = fragment.querySelector(".alias-block");
      aliasBlock.classList.remove("hidden");
      aliasBlock.textContent = `别名 / 缩写：${record.aliases.join("、")}`;
    }

    const tbody = fragment.querySelector("tbody");
    const preferred = ["FDA", "EMA", "Health Canada", "TGA"];
    regulators
      .sort((a, b) => preferred.indexOf(a[0]) - preferred.indexOf(b[0]))
      .forEach(([agency, item]) => {
        const tr = document.createElement("tr");
        tr.appendChild(makeCell(agency));
        tr.appendChild(makeCell(item.ai_ng_day !== null ? `${formatNumber(item.ai_ng_day)} ng/day` : item.ai_display, "ai"));
        tr.appendChild(makeCell(formatPpm(item.ai_ng_day, state.mdd), "ppm"));
        tr.appendChild(makeCell(item.cpca_category || "—"));

        const basis = item.basis || sourceLabel(item.status);
        const basisCell = makeCell(basis);
        if (item.status === "reference" || item.status === "nmi" || item.status === "other") {
          const span = document.createElement("span");
          span.className = "note-ref";
          span.textContent = basis;
          basisCell.textContent = "";
          basisCell.appendChild(span);
        }
        tr.appendChild(basisCell);
        tr.appendChild(makeCell(item.publication_date || "—"));

        const linkCell = document.createElement("td");
        const link = document.createElement("a");
        link.href = item.source_url;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.className = "source-link";
        link.textContent = item.source_version || "打开原文";
        linkCell.appendChild(link);
        tr.appendChild(linkCell);
        tbody.appendChild(tr);
      });

    card.dataset.index = String(index);
    container.appendChild(fragment);
  });
}

function buildText() {
  const lines = [
    `亚硝胺监管限度查询：${state.query}`,
    `最大日剂量：${formatNumber(state.mdd)} mg/day`,
    ""
  ];
  state.matches.forEach(record => {
    lines.push(`${record.name}${record.cas ? `（CAS ${record.cas}）` : ""}`);
    Object.entries(record.regulators).forEach(([agency, item]) => {
      const ppm = formatPpm(item.ai_ng_day, state.mdd);
      lines.push(`- ${agency}: ${item.ai_ng_day !== null ? `${formatNumber(item.ai_ng_day)} ng/day` : item.ai_display}; ${ppm}; ${item.basis || sourceLabel(item.status)}`);
    });
    lines.push("");
  });
  lines.push("注：ppm = AI(ng/day) ÷ MDD(mg/day)。申报或放行前请核验监管机构原始文件。");
  return lines.join("\n");
}

async function copyResults() {
  await navigator.clipboard.writeText(buildText());
  const button = el("copyButton");
  const old = button.textContent;
  button.textContent = "已复制";
  setTimeout(() => button.textContent = old, 1400);
}

function exportCsv() {
  const rows = [["CAS", "名称", "监管机构", "AI (ng/day)", "换算限度 (ppm)", "MDD (mg/day)", "CPCA", "依据/状态", "发布日期", "来源"]];
  state.matches.forEach(record => {
    Object.entries(record.regulators).forEach(([agency, item]) => {
      rows.push([
        record.cas,
        record.name,
        agency,
        item.ai_ng_day ?? item.ai_display,
        item.ai_ng_day !== null ? item.ai_ng_day / state.mdd : "",
        state.mdd,
        item.cpca_category,
        item.basis || sourceLabel(item.status),
        item.publication_date,
        item.source_url
      ]);
    });
  });
  const csv = "\uFEFF" + rows.map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `nitrosamine_limits_${state.query || "results"}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function renderSources() {
  const box = el("sourceDetails");
  box.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "source-grid";
  Object.entries(state.data.source_status).forEach(([agency, item]) => {
    const div = document.createElement("div");
    div.className = "source-item";
    const h3 = document.createElement("h3");
    h3.textContent = agency;
    const p1 = document.createElement("p");
    p1.textContent = item.version;
    const p2 = document.createElement("p");
    p2.textContent = `数据日期：${item.updated}；范围：${item.mode}`;
    const errorText = state.data.refresh_errors?.[agency];
    if (errorText) {
      const warning = document.createElement("p");
      warning.className = "source-warning";
      warning.textContent = "本次刷新失败，页面保留上一次成功数据。";
      div.append(h3, p1, p2, warning);
    } else {
      div.append(h3, p1, p2);
    }
    const link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "打开官方来源";
    div.appendChild(link);
    grid.appendChild(div);
  });
  box.appendChild(grid);
}

async function init() {
  try {
    const response = await fetch("./data/nitrosamine_limits.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();

    el("recordCount").textContent = `${state.data.records.length} 个归一化化合物记录`;
    el("generatedAt").textContent = `数据生成：${new Date(state.data.generated_at).toLocaleString("zh-CN")}`;
    renderSources();

    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    const mdd = params.get("mdd");
    el("query").value = q;
    if (mdd && Number(mdd) > 0) el("mdd").value = mdd;
    if (q) search();
  } catch (error) {
    renderEmpty(`数据加载失败：${error.message}。请确认 data/nitrosamine_limits.json 已发布。`);
  }
}

el("searchButton").addEventListener("click", search);
el("query").addEventListener("keydown", event => { if (event.key === "Enter") search(); });
el("copyButton").addEventListener("click", copyResults);
el("csvButton").addEventListener("click", exportCsv);
el("showSources").addEventListener("click", () => {
  el("sourceDetails").classList.toggle("hidden");
  el("showSources").textContent = el("sourceDetails").classList.contains("hidden") ? "查看数据源状态" : "收起数据源状态";
});
document.querySelectorAll(".query-chip").forEach(button => {
  button.addEventListener("click", () => {
    el("query").value = button.dataset.query;
    search();
  });
});

init();
