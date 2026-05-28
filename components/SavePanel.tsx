import { useEffect, useRef, useState } from "react";
import type { Params } from "@/lib/types";
import {
  SavedPlan,
  listPlans,
  savePlan,
  deletePlan,
  exportPlanJSON,
  importPlanJSON,
} from "@/lib/storage";
import { NAVY, GOLD, CREAM, LIGHTGOLD, BLUE, RED } from "@/lib/brand";

type Status = "" | "saving" | "saved" | "noname" | "error" | "imported" | "importErr";

export function SavePanel({
  params,
  onLoad,
}: {
  params: Params;
  onLoad: (p: Params) => void;
}) {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [planName, setPlanName] = useState("");
  const [status, setStatus] = useState<Status>("");
  const fileInput = useRef<HTMLInputElement>(null);

  const flash = (s: Status, ms = 2500) => {
    setStatus(s);
    setTimeout(() => setStatus(""), ms);
  };

  const refresh = () => setSavedPlans(listPlans());

  useEffect(() => {
    refresh();
  }, []);

  const handleSave = () => {
    if (!planName.trim()) {
      flash("noname", 2000);
      return;
    }
    setStatus("saving");
    try {
      savePlan(planName, params);
      setPlanName("");
      flash("saved");
      refresh();
    } catch {
      flash("error");
    }
  };

  const handleDelete = (key: string) => {
    deletePlan(key);
    refresh();
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const p = await importPlanJSON(file);
      onLoad(p);
      flash("imported");
    } catch {
      flash("importErr");
    }
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <div className="rounded-lg border bg-white overflow-hidden no-print" style={{ borderColor: "#e2e8f0" }}>
      <div className="px-4 py-2.5 font-bold text-white text-sm flex items-center gap-2" style={{ background: NAVY }}>
        💾 プランの保存・読込
      </div>
      <div className="p-4 grid gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={planName}
            placeholder="プラン名（例：田中様_2026）"
            onChange={(e) => setPlanName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="flex-1 rounded border px-3 py-2 text-sm"
            style={{ borderColor: "#cbd5e1" }}
          />
          <button
            onClick={handleSave}
            className="shrink-0 rounded px-3 py-2 text-sm font-bold text-white"
            style={{ background: status === "saving" ? "#94a3b8" : NAVY }}
          >
            {status === "saving" ? "保存中…" : "保存"}
          </button>
        </div>

        {status === "saved" && <p className="text-xs font-medium" style={{ color: "#16a34a" }}>✅ 保存しました</p>}
        {status === "noname" && <p className="text-xs" style={{ color: RED }}>⚠ プラン名を入力してください</p>}
        {status === "error" && <p className="text-xs" style={{ color: RED }}>❌ 保存に失敗しました</p>}
        {status === "imported" && <p className="text-xs font-medium" style={{ color: "#16a34a" }}>✅ JSONを読み込みました</p>}
        {status === "importErr" && <p className="text-xs" style={{ color: RED }}>❌ JSONの読み込みに失敗しました</p>}

        {savedPlans.length > 0 ? (
          <div className="grid gap-2 mt-1">
            <p className="text-xs font-bold" style={{ color: NAVY }}>保存済みプラン（{savedPlans.length}件）</p>
            {savedPlans.map((pl) => (
              <div
                key={pl.key}
                className="flex items-center gap-2 rounded p-2 text-sm"
                style={{ background: CREAM, border: `1px solid ${LIGHTGOLD}` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: NAVY }}>{pl.name}</p>
                  <p className="text-xs text-slate-400">{new Date(pl.savedAt).toLocaleString("ja-JP")}</p>
                </div>
                <button onClick={() => onLoad(pl.params)} className="shrink-0 rounded px-2 py-1 text-xs font-bold text-white" style={{ background: BLUE }}>
                  読込
                </button>
                <button onClick={() => exportPlanJSON(pl.name, pl.params)} className="shrink-0 rounded px-2 py-1 text-xs font-bold" style={{ color: NAVY, border: `1px solid ${NAVY}` }}>
                  書出
                </button>
                <button onClick={() => handleDelete(pl.key)} className="shrink-0 rounded px-2 py-1 text-xs font-bold" style={{ color: RED, border: `1px solid ${RED}` }}>
                  削除
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">まだ保存されたプランはありません</p>
        )}

        <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: "#e2e8f0" }}>
          <button
            onClick={() => exportPlanJSON(planName || "lifeplan", params)}
            className="rounded px-3 py-1.5 text-xs font-bold"
            style={{ background: GOLD, color: NAVY }}
          >
            ⬇ 現在の入力をJSON書出
          </button>
          <button
            onClick={() => fileInput.current?.click()}
            className="rounded px-3 py-1.5 text-xs font-bold"
            style={{ color: NAVY, border: `1px solid ${NAVY}` }}
          >
            ⬆ JSONから読込
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => handleImport(e.target.files?.[0])}
          />
        </div>
        <p className="text-xs text-slate-400 -mt-1">
          ※保存はこの端末のブラウザ内のみ（サーバー送信なし）。JSON書出で別端末への移行や面談記録に使えます。
        </p>
      </div>
    </div>
  );
}
