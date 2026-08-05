const state = {
  data: null,
  matches: [],
  query: "",
  mdd: 1000
};

const el = (id) => document.getElementById(id);

// Curated Chinese generic-name aliases for APIs associated with NDSRIs.
// The regulator source data remain unchanged; these aliases are used only for local search and display.
const DRUG_GENERIC_NAMES = {
  "abacavir": [
    "阿巴卡韦"
  ],
  "acarbose": [
    "阿卡波糖"
  ],
  "acebutolol": [
    "醋丁洛尔"
  ],
  "adrenaline": [
    "肾上腺素"
  ],
  "epinephrine": [
    "肾上腺素"
  ],
  "almotriptan": [
    "阿莫曲普坦"
  ],
  "alogliptin": [
    "阿格列汀"
  ],
  "alprazolam": [
    "阿普唑仑"
  ],
  "ambroxol": [
    "氨溴索"
  ],
  "amiodarone": [
    "胺碘酮"
  ],
  "amitriptyline": [
    "阿米替林"
  ],
  "amphotericin b": [
    "两性霉素B",
    "两性霉素b"
  ],
  "apixaban": [
    "阿哌沙班"
  ],
  "argatroban": [
    "阿加曲班"
  ],
  "aripiprazole": [
    "阿立哌唑"
  ],
  "articaine": [
    "阿替卡因"
  ],
  "atenolol": [
    "阿替洛尔"
  ],
  "atomoxetine": [
    "托莫西汀"
  ],
  "azelastine": [
    "氮卓斯汀"
  ],
  "azithromycin": [
    "阿奇霉素"
  ],
  "benazepril": [
    "贝那普利"
  ],
  "benzathine": [
    "苄星"
  ],
  "benzydamine": [
    "苄达明"
  ],
  "berotralstat": [
    "贝罗司他"
  ],
  "betahistine": [
    "倍他司汀"
  ],
  "betaxolol": [
    "倍他洛尔"
  ],
  "bilastine": [
    "比拉斯汀"
  ],
  "bisoprolol": [
    "比索洛尔"
  ],
  "brinzolamide": [
    "布林佐胺"
  ],
  "bumetanide": [
    "布美他尼"
  ],
  "bupropion": [
    "安非他酮"
  ],
  "buspirone": [
    "丁螺环酮"
  ],
  "cabergoline": [
    "卡麦角林"
  ],
  "calcium folinate": [
    "亚叶酸钙"
  ],
  "calcium levofolinate": [
    "左亚叶酸钙"
  ],
  "carvedilol": [
    "卡维地洛"
  ],
  "caspofungin": [
    "卡泊芬净"
  ],
  "celiprolol": [
    "塞利洛尔"
  ],
  "chlorphenamine": [
    "氯苯那敏",
    "扑尔敏"
  ],
  "cilazapril": [
    "西拉普利"
  ],
  "cimetidine": [
    "西咪替丁"
  ],
  "cinacalcet": [
    "西那卡塞"
  ],
  "cinnarizine": [
    "桂利嗪"
  ],
  "ciprofloxacin": [
    "环丙沙星"
  ],
  "citalopram": [
    "西酞普兰"
  ],
  "clarithromycin": [
    "克拉霉素"
  ],
  "clonidine": [
    "可乐定"
  ],
  "clozapine": [
    "氯氮平"
  ],
  "cobicistat": [
    "考比司他"
  ],
  "colesevelam": [
    "考来维仑"
  ],
  "cyanocobalamine": [
    "氰钴胺",
    "维生素B12",
    "维生素b12"
  ],
  "cyanocobalamin": [
    "氰钴胺",
    "维生素B12",
    "维生素b12"
  ],
  "cytisine": [
    "金雀花碱"
  ],
  "d-biotin": [
    "D-生物素",
    "生物素"
  ],
  "biotin": [
    "生物素"
  ],
  "dabigatran etexilate": [
    "达比加群酯"
  ],
  "dalbavancin": [
    "达巴万星"
  ],
  "daridorexant": [
    "达利雷生"
  ],
  "dasatinib": [
    "达沙替尼"
  ],
  "desloratadine": [
    "地氯雷他定"
  ],
  "desvenlafaxine": [
    "去甲文拉法辛"
  ],
  "dextromethorphan": [
    "右美沙芬"
  ],
  "diazepam": [
    "地西泮"
  ],
  "diclofenac": [
    "双氯芬酸"
  ],
  "diltiazem": [
    "地尔硫卓"
  ],
  "dimenhydrinate": [
    "茶苯海明"
  ],
  "diphenhydramine": [
    "苯海拉明"
  ],
  "dorzolamide": [
    "多佐胺"
  ],
  "timolol": [
    "噻吗洛尔"
  ],
  "doxepin": [
    "多塞平"
  ],
  "doxycycline": [
    "多西环素"
  ],
  "doxylamine": [
    "多西拉敏"
  ],
  "dronedarone": [
    "决奈达隆"
  ],
  "duloxetine": [
    "度洛西汀"
  ],
  "edoxaban": [
    "依度沙班"
  ],
  "elagolix": [
    "艾拉戈克"
  ],
  "eletriptan": [
    "依来曲普坦"
  ],
  "enalapril": [
    "依那普利"
  ],
  "entacapone": [
    "恩他卡朋"
  ],
  "esmolol": [
    "艾司洛尔"
  ],
  "felodipine": [
    "非洛地平"
  ],
  "fenfluramine": [
    "芬氟拉明"
  ],
  "flecainide": [
    "氟卡尼"
  ],
  "fluoxetine": [
    "氟西汀"
  ],
  "folic acid": [
    "叶酸"
  ],
  "frovatriptan": [
    "夫罗曲普坦"
  ],
  "furosemide": [
    "呋塞米",
    "速尿"
  ],
  "galantamine": [
    "加兰他敏"
  ],
  "gliclazide": [
    "格列齐特"
  ],
  "hydrochlorothiazide": [
    "氢氯噻嗪"
  ],
  "hydroxychloroquine": [
    "羟氯喹"
  ],
  "hydroxyzine": [
    "羟嗪"
  ],
  "imatinib": [
    "伊马替尼"
  ],
  "indapamide": [
    "吲达帕胺"
  ],
  "isosorbide mononitrate": [
    "单硝酸异山梨酯"
  ],
  "ivacaftor": [
    "伊伐卡托"
  ],
  "ketamine": [
    "氯胺酮"
  ],
  "labetalol": [
    "拉贝洛尔"
  ],
  "landiolol": [
    "兰地洛尔"
  ],
  "lercanidipine": [
    "乐卡地平"
  ],
  "leucovorin": [
    "亚叶酸"
  ],
  "levodropropizine": [
    "左羟丙哌嗪"
  ],
  "levofloxacin": [
    "左氧氟沙星"
  ],
  "lidocaine": [
    "利多卡因"
  ],
  "lisinopril": [
    "赖诺普利"
  ],
  "lumefantrine": [
    "苯芴醇"
  ],
  "maprotiline": [
    "马普替林"
  ],
  "mefenamic acid": [
    "甲芬那酸"
  ],
  "meglumine": [
    "葡甲胺"
  ],
  "melatonin": [
    "褪黑素"
  ],
  "meropenem": [
    "美罗培南"
  ],
  "metamizole": [
    "安乃近"
  ],
  "methadone": [
    "美沙酮"
  ],
  "methylphenidate": [
    "哌甲酯"
  ],
  "metoprolol": [
    "美托洛尔"
  ],
  "mianserin": [
    "米安色林"
  ],
  "mifepristone": [
    "米非司酮"
  ],
  "mirabegron": [
    "米拉贝隆"
  ],
  "mirtazapine": [
    "米氮平"
  ],
  "moxifloxacin": [
    "莫西沙星"
  ],
  "moxonidine": [
    "莫索尼定"
  ],
  "nadolol": [
    "纳多洛尔"
  ],
  "nalmefene": [
    "纳美芬"
  ],
  "naratriptan": [
    "那拉曲普坦"
  ],
  "nebivolol": [
    "奈必洛尔"
  ],
  "nefopam": [
    "奈福泮"
  ],
  "nicotine": [
    "尼古丁"
  ],
  "nilotinib": [
    "尼洛替尼"
  ],
  "nintedanib": [
    "尼达尼布"
  ],
  "norfloxacin": [
    "诺氟沙星",
    "氟哌酸"
  ],
  "nortriptyline": [
    "去甲替林"
  ],
  "olanzapine": [
    "奥氮平"
  ],
  "olaparib": [
    "奥拉帕利"
  ],
  "opipramol": [
    "奥匹哌醇"
  ],
  "orphenadrine": [
    "奥芬那君"
  ],
  "paroxetine": [
    "帕罗西汀"
  ],
  "penicillin g benzathine": [
    "苄星青霉素"
  ],
  "perindopril": [
    "培哚普利"
  ],
  "phenylephrine": [
    "去氧肾上腺素"
  ],
  "posaconazole": [
    "泊沙康唑"
  ],
  "pramipexole": [
    "普拉克索"
  ],
  "propafenon": [
    "普罗帕酮"
  ],
  "propafenone": [
    "普罗帕酮"
  ],
  "propranolol": [
    "普萘洛尔",
    "心得安"
  ],
  "protriptyline": [
    "普罗替林"
  ],
  "pseudoephedrine": [
    "伪麻黄碱"
  ],
  "quetiapine": [
    "喹硫平"
  ],
  "quinapril": [
    "喹那普利"
  ],
  "ramipril": [
    "雷米普利"
  ],
  "ranolazine": [
    "雷诺嗪"
  ],
  "rasagiline": [
    "雷沙吉兰"
  ],
  "reboxetine": [
    "瑞波西汀"
  ],
  "relebactam": [
    "雷来巴坦"
  ],
  "ribociclib": [
    "瑞博西利"
  ],
  "rifampicin": [
    "利福平"
  ],
  "rifampin": [
    "利福平"
  ],
  "rifapentine": [
    "利福喷丁"
  ],
  "riociguat": [
    "利奥西呱"
  ],
  "ritonavir": [
    "利托那韦"
  ],
  "rivaroxaban": [
    "利伐沙班"
  ],
  "rivastigmine": [
    "卡巴拉汀"
  ],
  "rizatriptan": [
    "利扎曲普坦"
  ],
  "ropinirole": [
    "罗匹尼罗"
  ],
  "ropivacaine": [
    "罗哌卡因"
  ],
  "rotigotine": [
    "罗替戈汀"
  ],
  "safinamide": [
    "沙芬酰胺"
  ],
  "salbutamol": [
    "沙丁胺醇"
  ],
  "selumetinib": [
    "司美替尼"
  ],
  "sertraline": [
    "舍曲林"
  ],
  "sildenafil": [
    "西地那非"
  ],
  "silodosin": [
    "西洛多辛"
  ],
  "sitagliptin": [
    "西格列汀"
  ],
  "sotalol": [
    "索他洛尔"
  ],
  "sumatriptan": [
    "舒马曲普坦"
  ],
  "tadalafil": [
    "他达拉非"
  ],
  "tamoxifen": [
    "他莫昔芬"
  ],
  "tamsulosin": [
    "坦索罗辛"
  ],
  "tapentadol": [
    "他喷他多"
  ],
  "terazosin": [
    "特拉唑嗪"
  ],
  "terbinafine": [
    "特比萘芬"
  ],
  "tetracaine": [
    "丁卡因"
  ],
  "ticagrelor": [
    "替格瑞洛"
  ],
  "tigecycline": [
    "替加环素"
  ],
  "tizanidine": [
    "替扎尼定"
  ],
  "tofacitinib": [
    "托法替布"
  ],
  "tramadol": [
    "曲马多"
  ],
  "trandolapril": [
    "群多普利"
  ],
  "trientine": [
    "曲恩汀"
  ],
  "trimebutine": [
    "曲美布汀"
  ],
  "trimetazidine": [
    "曲美他嗪"
  ],
  "ulipristal acetate": [
    "醋酸乌利司他"
  ],
  "urapidil": [
    "乌拉地尔"
  ],
  "valaciclovir": [
    "伐昔洛韦"
  ],
  "valacyclovir": [
    "伐昔洛韦"
  ],
  "valsartan": [
    "缬沙坦"
  ],
  "vancomycin": [
    "万古霉素"
  ],
  "varenicline": [
    "伐尼克兰"
  ],
  "venlafaxine": [
    "文拉法辛"
  ],
  "vibegron": [
    "维贝格龙"
  ],
  "vildagliptin": [
    "维格列汀"
  ],
  "vortioxetine": [
    "伏硫西汀"
  ],
  "zolmitriptan": [
    "佐米曲普坦"
  ]
};

