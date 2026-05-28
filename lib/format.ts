// 表示用フォーマッタ。マイナスは「▲」表記（会計慣行）。
export const yen = (n: number): string =>
  n < 0 ? "▲" + Math.abs(n).toLocaleString() : n.toLocaleString();
