// ===== 計算エンジン（純粋関数）=====
// プロトタイプ lifeplan_sim.jsx の simulate() / annualLoanPayment() /
// eduCostForChildYear() / housingForAge() を TypeScript に移植。
// UI とは完全に分離する。数値挙動はプロトタイプと一致させること。

import type { Params, SimYear } from "./types";
import { EDU, EDU_ENTRY, EDU_PATTERNS, EduStage, TAX_RATE } from "./statistics";

/** 子の年齢から教育段階を判定。該当なしは null。 */
export function stageForAge(a: number): EduStage | null {
  if (a >= 3 && a <= 5) return "幼";
  if (a >= 6 && a <= 11) return "小";
  if (a >= 12 && a <= 14) return "中";
  if (a >= 15 && a <= 17) return "高";
  if (a >= 18 && a <= 21) return "大";
  return null;
}

/** ある年の、子1人あたりの教育費（万円）。大学は18歳に入学金を加算。 */
export function eduCostForChildYear(
  childAge: number,
  pattern: Params["children"][number]["pattern"],
): number {
  const st = stageForAge(childAge);
  if (!st) return 0;
  const sel = EDU_PATTERNS[pattern][st];
  if (!sel) return 0;
  if (st === "大") {
    const key = sel as keyof typeof EDU.大;
    let c: number = EDU.大[key];
    if (childAge === 18) c += EDU_ENTRY[key] ?? 0;
    return c;
  }
  const stageTable = EDU[st] as Record<string, number>;
  return stageTable[sel] ?? 0;
}

/** 住宅ローン（元利均等・年額・万円）。 */
export function annualLoanPayment(
  balance: number,
  years: number,
  ratePct: number,
): number {
  if (balance <= 0 || years <= 0) return 0;
  const mr = ratePct / 100 / 12;
  const n = years * 12;
  if (mr === 0) return balance / years;
  const m = (balance * mr) / (1 - Math.pow(1 + mr, -n));
  return m * 12;
}

/** ある年齢の住居費（年額・万円）。 */
export function housingForAge(p: Params, age: number): number {
  const h = p.housing;
  const yf = age - p.currentAge;
  if (h.type === "rent") return (h.rentMonthly || 0) * 12;
  if (h.type === "own_loan") {
    let c = (h.upkeepMonthly || 0) * 12;
    if (yf < h.loanYears) c += annualLoanPayment(h.loanBalance, h.loanYears, h.loanRate);
    return c;
  }
  // own_noloan
  return (h.upkeepMonthly || 0) * 12;
}

/** 標準正規乱数（Box-Muller法）。 */
export function gauss(rng: () => number = Math.random): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * 1パスのシミュレーション（年次ループ）。
 * @param p 入力パラメータ
 * @param randomReturns true=モンテカルロ（乱数リターン）、false=平均的ケース（期待リターン固定）
 * @param rng テスト用に注入可能な乱数生成器（既定 Math.random）
 */
export function simulate(
  p: Params,
  randomReturns: boolean,
  rng: () => number = Math.random,
): SimYear[] {
  const out: SimYear[] = [];
  let cash = p.cash;
  let inv = p.invest;
  const rMean = p.exRet / 100;
  const rSd = p.risk / 100;

  for (let age = p.currentAge; age <= p.targetAge; age++) {
    const yf = age - p.currentAge;

    // 1. 運用リターン r を決定
    let r = randomReturns ? rMean + rSd * gauss(rng) : rMean;
    // 課税口座: プラスリターン部分にのみ課税（簡易）
    if (p.taxable && r > 0) r = r * (1 - TAX_RATE);

    // 2. 運用資産を成長（マイナスは0で下限）
    inv = inv * (1 + r);
    if (inv < 0) inv = 0;

    // 3. 積立（運用資産へ拠出。現預金から支出）
    const contrib =
      p.contribAnnual > 0 && age >= p.contribFrom && age <= p.contribTo
        ? p.contribAnnual
        : 0;
    inv += contrib;

    // 4. 収入を集計
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

    // 5. 支出を集計
    let expense = 0;
    const baseLiving = age < p.retireSpendAge ? p.living : p.livingRetired;
    expense += baseLiving * Math.pow(1 + p.livingGrowth / 100, yf);
    expense += housingForAge(p, age);
    for (const c of p.children) {
      expense += eduCostForChildYear(c.age + yf, c.pattern);
    }
    for (const e of p.events) {
      if (e.every > 0) {
        if (age >= e.from && age <= e.to && (age - e.from) % e.every === 0) expense += e.amount;
      } else if (age === e.from) {
        expense += e.amount;
      }
    }

    // 6. 収支差額（積立は資産内移動のため表示から除外）
    const net = income - expense;
    // 7. 現預金からは生活支出に加え積立拠出も差し引く
    cash += net - contrib;
    // 8. 現預金がマイナスなら運用資産から補填
    if (cash < 0) {
      const pull = Math.min(inv, -cash);
      inv -= pull;
      cash += pull;
    }
    // 9. 余剰資金を運用に回す（現預金バッファ超過分を運用資産へ）
    if (p.investSurplus && cash > p.cashBuffer) {
      const move = cash - p.cashBuffer;
      cash -= move;
      inv += move;
    }

    // 10. 総資産
    out.push({
      age,
      income: Math.round(income),
      expense: Math.round(expense),
      net: Math.round(net),
      total: cash + inv,
    });
  }
  return out;
}
