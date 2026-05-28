// localStorage ラッパー（プロトタイプの window.storage を置換）。
// 顧客の入力はサーバーに送らず、ブラウザ内のみに保存する。

import type { Params } from "./types";

const PREFIX = "lp-";

export interface SavedPlan {
  key: string;
  name: string;
  savedAt: string; // ISO文字列
  params: Params;
}

function available(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/** 保存済みプラン一覧（保存日時の新しい順）。 */
export function listPlans(): SavedPlan[] {
  if (!available()) return [];
  const plans: SavedPlan[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(PREFIX)) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const obj = JSON.parse(raw) as Omit<SavedPlan, "key">;
      plans.push({ key, ...obj });
    } catch {
      // 壊れたエントリは無視
    }
  }
  return plans.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

/** プランを保存して、保存されたエントリを返す。 */
export function savePlan(name: string, params: Params): SavedPlan {
  if (!available()) throw new Error("localStorage が利用できません");
  const key = `${PREFIX}${Date.now()}`;
  const entry: Omit<SavedPlan, "key"> = {
    name: name.trim(),
    savedAt: new Date().toISOString(),
    params,
  };
  localStorage.setItem(key, JSON.stringify(entry));
  return { key, ...entry };
}

/** プランを削除。 */
export function deletePlan(key: string): void {
  if (!available()) return;
  localStorage.removeItem(key);
}

// ===== JSONエクスポート/インポート（端末間移行・面談記録用）=====

/** プランをJSONファイルとしてダウンロードさせる。 */
export function exportPlanJSON(name: string, params: Params): void {
  if (typeof window === "undefined") return;
  const payload = {
    app: "akifp-lifeplan",
    version: 1,
    name: name.trim() || "lifeplan",
    savedAt: new Date().toISOString(),
    params,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = (payload.name || "lifeplan").replace(/[\\/:*?"<>|]/g, "_");
  a.download = `${safeName}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** JSONファイルからプランを読み込み、params を返す。 */
export async function importPlanJSON(file: File): Promise<Params> {
  const text = await file.text();
  const obj = JSON.parse(text);
  const params = (obj?.params ?? obj) as Params;
  if (!params || typeof params.currentAge !== "number") {
    throw new Error("ライフプランのJSONとして認識できませんでした");
  }
  return params;
}
