import { useState, useMemo, useEffect } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, BarChart, Bar, Legend, Cell,
} from "recharts";

/* ===== ブランドカラー ===== */
const NAVY = "#1A2B4A";
const GOLD = "#D4A017";
const LIGHTGOLD = "#F5C242";
const CREAM = "#FBF6E9";
const BLUE = "#2f6fb0";
const RED = "#c0392b";

/* ===== あきFP ブランド・LINE誘導 ===== */
const LINE_GREEN = "#06C755";
const LINE_URL = "https://lin.ee/ZnB7cmv";       // あきFP LINE公式アカウント
const LINE_URL_DISPLAY = "lin.ee/ZnB7cmv";
// QRコードは上記URLをエンコードした25×25行列を内蔵（外部サービス非依存・印刷確実）。
// ※LINE URLを変更した場合は、新しいQR行列への差し替えが必要です。
const QR_RECTS = [[0,0,7],[8,0,1],[10,0,1],[12,0,4],[18,0,7],[0,1,1],[6,1,1],[8,1,3],[12,1,1],[14,1,1],[18,1,1],[24,1,1],[0,2,1],[2,2,3],[6,2,1],[8,2,1],[10,2,1],[12,2,2],[18,2,1],[20,2,3],[24,2,1],[0,3,1],[2,3,3],[6,3,1],[10,3,2],[13,3,4],[18,3,1],[20,3,3],[24,3,1],[0,4,1],[2,4,3],[6,4,1],[8,4,1],[10,4,2],[16,4,1],[18,4,1],[20,4,3],[24,4,1],[0,5,1],[6,5,1],[13,5,2],[16,5,1],[18,5,1],[24,5,1],[0,6,7],[8,6,1],[10,6,1],[12,6,1],[14,6,1],[16,6,1],[18,6,7],[9,7,5],[15,7,1],[0,8,1],[3,8,7],[11,8,2],[14,8,1],[17,8,1],[20,8,1],[22,8,3],[0,9,1],[3,9,1],[8,9,1],[10,9,1],[12,9,1],[14,9,1],[19,9,5],[2,10,1],[4,10,3],[10,10,1],[12,10,6],[20,10,2],[24,10,1],[0,11,1],[5,11,1],[9,11,2],[12,11,1],[14,11,2],[18,11,7],[0,12,4],[5,12,2],[8,12,2],[11,12,1],[16,12,1],[18,12,2],[24,12,1],[0,13,1],[3,13,2],[9,13,2],[12,13,1],[14,13,2],[20,13,1],[23,13,1],[0,14,7],[8,14,3],[13,14,3],[17,14,1],[20,14,5],[0,15,1],[3,15,1],[5,15,1],[12,15,1],[19,15,1],[21,15,2],[24,15,1],[0,16,1],[3,16,2],[6,16,1],[10,16,4],[15,16,6],[22,16,2],[8,17,1],[10,17,2],[14,17,1],[16,17,1],[20,17,1],[22,17,2],[0,18,7],[8,18,1],[12,18,1],[16,18,1],[18,18,1],[20,18,1],[24,18,1],[0,19,1],[6,19,1],[8,19,4],[13,19,4],[20,19,1],[0,20,1],[2,20,3],[6,20,1],[8,20,1],[10,20,2],[13,20,1],[15,20,6],[23,20,2],[0,21,1],[2,21,3],[6,21,1],[8,21,3],[12,21,5],[18,21,1],[23,21,2],[0,22,1],[2,22,3],[6,22,1],[9,22,3],[13,22,1],[17,22,1],[20,22,5],[0,23,1],[6,23,1],[10,23,4],[19,23,2],[22,23,3],[0,24,7],[8,24,6],[16,24,2],[21,24,1],[24,24,1]];
const QrCode = ({ size = 132 }) => (
  <svg width={size} height={size} viewBox="-4 -4 33 33" shapeRendering="crispEdges"
    style={{ borderRadius: 8, boxShadow: "0 1px 6px rgba(0,0,0,.12)" }}>
    <rect x="-4" y="-4" width="33" height="33" fill="#fff" />
    {QR_RECTS.map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height={1} fill="#000" />)}
  </svg>
);

/* ===== 教育費（万円/年）
  幼〜高: 文部科学省「令和5年度子供の学習費調査」(2024/12/25公表・2026/1/16訂正版)
          学校教育費＋給食費＋学校外活動費の合計（年間・子ども1人あたり）
  大学:   国公立は「国立大学等の授業料その他の費用に関する省令」令和5年度標準額
          私立は文科省「令和5年度 私立大学入学者に係る初年度学生納付金等調査」
          ※ 4年間の費用総額を年平均に変換（入学金は初年度のみEDU_ENTRYで加算）
===== */
const EDU = {
  幼: { 公: 18.5, 私: 34.7 },    // 公立16.5→18.5, 私立31→34.7（前回比+12%）
  小: { 公: 36.7, 私: 174.2 },   // 公立35→36.7, 私立167→174.2
  中: { 公: 54.2, 私: 156.0 },   // 公立微増, 私立144→156（前回比+8%）
  高: { 公: 59.7, 私: 117.9 },   // 公立51→59.7（前回比+17%）, 私立105→117.9
  大: { 国公立: 54, 私文: 97, 私理: 131 },
  //  国公立: 授業料標準額535,800円/年, 4年計=(28万入学金+54×4)=244万
  //  私文: 4年計≈412万(文科省令R5), 私理: 4年計≈549万(理系平均)
};
const EDU_ENTRY = { 国公立: 28, 私文: 24, 私理: 25 }; // 大学入学金(初年度のみ加算・万円)

