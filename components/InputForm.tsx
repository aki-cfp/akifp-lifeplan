import type { Dispatch, SetStateAction } from "react";
import type { Housing, Params } from "@/lib/types";
import { EDU_PATTERNS, PENSION_REF, RETIREMENT_REF } from "@/lib/statistics";
import { NAVY, GOLD, CREAM, LIGHTGOLD, RED } from "@/lib/brand";
import { Field, Section } from "./ui";

export function InputForm({
  p,
  setP,
  onRun,
}: {
  p: Params;
  setP: Dispatch<SetStateAction<Params>>;
  onRun: () => void;
}) {
  const set = <K extends keyof Params>(k: K, v: Params[K]) =>
    setP((s) => ({ ...s, [k]: v }));
  const setH = <K extends keyof Housing>(k: K, v: Housing[K]) =>
    setP((s) => ({ ...s, housing: { ...s.housing, [k]: v } }));

  return (
    <div className="grid gap-3 no-print">
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
            <Field label="配偶者 退職金(手取り)" value={p.spouseRetireLump} onChange={(v) => set("spouseRetireLump", v)} suffix="万円" />
            <Field label="配偶者 年金(年額)" value={p.spousePension} onChange={(v) => set("spousePension", v)} suffix="万円" />
            <Field label="配偶者 年金開始" value={p.spousePensionAge} onChange={(v) => set("spousePensionAge", v)} suffix="歳" />
          </div>
        )}
        <div className="rounded-lg p-3 text-xs" style={{ background: CREAM, border: `1px solid ${LIGHTGOLD}` }}>
          <p className="font-bold mb-1.5" style={{ color: NAVY }}>📊 入力の参考値（最新統計）</p>
          <p className="mb-0.5" style={{ color: "#475569" }}>▶ 公的年金（令和7年度）</p>
          <p className="mb-1.5" style={{ color: "#334155" }}>
            会社員モデル本人（厚生年金+基礎年金）: 約<b>{PENSION_REF.employeeModel}</b>万/年 ／ 国民年金満額（専業主婦等）: 約<b>{PENSION_REF.basicFull}</b>万/年
          </p>
          <p className="mb-0.5" style={{ color: "#475569" }}>▶ 退職金（厚労省 令和5年就労条件総合調査）</p>
          <p style={{ color: "#334155" }}>
            大卒・定年退職 全規模平均: 約<b>{RETIREMENT_REF.average.toLocaleString()}</b>万円 ／ 大企業（中央労委 令和5年）: 約<b>{RETIREMENT_REF.largeCompany.toLocaleString()}</b>万円
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
          <select
            value={p.housing.type}
            onChange={(e) => setH("type", e.target.value as Housing["type"])}
            className="rounded border px-2 py-1.5"
            style={{ borderColor: "#cbd5e1" }}
          >
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
              <button
                onClick={() => set("children", p.children.filter((_, j) => j !== i))}
                className="text-xs px-2 py-0.5 rounded"
                style={{ color: RED }}
              >
                削除
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="現在の年齢"
                value={c.age}
                onChange={(v) => set("children", p.children.map((x, j) => (j === i ? { ...x, age: v } : x)))}
                suffix="歳"
              />
              <label className="flex flex-col gap-1 text-sm">
                <span style={{ color: NAVY }} className="font-medium">進路</span>
                <select
                  value={c.pattern}
                  onChange={(e) =>
                    set("children", p.children.map((x, j) => (j === i ? { ...x, pattern: e.target.value as typeof x.pattern } : x)))
                  }
                  className="rounded border px-2 py-1.5 text-xs"
                  style={{ borderColor: "#cbd5e1" }}
                >
                  {Object.entries(EDU_PATTERNS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ))}
        <button
          onClick={() => set("children", [...p.children, { age: 0, pattern: "B" }])}
          className="text-sm rounded px-3 py-1.5 font-medium"
          style={{ background: GOLD, color: NAVY }}
        >
          ＋ お子様を追加
        </button>
      </Section>

      <Section title="⑤ 夢・ライフイベント">
        {p.events.map((e, i) => (
          <div key={i} className="grid gap-2 rounded border p-2" style={{ borderColor: "#e2e8f0", background: CREAM }}>
            <div className="flex items-center gap-2">
              <input
                value={e.name}
                placeholder="イベント名"
                onChange={(ev) => set("events", p.events.map((x, j) => (j === i ? { ...x, name: ev.target.value } : x)))}
                className="flex-1 rounded border px-2 py-1 text-sm"
                style={{ borderColor: "#cbd5e1" }}
              />
              <button
                onClick={() => set("events", p.events.filter((_, j) => j !== i))}
                className="text-xs px-2 py-0.5 rounded shrink-0"
                style={{ color: RED }}
              >
                削除
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Field label="開始年齢" value={e.from} onChange={(v) => set("events", p.events.map((x, j) => (j === i ? { ...x, from: v } : x)))} suffix="歳" />
              <Field label="終了年齢" value={e.to} onChange={(v) => set("events", p.events.map((x, j) => (j === i ? { ...x, to: v } : x)))} suffix="歳" />
              <Field label="頻度" value={e.every} onChange={(v) => set("events", p.events.map((x, j) => (j === i ? { ...x, every: v } : x)))} suffix="年毎" />
              <Field label="金額" value={e.amount} onChange={(v) => set("events", p.events.map((x, j) => (j === i ? { ...x, amount: v } : x)))} suffix="万円" />
            </div>
            <p className="text-xs text-slate-400">※「頻度=0」で開始年齢に1回のみ。「頻度=1」で毎年。</p>
          </div>
        ))}
        <button
          onClick={() =>
            set("events", [...p.events, { name: "", from: p.currentAge, to: p.currentAge, every: 0, amount: 100 }])
          }
          className="text-sm rounded px-3 py-1.5 font-medium"
          style={{ background: GOLD, color: NAVY }}
        >
          ＋ イベントを追加
        </button>
      </Section>

      <Section title="⑥ 金融資産・運用">
        <div className="grid grid-cols-2 gap-3">
          <Field label="現預金（運用しない）" value={p.cash} onChange={(v) => set("cash", v)} suffix="万円" />
          <Field label="運用資産" value={p.invest} onChange={(v) => set("invest", v)} suffix="万円" />
          <Field label="期待リターン（年率）" value={p.exRet} onChange={(v) => set("exRet", v)} suffix="%" step={0.1} />
          <Field label="リスク（標準偏差）" value={p.risk} onChange={(v) => set("risk", v)} suffix="%" step={0.1} />
        </div>
        <p className="text-xs text-slate-500">※リスクは値動きの振れ幅。例：全世界株式型 ≒ 18%前後、バランス型 ≒ 10%前後。</p>

        <div className="pt-2 border-t grid gap-2" style={{ borderColor: "#e2e8f0" }}>
          <p className="text-sm font-bold" style={{ color: NAVY }}>積立投資（運用資産へ毎年拠出）</p>
          <div className="grid grid-cols-3 gap-2">
            <Field label="年間積立額" value={p.contribAnnual} onChange={(v) => set("contribAnnual", v)} suffix="万円" />
            <Field label="開始年齢" value={p.contribFrom} onChange={(v) => set("contribFrom", v)} suffix="歳" />
            <Field label="終了年齢" value={p.contribTo} onChange={(v) => set("contribTo", v)} suffix="歳" />
          </div>
          <p className="text-xs text-slate-500 -mt-1">例：月5万円の積立 → 年間60万円。NISA等での積立を想定。</p>
        </div>

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

      <button
        onClick={onRun}
        className="w-full rounded-lg py-3 font-bold text-lg shadow"
        style={{ background: GOLD, color: NAVY }}
      >
        シミュレーション実行 ▶
      </button>
    </div>
  );
}
