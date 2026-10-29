import { NAVY, GOLD, LIGHTGOLD, LINE_GREEN, LINE_URL, LINE_URL_DISPLAY } from "@/lib/brand";
import { QrCode } from "./QrCode";

/** 免責・出典＋屋号・LINE誘導フッター（画面・印刷の両方に表示）。 */
export function ReportFooter() {
  return (
    <>
      {/* 免責・出典 */}
      <div className="mt-5 rounded-lg bg-white p-4 text-xs text-slate-500 border" style={{ borderColor: "#e2e8f0" }}>
        <p className="font-bold mb-1.5" style={{ color: NAVY }}>ご利用にあたって（前提条件・出典）</p>
        <p>● 本ツールは概算把握のための簡易版です。数値は目安であり、実際の金額とは異なります。最終的な資産・老後設計はFP等の専門家にご相談ください。</p>
        <p>● 収入・年金・退職金は「手取り（可処分所得）」前提です。税・社会保険料の精緻な計算は行っていません。生活費は切替年齢の前後で現役期／退職後の2段階を使用します。</p>
        <p>● 運用は期待リターン・リスクによるモンテカルロ法（800試行）で予想範囲を算出。積立投資は運用資産へ毎年拠出されます。運用益課税は任意（チェック時のみ約20.3%を反映、未チェックはNISA等の非課税運用を想定）。</p>
        <p>● 教育費は以下の統計に基づく概算です（下宿費用・受験費用は含まず）。</p>
        <p className="pl-2">
          ▸ 幼〜高校: 文部科学省「令和5年度子供の学習費調査」(2024/12/25公表・2026/1/16訂正版)<br />
          ▸ 大学: 文部科学省「令和5年度 私立大学入学者に係る初年度学生納付金等調査」・「国立大学等授業料省令 令和5年度」<br />
          ▸ 公的年金: 厚生労働省「令和7年度 年金額」(モデル世帯・国民年金満額)<br />
          ▸ 退職金: 厚生労働省「令和5年就労条件総合調査」・中央労働委員会「令和5年賃金事情等総合調査」
        </p>
        <p>● 本ツールは特定の金融商品の取得勧誘・投資助言を目的とするものではありません。最終的な判断はご自身の責任で行ってください。</p>
      </div>

      {/* 屋号・LINE誘導フッター */}
      <div className="mt-4 rounded-lg overflow-hidden border" style={{ borderColor: GOLD }}>
        <div className="grid sm:grid-cols-3">
          <div className="p-5 text-white sm:col-span-2" style={{ background: `linear-gradient(135deg, ${NAVY}, #2a4570)` }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: LIGHTGOLD, fontWeight: 700 }}>FINANCIAL PLANNING</div>
            <div className="text-2xl font-bold mt-1">あきFP</div>
            <p className="text-sm mt-3" style={{ lineHeight: 1.7 }}>
              <span style={{ color: LIGHTGOLD, fontWeight: 700 }}>📱 お金・資産形成の情報をLINEで配信中！</span>
              <br />
              家計・教育費・老後資金・資産運用のご相談は、LINE公式アカウントからお気軽にどうぞ。
            </p>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 rounded px-3 py-1.5 font-bold text-sm"
              style={{ background: LINE_GREEN, color: "#fff" }}
            >
              友だち追加 ▶ {LINE_URL_DISPLAY}
            </a>
          </div>
          <div className="p-4 flex flex-col items-center justify-center gap-2" style={{ background: "#FBF6E9" }}>
            <QrCode size={132} />
            <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: NAVY, fontWeight: 700 }}>
              <span style={{ background: LINE_GREEN, color: "#fff", borderRadius: 4, padding: "1px 6px", fontSize: 11 }}>LINE</span>
              スマホで読み取り
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