const EDU_PATTERNS = {
  A: { label: "すべて公立＋国公立大", 幼: "公", 小: "公", 中: "公", 高: "公", 大: "国公立" },
  B: { label: "高校まで公立＋私立大(文系)", 幼: "公", 小: "公", 中: "公", 高: "公", 大: "私文" },
  C: { label: "高校まで公立＋私立大(理系)", 幼: "公", 小: "公", 中: "公", 高: "公", 大: "私理" },
  D: { label: "中学から私立＋私立大(文系)", 幼: "公", 小: "公", 中: "私", 高: "私", 大: "私文" },
  E: { label: "すべて私立(文系)", 幼: "私", 小: "私", 中: "私", 高: "私", 大: "私文" },
  F: { label: "大学進学なし(高校まで公立)", 幼: "公", 小: "公", 中: "公", 高: "公", 大: null },
};

function stageForAge(a) {
  if (a >= 3 && a <= 5) return "幼";
  if (a >= 6 && a <= 11) return "小";
  if (a >= 12 && a <= 14) return "中";
  if (a >= 15 && a <= 17) return "高";
  if (a >= 18 && a <= 21) return "大";
  return null;
}
function eduCostForChildYear(childAge, pattern) {
  const st = stageForAge(childAge);
  if (!st) return 0;
  const sel = EDU_PATTERNS[pattern][st];
  if (!sel) return 0;
  if (st === "大") {
    let c = EDU.大[sel];
    if (childAge === 18) c += EDU_ENTRY[sel] || 0;
    return c;
  }
  return EDU[st][sel];
}

/* ===== 住宅ローン(元利均等, 年額・万円) ===== */
function annualLoanPayment(balance, years, ratePct) {
  if (balance <= 0 || years <= 0) return 0;
  const mr = ratePct / 100 / 12;
  const n = years * 12;
  if (mr === 0) return balance / years;
  const m = (balance * mr) / (1 - Math.pow(1 + mr, -n));
  return m * 12;
}
function housingForAge(p, age) {
  const h = p.housing;
  const yf = age - p.currentAge;
  if (h.type === "rent") return (h.rentMonthly || 0) * 12;
  if (h.type === "own_loan") {
    let c = (h.upkeepMonthly || 0) * 12;
    if (yf < h.loanYears) c += annualLoanPayment(h.loanBalance, h.loanYears, h.loanRate);
    return c;
  }
  return (h.upkeepMonthly || 0) * 12; // own_noloan
}

/* ===== 正規乱数(Box-Muller) ===== */
function gauss() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* ===== 1パスのシミュレーション ===== */
const TAX_RATE = 0.20315; // 上場株式等の譲渡益・配当課税(所得税+住民税+復興税)
function simulate(p, randomReturns) {
  const out = [];
  let cash = p.cash;
  let inv = p.invest;
  const rMean = p.exRet / 100, rSd = p.risk / 100;
  for (let age = p.currentAge; age <= p.targetAge; age++) {
    const yf = age - p.currentAge;
    let r = randomReturns ? rMean + rSd * gauss() : rMean;
    if (p.taxable && r > 0) r = r * (1 - TAX_RATE); // 課税口座: プラスリターン部分に課税(簡易)
    inv = inv * (1 + r);
    if (inv < 0) inv = 0;

    // 積立投資（運用資産へ拠出。キャッシュから支出）
    const contrib = (p.contribAnnual > 0 && age >= p.contribFrom && age <= p.contribTo) ? p.contribAnnual : 0;
    inv += contrib;

    let income = 0;
    if (age < p.retireAge) income += p.income;
    if (age === p.retireAge) income += p.retireLump;
    if (age >= p.pensionAge) income += p.pension;
    if (p.hasSpouse) {
      const sAge = p.spouseAge + yf;
      if (sAge < p.spouseRetireAge) income += p.spouseIncome;
      if (sAge === p.spouseRetireAge) income += p.spouseRetireLump;
      if (sAge >= p.spousePensionAge) income += p.spousePension;
    }

    let expense = 0;
    const baseLiving = age < p.retireSpendAge ? p.living : p.livingRetired; // 退職前後で生活費を切替
    expense += baseLiving * Math.pow(1 + p.livingGrowth / 100, yf);
    expense += housingForAge(p, age);
    p.children.forEach((c) => {
      expense += eduCostForChildYear(c.age + yf, c.pattern);
    });
    p.events.forEach((e) => {
      if (e.every > 0) {
        if (age >= e.from && age <= e.to && (age - e.from) % e.every === 0) expense += e.amount;
      } else if (age === e.from) expense += e.amount;
    });

    const net = income - expense;   // 収支差額（積立は資産内移動のため表示から除外）
    cash += net - contrib;          // 現預金からは生活支出に加え積立拠出も差し引く
    if (cash < 0) { const pull = Math.min(inv, -cash); inv -= pull; cash += pull; }
    // 余剰資金を運用に回す（現預金バッファ超過分を運用資産へ）
    if (p.investSurplus && cash > p.cashBuffer) { const move = cash - p.cashBuffer; cash -= move; inv += move; }
    out.push({ age, income: Math.round(income), expense: Math.round(expense), net: Math.round(net), total: cash + inv });
  }
  return out;
}

