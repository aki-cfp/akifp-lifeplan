import { describe, it, expect } from "vitest";
import {
  simulate,
  annualLoanPayment,
  eduCostForChildYear,
  stageForAge,
  housingForAge,
} from "@/lib/simulation";
import { runMC } from "@/lib/montecarlo";
import { DEFAULTS } from "@/lib/defaults";
import type { Params } from "@/lib/types";

/** 平均的ケース（確定計算）の目標年齢時点の残高（四捨五入・万円）。 */
function finalExpected(p: Params): number {
  const path = simulate(p, false);
  return Math.round(path[path.length - 1].total);
}

describe("回帰テスト：平均的ケースの検証値（CLAUDE.md §10）", () => {
  it("基本ケース 95歳残高 = 16,145万円", () => {
    expect(finalExpected(DEFAULTS)).toBe(16145);
  });

  it("積立なし 95歳残高 = 9,274万円", () => {
    expect(finalExpected({ ...DEFAULTS, contribAnnual: 0 })).toBe(9274);
  });

  it("課税口座 95歳残高 = 10,451万円", () => {
    expect(finalExpected({ ...DEFAULTS, taxable: true })).toBe(10451);
  });
});

describe("方向性チェック（CLAUDE.md §10 合格基準）", () => {
  it("積立あり ＞ 積立なし", () => {
    const withContrib = finalExpected(DEFAULTS);
    const without = finalExpected({ ...DEFAULTS, contribAnnual: 0 });
    expect(withContrib).toBeGreaterThan(without);
  });

  it("非課税 ＞ 課税", () => {
    const untaxed = finalExpected(DEFAULTS);
    const taxed = finalExpected({ ...DEFAULTS, taxable: true });
    expect(untaxed).toBeGreaterThan(taxed);
  });

  it("公立中心(A) ＞ 私立中心(E)：教育費が安いほど残高は多い", () => {
    const allPublic = finalExpected({
      ...DEFAULTS,
      children: [{ age: 5, pattern: "A" }],
    });
    const allPrivate = finalExpected({
      ...DEFAULTS,
      children: [{ age: 5, pattern: "E" }],
    });
    expect(allPublic).toBeGreaterThan(allPrivate);
  });
});

describe("恒等式：収入 − 支出 = 収支差額（明細表の整合）", () => {
  it("全年で income − expense と net が±1以内で一致", () => {
    const path = simulate(DEFAULTS, false);
    for (const y of path) {
      expect(Math.abs(y.income - y.expense - y.net)).toBeLessThanOrEqual(1);
    }
  });

  it("運用リターン・積立・余剰運用をゼロにすると 残高増減 = 収支差額（厳密）", () => {
    // すべて整数入力にして丸め誤差を排除し、恒等式を厳密に検証する。
    const p: Params = {
      ...DEFAULTS,
      exRet: 0,
      risk: 0,
      taxable: false,
      contribAnnual: 0,
      investSurplus: false,
      livingGrowth: 0,
      children: [],
      events: [],
      housing: { ...DEFAULTS.housing, type: "rent", rentMonthly: 10 },
    };
    const path = simulate(p, false);
    for (let i = 1; i < path.length; i++) {
      const delta = path[i].total - path[i - 1].total;
      expect(Math.round(delta)).toBe(path[i].net);
    }
  });
});

describe("生活費の現役→退職後の切替", () => {
  it("切替年齢の前後で生活費ベースが現役→退職後に変わる", () => {
    // 上昇率0・住居費0・教育費0・イベント0 にして生活費のみを観測。
    const p: Params = {
      ...DEFAULTS,
      living: 300,
      livingRetired: 240,
      retireSpendAge: 65,
      livingGrowth: 0,
      children: [],
      events: [],
      housing: { ...DEFAULTS.housing, type: "own_noloan", upkeepMonthly: 0 },
    };
    const path = simulate(p, false);
    const before = path.find((y) => y.age === 64)!;
    const after = path.find((y) => y.age === 65)!;
    expect(before.expense).toBe(300);
    expect(after.expense).toBe(240);
  });
});

