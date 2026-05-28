// 入力フォームの初期値。プロトタイプ lifeplan_sim.jsx の DEFAULTS を移植。

import type { Params } from "./types";

export const DEFAULTS: Params = {
  currentAge: 40,
  targetAge: 95,
  target: 0,
  income: 500,
  retireAge: 65,
  retireLump: 1000,
  pension: 180,
  pensionAge: 65,
  hasSpouse: true,
  spouseAge: 38,
  spouseIncome: 200,
  spouseRetireAge: 60,
  spouseRetireLump: 0,
  spousePension: 83, // 国民年金満額(令和7年度) 約83万円/年
  spousePensionAge: 65,
  living: 300,
  livingGrowth: 1.0,
  livingRetired: 240, // 退職後の年間生活費
  retireSpendAge: 65, // 生活費の切替年齢
  housing: {
    type: "own_loan",
    rentMonthly: 10,
    loanBalance: 2000,
    loanYears: 25,
    loanRate: 1.0,
    upkeepMonthly: 1.5,
  },
  children: [{ age: 5, pattern: "B" }],
  events: [
    { name: "旅行", from: 41, to: 65, every: 1, amount: 30 },
    { name: "車買替", from: 48, to: 88, every: 8, amount: 250 },
  ],
  cash: 500,
  invest: 1000,
  exRet: 4.0,
  risk: 12.0,
  contribAnnual: 60, // 年間積立額（月5万円相当）
  contribFrom: 40,
  contribTo: 65,
  investSurplus: false,
  cashBuffer: 300,
  taxable: false,
};