/* ===== モンテカルロ集計 ===== */
function runMC(p, trials) {
  const n = p.targetAge - p.currentAge + 1;
  const cols = Array.from({ length: n }, () => []);
  for (let t = 0; t < trials; t++) {
    simulate(p, true).forEach((y, i) => cols[i].push(y.total));
  }
  const pct = (arr, q) => {
    const s = [...arr].sort((a, b) => a - b);
    const idx = (s.length - 1) * q, lo = Math.floor(idx), hi = Math.ceil(idx);
    return s[lo] + (s[hi] - s[lo]) * (idx - lo);
  };
  const exp = simulate(p, false);
  return cols.map((c, i) => ({
    age: p.currentAge + i,
    p50: Math.round(pct(c, 0.5)),
    expected: Math.round(exp[i].total),
    range90: [Math.round(pct(c, 0.05)), Math.round(pct(c, 0.95))],
    range50: [Math.round(pct(c, 0.25)), Math.round(pct(c, 0.75))],
    income: exp[i].income,
    expense: exp[i].expense,
    net: exp[i].net,
  }));
}

/* ===== UI部品 ===== */
function Field({ label, value, onChange, suffix, step = 1, w }) {
  return (
    <label className="flex flex-col gap-1 text-sm" style={{ minWidth: w || "auto" }}>
      <span style={{ color: NAVY }} className="font-medium">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number" step={step} value={value}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="w-full rounded border px-2 py-1.5 text-right"
          style={{ borderColor: "#cbd5e1" }}
        />
        {suffix && <span className="text-xs text-slate-500 shrink-0">{suffix}</span>}
      </div>
    </label>
  );
}
function Section({ title, children, open }) {
  return (
    <details open={open} className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
      <summary className="cursor-pointer select-none px-4 py-3 font-bold text-white" style={{ background: NAVY }}>
        {title}
      </summary>
      <div className="p-4 grid gap-3">{children}</div>
    </details>
  );
}

const yen = (n) => (n < 0 ? "▲" + Math.abs(n).toLocaleString() : n.toLocaleString());

const DEFAULTS = {
  currentAge: 40, targetAge: 95, target: 0,
  income: 500, retireAge: 65, retireLump: 1000, pension: 180, pensionAge: 65,
  hasSpouse: true, spouseAge: 38, spouseIncome: 200, spouseRetireAge: 60,
  spouseRetireLump: 0, spousePension: 83, spousePensionAge: 65, // 国民年金満額(令和7年度)83万円/年
  living: 300, livingGrowth: 1.0,
  livingRetired: 240, retireSpendAge: 65, // 退職後の生活費(年額)と切替年齢
  housing: { type: "own_loan", rentMonthly: 10, loanBalance: 2000, loanYears: 25, loanRate: 1.0, upkeepMonthly: 1.5 },
  children: [{ age: 5, pattern: "B" }],
  events: [{ name: "旅行", from: 41, to: 65, every: 1, amount: 30 }, { name: "車買替", from: 48, to: 88, every: 8, amount: 250 }],
  cash: 500, invest: 1000, exRet: 4.0, risk: 12.0,
  contribAnnual: 60, contribFrom: 40, contribTo: 65, // 年間積立額(万円)と積立期間
  investSurplus: false, cashBuffer: 300,            // 余剰資金を運用に回すか＋現預金バッファ
  taxable: false,                                    // 運用益への課税(課税口座)
};