const NORMALIZED_DRUG_NAMES = Object.entries(DRUG_GENERIC_NAMES).map(([english, chinese]) => ({
  english,
  englishKey: normalize(english),
  chinese,
  chineseKeys: chinese.map(normalize)
}));


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

function stripChineseDrugForm(value) {
  return value
    .replace(/^(盐酸|氢溴酸|硫酸|磷酸|甲磺酸|苯磺酸|马来酸|富马酸|枸橼酸|酒石酸|琥珀酸|醋酸|乳酸)/, "")
    .replace(/(盐酸盐|氢溴酸盐|硫酸盐|磷酸盐|甲磺酸盐|苯磺酸盐|马来酸盐|富马酸盐|枸橼酸盐|酒石酸盐|琥珀酸盐|醋酸盐|乳酸盐)$/, "");
}

function queryVariants(value) {
  const raw = normalize(value);
  const variants = new Set([raw]);
  const nitrosoQuery = raw.includes("亚硝基");
  const withoutNitroso = raw.replace(/^n?亚硝基/, "");
  variants.add(withoutNitroso);
  variants.add(stripChineseDrugForm(withoutNitroso));

  const candidates = [...variants].filter(Boolean);
  NORMALIZED_DRUG_NAMES.forEach(item => {
    const matched = item.chineseKeys.some(alias =>
      candidates.some(candidate => candidate === alias || (alias.length >= 3 && candidate.includes(alias)))
    );
    if (matched) {
      variants.add(item.englishKey);
      if (nitrosoQuery) {
        variants.add(`nnitroso${item.englishKey}`);
        variants.add(`nitroso${item.englishKey}`);
      }
    }
  });
  return [...variants].filter(Boolean);
}

