"use client";

import { useEffect, useState } from "react";
import type { MCYear, Params } from "@/lib/types";
import { DEFAULTS } from "@/lib/defaults";
import { runMC } from "@/lib/montecarlo";
import { NAVY, LIGHTGOLD } from "@/lib/brand";
import { InputForm } from "@/components/InputForm";
import { ResultPanel } from "@/components/ResultPanel";
import { SavePanel } from "@/components/SavePanel";
import { ReportFooter } from "@/components/ReportFooter";

const TRIALS = 800;

export default function Page() {
  const [p, setP] = useState<Params>(DEFAULTS);
  const [result, setResult] = useState<MCYear[] | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [clientName, setClientName] = useState("");
  const [consultDate, setConsultDate] = useState("");

  // 初回はクライアントでのみ計算（モンテカルロの乱数によるSSRハイドレーション不一致を回避）。
  useEffect(() => {
    setResult(runMC(DEFAULTS, TRIALS));
    setConsultDate(new Date().toISOString().slice(0, 10).replace(/-/g, "/"));
  }, []);

  const run = () => setResult(runMC(p, TRIALS));

  const loadPlan = (params: Params) => {
    setP(params);
    setResult(runMC(params, TRIALS));
  };

  const exportPDF = () => {
    setShowTable(true);
    setTimeout(() => window.print(), 350);
  };

  return (
    <div className="min-h-screen p-3 sm:p-5" style={{ background: "#f1f5f9" }}>
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
          {/* 入力（6セクション＋保存は折りたたみ）。
              スマホでは初期値の計算済みグラフを先に見せたいので order を入れ替える。 */}
          <div className="grid gap-3 no-print order-2 lg:order-1">
            <InputForm p={p} setP={setP} onRun={run} />

            <details className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
              <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-bold" style={{ color: NAVY }}>
                💾 プランの保存・読込（面談・再計算用）
              </summary>
              <div className="border-t" style={{ borderColor: "#e2e8f0" }}>
                <SavePanel params={p} onLoad={loadPlan} />
              </div>
            </details>
          </div>

          {/* 結果 */}
          {result ? (
            <ResultPanel
              result={result}
              p={p}
              showTable={showTable}
              setShowTable={setShowTable}
              clientName={clientName}
              setClientName={setClientName}
              consultDate={consultDate}
              setConsultDate={setConsultDate}
              onExportPDF={exportPDF}
            />
          ) : (
            <div className="rounded-lg bg-white p-8 border text-center text-slate-400 order-1 lg:order-2" style={{ borderColor: "#e2e8f0" }}>
              計算中…
            </div>
          )}
        </div>

        <ReportFooter />
      </div>
    </div>
  );
}
