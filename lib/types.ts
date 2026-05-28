// ライフプラン診断の入力パラメータ・計算結果の型定義
// プロトタイプ lifeplan_sim.jsx の DEFAULTS の形をそのまま型化したもの。

export type HousingType = "rent" | "own_loan" | "own_noloan";

/** 教育費の進路パターン（A〜F の6種）。lib/statistics.ts の EDU_PATTERNS と対応。 */
export type EduPattern = "A" | "B" | "C" | "D" | "E" | "F";

export interface Housing {
  type: HousingType;
  /** 賃貸: 家賃＋管理費（月額・万円） */
  rentMonthly: number;
  /** 持家ローン: 残高（万円） */
  loanBalance: number;
  /** 持家ローン: 残り返済年数 */
  loanYears: number;
  /** 持家ローン: 金利（%） */
  loanRate: number;
  /** 持家: 維持費・管理費・固定資産税等（月額・万円） */
  upkeepMonthly: number;
}

export interface Child {
  /** 現在の年齢 */
  age: number;
  pattern: EduPattern;
}

export interface LifeEvent {
  name: string;
  /** 開始年齢 */
  from: number;
  /** 終了年齢 */
  to: number;
  /** 頻度（年毎）。0 のときは開始年齢に1回のみ。 */
  every: number;
  /** 金額（万円） */
  amount: number;
}

export interface Params {
  // ① ご家族・目標
  currentAge: number;
  targetAge: number;
  /** 残したい金額（目標・万円）。0 なら目標判定なし。 */
  target: number;
  hasSpouse: boolean;
  spouseAge: number;

  // ② 収入（手取りベース・万円）
  income: number;
  retireAge: number;
  retireLump: number;
  pension: number;
  pensionAge: number;
  spouseIncome: number;
  spouseRetireAge: number;
  spouseRetireLump: number;
  spousePension: number;
  spousePensionAge: number;

  // ③ 支出
  /** 現役期の年間生活費（万円） */
  living: number;
  /** 生活費上昇率（物価・%/年） */
  livingGrowth: number;
  /** 退職後の年間生活費（万円） */
  livingRetired: number;
  /** 生活費の切替年齢 */
  retireSpendAge: number;
  housing: Housing;

  // ④ 教育費
  children: Child[];

  // ⑤ ライフイベント
  events: LifeEvent[];

  // ⑥ 金融資産・運用
  /** 現預金（運用しない・万円） */
  cash: number;
  /** 運用資産（万円） */
  invest: number;
  /** 期待リターン（年率・%） */
  exRet: number;
  /** リスク（標準偏差・%） */
  risk: number;
  /** 年間積立額（万円） */
  contribAnnual: number;
  contribFrom: number;
  contribTo: number;
  /** 余剰資金（現預金バッファ超過分）も運用に回すか */
  investSurplus: boolean;
  /** 現預金として残すバッファ（万円） */
  cashBuffer: number;
  /** 運用益に課税するか（課税口座） */
  taxable: boolean;
}

/** 1年分のシミュレーション結果（明細表の1行に相当）。 */
export interface SimYear {
  age: number;
  /** 収入（万円・四捨五入） */
  income: number;
  /** 支出（万円・四捨五入） */
  expense: number;
  /** 収支差額 income - expense（万円・四捨五入） */
  net: number;
  /** 総資産 cash + inv（万円・未丸め） */
  total: number;
}

/** runMC が返す、各年齢のモンテカルロ集計結果（グラフ描画用）。 */
export interface MCYear {
  age: number;
  /** 中央値（50パーセンタイル） */
  p50: number;
  /** 平均的ケース（期待リターン固定の確定計算） */
  expected: number;
  /** 予想範囲 [5%, 95%] */
  range90: [number, number];
  /** 予想範囲 [25%, 75%] */
  range50: [number, number];
  income: number;
  expense: number;
  net: number;
}