function scoreToken(record, nq) {
  const cas = normalize(record.cas);
  const name = normalize(record.name);
  const aliases = (record.aliases || []).map(normalize);
  const related = (record.related_substances || []).map(normalize);
  const relatedAliases = (record.related_substance_aliases || []).map(normalize);
  const iupac = normalize(record.iupac);
  const smiles = normalize(record.smiles);

  if (cas && cas === nq) return 1000;
  if (name === nq) return 950;
  if (aliases.includes(nq)) return 920;
  if (related.includes(nq) || relatedAliases.includes(nq)) return 870;
  if (name.startsWith(nq)) return 800;
  if (aliases.some(x => x.startsWith(nq))) return 770;
  if (cas.includes(nq)) return 730;
  if (name.includes(nq)) return 700;
  if (aliases.some(x => x.includes(nq))) return 670;
  if (related.some(x => x.includes(nq)) || relatedAliases.some(x => x.includes(nq))) return 620;
  if (iupac.includes(nq)) return 580;
  if (smiles && smiles === nq) return 560;
  return 0;
}

function scoreRecord(record, q) {
  if (!q) return 0;
  return Math.max(0, ...queryVariants(q).map(token => scoreToken(record, token)));
}

function chineseNamesForRelated(value) {
  const key = normalize(value);
  const names = [];
  NORMALIZED_DRUG_NAMES.forEach(item => {
    if (key === item.englishKey || key.includes(item.englishKey)) {
      const primary = item.chinese[0];
      if (primary && !names.includes(primary)) names.push(primary);
    }
  });
  return names;
}

