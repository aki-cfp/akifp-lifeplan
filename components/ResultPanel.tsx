import { useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import type { MCYear, Params } from "@/lib/types";
import { yen } from "@/lib/format";
import { NAVY, GOLD, LIGHTGOLD, BLUE, RED } from "@/lib/brand";

export function ResultPanel({
  result,
  p,
  showTable,
  setShowTable,
  clientName,
  setClientName,
  consultDate,
  setConsultDate,
  onExportPDF,
}: {
  result: MCYear[];
  p: Params;
  showTable: boolean;
  setShowTable: (v: boolean) => void;
  clientName: string;
  setClientName: (v: string) => void;
  consultDate: string;
  setConsultDate: (v: string) => void;
  onExportPDF: () => void;
}) {
  const summary = useMemo(() => {
    const dep = result.find((r) => r.expected < 0); // 枯渇＝残高が初めてマイナスになる年齢
    const last = result[result.length - 1];
    const belowTarget = !dep && p.target > 0 && last.expected < p.target;
    return {
      depAge: dep ? dep.age : null,
      belowTarget,
      lastBal: last.expected,
      lastMedian: last.p50,
      target: p.target,
    };
  }, [result, p.target]);

  const summaryBg = summary.depAge ? RED : summary.belowTarget ? "#b8860b" : NAVY;

  return (
    <div className="grid gap-4 lg:sticky lg:top-4 self-start print-results">
      {/* PDF設定（画面のみ） */}
      <div className="no-print rounded-lg bg-white p-3 border grid gap-2" style={{ borderColor: "#e2e8f0" }}>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-sm">
            <span style={{ color: NAVY }} className="font-medium">お客様名（レポート用）</span>
            <input
              type="text"
              value={clientName}
              placeholder="例：田中 太郎"
              onChange={(e) => setClientName(e.target.value)}
              className="rounded border px-2 py-1.5 text-sm"
              style={{ borderColor: "#cbd5e1" }}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span style={{ color: NAVY }} className="font-medium">作成日</span>
            <input
              type="text"
              value={consultDate}
              onChange={(e) => setConsultDate(e.target.value)}
              className="rounded border px-2 py-1.5 text-sm text-right"
              style={{ borderColor: "#cbd5e1" }}
            />
          </label>
        </div>
        <button onClick={onExportPDF} className="w-full rounded-lg py-2.5 font-bold text-white shadow" style={{ background: NAVY }}>
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
      <div className="rounded-lg p-4 text-white" style={{ background: summaryBg }}>
        <div className="text-sm font-medium opacity-80">分析結果（平均的ケース）</div>
        {summary.depAge ? (
          <p className="text-lg font-bold mt-1">{summary.depAge}歳時点で資産が底をつく（枯渇する）可能性があります。</p>
        ) : summary.belowTarget ? (
          <p className="text-lg font-bold mt-1">資産は枯渇しませんが、目標額（{yen(summary.target)}万円）には届かない見込みです。</p>
        ) : (
          <p className="text-lg font-bold mt-1">目標年齢まで資産は枯渇せず、目標も確保できる見込みです。</p>
        )}
        <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
          <div className="rounded bg-white/10 p-2">
            <div className="opacity-70 text-xs">平均的ケース／{p.targetAge}歳</div>
            <div className="font-bold text-base">{yen(summary.lastBal)}万円</div>
          </div>
          <div className="rounded bg-white/10 p-2">
            <div className="opacity-70 text-xs">中央値（50%）／{p.targetAge}歳</div>
            <div className="font-bold text-base">{yen(summary.lastMedian)}万円</div>
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
            <Tooltip
              formatter={(v: number | number[]) =>
                Array.isArray(v) ? `${yen(v[0])}〜${yen(v[1])}` : `${yen(v)} 万円`
              }
              labelFormatter={(l) => `${l}歳`}
            />
            <ReferenceLine y={0} stroke="#999" />
            {p.target > 0 && <ReferenceLine y={p.target} stroke={GOLD} strokeDasharray="4 4" />}
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
            <Tooltip formatter={(v: number) => `${yen(v)} 万円`} labelFormatter={(l) => `${l}歳`} />
            <ReferenceLine y={0} stroke="#999" />
            <Bar dataKey="net" name="収支差額">
              {result.map((r, i) => (
                <Cell key={i} fill={r.net >= 0 ? BLUE : RED} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <button
        onClick={() => setShowTable(!showTable)}
        className="text-sm rounded px-3 py-2 font-medium border no-print"
        style={{ borderColor: NAVY, color: NAVY }}
      >
        {showTable ? "明細表を隠す" : "明細表を表示する"}
      </button>

      {showTable && (
        <div className="rounded-lg bg-white border overflow-auto max-h-96 print-table-wrap" style={{ borderColor: "#e2e8f0" }}>
          <table className="w-full text-xs">
            <thead className="sticky top-0" style={{ background: NAVY, color: "white" }}>
              <tr>
                {["歳", "収入", "支出", "収支", "残高(平均)"].map((h) => (
                  <th key={h} className="px-2 py-1.5 text-right">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.map((r, i) => (
                <tr key={i} style={{ background: i % 2 ? "#FBF6E9" : "white" }}>
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
  );
}