export default function App() {
  const [p, setP] = useState(DEFAULTS);
  const [result, setResult] = useState(() => runMC(DEFAULTS, 800));
  const [showTable, setShowTable] = useState(false);
  const set = (k, v) => setP((s) => ({ ...s, [k]: v }));
  const setH = (k, v) => setP((s) => ({ ...s, housing: { ...s.housing, [k]: v } }));

  const run = () => setResult(runMC(p, 800));

  /* ===== プラン保存・読込 ===== */
  const [savedPlans, setSavedPlans] = useState([]);
  const [planName, setPlanName] = useState("");
  const [saveStatus, setSaveStatus] = useState(""); // "" | "saving" | "saved" | "noname" | "error"

  const refreshPlans = async () => {
    try {
      const res = await window.storage.list("lp-");
      if (!res || !res.keys || res.keys.length === 0) { setSavedPlans([]); return; }
      const plans = (await Promise.all(
        res.keys.map(async (k) => {
          try { const r = await window.storage.get(k); return { key: k, ...JSON.parse(r.value) }; }
          catch { return null; }
        })
      )).filter(Boolean).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
      setSavedPlans(plans);
    } catch { setSavedPlans([]); }
  };

  useEffect(() => { refreshPlans(); }, []);

  const savePlan = async () => {
    if (!planName.trim()) { setSaveStatus("noname"); setTimeout(() => setSaveStatus(""), 2000); return; }
    setSaveStatus("saving");
    try {
      const key = `lp-${Date.now()}`;
      await window.storage.set(key, JSON.stringify({ name: planName.trim(), savedAt: new Date().toISOString(), params: p }));
      setSaveStatus("saved"); setPlanName("");
      setTimeout(() => setSaveStatus(""), 2500);
      await refreshPlans();
    } catch { setSaveStatus("error"); setTimeout(() => setSaveStatus(""), 2500); }
  };

  const loadPlan = (plan) => { setP(plan.params); setResult(runMC(plan.params, 800)); };

  const deletePlan = async (key) => {
    try { await window.storage.delete(key); await refreshPlans(); }
    catch (e) { console.error(e); }
  };
  /* ============================= */

  /* ===== PDF出力（印刷） ===== */
  const [clientName, setClientName] = useState("");
  const [consultDate, setConsultDate] = useState(() => new Date().toISOString().slice(0, 10).replace(/-/g, "/"));
  const exportPDF = () => { setShowTable(true); setTimeout(() => window.print(), 350); };

  const summary = useMemo(() => {
    if (!result) return null;
    const dep = result.find((r) => r.expected < 0);        // 枯渇＝残高がマイナスになる最初の年齢
    const last = result[result.length - 1];
    const belowTarget = !dep && p.target > 0 && last.expected < p.target; // 枯渇しないが目標額に届かない
    return { depAge: dep ? dep.age : null, belowTarget, lastBal: last.expected, lastMedian: last.p50, target: p.target };
  }, [result, p.target]);

  return (
    <div className="min-h-screen p-3 sm:p-5" style={{ background: "#f1f5f9", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        .print-only { display: none; }
        @media print {
          @page { margin: 12mm; size: A4 portrait; }
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .print-grid { display: block !important; }
          .print-results { position: static !important; gap: 14px !important; }
          .print-results > div { break-inside: avoid; page-break-inside: avoid; }
          .print-table-wrap { max-height: none !important; overflow: visible !important; }
          .print-header { box-shadow: none !important; }
        }
      `}</style>
      <div className="mx-auto max-w-5xl">
        {/* ヘッダー */}
        <div className="rounded-lg p-5 mb-4 text-white no-print" style={{ background: `linear-gradient(135deg, ${NAVY}, #2a4570)` }}>
          <div className="flex items-center justify-between">
            <div className="text-xs tracking-widest" style={{ color: LIGHTGOLD }}>LIFE PLAN SIMULATION</div>
            <div className="text-sm font-bold">あきFP</div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1">ライフプラン診断</h1>
          <p className="text-xs sm:text-sm opacity-80 mt-1">人生100年時代に備える、あなたのための資産シミュレーション</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 print-grid">
          {/* 保存・読込 */}
          <div className="grid gap-3 no-print">
            {/* 保存パネル */}
            <div className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-2.5 font-bold text-white text-sm flex items-center gap-2" style={{ background: NAVY }}>
                💾 プランの保存・読込
              </div>
              <div className="p-4 grid gap-3">
                {/* 保存フォーム */}
                <div className="flex gap-2">
                  <input
                    type="text" value={planName} placeholder="プラン名（例：田中様_2026）"
                    onChange={(e) => setPlanName(e.target.value)}
                    className="flex-1 rounded border px-3 py-2 text-sm"
                    style={{ borderColor: "#cbd5e1" }}
                    onKeyDown={(e) => e.key === "Enter" && savePlan()}
                  />
                  <button onClick={savePlan}
                    className="shrink-0 rounded px-3 py-2 text-sm font-bold text-white"
                    style={{ background: saveStatus === "saving" ? "#94a3b8" : NAVY }}>
                    {saveStatus === "saving" ? "保存中…" : "保存"}
                  </button>
                </div>
                {/* ステータス */}
                {saveStatus === "saved" && <p className="text-xs font-medium" style={{ color: "#16a34a" }}>✅ 保存しました</p>}
                {saveStatus === "noname" && <p className="text-xs" style={{ color: RED }}>⚠ プラン名を入力してください</p>}
                {saveStatus === "error" && <p className="text-xs" style={{ color: RED }}>❌ 保存に失敗しました</p>}
                {/* 保存済みプラン一覧 */}
                {savedPlans.length > 0 ? (
                  <div className="grid gap-2 mt-1">
                    <p className="text-xs font-bold" style={{ color: NAVY }}>保存済みプラン（{savedPlans.length}件）</p>
                    {savedPlans.map((pl) => (
                      <div key={pl.key} className="flex items-center gap-2 rounded p-2 text-sm" style={{ background: CREAM, border: `1px solid ${LIGHTGOLD}` }}>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate" style={{ color: NAVY }}>{pl.name}</p>
                          <p className="text-xs text-slate-400">{new Date(pl.savedAt).toLocaleString("ja-JP")}</p>
                        </div>
                        <button onClick={() => loadPlan(pl)}
                          className="shrink-0 rounded px-2 py-1 text-xs font-bold text-white"
                          style={{ background: BLUE }}>読込</button>
                        <button onClick={() => deletePlan(pl.key)}
                          className="shrink-0 rounded px-2 py-1 text-xs font-bold"
                          style={{ color: RED, border: `1px solid ${RED}` }}>削除</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">まだ保存されたプランはありません</p>
                )}
              </div>
            </div>

            <Section title="① ご家族・目標" open>
              <div className="grid grid-cols-2 gap-3">
                <Field label="ご本人 現在の年齢" value={p.currentAge} onChange={(v) => set("currentAge", v)} suffix="歳" />
                <Field label="分析する年齢（目標）" value={p.targetAge} onChange={(v) => set("targetAge", v)} suffix="歳" />
                <Field label="残したい金額（目標）" value={p.target} onChange={(v) => set("target", v)} suffix="万円" />
              </div>
              <label className="flex items-center gap-2 text-sm" style={{ color: NAVY }}>
                <input type="checkbox" checked={p.hasSpouse} onChange={(e) => set("hasSpouse", e.target.checked)} />
                配偶者あり
              </label>
              {p.hasSpouse && (
                <Field label="配偶者 現在の年齢" value={p.spouseAge} onChange={(v) => set("spouseAge", v)} suffix="歳" />
              )}
            </Section>

            <Section title="② 収入（手取りベース）">
              <p className="text-xs text-slate-500 -mt-1">※税・社会保険を引いた「実際に使える額」でご入力ください</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="ご本人 手取り年収" value={p.income} onChange={(v) => set("income", v)} suffix="万円" />
                <Field label="退職予定年齢" value={p.retireAge} onChange={(v) => set("retireAge", v)} suffix="歳" />
                <Field label="退職金（手取り）" value={p.retireLump} onChange={(v) => set("retireLump", v)} suffix="万円" />
                <Field label="公的年金（年額・手取り）" value={p.pension} onChange={(v) => set("pension", v)} suffix="万円" />
                <Field label="年金 受給開始" value={p.pensionAge} onChange={(v) => set("pensionAge", v)} suffix="歳" />
              </div>
              {p.hasSpouse && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t" style={{ borderColor: "#e2e8f0" }}>
                  <Field label="配偶者 手取り年収" value={p.spouseIncome} onChange={(v) => set("spouseIncome", v)} suffix="万円" />
                  <Field label="配偶者 退職年齢" value={p.spouseRetireAge} onChange={(v) => set("spouseRetireAge", v)} suffix="歳" />
                  <Field label="配偶者 年金(年額)" value={p.spousePension} onChange={(v) => set("spousePension", v)} suffix="万円" />
                  <Field label="配偶者 年金開始" value={p.spousePensionAge} onChange={(v) => set("spousePensionAge", v)} suffix="歳" />
                </div>
              )}
              {/* 参考値パネル */}
              <div className="rounded-lg p-3 text-xs" style={{ background: CREAM, border: `1px solid ${LIGHTGOLD}` }}>
                <p className="font-bold mb-1.5" style={{ color: NAVY }}>📊 入力の参考値（最新統計）</p>
                <p className="mb-0.5" style={{ color: "#475569" }}>▶ 公的年金（令和7年度）</p>
                <p className="mb-1.5" style={{ color: "#334155" }}>
                  会社員モデル本人（厚生年金+基礎年金）: 約<b>196</b>万/年 ／ 国民年金満額（専業主婦等）: 約<b>83</b>万/年
                </p>
                <p className="mb-0.5" style={{ color: "#475569" }}>▶ 退職金（厚労省 令和5年就労条件総合調査）</p>
                <p style={{ color: "#334155" }}>
                  大卒・定年退職 全規模平均: 約<b>1,896</b>万円 ／ 大企業（中央労委 令和5年）: 約<b>2,140</b>万円
                </p>
                <p className="mt-1.5" style={{ color: "#94724a", fontSize: 11 }}>
                  ※上記は<b>額面（控除前）</b>です。本ツールは手取り前提のため、年金は概ね9割程度、退職金は退職所得控除によりほぼ全額が手取り目安。実態に合わせて調整してください。
                </p>
              </div>
            </Section>

            <Section title="③ 支出（生活費・住居費）">
              <div className="grid grid-cols-2 gap-3">
                <Field label="現役期の年間生活費" value={p.living} onChange={(v) => set("living", v)} suffix="万円" />
                <Field label="生活費 上昇率(物価)" value={p.livingGrowth} onChange={(v) => set("livingGrowth", v)} suffix="%/年" step={0.1} />
                <Field label="退職後の年間生活費" value={p.livingRetired} onChange={(v) => set("livingRetired", v)} suffix="万円" />
                <Field label="生活費の切替年齢" value={p.retireSpendAge} onChange={(v) => set("retireSpendAge", v)} suffix="歳" />
              </div>
              <p className="text-xs text-slate-500 -mt-1">※切替年齢以降は「退職後の生活費」を使用（一般に現役期より減少）。住居費・教育費は別計算。</p>
              <label className="flex flex-col gap-1 text-sm">
                <span style={{ color: NAVY }} className="font-medium">住居の種類</span>
                <select value={p.housing.type} onChange={(e) => setH("type", e.target.value)}
                  className="rounded border px-2 py-1.5" style={{ borderColor: "#cbd5e1" }}>
                  <option value="rent">賃貸</option>
                  <option value="own_loan">持家（ローン返済中）</option>
                  <option value="own_noloan">持家（ローン無し）</option>
                </select>
              </label>
              {p.housing.type === "rent" && (
                <Field label="家賃＋管理費（月額）" value={p.housing.rentMonthly} onChange={(v) => setH("rentMonthly", v)} suffix="万円/月" step={0.1} />
              )}
              {p.housing.type === "own_loan" && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="ローン残高" value={p.housing.loanBalance} onChange={(v) => setH("loanBalance", v)} suffix="万円" />
                  <Field label="残り返済期間" value={p.housing.loanYears} onChange={(v) => setH("loanYears", v)} suffix="年" />
                  <Field label="ローン金利" value={p.housing.loanRate} onChange={(v) => setH("loanRate", v)} suffix="%" step={0.01} />
                  <Field label="維持費・管理費(月)" value={p.housing.upkeepMonthly} onChange={(v) => setH("upkeepMonthly", v)} suffix="万円/月" step={0.1} />
                </div>
              )}
              {p.housing.type === "own_noloan" && (
                <Field label="維持費・固定資産税等(月)" value={p.housing.upkeepMonthly} onChange={(v) => setH("upkeepMonthly", v)} suffix="万円/月" step={0.1} />
              )}
            </Section>

            <Section title="④ お子様の教育費">
              {p.children.map((c, i) => (
                <div key={i} className="grid gap-2 rounded border p-2" style={{ borderColor: "#e2e8f0", background: CREAM }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold" style={{ color: NAVY }}>お子様 {i + 1}</span>
                    <button onClick={() => set("children", p.children.filter((_, j) => j !== i))}
                      className="text-xs px-2 py-0.5 rounded" style={{ color: RED }}>削除</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="現在の年齢" value={c.age}
                      onChange={(v) => set("children", p.children.map((x, j) => j === i ? { ...x, age: v } : x))} suffix="歳" />
                    <label className="flex flex-col gap-1 text-sm">
                      <span style={{ color: NAVY }} className="font-medium">進路</span>
                      <select value={c.pattern}
                        onChange={(e) => set("children", p.children.map((x, j) => j === i ? { ...x, pattern: e.target.value } : x))}
                        className="rounded border px-2 py-1.5 text-xs" style={{ borderColor: "#cbd5e1" }}>
                        {Object.entries(EDU_PATTERNS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </label>
                  </div>
                </div>
              ))}
              <button onClick={() => set("children", [...p.children, { age: 0, pattern: "B" }])}
                className="text-sm rounded px-3 py-1.5 font-medium" style={{ background: GOLD, color: NAVY }}>＋ お子様を追加</button>
            </Section>

            <Section title="⑤ 夢・ライフイベント">
              {p.events.map((e, i) => (
                <div key={i} className="grid gap-2 rounded border p-2" style={{ borderColor: "#e2e8f0", background: CREAM }}>
                  <div className="flex items-center gap-2">
                    <input value={e.name} placeholder="イベント名"
                      onChange={(ev) => set("events", p.events.map((x, j) => j === i ? { ...x, name: ev.target.value } : x))}
                      className="flex-1 rounded border px-2 py-1 text-sm" style={{ borderColor: "#cbd5e1" }} />
                    <button onClick={() => set("events", p.events.filter((_, j) => j !== i))}
                      className="text-xs px-2 py-0.5 rounded shrink-0" style={{ color: RED }}>削除</button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Field label="開始年齢" value={e.from} onChange={(v) => set("events", p.events.map((x, j) => j === i ? { ...x, from: v } : x))} suffix="歳" />
                    <Field label="終了年齢" value={e.to} onChange={(v) => set("events", p.events.map((x, j) => j === i ? { ...x, to: v } : x))} suffix="歳" />
                    <Field label="頻度" value={e.every} onChange={(v) => set("events", p.events.map((x, j) => j === i ? { ...x, every: v } : x))} suffix="年毎" />
                    <Field label="金額" value={e.amount} onChange={(v) => set("events", p.events.map((x, j) => j === i ? { ...x, amount: v } : x))} suffix="万円" />
                  </div>
                  <p className="text-xs text-slate-400">※「頻度=0」で開始年齢に1回のみ。「頻度=1」で毎年。</p>
                </div>
              ))}
              <button onClick={() => set("events", [...p.events, { name: "", from: p.currentAge, to: p.currentAge, every: 0, amount: 100 }])}
                className="text-sm rounded px-3 py-1.5 font-medium" style={{ background: GOLD, color: NAVY }}>＋ イベントを追加</button>
            </Section>

            <Section title="⑥ 金融資産・運用">
              <div className="grid grid-cols-2 gap-3">
                <Field label="現預金（運用しない）" value={p.cash} onChange={(v) => set("cash", v)} suffix="万円" />
                <Field label="運用資産" value={p.invest} onChange={(v) => set("invest", v)} suffix="万円" />
                <Field label="期待リターン（年率）" value={p.exRet} onChange={(v) => set("exRet", v)} suffix="%" step={0.1} />
                <Field label="リスク（標準偏差）" value={p.risk} onChange={(v) => set("risk", v)} suffix="%" step={0.1} />
              </div>
              <p className="text-xs text-slate-500">※リスクは値動きの振れ幅。例：全世界株式型 ≒ 18%前後、バランス型 ≒ 10%前後。</p>

              {/* 積立投資 */}
              <div className="pt-2 border-t grid gap-2" style={{ borderColor: "#e2e8f0" }}>
                <p className="text-sm font-bold" style={{ color: NAVY }}>積立投資（運用資産へ毎年拠出）</p>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="年間積立額" value={p.contribAnnual} onChange={(v) => set("contribAnnual", v)} suffix="万円" />
                  <Field label="開始年齢" value={p.contribFrom} onChange={(v) => set("contribFrom", v)} suffix="歳" />
                  <Field label="終了年齢" value={p.contribTo} onChange={(v) => set("contribTo", v)} suffix="歳" />
                </div>
                <p className="text-xs text-slate-500 -mt-1">例：月5万円の積立 → 年間60万円。NISA等での積立を想定。</p>
              </div>

              {/* 余剰運用・課税 */}
              <div className="pt-2 border-t grid gap-2" style={{ borderColor: "#e2e8f0" }}>
                <label className="flex items-center gap-2 text-sm" style={{ color: NAVY }}>
                  <input type="checkbox" checked={p.investSurplus} onChange={(e) => set("investSurplus", e.target.checked)} />
                  余剰資金も運用に回す（バッファ超過分）
                </label>
                {p.investSurplus && (
                  <Field label="現預金として残すバッファ" value={p.cashBuffer} onChange={(v) => set("cashBuffer", v)} suffix="万円" />
                )}
                <label className="flex items-center gap-2 text-sm" style={{ color: NAVY }}>
                  <input type="checkbox" checked={p.taxable} onChange={(e) => set("taxable", e.target.checked)} />
                  運用益に課税する（課税口座・約20.3%）
                </label>
                <p className="text-xs text-slate-500 -mt-1">※チェックなし＝NISA等の非課税運用を想定。</p>
              </div>
            </Section>

            <button onClick={run}
              className="w-full rounded-lg py-3 font-bold text-white text-lg shadow"
              style={{ background: GOLD, color: NAVY }}>
              シミュレーション実行 ▶
            </button>
          </div>

          {/* 結果 */}
          <div className="grid gap-4 lg:sticky lg:top-4 self-start print-results">
            {/* PDF設定（画面のみ） */}
            <div className="no-print rounded-lg bg-white p-3 border grid gap-2" style={{ borderColor: "#e2e8f0" }}>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span style={{ color: NAVY }} className="font-medium">お客様名（レポート用）</span>
                  <input type="text" value={clientName} placeholder="例：田中 太郎"
                    onChange={(e) => setClientName(e.target.value)}
                    className="rounded border px-2 py-1.5 text-sm" style={{ borderColor: "#cbd5e1" }} />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span style={{ color: NAVY }} className="font-medium">作成日</span>
                  <input type="text" value={consultDate}
                    onChange={(e) => setConsultDate(e.target.value)}
                    className="rounded border px-2 py-1.5 text-sm text-right" style={{ borderColor: "#cbd5e1" }} />
                </label>
              </div>
              <button onClick={exportPDF}
                className="w-full rounded-lg py-2.5 font-bold text-white shadow"
                style={{ background: NAVY }}>
                📄 PDF出力（印刷ダイアログ → PDFとして保存）
              </button>
              <p className="text-xs text-slate-400">※入力フォームは印刷されず、結果のみ出力されます。</p>
            </div>

            {/* 印刷用ヘッダー（印刷のみ） */}
            <div className="print-only print-header" style={{ borderBottom: `3px solid ${GOLD}`, paddingBottom: 10, marginBottom: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: GOLD, fontWeight: 700 }}>LIFE PLAN SIMULATION REPORT</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>あきFP</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: NAVY, marginTop: 2 }}>ライフプラン診断レポート</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: NAVY }}>{clientName ? `${clientName} 様` : "お客様"}</div>
                <div style={{ fontSize: 12, color: "#475569" }}>作成日：{consultDate}</div>
              </div>
            </div>

            {/* サマリー */}
            <div className="rounded-lg p-4 text-white" style={{ background: summary?.depAge ? RED : summary?.belowTarget ? "#b8860b" : NAVY }}>
              <div className="text-sm font-medium opacity-80">分析結果（平均的ケース）</div>
              {summary?.depAge ? (
                <p className="text-lg font-bold mt-1">{summary.depAge}歳時点で資産が底をつく（枯渇する）可能性があります。</p>
              ) : summary?.belowTarget ? (
                <p className="text-lg font-bold mt-1">資産は枯渇しませんが、目標額（{yen(summary.target)}万円）には届かない見込みです。</p>
              ) : (
                <p className="text-lg font-bold mt-1">目標年齢まで資産は枯渇せず、目標も確保できる見込みです。</p>
              )}
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div className="rounded bg-white/10 p-2">
                  <div className="opacity-70 text-xs">平均的ケース／{p.targetAge}歳</div>
                  <div className="font-bold text-base">{yen(summary?.lastBal || 0)}万円</div>
                </div>
                <div className="rounded bg-white/10 p-2">
                  <div className="opacity-70 text-xs">中央値（50%）／{p.targetAge}歳</div>
                  <div className="font-bold text-base">{yen(summary?.lastMedian || 0)}万円</div>
                </div>
              </div>
            </div>

            {/* 残高推移グラフ */}
            <div className="rounded-lg bg-white p-3 border" style={{ borderColor: "#e2e8f0" }}>
              <div className="text-sm font-bold mb-2" style={{ color: NAVY }}>金融資産残高の推移（万円）</div>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={result} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="age" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}`} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v.toLocaleString()} width={48} />
                  <Tooltip formatter={(v) => (Array.isArray(v) ? `${yen(v[0])}〜${yen(v[1])}` : `${yen(v)} 万円`)}
                    labelFormatter={(l) => `${l}歳`} />
                  <ReferenceLine y={0} stroke="#999" />
                  <ReferenceLine y={p.target} stroke={GOLD} strokeDasharray="4 4" />
                  <Area dataKey="range90" stroke="none" fill={LIGHTGOLD} fillOpacity={0.25} name="予想範囲(5-95%)" />
                  <Area dataKey="range50" stroke="none" fill={GOLD} fillOpacity={0.3} name="予想範囲(25-75%)" />
                  <Line dataKey="expected" stroke={BLUE} strokeWidth={2.5} dot={false} name="平均的ケース" />
                  <Line dataKey="p50" stroke={NAVY} strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="中央値" />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 text-xs mt-1" style={{ color: NAVY }}>
                <span>━ <span style={{ color: BLUE }}>平均的ケース</span></span>
                <span>┄ 中央値</span>
                <span><span style={{ color: GOLD }}>▮</span> 予想範囲</span>
              </div>
            </div>

            {/* 年間収支 */}
            <div className="rounded-lg bg-white p-3 border" style={{ borderColor: "#e2e8f0" }}>
              <div className="text-sm font-bold mb-2" style={{ color: NAVY }}>年間収支（万円）</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={result} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="age" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={42} />
                  <Tooltip formatter={(v) => `${yen(v)} 万円`} labelFormatter={(l) => `${l}歳`} />
                  <ReferenceLine y={0} stroke="#999" />
                  <Bar dataKey="net" name="収支差額">
                    {result.map((r, i) => <Cell key={i} fill={r.net >= 0 ? BLUE : RED} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <button onClick={() => setShowTable((s) => !s)}
              className="text-sm rounded px-3 py-2 font-medium border no-print" style={{ borderColor: NAVY, color: NAVY }}>
              {showTable ? "明細表を隠す" : "明細表を表示する"}
            </button>
            {showTable && (
              <div className="rounded-lg bg-white border overflow-auto max-h-96 print-table-wrap" style={{ borderColor: "#e2e8f0" }}>
                <table className="w-full text-xs">
                  <thead className="sticky top-0" style={{ background: NAVY, color: "white" }}>
                    <tr>
                      {["歳", "収入", "支出", "収支", "残高(平均)"].map((h) => <th key={h} className="px-2 py-1.5 text-right">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {result.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 ? CREAM : "white" }}>
                        <td className="px-2 py-1 text-right">{r.age}</td>
                        <td className="px-2 py-1 text-right">{yen(r.income)}</td>
                        <td className="px-2 py-1 text-right">{yen(r.expense)}</td>
                        <td className="px-2 py-1 text-right" style={{ color: r.net < 0 ? RED : "inherit" }}>{yen(r.net)}</td>
                        <td className="px-2 py-1 text-right font-medium" style={{ color: r.expected < 0 ? RED : NAVY }}>{yen(r.expected)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 免責・出典 */}
        <div className="mt-5 rounded-lg bg-white p-4 text-xs text-slate-500 border" style={{ borderColor: "#e2e8f0" }}>
          <p className="font-bold mb-1.5" style={{ color: NAVY }}>ご利用にあたって（前提条件・出典）</p>
          <p>● 本ツールは概算把握のための簡易版です。数値は目安であり、実際の金額とは異なります。最終的な資産・老後設計はFP等の専門家にご相談ください。</p>
          <p>● 収入・年金・退職金は「手取り（可処分所得）」前提です。税・社会保険料の精緻な計算は行っていません。生活費は切替年齢の前後で現役期／退職後の2段階を使用します。</p>
          <p>● 運用は期待リターン・リスクによるモンテカルロ法（800試行）で予想範囲を算出。積立投資は運用資産へ毎年拠出されます。運用益課税は任意（チェック時のみ約20.3%を反映、未チェックはNISA等の非課税運用を想定）。</p>
          <p>● 教育費は以下の統計に基づく概算です（下宿費用・受験費用は含まず）。</p>
          <p className="pl-2">
            ▸ 幼〜高校: 文部科学省「令和5年度子供の学習費調査」(2024/12/25公表・2026/1/16訂正版)<br/>
            ▸ 大学: 文部科学省「令和5年度 私立大学入学者に係る初年度学生納付金等調査」・「国立大学等授業料省令 令和5年度」<br/>
            ▸ 公的年金: 厚生労働省「令和7年度 年金額」(モデル世帯・国民年金満額)<br/>
            ▸ 退職金: 厚生労働省「令和5年就労条件総合調査」・中央労働委員会「令和5年賃金事情等総合調査」
          </p>
          <p>● 本ツールは特定の金融商品の取得勧誘・投資助言を目的とするものではありません。最終的な判断はご自身の責任で行ってください。</p>
        </div>

        {/* 屋号・LINE誘導フッター（画面＋印刷） */}
        <div className="mt-4 rounded-lg overflow-hidden border" style={{ borderColor: GOLD }}>
          <div className="grid sm:grid-cols-3">
            {/* 屋号・メッセージ */}
            <div className="p-5 text-white sm:col-span-2" style={{ background: `linear-gradient(135deg, ${NAVY}, #2a4570)` }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: LIGHTGOLD, fontWeight: 700 }}>FINANCIAL PLANNING</div>
              <div className="text-2xl font-bold mt-1">あきFP</div>
              <p className="text-sm mt-3" style={{ lineHeight: 1.7 }}>
                <span style={{ color: LIGHTGOLD, fontWeight: 700 }}>📱 お金・資産形成の情報をLINEで配信中！</span><br />
                家計・教育費・老後資金・資産運用のご相談は、LINE公式アカウントからお気軽にどうぞ。
              </p>
              <div className="inline-flex items-center gap-2 mt-3 rounded px-3 py-1.5 font-bold text-sm"
                style={{ background: LINE_GREEN, color: "#fff" }}>
                友だち追加 ▶ {LINE_URL_DISPLAY}
              </div>
            </div>
            {/* QRコード */}
            <div className="p-4 flex flex-col items-center justify-center gap-2" style={{ background: CREAM }}>
              <QrCode size={132} />
              <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: NAVY, fontWeight: 700 }}>
                <span style={{ background: LINE_GREEN, color: "#fff", borderRadius: 4, padding: "1px 6px", fontSize: 11 }}>LINE</span>
                スマホで読み取り
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