function displayRelatedSubstances(record) {
  return (record.related_substances || []).map(value => {
    const chinese = chineseNamesForRelated(value);
    return chinese.length ? `${value}（${chinese.join("/")}）` : value;
  });
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
  url.searchParams.set("mdd", String(mdd));
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
  if (status === "interim") return "临时AI";
  return "已建立AI";
}

function makeCell(text, className = "") {
  const td = document.createElement("td");
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function recordRows(record) {
  const rows = [];
  Object.entries(record.regulators || {}).forEach(([agency, item]) => {
    rows.push({
      agency,
      agencyLabel: agency,
      limitType: "regular",
      item
    });
  });
  (record.special_limits || []).forEach(item => {
    rows.push({
      agency: item.agency || "",
      agencyLabel: item.limit_type === "interim" ? `${item.agency}（临时AI）` : `${item.agency}（特殊限度）`,
      limitType: item.limit_type || "special",
      item
    });
  });

  const preferred = ["FDA", "EMA", "Health Canada", "TGA"];
  return rows.sort((a, b) => {
    const ai = preferred.includes(a.agency) ? preferred.indexOf(a.agency) : 99;
    const bi = preferred.includes(b.agency) ? preferred.indexOf(b.agency) : 99;
    if (ai !== bi) return ai - bi;
    if (a.limitType !== b.limitType) return a.limitType === "regular" ? -1 : 1;
    return String(a.item.applicable_product || "").localeCompare(String(b.item.applicable_product || ""));
  });
}

function rowBasis(row) {
  const item = row.item;
  if (row.limitType === "interim") {
    const bits = [];
    if (item.basis) bits.push(item.basis);
    if (item.applicable_product) bits.push(`适用产品：${item.applicable_product}`);
    if (item.official_control_display) bits.push(`FDA公布控制限度：${item.official_control_display}`);
    if (item.estimated_duration) bits.push(`预计复核日期：${item.estimated_duration}`);
    return bits.join("；") || "FDA Table 3临时AI";
  }
  const bits = [item.basis || sourceLabel(item.status)];
  if (item.source_table && !bits[0].includes(item.source_table)) bits.push(item.source_table);
  return bits.filter(Boolean).join("；");
}

function appendSourceLink(cell, item) {
  const link = document.createElement("a");
  link.href = item.source_url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.className = "source-link";
  link.textContent = item.source_version || "打开原文";
  cell.appendChild(link);
}

function renderResults() {
  const container = el("resultCards");
  container.innerHTML = "";

  if (!state.matches.length) {
    renderEmpty("没有找到匹配项。建议改用 CAS、英文名、中文通用名、英文缩写或相关药物名称；也可检查拼写。");
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
    if ((record.related_substances || []).length) {
      const relatedDisplay = displayRelatedSubstances(record);
      metaBits.push(`相关药物：${relatedDisplay.slice(0, 8).join("、")}${relatedDisplay.length > 8 ? "…" : ""}`);
    }
    fragment.querySelector(".compound-meta").textContent = metaBits.join("；") || "监管限度记录";

    const rows = recordRows(record);
    const regularCount = Object.keys(record.regulators || {}).length;
    const specialCount = (record.special_limits || []).length;
    fragment.querySelector(".record-badge").textContent = specialCount
      ? `${regularCount} 个常规来源 + ${specialCount} 条临时/特殊限度`
      : `${regularCount} 个监管来源`;

    if ((record.aliases || []).length) {
      const aliasBlock = fragment.querySelector(".alias-block");
      aliasBlock.classList.remove("hidden");
      aliasBlock.textContent = `别名 / 缩写：${record.aliases.join("、")}`;
    }

    const tbody = fragment.querySelector("tbody");
    rows.forEach(row => {
      const item = row.item;
      const tr = document.createElement("tr");
      if (row.limitType === "interim") tr.classList.add("interim-row");
      tr.appendChild(makeCell(row.agencyLabel));
      tr.appendChild(makeCell(item.ai_ng_day !== null ? `${formatNumber(item.ai_ng_day)} ng/day` : item.ai_display, "ai"));
      tr.appendChild(makeCell(formatPpm(item.ai_ng_day, state.mdd), "ppm"));
      tr.appendChild(makeCell(item.cpca_category || "—"));

      const basis = rowBasis(row);
      const basisCell = makeCell(basis);
      if (["reference", "nmi", "other", "interim"].includes(item.status) || row.limitType === "interim") {
        const span = document.createElement("span");
        span.className = row.limitType === "interim" ? "note-interim" : "note-ref";
        span.textContent = basis;
        basisCell.textContent = "";
        basisCell.appendChild(span);
      }
      tr.appendChild(basisCell);
      tr.appendChild(makeCell(item.publication_date || "—"));

      const linkCell = document.createElement("td");
      appendSourceLink(linkCell, item);
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
    recordRows(record).forEach(row => {
      const item = row.item;
      const ppm = formatPpm(item.ai_ng_day, state.mdd);
      lines.push(`- ${row.agencyLabel}: ${item.ai_ng_day !== null ? `${formatNumber(item.ai_ng_day)} ng/day` : item.ai_display}; 按当前MDD换算 ${ppm}; ${rowBasis(row)}`);
    });
    lines.push("");
  });
  lines.push("注：普通AI的ppm按 AI(ng/day) ÷ MDD(mg/day)换算。FDA Table 3官方control limit为产品特异性临时值，应以表中产品和期限为准。");
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
  const rows = [[
    "CAS", "名称", "监管机构", "限度类型", "AI (ng/day)", "按当前MDD换算 (ppm)", "MDD (mg/day)",
    "官方产品控制限度 (ppm)", "适用产品", "预计复核日期", "CPCA", "依据/状态", "发布日期", "来源"
  ]];
  state.matches.forEach(record => {
    recordRows(record).forEach(row => {
      const item = row.item;
      rows.push([
        record.cas,
        record.name,
        row.agency,
        row.limitType,
        item.ai_ng_day ?? item.ai_display,
        item.ai_ng_day !== null ? item.ai_ng_day / state.mdd : "",
        state.mdd,
        item.official_control_ppm ?? "",
        item.applicable_product || "",
        item.estimated_duration || "",
        item.cpca_category || "",
        rowBasis(row),
        item.publication_date || "",
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