describe("住宅ローン（元利均等・年額）", () => {
  it("金利0なら 残高 / 年数", () => {
    expect(annualLoanPayment(2000, 25, 0)).toBeCloseTo(80, 6);
  });

  it("残高・年数が0以下なら0", () => {
    expect(annualLoanPayment(0, 25, 1)).toBe(0);
    expect(annualLoanPayment(2000, 0, 1)).toBe(0);
  });

  it("正の金利では金利0より総額が大きい（年返済額が増える）", () => {
    expect(annualLoanPayment(2000, 25, 1)).toBeGreaterThan(annualLoanPayment(2000, 25, 0));
  });

  it("持家ローン：返済期間後は維持費のみ", () => {
    const p: Params = {
      ...DEFAULTS,
      currentAge: 40,
      housing: { type: "own_loan", rentMonthly: 0, loanBalance: 2000, loanYears: 25, loanRate: 1.0, upkeepMonthly: 1.5 },
    };
    const during = housingForAge(p, 60); // yf=20 < 25：ローンあり
    const afterLoan = housingForAge(p, 66); // yf=26 >= 25：維持費のみ
    expect(during).toBeGreaterThan(afterLoan);
    expect(afterLoan).toBeCloseTo(1.5 * 12, 6);
  });
});

describe("教育費（段階判定・大学入学金）", () => {
  it("段階判定", () => {
    expect(stageForAge(2)).toBeNull();
    expect(stageForAge(4)).toBe("幼");
    expect(stageForAge(8)).toBe("小");
    expect(stageForAge(13)).toBe("中");
    expect(stageForAge(16)).toBe("高");
    expect(stageForAge(18)).toBe("大");
    expect(stageForAge(22)).toBeNull();
  });

  it("国公立大：18歳は授業料54＋入学金28＝82、19歳は54", () => {
    expect(eduCostForChildYear(18, "A")).toBeCloseTo(82, 6);
    expect(eduCostForChildYear(19, "A")).toBeCloseTo(54, 6);
  });

  it("大学進学なし(F)：18歳以降は0", () => {
    expect(eduCostForChildYear(18, "F")).toBe(0);
    expect(eduCostForChildYear(20, "F")).toBe(0);
  });

  it("私立小学校(E)は公立(A)より高い", () => {
    expect(eduCostForChildYear(8, "E")).toBeGreaterThan(eduCostForChildYear(8, "A"));
  });
});

describe("判定ロジック（枯渇 / 目標未達 / 達成）", () => {
  it("枯渇ケース：平均的ケース残高がマイナスになる年齢が存在", () => {
    // 収入を絞り支出を増やして確実に枯渇させる。
    const p: Params = {
      ...DEFAULTS,
      income: 0,
      spouseIncome: 0,
      retireLump: 0,
      pension: 0,
      spousePension: 0,
      living: 600,
      livingRetired: 600,
      cash: 200,
      invest: 0,
      contribAnnual: 0,
    };
    const path = simulate(p, false);
    const dep = path.find((y) => y.total < 0);
    expect(dep).toBeDefined();
  });

  it("達成ケース：基本設定では枯渇しない", () => {
    const path = simulate(DEFAULTS, false);
    expect(path.every((y) => y.total >= 0)).toBe(true);
  });
});

describe("モンテカルロ集計（runMC）", () => {
  it("expected 線は平均的ケース(確定計算)と一致する", () => {
    const exp = simulate(DEFAULTS, false);
    const mc = runMC(DEFAULTS, 200);
    mc.forEach((m, i) => {
      expect(m.expected).toBe(Math.round(exp[i].total));
    });
  });

  it("パーセンタイルは単調：5% ≤ 25% ≤ 50% ≤ 75% ≤ 95%", () => {
    const mc = runMC(DEFAULTS, 300);
    for (const m of mc) {
      expect(m.range90[0]).toBeLessThanOrEqual(m.range50[0]);
      expect(m.range50[0]).toBeLessThanOrEqual(m.p50);
      expect(m.p50).toBeLessThanOrEqual(m.range50[1]);
      expect(m.range50[1]).toBeLessThanOrEqual(m.range90[1]);
    }
  });

  it("年齢の本数が currentAge〜targetAge と一致", () => {
    const mc = runMC(DEFAULTS, 50);
    expect(mc.length).toBe(DEFAULTS.targetAge - DEFAULTS.currentAge + 1);
    expect(mc[0].age).toBe(DEFAULTS.currentAge);
    expect(mc[mc.length - 1].age).toBe(DEFAULTS.targetAge);
  });
});
