// ===== モンテカルロ集計 =====
// プロトタイプ lifeplan_sim.jsx の runMC() を移植。
// 既定800試行。各年齢で全試行の総資産をソートし、5/25/50/75/95 パーセンタイルを算出。
// あわせて平均的ケース（期待リターン固定の確定計算）線を算出する。

import type { MCYear, Params } from "./types";
import { simulate } from "./simulation";

/** 線形補間によるパーセンタイル（プロトタイプと同じ算出方法）。 */
function percentile(arr: number[], q: number): number {
  const s = [...arr].sort((a, b) => a - b);
  const idx = (s.length - 1) * q;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return s[lo] + (s[hi] - s[lo]) * (idx - lo);
}

/**
 * モンテカルロ・シミュレーションを実行し、年齢ごとの集計結果を返す。
 * @param trials 試行回数（既定800）
 * @param rng テスト用に注入可能な乱数生成器
 */
export function runMC(
  p: Params,
  trials = 800,
  rng: () => number = Math.random,
): MCYear[] {
  const n = p.targetAge - p.currentAge + 1;
  const cols: number[][] = Array.from({ length: n }, () => []);

  for (let t = 0; t < trials; t++) {
    const path = simulate(p, true, rng);
    path.forEach((y, i) => cols[i].push(y.total));
  }

  const exp = simulate(p, false, rng);

  return cols.map((c, i) => ({
    age: p.currentAge + i,
    p50: Math.round(percentile(c, 0.5)),
    expected: Math.round(exp[i].total),
    range90: [Math.round(percentile(c, 0.05)), Math.round(percentile(c, 0.95))],
    range50: [Math.round(percentile(c, 0.25)), Math.round(percentile(c, 0.75))],
    income: exp[i].income,
    expense: exp[i].expense,
    net: exp[i].net,
  }));
}
